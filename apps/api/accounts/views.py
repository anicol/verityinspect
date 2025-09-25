from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from django.utils import timezone
from django.db.models import Q
from drf_spectacular.utils import extend_schema
from .models import User, SmartNudge, UserBehaviorEvent
from .serializers import (
    UserSerializer, UserCreateSerializer, LoginSerializer, TrialSignupSerializer,
    SmartNudgeSerializer, BehaviorEventCreateSerializer
)
from .nudge_engine import BehaviorTracker, NudgeEngine


class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [AllowAny()]
        return [IsAuthenticated()]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        login(request, user)
        
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        return Response({
            'access': str(access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@extend_schema(
    request=TrialSignupSerializer,
    responses={201: UserSerializer, 400: None},
    description="Create a new trial user with auto-generated brand and demo store"
)
@api_view(['POST'])
@permission_classes([AllowAny])
def trial_signup_view(request):
    serializer = TrialSignupSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate JWT tokens for immediate login
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        return Response({
            'user': UserSerializer(user).data,
            'access': str(access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NudgeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for managing smart nudges"""
    serializer_class = SmartNudgeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return pending nudges for current user"""
        return SmartNudge.objects.filter(
            user=self.request.user,
            status__in=[SmartNudge.Status.PENDING, SmartNudge.Status.SHOWN],
            show_after__lte=timezone.now()
        ).filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
        )
    
    @action(detail=True, methods=['post'])
    def mark_shown(self, request, pk=None):
        """Mark nudge as shown to user"""
        nudge = self.get_object()
        nudge.mark_shown()
        return Response({'status': 'marked_shown'})
    
    @action(detail=True, methods=['post'])
    def mark_clicked(self, request, pk=None):
        """Mark nudge as clicked by user"""
        nudge = self.get_object()
        nudge.mark_clicked()
        return Response({'status': 'marked_clicked'})
    
    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        """Dismiss nudge"""
        nudge = self.get_object()
        nudge.mark_dismissed()
        return Response({'status': 'dismissed'})


class BehaviorTrackingViewSet(viewsets.GenericViewSet):
    """ViewSet for tracking user behavioral events"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def track_event(self, request):
        """Track a behavioral event"""
        serializer = BehaviorEventCreateSerializer(data=request.data)
        if serializer.is_valid():
            event = BehaviorTracker.track(
                user=request.user,
                event_type=serializer.validated_data['event_type'],
                metadata=serializer.validated_data.get('metadata', {}),
                session_id=serializer.validated_data.get('session_id')
            )
            return Response({
                'id': event.id,
                'event_type': event.event_type,
                'timestamp': event.timestamp,
                'status': 'tracked'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def demo_started(self, request):
        """Track demo started event"""
        event = BehaviorTracker.track_demo_started(
            user=request.user,
            session_id=request.data.get('session_id')
        )
        return Response({'id': event.id, 'status': 'tracked'})
    
    @action(detail=False, methods=['post'])
    def demo_completed(self, request):
        """Track demo completed event"""
        event = BehaviorTracker.track_demo_completed(
            user=request.user,
            session_id=request.data.get('session_id')
        )
        return Response({'id': event.id, 'status': 'tracked'})
    
    @action(detail=False, methods=['post'])
    def demo_skipped(self, request):
        """Track demo skipped event"""
        event = BehaviorTracker.track_demo_skipped(
            user=request.user,
            session_id=request.data.get('session_id')
        )
        return Response({'id': event.id, 'status': 'tracked'})
    
    @action(detail=False, methods=['post'])
    def dashboard_view(self, request):
        """Track dashboard view event"""
        event = BehaviorTracker.track_dashboard_view(
            user=request.user,
            session_id=request.data.get('session_id')
        )
        return Response({'id': event.id, 'status': 'tracked'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_active_nudges(request):
    """Get active nudges for current user"""
    nudges = SmartNudge.objects.filter(
        user=request.user,
        status__in=[SmartNudge.Status.PENDING, SmartNudge.Status.SHOWN],
        show_after__lte=timezone.now()
    ).filter(
        Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
    )[:3]  # Limit to 3 nudges
    
    # Mark as shown if they were pending
    for nudge in nudges:
        if nudge.status == SmartNudge.Status.PENDING:
            nudge.mark_shown()
    
    serializer = SmartNudgeSerializer(nudges, many=True)
    return Response(serializer.data)