import os
import subprocess
import json
import logging
import boto3
from celery import shared_task
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from PIL import Image
from .models import Video, VideoFrame
from uploads.models import Upload

logger = logging.getLogger(__name__)


@shared_task(bind=True)
def process_video_upload(self, upload_id):
    """
    Enhanced video processing with rule engine integration
    """
    try:
        upload = Upload.objects.get(id=upload_id)
        upload.status = Upload.Status.PROCESSING
        upload.save()

        # Download video from S3 to temp location
        video_path = download_from_s3(upload.s3_key)

        # Extract video metadata
        metadata = extract_video_metadata(video_path)
        upload.duration_s = int(float(metadata.get('duration', 0)))
        upload.metadata = metadata
        upload.save()

        # Create Video record for compatibility
        video = Video.objects.create(
            title=upload.original_filename,
            description=f"Upload from {upload.store.name}",
            store=upload.store,
            uploaded_by=upload.created_by,
            status=Video.Status.PROCESSING,
            duration=upload.duration_s,
            metadata=metadata
        )

        # Set the file field to point to S3 key for signed URL generation
        video.file.name = upload.s3_key
        video.save()

        # Generate thumbnail
        thumbnail_path = generate_thumbnail(video_path, video.id)
        if thumbnail_path:
            video.thumbnail = thumbnail_path
            video.save()

        # Extract frames for analysis
        frames = extract_frames_from_s3_video(video, video_path)

        # Apply rule engine for automated analysis
        if upload.mode == Upload.Mode.INSPECTION:
            inspection = apply_inspection_rules(video, frames)
        else:
            inspection = apply_coaching_rules(video, frames)

        # Clean up temp file
        if os.path.exists(video_path):
            os.remove(video_path)

        upload.status = Upload.Status.COMPLETE
        upload.save()

        video.status = Video.Status.COMPLETED
        video.save()

        return f"Upload {upload_id} processed successfully with {len(frames)} frames analyzed"

    except Exception as exc:
        upload = Upload.objects.get(id=upload_id)
        upload.status = Upload.Status.FAILED
        upload.error_message = str(exc)
        upload.save()

        # Clean up temp file on error
        try:
            if 'video_path' in locals() and os.path.exists(video_path):
                os.remove(video_path)
        except Exception:
            pass

        raise self.retry(exc=exc, countdown=60, max_retries=3)


@shared_task(bind=True)
def reprocess_video_from_s3(self, video_id):
    """
    Fully reprocess a video that failed initial processing.
    Downloads from S3, extracts frames, and runs AI analysis.
    """
    try:
        video = Video.objects.get(id=video_id)
        video.status = Video.Status.PROCESSING
        video.error_message = ''
        video.save()

        # Find the Upload record to get S3 key
        upload = Upload.objects.filter(
            store=video.store,
            original_filename=video.title
        ).order_by('-created_at').first()

        if not upload:
            raise Exception("No Upload record found - cannot locate video in S3")

        # Download from S3
        video_path = download_from_s3(upload.s3_key)

        # Extract metadata
        metadata = extract_video_metadata(video_path)
        video.duration = metadata.get('duration', 0)
        video.metadata = metadata
        video.save()

        # Generate thumbnail
        thumbnail_path = generate_thumbnail(video_path, video.id)
        if thumbnail_path:
            video.thumbnail = thumbnail_path
            video.save()

        # Delete old frames if any
        video.frames.all().delete()

        # Extract frames
        frames = extract_frames_from_s3_video(video, video_path)

        # Apply AI analysis
        if upload.mode == Upload.Mode.INSPECTION:
            apply_inspection_rules(video, frames)
        else:
            apply_coaching_rules(video, frames)

        # Clean up temp file
        if os.path.exists(video_path):
            os.remove(video_path)

        video.status = Video.Status.COMPLETED
        video.save()

        return f"Video {video_id} fully reprocessed with {len(frames)} frames"

    except Exception as exc:
        video = Video.objects.get(id=video_id)
        video.status = Video.Status.FAILED
        video.error_message = str(exc)
        video.save()

        # Clean up temp file on error
        try:
            if 'video_path' in locals() and os.path.exists(video_path):
                os.remove(video_path)
        except Exception:
            pass

        raise self.retry(exc=exc, countdown=60, max_retries=3)


