# Deployment Notes

## 2025-09-24
- Added marketing email integration with AWS SES
- Updated CORS settings for https://verityinspect.com
- Marketing endpoints: /api/marketing/contact/ and /api/marketing/demo/

## Environment Variables Required:
- USE_SES=True (for production email)
- AWS SES credentials (existing AWS keys)
- DEFAULT_FROM_EMAIL=noreply@verityinspect.com