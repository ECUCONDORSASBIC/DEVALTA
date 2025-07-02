@echo off
echo 🛑 Stopping AI Flow Orchestrator MCP Server...

REM Find and kill node processes running the MCP server
for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq node.exe" ^| findstr "node.exe"') do (
    wmic process where "ProcessId=%%i and CommandLine like '%%ai-flow-orchestrator-mcp.js%%'" delete 2>nul
)

echo ✅ Server stopped!
pause
