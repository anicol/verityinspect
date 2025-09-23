.PHONY: help dev test build clean seed fmt api-shell api-migrate api-test web-dev marketing-dev

# Default target
help:
	@echo "InspectAI Development Commands"
	@echo ""
	@echo "Setup & Development:"
	@echo "  make dev          - Start all services in development mode"
	@echo "  make api-dev      - Start only API services (db, redis, api, celery)"
	@echo "  make web-dev      - Start web app in development mode"
	@echo "  make marketing-dev - Start marketing site in development mode"
	@echo ""
	@echo "Database & Setup:"
	@echo "  make api-migrate  - Run Django migrations"
	@echo "  make seed         - Load initial seed data"
	@echo "  make api-shell    - Open Django shell"
	@echo ""
	@echo "Testing:"
	@echo "  make test         - Run all tests"
	@echo "  make api-test     - Run backend tests"
	@echo "  make web-test     - Run frontend tests"
	@echo ""
	@echo "Building:"
	@echo "  make build        - Build all services"
	@echo "  make fmt          - Format code"
	@echo "  make clean        - Clean up containers and volumes"

# Development
dev:
	docker-compose up --build

api-dev:
	docker-compose up --build db redis api celery celery-beat

web-dev:
	cd apps/web && npm run dev

marketing-dev:
	cd apps/marketing && npm run dev

# Database operations
api-migrate:
	docker-compose exec api python manage.py migrate

api-makemigrations:
	docker-compose exec api python manage.py makemigrations

seed:
	docker-compose exec api python manage.py create_demo_users
	docker-compose exec api python manage.py loaddata fixtures/initial_data.json

api-shell:
	docker-compose exec api python manage.py shell

# Testing
test: api-test web-test

api-test:
	docker-compose exec api python manage.py test

web-test:
	cd apps/web && npm test

marketing-test:
	cd apps/marketing && npm test

# Building
build:
	docker-compose build

# Code formatting
fmt:
	cd apps/api && black . && isort .
	cd apps/web && npm run lint --fix
	cd apps/marketing && npm run lint --fix

# Cleanup
clean:
	docker-compose down -v
	docker system prune -f

# Production
prod-build:
	docker-compose -f docker-compose.prod.yml build

prod-up:
	docker-compose -f docker-compose.prod.yml up -d

# Shared package
shared-build:
	cd packages/shared && npm run build

shared-generate:
	cd packages/shared && npm run generate

# Install dependencies
install:
	cd apps/web && npm install
	cd apps/marketing && npm install
	cd packages/shared && npm install

# Health check
health:
	curl -f http://localhost:8000/healthz || exit 1