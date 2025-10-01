from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'uploads'

router = DefaultRouter()
router.register('', views.UploadViewSet, basename='uploads')

urlpatterns = [
    path('health/', views.health_check, name='health'),
    path('request-presigned-url/', views.request_presigned_url, name='request-presigned-url'),
    path('confirm/<int:upload_id>/', views.confirm_upload, name='confirm-upload'),
    path('reprocess/<int:upload_id>/', views.reprocess_upload, name='reprocess-upload'),
    path('retention/status/', views.retention_status, name='retention-status'),
    path('retention/cleanup/', views.trigger_manual_cleanup, name='manual-cleanup'),
    path('', include(router.urls)),
]