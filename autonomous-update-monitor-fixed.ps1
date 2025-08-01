# AltaMedica - Sistema de Actualización Autónoma con Monitoreo
# Ejecuta automated-update.ps1 con monitoreo en tiempo real

Write-Host "🏥 AltaMedica - Sistema de Actualización Autónoma" -ForegroundColor Green
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

# Función de monitoreo en background
function Start-BackgroundMonitor {
    $monitorScript = {
        param($logPath, $statusFile, $progressLog)
        
        Write-Host "`n🔍 MONITOR EN TIEMPO REAL INICIADO" -ForegroundColor Magenta
        Write-Host "📁 Logs: $logPath" -ForegroundColor Cyan
        Write-Host "📊 Estado: $statusFile" -ForegroundColor Cyan
        Write-Host "🔄 Presiona Ctrl+C para salir del monitor" -ForegroundColor Yellow
        Write-Host "=" * 50 -ForegroundColor Gray
        
        # Crear archivo de progreso si no existe
        if (!(Test-Path $progressLog)) {
            "Iniciando monitoreo..." | Set-Content -Path $progressLog
        }
        
        # Monitor continuo
        while ($true) {
            try {
                # Mostrar últimas líneas del log principal
                if (Test-Path $progressLog) {
                    $lastLines = Get-Content $progressLog -Tail 5 -ErrorAction SilentlyContinue
                    if ($lastLines) {
                        foreach ($line in $lastLines) {
                            if ($line -match "ERROR") {
                                Write-Host $line -ForegroundColor Red
                            } elseif ($line -match "SUCCESS|✅") {
                                Write-Host $line -ForegroundColor Green
                            } elseif ($line -match "WARNING|⚠️") {
                                Write-Host $line -ForegroundColor Yellow
                            } else {
                                Write-Host $line -ForegroundColor White
                            }
                        }
                    }
                }
                
                # Mostrar estado actual
                if (Test-Path $statusFile) {
                    $status = Get-Content $statusFile -Raw | ConvertFrom-Json -ErrorAction SilentlyContinue
                    if ($status) {
                        $progressBar = "█" * [math]::Floor($status.progress / 10) + "░" * (10 - [math]::Floor($status.progress / 10))
                        Write-Host "`r🚀 $($status.phase) | $($status.step) | $progressBar $($status.progress)%" -NoNewline -ForegroundColor Cyan
                    }
                }
                
                Start-Sleep -Seconds 2
                
            } catch {
                Write-Host "⚠️ Error en monitor: $($_.Exception.Message)" -ForegroundColor Yellow
                Start-Sleep -Seconds 5
            }
        }
    }
    
    # Iniciar monitor en job separado
    $job = Start-Job -ScriptBlock $monitorScript -ArgumentList $logPath, $statusFile, $progressLog
    return $job
}

