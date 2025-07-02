# 🔍 CHECKLIST DE ACTIVACIÓN BRIDGE MCP - PASO A PASO

## 📋 **DIAGNÓSTICO COMPLETO PARA ENCONTRAR FALLOS**

### **🎯 PASO 1: EJECUTAR DIAGNÓSTICO AUTOMÁTICO**
```bash
node diagnose-bridge-mcp.js
```
**Esto verificará:**
- ✅ Archivos MCP existen y no están vacíos
- ✅ Configuración JSON es válida  
- ✅ Dependencias Node.js están instaladas
- ✅ MCP servers pueden arrancar sin errores
- ✅ Permisos de ejecución están correctos
- ✅ Sistema de logging funciona

### **🎯 PASO 2: VERIFICAR CADA COMPONENTE INDIVIDUALMENTE**

#### **2.1 Test Manual Terminal MCP**
```bash
# Test directo del Terminal MCP
node platform/mcp-servers/terminal-mcp.js
```
**Resultado esperado:** 
```
🖥️ Terminal MCP Server iniciado - EJECUCIÓN REAL DE COMANDOS HABILITADA! 🚀
```
**Si falla:** Revisar errores de sintaxis o dependencias faltantes

#### **2.2 Test Manual Bridge MCP**
```bash
# Test directo del Bridge
node platform/mcp-servers/copilot-claude-bridge.js  
```
**Resultado esperado:**
```
🌉 Copilot-Claude Bridge MCP Server iniciado - INTEGRACIÓN COMPLETA HABILITADA! 🚀
```

#### **2.3 Test con Inspector MCP**
```bash
# Inspeccionar Terminal MCP
npx -y @modelcontextprotocol/inspector node platform/mcp-servers/terminal-mcp.js

# Inspeccionar Bridge MCP  
npx -y @modelcontextprotocol/inspector node platform/mcp-servers/copilot-claude-bridge.js
```
**Resultado esperado:** Interface web en http://localhost:3000 con herramientas visibles

---

## 🔧 **PASO 3: ACTIVAR CONFIGURACIÓN CORRECTA**

### **3.1 Backup y Activar Config**
```bash
# Backup de configuración actual
cp mcp-config.json mcp-config-backup.json

# Activar configuración con Terminal y Bridge
cp mcp-config-with-terminal.json mcp-config.json
```

### **3.2 Verificar Configuración**
```bash
# Verificar que JSON es válido
node -e "console.log(JSON.parse(require('fs').readFileSync('mcp-config.json', 'utf8')))"
```

### **3.3 Contar Servidores MCP**
```bash
# Debe mostrar 14 servidores (incluyendo terminal y bridge)
node -e "const cfg=JSON.parse(require('fs').readFileSync('mcp-config.json', 'utf8')); console.log('Servidores MCP:', Object.keys(cfg.mcpServers).length)"
```

---

## 🚀 **PASO 4: REINICIAR Y ACTIVAR EN CLAUDE/VS CODE**

### **4.1 En VS Code:**
1. **Abrir Command Palette:** `Ctrl+Shift+P`
2. **Buscar:** `MCP: Restart Servers`
3. **Ejecutar** y esperar confirmación
4. **Verificar** en Output panel que no hay errores

### **4.2 En Claude Desktop:**
1. **Cerrar** Claude Desktop completamente
2. **Verificar** que `mcp-config.json` está en la ubicación correcta
3. **Reiniciar** Claude Desktop
4. **Verificar** en Settings que los MCP están cargados

---

## 🧪 **PASO 5: TESTS DE VERIFICACIÓN MANUAL**

### **5.1 Test Desde Claude Interface**
**En Claude, probar:**
```
Ejecuta el comando: node --version
```
**Resultado esperado:** Versión de Node.js actual

### **5.2 Test de Script PowerShell**
**En Claude, probar:**
```
Ejecuta el script: powershell -Command "Write-Output 'Test exitoso'"
```
**Resultado esperado:** "Test exitoso"

