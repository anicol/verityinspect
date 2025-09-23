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

    class Meta:
        model = Video
        fields = '__all__'
        read_only_fields = ('uploaded_by', 'status', 'error_message', 'metadata', 
                           'duration', 'file_size', 'thumbnail')

    def get_file_size_mb(self, obj):
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return None

    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        video = super().create(validated_data)
        
        # Set file size
        if video.file:
            video.file_size = video.file.size
            video.save()
        
        # Trigger async processing
        from .tasks import process_video
        process_video.delay(video.id)
        
        return video


class VideoListSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    store_name = serializers.CharField(source='store.name', read_only=True)
    file_size_mb = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = ('id', 'title', 'store', 'store_name', 'uploaded_by_name', 
                 'status', 'duration', 'file_size_mb', 'thumbnail', 'created_at')

    def get_file_size_mb(self, obj):
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return None