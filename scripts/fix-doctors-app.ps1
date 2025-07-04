#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Script de reparación para la aplicación de doctores de AltaMedica
    
.DESCRIPTION
    Este script proporciona tres niveles de reparación para la aplicación de doctores:
    1. Solución estándar (recomendada) - Corrige problemas comunes de configuración
    2. Downgrade a versiones estables - Si persisten errores
    3. Limpieza total - Para corrupción severa del proyecto
    
.PARAMETER Downgrade
    Ejecuta el modo downgrade a versiones estables conocidas
    
.PARAMETER Force
    Ejecuta limpieza total y reinstalación completa
    
.EXAMPLE
    .\fix-doctors-app.ps1
    # Ejecuta la solución estándar
    
.EXAMPLE
    .\fix-doctors-app.ps1 -Downgrade
    # Downgrade a versiones estables
    
.EXAMPLE
    .\fix-doctors-app.ps1 -Force
    # Limpieza total y reinstalación
#>

param(
    [switch]$Downgrade,
    [switch]$Force
)

# Configuración de colores para output
$Host.UI.RawUI.ForegroundColor = "White"
$ErrorActionPreference = "Continue"

# Función para logging con colores
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    $Host.UI.RawUI.ForegroundColor = $Color
    Write-Host $Message
    $Host.UI.RawUI.ForegroundColor = "White"
}

# Función para verificar si estamos en el directorio correcto
function Test-WorkspaceRoot {
    $workspaceFiles = @("package.json", "turbo.json", "pnpm-workspace.yaml")
    $missingFiles = $workspaceFiles | Where-Object { -not (Test-Path $_) }
    
    if ($missingFiles.Count -gt 0) {
        Write-ColorOutput "❌ Error: No se detectó el workspace root de AltaMedica" "Red"
        Write-ColorOutput "   Asegúrate de ejecutar este script desde la raíz del proyecto" "Yellow"
        Write-ColorOutput "   Archivos faltantes: $($missingFiles -join ', ')" "Yellow"
        exit 1
    }
}

# Función para verificar dependencias del sistema
function Test-SystemDependencies {
    Write-ColorOutput "🔍 Verificando dependencias del sistema..." "Cyan"
    
    $dependencies = @{
        "Node.js" = "node"
        "npm" = "npm"
        "pnpm" = "pnpm"
        "Git" = "git"
    }
    
    $missing = @()
    
    foreach ($dep in $dependencies.GetEnumerator()) {
        try {
            $version = & $dep.Value --version 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "   ✅ $($dep.Key): $version" "Green"
            } else {
                $missing += $dep.Key
            }
        } catch {
            $missing += $dep.Key
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-ColorOutput "❌ Dependencias faltantes: $($missing -join ', ')" "Red"
        Write-ColorOutput "   Instala las dependencias faltantes antes de continuar" "Yellow"
        exit 1
    }
}

# Función para backup del proyecto
function Backup-Project {
    Write-ColorOutput "💾 Creando backup del proyecto..." "Cyan"
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupDir = "backup-doctors-app-$timestamp"
    
    try {
        # Crear directorio de backup
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
        
        # Copiar archivos críticos
        $criticalFiles = @(
            "apps/doctors/package.json",
            "apps/doctors/next.config.js",
            "apps/doctors/tailwind.config.js",
            "apps/doctors/postcss.config.js",
            "apps/doctors/tsconfig.json",
            "apps/doctors/.eslintrc.json"
        )
        
        foreach ($file in $criticalFiles) {
            if (Test-Path $file) {
                $destPath = Join-Path $backupDir (Split-Path $file -Leaf)
                Copy-Item $file $destPath -Force
            }
        }
        
        Write-ColorOutput "   ✅ Backup creado en: $backupDir" "Green"
        return $backupDir
    } catch {
        Write-ColorOutput "   ⚠️  Error al crear backup: $($_.Exception.Message)" "Yellow"
        return $null
    }
}

# Función para limpiar cachés
function Clear-Caches {
    Write-ColorOutput "🧹 Limpiando cachés..." "Cyan"
    
    $cacheDirs = @(
        "apps/doctors/.next",
        "apps/doctors/.turbo",
        "apps/doctors/node_modules/.cache",
        "node_modules/.cache",
        ".turbo"
    )
    
    foreach ($dir in $cacheDirs) {
        if (Test-Path $dir) {
            try {
                Remove-Item $dir -Recurse -Force
                Write-ColorOutput "   ✅ Limpiado: $dir" "Green"
            } catch {
                Write-ColorOutput "   ⚠️  Error al limpiar $dir : $($_.Exception.Message)" "Yellow"
            }
        }
    }
}

