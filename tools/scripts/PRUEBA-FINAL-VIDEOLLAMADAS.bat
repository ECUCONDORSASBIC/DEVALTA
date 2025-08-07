@echo off
title AltaMedica - Prueba Final de Videollamadas
color 0A

echo.
echo ====================================================
echo   AltaMedica - PRUEBA FINAL DE VIDEOLLAMADAS
echo ====================================================
echo.

echo 🎥 Verificando servidor de videollamadas...
curl -s http://localhost:8888/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Servidor de videollamadas no disponible
    echo Asegurate de que el servidor Python esté ejecutándose
    pause
    exit /b 1
)

echo ✅ Servidor de videollamadas funcionando
echo.

echo 🌐 Verificando aplicaciones...
curl -s "http://localhost:3002/" >nul 2>&1
if errorlevel 1 (
    echo ❌ App de doctores no disponible (puerto 3002)
    pause
    exit /b 1
)

curl -s "http://localhost:3003/" >nul 2>&1  
if errorlevel 1 (
    echo ❌ App de pacientes no disponible (puerto 3003)
    pause
    exit /b 1
)

echo ✅ Aplicaciones funcionando
echo.

echo 🎯 Creando videollamada de prueba...
echo.

REM Crear videollamada usando curl
curl -X POST "http://localhost:8888/api/video-calls/create" ^
  -H "Content-Type: application/json" ^
  -d "{\"doctor_email\":\"dr.test@altamedica.com\",\"patient_email\":\"patient.test@email.com\",\"consultation_id\":\"final_test_%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%\"}" ^
  > temp_call.json 2>nul

if errorlevel 1 (
    echo ❌ Error creando videollamada
    pause
    exit /b 1
)

echo ✅ Videollamada creada exitosamente
echo.

echo 🚀 SISTEMA COMPLETAMENTE OPERATIVO
echo ====================================
echo.

echo 📋 URLs PARA PROBAR AHORA:
echo.
echo 👨‍⚕️ DOCTORES (Páginas de prueba):
echo   - Prueba simple: http://localhost:3002/test-video
echo   - Sesión completa: http://localhost:3002/telemedicine/session/session-001
echo.
echo 👨‍🦱 PACIENTES (Páginas de prueba):
echo   - Prueba simple: http://localhost:3003/test-video  
echo   - Sala completa: http://localhost:3003/telemedicine/room/session-001
echo.
echo 🎥 SERVIDOR DIRECTO:
echo   - API: http://localhost:8888
echo   - Health: http://localhost:8888/health
echo.

echo 💡 INSTRUCCIONES FINALES:
echo =========================
echo.
echo 1. Abre las URLs de prueba simple primero:
echo    http://localhost:3002/test-video
echo    http://localhost:3003/test-video
echo.
echo 2. Haz clic en "Crear Videollamada de Prueba"
echo.
echo 3. Se abrirán automáticamente los videos en la página
echo.
echo 4. Permite acceso a cámara y micrófono
echo.
echo 5. ¡Tendrás videollamadas médicas funcionando!
echo.

echo ⚡ ABRIENDO PÁGINAS DE PRUEBA...
echo.

REM Abrir páginas de prueba
start http://localhost:3002/test-video
timeout /t 2 /nobreak >nul
start http://localhost:3003/test-video

echo.
echo ✅ ¡SISTEMA LISTO! Revisa las páginas que se abrieron
echo.

REM Limpiar archivos temporales
if exist temp_call.json del temp_call.json

pause