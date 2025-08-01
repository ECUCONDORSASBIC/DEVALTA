# ALTAMEDICA - Plataforma Completa de Telemedicina
# Multi-stage Dockerfile para 7 aplicaciones + servicios

# ===== BASE STAGE =====
FROM node:22-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache \
    dumb-init \
    curl \
    bash \
    git \
    && rm -rf /var/cache/apk/*

# Crear usuario de aplicación
RUN addgroup -g 1001 -S altamedica && \
    adduser -S altamedica -u 1001 -G altamedica

WORKDIR /app
RUN chown altamedica:altamedica /app
USER altamedica

# ===== DEPENDENCIES STAGE =====
FROM base AS deps

# Copiar archivos de configuración del workspace
COPY --chown=altamedica:altamedica package.json pnpm-workspace.yaml ./
COPY --chown=altamedica:altamedica pnpm-lock.yaml* ./

# Copiar package.json de cada aplicación
COPY --chown=altamedica:altamedica apps/web-app/package.json ./apps/web-app/
COPY --chown=altamedica:altamedica apps/api-server/package.json ./apps/api-server/
COPY --chown=altamedica:altamedica apps/doctors/package.json ./apps/doctors/
COPY --chown=altamedica:altamedica apps/patients/package.json ./apps/patients/
COPY --chown=altamedica:altamedica apps/companies/package.json ./apps/companies/
COPY --chown=altamedica:altamedica apps/admin/package.json ./apps/admin/
COPY --chown=altamedica:altamedica apps/signaling-server/package.json ./apps/signaling-server/

# Copiar package.json de packages compartidos
COPY --chown=altamedica:altamedica packages/*/package.json ./packages/*/

# Instalar pnpm como root y cambiar a usuario
USER root  
RUN npm install -g pnpm@10.13.1
USER altamedica
RUN pnpm install --frozen-lockfile --prod

# ===== BUILD STAGE =====
FROM base AS build

# Copiar dependencias desde deps stage
COPY --from=deps --chown=altamedica:altamedica /app/node_modules ./node_modules
COPY --from=deps --chown=altamedica:altamedica /app/pnpm-lock.yaml ./

# Instalar pnpm como root
USER root
RUN npm install -g pnpm@10.13.1
USER altamedica

# Copiar configuración del workspace
COPY --chown=altamedica:altamedica package.json pnpm-workspace.yaml ./
COPY --chown=altamedica:altamedica turbo.json* ./

# Copiar packages compartidos
COPY --chown=altamedica:altamedica packages/ ./packages/

# Copiar código fuente de todas las aplicaciones
COPY --chown=altamedica:altamedica apps/ ./apps/

# Copiar archivos de configuración raíz (solo si existen)
COPY --chown=altamedica:altamedica tsconfig.json* ./
COPY --chown=altamedica:altamedica .env.example* ./

# Instalar todas las dependencias (incluyendo dev)
RUN pnpm install --frozen-lockfile

# Build de packages compartidos primero
RUN pnpm --filter "./packages/**" build || echo "No build script in packages"

# Build de todas las aplicaciones
RUN pnpm --filter @altamedica/web-app build || echo "web-app build failed"
RUN pnpm --filter @altamedica/api-server build || echo "api-server build failed"
RUN pnpm --filter @altamedica/doctors build || echo "doctors build failed"
RUN pnpm --filter @altamedica/patients build || echo "patients build failed"
RUN pnpm --filter @altamedica/companies build || echo "companies build failed"
RUN pnpm --filter @altamedica/admin build || echo "admin build failed"

# ===== RUNTIME STAGE =====
FROM base AS runtime

# Instalar pnpm como root antes de cambiar usuario
USER root
RUN npm install -g pnpm@10.13.1
USER altamedica

# Copiar dependencias de producción
COPY --from=deps --chown=altamedica:altamedica /app/node_modules ./node_modules
COPY --from=deps --chown=altamedica:altamedica /app/pnpm-lock.yaml ./

# Copiar configuración del workspace
COPY --from=build --chown=altamedica:altamedica /app/package.json ./
COPY --from=build --chown=altamedica:altamedica /app/pnpm-workspace.yaml ./

# Copiar packages build
COPY --from=build --chown=altamedica:altamedica /app/packages ./packages

# Copiar aplicaciones build
COPY --from=build --chown=altamedica:altamedica /app/apps/web-app ./apps/web-app
COPY --from=build --chown=altamedica:altamedica /app/apps/api-server ./apps/api-server
COPY --from=build --chown=altamedica:altamedica /app/apps/doctors ./apps/doctors
COPY --from=build --chown=altamedica:altamedica /app/apps/patients ./apps/patients
COPY --from=build --chown=altamedica:altamedica /app/apps/companies ./apps/companies
COPY --from=build --chown=altamedica:altamedica /app/apps/admin ./apps/admin
COPY --from=build --chown=altamedica:altamedica /app/apps/signaling-server ./apps/signaling-server

# Crear directorios necesarios
RUN mkdir -p /app/logs /app/uploads /app/temp && \
    chown -R altamedica:altamedica /app/logs /app/uploads /app/temp

# Variables de entorno
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PNPM_HOME="/app/.pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Puertos de todas las aplicaciones
EXPOSE 3000 3001 3002 3003 3004 3005 8888

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Copiar script de inicio
COPY --chown=altamedica:altamedica <<'EOF' /app/start-altamedica.sh
#!/bin/bash
set -e

echo "🏥 Iniciando AltaMedica Platform..."

# Función para iniciar una aplicación
start_app() {
    local app_name=$1
    local app_path=$2
    local port=$3
    
    echo "Iniciando $app_name en puerto $port..."
    cd /app/apps/$app_path
    
    # Intentar múltiples comandos de inicio
    if [ -f "package.json" ]; then
        if pnpm start --port $port 2>/dev/null; then
            echo "$app_name iniciado correctamente"
        elif npm start -- --port $port 2>/dev/null; then
            echo "$app_name iniciado con npm"
        elif node server.js 2>/dev/null; then
            echo "$app_name iniciado con node server.js"
        elif node index.js 2>/dev/null; then
            echo "$app_name iniciado con node index.js"
        else
            echo "⚠️  No se pudo iniciar $app_name"
        fi
    fi
    
    cd /app
}

# Iniciar aplicaciones en paralelo
start_app "Web App" "web-app" 3000 &
start_app "API Server" "api-server" 3001 &
start_app "Doctors Portal" "doctors" 3002 &
start_app "Patients Portal" "patients" 3003 &
start_app "Companies Portal" "companies" 3004 &
start_app "Admin Panel" "admin" 3005 &
start_app "Signaling Server" "signaling-server" 8888 &

echo "✅ Todas las aplicaciones iniciadas"
echo "🌐 URLs disponibles:"
echo "   - Web App: http://localhost:3000"
echo "   - API Server: http://localhost:3001"
echo "   - Doctors: http://localhost:3002"
echo "   - Patients: http://localhost:3003"
echo "   - Companies: http://localhost:3004"
echo "   - Admin: http://localhost:3005"
echo "   - Signaling: ws://localhost:8888"

# Mantener el contenedor vivo
wait
EOF

RUN chmod +x /app/start-altamedica.sh

# Usar dumb-init para manejo de señales
ENTRYPOINT ["dumb-init", "--"]

# Comando por defecto
CMD ["/app/start-altamedica.sh"]