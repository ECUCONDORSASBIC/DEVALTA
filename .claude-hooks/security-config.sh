# 🔒 CONFIGURACIÓN DE SEGURIDAD PARA HOOKS DE CLAUDE
# Este archivo define las políticas de seguridad para hooks médicos

# Herramientas bloqueadas completamente (muy peligrosas)
BLOCKED_TOOLS=(
    "format_disk"
    "delete_database" 
    "shutdown_system"
)

# Comandos peligrosos a bloquear
DANGEROUS_COMMANDS=(
    "rm -rf /"
    "del /s /q C:\\"
    "format c:"
    "DROP DATABASE"
    "TRUNCATE TABLE"
)

# Archivos críticos que requieren validación extra
CRITICAL_FILES=(
    ".env"
    ".env.production"
    "firebase-admin-key.json"
    "database.config.js"
    "secrets.json"
)

# Patrones de datos sensibles a detectar
SENSITIVE_PATTERNS=(
    "password.*=.*"
    "secret.*=.*"
    "api.*key.*=.*"
    "patient.*id.*[0-9]+"
    "medical.*record.*[0-9]+"
    "social.*security.*[0-9]+"
)

# Configuración de logging
LOG_RETENTION_DAYS=7
MAX_LOG_SIZE_MB=10

# Configuración de notificaciones
ENABLE_SECURITY_ALERTS=true
ALERT_EMAIL="security@altamedica.com"

# Configuración específica para desarrollo médico
HIPAA_COMPLIANCE_MODE=true
AUDIT_ALL_ACTIONS=true
REQUIRE_JUSTIFICATION_FOR_SENSITIVE_OPERATIONS=true

echo "🔒 Configuración de seguridad cargada para desarrollo médico"
