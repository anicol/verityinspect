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
    
    @action(detail=False, methods=['post'])
    def validate_clicks(self, request):
        """Validate user clicks against demo video violations"""
        from videos.models import Video
        
        data = request.data
        video_id = data.get('video_id')
        clicks = data.get('clicks', [])
        
        if not video_id or not clicks:
            return Response(
                {'error': 'video_id and clicks are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            video = Video.objects.get(id=video_id, is_demo=True, demo_type='TRY')
        except Video.DoesNotExist:
            return Response(
                {'error': 'Demo video not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        violations = video.demo_violations or []
        found_violations = []
        missed_violations = []
        
        # Validate each click against violations
        for violation in violations:
            violation_found = False
            
            for click in clicks:
                if self._is_click_valid(click, violation):
                    found_violations.append({
                        'id': violation['id'],
                        'title': violation['title'],
                        'category': violation['category'],
                        'severity': violation['severity']
                    })
                    violation_found = True
                    break
            
            if not violation_found:
                missed_violations.append({
                    'id': violation['id'],
                    'title': violation['title'],
                    'category': violation['category'],
                    'severity': violation['severity'],
                    'bbox': violation['bbox'],
                    'timestamp': violation['timestamp'],
                    'why_missed': self._get_miss_reason(violation)
                })
        
        # Calculate performance score
        total_violations = len(violations)
        found_count = len(found_violations)
        score_percentage = (found_count / total_violations * 100) if total_violations > 0 else 0
        
        # Generate feedback message
        feedback = self._generate_feedback(found_count, total_violations)
        
        # Track the attempt
        BehaviorTracker.track(
            user=request.user,
            event_type='DEMO_TRY_COMPLETED',
            metadata={
                'video_id': video_id,
                'clicks_count': len(clicks),
                'violations_found': found_count,
                'total_violations': total_violations,
                'score': score_percentage,
                'performance': 'good' if score_percentage >= 50 else 'needs_improvement'
            },
            session_id=data.get('session_id')
        )
        
        return Response({
            'found_violations': found_violations,
            'missed_violations': missed_violations,
            'score': found_count,
            'total': total_violations,
            'score_percentage': round(score_percentage, 1),
            'feedback': feedback
        })
    
    def _is_click_valid(self, click, violation):
        """Check if a click is valid for a violation"""
        # Time tolerance: ±2 seconds
        time_diff = abs(click.get('timestamp', 0) - violation.get('timestamp', 0))
        if time_diff > 2.0:
            return False
        
        # Spatial tolerance: 5% of video dimensions
        tolerance = 0.05
        click_x = click.get('x', 0)  # Normalized coordinates (0-1)
        click_y = click.get('y', 0)
        
        bbox = violation.get('bbox', {})
        bbox_x = bbox.get('x', 0) / 100  # Convert percentage to normalized
        bbox_y = bbox.get('y', 0) / 100
        bbox_w = bbox.get('width', 0) / 100
        bbox_h = bbox.get('height', 0) / 100
        
        # Check if click is within bounding box + tolerance
        return (
            bbox_x - tolerance <= click_x <= bbox_x + bbox_w + tolerance and
            bbox_y - tolerance <= click_y <= bbox_y + bbox_h + tolerance
        )
    
    def _get_miss_reason(self, violation):
        """Generate reason why violation was missed"""
        severity = violation.get('severity', 'LOW')
        category = violation.get('category', 'OTHER')
        
        reasons = {
            'PPE': "PPE violations can be subtle - look for missing gloves, hair nets, or protective equipment",
            'SAFETY': "Safety hazards often blend into the background - check for wet floors, blocked exits, or improper storage",
            'CLEANLINESS': "Cleanliness issues may be small details - look for spills, dirty surfaces, or improper sanitization",
            'UNIFORM': "Uniform violations might seem minor but are important for compliance"
        }
        
        if severity in ['CRITICAL', 'HIGH']:
            return f"This {severity.lower()} {category.lower()} issue requires immediate attention. " + reasons.get(category, "Look more carefully in this area.")
        
        return reasons.get(category, "Small details matter in food safety compliance.")
    
    def _generate_feedback(self, found, total):
        """Generate encouraging feedback based on performance"""
        percentage = (found / total * 100) if total > 0 else 0
        
        if percentage >= 80:
            return f"Excellent eye! You found {found} of {total} violations. You'd make a great inspector!"
        elif percentage >= 60:
            return f"Good job! You spotted {found} of {total} violations. The AI found {total - found} additional subtle issues."
        elif percentage >= 40:
            return f"Nice work! You caught {found} of {total} violations. The AI's trained eye spotted {total - found} more that are easy to miss."
        else:
            return f"You found {found} of {total} violations - a good start! The AI caught {total - found} additional issues that even experienced inspectors might miss."


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