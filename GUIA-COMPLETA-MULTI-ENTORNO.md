# 🎯 GUÍA COMPLETA: Comando `-m` Altamedica Multi-Entorno

## 🏥 Sistema Integrado Claude + Cursor + Warp

El comando `-m` de Altamedica ahora funciona **desde cualquier entorno**, proporcionando acceso unificado al Enhanced Multi-Agent MCP.

---

## 🤖 1. USO DESDE CLAUDE AI

### 📋 Herramientas MCP Disponibles

Claude tiene acceso a **5 herramientas especializadas** para Altamedica:

#### 1. `altamedica_command` - Comando Principal
```
Ejecutar cualquier comando -m desde Claude
Sintaxis: altamedica_command(command="start", context="claude")
```

#### 2. `altamedica_agents_list` - Agentes Médicos
```
Listar 17 agentes especializados de Altamedica
Sintaxis: altamedica_agents_list(format="table", filter="medical")
```

#### 3. `altamedica_quick_status` - Estado Rápido
```
Verificar estado del sistema Altamedica
Sintaxis: altamedica_quick_status(detailed=true)
```

#### 4. `altamedica_compose_app` - Crear Aplicación
```
Componer nueva aplicación médica
Sintaxis: altamedica_compose_app(name="Portal Pacientes", type="fullstack")
```

#### 5. `altamedica_bridge_command` - Comandos Bridge
```
Comandos especiales de integración
Sintaxis: altamedica_bridge_command(command="claude-start")
```

### 🎯 Ejemplos de Uso en Claude

**Iniciar sistema desde Claude:**
```
Por favor usa la herramienta altamedica_command para iniciar el servidor MCP
```

**Listar agentes médicos:**
```
Muéstrame todos los agentes de Altamedica usando altamedica_agents_list
```

**Crear aplicación médica:**
```
Usa altamedica_compose_app para crear una aplicación llamada "EMR Portal" 
tipo fullstack con features: ["patient-portal", "emr-integration", "fhir-compliance"]
```

**Estado del sistema:**
```
Verifica el estado de Altamedica con altamedica_quick_status con detalles
```

---

## 💻 2. USO DESDE CURSOR IDE

### 🔧 Configuración Inicial

1. **Abrir terminal integrado** en Cursor
2. **Cargar integración**:
   ```bash
   cd C:\Users\Eduardo\Documents\devaltamedica
   source cursor-integration.sh
   ```

### 🎮 Comandos Disponibles

```bash
# Comando principal
altamedica start

# Alias disponibles
m start          # Alias corto
altamed agents   # Alias alternativo

# Con autocompletado
altamedica <TAB>  # Muestra comandos disponibles
```

### 🚀 Funciones Específicas de Cursor

```bash
# Iniciar servidor MCP
altamedica start

# Ver agentes con formato Cursor
altamedica agents

# Crear aplicación desde Cursor
altamedica compose "Mi App Médica"

# Estado con logs de Cursor
altamedica status

# Ver logs en formato IDE
altamedica logs
```

### 📁 Integración con Workspace

Cursor automáticamente:
- ✅ Detecta el contexto del IDE
- ✅ Cambia al workspace Altamedica
- ✅ Establece variables de entorno correctas
- ✅ Proporciona autocompletado

---

## 🚀 3. USO DESDE WARP TERMINAL

### ⚡ Configuración Warp

1. **Abrir Warp Terminal**
2. **Cargar configuración**:
   ```bash
   cd C:\Users\Eduardo\Documents\devaltamedica
   source warp-integration.sh
   ```

### 🎨 Características de Warp

```bash
# Bienvenida interactiva
altamedica-welcome

# Comandos con feedback visual
altamedica start     # Con indicadores de progreso
m agents            # Con colores y emojis optimizados
am status           # Alias ultrarrápido
```

### 🎯 Funciones Específicas de Warp

```bash
# Funciones de conveniencia
altamedica-start     # Función dedicada
altamedica-agents    # Lista agentes con formato Warp
altamedica-status    # Estado con visualización mejorada
altamedica-compose "Portal" # Crear app con feedback visual

# Autocompletado avanzado
altamedica <TAB><TAB>  # Sugerencias inteligentes
```

### 🌈 Experiencia Visual Mejorada

Warp proporciona:
- 🎨 **Colores optimizados** para terminal moderno
- ⚡ **Feedback instantáneo** de comandos
- 📊 **Barras de progreso** visuales
- 🔔 **Notificaciones** de estado

---

## 🔄 4. ARQUITECTURA MULTI-ENTORNO

### 🌉 Sistema Bridge

```
Claude AI ←→ altamedica-mcp-tools.js ←→ altamedica-bridge.js ←→ Enhanced MCP
    ↓                                           ↑
Herramientas MCP                     Context Detection
    ↓                                           ↑
Cursor IDE ←→ cursor-integration.sh ←→ altamedica-bridge.js
    ↓                                           ↑
Warp Terminal ←→ warp-integration.sh ←→ altamedica-bridge.js
```

### 🎯 Detección Automática de Contexto

El sistema detecta automáticamente desde dónde se ejecuta:

```javascript
// Variables de entorno automáticas
CLAUDE_CONTEXT="true"    // Desde Claude AI
CURSOR_CONTEXT="true"    // Desde Cursor IDE  
WARP_CONTEXT="true"      // Desde Warp Terminal
```

