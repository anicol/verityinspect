#!/usr/bin/env python3
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import ssl

# Gmail SMTP configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_HOST_USER = "alistair@verityinspect.com"
EMAIL_HOST_PASSWORD = "sukl tash smjt orfs"
FROM_EMAIL = "alistair@getpeakops.com"
TO_EMAIL = "alistair@getpeakops.com"

def test_email():
    print("Testing Gmail SMTP connection...")
    
    try:
        # Create message
        message = MIMEMultipart()
        message["From"] = FROM_EMAIL
        message["To"] = TO_EMAIL
        message["Subject"] = "Test Email from PeakOps - Direct SMTP Test"
        
        body = """
This is a direct SMTP test email from the PeakOps system.

If you receive this email, the Gmail SMTP configuration is working correctly.

Configuration used:
- SMTP Server: smtp.gmail.com:587
- Authentication: alistair@verityinspect.com
- From Address: alistair@getpeakops.com
- To Address: alistair@getpeakops.com

Test completed successfully!
"""
        
        message.attach(MIMEText(body, "plain"))
        
        # Create SMTP session
        print(f"Connecting to {SMTP_SERVER}:{SMTP_PORT}...")
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        
        # Enable debug output
        server.set_debuglevel(1)
        
        # Start TLS encryption
        print("Starting TLS...")
        server.starttls()
        
        # Login to Gmail
        print(f"Authenticating as {EMAIL_HOST_USER}...")
        server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
        
        # Send email
        print(f"Sending email from {FROM_EMAIL} to {TO_EMAIL}...")
        text = message.as_string()
        server.sendmail(FROM_EMAIL, TO_EMAIL, text)
        
        # Close connection
        server.quit()
        
        print("\n✅ SUCCESS: Email sent successfully!")
        print(f"Check your inbox at {TO_EMAIL}")
        
    except Exception as e:
        print(f"\n❌ ERROR: Failed to send email")
        print(f"Error details: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    test_email()