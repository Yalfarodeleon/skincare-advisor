# =============================================================================
# MAKEFILE
# =============================================================================
#
# WHAT IS A MAKEFILE?
# A file that defines shortcuts for common commands.
# Instead of typing long docker commands, you type: make up
#
# USAGE:
#   make help     - Show all available commands
#   make up       - Start everything with Docker
#   make down     - Stop everything
#   make logs     - View logs
# =============================================================================

.PHONY: help up down build logs clean dev-backend dev-frontend test

# Default target: show help
help:
	@echo "MixMyRoutine - Available Commands"
	@echo "================================="
	@echo ""
	@echo "Docker Commands:"
	@echo "  make up        - Start all services (docker-compose up)"
	@echo "  make down      - Stop all services"
	@echo "  make build     - Rebuild all images"
	@echo "  make logs      - View logs (follow mode)"
	@echo "  make clean     - Remove all containers and images"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev-backend   - Run backend locally (no Docker)"
	@echo "  make dev-frontend  - Run frontend locally (no Docker)"
	@echo ""
	@echo "Testing:"
	@echo "  make test      - Run all tests"

# ---------------------------------------------------------------------------
# DOCKER COMMANDS
# ---------------------------------------------------------------------------

# Start all services
up:
	docker-compose up --build

# Start in detached mode (background)
up-detached:
	docker-compose up --build -d

# Stop all services
down:
	docker-compose down

# Rebuild images without cache
build:
	docker-compose build --no-cache

# View logs
logs:
	docker-compose logs -f

# View logs for specific service
logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

# Remove everything (containers, images, volumes)
clean:
	docker-compose down --rmi all --volumes --remove-orphans

# ---------------------------------------------------------------------------
# DEVELOPMENT COMMANDS (No Docker)
# ---------------------------------------------------------------------------

# Run backend locally
dev-backend:
	cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# Run frontend locally
dev-frontend:
	cd frontend && npm run dev

# ---------------------------------------------------------------------------
# TESTING
# ---------------------------------------------------------------------------

# Run backend tests
test:
	cd backend && source venv/bin/activate && pytest -v

# Run tests in Docker
test-docker:
	docker-compose exec backend pytest -v
