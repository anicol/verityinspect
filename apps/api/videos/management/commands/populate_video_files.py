from django.core.management.base import BaseCommand
from videos.models import Video
from uploads.models import Upload


class Command(BaseCommand):
    help = 'Populate empty video file fields from Upload records'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without making changes'
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']

        # Find all videos with empty file fields
        videos_without_files = Video.objects.filter(file='')

        self.stdout.write(
            self.style.WARNING(f'\nFound {videos_without_files.count()} videos with empty file fields')
        )

        if videos_without_files.count() == 0:
            self.stdout.write(self.style.SUCCESS('No videos need updating!'))
            return

        updated_count = 0
        not_found_count = 0

        for video in videos_without_files:
            # Find corresponding Upload record
            upload = Upload.objects.filter(
                original_filename=video.title,
                store=video.store,
                status=Upload.Status.COMPLETE
            ).order_by('-created_at').first()

            if upload and upload.s3_key:
                if dry_run:
                    self.stdout.write(
                        f'Would update video {video.id} ({video.title}): '
                        f'file.name = {upload.s3_key}'
                    )
                else:
                    video.file.name = upload.s3_key
                    video.save()
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'✓ Updated video {video.id} ({video.title}): '
                            f'file.name = {upload.s3_key}'
                        )
                    )
                updated_count += 1
            else:
                self.stdout.write(
                    self.style.ERROR(
                        f'✗ No Upload found for video {video.id} ({video.title})'
                    )
                )
                not_found_count += 1

        self.stdout.write('\n' + '='*70)
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'\n[DRY RUN] Would update {updated_count} videos'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✓ Successfully updated {updated_count} videos'
                )
            )

        if not_found_count > 0:
            self.stdout.write(
                self.style.ERROR(
                    f'✗ Could not find Upload records for {not_found_count} videos'
                )
            )

        self.stdout.write('='*70 + '\n')
