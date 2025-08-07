# 🛡️ HOOKS SEGUROS PARA DESARROLLO MÉDICO

## ⚠️ ADVERTENCIA DE SEGURIDAD

Estos hooks han sido diseñados específicamente para desarrollo médico seguro y compliance HIPAA. **LEE COMPLETAMENTE** antes de usar.

## 🔧 Hooks Implementados

### 1. `session-start.ps1` / `session-start.sh`
- ✅ **SEGURO**: Solo muestra información del entorno
- 🎯 **Propósito**: Inicializar desarrollo médico seguro
- 🔍 **Qué hace**: Verifica entorno, dependencias, recordatorios de seguridad

### 2. `pre-tool-use.sh`
- ⚠️ **VALIDACIÓN**: Revisa cada acción antes de ejecutar
- 🎯 **Propósito**: Prevenir acciones peligrosas o exposición de datos
- 🔍 **Qué hace**: Detecta comandos peligrosos, información sensible

### 3. `post-tool-use.sh`
- 🧹 **CLEANUP**: Limpia archivos temporales y logs
- 🎯 **Propósito**: Mantener entorno limpio y seguro
- 🔍 **Qué hace**: Logging seguro, limpieza, verificación de integridad

### 4. `notification.sh`
- 📢 **FILTRADO**: Procesa notificaciones de forma segura
- 🎯 **Propósito**: Evitar exposición de información en notificaciones
- 🔍 **Qué hace**: Sanitiza contenido, logging seguro

## 🔒 Características de Seguridad

### ✅ **LO QUE SÍ HACEN** (Seguro):
- Verifican entorno de desarrollo
- Muestran información de estado
- Limpian archivos temporales
- Detectan posibles problemas de seguridad
- Mantienen logs auditables
- Recuerdan mejores prácticas HIPAA

### ❌ **LO QUE NO HACEN** (Protecciones):
- No ejecutan comandos destructivos
- No acceden a datos reales de pacientes
- No modifican configuración de producción
- No exponen información sensible en logs
- No realizan operaciones de red no autorizadas

## 🚨 RESPONSABILIDADES DEL DESARROLLADOR

### ✅ **DEBES**:
- Revisar logs regularmente en `.claude-hooks/`
- Usar solo datos de prueba en desarrollo
- Mantener compliance HIPAA
- Reportar cualquier comportamiento extraño

### ❌ **NO DEBES**:
- Usar datos reales de pacientes en desarrollo
- Deshabilitar validaciones de seguridad
- Ignorar alertas de seguridad
- Modificar hooks sin revisión

## 📁 Estructura de Archivos

```
.claude-hooks/
├── session-start.ps1      # Hook de inicio (Windows)
├── session-start.sh       # Hook de inicio (Linux/Mac)
├── pre-tool-use.sh        # Validación previa
├── post-tool-use.sh       # Cleanup posterior
├── notification.sh        # Filtrado de notificaciones
├── security-config.sh     # Configuración de seguridad
├── action-log.txt         # Log de acciones (auto-generado)
├── notifications.log      # Log de notificaciones (auto-generado)
└── README.md             # Este archivo
```

## 🔍 Monitoreo y Auditoría

### Logs Generados:
- `action-log.txt`: Registro de todas las acciones de Claude
- `notifications.log`: Registro sanitizado de notificaciones

### Retención:
- Logs se mantienen por 7 días
- Tamaño máximo: 10MB por archivo
- Rotación automática

## 🆘 En Caso de Problemas

### Si detectas comportamiento sospechoso:
1. **PARA** inmediatamente el desarrollo
2. **REVISA** los logs en `.claude-hooks/`
3. **REPORTA** a security@altamedica.com
4. **DOCUMENTA** el incidente

### Para deshabilitar hooks temporalmente:
```bash
# Renombrar directorio para deshabilitar
mv .claude-hooks .claude-hooks-disabled
```

## 📞 Contacto de Seguridad

- **Email**: security@altamedica.com
- **Slack**: #security-medical-dev
- **Escalación**: CTO - Eduardo Altamedica

---

⚠️ **RECORDATORIO**: Estos hooks son para DESARROLLO únicamente. 
**NUNCA** usar en producción con datos reales de pacientes.
