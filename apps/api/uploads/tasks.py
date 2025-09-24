from celery import shared_task
from django.core.management import call_command
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True)
def cleanup_expired_uploads_task(self):
    """
    Celery task to clean up expired uploads based on retention policies
    """
    try:
        logger.info("Starting automated retention cleanup...")
        
        # Run the cleanup command
        call_command('cleanup_expired_uploads', '--force')
        
        logger.info("Automated retention cleanup completed successfully")
        return "Retention cleanup completed"
        
    except Exception as exc:
        logger.error(f"Retention cleanup failed: {exc}")
        raise self.retry(exc=exc, countdown=300, max_retries=3)


@shared_task(bind=True)
def cleanup_temp_files_task(self):
    """
    Clean up temporary files that may have been left behind
    """
    try:
        import os
        import shutil
        from django.conf import settings
        from datetime import datetime, timedelta
        
        temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
        if not os.path.exists(temp_dir):
            return "No temp directory found"
        
        # Delete temp files older than 1 hour
        cutoff_time = datetime.now() - timedelta(hours=1)
        deleted_count = 0
        
        for filename in os.listdir(temp_dir):
            file_path = os.path.join(temp_dir, filename)
            if os.path.isfile(file_path):
                file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                if file_time < cutoff_time:
                    try:
                        os.remove(file_path)
                        deleted_count += 1
                    except OSError:
                        pass
        
        logger.info(f"Cleaned up {deleted_count} temp files")
        return f"Cleaned up {deleted_count} temp files"
        
    except Exception as exc:
        logger.error(f"Temp file cleanup failed: {exc}")
        raise self.retry(exc=exc, countdown=60, max_retries=2)