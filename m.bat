@echo off
REM Altamedica MCP CLI - Fixed Version
REM Enhanced Multi-Agent Composer

SET ALTAMEDICA_WORKSPACE=C:\Users\Eduardo\Documents\devaltamedica

cd /d "%ALTAMEDICA_WORKSPACE%"

node altamedica-cli.js %*

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error executing Altamedica command
    pause
)
