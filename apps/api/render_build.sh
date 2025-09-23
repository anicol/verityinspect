#!/bin/bash
set -e

echo "Installing Python dependencies..."
pip install --no-cache-dir -r requirements.txt

echo "Collecting static files..."
python manage.py collectstatic --noinput --settings=verityinspect.settings

echo "Running database migrations..."
python manage.py migrate --settings=verityinspect.settings

echo "Creating demo users..."
python manage.py create_demo_users --settings=verityinspect.settings || echo "Demo users may already exist"

echo "Loading initial data..."
python manage.py loaddata fixtures/initial_data.json --settings=verityinspect.settings || echo "Initial data may already exist"

echo "Build completed successfully!"