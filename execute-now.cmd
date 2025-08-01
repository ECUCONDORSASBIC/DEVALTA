@echo off
REM AltaMedica - Ejecutor CMD (Alternativa final cuando bash falla)
echo 🏥 AltaMedica - Ejecutor CMD Robusto
echo ============================================================

cd /d "C:\Users\Eduardo\Documents\devaltamedica"
echo ✅ Directorio cambiado a: %CD%

echo.
echo 🚀 Intentando ejecutar con Node.js...
node launcher.js
if %ERRORLEVEL% EQU 0 (
    echo ✅ Ejecución con Node.js exitosa!
    goto :success
)

echo.
echo ⚠️ Node.js falló, intentando con PowerShell directo...
powershell.exe -ExecutionPolicy Bypass -File "autonomous-update-monitor.ps1"
if %ERRORLEVEL% EQU 0 (
    echo ✅ Ejecución con PowerShell exitosa!
    goto :success
)

echo.
echo ⚠️ PowerShell falló, intentando con Python...
python launcher.py
if %ERRORLEVEL% EQU 0 (
    echo ✅ Ejecución con Python exitosa!
    goto :success
)

echo.
echo ❌ Todas las alternativas fallaron
echo 💡 Ejecutar manualmente: powershell -ExecutionPolicy Bypass -File autonomous-update-monitor.ps1
goto :end

:success
echo.
echo 🎉 ACTUALIZACIÓN ALTAMEDICA COMPLETADA!
echo 📊 Revisa los logs en el directorio logs/
echo 🚀 Próximo paso: npm run dev:all

:end
pause