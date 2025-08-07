# Script de PowerShell para instalar todas las herramientas de debugging
Write-Host "🔧 Instalando herramientas de debugging avanzadas..." -ForegroundColor Green

# 1. Instalar Playwright
Write-Host "📦 Instalando Playwright..." -ForegroundColor Yellow
npm install -D playwright
npx playwright install chromium

# 2. Instalar dependencias de Python
Write-Host "🐍 Instalando dependencias de Python..." -ForegroundColor Yellow
pip install selenium requests psutil

# 3. Descargar ChromeDriver si no existe
$chromeDriverPath = ".\chromedriver.exe"
if (-not (Test-Path $chromeDriverPath)) {
    Write-Host "🌐 Descargando ChromeDriver..." -ForegroundColor Yellow
    $chromeDriverUrl = "https://chromedriver.storage.googleapis.com/114.0.5735.90/chromedriver_win32.zip"
    Invoke-WebRequest -Uri $chromeDriverUrl -OutFile "chromedriver.zip"
    Expand-Archive -Path "chromedriver.zip" -DestinationPath "." -Force
    Remove-Item "chromedriver.zip"
}

# 4. Agregar Network Debugger a la app
Write-Host "🔍 Configurando Network Debugger..." -ForegroundColor Yellow
$loginPagePath = ".\apps\web-app\src\app\(auth)\login\page.tsx"
$networkDebuggerImport = "import NetworkDebugger from '@/utils/network-debugger';"

# Verificar si ya está importado
$loginPageContent = Get-Content $loginPagePath -Raw
if ($loginPageContent -notlike "*network-debugger*") {
    Write-Host "📝 Agregando Network Debugger al login page..." -ForegroundColor Yellow
    # Agregar import al inicio del archivo
    $newContent = $loginPageContent -replace "('use client')", "'use client'`n`nimport NetworkDebugger from '@/utils/network-debugger';"
    Set-Content -Path $loginPagePath -Value $newContent
}

# 5. Crear script de ejecución rápida
Write-Host "🚀 Creando scripts de ejecución..." -ForegroundColor Yellow

$quickDebugScript = @"
# Script de debugging rápido
Write-Host "🔍 Ejecutando debugging completo..." -ForegroundColor Green

# Opción 1: Playwright
Write-Host "1. Playwright (Automatización completa)" -ForegroundColor Yellow
Write-Host "   node debug-playwright.js" -ForegroundColor Cyan

# Opción 2: Python
Write-Host "2. Python (Análisis completo)" -ForegroundColor Yellow
Write-Host "   python debug-python.py" -ForegroundColor Cyan

# Opción 3: Manual con Network Debugger
Write-Host "3. Manual (Ve a localhost:3000/login y abre F12)" -ForegroundColor Yellow
Write-Host "   networkDebugger.exportLogs() en la consola" -ForegroundColor Cyan

Write-Host "`n¿Qué método prefieres?" -ForegroundColor Green
Write-Host "1 - Playwright (Recomendado)" -ForegroundColor White
Write-Host "2 - Python completo" -ForegroundColor White
Write-Host "3 - Manual" -ForegroundColor White

`$choice = Read-Host "Elige una opción (1-3)"

switch (`$choice) {
    "1" { 
        Write-Host "🎭 Ejecutando Playwright..." -ForegroundColor Green
        node debug-playwright.js 
    }
    "2" { 
        Write-Host "🐍 Ejecutando Python..." -ForegroundColor Green
        python debug-python.py 
    }
    "3" { 
        Write-Host "🌐 Abriendo localhost:3000/login..." -ForegroundColor Green
        Start-Process "http://localhost:3000/login"
        Write-Host "✅ Abre F12 y usa networkDebugger.exportLogs()" -ForegroundColor Yellow
    }
    default { 
        Write-Host "❌ Opción inválida" -ForegroundColor Red 
    }
}
"@

Set-Content -Path ".\quick-debug.ps1" -Value $quickDebugScript

Write-Host "`n✅ Herramientas de debugging instaladas!" -ForegroundColor Green
Write-Host "📝 Archivos creados:" -ForegroundColor Yellow
Write-Host "   - debug-playwright.js (Automatización)" -ForegroundColor Cyan
Write-Host "   - debug-python.py (Análisis completo)" -ForegroundColor Cyan
Write-Host "   - network-debugger.ts (Monitor en tiempo real)" -ForegroundColor Cyan
Write-Host "   - quick-debug.ps1 (Ejecución rápida)" -ForegroundColor Cyan

Write-Host "`n🚀 Para empezar:" -ForegroundColor Green
Write-Host "   .\quick-debug.ps1" -ForegroundColor White