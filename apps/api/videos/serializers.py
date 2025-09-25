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
        
        # Capture guided_shots data from request and store in metadata
        request = self.context.get('request')
        if request and hasattr(request, 'data'):
            guided_shots_data = request.data.get('guided_shots')
            if guided_shots_data:
                try:
                    import json
                    guided_shots = json.loads(guided_shots_data) if isinstance(guided_shots_data, str) else guided_shots_data
                    if not video.metadata:
                        video.metadata = {}
                    video.metadata['guided_shots_completed'] = guided_shots
                    video.metadata['guided_mode'] = True
                except (json.JSONDecodeError, ValueError):
                    # If parsing fails, just set a flag that guided mode was used
                    if not video.metadata:
                        video.metadata = {}
                    video.metadata['guided_mode'] = True
        
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