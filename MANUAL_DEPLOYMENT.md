# VerityInspect Manual Deployment Guide (Alternative to Blueprint)

If the Blueprint deployment has issues, follow this manual step-by-step approach.

## Order of Deployment (Important!)

Deploy in this exact order to ensure services can connect properly:

### 1. PostgreSQL Database (First)

1. **Go to Render Dashboard** → **New** → **PostgreSQL**
2. **Configure:**
   - Name: `verityinspect-db`
   - Database Name: `verityinspect`
   - User: `verityinspect`
   - Plan: Starter ($7/month)
3. **Wait for deployment** to complete
4. **Note the DATABASE_URL** from the service page

### 2. Redis Cache (Second)

1. **New** → **Redis**
2. **Configure:**
   - Name: `verityinspect-redis`
   - Plan: Starter ($7/month)
   - Max Memory Policy: `allkeys-lru`
3. **Wait for deployment** to complete
4. **Note the REDIS_URL** from the service page

### 3. Django API (Third)

1. **New** → **Web Service**
2. **Configure:**
   - **Connect Repository:** `anicol/verityinspect`
   - **Branch:** `main`
   - **Root Directory:** `apps/api`
   - **Runtime:** `Docker`
   - **Plan:** Starter ($7/month)

3. **Build Settings:**
   - **Dockerfile Path:** `./Dockerfile`

4. **Environment Variables:** (Set these immediately)
   ```bash
   SECRET_KEY                  [Auto-generate]
   DEBUG                      False
   ALLOWED_HOSTS              verityinspect-api.onrender.com
   DATABASE_URL               [Copy from step 1]
   REDIS_URL                  [Copy from step 2]
   CELERY_BROKER_URL          [Same as REDIS_URL]
   CELERY_RESULT_BACKEND      [Same as REDIS_URL]
   
   # AWS (Required - Get from AWS Console)
   AWS_ACCESS_KEY_ID          your_aws_access_key
   AWS_SECRET_ACCESS_KEY      your_aws_secret_key
   AWS_STORAGE_BUCKET_NAME    verityinspect-media
   AWS_S3_REGION_NAME         us-east-1
   
   # Application Settings
   JWT_SECRET_KEY             [Auto-generate]
   MAX_VIDEO_SIZE_MB          100
   SUPPORTED_VIDEO_FORMATS    mp4,mov,avi
   INSPECTION_MODE_RETENTION_DAYS  365
   COACHING_MODE_RETENTION_DAYS    7
   ENABLE_AWS_REKOGNITION     True
   DEMO_MODE                  True
   FACE_BLUR                  False
   FRAME_SAMPLING_FPS         2.5
   MAX_FRAMES_PER_VIDEO       20
   ```

5. **Deploy** and wait for build to complete
6. **Verify:** Visit `https://your-api-url.onrender.com/health/`

### 4. Celery Worker (Fourth)

1. **New** → **Background Worker**
2. **Configure:**
   - **Connect Repository:** `anicol/verityinspect`
   - **Branch:** `main`
   - **Root Directory:** `apps/api`
   - **Runtime:** `Docker`
   - **Plan:** Starter ($7/month)

3. **Build Settings:**
   - **Dockerfile Path:** `./Dockerfile`
   - **Start Command:** `celery -A verityinspect worker -l info`

4. **Environment Variables:** (Copy from API service)
   ```bash
   SECRET_KEY                  [Copy from API]
   DATABASE_URL               [Copy from step 1]
   REDIS_URL                  [Copy from step 2]
   CELERY_BROKER_URL          [Same as REDIS_URL]
   CELERY_RESULT_BACKEND      [Same as REDIS_URL]
   AWS_ACCESS_KEY_ID          [Copy from API]
   AWS_SECRET_ACCESS_KEY      [Copy from API]
   AWS_STORAGE_BUCKET_NAME    verityinspect-media
   AWS_S3_REGION_NAME         us-east-1
   ```

5. **Deploy** and monitor logs for successful connection

### 5. React Web App (Fifth)

