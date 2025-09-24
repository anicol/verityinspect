from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import models
from .models import Inspection, Finding, ActionItem
from .serializers import (
    InspectionSerializer, InspectionListSerializer, FindingSerializer,
    ActionItemSerializer, ActionItemUpdateSerializer
)


class InspectionListView(generics.ListAPIView):
    serializer_class = InspectionListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['mode', 'status', 'video__store']
    ordering_fields = ['created_at', 'overall_score']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Inspection.objects.all()
        else:
            return Inspection.objects.filter(video__store=user.store)


class InspectionDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = InspectionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Inspection.objects.all()
        else:
            return Inspection.objects.filter(video__store=user.store)


class FindingListView(generics.ListAPIView):
    serializer_class = FindingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['category', 'severity', 'is_resolved']
    ordering_fields = ['confidence', 'created_at', 'severity']
    ordering = ['-severity', '-confidence']

    def get_queryset(self):
        inspection_id = self.kwargs['inspection_id']
        user = self.request.user
        
        if user.role == 'ADMIN':
            inspection_filter = {'inspection_id': inspection_id}
        else:
            inspection_filter = {'inspection_id': inspection_id, 'inspection__video__store': user.store}
        
        return Finding.objects.filter(**inspection_filter)


class ActionItemListCreateView(generics.ListCreateAPIView):
    serializer_class = ActionItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['priority', 'status', 'assigned_to']
    ordering_fields = ['due_date', 'created_at', 'priority']
    ordering = ['-priority', 'due_date']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return ActionItem.objects.all()
        else:
            return ActionItem.objects.filter(inspection__video__store=user.store)

    def perform_create(self, serializer):
        # Auto-assign high priority items to GM if available
        if serializer.validated_data.get('priority') in ['HIGH', 'URGENT']:
            store = self.request.user.store
            gm = store.users.filter(role='GM').first() if store else None
            if gm:
                serializer.validated_data['assigned_to'] = gm
        
        serializer.save()


class ActionItemDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return ActionItem.objects.all()
        else:
            return ActionItem.objects.filter(inspection__video__store=user.store)

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return ActionItemUpdateSerializer
        return ActionItemSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_inspection(request, video_id):
    try:
        user = request.user
        mode = request.data.get('mode', 'INSPECTION')
        
        # Check if user has access to the video
        if user.role == 'ADMIN':
            from videos.models import Video
            video = Video.objects.get(pk=video_id)
        else:
            from videos.models import Video
            video = Video.objects.get(pk=video_id, store=user.store)
        
        # Check if inspection already exists
        if hasattr(video, 'inspection'):
            return Response(
                {'error': 'Inspection already exists for this video'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create inspection
        inspection = Inspection.objects.create(
            video=video,
            mode=mode,
            status=Inspection.Status.PENDING
        )
        
        # Set expiration based on mode
        if mode == Inspection.Mode.COACHING:
            from datetime import timedelta
            from django.conf import settings
            retention_days = getattr(settings, 'COACHING_MODE_RETENTION_DAYS', 7)
            inspection.expires_at = timezone.now() + timedelta(days=retention_days)
            inspection.save()
        
        # Trigger AI analysis
        from .tasks import analyze_video
        analyze_video.delay(inspection.id)
        
        return Response(InspectionSerializer(inspection).data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inspection_stats(request):
    user = request.user
    
    if user.role == 'ADMIN':
        inspections = Inspection.objects.all()
    else:
        inspections = Inspection.objects.filter(video__store=user.store)
    
    total_inspections = inspections.count()
    completed_inspections = inspections.filter(status=Inspection.Status.COMPLETED).count()
    avg_score = inspections.filter(overall_score__isnull=False).aggregate(
        avg_score=models.Avg('overall_score')
    )['avg_score']
    
    critical_findings = Finding.objects.filter(
        inspection__in=inspections,
        severity=Finding.Severity.CRITICAL
    ).count()
    
    open_actions = ActionItem.objects.filter(
        inspection__in=inspections,
        status=ActionItem.Status.OPEN
    ).count()
    
    return Response({
        'total_inspections': total_inspections,
        'completed_inspections': completed_inspections,
        'average_score': round(avg_score, 1) if avg_score else None,
        'critical_findings': critical_findings,
        'open_action_items': open_actions,
    })