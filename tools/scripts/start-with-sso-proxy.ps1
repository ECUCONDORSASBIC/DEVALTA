# Script para iniciar el sistema AltaMedica con SSO Proxy
# Este script soluciona el problema de cookies entre diferentes puertos

Write-Host "🚀 Iniciando AltaMedica con SSO Proxy..." -ForegroundColor Cyan

# Verificar si Node.js está instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js no está instalado. Por favor instálalo primero." -ForegroundColor Red
    exit 1
}

# Instalar dependencias del proxy si no existen
if (-not (Test-Path "node_modules\express")) {
    Write-Host "📦 Instalando dependencias del proxy SSO..." -ForegroundColor Yellow
    npm install express http-proxy-middleware cookie-parser cors
}

# Iniciar el proxy SSO en segundo plano
Write-Host "🔐 Iniciando SSO Proxy Server..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "sso-proxy-server.js"

# Esperar a que el proxy esté listo
Start-Sleep -Seconds 2

# Iniciar servicios principales
Write-Host "🏥 Iniciando servicios de AltaMedica..." -ForegroundColor Green

# API Server (3001)
Write-Host "  📡 Iniciando API Server..." -ForegroundColor Yellow
Start-Process -NoNewWindow -WorkingDirectory "apps\api-server" -FilePath "npm" -ArgumentList "run", "dev"

# Signaling Server (8888)
Write-Host "  📞 Iniciando Signaling Server..." -ForegroundColor Yellow
Start-Process -NoNewWindow -WorkingDirectory "apps\signaling-server" -FilePath "npm" -ArgumentList "run", "dev"

# Web App (3000)
Write-Host "  🌐 Iniciando Web App..." -ForegroundColor Yellow
Start-Process -NoNewWindow -WorkingDirectory "apps\web-app" -FilePath "npm" -ArgumentList "run", "dev"

# Patients App (3003)
Write-Host "  👤 Iniciando Patients App..." -ForegroundColor Yellow
Start-Process -NoNewWindow -WorkingDirectory "apps\patients" -FilePath "npm" -ArgumentList "run", "dev"

# Doctors App (3002)
Write-Host "  👨‍⚕️ Iniciando Doctors App..." -ForegroundColor Yellow
Start-Process -NoNewWindow -WorkingDirectory "apps\doctors" -FilePath "npm" -ArgumentList "run", "dev"

Write-Host "`n✅ Sistema iniciado con SSO Proxy" -ForegroundColor Green
Write-Host "`n📌 URLs disponibles con SSO compartido:" -ForegroundColor Cyan
Write-Host "  🔐 SSO Proxy: http://localhost:3100" -ForegroundColor White
Write-Host "  🌐 Web App: http://localhost:3100/web" -ForegroundColor White
Write-Host "  📡 API: http://localhost:3100/api" -ForegroundColor White
Write-Host "  👤 Patients: http://localhost:3100/patients" -ForegroundColor White
Write-Host "  👨‍⚕️ Doctors: http://localhost:3100/doctors" -ForegroundColor White
Write-Host "`n💡 Usa las URLs del proxy para mantener la sesión SSO entre aplicaciones" -ForegroundColor Yellow
Write-Host "⚠️  Las URLs directas (localhost:3000, etc) NO compartirán la sesión SSO" -ForegroundColor Yellow
Write-Host "`nPresiona Ctrl+C para detener todos los servicios" -ForegroundColor Gray

# Mantener el script ejecutándose
while ($true) {
    Start-Sleep -Seconds 60
}