### 📊 Formatos de Salida Adaptativos

**Claude AI:** Markdown optimizado para chat
**Cursor IDE:** Logs estructurados para IDE
**Warp Terminal:** Colores y emojis para terminal moderno

---

## 🎮 5. COMANDOS UNIFICADOS

### 🚀 Comandos Básicos (Todos los entornos)

```bash
-m start          # 🚀 Iniciar servidor MCP Enhanced Multi-Agent
-m stop           # 🛑 Detener servidor MCP
-m restart        # 🔄 Reiniciar servidor MCP
-m status         # 📊 Estado del sistema y agentes
```

### 🤖 Comandos de Agentes

```bash
-m agents         # 🤖 Listar 17 agentes médicos especializados
-m negotiate      # 🤝 Iniciar negociación entre agentes
-m performance    # 📈 Análisis cognitivo de agentes
```

### 🎼 Comandos de Composición

```bash
-m compose        # 🎼 Crear nueva aplicación médica
-m compose "Mi App"  # Con nombre específico
```

### 🧠 Comandos de Inteligencia

```bash
-m intel          # 🧠 Reporte de inteligencia del sistema
-m health         # 💊 Verificar salud del sistema médico
-m alert          # 🚨 Ver alertas activas
```

### 📊 Comandos de Monitoreo

```bash
-m logs           # 📄 Ver logs del sistema
-m config         # ⚙️ Ver configuración actual
-m version        # 📋 Información del sistema
-m help           # ❓ Ayuda completa
```

---

## 🔧 6. CONFIGURACIÓN CLAUDE DESKTOP

### 📝 Archivo de Configuración

**Ubicación:** `%APPDATA%\Claude\claude_desktop_config.json`

**Contenido actualizado:**
```json
{
  "mcpServers": {
    "enhanced-multi-agent": {
      "command": "node",
      "args": ["C:\\Users\\Eduardo\\Documents\\devaltamedica\\mcp-servers\\enhanced-multi-agent-mcp.js"],
      "env": {
        "CLAUDE_CONTEXT": "true",
        "MCP_PRIMARY_AGENT": "true"
      }
    },
    "altamedica-mcp-tools": {
      "command": "node", 
      "args": ["C:\\Users\\Eduardo\\Documents\\devaltamedica\\altamedica-mcp-tools.js"],
      "env": {
        "CLAUDE_CONTEXT": "true"
      }
    }
  }
}
```

### 🔄 Activación

1. **Copiar configuración** al archivo de Claude Desktop
2. **Reiniciar Claude Desktop** completamente
3. **Verificar herramientas** están disponibles en Claude

---

## 🎯 7. FLUJOS DE TRABAJO

### 🏥 Flujo Médico Completo

```bash
# 1. Desde cualquier entorno
-m start                    # Iniciar sistema

# 2. Verificar agentes médicos
-m agents                   # Ver especialistas disponibles

# 3. Crear aplicación médica
-m compose "EMR Portal"     # Nueva aplicación

# 4. Monitorear desarrollo
-m intel                    # Reporte de inteligencia
-m health                   # Salud del sistema

# 5. Ver progreso
-m logs                     # Logs detallados
```

### 🔄 Flujo de Desarrollo

```bash
# Cursor IDE
altamedica start && altamedica agents

# Warp Terminal  
altamedica-welcome && m status

# Claude AI
"Usa altamedica_command para iniciar y luego altamedica_agents_list"
```

---

## ✅ 8. VERIFICACIÓN DEL SISTEMA

### 🔍 Checklist de Funcionamiento

```bash
# 1. Verificar archivos
ls C:\Users\Eduardo\Documents\devaltamedica\

# 2. Probar comando básico
-m status

# 3. Verificar herramientas Claude
# En Claude: "Usa altamedica_quick_status"

# 4. Probar desde Cursor
altamedica version

# 5. Probar desde Warp
altamedica-welcome
```

### 🚨 Solución de Problemas

**Problema: Comando no encontrado**
```bash
# Solución
cd C:\Users\Eduardo\Documents\devaltamedica
copy m.bat C:\Windows\System32\
```

**Problema: Claude no ve herramientas**
```bash
# Solución
1. Verificar claude_desktop_config.json
2. Reiniciar Claude Desktop completamente
3. Verificar rutas de archivos
```

**Problema: Contexto no detectado**
```bash
# Solución
export CLAUDE_CONTEXT="true"    # Para Claude
export CURSOR_CONTEXT="true"    # Para Cursor
export WARP_CONTEXT="true"      # Para Warp
```

---

## 🎊 RESULTADO FINAL

**🎯 Un solo comando `-m` funciona desde:**
- ✅ **Claude AI** (via herramientas MCP)
- ✅ **Cursor IDE** (via integración terminal)
- ✅ **Warp Terminal** (via funciones avanzadas)
- ✅ **PowerShell/CMD** (via comando nativo)

**🏥 17 agentes médicos especializados accesibles desde cualquier entorno**
**🎼 Enhanced Multi-Agent MCP como núcleo central**
**🌉 Bridge inteligente con detección automática de contexto**

---

*Sistema integrado Altamedica - Comando `-m` universal para desarrollo médico inteligente*
