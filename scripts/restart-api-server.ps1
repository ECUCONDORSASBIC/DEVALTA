# Script para reiniciar API server
Write-Host "Reiniciando API Server..." -ForegroundColor Cyan

$apiPath = Join-Path (Split-Path -Parent $PSScriptRoot) "apps\api-server"

# Matar proceso del API server si esta corriendo
$processes = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*3001*" -or $_.CommandLine -like "*api-server*"
}
if ($processes) {
    $processes | Stop-Process -Force
    Write-Host "API Server detenido" -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

# Limpiar cache
$nextPath = Join-Path $apiPath ".next"
if (Test-Path $nextPath) {
    Remove-Item -Path $nextPath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Cache limpiado" -ForegroundColor Green
}

Write-Host "Iniciando API Server..." -ForegroundColor Cyan
Set-Location $apiPath
npm run dev