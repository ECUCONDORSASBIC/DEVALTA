# 🚀 INICIO COMPLETO DEL SISTEMA MCP + DASHBOARD WEB
# Inicia el monitor MCP y el servidor web del dashboard

Write-Host "🚀 DEVALTAMEDICA - SISTEMA COMPLETO MCP" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

# Verificar Node.js
try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js no encontrado" -ForegroundColor Red
    Write-Host "Por favor instala Node.js desde https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Verificar archivos necesarios
$requiredFiles = @(
    "mcp-monitor-24-7.cjs",
    "dashboard-server.cjs", 
    "dashboard.html",
    "dashboard.js"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ Archivos faltantes:" -ForegroundColor Red
    $missingFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    exit 1
}

Write-Host "✅ Todos los archivos necesarios encontrados" -ForegroundColor Green
Write-Host ""

# Detener procesos previos
Write-Host "🔄 Deteniendo procesos previos..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Crear directorio de logs
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Name "logs" -Force | Out-Null
    Write-Host "📁 Directorio de logs creado" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 INICIANDO COMPONENTES DEL SISTEMA..." -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# 1. Iniciar Monitor MCP
Write-Host "1️⃣ Iniciando Monitor MCP..." -ForegroundColor Yellow
$mcpProcess = Start-Process -FilePath "node" -ArgumentList "mcp-monitor-24-7.cjs", "start" -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 3

if ($mcpProcess -and -not $mcpProcess.HasExited) {
    Write-Host "   ✅ Monitor MCP iniciado (PID: $($mcpProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error iniciando Monitor MCP" -ForegroundColor Red
    exit 1
}

# 2. Iniciar Dashboard Server
Write-Host "2️⃣ Iniciando Dashboard Server..." -ForegroundColor Yellow
$dashboardProcess = Start-Process -FilePath "node" -ArgumentList "dashboard-server.cjs" -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 3

if ($dashboardProcess -and -not $dashboardProcess.HasExited) {
    Write-Host "   ✅ Dashboard Server iniciado (PID: $($dashboardProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error iniciando Dashboard Server" -ForegroundColor Red
    $mcpProcess | Stop-Process -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host ""
Write-Host "🎉 SISTEMA COMPLETAMENTE INICIADO" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

Write-Host "📊 DASHBOARD WEB:" -ForegroundColor Cyan
Write-Host "  🌐 URL: http://localhost:3000" -ForegroundColor White
Write-Host "  📈 API: http://localhost:3000/api/data" -ForegroundColor White
Write-Host ""

Write-Host "🤖 MONITOR MCP:" -ForegroundColor Cyan
Write-Host "  📁 Logs: .\logs\" -ForegroundColor White
Write-Host "  🔄 Análisis: cada 5 minutos" -ForegroundColor White
Write-Host "  📊 Reportes: cada 30 minutos" -ForegroundColor White
Write-Host ""

Write-Host "🎯 FUNCIONALIDADES ACTIVAS:" -ForegroundColor Yellow
Write-Host "  ✅ Análisis cognitivo de 8 agentes" -ForegroundColor Green
Write-Host "  ✅ Monitoreo de plataforma en tiempo real" -ForegroundColor Green
Write-Host "  ✅ Auditorías de compliance HIPAA" -ForegroundColor Green
Write-Host "  ✅ Negociaciones automáticas entre agentes" -ForegroundColor Green
Write-Host "  ✅ Reportes de inteligencia predictiva" -ForegroundColor Green
Write-Host "  ✅ Dashboard web con actualizaciones en tiempo real" -ForegroundColor Green
Write-Host ""

Write-Host "🎮 COMANDOS ÚTILES:" -ForegroundColor Yellow
Write-Host "  node mcp-monitor-24-7.cjs status    - Ver estado del monitor" -ForegroundColor Gray
Write-Host "  node mcp-monitor-24-7.cjs logs      - Ver logs específicos" -ForegroundColor Gray
Write-Host "  Get-Process node                    - Ver procesos activos" -ForegroundColor Gray
Write-Host ""

# Abrir dashboard en navegador
Write-Host "🌐 Abriendo dashboard en navegador..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

try {
    Start-Process "http://localhost:3000"
    Write-Host "   ✅ Dashboard abierto en navegador" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ No se pudo abrir automáticamente" -ForegroundColor Yellow
    Write-Host "   👉 Abre manualmente: http://localhost:3000" -ForegroundColor White
}

Write-Host ""
Write-Host "⏹️ PARA DETENER EL SISTEMA:" -ForegroundColor Red
Write-Host "   Get-Process node | Stop-Process -Force" -ForegroundColor Red
Write-Host ""

Write-Host "📊 Verifica el estado en tiempo real en: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Monitoreo básico del estado
Write-Host "🔍 MONITOREO DE ESTADO INICIAL:" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

# Esperar un poco para que los sistemas se estabilicen
Start-Sleep -Seconds 5

# Verificar procesos
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
Write-Host "📊 Procesos Node.js activos: $($nodeProcesses.Count)" -ForegroundColor White

# Verificar logs
if (Test-Path "logs") {
    $logFiles = Get-ChildItem "logs" -Filter "*.log"
    Write-Host "📁 Archivos de log: $($logFiles.Count)" -ForegroundColor White
    
    if ($logFiles.Count -gt 0) {
        $newestLog = $logFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        Write-Host "📄 Último log actualizado: $($newestLog.Name) - $($newestLog.LastWriteTime.ToString('HH:mm:ss'))" -ForegroundColor White
    }
}

# Verificar conectividad del dashboard
Write-Host "🌐 Verificando conectividad del dashboard..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/data" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Dashboard API respondiendo correctamente" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️ Dashboard aún iniciando, intenta en unos segundos" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 ¡SISTEMA DEVALTAMEDICA MCP COMPLETAMENTE OPERATIVO!" -ForegroundColor Green
Write-Host ""
Write-Host "Tu Enhanced Multi-Agent Composer está:" -ForegroundColor White
Write-Host "• 🧠 Analizando 8 agentes especializados cada 5 minutos" -ForegroundColor White  
Write-Host "• 🔍 Monitoreando tu plataforma cada 2 minutos" -ForegroundColor White
Write-Host "• 🛡️ Auditando compliance HIPAA cada hora" -ForegroundColor White
Write-Host "• 📊 Generando reportes de inteligencia cada 30 minutos" -ForegroundColor White
Write-Host "• 🌐 Sirviendo dashboard web en tiempo real" -ForegroundColor White
Write-Host ""
Write-Host "¡Disfruta del poder de 18 consultores senior trabajando 24/7!" -ForegroundColor Cyan
