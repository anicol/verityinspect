#!/bin/bash
set -e

echo "Starting VerityInspect API server..."

# Run any pending migrations on startup
python manage.py migrate --settings=verityinspect.settings --noinput

# Start Gunicorn server
exec gunicorn --bind 0.0.0.0:${PORT:-8000} \
    --workers ${WEB_WORKERS:-2} \
    --timeout ${WEB_TIMEOUT:-120} \
    --access-logfile - \
    --error-logfile - \
    verityinspect.wsgi:application