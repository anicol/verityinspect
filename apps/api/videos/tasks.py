import os
import subprocess
import json
from celery import shared_task
from django.conf import settings
from PIL import Image
from .models import Video, VideoFrame


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