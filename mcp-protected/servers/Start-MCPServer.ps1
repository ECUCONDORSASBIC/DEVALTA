# 🌊 AI Flow Orchestrator MCP Server Manager
# PowerShell script to start the server in background

Write-Host "🌊 Starting AI Flow Orchestrator MCP Server in background..." -ForegroundColor Cyan

# Get the script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Check if Node.js is available
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js not found in PATH" -ForegroundColor Red
    Write-Host "💡 Please install Node.js or add it to your PATH" -ForegroundColor Yellow
    Read-Host "Press Enter to continue"
    exit 1
}

# Check if the MCP server file exists
$ServerFile = Join-Path $ScriptDir "ai-flow-orchestrator-mcp.js"
if (-not (Test-Path $ServerFile)) {
    Write-Host "❌ Server file not found: $ServerFile" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

# Kill any existing processes
Write-Host "🔄 Stopping any existing server instances..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*ai-flow-orchestrator-mcp.js*"
} | Stop-Process -Force

# Start the server in background
Write-Host "🚀 Starting server: $ServerFile" -ForegroundColor Green

$ProcessInfo = Start-Process -FilePath "node" `
                             -ArgumentList "$ServerFile" `
                             -WorkingDirectory $ScriptDir `
                             -WindowStyle Hidden `
                             -PassThru

if ($ProcessInfo) {
    Write-Host "✅ Server started successfully!" -ForegroundColor Green
    Write-Host "📊 Process ID: $($ProcessInfo.Id)" -ForegroundColor Cyan
    Write-Host "📁 Working Directory: $ScriptDir" -ForegroundColor Cyan
    Write-Host "💡 Use Stop-MCPServer.ps1 to stop it" -ForegroundColor Yellow
    Write-Host "🔍 Use Check-MCPServer.ps1 to check status" -ForegroundColor Yellow
} else {
    Write-Host "❌ Failed to start server" -ForegroundColor Red
}

Read-Host "Press Enter to continue"
