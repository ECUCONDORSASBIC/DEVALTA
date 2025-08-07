# AltaMedica - Monitor en Tiempo Real de Autenticación
# Autor: Eduardo Marques
# Fecha: Enero 2025

param(
    [int]$RefreshInterval = 5,  # Segundos entre actualizaciones
    [int]$MaxLogLines = 50,     # Máximo de líneas de log a mostrar
    [switch]$SaveLogs           # Guardar logs en archivo
)

# Configuración
$global:monitorStartTime = Get-Date
$global:logFile = "realtime_monitor_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
$global:statsFile = "monitor_stats_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
$global:alerts = @()
$global:metrics = @{
    AuthAttempts = 0
    AuthSuccess = 0
    AuthFailures = 0
    NetworkErrors = 0
    EmulatorRestarts = 0
    LastAuthTime = $null
    AverageResponseTime = 0
    ResponseTimes = @()
}

# Colores para la consola
$colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
    Header = "Blue"
}

# Función para limpiar la pantalla y mostrar header
function Show-Header {
    Clear-Host
    Write-Host "╔═══════════════════════════════════════════════════════════════════════╗" -ForegroundColor $colors.Header
    Write-Host "║            ALTAMEDICA - MONITOR EN TIEMPO REAL DE AUTENTICACIÓN       ║" -ForegroundColor $colors.Header
    Write-Host "╚═══════════════════════════════════════════════════════════════════════╝" -ForegroundColor $colors.Header
    Write-Host "Inicio: $($global:monitorStartTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor $colors.Info
    Write-Host "Tiempo activo: $([math]::Round((Get-Date) - $global:monitorStartTime).TotalMinutes, 1) minutos" -ForegroundColor $colors.Info
    Write-Host "Actualizando cada $RefreshInterval segundos..." -ForegroundColor $colors.Info
    Write-Host ""
}

# Función para verificar estado de servicios
function Get-ServiceStatus {
    $services = @{
        "Firebase Auth (9099)" = 9099
        "Firestore (8080)" = 8080
        "Web App (3000)" = 3000
        "API Server (3001)" = 3001
        "Signaling (8888)" = 8888
    }
    
    $statuses = @()
    
    foreach ($service in $services.GetEnumerator()) {
        $port = $service.Value
        $name = $service.Key
        
        $tcpTest = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        
        if ($tcpTest.TcpTestSucceeded) {
            $statuses += [PSCustomObject]@{
                Name = $name
                Port = $port
                Status = "ONLINE"
                Color = $colors.Success
            }
        } else {
            $statuses += [PSCustomObject]@{
                Name = $name
                Port = $port
                Status = "OFFLINE"
                Color = $colors.Error
            }
            
            # Agregar alerta si es un servicio crítico
            if ($port -in @(9099, 8080, 3001)) {
                Add-Alert "CRÍTICO" "$name está OFFLINE" "Error"
            }
        }
    }
    
    return $statuses
}

# Función para agregar alertas
function Add-Alert {
    param($Type, $Message, $Severity)
    
    $alert = [PSCustomObject]@{
        Time = Get-Date -Format "HH:mm:ss"
        Type = $Type
        Message = $Message
        Severity = $Severity
    }
    
    $global:alerts += $alert
    
    # Mantener solo las últimas 10 alertas
    if ($global:alerts.Count -gt 10) {
        $global:alerts = $global:alerts[-10..-1]
    }
    
    if ($SaveLogs) {
        Add-Content -Path $global:logFile -Value "[$($alert.Time)] [$($alert.Severity)] $($alert.Message)"
    }
}

