"""Admin views for monitoring system status and queues"""
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from celery import current_app
from django.utils import timezone
from uploads.models import Upload
from videos.models import Video
from inspections.models import Inspection

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_queue_status(request):
    """Get current processing queue status from Celery"""
    try:
        # Get Celery inspector
        inspect = current_app.control.inspect()

        # Get active tasks
        active_tasks = inspect.active() or {}
        scheduled_tasks = inspect.scheduled() or {}
        reserved_tasks = inspect.reserved() or {}

        # Flatten tasks from all workers
        all_active = []
        for worker, tasks in active_tasks.items():
            for task in tasks:
                all_active.append({
                    'id': task.get('id'),
                    'name': task.get('name'),
                    'args': task.get('args'),
                    'kwargs': task.get('kwargs'),
                    'worker': worker,
                    'time_start': task.get('time_start'),
                })

        all_scheduled = []
        for worker, tasks in scheduled_tasks.items():
            for task in tasks:
                all_scheduled.append({
                    'id': task.get('id'),
                    'name': task.get('name'),
                    'eta': task.get('eta'),
                    'worker': worker,
                })

        all_reserved = []
        for worker, tasks in reserved_tasks.items():
            for task in tasks:
                all_reserved.append({
                    'id': task.get('id'),
                    'name': task.get('name'),
                    'worker': worker,
                })

        # Get recent uploads/videos/inspections
        recent_uploads = Upload.objects.filter(
            status__in=['uploaded', 'processing']
        ).order_by('-created_at')[:20].values(
            'id', 'original_filename', 'status', 'store_id', 'created_at', 'updated_at'
        )

        recent_videos = Video.objects.filter(
            status='PROCESSING'
        ).order_by('-created_at')[:20].values(
            'id', 'title', 'status', 'created_at', 'updated_at'
        )

        recent_inspections = Inspection.objects.filter(
            status__in=['PENDING', 'PROCESSING']
        ).select_related('video').order_by('-created_at')[:20]

        inspection_data = []
        for inspection in recent_inspections:
            inspection_data.append({
                'id': inspection.id,
                'video_id': inspection.video_id,
                'video_title': inspection.video.title if inspection.video else 'N/A',
                'status': inspection.status,
                'mode': inspection.mode,
                'created_at': inspection.created_at.isoformat(),
                'updated_at': inspection.updated_at.isoformat(),
            })

        # Get stats
        stats = {
            'active_tasks_count': len(all_active),
            'scheduled_tasks_count': len(all_scheduled),
            'reserved_tasks_count': len(all_reserved),
            'processing_uploads': Upload.objects.filter(status='processing').count(),
            'processing_videos': Video.objects.filter(status='PROCESSING').count(),
            'pending_inspections': Inspection.objects.filter(status='PENDING').count(),
            'processing_inspections': Inspection.objects.filter(status='PROCESSING').count(),
        }

        return Response({
            'stats': stats,
            'active_tasks': all_active,
            'scheduled_tasks': all_scheduled,
            'reserved_tasks': all_reserved,
            'recent_uploads': list(recent_uploads),
            'recent_videos': list(recent_videos),
            'recent_inspections': inspection_data,
            'timestamp': timezone.now().isoformat(),
        })

    except Exception as e:
        logger.error(f"Error getting queue status: {e}")
        return Response({
            'error': str(e),
            'stats': {
                'active_tasks_count': 0,
                'scheduled_tasks_count': 0,
                'reserved_tasks_count': 0,
                'processing_uploads': 0,
                'processing_videos': 0,
                'pending_inspections': 0,
                'processing_inspections': 0,
            },
            'active_tasks': [],
            'scheduled_tasks': [],
            'reserved_tasks': [],
            'recent_uploads': [],
            'recent_videos': [],
            'recent_inspections': [],
        }, status=200)
