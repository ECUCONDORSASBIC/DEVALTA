# Instrucciones de Instalación para el Equipo - Servidores MCP Claude Desktop

## ⚡ Instalación Rápida

### 1. Prerequisitos
- Node.js instalado (versión 16 o superior)
- Claude Desktop instalado

### 2. Pasos de Instalación

#### Paso A: Copiar Archivos
1. Copia todo el directorio `servers` a tu máquina local
2. Ubicación recomendada: `Documents/devaltamedica/mcp-protected/servers`

#### Paso B: Configurar Claude Desktop
1. Copia el archivo `claude_desktop_config_working_20250702.json`
2. Renómbralo a `claude_desktop_config.json`
3. **IMPORTANTE**: Actualiza la ruta `cwd` en el archivo para que coincida con tu sistema:
   ```json
   "cwd": "C:\\Users\\[TU_USUARIO]\\Documents\\devaltamedica\\mcp-protected\\servers"
   ```

#### Paso C: Ubicar el Archivo de Configuración
Coloca `claude_desktop_config.json` en:
- **Windows**: `%APPDATA%\\Claude\\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### 3. Verificación Rápida
```bash
# Navegar al directorio
cd "ruta/a/tu/directorio/servers"

# Verificar Node.js
node --version

# Probar configuración
node -e "console.log('Configuración OK')"

# Instalar dependencias si existen
npm install
```

### 4. Reiniciar Claude Desktop
- Cierra completamente Claude Desktop
- Reinicia la aplicación

## 🔧 Configuración Personalizada

### Modificar Rutas para tu Sistema
En el archivo `claude_desktop_config.json`, cambia todas las instancias de:
```
"C:\\Users\\Eduardo\\Documents\\devaltamedica\\mcp-protected\\servers"
```

Por tu ruta específica:
```
"C:\\Users\\[TU_USUARIO]\\Documents\\devaltamedica\\mcp-protected\\servers"
```

### Servidores Incluidos
La configuración incluye estos servidores MCP:
- ✅ **ai-flow-orchestrator** - Orquestación de flujos de IA
- ✅ **codebase-intelligence** - Análisis inteligente de código
- ✅ **context-memory** - Gestión de memoria contextual
- ✅ **multi-agent-composer** - Composición multi-agente
- ✅ **smart-completion** - Autocompletado inteligente
- ✅ **frontend-error-handler** - Manejo de errores frontend

## 🚨 Solución de Problemas Común

### Claude Desktop No Reconoce los Servidores
1. **Verificar ruta del archivo de configuración**:
   ```bash
   # Windows - PowerShell
   Test-Path "$env:APPDATA\Claude\claude_desktop_config.json"
   ```

2. **Verificar formato JSON**:
   ```bash
   node -e "console.log(JSON.parse(require('fs').readFileSync('claude_desktop_config.json', 'utf8')))"
   ```

3. **Verificar rutas en la configuración** - Asegúrate de que apunten a tu sistema

### Servidores No Inician
1. Verificar que Node.js esté instalado
2. Comprobar permisos de archivos
3. Revisar logs en `claude_mcp_servers.log`

### Problemas de Conexión
1. Reiniciar Claude Desktop completamente
2. Verificar que no haya procesos zombie
3. Comprobar el archivo de logs

## 📋 Checklist de Instalación

- [ ] Node.js instalado y funcionando
- [ ] Directorio de servidores copiado
- [ ] Rutas actualizadas en el archivo de configuración
- [ ] Archivo de configuración colocado en la ubicación correcta
- [ ] Claude Desktop reiniciado
- [ ] Servidores aparecen en Claude Desktop
- [ ] Prueba básica de funcionalidad realizada

## 📞 Soporte

Si tienes problemas durante la instalación:

1. **Revisa los logs**: `claude_mcp_servers.log` en el directorio de servidores
2. **Valida la configuración**: Usa los comandos de verificación incluidos
3. **Documenta el error**: Incluye logs y pasos para reproducir
4. **Contacta al equipo**: Con toda la información relevante

## 📁 Estructura Final Esperada

```
Documents/devaltamedica/mcp-protected/servers/
├── ai-flow-orchestrator-mcp.js
├── codebase-intelligence-mcp.js
├── context-memory-mcp.js
├── multi-agent-composer-mcp.js
├── smart-completion-mcp.js
├── frontend-error-handler.js
├── claude_desktop_config_working_20250702.json
├── README.md
├── INSTRUCCIONES_EQUIPO.md
├── package.json
├── package-lock.json
└── claude_mcp_servers.log (se crea automáticamente)
```

Y en el directorio de Claude:
```
%APPDATA%/Claude/
└── claude_desktop_config.json
```

---

**¡Listo para usar! 🚀**

*Cualquier duda, consultar el README.md para documentación completa.*
