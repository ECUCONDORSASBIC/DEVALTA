@echo off
title AltaMedica - API Server (Puerto 3001)
cd /d "%~dp0apps\api-server"
echo ============================================
echo  AltaMedica - API Server Backend
echo  Puerto: 3001
echo  App: api-server
echo ============================================
echo.
echo Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
)
echo.
echo Iniciando servidor en puerto 3001...
set PORT=3001
npx next dev -p 3001
pause