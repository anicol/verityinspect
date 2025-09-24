# Production Email Setup Guide

This document explains how to configure real email sending for the marketing forms in production.

## Option 1: Domain SMTP (Recommended for Professional Use)

Using your own domain's SMTP server is the most professional approach and gives you complete control.

### Step 1: Set Up Email Accounts on Your Domain
Create these email accounts on your domain (verityinspect.com):
- `noreply@verityinspect.com` - For sending marketing form emails
- `admin@verityinspect.com` - For system error notifications (optional)

### Step 2: Configure Environment Variables
```bash
# Domain SMTP Configuration
EMAIL_HOST=mail.verityinspect.com              # Your domain's SMTP server
EMAIL_PORT=587                                  # Common ports: 587 (TLS), 465 (SSL), 25 (unencrypted)
EMAIL_USE_TLS=True                             # True for port 587, False for port 465
EMAIL_USE_SSL=False                            # True for port 465, False for port 587
EMAIL_HOST_USER=noreply@verityinspect.com      # Your domain email account
EMAIL_HOST_PASSWORD=your-email-password        # Password for the email account
DEFAULT_FROM_EMAIL=noreply@verityinspect.com   # From address for marketing emails
SERVER_EMAIL=admin@verityinspect.com           # From address for error emails
EMAIL_TIMEOUT=30                               # Connection timeout in seconds
```

### Step 3: Common SMTP Server Settings

**cPanel/WHM Hosting:**
```
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587 (or 465)
EMAIL_USE_TLS=True (or False for SSL)
```

**Google Workspace (Business Gmail):**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@verityinspect.com
```

**Microsoft 365:**
```
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
```

**Generic Hosting Provider:**
```
EMAIL_HOST=smtp.yourhostingprovider.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
```

## Option 2: Gmail SMTP (Personal/Development Use)

### Step 1: Enable Gmail App Passwords
1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password (format: `abcd efgh ijkl mnop`)

### Step 2: Set Environment Variables
Set these environment variables in your production environment:

```bash
# Gmail SMTP Configuration
EMAIL_HOST_USER=alistair.nicol@gmail.com
EMAIL_HOST_PASSWORD=your-16-char-app-password-here
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
DEFAULT_FROM_EMAIL=alistair.nicol@gmail.com
```

### Step 3: Deploy
Once these environment variables are set, the system will automatically:
- Send real emails to alistair.nicol@gmail.com
- Use Gmail's SMTP servers
- Include proper "From" address

## Option 2: SendGrid (Recommended for Production)

SendGrid is more reliable for production applications and has better deliverability.

### Step 1: Create SendGrid Account
1. Sign up at https://sendgrid.com
2. Verify your account
3. Generate an API key

### Step 2: Install SendGrid Package
```bash
pip install sendgrid-django
```

### Step 3: Set Environment Variables
```bash
# SendGrid Configuration
SENDGRID_API_KEY=your-sendgrid-api-key-here
DEFAULT_FROM_EMAIL=noreply@verityinspect.com
```

## Current Email Format

Both options will send emails with this format:

### Contact Form Email
```
Subject: Contact Form: [subject]
From: [configured from email]
To: alistair.nicol@gmail.com

New Contact Form Submission

Name: [First] [Last]
Email: [email]
Company: [company]
Phone: [phone]
Subject: [subject]

Message:
[message content]

---
Sent from VerityInspect Marketing Website
```

### Demo Request Email
```
Subject: Demo Request: [company]
From: [configured from email] 
To: alistair.nicol@gmail.com

New Demo Request

Name: [First] [Last]
Email: [email]
Company: [company]
Phone: [phone]
Number of Stores: [stores]
Role: [role]

Additional Information:
[message content]

---
Sent from VerityInspect Marketing Website
```

## Testing Production Email

To test the production email configuration:

### Local Testing with Real Email
1. Set the environment variables locally
2. Restart your Django server
3. Submit a form from the marketing site
4. Check your alistair.nicol@gmail.com inbox

### API Testing
```bash
curl -X POST https://your-api-domain.com/api/marketing/contact/ \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "company": "Test Company",
    "phone": "555-123-4567", 
    "subject": "general",
    "message": "Testing production email"
  }'
```

## Environment Variables Summary

Choose one of these configurations:

### Domain SMTP (Recommended)
```bash
EMAIL_HOST=mail.verityinspect.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=noreply@verityinspect.com
EMAIL_HOST_PASSWORD=your-domain-email-password
DEFAULT_FROM_EMAIL=noreply@verityinspect.com
SERVER_EMAIL=admin@verityinspect.com
```

### Gmail SMTP (Development)
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=alistair.nicol@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=alistair.nicol@gmail.com
```

## Security Notes

- Never commit email passwords or API keys to version control
- Use environment variables or secure secret management
- Gmail App Passwords are safer than regular passwords
- SendGrid provides better analytics and deliverability for production

## Troubleshooting

### Gmail Issues
- Ensure 2FA is enabled on Gmail account
- Use App Password, not regular password
- Check Gmail's "Less secure app access" if needed

### SendGrid Issues
- Verify domain ownership for better deliverability
- Check SendGrid dashboard for delivery status
- Ensure API key has full mail sending permissions

### General Issues
- Check Django logs for detailed error messages
- Verify CORS settings allow your domain
- Test with curl first before frontend testing