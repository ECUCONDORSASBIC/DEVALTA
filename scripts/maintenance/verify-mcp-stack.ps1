# VERIFICACIÓN Y EJECUCIÓN AUTOMÁTICA MCP

# Verificar stack MCP completo
Write-Host "🚀 INICIANDO VERIFICACIÓN AUTOMÁTICA MCP STACK" -ForegroundColor Green

# 1. Verificar configuración
if (Test-Path "mcp-config.json") {
    $config = Get-Content "mcp-config.json" | ConvertFrom-Json
    $serverCount = $config.mcpServers.PSObject.Properties.Count
    Write-Host "✅ MCP Config: $serverCount servidores activos" -ForegroundColor Green
} else {
    Write-Host "❌ mcp-config.json no encontrado" -ForegroundColor Red
}

# 2. Verificar archivos MCP servers
Write-Host "✅ Verificando MCP Servers:" -ForegroundColor Green
$serverFiles = @(
    "ai-flow-orchestrator-mcp.js",
    "codebase-intelligence-mcp.js", 
    "context-memory-mcp.js",
    "copilot-mcp-bridge.js",
    "medical-mcp-server.js",
    "multi-agent-composer-mcp.js",
    "project-scaffolding-mcp.js",
    "smart-completion-mcp.js"
)

foreach ($file in $serverFiles) {
    $path = "mcp-protected/servers/$file"
    if (Test-Path $path) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file" -ForegroundColor Red
    }
}

# 3. Ejecutar Inspector MCP
Write-Host "`n🔧 EJECUTANDO INSPECTOR MCP..." -ForegroundColor Yellow
try {
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c npx -y @modelcontextprotocol/inspector node mcp-protected/servers/multi-agent-composer-mcp.js" -WindowStyle Minimized
    Write-Host "✅ Inspector MCP lanzado" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Error lanzando Inspector: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 4. Verificar Node.js y ejecutar verificación
Write-Host "`n🧠 EJECUTANDO VERIFICACIÓN NODE.JS..." -ForegroundColor Yellow
try {
    node verify-mcp-flows.js
    Write-Host "✅ Verificación Node.js completada" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Error en verificación Node.js: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n🎯 VERIFICACIÓN MCP COMPLETADA" -ForegroundColor Green
Write-Host "Comandos disponibles:" -ForegroundColor Cyan
Write-Host "  npx -y @modelcontextprotocol/inspector node mcp-protected/servers/multi-agent-composer-mcp.js" -ForegroundColor Gray
Write-Host "  node verify-mcp-flows.js" -ForegroundColor Gray
