from rest_framework import generics, status, filters, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.conf import settings
from .models import Video, VideoFrame
from .serializers import VideoSerializer, VideoListSerializer, VideoFrameSerializer


class VideoListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['store', 'status', 'uploaded_by']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title', 'duration']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Video.objects.all()
        else:
            return Video.objects.filter(store=user.store)

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return VideoListSerializer
        return VideoSerializer

    def perform_create(self, serializer):
        # Validate file size
        file = self.request.FILES.get('file')
        if file:
            max_size = settings.MAX_VIDEO_SIZE_MB * 1024 * 1024
            if file.size > max_size:
                raise serializers.ValidationError(
                    f'File size exceeds {settings.MAX_VIDEO_SIZE_MB}MB limit'
                )
            
            # Validate file format
            file_ext = file.name.lower().split('.')[-1]
            if file_ext not in settings.SUPPORTED_VIDEO_FORMATS:
                raise serializers.ValidationError(
                    f'Unsupported format. Supported: {", ".join(settings.SUPPORTED_VIDEO_FORMATS)}'
                )
        
        serializer.save()


class VideoDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VideoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Video.objects.all()
        else:
            return Video.objects.filter(store=user.store)


class VideoFrameListView(generics.ListAPIView):
    serializer_class = VideoFrameSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        video_id = self.kwargs['video_id']
        user = self.request.user
        
        if user.role == 'ADMIN':
            video_filter = {'video_id': video_id}
        else:
            video_filter = {'video_id': video_id, 'video__store': user.store}
        
        return VideoFrame.objects.filter(**video_filter)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reprocess_video(request, pk):
    try:
        user = request.user
        if user.role == 'ADMIN':
            video = Video.objects.get(pk=pk)
        else:
            video = Video.objects.get(pk=pk, store=user.store)
        
        if video.status == Video.Status.PROCESSING:
            return Response(
                {'error': 'Video is already being processed'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Clear previous frames
        video.frames.all().delete()
        
        # Restart processing
        from .tasks import process_video
        process_video.delay(video.id)
        
        video.status = Video.Status.UPLOADED
        video.error_message = ''
        video.save()
        
        return Response({'message': 'Video reprocessing started'})
        
    except Video.DoesNotExist:
        return Response(
            {'error': 'Video not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )