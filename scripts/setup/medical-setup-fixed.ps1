# 🏥 ALTAMEDICA PLATFORM - SETUP MÉDICO SIMPLIFICADO
# Script de instalación médica para AltaMedica Platform
# Versión: 2.0 - Agosto 2025

# Verificar permisos de administrador
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "🚨 Este script requiere permisos de Administrador" -ForegroundColor Red
    Write-Host "Por favor, ejecuta PowerShell como Administrador y vuelve a ejecutar el script." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "🏥 ALTAMEDICA PLATFORM - SETUP MÉDICO" -ForegroundColor Green -BackgroundColor Black
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""

# Variables de configuración
$ProjectRoot = "C:\Users\Eduardo\Documents\devaltamedica"
$BackupDir = "$ProjectRoot\backups"
$LogsDir = "$ProjectRoot\logs"

# Función para logging con colores
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    
    switch ($Level) {
        "SUCCESS" { Write-Host $LogMessage -ForegroundColor Green }
        "WARNING" { Write-Host $LogMessage -ForegroundColor Yellow }
        "ERROR" { Write-Host $LogMessage -ForegroundColor Red }
        default { Write-Host $LogMessage -ForegroundColor White }
    }
}

# Función para verificar comando
function Test-CommandExists {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# 1. Crear directorios necesarios
Write-Log "📁 Creando estructura de directorios médicos..." "INFO"

$Directories = @(
    "$BackupDir\postgresql",
    "$BackupDir\redis", 
    "$BackupDir\firebase",
    "$LogsDir\medical",
    "$ProjectRoot\config\medical",
    "$ProjectRoot\data\medical"
)

foreach ($Dir in $Directories) {
    if (!(Test-Path $Dir)) {
        try {
            New-Item -ItemType Directory -Path $Dir -Force | Out-Null
            Write-Log "✅ Creado: $Dir" "SUCCESS"
        } catch {
            Write-Log "❌ Error creando $Dir" "ERROR"
        }
    } else {
        Write-Log "ℹ️ Ya existe: $Dir" "INFO"
    }
}

# 2. Verificar Node.js
Write-Log "🔍 Verificando Node.js..." "INFO"
if (Test-CommandExists "node") {
    $NodeVersion = node --version
    Write-Log "✅ Node.js detectado: $NodeVersion" "SUCCESS"
} else {
    Write-Log "❌ Node.js no encontrado" "ERROR"
    Write-Host "📋 Instala Node.js desde: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# 3. Verificar/instalar pnpm
Write-Log "🔍 Verificando pnpm..." "INFO"
if (Test-CommandExists "pnpm") {
    $PnpmVersion = pnpm --version
    Write-Log "✅ pnpm detectado: v$PnpmVersion" "SUCCESS"
} else {
    Write-Log "⚠️ pnpm no encontrado. Instalando..." "WARNING"
    try {
        npm install -g pnpm@latest
        Write-Log "✅ pnpm instalado exitosamente" "SUCCESS"
    } catch {
        Write-Log "❌ Error instalando pnpm" "ERROR"
        exit 1
    }
}

# 4. Instalar dependencias del proyecto
Write-Log "📦 Instalando dependencias del proyecto..." "INFO"
try {
    Set-Location $ProjectRoot
    Write-Log "📍 Directorio actual: $PWD" "INFO"
    
    # Instalar dependencias
    Write-Log "📦 Ejecutando pnpm install..." "INFO"
    pnpm install
    
    # Construir paquetes
    Write-Log "🏗️ Construyendo paquetes médicos..." "INFO"
    pnpm build
    
    Write-Log "✅ Dependencias instaladas y paquetes construidos" "SUCCESS"
} catch {
    Write-Log "❌ Error en instalación de dependencias" "ERROR"
    Write-Log "Error: $($_.Exception.Message)" "ERROR"
}

# 5. Configurar variables de entorno médicas
Write-Log "🌍 Configurando variables de entorno médicas..." "INFO"

$EnvVars = @{
    "MEDICAL_MONITORING_ENABLED" = "true"
    "HIPAA_COMPLIANCE_ENABLED" = "true"
    "BACKUP_ENCRYPTION_ENABLED" = "true"
    "POSTGRES_HOST" = "localhost"
    "POSTGRES_PORT" = "5432"
    "REDIS_HOST" = "localhost"
    "REDIS_PORT" = "6379"
}

foreach ($Var in $EnvVars.GetEnumerator()) {
    try {
        [System.Environment]::SetEnvironmentVariable($Var.Key, $Var.Value, [System.EnvironmentVariableTarget]::User)
        Write-Log "✅ Variable configurada: $($Var.Key) = $($Var.Value)" "SUCCESS"
    } catch {
        Write-Log "❌ Error configurando $($Var.Key)" "ERROR"
    }
}

# 6. Crear configuración médica básica
Write-Log "📄 Creando configuración médica..." "INFO"

$SetupDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$MedicalConfig = @{
    project = "AltaMedica Medical Platform"
    version = "2.0"
    setup_date = $SetupDate
    medical_compliance = @{
        hipaa_enabled = $true
        phi_encryption = $true
        audit_logging = $true
    }
    applications = @{
        web_app = @{ port = 3000; critical = $true }
        api_server = @{ port = 3001; critical = $true }
        doctors_app = @{ port = 3002; critical = $true }
        patients_app = @{ port = 3003; critical = $true }
        companies_app = @{ port = 3004; critical = $false }
        admin_app = @{ port = 3005; critical = $false }
    }
}

try {
    $ConfigPath = "$ProjectRoot\medical-config.json"
    $MedicalConfig | ConvertTo-Json -Depth 4 | Out-File -FilePath $ConfigPath -Encoding UTF8
    Write-Log "✅ Configuración médica creada: $ConfigPath" "SUCCESS"
} catch {
    Write-Log "❌ Error creando configuración médica" "ERROR"
}

# 7. Verificar PostgreSQL (opcional)
Write-Log "🐘 Verificando PostgreSQL..." "INFO"
if (Test-CommandExists "psql") {
    try {
        $PgVersion = psql --version
        Write-Log "✅ PostgreSQL detectado: $PgVersion" "SUCCESS"
    } catch {
        Write-Log "⚠️ PostgreSQL instalado pero no configurado" "WARNING"
    }
} else {
    Write-Log "❌ PostgreSQL no encontrado" "ERROR"
    Write-Host "📋 Instala PostgreSQL desde: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
}

# 8. Verificar Redis (opcional)
Write-Log "🔴 Verificando Redis..." "INFO"
if (Test-CommandExists "redis-cli") {
    try {
        $RedisTest = redis-cli ping 2>$null
        if ($RedisTest -eq "PONG") {
            Write-Log "✅ Redis funcionando correctamente" "SUCCESS"
        } else {
            Write-Log "⚠️ Redis instalado pero no está corriendo" "WARNING"
        }
    } catch {
        Write-Log "⚠️ Redis no configurado correctamente" "WARNING"
    }
} else {
    Write-Log "❌ Redis no encontrado" "ERROR"
    Write-Host "📋 Instala Redis: choco install redis-64" -ForegroundColor Yellow
}

# 9. Ejecutar verificación de sistema
Write-Log "📊 Ejecutando verificación del sistema..." "INFO"
$MonitoringScript = "$ProjectRoot\scripts\monitoring\medical-monitoring.js"
if (Test-Path $MonitoringScript) {
    try {
        node $MonitoringScript
        Write-Log "✅ Verificación del sistema completada" "SUCCESS"
    } catch {
        Write-Log "⚠️ Error en verificación del sistema" "WARNING"
    }
} else {
    Write-Log "⚠️ Script de monitoreo no encontrado" "WARNING"
}

# MOSTRAR PRÓXIMOS PASOS
Write-Host ""
Write-Host "🎉 SETUP DE ALTAMEDICA PLATFORM COMPLETADO" -ForegroundColor Green -BackgroundColor Black
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. 🚀 INICIAR APLICACIONES MÉDICAS:" -ForegroundColor Cyan
Write-Host "   pnpm dev:min                    # Aplicaciones mínimas" -ForegroundColor White
Write-Host "   node start-all-servers.js       # Todas las aplicaciones" -ForegroundColor White
Write-Host ""

Write-Host "2. 🌐 ACCEDER A LAS APLICACIONES:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000           # Web App (Gateway)" -ForegroundColor White
Write-Host "   http://localhost:3002           # Doctors Portal" -ForegroundColor White
Write-Host "   http://localhost:3003           # Patients Portal" -ForegroundColor White
Write-Host ""

Write-Host "3. 📊 VERIFICAR ESTADO:" -ForegroundColor Cyan
Write-Host "   node scripts\monitoring\medical-monitoring.js" -ForegroundColor White
Write-Host ""

Write-Host "4. 📄 CONFIGURACIÓN:" -ForegroundColor Cyan
Write-Host "   medical-config.json             # Configuración médica" -ForegroundColor White
Write-Host ""

Write-Host "⚠️ IMPORTANTE:" -ForegroundColor Red
Write-Host "   - Reinicia PowerShell para aplicar variables de entorno" -ForegroundColor Yellow
Write-Host "   - Instala PostgreSQL y Redis si no están disponibles" -ForegroundColor Yellow
Write-Host "   - Configura Firebase con tus credenciales" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 AltaMedica Platform está listo para desarrollo!" -ForegroundColor Green

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")