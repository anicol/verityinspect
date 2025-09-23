from django.urls import path
from . import views

urlpatterns = [
    path('', views.BrandListCreateView.as_view(), name='brand-list-create'),
    path('<int:pk>/', views.BrandDetailView.as_view(), name='brand-detail'),
    path('stores/', views.StoreListCreateView.as_view(), name='store-list-create'),
    path('stores/<int:pk>/', views.StoreDetailView.as_view(), name='store-detail'),
]