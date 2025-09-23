# AI Video Inspection Platform

An AI-powered video inspection platform for brand standards compliance. Managers capture walkthrough videos, and AI checks PPE, blocked exits, trash overflow, uniforms, and menu boards to produce scorecards with annotated frames and action items.

## Features

- **Inspection Mode**: Corporate official record retained
- **Coaching Mode**: Ephemeral analysis with thumbnails only
- **Multi-tenant**: Brand → Stores → Users
- **RBAC**: GM, INSPECTOR, ADMIN roles
- **Configurable retention** per mode

## Tech Stack

### Backend
- Python 3.11
- Django 5 + Django REST Framework
- JWT Authentication (djangorestframework-simplejwt)
- PostgreSQL
- Celery + Redis
- AWS S3 (django-storages, boto3)
- FFmpeg for frame sampling
- OpenCV (optional face blur)

### AI Services
- AWS Rekognition (PPE detection)
- YOLOv8 (Ultralytics) - placeholder
- PaddleOCR/EasyOCR - placeholder

### Frontend
- React 18 + TypeScript + Vite
- React Router
- Tailwind CSS
- Radix UI components

### Infrastructure
- Docker Compose
- GitHub Actions CI

## Quick Start

1. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

2. Start with Docker Compose:
   ```bash
   docker-compose up --build
   ```

3. Run migrations:
   ```bash
   docker-compose exec api python manage.py migrate
   ```

4. Create superuser:
   ```bash
   docker-compose exec api python manage.py createsuperuser
   ```

5. Load seed data:
   ```bash
   docker-compose exec api python manage.py loaddata fixtures/initial_data.json
   ```

## Development

### Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Tests
```bash
# Backend
docker-compose exec api python manage.py test

# Frontend
cd frontend && npm test
```

## API Documentation

Visit `/api/docs/` for Swagger documentation when running locally.