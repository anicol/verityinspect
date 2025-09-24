"""
Smart Nudge Engine - Analyzes user behavior and triggers contextual nudges
"""
from datetime import timedelta
from django.utils import timezone
from django.db.models import Q
from .models import User, UserBehaviorEvent, SmartNudge


class NudgeEngine:
    """Analyzes user behavior and creates smart nudges"""
    
    @classmethod
    def analyze_user_and_create_nudges(cls, user):
        """Main entry point - analyze user and create appropriate nudges"""
        if not user.is_trial_user:
            return  # Only nudge trial users for now
        
        # Get recent behavior
        recent_events = user.behavior_events.filter(
            timestamp__gte=timezone.now() - timedelta(days=7)
        ).order_by('-timestamp')
        
        # Prevent duplicate nudges
        existing_nudge_types = set(
            user.nudges.filter(
                status__in=[SmartNudge.Status.PENDING, SmartNudge.Status.SHOWN]
            ).values_list('nudge_type', flat=True)
        )
        
        # Run nudge analysis
        cls._check_onboarding_nudges(user, recent_events, existing_nudge_types)
        cls._check_engagement_nudges(user, recent_events, existing_nudge_types)
        cls._check_conversion_nudges(user, recent_events, existing_nudge_types)
        cls._check_reengagement_nudges(user, recent_events, existing_nudge_types)
    
    @classmethod
    def _check_onboarding_nudges(cls, user, recent_events, existing_nudge_types):
        """Check for onboarding nudges"""
        hours_since_signup = user.hours_since_signup
        
        # Upload first video nudge (after demo completion or 2 hours)
        if (SmartNudge.NudgeType.UPLOAD_FIRST_VIDEO not in existing_nudge_types and
            user.trial_videos_used == 0 and hours_since_signup >= 2):
            
            # Check if they've completed demo
            demo_completed = recent_events.filter(
                event_type=UserBehaviorEvent.EventType.DEMO_COMPLETED
            ).exists()
            
            show_after = timezone.now()
            if not demo_completed and hours_since_signup < 24:
                # Give them time to complete demo first
                show_after = timezone.now() + timedelta(hours=2)
            
            SmartNudge.create_nudge(
                user=user,
                nudge_type=SmartNudge.NudgeType.UPLOAD_FIRST_VIDEO,
                title="Ready to see AI in action? 🎬",
                message="Upload your first restaurant video and get instant AI analysis of safety, cleanliness, and compliance issues.",
                cta_text="Upload Video",
                cta_url="/videos/upload",
                show_after=show_after,
                expires_at=timezone.now() + timedelta(days=3),
                priority=1,
                trigger_condition={
                    'hours_since_signup': hours_since_signup,
                    'demo_completed': demo_completed,
                    'videos_used': user.trial_videos_used
                }
            )
        
        # Complete demo nudge (if they haven't seen it)
        if (SmartNudge.NudgeType.COMPLETE_DEMO not in existing_nudge_types and
            not user.has_seen_demo and hours_since_signup >= 6):
            
            SmartNudge.create_nudge(
                user=user,
                nudge_type=SmartNudge.NudgeType.COMPLETE_DEMO,
                title="See how AI inspections work 👀",
                message="Watch our interactive demo to see how AI can automatically detect compliance issues in your restaurant videos.",
                cta_text="View Demo",
                cta_url="/dashboard?demo=true",
                show_after=timezone.now(),
                expires_at=timezone.now() + timedelta(days=2),
                priority=2,
                trigger_condition={
                    'hours_since_signup': hours_since_signup,
                    'has_seen_demo': user.has_seen_demo
                }
            )
    
    @classmethod
    def _check_engagement_nudges(cls, user, recent_events, existing_nudge_types):
        """Check for engagement nudges"""
        
        # Return after upload nudge (uploaded but not checked results)
        if (SmartNudge.NudgeType.RETURN_AFTER_UPLOAD not in existing_nudge_types and
            user.trial_videos_used > 0):
            
            last_upload = recent_events.filter(
                event_type=UserBehaviorEvent.EventType.UPLOAD_COMPLETED
            ).first()
            
            if last_upload:
                time_since_upload = timezone.now() - last_upload.timestamp
                
                # Nudge them 4 hours after upload if they haven't viewed results
                if (time_since_upload >= timedelta(hours=4) and
                    time_since_upload <= timedelta(days=2)):
                    
                    recent_views = recent_events.filter(
                        event_type__in=[
                            UserBehaviorEvent.EventType.INSPECTION_VIEW,
                            UserBehaviorEvent.EventType.VIDEO_VIEW
                        ],
                        timestamp__gte=last_upload.timestamp
                    ).exists()
                    
                    if not recent_views:
                        SmartNudge.create_nudge(
                            user=user,
                            nudge_type=SmartNudge.NudgeType.RETURN_AFTER_UPLOAD,
                            title="Your AI analysis is ready! 🔍",
                            message="We've finished analyzing your video and found some interesting insights. Check out what our AI discovered.",
                            cta_text="View Results",
                            cta_url="/inspections",
                            show_after=timezone.now(),
                            expires_at=timezone.now() + timedelta(days=1),
                            priority=1,
                            trigger_condition={
                                'hours_since_upload': int(time_since_upload.total_seconds() / 3600),
                                'viewed_results': recent_views
                            }
                        )
        
        # Try second video nudge (after first successful upload)
        if (SmartNudge.NudgeType.TRY_SECOND_VIDEO not in existing_nudge_types and
            user.trial_videos_used == 1):
            
            # Wait 24 hours after first upload
            first_upload = recent_events.filter(
                event_type=UserBehaviorEvent.EventType.UPLOAD_COMPLETED
            ).first()
            
            if first_upload and timezone.now() - first_upload.timestamp >= timedelta(hours=24):
                SmartNudge.create_nudge(
                    user=user,
                    nudge_type=SmartNudge.NudgeType.TRY_SECOND_VIDEO,
                    title="Try a different area next! 📹",
                    message="Upload a video from a different area (kitchen, dining, storage) to see how AI analysis varies across locations.",
                    cta_text="Upload Another",
                    cta_url="/videos/upload",
                    show_after=timezone.now(),
                    expires_at=timezone.now() + timedelta(days=2),
                    priority=2,
                    trigger_condition={
                        'videos_used': user.trial_videos_used,
                        'hours_since_first_upload': int((timezone.now() - first_upload.timestamp).total_seconds() / 3600)
                    }
                )
    
    @classmethod
    def _check_conversion_nudges(cls, user, recent_events, existing_nudge_types):
        """Check for conversion nudges"""
        
        # Trial expiring soon (2 days before expiry)
        if (SmartNudge.NudgeType.TRIAL_EXPIRING_SOON not in existing_nudge_types and
            user.trial_expires_at and user.trial_days_remaining <= 2 and user.trial_days_remaining > 0):
            
            SmartNudge.create_nudge(
                user=user,
                nudge_type=SmartNudge.NudgeType.TRIAL_EXPIRING_SOON,
                title=f"⏰ Only {user.trial_days_remaining} days left in your trial",
                message=f"Don't lose access to AI-powered inspections! Upgrade now to keep analyzing your restaurant operations. You've used {user.trial_videos_used}/10 trial videos.",
                cta_text="Upgrade Now",
                cta_url="/billing/upgrade",
                show_after=timezone.now(),
                expires_at=user.trial_expires_at,
                priority=1,
                trigger_condition={
                    'days_remaining': user.trial_days_remaining,
                    'videos_used': user.trial_videos_used,
                    'conversion_score': user.trial_conversion_score
                }
            )
        
        # Feature limit reached
        limits_hit = []
        if user.trial_videos_used >= 8:  # Near video limit
            limits_hit.append('videos')
        if user.trial_stores_used >= 4:  # Near store limit
            limits_hit.append('stores')
        if user.trial_reports_downloaded >= 2:  # Hit report limit
            limits_hit.append('reports')
        
        if (limits_hit and SmartNudge.NudgeType.FEATURE_LIMIT_REACHED not in existing_nudge_types):
            feature_text = ', '.join(limits_hit)
            SmartNudge.create_nudge(
                user=user,
                nudge_type=SmartNudge.NudgeType.FEATURE_LIMIT_REACHED,
                title="You're getting great value from VerityInspect! 💪",
                message=f"You've nearly reached your trial limits for {feature_text}. Upgrade to continue with unlimited access.",
                cta_text="Upgrade to Pro",
                cta_url="/billing/upgrade",
                show_after=timezone.now(),
                expires_at=timezone.now() + timedelta(days=7),
                priority=2,
                trigger_condition={
                    'limits_hit': limits_hit,
                    'usage_stats': {
                        'videos': user.trial_videos_used,
                        'stores': user.trial_stores_used,
                        'reports': user.trial_reports_downloaded
                    }
                }
            )
    
    @classmethod
    def _check_reengagement_nudges(cls, user, recent_events, existing_nudge_types):
        """Check for re-engagement nudges"""
        
        # Inactive user (no login in 48 hours but trial still active)
        hours_inactive = (timezone.now() - user.last_active_at).total_seconds() / 3600
        
        if (SmartNudge.NudgeType.INACTIVE_USER not in existing_nudge_types and
            hours_inactive >= 48 and not user.is_trial_expired and user.trial_videos_used > 0):
            
            SmartNudge.create_nudge(
                user=user,
                nudge_type=SmartNudge.NudgeType.INACTIVE_USER,
                title="We miss you! Your analysis results are waiting 👋",
                message=f"It's been a while since your last visit. You still have {user.trial_days_remaining} days left to explore AI-powered restaurant inspections.",
                cta_text="View Dashboard",
                cta_url="/dashboard",
                show_after=timezone.now(),
                expires_at=timezone.now() + timedelta(days=3),
                priority=3,
                trigger_condition={
                    'hours_inactive': int(hours_inactive),
                    'days_remaining': user.trial_days_remaining,
                    'videos_used': user.trial_videos_used
                }
            )


