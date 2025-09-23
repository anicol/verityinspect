from django.contrib import admin
from .models import Video, VideoFrame


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'store', 'uploaded_by', 'status', 'duration', 'created_at')
    list_filter = ('status', 'store__brand', 'created_at')
    search_fields = ('title', 'description', 'uploaded_by__username')
    readonly_fields = ('file_size', 'duration', 'metadata', 'created_at', 'updated_at')
    list_select_related = ('store', 'uploaded_by')


@admin.register(VideoFrame)
class VideoFrameAdmin(admin.ModelAdmin):
    list_display = ('video', 'frame_number', 'timestamp', 'width', 'height')
    list_filter = ('video__store__brand', 'created_at')
    search_fields = ('video__title',)
    readonly_fields = ('created_at',)
    list_select_related = ('video',)