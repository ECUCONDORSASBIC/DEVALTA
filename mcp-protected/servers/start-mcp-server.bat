@echo off
echo 🌊 Starting AI Flow Orchestrator MCP Server in background...

REM Change to the script directory
cd /d "%~dp0"

REM Kill any existing node processes running the MCP server
taskkill /F /IM node.exe /FI "WINDOWTITLE eq ai-flow-orchestrator-mcp*" 2>nul

REM Start the server in background with full path
start /B /MIN "" node "%~dp0ai-flow-orchestrator-mcp.js"

echo ✅ Server started in background!
echo 💡 Use stop-mcp-server.bat to stop it
echo 🔍 Use check-mcp-server.bat to check status
echo 📁 Running from: %~dp0

pause
