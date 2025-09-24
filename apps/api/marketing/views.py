from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from drf_spectacular.utils import extend_schema
import logging

from .serializers import ContactFormSerializer, DemoRequestSerializer

logger = logging.getLogger(__name__)


@extend_schema(
    request=ContactFormSerializer,
    responses={200: None},
    description="Send contact form email to alistair.nicol@gmail.com",
    tags=['Marketing']
)
@api_view(['POST'])
@permission_classes([AllowAny])
def send_contact_email(request):
    """Send contact form email to alistair.nicol@gmail.com"""
    serializer = ContactFormSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    
    # Prepare email content
    subject = f"Contact Form: {data['subject']}"
    message = f"""
New Contact Form Submission

Name: {data['first_name']} {data['last_name']}
Email: {data['email']}
Company: {data.get('company', 'Not provided')}
Phone: {data.get('phone', 'Not provided')}
Subject: {data['subject']}

Message:
{data['message']}

---
Sent from VerityInspect Marketing Website
    """.strip()
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['alistair.nicol@gmail.com'],
            fail_silently=False,
        )
        
        logger.info(f"Contact form email sent successfully from {data['email']}")
        return Response({'message': 'Email sent successfully'}, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Failed to send contact form email: {str(e)}")
        return Response(
            {'error': 'Failed to send email'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    request=DemoRequestSerializer,
    responses={200: None},
    description="Send demo request email to alistair.nicol@gmail.com",
    tags=['Marketing']
)
@api_view(['POST'])
@permission_classes([AllowAny])
def send_demo_email(request):
    """Send demo request email to alistair.nicol@gmail.com"""
    serializer = DemoRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    data = serializer.validated_data
    
    # Prepare email content
    subject = f"Demo Request: {data['company']}"
    message = f"""
New Demo Request

Name: {data['first_name']} {data['last_name']}
Email: {data['email']}
Company: {data['company']}
Phone: {data.get('phone', 'Not provided')}
Number of Stores: {data['stores']}
Role: {data['role']}

Additional Information:
{data.get('message', 'No additional information provided')}

---
Sent from VerityInspect Marketing Website
    """.strip()
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=['alistair.nicol@gmail.com'],
            fail_silently=False,
        )
        
        logger.info(f"Demo request email sent successfully from {data['email']}")
        return Response({'message': 'Email sent successfully'}, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Failed to send demo request email: {str(e)}")
        return Response(
            {'error': 'Failed to send email'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
