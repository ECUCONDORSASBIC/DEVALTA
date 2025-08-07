@echo off
title AltaMedica - Sistema de Videollamadas Completo
color 0A

echo.
echo ====================================================
echo   AltaMedica - SISTEMA DE VIDEOLLAMADAS COMPLETO
echo ====================================================
echo.

echo 🚀 Iniciando servidor WebRTC...
start /B python start_video_server.py
timeout /t 3 /nobreak >nul

echo.
echo 🌐 Verificando servidor WebRTC...
curl -s http://localhost:8888/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Servidor WebRTC no se pudo iniciar
    pause
    exit /b 1
)
echo ✅ Servidor WebRTC funcionando en puerto 8888

echo.
echo 🎯 Creando videollamada de demostración...
curl -X POST "http://localhost:8888/api/video-calls/create" ^
  -H "Content-Type: application/json" ^
  -d "{\"doctor_email\":\"dr.demo@altamedica.com\",\"patient_email\":\"paciente.demo@email.com\",\"consultation_id\":\"demo_%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%\"}" ^
  > temp_demo_call.json 2>nul

if errorlevel 1 (
    echo ❌ Error creando videollamada de demostración
    pause
    exit /b 1
)

echo ✅ Videollamada de demostración creada

echo.
echo 🎥 SISTEMA COMPLETAMENTE INTEGRADO
echo ==================================
echo.

echo 📋 URLs DISPONIBLES:
echo.
echo 👨‍⚕️ DOCTORES:
echo   - Prueba simple: http://localhost:3002/test-video
echo   - Sesión real: http://localhost:3002/telemedicine/session/demo_session
echo.
echo 👨‍🦱 PACIENTES:
echo   - Prueba simple: http://localhost:3003/test-video  
echo   - Sala real: http://localhost:3003/telemedicine/room/demo_session
echo.
echo 🎥 SERVIDOR WebRTC DIRECTO:
echo   - API: http://localhost:8888
echo   - Health: http://localhost:8888/health
echo.

echo 💡 CÓMO PROBAR:
echo ===============
echo.
echo 1. Ve a http://localhost:3002/test-video
echo 2. Haz clic en "Crear Videollamada de Prueba"
echo 3. Haz clic en "🎥 Unirse como Doctor (WebRTC Real)"
echo 4. En otra pestaña, haz clic "🎥 Unirse como Paciente (WebRTC Real)"
echo 5. ¡Permite acceso a cámara y micrófono!
echo 6. ¡Tendrás videollamadas médicas reales funcionando!
echo.

echo ⚡ ABRIENDO PÁGINAS DE PRUEBA...
echo.

REM Abrir páginas de prueba
start http://localhost:3002/test-video
timeout /t 2 /nobreak >nul
start http://localhost:3003/test-video

echo.
echo ✅ ¡SISTEMA LISTO!
echo.
echo 🔧 CARACTERÍSTICAS:
echo   ✅ WebRTC peer-to-peer real
echo   ✅ Video HD bilateral
echo   ✅ Audio bidireccional
echo   ✅ Controles de mute/unmute
echo   ✅ Interfaz médica profesional
echo   ✅ Integración Next.js completa
echo   ✅ FastAPI + WebSocket backend
echo.

echo 📱 Para detener el sistema:
echo   - Presiona Ctrl+C en esta ventana
echo   - Cierra las pestañas del navegador
echo.

REM Limpiar archivo temporal
if exist temp_demo_call.json del temp_demo_call.json

echo Presiona cualquier tecla para detener el servidor...
pause >nul

echo.
echo 🛑 Deteniendo servidor WebRTC...
taskkill /IM python.exe /F >nul 2>&1

echo ✅ Sistema detenido correctamente
pause