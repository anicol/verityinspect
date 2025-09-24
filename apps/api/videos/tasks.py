import os
import subprocess
import json
import boto3
from celery import shared_task
from django.conf import settings
from PIL import Image
from .models import Video, VideoFrame
from uploads.models import Upload
from inspections.models import Inspection, Rule, Detection


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
            status=Video.Status.PROCESSING,
            duration=upload.duration_s,
            metadata=metadata
        )

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
        except:
            pass
            
        raise self.retry(exc=exc, countdown=60, max_retries=3)


@shared_task(bind=True)
def process_video(self, video_id):
    try:
        video = Video.objects.get(id=video_id)
        video.status = Video.Status.PROCESSING
        video.save()

        video_path = video.file.path
        
        # Extract video metadata
        metadata = extract_video_metadata(video_path)
        video.duration = float(metadata.get('duration', 0))
        video.metadata = metadata
        video.save()

        # Generate thumbnail
        thumbnail_path = generate_thumbnail(video_path, video.id)
        if thumbnail_path:
            video.thumbnail.name = thumbnail_path
            video.save()

        # Extract frames at regular intervals
        extract_frames(video)

        video.status = Video.Status.COMPLETED
        video.save()

        return f"Video {video_id} processed successfully"

    except Exception as exc:
        video = Video.objects.get(id=video_id)
        video.status = Video.Status.FAILED
        video.error_message = str(exc)
        video.save()
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
    try:
        thumbnail_dir = os.path.join(settings.MEDIA_ROOT, 'thumbnails')
        os.makedirs(thumbnail_dir, exist_ok=True)
        
        thumbnail_filename = f"video_{video_id}_thumb.jpg"
        thumbnail_path = os.path.join(thumbnail_dir, thumbnail_filename)
        
        cmd = [
            'ffmpeg', '-i', video_path, '-ss', '00:00:01',
            '-vframes', '1', '-y', thumbnail_path
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        
        # Return relative path for Django
        return f"thumbnails/{thumbnail_filename}"
    except Exception:
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
    """Extract frames from downloaded S3 video"""
    try:
        frames_dir = os.path.join(settings.MEDIA_ROOT, 'frames')
        os.makedirs(frames_dir, exist_ok=True)
        
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
            frame_path = os.path.join(frames_dir, frame_filename)
            
            cmd = [
                'ffmpeg', '-i', video_path, '-ss', str(timestamp),
                '-vframes', '1', '-y', frame_path
            ]
            
            result = subprocess.run(cmd, capture_output=True)
            if result.returncode == 0 and os.path.exists(frame_path):
                # Get image dimensions
                with Image.open(frame_path) as img:
                    width, height = img.size
                
                frame = VideoFrame.objects.create(
                    video=video,
                    timestamp=timestamp,
                    frame_number=frame_count,
                    image=f"frames/{frame_filename}",
                    width=width,
                    height=height
                )
                frames.append(frame)
                frame_count += 1
            
            timestamp += interval
            
        return frames
        
    except Exception as e:
        print(f"Error extracting frames: {e}")
        return []


def apply_inspection_rules(video, frames):
    """Apply inspection mode rules with compliance checks"""
    try:
        # Create inspection record
        inspection = Inspection.objects.create(
            video=video,
            mode=Inspection.Mode.INSPECTION,
            status=Inspection.Status.PROCESSING,
            score=0.0
        )
        
        # Get active rules for the store's brand
        rules = Rule.objects.filter(
            brand=video.store.brand,
            is_active=True,
            rule_type__in=[Rule.RuleType.PPE, Rule.RuleType.SAFETY, Rule.RuleType.CLEANLINESS]
        )
        
        total_score = 0.0
        rule_count = 0
        
        for rule in rules:
            # Apply rule to frames
            rule_score, detections = apply_rule_to_frames(rule, frames)
            
            # Create detection records
            for frame, detection_data in detections:
                Detection.objects.create(
                    inspection=inspection,
                    frame=frame,
                    rule=rule,
                    confidence=detection_data.get('confidence', 0.0),
                    bbox_x=detection_data.get('bbox_x', 0),
                    bbox_y=detection_data.get('bbox_y', 0),
                    bbox_width=detection_data.get('bbox_width', 0),
                    bbox_height=detection_data.get('bbox_height', 0),
                    metadata=detection_data
                )
            
            total_score += rule_score
            rule_count += 1
        
        # Calculate final score
        if rule_count > 0:
            inspection.score = total_score / rule_count
        
        inspection.status = Inspection.Status.COMPLETED
        inspection.save()
        
        return inspection
        
    except Exception as e:
        print(f"Error applying inspection rules: {e}")
        return None


def apply_coaching_rules(video, frames):
    """Apply coaching mode rules with improvement suggestions"""
    try:
        # Create inspection record
        inspection = Inspection.objects.create(
            video=video,
            mode=Inspection.Mode.COACHING,
            status=Inspection.Status.PROCESSING,
            score=0.0
        )
        
        # Get coaching-focused rules
        rules = Rule.objects.filter(
            brand=video.store.brand,
            is_active=True,
            rule_type__in=[Rule.RuleType.TRAINING, Rule.RuleType.PROCESS]
        )
        
        # Apply lighter analysis for coaching
        for rule in rules:
            rule_score, detections = apply_rule_to_frames(rule, frames, coaching_mode=True)
            
            # Create detection records with coaching focus
            for frame, detection_data in detections:
                Detection.objects.create(
                    inspection=inspection,
                    frame=frame,
                    rule=rule,
                    confidence=detection_data.get('confidence', 0.0),
                    metadata={
                        **detection_data,
                        'coaching_suggestions': generate_coaching_suggestions(rule, detection_data)
                    }
                )
        
        inspection.status = Inspection.Status.COMPLETED
        inspection.save()
        
        return inspection
        
    except Exception as e:
        print(f"Error applying coaching rules: {e}")
        return None


def apply_rule_to_frames(rule, frames, coaching_mode=False):
    """Apply a specific rule to video frames"""
    detections = []
    total_score = 0.0
    
    for frame in frames:
        # Mock AI analysis - in production this would call actual AI services
        detection_data = {
            'confidence': 0.85,
            'bbox_x': 100,
            'bbox_y': 100,
            'bbox_width': 200,
            'bbox_height': 200,
            'analysis_type': rule.rule_type,
            'coaching_mode': coaching_mode
        }
        
        # Mock scoring based on rule type
        if rule.rule_type == Rule.RuleType.PPE:
            score = 0.9  # Mock high compliance
        elif rule.rule_type == Rule.RuleType.SAFETY:
            score = 0.8  # Mock moderate compliance  
        else:
            score = 0.75  # Mock basic compliance
            
        total_score += score
        detections.append((frame, detection_data))
    
    avg_score = total_score / len(frames) if frames else 0
    return avg_score, detections


def generate_coaching_suggestions(rule, detection_data):
    """Generate coaching suggestions based on rule and detection"""
    suggestions = []
    
    if rule.rule_type == Rule.RuleType.PPE:
        suggestions = [
            "Ensure all team members are wearing required safety equipment",
            "Check that protective gear is properly fitted",
            "Review PPE maintenance procedures"
        ]
    elif rule.rule_type == Rule.RuleType.SAFETY:
        suggestions = [
            "Verify all safety protocols are being followed",
            "Check equipment placement and accessibility",
            "Review emergency procedures with team"
        ]
    elif rule.rule_type == Rule.RuleType.CLEANLINESS:
        suggestions = [
            "Maintain consistent cleaning schedules",
            "Check all surfaces are properly sanitized",
            "Review hygiene best practices"
        ]
    
    return suggestions


def extract_frames(video, interval_seconds=10):
    try:
        video_path = video.file.path
        frames_dir = os.path.join(settings.MEDIA_ROOT, 'frames')
        os.makedirs(frames_dir, exist_ok=True)
        
        duration = video.duration or 0
        if duration <= 0:
            return
        
        frame_count = 0
        for timestamp in range(0, int(duration), interval_seconds):
            frame_filename = f"video_{video.id}_frame_{frame_count}.jpg"
            frame_path = os.path.join(frames_dir, frame_filename)
            
            cmd = [
                'ffmpeg', '-i', video_path, '-ss', str(timestamp),
                '-vframes', '1', '-y', frame_path
            ]
            
            result = subprocess.run(cmd, capture_output=True)
            if result.returncode == 0 and os.path.exists(frame_path):
                # Get image dimensions
                with Image.open(frame_path) as img:
                    width, height = img.size
                
                VideoFrame.objects.create(
                    video=video,
                    timestamp=timestamp,
                    frame_number=frame_count,
                    image=f"frames/{frame_filename}",
                    width=width,
                    height=height
                )
                frame_count += 1
            
            if frame_count >= 20:  # Limit to 20 frames max
                break
                
    except Exception as e:
        print(f"Error extracting frames: {e}")