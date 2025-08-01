@echo off
title AltaMedica Web App - Quick Start

echo.
echo ==========================================
echo   🏥 AltaMedica Web App - Quick Start
echo ==========================================
echo.

REM Cambiar al directorio de trabajo
cd /d "C:\Users\Eduardo\Documents\devaltamedica"

echo 📍 Directorio: %CD%
echo.

REM Verificar Node.js
echo 🔧 Verificando Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js no encontrado. Por favor instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js disponible

REM Verificar npm
echo 🔧 Verificando npm...
npm --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm no encontrado
    pause
    exit /b 1
)
echo ✅ npm disponible

REM Instalar pnpm si no está disponible
echo 🔧 Verificando pnpm...
pnpm --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ pnpm no encontrado. Instalando...
    npm install -g pnpm
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Error instalando pnpm
        goto npm_fallback
    )
    echo ✅ pnpm instalado
) else (
    echo ✅ pnpm disponible
)

REM Instalar dependencias con pnpm
echo.
echo 📦 Instalando dependencias con pnpm...
pnpm install --force
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error con pnpm install
    goto npm_fallback
)

REM Ejecutar aplicación
echo.
echo 🚀 Iniciando AltaMedica Web App...
echo 🌐 URL: http://localhost:3000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

pnpm dev:web-app
goto end

:npm_fallback
echo.
echo ⚠️  Usando npm como alternativa...
npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error con npm install
    pause
    exit /b 1
)

cd apps\web-app
echo.
echo 🚀 Iniciando con npm...
npm run dev

:end
pause