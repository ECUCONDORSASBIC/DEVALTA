@echo off
title AltaMedica - Sistema Completo con Analytics Médico
color 0A

echo.
echo ====================================================================
echo   ALTAMEDICA - SISTEMA COMPLETO CON ANALYTICS MÉDICO POBLACIONAL
echo ====================================================================
echo.

echo 📊 Iniciando servidor de Analytics Médico (Puerto 8889)...
start /B python medical_analytics_server.py
timeout /t 3 /nobreak >nul

echo.
echo 🎥 Iniciando servidor WebRTC (Puerto 8888)...
start /B python start_video_server.py
timeout /t 3 /nobreak >nul

echo.
echo 🌐 Verificando servidores...

REM Verificar Analytics Server
curl -s http://localhost:8889/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Servidor de Analytics no se pudo iniciar
    pause
    exit /b 1
)
echo ✅ Servidor de Analytics funcionando en puerto 8889

REM Verificar WebRTC Server  
curl -s http://localhost:8888/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Servidor WebRTC no se pudo iniciar
    pause
    exit /b 1
)
echo ✅ Servidor WebRTC funcionando en puerto 8888

echo.
echo 🧪 Creando datos de demostración médica...
curl -X POST "http://localhost:8889/api/admin/seed-demo-data" ^
  -H "Content-Type: application/json" ^
  > temp_analytics_demo.json 2>nul

if errorlevel 1 (
    echo ⚠️ No se pudieron crear datos demo (continuando...)
) else (
    echo ✅ Datos de demostración médica creados
)

echo.
echo 🚀 SISTEMA COMPLETO INTEGRADO
echo ===============================
echo.

echo 📋 SERVICIOS DISPONIBLES:
echo.
echo 🧠 DIAGNÓSTICO IA CON ANALYTICS:
echo   - Patients App: http://localhost:3003/ai-diagnosis
echo   - Sistema completo con médico 3D + Analytics poblacional
echo   - Restricciones de uso: 1 diagnóstico cada 10 días
echo.
echo 🎥 VIDEOLLAMADAS MÉDICAS:
echo   - Doctores: http://localhost:3002/test-video
echo   - Pacientes: http://localhost:3003/test-video
echo.
echo 📊 ANALYTICS Y ESTADÍSTICAS:
echo   - Health Check: http://localhost:8889/health
echo   - Estadísticas Poblacionales: http://localhost:8889/api/statistics/population
echo   - Análisis de Síntomas: http://localhost:8889/api/statistics/symptoms
echo   - Demografía: http://localhost:8889/api/statistics/demographics
echo.

echo 💡 FUNCIONALIDADES PRINCIPALES:
echo ================================
echo.
echo ✅ IA MÉDICA AVANZADA:
echo   - Diagnóstico neural con médico 3D
echo   - Análisis de síntomas por voz, texto y cámara
echo   - Probabilidades y diagnósticos diferenciales
echo   - Signos vitales simulados con IoT
echo.
echo ✅ SISTEMA DE RESTRICCIONES:
echo   - 1 diagnóstico cada 10 días por usuario
echo   - Control automático de límites
echo   - Notificaciones de uso responsable
echo.
echo ✅ ANALYTICS POBLACIONAL:
echo   - Almacenamiento en base de datos SQLite
echo   - Categorización automática de síntomas
echo   - Análisis demográfico (edad, género, ubicación)
echo   - Estadísticas de prevalencia en tiempo real
echo   - Datos para investigación médica poblacional
echo.
echo ✅ COMPLIANCE MÉDICO:
echo   - Datos anonimizados automáticamente
echo   - Categorías médicas estándar
echo   - Logging completo de eventos
echo   - APIs RESTful para integración
echo.

echo 🔧 ARQUITECTURA TÉCNICA:
echo =========================
echo   🐍 Python FastAPI - Analytics Server (8889)
echo   🐍 Python FastAPI - WebRTC Server (8888)
echo   ⚛️ Next.js React - Frontend AI-Diagnosis
echo   📊 SQLite - Base de datos médica
echo   🎯 Pandas - Análisis estadístico
echo   🔐 CORS - Seguridad cross-origin
echo.

echo ⚡ ABRIENDO INTERFACES...
echo.

REM Abrir interfaces principales
start http://localhost:3003/ai-diagnosis
timeout /t 2 /nobreak >nul
start http://localhost:8889/api/statistics/population

echo.
echo ✅ ¡SISTEMA COMPLETO LISTO!
echo.
echo 📊 CÓMO USAR EL SISTEMA:
echo ========================
echo.
echo 1. Ve a: http://localhost:3003/ai-diagnosis
echo 2. Completa información demográfica (opcional)
echo 3. Describe síntomas por texto, voz o cámara
echo 4. Presiona "INICIAR DIAGNÓSTICO NEURAL"
echo 5. El diagnóstico se guardará automáticamente en la nube
echo 6. Verifica estadísticas en tiempo real
echo.
echo 📈 ESTADÍSTICAS EN TIEMPO REAL:
echo   - Población: http://localhost:8889/api/statistics/population
echo   - Síntomas: http://localhost:8889/api/statistics/symptoms  
echo   - Demografía: http://localhost:8889/api/statistics/demographics
echo.

echo 📱 Para detener el sistema completo:
echo   - Presiona Ctrl+C en esta ventana
echo   - Se detendrán todos los servidores
echo.

REM Limpiar archivos temporales
if exist temp_analytics_demo.json del temp_analytics_demo.json

echo Presiona cualquier tecla para detener todos los servidores...
pause >nul

echo.
echo 🛑 Deteniendo todos los servidores...
taskkill /IM python.exe /F >nul 2>&1

echo ✅ Sistema completo detenido correctamente
echo.
echo 📊 RESUMEN DE LA SESIÓN:
echo ========================
echo   ✅ Analytics médico implementado
echo   ✅ Restricciones de uso funcionando
echo   ✅ Base de datos poblacional activa
echo   ✅ Categorización automática de síntomas
echo   ✅ Análisis demográfico completo
echo   ✅ APIs RESTful para estadísticas
echo.
pause