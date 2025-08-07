# Script simple para verificar el estado de la página de login
Write-Host "🔍 Verificando página de login de AltaMedica" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# 1. Verificar que los servicios estén activos
Write-Host "`n📡 Verificando servicios..." -ForegroundColor Yellow

$services = @(
    @{Name="Web App (Login)"; Url="http://localhost:3000"; CheckPath="/login"},
    @{Name="API Server"; Url="http://localhost:3001"; CheckPath="/api/health"},
    @{Name="Patients App"; Url="http://localhost:3003"; CheckPath="/"}
)

foreach ($service in $services) {
    try {
        $checkUrl = $service.Url + $service.CheckPath
        $response = Invoke-WebRequest -Uri $checkUrl -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        Write-Host "✅ $($service.Name): ACTIVO (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($service.Name): NO RESPONDE" -ForegroundColor Red
        if ($service.Name -eq "Patients App") {
            Write-Host "   ⚠️ La app de pacientes debe estar activa para que funcione la redirección" -ForegroundColor Yellow
            Write-Host "   Ejecuta: cd apps\patients && npm run dev" -ForegroundColor White
        }
    }
}

# 2. Obtener información de la página de login
Write-Host "`n📄 Obteniendo página de login..." -ForegroundColor Yellow

try {
    $loginUrl = "http://localhost:3000/login"
    $response = Invoke-WebRequest -Uri $loginUrl -UseBasicParsing -TimeoutSec 10
    
    Write-Host "✅ Página de login cargada correctamente" -ForegroundColor Green
    
    # Guardar el HTML
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $htmlFile = ".\login_page_$timestamp.html"
    $response.Content | Out-File -FilePath $htmlFile -Encoding UTF8
    Write-Host "📁 HTML guardado en: $htmlFile" -ForegroundColor Cyan
    
    # Analizar el contenido
    Write-Host "`n📊 Análisis del contenido:" -ForegroundColor Yellow
    
    # Buscar elementos clave
    $content = $response.Content
    
    if ($content -match "Iniciar Sesión" -or $content -match "Login") {
        Write-Host "✅ Título de login encontrado" -ForegroundColor Green
    }
    
    if ($content -match 'type=["\']email["\']' -or $content -match 'name=["\']email["\']') {
        Write-Host "✅ Campo de email encontrado" -ForegroundColor Green
    }
    
    if ($content -match 'type=["\']password["\']' -or $content -match 'name=["\']password["\']') {
        Write-Host "✅ Campo de contraseña encontrado" -ForegroundColor Green
    }
    
    if ($content -match "Procesando") {
        Write-Host "⚠️ Texto 'Procesando' encontrado - posible estado de carga permanente" -ForegroundColor Yellow
    }
    
    # Buscar scripts de Firebase
    if ($content -match "firebase") {
        Write-Host "✅ Referencias a Firebase encontradas" -ForegroundColor Green
    }
    
    # Extraer cualquier mensaje de error visible
    if ($content -match 'error|Error|ERROR') {
        Write-Host "⚠️ Posibles mensajes de error en la página" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Error al obtener la página de login: $_" -ForegroundColor Red
}

# 3. Usar Edge/Chrome para capturar información de consola
Write-Host "`n🌐 Intentando abrir en navegador para capturar logs..." -ForegroundColor Yellow

$browserScript = @'
// Script para ejecutar en la consola del navegador
console.log('=== INFORMACIÓN DE DEPURACIÓN ===');
console.log('URL actual:', window.location.href);
console.log('Estado del documento:', document.readyState);

// Buscar formulario de login
const form = document.querySelector('form');
if (form) {
    console.log('✓ Formulario encontrado');
    const emailInput = form.querySelector('input[type="email"], input[name="email"]');
    const passwordInput = form.querySelector('input[type="password"], input[name="password"]');
    const submitButton = form.querySelector('button[type="submit"], button');
    
    console.log('Email input:', emailInput ? 'Encontrado' : 'No encontrado');
    console.log('Password input:', passwordInput ? 'Encontrado' : 'No encontrado');
    console.log('Submit button:', submitButton ? submitButton.textContent : 'No encontrado');
    
    if (submitButton && submitButton.disabled) {
        console.log('⚠️ El botón está deshabilitado');
    }
} else {
    console.log('✗ No se encontró formulario');
}

// Buscar mensajes de error
const errors = document.querySelectorAll('.error, .alert, [role="alert"]');
if (errors.length > 0) {
    console.log('Errores encontrados:');
    errors.forEach(err => console.log('-', err.textContent));
}

// Estado de Firebase
if (typeof firebase !== 'undefined') {
    console.log('✓ Firebase está cargado');
    if (firebase.auth) {
        firebase.auth().onAuthStateChanged(user => {
            console.log('Usuario actual:', user ? user.email : 'No autenticado');
        });
    }
} else {
    console.log('✗ Firebase no está definido');
}

console.log('=== FIN DE DEPURACIÓN ===');
'@

# Guardar el script para que el usuario lo ejecute
$scriptFile = ".\debug-login-console.js"
$browserScript | Out-File -FilePath $scriptFile -Encoding UTF8
Write-Host "📝 Script de depuración guardado en: $scriptFile" -ForegroundColor Cyan

# Abrir el navegador
try {
    Start-Process "http://localhost:3000/login"
    Write-Host "✅ Navegador abierto. Por favor:" -ForegroundColor Green
    Write-Host "1. Abre las DevTools (F12)" -ForegroundColor White
    Write-Host "2. Ve a la pestaña 'Console'" -ForegroundColor White
    Write-Host "3. Copia y pega el contenido de $scriptFile" -ForegroundColor White
    Write-Host "4. Presiona Enter para ejecutar" -ForegroundColor White
} catch {
    Write-Host "⚠️ No se pudo abrir el navegador automáticamente" -ForegroundColor Yellow
}

# 4. Instrucciones finales
Write-Host "`n📋 Pasos para solucionar el problema:" -ForegroundColor Yellow
Write-Host "1. Asegúrate de que la Patients App esté ejecutándose:" -ForegroundColor White
Write-Host "   cd apps\patients && npm run dev" -ForegroundColor Cyan
Write-Host "`n2. Limpia las cookies y caché del navegador:" -ForegroundColor White
Write-Host "   - Ctrl+Shift+Delete en el navegador" -ForegroundColor Gray
Write-Host "   - Selecciona 'Cookies' y 'Caché'" -ForegroundColor Gray
Write-Host "`n3. Intenta en una ventana de incógnito/privada" -ForegroundColor White
Write-Host "`n4. Verifica los logs en la consola del navegador (F12)" -ForegroundColor White

Write-Host "`n✅ Verificación completada" -ForegroundColor Green