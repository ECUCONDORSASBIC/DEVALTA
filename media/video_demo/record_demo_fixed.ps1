# 🎬 Script de Grabación Automática AltaMedica
# Ejecuta este script para abrir secuencialmente todas las URLs del demo

param(
    [switch]$AutoRecord = $false
)

Write-Host "🎬 Iniciando grabación automática de AltaMedica Demo" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan

# Configuración de escenas
$scenes = @(
    @{
        name = "intro"
        url = "http://localhost:3003"
        title = "AltaMedica - Plataforma Médica Integral"
        duration = 3
        description = "Sistema médico completo para pacientes y profesionales"
    },
    @{
        name = "patients_dashboard"
        url = "http://localhost:3003"
        title = "Dashboard de Pacientes"
        duration = 6
        description = "Acceso a citas, historial médico y telemedicina"
    },
    @{
        name = "doctor_search"
        url = "http://localhost:3003/doctors"
        title = "Búsqueda de Especialistas"
        duration = 5
        description = "Encuentra el doctor perfecto con filtros avanzados"
    },
    @{
        name = "telemedicine"
        url = "http://localhost:3003/telemedicine"
        title = "Telemedicina Avanzada"
        duration = 7
        description = "Consultas médicas por video de alta calidad"
    },
    @{
        name = "doctors_dashboard"
        url = "http://localhost:3002"
        title = "Panel Médico Profesional"
        duration = 6
        description = "Herramientas completas para profesionales médicos"
    },
    @{
        name = "patient_management"
        url = "http://localhost:3002/pacientes"
        title = "Gestión de Pacientes"
        duration = 5
        description = "Sistema integral de historiales y seguimiento"
    },
    @{
        name = "marketplace"
        url = "http://localhost:3002/marketplace"
        title = "Marketplace Médico B2B"
        duration = 6
        description = "Conecta profesionales con oportunidades únicas"
    },
    @{
        name = "outro"
        url = "http://localhost:3003"
        title = "AltaMedica - El Futuro Médico"
        duration = 4
        description = "Transformando la atención médica digital"
    }
)

# Verificar servicios
Write-Host "📋 Verificando servicios..." -ForegroundColor Yellow

$services = @{
    "Patients" = "http://localhost:3003"
    "Doctors" = "http://localhost:3002"
    "Admin" = "http://localhost:3005"
}

$allServicesRunning = $true

foreach($service in $services.GetEnumerator()) {
    try {
        $response = Invoke-WebRequest -Uri "$($service.Value)/api/health" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        Write-Host "✅ $($service.Key) OK" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($service.Key) no disponible en $($service.Value)" -ForegroundColor Red
        $allServicesRunning = $false
    }
}

if (-not $allServicesRunning) {
    Write-Host "`n⚠️ Algunos servicios no están ejecutándose" -ForegroundColor Yellow
    Write-Host "💡 Ejecuta primero: pnpm --filter patients dev" -ForegroundColor Cyan
    Write-Host "💡 Y también: pnpm --filter doctors dev" -ForegroundColor Cyan
    
    $continue = Read-Host "`n¿Continuar de todos modos? (y/N)"
    if ($continue -notmatch '^[yYsS]') {
        Write-Host "❌ Operación cancelada" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n🎯 Instrucciones de grabación:" -ForegroundColor Cyan
Write-Host "1. Abre OBS Studio" -ForegroundColor White
Write-Host "2. Configura resolución 1920x1080 @ 60fps" -ForegroundColor White
Write-Host "3. Crea una fuente 'Browser Source' o 'Captura de Ventana'" -ForegroundColor White
Write-Host "4. Inicia grabación en OBS AHORA" -ForegroundColor Yellow

if (-not $AutoRecord) {
    Write-Host "`nPresiona ENTER cuando estés listo para comenzar la secuencia..." -ForegroundColor Yellow
    Read-Host
}

Write-Host "`n🎬 Iniciando secuencia de grabación..." -ForegroundColor Green

$totalDuration = ($scenes | Measure-Object -Property duration -Sum).Sum
Write-Host "⏱️ Duración total estimada: $totalDuration segundos" -ForegroundColor Cyan

foreach($scene in $scenes) {
    $sceneNumber = ([array]::IndexOf($scenes, $scene)) + 1
    
    Write-Host "`n📍 Escena $sceneNumber/$($scenes.Count): $($scene.title)" -ForegroundColor Yellow
    Write-Host "   URL: $($scene.url)" -ForegroundColor Gray
    Write-Host "   Duración: $($scene.duration) segundos" -ForegroundColor Gray
    Write-Host "   Descripción: $($scene.description)" -ForegroundColor Gray
    
    # Abrir URL en navegador
    try {
        Start-Process $scene.url
        Write-Host "🌐 URL abierta" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error abriendo URL: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Countdown visual
    for ($i = $scene.duration; $i -gt 0; $i--) {
        Write-Host "`r⏱️ Tiempo restante: $i segundos " -NoNewline -ForegroundColor Cyan
        Start-Sleep -Seconds 1
    }
    Write-Host "`r✅ Escena completada                    " -ForegroundColor Green
}

Write-Host "`n🎬 Efectos recomendados para aplicar en post-producción:" -ForegroundColor Green
Write-Host "• Zoom rápido: Scale from 100% to 120% in 0.5s" -ForegroundColor White
Write-Host "• Blur transition: Gaussian blur 0-10-0 over 1s" -ForegroundColor White
Write-Host "• Pan suave: Position keyframes with easing" -ForegroundColor White
Write-Host "• Fade transitions: Opacity 0-100-0" -ForegroundColor White

Write-Host "`n📁 Archivos de configuración generados:" -ForegroundColor Cyan
Write-Host "• obs_scenes.json - Configuración para OBS" -ForegroundColor White
Write-Host "• davinci_resolve_config.json - Configuración para DaVinci" -ForegroundColor White
Write-Host "• MANUAL_VIDEO_GUIDE.md - Guía completa" -ForegroundColor White

Write-Host "`n✅ Script completado!" -ForegroundColor Green
Write-Host "🎯 Tu grabación debería tener aproximadamente $totalDuration segundos" -ForegroundColor Yellow
Write-Host "🎨 Ahora edita el video en DaVinci Resolve con los efectos sugeridos" -ForegroundColor Cyan
