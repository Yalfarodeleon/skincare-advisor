# =============================================================================
# FRONTEND DOCKERFILE (Multi-stage build)
# =============================================================================
#
# WHAT IS A MULTI-STAGE BUILD?
# We use two stages:
# 1. Build stage: Install Node, npm, build the React app
# 2. Production stage: Just serve the static files with nginx
#
# This makes the final image MUCH smaller (nginx is tiny vs Node.js)
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build the React app
# -----------------------------------------------------------------------------
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the production app
# This creates a "dist" folder with static HTML/CSS/JS
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Serve with nginx
# -----------------------------------------------------------------------------
FROM nginx:alpine

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built app from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Document the port
EXPOSE 80

# nginx runs automatically when container starts
CMD ["nginx", "-g", "daemon off;"]
