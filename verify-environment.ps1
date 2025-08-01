# AltaMedica - Verificación Completa del Entorno
# Script para verificar que todo esté funcionando correctamente

Write-Host "🏥 AltaMedica - Verificación Completa del Entorno" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

# Función para verificar comandos
function Test-Command {
    param([string]$Command)
    try {
        if (Get-Command $Command -ErrorAction SilentlyContinue) {
            Write-Host "✅ $Command" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ $Command - NO ENCONTRADO" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ $Command - ERROR" -ForegroundColor Red
        return $false
    }
}

# Verificar herramientas básicas
Write-Host "`n🔧 Herramientas Básicas:" -ForegroundColor Yellow
$tools = @("node", "npm", "git", "docker", "python")
$allToolsOk = $true
foreach ($tool in $tools) {
    if (!(Test-Command $tool)) { $allToolsOk = $false }
}

# Verificar pnpm específicamente
Write-Host "`n📦 Package Managers:" -ForegroundColor Yellow
if (Test-Command "pnpm") {
    pnpm --version | ForEach-Object { Write-Host "   Versión: $_" -ForegroundColor Cyan }
} else {
    Write-Host "⚠️ pnpm no disponible - usando npm como alternativa" -ForegroundColor Yellow
}

# Verificar versiones de Node.js
Write-Host "`n📊 Versiones Actuales:" -ForegroundColor Yellow
Write-Host "Node.js: " -NoNewline -ForegroundColor Cyan
node --version
Write-Host "npm: " -NoNewline -ForegroundColor Cyan
npm --version
Write-Host "PowerShell: " -NoNewline -ForegroundColor Cyan
$PSVersionTable.PSVersion

# Verificar estructura del proyecto
Write-Host "`n📁 Estructura del Proyecto:" -ForegroundColor Yellow
$projectDirs = @("apps/api-server", "apps/doctors", "apps/patients", "apps/companies", "apps/admin", "apps/signaling-server", "packages")
foreach ($dir in $projectDirs) {
    if (Test-Path $dir) {
        Write-Host "✅ $dir" -ForegroundColor Green
    } else {
        Write-Host "❌ $dir - NO ENCONTRADO" -ForegroundColor Red
        $allToolsOk = $false
    }
}

# Verificar archivos de configuración críticos
Write-Host "`n⚙️ Archivos de Configuración:" -ForegroundColor Yellow
$configFiles = @("package.json", "pnpm-workspace.yaml", "docker-compose.yml", "CLAUDE.md")
foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - NO ENCONTRADO" -ForegroundColor Red
    }
}

# Verificar puertos disponibles
Write-Host "`n🌐 Verificando Puertos AltaMedica:" -ForegroundColor Yellow
$ports = @(3000, 3001, 3002, 3003, 3004, 3005, 8888)
foreach ($port in $ports) {
    $portUsed = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($portUsed) {
        Write-Host "⚠️ Puerto $port en uso" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Puerto $port disponible" -ForegroundColor Green
    }
}

# Test de conectividad Firebase
Write-Host "`n🔥 Verificando conectividad externa:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://firebase.google.com" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Conectividad Firebase OK" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Problemas de conectividad a Firebase" -ForegroundColor Yellow
}

# Verificar variables de entorno importantes
Write-Host "`n🌍 Variables de Entorno:" -ForegroundColor Yellow
$envVars = @("NODE_OPTIONS", "CYPRESS_CACHE_FOLDER")
foreach ($var in $envVars) {
    $value = [Environment]::GetEnvironmentVariable($var, "User")
    if ($value) {
        Write-Host "✅ $var = $value" -ForegroundColor Green
    } else {
        Write-Host "⚠️ $var no configurada" -ForegroundColor Yellow
    }
}

# Resumen final
Write-Host "`n" + "=" * 60 -ForegroundColor Gray
if ($allToolsOk) {
    Write-Host "🎉 ENTORNO LISTO PARA DESARROLLO ALTAMEDICA" -ForegroundColor Green
    Write-Host "🚀 Próximos pasos:" -ForegroundColor Cyan
    Write-Host "   1. Ejecutar: npm install" -ForegroundColor White
    Write-Host "   2. Configurar: .env.local files" -ForegroundColor White
    Write-Host "   3. Iniciar: npm run dev:all" -ForegroundColor White
} else {
    Write-Host "⚠️ ENTORNO REQUIERE CONFIGURACIÓN ADICIONAL" -ForegroundColor Yellow
    Write-Host "🔧 Ejecuta: setup-windows-environment.ps1" -ForegroundColor Cyan
}
Write-Host "=" * 60 -ForegroundColor Gray