# Función para verificar y corregir configuración de Tailwind
function Fix-TailwindConfig {
    Write-ColorOutput "🎨 Verificando configuración de Tailwind..." "Cyan"
    
    $postcssConfig = "apps/doctors/postcss.config.js"
    
    if (Test-Path $postcssConfig) {
        $content = Get-Content $postcssConfig -Raw
        
        # Verificar si usa la configuración correcta para Tailwind v3
        if ($content -match "tailwindcss:\s*\{\}") {
            Write-ColorOutput "   ✅ Configuración de Tailwind correcta" "Green"
        } else {
            Write-ColorOutput "   🔧 Corrigiendo configuración de Tailwind..." "Yellow"
            
            $correctConfig = @"
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
"@
            Set-Content $postcssConfig $correctConfig
            Write-ColorOutput "   ✅ Configuración de Tailwind corregida" "Green"
        }
    } else {
        Write-ColorOutput "   ⚠️  Archivo postcss.config.js no encontrado" "Yellow"
    }
}

# Función para verificar y corregir scripts de desarrollo
function Fix-DevScripts {
    Write-ColorOutput "⚙️  Verificando scripts de desarrollo..." "Cyan"
    
    $packageJson = "apps/doctors/package.json"
    
    if (Test-Path $packageJson) {
        $package = Get-Content $packageJson | ConvertFrom-Json
        
        if ($package.scripts.dev -notmatch "--turbopack") {
            Write-ColorOutput "   🔧 Agregando flag --turbopack al script dev..." "Yellow"
            $package.scripts.dev = $package.scripts.dev + " --turbopack --port 3003"
            
            $package | ConvertTo-Json -Depth 10 | Set-Content $packageJson
            Write-ColorOutput "   ✅ Script dev actualizado con Turbopack" "Green"
        } else {
            Write-ColorOutput "   ✅ Script dev ya incluye Turbopack" "Green"
        }
    }
}

# Función para reinstalar dependencias
function Reinstall-Dependencies {
    Write-ColorOutput "📦 Reinstalando dependencias..." "Cyan"
    
    try {
        # Limpiar node_modules
        if (Test-Path "node_modules") {
            Remove-Item "node_modules" -Recurse -Force
        }
        if (Test-Path "apps/doctors/node_modules") {
            Remove-Item "apps/doctors/node_modules" -Recurse -Force
        }
        
        # Limpiar lock files
        $lockFiles = @("package-lock.json", "yarn.lock", "pnpm-lock.yaml")
        foreach ($file in $lockFiles) {
            if (Test-Path $file) {
                Remove-Item $file -Force
            }
        }
        
        # Reinstalar
        Write-ColorOutput "   📥 Instalando dependencias del workspace..." "Cyan"
        pnpm install
        
        Write-ColorOutput "   ✅ Dependencias reinstaladas correctamente" "Green"
    } catch {
        Write-ColorOutput "   ❌ Error al reinstalar dependencias: $($_.Exception.Message)" "Red"
        throw
    }
}

# Función para downgrade a versiones estables
function Downgrade-ToStableVersions {
    Write-ColorOutput "⬇️  Downgrade a versiones estables..." "Cyan"
    
    $packageJson = "apps/doctors/package.json"
    
    if (Test-Path $packageJson) {
        $package = Get-Content $packageJson | ConvertFrom-Json
        
        # Versiones estables conocidas
        $stableVersions = @{
            "next" = "14.2.0"
            "react" = "18.3.1"
            "react-dom" = "18.3.1"
            "typescript" = "5.3.3"
            "tailwindcss" = "3.3.6"
            "autoprefixer" = "10.4.16"
            "postcss" = "8.4.32"
        }
        
        foreach ($dep in $stableVersions.GetEnumerator()) {
            if ($package.dependencies.$($dep.Key)) {
                $package.dependencies.$($dep.Key) = $dep.Value
                Write-ColorOutput "   ⬇️  $($dep.Key): $($dep.Value)" "Yellow"
            }
        }
        
        $package | ConvertTo-Json -Depth 10 | Set-Content $packageJson
        Write-ColorOutput "   ✅ Versiones downgradeadas a estables" "Green"
    }
}

# Función para verificar la aplicación
function Test-Application {
    Write-ColorOutput "🧪 Verificando la aplicación..." "Cyan"
    
    try {
        # Verificar compilación
        Push-Location "apps/doctors"
        Write-ColorOutput "   🔨 Verificando compilación..." "Cyan"
        pnpm run type-check
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "   ✅ Compilación exitosa" "Green"
        } else {
            Write-ColorOutput "   ❌ Errores de compilación detectados" "Red"
            return $false
        }
        
        # Verificar linting
        Write-ColorOutput "   🔍 Verificando linting..." "Cyan"
        pnpm run lint
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "   ✅ Linting exitoso" "Green"
        } else {
            Write-ColorOutput "   ⚠️  Problemas de linting detectados" "Yellow"
        }
        
        Pop-Location
        return $true
    } catch {
        Write-ColorOutput "   ❌ Error durante la verificación: $($_.Exception.Message)" "Red"
        Pop-Location
        return $false
    }
}