class BehaviorTracker:
    """Helper class to easily track user behavioral events"""
    
    @classmethod
    def track(cls, user, event_type, metadata=None, session_id=None):
        """Track a behavioral event and trigger nudge analysis"""
        
        # Track the event
        event = UserBehaviorEvent.track_event(
            user=user,
            event_type=event_type,
            metadata=metadata or {},
            session_id=session_id
        )
        
        # Update user activity timestamp
        user.last_active_at = timezone.now()
        user.save(update_fields=['last_active_at'])
        
        # Analyze for nudges (async in production)
        NudgeEngine.analyze_user_and_create_nudges(user)
        
        return event
    
    @classmethod
    def track_demo_started(cls, user, session_id=None):
        """Track when user starts the demo"""
        return cls.track(
            user, 
            UserBehaviorEvent.EventType.DEMO_STARTED,
            metadata={'source': 'dashboard'},
            session_id=session_id
        )
    
    @classmethod
    def track_demo_completed(cls, user, session_id=None):
        """Track when user completes the demo"""
        user.has_seen_demo = True
        user.demo_completed_at = timezone.now()
        user.save(update_fields=['has_seen_demo', 'demo_completed_at'])
        
        return cls.track(
            user,
            UserBehaviorEvent.EventType.DEMO_COMPLETED,
            metadata={'duration_seconds': 120},  # Estimated demo duration
            session_id=session_id
        )
    
    @classmethod
    def track_demo_skipped(cls, user, session_id=None):
        """Track when user skips the demo"""
        return cls.track(
            user,
            UserBehaviorEvent.EventType.DEMO_SKIPPED,
            metadata={'source': 'skip_button'},
            session_id=session_id
        )
    
    @classmethod
    def track_login(cls, user, session_id=None):
        """Track user login"""
        return cls.track(
            user,
            UserBehaviorEvent.EventType.LOGIN,
            metadata={'login_method': 'email'},
            session_id=session_id
        )
    
    @classmethod
    def track_dashboard_view(cls, user, session_id=None):
        """Track dashboard view"""
        return cls.track(
            user,
            UserBehaviorEvent.EventType.DASHBOARD_VIEW,
            session_id=session_id
        )
    
    @classmethod
    def track_upload_initiated(cls, user, metadata=None, session_id=None):
        """Track when user starts upload process"""
        return cls.track(
            user,
            UserBehaviorEvent.EventType.UPLOAD_INITIATED,
            metadata=metadata or {},
            session_id=session_id
        )
    
    @classmethod
    def track_upload_completed(cls, user, video_id, metadata=None, session_id=None):
        """Track successful video upload"""
        meta = metadata or {}
        meta.update({'video_id': video_id})
        
        return cls.track(
            user,
            UserBehaviorEvent.EventType.UPLOAD_COMPLETED,
            metadata=meta,
            session_id=session_id
        )