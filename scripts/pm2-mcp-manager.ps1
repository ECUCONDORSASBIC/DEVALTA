# PM2 MCP Manager - Altamedica
# Autor: Eduardo
# Fecha: 2025-01-02

param(
    [switch]$Start,
    [switch]$Stop,
    [switch]$Restart,
    [switch]$Status,
    [switch]$Logs,
    [switch]$Monitor,
    [switch]$Save,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host @"
=== PM2 MCP Manager - Altamedica ===

Uso: .\pm2-mcp-manager.ps1 [OPCIÓN]

Opciones:
  -Start     Iniciar todos los MCPs con PM2
  -Stop      Detener todos los MCPs
  -Restart   Reiniciar todos los MCPs
  -Status    Mostrar estado de todos los MCPs
  -Logs      Mostrar logs de todos los MCPs
  -Monitor   Abrir monitor interactivo de PM2
  -Save      Guardar configuración actual de PM2
  -Help      Mostrar esta ayuda

Ejemplos:
  .\pm2-mcp-manager.ps1 -Start
  .\pm2-mcp-manager.ps1 -Status
  .\pm2-mcp-manager.ps1 -Logs

"@ -ForegroundColor Cyan
}

function Start-MCPs {
    Write-Host "🚀 Iniciando todos los MCPs con PM2..." -ForegroundColor Yellow
    pm2 start ecosystem.config.cjs
    Write-Host "✅ MCPs iniciados correctamente" -ForegroundColor Green
}

function Stop-MCPs {
    Write-Host "🛑 Deteniendo todos los MCPs..." -ForegroundColor Yellow
    pm2 stop all
    Write-Host "✅ MCPs detenidos" -ForegroundColor Green
}

function Restart-MCPs {
    Write-Host "🔄 Reiniciando todos los MCPs..." -ForegroundColor Yellow
    pm2 restart all
    Write-Host "✅ MCPs reiniciados" -ForegroundColor Green
}

function Show-Status {
    Write-Host "📊 Estado de los MCPs:" -ForegroundColor Yellow
    pm2 status
}

function Show-Logs {
    Write-Host "📋 Logs de los MCPs:" -ForegroundColor Yellow
    Write-Host "Presiona Ctrl+C para salir" -ForegroundColor Gray
    pm2 logs
}

function Open-Monitor {
    Write-Host "📺 Abriendo monitor interactivo de PM2..." -ForegroundColor Yellow
    pm2 monit
}

function Save-Configuration {
    Write-Host "💾 Guardando configuración de PM2..." -ForegroundColor Yellow
    pm2 save
    Write-Host "✅ Configuración guardada" -ForegroundColor Green
}

# Lógica principal
if ($Help) {
    Show-Help
}
elseif ($Start) {
    Start-MCPs
}
elseif ($Stop) {
    Stop-MCPs
}
elseif ($Restart) {
    Restart-MCPs
}
elseif ($Status) {
    Show-Status
}
elseif ($Logs) {
    Show-Logs
}
elseif ($Monitor) {
    Open-Monitor
}
elseif ($Save) {
    Save-Configuration
}
else {
    Show-Help
} 