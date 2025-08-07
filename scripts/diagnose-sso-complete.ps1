# Complete SSO Diagnosis Script
Write-Host "=== Diagnóstico Completo de SSO con Dominios Locales ===" -ForegroundColor Cyan
Write-Host ""

# Test configuration
$domains = @{
    WebApp = "http://altamedica.local:3000"
    API = "http://api.altamedica.local:3001"
    Patients = "http://patients.altamedica.local:3003"
}

# Step 1: Verify domains are configured
Write-Host "[1] Verificando configuración de dominios..." -ForegroundColor Yellow
$allDomainsOk = $true

foreach ($key in $domains.Keys) {
    $domain = $domains[$key] -replace "http://", "" -replace ":.*", ""
    try {
        $result = Resolve-DnsName $domain -ErrorAction Stop
        Write-Host "✓ $domain resuelve correctamente" -ForegroundColor Green
    } catch {
        Write-Host "✗ $domain NO está configurado" -ForegroundColor Red
        $allDomainsOk = $false
    }
}

if (-not $allDomainsOk) {
    Write-Host "`n⚠️  Primero configura los dominios ejecutando como Admin:" -ForegroundColor Yellow
    Write-Host ".\scripts\setup-local-domains.ps1" -ForegroundColor White
    exit 1
}

# Step 2: Test API health
Write-Host "`n[2] Verificando servicios..." -ForegroundColor Yellow

foreach ($key in $domains.Keys) {
    $url = $domains[$key]
    $testUrl = if ($key -eq "API") { "$url/api/health" } else { $url }
    
    try {
        $response = Invoke-WebRequest -Uri $testUrl -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        Write-Host "✓ $key está activo en $url" -ForegroundColor Green
    } catch {
        Write-Host "✗ $key NO responde en $url" -ForegroundColor Red
    }
}

# Step 3: Test login flow with cookies
Write-Host "`n[3] Probando flujo de login con test endpoint..." -ForegroundColor Yellow

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# Test the test-login endpoint
$loginBody = @{
    email = "test@altamedica.com"
    role = "patient"
} | ConvertTo-Json

try {
    Write-Host "  Llamando a test-login endpoint..." -ForegroundColor Cyan
    $loginResponse = Invoke-WebRequest `
        -Uri "$($domains.API)/api/v1/auth/test-login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -WebSession $session `
        -UseBasicParsing
    
    Write-Host "  ✓ Login exitoso" -ForegroundColor Green
    
    # Check cookies
    Write-Host "`n  Cookies establecidas:" -ForegroundColor Cyan
    $apiCookies = $session.Cookies.GetCookies($domains.API)
    foreach ($cookie in $apiCookies) {
        Write-Host "    - $($cookie.Name)" -ForegroundColor Gray
        Write-Host "      Domain: $($cookie.Domain)" -ForegroundColor Gray
        Write-Host "      Value: $($cookie.Value.Substring(0, [Math]::Min(30, $cookie.Value.Length)))..." -ForegroundColor Gray
    }
    
    # Step 4: Test cross-domain cookie access
    Write-Host "`n[4] Probando acceso cross-domain a patients app..." -ForegroundColor Yellow
    
    # Check if cookies are available for patients domain
    $patientsCookies = $session.Cookies.GetCookies($domains.Patients)
    Write-Host "  Cookies disponibles para patients.altamedica.local:" -ForegroundColor Cyan
    
    if ($patientsCookies.Count -eq 0) {
        Write-Host "  ✗ NO hay cookies disponibles para el dominio patients" -ForegroundColor Red
        Write-Host "  Esto indica que las cookies no se están compartiendo entre subdominios" -ForegroundColor Yellow
    } else {
        foreach ($cookie in $patientsCookies) {
            Write-Host "    ✓ $($cookie.Name)" -ForegroundColor Green
        }
    }
    
    # Try to access patients app
    try {
        $patientsResponse = Invoke-WebRequest `
            -Uri "$($domains.Patients)/api/debug-headers" `
            -WebSession $session `
            -UseBasicParsing
        
        Write-Host "  ✓ Acceso exitoso a patients app" -ForegroundColor Green
        
        $debugData = $patientsResponse.Content | ConvertFrom-Json
        if ($debugData.cookies) {
            Write-Host "  Cookies visibles en patients app:" -ForegroundColor Cyan
            $debugData.cookies | Get-Member -MemberType NoteProperty | ForEach-Object {
                Write-Host "    - $($_.Name)" -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "  ✗ No se pudo acceder a patients app" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
    }
    
} catch {
    Write-Host "  ✗ Error en login: $_" -ForegroundColor Red
}

# Step 5: Browser test instructions
Write-Host "`n[5] Prueba manual en navegador:" -ForegroundColor Yellow
Write-Host "1. Abre una ventana de incógnito" -ForegroundColor White
Write-Host "2. Ve a: $($domains.WebApp)/login" -ForegroundColor White
Write-Host "3. Abre DevTools (F12) > Application > Cookies" -ForegroundColor White
Write-Host "4. Inicia sesión y observa:" -ForegroundColor White
Write-Host "   - ¿Se crean cookies con Domain=.altamedica.local?" -ForegroundColor Gray
Write-Host "   - ¿Puedes acceder a $($domains.Patients) sin nuevo login?" -ForegroundColor Gray

# Step 6: Check package build status
Write-Host "`n[6] Verificando estado de paquetes..." -ForegroundColor Yellow
$sharedPackage = "packages\shared\dist"
if (Test-Path $sharedPackage) {
    Write-Host "✓ Paquete shared está compilado" -ForegroundColor Green
} else {
    Write-Host "✗ Paquete shared NO está compilado" -ForegroundColor Red
    Write-Host "  Ejecuta: npm run build:packages" -ForegroundColor Yellow
}

# Summary
Write-Host "`n=== Resumen de Diagnóstico ===" -ForegroundColor Cyan
Write-Host "Si las cookies no se comparten entre dominios:" -ForegroundColor Yellow
Write-Host "1. Verifica que el Domain de las cookies sea '.altamedica.local'" -ForegroundColor White
Write-Host "2. Asegúrate de usar http://altamedica.local:3000 (NO localhost)" -ForegroundColor White
Write-Host "3. Reconstruye los paquetes: npm run build:packages" -ForegroundColor White
Write-Host "4. Reinicia todos los servicios" -ForegroundColor White