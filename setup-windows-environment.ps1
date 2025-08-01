# AltaMedica - Setup Optimizado para Entorno Windows
# Ejecutar como Administrador en PowerShell

Write-Host "🏥 AltaMedica - Configuración de Entorno Windows Optimizado" -ForegroundColor Green

# Verificar y actualizar PowerShell
Write-Host "`n🔧 Verificando PowerShell..." -ForegroundColor Yellow
$currentPS = $PSVersionTable.PSVersion
Write-Host "PowerShell actual: $currentPS" -ForegroundColor Cyan

if ($currentPS.Major -lt 7) {
    Write-Host "⚠️ Recomendamos PowerShell 7+ para mejor rendimiento" -ForegroundColor Yellow
    Write-Host "Instalar con: winget install Microsoft.PowerShell" -ForegroundColor Cyan
}

# Verificar Chocolatey para gestión de paquetes
Write-Host "`n🍫 Verificando Chocolatey..." -ForegroundColor Yellow
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "⚡ Instalando Chocolatey para gestión de paquetes..." -ForegroundColor Green
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
} else {
    Write-Host "✅ Chocolatey ya está instalado" -ForegroundColor Green
    choco upgrade chocolatey -y
}

# Instalar/Actualizar herramientas esenciales
Write-Host "`n⚡ Instalando/Actualizando herramientas de desarrollo..." -ForegroundColor Green

# Node.js LTS
Write-Host "📦 Node.js..." -ForegroundColor Cyan
choco upgrade nodejs-lts -y

# Git
Write-Host "🔀 Git..." -ForegroundColor Cyan
choco upgrade git -y

# VS Code
Write-Host "💻 VS Code..." -ForegroundColor Cyan
choco upgrade vscode -y

# Docker Desktop
Write-Host "🐳 Docker Desktop..." -ForegroundColor Cyan
choco upgrade docker-desktop -y

# Python (para scripts alternativos)
Write-Host "🐍 Python..." -ForegroundColor Cyan
choco upgrade python -y

# Herramientas médicas específicas
Write-Host "`n🏥 Instalando herramientas médicas..." -ForegroundColor Green

# Instalar pnpm globalmente
Write-Host "📦 pnpm..." -ForegroundColor Cyan
npm install -g pnpm@latest

# Cypress dependencies para Windows
Write-Host "🧪 Cypress dependencies..." -ForegroundColor Cyan
npm install -g cypress@latest

# Firebase CLI
Write-Host "🔥 Firebase CLI..." -ForegroundColor Cyan
npm install -g firebase-tools@latest

# Configurar políticas de ejecución optimizadas
Write-Host "`n🔐 Configurando políticas de seguridad..." -ForegroundColor Yellow
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force

# Configurar variables de entorno
Write-Host "`n🌍 Configurando variables de entorno..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("NODE_OPTIONS", "--max-old-space-size=8192", "User")
[Environment]::SetEnvironmentVariable("CYPRESS_CACHE_FOLDER", "$env:USERPROFILE\.cache\Cypress", "User")

# Verificar instalaciones
Write-Host "`n✅ Verificando instalaciones..." -ForegroundColor Green
Write-Host "Node.js: " -NoNewline; node --version
Write-Host "npm: " -NoNewline; npm --version
Write-Host "pnpm: " -NoNewline; pnpm --version
Write-Host "Git: " -NoNewline; git --version
Write-Host "Docker: " -NoNewline; docker --version
Write-Host "Python: " -NoNewline; python --version

Write-Host "`n🎯 Configuración completada!" -ForegroundColor Green
Write-Host "🔄 Reinicia tu terminal para cargar las nuevas variables de entorno" -ForegroundColor Yellow
Write-Host "📝 Próximo paso: Ejecutar update-dependencies.ps1" -ForegroundColor Cyan