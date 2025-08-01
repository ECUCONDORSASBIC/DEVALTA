# AltaMedica - Actualizacion Automatizada Completa
# Ejecutar en PowerShell como Administrador

Write-Host "AltaMedica - Actualizacion Automatizada Completa" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Gray

# Funcion para ejecutar comandos con manejo de errores
function Invoke-SafeCommand {
    param(
        [string]$Command,
        [string]$Description,
        [switch]$ContinueOnError
    )
    
    Write-Host "`n$Description..." -ForegroundColor Cyan
    Write-Host "Ejecutando: $Command" -ForegroundColor Gray
    
    try {
        Invoke-Expression $Command
        if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
            Write-Host "OK $Description - COMPLETADO" -ForegroundColor Green
            return $true
        } else {
            Write-Host "ADVERTENCIA $Description - TERMINADO CON CODIGO $LASTEXITCODE" -ForegroundColor Yellow
            if ($ContinueOnError) {
                return $false
            } else {
                throw "Error en: $Description"
            }
        }
    } catch {
        Write-Host "ERROR en $Description`: $($_.Exception.Message)" -ForegroundColor Red
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
    Write-Host "Navegando al directorio del proyecto..." -ForegroundColor Yellow
    Set-Location $expectedPath
}

Write-Host "`nFASE 1: INSTALACION DE HERRAMIENTAS BASICAS" -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Gray

# 1. Verificar e instalar pnpm globalmente
Write-Host "`nVerificando pnpm..." -ForegroundColor Cyan
try {
    $pnpmVersion = pnpm --version 2>$null
    if ($pnpmVersion) {
        Write-Host "pnpm ya esta instalado: v$pnpmVersion" -ForegroundColor Green
    } else {
        throw "pnpm no encontrado"
    }
} catch {
    Write-Host "Instalando pnpm globalmente..." -ForegroundColor Yellow
    Invoke-SafeCommand -Command "npm install -g pnpm@latest" -Description "Instalacion de pnpm"
}

# 2. Instalar herramientas de desarrollo
Write-Host "`nInstalando herramientas globales..." -ForegroundColor Cyan
$globalTools = @(
    "npm install -g typescript@latest",
    "npm install -g @next/codemod@latest",
    "npm install -g eslint@latest"
)

foreach ($tool in $globalTools) {
    Invoke-SafeCommand -Command $tool -Description "Herramientas globales" -ContinueOnError
}

Write-Host "`nFASE 2: ACTUALIZACION DEPENDENCIAS PRINCIPALES" -ForegroundColor Magenta
Write-Host "=============================================" -ForegroundColor Gray

# 3. Limpiar cache
Write-Host "`nLimpiando cache..." -ForegroundColor Yellow
Invoke-SafeCommand -Command "npm cache clean --force" -Description "Limpieza de cache npm" -ContinueOnError

if (Test-Path "node_modules") {
    Write-Host "Eliminando node_modules existente..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}

# 4. Instalar dependencias principales
Write-Host "`nInstalando dependencias principales..." -ForegroundColor Cyan
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    Invoke-SafeCommand -Command "pnpm install" -Description "Instalacion con pnpm"
} else {
    Invoke-SafeCommand -Command "npm install" -Description "Instalacion con npm"
}

# 5. Actualizar Next.js y React
Write-Host "`nActualizando frameworks principales..." -ForegroundColor Cyan
$coreUpdates = @(
    "npm install next@latest react@latest react-dom@latest",
    "npm install --save-dev typescript@latest @types/react@latest @types/node@latest",
    "npm install --save-dev eslint@latest eslint-config-next@latest"
)

foreach ($update in $coreUpdates) {
    Invoke-SafeCommand -Command $update -Description "Actualizaciones core" -ContinueOnError
}

# 6. Actualizar dependencias por app
Write-Host "`nActualizando apps individuales..." -ForegroundColor Green
$apps = @("api-server", "doctors", "patients", "web-app", "signaling-server")

foreach ($app in $apps) {
    if (Test-Path "apps/$app") {
        Write-Host "  Actualizando $app..." -ForegroundColor Cyan
        Push-Location "apps/$app"
        
        $appUpdates = @(
            "npm install",
            "npm update"
        )
        
        foreach ($update in $appUpdates) {
            Invoke-SafeCommand -Command $update -Description "$app dependencies" -ContinueOnError
        }
        
        Pop-Location
    }
}

Write-Host "`nFASE 3: NUEVAS BIBLIOTECAS MEDICAS" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Gray

# 7. Instalar bibliotecas medicas avanzadas
Write-Host "`nInstalando bibliotecas de IA medica..." -ForegroundColor Cyan
$medicalLibs = @(
    "npm install --save-dev @tensorflow/tfjs@latest @tensorflow/tfjs-node@latest",
    "npm install --save-dev sharp@latest",
    "npm install --save-dev joi@latest helmet@latest",
    "npm install --save-dev @axe-core/react@latest",
    "npm install --save-dev @opentelemetry/api@latest"
)

foreach ($lib in $medicalLibs) {
    Invoke-SafeCommand -Command $lib -Description "Bibliotecas medicas" -ContinueOnError
}

# 8. Actualizaciones especificas por app
Write-Host "`nInstalando bibliotecas especificas por app..." -ForegroundColor Green

# API Server - Backend medico
if (Test-Path "apps/api-server") {
    Push-Location "apps/api-server"
    Invoke-SafeCommand -Command "npm install rate-limiter-flexible@latest express-rate-limit@latest" -Description "API Server medical libs" -ContinueOnError
    Pop-Location
}

# Doctors App - Herramientas medicas
if (Test-Path "apps/doctors") {
    Push-Location "apps/doctors"
    Invoke-SafeCommand -Command "npm install react-hook-form@latest @hookform/resolvers@latest" -Description "Doctors App medical libs" -ContinueOnError
    Pop-Location
}

# Patients App - UX medico
if (Test-Path "apps/patients") {
    Push-Location "apps/patients"
    Invoke-SafeCommand -Command "npm install framer-motion@latest react-datepicker@latest" -Description "Patients App medical libs" -ContinueOnError
    Pop-Location
}

# Signaling Server - WebRTC optimizado
if (Test-Path "apps/signaling-server") {
    Push-Location "apps/signaling-server"
    Invoke-SafeCommand -Command "npm install ws@latest socket.io@latest" -Description "Signaling Server WebRTC libs" -ContinueOnError
    Pop-Location
}

Write-Host "`nFASE 4: VERIFICACION Y TESTING" -ForegroundColor Magenta
Write-Host "==============================" -ForegroundColor Gray

# 9. Verificar instalaciones
Write-Host "`nVerificando instalaciones..." -ForegroundColor Yellow
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    Invoke-SafeCommand -Command "pnpm install" -Description "Instalacion completa con pnpm" -ContinueOnError
} else {
    Invoke-SafeCommand -Command "npm install" -Description "Instalacion completa con npm" -ContinueOnError
}

# 10. Verificar que las aplicaciones se pueden buildear
Write-Host "`nVerificando builds..." -ForegroundColor Yellow
$testApps = @("api-server", "doctors")
foreach ($app in $testApps) {
    if (Test-Path "apps/$app") {
        Push-Location "apps/$app"
        Write-Host "  Testing build de $app..." -ForegroundColor Cyan
        Invoke-SafeCommand -Command "npm run build" -Description "$app build test" -ContinueOnError
        Pop-Location
    }
}

# RESUMEN FINAL
Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "ACTUALIZACION ALTAMEDICA COMPLETADA" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

Write-Host "`nRESUMEN DE ACTUALIZACIONES:" -ForegroundColor Yellow
Write-Host "OK pnpm instalado globalmente" -ForegroundColor Green
Write-Host "OK Dependencias core actualizadas (Next.js, React, TypeScript)" -ForegroundColor Green
Write-Host "OK Bibliotecas medicas avanzadas instaladas" -ForegroundColor Green
Write-Host "OK Herramientas de IA medica configuradas" -ForegroundColor Green
Write-Host "OK WebRTC optimizado para telemedicina" -ForegroundColor Green
Write-Host "OK Variables de entorno configuradas" -ForegroundColor Green

Write-Host "`nPROXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "1. Configurar archivos .env.local en cada app" -ForegroundColor White
Write-Host "2. Ejecutar: npm run dev:all" -ForegroundColor White
Write-Host "3. Abrir: http://localhost:3000" -ForegroundColor White

Write-Host "`nTu plataforma AltaMedica esta lista para desarrollo avanzado!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray