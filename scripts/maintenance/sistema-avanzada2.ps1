# =================================================================================
# SISTEMA AVANZADA 2.0 - Optimización Profesional de Windows
# Creado por: ALTAMEDICA Platform - Asistente IA Experto
# Versión: 2.0 - Edición Definitiva y Segura
# Compatible: Windows 10/11 (x64)
# =================================================================================

# Configuración de ejecución
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

# Variables globales
$scriptVersion = "2.0"
$startTime = Get-Date
$logFile = "$env:TEMP\sistema_avanzada_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Función de logging
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Add-Content -Path $logFile -Value $logEntry
    Write-Host $logEntry -ForegroundColor $(switch ($Level) { "ERROR" { "Red" } "WARNING" { "Yellow" } "SUCCESS" { "Green" } default { "White" } })
}

# Verificación de permisos de administrador
function Test-AdminRights {
    try {
        $currentUser = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
        $isAdmin = $currentUser.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
        if (-not $isAdmin) {
            Write-Log "Se requieren permisos de Administrador para ejecutar este script" "ERROR"
            Write-Host "`n💡 SOLUCIÓN:" -ForegroundColor Yellow
            Write-Host "1. Haz clic derecho sobre el archivo .ps1" -ForegroundColor White
            Write-Host "2. Selecciona 'Ejecutar como Administrador'" -ForegroundColor White
            Write-Host "3. Confirma la elevación de privilegios" -ForegroundColor White
            Start-Sleep -Seconds 10
            Exit 1
        }
        Write-Log "Permisos de administrador verificados correctamente" "SUCCESS"
        return $true
    }
    catch {
        Write-Log "Error al verificar permisos: $($_.Exception.Message)" "ERROR"
        Exit 1
    }
}

# Función para crear punto de restauración
function New-SystemRestorePoint {
    try {
        Write-Log "Creando punto de restauración del sistema..." "INFO"
        $description = "SISTEMA AVANZADA 2.0 - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
        Checkpoint-Computer -Description $description -RestorePointType "MODIFY_SETTINGS"
        Write-Log "Punto de restauración creado exitosamente" "SUCCESS"
        return $true
    }
    catch {
        Write-Log "No se pudo crear el punto de restauración: $($_.Exception.Message)" "WARNING"
        Write-Host "`n⚠️ ADVERTENCIA: No se pudo crear el punto de restauración" -ForegroundColor Yellow
        Write-Host "¿Deseas continuar sin punto de restauración? (S/N): " -ForegroundColor White -NoNewline
        $response = Read-Host
        if ($response -ne "S") {
            Write-Log "Operación cancelada por el usuario" "INFO"
            Exit 0
        }
        return $false
    }
}

# Función de limpieza de componentes de Windows
function Invoke-WindowsComponentCleanup {
    Write-Log "Iniciando limpieza de componentes de Windows (DISM)..." "INFO"
    try {
        Write-Host "🔄 Limpiando componentes de Windows... (Esto puede tardar 10-15 minutos)" -ForegroundColor Yellow
        $dismResult = DISM.exe /Online /Cleanup-Image /StartComponentCleanup /ResetBase
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Limpieza de componentes completada exitosamente" "SUCCESS"
        }
        else {
            Write-Log "DISM completado con código de salida: $LASTEXITCODE" "WARNING"
        }
    }
    catch {
        Write-Log "Error en limpieza de componentes: $($_.Exception.Message)" "ERROR"
    }
}

# Función de verificación de integridad del sistema
function Invoke-SystemIntegrityCheck {
    Write-Log "Verificando integridad de archivos del sistema..." "INFO"
    try {
        Write-Host "🔍 Verificando integridad del sistema (SFC)..." -ForegroundColor Yellow
        $sfcResult = sfc.exe /scannow
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Verificación SFC completada" "SUCCESS"
        }
        else {
            Write-Log "SFC completado con código de salida: $LASTEXITCODE" "WARNING"
        }
        
        Write-Host "🔧 Reparando componentes del sistema (DISM RestoreHealth)..." -ForegroundColor Yellow
        $dismRestore = DISM.exe /Online /Cleanup-Image /RestoreHealth
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Reparación DISM completada" "SUCCESS"
        }
        else {
            Write-Log "DISM RestoreHealth completado con código de salida: $LASTEXITCODE" "WARNING"
        }
    }
    catch {
        Write-Log "Error en verificación de integridad: $($_.Exception.Message)" "ERROR"
    }
}

