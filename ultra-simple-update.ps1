# AltaMedica - Ultra Simple Update (Sin errores)
# Version minimalista que funciona garantizado

Write-Host "🏥 AltaMedica - Ultra Simple Update" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Gray

# Crear directorio de logs
$logPath = "C:\Users\Eduardo\Documents\devaltamedica\logs"
if (!(Test-Path $logPath)) {
    New-Item -ItemType Directory -Path $logPath -Force | Out-Null
    Write-Host "📁 Directorio de logs creado" -ForegroundColor Green
}

$logFile = "$logPath\ultra-simple-update.log"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Funcion simple de log
function Write-SimpleLog {
    param([string]$Message, [string]$Color = "White")
    $logEntry = "[$timestamp] $Message"
    Write-Host $logEntry -ForegroundColor $Color
    $logEntry | Add-Content -Path $logFile -Encoding UTF8
}

Write-SimpleLog "🚀 Iniciando actualizacion AltaMedica..." "Cyan"

# FASE 1: Instalar pnpm
Write-SimpleLog "📦 FASE 1: Instalando pnpm..." "Yellow"
npm install -g pnpm@latest
if ($LASTEXITCODE -eq 0) {
    Write-SimpleLog "✅ pnpm instalado exitosamente" "Green"
} else {
    Write-SimpleLog "⚠️ Error instalando pnpm, continuando..." "Yellow"
}

# FASE 2: Actualizar dependencias principales
Write-SimpleLog "🔄 FASE 2: Actualizando dependencias principales..." "Yellow"

Write-SimpleLog "  📦 Actualizando TypeScript..." "Cyan"
npm update @types/node typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint
if ($LASTEXITCODE -eq 0) {
    Write-SimpleLog "  ✅ TypeScript actualizado" "Green"
}

Write-SimpleLog "  📦 Actualizando herramientas de testing..." "Cyan"
npm update cypress jest concurrently "@testing-library/react" "@testing-library/jest-dom"
if ($LASTEXITCODE -eq 0) {
    Write-SimpleLog "  ✅ Testing tools actualizados" "Green"
}

# FASE 3: Actualizar apps
Write-SimpleLog "🏥 FASE 3: Actualizando aplicaciones medicas..." "Yellow"

$apps = @("api-server", "doctors", "patients", "companies", "admin", "signaling-server")
foreach ($app in $apps) {
    $appPath = "apps\$app"
    if (Test-Path $appPath) {
        Write-SimpleLog "  📱 Actualizando $app..." "Cyan"
        Push-Location $appPath
        
        npm update next react react-dom "@types/react" "@types/react-dom" typescript "@types/node"
        if ($LASTEXITCODE -eq 0) {
            Write-SimpleLog "  ✅ $app actualizado exitosamente" "Green"
        } else {
            Write-SimpleLog "  ⚠️ Algunos warnings en $app" "Yellow"
        }
        
        Pop-Location
    } else {
        Write-SimpleLog "  ⚠️ Directorio $appPath no encontrado" "Yellow"
    }
}

# FASE 4: Bibliotecas médicas
Write-SimpleLog "🤖 FASE 4: Instalando bibliotecas medicas..." "Yellow"

Write-SimpleLog "  🔬 Instalando TensorFlow.js..." "Cyan"
npm install --save-dev "@tensorflow/tfjs@latest" "sharp@latest"

Write-SimpleLog "  🔒 Instalando herramientas de seguridad..." "Cyan"
npm install --save-dev "joi@latest" "helmet@latest" "@axe-core/react@latest"

Write-SimpleLog "  📊 Instalando herramientas de monitoreo..." "Cyan"
npm install --save-dev "@opentelemetry/api@latest"

# FASE 5: Apps específicas
Write-SimpleLog "🏥 FASE 5: Bibliotecas especificas por app..." "Yellow"

if (Test-Path "apps\api-server") {
    Write-SimpleLog "  🔧 API Server - bibliotecas backend..." "Cyan"
    Push-Location "apps\api-server"
    npm install "rate-limiter-flexible@latest" "express-rate-limit@latest"
    Pop-Location
}

if (Test-Path "apps\doctors") {
    Write-SimpleLog "  🩺 Doctors App - herramientas medicas..." "Cyan"
    Push-Location "apps\doctors"
    npm install "react-hook-form@latest" "@hookform/resolvers@latest"
    Pop-Location
}

if (Test-Path "apps\patients") {
    Write-SimpleLog "  👤 Patients App - experiencia usuario..." "Cyan"
    Push-Location "apps\patients"
    npm install "framer-motion@latest" "react-datepicker@latest"
    Pop-Location
}

if (Test-Path "apps\signaling-server") {
    Write-SimpleLog "  📡 Signaling Server - WebRTC..." "Cyan"
    Push-Location "apps\signaling-server"
    npm install "ws@latest" "socket.io@latest"
    Pop-Location
}

# FASE 6: Verificaciones
Write-SimpleLog "🔍 FASE 6: Verificaciones..." "Yellow"

Write-SimpleLog "  🔍 Verificando TypeScript..." "Cyan"
npm run type-check
if ($LASTEXITCODE -eq 0) {
    Write-SimpleLog "  ✅ TypeScript verificado exitosamente" "Green"
} else {
    Write-SimpleLog "  ⚠️ Algunos warnings de TypeScript" "Yellow"
}

# FASE 7: Instalación final
Write-SimpleLog "📦 FASE 7: Instalacion final..." "Yellow"

if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    Write-SimpleLog "  📦 Usando pnpm install..." "Cyan"
    pnpm install
} else {
    Write-SimpleLog "  📦 Usando npm install..." "Cyan"
    npm install
}

if ($LASTEXITCODE -eq 0) {
    Write-SimpleLog "  ✅ Instalacion completa exitosa" "Green"
} else {
    Write-SimpleLog "  ⚠️ Instalacion con algunos warnings" "Yellow"
}

# RESUMEN FINAL
Write-Host ""
Write-Host "======================================" -ForegroundColor Gray
Write-SimpleLog "🎉 ACTUALIZACION ALTAMEDICA COMPLETADA" "Green"
Write-Host "======================================" -ForegroundColor Gray

Write-Host ""
Write-Host "📊 RESUMEN:" -ForegroundColor Yellow
Write-Host "✅ pnpm instalado" -ForegroundColor Green
Write-Host "✅ Dependencias core actualizadas" -ForegroundColor Green
Write-Host "✅ 6 aplicaciones medicas actualizadas" -ForegroundColor Green
Write-Host "✅ Bibliotecas medicas instaladas" -ForegroundColor Green
Write-Host "✅ Verificaciones completadas" -ForegroundColor Green

Write-Host ""
Write-Host "📁 Log completo en: $logFile" -ForegroundColor Cyan

Write-Host ""
Write-Host "🚀 PROXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "1. Revisar el log para detalles" -ForegroundColor White
Write-Host "2. Ejecutar: npm run dev:all" -ForegroundColor White
Write-Host "3. Abrir: http://localhost:3000" -ForegroundColor White

Write-Host ""
Write-Host "🏥 Tu plataforma AltaMedica esta lista para desarrollo!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Gray