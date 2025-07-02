# =================================================================================
# Script de Optimización y Mantenimiento Avanzado para Windows 10/11
# Creado por: Asistente de IA Experto - ALTAMEDICA Platform
# Versión: 2.1 - Edición Segura y Profesional (Revisado)
# Ejecución: Requiere permisos de Administrador
# =================================================================================

param(
    [switch]$SkipCleanup,
    [switch]$CreateRestorePoint,
    [switch]$Verbose
)

# --- Configuración y Funciones de Verificación ---
$Host.UI.RawUI.WindowTitle = "ALTAMEDICA - Optimización Segura del Sistema v2.1"

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
    return $currentUser.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-NOT (Test-Administrator)) {
    Write-Host "❌ ERROR: Se requieren permisos de Administrador" -ForegroundColor Red
    Write-Host "💡 Solución: Haz clic derecho sobre el archivo .ps1 y selecciona 'Ejecutar como Administrador'" -ForegroundColor Yellow
    Write-Host "⏳ Cerrando en 10 segundos..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
    Exit 1
}

# --- Creación de Punto de Restauración (Recomendado) ---
function New-SystemRestorePoint {
    if ($CreateRestorePoint) {
        Write-Host "[1/7] 🔄 Creando punto de restauración del sistema..." -ForegroundColor Cyan
        try {
            Checkpoint-Computer -Description "Antes de Optimización ALTAMEDICA $(Get-Date -Format 'yyyy-MM-dd HH:mm')" -RestorePointType "MODIFY_SETTINGS"
            Write-Host "✅ Punto de restauración creado exitosamente" -ForegroundColor Green
        }
        catch {
            Write-Warning "⚠️ No se pudo crear el punto de restauración. Se recomienda cancelar y solucionar el problema del servicio VSS."
            Write-Host "Continuar puede ser riesgoso. ¿Deseas continuar de todos modos? (S/N)" -ForegroundColor Yellow
            $confirmation = Read-Host
            if ($confirmation -ne 'S') {
                Write-Host "🛑 Operación cancelada por el usuario." -ForegroundColor Red
                Exit 1
            }
        }
    }
    else {
        Write-Host "[1/7] ⏩ Omitiendo creación de punto de restauración por parámetro. (No recomendado)" -ForegroundColor Yellow
    }
}

# --- Mantenimiento Seguro del Sistema ---
function Invoke-SystemMaintenance {
    Write-Host "[2/7] 🧹 Limpieza de Componentes de Windows (DISM)..." -ForegroundColor Green
    try {
        DISM.exe /Online /Cleanup-Image /StartComponentCleanup | Out-Null
        Write-Host "✅ Limpieza de componentes completada." -ForegroundColor Green
    }
    catch { Write-Error "❌ Error en limpieza de componentes: $($_.Exception.Message)" }
    
    Write-Host "[3/7] 🔍 Verificación de Integridad del Sistema (SFC & DISM)..." -ForegroundColor Green
    try {
        Write-Host "   (Paso 1/2) Ejecutando SFC /scannow..." -ForegroundColor Yellow
        sfc.exe /scannow | Out-Null
        Write-Host "   (Paso 2/2) Ejecutando DISM /RestoreHealth..." -ForegroundColor Yellow
        DISM.exe /Online /Cleanup-Image /RestoreHealth | Out-Null
        Write-Host "✅ Verificación de integridad completada." -ForegroundColor Green
    }
    catch { Write-Error "❌ Error en verificación de integridad: $($_.Exception.Message)" }
}

