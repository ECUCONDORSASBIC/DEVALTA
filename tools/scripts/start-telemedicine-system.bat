@echo off
title AltaMedica - Sistema de Telemedicina Integrado
color 0A

echo.
echo ==========================================
echo   AltaMedica - Sistema de Telemedicina
echo ==========================================
echo.

echo 🏥 Iniciando sistema completo de telemedicina...
echo.

REM Verificar que Node.js esté disponible
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no encontrado. Por favor instale Node.js 18+ primero.
    pause
    exit /b 1
)

echo ✅ Node.js detectado
echo.

REM Cambiar al directorio del proyecto
cd /d "%~dp0"

echo 📦 Instalando dependencias...
call npm install
if errorlevel 1 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo.
echo 🔧 Construyendo paquetes compartidos...
call npm run build:packages
if errorlevel 1 (
    echo ⚠️  Advertencia: Error construyendo paquetes (continuando...)
)

echo.
echo 🎥 Iniciando servidor de videollamadas (Puerto 8888)...
start "Videollamadas Server" cmd /c "call .\test-video-system.bat"

REM Esperar un momento para que el servidor inicie
timeout /t 5 /nobreak >nul

echo.
echo 👨‍🦱 Iniciando aplicación de Pacientes (Puerto 3003)...
start "Patients App" cmd /c "cd apps\patients && npm run dev"

echo.
echo 👨‍⚕️ Iniciando aplicación de Doctores (Puerto 3002)...
start "Doctors App" cmd /c "cd apps\doctors && npm run dev"

echo.
echo 🌐 Iniciando API Server (Puerto 3001)...
start "API Server" cmd /c "cd apps\api-server && npm run dev"

echo.
echo ⏳ Esperando que todos los servicios inicien...
timeout /t 10 /nobreak >nul

echo.
echo 🎉 ¡Sistema de Telemedicina Iniciado!
echo.
echo 📋 URLs Disponibles:
echo ==================
echo.
echo 🏥 Para Pacientes:
echo    http://localhost:3003/telemedicine
echo    http://localhost:3003/telemedicine/room/session-001 (Demo)
echo.
echo 👨‍⚕️ Para Doctores:
echo    http://localhost:3002/telemedicine
echo    http://localhost:3002/telemedicine/session/session-001 (Demo)
echo.
echo 🎥 Sistema de Videollamadas:
echo    http://localhost:8888 (Servidor)
echo    http://localhost:8888/docs (Documentación API)
echo.
echo 🌐 API Principal:
echo    http://localhost:3001 (Backend)
echo.
echo 📋 Instrucciones de Uso:
echo ======================
echo.
echo 1. Abra dos navegadores o pestañas
echo 2. En uno, vaya a la URL de Pacientes
echo 3. En otro, vaya a la URL de Doctores
echo 4. Haga clic en "Unirse/Iniciar Consulta" en ambos
echo 5. ¡Disfrute de la videollamada médica integrada!
echo.
echo ⚠️  Nota: Asegúrese de permitir acceso a cámara y micrófono
echo.
echo Presione cualquier tecla para abrir las URLs automáticamente...
pause >nul

REM Abrir URLs en el navegador
start http://localhost:3003/telemedicine
timeout /t 2 /nobreak >nul
start http://localhost:3002/telemedicine

echo.
echo ✅ Sistema completamente operativo
echo 📞 Para detener todos los servicios, cierre todas las ventanas de terminal
echo.
pause