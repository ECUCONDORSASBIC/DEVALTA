# Script de prueba para el flujo SSO completo
# Este script prueba la autenticación SSO entre aplicaciones

Write-Host "`n🧪 PRUEBA DE FLUJO SSO COMPLETO" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Función para hacer peticiones HTTP
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = $null
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = @{
                "Content-Type" = "application/json"
            }
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params -SessionVariable session
        return @{
            Success = $true
            Data = $response
            Session = $session
        }
    } catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# 1. Verificar servicios
Write-Host "`n1️⃣ Verificando servicios..." -ForegroundColor Yellow

$services = @(
    @{Name="API Server"; Url="http://localhost:3001/api/health"},
    @{Name="Web App"; Url="http://localhost:3000"},
    @{Name="Patients App"; Url="http://localhost:3003"},
    @{Name="SSO Proxy"; Url="http://localhost:3100/health"}
)

$allServicesOk = $true
foreach ($service in $services) {
    Write-Host -NoNewline "  Verificando $($service.Name)... "
    $result = Test-Endpoint -Url $service.Url
    if ($result.Success) {
        Write-Host "✅ OK" -ForegroundColor Green
    } else {
        Write-Host "❌ FALLO" -ForegroundColor Red
        $allServicesOk = $false
    }
}

if (-not $allServicesOk) {
    Write-Host "`n❌ No todos los servicios están activos. Inicia los servicios primero:" -ForegroundColor Red
    Write-Host "   ./start-with-sso-proxy.ps1" -ForegroundColor Yellow
    exit 1
}

# 2. Limpiar sesiones anteriores
Write-Host "`n2️⃣ Limpiando sesiones anteriores..." -ForegroundColor Yellow
$clearResult = Test-Endpoint -Url "http://localhost:3001/api/v1/auth/test-sso" -Method "DELETE"
if ($clearResult.Success) {
    Write-Host "  ✅ Sesiones limpiadas" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  No se pudieron limpiar sesiones anteriores" -ForegroundColor Yellow
}

# 3. Crear sesión SSO de prueba
Write-Host "`n3️⃣ Creando sesión SSO de prueba..." -ForegroundColor Yellow
$createResult = Test-Endpoint -Url "http://localhost:3001/api/v1/auth/test-sso" -Method "POST"

if ($createResult.Success) {
    Write-Host "  ✅ Sesión SSO creada" -ForegroundColor Green
    Write-Host "  📧 Usuario: test.patient@altamedica.com" -ForegroundColor Cyan
    Write-Host "  👤 Rol: patient" -ForegroundColor Cyan
    
    if ($createResult.Data.data.token) {
        $token = $createResult.Data.data.token
        Write-Host "  🔑 Token: $($token.Substring(0, 20))..." -ForegroundColor Cyan
    }
} else {
    Write-Host "  ❌ Error creando sesión: $($createResult.Error)" -ForegroundColor Red
    exit 1
}

# 4. Verificar estado SSO
Write-Host "`n4️⃣ Verificando estado SSO..." -ForegroundColor Yellow
$verifyResult = Test-Endpoint -Url "http://localhost:3001/api/v1/auth/test-sso"

if ($verifyResult.Success -and $verifyResult.Data.success) {
    Write-Host "  ✅ Token SSO válido" -ForegroundColor Green
    $tokenInfo = $verifyResult.Data.ssoStatus.tokenInfo
    Write-Host "  📧 Email: $($tokenInfo.email)" -ForegroundColor Cyan
    Write-Host "  👤 Rol: $($tokenInfo.role)" -ForegroundColor Cyan
    Write-Host "  ⏰ Expira: $($tokenInfo.expiresAt)" -ForegroundColor Cyan
} else {
    Write-Host "  ❌ Token SSO inválido" -ForegroundColor Red
}

# 5. Probar acceso a aplicaciones
Write-Host "`n5️⃣ Probando acceso a aplicaciones..." -ForegroundColor Yellow

Write-Host "`n  📱 Abriendo aplicaciones en el navegador..." -ForegroundColor Cyan
Write-Host "  ⚠️  IMPORTANTE: Las cookies solo funcionan si usas el proxy SSO" -ForegroundColor Yellow

# Abrir navegador con las URLs
Start-Process "http://localhost:3003/debug-sso"
Start-Sleep -Seconds 2
Start-Process "http://localhost:3003/dashboard"

Write-Host "`n✅ PRUEBA COMPLETADA" -ForegroundColor Green
Write-Host "`nPasos siguientes:" -ForegroundColor Cyan
Write-Host "1. Verifica en la página debug-sso que el token SSO esté presente" -ForegroundColor White
Write-Host "2. Intenta acceder al dashboard - deberías estar autenticado" -ForegroundColor White
Write-Host "3. Si no funciona, usa el proxy SSO:" -ForegroundColor White
Write-Host "   - http://localhost:3100/patients/debug-sso" -ForegroundColor Yellow
Write-Host "   - http://localhost:3100/patients/dashboard" -ForegroundColor Yellow

Write-Host "`n💡 Para login manual:" -ForegroundColor Cyan
Write-Host "   Email: test.patient@altamedica.com" -ForegroundColor White
Write-Host "   Password: (cualquiera, es un usuario de prueba)" -ForegroundColor White

Write-Host "`n🔧 Para debugging adicional:" -ForegroundColor Cyan
Write-Host "   - Revisa las cookies en DevTools (F12)" -ForegroundColor White
Write-Host "   - Busca altamedica_sso_token en las cookies" -ForegroundColor White
Write-Host "   - Revisa la consola del navegador para mensajes de debug" -ForegroundColor White