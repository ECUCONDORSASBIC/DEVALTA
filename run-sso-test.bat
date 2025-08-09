@echo off
echo ========================================
echo  EJECUTANDO TEST SSO CON PLAYWRIGHT
echo ========================================
echo.

cd C:\Users\Eduardo\Documents\devaltamedica

echo Verificando servicios necesarios...
echo.
echo [INFO] Asegurate de que estos servicios esten corriendo:
echo   - web-app (puerto 3000)
echo   - api-server (puerto 3001)  
echo   - patients-app (puerto 3003)
echo   - doctors-app (puerto 3002)
echo.

timeout /t 3 /nobreak > nul

echo Ejecutando test SSO...
echo.

npx playwright test --config=playwright.config.sso.js --reporter=list

echo.
echo ========================================
echo  TEST COMPLETADO
echo ========================================
echo.
echo Para ver el reporte HTML ejecuta:
echo   npx playwright show-report playwright-report-sso
echo.

pause