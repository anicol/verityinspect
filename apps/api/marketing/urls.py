from django.urls import path
from . import views

urlpatterns = [
    path('contact/', views.send_contact_email, name='send-contact-email'),
    path('demo/', views.send_demo_email, name='send-demo-email'),
]