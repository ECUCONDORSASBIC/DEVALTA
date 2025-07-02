@echo off
echo 🔍 Checking AI Flow Orchestrator MCP Server status...
echo.

REM Check if node processes are running
set found=0
for /f "tokens=1,2" %%i in ('tasklist /FI "IMAGENAME eq node.exe" ^| findstr "node.exe"') do (
    for /f %%k in ('wmic process where "ProcessId=%%j" get CommandLine /value ^| findstr "ai-flow-orchestrator-mcp.js"') do (
        set found=1
        echo ✅ Server is RUNNING - PID: %%j
    )
)

if %found%==0 (
    echo ❌ Server is NOT running
    echo 💡 Use start-mcp-server.bat to start it
)

echo.
echo 📊 All Node.js processes:
tasklist /FI "IMAGENAME eq node.exe" 2>nul || echo No Node.js processes found

pause
