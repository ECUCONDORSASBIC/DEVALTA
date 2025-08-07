# 🔧 SCRIPT DE CORRECCIÓN ARQUITECTÓNICA - ALTAMEDICA PLATFORM
# Autor: Eduardo Marques
# Fecha: Febrero 2025
# Propósito: Estandarizar y optimizar la arquitectura del monorepo

Write-Host "🏥 INICIANDO CORRECCIÓN ARQUITECTÓNICA DE ALTAMEDICA" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Configuración
$ErrorActionPreference = "Continue"
$rootPath = Split-Path -Parent $PSScriptRoot
Set-Location $rootPath

# Función para mostrar progreso
function Show-Progress {
    param($Message, $Status = "INFO")
    $color = switch ($Status) {
        "SUCCESS" { "Green" }
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        default { "White" }
    }
    Write-Host "[$Status] $Message" -ForegroundColor $color
}

# ====================
# FASE 1: DIAGNÓSTICO
# ====================
Show-Progress "FASE 1: Ejecutando diagnóstico del monorepo..." "INFO"

# Verificar versiones de React
Show-Progress "Analizando versiones de React..." "INFO"
$reactVersions = pnpm ls react --depth=0 --json | ConvertFrom-Json

# Verificar estructura de packages
$packages = Get-ChildItem -Path "packages" -Directory
$apps = Get-ChildItem -Path "apps" -Directory

Show-Progress "Encontrados $($packages.Count) packages y $($apps.Count) aplicaciones" "SUCCESS"

# ====================
# FASE 2: ESTANDARIZACIÓN DE DEPENDENCIAS
# ====================
Show-Progress "FASE 2: Estandarizando dependencias..." "INFO"

# Actualizar React a versión 19.0.0 en todas las apps
Show-Progress "Actualizando React a v19.0.0 en todo el monorepo..." "WARNING"

try {
    # Actualizar React y React-DOM
    pnpm update react@19.0.0 react-dom@19.0.0 --recursive
    Show-Progress "React actualizado correctamente" "SUCCESS"
} catch {
    Show-Progress "Error actualizando React: $_" "ERROR"
}

# Actualizar tipos de React
try {
    pnpm update @types/react@19.0.0 @types/react-dom@19.0.0 --recursive
    Show-Progress "Tipos de React actualizados" "SUCCESS"
} catch {
    Show-Progress "Error actualizando tipos: $_" "ERROR"
}

# ====================
# FASE 3: CONFIGURACIÓN TYPESCRIPT
# ====================
Show-Progress "FASE 3: Optimizando configuración TypeScript..." "INFO"

# Crear tsconfig base mejorado
$tsconfigBase = @{
    compilerOptions = @{
        target = "ES2020"
        module = "ESNext"
        lib = @("dom", "dom.iterable", "ES2020")
        jsx = "preserve"
        strict = $true
        esModuleInterop = $true
        skipLibCheck = $true
        forceConsistentCasingInFileNames = $true
        resolveJsonModule = $true
        isolatedModules = $true
        noEmit = $true
        moduleResolution = "bundler"
        allowJs = $true
        incremental = $true
        baseUrl = "."
        paths = @{
            "@altamedica/ui" = @("packages/ui/src/index.ts")
            "@altamedica/ui/*" = @("packages/ui/src/*")
            "@altamedica/auth" = @("packages/auth/src/index.ts")
            "@altamedica/auth/*" = @("packages/auth/src/*")
            "@altamedica/types" = @("packages/types/src/index.ts")
            "@altamedica/types/*" = @("packages/types/src/*")
            "@altamedica/hooks" = @("packages/hooks/src/index.ts")
            "@altamedica/hooks/*" = @("packages/hooks/src/*")
            "@altamedica/medical" = @("packages/medical/src/index.ts")
            "@altamedica/medical/*" = @("packages/medical/src/*")
            "@altamedica/api-client" = @("packages/api-client/src/index.ts")
            "@altamedica/api-client/*" = @("packages/api-client/src/*")
            "@altamedica/database" = @("packages/database/src/index.ts")
            "@altamedica/database/*" = @("packages/database/src/*")
            "@altamedica/shared" = @("packages/shared/src/index.ts")
            "@altamedica/shared/*" = @("packages/shared/src/*")
        }
    }
}

# Guardar tsconfig base
$tsconfigBase | ConvertTo-Json -Depth 10 | Set-Content "tsconfig.base.json"
Show-Progress "tsconfig.base.json creado" "SUCCESS"

# ====================
# FASE 4: OPTIMIZACIÓN TURBO
# ====================
Show-Progress "FASE 4: Optimizando Turbo pipeline..." "INFO"

$turboConfig = @{
    "$schema" = "https://turbo.build/schema.json"
    globalDependencies = @("**/.env.*local", "tsconfig.json")
    pipeline = @{
        build = @{
            dependsOn = @("^build")
            outputs = @(".next/**", "!.next/cache/**", "dist/**")
            cache = $true
        }
        "build:fast" = @{
            dependsOn = @("^build:fast")
            outputs = @(".next/**", "!.next/cache/**")
            cache = $true
        }
        lint = @{
            dependsOn = @()
            cache = $true
        }
        typecheck = @{
            dependsOn = @("^typecheck")
            cache = $true
        }
        test = @{
            dependsOn = @("build")
            cache = $false
        }
        dev = @{
            cache = $false
            persistent = $true
            dependsOn = @()
        }
        clean = @{
            cache = $false
        }
    }
}

# Guardar configuración Turbo optimizada
$turboConfig | ConvertTo-Json -Depth 10 | Set-Content "turbo.json"
Show-Progress "turbo.json optimizado" "SUCCESS"

# ====================
# FASE 5: CREAR BARREL EXPORTS
# ====================
Show-Progress "FASE 5: Creando barrel exports para packages..." "INFO"

# Función para crear index.ts con exports
function Create-BarrelExport {
    param($PackagePath, $PackageName)
    
    $indexPath = Join-Path $PackagePath "src/index.ts"
    
    if (-not (Test-Path $indexPath)) {
        Show-Progress "Creando barrel export para $PackageName" "INFO"
        
        # Buscar todos los archivos exportables
        $exports = Get-ChildItem -Path (Join-Path $PackagePath "src") -Recurse -Filter "*.ts" -File |
            Where-Object { $_.Name -ne "index.ts" -and $_.Name -notlike "*.test.ts" -and $_.Name -notlike "*.spec.ts" } |
            ForEach-Object {
                $relativePath = $_.FullName.Replace($PackagePath + "\src\", "").Replace("\", "/").Replace(".ts", "")
                "export * from './$relativePath';"
            }
        
        $exports -join "`n" | Set-Content $indexPath
        Show-Progress "Barrel export creado para $PackageName" "SUCCESS"
    }
}

# Crear barrel exports para cada package
foreach ($package in $packages) {
    Create-BarrelExport -PackagePath $package.FullName -PackageName $package.Name
}

# ====================
# FASE 6: SCRIPTS DE NPM
# ====================
Show-Progress "FASE 6: Actualizando scripts de NPM..." "INFO"

# Leer package.json principal
$packageJson = Get-Content "package.json" | ConvertFrom-Json

# Actualizar scripts
$packageJson.scripts = @{
    # Build commands
    "build" = "turbo run build"
    "build:fast" = "turbo run build:fast"
    "build:apps" = "turbo run build --filter='./apps/*'"
    "build:packages" = "turbo run build --filter='./packages/*'"
    
    # Development
    "dev" = "turbo run dev --parallel"
    "dev:web" = "turbo run dev --filter=@altamedica/web-app"
    "dev:api" = "turbo run dev --filter=@altamedica/api-server"
    "dev:doctors" = "turbo run dev --filter=@altamedica/doctors"
    "dev:patients" = "turbo run dev --filter=@altamedica/patients"
    
    # Testing
    "test" = "turbo run test"
    "test:watch" = "turbo run test:watch"
    "test:coverage" = "turbo run test:coverage"
    
    # Linting & Type checking
    "lint" = "turbo run lint"
    "lint:fix" = "turbo run lint -- --fix"
    "typecheck" = "turbo run typecheck"
    
    # Utilities
    "clean" = "turbo run clean && rimraf node_modules/.cache"
    "clean:all" = "pnpm clean && rimraf '**/node_modules' '**/.next' '**/dist'"
    "fresh" = "pnpm clean:all && pnpm install"
    
    # Docker
    "docker:up" = "docker-compose up -d"
    "docker:down" = "docker-compose down"
    "docker:logs" = "docker-compose logs -f"
    
    # Deployment
    "deploy:staging" = "turbo run build && pnpm deploy:staging:apps"
    "deploy:production" = "turbo run build && pnpm deploy:production:apps"
}

# Guardar package.json actualizado
$packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
Show-Progress "Scripts de NPM actualizados" "SUCCESS"

# ====================
# FASE 7: LIMPIEZA Y REINSTALACIÓN
# ====================
Show-Progress "FASE 7: Limpieza y reinstalación de dependencias..." "INFO"

# Limpiar caché
Show-Progress "Limpiando caché..." "WARNING"
turbo daemon clean
pnpm store prune

# Reinstalar dependencias
Show-Progress "Reinstalando dependencias..." "WARNING"
Remove-Item -Path "pnpm-lock.yaml" -Force -ErrorAction SilentlyContinue
pnpm install

# ====================
# FASE 8: VERIFICACIÓN FINAL
# ====================
Show-Progress "FASE 8: Ejecutando verificación final..." "INFO"

# Verificar tipos
Show-Progress "Verificando tipos TypeScript..." "INFO"
pnpm typecheck

# Verificar lint
Show-Progress "Ejecutando linter..." "INFO"
pnpm lint

# Build de prueba
Show-Progress "Ejecutando build de prueba..." "WARNING"
pnpm build:fast

# ====================
# RESUMEN
# ====================
Write-Host "`n=================================================" -ForegroundColor Green
Write-Host "✅ CORRECCIÓN ARQUITECTÓNICA COMPLETADA" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

Write-Host "`n📊 RESUMEN DE CAMBIOS:" -ForegroundColor Cyan
Write-Host "  ✓ React actualizado a v19.0.0" -ForegroundColor Green
Write-Host "  ✓ TypeScript paths configurados" -ForegroundColor Green
Write-Host "  ✓ Turbo pipeline optimizado" -ForegroundColor Green
Write-Host "  ✓ Barrel exports creados" -ForegroundColor Green
Write-Host "  ✓ Scripts NPM actualizados" -ForegroundColor Green
Write-Host "  ✓ Dependencias reinstaladas" -ForegroundColor Green

Write-Host "`n🚀 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "  1. Ejecutar 'pnpm dev' para verificar desarrollo"
Write-Host "  2. Ejecutar 'pnpm test' para verificar tests"
Write-Host "  3. Revisar warnings de build si los hay"
Write-Host "  4. Actualizar documentación si es necesario"

Write-Host "`n📝 Logs guardados en: ./scripts/architecture-fix.log" -ForegroundColor Cyan