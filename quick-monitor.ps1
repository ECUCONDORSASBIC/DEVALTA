# AltaMedica - Monitor Rápido para Ver Progreso en Tiempo Real
# Ejecutar en terminal separada para monitorear autonomous-update-monitor.ps1

Write-Host "🔍 AltaMedica - Monitor de Progreso en Tiempo Real" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

$logPath = "C:\Users\Eduardo\Documents\devaltamedica\logs"
$progressLog = "$logPath\update-progress.log"
$statusFile = "$logPath\update-status.json"
$mainLog = "$logPath\update-main.log"

# Verificar si los archivos existen
if (!(Test-Path $logPath)) {
    Write-Host "⚠️ Directorio de logs no existe. ¿La actualización ya comenzó?" -ForegroundColor Yellow
    Write-Host "📁 Esperando directorio: $logPath" -ForegroundColor Cyan
    
    # Esperar hasta que se cree el directorio
    while (!(Test-Path $logPath)) {
        Start-Sleep -Seconds 2
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
    Write-Host "`n✅ Directorio de logs detectado!" -ForegroundColor Green
}

Write-Host "`n🚀 Iniciando monitoreo en tiempo real..." -ForegroundColor Cyan
Write-Host "📁 Monitoreando: $logPath" -ForegroundColor White
Write-Host "🔄 Presiona Ctrl+C para salir" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Gray

# Variables para el display
$lastDisplayTime = Get-Date
$lastProgressUpdate = ""
$consecutiveEmptyReads = 0

try {
    while ($true) {
        Clear-Host
        Write-Host "🏥 AltaMedica - Monitor de Actualización en Tiempo Real" -ForegroundColor Green -BackgroundColor DarkBlue
        Write-Host "=" * 60 -ForegroundColor Gray
        Write-Host "⏰ $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
        
        # Mostrar estado actual desde JSON
        if (Test-Path $statusFile) {
            try {
                $status = Get-Content $statusFile -Raw -ErrorAction SilentlyContinue | ConvertFrom-Json
                if ($status) {
                    # Barra de progreso visual
                    $progressBlocks = [math]::Floor($status.progress / 5)
                    $progressBar = "█" * $progressBlocks + "░" * (20 - $progressBlocks)
                    
                    Write-Host "`n📊 ESTADO ACTUAL:" -ForegroundColor Yellow
                    Write-Host "🎯 Fase: $($status.phase)" -ForegroundColor Cyan
                    Write-Host "📋 Paso: $($status.step)" -ForegroundColor White
                    Write-Host "📈 Progreso: [$progressBar] $($status.progress)%" -ForegroundColor Green
                    Write-Host "🆔 PID: $($status.pid)" -ForegroundColor Gray
                    Write-Host "⌚ Última actualización: $($status.timestamp)" -ForegroundColor Gray
                    
                    # Colorear estado
                    switch ($status.status) {
                        "SUCCESS" { Write-Host "✅ Estado: $($status.status)" -ForegroundColor Green }
                        "FAILED" { Write-Host "❌ Estado: $($status.status)" -ForegroundColor Red }
                        "RUNNING" { Write-Host "🚀 Estado: $($status.status)" -ForegroundColor Yellow }
                        default { Write-Host "ℹ️ Estado: $($status.status)" -ForegroundColor White }
                    }
                }
            } catch {
                Write-Host "⚠️ Error leyendo estado: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "`n⏳ Esperando inicio de actualización..." -ForegroundColor Yellow
        }
        
        # Mostrar últimas líneas del log de progreso
        Write-Host "`n📄 ÚLTIMAS ACTIVIDADES:" -ForegroundColor Yellow
        Write-Host "-" * 40 -ForegroundColor Gray
        
        if (Test-Path $progressLog) {
            $recentLines = Get-Content $progressLog -Tail 8 -ErrorAction SilentlyContinue
            if ($recentLines) {
                $consecutiveEmptyReads = 0
                foreach ($line in $recentLines) {
                    # Colorear líneas según contenido
                    if ($line -match "ERROR|❌|FAIL") {
                        Write-Host $line -ForegroundColor Red
                    } elseif ($line -match "SUCCESS|✅|COMPLETADO") {
                        Write-Host $line -ForegroundColor Green
                    } elseif ($line -match "WARNING|⚠️") {
                        Write-Host $line -ForegroundColor Yellow
                    } elseif ($line -match "🚀|INICIANDO|FASE") {
                        Write-Host $line -ForegroundColor Cyan
                    } else {
                        Write-Host $line -ForegroundColor White
                    }
                }
            } else {
                $consecutiveEmptyReads++
                if ($consecutiveEmptyReads -lt 5) {
                    Write-Host "⏳ Esperando actividad..." -ForegroundColor Gray
                } else {
                    Write-Host "💤 Sin actividad reciente (proceso podría haber terminado)" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "📋 Archivo de progreso no disponible aún..." -ForegroundColor Gray
        }
        
        # Mostrar información de procesos relacionados
        Write-Host "`n💻 PROCESOS ALTAMEDICA:" -ForegroundColor Yellow
        Write-Host "-" * 25 -ForegroundColor Gray
        
        $processes = Get-Process -Name "powershell", "pwsh", "node" -ErrorAction SilentlyContinue | 
                    Where-Object { $_.MainWindowTitle -like "*altamedica*" -or $_.CommandLine -like "*altamedica*" }
        
        if ($processes) {
            $processes | Select-Object Id, ProcessName, CPU, @{Name="Memory(MB)";Expression={[math]::Round($_.WorkingSet64/1MB,1)}} | 
            Format-Table -AutoSize
        } else {
            # Buscar procesos en puertos AltaMedica
            $altamedicaPorts = @(3000, 3001, 3002, 3003, 3004, 3005, 8888)
            $activeApps = @()
            
            foreach ($port in $altamedicaPorts) {
                $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
                if ($conn) {
                    $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                    if ($proc) {
                        $activeApps += "Puerto $port -> PID $($proc.Id) ($($proc.ProcessName))"
                    }
                }
            }
            
            if ($activeApps) {
                $activeApps | ForEach-Object { Write-Host "🌐 $_" -ForegroundColor Green }
            } else {
                Write-Host "😴 No hay aplicaciones AltaMedica activas" -ForegroundColor Gray
            }
        }
        
        # Información adicional en la parte inferior
        Write-Host "`n" + "=" * 60 -ForegroundColor Gray
        Write-Host "📁 Logs: $logPath" -ForegroundColor Gray
        Write-Host "🔄 Actualización cada 3 segundos | Ctrl+C para salir" -ForegroundColor Gray
        
        # Verificar si la actualización terminó
        if (Test-Path $statusFile) {
            $status = Get-Content $statusFile -Raw -ErrorAction SilentlyContinue | ConvertFrom-Json
            if ($status -and ($status.status -eq "SUCCESS" -or $status.status -eq "FAILED")) {
                Write-Host "`n🏁 ACTUALIZACIÓN TERMINADA - Estado: $($status.status)" -ForegroundColor $(if($status.status -eq "SUCCESS"){"Green"}else{"Red"})
                Write-Host "📊 Revisa el log completo: Get-Content '$mainLog'" -ForegroundColor Cyan
                
                # Esperar confirmación del usuario
                Write-Host "`nPresiona cualquier tecla para salir..." -ForegroundColor Yellow
                $null = $Host.UI.RawUI.ReadKey()
                break
            }
        }
        
        Start-Sleep -Seconds 3
    }
    
} catch {
    Write-Host "`n❌ Error en monitor: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    Write-Host "`n👋 Monitor finalizado." -ForegroundColor Green
}