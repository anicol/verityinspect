import boto3
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from uploads.models import Upload
from videos.models import Video, VideoFrame
from inspections.models import Inspection, Detection


class Command(BaseCommand):
    help = 'Clean up expired uploads and associated data based on retention policies'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )
        parser.add_argument(
            '--force',
            action='store_true', 
            help='Skip confirmation prompts',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        force = options['force']
        
        self.stdout.write(
            self.style.SUCCESS('Starting retention cleanup process...')
        )
        
        # Get retention settings
        inspection_retention_days = int(settings.INSPECTION_MODE_RETENTION_DAYS)
        coaching_retention_days = int(settings.COACHING_MODE_RETENTION_DAYS)
        
        now = timezone.now()
        inspection_cutoff = now - timedelta(days=inspection_retention_days)
        coaching_cutoff = now - timedelta(days=coaching_retention_days)
        
        # Find expired uploads
        expired_inspection = Upload.objects.filter(
            mode=Upload.Mode.ENTERPRISE,
            created_at__lt=inspection_cutoff
        )
        
        expired_coaching = Upload.objects.filter(
            mode=Upload.Mode.COACHING,
            created_at__lt=coaching_cutoff
        )
        
        total_expired = expired_inspection.count() + expired_coaching.count()
        
        if total_expired == 0:
            self.stdout.write(self.style.SUCCESS('No expired uploads found.'))
            return
            
        self.stdout.write(
            f'Found {expired_inspection.count()} expired inspection uploads '
            f'and {expired_coaching.count()} expired coaching uploads.'
        )
        
        if not dry_run and not force:
            confirm = input(f'Delete {total_expired} uploads and associated data? (y/N): ')
            if confirm.lower() != 'y':
                self.stdout.write('Cleanup cancelled.')
                return
        
        # Cleanup expired uploads
        deleted_count = 0
        s3_deleted_count = 0
        
        for upload_queryset, mode_name in [
            (expired_inspection, 'inspection'),
            (expired_coaching, 'coaching')
        ]:
            for upload in upload_queryset:
                try:
                    deleted_count += self.cleanup_upload(upload, dry_run)
                    if not dry_run:
                        s3_deleted_count += self.delete_from_s3(upload.s3_key)
                    else:
                        s3_deleted_count += 1  # Count for dry run
                        
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f'Error cleaning up upload {upload.id}: {e}')
                    )
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'DRY RUN: Would delete {deleted_count} database records '
                    f'and {s3_deleted_count} S3 objects'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully deleted {deleted_count} database records '
                    f'and {s3_deleted_count} S3 objects'
                )
            )

    def cleanup_upload(self, upload, dry_run=False):
        """Clean up a single upload and all associated data"""
        deleted_count = 0
        
        try:
            # Find associated video
            video = None
            try:
                video = Video.objects.get(
                    store=upload.store,
                    title=upload.original_filename
                )
            except (Video.DoesNotExist, Video.MultipleObjectsReturned):
                pass
            
            if video:
                # Delete video frames
                frames = VideoFrame.objects.filter(video=video)
                frame_count = frames.count()
                
                if not dry_run:
                    # Delete frame image files
                    for frame in frames:
                        try:
                            if frame.image and hasattr(frame.image, 'path'):
                                import os
                                if os.path.exists(frame.image.path):
                                    os.remove(frame.image.path)
                        except:
                            pass
                    frames.delete()
                
                deleted_count += frame_count
                
                # Delete inspections and detections
                inspections = Inspection.objects.filter(video=video)
                for inspection in inspections:
                    detection_count = Detection.objects.filter(inspection=inspection).count()
                    if not dry_run:
                        Detection.objects.filter(inspection=inspection).delete()
                    deleted_count += detection_count
                
                inspection_count = inspections.count()
                if not dry_run:
                    inspections.delete()
                deleted_count += inspection_count
                
                # Delete video
                if not dry_run:
                    video.delete()
                deleted_count += 1
            
            # Delete upload
            if not dry_run:
                upload.delete()
            deleted_count += 1
            
            if not dry_run:
                self.stdout.write(f'Cleaned up upload {upload.id}')
            
            return deleted_count
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error cleaning up upload {upload.id}: {e}')
            )
            return 0

    def delete_from_s3(self, s3_key):
        """Delete object from S3"""
        try:
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )
            
            s3_client.delete_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=s3_key
            )
            
            return 1
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error deleting S3 object {s3_key}: {e}')
            )
            return 0