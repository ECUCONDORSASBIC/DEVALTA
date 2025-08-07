@echo off
echo.
echo ========================================
echo   AltaMedica - Fix Next.js Build Error
echo ========================================
echo.

REM Ir al directorio raíz del proyecto
cd /d "C:\Users\Eduardo\Documents\devaltamedica"

echo 📍 Directorio: %CD%
echo.

echo 🛑 1. Matando todos los procesos Node.js y Next.js...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM next.exe >nul 2>&1
timeout /t 2 >nul

echo 🧹 2. Limpiando cachés de Next.js en todas las apps...
for /d %%i in (apps\*) do (
    if exist "%%i\.next" (
        echo    - Limpiando %%i\.next
        rmdir /s /q "%%i\.next" 2>nul
    )
)

echo 🧹 3. Limpiando node_modules y package-lock...
if exist "node_modules" (
    echo    - Eliminando node_modules raíz...
    rmdir /s /q "node_modules" 2>nul
)

if exist "package-lock.json" (
    echo    - Eliminando package-lock.json...
    del "package-lock.json" 2>nul
)

if exist "pnpm-lock.yaml" (
    echo    - Eliminando pnpm-lock.yaml...
    del "pnpm-lock.yaml" 2>nul
)

echo 🧹 4. Limpiando cachés específicos de las apps...
for /d %%i in (apps\*) do (
    if exist "%%i\node_modules" (
        echo    - Limpiando %%i\node_modules
        rmdir /s /q "%%i\node_modules" 2>nul
    )
    if exist "%%i\.turbo" (
        echo    - Limpiando %%i\.turbo
        rmdir /s /q "%%i\.turbo" 2>nul
    )
)

echo 🧹 5. Limpiando cachés de pnpm globales...
pnpm store prune >nul 2>&1

echo 📦 6. Reinstalando dependencias desde cero...
echo    - Instalando dependencias del workspace raíz...
npm install --legacy-peer-deps

echo.
echo 🔧 7. Compilando packages compartidos...
echo    - Building shared packages...
npm run build:packages

echo.
echo 🎯 8. Intentando iniciar patients app específicamente...
echo.

REM Cambiar a directorio de patients
cd "apps\patients"

echo 📍 Directorio patients: %CD%
echo.

echo 🧹 Limpieza final de patients app...
if exist ".next" rmdir /s /q ".next" 2>nul
if exist "node_modules" rmdir /s /q "node_modules" 2>nul

echo 📦 Instalando dependencias específicas de patients...
npm install --legacy-peer-deps

echo.
echo 🚀 Iniciando AltaMedica Patients App (puerto 3003)...
echo.
echo 🌐 URL: http://localhost:3003
echo 🔧 Modo: Development sin autenticación
echo 📊 Datos: Mock data para testing
echo.
echo 💡 Si sigue fallando, presiona Ctrl+C y ejecuta:
echo    cd apps/patients && npm run dev
echo.

npm run dev

echo.
echo 🛑 Proceso terminado
pause