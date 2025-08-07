# Script de Grabacion Automatica AltaMedica
# Usa este script para grabar automaticamente todas las escenas

# Configuracion
$outputPath = "C:\Users\Eduardo\Documents\devaltamedica\media\video_demo"
$scenes = @(
    @{
        name = "intro"
        url = "http://localhost:3003"
        title = "AltaMedica - Plataforma Medica Integral"
        duration = 3
        description = "Sistema medico completo para pacientes y profesionales"
    },
    @{
        name = "patients_dashboard"
        url = "http://localhost:3003"
        title = "Dashboard de Pacientes"
        duration = 6
        description = "Acceso a citas, historial medico y telemedicina"
    },
    @{
        name = "doctor_search"
        url = "http://localhost:3003/doctors"
        title = "Busqueda de Especialistas"
        duration = 5
        description = "Encuentra el doctor perfecto con filtros avanzados"
    },
    @{
        name = "telemedicine"
        url = "http://localhost:3003/telemedicine"
        title = "Telemedicina Avanzada"
        duration = 7
        description = "Consultas medicas por video de alta calidad"
    },
    @{
        name = "doctors_dashboard"
        url = "http://localhost:3002"
        title = "Panel Medico Profesional"
        duration = 6
        description = "Herramientas completas para profesionales medicos"
    },
    @{
        name = "patient_management"
        url = "http://localhost:3002/pacientes"
        title = "Gestion de Pacientes"
        duration = 5
        description = "Sistema integral de historiales y seguimiento"
    },
    @{
        name = "marketplace"
        url = "http://localhost:3002/marketplace"
        title = "Marketplace Medico B2B"
        duration = 6
        description = "Conecta profesionales con oportunidades unicas"
    },
    @{
        name = "outro"
        url = "http://localhost:3003"
        title = "AltaMedica - El Futuro Medico"
        duration = 4
        description = "Transformando la atencion medica digital"
    }
)

Write-Host "Iniciando grabacion automatica de AltaMedica Demo" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan

# Verificar servicios
Write-Host "Verificando servicios..." -ForegroundColor Yellow

$services = @{
    "Patients" = "http://localhost:3003"
    "Doctors" = "http://localhost:3002"
    "Admin" = "http://localhost:3005"
}

foreach($service in $services.GetEnumerator()) {
    try {
        $response = Invoke-WebRequest -Uri "$($service.Value)/api/health" -TimeoutSec 3 -UseBasicParsing
        Write-Host "OK $($service.Key) OK" -ForegroundColor Green
    } catch {
        Write-Host "ERROR $($service.Key) no disponible en $($service.Value)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Instrucciones de grabacion:" -ForegroundColor Cyan
Write-Host "1. Abre OBS Studio" -ForegroundColor White
Write-Host "2. Configura resolucion 1920x1080 @ 60fps" -ForegroundColor White
Write-Host "3. Crea una fuente Browser Source para cada URL" -ForegroundColor White
Write-Host "4. Aplica estos efectos durante la grabacion:" -ForegroundColor White

foreach($scene in $scenes) {
    Write-Host ""
    Write-Host "Escena: $($scene.title)" -ForegroundColor Yellow
    Write-Host "   URL: $($scene.url)" -ForegroundColor Gray
    Write-Host "   Duracion: $($scene.duration) segundos" -ForegroundColor Gray
    Write-Host "   Descripcion: $($scene.description)" -ForegroundColor Gray
    
    # Abrir URL en navegador
    Start-Process $scene.url
    
    Write-Host "Esperando $($scene.duration) segundos para siguiente escena..." -ForegroundColor Cyan
    Start-Sleep -Seconds $scene.duration
}

Write-Host ""
Write-Host "Efectos recomendados para aplicar en post-produccion:" -ForegroundColor Green
Write-Host "- Zoom rapido: Scale from 100% to 120% in 0.5s" -ForegroundColor White
Write-Host "- Blur transition: Gaussian blur 0-10-0 over 1s" -ForegroundColor White
Write-Host "- Pan suave: Position keyframes with easing" -ForegroundColor White
Write-Host "- Fade transitions: Opacity 0-100-0" -ForegroundColor White

Write-Host ""
Write-Host "Script completado!" -ForegroundColor Green
