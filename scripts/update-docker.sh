#!/bin/bash

# 🏥 AltaMedica - Script de Actualización Docker
# Actualiza contenedores con los cambios más recientes

set -e  # Exit on any error

# Variables de configuración
PROJECT_NAME="devaltamedica"
COMPOSE_FILE="docker-compose.yml"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏥 AltaMedica - Actualización Docker${NC}"
echo -e "${BLUE}===================================${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ Error: docker-compose.yml no encontrado${NC}"
    echo "Ejecute este script desde el directorio raíz del proyecto"
    exit 1
fi

# 1. CREAR BACKUP PRE-ACTUALIZACIÓN
echo -e "${YELLOW}📦 Creando backup pre-actualización...${NC}"
if [ -f "scripts/backup-project.sh" ]; then
    chmod +x scripts/backup-project.sh
    ./scripts/backup-project.sh
else
    echo -e "${YELLOW}⚠️  Script de backup no encontrado, continuando sin backup...${NC}"
fi

# 2. DETENER CONTENEDORES ACTUALES
echo -e "${YELLOW}🛑 Deteniendo contenedores actuales...${NC}"
docker-compose down || echo "Algunos contenedores ya estaban detenidos"

# 3. LIMPIAR IMÁGENES Y CACHÉ DOCKER
echo -e "${YELLOW}🧹 Limpiando caché de Docker...${NC}"
docker system prune -f
echo -e "${GREEN}✅ Caché limpiado${NC}"

# 4. VERIFICAR NUEVAS DEPENDENCIAS
echo -e "${YELLOW}📋 Verificando nuevas dependencias...${NC}"

# Verificar Leaflet en web-app
if grep -q '"leaflet"' apps/web-app/package.json; then
    echo -e "${GREEN}✅ Leaflet encontrado en web-app${NC}"
else
    echo -e "${YELLOW}⚠️  Instalando Leaflet en web-app...${NC}"
    cd apps/web-app
    pnpm add leaflet react-leaflet @types/leaflet
    cd ../..
fi

# Verificar Context API en companies
if grep -q 'MarketplaceContext' apps/companies/src/contexts/MarketplaceContext.tsx 2>/dev/null; then
    echo -e "${GREEN}✅ MarketplaceContext encontrado en companies${NC}"
else
    echo -e "${YELLOW}⚠️  Archivos de contexto no encontrados - revisar implementación${NC}"
fi

# 5. REBUILDING IMÁGENES CON CAMBIOS RECIENTES
echo -e "${YELLOW}🔨 Construyendo imágenes actualizadas...${NC}"

# Build específico para aplicaciones que cambiaron
echo -e "${BLUE}🏗️  Construyendo web-app (con mapa Leaflet)...${NC}"
docker-compose build --no-cache web-app

echo -e "${BLUE}🏗️  Construyendo companies (con marketplace)...${NC}"
docker-compose build --no-cache companies

echo -e "${BLUE}🏗️  Construyendo api-server...${NC}"
docker-compose build --no-cache api-server

echo -e "${GREEN}✅ Imágenes construidas exitosamente${NC}"

# 6. INICIAR SERVICIOS DE INFRAESTRUCTURA PRIMERO
echo -e "${YELLOW}🔧 Iniciando servicios de infraestructura...${NC}"
docker-compose up -d postgres redis

# Esperar a que los servicios estén listos
echo -e "${YELLOW}⏳ Esperando a que la infraestructura esté lista...${NC}"
sleep 15

# Verificar que PostgreSQL esté listo
echo -e "${YELLOW}🔍 Verificando PostgreSQL...${NC}"
for i in {1..30}; do
    if docker exec altamedica-postgres pg_isready -U altamedica -d altamedica >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL está listo${NC}"
        break
    fi
    echo "Esperando PostgreSQL... ($i/30)"
    sleep 2
done

# Verificar que Redis esté listo
echo -e "${YELLOW}🔍 Verificando Redis...${NC}"
for i in {1..15}; do
    if docker exec altamedica-redis redis-cli ping >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Redis está listo${NC}"
        break
    fi
    echo "Esperando Redis... ($i/15)"
    sleep 2
done

# 7. INICIAR APLICACIONES PRINCIPALES
echo -e "${YELLOW}🚀 Iniciando aplicaciones principales...${NC}"

# Iniciar API Server primero
docker-compose up -d api-server
sleep 10

# Iniciar aplicaciones frontend
docker-compose up -d web-app companies doctors patients admin

# 8. INICIAR SERVICIOS ADICIONALES
echo -e "${YELLOW}⚙️  Iniciando servicios adicionales...${NC}"
docker-compose up -d signaling-server nginx prometheus grafana node-exporter fluentd

# 9. VERIFICAR ESTADO DE TODOS LOS SERVICIOS
echo -e "${YELLOW}🔍 Verificando estado de servicios...${NC}"
sleep 20

# Función para verificar salud de un servicio
check_service_health() {
    local service_name=$1
    local port=$2
    local endpoint=${3:-"/api/health"}
    
    echo -n "Verificando $service_name (puerto $port)... "
    
    if curl -f -s http://localhost:$port$endpoint >/dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FALLO${NC}"
        return 1
    fi
}

# Verificar servicios principales
FAILED_SERVICES=0

check_service_health "Web App" 3000 "/" || ((FAILED_SERVICES++))
check_service_health "API Server" 3001 "/api/health" || ((FAILED_SERVICES++))
check_service_health "Companies" 3004 "/" || ((FAILED_SERVICES++))
check_service_health "Doctors" 3002 "/" || ((FAILED_SERVICES++))
check_service_health "Patients" 3003 "/" || ((FAILED_SERVICES++))
check_service_health "Admin" 3005 "/" || ((FAILED_SERVICES++))

# 10. MOSTRAR ESTADO FINAL
echo ""
echo -e "${BLUE}📊 RESUMEN DE ACTUALIZACIÓN${NC}"
echo -e "${BLUE}===========================${NC}"

if [ $FAILED_SERVICES -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡ACTUALIZACIÓN COMPLETADA EXITOSAMENTE!${NC}"
else
    echo -e "${YELLOW}⚠️  Actualización completada con $FAILED_SERVICES servicios con problemas${NC}"
fi

echo ""
echo -e "${BLUE}🌐 URLs Disponibles:${NC}"
echo -e "   • Web App (Landing): ${GREEN}http://localhost:3000${NC}"
echo -e "   • API Server: ${GREEN}http://localhost:3001${NC}"
echo -e "   • Companies (Marketplace): ${GREEN}http://localhost:3004${NC}"
echo -e "   • Doctors Portal: ${GREEN}http://localhost:3002${NC}"
echo -e "   • Patients Portal: ${GREEN}http://localhost:3003${NC}"
echo -e "   • Admin Panel: ${GREEN}http://localhost:3005${NC}"
echo -e "   • Grafana Monitoring: ${GREEN}http://localhost:3006${NC}"

echo ""
echo -e "${BLUE}🆕 NUEVAS CARACTERÍSTICAS INCLUIDAS:${NC}"
echo -e "   ✅ Mapa interactivo Leaflet en landing page"
echo -e "   ✅ Marketplace médico completo con JobMarketplaceDashboard"
echo -e "   ✅ Context API para estado compartido"
echo -e "   ✅ Panel de detalles deslizable"
echo -e "   ✅ Datos de médicos de Latinoamérica"
echo -e "   ✅ Notificaciones WebSocket integradas"

echo ""
echo -e "${YELLOW}💡 COMANDOS ÚTILES:${NC}"
echo -e "   • Ver logs: ${BLUE}docker-compose logs -f [servicio]${NC}"
echo -e "   • Reiniciar servicio: ${BLUE}docker-compose restart [servicio]${NC}"
echo -e "   • Estado completo: ${BLUE}docker-compose ps${NC}"

echo ""
if [ $FAILED_SERVICES -eq 0 ]; then
    echo -e "${GREEN}✅ Todos los servicios están funcionando correctamente${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Revisar logs de servicios fallidos: docker-compose logs [servicio]${NC}"
    exit 1
fi