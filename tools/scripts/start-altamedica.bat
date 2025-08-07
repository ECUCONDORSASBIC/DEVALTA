@echo off
echo ===================================================
echo     INICIANDO ALTAMEDICA CON SOLUCION SSO
echo ===================================================
echo.

REM Configurar variables de entorno
set NEXT_PUBLIC_USE_PROXY=false

echo [1/3] Iniciando API Server (Puerto 3001)...
start cmd /k "cd apps\api-server && npm run dev"

timeout /t 5 /nobreak > nul

echo [2/3] Iniciando Signaling Server (Puerto 8888)...
start cmd /k "cd apps\signaling-server && npm run dev"

timeout /t 3 /nobreak > nul

echo [3/3] Iniciando Web App (Puerto 3000)...
start cmd /k "cd apps\web-app && npm run dev"

timeout /t 3 /nobreak > nul

echo [4/4] Iniciando Patients App (Puerto 3003)...
start cmd /k "cd apps\patients && npm run dev"

echo.
echo ===================================================
echo     TODAS LAS APLICACIONES INICIADAS
echo ===================================================
echo.
echo URLs disponibles:
echo - Web App (Login): http://localhost:3000/login
echo - API Server: http://localhost:3001
echo - Patients App: http://localhost:3003
echo - Signaling Server: http://localhost:8888
echo.
echo INSTRUCCIONES PARA PROBAR:
echo 1. Ve a http://localhost:3000/login
echo 2. Usa las credenciales: eeecucondor@gmail.com / test123
echo 3. Deberas ser redirigido a http://localhost:3003
echo.
echo NOTA: Las cookies SSO ahora se establecen correctamente
echo mediante la llamada al API server tras el login.
echo.
pause