# Función para monitorear autenticación
function Test-AuthEndpoint {
    $authUrl = "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key"
    $testPayload = @{
        email = "monitor@altamedica.com"
        password = "monitor123"
        returnSecureToken = $true
    } | ConvertTo-Json
    
    $startTime = Get-Date
    
    try {
        $response = Invoke-RestMethod -Uri $authUrl -Method POST -Body $testPayload -ContentType "application/json" -TimeoutSec 5 -ErrorAction Stop
        $responseTime = ((Get-Date) - $startTime).TotalMilliseconds
        
        $global:metrics.AuthSuccess++
        $global:metrics.AuthAttempts++
        $global:metrics.LastAuthTime = Get-Date
        $global:metrics.ResponseTimes += $responseTime
        
        # Mantener solo las últimas 100 mediciones
        if ($global:metrics.ResponseTimes.Count -gt 100) {
            $global:metrics.ResponseTimes = $global:metrics.ResponseTimes[-100..-1]
        }
        
        $global:metrics.AverageResponseTime = ($global:metrics.ResponseTimes | Measure-Object -Average).Average
        
        return [PSCustomObject]@{
            Success = $true
            ResponseTime = $responseTime
            Message = "Auth OK"
        }
    } catch {
        $global:metrics.AuthFailures++
        $global:metrics.AuthAttempts++
        
        if ($_.Exception.Message -like "*Unable to connect*") {
            $global:metrics.NetworkErrors++
            Add-Alert "AUTH" "No se puede conectar al emulador de Auth" "Error"
        } else {
            Add-Alert "AUTH" "Error de autenticación: $($_.Exception.Message)" "Warning"
        }
        
        return [PSCustomObject]@{
            Success = $false
            ResponseTime = 0
            Message = $_.Exception.Message
        }
    }
}

# Función para mostrar métricas
function Show-Metrics {
    Write-Host "`n📊 MÉTRICAS DE AUTENTICACIÓN" -ForegroundColor $colors.Header
    Write-Host "═══════════════════════════════════════" -ForegroundColor $colors.Header
    
    $successRate = if ($global:metrics.AuthAttempts -gt 0) { 
        [math]::Round(($global:metrics.AuthSuccess / $global:metrics.AuthAttempts) * 100, 1) 
    } else { 0 }
    
    Write-Host "Intentos totales: $($global:metrics.AuthAttempts)" -ForegroundColor $colors.Info
    Write-Host "Exitosos: $($global:metrics.AuthSuccess)" -ForegroundColor $colors.Success
    Write-Host "Fallidos: $($global:metrics.AuthFailures)" -ForegroundColor $colors.Error
    Write-Host "Tasa de éxito: $successRate%" -ForegroundColor $(if ($successRate -gt 90) { $colors.Success } elseif ($successRate -gt 70) { $colors.Warning } else { $colors.Error })
    Write-Host "Errores de red: $($global:metrics.NetworkErrors)" -ForegroundColor $colors.Error
    Write-Host "Tiempo de respuesta promedio: $([math]::Round($global:metrics.AverageResponseTime, 1))ms" -ForegroundColor $colors.Info
    
    if ($global:metrics.LastAuthTime) {
        $timeSinceLastAuth = (Get-Date) - $global:metrics.LastAuthTime
        Write-Host "Última autenticación exitosa: hace $([math]::Round($timeSinceLastAuth.TotalSeconds, 0))s" -ForegroundColor $colors.Info
    }
}

# Función para mostrar alertas recientes
function Show-Alerts {
    Write-Host "`n🚨 ALERTAS RECIENTES" -ForegroundColor $colors.Header
    Write-Host "═══════════════════════════════════════" -ForegroundColor $colors.Header
    
    if ($global:alerts.Count -eq 0) {
        Write-Host "No hay alertas activas" -ForegroundColor $colors.Success
    } else {
        foreach ($alert in $global:alerts[-5..-1]) {  # Mostrar últimas 5
            $color = switch ($alert.Severity) {
                "Error" { $colors.Error }
                "Warning" { $colors.Warning }
                default { $colors.Info }
            }
            Write-Host "[$($alert.Time)] $($alert.Message)" -ForegroundColor $color
        }
    }
}

# Función para monitorear logs en tiempo real
function Monitor-Logs {
    $logPaths = @(
        "logs\api-server.log",
        "logs\auth-errors.log",
        "apps\web-app\.next\server\app\*.log"
    )
    
    $recentLogs = @()
    
    foreach ($logPath in $logPaths) {
        if (Test-Path $logPath) {
            $logs = Get-Content $logPath -Tail 10 -ErrorAction SilentlyContinue
            foreach ($log in $logs) {
                if ($log -match "auth|Auth|AUTH|error|Error|ERROR") {
                    $recentLogs += $log
                }
            }
        }
    }
    
    if ($recentLogs.Count -gt 0) {
        Write-Host "`n📋 LOGS RECIENTES" -ForegroundColor $colors.Header
        Write-Host "═══════════════════════════════════════" -ForegroundColor $colors.Header
        
        $recentLogs[-5..-1] | ForEach-Object {
            if ($_ -match "error|Error|ERROR") {
                Write-Host $_ -ForegroundColor $colors.Error
            } else {
                Write-Host $_ -ForegroundColor $colors.Info
            }
        }
    }
}

