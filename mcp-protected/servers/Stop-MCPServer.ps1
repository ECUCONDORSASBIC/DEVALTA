# 🛑 AI Flow Orchestrator MCP Server Stopper
# PowerShell script to stop the server

Write-Host "🛑 Stopping AI Flow Orchestrator MCP Server..." -ForegroundColor Red

$StoppedCount = 0

# Find and stop node processes running the MCP server
Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $CommandLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
        if ($CommandLine -like "*ai-flow-orchestrator-mcp.js*") {
            Write-Host "🎯 Found MCP server process (PID: $($_.Id))" -ForegroundColor Yellow
            Stop-Process -Id $_.Id -Force
            $StoppedCount++
            Write-Host "✅ Stopped process $($_.Id)" -ForegroundColor Green
        }
    } catch {
        # Process might have already exited
    }
}

if ($StoppedCount -eq 0) {
    Write-Host "ℹ️ No MCP server processes were running" -ForegroundColor Blue
} else {
    Write-Host "✅ Stopped $StoppedCount MCP server process(es)" -ForegroundColor Green
}

Read-Host "Press Enter to continue"
