FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libpq-dev \
    gcc \
    g++ \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgl1-mesa-dri \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Add Gunicorn for production
RUN pip install gunicorn==21.2.0

# Copy project
COPY . .

# Make scripts executable
RUN chmod +x render_build.sh render_start.sh

# Collect static files
RUN python manage.py collectstatic --noinput --settings=verityinspect.settings

# Expose port
EXPOSE $PORT

# Use the start script
CMD ["./render_start.sh"]