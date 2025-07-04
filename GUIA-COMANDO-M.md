# 🏥 ALTAMEDICA MCP CLI - Guía de Uso

## Comando Principal: `-m`

El comando `-m` es el **punto crucial** de interacción con el Enhanced Multi-Agent MCP de Altamedica.

### 🚀 Instalación Rápida

1. **Copiar archivo a PATH del sistema** (Recomendado):
   ```cmd
   copy "C:\Users\Eduardo\Documents\devaltamedica\m.bat" "C:\Windows\System32\m.bat"
   ```

2. **O usar desde el workspace**:
   ```cmd
   cd C:\Users\Eduardo\Documents\devaltamedica
   ```

### 🎯 Comandos Básicos

```cmd
# 🚀 OPERACIONES BÁSICAS
-m start          # Iniciar servidor MCP Enhanced Multi-Agent
-m stop           # Detener servidor MCP  
-m status         # Ver estado del sistema y agentes
-m restart        # Reiniciar servidor MCP

# 🤖 GESTIÓN DE AGENTES
-m agents         # Listar 17 agentes especializados de Altamedica
-m negotiate      # Iniciar negociación entre agentes
-m performance    # Análisis cognitivo de agentes

# 🎼 COMPOSICIÓN DE APLICACIONES
-m compose        # Crear nueva aplicación médica
-m compose "Mi App"  # Crear con nombre específico

# 🧠 INTELIGENCIA DEL SISTEMA
-m intel          # Reporte de inteligencia del sistema
-m health         # Verificar salud del sistema médico
-m alert          # Ver alertas activas

# 📊 MONITOREO Y LOGS
-m logs           # Ver logs del sistema
-m config         # Ver configuración actual
-m version        # Información del sistema
-m help           # Ayuda completa
```

### 🏥 Ejemplos de Uso Médico

```cmd
# Inicio rápido del sistema médico
-m start

# Verificar que todos los agentes médicos están disponibles
-m agents

# Ver estado de salud del sistema
-m health

# Crear una nueva aplicación médica
-m compose "Portal de Pacientes"

# Obtener reporte de inteligencia médica
-m intel

# Ver logs de actividad médica
-m logs
```

### 🎨 Características del CLI

- **🌈 Interfaz colorida** para fácil lectura
- **📋 17 agentes médicos** especializados listados
- **🔍 Monitoreo en tiempo real** del sistema
- **📄 Logging automático** de todas las operaciones
- **⚙️ Configuración** visible y modificable
- **🚨 Alertas** del sistema médico
- **💊 Verificación de salud** específica para healthcare

### 🔧 Configuración Automática

El CLI está preconfigurado para:
- **Workspace**: `C:\Users\Eduardo\Documents\devaltamedica`
- **MCP Server**: `enhanced-multi-agent-mcp.js`
- **Logs**: `altamedica-cli.log`
- **Entorno**: Desarrollo médico

### 📱 Uso desde Cualquier Ubicación

Una vez instalado en PATH:
```cmd
# Desde cualquier directorio
C:\> -m start
C:\Users\> -m agents  
D:\Projects\> -m status
```

### 🎯 Flujo de Trabajo Típico

1. **Iniciar sistema**: `-m start`
2. **Verificar agentes**: `-m agents`
3. **Componer aplicación**: `-m compose "Mi App Médica"`
4. **Monitorear**: `-m status` y `-m logs`
5. **Obtener insights**: `-m intel`

### 🚨 Solución de Problemas

```cmd
# Si hay problemas
-m status         # Verificar estado
-m logs           # Ver errores en logs
-m restart        # Reiniciar sistema
-m config         # Verificar configuración
```

### 💡 Notas Importantes

- **Ejecuta como Administrador** si hay problemas de permisos
- **Node.js requerido** en el sistema
- **Workspace debe existir** en la ruta configurada
- **Logs automáticos** para debugging y auditoría

---

El comando `-m` es su **interfaz principal** con el Enhanced Multi-Agent MCP, diseñado específicamente para el ecosistema médico de Altamedica.
