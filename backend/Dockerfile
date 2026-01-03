# =============================================================================
# BACKEND DOCKERFILE
# =============================================================================
# 
# WHAT IS A DOCKERFILE?
# A Dockerfile is a recipe for building a container image.
# Think of it as instructions for creating a mini-computer with your app.
#
# WHY USE DOCKER?
# - "Works on my machine" → Works everywhere
# - Easy deployment to cloud platforms
# - Consistent environment for all developers
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base image
# -----------------------------------------------------------------------------
# FROM = Start with this base image (pre-built Linux + Python)
# python:3.11-slim = Python 3.11 on a minimal Debian Linux
# "slim" = smaller image size, faster downloads
FROM python:3.11-slim

# -----------------------------------------------------------------------------
# Set environment variables
# -----------------------------------------------------------------------------
# PYTHONDONTWRITEBYTECODE = Don't create .pyc files (cleaner container)
# PYTHONUNBUFFERED = Print output immediately (better for logs)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# -----------------------------------------------------------------------------
# Set working directory
# -----------------------------------------------------------------------------
# WORKDIR = All following commands run from this directory
# Like doing "cd /app" at the start
WORKDIR /app

# -----------------------------------------------------------------------------
# Install system dependencies
# -----------------------------------------------------------------------------
# RUN = Execute a command during build
# apt-get update = Refresh package list
# gcc = C compiler (needed for some Python packages)
# --no-install-recommends = Don't install optional extras (smaller image)
# rm -rf /var/lib/apt/lists/* = Clean up to reduce image size
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# -----------------------------------------------------------------------------
# Install Python dependencies
# -----------------------------------------------------------------------------
# COPY = Copy files from your computer into the container
# We copy requirements.txt first (before other code) for better caching
# If requirements.txt hasn't changed, Docker reuses the cached layer
COPY requirements.txt .

# Install the Python packages
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# -----------------------------------------------------------------------------
# Copy application code
# -----------------------------------------------------------------------------
# Copy everything else into the container
COPY . .

# -----------------------------------------------------------------------------
# Expose port
# -----------------------------------------------------------------------------
# EXPOSE = Document which port the app uses (doesn't actually open it)
# The app will run on port 8000
EXPOSE 8000

# -----------------------------------------------------------------------------
# Run the application
# -----------------------------------------------------------------------------
# CMD = The command to run when the container starts
# uvicorn app.main:app = Start our FastAPI app
# --host 0.0.0.0 = Listen on all network interfaces (required in Docker)
# --port 8000 = Use port 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