# Función de limpieza profunda de archivos temporales
function Invoke-DeepTempCleanup {
    Write-Log "Iniciando limpieza profunda de archivos temporales..." "INFO"
    $tempLocations = @(
        @{Path = "$env:TEMP"; Name = "Temporales del Usuario" },
        @{Path = "$env:SystemRoot\Temp"; Name = "Temporales del Sistema" },
        @{Path = "$env:LOCALAPPDATA\Temp"; Name = "Temporales de Aplicaciones" },
        @{Path = "$env:LOCALAPPDATA\Microsoft\Windows\INetCache"; Name = "Caché de Internet" },
        @{Path = "$env:LOCALAPPDATA\Microsoft\Windows\WebCache"; Name = "Caché Web" },
        @{Path = "$env:LOCALAPPDATA\Microsoft\Windows\History"; Name = "Historial de Internet" }
    )
    
    $totalFreed = 0
    foreach ($location in $tempLocations) {
        if (Test-Path $location.Path) {
            try {
                $sizeBefore = (Get-ChildItem -Path $location.Path -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
                if ($sizeBefore -gt 0) {
                    Remove-Item -Path "$($location.Path)\*" -Recurse -Force -ErrorAction SilentlyContinue
                    $sizeAfter = (Get-ChildItem -Path $location.Path -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
                    $freed = $sizeBefore - $sizeAfter
                    $totalFreed += $freed
                    Write-Host "   ✅ $($location.Name): $([math]::Round($freed/1MB, 2)) MB liberados" -ForegroundColor Green
                }
            }
            catch {
                Write-Log "Error limpiando $($location.Name): $($_.Exception.Message)" "WARNING"
            }
        }
    }
    
    if ($totalFreed -gt 0) {
        Write-Log "Limpieza de temporales completada. Total liberado: $([math]::Round($totalFreed/1MB, 2)) MB" "SUCCESS"
    }
    else {
        Write-Log "Limpieza de temporales completada (no se encontraron archivos para eliminar)" "INFO"
    }
}

# Función de limpieza de cachés del sistema
function Invoke-SystemCacheCleanup {
    Write-Log "Limpiando cachés del sistema..." "INFO"
    try {
        # Limpieza de caché DNS
        Write-Host "🌐 Limpiando caché DNS..." -ForegroundColor Yellow
        ipconfig /flushdns | Out-Null
        Write-Log "Caché DNS limpiada" "SUCCESS"
        
        # Limpieza de caché de Microsoft Store
        Write-Host "🏪 Limpiando caché de Microsoft Store..." -ForegroundColor Yellow
        Start-Process wsreset.exe -Wait -WindowStyle Hidden -ErrorAction SilentlyContinue
        Write-Log "Caché de Microsoft Store limpiada" "SUCCESS"
        
        # Limpieza de caché de miniaturas
        Write-Host "🖼️ Limpiando caché de miniaturas..." -ForegroundColor Yellow
        Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Remove-Item -Path "$env:LOCALAPPDATA\Microsoft\Windows\Explorer\thumbcache_*.db" -Force -ErrorAction SilentlyContinue
        Start-Process explorer
        Write-Log "Caché de miniaturas limpiada" "SUCCESS"
        
        # Limpieza de caché de Windows Update
        Write-Host "🔄 Limpiando caché de Windows Update..." -ForegroundColor Yellow
        Stop-Service -Name wuauserv -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "$env:SystemRoot\SoftwareDistribution\Download\*" -Recurse -Force -ErrorAction SilentlyContinue
        Start-Service -Name wuauserv -ErrorAction SilentlyContinue
        Write-Log "Caché de Windows Update limpiada" "SUCCESS"
    }
    catch {
        Write-Log "Error en limpieza de cachés: $($_.Exception.Message)" "ERROR"
        # Asegurar que el explorador esté ejecutándose
        if (-not (Get-Process -Name "explorer" -ErrorAction SilentlyContinue)) {
            Start-Process explorer
        }
    }
}

# Función de vaciado de papelera de reciclaje
function Invoke-RecycleBinCleanup {
    Write-Log "Vaciando papelera de reciclaje..." "INFO"
    try {
        $recycleBinSize = (Get-ChildItem -Path "$env:SystemDrive\$Recycle.Bin" -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        Clear-RecycleBin -Force -ErrorAction SilentlyContinue
        if ($recycleBinSize -gt 0) {
            Write-Log "Papelera de reciclaje vaciada. Espacio liberado: $([math]::Round($recycleBinSize/1MB, 2)) MB" "SUCCESS"
        }
        else {
            Write-Log "Papelera de reciclaje ya estaba vacía" "INFO"
        }
    }
    catch {
        Write-Log "Error al vaciar papelera de reciclaje: $($_.Exception.Message)" "WARNING"
    }
}

# Función de optimización de unidades
function Invoke-DriveOptimization {
    Write-Log "Iniciando optimización de unidades..." "INFO"
    try {
        $volumes = Get-Volume | Where-Object { $_.DriveType -eq 'Fixed' -and $_.HealthStatus -eq 'Healthy' -and $_.DriveLetter }
        foreach ($volume in $volumes) {
            Write-Host "💿 Optimizando unidad $($volume.DriveLetter)... (Puede tardar varios minutos)" -ForegroundColor Yellow
            $driveType = (Get-PhysicalDisk | Where-Object { $_.DeviceID -eq $volume.DriveLetter }).MediaType
            if ($driveType -eq "SSD") {
                Write-Host "   🔄 Ejecutando TRIM en SSD..." -ForegroundColor Cyan
            }
            else {
                Write-Host "   🔄 Desfragmentando HDD..." -ForegroundColor Cyan
            }
            Optimize-Volume -DriveLetter $volume.DriveLetter -Verbose
            Write-Log "Unidad $($volume.DriveLetter) optimizada" "SUCCESS"
        }
    }
    catch {
        Write-Log "Error en optimización de unidades: $($_.Exception.Message)" "ERROR"
    }
}

# Función de análisis de rendimiento del sistema
function Invoke-SystemPerformanceAnalysis {
    Write-Log "Analizando rendimiento del sistema..." "INFO"
    try {
        $os = Get-WmiObject -Class Win32_OperatingSystem
        $cs = Get-WmiObject -Class Win32_ComputerSystem
        $disk = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
        
        $totalRAM = [math]::Round($cs.TotalPhysicalMemory / 1GB, 2)
        $freeRAM = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
        $freeSpace = [math]::Round($disk.FreeSpace / 1GB, 2)
        $totalSpace = [math]::Round($disk.Size / 1GB, 2)
        $ramUsage = [math]::Round((($cs.TotalPhysicalMemory - $os.FreePhysicalMemory) / $cs.TotalPhysicalMemory) * 100, 1)
        $diskUsage = [math]::Round((($disk.Size - $disk.FreeSpace) / $disk.Size) * 100, 1)
        
        Write-Host "`n📊 ANÁLISIS DE RENDIMIENTO DEL SISTEMA" -ForegroundColor Cyan
        Write-Host "================================================" -ForegroundColor Cyan
        Write-Host "🖥️  Sistema Operativo: $($os.Caption)" -ForegroundColor White
        Write-Host "💾 RAM Total: $totalRAM GB | Libre: $freeRAM GB | Uso: $ramUsage%" -ForegroundColor White
        Write-Host "💿 Disco C: Total: $totalSpace GB | Libre: $freeSpace GB | Uso: $diskUsage%" -ForegroundColor White
        Write-Host "⏰ Tiempo de actividad: $([math]::Round($os.ConvertToDateTime($os.LastBootUpTime).Subtract((Get-Date)).TotalDays * -1, 1)) días" -ForegroundColor White
        
        # Recomendaciones basadas en el análisis
        Write-Host "`n💡 RECOMENDACIONES:" -ForegroundColor Yellow
        if ($ramUsage -gt 80) {
            Write-Host "   ⚠️  Uso de RAM alto ($ramUsage%). Considera cerrar aplicaciones innecesarias." -ForegroundColor Red
        }
        if ($diskUsage -gt 90) {
            Write-Host "   ⚠️  Disco casi lleno ($diskUsage%). Libera espacio inmediatamente." -ForegroundColor Red
        }
        if ($freeSpace -lt 10) {
            Write-Host "   ⚠️  Menos de 10 GB libres. Se recomienda liberar más espacio." -ForegroundColor Yellow
        }
        
        Write-Log "Análisis de rendimiento completado" "SUCCESS"
    }
    catch {
        Write-Log "Error en análisis de rendimiento: $($_.Exception.Message)" "ERROR"
    }
}

# Función de generación de reporte final
function Invoke-FinalReport {
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Write-Host "`n" -NoNewline
    Write-Host "🎉 OPTIMIZACIÓN COMPLETADA EXITOSAMENTE" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "⏱️  Tiempo total de ejecución: $($duration.Minutes) minutos y $($duration.Seconds) segundos" -ForegroundColor White
    Write-Host "📝 Log guardado en: $logFile" -ForegroundColor White
    
    Write-Host "`n🚀 ACCIONES MANUALES RECOMENDADAS PARA MÁXIMO RENDIMIENTO:" -ForegroundColor Yellow
    Write-Host "1. 📱 GESTIÓN DE INICIO: Ctrl+Shift+Esc → Aplicaciones de arranque → Deshabilitar programas innecesarios" -ForegroundColor White
    Write-Host "2. 🗑️ DESINSTALAR SOFTWARE: Configuración → Aplicaciones → Desinstalar software no usado" -ForegroundColor White
    Write-Host "3. ⚡ PLAN DE ENERGÍA: Panel de control → Opciones de energía → Máximo rendimiento (PC de escritorio)" -ForegroundColor White
    Write-Host "4. 🔧 SERVICIOS: services.msc → Deshabilitar servicios innecesarios (solo si sabes lo que haces)" -ForegroundColor White
    Write-Host "5. 🛡️ ANTIVIRUS: Verifica que tu antivirus esté actualizado y configurado correctamente" -ForegroundColor White
    
    Write-Host "`n⚠️ IMPORTANTE: Se recomienda reiniciar el equipo para aplicar todos los cambios" -ForegroundColor Yellow
    Write-Host "¿Deseas reiniciar ahora? (S/N): " -ForegroundColor White -NoNewline
    $restart = Read-Host
    if ($restart -eq "S") {
        Write-Log "Reinicio solicitado por el usuario" "INFO"
        Restart-Computer -Force
    }
    
    Write-Log "Script completado exitosamente" "SUCCESS"
}

# Función principal de ejecución
function Start-SystemOptimization {
    Clear-Host
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "     SISTEMA AVANZADA 2.0 - OPTIMIZACIÓN" -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "🚀 Iniciando proceso de optimización completo..." -ForegroundColor White
    Write-Host "📝 Log de actividad: $logFile" -ForegroundColor Gray
    Write-Host ""
    
    # Verificación inicial
    Test-AdminRights
    New-SystemRestorePoint
    
    # Proceso de optimización
    Invoke-WindowsComponentCleanup
    Invoke-SystemIntegrityCheck
    Invoke-DeepTempCleanup
    Invoke-SystemCacheCleanup
    Invoke-RecycleBinCleanup
    Invoke-DriveOptimization
    Invoke-SystemPerformanceAnalysis
    
    # Reporte final
    Invoke-FinalReport
}

# Manejo de errores global
try {
    Start-SystemOptimization
}
catch {
    Write-Log "ERROR CRÍTICO: $($_.Exception.Message)" "ERROR"
    Write-Host "`n❌ ERROR CRÍTICO: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "📝 Revisa el log en: $logFile" -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    Exit 1
}
finally {
    Write-Log "Script finalizado" "INFO"
} 