# Script para arreglar las dependencias del SSO
Write-Host "🔧 Arreglando dependencias del SSO..." -ForegroundColor Cyan

# Cambiar al directorio del proyecto
Set-Location "C:\Users\Eduardo\Documents\devaltamedica"

# Instalar dependencias en el paquete shared
Write-Host "`n📦 Instalando dependencias en @altamedica/shared..." -ForegroundColor Yellow
Set-Location "packages\shared"
npm install

# Volver al root
Set-Location "..\.."

# Instalar todas las dependencias del workspace
Write-Host "`n📦 Instalando dependencias del workspace..." -ForegroundColor Yellow
npm install

# Construir los paquetes
Write-Host "`n🏗️ Construyendo paquetes..." -ForegroundColor Yellow
npm run build:packages

Write-Host "`n✅ Dependencias del SSO instaladas correctamente!" -ForegroundColor Green
Write-Host "`nAhora puedes reiniciar las aplicaciones para que tomen los cambios." -ForegroundColor Cyan