def extract_video_metadata(video_path):
    try:
        cmd = [
            'ffprobe', '-v', 'quiet', '-print_format', 'json',
            '-show_format', '-show_streams', video_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        metadata = json.loads(result.stdout)

        # Extract relevant information
        video_stream = next((s for s in metadata['streams'] if s['codec_type'] == 'video'), {})

        return {
            'duration': float(metadata['format'].get('duration', 0)),
            'size': int(metadata['format'].get('size', 0)),
            'bitrate': int(metadata['format'].get('bit_rate', 0)),
            'width': int(video_stream.get('width', 0)),
            'height': int(video_stream.get('height', 0)),
            'fps': eval(video_stream.get('r_frame_rate', '0/1')),
            'codec': video_stream.get('codec_name', ''),
        }
    except Exception as e:
        return {'error': str(e)}


def generate_thumbnail(video_path, video_id):
    """Generate thumbnail from video and upload to S3"""
    try:
        # Create temp file for thumbnail
        temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
        os.makedirs(temp_dir, exist_ok=True)

        thumbnail_filename = f"video_{video_id}_thumb.jpg"
        temp_thumbnail_path = os.path.join(temp_dir, thumbnail_filename)

        # Extract thumbnail at 1 second mark
        cmd = [
            'ffmpeg', '-i', video_path, '-ss', '00:00:01',
            '-vframes', '1', '-y', temp_thumbnail_path
        ]
        subprocess.run(cmd, check=True, capture_output=True)

        if not os.path.exists(temp_thumbnail_path):
            return None

        # Read thumbnail file
        with open(temp_thumbnail_path, 'rb') as f:
            thumbnail_data = f.read()

        # Save to S3 using Django's storage backend
        s3_path = f"thumbnails/{thumbnail_filename}"
        saved_path = default_storage.save(s3_path, ContentFile(thumbnail_data))

        # Clean up temp file
        os.remove(temp_thumbnail_path)

        return saved_path

    except Exception as e:
        logger.error(f"Error generating thumbnail: {e}")
        return None


def download_from_s3(s3_key):
    """Download video file from S3 to temporary location"""
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )

        # Create temp directory
        temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
        os.makedirs(temp_dir, exist_ok=True)

        # Generate temp file path
        filename = os.path.basename(s3_key)
        temp_path = os.path.join(temp_dir, f"temp_{filename}")

        # Download file
        s3_client.download_file(
            settings.AWS_STORAGE_BUCKET_NAME,
            s3_key,
            temp_path
        )

        return temp_path

    except Exception as e:
        raise Exception(f"Failed to download from S3: {str(e)}")


def extract_frames_from_s3_video(video, video_path):
    """Extract frames from downloaded S3 video and upload to S3"""
    try:
        # Create temp directory for frames
        temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
        os.makedirs(temp_dir, exist_ok=True)

        duration = video.duration or 0
        if duration <= 0:
            return []

        # Configure frame sampling based on settings
        max_frames = int(settings.MAX_FRAMES_PER_VIDEO)
        sampling_fps = float(settings.FRAME_SAMPLING_FPS)

        frames = []
        frame_count = 0

        # Calculate frame timestamps
        if duration <= max_frames / sampling_fps:
            # Short video: sample at specified FPS
            interval = 1.0 / sampling_fps
        else:
            # Long video: distribute frames evenly
            interval = duration / max_frames

        timestamp = 0
        while timestamp < duration and frame_count < max_frames:
            frame_filename = f"video_{video.id}_frame_{frame_count}.jpg"
            temp_frame_path = os.path.join(temp_dir, frame_filename)

            cmd = [
                'ffmpeg', '-i', video_path, '-ss', str(timestamp),
                '-vframes', '1', '-y', temp_frame_path
            ]

            result = subprocess.run(cmd, capture_output=True)
            if result.returncode == 0 and os.path.exists(temp_frame_path):
                # Get image dimensions
                with Image.open(temp_frame_path) as img:
                    width, height = img.size

                # Read frame data
                with open(temp_frame_path, 'rb') as f:
                    frame_data = f.read()

                # Upload to S3 using Django's storage backend
                s3_path = f"frames/{frame_filename}"
                saved_path = default_storage.save(s3_path, ContentFile(frame_data))

                # Create VideoFrame record with S3 path
                frame = VideoFrame.objects.create(
                    video=video,
                    timestamp=timestamp,
                    frame_number=frame_count,
                    image=saved_path,
                    width=width,
                    height=height
                )
                frames.append(frame)
                frame_count += 1

                # Clean up temp file
                os.remove(temp_frame_path)

            timestamp += interval

        return frames

    except Exception as e:
        logger.error(f"Error extracting frames: {e}")
        return []


def apply_inspection_rules(video, frames):
    """Apply inspection mode rules with compliance checks"""
    try:
        from inspections.models import Inspection
        from inspections.tasks import analyze_video

        # Create inspection record
        inspection = Inspection.objects.create(
            video=video,
            mode=Inspection.Mode.INSPECTION,
            status=Inspection.Status.PENDING
        )

        analyze_video.delay(inspection.id)

        return inspection

    except Exception as e:
        logger.error(f"Error applying inspection rules: {e}")
        return None


def apply_coaching_rules(video, frames):
    """Apply coaching mode rules with improvement suggestions"""
    try:
        from inspections.models import Inspection
        from inspections.tasks import analyze_video
        from django.utils import timezone
        from datetime import timedelta
        from django.conf import settings

        # Create inspection record
        inspection = Inspection.objects.create(
            video=video,
            mode=Inspection.Mode.COACHING,
            status=Inspection.Status.PENDING
        )

        retention_days = getattr(settings, 'COACHING_MODE_RETENTION_DAYS', 7)
        inspection.expires_at = timezone.now() + timedelta(days=retention_days)
        inspection.save()

        analyze_video.delay(inspection.id)

        return inspection

    except Exception as e:
        logger.error(f"Error applying coaching rules: {e}")
        return None


def apply_rule_to_frames(rule, frames, coaching_mode=False):
    """Apply a specific rule to video frames using AI analysis"""
    violations = []

    try:
        from ai_services.analyzer import VideoAnalyzer
        analyzer = VideoAnalyzer()

        rule_config = rule.config_json
        rule_type = rule_config.get('type', 'unknown')

        for frame in frames:
            try:
                # Get frame path and read as bytes for analysis
                frame_path = frame.image.path if frame.image else None
                frame_bytes = None

                if frame_path and os.path.exists(frame_path):
                    with open(frame_path, 'rb') as f:
                        frame_bytes = f.read()

                    frame_analysis = analyzer.analyze_frame(frame_path, frame_bytes)

                    # Generate findings from analysis
                    findings = analyzer.generate_findings(frame_analysis, frame)

                    for finding in findings:
                        if rule_type == 'ppe_detection' and finding.get('category') == 'PPE':
                            violations.append({
                                'rule': rule,
                                'frame': frame,
                                'confidence': finding.get('confidence', 0.0),
                                'severity': 'medium' if coaching_mode else finding.get('severity', 'high').lower(),
                                'description': finding.get('description',
                                                           f"PPE issue detected in frame {frame.frame_number}"),
                                'bounding_box': finding.get('bounding_box'),
                                'recommended_action': finding.get('recommended_action', '')
                            })
                        
                        elif rule_type == 'safety_check' and finding.get('category') == 'SAFETY':
                            violations.append({
                                'rule': rule,
                                'frame': frame,
                                'confidence': finding.get('confidence', 0.0),
                                'severity': finding.get('severity', 'high').lower(),
                                'description': finding.get('description',
                                                           f"Safety violation detected in frame {frame.frame_number}"),
                                'bounding_box': finding.get('bounding_box'),
                                'recommended_action': finding.get('recommended_action', '')
                            })
                        
                        elif rule_type == 'cleanliness_check' and finding.get('category') == 'CLEANLINESS':
                            violations.append({
                                'rule': rule,
                                'frame': frame,
                                'confidence': finding.get('confidence', 0.0),
                                'severity': 'medium' if coaching_mode else finding.get('severity', 'medium').lower(),
                                'description': finding.get('description',
                                                           f"Cleanliness issue detected in frame {frame.frame_number}"),
                                'bounding_box': finding.get('bounding_box'),
                                'recommended_action': finding.get('recommended_action', '')
                            })
                
            except Exception as frame_error:
                logger.error(f"Error analyzing frame {frame.frame_number}: {frame_error}")
                continue

        return violations

    except Exception as e:
        logger.error(f"Error applying rule {rule.code}: {e}")
        return []


def generate_coaching_suggestions(rule, detection_data):
    """Generate coaching suggestions based on rule and detection"""
    suggestions = []
    
    rule_name_lower = rule.name.lower()
    if 'ppe' in rule_name_lower or 'helmet' in rule_name_lower:
        suggestions = [
            "Ensure all team members are wearing required safety equipment",
            "Check that protective gear is properly fitted",
            "Review PPE maintenance procedures"
        ]
    elif 'safety' in rule_name_lower:
        suggestions = [
            "Verify all safety protocols are being followed",
            "Check equipment placement and accessibility",
            "Review emergency procedures with team"
        ]
    elif 'clean' in rule_name_lower:
        suggestions = [
            "Maintain consistent cleaning schedules",
            "Check all surfaces are properly sanitized",
            "Review hygiene best practices"
        ]
    
    return suggestions
