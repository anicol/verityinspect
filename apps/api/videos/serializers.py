from rest_framework import serializers
from .models import Video, VideoFrame


class VideoFrameSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoFrame
        fields = '__all__'


class VideoSerializer(serializers.ModelSerializer):
    frames = VideoFrameSerializer(many=True, read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)
    file_size_mb = serializers.SerializerMethodField()
    file = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = '__all__'
        read_only_fields = ('uploaded_by', 'status', 'error_message', 'metadata',
                           'duration', 'file_size', 'thumbnail')

    def get_file_size_mb(self, obj):
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return None

    def get_file(self, obj):
        """Return the full S3 signed URL for the video file"""
        if obj.file:
            return obj.file.url
        return None

    def get_thumbnail(self, obj):
        """Return the full S3 URL for the thumbnail"""
        if obj.thumbnail:
            return obj.thumbnail.url
        return None

    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        video = super().create(validated_data)

        # Set file size
        if video.file:
            video.file_size = video.file.size
            video.save()

        # NOTE: Video processing via this endpoint is deprecated.
        # Use the Upload API (/api/uploads/) with S3 presigned URLs instead.
        # The process_video task is not triggered here to prevent S3 storage errors.

        return video


class VideoListSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)
    file_size_mb = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = ('id', 'title', 'store', 'store_name', 'uploaded_by_name',
                 'status', 'duration', 'file_size_mb', 'thumbnail', 'created_at')

    def get_file_size_mb(self, obj):
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return None

    def get_thumbnail(self, obj):
        """Return the full S3 URL for the thumbnail"""
        if obj.thumbnail:
            return obj.thumbnail.url
        return None