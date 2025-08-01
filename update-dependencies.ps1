# AltaMedica - Script de Actualización de Dependencias
# Ejecutar desde la raíz del proyecto en PowerShell como Administrador

Write-Host "🏥 AltaMedica - Actualizando Dependencias Críticas" -ForegroundColor Green

# Verificar Node.js y herramientas
Write-Host "`n📊 Verificando versiones actuales..." -ForegroundColor Yellow
node --version
npm --version
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm --version
} else {
    Write-Host "⚠️ pnpm no está instalado. Instalando..." -ForegroundColor Yellow
    npm install -g pnpm@latest
}

# Verificar PowerShell
Write-Host "`n🔧 PowerShell Version:" -ForegroundColor Cyan
$PSVersionTable.PSVersion

# Backup de package.json files
Write-Host "`n💾 Creando backup de package.json files..." -ForegroundColor Blue
Copy-Item "package.json" "package.json.backup"
Get-ChildItem -Path "apps" -Recurse -Name "package.json" | ForEach-Object {
    $path = "apps/$_"
    Copy-Item $path "$path.backup"
}

# Actualizar dependencias críticas del root
Write-Host "`n🚀 Actualizando dependencias root..." -ForegroundColor Green
npm update @types/node @typescript-eslint/eslint-plugin @typescript-eslint/parser typescript

# Actualizar Next.js en todas las apps
Write-Host "`n⚡ Actualizando Next.js en todas las apps..." -ForegroundColor Green
$apps = @("api-server", "web-app", "doctors", "patients", "companies", "admin")
foreach ($app in $apps) {
    Write-Host "  📱 Actualizando $app..." -ForegroundColor Cyan
    if (Test-Path "apps/$app") {
        Set-Location "apps/$app"
        npm update next react react-dom @types/react @types/react-dom
        Set-Location "../.."
    }
}

# Actualizar herramientas de testing
Write-Host "`n🧪 Actualizando herramientas de testing..." -ForegroundColor Green
npm update cypress jest vitest @testing-library/react @testing-library/jest-dom

# Actualizar Firebase
Write-Host "`n🔥 Actualizando Firebase..." -ForegroundColor Green
Set-Location "apps/api-server"
npm update firebase-admin
Set-Location "../.."

# Verificar actualizaciones disponibles
Write-Host "`n🔍 Verificando actualizaciones pendientes..." -ForegroundColor Yellow
npm outdated

Write-Host "`n✅ Actualización completada. Revisa los logs arriba para ver cambios." -ForegroundColor Green
Write-Host "🔧 Ejecuta 'npm run type-check' para verificar compatibilidad TypeScript" -ForegroundColor Yellow
Write-Host "🧪 Ejecuta 'npm run test:all' para verificar que todo funcione" -ForegroundColor Yellow