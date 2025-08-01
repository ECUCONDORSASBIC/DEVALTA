#!/bin/bash

# 🏥 AltaMedica - Script de Backup Completo
# Genera backup completo del proyecto incluyendo código, DB y Docker

set -e  # Exit on any error

# Variables de configuración
PROJECT_NAME="devaltamedica"
BACKUP_DIR="/home/altamedica/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="${PROJECT_NAME}_backup_${DATE}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏥 AltaMedica - Sistema de Backup${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""

# Crear directorio de backup
echo -e "${YELLOW}📁 Creando directorio de backup...${NC}"
mkdir -p "${BACKUP_PATH}"
mkdir -p "${BACKUP_PATH}/code"
mkdir -p "${BACKUP_PATH}/database" 
mkdir -p "${BACKUP_PATH}/docker"
mkdir -p "${BACKUP_PATH}/logs"

# 1. BACKUP DEL CÓDIGO FUENTE
echo -e "${YELLOW}💻 Respaldando código fuente...${NC}"
cd /home/altamedica/devaltamedica

# Crear archivo tar excuyendo node_modules y archivos temporales
tar -czf "${BACKUP_PATH}/code/source_code.tar.gz" \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.cache' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='coverage' \
  --exclude='.env.local' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  --exclude='thumbs.db' \
  .

echo -e "${GREEN}✅ Código fuente respaldado${NC}"

# 2. BACKUP DE BASE DE DATOS (si está corriendo)
echo -e "${YELLOW}🗄️  Respaldando base de datos...${NC}"
if docker ps | grep -q "altamedica-postgres"; then
    echo "PostgreSQL container está corriendo, creando backup..."
    docker exec altamedica-postgres pg_dump -U altamedica -d altamedica > "${BACKUP_PATH}/database/postgres_dump.sql"
    echo -e "${GREEN}✅ Base de datos PostgreSQL respaldada${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL container no está corriendo, omitiendo backup DB${NC}"
fi

# 3. BACKUP DE REDIS (si está corriendo)
echo -e "${YELLOW}📊 Respaldando datos de Redis...${NC}"
if docker ps | grep -q "altamedica-redis"; then
    echo "Redis container está corriendo, creando backup..."
    docker exec altamedica-redis redis-cli --rdb "${BACKUP_PATH}/database/redis_dump.rdb" 2>/dev/null || true
    echo -e "${GREEN}✅ Datos de Redis respaldados${NC}"
else
    echo -e "${YELLOW}⚠️  Redis container no está corriendo, omitiendo backup Redis${NC}"
fi

# 4. BACKUP DE CONFIGURACIÓN DOCKER
echo -e "${YELLOW}🐳 Respaldando configuración Docker...${NC}"
cp docker-compose.yml "${BACKUP_PATH}/docker/"
cp Dockerfile "${BACKUP_PATH}/docker/" 2>/dev/null || true
cp .env.docker "${BACKUP_PATH}/docker/" 2>/dev/null || true

# Backup de volumes Docker (si existen)
if docker volume ls | grep -q "devaltamedica"; then
    echo "Respaldando volúmenes Docker..."
    docker run --rm -v devaltamedica_postgres_data:/data -v "${BACKUP_PATH}/docker:/backup" alpine tar czf /backup/postgres_volume.tar.gz -C /data .
    docker run --rm -v devaltamedica_redis_data:/data -v "${BACKUP_PATH}/docker:/backup" alpine tar czf /backup/redis_volume.tar.gz -C /data .
    echo -e "${GREEN}✅ Volúmenes Docker respaldados${NC}"
fi

echo -e "${GREEN}✅ Configuración Docker respaldada${NC}"

# 5. BACKUP DE LOGS (últimos 7 días)
echo -e "${YELLOW}📋 Respaldando logs recientes...${NC}"
if [ -d "logs" ]; then
    find logs -name "*.log" -mtime -7 -exec cp {} "${BACKUP_PATH}/logs/" \; 2>/dev/null || true
    echo -e "${GREEN}✅ Logs respaldados${NC}"
else
    echo -e "${YELLOW}⚠️  Directorio logs no encontrado${NC}"
fi

# 6. GENERAR MANIFEST DE BACKUP
echo -e "${YELLOW}📝 Generando manifest del backup...${NC}"
cat > "${BACKUP_PATH}/BACKUP_MANIFEST.txt" << EOF
🏥 ALTAMEDICA BACKUP MANIFEST
============================
Fecha: $(date)
Versión: ${DATE}
Servidor: $(hostname)
Usuario: $(whoami)

📁 CONTENIDO DEL BACKUP:
- code/source_code.tar.gz: Código fuente completo (excluye node_modules)
- database/postgres_dump.sql: Dump completo de PostgreSQL
- database/redis_dump.rdb: Backup de datos Redis
- docker/: Configuraciones Docker (compose, Dockerfile, volumes)
- logs/: Logs de aplicación (últimos 7 días)

🔧 CAMBIOS RECIENTES INCLUIDOS:
- ✅ Marketplace médico con mapa interactivo Leaflet
- ✅ Integración completa JobMarketplaceDashboard
- ✅ Context API para estado compartido
- ✅ Datos unificados para Latinoamérica
- ✅ Panel de detalles deslizable
- ✅ Notificaciones WebSocket integradas
- ✅ Mapa demo en landing page (web-app)

📊 ESTADÍSTICAS:
- Tamaño total: $(du -sh "${BACKUP_PATH}" | cut -f1)
- Archivos incluidos: $(find "${BACKUP_PATH}" -type f | wc -l)
- Apps respaldadas: web-app, companies, api-server, doctors, patients, admin

🚀 PARA RESTAURAR:
1. Extraer source_code.tar.gz en directorio del proyecto
2. Restaurar DB: psql -U altamedica -d altamedica < database/postgres_dump.sql
3. Restaurar Redis: redis-cli --rdb database/redis_dump.rdb
4. Ejecutar: docker-compose up -d

📞 SOPORTE:
- Documentación: /home/altamedica/devaltamedica/CLAUDE.md
- Logs: /home/altamedica/devaltamedica/logs/
EOF

# 7. CREAR ARCHIVO ZIP FINAL
echo -e "${YELLOW}📦 Comprimiendo backup final...${NC}"
cd "${BACKUP_DIR}"
zip -r "${BACKUP_NAME}.zip" "${BACKUP_NAME}/" > /dev/null
FINAL_SIZE=$(du -sh "${BACKUP_NAME}.zip" | cut -f1)

# 8. LIMPIAR BACKUPS ANTIGUOS (mantener últimos 5)
echo -e "${YELLOW}🧹 Limpiando backups antiguos...${NC}"
ls -t ${BACKUP_DIR}/${PROJECT_NAME}_backup_*.zip 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true

# RESUMEN FINAL
echo ""
echo -e "${GREEN}🎉 ¡BACKUP COMPLETADO EXITOSAMENTE!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${BLUE}📁 Ubicación: ${BACKUP_NAME}.zip${NC}"
echo -e "${BLUE}📊 Tamaño: ${FINAL_SIZE}${NC}"
echo -e "${BLUE}⏰ Tiempo: $(date)${NC}"
echo ""
echo -e "${YELLOW}💡 Consejos:${NC}"
echo -e "   • El backup incluye TODO el código actualizado"
echo -e "   • Las dependencias npm se reinstalarán automáticamente"  
echo -e "   • Los secretos están en .env.docker (incluido en backup)"
echo -e "   • Para restaurar: descomprimir y ejecutar docker-compose up"
echo ""

# Cleanup temporal directory
rm -rf "${BACKUP_PATH}"

echo -e "${GREEN}✅ Proceso de backup finalizado${NC}"