# --- Limpieza Profunda de Archivos y Cachés ---
function Invoke-DeepCleanup {
    Write-Host "[4/7] 🗑️ Limpieza Profunda de Archivos Temporales..." -ForegroundColor Green
    $tempLocations = @(
        "$env:TEMP",
        "$env:SystemRoot\Temp",
        "$env:LOCALAPPDATA\Temp",
        "$env:LOCALAPPDATA\Microsoft\Windows\INetCache",
        "$env:LOCALAPPDATA\Microsoft\Windows\WebCache"
    )
    $totalFreed = 0
    foreach ($location in $tempLocations) {
        if (Test-Path $location) {
            $sizeBefore = (Get-ChildItem -Path $location -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
            Remove-Item -Path "$location\*" -Recurse -Force -ErrorAction SilentlyContinue
            $sizeAfter = (Get-ChildItem -Path $location -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
            $freed = $sizeBefore - $sizeAfter
            if ($freed -gt 0) { $totalFreed += $freed }
        }
    }
    Write-Host "   - Espacio total liberado en archivos temporales: $([math]::Round($totalFreed/1MB, 2)) MB" -ForegroundColor White

    Write-Host "[5/7] 🧼 Limpieza de Cachés del Sistema..." -ForegroundColor Green
    try {
        Write-Host "   - Limpiando caché DNS..." -ForegroundColor Yellow
        ipconfig /flushdns | Out-Null
        
        Write-Host "   - Limpiando caché de Microsoft Store..." -ForegroundColor Yellow
        Start-Process wsreset.exe -Wait -WindowStyle Hidden -ErrorAction SilentlyContinue
        
        Write-Host "   - Limpiando caché de miniaturas (requiere reiniciar Explorador)..." -ForegroundColor Yellow
        Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
        Remove-Item -Path "$env:LOCALAPPDATA\Microsoft\Windows\Explorer\thumbcache_*.db" -Force -ErrorAction SilentlyContinue
        Start-Process explorer
        
        Write-Host "✅ Limpieza de cachés completada." -ForegroundColor Green
    }
    catch {
        if (-not (Get-Process -Name "explorer" -ErrorAction SilentlyContinue)) { Start-Process explorer }
        Write-Error "❌ Error en limpieza de cachés: $($_.Exception.Message)"
    }
}

# --- Optimización Segura de Unidades ---
function Invoke-SafeDriveOptimization {
    Write-Host "[6/7] 💿 Optimización Segura de Unidades..." -ForegroundColor Green
    try {
        $volumes = Get-Volume | Where-Object { $_.DriveType -eq 'Fixed' -and $_.HealthStatus -eq 'Healthy' }
        foreach ($volume in $volumes) {
            Write-Host "   - Optimizando unidad $($volume.DriveLetter)... (Esto puede tardar varios minutos)" -ForegroundColor Yellow
            Optimize-Volume -DriveLetter $volume.DriveLetter -Verbose
        }
        Write-Host "✅ Optimización de unidades completada." -ForegroundColor Green
    }
    catch { Write-Error "❌ Error en optimización de unidades: $($_.Exception.Message)" }
}

# --- Análisis Final y Reporte ---
function Invoke-FinalReport {
    Write-Host "[7/7] 📊 Análisis Final y Recomendaciones..." -ForegroundColor Green
    $os = Get-WmiObject -Class Win32_OperatingSystem
    $cs = Get-WmiObject -Class Win32_ComputerSystem
    $totalRAM = [math]::Round($cs.TotalPhysicalMemory / 1GB, 2)
    $freeSpace = [math]::Round((Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'").FreeSpace / 1GB, 2)
    
    Write-Host "`n========================= REPORTE DE OPTIMIZACIÓN v2.1 =========================" -ForegroundColor Cyan
    Write-Host "🖥️  Sistema Operativo: $($os.Caption) | RAM Total: $totalRAM GB | Espacio Libre en C: $freeSpace GB" -ForegroundColor White
    Write-Host "✅ Las tareas de mantenimiento seguras han sido completadas." -ForegroundColor Green
    Write-Host "💡 ACCIONES MANUALES RECOMENDADAS PARA MÁXIMO RENDIMIENTO:" -ForegroundColor Yellow
    Write-Host "   1. GESTIÓN DE INICIO: Abre el Administrador de Tareas (`Ctrl+Shift+Esc`), ve a 'Aplicaciones de arranque' y deshabilita los programas que no necesites al iniciar."
    Write-Host "   2. DESINSTALAR SOFTWARE: Ve a 'Configuración > Aplicaciones > Aplicaciones instaladas' y desinstala el software que ya no utilices."
    Write-Host "   3. PLAN DE ENERGÍA: Si usas un PC de escritorio, puedes seleccionar el plan 'Máximo rendimiento' en Opciones de Energía para obtener un extra de potencia."
    Write-Host "   4. SERVICIOS (Avanzado): Si sabes que no usas ciertas funciones (Búsqueda, Biometría), investiga cómo poner en 'Manual' los servicios correspondientes."
    Write-Host "================================================================================" -ForegroundColor Cyan
}

# --- Flujo Principal de Ejecución ---
function Start-SystemOptimization {
    Clear-Host
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "     ALTAMEDICA - OPTIMIZACIÓN SEGURA v2.1" -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "🚀 Iniciando proceso de mantenimiento completo..." -ForegroundColor White
    
    $startTime = Get-Date
    New-SystemRestorePoint

    if (-not $SkipCleanup) {
        Invoke-SystemMaintenance
        Invoke-DeepCleanup
        Invoke-SafeDriveOptimization
    }
    else {
        Write-Host "⏩ Omitiendo todas las tareas de limpieza y optimización por parámetro." -ForegroundColor Yellow
    }
    
    Invoke-FinalReport
    
    $duration = New-TimeSpan -Start $startTime -End (Get-Date)
    Write-Host "`n⏱️  Tiempo total de ejecución: $($duration.Minutes) minutos y $($duration.Seconds) segundos." -ForegroundColor Cyan
    Write-Host "`n🎉 Mantenimiento finalizado. Se recomienda reiniciar el equipo para aplicar todos los cambios." -ForegroundColor Green
}

# --- Ejecución del Script ---
try {
    Start-SystemOptimization
}
catch {
    Write-Error "❌ ERROR CRÍTICO IRRECUPERABLE: $($_.Exception.Message)"
}