@echo off
echo 🏥 Iniciando servidor de videollamadas AltaMedica...
echo.
echo 📹 Servidor WebRTC en puerto 8888
echo 🌐 Interfaz web disponible en: http://localhost:8888
echo 👨‍⚕️ URL para doctores: http://localhost:3001 (Doctors App)
echo 👨‍🦱 URL para pacientes: http://localhost:3000 (Patients App)
echo.

python telemedicine_video_server.py

pause
