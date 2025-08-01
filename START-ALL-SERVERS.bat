@echo off
echo ============================================
echo  AltaMedica - Iniciando Todos los Servidores
echo  Cada servidor se abrira en su propia terminal
echo ============================================
echo.
echo Iniciando servidores en orden de prioridad...
echo.

REM Servidores criticos primero
echo [1/7] Iniciando Web App Gateway (Puerto 3000)...
start "" "%~dp0start-web-app.bat"
timeout /t 3 /nobreak >nul

echo [2/7] Iniciando API Server (Puerto 3001)...
start "" "%~dp0start-api-server.bat"
timeout /t 3 /nobreak >nul

echo [3/7] Iniciando Signaling Server WebRTC (Puerto 8888)...
start "" "%~dp0start-signaling-server.bat"
timeout /t 2 /nobreak >nul

REM Apps especificas por rol
echo [4/7] Iniciando Doctors App (Puerto 3003)...
start "" "%~dp0start-doctors-app.bat"
timeout /t 2 /nobreak >nul

echo [5/7] Iniciando Patients App (Puerto 3002)...
start "" "%~dp0start-patients-app.bat"
timeout /t 2 /nobreak >nul

echo [6/7] Iniciando Companies App (Puerto 3004)...
start "" "%~dp0start-companies-app.bat"
timeout /t 2 /nobreak >nul

echo [7/7] Iniciando Admin App (Puerto 3006)...
start "" "%~dp0start-admin-app.bat"

echo.
echo ============================================
echo  Todos los servidores iniciados!
echo ============================================
echo.
echo Puertos configurados:
echo  - Web App Gateway: http://localhost:3000 (CRITICO)
echo  - API Server:      http://localhost:3001 (CRITICO)
echo  - Patients App:    http://localhost:3002
echo  - Doctors App:     http://localhost:3003
echo  - Companies App:   http://localhost:3004
echo  - Admin App:       http://localhost:3006
echo  - Signaling WebRTC: ws://localhost:8888
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul