# AWS SES Setup Guide for Render + AWS Infrastructure

This guide shows how to configure AWS Simple Email Service (SES) for your marketing forms - perfect for your Render + AWS setup.

## Why AWS SES?

✅ **Perfect for AWS/Render** - Native integration with your existing AWS infrastructure  
✅ **Cost Effective** - $0.10 per 1,000 emails (extremely cheap)  
✅ **High Deliverability** - Excellent reputation and delivery rates  
✅ **Professional** - Send from your own domain (noreply@verityinspect.com)  
✅ **Scalable** - From 1 email to millions  
✅ **No SMTP Setup** - Uses AWS API instead of SMTP servers  

## Step 1: Set Up AWS SES

### 1. Enable SES in AWS Console
```bash
1. Go to AWS Console → Simple Email Service
2. Select your preferred region (us-east-1 recommended)
3. Click "Get started"
```

### 2. Verify Your Domain
```bash
1. Go to "Verified identities" → "Create identity"
2. Select "Domain" 
3. Enter: verityinspect.com
4. Add the CNAME records to your DNS (where you manage verityinspect.com)
```

### 3. Verify Your Email Address (for initial testing)
```bash
1. Go to "Verified identities" → "Create identity" 
2. Select "Email address"
3. Enter: alistair.nicol@gmail.com
4. Check your email and click verification link
```

### 4. Request Production Access (Important!)
```bash
1. Go to "Account dashboard" → "Request production access"
2. Fill out the form:
   - Mail type: "Transactional" 
   - Use case: "Marketing form notifications for business"
   - Website URL: https://verityinspect-marketing.onrender.com
   - Process: Usually approved within 24 hours
```

## Step 2: Configure Django Settings

The Django settings have already been configured for AWS SES. You just need to set environment variables.

### Environment Variables for Production

Set these in your Render environment:

```bash
# AWS SES Configuration  
USE_SES=True
AWS_SES_REGION_NAME=us-east-1
DEFAULT_FROM_EMAIL=noreply@verityinspect.com
SERVER_EMAIL=admin@verityinspect.com

# Your existing AWS credentials (already configured)
AWS_ACCESS_KEY_ID=your-existing-aws-key
AWS_SECRET_ACCESS_KEY=your-existing-aws-secret
```

## Step 3: Update Requirements

Add to your `requirements.txt`:
```
django-ses>=3.5,<4.0
```

## Step 4: Deploy to Render

1. Push your changes to GitHub
2. Render will automatically deploy with the new email configuration
3. SES will automatically be used in production

## Step 5: Test Email Sending

### API Test
```bash
curl -X POST https://your-api-url.onrender.com/api/marketing/contact/ \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User", 
    "email": "test@example.com",
    "company": "Test Company",
    "phone": "555-123-4567",
    "subject": "general",
    "message": "Testing AWS SES integration"
  }'
```

### Check Results
- ✅ Check your Gmail (alistair.nicol@gmail.com) for the email
- ✅ Check AWS SES Console → "Reputation metrics" for send statistics
- ✅ Check Django logs for any errors

## Email Configuration Flow

### Development (DEBUG=True)
```
📧 Form submitted → Django logs (console backend)
```

### Production (DEBUG=False)  
```
📧 Form submitted → AWS SES → alistair.nicol@gmail.com ✉️
```

## DNS Records for Domain Verification

When you verify verityinspect.com in SES, AWS will give you CNAME records like:

```
Type: CNAME
Name: _amazonses.verityinspect.com
Value: provided-by-aws.amazonses.com

Type: CNAME  
Name: random-string._domainkey.verityinspect.com
Value: random-string.dkim.amazonses.com
```

Add these to your DNS provider (where you manage verityinspect.com).

## Pricing

AWS SES Pricing (very affordable):
- **First 62,000 emails per month: FREE** (if sent from EC2)
- **After that: $0.10 per 1,000 emails**
- **No monthly fees or setup costs**

For marketing forms, you'll likely stay in the free tier!

## Alternative: SendGrid (Backup Option)

If you prefer a third-party service, SendGrid also works well with Render:

```bash
# SendGrid Environment Variables
SENDGRID_API_KEY=your-sendgrid-key
DEFAULT_FROM_EMAIL=noreply@verityinspect.com
```

## Security Best Practices

✅ **Use IAM roles** instead of hardcoded keys when possible  
✅ **Limit SES permissions** to only sending emails  
✅ **Monitor bounce rates** in SES console  
✅ **Keep DNS records updated** for domain verification  
✅ **Use separate email addresses** for different purposes  

## Troubleshooting

### Common Issues

**Domain not verified:**
- Check DNS records are correctly added
- Wait up to 72 hours for DNS propagation
- Verify in AWS SES console

**Still in sandbox mode:**
- Submit production access request in SES console
- Usually approved within 24 hours for legitimate use cases

**Emails not arriving:**
- Check AWS SES reputation metrics
- Verify recipient email address
- Check Django logs for errors
- Ensure AWS credentials have SES permissions

**Permission denied:**
- Verify AWS credentials have SES permissions
- Check region matches (us-east-1)
- Ensure IAM policy includes ses:SendEmail

## Final Result

Once configured, your marketing forms will send professional emails like:

```
From: noreply@verityinspect.com
To: alistair.nicol@gmail.com  
Subject: Contact Form: General Inquiry

New Contact Form Submission

Name: John Doe
Email: john@example.com
Company: Example Corp
[... rest of form data ...]

---
Sent from VerityInspect Marketing Website
```

This gives you professional, reliable email delivery using your existing AWS infrastructure!