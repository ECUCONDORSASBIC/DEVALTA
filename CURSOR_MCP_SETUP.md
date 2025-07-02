# Configuración de MCPs en Cursor - Altamedica

## 🎯 **Resumen**

Sí, puedes usar MCPs (Model Context Protocol) desde Cursor. Esta guía te muestra cómo configurar los MCPs específicos de tu proyecto Altamedica.

## 🔧 **Métodos de Configuración**

### **Método 1: Configuración Nativa de Cursor (Recomendado)**

#### 1. **Abrir Configuración de Cursor**
- `Ctrl + ,` (Windows/Linux) o `Cmd + ,` (Mac)
- O `File > Preferences > Settings`

#### 2. **Buscar Configuración MCP**
- Buscar: "MCP" o "Model Context Protocol"
- Habilitar: `cursor.mcp.enabled`

#### 3. **Configurar Servidores MCP**
Agregar en `settings.json`:

```json
{
  "cursor.mcp.enabled": true,
  "cursor.mcp.servers": {
    "terminal": {
      "command": "node",
      "args": ["mcp-servers/enhanced-multi-agent-mcp.js"],
      "env": {
        "NODE_ENV": "development",
        "PROJECT_ROOT": "."
      }
    },
    "codebase-intelligence": {
      "command": "node", 
      "args": ["mcp-protected/servers/codebase-intelligence-mcp.js"],
      "env": {
        "NODE_ENV": "development",
        "PROJECT_ROOT": "."
      }
    },
    "ai-flow-orchestrator": {
      "command": "node",
      "args": ["mcp-protected/servers/ai-flow-orchestrator-mcp.js"],
      "env": {
        "NODE_ENV": "development", 
        "PROJECT_ROOT": "."
      }
    }
  }
}
```

### **Método 2: Usar Script de Activación (Más Fácil)**

#### 1. **Instalar Dependencias**
```powershell
.\scripts\activate-cursor-mcp.ps1 -Install
```

#### 2. **Iniciar Servidores MCP**
```powershell
.\scripts\activate-cursor-mcp.ps1 -Start
```

#### 3. **Verificar Estado**
```powershell
.\scripts\activate-cursor-mcp.ps1 -Status
```

#### 4. **Detener Servidores**
```powershell
.\scripts\activate-cursor-mcp.ps1 -Stop
```

### **Método 3: Claude Desktop como Bridge**

Si prefieres mantener Claude Desktop:

1. **Mantener Claude Desktop ejecutándose** con MCPs configurados
2. **Usar Cursor** para desarrollo
3. **Comunicarte con Claude Desktop** cuando necesites funcionalidades MCP

## 🚀 **MCPs Disponibles en tu Proyecto**

### **1. Enhanced Multi-Agent MCP**
- **Archivo:** `mcp-servers/enhanced-multi-agent-mcp.js`
- **Función:** Terminal avanzado, comandos complejos, multi-agente
- **Uso:** Automatización de tareas complejas

### **2. Codebase Intelligence MCP**
- **Archivo:** `mcp-protected/servers/codebase-intelligence-mcp.js`
- **Función:** Análisis inteligente del codebase
- **Uso:** Refactoring, optimización, detección de problemas

### **3. AI Flow Orchestrator MCP**
- **Archivo:** `mcp-protected/servers/ai-flow-orchestrator-mcp.js`
- **Función:** Orquestación de flujos de IA
- **Uso:** Automatización de procesos de desarrollo

### **4. Frontend Error Handler MCP**
- **Archivo:** `mcp-protected/servers/frontend-error-handler.js`
- **Función:** Manejo inteligente de errores frontend
- **Uso:** Debugging automático, corrección de errores

### **5. System Configuration MCP**
- **Archivo:** `mcp-servers/system-configuration.js`
- **Función:** Configuración automática del sistema
- **Uso:** Setup de proyectos, configuración de herramientas

## 📋 **Pasos de Configuración Detallados**

### **Paso 1: Verificar Dependencias**
```bash
# Verificar que Node.js esté instalado
node --version

# Verificar que pnpm esté instalado
pnpm --version
```

### **Paso 2: Instalar Dependencias de MCPs**
```bash
# Instalar en mcp-servers
cd mcp-servers
pnpm install

# Instalar en mcp-protected
cd ../mcp-protected
pnpm install

# Volver al directorio raíz
cd ..
```

### **Paso 3: Configurar Variables de Entorno**
Crear archivo `.env` en el directorio raíz:

```env
NODE_ENV=development
PROJECT_ROOT=.
MCP_ENABLED=true
```

### **Paso 4: Probar Configuración**
```powershell
# Probar script de activación
.\scripts\activate-cursor-mcp.ps1 -Help
.\scripts\activate-cursor-mcp.ps1 -Status
```

## 🎯 **Casos de Uso Específicos**

### **Desarrollo con Componentes Médicos**
```typescript
// Cursor puede usar MCPs para:
// - Generar componentes médicos automáticamente
// - Validar compliance HIPAA
// - Optimizar performance
// - Detectar errores de seguridad
```

### **Refactoring Inteligente**
```typescript
// MCPs pueden:
// - Analizar dependencias
// - Sugerir optimizaciones
// - Detectar código duplicado
// - Proponer mejoras de arquitectura
```

### **Debugging Automático**
```typescript
// MCPs pueden:
// - Detectar errores en tiempo real
// - Sugerir correcciones
// - Analizar logs automáticamente
// - Optimizar queries de base de datos
```

## ⚠️ **Consideraciones Importantes**

### **Seguridad**
- 🔐 **Verificar permisos** de los scripts MCP
- 🔐 **Revisar código** de los servidores MCP
- 🔐 **Configurar firewalls** si es necesario

### **Performance**
- ⚡ **Monitorear uso de recursos** de los MCPs
- ⚡ **Configurar timeouts** apropiados
- ⚡ **Optimizar configuración** según necesidades

### **Compatibilidad**
- 🔄 **Verificar versiones** de Node.js
- 🔄 **Probar en diferentes entornos**
- 🔄 **Mantener actualizaciones** regulares

## 🚀 **Comandos Útiles**

### **Gestión de MCPs**
```powershell
# Ver ayuda
.\scripts\activate-cursor-mcp.ps1 -Help

# Instalar dependencias
.\scripts\activate-cursor-mcp.ps1 -Install

# Iniciar servidores
.\scripts\activate-cursor-mcp.ps1 -Start

# Ver estado
.\scripts\activate-cursor-mcp.ps1 -Status

# Detener servidores
.\scripts\activate-cursor-mcp.ps1 -Stop
```

### **Debugging**
```bash
# Ver logs de MCPs
tail -f logs/mcp-*.log

# Verificar procesos
ps aux | grep node

# Verificar puertos
netstat -tulpn | grep node
```

## 📞 **Soporte**

### **Problemas Comunes**
1. **MCPs no se inician:** Verificar dependencias y permisos
2. **Errores de conexión:** Verificar configuración de red
3. **Performance lenta:** Optimizar configuración

### **Logs y Debugging**
- Los logs se guardan en `logs/` (si está configurado)
- Usar `console.log` en los servidores MCP para debugging
- Verificar configuración en `cursor-mcp-config.json`

---

**¡Con esta configuración, tendrás acceso completo a MCPs desde Cursor!** 🚀

**Recomendación:** Empieza con el **Método 2** (script de activación) ya que es más fácil y está específicamente diseñado para tu proyecto. 