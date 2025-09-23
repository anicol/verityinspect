# VerityInspect Deployment Guide

This guide covers deploying VerityInspect to Render.com with GitHub integration.

## Prerequisites

1. **GitHub Repository**: Push code to `git@github.com:anicol/verityinspect.git`
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **AWS Account**: For S3 storage and Rekognition services
4. **Domain**: Configure `verityinspect.com` DNS

## Render Services Architecture

The application deploys as 5 services on Render:

1. **PostgreSQL Database** (`verityinspect-db`)
2. **Redis Cache** (`verityinspect-redis`) 
3. **Django API** (`verityinspect-api`)
4. **Celery Worker** (`verityinspect-celery`)
5. **React Web App** (`verityinspect-web`)
6. **Marketing Site** (`verityinspect-marketing`)

## Deployment Steps

### 1. Push to GitHub

```bash
cd /path/to/verityinspect
git init
git add .
git commit -m "Initial VerityInspect deployment"
git branch -M main
git remote add origin git@github.com:anicol/verityinspect.git
git push -u origin main
```

### 2. Import to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Blueprint"
3. Connect GitHub repository: `anicol/verityinspect`
4. Select branch: `main`
5. Render will read `render.yaml` and create all services

### 3. Configure Environment Variables

Set these in Render Dashboard for the API service:

**Required:**
- `SECRET_KEY`: Django secret (auto-generated)
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AWS_STORAGE_BUCKET_NAME`: `verityinspect-media`

**Optional:**
- `DEMO_MODE`: `True` (for testing)
- `FACE_BLUR`: `False` (or `True` for privacy)
- `ENABLE_AWS_REKOGNITION`: `True`

### 4. Custom Domain Setup

1. In Render Dashboard → Settings → Custom Domains
2. Add domains:
   - API: `api.verityinspect.com`
   - Web: `app.verityinspect.com` 
   - Marketing: `verityinspect.com`

3. Configure DNS records:
   ```
   CNAME api     verityinspect-api.onrender.com
   CNAME app     verityinspect-web.onrender.com
   CNAME www     verityinspect-marketing.onrender.com
   A     @       [Render IP for marketing]
   ```

### 5. AWS S3 Setup

1. Create S3 bucket: `verityinspect-media`
2. Enable public read for uploaded files
3. Create IAM user with S3 and Rekognition permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:*",
           "rekognition:*"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

## Service URLs

After deployment:

- **Marketing Site**: https://verityinspect.com
- **Web Application**: https://app.verityinspect.com  
- **API**: https://api.verityinspect.com
- **API Docs**: https://api.verityinspect.com/api/docs/

## Demo Credentials

Default login credentials (change in production):
- **admin** / demo123 (Administrator)
- **manager** / demo123 (General Manager)
- **inspector** / demo123 (Inspector)

## Monitoring

- **Health Check**: `GET /health/`
- **Database Status**: `GET /health/db/`
- **Redis Status**: `GET /health/redis/`

## Scaling

Render automatically scales based on CPU/memory usage. To manually scale:

1. Dashboard → Service → Settings
2. Adjust instance count and size
3. Recommended for production:
   - API: 2+ instances
   - Celery: 1-2 instances depending on video volume

## Environment-Specific Settings

### Development
```bash
DEBUG=True
DEMO_MODE=True
ENABLE_AWS_REKOGNITION=False
```

### Production
```bash
DEBUG=False
DEMO_MODE=False
ENABLE_AWS_REKOGNITION=True
SECURE_SSL_REDIRECT=True
```

## Troubleshooting

### Build Failures
- Check build logs in Render Dashboard
- Verify all dependencies in requirements.txt
- Ensure environment variables are set

### Database Issues
- Verify DATABASE_URL is correctly set
- Check PostgreSQL service is running
- Run migrations: `python manage.py migrate`

### Celery Issues  
- Verify REDIS_URL is correctly set
- Check Redis service is running
- Monitor worker logs for task failures

### Frontend Issues
- Verify VITE_API_URL points to correct API endpoint
- Check CORS settings in Django
- Ensure build completes successfully

## Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Set DEBUG=False in production
- [ ] Configure proper ALLOWED_HOSTS
- [ ] Enable SSL redirect
- [ ] Set up proper CORS origins
- [ ] Rotate AWS keys regularly
- [ ] Monitor access logs
- [ ] Enable CloudFlare or similar CDN

## Backup Strategy

1. **Database**: Render auto-backups PostgreSQL daily
2. **Media Files**: S3 has versioning enabled
3. **Application**: GitHub repository serves as backup

For critical data, set up additional backup procedures.