# 🔍 AI Flow Orchestrator MCP Server Status Checker
# PowerShell script to check server status

Write-Host "🔍 Checking AI Flow Orchestrator MCP Server status..." -ForegroundColor Cyan
Write-Host ""

$RunningProcesses = @()

# Check for node processes running the MCP server
Get-Process -Name "node" -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        $CommandLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
        if ($CommandLine -like "*ai-flow-orchestrator-mcp.js*") {
            $RunningProcesses += [PSCustomObject]@{
                PID = $_.Id
                CPU = $_.CPU
                Memory = [Math]::Round($_.WorkingSet / 1MB, 2)
                StartTime = $_.StartTime
                CommandLine = $CommandLine
            }
        }
    } catch {
        # Process might have exited
    }
}

if ($RunningProcesses.Count -gt 0) {
    Write-Host "✅ MCP Server is RUNNING" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Running Processes:" -ForegroundColor Yellow
    foreach ($proc in $RunningProcesses) {
        Write-Host "  PID: $($proc.PID)" -ForegroundColor Cyan
        Write-Host "  Memory: $($proc.Memory) MB" -ForegroundColor Cyan
        Write-Host "  Start Time: $($proc.StartTime)" -ForegroundColor Cyan
        Write-Host "  ---" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ MCP Server is NOT running" -ForegroundColor Red
    Write-Host "💡 Use Start-MCPServer.ps1 to start it" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📊 All Node.js processes:" -ForegroundColor Blue
$AllNodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($AllNodeProcesses) {
    $AllNodeProcesses | Select-Object Id, Name, @{Name="Memory(MB)";Expression={[Math]::Round($_.WorkingSet / 1MB, 2)}}, StartTime | Format-Table -AutoSize
} else {
    Write-Host "  No Node.js processes found" -ForegroundColor Gray
}

Read-Host "Press Enter to continue"
