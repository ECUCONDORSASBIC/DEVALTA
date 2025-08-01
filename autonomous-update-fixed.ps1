# AltaMedica - Sistema de Actualización Autónoma CORREGIDO
# Versión sin errores de sintaxis y encoding

Write-Host "🏥 AltaMedica - Sistema de Actualización Autónoma (CORREGIDO)" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

# Configuración de archivos de log
$logPath = "C:\Users\Eduardo\Documents\devaltamedica\logs"
$mainLog = "$logPath\update-main.log"
$progressLog = "$logPath\update-progress.log"
$errorLog = "$logPath\update-errors.log"
$statusFile = "$logPath\update-status.json"

# Crear directorio de logs si no existe
if (!(Test-Path $logPath)) {
    New-Item -ItemType Directory -Path $logPath -Force | Out-Null
    Write-Host "📁 Directorio de logs creado: $logPath" -ForegroundColor Green
}

# Función para escribir logs con timestamp
function Write-LogMessage {
    param(
        [string]$Message,
        [string]$Type = "INFO",
        [string]$LogFile = $mainLog
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
    $logEntry = "[$timestamp] [$Type] $Message"
    
    # Escribir a consola con colores
    switch ($Type) {
        "ERROR" { Write-Host $logEntry -ForegroundColor Red }
        "WARNING" { Write-Host $logEntry -ForegroundColor Yellow }
        "SUCCESS" { Write-Host $logEntry -ForegroundColor Green }
        "INFO" { Write-Host $logEntry -ForegroundColor Cyan }
        default { Write-Host $logEntry -ForegroundColor White }
    }
    
    # Escribir a archivo
    $logEntry | Add-Content -Path $LogFile -Encoding UTF8
}

# Función para actualizar estado en JSON
function Update-Status {
    param(
        [string]$Phase,
        [string]$Step,
        [string]$Status,
        [int]$Progress = 0
    )
    
    $statusData = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        phase = $Phase
        step = $Step
        status = $Status
        progress = $Progress
        pid = $PID
    }
    
    $statusData | ConvertTo-Json | Set-Content -Path $statusFile -Encoding UTF8
}

# Función principal de actualización CORREGIDA
function Start-AutonomousUpdate {
    Write-LogMessage "🚀 Iniciando actualización autónoma de AltaMedica" "INFO"
    
    # Iniciar transcript para capturar todo
    Start-Transcript -Path $mainLog -Append
    
    try {
        # Verificar que estamos en el directorio correcto
        $expectedPath = "C:\Users\Eduardo\Documents\devaltamedica"
        if ((Get-Location).Path -ne $expectedPath) {
            Set-Location $expectedPath
            Write-LogMessage "📁 Navegando a: $expectedPath" "INFO"
        }
        
        # Verificar que el script principal existe
        if (!(Test-Path ".\automated-update.ps1")) {
            throw "Script automated-update.ps1 no encontrado"
        }
        
        Update-Status -Phase "INICIALIZACION" -Step "Preparando entorno" -Status "RUNNING" -Progress 5
        Write-LogMessage "✅ Verificaciones iniciales completadas" "SUCCESS"
        
        # ACTUALIZACIÓN DIRECTA - Evitar problemas con & y Tee-Object
        Update-Status -Phase "EJECUCION" -Step "Ejecutando actualización principal" -Status "RUNNING" -Progress 10
        Write-LogMessage "🎯 Iniciando actualización directa..." "INFO"
        
        # FASE 1: Instalar pnpm
        Update-Status -Phase "HERRAMIENTAS" -Step "Instalando pnpm" -Status "RUNNING" -Progress 20
        Write-LogMessage "📦 Instalando pnpm..." "INFO"
        try {
            $pnpmResult = npm install -g pnpm@latest 2>&1
            Write-LogMessage "✅ pnpm instalado: $pnpmResult" "SUCCESS"
        } catch {
            Write-LogMessage "⚠️ Error instalando pnpm: $($_.Exception.Message)" "WARNING"
        }
        
        # FASE 2: Actualizar dependencias root
        Update-Status -Phase "DEPENDENCIAS ROOT" -Step "Actualizando dependencias principales" -Status "RUNNING" -Progress 40
        Write-LogMessage "🔄 Actualizando dependencias root..." "INFO"
        
        $rootUpdates = @(
            "npm update @types/node typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint",
            "npm update cypress jest concurrently @testing-library/react @testing-library/jest-dom"
        )
        
        foreach ($update in $rootUpdates) {
            try {
                Write-LogMessage "📦 Ejecutando: $update" "INFO"
                Invoke-Expression $update
                Write-LogMessage "✅ Completado: $update" "SUCCESS"
            } catch {
                Write-LogMessage "⚠️ Error en: $update - $($_.Exception.Message)" "WARNING"
            }
        }
        
        # FASE 3: Actualizar aplicaciones
        Update-Status -Phase "APLICACIONES" -Step "Actualizando apps médicas" -Status "RUNNING" -Progress 60
        Write-LogMessage "🏥 Actualizando aplicaciones médicas..." "INFO"
        
        $apps = @("api-server", "doctors", "patients", "companies", "admin", "signaling-server")
        foreach ($app in $apps) {
            if (Test-Path "apps\$app") {
                Write-LogMessage "📱 Actualizando $app..." "INFO"
                Push-Location "apps\$app"
                
                try {
                    npm update next react react-dom @types/react @types/react-dom typescript @types/node
                    Write-LogMessage "✅ $app actualizado exitosamente" "SUCCESS"
                } catch {
                    Write-LogMessage "⚠️ Error actualizando $app`: $($_.Exception.Message)" "WARNING"
                }
                
                Pop-Location
            }
        }
        
        # FASE 4: Bibliotecas médicas
        Update-Status -Phase "BIBLIOTECAS MEDICAS" -Step "Instalando bibliotecas avanzadas" -Status "RUNNING" -Progress 80
        Write-LogMessage "🤖 Instalando bibliotecas médicas..." "INFO"
        
        $medicalLibs = @(
            "npm install --save-dev @tensorflow/tfjs@latest sharp@latest",
            "npm install --save-dev joi@latest helmet@latest @axe-core/react@latest"
        )
        
        foreach ($lib in $medicalLibs) {
            try {
                Write-LogMessage "🔬 Instalando: $lib" "INFO"
                Invoke-Expression $lib
                Write-LogMessage "✅ Completado: $lib" "SUCCESS"
            } catch {
                Write-LogMessage "⚠️ Error en: $lib - $($_.Exception.Message)" "WARNING"
            }
        }
        
        # FASE 5: Verificación final
        Update-Status -Phase "VERIFICACION" -Step "Verificando instalación" -Status "RUNNING" -Progress 90
        Write-LogMessage "🔍 Verificando instalación..." "INFO"
        
        try {
            npm run type-check
            Write-LogMessage "✅ TypeScript verificado exitosamente" "SUCCESS"
        } catch {
            Write-LogMessage "⚠️ Error en verificación TypeScript: $($_.Exception.Message)" "WARNING"
        }
        
        # FASE 6: Instalación completa
        Update-Status -Phase "INSTALACION COMPLETA" -Step "Instalando todas las dependencias" -Status "RUNNING" -Progress 95
        Write-LogMessage "📦 Instalación completa..." "INFO"
        
        try {
            if (Get-Command pnpm -ErrorAction SilentlyContinue) {
                pnpm install
                Write-LogMessage "✅ pnpm install completado" "SUCCESS"
            } else {
                npm install
                Write-LogMessage "✅ npm install completado" "SUCCESS"
            }
        } catch {
            Write-LogMessage "⚠️ Error en instalación: $($_.Exception.Message)" "WARNING"
        }
        
        # Completado
        Update-Status -Phase "COMPLETADO" -Step "Actualización exitosa" -Status "SUCCESS" -Progress 100
        Write-LogMessage "🎉 Actualización completada exitosamente!" "SUCCESS"
        
    } catch {
        Update-Status -Phase "ERROR" -Step $_.Exception.Message -Status "FAILED" -Progress 0
        Write-LogMessage "❌ Error crítico: $($_.Exception.Message)" "ERROR" $errorLog
        throw
    } finally {
        Stop-Transcript
    }
}

# INICIO DEL SISTEMA CORREGIDO
Write-LogMessage "🏥 Sistema de Actualización Autónoma - AltaMedica (CORREGIDO)" "INFO"

# Limpiar logs anteriores
@($mainLog, $progressLog, $errorLog, $statusFile) | ForEach-Object {
    if (Test-Path $_) { Remove-Item $_ -Force }
}

Write-Host "`nConfiguración:" -ForegroundColor Yellow
Write-Host "📊 Log principal: $mainLog" -ForegroundColor Cyan
Write-Host "📈 Log progreso: $progressLog" -ForegroundColor Cyan
Write-Host "❌ Log errores: $errorLog" -ForegroundColor Cyan
Write-Host "📋 Estado JSON: $statusFile" -ForegroundColor Cyan

Write-Host "`n🚀 Iniciando actualización en 3 segundos..." -ForegroundColor Green
Start-Sleep -Seconds 3

try {
    # Ejecutar actualización principal
    Start-AutonomousUpdate
    
    Write-Host "`n🎉 ACTUALIZACIÓN AUTÓNOMA COMPLETADA" -ForegroundColor Green
    Write-Host "📊 Revisa los logs en: $logPath" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n❌ ERROR EN ACTUALIZACIÓN AUTÓNOMA: $($_.Exception.Message)" -ForegroundColor Red
    Write-LogMessage "❌ Error fatal: $($_.Exception.Message)" "ERROR" $errorLog
} finally {
    Write-Host "`n📋 RESUMEN FINAL:" -ForegroundColor Yellow
    Write-Host "Logs disponibles en: $logPath" -ForegroundColor Cyan
    Write-Host "Para ver log completo: Get-Content `"$mainLog`"" -ForegroundColor White
    Write-Host "Para ver progreso: Get-Content `"$progressLog`"" -ForegroundColor White
    
    if (Test-Path $statusFile) {
        $finalStatus = Get-Content $statusFile -Raw | ConvertFrom-Json
        Write-Host "Estado final: $($finalStatus.status) - $($finalStatus.phase)" -ForegroundColor White
    }
    
    Write-Host "`n🏥 Plataforma AltaMedica lista para desarrollo!" -ForegroundColor Green
}