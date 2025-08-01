@echo off
title AltaMedica - Web App Gateway (Puerto 3000)
cd /d "%~dp0apps\web-app"
echo ============================================
echo  AltaMedica - Web App Gateway Central
echo  Puerto: 3000
echo  App: web-app (CRITICO - Gateway)
echo ============================================
echo.
echo Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
)
echo.
echo Iniciando servidor en puerto 3000...
set PORT=3000
npx next dev -p 3000
pause