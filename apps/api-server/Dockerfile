# 🏥 ALTAMEDICA API Server - Production Dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@8

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY apps/api-server/package.json ./apps/api-server/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build packages
RUN pnpm --filter "@altamedica/*" build

# Production stage
FROM node:20-alpine AS production

RUN npm install -g pnpm@8

WORKDIR /app

# Copy built packages and app
COPY --from=base /app/packages/ ./packages/
COPY --from=base /app/node_modules/ ./node_modules/
COPY --from=base /app/apps/api-server/ ./apps/api-server/

# Copy source code
COPY apps/api-server/src/ ./apps/api-server/src/
COPY apps/api-server/public/ ./apps/api-server/public/
COPY apps/api-server/next.config.ts ./apps/api-server/
COPY apps/api-server/tailwind.config.ts ./apps/api-server/
COPY apps/api-server/tsconfig.json ./apps/api-server/

# Build the application
WORKDIR /app/apps/api-server
RUN pnpm build

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/api/v1/health || exit 1

# Start the application
CMD ["pnpm", "start"]
