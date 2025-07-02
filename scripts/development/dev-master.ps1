#!/usr/bin/env pwsh
# 🎯 COMANDO MAESTRO ALTAMEDICA DEV - Todo en uno

param(
    [string]$Action = "run"
)

Write-Host "🎯 ALTAMEDICA DEV - COMANDO MAESTRO" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Verificar directorio
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No estás en el directorio del proyecto ALTAMEDICA" -ForegroundColor Red
    Write-Host "📍 Navega a: C:\Users\Eduardo\Documents\altamedicadev" -ForegroundColor Yellow
    exit 1
}

switch ($Action.ToLower()) {
    "run" {
        Write-Host "🚀 Ejecutando ALTAMEDICA DEV completo..." -ForegroundColor Yellow
        Write-Host ""
        
        # Ejecutar validación y configuración
        node .\tools\mcp-altamedica-dev.js
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ ALTAMEDICA DEV configurado exitosamente" -ForegroundColor Green
            Write-Host "🎯 Servidores MCP listos para GitHub Claude" -ForegroundColor Green
        } else {
            Write-Host "❌ Error en la configuración" -ForegroundColor Red
        }
    }
    
    "validate" {
        Write-Host "🧪 Ejecutando validación completa..." -ForegroundColor Yellow
        Write-Host ""
        
        node .\tools\validate-mcp-altamedica-dev.js
    }
    
    "quick" {
        Write-Host "⚡ Verificación rápida..." -ForegroundColor Yellow
        Write-Host ""
        
        node .\tools\mcp-basic.js
    }
    
    "status" {
        Write-Host "📊 Estado actual del proyecto..." -ForegroundColor Yellow
        Write-Host ""
        
        # Información básica
        Write-Host "📍 Directorio: $PWD" -ForegroundColor Cyan
        Write-Host "📦 Proyecto: $(Get-Content package.json | ConvertFrom-Json | Select-Object -ExpandProperty name)" -ForegroundColor Cyan
        Write-Host "🏷️ Versión: $(Get-Content package.json | ConvertFrom-Json | Select-Object -ExpandProperty version)" -ForegroundColor Cyan
        
        # Verificar archivos MCP
        $mcpFiles = @("mcp-config.json", "tools\mcp-basic.js", "tools\mcp-altamedica-dev.js")
        Write-Host ""
        Write-Host "🔧 Archivos MCP:" -ForegroundColor Yellow
        foreach ($file in $mcpFiles) {
            if (Test-Path $file) {
                Write-Host "   ✅ $file" -ForegroundColor Green
            } else {
                Write-Host "   ❌ $file" -ForegroundColor Red
            }
        }
    }
    
    "help" {
        Write-Host "📚 COMANDOS DISPONIBLES:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "   .\dev-master.ps1 run       - Configurar todo el sistema MCP" -ForegroundColor White
        Write-Host "   .\dev-master.ps1 validate  - Validación completa del sistema" -ForegroundColor White
        Write-Host "   .\dev-master.ps1 quick     - Verificación rápida" -ForegroundColor White
        Write-Host "   .\dev-master.ps1 status    - Estado actual del proyecto" -ForegroundColor White
        Write-Host "   .\dev-master.ps1 help      - Mostrar esta ayuda" -ForegroundColor White
        Write-Host ""
        Write-Host "🎯 Para uso normal: .\dev-master.ps1" -ForegroundColor Green
    }
    
    default {
        Write-Host "❌ Acción desconocida: $Action" -ForegroundColor Red
        Write-Host "💡 Usa: .\dev-master.ps1 help" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎯 ALTAMEDICA DEV - Comando completado" -ForegroundColor Green
