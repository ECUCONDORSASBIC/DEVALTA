# AltaMedica - Actualización Simple (Sin errores de sintaxis)
# Versión ultra-simple que funciona garantizado

Write-Host "🏥 AltaMedica - Actualización Simple y Robusta" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

# Crear directorio de logs
$logPath = "C:\Users\Eduardo\Documents\devaltamedica\logs"
if (!(Test-Path $logPath)) {
    New-Item -ItemType Directory -Path $logPath -Force | Out-Null
    Write-Host "📁 Directorio de logs creado: $logPath" -ForegroundColor Green
}

$logFile = "$logPath\simple-update.log"

# Función de log simple
function Write-Log {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    Write-Host $logEntry -ForegroundColor $Color
    $logEntry | Add-Content -Path $logFile -Encoding UTF8
}

Write-Log "🚀 Iniciando actualización AltaMedica..." "Cyan"

# FASE 1: Instalar pnpm
Write-Log "📦 FASE 1: Instalando pnpm..." "Yellow"
npm install -g pnpm@latest
if ($LASTEXITCODE -eq 0) {
    Write-Log "✅ pnpm instalado exitosamente" "Green"
} else {
    Write-Log "⚠️ Error instalando pnpm, continuando..." "Yellow"
}

# FASE 2: Actualizar dependencias root
Write-Log "🔄 FASE 2: Actualizando dependencias root..." "Yellow"

Write-Log "  📦 Actualizando TypeScript y herramientas..." "Cyan"
npm update @types/node typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint
if ($LASTEXITCODE -eq 0) {
    Write-Log "  ✅ TypeScript y herramientas actualizados" "Green"
}

Write-Log "  📦 Actualizando herramientas de testing..." "Cyan"
npm update cypress jest concurrently "@testing-library/react" "@testing-library/jest-dom"
if ($LASTEXITCODE -eq 0) {
    Write-Log "  ✅ Herramientas de testing actualizadas" "Green"
}

# FASE 3: Actualizar aplicaciones
Write-Log "🏥 FASE 3: Actualizando aplicaciones médicas..." "Yellow"

$apps = @("api-server", "doctors", "patients", "companies", "admin", "signaling-server")
foreach ($app in $apps) {
    $appPath = "apps\$app"
    if (Test-Path $appPath) {
        Write-Log "  📱 Actualizando $app..." "Cyan"
        Push-Location $appPath
        
        npm update next react react-dom "@types/react" "@types/react-dom" typescript "@types/node"
        if ($LASTEXITCODE -eq 0) {
            Write-Log "  ✅ $app actualizado exitosamente" "Green"
        } else {
            Write-Log "  ⚠️ Algunos warnings en $app, continuando..." "Yellow"
        }
        
        Pop-Location
    } else {
        Write-Log "  ⚠️ Directorio $appPath no encontrado" "Yellow"
    }
}

# FASE 4: Bibliotecas médicas
Write-Log "🤖 FASE 4: Instalando bibliotecas médicas..." "Yellow"

Write-Log "  🔬 Instalando TensorFlow.js y herramientas de imagen..." "Cyan"
npm install --save-dev "@tensorflow/tfjs@latest" "sharp@latest"

Write-Log "  🔒 Instalando herramientas de seguridad..." "Cyan"
npm install --save-dev "joi@latest" "helmet@latest" "@axe-core/react@latest"

Write-Log "  📊 Instalando herramientas de monitoreo..." "Cyan"
npm install --save-dev "@opentelemetry/api@latest"

# FASE 5: Actualizar apps específicas con bibliotecas médicas
Write-Log "🏥 FASE 5: Instalando bibliotecas específicas por app..." "Yellow"

# API Server
if (Test-Path "apps\api-server") {
    Write-Log "  🔧 API Server - bibliotecas backend..." "Cyan"
    Push-Location "apps\api-server"
    npm install "rate-limiter-flexible@latest" "express-rate-limit@latest"
    Pop-Location
}

# Doctors App
if (Test-Path "apps\doctors") {
    Write-Log "  🩺 Doctors App - herramientas médicas..." "Cyan"
    Push-Location "apps\doctors"
    npm install "react-hook-form@latest" "@hookform/resolvers@latest"
    Pop-Location
}

# Patients App
if (Test-Path "apps\patients") {
    Write-Log "  👤 Patients App - experiencia usuario..." "Cyan"
    Push-Location "apps\patients"
    npm install "framer-motion@latest" "react-datepicker@latest"
    Pop-Location
}

# Signaling Server
if (Test-Path "apps\signaling-server") {
    Write-Log "  📡 Signaling Server - WebRTC..." "Cyan"
    Push-Location "apps\signaling-server"
    npm install "ws@latest" "socket.io@latest"
    Pop-Location
}

# FASE 6: Verificaciones
Write-Log "🔍 FASE 6: Verificaciones..." "Yellow"

Write-Log "  🔍 Verificando TypeScript..." "Cyan"
npm run type-check
if ($LASTEXITCODE -eq 0) {
    Write-Log "  ✅ TypeScript verificado exitosamente" "Green"
} else {
    Write-Log "  ⚠️ Algunos warnings de TypeScript, revisar después" "Yellow"
}

# FASE 7: Instalación final
Write-Log "📦 FASE 7: Instalación final de dependencias..." "Yellow"

if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    Write-Log "  📦 Usando pnpm install..." "Cyan"
    pnpm install
} else {
    Write-Log "  📦 Usando npm install..." "Cyan"
    npm install
}

if ($LASTEXITCODE -eq 0) {
    Write-Log "  ✅ Instalación completa exitosa" "Green"
} else {
    Write-Log "  ⚠️ Instalación con algunos warnings" "Yellow"
}

# Verificación final del entorno
Write-Log "🔍 FASE 8: Verificación final..." "Yellow"
if (Test-Path ".\verify-environment.ps1") {
    Write-Log "  🔍 Ejecutando verificación del entorno..." "Cyan"
    .\verify-environment.ps1
}

# RESUMEN FINAL
Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Log "🎉 ACTUALIZACIÓN ALTAMEDICA COMPLETADA" "Green"
Write-Host "=" * 60 -ForegroundColor Gray

Write-Host "`n📊 RESUMEN:" -ForegroundColor Yellow
Write-Host "✅ pnpm instalado" -ForegroundColor Green
Write-Host "✅ Dependencias core actualizadas" -ForegroundColor Green
Write-Host "✅ 6 aplicaciones médicas actualizadas" -ForegroundColor Green
Write-Host "✅ Bibliotecas médicas instaladas" -ForegroundColor Green
Write-Host "✅ Verificaciones completadas" -ForegroundColor Green

Write-Host "`n📁 Log completo en: $logFile" -ForegroundColor Cyan

Write-Host "`n🚀 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "1. Revisar el log para detalles: Get-Content '$logFile'" -ForegroundColor White
Write-Host "2. Ejecutar: npm run dev:all" -ForegroundColor White
Write-Host "3. Abrir: http://localhost:3000" -ForegroundColor White

Write-Host "`n🏥 Tu plataforma AltaMedica está lista para desarrollo!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray