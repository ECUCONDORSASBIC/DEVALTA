@echo off
title AltaMedica Video System
echo.
echo 🏥 AltaMedica - Sistema de Videollamadas de Telemedicina
echo ====================================================
echo.

echo 📹 Iniciando servidor de videollamadas...
start "Video Server" /min python start_video_server.py

echo ⏳ Esperando que el servidor arranque...
timeout /t 5 /nobreak >nul

echo 🧪 Creando videollamada de demostración...
python demo_video_call.py

echo.
echo 🎉 Sistema listo para usar!
echo.
echo 🌐 URLs importantes:
echo - Servidor:     http://localhost:8888
echo - API Docs:     http://localhost:8888/docs
echo - Health Check: http://localhost:8888/health
echo.
echo 🔧 Para integrar con Next.js, usa:
echo - videoCall-integration.ts
echo - video_call_client.py
echo.
pause
