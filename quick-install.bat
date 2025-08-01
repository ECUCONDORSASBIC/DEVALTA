@echo off
echo 🚀 INSTALADOR DE SISTEMA DE ESTANDARIZACION ALTAMEDICA
echo ======================================================

cd /d "C:\Users\Eduardo\Documents\devaltamedica"

echo.
echo 🐍 Verificando Python...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python no encontrado
    pause
    exit /b 1
)

echo.
echo 🔍 Validando configuración...
python standardize-packages.py --validate
if %errorlevel% neq 0 (
    echo ❌ Error en validación
    pause
    exit /b 1
)

echo.
echo 🧪 Ejecutando tests...
python test-package-standardization.py
if %errorlevel% neq 0 (
    echo ⚠️  Tests con advertencias, continuando...
)

echo.
echo 🔧 Instalando automatización...
python setup-package-automation.py --install-all
if %errorlevel% neq 0 (
    echo ❌ Error instalando automatización
    pause
    exit /b 1
)

echo.
echo 🎯 Ejecutando demo (dry-run)...
python standardize-packages.py --dry-run

echo.
echo ✅ INSTALACIÓN COMPLETADA!
echo.
echo 📋 PRÓXIMOS PASOS:
echo 1. python standardize-packages.py --dry-run   (revisar cambios)
echo 2. python standardize-packages.py             (aplicar opcional)
echo 3. npm run workspace:check                    (verificar estado)
echo.
echo 📖 Ver: PACKAGE_AUTOMATION_README.md
echo.
pause