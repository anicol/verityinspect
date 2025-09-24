import os
from pathlib import Path
from datetime import timedelta
from decouple import config
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-me')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1,0.0.0.0').split(',')

# Production security settings
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'

DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'storages',
    'django_celery_beat',
    'drf_spectacular',
    'django_filters',
]

LOCAL_APPS = [
    'core',
    'accounts',
    'brands',
    'uploads',
    'inspections',
    'videos',
    'ai_services',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'verityinspect.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'verityinspect.wsgi.application'

DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL', default='sqlite:///db.sqlite3')
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'accounts.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=config('JWT_ACCESS_TOKEN_LIFETIME', default=60, cast=int)),
    'REFRESH_TOKEN_LIFETIME': timedelta(minutes=config('JWT_REFRESH_TOKEN_LIFETIME', default=1440, cast=int)),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'VerityInspect API',
    'DESCRIPTION': 'API for AI-powered video inspection platform',
    'VERSION': '1.0.0',
}

# CORS settings for production
if DEBUG:
    CORS_ALLOWED_ORIGINS = [
        'http://localhost:3000',
        'http://localhost:5174',
    ]
else:
    CORS_ALLOWED_ORIGINS = [
        'https://verityinspect-web.onrender.com',
        'https://verityinspect-marketing.onrender.com',
        'https://verityinspect.com',
        'https://www.verityinspect.com',
    ]

CORS_ALLOW_CREDENTIALS = True

CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Celery Beat Schedule for automated tasks
CELERY_BEAT_SCHEDULE = {
    # Daily retention cleanup at 2 AM
    'cleanup-expired-uploads': {
        'task': 'uploads.tasks.cleanup_expired_uploads_task',
        'schedule': 60 * 60 * 24,  # Every 24 hours
        'options': {'queue': 'maintenance'}
    },
    # Hourly temp file cleanup  
    'cleanup-temp-files': {
        'task': 'uploads.tasks.cleanup_temp_files_task',
        'schedule': 60 * 60,  # Every hour
        'options': {'queue': 'maintenance'}
    },
}

AWS_ACCESS_KEY_ID = config('AWS_ACCESS_KEY_ID', default='')
AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY', default='')
AWS_STORAGE_BUCKET_NAME = config('AWS_STORAGE_BUCKET_NAME', default='')
AWS_S3_REGION_NAME = config('AWS_S3_REGION_NAME', default='us-east-1')
AWS_S3_CUSTOM_DOMAIN = config('AWS_S3_CUSTOM_DOMAIN', default='')
AWS_DEFAULT_ACL = None
AWS_S3_OBJECT_PARAMETERS = {
    'CacheControl': 'max-age=86400',
}

if AWS_STORAGE_BUCKET_NAME:
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

MAX_VIDEO_SIZE_MB = config('MAX_VIDEO_SIZE_MB', default=100, cast=int)
SUPPORTED_VIDEO_FORMATS = config('SUPPORTED_VIDEO_FORMATS', default='mp4,mov,avi').split(',')

INSPECTION_MODE_RETENTION_DAYS = config('INSPECTION_MODE_RETENTION_DAYS', default=365, cast=int)
COACHING_MODE_RETENTION_DAYS = config('COACHING_MODE_RETENTION_DAYS', default=7, cast=int)

ENABLE_AWS_REKOGNITION = config('ENABLE_AWS_REKOGNITION', default=True, cast=bool)
ENABLE_YOLO_DETECTION = config('ENABLE_YOLO_DETECTION', default=False, cast=bool)
ENABLE_OCR_DETECTION = config('ENABLE_OCR_DETECTION', default=False, cast=bool)

# Demo and Privacy Settings
DEMO_MODE = config('DEMO_MODE', default=True, cast=bool)
FACE_BLUR = config('FACE_BLUR', default=False, cast=bool)

# Frame sampling settings (for FFmpeg)
FRAME_SAMPLING_FPS = config('FRAME_SAMPLING_FPS', default=2.5, cast=float)
MAX_FRAMES_PER_VIDEO = config('MAX_FRAMES_PER_VIDEO', default=20, cast=int)

# Webhook settings
WEBHOOK_TIMEOUT_SECONDS = config('WEBHOOK_TIMEOUT_SECONDS', default=30, cast=int)
WEBHOOK_RETRY_ATTEMPTS = config('WEBHOOK_RETRY_ATTEMPTS', default=3, cast=int)