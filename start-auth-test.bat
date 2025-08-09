@echo off
echo.
echo ============================================
echo   INICIANDO SERVIDORES PARA TEST DE AUTH
echo ============================================
echo.

echo [1/4] Iniciando Web App (Puerto 3000)...
start cmd /k "cd /d C:\Users\Eduardo\Documents\devaltamedica && pnpm --filter web-app dev"
timeout /t 3 >nul

echo [2/4] Iniciando Patients App (Puerto 3003)...
start cmd /k "cd /d C:\Users\Eduardo\Documents\devaltamedica && pnpm --filter patients dev"
timeout /t 3 >nul

echo [3/4] Iniciando Doctors App (Puerto 3002)...
start cmd /k "cd /d C:\Users\Eduardo\Documents\devaltamedica && pnpm --filter doctors dev"
timeout /t 3 >nul

echo [4/4] Iniciando Companies App (Puerto 3004)...
start cmd /k "cd /d C:\Users\Eduardo\Documents\devaltamedica && pnpm --filter companies dev"
timeout /t 3 >nul

echo.
echo ============================================
echo   SERVIDORES INICIADOS
echo ============================================
echo.
echo API Server: http://localhost:3008 (ya corriendo)
echo Web App:    http://localhost:3000
echo Patients:   http://localhost:3003
echo Doctors:    http://localhost:3002
echo Companies:  http://localhost:3004
echo.
echo CREDENCIALES DE PRUEBA:
echo ------------------------
echo PATIENT:  paciente@test.com / 12345678
echo DOCTOR:   doctor@test.com / 12345678
echo COMPANY:  empresa@test.com / 12345678
echo ADMIN:    admin@test.com / 12345678
echo.
echo Esperando 10 segundos para que los servidores inicien...
timeout /t 10

echo.
echo Listo para ejecutar pruebas de autenticacion!
echo.