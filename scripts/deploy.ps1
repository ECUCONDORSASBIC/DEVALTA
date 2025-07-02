# 🚀 SCRIPT MAESTRO DE DEPLOYMENT - ALTAMEDICA

param(
    [string]$Environment = "development",
    [switch]$SkipTests = $false,
    [switch]$StartMonitoring = $false
)

Write-Host "🏥 INICIANDO DEPLOYMENT ALTAMEDICA" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "=" * 60

# 1. 🔍 Pre-deployment checks
Write-Host "`n🔍 1. VERIFICACIONES PRE-DEPLOYMENT..." -ForegroundColor Yellow

# Verificar dependencias
$nodeVersion = node --version 2>$null
$pnpmVersion = pnpm --version 2>$null

if (-not $nodeVersion) {
    Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
    exit 1
}

if (-not $pnpmVersion) {
    Write-Host "❌ pnpm no está instalado" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
Write-Host "✅ pnpm: v$pnpmVersion" -ForegroundColor Green

# 2. 🧪 Testing (si no se omite)
if (-not $SkipTests) {
    Write-Host "`n🧪 2. EJECUTANDO TESTS..." -ForegroundColor Yellow
    
    # Compilar packages
    Write-Host "📦 Compilando packages..."
    pnpm --filter "@altamedica/*" build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Falló la compilación de packages" -ForegroundColor Red
        exit 1
    }
    
    # Ejecutar tests
    Write-Host "🧪 Ejecutando suite de tests..."
    pnpm --filter ./apps/api-server test
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Tests fallaron - DEPLOYMENT ABORTADO" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Todos los tests pasaron" -ForegroundColor Green
} else {
    Write-Host "`n⏭️  2. TESTS OMITIDOS (--SkipTests)" -ForegroundColor Yellow
}

# 3. 🔨 Build para producción
Write-Host "`n🔨 3. BUILD PARA PRODUCCIÓN..." -ForegroundColor Yellow

# Limpiar builds anteriores
Write-Host "🧹 Limpiando builds anteriores..."
Remove-Item -Recurse -Force apps/*/.next/ -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps/*/dist/ -ErrorAction SilentlyContinue

# Build API Server
Write-Host "🔨 Building API Server..."
pnpm --filter ./apps/api-server build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falló el build del API Server" -ForegroundColor Red
    exit 1
}

# Build Frontend apps (si existen)
$frontendApps = @('companies', 'doctors', 'patients')
foreach ($app in $frontendApps) {
    if (Test-Path "apps/$app") {
        Write-Host "🔨 Building $app..."
        pnpm --filter "./apps/$app" build
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️ Warning: Falló el build de $app" -ForegroundColor Yellow
        }
    }
}

Write-Host "✅ Build completado" -ForegroundColor Green

# 4. 🐳 Docker build (si es producción)
if ($Environment -eq "production") {
    Write-Host "`n🐳 4. DOCKER BUILD..." -ForegroundColor Yellow
    
    # Build Docker image
    $imageTag = "altamedica/api-server:$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Write-Host "🐳 Building Docker image: $imageTag"
    
    docker build -t $imageTag .
    docker tag $imageTag altamedica/api-server:latest
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Falló el Docker build" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Docker image creada: $imageTag" -ForegroundColor Green
}

# 5. 🚀 Start services
Write-Host "`n🚀 5. INICIANDO SERVICIOS..." -ForegroundColor Yellow

# Detener servicios existentes
Write-Host "🛑 Deteniendo servicios existentes..."
Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*altamedicadev*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Esperar un momento
Start-Sleep 3

# Iniciar API Server
Write-Host "🚀 Iniciando API Server..."
if ($Environment -eq "production") {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; pnpm --filter ./apps/api-server start" -WindowStyle Minimized
} else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; pnpm --filter ./apps/api-server dev" -WindowStyle Minimized
}

# Esperar a que el servidor se inicie
Write-Host "⏳ Esperando a que el API Server se inicie..."
$attempts = 0
$maxAttempts = 30

do {
    Start-Sleep 2
    $attempts++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/health" -TimeoutSec 3 -UseBasicParsing 2>$null
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ API Server iniciado correctamente" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "⏳ Intento $attempts/$maxAttempts..." -ForegroundColor Yellow
    }
} while ($attempts -lt $maxAttempts)

