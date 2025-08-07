@echo off
echo 🎬 AltaMedica Video Demo Generator
echo ===================================

echo 📋 Verificando servicios...
curl -s http://localhost:3003/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Patients app no está ejecutándose en puerto 3003
    echo    Ejecuta: pnpm --filter patients dev
    pause
    exit /b 1
)

curl -s http://localhost:3002/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Doctors app no está ejecutándose en puerto 3002
    echo    Ejecuta: pnpm --filter doctors dev
    pause
    exit /b 1
)

echo ✅ Servicios verificados

echo 🚀 Iniciando generador de video...
python tools/python/video_demo_generator.py

pause