# Función para guardar estadísticas
function Save-Statistics {
    if ($SaveLogs) {
        $stats = @{
            Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            Metrics = $global:metrics
            Alerts = $global:alerts
            Uptime = ((Get-Date) - $global:monitorStartTime).TotalMinutes
        }
        
        $stats | ConvertTo-Json -Depth 10 | Out-File $global:statsFile -Force
    }
}

# Función principal de monitoreo
function Start-Monitoring {
    $iteration = 0
    
    while ($true) {
        $iteration++
        
        # Mostrar header
        Show-Header
        
        # Verificar servicios
        Write-Host "🔍 ESTADO DE SERVICIOS" -ForegroundColor $colors.Header
        Write-Host "═══════════════════════════════════════" -ForegroundColor $colors.Header
        
        $serviceStatuses = Get-ServiceStatus
        foreach ($service in $serviceStatuses) {
            $statusIcon = if ($service.Status -eq "ONLINE") { "✅" } else { "❌" }
            Write-Host "$statusIcon $($service.Name.PadRight(20)) [$($service.Status)]" -ForegroundColor $service.Color
        }
        
        # Test de autenticación cada 3 iteraciones
        if ($iteration % 3 -eq 0) {
            Write-Host "`n🔐 TEST DE AUTENTICACIÓN" -ForegroundColor $colors.Header
            Write-Host "═══════════════════════════════════════" -ForegroundColor $colors.Header
            
            $authResult = Test-AuthEndpoint
            if ($authResult.Success) {
                Write-Host "✅ Autenticación exitosa ($([math]::Round($authResult.ResponseTime, 1))ms)" -ForegroundColor $colors.Success
            } else {
                Write-Host "❌ Autenticación fallida: $($authResult.Message)" -ForegroundColor $colors.Error
            }
        }
        
        # Mostrar métricas
        Show-Metrics
        
        # Mostrar alertas
        Show-Alerts
        
        # Monitorear logs
        Monitor-Logs
        
        # Guardar estadísticas
        Save-Statistics
        
        # Información de control
        Write-Host "`n════════════════════════════════════════" -ForegroundColor $colors.Header
        Write-Host "Presiona Ctrl+C para detener el monitor" -ForegroundColor $colors.Warning
        Write-Host "Próxima actualización en $RefreshInterval segundos..." -ForegroundColor $colors.Info
        
        # Esperar antes de la próxima actualización
        Start-Sleep -Seconds $RefreshInterval
    }
}

# Manejador de Ctrl+C
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    Write-Host "`n`n🛑 Deteniendo monitor..." -ForegroundColor Yellow
    
    # Guardar reporte final
    if ($SaveLogs) {
        $finalReport = @"
════════════════════════════════════════
REPORTE FINAL - MONITOR DE AUTENTICACIÓN
════════════════════════════════════════
Tiempo total: $([math]::Round(((Get-Date) - $global:monitorStartTime).TotalMinutes, 1)) minutos
Intentos de auth: $($global:metrics.AuthAttempts)
Exitosos: $($global:metrics.AuthSuccess)
Fallidos: $($global:metrics.AuthFailures)
Tasa de éxito: $([math]::Round(($global:metrics.AuthSuccess / [math]::Max($global:metrics.AuthAttempts, 1)) * 100, 1))%
Errores de red: $($global:metrics.NetworkErrors)
Tiempo de respuesta promedio: $([math]::Round($global:metrics.AverageResponseTime, 1))ms

Alertas totales: $($global:alerts.Count)
Log guardado en: $global:logFile
Estadísticas en: $global:statsFile
"@
        
        Add-Content -Path $global:logFile -Value $finalReport
        Write-Host $finalReport -ForegroundColor Cyan
    }
    
    Write-Host "`n✅ Monitor detenido correctamente" -ForegroundColor Green
}

# Iniciar monitoreo
try {
    Start-Monitoring
} catch {
    Write-Host "`n❌ Error en el monitor: $_" -ForegroundColor Red
} finally {
    # Limpiar
    Unregister-Event -SourceIdentifier PowerShell.Exiting -ErrorAction SilentlyContinue
}