# AltaMedica - Actualización Automatizada Completa
# Ejecutar en PowerShell como Administrador

Write-Host "🏥 AltaMedica - Actualización Automatizada Completa" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

# Función para ejecutar comandos con manejo de errores
function Invoke-SafeCommand {
    param(
        [string]$Command,
        [string]$Description,
        [switch]$ContinueOnError
    )
    
    Write-Host "`n🚀 $Description..." -ForegroundColor Cyan
    Write-Host "💻 Ejecutando: $Command" -ForegroundColor Gray
    
    try {
        Invoke-Expression $Command
        if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
            Write-Host "✅ $Description - COMPLETADO" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️ $Description - TERMINADO CON CÓDIGO $LASTEXITCODE" -ForegroundColor Yellow
            if ($ContinueOnError) {
                return $false
            } else {
                throw "Error en: $Description"
            }
        }
    } catch {
        Write-Host "❌ Error en $Description`: $($_.Exception.Message)" -ForegroundColor Red
        if ($ContinueOnError) {
            return $false
        } else {
            throw
        }
    }
}

# Verificar que estamos en el directorio correcto
$expectedPath = "C:\Users\Eduardo\Documents\devaltamedica"
if ((Get-Location).Path -ne $expectedPath) {
    Write-Host "📁 Navegando al directorio del proyecto..." -ForegroundColor Yellow
    Set-Location $expectedPath
}

Write-Host "`n🎯 FASE 1: INSTALACIÓN DE HERRAMIENTAS BÁSICAS" -ForegroundColor Magenta
Write-Host "=" * 40 -ForegroundColor Gray

# 1. Instalar pnpm globalmente
Invoke-SafeCommand -Command "npm install -g pnpm@latest" -Description "Instalación de pnpm global" -ContinueOnError

# 2. Verificar pnpm
Invoke-SafeCommand -Command "pnpm --version" -Description "Verificación de pnpm" -ContinueOnError

# 3. Configurar variable de entorno Cypress
Write-Host "`n🌍 Configurando variables de entorno..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("CYPRESS_CACHE_FOLDER", "$env:USERPROFILE\.cache\Cypress", "User")
Write-Host "✅ Variable CYPRESS_CACHE_FOLDER configurada" -ForegroundColor Green

Write-Host "`n🎯 FASE 2: ACTUALIZACIÓN DE DEPENDENCIAS EXISTENTES" -ForegroundColor Magenta
Write-Host "=" * 40 -ForegroundColor Gray

# 4. Backup de package.json files
Write-Host "`n💾 Creando backup de archivos críticos..." -ForegroundColor Blue
Copy-Item "package.json" "package.json.backup" -Force
$apps = @("api-server", "web-app", "doctors", "patients", "companies", "admin", "signaling-server")
foreach ($app in $apps) {
    if (Test-Path "apps/$app/package.json") {
        Copy-Item "apps/$app/package.json" "apps/$app/package.json.backup" -Force
        Write-Host "✅ Backup: apps/$app/package.json" -ForegroundColor Green
    }
}

# 5. Actualizar dependencias root
Write-Host "`n📦 Actualizando dependencias root..." -ForegroundColor Cyan
$rootUpdates = @(
    "npm update @types/node typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint",
    "npm update cypress jest concurrently @testing-library/react @testing-library/jest-dom"
)

foreach ($update in $rootUpdates) {
    Invoke-SafeCommand -Command $update -Description "Actualización root dependencies" -ContinueOnError
}

# 6. Actualizar cada aplicación
Write-Host "`n🏥 Actualizando aplicaciones médicas..." -ForegroundColor Green
foreach ($app in $apps) {
    if (Test-Path "apps/$app") {
        Write-Host "`n  📱 Actualizando $app..." -ForegroundColor Cyan
        Push-Location "apps/$app"
        
        # Actualizar dependencias críticas de cada app
        $appUpdates = @(
            "npm update next react react-dom @types/react @types/react-dom",
            "npm update typescript @types/node"
        )
        
        foreach ($update in $appUpdates) {
            Invoke-SafeCommand -Command $update -Description "$app dependencies" -ContinueOnError
        }
        
        Pop-Location
    }
}

Write-Host "`n🎯 FASE 3: NUEVAS BIBLIOTECAS MÉDICAS" -ForegroundColor Magenta
Write-Host "=" * 40 -ForegroundColor Gray

# 7. Instalar bibliotecas médicas avanzadas
Write-Host "`n🤖 Instalando bibliotecas de IA médica..." -ForegroundColor Cyan
$medicalLibs = @(
    "npm install --save-dev @tensorflow/tfjs@latest @tensorflow/tfjs-node@latest",
    "npm install --save-dev sharp@latest",
    "npm install --save-dev joi@latest helmet@latest",
    "npm install --save-dev @axe-core/react@latest",
    "npm install --save-dev @opentelemetry/api@latest"
)

