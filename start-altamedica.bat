@echo off
echo.
echo ===== ALTAMEDICA - DOCKER LAUNCHER =====
echo.

REM Verificar si PowerShell está disponible
powershell -Command "Get-Host" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PowerShell no esta disponible
    pause
    exit /b 1
)

REM Ejecutar el script de PowerShell
powershell -ExecutionPolicy Bypass -File "%~dp0start-altamedica-docker.ps1"

pause