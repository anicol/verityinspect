from django.db import models
from django.conf import settings


class Video(models.Model):
    class Status(models.TextChoices):
        UPLOADED = 'UPLOADED', 'Uploaded'
        PROCESSING = 'PROCESSING', 'Processing'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'

    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    store = models.ForeignKey('brands.Store', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='videos/')
    thumbnail = models.ImageField(upload_to='thumbnails/', blank=True, null=True)
    duration = models.FloatField(null=True, blank=True, help_text="Duration in seconds")
    file_size = models.BigIntegerField(null=True, blank=True, help_text="File size in bytes")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UPLOADED)
    error_message = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, help_text="Video metadata from FFmpeg")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'videos'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.store.name}"


class VideoFrame(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='frames')
    timestamp = models.FloatField(help_text="Timestamp in seconds")
    frame_number = models.IntegerField()
    image = models.ImageField(upload_to='frames/')
    width = models.IntegerField()
    height = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'video_frames'
        ordering = ['timestamp']
        unique_together = ['video', 'frame_number']

    def __str__(self):
        return f"{self.video.title} - Frame {self.frame_number}"