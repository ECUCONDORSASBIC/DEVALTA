# Script de verificación de redirección SSO
# Este script verifica que el flujo de autenticación SSO funcione correctamente

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🔍 Verificación de Redirección SSO" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Función para verificar si un servicio está corriendo
function Test-Service {
    param(
        [string]$Name,
        [string]$Url
    )
    
    Write-Host "`nVerificando $Name..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $Name está funcionando correctamente" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ $Name no está respondiendo en $Url" -ForegroundColor Red
        return $false
    }
}

# 1. Verificar servicios principales
Write-Host "`n📡 Verificando servicios..." -ForegroundColor Cyan

$services = @(
    @{Name="API Server"; Url="http://localhost:3001/api/health"},
    @{Name="Web App"; Url="http://localhost:3000"},
    @{Name="Patients App"; Url="http://localhost:3003"},
    @{Name="SSO Proxy"; Url="http://localhost:9000/proxy-info"}
)

$allServicesRunning = $true
foreach ($service in $services) {
    $isRunning = Test-Service -Name $service.Name -Url $service.Url
    if (-not $isRunning) {
        $allServicesRunning = $false
    }
}

if (-not $allServicesRunning) {
    Write-Host "`n⚠️ Algunos servicios no están corriendo." -ForegroundColor Yellow
    Write-Host "Por favor, ejecuta primero: .\start-with-sso.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ Todos los servicios están funcionando" -ForegroundColor Green

# 2. Mostrar URLs de prueba
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "🧪 PRUEBAS DE REDIRECCIÓN SSO" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Write-Host "`n📋 INSTRUCCIONES DE PRUEBA:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣ PRUEBA CON PROXY SSO (Recomendado):" -ForegroundColor Cyan
Write-Host "   a) Abre tu navegador en modo incógnito" -ForegroundColor White
Write-Host "   b) Ve a: " -NoNewline; Write-Host "http://localhost:9000/auth/login" -ForegroundColor Green
Write-Host "   c) Inicia sesión con:" -ForegroundColor White
Write-Host "      Email: " -NoNewline; Write-Host "paciente.test@altamedica.com" -ForegroundColor Yellow
Write-Host "      Password: " -NoNewline; Write-Host "Test123!" -ForegroundColor Yellow
Write-Host "   d) Deberías ser redirigido a: " -NoNewline; Write-Host "http://localhost:9000/patients" -ForegroundColor Green
Write-Host "   e) El dashboard debe cargar correctamente ✅" -ForegroundColor White

Write-Host "`n2️⃣ PRUEBA DIRECTA (Sin Proxy):" -ForegroundColor Cyan
Write-Host "   a) Abre una nueva ventana de incógnito" -ForegroundColor White
Write-Host "   b) Ve a: " -NoNewline; Write-Host "http://localhost:3000/login" -ForegroundColor Green
Write-Host "   c) Usa las mismas credenciales" -ForegroundColor White
Write-Host "   d) Serás redirigido a: " -NoNewline; Write-Host "http://localhost:3003" -ForegroundColor Green
Write-Host "   e) Verifica que el dashboard cargue" -ForegroundColor White

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "🔍 QUÉ VERIFICAR:" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Write-Host "`n✅ ÉXITO si:" -ForegroundColor Green
Write-Host "   - El dashboard de pacientes carga completamente" -ForegroundColor White
Write-Host "   - Ves el nombre del usuario: 'Juan Pérez'" -ForegroundColor White
Write-Host "   - Aparecen las citas médicas de ejemplo" -ForegroundColor White
Write-Host "   - No hay mensaje de 'Cargando dashboard' eterno" -ForegroundColor White

Write-Host "`n❌ FALLO si:" -ForegroundColor Red
Write-Host "   - Ves 'Cargando dashboard' indefinidamente" -ForegroundColor White
Write-Host "   - Eres redirigido de vuelta al login" -ForegroundColor White
Write-Host "   - Aparecen errores en la consola del navegador" -ForegroundColor White

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "🛠️ DEBUGGING:" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

Write-Host "`nPara ver logs detallados:" -ForegroundColor Yellow
Write-Host "1. Abre DevTools (F12) en el navegador" -ForegroundColor White
Write-Host "2. Ve a la pestaña 'Console'" -ForegroundColor White
Write-Host "3. Busca mensajes que empiecen con:" -ForegroundColor White
Write-Host "   - [AuthContext]" -ForegroundColor Gray
Write-Host "   - [AuthProvider]" -ForegroundColor Gray
Write-Host "   - [Middleware]" -ForegroundColor Gray

Write-Host "`n🍪 Para verificar cookies SSO:" -ForegroundColor Yellow
Write-Host "1. En DevTools → Application → Cookies" -ForegroundColor White
Write-Host "2. Busca:" -ForegroundColor White
Write-Host "   - altamedica_sso_token" -ForegroundColor Gray
Write-Host "   - altamedica_refresh_token" -ForegroundColor Gray

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "🚀 ¡Listo para probar!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

Write-Host "`nPresiona cualquier tecla para abrir el navegador..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Abrir el navegador con la URL del proxy
Start-Process "http://localhost:9000/proxy-info"