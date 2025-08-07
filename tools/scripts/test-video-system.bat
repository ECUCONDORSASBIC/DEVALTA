@echo off
echo 🏥 AltaMedica - Sistema de Videollamadas
echo =======================================
echo.

echo 📹 Iniciando servidor de videollamadas...
start "Video Server" python telemedicine_video_server.py

echo ⏳ Esperando que el servidor arranque...
timeout /t 3 /nobreak >nul

echo 🧪 Ejecutando pruebas...
python test_video_simple.py

echo.
echo 🌐 URLs disponibles:
echo - Servidor: http://localhost:8888
echo - API Docs: http://localhost:8888/docs
echo - Crear videollamada: http://localhost:8888/api/video-calls/create
echo.
echo ✨ Para crear una videollamada desde Next.js:
echo import { createConsultationCall } from './video_call_client.py'
echo const result = await createConsultationCall('doctor@email.com', 'patient@email.com')
echo.
pause
