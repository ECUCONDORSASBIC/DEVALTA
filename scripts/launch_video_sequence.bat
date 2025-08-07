@echo off
echo 🎬 AltaMedica Video Demo Launcher
echo ===================================

echo 📋 Verificando servicios...
timeout /t 2 >nul

echo ✅ Abriendo secuencia de URLs para grabación...

echo 🏠 1/8 - Dashboard Principal (3s)
start http://localhost:3003
timeout /t 4 >nul

echo 🔍 2/8 - Búsqueda de Doctores (5s)  
start http://localhost:3003/doctors
timeout /t 6 >nul

echo 📹 3/8 - Telemedicina (7s)
start http://localhost:3003/telemedicine
timeout /t 8 >nul

echo 👨‍⚕️ 4/8 - Dashboard Doctores (6s)
start http://localhost:3002
timeout /t 7 >nul

echo 📊 5/8 - Gestión de Pacientes (5s)
start http://localhost:3002/pacientes
timeout /t 6 >nul

echo 🏪 6/8 - Marketplace Médico (6s)
start http://localhost:3002/marketplace
timeout /t 7 >nul

echo ⚙️ 7/8 - Panel Admin (4s)
start http://localhost:3005
timeout /t 5 >nul

echo 📡 8/8 - API Monitor (4s)
start http://localhost:3001/dashboard
timeout /t 5 >nul

echo ✅ Secuencia completada!
echo 🎬 Total: ~42 segundos de contenido
echo 💡 Usa OBS para grabar durante esta secuencia

pause