### **5.3 Test de Bridge Stats**
**En Claude, probar:**
```
Obtén las estadísticas del bridge Copilot-Claude
```
**Resultado esperado:** Estadísticas de interacciones del bridge

---

## 🔍 **PASO 6: DIAGNÓSTICO DE FALLOS COMUNES**

### **❌ Error: "MCP Server not responding"**
**Causas posibles:**
- MCP server tiene errores de sintaxis
- Dependencias faltantes (@modelcontextprotocol/sdk)
- Permisos de ejecución incorrectos
- Puerto ya en uso

**Solución:**
```bash
# Verificar sintaxis
node -c platform/mcp-servers/terminal-mcp.js
node -c platform/mcp-servers/copilot-claude-bridge.js

# Instalar dependencias si faltan
npm install @modelcontextprotocol/sdk
```

### **❌ Error: "Command not allowed"**
**Causas posibles:**
- Comando no está en whitelist
- Validación de seguridad muy restrictiva

**Solución:**
- Revisar `allowedCommands` en terminal-mcp.js
- Agregar comando a la lista permitida

### **❌ Error: "Claude doesn't see MCP tools"**
**Causas posibles:**
- Configuración no cargada correctamente
- MCP servers no iniciados
- Claude/VS Code no reiniciado

**Solución:**
```bash
# Reiniciar todo el stack
1. Reiniciar VS Code / Claude Desktop
2. Verificar logs de MCP en Output panel
3. Recargar configuración MCP
```

---

## 📊 **PASO 7: VERIFICACIÓN FINAL**

### **7.1 Checklist de Estado Final**
- [ ] `diagnose-bridge-mcp.js` ejecuta sin errores
- [ ] Terminal MCP arranca solo sin errores  
- [ ] Bridge MCP arranca solo sin errores
- [ ] Inspector MCP muestra herramientas disponibles
- [ ] Claude/VS Code reconoce los MCP tools
- [ ] Comando simple `node --version` funciona desde Claude
- [ ] Bridge statistics son accesibles
- [ ] Logs se generan correctamente

### **7.2 Test de Integración Completa**
```bash
# Ejecutar test end-to-end
node -e "
console.log('🧪 TEST FINAL DE INTEGRACIÓN');
const { execSync } = require('child_process');
try {
  const result = execSync('node --version', { encoding: 'utf8' });
  console.log('✅ Node.js ejecutado:', result.trim());
  console.log('🎉 BRIDGE MCP COMPLETAMENTE OPERATIVO');
} catch (error) {
  console.log('❌ Error:', error.message);
}
"
```

---

## 🎯 **RESULTADO ESPERADO**

Después de completar todos los pasos:

1. **✅ Claude puede ejecutar comandos reales** a través del Bridge
2. **✅ Todos los comandos son validados** por seguridad
3. **✅ Ejecuciones son logged** y auditadas
4. **✅ Bridge statistics** muestran actividad
5. **✅ Sistema es completamente operativo** y seguro

---

## 🆘 **SI NADA FUNCIONA - RESET COMPLETO**

```bash
# 1. Verificar estado base
node --version
npm --version

# 2. Reinstalar dependencias MCP
npm install @modelcontextprotocol/sdk

# 3. Recrear archivos MCP desde templates
# (Usar los archivos .js creados anteriormente)

# 4. Reset completo de configuración
cp mcp-config-backup.json mcp-config.json
cp mcp-config-with-terminal.json mcp-config.json

# 5. Reinicio completo
# Cerrar VS Code/Claude Desktop
# Reiniciar aplicaciones
# Verificar Output/Logs

# 6. Test básico final
node diagnose-bridge-mcp.js
```

**🎯 El objetivo es identificar exactamente en qué punto del flujo Claude → Bridge → Copilot → Terminal está fallando.**
