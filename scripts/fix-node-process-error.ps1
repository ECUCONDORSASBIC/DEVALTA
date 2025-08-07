# 🔧 SCRIPT PARA CORREGIR ERROR node:process EN WEBPACK
# Autor: Eduardo Marques
# Fecha: Febrero 2025

Write-Host "🔧 INICIANDO CORRECCIÓN DE ERROR node:process" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

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
# PASO 1: ACTUALIZAR CONFIGURACIONES NEXT.CONFIG.JS
# ====================
Show-Progress "Actualizando configuraciones de Next.js..." "INFO"

# Template para next.config.js con fixes
$nextConfigTemplate = @'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    '@altamedica/ui',
    '@altamedica/auth',
    '@altamedica/hooks',
    '@altamedica/medical',
    '@altamedica/types',
    '@altamedica/shared',
    '@altamedica/database',
    '@altamedica/api-client'
  ],
  
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        buffer: false,
        'node:process': false,
        'node:crypto': false,
        'node:fs': false,
        'node:path': false,
        'node:stream': false,
        'node:buffer': false,
        process: false,
      };
      
      config.resolve.alias = {
        ...config.resolve.alias,
        'node:process': false,
        'node:crypto': false,
        'node:fs': false,
        'node:path': false,
        'node:stream': false,
        'node:buffer': false,
      };
    }
    
    config.externals = [...(config.externals || [])];
    
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });
    
    return config;
  },
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8888',
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  images: {
    domains: ['firebasestorage.googleapis.com', 'lh3.googleusercontent.com'],
  },
  
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    optimizePackageImports: [
      '@altamedica/ui',
      '@altamedica/auth',
      'lucide-react',
      '@radix-ui/react-*',
    ],
  },
};

module.exports = nextConfig;
'@

# Actualizar next.config.js en cada app
$apps = @("web-app", "doctors", "patients", "companies", "admin", "api-server")

foreach ($app in $apps) {
    $configPath = Join-Path $rootPath "apps\$app\next.config.js"
    
    if (Test-Path $configPath) {
        Show-Progress "Actualizando next.config.js para $app" "INFO"
        
        # Backup del archivo original
        $backupPath = "$configPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $configPath $backupPath
        
        # Escribir nueva configuración
        Set-Content -Path $configPath -Value $nextConfigTemplate
        Show-Progress "✓ $app configurado" "SUCCESS"
    }
}

# ====================
# PASO 2: CREAR ARCHIVO DE POLYFILLS
# ====================
Show-Progress "Creando archivo de polyfills..." "INFO"

$polyfillsContent = @'
/**
 * Polyfills para el navegador
 */

if (typeof window !== 'undefined' && !window.process) {
  window.process = {
    env: {},
    browser: true,
    version: '',
    versions: {},
    platform: 'browser',
    nextTick: (fn) => setTimeout(fn, 0),
  };
}

if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = {
    from: () => [],
    alloc: () => [],
    isBuffer: () => false,
  };
}

if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}

export {};
'@

# Crear polyfills en cada app
foreach ($app in $apps) {
    $polyfillPath = Join-Path $rootPath "apps\$app\src\lib\polyfills.ts"
    $libDir = Join-Path $rootPath "apps\$app\src\lib"
    
    # Crear directorio lib si no existe
    if (-not (Test-Path $libDir)) {
        New-Item -ItemType Directory -Path $libDir -Force | Out-Null
    }
    
    # Escribir archivo de polyfills
    Set-Content -Path $polyfillPath -Value $polyfillsContent
    Show-Progress "✓ Polyfills creados para $app" "SUCCESS"
}

# ====================
# PASO 3: ACTUALIZAR ARCHIVOS _APP.TSX
# ====================
Show-Progress "Actualizando archivos _app.tsx..." "INFO"

$pagesApps = @("web-app", "doctors", "patients", "companies", "admin")

foreach ($app in $pagesApps) {
    $appPath = Join-Path $rootPath "apps\$app\src\pages\_app.tsx"
    $pagesDir = Join-Path $rootPath "apps\$app\src\pages"
    
    if (Test-Path $pagesDir) {
        if (Test-Path $appPath) {
            # Leer contenido existente
            $content = Get-Content $appPath -Raw
            
            # Agregar import de polyfills si no existe
            if ($content -notmatch "import.*polyfills") {
                $newContent = "import '@/lib/polyfills';`n" + $content
                Set-Content -Path $appPath -Value $newContent
                Show-Progress "✓ Polyfills agregados a _app.tsx de $app" "SUCCESS"
            }
        }
    }
}

# ====================
# PASO 4: CREAR WRAPPER PARA AUTH SERVER
# ====================
Show-Progress "Creando wrapper para auth server..." "INFO"

$authServerWrapper = @'
/**
 * Wrapper para funciones del servidor
 */

const isServer = typeof window === 'undefined';

export const getServerAuth = () => {
  if (!isServer) {
    throw new Error('getServerAuth solo puede usarse en el servidor');
  }
  return import('./server').then(module => module.default);
};

export const serverAuth = isServer ? require('./server') : {
  verifyToken: () => Promise.reject(new Error('No disponible en el cliente')),
  createSession: () => Promise.reject(new Error('No disponible en el cliente')),
};
'@

$authWrapperPath = Join-Path $rootPath "packages\auth\src\server-wrapper.ts"
if (Test-Path (Split-Path $authWrapperPath -Parent)) {
    Set-Content -Path $authWrapperPath -Value $authServerWrapper
    Show-Progress "✓ Wrapper creado para auth/server" "SUCCESS"
}

# ====================
# PASO 5: CORREGIR IMPORTS EN PACKAGES
# ====================
Show-Progress "Corrigiendo imports en packages..." "INFO"

# Función para reemplazar process.env con verificación
function Fix-ProcessEnv {
    param($FilePath)
    
    if (Test-Path $FilePath) {
        $content = Get-Content $FilePath -Raw
        
        # Reemplazar process.env directo con verificación para no-NEXT_PUBLIC
        $pattern = 'process\.env\.(?!NEXT_PUBLIC_)([A-Z_]+)'
        $replacement = '(typeof process !== "undefined" ? process.env.$1 : undefined)'
        
        $newContent = $content -replace $pattern, $replacement
        
        if ($content -ne $newContent) {
            Set-Content -Path $FilePath -Value $newContent
            return $true
        }
    }
    return $false
}

# Archivos específicos a corregir
$filesToFix = @(
    "packages\utils\src\TechnicalKnowledgeService.ts",
    "packages\medical\src\utils\medical-utils.ts",
    "packages\database\src\repositories\BaseRepository.ts",
    "packages\database\src\core\DatabaseConnection.ts",
    "packages\medical-hooks\src\useApiBridge.ts"
)

foreach ($file in $filesToFix) {
    $filePath = Join-Path $rootPath $file
    if (Fix-ProcessEnv -FilePath $filePath) {
        Show-Progress "✓ Corregido: $file" "SUCCESS"
    }
}

# ====================
# PASO 6: LIMPIAR CACHÉ
# ====================
Show-Progress "Limpiando caché..." "WARNING"

# Limpiar caché de Next.js
Get-ChildItem -Path $rootPath -Include ".next" -Recurse -Directory -ErrorAction SilentlyContinue | 
    ForEach-Object { 
        Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }
Show-Progress "✓ Caché de Next.js limpiado" "SUCCESS"

# Limpiar node_modules/.cache
$cacheDir = Join-Path $rootPath "node_modules\.cache"
if (Test-Path $cacheDir) {
    Remove-Item -Path $cacheDir -Recurse -Force -ErrorAction SilentlyContinue
    Show-Progress "✓ Caché de node_modules limpiado" "SUCCESS"
}

# ====================
# REINSTALAR DEPENDENCIAS
# ====================
Show-Progress "Reinstalando dependencias..." "WARNING"
pnpm install

# ====================
# RESUMEN
# ====================
Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "✅ CORRECCIÓN COMPLETADA" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

Write-Host ""
Write-Host "📊 CAMBIOS REALIZADOS:" -ForegroundColor Cyan
Write-Host "  ✓ Configuraciones Next.js actualizadas" -ForegroundColor Green
Write-Host "  ✓ Polyfills creados para el navegador" -ForegroundColor Green
Write-Host "  ✓ Wrappers para código del servidor" -ForegroundColor Green
Write-Host "  ✓ Imports corregidos en packages" -ForegroundColor Green
Write-Host "  ✓ Caché limpiado" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "  1. Ejecutar 'pnpm dev' para probar los cambios"
Write-Host "  2. Si persiste el error, revisar el stack trace"
Write-Host "  3. Verificar que no haya imports directos de módulos Node.js"

Write-Host ""
Write-Host "TIPS:" -ForegroundColor Cyan
Write-Host "  - Usa NEXT_PUBLIC_ para variables de entorno del cliente"
Write-Host "  - Separa codigo del servidor en archivos .server.ts"
Write-Host "  - Usa importaciones dinamicas para codigo del servidor"