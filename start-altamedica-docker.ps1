# ===== ALTAMEDICA - DOCKER STARTUP SCRIPT =====
# Script de PowerShell para ejecutar toda la plataforma AltaMedica en Docker

Write-Host "🏥 ALTAMEDICA - DOCKER STARTUP SCRIPT" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Verificar si Docker está corriendo
Write-Host "🔍 Verificando Docker..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "✅ Docker está disponible" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está disponible. Instala Docker Desktop." -ForegroundColor Red
    exit 1
}

# Verificar si Docker Desktop está corriendo
Write-Host "🔍 Verificando Docker Desktop..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker Desktop está corriendo" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Desktop no está corriendo. Iniciando..." -ForegroundColor Red
    Write-Host "Por favor, inicia Docker Desktop manualmente y ejecuta este script nuevamente." -ForegroundColor Yellow
    exit 1
}

# Cambiar al directorio del proyecto
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir
Write-Host "📁 Directorio actual: $scriptDir" -ForegroundColor Blue

# Mostrar menú de opciones
Write-Host ""
Write-Host "Selecciona una opción:" -ForegroundColor Cyan
Write-Host "1. 🚀 Ejecutar stack completo (Producción)" -ForegroundColor White
Write-Host "2. 💻 Ejecutar modo desarrollo" -ForegroundColor White
Write-Host "3. 🔍 Ver estado de contenedores" -ForegroundColor White
Write-Host "4. 📋 Ver logs en tiempo real" -ForegroundColor White
Write-Host "5. 🛑 Parar todos los contenedores" -ForegroundColor White
Write-Host "6. 🧹 Limpiar contenedores y volúmenes" -ForegroundColor White
Write-Host "0. ❌ Salir" -ForegroundColor White

$choice = Read-Host "Ingresa tu opción (0-6)"

switch ($choice) {
    "1" {
        Write-Host "🚀 Iniciando stack completo de producción..." -ForegroundColor Green
        Write-Host "Esto incluye: Web App, API Server, Doctors, Patients, Companies, Admin, Signaling Server + PostgreSQL, Redis, Nginx, Grafana, Prometheus" -ForegroundColor Yellow
        
        # Construir imágenes si no existen
        Write-Host "🔨 Construyendo imágenes Docker..." -ForegroundColor Yellow
        docker compose build
        
        # Ejecutar stack completo
        docker compose up -d
        
        Write-Host "✅ Stack completo iniciado!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 URLs disponibles:" -ForegroundColor Cyan
        Write-Host "   - Web App: http://localhost:3000" -ForegroundColor White
        Write-Host "   - API Server: http://localhost:3001" -ForegroundColor White
        Write-Host "   - Doctors Portal: http://localhost:3002" -ForegroundColor White
        Write-Host "   - Patients Portal: http://localhost:3003" -ForegroundColor White
        Write-Host "   - Companies Portal: http://localhost:3004" -ForegroundColor White
        Write-Host "   - Admin Panel: http://localhost:3005" -ForegroundColor White
        Write-Host "   - Grafana: http://localhost:3006" -ForegroundColor White
        Write-Host "   - Prometheus: http://localhost:9090" -ForegroundColor White
    }
    
    "2" {
        Write-Host "💻 Iniciando modo desarrollo..." -ForegroundColor Green
        Write-Host "Esto incluye: API Server, Web App, Doctors, Patients, Signaling + PostgreSQL, Redis" -ForegroundColor Yellow
        
        # Ejecutar solo servicios esenciales para desarrollo
        docker compose -f docker-compose.dev.yml up -d
        
        Write-Host "✅ Modo desarrollo iniciado!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 URLs de desarrollo:" -ForegroundColor Cyan
        Write-Host "   - Web App: http://localhost:3000" -ForegroundColor White
        Write-Host "   - API Server: http://localhost:3001" -ForegroundColor White
        Write-Host "   - Doctors Portal: http://localhost:3002" -ForegroundColor White
        Write-Host "   - Patients Portal: http://localhost:3003" -ForegroundColor White
        Write-Host "   - Signaling Server: ws://localhost:8888" -ForegroundColor White
    }
    
    "3" {
        Write-Host "🔍 Estado de contenedores AltaMedica:" -ForegroundColor Cyan
        docker ps --filter "name=altamedica" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    }
    
    "4" {
        Write-Host "📋 Logs en tiempo real (Ctrl+C para salir):" -ForegroundColor Cyan
        Write-Host "Selecciona el servicio:" -ForegroundColor Yellow
        Write-Host "1. API Server" -ForegroundColor White
        Write-Host "2. Web App" -ForegroundColor White
        Write-Host "3. Doctors" -ForegroundColor White
        Write-Host "4. Patients" -ForegroundColor White
        Write-Host "5. Todos los servicios" -ForegroundColor White
        
        $logChoice = Read-Host "Opción (1-5)"
        
        switch ($logChoice) {
            "1" { docker logs -f altamedica-api-server }
            "2" { docker logs -f altamedica-web-app }
            "3" { docker logs -f altamedica-doctors }
            "4" { docker logs -f altamedica-patients }
            "5" { docker compose logs -f }
            default { docker compose logs -f }
        }
    }
    
    "5" {
        Write-Host "🛑 Parando todos los contenedores AltaMedica..." -ForegroundColor Yellow
        docker compose down
        docker compose -f docker-compose.dev.yml down
        Write-Host "✅ Todos los contenedores han sido parados" -ForegroundColor Green
    }
    
    "6" {
        Write-Host "🧹 Limpiando contenedores y volúmenes..." -ForegroundColor Yellow
        Write-Host "⚠️  ADVERTENCIA: Esto eliminará todos los datos de PostgreSQL y Redis" -ForegroundColor Red
        $confirm = Read-Host "¿Estás seguro? (y/N)"
        
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            docker compose down -v
            docker compose -f docker-compose.dev.yml down -v
            docker system prune -f
            Write-Host "✅ Limpieza completada" -ForegroundColor Green
        } else {
            Write-Host "❌ Limpieza cancelada" -ForegroundColor Yellow
        }
    }
    
    "0" {
        Write-Host "👋 ¡Hasta luego!" -ForegroundColor Green
        exit 0
    }
    
    default {
        Write-Host "❌ Opción inválida" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🏥 AltaMedica Docker Script completado" -ForegroundColor Cyan
Write-Host "Para ver este menú nuevamente, ejecuta: .\start-altamedica-docker.ps1" -ForegroundColor Blue