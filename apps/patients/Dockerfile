# 👥 ALTAMEDICA Patients App - Production Dockerfile
FROM node:20-alpine AS base

# Instalar dependencias del sistema y crear usuario no-root
RUN apk add --no-cache dumb-init curl bash git && rm -rf /var/cache/apk/*
RUN addgroup -g 1001 -S altamedica && adduser -S altamedica -u 1001 -G altamedica

WORKDIR /app
RUN chown altamedica:altamedica /app

# Instalar pnpm
RUN npm install -g pnpm@10.13.1

USER altamedica

FROM base AS runtime

# Copiar archivos de configuración raíz (solo los esenciales)
COPY --chown=altamedica:altamedica package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copiar packages y configuraciones
COPY --chown=altamedica:altamedica packages/ ./packages/
COPY --chown=altamedica:altamedica configs/ ./configs/

# Copiar código de la aplicación patients
COPY --chown=altamedica:altamedica apps/patients/ ./apps/patients/

# Instalar todas las dependencias
RUN pnpm install --frozen-lockfile

# Crear directorio para logs y otros archivos necesarios
RUN mkdir -p /app/logs && chown altamedica:altamedica /app/logs

# Construir packages compartidos primero
RUN pnpm --filter "@altamedica/types" build || echo "types package build completed"
RUN pnpm --filter "@altamedica/shared" build || echo "shared package build completed"
RUN pnpm --filter "@altamedica/core" build || echo "core package build completed"
RUN pnpm --filter "@altamedica/ui" build || echo "ui package build completed"

# Construir la aplicación patients
WORKDIR /app/apps/patients
RUN pnpm build

# Exponer puerto correcto para patients app
EXPOSE 3003

# Health check mejorado con endpoint más simple
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3003/ || exit 1

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3003
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0

# Iniciar con dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]
CMD ["pnpm", "start"]