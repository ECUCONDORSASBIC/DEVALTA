#!/bin/bash
# deploy.sh
# Script de despliegue para el ecosistema Altamedica
# Optimizado por Lead Frontend Developer

set -euo pipefail

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
ENVIRONMENT=${1:-staging}
DOCKER_COMPOSE_FILE="docker-compose.yml"
BACKUP_BEFORE_DEPLOY=${BACKUP_BEFORE_DEPLOY:-true}

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Función para verificar prerequisitos
check_prerequisites() {
    log "Verificando prerequisitos..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        error "Docker no está instalado"
    fi
    
    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose no está instalado"
    fi
    
    # Verificar archivo .env
    if [[ ! -f .env ]]; then
        error "Archivo .env no encontrado. Copia env.example a .env y configura las variables"
    fi
    
    # Verificar certificados SSL
    if [[ ! -f config/nginx/ssl/altamedica.crt ]] || [[ ! -f config/nginx/ssl/altamedica.key ]]; then
        warn "Certificados SSL no encontrados. Se usará HTTP en lugar de HTTPS"
    fi
    
    log "Prerequisitos verificados correctamente"
}

# Función para backup antes del despliegue
backup_before_deploy() {
    if [[ "$BACKUP_BEFORE_DEPLOY" == "true" ]]; then
        log "Realizando backup antes del despliegue..."
        
        # Backup de volúmenes Docker
        docker run --rm -v altamedica_postgres_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/postgres_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data . || warn "Backup de PostgreSQL falló"
        docker run --rm -v altamedica_redis_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/redis_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data . || warn "Backup de Redis falló"
        
        log "Backup completado"
    fi
}

# Función para construir imágenes
build_images() {
    log "Construyendo imágenes Docker..."
    
    # Construir API Server
    log "Construyendo API Server..."
    docker-compose build api-server
    
    # Construir aplicaciones frontend
    log "Construyendo aplicaciones frontend..."
    docker-compose build admin-app doctors-app patients-app
    
    log "Imágenes construidas correctamente"
}

# Función para verificar salud de los servicios
health_check() {
    log "Verificando salud de los servicios..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        info "Intento $attempt/$max_attempts - Verificando servicios..."
        
        # Verificar API Server
        if curl -f http://localhost:3001/api/health &> /dev/null; then
            log "✅ API Server está saludable"
        else
            warn "❌ API Server no responde"
        fi
        
        # Verificar aplicaciones frontend
        if curl -f http://localhost:3002/health &> /dev/null; then
            log "✅ Admin App está saludable"
        else
            warn "❌ Admin App no responde"
        fi
        
        if curl -f http://localhost:3003/health &> /dev/null; then
            log "✅ Doctors App está saludable"
        else
            warn "❌ Doctors App no responde"
        fi
        
        if curl -f http://localhost:3004/health &> /dev/null; then
            log "✅ Patients App está saludable"
        else
            warn "❌ Patients App no responde"
        fi
        
        # Verificar Nginx
        if curl -f http://localhost/health &> /dev/null; then
            log "✅ Nginx está saludable"
            break
        else
            warn "❌ Nginx no responde"
        fi
        
        sleep 10
        ((attempt++))
    done
    
    if [[ $attempt -gt $max_attempts ]]; then
        error "Los servicios no están respondiendo después de $max_attempts intentos"
    fi
    
    log "Todos los servicios están saludables"
}

# Función para verificar métricas
check_metrics() {
    log "Verificando métricas del sistema..."
    
    # Verificar Prometheus
    if curl -f http://localhost:9090/-/healthy &> /dev/null; then
        log "✅ Prometheus está funcionando"
    else
        warn "❌ Prometheus no responde"
    fi
    
    # Verificar Grafana
    if curl -f http://localhost:3000/api/health &> /dev/null; then
        log "✅ Grafana está funcionando"
    else
        warn "❌ Grafana no responde"
    fi
    
    log "Verificación de métricas completada"
}

# Función para mostrar información del despliegue
show_deployment_info() {
    log "🎉 Despliegue completado exitosamente!"
    echo ""
    echo "📋 Información del despliegue:"
    echo "   Entorno: $ENVIRONMENT"
    echo "   Fecha: $(date)"
    echo ""
    echo "🌐 URLs de acceso:"
    echo "   Sitio principal: https://altamedica.com"
    echo "   API: https://api.altamedica.com"
    echo "   Admin: https://admin.altamedica.com"
    echo "   Doctores: https://doctors.altamedica.com"
    echo "   Pacientes: https://patients.altamedica.com"
    echo "   Monitoreo: https://monitoring.altamedica.com"
    echo ""
    echo "📊 Dashboards:"
    echo "   Grafana: http://localhost:3000 (admin/admin)"
    echo "   Prometheus: http://localhost:9090"
    echo ""
    echo "🔧 Comandos útiles:"
    echo "   Ver logs: docker-compose logs -f"
    echo "   Reiniciar servicios: docker-compose restart"
    echo "   Parar servicios: docker-compose down"
    echo "   Ver estado: docker-compose ps"
    echo ""
}

# Función principal de despliegue
main() {
    log "🚀 Iniciando despliegue del ecosistema AltaMedica..."
    log "Entorno: $ENVIRONMENT"
    
    # Verificar prerequisitos
    check_prerequisites
    
    # Backup antes del despliegue
    backup_before_deploy
    
    # Parar servicios existentes
    log "Parando servicios existentes..."
    docker-compose down --remove-orphans || warn "Error al parar servicios existentes"
    
    # Construir imágenes
    build_images
    
    # Iniciar servicios
    log "Iniciando servicios..."
    docker-compose up -d
    
    # Esperar a que los servicios estén listos
    log "Esperando a que los servicios estén listos..."
    sleep 30
    
    # Verificar salud de los servicios
    health_check
    
    # Verificar métricas
    check_metrics
    
    # Mostrar información del despliegue
    show_deployment_info
    
    log "✅ Despliegue completado exitosamente!"
}

# Función de limpieza en caso de error
cleanup() {
    error "Error durante el despliegue. Limpiando..."
    docker-compose down --remove-orphans
    exit 1
}

# Configurar trap para limpieza en caso de error
trap cleanup ERR

# Ejecutar función principal
main "$@" 