# Función principal para solución estándar
function Invoke-StandardFix {
    Write-ColorOutput "🚀 Iniciando solución estándar..." "Green"
    
    Test-WorkspaceRoot
    Test-SystemDependencies
    
    $backupDir = Backup-Project
    
    try {
        Clear-Caches
        Fix-TailwindConfig
        Fix-DevScripts
        
        Write-ColorOutput "✅ Solución estándar completada" "Green"
        
        if (Test-Application) {
            Write-ColorOutput "🎉 ¡La aplicación está lista para usar!" "Green"
            Write-ColorOutput "   Ejecuta: cd apps/doctors && pnpm dev" "Cyan"
        } else {
            Write-ColorOutput "⚠️  Se detectaron problemas. Considera usar -Downgrade" "Yellow"
        }
    } catch {
        Write-ColorOutput "❌ Error durante la solución estándar: $($_.Exception.Message)" "Red"
        if ($backupDir) {
            Write-ColorOutput "   Backup disponible en: $backupDir" "Yellow"
        }
        throw
    }
}

# Función principal para downgrade
function Invoke-DowngradeFix {
    Write-ColorOutput "⬇️  Iniciando downgrade a versiones estables..." "Green"
    
    Test-WorkspaceRoot
    Test-SystemDependencies
    
    $backupDir = Backup-Project
    
    try {
        Clear-Caches
        Downgrade-ToStableVersions
        Reinstall-Dependencies
        Fix-TailwindConfig
        Fix-DevScripts
        
        Write-ColorOutput "✅ Downgrade completado" "Green"
        
        if (Test-Application) {
            Write-ColorOutput "🎉 ¡La aplicación está lista para usar!" "Green"
            Write-ColorOutput "   Ejecuta: cd apps/doctors && pnpm dev" "Cyan"
        } else {
            Write-ColorOutput "⚠️  Se detectaron problemas. Considera usar -Force" "Yellow"
        }
    } catch {
        Write-ColorOutput "❌ Error durante el downgrade: $($_.Exception.Message)" "Red"
        if ($backupDir) {
            Write-ColorOutput "   Backup disponible en: $backupDir" "Yellow"
        }
        throw
    }
}

# Función principal para limpieza total
function Invoke-ForceCleanup {
    Write-ColorOutput "💥 Iniciando limpieza total..." "Red"
    Write-ColorOutput "   ⚠️  Esta operación eliminará todos los archivos generados" "Yellow"
    
    $confirmation = Read-Host "¿Estás seguro de que quieres continuar? (y/N)"
    if ($confirmation -ne "y" -and $confirmation -ne "Y") {
        Write-ColorOutput "❌ Operación cancelada por el usuario" "Red"
        exit 0
    }
    
    Test-WorkspaceRoot
    Test-SystemDependencies
    
    $backupDir = Backup-Project
    
    try {
        Write-ColorOutput "🧹 Limpieza total en progreso..." "Cyan"
        
        # Limpiar todo
        Clear-Caches
        
        # Eliminar archivos generados adicionales
        $generatedDirs = @(
            "apps/doctors/out",
            "apps/doctors/.next",
            "apps/doctors/.turbo",
            "apps/doctors/coverage",
            "apps/doctors/.nyc_output"
        )
        
        foreach ($dir in $generatedDirs) {
            if (Test-Path $dir) {
                Remove-Item $dir -Recurse -Force
                Write-ColorOutput "   [DELETED] Eliminado: $dir" "Yellow"
            }
        }
        
        # Reinstalación completa
        Reinstall-Dependencies
        Downgrade-ToStableVersions
        Fix-TailwindConfig
        Fix-DevScripts
        
        Write-ColorOutput "✅ Limpieza total completada" "Green"
        
        if (Test-Application) {
            Write-ColorOutput "🎉 ¡La aplicación está completamente renovada!" "Green"
            Write-ColorOutput "   Ejecuta: cd apps/doctors && pnpm dev" "Cyan"
        } else {
            Write-ColorOutput "❌ Problemas persistentes detectados" "Red"
            Write-ColorOutput "   Contacta al equipo de desarrollo" "Yellow"
        }
    } catch {
        Write-ColorOutput "❌ Error durante la limpieza total: $($_.Exception.Message)" "Red"
        if ($backupDir) {
            Write-ColorOutput "   Backup disponible en: $backupDir" "Yellow"
        }
        throw
    }
}

# Función principal
function Main {
    Write-ColorOutput "[HOSPITAL] AltaMedica - Script de Reparación de Doctors App" "Magenta"
    Write-ColorOutput "=================================================" "Magenta"
    
    if ($Force) {
        Invoke-ForceCleanup
    } elseif ($Downgrade) {
        Invoke-DowngradeFix
    } else {
        Invoke-StandardFix
    }
    
    Write-ColorOutput "=================================================" "Magenta"
    Write-ColorOutput "[FINISH] Script completado" "Magenta"
}

# Ejecutar función principal
Main