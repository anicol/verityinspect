#!/usr/bin/env python3
import os
import django
from django.core.mail import send_mail
from django.conf import settings

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'peakops.settings')
django.setup()

def test_django_email():
    print("Testing Django email system...")
    print(f"Email backend: {settings.EMAIL_BACKEND}")
    print(f"Email host: {settings.EMAIL_HOST}")
    print(f"Email port: {settings.EMAIL_PORT}")
    print(f"Email use TLS: {settings.EMAIL_USE_TLS}")
    print(f"Email host user: {settings.EMAIL_HOST_USER}")
    print(f"Default from email: {settings.DEFAULT_FROM_EMAIL}")
    
    try:
        subject = "Django Email Test from PeakOps"
        message = """
This is a test email sent through Django's email system.

If you receive this email, the Django email configuration is working correctly.

Settings used:
- Backend: {backend}
- Host: {host}:{port}
- Host User: {user}
- From Email: {from_email}

Test completed successfully!
""".format(
            backend=settings.EMAIL_BACKEND,
            host=settings.EMAIL_HOST,
            port=settings.EMAIL_PORT,
            user=settings.EMAIL_HOST_USER,
            from_email=settings.DEFAULT_FROM_EMAIL
        )
        
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = ['alistair@getpeakops.com']
        
        print(f"\nSending email from {from_email} to {recipient_list}...")
        
        result = send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        
        print(f"✅ SUCCESS: Django email sent successfully!")
        print(f"Number of emails sent: {result}")
        print(f"Check your inbox at alistair@getpeakops.com")
        
    except Exception as e:
        print(f"❌ ERROR: Failed to send Django email")
        print(f"Error details: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    test_django_email()