# Verify Domain Configuration and Test SSO
Write-Host "=== Verificando Configuración de Dominios Locales ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check hosts file
Write-Host "[1] Verificando archivo hosts..." -ForegroundColor Yellow
$hostsFile = "$env:SystemRoot\System32\drivers\etc\hosts"
$hostsContent = Get-Content $hostsFile -Raw

$requiredDomains = @(
    "altamedica.local",
    "api.altamedica.local", 
    "patients.altamedica.local"
)

$missingDomains = @()
foreach ($domain in $requiredDomains) {
    if ($hostsContent -match $domain) {
        Write-Host "✓ $domain está configurado" -ForegroundColor Green
    } else {
        Write-Host "✗ $domain NO está configurado" -ForegroundColor Red
        $missingDomains += $domain
    }
}

if ($missingDomains.Count -gt 0) {
    Write-Host "`n⚠️  Dominios faltantes detectados!" -ForegroundColor Yellow
    Write-Host "Agrega estas líneas a $hostsFile`:" -ForegroundColor White
    foreach ($domain in $missingDomains) {
        Write-Host "127.0.0.1 $domain" -ForegroundColor Gray
    }
    Write-Host "`nO ejecuta como Administrador:" -ForegroundColor Yellow
    Write-Host ".\scripts\setup-local-domains.ps1" -ForegroundColor White
}

# Step 2: Test domain resolution
Write-Host "`n[2] Probando resolución DNS..." -ForegroundColor Yellow
foreach ($domain in $requiredDomains) {
    try {
        $result = Resolve-DnsName $domain -ErrorAction Stop
        Write-Host "✓ $domain resuelve a $($result.IPAddress)" -ForegroundColor Green
    } catch {
        Write-Host "✗ $domain no resuelve" -ForegroundColor Red
    }
}

# Step 3: Check if services are running
Write-Host "`n[3] Verificando servicios..." -ForegroundColor Yellow
$services = @(
    @{Name="Web App"; URL="http://altamedica.local:3000"; Port=3000},
    @{Name="API Server"; URL="http://api.altamedica.local:3001/api/health"; Port=3001},
    @{Name="Patients App"; URL="http://patients.altamedica.local:3003"; Port=3003}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✓ $($service.Name) está activo en puerto $($service.Port)" -ForegroundColor Green
    } catch {
        Write-Host "✗ $($service.Name) NO responde en puerto $($service.Port)" -ForegroundColor Red
    }
}

# Step 4: Test cookie configuration
Write-Host "`n[4] Probando configuración de cookies SSO..." -ForegroundColor Yellow
Write-Host "Accede a estos URLs en tu navegador:" -ForegroundColor Cyan
Write-Host "1. Login: http://altamedica.local:3000/login" -ForegroundColor White
Write-Host "2. Debug: http://patients.altamedica.local:3003/debug-sso" -ForegroundColor White

Write-Host "`n[5] Instrucciones para probar SSO:" -ForegroundColor Yellow
Write-Host "1. Abre una ventana de incógnito/privada" -ForegroundColor White
Write-Host "2. Ve a http://altamedica.local:3000/login" -ForegroundColor White
Write-Host "3. Inicia sesión con credenciales de prueba" -ForegroundColor White
Write-Host "4. Verifica si eres redirigido correctamente" -ForegroundColor White
Write-Host "5. Revisa las cookies en DevTools (F12 > Application > Cookies)" -ForegroundColor White

Write-Host "`n=== Verificación Completa ===" -ForegroundColor Cyan