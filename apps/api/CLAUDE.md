# Claude Code Configuration

This file contains configuration for Claude Code to understand the project structure and run common commands.

## Project Structure

This is an AI video inspection platform with:
- **Backend**: Django REST API with Celery for async processing
- **Frontend**: React 18 + TypeScript + Vite
- **Database**: PostgreSQL
- **Cache/Queue**: Redis
- **AI Services**: AWS Rekognition + placeholder YOLO/OCR services

## Common Commands

### Development Setup
```bash
# Copy environment variables
cp .env.example .env

# Start with Docker Compose
docker-compose up --build

# Run migrations
docker-compose exec api python manage.py migrate

# Create demo users
docker-compose exec api python manage.py create_demo_users

# Load initial data
docker-compose exec api python manage.py loaddata fixtures/initial_data.json
```

### Backend Development
```bash
cd backend
pip install -r requirements.txt
python manage.py runserver
python manage.py test
python manage.py makemigrations
python manage.py migrate
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
npm test
npm run build
npm run lint
```

### Testing
```bash
# Backend tests
cd backend && python manage.py test

# Frontend tests
cd frontend && npm test

# Run all tests in CI
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## Default Login Credentials

After running `create_demo_users`:
- **admin** / demo123 (Administrator)
- **manager** / demo123 (General Manager)  
- **inspector** / demo123 (Inspector)

## Environment Variables

Key environment variables in `.env`:
- `SECRET_KEY`: Django secret key
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: AWS credentials for Rekognition
- `AWS_STORAGE_BUCKET_NAME`: S3 bucket for file storage

## Architecture

### Models
- **User**: Custom user model with roles (ADMIN, GM, INSPECTOR)
- **Brand**: Multi-tenant brand configuration
- **Store**: Individual store locations
- **Video**: Uploaded videos with processing status
- **VideoFrame**: Extracted frames from videos
- **Inspection**: AI analysis results with scores
- **Finding**: Individual compliance issues found
- **ActionItem**: Tasks generated from findings

### Key Features
- JWT authentication
- Video upload and processing with FFmpeg
- Frame extraction for AI analysis
- AWS Rekognition for PPE detection
- Placeholder YOLO and OCR services
- Configurable retention policies
- Inspection vs Coaching modes
- Role-based access control

### API Endpoints
- `/api/auth/` - Authentication
- `/api/brands/` - Brand management
- `/api/videos/` - Video upload and management
- `/api/inspections/` - Inspection results
- `/api/docs/` - Swagger documentation