# 🏥 ALTAMEDICA PLATFORM - COMPLETE MEDICAL SETUP
# Script completo de instalación y configuración para plataforma médica
# Desarrollado por Eduardo Marques, MD
# Última actualización: 8 de agosto de 2025

# Verificar que se ejecuta como Administrador
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "🚨 Este script requiere permisos de Administrador" -ForegroundColor Red
    Write-Host "Por favor, ejecuta PowerShell como Administrador y vuelve a ejecutar el script." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "🏥 ALTAMEDICA PLATFORM - SETUP COMPLETO" -ForegroundColor Green -BackgroundColor Black
Write-Host "=" * 60 -ForegroundColor Green
Write-Host ""

# Variables de configuración
$ProjectRoot = "C:\Users\Eduardo\Documents\devaltamedica"
$BackupDir = "$ProjectRoot\backups"
$LogsDir = "$ProjectRoot\logs"
$DataDir = "$ProjectRoot\data"

# Función para logging
function Write-MedicalLog {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    Write-Host $LogMessage -ForegroundColor $(
        switch ($Level) {
            "INFO" { "White" }
            "SUCCESS" { "Green" }
            "WARNING" { "Yellow" }
            "ERROR" { "Red" }
            default { "White" }
        }
    )
    
    # Guardar en archivo de log
    $LogFile = "$LogsDir\medical-setup.log"
    if (!(Test-Path $LogsDir)) { New-Item -ItemType Directory -Path $LogsDir -Force | Out-Null }
    $LogMessage | Out-File -FilePath $LogFile -Append -Encoding UTF8
}

