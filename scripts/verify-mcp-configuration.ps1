# Script de verificación MCP
# 🚀 Verificador de Configuración MCP - AltaMedica
# Script para verificar y gestionar todos los servidores MCP disponibles

param(
    [string]$ConfigPath = "configs/mcp/mcp-config.json",
    [switch]$Backup,
    [switch]$List,
    [switch]$Test,
    [switch]$Install,
    [switch]$HealthCheck
)

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Test-McpConfiguration {
    param([string]$Path)
    
    if (-not (Test-Path $Path)) {
        Write-ColorOutput "⚠️  Archivo de configuración no encontrado: $Path" "Yellow"
        return $false
    }
    
    try {
        $config = Get-Content $Path | ConvertFrom-Json
        Write-ColorOutput "✅ Configuración válida encontrada" "Green"
        return $true
    }
    catch {
        Write-ColorOutput "❌ Error al leer configuración: $_" "Red"
        return $false
    }
}

function Get-AvailableMcpServers {
    Write-ColorOutput "🔍 Servidores MCP disponibles en AltaMedica:" "Cyan"
    
    $availableServers = @(
        "filesystem - Gestión de archivos y directorios",
        "memory - Sistema de memoria persistente", 
        "time - Servidor de tiempo",
        "altamedica-dev - Servidor completo ALTAMEDICA DEV",
        "altamedica-analyzer - Analizador rápido Altamedica",
        "codebase-intelligence - Codebase Intelligence MCP",
        "project-mapper - Project Scaffolding MCP",
        "ai-flow-orchestrator - AI Flow Orchestrator MCP",
        "multi-agent-composer - Multi-Agent Composer MCP",
        "enhanced-multi-agent-composer - Enhanced Multi-Agent Composer",
        "smart-completion - Smart Completion MCP",
        "context-memory - Context Memory MCP",
        "copilot-mcp-bridge - Copilot MCP Bridge",
        "medical-mcp - Medical MCP Server",
        "terminal-mcp - Terminal MCP",
        "patient-simulator - Patient Simulator MCP",
        "intelligent-project-analyzer - Intelligent Project Analyzer",
        "system-diagnostic - Complete System Diagnostic",
        "universal-diagnostic - Universal Diagnostic",
        "mcp-protector - MCP Protector",
        "copilot-performance-comparator - Copilot Performance Comparator",
        "conservative-cleanup - Conservative Cleanup",
        "intelligent-garbage-detector - Intelligent Garbage Detector",
        "database-monitor - Database Creation Monitor",
        "demo-sistema-configuracion - Demo Sistema Configuración"
    )
    
    $availableServers | ForEach-Object { Write-ColorOutput "  • $_" "White" }
}

function Backup-Configuration {
    param([string]$Path)
    
    if (Test-Path $Path) {
        $backupPath = "$Path.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $Path $backupPath
        Write-ColorOutput "💾 Respaldo creado: $backupPath" "Green"
    }
}

function Install-McpDependencies {
    Write-ColorOutput "📦 Instalando dependencias MCP..." "Cyan"
    
    $directories = @(
        "mcp-servers",
        "mcp-protected/servers",
        "platform/mcp-servers",
        "tools"
    )
    
    foreach ($dir in $directories) {
        if (Test-Path $dir) {
            Write-ColorOutput "  📁 Instalando en: $dir" "Yellow"
            try {
                Set-Location $dir
                if (Test-Path "package.json") {
                    pnpm install
                    Write-ColorOutput "    ✅ Dependencias instaladas" "Green"
                } else {
                    Write-ColorOutput "    ⚠️  No se encontró package.json" "Yellow"
                }
                Set-Location $PSScriptRoot
            }
            catch {
                Write-ColorOutput "    ❌ Error: $_" "Red"
                Set-Location $PSScriptRoot
            }
        }
    }
}

