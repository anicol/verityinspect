import time
from django.http import JsonResponse
from django.db import connection
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import redis
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint that verifies all critical services are operational.
    Returns status of database, redis, and celery services.
    """
    start_time = time.time()
    status = 'ok'
    services = {}
    
    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        services['database'] = 'ok'
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        services['database'] = 'error'
        status = 'error'
    
    # Check Redis connection
    try:
        redis_url = getattr(settings, 'REDIS_URL', 'redis://localhost:6379/0')
        redis_client = redis.from_url(redis_url)
        redis_client.ping()
        services['redis'] = 'ok'
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        services['redis'] = 'error'
        status = 'error'
    
    # Check Celery workers (basic check - see if we can connect to broker)
    try:
        from celery import Celery
        app = Celery('inspectai')
        app.config_from_object('django.conf:settings', namespace='CELERY')
        
        # Try to inspect active workers
        inspect = app.control.inspect()
        active_workers = inspect.active()
        
        if active_workers:
            services['celery'] = 'ok'
        else:
            services['celery'] = 'warning'  # No active workers but broker is reachable
    except Exception as e:
        logger.error(f"Celery health check failed: {e}")
        services['celery'] = 'error'
        status = 'error'
    
    response_time = round((time.time() - start_time) * 1000, 2)
    
    response_data = {
        'status': status,
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'version': '1.0.0',
        'services': services,
        'response_time_ms': response_time
    }
    
    # Return appropriate HTTP status code
    status_code = 200 if status == 'ok' else 503
    
    return JsonResponse(response_data, status=status_code)


@api_view(['GET'])
@permission_classes([AllowAny])
def readiness_check(request):
    """
    Kubernetes-style readiness check.
    Similar to health check but specifically for deployment readiness.
    """
    try:
        # Quick database check
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        
        return JsonResponse({
            'status': 'ready',
            'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        })
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return JsonResponse({
            'status': 'not_ready',
            'error': str(e),
            'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        }, status=503)


@api_view(['GET'])
@permission_classes([AllowAny])
def liveness_check(request):
    """
    Kubernetes-style liveness check.
    Basic check that the application is running.
    """
    return JsonResponse({
        'status': 'alive',
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    })