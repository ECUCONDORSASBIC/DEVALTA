# 🎛️ CONTROL DEL MONITOR MCP 24/7 - DEVALTAMEDICA
# Script PowerShell para gestionar el monitoreo continuo

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "status", "logs", "dashboard", "config", "help")]
    [string]$Action = "help",
    
    [Parameter(Position=1)]
    [string]$LogType = "platform-monitoring"
)

$MonitorScript = "mcp-monitor-24-7.js"
$LogsDir = ".\logs"
$ConfigFile = "mcp-monitor-config.json"

function Show-Header {
    Write-Host "🤖 DEVALTAMEDICA MCP MONITOR CONTROL" -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Green
    Write-Host "🕐 $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    Write-Host ""
}

function Start-Monitor {
    Show-Header
    Write-Host "🚀 INICIANDO MONITOR CONTINUO..." -ForegroundColor Yellow
    Write-Host ""
    
    # Verificar si Node.js está disponible
    try {
        $nodeVersion = node --version 2>$null
        Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Node.js no encontrado. Instala Node.js primero." -ForegroundColor Red
        return
    }
    
    # Verificar si el script existe
    if (-not (Test-Path $MonitorScript)) {
        Write-Host "❌ Script monitor no encontrado: $MonitorScript" -ForegroundColor Red
        return
    }
    
    Write-Host "📊 Configuración del monitor:" -ForegroundColor Cyan
    Write-Host "  • Análisis cognitivo: cada 5 minutos" -ForegroundColor White
    Write-Host "  • Verificación negociaciones: cada 10 minutos" -ForegroundColor White
    Write-Host "  • Reportes inteligencia: cada 30 minutos" -ForegroundColor White
    Write-Host "  • Monitoreo plataforma: cada 2 minutos" -ForegroundColor White
    Write-Host "  • Auditoría compliance: cada 1 hora" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📁 Los logs se guardarán en: $(Resolve-Path $LogsDir -ErrorAction SilentlyContinue)" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "⚡ Iniciando monitor..." -ForegroundColor Yellow
    
    # Iniciar el monitor en background
    Start-Process -FilePath "node" -ArgumentList $MonitorScript, "start" -NoNewWindow
    
    Start-Sleep -Seconds 3
    
    Write-Host "✅ Monitor iniciado exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Comandos útiles:" -ForegroundColor Yellow
    Write-Host "  .\monitor-control.ps1 status    - Ver estado" -ForegroundColor Gray
    Write-Host "  .\monitor-control.ps1 logs      - Ver logs recientes" -ForegroundColor Gray
    Write-Host "  .\monitor-control.ps1 dashboard - Dashboard en tiempo real" -ForegroundColor Gray
    Write-Host "  .\monitor-control.ps1 stop      - Detener monitor" -ForegroundColor Gray
}

function Stop-Monitor {
    Show-Header
    Write-Host "🛑 DETENIENDO MONITOR..." -ForegroundColor Yellow
    
    # Buscar proceso de Node.js con el monitor
    $processes = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*$MonitorScript*"
    }
    
    if ($processes) {
        foreach ($process in $processes) {
            Write-Host "🔄 Deteniendo proceso: PID $($process.Id)" -ForegroundColor Yellow
            Stop-Process -Id $process.Id -Force
        }
        Write-Host "✅ Monitor detenido exitosamente!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No se encontraron procesos del monitor ejecutándose" -ForegroundColor Yellow
    }
}

function Show-Status {
    Show-Header
    Write-Host "📊 ESTADO DEL MONITOR" -ForegroundColor Cyan
    Write-Host "=====================" -ForegroundColor Cyan
    
    # Verificar si el proceso está ejecutándose
    $processes = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -like "*$MonitorScript*"
    }
    
    if ($processes) {
        Write-Host "🟢 Estado: EJECUTÁNDOSE" -ForegroundColor Green
        Write-Host "🔢 PIDs: $($processes.Id -join ', ')" -ForegroundColor White
        Write-Host "⏰ Tiempo inicio: $(($processes | Select-Object -First 1).StartTime)" -ForegroundColor White
        
        $uptime = (Get-Date) - ($processes | Select-Object -First 1).StartTime
        Write-Host "⌛ Uptime: $($uptime.Days)d $($uptime.Hours)h $($uptime.Minutes)m" -ForegroundColor White
    } else {
        Write-Host "🔴 Estado: DETENIDO" -ForegroundColor Red
    }
    
    # Verificar logs
    if (Test-Path $LogsDir) {
        Write-Host ""
        Write-Host "📁 ARCHIVOS DE LOG:" -ForegroundColor Cyan
        $logFiles = Get-ChildItem -Path $LogsDir -Filter "*.log" | Sort-Object LastWriteTime -Descending
        
        foreach ($file in $logFiles) {
            $size = [math]::Round($file.Length / 1KB, 2)
            $lastWrite = $file.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
            Write-Host "  📄 $($file.Name) - ${size}KB - $lastWrite" -ForegroundColor White
        }
    }
    
    # Mostrar configuración
    if (Test-Path $ConfigFile) {
        Write-Host ""
        Write-Host "⚙️ CONFIGURACIÓN ACTIVA:" -ForegroundColor Cyan
        try {
            $config = Get-Content $ConfigFile | ConvertFrom-Json
            Write-Host "  • Análisis cognitivo: $($config.intervals.cognitiveAnalysis / 1000 / 60) min" -ForegroundColor White
            Write-Host "  • Reportes inteligencia: $($config.intervals.intelligenceReport / 1000 / 60) min" -ForegroundColor White
            Write-Host "  • Monitoreo plataforma: $($config.intervals.platformMonitoring / 1000 / 60) min" -ForegroundColor White
        } catch {
            Write-Host "  ⚠️ Error leyendo configuración" -ForegroundColor Yellow
        }
    }
}

function Show-Logs {
    param($Type)
    
    Show-Header
    Write-Host "📋 LOGS RECIENTES: $Type" -ForegroundColor Cyan
    Write-Host "=" * 50 -ForegroundColor Cyan
    
    $logFile = Join-Path $LogsDir "$Type.log"
    
    if (Test-Path $logFile) {
        # Mostrar últimas 20 líneas
        $content = Get-Content $logFile -Tail 20
        
        foreach ($line in $content) {
            if ($line -match '\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\]') {
                Write-Host $line -ForegroundColor Green
            } elseif ($line -match '"type":|"agentId":|"issue":') {
                Write-Host $line -ForegroundColor Yellow
            } elseif ($line -match '"ALERT"|"CRITICAL"|"HIGH"') {
                Write-Host $line -ForegroundColor Red
            } else {
                Write-Host $line -ForegroundColor White
            }
        }
        
        Write-Host ""
        Write-Host "📊 Archivo: $(Resolve-Path $logFile)" -ForegroundColor Gray
        $fileInfo = Get-Item $logFile
        Write-Host "📏 Tamaño: $([math]::Round($fileInfo.Length / 1KB, 2)) KB" -ForegroundColor Gray
        Write-Host "🕐 Última modificación: $($fileInfo.LastWriteTime)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Archivo de log no encontrado: $logFile" -ForegroundColor Red
        Write-Host ""
        Write-Host "📁 Logs disponibles:" -ForegroundColor Yellow
        if (Test-Path $LogsDir) {
            Get-ChildItem -Path $LogsDir -Filter "*.log" | ForEach-Object {
                $name = $_.BaseName
                Write-Host "  • $name" -ForegroundColor White
            }
        }
    }
}

function Show-Dashboard {
    Show-Header
    Write-Host "📊 DASHBOARD EN TIEMPO REAL" -ForegroundColor Cyan
    Write-Host "===========================" -ForegroundColor Cyan
    Write-Host "Presiona Ctrl+C para salir" -ForegroundColor Yellow
    Write-Host ""
    
    try {
        while ($true) {
            Clear-Host
            Show-Header
            Write-Host "📊 DASHBOARD EN TIEMPO REAL - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Cyan
            Write-Host "=================================================" -ForegroundColor Cyan
            
            # Estado del monitor
            $processes = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
                $_.CommandLine -like "*$MonitorScript*"
            }
            
            if ($processes) {
                Write-Host "🟢 Monitor: ACTIVO" -ForegroundColor Green
                $uptime = (Get-Date) - ($processes | Select-Object -First 1).StartTime
                Write-Host "⌛ Uptime: $($uptime.Days)d $($uptime.Hours)h $($uptime.Minutes)m" -ForegroundColor White
            } else {
                Write-Host "🔴 Monitor: INACTIVO" -ForegroundColor Red
            }
            
            Write-Host ""
            
            # Últimas actividades de cada log
            $logTypes = @("cognitive-analysis", "negotiations", "intelligence-reports", "platform-monitoring", "alerts")
            
            foreach ($logType in $logTypes) {
                $logFile = Join-Path $LogsDir "$logType.log"
                if (Test-Path $logFile) {
                    $lastEntry = Get-Content $logFile -Tail 5 | Where-Object { $_ -match '\[.*\]' } | Select-Object -Last 1
                    if ($lastEntry) {
                        $timestamp = ($lastEntry | Select-String '\[(.*?)\]').Matches[0].Groups[1].Value
                        $time = ([DateTime]$timestamp).ToString("HH:mm:ss")
                        
                        $emoji = switch ($logType) {
                            "cognitive-analysis" { "[BRAIN]" }
                            "negotiations" { "[TALK]" }
                            "intelligence-reports" { "[CHART]" }
                            "platform-monitoring" { "[SEARCH]" }
                            "alerts" { "[ALERT]" }
                            default { "[LOG]" }
                        }
                        
                        Write-Host "$emoji $logType`: última actividad $time" -ForegroundColor White
                    }
                }
            }
            
            Write-Host ""
            Write-Host "🔄 Actualizando en 10 segundos..." -ForegroundColor Gray
            Start-Sleep -Seconds 10
        }
    } catch {
        Write-Host "`n👋 Dashboard cerrado" -ForegroundColor Yellow
    }
}

function Show-Config {
    Show-Header
    Write-Host "⚙️ CONFIGURACIÓN DEL MONITOR" -ForegroundColor Cyan
    Write-Host "=============================" -ForegroundColor Cyan
    
    if (Test-Path $ConfigFile) {
        Write-Host "📄 Archivo: $(Resolve-Path $ConfigFile)" -ForegroundColor Gray
        Write-Host ""
        
        try {
            $config = Get-Content $ConfigFile | ConvertFrom-Json
            
            Write-Host "⏱️ INTERVALOS:" -ForegroundColor Yellow
            Write-Host "  • Análisis cognitivo: $($config.intervals.cognitiveAnalysis / 1000 / 60) minutos" -ForegroundColor White
            Write-Host "  • Verificación negociaciones: $($config.intervals.negotiationCheck / 1000 / 60) minutos" -ForegroundColor White
            Write-Host "  • Reportes inteligencia: $($config.intervals.intelligenceReport / 1000 / 60) minutos" -ForegroundColor White
            Write-Host "  • Monitoreo plataforma: $($config.intervals.platformMonitoring / 1000 / 60) minutos" -ForegroundColor White
            Write-Host "  • Auditoría compliance: $($config.intervals.complianceAudit / 1000 / 60 / 60) horas" -ForegroundColor White
            
            Write-Host ""
            Write-Host "🚨 UMBRALES DE ALERTA:" -ForegroundColor Yellow
            Write-Host "  • Performance mínimo: $($config.alertThresholds.performanceMin)%" -ForegroundColor White
            Write-Host "  • Seguridad mínimo: $($config.alertThresholds.securityMin)%" -ForegroundColor White
            Write-Host "  • Compliance mínimo: $($config.alertThresholds.complianceMin)%" -ForegroundColor White
            Write-Host "  • Eficiencia agentes mínimo: $($config.alertThresholds.agentEfficiencyMin)%" -ForegroundColor White
            
        } catch {
            Write-Host "❌ Error parseando configuración" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Archivo de configuración no encontrado: $ConfigFile" -ForegroundColor Red
        Write-Host "💡 Se creará automáticamente al iniciar el monitor" -ForegroundColor Yellow
    }
}

function Show-Help {
    Show-Header
    Write-Host "📚 AYUDA - COMANDOS DISPONIBLES" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "🚀 CONTROL BÁSICO:" -ForegroundColor Yellow
    Write-Host "  .\monitor-control.ps1 start     - Iniciar monitoreo continuo" -ForegroundColor White
    Write-Host "  .\monitor-control.ps1 stop      - Detener monitoreo" -ForegroundColor White
    Write-Host "  .\monitor-control.ps1 status    - Ver estado actual" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📊 LOGS Y MONITOREO:" -ForegroundColor Yellow
    Write-Host "  .\monitor-control.ps1 logs [tipo] - Ver logs recientes" -ForegroundColor White
    Write-Host "  .\monitor-control.ps1 dashboard   - Dashboard tiempo real" -ForegroundColor White
    Write-Host ""
    
    Write-Host "⚙️ CONFIGURACIÓN:" -ForegroundColor Yellow
    Write-Host "  .\monitor-control.ps1 config    - Ver configuración actual" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📋 TIPOS DE LOGS DISPONIBLES:" -ForegroundColor Yellow
    Write-Host "  • cognitive-analysis    - Análisis cognitivo de agentes" -ForegroundColor White
    Write-Host "  • negotiations         - Negociaciones entre agentes" -ForegroundColor White
    Write-Host "  • intelligence-reports - Reportes de inteligencia" -ForegroundColor White
    Write-Host "  • platform-monitoring  - Monitoreo de plataforma" -ForegroundColor White
    Write-Host "  • alerts               - Alertas del sistema" -ForegroundColor White
    Write-Host "  • compliance-audits    - Auditorías de compliance" -ForegroundColor White
    Write-Host ""
    
    Write-Host "💡 EJEMPLOS:" -ForegroundColor Yellow
    Write-Host "  .\monitor-control.ps1 logs cognitive-analysis" -ForegroundColor Gray
    Write-Host "  .\monitor-control.ps1 logs alerts" -ForegroundColor Gray
}

# Ejecutar acción
switch ($Action.ToLower()) {
    "start" { Start-Monitor }
    "stop" { Stop-Monitor }
    "status" { Show-Status }
    "logs" { Show-Logs -Type $LogType }
    "dashboard" { Show-Dashboard }
    "config" { Show-Config }
    "help" { Show-Help }
    default { Show-Help }
}
