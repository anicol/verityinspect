# VerityInspect Render Deployment Guide

## Step-by-Step Deployment Instructions

### 1. Prerequisites
- [x] GitHub repository: `git@github.com:anicol/verityinspect.git`
- [ ] Render account: [render.com](https://render.com)
- [ ] AWS account for S3 and Rekognition

### 2. Create Render Blueprint

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Click "New" → "Blueprint"

2. **Connect GitHub Repository**
   - Repository: `anicol/verityinspect`
   - Branch: `main`
   - Render will read `render.yaml` automatically

3. **Review Services**
   The blueprint will create 5 services:
   - `verityinspect-db` (PostgreSQL)
   - `verityinspect-redis` (Redis)
   - `verityinspect-api` (Django API)
   - `verityinspect-celery` (Celery Worker)
   - `verityinspect-web` (React App)
   - `verityinspect-marketing` (Marketing Site)

### 3. Configure AWS Environment Variables

After deployment starts, set these in the **API service** settings:

**Critical Variables (Set Immediately):**
```bash
AWS_ACCESS_KEY_ID=your_aws_access_key_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
```

**Optional Variables (Pre-configured):**
- `AWS_STORAGE_BUCKET_NAME=verityinspect-media`
- `AWS_S3_REGION_NAME=us-east-1`
- `DEMO_MODE=True`
- `ENABLE_AWS_REKOGNITION=True`

### 4. AWS S3 Setup

1. **Create S3 Bucket**
   ```bash
   # Bucket name: verityinspect-media
   # Region: us-east-1
   # Public access: Block all public access (we'll use presigned URLs)
   ```

2. **Create IAM User**
   - User name: `verityinspect-app`
   - Attach policy with these permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "s3:GetObject",
           "s3:PutObject",
           "s3:DeleteObject",
           "s3:ListBucket"
         ],
         "Resource": [
           "arn:aws:s3:::verityinspect-media",
           "arn:aws:s3:::verityinspect-media/*"
         ]
       },
       {
         "Effect": "Allow",
         "Action": [
           "rekognition:DetectProtectiveEquipment",
           "rekognition:DetectLabels",
           "rekognition:DetectFaces"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

3. **Generate Access Keys**
   - Save the Access Key ID and Secret Access Key
   - Add these to Render environment variables

### 5. Monitor Deployment

1. **Check Build Logs**
   - API service should build and migrate database
   - Static sites should build successfully

2. **Verify Services**
   - PostgreSQL: Should be running
   - Redis: Should be running
   - API: Should show green status
   - Celery: Should be processing
   - Web/Marketing: Should build and deploy

### 6. Test Deployment

1. **API Health Check**
   ```bash
   curl https://verityinspect-api.onrender.com/health/
   # Should return: {"status": "healthy"}
   ```

2. **Database Check**
   ```bash
   curl https://verityinspect-api.onrender.com/health/db/
   # Should return: {"status": "healthy"}
   ```

3. **Web Application**
   - Visit: `https://verityinspect-web.onrender.com`
   - Login with: `admin` / `demo123`

4. **Marketing Site**
   - Visit: `https://verityinspect-marketing.onrender.com`
   - Test ROI calculator

### 7. Subdomain Setup for Production

The application is now configured for subdomain architecture:

**Target URLs:**
- Marketing: `https://verityinspect.com`
- Web App: `https://app.verityinspect.com`  
- API: `https://api.verityinspect.com`

#### 7.1 Add Custom Domains in Render

For each service in Render dashboard:

1. **API Service** (`verityinspect-api`)
   - Go to Settings → Custom Domains
   - Add: `api.verityinspect.com`

2. **Web App Service** (`verityinspect-web`)
   - Go to Settings → Custom Domains  
   - Add: `app.verityinspect.com`

3. **Marketing Service** (`verityinspect-marketing`)
   - Go to Settings → Custom Domains
   - Add: `verityinspect.com` and `www.verityinspect.com`

#### 7.2 Configure DNS Records

Add these DNS records to your domain provider (Cloudflare, Namecheap, etc.):

```dns
Type    Name    Value                               TTL
A       @       76.76.19.61                        Auto (from Render)
CNAME   www     verityinspect-marketing.onrender.com  Auto
CNAME   app     verityinspect-web.onrender.com       Auto  
CNAME   api     verityinspect-api.onrender.com       Auto
```

**Note**: Replace `76.76.19.61` with the actual IP provided by Render for your marketing service.

#### 7.3 Environment Variables Update

The Django settings are already configured to support subdomains. No additional environment variables needed.

#### 7.4 Test Subdomain Setup

After DNS propagation (5-60 minutes):

```bash
# Test each subdomain
curl https://api.verityinspect.com/health/
curl -I https://app.verityinspect.com/
curl -I https://verityinspect.com/

# Test CORS between subdomains
curl -H "Origin: https://app.verityinspect.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://api.verityinspect.com/api/accounts/trial-signup/
```

#### 7.5 Trial Signup Flow

Once subdomains are active:

1. Visit `https://verityinspect.com`
2. Click "Start Free Trial" → redirects to `https://app.verityinspect.com/trial-signup`
3. Complete signup → API calls go to `https://api.verityinspect.com`
4. Success → redirects to `https://app.verityinspect.com/dashboard`

### 8. Production Configuration

1. **Scaling**
   - API: Upgrade to Professional ($25/month) for better performance
   - Database: Consider upgrading for production workloads
   - Redis: Starter plan is sufficient initially

2. **Monitoring**
   - Set up alerts for service failures
   - Monitor disk usage on database
   - Watch API response times

3. **Security**
   - Rotate AWS keys regularly
   - Monitor CloudTrail for AWS access
   - Review Render access logs

### 9. Troubleshooting

**Common Issues:**

1. **API Build Fails**
   - Check requirements.txt for missing dependencies
   - Verify Python version compatibility
   - Check Docker build logs

2. **Database Connection Errors**
   - Verify DATABASE_URL is set correctly
   - Check PostgreSQL service status
   - Ensure database is created

3. **Static Files Not Loading**
   - Check build command in render.yaml
   - Verify dist/ directory is created
   - Check static file paths

4. **Celery Worker Not Starting**
   - Verify Redis connection
   - Check worker logs for errors
   - Ensure proper command syntax

### 10. Post-Deployment Checklist

- [ ] All 5 services running (green status)
- [ ] API health check passing
- [ ] Database migrations completed
- [ ] Demo users created
- [ ] Web app login working
- [ ] Marketing site loading
- [ ] AWS S3 bucket created
- [ ] AWS credentials configured
- [ ] File upload working (if tested)
- [ ] Custom domains configured (if applicable)

### Service URLs

After successful deployment:
- **API**: https://verityinspect-api.onrender.com
- **Web App**: https://verityinspect-web.onrender.com
- **Marketing**: https://verityinspect-marketing.onrender.com
- **API Docs**: https://verityinspect-api.onrender.com/api/docs/

### Demo Credentials

- **Username**: `admin`
- **Password**: `demo123`
- **Role**: Administrator

Additional users: `manager` and `inspector` (same password)

---

**Need Help?**
- Check Render build logs for specific errors
- Review Django application logs in the API service
- Verify all environment variables are set correctly
- Ensure AWS permissions are configured properly