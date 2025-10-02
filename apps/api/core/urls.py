from django.urls import path
from . import views, admin_views

urlpatterns = [
    path('health/', views.health_check, name='health-check'),
    path('ready/', views.readiness_check, name='readiness-check'),
    path('live/', views.liveness_check, name='liveness-check'),
    path('admin/queue-status/', admin_views.admin_queue_status, name='admin-queue-status'),
]