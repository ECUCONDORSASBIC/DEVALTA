# Script para reiniciar API server con fix de node:process
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Reiniciando API Server con correcciones" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$rootPath = Split-Path -Parent $PSScriptRoot
$apiPath = Join-Path $rootPath "apps\api-server"

# Paso 1: Detener proceso existente
Write-Host "`n[1/4] Deteniendo procesos existentes..." -ForegroundColor Yellow
$processes = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*node.exe*" -and ($_.MainWindowTitle -like "*3001*" -or $_.CommandLine -like "*api-server*")
}

if ($processes) {
    foreach ($proc in $processes) {
        try {
            $proc | Stop-Process -Force
            Write-Host "  - Proceso detenido: PID $($proc.Id)" -ForegroundColor Red
        } catch {
            Write-Host "  - No se pudo detener proceso PID $($proc.Id)" -ForegroundColor Gray
        }
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "  - No hay procesos activos del API server" -ForegroundColor Gray
}

# Paso 2: Limpiar cache de Next.js
Write-Host "`n[2/4] Limpiando cache..." -ForegroundColor Yellow
$cacheDirs = @(".next", "node_modules\.cache")
foreach ($dir in $cacheDirs) {
    $fullPath = Join-Path $apiPath $dir
    if (Test-Path $fullPath) {
        Remove-Item -Path $fullPath -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  - Cache limpiado: $dir" -ForegroundColor Green
    }
}

# Paso 3: Verificar configuración
Write-Host "`n[3/4] Verificando configuración..." -ForegroundColor Yellow
$configFile = Join-Path $apiPath "next.config.js"
if (Test-Path $configFile) {
    $content = Get-Content $configFile -Raw
    if ($content -match "node:process") {
        Write-Host "  - Configuración de webpack detectada para node:process" -ForegroundColor Green
    } else {
        Write-Host "  - Advertencia: Configuración de webpack puede necesitar actualización" -ForegroundColor Yellow
    }
}

# Paso 4: Iniciar API Server
Write-Host "`n[4/4] Iniciando API Server..." -ForegroundColor Yellow
Write-Host "  - Puerto: 3001" -ForegroundColor Cyan
Write-Host "  - URL: http://localhost:3001" -ForegroundColor Cyan
Write-Host "  - Health Check: http://localhost:3001/api/health" -ForegroundColor Cyan

Set-Location $apiPath

# Iniciar en una nueva ventana de PowerShell
$startInfo = New-Object System.Diagnostics.ProcessStartInfo
$startInfo.FileName = "powershell.exe"
$startInfo.Arguments = "-NoExit -Command `"Set-Location '$apiPath'; Write-Host 'API Server - Puerto 3001' -ForegroundColor Cyan; pnpm dev`""
$startInfo.UseShellExecute = $true
$startInfo.WindowStyle = "Normal"

$process = [System.Diagnostics.Process]::Start($startInfo)

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "API Server iniciándose..." -ForegroundColor Green
Write-Host "Esperando 10 segundos para verificar..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Green

Start-Sleep -Seconds 10

# Verificar que el servidor esté respondiendo
Write-Host "`nVerificando servidor..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ API Server está funcionando correctamente" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ API Server puede estar iniciándose aún. Verifica manualmente en la nueva ventana." -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Proceso completado" -ForegroundColor Cyan
Write-Host "El API Server se está ejecutando en una nueva ventana" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan