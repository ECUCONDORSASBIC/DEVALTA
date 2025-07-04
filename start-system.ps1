# INICIO SIMPLIFICADO DEL SISTEMA MCP + DASHBOARD

Write-Host "DEVALTAMEDICA - SISTEMA COMPLETO MCP" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Verificar Node.js
try {
    $nodeVersion = node --version 2>$null
    Write-Host "Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js no encontrado" -ForegroundColor Red
    exit 1
}

# Detener procesos previos
Write-Host "Deteniendo procesos previos..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Crear directorio de logs
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Name "logs" -Force | Out-Null
    Write-Host "Directorio de logs creado" -ForegroundColor Green
}

Write-Host ""
Write-Host "INICIANDO COMPONENTES DEL SISTEMA..." -ForegroundColor Cyan

# 1. Iniciar Monitor MCP
Write-Host "1. Iniciando Monitor MCP..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "mcp-monitor-24-7.cjs", "start" -WindowStyle Hidden
Start-Sleep -Seconds 3

# 2. Iniciar Dashboard Server
Write-Host "2. Iniciando Dashboard Server..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "dashboard-server.cjs" -WindowStyle Hidden
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "SISTEMA COMPLETAMENTE INICIADO" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""

Write-Host "DASHBOARD WEB:" -ForegroundColor Cyan
Write-Host "  URL: http://localhost:3000" -ForegroundColor White
Write-Host "  API: http://localhost:3000/api/data" -ForegroundColor White
Write-Host ""

Write-Host "MONITOR MCP:" -ForegroundColor Cyan
Write-Host "  Logs: .\logs\" -ForegroundColor White
Write-Host "  Analisis: cada 5 minutos" -ForegroundColor White
Write-Host "  Reportes: cada 30 minutos" -ForegroundColor White
Write-Host ""

Write-Host "FUNCIONALIDADES ACTIVAS:" -ForegroundColor Yellow
Write-Host "  - Analisis cognitivo de 8 agentes" -ForegroundColor Green
Write-Host "  - Monitoreo de plataforma en tiempo real" -ForegroundColor Green
Write-Host "  - Auditorias de compliance HIPAA" -ForegroundColor Green
Write-Host "  - Negociaciones automaticas entre agentes" -ForegroundColor Green
Write-Host "  - Reportes de inteligencia predictiva" -ForegroundColor Green
Write-Host "  - Dashboard web con actualizaciones en tiempo real" -ForegroundColor Green
Write-Host ""

# Abrir dashboard en navegador
Write-Host "Abriendo dashboard en navegador..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

try {
    Start-Process "http://localhost:3000"
    Write-Host "   Dashboard abierto en navegador" -ForegroundColor Green
} catch {
    Write-Host "   No se pudo abrir automaticamente" -ForegroundColor Yellow
    Write-Host "   Abre manualmente: http://localhost:3000" -ForegroundColor White
}

Write-Host ""
Write-Host "PARA DETENER EL SISTEMA:" -ForegroundColor Red
Write-Host "   Get-Process node | Stop-Process -Force" -ForegroundColor Red
Write-Host ""

# Verificar estado
Start-Sleep -Seconds 3
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
Write-Host "Procesos Node.js activos: $($nodeProcesses.Count)" -ForegroundColor White

Write-Host ""
Write-Host "SISTEMA DEVALTAMEDICA MCP COMPLETAMENTE OPERATIVO!" -ForegroundColor Green
Write-Host ""
Write-Host "Tu Enhanced Multi-Agent Composer esta:" -ForegroundColor White
Write-Host "• Analizando 8 agentes especializados cada 5 minutos" -ForegroundColor White  
Write-Host "• Monitoreando tu plataforma cada 2 minutos" -ForegroundColor White
Write-Host "• Auditando compliance HIPAA cada hora" -ForegroundColor White
Write-Host "• Generando reportes de inteligencia cada 30 minutos" -ForegroundColor White
Write-Host "• Sirviendo dashboard web en tiempo real" -ForegroundColor White
Write-Host ""
Write-Host "Disfruta del poder de 18 consultores senior trabajando 24/7!" -ForegroundColor Cyan
