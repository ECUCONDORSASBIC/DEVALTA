#!/usr/bin/env pwsh

# Script de Verificación SSR Fix
# Verifica que las correcciones se aplicaron correctamente

param(
    [string]$ProjectPath = "C:\Users\Eduardo\Documents\devaltamedica\apps\doctors",
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host @"
╔══════════════════════════════════════════════════════════════╗
║                    VERIFICACIÓN SSR FIX                      ║
║               Comprobando correcciones aplicadas             ║
╚══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Blue

function Write-Status {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "🔍 $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# Verificar directorio del proyecto
if (-not (Test-Path $ProjectPath)) {
    Write-Error "Directorio del proyecto no encontrado: $ProjectPath"
    exit 1
}

Write-Status "Iniciando verificación de correcciones SSR..."

# Verificación 1: EncryptionService
Write-Status "Verificando EncryptionService..."
$encryptionServicePath = "$ProjectPath\src\services\encryption-service.ts"

if (-not (Test-Path $encryptionServicePath)) {
    Write-Error "EncryptionService no encontrado: $encryptionServicePath"
} else {
    $encryptionContent = Get-Content $encryptionServicePath -Raw
    
    # Verificar verificaciones SSR
    $ssrChecks = @(
        'typeof window !== "undefined"',
        'this.isClient = typeof window !== "undefined"',
        'isAvailable()',
        'isEncryptionAvailable()',
        'ensureInitialized()'
    )
    
    $allChecksPassed = $true
    foreach ($check in $ssrChecks) {
        if ($encryptionContent -match [regex]::Escape($check)) {
            Write-Success "✓ Verificación SSR encontrada: $check"
        } else {
            Write-Error "✗ Verificación SSR faltante: $check"
            $allChecksPassed = $false
        }
    }
    
    if ($allChecksPassed) {
        Write-Success "EncryptionService: SSR Compatible"
    } else {
        Write-Error "EncryptionService: Requiere correcciones adicionales"
    }
}

# Verificación 2: PatientService
Write-Status "Verificando PatientService..."
$patientServicePath = "$ProjectPath\src\services\patient-service.ts"

if (-not (Test-Path $patientServicePath)) {
    Write-Error "PatientService no encontrado: $patientServicePath"
} else {
    $patientContent = Get-Content $patientServicePath -Raw
    
    # Verificar verificaciones SSR
    $ssrChecks = @(
        'typeof window !== "undefined"',
        'this.isClient = typeof window !== "undefined"',
        'isServiceReady()',
        'getEncryptionService()',
        'ensureInitialized()'
    )
    
    $allChecksPassed = $true
    foreach ($check in $ssrChecks) {
        if ($patientContent -match [regex]::Escape($check)) {
            Write-Success "✓ Verificación SSR encontrada: $check"
        } else {
            Write-Error "✗ Verificación SSR faltante: $check"
            $allChecksPassed = $false
        }
    }
    
    if ($allChecksPassed) {
        Write-Success "PatientService: SSR Compatible"
    } else {
        Write-Error "PatientService: Requiere correcciones adicionales"
    }
}

# Verificación 3: Página de Testing
Write-Status "Verificando página de testing..."
$testPagePath = "$ProjectPath\src\app\test-page\page.tsx"

if (-not (Test-Path $testPagePath)) {
    Write-Error "Página de testing no encontrada: $testPagePath"
} else {
    $testPageContent = Get-Content $testPagePath -Raw
    
    # Verificar elementos de la página
    $pageChecks = @(
        "'use client'",
        'getPatientService()',
        'isServiceReady()',
        'SSR Fix Aplicado'
    )
    
    $allChecksPassed = $true
    foreach ($check in $pageChecks) {
        if ($testPageContent -match [regex]::Escape($check)) {
            Write-Success "✓ Elemento encontrado: $check"
        } else {
            Write-Error "✗ Elemento faltante: $check"
            $allChecksPassed = $false
        }
    }
    
    if ($allChecksPassed) {
        Write-Success "Página de testing: Creada correctamente"
    } else {
        Write-Error "Página de testing: Requiere correcciones"
    }
}

# Verificación 4: TypeScript Config
Write-Status "Verificando configuración TypeScript..."
$tsConfigPath = "$ProjectPath\tsconfig.json"

if (-not (Test-Path $tsConfigPath)) {
    Write-Warning "tsconfig.json no encontrado"
} else {
    $tsConfig = Get-Content $tsConfigPath | ConvertFrom-Json
    
    if ($tsConfig.compilerOptions.target -eq "ES2022") {
        Write-Success "✓ Target ES2022 configurado"
    } else {
        Write-Warning "⚠ Target no es ES2022: $($tsConfig.compilerOptions.target)"
    }
    
    if ($tsConfig.compilerOptions.moduleResolution -eq "bundler") {
        Write-Success "✓ Module resolution bundler configurado"
    } else {
        Write-Warning "⚠ Module resolution no es bundler: $($tsConfig.compilerOptions.moduleResolution)"
    }
}

# Verificación 5: Package.json
Write-Status "Verificando dependencias..."
$packageJsonPath = "$ProjectPath\package.json"

if (-not (Test-Path $packageJsonPath)) {
    Write-Warning "package.json no encontrado"
} else {
    $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
    
    if ($packageJson.dependencies.next) {
        Write-Success "✓ Next.js instalado: $($packageJson.dependencies.next)"
    } else {
        Write-Warning "⚠ Next.js no encontrado en dependencias"
    }
    
    if ($packageJson.dependencies.react) {
        Write-Success "✓ React instalado: $($packageJson.dependencies.react)"
    } else {
        Write-Warning "⚠ React no encontrado en dependencias"
    }
}

# Resumen final
Write-Host ""
Write-Host "📊 RESUMEN DE VERIFICACIÓN" -ForegroundColor Blue
Write-Host "=========================" -ForegroundColor Blue

$totalChecks = 0
$passedChecks = 0

# Contar verificaciones
$filesToCheck = @(
    @{ Path = $encryptionServicePath; Name = "EncryptionService" },
    @{ Path = $patientServicePath; Name = "PatientService" },
    @{ Path = $testPagePath; Name = "TestPage" }
)

foreach ($file in $filesToCheck) {
    $totalChecks++
    if (Test-Path $file.Path) {
        $passedChecks++
        Write-Success "✓ $($file.Name): Verificado"
    } else {
        Write-Error "✗ $($file.Name): No encontrado"
    }
}

Write-Host ""
Write-Host "🎯 RESULTADO FINAL" -ForegroundColor Blue
Write-Host "==================" -ForegroundColor Blue

if ($passedChecks -eq $totalChecks) {
    Write-Host "🎉 ¡TODAS LAS CORRECCIONES SSR APLICADAS EXITOSAMENTE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Comandos para probar:" -ForegroundColor Blue
    Write-Host "  cd $ProjectPath" -ForegroundColor Gray
    Write-Host "  pnpm dev" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🌐 Visita: http://localhost:3003/test-page" -ForegroundColor Blue
} else {
    Write-Host "⚠️  ALGUNAS CORRECCIONES REQUIEREN ATENCIÓN" -ForegroundColor Yellow
    Write-Host "   Verifica los errores arriba y aplica las correcciones faltantes" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ Verificación completada" -ForegroundColor Magenta 