@echo off
echo.
echo ========================================
echo   AltaMedica SSO Authentication Proxy
echo ========================================
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python no está instalado o no está en PATH
    echo 📦 Instala Python desde https://python.org
    pause
    exit /b 1
)

echo ✅ Python detectado
echo.

REM Instalar dependencias si no existen
echo 📦 Verificando dependencias...
pip show aiohttp >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Instalando aiohttp...
    pip install aiohttp
)

pip show aiohttp-cors >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Instalando aiohttp-cors...
    pip install aiohttp-cors
)

pip show firebase-admin >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Instalando firebase-admin...
    pip install firebase-admin
)

pip show PyJWT >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Instalando PyJWT...
    pip install PyJWT
)

echo ✅ Dependencias verificadas
echo.

REM Verificar si el archivo del proxy existe
if not exist "sso-auth-proxy.py" (
    echo ❌ Archivo sso-auth-proxy.py no encontrado
    echo 📁 Asegúrate de estar en el directorio correcto
    pause
    exit /b 1
)

echo 🚀 Iniciando AltaMedica SSO Auth Proxy...
echo.
echo 🌐 El proxy estará disponible en: http://localhost:9000
echo.
echo 📋 URLs importantes:
echo    • Login: http://localhost:9000/auth/login
echo    • Health: http://localhost:9000/health
echo    • Redirección: http://localhost:9000/auth/redirect
echo.
echo 👥 Usuarios de testing:
echo    • paciente.test@email.com / Patient123! (PATIENT)
echo    • dr.martinez@altamedica.com / Doctor123! (DOCTOR)
echo    • empresa@altamedica.com / Company123! (COMPANY)
echo    • admin@altamedica.com / Admin123! (ADMIN)
echo.
echo 🛑 Presiona Ctrl+C para detener el servidor
echo.

REM Iniciar el proxy SSO
python sso-auth-proxy.py

echo.
echo 🛑 AltaMedica SSO Auth Proxy detenido
pause