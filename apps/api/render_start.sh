#!/bin/bash
set -e

echo "Starting PeakOps API server..."

# Run any pending migrations on startup
python manage.py migrate --settings=peakops.settings --noinput

# Start Gunicorn server
exec gunicorn --bind 0.0.0.0:${PORT:-8000} \
    --workers ${WEB_WORKERS:-2} \
    --timeout ${WEB_TIMEOUT:-120} \
    --access-logfile - \
    --error-logfile - \
    peakops.wsgi:application