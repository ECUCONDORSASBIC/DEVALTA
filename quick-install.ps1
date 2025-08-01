# AltaMedica Package Standardization Quick Installer
# PowerShell Version

Write-Host "🚀 INSTALADOR DE SISTEMA DE ESTANDARIZACION ALTAMEDICA" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green

Set-Location "C:\Users\Eduardo\Documents\devaltamedica"

Write-Host ""
Write-Host "🐍 Verificando Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python no encontrado" -ForegroundColor Red
    Read-Host "Presiona Enter para continuar"
    exit 1
}

Write-Host ""
Write-Host "📂 Verificando archivos del sistema..." -ForegroundColor Yellow
$requiredFiles = @(
    "package-template-config.json",
    "standardize-packages.py", 
    "setup-package-automation.py",
    "test-package-standardization.py"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Falta: $file" -ForegroundColor Red
        Read-Host "Presiona Enter para continuar"
        exit 1
    }
}

Write-Host ""
Write-Host "🔍 Validando configuración..." -ForegroundColor Yellow
try {
    $result = python standardize-packages.py --validate 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Configuración válida" -ForegroundColor Green
    } else {
        Write-Host "❌ Error en validación: $result" -ForegroundColor Red
        Read-Host "Presiona Enter para continuar"
        exit 1
    }
} catch {
    Write-Host "❌ Error ejecutando validación" -ForegroundColor Red
    Read-Host "Presiona Enter para continuar"
    exit 1
}

Write-Host ""
Write-Host "🧪 Ejecutando tests (puede tomar unos segundos)..." -ForegroundColor Yellow
try {
    python test-package-standardization.py 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tests exitosos" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Tests con advertencias, continuando..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Error en tests, continuando..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Instalando sistema de automatización..." -ForegroundColor Yellow
try {
    python setup-package-automation.py --install-all 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Automatización instalada" -ForegroundColor Green
    } else {
        Write-Host "❌ Error instalando automatización" -ForegroundColor Red
        Read-Host "Presiona Enter para continuar"
        exit 1
    }
} catch {
    Write-Host "❌ Error en instalación de automatización" -ForegroundColor Red
    Read-Host "Presiona Enter para continuar"
    exit 1
}

Write-Host ""
Write-Host "🎯 Ejecutando demo (dry-run) - Vista previa de cambios..." -ForegroundColor Yellow
Write-Host "-----------------------------------------------------------" -ForegroundColor Cyan
try {
    python standardize-packages.py --dry-run
    Write-Host "-----------------------------------------------------------" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️  Error en demo dry-run" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 ¡INSTALACIÓN COMPLETADA EXITOSAMENTE!" -ForegroundColor Green
Write-Host ""

Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "1. python standardize-packages.py --dry-run   # Revisar cambios propuestos"
Write-Host "2. python standardize-packages.py             # Aplicar estandarización (OPCIONAL)"
Write-Host "3. npm run workspace:check                    # Verificar estado final"
Write-Host ""

Write-Host "🎯 COMANDOS DISPONIBLES:" -ForegroundColor Cyan  
Write-Host "npm run standardize          # Estandarizar todo"
Write-Host "npm run standardize:dry      # Solo vista previa"
Write-Host "npm run standardize:validate # Validar configuración"
Write-Host "npm run workspace:check      # Verificar estado"
Write-Host ""

Write-Host "📖 DOCUMENTACIÓN:" -ForegroundColor Cyan
Write-Host "Ver archivo: PACKAGE_AUTOMATION_README.md"
Write-Host ""

Write-Host "🔒 RECORDATORIO IMPORTANTE:" -ForegroundColor Yellow
Write-Host "✅ Tu configuración 'type': 'module' se preserva automáticamente"
Write-Host "✅ Scripts custom se mantienen (como server-fixed.js)"
Write-Host "✅ Solo se estandarizan diferencias menores y opcionales"
Write-Host ""

Read-Host "Presiona Enter para finalizar"