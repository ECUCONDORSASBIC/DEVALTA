# AltaMedica - Monitor de Terminal en Tiempo Real
# Herramientas para monitorear otras terminales y procesos

Write-Host "🔍 AltaMedica - Herramientas de Monitoreo de Terminal" -ForegroundColor Green

# OPCIÓN 1: Monitorear procesos PowerShell activos
function Show-PowerShellProcesses {
    Write-Host "`n💻 Procesos PowerShell activos:" -ForegroundColor Cyan
    Get-Process -Name "pwsh", "powershell" -ErrorAction SilentlyContinue | 
    Select-Object Id, ProcessName, StartTime, @{Name="WindowTitle";Expression={$_.MainWindowTitle}} |
    Format-Table -AutoSize
}

# OPCIÓN 2: Capturar output de proceso específico por PID
function Monitor-ProcessOutput {
    param([int]$ProcessId)
    
    Write-Host "`n📊 Monitoreando proceso PID: $ProcessId" -ForegroundColor Yellow
    
    # Obtener información del proceso
    $process = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "Proceso: $($process.ProcessName)" -ForegroundColor Green
        Write-Host "Título: $($process.MainWindowTitle)" -ForegroundColor Green
        
        # Monitorear CPU usage en tiempo real
        while ($true) {
            $cpu = Get-Counter "\Process($($process.ProcessName))\% Processor Time" -ErrorAction SilentlyContinue
            if ($cpu) {
                $cpuValue = [math]::Round($cpu.CounterSamples[0].CookedValue, 2)
                Write-Host "$(Get-Date -Format 'HH:mm:ss') - CPU: $cpuValue%" -ForegroundColor Cyan
            }
            Start-Sleep -Seconds 2
        }
    } else {
        Write-Host "❌ Proceso $ProcessId no encontrado" -ForegroundColor Red
    }
}

# OPCIÓN 3: Monitorear archivos de log en tiempo real (como tail -f)
function Watch-LogFile {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        Write-Host "`n📄 Monitoreando archivo: $FilePath" -ForegroundColor Green
        Write-Host "Presiona Ctrl+C para salir" -ForegroundColor Yellow
        
        Get-Content $FilePath -Wait -Tail 10
    } else {
        Write-Host "❌ Archivo no encontrado: $FilePath" -ForegroundColor Red
    }
}

# OPCIÓN 4: Crear shared log file para múltiples terminales
function Start-SharedLogging {
    $logFile = "C:\Users\Eduardo\Documents\devaltamedica\shared-terminal.log"
    
    Write-Host "`n📝 Iniciando logging compartido:" -ForegroundColor Green
    Write-Host "Archivo: $logFile" -ForegroundColor Cyan
    
    # Función para agregar al log
    $logFunction = @"
function Write-SharedLog {
    param([string]`$Message)
    `$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    "`$timestamp [`$PID] `$Message" | Add-Content "$logFile"
}
"@
    
    Write-Host $logFunction
    Write-Host "`n💡 Para usar en otra terminal:" -ForegroundColor Yellow
    Write-Host "Write-SharedLog 'Mi mensaje aquí'" -ForegroundColor White
}

# OPCIÓN 5: Monitorear procesos npm/node específicos de AltaMedica
function Monitor-AltaMedicaProcesses {
    Write-Host "`n🏥 Monitoreando procesos AltaMedica:" -ForegroundColor Green
    
    $altamedicaProcesses = @()
    
    # Buscar procesos Node.js relacionados con puertos AltaMedica
    $ports = @(3000, 3001, 3002, 3003, 3004, 3005, 8888)
    
    foreach ($port in $ports) {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($process) {
                $altamedicaProcesses += [PSCustomObject]@{
                    Port = $port
                    PID = $process.Id
                    Name = $process.ProcessName
                    CPU = $process.CPU
                    Memory = [math]::Round($process.WorkingSet64 / 1MB, 2)
                    StartTime = $process.StartTime
                }
            }
        }
    }
    
    if ($altamedicaProcesses.Count -gt 0) {
        $altamedicaProcesses | Format-Table -AutoSize
        
        Write-Host "`n🔍 Para monitorear un proceso específico:" -ForegroundColor Yellow
        Write-Host "Monitor-ProcessOutput -ProcessId <PID>" -ForegroundColor White
    } else {
        Write-Host "❌ No hay procesos AltaMedica activos" -ForegroundColor Red
    }
}

# OPCIÓN 6: PowerShell Transcript compartido
function Start-SharedTranscript {
    $transcriptPath = "C:\Users\Eduardo\Documents\devaltamedica\shared-transcript.txt"
    
    Write-Host "`n📋 Iniciando transcript compartido:" -ForegroundColor Green
    Write-Host "Archivo: $transcriptPath" -ForegroundColor Cyan
    
    try {
        Start-Transcript -Path $transcriptPath -Append
        Write-Host "✅ Transcript iniciado - todas las acciones se guardarán" -ForegroundColor Green
        Write-Host "💡 Para ver en tiempo real desde otra terminal:" -ForegroundColor Yellow
        Write-Host "Get-Content '$transcriptPath' -Wait -Tail 20" -ForegroundColor White
    } catch {
        Write-Host "❌ Error iniciando transcript: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# MENÚ INTERACTIVO
function Show-Menu {
    Write-Host "`n" + "=" * 60 -ForegroundColor Gray
    Write-Host "🔍 HERRAMIENTAS DE MONITOREO DE TERMINAL" -ForegroundColor Green
    Write-Host "=" * 60 -ForegroundColor Gray
    Write-Host "1. Ver procesos PowerShell activos" -ForegroundColor White
    Write-Host "2. Monitorear proceso específico por PID" -ForegroundColor White
    Write-Host "3. Monitorear archivo de log (tail -f)" -ForegroundColor White
    Write-Host "4. Configurar logging compartido" -ForegroundColor White
    Write-Host "5. Monitorear procesos AltaMedica" -ForegroundColor White
    Write-Host "6. Iniciar transcript compartido" -ForegroundColor White
    Write-Host "7. Salir" -ForegroundColor White
    Write-Host "=" * 60 -ForegroundColor Gray
    
    $choice = Read-Host "Selecciona una opción (1-7)"
    
    switch ($choice) {
        "1" { Show-PowerShellProcesses }
        "2" { 
            $pid = Read-Host "Ingresa el PID del proceso"
            Monitor-ProcessOutput -ProcessId $pid
        }
        "3" { 
            $file = Read-Host "Ingresa la ruta del archivo de log"
            Watch-LogFile -FilePath $file
        }
        "4" { Start-SharedLogging }
        "5" { Monitor-AltaMedicaProcesses }
        "6" { Start-SharedTranscript }
        "7" { Write-Host "👋 ¡Hasta luego!" -ForegroundColor Green; return }
        default { Write-Host "❌ Opción inválida" -ForegroundColor Red }
    }
}

# FUNCIONES RÁPIDAS PARA USAR
Write-Host "`n🚀 FUNCIONES DISPONIBLES:" -ForegroundColor Yellow
Write-Host "Show-PowerShellProcesses    - Ver procesos PowerShell" -ForegroundColor White
Write-Host "Monitor-AltaMedicaProcesses - Ver procesos AltaMedica" -ForegroundColor White
Write-Host "Watch-LogFile -FilePath 'archivo.log' - Monitorear log" -ForegroundColor White
Write-Host "Start-SharedTranscript     - Iniciar transcript compartido" -ForegroundColor White

# Mostrar menú
Show-Menu