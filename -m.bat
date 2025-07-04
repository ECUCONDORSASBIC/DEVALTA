@echo off
REM 🏥 ALTAMEDICA MCP CLI - Comando -m Corregido
REM Punto crucial de interacción con Enhanced Multi-Agent

SET ALTAMEDICA_WORKSPACE=C:\Users\Eduardo\Documents\devaltamedica

REM Cambiar al workspace de Altamedica
cd /d "%ALTAMEDICA_WORKSPACE%"

REM Ejecutar el CLI con Node.js (ES6 modules ya configurado en package.json)
node altamedica-cli.js %*

REM Pausar si hay error para ver el mensaje
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Error ejecutando comando Altamedica
    echo 💡 Verifica que Node.js esté instalado y el archivo CLI exista
    pause
)
