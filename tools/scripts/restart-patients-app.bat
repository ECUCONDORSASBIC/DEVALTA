@echo off
echo.
echo ========================================
echo   Reiniciando AltaMedica Patients App
echo ========================================
echo.

REM Cambiar al directorio de la app patients
cd /d "C:\Users\Eduardo\Documents\devaltamedica\apps\patients"

echo 📍 Directorio actual: %CD%
echo.

REM Verificar si hay un proceso Next.js corriendo en puerto 3003
echo 🔍 Verificando procesos en puerto 3003...
netstat -ano | findstr :3003
if %errorlevel% equ 0 (
    echo ⚠️  Hay procesos usando el puerto 3003
    echo 🛑 Matando procesos en puerto 3003...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3003') do taskkill /F /PID %%a >nul 2>&1
    timeout /t 2 >nul
) else (
    echo ✅ Puerto 3003 libre
)

echo.
echo 🧹 Limpiando caché de Next.js...
if exist ".next" (
    rmdir /s /q ".next" 2>nul
    echo ✅ Caché .next eliminado
) else (
    echo ℹ️  No hay caché .next para eliminar
)

echo.
echo 📦 Verificando dependencias...
if not exist "node_modules" (
    echo ⚠️  No existe node_modules, instalando dependencias...
    npm install
) else (
    echo ✅ Dependencias encontradas
)

echo.
echo 🚀 Iniciando AltaMedica Patients App en modo desarrollo...
echo.
echo 🌐 La aplicación estará disponible en: http://localhost:3003
echo 🔧 Middleware de autenticación: DESACTIVADO (modo testing)
echo 👤 AuthProvider: DESACTIVADO (usando datos mock)
echo 📊 Dashboard: Cargando datos mock automáticamente
echo.
echo 💡 Presiona Ctrl+C para detener el servidor
echo.

REM Iniciar el servidor de desarrollo
npm run dev

echo.
echo 🛑 Servidor detenido
pause