# Función principal de actualización
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
        
        Update-Status -Phase "INICIALIZACIÓN" -Step "Preparando entorno" -Status "RUNNING" -Progress 5
        Write-LogMessage "✅ Verificaciones iniciales completadas" "SUCCESS"
        
        # Ejecutar el script principal con captura de output
        Update-Status -Phase "EJECUCIÓN" -Step "Ejecutando automated-update.ps1" -Status "RUNNING" -Progress 10
        Write-LogMessage "🎯 Iniciando script de actualización principal..." "INFO"
        
        # Ejecutar con redirección de output
        $process = Start-Process -FilePath "powershell.exe" -ArgumentList @(
            "-ExecutionPolicy", "Bypass",
            "-Command", "& '.\automated-update.ps1' | Tee-Object -FilePath '$progressLog'"
        ) -PassThru -NoNewWindow
        
        # Monitorear el proceso
        $startTime = Get-Date
        $phases = @(
            @{Name="INSTALACIÓN HERRAMIENTAS"; Progress=20},
            @{Name="ACTUALIZACIÓN DEPENDENCIAS"; Progress=40},
            @{Name="BIBLIOTECAS MÉDICAS"; Progress=60},
            @{Name="VERIFICACIÓN"; Progress=80},
            @{Name="INSTALACIÓN FINAL"; Progress=95}
        )
        
        $currentPhase = 0
        
        while (!$process.HasExited) {
            # Actualizar progreso estimado basado en tiempo
            $elapsed = (Get-Date) - $startTime
            $estimatedMinutes = 8 # Tiempo estimado total
            $progressPercent = [math]::Min(95, ($elapsed.TotalMinutes / $estimatedMinutes) * 100)
            
            # Determinar fase actual
            if ($currentPhase -lt $phases.Count) {
                if ($progressPercent -ge $phases[$currentPhase].Progress) {
                    Update-Status -Phase $phases[$currentPhase].Name -Step "En progreso..." -Status "RUNNING" -Progress $phases[$currentPhase].Progress
                    Write-LogMessage "📊 Fase: $($phases[$currentPhase].Name) - $($phases[$currentPhase].Progress)%" "INFO"
                    $currentPhase++
                }
            }
            
            Start-Sleep -Seconds 10
        }
        
        # Verificar resultado
        if ($process.ExitCode -eq 0) {
            Update-Status -Phase "COMPLETADO" -Step "Actualización exitosa" -Status "SUCCESS" -Progress 100
            Write-LogMessage "🎉 Actualización completada exitosamente!" "SUCCESS"
            
            # Verificación post-actualización
            Write-LogMessage "🔍 Ejecutando verificación final..." "INFO"
            if (Test-Path ".\verify-environment.ps1") {
                & ".\verify-environment.ps1" | Add-Content -Path $progressLog
            }
            
        } else {
            Update-Status -Phase "ERROR" -Step "Actualización falló" -Status "FAILED" -Progress $progressPercent
            Write-LogMessage "❌ Actualización falló con código: $($process.ExitCode)" "ERROR"
        }
        
    } catch {
        Update-Status -Phase "ERROR" -Step $_.Exception.Message -Status "FAILED" -Progress 0
        Write-LogMessage "❌ Error crítico: $($_.Exception.Message)" "ERROR" $errorLog
        throw
    } finally {
        Stop-Transcript
    }
}

# INICIO DEL SISTEMA AUTÓNOMO
Write-LogMessage "🏥 Sistema de Actualización Autónoma - AltaMedica" "INFO"

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
    # Iniciar monitor en background
    Write-Host "`n🔍 Iniciando monitor de tiempo real..." -ForegroundColor Magenta
    $monitorJob = Start-BackgroundMonitor
    
    # Pequeña pausa para que el monitor se inicie
    Start-Sleep -Seconds 2
    
    # Ejecutar actualización principal
    Start-AutonomousUpdate
    
    Write-Host "`n🎉 ACTUALIZACIÓN AUTÓNOMA COMPLETADA" -ForegroundColor Green
    Write-Host "📊 Revisa los logs en: $logPath" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n❌ ERROR EN ACTUALIZACIÓN AUTÓNOMA: $($_.Exception.Message)" -ForegroundColor Red
    Write-LogMessage "❌ Error fatal: $($_.Exception.Message)" "ERROR" $errorLog
} finally {
    # Detener monitor
    if ($monitorJob) {
        Write-Host "`n🛑 Deteniendo monitor..." -ForegroundColor Yellow
        Stop-Job $monitorJob -PassThru | Remove-Job
    }
    
    Write-Host "`n📋 RESUMEN FINAL:" -ForegroundColor Yellow
    Write-Host "Logs disponibles en: $logPath" -ForegroundColor Cyan
    Write-Host "Para ver log completo: Get-Content '$mainLog'" -ForegroundColor White
    Write-Host "Para ver progreso: Get-Content '$progressLog'" -ForegroundColor White
    
    if (Test-Path $statusFile) {
        $finalStatus = Get-Content $statusFile -Raw | ConvertFrom-Json
        Write-Host "Estado final: $($finalStatus.status) - $($finalStatus.phase)" -ForegroundColor White
    }
}