if ($attempts -eq $maxAttempts) {
    Write-Host "❌ No se pudo iniciar el API Server" -ForegroundColor Red
    exit 1
}

# 6. 📊 Iniciar monitoring (si se solicita)
if ($StartMonitoring) {
    Write-Host "`n📊 6. INICIANDO MONITORING..." -ForegroundColor Yellow
    
    if (Test-Path "docker-compose.monitoring.yml") {
        Write-Host "🔍 Iniciando stack de monitoring..."
        docker-compose -f docker-compose.monitoring.yml up -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Monitoring iniciado:" -ForegroundColor Green
            Write-Host "  📊 Grafana: http://localhost:3000" -ForegroundColor Cyan
            Write-Host "  🔍 Prometheus: http://localhost:9090" -ForegroundColor Cyan
            Write-Host "  🚨 AlertManager: http://localhost:9093" -ForegroundColor Cyan
        } else {
            Write-Host "⚠️ Warning: No se pudo iniciar el monitoring" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️ Warning: docker-compose.monitoring.yml no encontrado" -ForegroundColor Yellow
    }
}

# 7. ✅ Validación final
Write-Host "`n✅ 7. VALIDACIÓN FINAL..." -ForegroundColor Yellow

# Health check
Write-Host "🏥 Verificando health check..."
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/health" -TimeoutSec 10
    if ($healthResponse.success) {
        Write-Host "✅ Health check: OK" -ForegroundColor Green
        Write-Host "  📊 Status: $($healthResponse.data.status)" -ForegroundColor Cyan
        Write-Host "  💾 Database: $($healthResponse.data.checks.database)" -ForegroundColor Cyan
        Write-Host "  🔒 Auth: $($healthResponse.data.checks.auth)" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ Health check: Degraded" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Health check falló: $($_.Exception.Message)" -ForegroundColor Red
}

# Metrics check
Write-Host "📊 Verificando endpoint de métricas..."
try {
    $metricsResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/metrics" -TimeoutSec 5 -UseBasicParsing
    if ($metricsResponse.StatusCode -eq 200) {
        Write-Host "✅ Métricas: OK" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Métricas no disponibles" -ForegroundColor Yellow
}

# 8. 📋 Resumen final
Write-Host "`n" + "=" * 60
Write-Host "🎉 DEPLOYMENT COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "=" * 60

Write-Host "`n📋 SERVICIOS ACTIVOS:" -ForegroundColor Yellow
Write-Host "  🏥 API Server: http://localhost:3001" -ForegroundColor White
Write-Host "  🏥 Health: http://localhost:3001/api/v1/health" -ForegroundColor White
Write-Host "  📊 Metrics: http://localhost:3001/api/v1/metrics" -ForegroundColor White

if ($StartMonitoring) {
    Write-Host "`n📊 MONITORING:" -ForegroundColor Yellow
    Write-Host "  📈 Grafana: http://localhost:3000 (admin/altamedica2025)" -ForegroundColor White
    Write-Host "  🔍 Prometheus: http://localhost:9090" -ForegroundColor White
    Write-Host "  🚨 AlertManager: http://localhost:9093" -ForegroundColor White
}

Write-Host "`n🛠️ COMANDOS ÚTILES:" -ForegroundColor Yellow
Write-Host "  Logs API: docker logs altamedica-api-server" -ForegroundColor White
Write-Host "  Stop All: Get-Process node | Stop-Process" -ForegroundColor White
Write-Host "  Restart: .\scripts\deploy.ps1 -Environment $Environment" -ForegroundColor White

Write-Host "`n📞 SOPORTE:" -ForegroundColor Yellow
Write-Host "  Docs: .\docs\SECURITY_DOCUMENTATION.md" -ForegroundColor White
Write-Host "  Issues: https://github.com/altamedica/issues" -ForegroundColor White

Write-Host "`n✅ DEPLOYMENT FINALIZADO - Sistema listo para uso" -ForegroundColor Green

# Mantener la ventana abierta si se ejecuta directamente
if ($Host.Name -eq "ConsoleHost") {
    Write-Host "`nPresiona cualquier tecla para salir..." -ForegroundColor Gray
    $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
}
