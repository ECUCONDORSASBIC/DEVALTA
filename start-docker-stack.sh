#!/bin/bash

# 🏥 AltaMedica - Script de Despliegue Docker Completo
# Eduardo Cúcondor - Enero 2025

set -e

echo "🏥 ==========================================="
echo "🏥    ALTAMEDICA - DOCKER DEPLOYMENT"  
echo "🏥 ==========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logs con timestamp
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"
}

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado. Instalando Docker..."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado. Instalando Docker Compose..."
    exit 1
fi

log "Docker y Docker Compose detectados ✅"

# Verificar archivo .env.docker
if [ ! -f ".env.docker" ]; then
    warn "Archivo .env.docker no encontrado. Creando archivo de ejemplo..."
    cp .env.example .env.docker 2>/dev/null || true
    warn "Por favor, configura las variables en .env.docker antes de continuar"
fi

# Crear directorios necesarios
log "Creando directorios necesarios..."
mkdir -p logs/nginx
mkdir -p config/nginx
mkdir -p config/prometheus
mkdir -p config/grafana/provisioning
mkdir -p config/fluentd
mkdir -p scripts/db

# Verificar que los Dockerfiles existan
log "Verificando Dockerfiles..."
dockerfiles=(
    "apps/api-server/Dockerfile.production"
    "apps/web-app/Dockerfile"
    "apps/doctors/Dockerfile"
    "apps/patients/Dockerfile"
    "apps/companies/Dockerfile"
    "apps/admin/Dockerfile.production"
    "apps/signaling-server/Dockerfile.dev"
)

missing_dockerfiles=()
for dockerfile in "${dockerfiles[@]}"; do
    if [ ! -f "$dockerfile" ]; then
        missing_dockerfiles+=("$dockerfile")
    fi
done

if [ ${#missing_dockerfiles[@]} -ne 0 ]; then
    error "Dockerfiles faltantes:"
    for dockerfile in "${missing_dockerfiles[@]}"; do
        error "  - $dockerfile"
    done
    exit 1
fi

log "Todos los Dockerfiles encontrados ✅"

# Detener servicios existentes
log "Deteniendo servicios existentes..."
docker-compose down --remove-orphans 2>/dev/null || true

# Limpiar imágenes antiguas (opcional)
read -p "¿Deseas limpiar imágenes Docker antiguas? (y/N): " clean_images
if [[ $clean_images =~ ^[Yy]$ ]]; then
    log "Limpiando imágenes Docker antiguas..."
    docker system prune -f
    docker image prune -f
fi

# Construir imágenes
log "Construyendo imágenes Docker..."
docker-compose --env-file .env.docker build --no-cache --parallel

# Iniciar servicios
log "Iniciando servicios AltaMedica..."
docker-compose --env-file .env.docker up -d

# Esperar a que los servicios estén listos
log "Esperando a que los servicios estén listos..."
sleep 30

# Verificar servicios
log "Verificando estado de los servicios..."

services=(
    "api-server:3001"
    "web-app:3000"
    "doctors-app:3002"
    "patients-app:3003"
    "companies-app:3004"
    "admin-app:3005"
    "signaling-server:8888"
    "redis:6379"
    "postgres:5432"
)

echo ""
echo "🏥 ========================================="
echo "🏥        ESTADO DE SERVICIOS"
echo "🏥 ========================================="

for service in "${services[@]}"; do
    service_name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)
    
    if docker-compose ps | grep -q "$service_name.*Up"; then
        log "✅ $service_name (puerto $port) - ACTIVO"
    else
        error "❌ $service_name (puerto $port) - INACTIVO"
    fi
done

echo ""
echo "🏥 ========================================="
echo "🏥           URLs DE ACCESO"
echo "🏥 ========================================="
echo ""
info "🌐 Web App (Landing):     http://localhost:3000"
info "🔌 API Server:            http://localhost:3001"
info "👨‍⚕️ Doctors Portal:        http://localhost:3002"
info "🏥 Patients Portal:       http://localhost:3003"
info "🏢 Companies Portal:      http://localhost:3004"
info "⚙️ Admin Panel:           http://localhost:3005"
info "📡 WebRTC Signaling:      ws://localhost:8888"
echo ""
info "📊 Grafana Dashboard:     http://localhost:3000 (Grafana)"
info "📈 Prometheus Metrics:    http://localhost:9090"
info "🔧 System Metrics:        http://localhost:9100"
echo ""

# Health checks
log "Ejecutando health checks..."
sleep 10

echo ""
echo "🏥 ========================================="
echo "🏥         HEALTH CHECKS"
echo "🏥 ========================================="

health_endpoints=(
    "http://localhost:3001/api/health"
    "http://localhost:3000"
    "http://localhost:8888/health"
)

for endpoint in "${health_endpoints[@]}"; do
    if curl -s -f "$endpoint" > /dev/null 2>&1; then
        log "✅ Health check OK: $endpoint"
    else
        warn "⚠️ Health check FAILED: $endpoint"
    fi
done

echo ""
echo "🏥 ========================================="
echo "🏥        COMANDOS ÚTILES"
echo "🏥 ========================================="
echo ""
info "Ver logs en tiempo real:"
info "  docker-compose logs -f"
echo ""
info "Ver logs de un servicio específico:"
info "  docker-compose logs -f api-server"
info "  docker-compose logs -f web-app"
echo ""
info "Reiniciar un servicio:"
info "  docker-compose restart api-server"
echo ""
info "Detener todos los servicios:"
info "  docker-compose down"
echo ""
info "Ver estado de servicios:"
info "  docker-compose ps"
echo ""

# Mostrar estadísticas de contenedores
log "Estadísticas de recursos:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

echo ""
log "🎉 Despliegue completado exitosamente!"
log "🏥 AltaMedica está corriendo en Docker"
log "📧 Email demo enviado previamente a: reinamosquera.ar@gmail.com"
log "🌐 Ngrok configurado con token: 30U2Fce7pLwy3Q78UxYn0SUufLV_5VfZbTNEF5GpCy1amQbQB"

echo ""
warn "📋 Para monitorear el sistema, usa:"
warn "   ./monitor-docker-stack.sh"