@echo off
chcp 65001 >nul
cls

echo 🎬 AltaMedica Video Demo Launcher
echo ===================================

echo.
echo 📋 Verificando servicios...
timeout /t 1 >nul

echo.
echo ✅ Iniciando secuencia de URLs para grabación...
echo 💡 Asegúrate de tener OBS grabando!

echo.
echo 🏠 1/8 - Dashboard Principal
echo    Duración: 3 segundos
start "" "http://localhost:3003"
timeout /t 4 >nul

echo.
echo 🔍 2/8 - Búsqueda de Doctores  
echo    Duración: 5 segundos
start "" "http://localhost:3003/doctors"
timeout /t 6 >nul

echo.
echo 📹 3/8 - Telemedicina
echo    Duración: 7 segundos
start "" "http://localhost:3003/telemedicine"
timeout /t 8 >nul

echo.
echo 👨‍⚕️ 4/8 - Dashboard Doctores
echo    Duración: 6 segundos
start "" "http://localhost:3002"
timeout /t 7 >nul

echo.
echo 📊 5/8 - Gestión de Pacientes
echo    Duración: 5 segundos
start "" "http://localhost:3002/pacientes"
timeout /t 6 >nul

echo.
echo 🏪 6/8 - Marketplace Médico
echo    Duración: 6 segundos
start "" "http://localhost:3002/marketplace"
timeout /t 7 >nul

echo.
echo ⚙️ 7/8 - Panel Admin
echo    Duración: 4 segundos
start "" "http://localhost:3005"
timeout /t 5 >nul

echo.
echo 📡 8/8 - API Monitor
echo    Duración: 4 segundos
start "" "http://localhost:3001/dashboard"
timeout /t 5 >nul

echo.
echo ✅ Secuencia completada!
echo 🎬 Total: aproximadamente 42 segundos de contenido
echo 💡 Revisa tu grabación en OBS

echo.
echo 🎨 Próximo paso: Editar en DaVinci Resolve
echo    - Aplicar zoom rápido (100%% a 120%%)
echo    - Transiciones blur suaves
echo    - Pan horizontal en dashboards
echo    - Fade entre escenas

echo.
pause
