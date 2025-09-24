from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

# Create router for viewsets
router = DefaultRouter()
router.register(r'nudges', views.NudgeViewSet, basename='nudge')
router.register(r'behavior', views.BehaviorTrackingViewSet, basename='behavior')

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('trial-signup/', views.trial_signup_view, name='trial-signup'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', views.profile_view, name='profile'),
    path('users/', views.UserListCreateView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('nudges/active/', views.get_active_nudges, name='active-nudges'),
    path('', include(router.urls)),
]