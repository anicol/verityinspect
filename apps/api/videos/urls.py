from django.urls import path
from . import views

urlpatterns = [
    path('', views.VideoListCreateView.as_view(), name='video-list-create'),
    path('<int:pk>/', views.VideoDetailView.as_view(), name='video-detail'),
    path('<int:pk>/reprocess/', views.reprocess_video, name='video-reprocess'),
    path('<int:video_id>/frames/', views.VideoFrameListView.as_view(), name='video-frames'),
]