# Script para activar MCPs en Cursor - Altamedica
# Autor: Eduardo
# Fecha: 2025-01-02

param(
    [switch]$Install,
    [switch]$Start,
    [switch]$Stop,
    [switch]$Status,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

# Configuración
$PROJECT_ROOT = Get-Location
$MCP_SERVERS = @(
    @{
        Name = "terminal"
        Path = "mcp-servers/enhanced-multi-agent-mcp.js"
        Description = "Terminal y comandos avanzados"
    },
    @{
        Name = "codebase-intelligence"
        Path = "mcp-protected/servers/codebase-intelligence-mcp.js"
        Description = "Inteligencia del codebase"
    },
    @{
        Name = "ai-flow-orchestrator"
        Path = "mcp-protected/servers/ai-flow-orchestrator-mcp.js"
        Description = "Orquestador de flujos AI"
    },
    @{
        Name = "frontend-error-handler"
        Path = "mcp-protected/servers/frontend-error-handler.js"
        Description = "Manejador de errores frontend"
    },
    @{
        Name = "system-configuration"
        Path = "mcp-servers/system-configuration.js"
        Description = "Configuración del sistema"
    }
)

function Show-Help {
    Write-Host @"
=== MCP Cursor Activator - Altamedica ===

Uso: .\activate-cursor-mcp.ps1 [OPCIÓN]

Opciones:
  -Install    Instalar dependencias de MCPs
  -Start      Iniciar servidores MCP
  -Stop       Detener servidores MCP
  -Status     Mostrar estado de servidores
  -Help       Mostrar esta ayuda

Ejemplos:
  .\activate-cursor-mcp.ps1 -Install
  .\activate-cursor-mcp.ps1 -Start
  .\activate-cursor-mcp.ps1 -Status

"@ -ForegroundColor Cyan
}

function Install-MCPDependencies {
    Write-Host "Instalando dependencias de MCPs..." -ForegroundColor Yellow
    
    try {
        # Instalar dependencias en mcp-servers
        if (Test-Path "mcp-servers/package.json") {
            Set-Location "mcp-servers"
            pnpm install
            Set-Location $PROJECT_ROOT
        }
        
        # Instalar dependencias en mcp-protected
        if (Test-Path "mcp-protected/package.json") {
            Set-Location "mcp-protected"
            pnpm install
            Set-Location $PROJECT_ROOT
        }
        
        Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Error instalando dependencias: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Start-MCPServers {
    Write-Host "Iniciando servidores MCP..." -ForegroundColor Yellow
    
    foreach ($server in $MCP_SERVERS) {
        $serverPath = Join-Path $PROJECT_ROOT $server.Path
        
        if (Test-Path $serverPath) {
            Write-Host "🚀 Iniciando $($server.Name)..." -ForegroundColor Blue
            
            try {
                $env:PROJECT_ROOT = $PROJECT_ROOT
                $env:NODE_ENV = "development"
                
                Start-Process -FilePath "node" -ArgumentList $serverPath -WindowStyle Hidden -PassThru | Out-Null
                
                Write-Host "✅ $($server.Name) iniciado" -ForegroundColor Green
            }
            catch {
                Write-Host "❌ Error iniciando $($server.Name): $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        else {
            Write-Host "⚠️  Servidor $($server.Name) no encontrado en: $serverPath" -ForegroundColor Yellow
        }
    }
}

function Stop-MCPServers {
    Write-Host "Deteniendo servidores MCP..." -ForegroundColor Yellow
    
    try {
        Get-Process -Name "node" -ErrorAction SilentlyContinue | 
        Where-Object { $_.ProcessName -eq "node" } | 
        Stop-Process -Force
        
        Write-Host "✅ Servidores MCP detenidos" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Error deteniendo servidores: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Get-MCPStatus {
    Write-Host "Estado de servidores MCP:" -ForegroundColor Yellow
    
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    
    foreach ($server in $MCP_SERVERS) {
        $serverPath = Join-Path $PROJECT_ROOT $server.Path
        $isRunning = $nodeProcesses | Where-Object { $_.CommandLine -like "*$($server.Name)*" }
        
        if ($isRunning) {
            Write-Host "🟢 $($server.Name) - $($server.Description)" -ForegroundColor Green
        }
        else {
            Write-Host "🔴 $($server.Name) - $($server.Description)" -ForegroundColor Red
        }
    }
}

# Lógica principal
if ($Help) {
    Show-Help
}
elseif ($Install) {
    Install-MCPDependencies
}
elseif ($Start) {
    Start-MCPServers
}
elseif ($Stop) {
    Stop-MCPServers
}
elseif ($Status) {
    Get-MCPStatus
}
else {
    Show-Help
} 