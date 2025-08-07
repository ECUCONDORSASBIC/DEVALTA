# 🚀 AUTO-SETUP DEL ENTORNO DE DESARROLLO
Write-Host "🚀 Iniciando entorno de desarrollo..." -ForegroundColor Green

# Auto-instalar dependencias si no existen
if (-not (Test-Path "node_modules")) {
    Write-Host "� Instalando dependencias..." -ForegroundColor Yellow
    pnpm install
}

# Auto-iniciar la app más usada si no hay procesos
$processes = Get-Process -Name "node" -ErrorAction SilentlyContinue
if (-not $processes) {
    Write-Host "🏃 Iniciando app patients automáticamente..." -ForegroundColor Blue
    Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; pnpm --filter patients dev" -WindowStyle Minimized
}

Write-Host "✅ Entorno listo" -ForegroundColor Green
