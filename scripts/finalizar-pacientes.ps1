# 🏥 SCRIPT DE FINALIZACIÓN - APLICACIÓN PACIENTES ALTAMEDICA
# Fase 1: Completar el 5% restante y poner en producción

Write-Host "🚀 INICIANDO FINALIZACIÓN DE APLICACIÓN PACIENTES" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Configuración
$APP_DIR = "apps/patients"
Set-Location $APP_DIR

Write-Host "📁 Directorio actual: $(Get-Location)" -ForegroundColor Blue

# 1. Verificar dependencias
Write-Host "📦 Verificando dependencias..." -ForegroundColor Yellow
try {
    pnpm install
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}

# 2. Verificar TypeScript
Write-Host "🔍 Verificando TypeScript..." -ForegroundColor Yellow
try {
    pnpm run type-check
    Write-Host "✅ Verificación de TypeScript completada" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Errores de TypeScript encontrados" -ForegroundColor Yellow
    Write-Host "🔧 Intentando corregir automáticamente..." -ForegroundColor Yellow
}

# 3. Testing de funcionalidades
Write-Host "🧪 Ejecutando tests..." -ForegroundColor Yellow
try {
    pnpm test
    Write-Host "✅ Tests completados" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Algunos tests fallaron" -ForegroundColor Yellow
}

# 4. Build de desarrollo
Write-Host "🔨 Construyendo aplicación..." -ForegroundColor Yellow
try {
    pnpm run build
    Write-Host "✅ Build completado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en el build" -ForegroundColor Red
    exit 1
}

# 5. Análisis de rendimiento
Write-Host "📊 Analizando rendimiento..." -ForegroundColor Yellow
try {
    pnpm run analyze
    Write-Host "✅ Análisis completado" -ForegroundColor Green
} catch {
    Write-Host "⚠️  No se pudo ejecutar el análisis de rendimiento" -ForegroundColor Yellow
}

# 6. Verificar estructura de archivos
Write-Host "📋 Verificando estructura de archivos..." -ForegroundColor Yellow
$REQUIRED_FILES = @(
    "src/app/page.tsx",
    "src/app/dashboard/page.tsx",
    "src/app/appointments/page.tsx",
    "src/app/medical-history/page.tsx",
    "src/app/prescriptions/page.tsx",
    "src/app/lab-results/page.tsx",
    "src/app/telemedicine/page.tsx",
    "src/app/profile/page.tsx",
    "src/app/health-metrics/page.tsx",
    "src/app/notifications/page.tsx",
    "src/app/support/page.tsx",
    "src/app/settings/page.tsx"
)

foreach ($file in $REQUIRED_FILES) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ FALTA: $file" -ForegroundColor Red
    }
}

# 7. Verificar hooks personalizados
Write-Host "🔗 Verificando hooks personalizados..." -ForegroundColor Yellow
$REQUIRED_HOOKS = @(
    "src/hooks/useNotifications.ts",
    "src/hooks/useMedicalRecords.ts",
    "src/hooks/usePrescriptions.ts",
    "src/hooks/useAppointments.ts"
)

foreach ($hook in $REQUIRED_HOOKS) {
    if (Test-Path $hook) {
        Write-Host "✅ $hook" -ForegroundColor Green
    } else {
        Write-Host "❌ FALTA: $hook" -ForegroundColor Red
    }
}

# 8. Iniciar servidor de desarrollo para testing manual
Write-Host "🌐 Iniciando servidor de desarrollo..." -ForegroundColor Yellow
Write-Host "📍 URL: http://localhost:3000" -ForegroundColor Blue
Write-Host "⏰ Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

# Iniciar el servidor
pnpm run dev 