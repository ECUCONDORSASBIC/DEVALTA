# Configuración de Servidores MCP para Claude Desktop

## Descripción General

Este directorio contiene la configuración estable y documentación para los servidores MCP (Model Context Protocol) utilizados con Claude Desktop. La configuración permite a Claude interactuar con herramientas especializadas a través de servidores personalizados.

## Archivos de Configuración

### Archivos Principales
- `claude_desktop_config_working_20250702.json` - Configuración estable actual
- `README.md` - Este archivo de documentación

### Servidores Disponibles
- `ai-flow-orchestrator-mcp.js` - Orquestador de flujos de IA
- `codebase-intelligence-mcp.js` - Inteligencia de código
- `context-memory-mcp.js` - Memoria de contexto
- `multi-agent-composer-mcp.js` - Compositor multi-agente
- `smart-completion-mcp.js` - Completado inteligente
- `frontend-error-handler.js` - Manejador de errores frontend

## Cómo Agregar Nuevos Servidores

### Paso 1: Crear el Servidor
1. Desarrolla tu servidor MCP siguiendo las especificaciones del protocolo
2. Coloca el archivo del servidor en este directorio
3. Asegúrate de que el servidor tenga las dependencias necesarias instaladas

### Paso 2: Actualizar la Configuración
Edita el archivo `claude_desktop_config.json` (o crea uno basado en el archivo working) y añade la nueva configuración:

```json
{
  "mcpServers": {
    "nombre-del-servidor": {
      "command": "node",
      "args": ["nombre-del-servidor.js"],
      "cwd": "C:\\Users\\Eduardo\\Documents\\devaltamedica\\mcp-protected\\servers",
      "env": {
        "NODE_ENV": "production",
        "CUSTOM_VAR": "valor_si_necesario"
      }
    }
  }
}
```

### Paso 3: Reiniciar Claude Desktop
- Cierra completamente Claude Desktop
- Reinicia la aplicación para cargar la nueva configuración

## Requisitos de Rutas

### Rutas Obligatorias
- **cwd**: Debe apuntar al directorio absoluto donde están los servidores
  - Windows: `C:\\Users\\[Usuario]\\Documents\\devaltamedica\\mcp-protected\\servers`
  - macOS/Linux: `/path/to/mcp-protected/servers`

### Configuración de Variables de Entorno
- `NODE_ENV`: Establece el entorno de ejecución
- Variables adicionales según las necesidades del servidor

### Ubicación de Configuración de Claude Desktop
El archivo `claude_desktop_config.json` debe colocarse en:
- **Windows**: `%APPDATA%\\Claude\\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

## Comandos de Prueba

### Verificar Instalación de Node.js
```bash
node --version
npm --version
```

### Probar Servidor Individual
```bash
# Navegar al directorio de servidores
cd "C:\Users\Eduardo\Documents\devaltamedica\mcp-protected\servers"

# Probar un servidor específico
node ai-flow-orchestrator-mcp.js --test
```

### Verificar Dependencias
```bash
# Instalar dependencias si es necesario
npm install

# Verificar que todos los archivos JS sean válidos
node -c ai-flow-orchestrator-mcp.js
node -c codebase-intelligence-mcp.js
node -c context-memory-mcp.js
node -c multi-agent-composer-mcp.js
node -c smart-completion-mcp.js
node -c frontend-error-handler.js
```

### Validar Configuración JSON
```bash
# Validar sintaxis del archivo de configuración
node -e "console.log(JSON.parse(require('fs').readFileSync('claude_desktop_config_working_20250702.json', 'utf8')))"
```

## Cómo Leer los Logs

### Ubicación de Logs
Los logs se generan en el archivo configurado en la sección `logging` del archivo de configuración:
- Archivo por defecto: `claude_mcp_servers.log`
- Ubicación: En el mismo directorio que los servidores

### Comandos para Leer Logs

#### Windows (PowerShell)
```powershell
# Ver logs en tiempo real
Get-Content -Path "claude_mcp_servers.log" -Wait

# Ver últimas 50 líneas
Get-Content -Path "claude_mcp_servers.log" -Tail 50

# Buscar errores específicos
Select-String -Path "claude_mcp_servers.log" -Pattern "ERROR"
```

#### Windows (Command Prompt)
```cmd
# Ver contenido completo
type claude_mcp_servers.log

# Ver últimas líneas
powershell "Get-Content -Path 'claude_mcp_servers.log' -Tail 20"
```

#### macOS/Linux
```bash
# Ver logs en tiempo real
tail -f claude_mcp_servers.log

# Ver últimas 50 líneas
tail -n 50 claude_mcp_servers.log

# Buscar errores
grep "ERROR" claude_mcp_servers.log
```

### Interpretación de Logs
- **INFO**: Información general sobre el funcionamiento
- **WARN**: Advertencias que no impiden el funcionamiento
- **ERROR**: Errores que requieren atención
- **DEBUG**: Información detallada para diagnóstico

## Solución de Problemas Comunes

### Servidor No Inicia
1. Verificar que Node.js esté instalado
2. Comprobar que las rutas en `cwd` sean correctas
3. Revisar permisos de archivos
4. Verificar sintaxis del archivo de configuración

### Errores de Conexión
1. Reiniciar Claude Desktop
2. Verificar que no haya procesos duplicados
3. Comprobar puertos en uso
4. Revisar logs para errores específicos

### Problemas de Rendimiento
1. Verificar uso de memoria con el Administrador de Tareas
2. Revisar logs para advertencias de timeout
3. Considerar ajustar variables de entorno

## Mantenimiento y Respaldos

### Crear Respaldo de Configuración
```bash
# Crear respaldo con fecha actual
copy claude_desktop_config.json claude_desktop_config_backup_$(Get-Date -Format "yyyyMMdd").json
```

### Actualizar Servidores
1. Hacer respaldo de la configuración actual
2. Actualizar archivos de servidor individualmente
3. Probar cada servidor antes de actualizar la configuración principal
4. Actualizar la configuración de Claude Desktop
5. Probar la integración completa

## Contacto y Soporte

Para futuras instalaciones o problemas con la configuración, contactar al equipo de desarrollo con:
- Logs relevantes
- Configuración utilizada
- Descripción detallada del problema
- Pasos para reproducir el issue

## Historial de Versiones

- **2025-07-02**: Configuración inicial estable con 6 servidores MCP
  - ai-flow-orchestrator
  - codebase-intelligence
  - context-memory
  - multi-agent-composer
  - smart-completion
  - frontend-error-handler

---

*Documentación creada para el equipo de desarrollo - Altamedica*
