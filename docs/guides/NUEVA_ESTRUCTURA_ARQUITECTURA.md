# 🏗️ Nueva Estructura de Arquitectura AltaMedica

## 📁 Estructura Organizada

### 🏗️ Core

- **apps/** - Aplicaciones principales (patients, doctors, api-server)
- **packages/** - Paquetes compartidos y librerías
- **config/** - Configuraciones del proyecto

### 📚 Documentation

- **docs/** - Documentación completa del proyecto

### 🔧 Scripts

- **scripts/** - Scripts de automatización y deployment

### 🧪 Testing

- **tests/** - Tests automatizados y e2e
- **cypress/** - Tests Cypress

### 📊 Data

- **data/** - Datos de la aplicación
- **logs/** - Logs del sistema

### 🐳 DevOps

- **docker/** - Configuración Docker
- **grafana/** - Monitoreo y métricas

### 🤖 AI/Tools

- **ai-workspace/** - Herramientas de IA
- **mcp-servers/** - Servidores MCP

### 🗂️ Archive

- **archive/** - Archivos archivados

## 🎯 Beneficios de la Nueva Estructura

### ✅ **Organización Clara**
- Archivos agrupados por propósito
- Fácil navegación y mantenimiento
- Estructura escalable

### ✅ **Mejor Performance**
- Menos archivos en root
- Búsquedas más rápidas
- Builds optimizados

### ✅ **Mantenimiento Simplificado**
- Scripts organizados por función
- Documentación centralizada
- Configuraciones agrupadas

## 📋 Guía de Uso

### 🔍 **Encontrar Archivos**
```bash
# Documentación
docs/api/          # Guías de API
docs/security/     # Documentación de seguridad
docs/architecture/ # Arquitectura del sistema

# Scripts
scripts/deployment/   # Scripts de despliegue
scripts/maintenance/  # Mantenimiento
scripts/testing/      # Testing automatizado

# Herramientas
tools/python/      # Herramientas Python
tools/ai/          # Herramientas de IA
tools/monitoring/  # Monitoreo
```

### 🚀 **Comandos Comunes**
```bash
# Desarrollo
pnpm dev           # Iniciar desarrollo
pnpm build         # Build producción
pnpm test          # Ejecutar tests

# Deployment
scripts/deployment/start-production.bat
scripts/deployment/build-all.bat

# Mantenimiento
scripts/maintenance/cleanup.ps1
scripts/maintenance/backup.ps1
```

---
*Estructura generada el 04/08/2025 07:24*