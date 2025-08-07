# Script para limpiar cache y reiniciar web-app
Write-Host "Limpiando cache de web-app..." -ForegroundColor Yellow

$webAppPath = Join-Path (Split-Path -Parent $PSScriptRoot) "apps\web-app"

# Limpiar carpeta .next
$nextPath = Join-Path $webAppPath ".next"
if (Test-Path $nextPath) {
    Remove-Item -Path $nextPath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Carpeta .next eliminada" -ForegroundColor Green
}

# Limpiar cache de node_modules
$cachePath = Join-Path $webAppPath "node_modules\.cache"
if (Test-Path $cachePath) {
    Remove-Item -Path $cachePath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Cache de node_modules eliminado" -ForegroundColor Green
}

# Matar proceso de Next.js si esta corriendo
$processes = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*next*dev*"
}
if ($processes) {
    $processes | Stop-Process -Force
    Write-Host "Procesos de Next.js detenidos" -ForegroundColor Green
}

Write-Host "Reiniciando web-app..." -ForegroundColor Cyan
Set-Location $webAppPath
npm run dev