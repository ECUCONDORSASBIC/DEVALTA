@echo off
echo 🧪 Probando sistema Altamedica...
cd /d "C:\Users\Eduardo\Documents\devaltamedica"
echo.
echo 📊 Test 1: CLI básico
node altamedica-cli.js version
echo.
echo 📊 Test 2: Bridge multi-entorno  
node altamedica-bridge.js env
echo.
echo ✅ Tests completados
pause