1. **New** → **Static Site**
2. **Configure:**
   - **Connect Repository:** `anicol/verityinspect`
   - **Branch:** `main`
   - **Root Directory:** Leave empty (use monorepo root)

3. **Build Settings:**
   - **Build Command:** 
     ```bash
     cd apps/web && npm install && npm run build
     ```
   - **Publish Directory:** `apps/web/dist`

4. **Environment Variables:**
   ```bash
   VITE_API_URL    https://your-api-url.onrender.com
   ```
   (Replace `your-api-url` with actual API service URL)

5. **Deploy** and test the web application

### 6. Marketing Site (Sixth)

1. **New** → **Static Site**
2. **Configure:**
   - **Connect Repository:** `anicol/verityinspect`
   - **Branch:** `main`
   - **Root Directory:** Leave empty (use monorepo root)

3. **Build Settings:**
   - **Build Command:** 
     ```bash
     cd apps/marketing && npm install && npm run build
     ```
   - **Publish Directory:** `apps/marketing/dist`

4. **Advanced Settings:**
   - **Headers:** Add for SPA routing:
     ```
     /*    /index.html   200
     ```

5. **Deploy** and test the marketing site

## Verification Steps

### 1. Test All Services

Run this command after all services are deployed:
```bash
# Update URLs with your actual Render service URLs
./scripts/deploy_check.sh
```

### 2. Manual Health Checks

```bash
# API Health
curl https://your-api-url.onrender.com/health/

# Database Connection
curl https://your-api-url.onrender.com/health/db/

# Redis Connection  
curl https://your-api-url.onrender.com/health/redis/

# Test Login
curl -X POST https://your-api-url.onrender.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"demo123"}'
```

### 3. Test Web Interface

1. **Visit Web App**: `https://your-web-url.onrender.com`
2. **Login** with: `admin` / `demo123`
3. **Check Dashboard** loads properly
4. **Test Navigation** between pages

### 4. Test Marketing Site

1. **Visit Marketing**: `https://your-marketing-url.onrender.com`
2. **Test ROI Calculator**
3. **Check Privacy Page**
4. **Verify Navigation**

## Troubleshooting

### API Service Issues

1. **Build Fails:**
   - Check that Docker builds locally first
   - Verify requirements.txt is complete
   - Check build logs for specific errors

2. **Database Connection:**
   - Verify DATABASE_URL is set correctly
   - Ensure PostgreSQL service is running
   - Check for typos in connection string

3. **Static Files:**
   - Verify collectstatic runs during build
   - Check STATIC_ROOT and STATIC_URL settings

### Celery Worker Issues

1. **Won't Start:**
   - Check Redis connection
   - Verify CELERY_BROKER_URL is correct
   - Check worker logs for errors

2. **Tasks Not Processing:**
   - Verify Redis is accessible
   - Check for task routing issues
   - Monitor worker logs

### Frontend Issues

1. **Build Fails:**
   - Check Node.js version compatibility
   - Verify package.json dependencies
   - Check for TypeScript errors

2. **API Connection:**
   - Verify VITE_API_URL is correct
   - Check CORS settings in Django
   - Test API endpoints manually

### Static Site Routing

1. **404 on Refresh:**
   - Add redirect rules for SPA
   - Check publish directory is correct

## Service URLs Template

After deployment, update your documentation with actual URLs:

```bash
# Replace these with your actual Render service URLs
API_URL=https://verityinspect-api-xxxx.onrender.com
WEB_URL=https://verityinspect-web-xxxx.onrender.com  
MARKETING_URL=https://verityinspect-marketing-xxxx.onrender.com
```

## Cost Estimate

Monthly cost for all services on Starter plans:
- PostgreSQL: $7/month
- Redis: $7/month  
- API Web Service: $7/month
- Celery Worker: $7/month
- React Web App: Free (Static)
- Marketing Site: Free (Static)

**Total: ~$28/month** for full production stack

## Next Steps

1. **Custom Domains** (Optional)
2. **SSL Certificates** (Automatic with custom domains)
3. **Monitoring Setup**
4. **Production Scaling**
5. **Backup Strategy**

---

This manual approach gives you more control over each service and makes debugging easier if issues arise.