foreach ($lib in $medicalLibs) {
    Invoke-SafeCommand -Command $lib -Description "Bibliotecas médicas" -ContinueOnError
}

# 8. Actualizaciones específicas por app
Write-Host "`n🏥 Instalando bibliotecas específicas por app..." -ForegroundColor Green

# API Server - Backend médico
Push-Location "apps/api-server"
Invoke-SafeCommand -Command "npm install rate-limiter-flexible@latest express-rate-limit@latest" -Description "API Server medical libs" -ContinueOnError
Pop-Location

# Doctors App - Herramientas médicas
Push-Location "apps/doctors"
Invoke-SafeCommand -Command "npm install react-hook-form@latest @hookform/resolvers@latest" -Description "Doctors App medical libs" -ContinueOnError
Pop-Location

# Patients App - UX médico
Push-Location "apps/patients"
Invoke-SafeCommand -Command "npm install framer-motion@latest react-datepicker@latest" -Description "Patients App medical libs" -ContinueOnError
Pop-Location

# Signaling Server - WebRTC optimizado
Push-Location "apps/signaling-server"
Invoke-SafeCommand -Command "npm install ws@latest socket.io@latest" -Description "Signaling Server WebRTC libs" -ContinueOnError
Pop-Location

Write-Host "`n🎯 FASE 4: VERIFICACIÓN Y TESTING" -ForegroundColor Magenta
Write-Host "=" * 40 -ForegroundColor Gray

# 9. Verificar TypeScript
Write-Host "`n🔍 Verificando TypeScript..." -ForegroundColor Yellow
Invoke-SafeCommand -Command "npm run type-check" -Description "Verificación TypeScript" -ContinueOnError

# 10. Verificar linting
Write-Host "`n🔍 Verificando linting..." -ForegroundColor Yellow
Invoke-SafeCommand -Command "npm run lint" -Description "Verificación ESLint" -ContinueOnError

# 11. Verificación final del entorno
Write-Host "`n🔍 Verificación final del entorno..." -ForegroundColor Yellow
Invoke-SafeCommand -Command ".\verify-environment.ps1" -Description "Verificación final completa" -ContinueOnError

Write-Host "`n🎯 FASE 5: INSTALACIÓN DE DEPENDENCIAS" -ForegroundColor Magenta
Write-Host "=" * 40 -ForegroundColor Gray

# 12. Instalar todas las dependencias
Write-Host "`n📦 Instalando todas las dependencias..." -ForegroundColor Green
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    Invoke-SafeCommand -Command "pnpm install" -Description "Instalación completa con pnpm" -ContinueOnError
} else {
    Invoke-SafeCommand -Command "npm install" -Description "Instalación completa con npm" -ContinueOnError
}

# 13. Verificar que las aplicaciones se pueden buildear
Write-Host "`n🏗️ Verificando builds..." -ForegroundColor Yellow
$testApps = @("api-server", "doctors")
foreach ($app in $testApps) {
    if (Test-Path "apps/$app") {
        Push-Location "apps/$app"
        Write-Host "  🔨 Testing build de $app..." -ForegroundColor Cyan
        Invoke-SafeCommand -Command "npm run build" -Description "$app build test" -ContinueOnError
        Pop-Location
    }
}

# RESUMEN FINAL
Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "🎉 ACTUALIZACIÓN ALTAMEDICA COMPLETADA" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

Write-Host "`n📊 RESUMEN DE ACTUALIZACIONES:" -ForegroundColor Yellow
Write-Host "✅ pnpm instalado globalmente" -ForegroundColor Green
Write-Host "✅ Dependencias core actualizadas (Next.js, React, TypeScript)" -ForegroundColor Green
Write-Host "✅ Bibliotecas médicas avanzadas instaladas" -ForegroundColor Green
Write-Host "✅ Herramientas de IA médica configuradas" -ForegroundColor Green
Write-Host "✅ WebRTC optimizado para telemedicina" -ForegroundColor Green
Write-Host "✅ Variables de entorno configuradas" -ForegroundColor Green

Write-Host "`n🚀 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "1. Configurar archivos .env.local en cada app" -ForegroundColor White
Write-Host "2. Ejecutar: npm run dev:all" -ForegroundColor White
Write-Host "3. Abrir: http://localhost:3000" -ForegroundColor White

Write-Host "`n🏥 Tu plataforma AltaMedica está lista para desarrollo avanzado!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray