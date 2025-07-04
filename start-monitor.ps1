# MONITOR MCP 24/7 - INICIO SIMPLIFICADO

Write-Host "DEVALTAMEDICA MCP MONITOR CONTROL" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "Iniciando monitoreo continuo..." -ForegroundColor Yellow
Write-Host ""

# Verificar Node.js
try {
    $nodeVersion = node --version 2>$null
    Write-Host "Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar script
if (-not (Test-Path "mcp-monitor-24-7.cjs")) {
    Write-Host "Error: Script monitor no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "Configuracion del monitor:" -ForegroundColor Cyan
Write-Host "- Analisis cognitivo: cada 5 minutos" -ForegroundColor White
Write-Host "- Verificacion negociaciones: cada 10 minutos" -ForegroundColor White
Write-Host "- Reportes inteligencia: cada 30 minutos" -ForegroundColor White
Write-Host "- Monitoreo plataforma: cada 2 minutos" -ForegroundColor White
Write-Host "- Auditoria compliance: cada 1 hora" -ForegroundColor White
Write-Host ""

Write-Host "Los logs se guardaran en: .\logs" -ForegroundColor Cyan
Write-Host ""

# Iniciar monitor
Write-Host "Iniciando monitor..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "mcp-monitor-24-7.cjs", "start" -WindowStyle Hidden

Start-Sleep -Seconds 3

Write-Host "Monitor iniciado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Comandos utiles:" -ForegroundColor Yellow
Write-Host "  node mcp-monitor-24-7.cjs status    - Ver estado" -ForegroundColor Gray
Write-Host "  node mcp-monitor-24-7.cjs logs      - Ver logs" -ForegroundColor Gray
Write-Host "  Get-Process node                   - Ver procesos" -ForegroundColor Gray
Write-Host ""
Write-Host "Para detener todos los procesos node:" -ForegroundColor Yellow
Write-Host "  Get-Process node | Stop-Process -Force" -ForegroundColor Gray