# Función para verificar comando
function Test-CommandExists {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Función para crear directorios necesarios
function New-MedicalDirectories {
    Write-MedicalLog "📁 Creando estructura de directorios médicos..." "INFO"
    
    $Directories = @(
        "$BackupDir\postgresql",
        "$BackupDir\redis",
        "$BackupDir\firebase",
        "$LogsDir\redis",
        "$LogsDir\postgresql",
        "$LogsDir\medical-monitoring",
        "$DataDir\redis-cluster",
        "$DataDir\medical-metrics",
        "$ProjectRoot\config\redis",
        "$ProjectRoot\config\postgresql",
        "$ProjectRoot\docs\architecture"
    )
    
    foreach ($Dir in $Directories) {
        if (!(Test-Path $Dir)) {
            try {
                New-Item -ItemType Directory -Path $Dir -Force | Out-Null
                Write-MedicalLog "✅ Creado: $Dir" "SUCCESS"
            } catch {
                Write-MedicalLog "❌ Error creando $Dir : $($_.Exception.Message)" "ERROR"
            }
        } else {
            Write-MedicalLog "ℹ️ Ya existe: $Dir" "INFO"
        }
    }
}

# Función para verificar Node.js
function Test-NodeJS {
    Write-MedicalLog "🔍 Verificando Node.js..." "INFO"
    
    if (Test-CommandExists "node") {
        $NodeVersion = node --version
        Write-MedicalLog "✅ Node.js detectado: $NodeVersion" "SUCCESS"
        
        # Verificar versión mínima (18.x)
        $Version = [Version]($NodeVersion -replace 'v', '')
        if ($Version.Major -ge 18) {
            Write-MedicalLog "✅ Versión de Node.js compatible para plataforma médica" "SUCCESS"
            return $true
        } else {
            Write-MedicalLog "⚠️ Node.js versión $NodeVersion detectada. Se recomienda v18+ para AltaMedica" "WARNING"
            return $false
        }
    } else {
        Write-MedicalLog "❌ Node.js no encontrado. Instalación requerida." "ERROR"
        Write-Host ""
        Write-Host "📋 Para instalar Node.js:" -ForegroundColor Yellow
        Write-Host "1. Ve a https://nodejs.org" -ForegroundColor White
        Write-Host "2. Descarga la versión LTS (18.x o superior)" -ForegroundColor White
        Write-Host "3. Ejecuta el instalador y reinicia PowerShell" -ForegroundColor White
        Write-Host "4. Vuelve a ejecutar este script" -ForegroundColor White
        return $false
    }
}

# Función para verificar pnpm
function Test-PNPM {
    Write-MedicalLog "🔍 Verificando pnpm..." "INFO"
    
    if (Test-CommandExists "pnpm") {
        $PnpmVersion = pnpm --version
        Write-MedicalLog "✅ pnpm detectado: v$PnpmVersion" "SUCCESS"
        return $true
    } else {
        Write-MedicalLog "⚠️ pnpm no encontrado. Instalando..." "WARNING"
        try {
            npm install -g pnpm@latest
            Write-MedicalLog "✅ pnpm instalado exitosamente" "SUCCESS"
            return $true
        } catch {
            Write-MedicalLog "❌ Error instalando pnpm: $($_.Exception.Message)" "ERROR"
            return $false
        }
    }
}

# Función para instalar dependencias del proyecto
function Install-ProjectDependencies {
    Write-MedicalLog "📦 Instalando dependencias del proyecto médico..." "INFO"
    
    try {
        Set-Location $ProjectRoot
        Write-MedicalLog "📍 Directorio actual: $PWD" "INFO"
        
        # Instalar dependencias raíz
        Write-MedicalLog "📦 Instalando dependencias con pnpm..." "INFO"
        pnpm install
        
        # Construir paquetes compartidos
        Write-MedicalLog "🏗️ Construyendo paquetes médicos compartidos..." "INFO"
        pnpm build
        
        Write-MedicalLog "✅ Dependencias y build completados" "SUCCESS"
        return $true
    } catch {
        Write-MedicalLog "❌ Error en instalación: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Función para configurar backups automáticos
function Setup-MedicalBackups {
    Write-MedicalLog "💾 Configurando sistema de backup médico..." "INFO"
    
    try {
        # Ejecutar script de configuración de backup
        $BackupScript = "$ProjectRoot\scripts\database\setup-backup-scheduler.js"
        if (Test-Path $BackupScript) {
            node $BackupScript
            Write-MedicalLog "✅ Sistema de backup médico configurado" "SUCCESS"
            
            # Instalar tareas programadas de Windows
            $TasksDir = "$ProjectRoot\scripts\database\windows-tasks"
            if (Test-Path "$TasksDir\install-backup-tasks.ps1") {
                Write-MedicalLog "📅 Instalando tareas programadas de backup..." "INFO"
                & "$TasksDir\install-backup-tasks.ps1"
                Write-MedicalLog "✅ Tareas programadas instaladas" "SUCCESS"
            }
        } else {
            Write-MedicalLog "⚠️ Script de backup no encontrado" "WARNING"
        }
    } catch {
        Write-MedicalLog "❌ Error configurando backups: $($_.Exception.Message)" "ERROR"
    }
}

# Función para ejecutar monitoreo médico inicial
function Test-MedicalMonitoring {
    Write-MedicalLog "📊 Ejecutando verificación inicial del sistema médico..." "INFO"
    
    try {
        $MonitoringScript = "$ProjectRoot\scripts\monitoring\medical-monitoring.js"
        if (Test-Path $MonitoringScript) {
            node $MonitoringScript
            Write-MedicalLog "✅ Monitoreo médico ejecutado exitosamente" "SUCCESS"
        } else {
            Write-MedicalLog "⚠️ Script de monitoreo no encontrado" "WARNING"
        }
    } catch {
        Write-MedicalLog "❌ Error en monitoreo médico: $($_.Exception.Message)" "ERROR"
    }
}

# Función para verificar PostgreSQL
function Test-PostgreSQL {
    Write-MedicalLog "🐘 Verificando PostgreSQL..." "INFO"
    
    if (Test-CommandExists "psql") {
        try {
            $PgVersion = psql --version
            Write-MedicalLog "✅ PostgreSQL detectado: $PgVersion" "SUCCESS"
            return $true
        } catch {
            Write-MedicalLog "⚠️ PostgreSQL instalado pero no configurado correctamente" "WARNING"
            return $false
        }
    } else {
        Write-MedicalLog "❌ PostgreSQL no encontrado" "ERROR"
        Write-Host ""
        Write-Host "📋 Para instalar PostgreSQL:" -ForegroundColor Yellow
        Write-Host "1. Ve a https://www.postgresql.org/download/windows/" -ForegroundColor White
        Write-Host "2. Descarga PostgreSQL 15 o superior" -ForegroundColor White
        Write-Host "3. Durante la instalación, configura:" -ForegroundColor White
        Write-Host "   - Usuario: altamedica" -ForegroundColor White
        Write-Host "   - Password: altamedica123" -ForegroundColor White
        Write-Host "   - Base de datos: altamedica" -ForegroundColor White
        Write-Host "4. Agrega PostgreSQL al PATH del sistema" -ForegroundColor White
        return $false
    }
}

# Función para verificar Redis
function Test-Redis {
    Write-MedicalLog "🔴 Verificando Redis..." "INFO"
    
    if (Test-CommandExists "redis-cli") {
        try {
            $RedisTest = redis-cli ping 2>$null
            if ($RedisTest -eq "PONG") {
                Write-MedicalLog "✅ Redis funcionando correctamente" "SUCCESS"
                return $true
            } else {
                Write-MedicalLog "⚠️ Redis instalado pero no está corriendo" "WARNING"
                return $false
            }
        } catch {
            Write-MedicalLog "⚠️ Redis instalado pero no configurado correctamente" "WARNING"
            return $false
        }
    } else {
        Write-MedicalLog "❌ Redis no encontrado" "ERROR"
        Write-Host ""
        Write-Host "📋 Para instalar Redis en Windows:" -ForegroundColor Yellow
        Write-Host "1. Ve a https://github.com/microsoftarchive/redis/releases" -ForegroundColor White
        Write-Host "2. Descarga Redis-x64-x.x.x.msi" -ForegroundColor White
        Write-Host "3. Instala Redis como servicio de Windows" -ForegroundColor White
        Write-Host "4. Configura para inicio automático" -ForegroundColor White
        Write-Host ""
        Write-Host "📋 Alternativa con Chocolatey:" -ForegroundColor Yellow
        Write-Host "choco install redis-64" -ForegroundColor White
        return $false
    }
}

# Función para configurar variables de entorno
function Set-MedicalEnvironment {
    Write-MedicalLog "🌍 Configurando variables de entorno médicas..." "INFO"
    
    $EnvVars = @{
        "POSTGRES_HOST" = "localhost"
        "POSTGRES_PORT" = "5432"
        "POSTGRES_DB" = "altamedica"
        "POSTGRES_USER" = "altamedica"
        "REDIS_HOST" = "localhost"
        "REDIS_PORT" = "6379"
        "MEDICAL_MONITORING_ENABLED" = "true"
        "HIPAA_COMPLIANCE_ENABLED" = "true"
        "BACKUP_ENCRYPTION_ENABLED" = "true"
    }
    
    foreach ($Var in $EnvVars.GetEnumerator()) {
        try {
            [System.Environment]::SetEnvironmentVariable($Var.Key, $Var.Value, [System.EnvironmentVariableTarget]::User)
            Write-MedicalLog "✅ Variable configurada: $($Var.Key) = $($Var.Value)" "SUCCESS"
        } catch {
            Write-MedicalLog "❌ Error configurando $($Var.Key): $($_.Exception.Message)" "ERROR"
        }
    }
    
    Write-MedicalLog "ℹ️ Reinicia PowerShell para aplicar las variables de entorno" "INFO"
}

# Función para crear archivo de configuración médica
function New-MedicalConfiguration {
    Write-MedicalLog "📄 Creando configuración médica..." "INFO"
    
    $SetupDate = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $ConfigContent = @"
{
  `"project`": `"AltaMedica Medical Platform`",
  `"version`": `"2.0`",
  `"setup_date`": `"$SetupDate`",
  `"medical_compliance`": {
    `"hipaa_enabled`": true,
    `"phi_encryption`": true,
    `"audit_logging`": true,
    `"backup_retention_years`": 7
  },
  `"applications`": {
    `"web_app`": { `"port`": 3000, `"critical`": true },
    `"api_server`": { `"port`": 3001, `"critical`": true },
    `"doctors_app`": { `"port`": 3002, `"critical`": true },
    `"patients_app`": { `"port`": 3003, `"critical`": true },
    `"companies_app`": { `"port`": 3004, `"critical`": false },
    `"admin_app`": { `"port`": 3005, `"critical`": false },
    `"signaling_server`": { `"port`": 8888, `"critical`": true }
  },
  `"databases`": {
    `"postgresql`": {
      `"host`": `"localhost`",
      `"port`": 5432,
      `"database`": `"altamedica`",
      `"backup_enabled`": true
    },
    `"redis`": {
      `"host`": `"localhost`", 
      `"port`": 6379,
      `"cluster_enabled`": false,
      `"backup_enabled`": true
    },
    `"firebase`": {
      `"project_id`": `"altamedica-apis`",
      `"auth_enabled`": true,
      `"firestore_enabled`": true
    }
  },
  `"monitoring`": {
    `"medical_metrics`": true,
    `"hipaa_compliance_checks`": true,
    `"emergency_alerts`": true,
    `"performance_monitoring`": true
  }
}
"@
    
    $ConfigPath = "$ProjectRoot\medical-config.json"
    try {
        $ConfigContent | Out-File -FilePath $ConfigPath -Encoding UTF8
        Write-MedicalLog "✅ Configuración médica creada: $ConfigPath" "SUCCESS"
    } catch {
        Write-MedicalLog "❌ Error creando configuración: $($_.Exception.Message)" "ERROR"
    }
}

# Función para mostrar próximos pasos
function Show-NextSteps {
    Write-Host ""
    Write-Host "🎉 SETUP DE ALTAMEDICA PLATFORM COMPLETADO" -ForegroundColor Green -BackgroundColor Black
    Write-Host "=" * 60 -ForegroundColor Green
    Write-Host ""
    
    Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "1. 📊 VERIFICAR ESTADO DEL SISTEMA:" -ForegroundColor Cyan
    Write-Host "   node scripts\monitoring\medical-monitoring.js" -ForegroundColor White
    Write-Host ""
    
    Write-Host "2. 🚀 INICIAR APLICACIONES MÉDICAS:" -ForegroundColor Cyan
    Write-Host "   pnpm dev:min                    # Aplicaciones mínimas" -ForegroundColor White
    Write-Host "   # O iniciar todas:" -ForegroundColor Gray
    Write-Host "   node start-all-servers.js       # Todas las aplicaciones" -ForegroundColor White
    Write-Host ""
    
    Write-Host "3. 🌐 ACCEDER A LAS APLICACIONES:" -ForegroundColor Cyan
    Write-Host "   http://localhost:3000           # Web App (Gateway)" -ForegroundColor White
    Write-Host "   http://localhost:3002           # Doctors Portal" -ForegroundColor White
    Write-Host "   http://localhost:3003           # Patients Portal" -ForegroundColor White
    Write-Host "   http://localhost:3000/test-api  # API Testing Dashboard" -ForegroundColor White
    Write-Host ""
    
    Write-Host "4. 📊 MONITOREO Y ARQUITECTURA:" -ForegroundColor Cyan
    Write-Host "   .\docs\architecture\MONITORING_DASHBOARD.html  # Dashboard Visual" -ForegroundColor White
    Write-Host "   .\docs\architecture\ARCHITECTURE_OVERVIEW.md   # Arquitectura Completa" -ForegroundColor White
    Write-Host ""
    
    Write-Host "5. 💾 VERIFICAR BACKUPS:" -ForegroundColor Cyan
    Write-Host "   node scripts\database\backup-monitor.js" -ForegroundColor White
    Write-Host ""
    
    Write-Host "6. 🔴 CONFIGURAR REDIS CLUSTER (OPCIONAL):" -ForegroundColor Cyan
    Write-Host "   node scripts\redis\setup-redis-cluster.js" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🏥 DOCUMENTACIÓN:" -ForegroundColor Yellow
    Write-Host "   📋 Arquitectura completa: docs\architecture\ARCHITECTURE_OVERVIEW.md" -ForegroundColor White
    Write-Host "   📊 Dashboard interactivo: docs\architecture\MONITORING_DASHBOARD.html" -ForegroundColor White
    Write-Host "   🔧 Configuración: medical-config.json" -ForegroundColor White
    Write-Host ""
    
    Write-Host "⚠️ IMPORTANTE:" -ForegroundColor Red
    Write-Host "   - Reinicia PowerShell para aplicar variables de entorno" -ForegroundColor Yellow
    Write-Host "   - Instala PostgreSQL y Redis si no están disponibles" -ForegroundColor Yellow
    Write-Host "   - Configura Firebase con tus credenciales de proyecto" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "🚀 AltaMedica Platform está listo para desarrollo médico empresarial!" -ForegroundColor Green
}

