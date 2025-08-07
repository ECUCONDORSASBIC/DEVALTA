@echo off
echo.
echo ========================================
echo   Quick Fix - Patients App Only
echo ========================================
echo.

REM Ir directamente a patients app
cd /d "C:\Users\Eduardo\Documents\devaltamedica\apps\patients"

echo 📍 Directorio: %CD%
echo.

echo 🛑 1. Matando procesos en puerto 3003...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3003') do taskkill /F /PID %%a >nul 2>&1

echo 🧹 2. Limpieza completa de caché Next.js...
if exist ".next" (
    echo    - Eliminando .next
    rmdir /s /q ".next" 2>nul
)

if exist ".turbo" (
    echo    - Eliminando .turbo
    rmdir /s /q ".turbo" 2>nul
)

if exist "node_modules\.cache" (
    echo    - Eliminando cache de node_modules
    rmdir /s /q "node_modules\.cache" 2>nul
)

echo 🧹 3. Limpiando archivos temporales...
del /q "*.log" >nul 2>&1
del /q ".env.local.bak" >nul 2>&1

echo 📦 4. Verificando dependencias...
if not exist "node_modules" (
    echo    - Instalando node_modules...
    npm install --legacy-peer-deps
) else (
    echo    - node_modules existe, continuando...
)

echo.
echo 🔧 5. Variables de entorno para desarrollo...
echo NEXT_TELEMETRY_DISABLED=1> .env.local.temp
echo NODE_OPTIONS=--max-old-space-size=4096>> .env.local.temp
if exist ".env.local" (
    type ".env.local" >> .env.local.temp
    move ".env.local.temp" ".env.local" >nul
) else (
    move ".env.local.temp" ".env.local" >nul
)

echo.
echo 🚀 6. Iniciando patients app con configuración optimizada...
echo.
echo 🌐 URL: http://localhost:3003
echo 🔧 Middleware: DESACTIVADO
echo 👤 Auth: DESACTIVADO (datos mock)
echo 📊 Dashboard: Mock data automático
echo.
echo 💡 Presiona Ctrl+C para detener
echo.

REM Iniciar con variables de entorno optimizadas
set NODE_OPTIONS=--max-old-space-size=4096
set NEXT_TELEMETRY_DISABLED=1
npm run dev

echo.
echo 🛑 Patients app detenida
pause