function Start-HealthCheck {
    Write-ColorOutput "🏥 Iniciando Health Check de MCP..." "Cyan"
    
    if (Test-McpConfiguration -Path $ConfigPath) {
        $config = Get-Content $ConfigPath | ConvertFrom-Json
        $servers = $config.mcpServers.PSObject.Properties
        
        $results = @()
        
        foreach ($server in $servers) {
            $serverName = $server.Name
            $serverConfig = $server.Value
            
            Write-ColorOutput "  🔍 Verificando: $serverName" "Yellow"
            
            # Verificar si el archivo existe
            $filePath = $serverConfig.args[0]
            if (Test-Path $filePath) {
                Write-ColorOutput "    ✅ Archivo encontrado" "Green"
                $results += [PSCustomObject]@{
                    Name = $serverName
                    Status = "Available"
                    File = $filePath
                    Priority = $serverConfig.priority
                }
            } else {
                Write-ColorOutput "    ❌ Archivo no encontrado: $filePath" "Red"
                $results += [PSCustomObject]@{
                    Name = $serverName
                    Status = "Missing"
                    File = $filePath
                    Priority = $serverConfig.priority
                }
            }
        }
        
        # Mostrar resumen
        Write-ColorOutput "`n📊 Resumen del Health Check:" "Cyan"
        $available = ($results | Where-Object { $_.Status -eq "Available" }).Count
        $missing = ($results | Where-Object { $_.Status -eq "Missing" }).Count
        $total = $results.Count
        
        Write-ColorOutput "  ✅ Disponibles: $available/$total" "Green"
        Write-ColorOutput "  ❌ Faltantes: $missing/$total" "Red"
        
        if ($missing -gt 0) {
            Write-ColorOutput "`n⚠️  Servidores faltantes:" "Yellow"
            $results | Where-Object { $_.Status -eq "Missing" } | ForEach-Object {
                Write-ColorOutput "  • $($_.Name) - $($_.File)" "Red"
            }
        }
    }
}

# Ejecución principal
Write-ColorOutput "🤖 Verificador de Configuración MCP - AltaMedica" "Magenta"
Write-ColorOutput "==================================================" "Magenta"

if ($Backup) {
    Backup-Configuration -Path $ConfigPath
}

if ($List) {
    Get-AvailableMcpServers
    exit
}

if ($Install) {
    Install-McpDependencies
    exit
}

if ($HealthCheck) {
    Start-HealthCheck
    exit
}

if ($Test) {
    Write-ColorOutput "🧪 Modo de prueba activado" "Yellow"
    if (Test-McpConfiguration -Path $ConfigPath) {
        $config = Get-Content $ConfigPath | ConvertFrom-Json
        $servers = $config.mcpServers.PSObject.Properties
        
        Write-ColorOutput "🚀 Servidores MCP configurados:" "Green"
        $servers | ForEach-Object { 
            Write-ColorOutput "  • $($_.Name) (Prioridad: $($_.Value.priority))" "White" 
        }
    }
} else {
    if (Test-McpConfiguration -Path $ConfigPath) {
        Write-ColorOutput "📍 Archivo de configuración: $ConfigPath" "Blue"
        
        $config = Get-Content $ConfigPath | ConvertFrom-Json
        $servers = $config.mcpServers.PSObject.Properties.Name
        
        Write-ColorOutput "🚀 Servidores MCP configurados: $($servers.Count)" "Green"
        $servers | ForEach-Object { Write-ColorOutput "  • $_" "White" }
        
        Write-ColorOutput "`n💡 Comandos disponibles:" "Cyan"
        Write-ColorOutput "  • .\verify-mcp-configuration.ps1 -List     # Listar servidores disponibles" "White"
        Write-ColorOutput "  • .\verify-mcp-configuration.ps1 -Test     # Probar configuración" "White"
        Write-ColorOutput "  • .\verify-mcp-configuration.ps1 -Install  # Instalar dependencias" "White"
        Write-ColorOutput "  • .\verify-mcp-configuration.ps1 -HealthCheck # Health check completo" "White"
        Write-ColorOutput "  • .\verify-mcp-configuration.ps1 -Backup   # Crear respaldo" "White"
    } else {
        Write-ColorOutput "⚙️  Creando configuración inicial..." "Yellow"
    }
}