# Función principal
function Start-MedicalSetup {
    try {
        Write-MedicalLog "🏥 Iniciando setup completo de AltaMedica Platform..." "INFO"
        
        # 1. Crear directorios
        New-MedicalDirectories
        
        # 2. Verificar Node.js
        if (-not (Test-NodeJS)) {
            Write-MedicalLog "❌ Setup interrumpido: Node.js requerido" "ERROR"
            return $false
        }
        
        # 3. Verificar/instalar pnpm
        if (-not (Test-PNPM)) {
            Write-MedicalLog "❌ Setup interrumpido: pnpm requerido" "ERROR"
            return $false
        }
        
        # 4. Instalar dependencias del proyecto
        if (-not (Install-ProjectDependencies)) {
            Write-MedicalLog "❌ Setup interrumpido: Error en dependencias" "ERROR"
            return $false
        }
        
        # 5. Configurar backups médicos
        Setup-MedicalBackups
        
        # 6. Configurar variables de entorno
        Set-MedicalEnvironment
        
        # 7. Crear configuración médica
        New-MedicalConfiguration
        
        # 8. Verificar bases de datos (opcional)
        Test-PostgreSQL
        Test-Redis
        
        # 9. Ejecutar monitoreo inicial
        Test-MedicalMonitoring
        
        Write-MedicalLog "✅ Setup de AltaMedica Platform completado exitosamente!" "SUCCESS"
        
        # 10. Mostrar próximos pasos
        Show-NextSteps
        
        return $true
        
    } catch {
        Write-MedicalLog "❌ Error crítico en setup: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# EJECUCIÓN PRINCIPAL
try {
    $SetupSuccess = Start-MedicalSetup
    
    if ($SetupSuccess) {
        Write-Host ""
        Write-Host "🎉 SETUP COMPLETADO EXITOSAMENTE" -ForegroundColor Green
        Write-Host "Log completo disponible en: $LogsDir\medical-setup.log" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ SETUP INCOMPLETO" -ForegroundColor Red
        Write-Host "Revisa el log para más detalles: $LogsDir\medical-setup.log" -ForegroundColor Yellow
    }
} catch {
    Write-Host "💥 ERROR CRÍTICO EN SETUP: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    Write-Host ""
    Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# EOF - AltaMedica Platform Complete Medical Setup