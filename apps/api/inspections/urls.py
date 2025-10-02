from django.urls import path
from . import views

urlpatterns = [
    path('', views.InspectionListView.as_view(), name='inspection-list'),
    path('<int:pk>/', views.InspectionDetailView.as_view(), name='inspection-detail'),
    path('<int:inspection_id>/findings/', views.FindingListView.as_view(), name='finding-list'),
    path('<int:inspection_id>/findings/create/', views.create_manual_finding, name='create-manual-finding'),
    path('findings/<int:finding_id>/approve/', views.approve_finding, name='approve-finding'),
    path('findings/<int:finding_id>/reject/', views.reject_finding, name='reject-finding'),
    path('start/<int:video_id>/', views.start_inspection, name='start-inspection'),
    path('stats/', views.inspection_stats, name='inspection-stats'),
    path('actions/', views.ActionItemListCreateView.as_view(), name='action-list-create'),
    path('actions/<int:pk>/', views.ActionItemDetailView.as_view(), name='action-detail'),
]