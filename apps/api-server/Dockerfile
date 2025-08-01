# ALTAMEDICA API Server - Production Docker Configuration
# Optimized multi-stage build for telemedicine API

# ===== BASE STAGE =====
FROM node:22-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    ffmpeg \
    imagemagick \
    postgresql-client \
    && rm -rf /var/cache/apk/*

# Create app user and group
RUN addgroup -g 1001 -S altamedica && \
    adduser -S altamedica -u 1001 -G altamedica

# Set working directory
WORKDIR /app

# Switch to app user
USER altamedica

# ===== DEPENDENCIES STAGE =====
FROM base AS deps

# Copy package files
COPY --chown=altamedica:altamedica package*.json ./
COPY --chown=altamedica:altamedica yarn.lock* ./

# Install production dependencies only
RUN npm ci --only=production --frozen-lockfile && \
    npm cache clean --force

# ===== BUILD STAGE =====
FROM base AS build

# Copy package files
COPY --chown=altamedica:altamedica package*.json ./
COPY --chown=altamedica:altamedica yarn.lock* ./

# Install all dependencies (including dev dependencies)
RUN npm ci --frozen-lockfile

# Copy source code
COPY --chown=altamedica:altamedica . .

# Build the application
RUN npm run build || npm run build:prod || echo "No build script found"

# ===== RUNTIME STAGE =====
FROM base AS runtime

# Copy production dependencies
COPY --from=deps --chown=altamedica:altamedica /app/node_modules ./node_modules

# Copy built application
COPY --from=build --chown=altamedica:altamedica /app/.next ./.next 2>/dev/null || true
COPY --from=build --chown=altamedica:altamedica /app/dist ./dist 2>/dev/null || true
COPY --from=build --chown=altamedica:altamedica /app/build ./build 2>/dev/null || true

# Copy essential files
COPY --from=build --chown=altamedica:altamedica /app/package.json ./package.json
COPY --from=build --chown=altamedica:altamedica /app/public ./public 2>/dev/null || true
COPY --from=build --chown=altamedica:altamedica /app/src ./src 2>/dev/null || true
COPY --from=build --chown=altamedica:altamedica /app/pages ./pages 2>/dev/null || true
COPY --from=build --chown=altamedica:altamedica /app/app ./app 2>/dev/null || true

# Create necessary directories
RUN mkdir -p /app/logs /app/uploads /app/temp && \
    chown -R altamedica:altamedica /app/logs /app/uploads /app/temp

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV NEXT_TELEMETRY_DISABLED=1
ENV NPM_CONFIG_CACHE=/tmp/.npm

# Expose ports
EXPOSE 3001 8080 10000-10100/udp

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || curl -f http://localhost:3001/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Default command - try multiple common start scripts
CMD ["sh", "-c", "npm start || npm run start:prod || npm run serve || node server.js || node app.js || node index.js || node src/index.js"]