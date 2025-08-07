# Script para ejecutar diagnóstico SSO con Playwright
Write-Host "`n=== DIAGNOSTICO SSO CON PLAYWRIGHT ===" -ForegroundColor Cyan

# Crear directorio para screenshots si no existe
if (!(Test-Path "tests/screenshots")) {
    New-Item -ItemType Directory -Path "tests/screenshots" -Force | Out-Null
    Write-Host "✅ Directorio de screenshots creado" -ForegroundColor Green
}

# Verificar si Playwright está instalado
Write-Host "`nVerificando Playwright..." -ForegroundColor Yellow
$playwrightCheck = npm list @playwright/test 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Playwright no está instalado" -ForegroundColor Red
    Write-Host "Instalando Playwright..." -ForegroundColor Yellow
    npm install -D @playwright/test
    npx playwright install chromium
}

Write-Host "`n🚀 Ejecutando pruebas de diagnóstico..." -ForegroundColor Cyan
Write-Host "Esto abrirá un navegador automatizado para diagnosticar el problema" -ForegroundColor Gray

# Ejecutar las pruebas
npx playwright test tests/e2e/sso-flow.spec.ts --headed --reporter=list

Write-Host "`n📸 Screenshots guardados en:" -ForegroundColor Yellow
Write-Host "   - tests/screenshots/patients-loading-state.png" -ForegroundColor Gray
Write-Host "   - tests/screenshots/before-login.png" -ForegroundColor Gray
Write-Host "   - tests/screenshots/redirect-loader.png" -ForegroundColor Gray
Write-Host "   - tests/screenshots/final-state.png" -ForegroundColor Gray

Write-Host "`n💡 Revisa los logs arriba para ver el diagnóstico completo" -ForegroundColor Cyan