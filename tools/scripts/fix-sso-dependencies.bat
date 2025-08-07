@echo off
echo [94m🔧 Arreglando dependencias del SSO...[0m
echo.

cd C:\Users\Eduardo\Documents\devaltamedica

echo [93m📦 Instalando dependencias en @altamedica/shared...[0m
cd packages\shared
call npm install

cd ..\..

echo.
echo [93m📦 Instalando dependencias del workspace...[0m
call npm install

echo.
echo [93m🏗️ Construyendo paquetes...[0m
call npm run build:packages

echo.
echo [92m✅ Dependencias del SSO instaladas correctamente![0m
echo.
echo [96mAhora puedes reiniciar las aplicaciones para que tomen los cambios.[0m
pause