@echo off
echo.
echo ========================================
echo   AltaMedica SSO Production Proxy 
echo ========================================
echo.

echo 🔍 Iniciando proxy de producción (con Firebase + API Server)...

REM Verificar si Node.js está disponible
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Node.js detectado
    echo.
    echo 🚀 Iniciando servidor proxy de producción...
    echo 📍 El proxy estará disponible en: http://localhost:9001
    echo.
    echo 🔗 Integraciones:
    echo    • API Server: http://localhost:3001
    echo    • Firebase: Via API Server
    echo    • Web App: http://localhost:3000
    echo.
    echo 🧪 URLs de testing:
    echo    • Login: http://localhost:9001/auth/login
    echo    • Health: http://localhost:9001/health
    echo    • Verify: http://localhost:9001/auth/verify
    echo    • Test Integration: http://localhost:9001/auth/test-integration
    echo.
    echo 🔑 Usa credenciales reales de Firebase:
    echo    • Cualquier usuario válido en Firebase
    echo    • Las credenciales se validan contra el API Server
    echo.
    echo 🛑 Presiona Ctrl+C para detener el servidor
    echo.
    
    node sso-proxy-production.js
) else (
    echo ❌ Node.js no encontrado
    echo Por favor instala Node.js para continuar
    pause
)

echo.
echo 🛑 AltaMedica SSO Production Proxy detenido
pause
