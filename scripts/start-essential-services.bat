@echo off
echo.
echo ====================================
echo   INICIANDO SERVICIOS ESENCIALES
echo ====================================
echo.

echo [1/3] Iniciando API Server (Puerto 3001)...
start cmd /k "cd apps\api-server && npm run dev"

timeout /t 5

echo [2/3] Iniciando Web App (Puerto 3000)...  
start cmd /k "cd apps\web-app && npm run dev"

timeout /t 5

echo [3/3] Iniciando Patients App (Puerto 3003)...
start cmd /k "cd apps\patients && npm run dev"

echo.
echo ====================================
echo ✅ SERVICIOS INICIADOS
echo ====================================
echo.
echo Espera 10-15 segundos para que todo cargue
echo.
echo URLs:
echo - Login: http://localhost:3000/login
echo - API: http://localhost:3001/api/health
echo - Patients: http://localhost:3003
echo.
echo Credenciales:
echo - Email: eeecucondor@gmail.com
echo - Password: Ab.123456
echo.
pause