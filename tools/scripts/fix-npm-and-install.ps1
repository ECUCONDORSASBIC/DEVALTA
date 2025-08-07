# Script para solucionar problemas de npm e instalar dependencias

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🔧 Solucionando problemas de npm" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# 1. Limpiar caché de npm
Write-Host "`n🧹 Limpiando caché de npm..." -ForegroundColor Yellow
try {
    npm cache clean --force
    Write-Host "✅ Caché limpiado" -ForegroundColor Green
} catch {
    Write-Host "⚠️ No se pudo limpiar el caché completamente" -ForegroundColor Yellow
}

# 2. Verificar si existe package.json local que pueda causar conflictos
$localPackageJson = ".\package.json"
$hasLocalPackageJson = Test-Path $localPackageJson

if ($hasLocalPackageJson) {
    Write-Host "`n📦 Instalando en el contexto del proyecto..." -ForegroundColor Yellow
    
    # Instalar las dependencias como devDependencies
    Write-Host "Instalando express..." -ForegroundColor Gray
    npm install --save-dev express
    
    Write-Host "Instalando http-proxy-middleware..." -ForegroundColor Gray
    npm install --save-dev http-proxy-middleware
    
    Write-Host "Instalando cookie-parser..." -ForegroundColor Gray
    npm install --save-dev cookie-parser
} else {
    Write-Host "`n📦 Creando package.json temporal para el proxy..." -ForegroundColor Yellow
    
    # Crear un package.json mínimo
    $packageJson = @{
        name = "altamedica-sso-proxy-temp"
        version = "1.0.0"
        private = $true
        dependencies = @{
            express = "^4.18.2"
            "http-proxy-middleware" = "^2.0.6"
            "cookie-parser" = "^1.4.6"
        }
    }
    
    $packageJson | ConvertTo-Json -Depth 10 | Out-File -FilePath "proxy-temp-package.json" -Encoding UTF8
    
    Write-Host "✅ Package.json temporal creado" -ForegroundColor Green
    
    # Instalar usando el package.json temporal
    Write-Host "`nInstalando dependencias..." -ForegroundColor Yellow
    npm install --prefix . --package-lock-only=false --no-save
}

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "✅ Proceso completado!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora puedes ejecutar:" -ForegroundColor Yellow
Write-Host "  node setup-sso-proxy.js" -ForegroundColor White
Write-Host ""
Write-Host "O continuar sin proxy:" -ForegroundColor Yellow
Write-Host "  npm run dev:all" -ForegroundColor White
Write-Host "  Luego ir a: http://localhost:3000/login" -ForegroundColor White