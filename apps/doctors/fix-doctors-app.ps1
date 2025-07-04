#!/usr/bin/env pwsh

Write-Host "🔧 Reparando aplicación doctors en devaltamedica..." -ForegroundColor Cyan
Write-Host "📍 Ruta: C:\Users\Eduardo\Documents\devaltamedica\apps\doctors" -ForegroundColor Yellow

# Verificar que estamos en la ruta correcta
$currentPath = Get-Location
Write-Host "Directorio actual: $currentPath" -ForegroundColor Gray

# Instalar dependencias faltantes de Tailwind
Write-Host "Instalando dependencias Tailwind faltantes..." -ForegroundColor Yellow
pnpm add @tailwindcss/typography @tailwindcss/aspect-ratio @tailwindcss/forms --save-dev

# Instalar critters para optimización CSS
Write-Host "Instalando critters para optimizacion..." -ForegroundColor Yellow
pnpm add critters --save-dev

# Limpiar caché
Write-Host "Limpiando cache..." -ForegroundColor Yellow
pnpm store prune
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host "Cache .next eliminado" -ForegroundColor Green
}
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    Write-Host "node_modules eliminado" -ForegroundColor Green
}

# Reinstalar todas las dependencias
Write-Host "Reinstalando dependencias..." -ForegroundColor Yellow
pnpm install

# Verificar instalación
Write-Host "Verificando instalacion..." -ForegroundColor Yellow
pnpm list tailwindcss
pnpm list @tailwindcss/typography

Write-Host "Reparacion completada" -ForegroundColor Green
Write-Host "Para iniciar el servidor ejecuta: pnpm dev" -ForegroundColor Cyan 