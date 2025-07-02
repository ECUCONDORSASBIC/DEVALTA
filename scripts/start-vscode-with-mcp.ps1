# ALTAMEDICADEV - Script de Inicio VS Code con MCP
# Este script sincroniza MCPs y reinicia VS Code con configuración completa

param(
    [switch]$SkipVSCodeRestart,
    [switch]$DiagnosticOnly
)

Write-Host "🚀 ALTAMEDICADEV - Iniciando VS Code con MCPs" -ForegroundColor Cyan
Write-Host "=" * 60

$WorkspaceRoot = Split-Path -Parent $PSScriptRoot
$McpProtectedPath = Join-Path $WorkspaceRoot "mcp-protected"
$McpConfigPath = Join-Path $WorkspaceRoot "mcp-config.json"

function Test-Prerequisites {
    Write-Host "🔍 Verificando prerequisitos..." -ForegroundColor Yellow

    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ Node.js no encontrado. Instala Node.js primero." -ForegroundColor Red
        exit 1
    }

    # Check workspace structure
    if (-not (Test-Path $WorkspaceRoot)) {
        Write-Host "❌ Workspace root no encontrado: $WorkspaceRoot" -ForegroundColor Red
        exit 1
    }

    Write-Host "✅ Workspace encontrado: $WorkspaceRoot" -ForegroundColor Green
}

function Start-MCPSystem {
    Write-Host "🤖 Iniciando sistema MCP..." -ForegroundColor Yellow

    try {
        # Stop any existing Node processes
        Write-Host "🛑 Deteniendo procesos Node existentes..."
        taskkill /f /im node.exe 2>$null
        Start-Sleep -Seconds 2

        # Start MCP protected system
        if (Test-Path $McpProtectedPath) {
            Set-Location $McpProtectedPath
            Write-Host "🔐 Iniciando sistema de protección MCP..."
            Start-Process -FilePath "node" -ArgumentList "mcp-secure-launcher.js", "start" -WindowStyle Hidden
            Start-Sleep -Seconds 3

            # Verify MCPs are running
            $nodeProcesses = @(Get-Process -Name "node" -ErrorAction SilentlyContinue)
            Write-Host "✅ MCPs iniciados: $($nodeProcesses.Count) procesos Node.js ejecutándose" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Directorio MCP protegido no encontrado" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Error iniciando MCPs: $_" -ForegroundColor Red
    }

    Set-Location $WorkspaceRoot
}

function Sync-MCPConfig {
    Write-Host "🔄 Sincronizando configuración MCP..." -ForegroundColor Yellow

    try {
        # Check if sync tool exists
        $syncToolPath = Join-Path $WorkspaceRoot "tools\sync-mcp-claude-vscode.js"
        if (Test-Path $syncToolPath) {
            node $syncToolPath
            Write-Host "✅ Configuración MCP sincronizada" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Herramienta de sincronización no encontrada" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Error sincronizando MCP: $_" -ForegroundColor Red
    }
}

function Start-VSCode {
    if ($SkipVSCodeRestart) {
        Write-Host "⏭️ Omitiendo reinicio de VS Code (flag -SkipVSCodeRestart)" -ForegroundColor Yellow
        return
    }

    Write-Host "🔄 Reiniciando VS Code..." -ForegroundColor Yellow

    try {
        # Close existing VS Code instances
        $vscodeProcesses = Get-Process -Name "Code*" -ErrorAction SilentlyContinue
        if ($vscodeProcesses) {
            Write-Host "🛑 Cerrando instancias existentes de VS Code..."
            $vscodeProcesses | Stop-Process -Force
            Start-Sleep -Seconds 2
        }

        # Start VS Code with workspace
        Write-Host "🚀 Iniciando VS Code con workspace..."
        Start-Process -FilePath "code" -ArgumentList $WorkspaceRoot -WindowStyle Normal

        Write-Host "✅ VS Code iniciado con MCPs integrados" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error iniciando VS Code: $_" -ForegroundColor Red
    }
}

function Show-Diagnostic {
    Write-Host "🏥 Ejecutando diagnóstico del sistema..." -ForegroundColor Yellow

    try {
        $diagnosticPath = Join-Path $WorkspaceRoot "tools\universal-diagnostic.js"
        if (Test-Path $diagnosticPath) {
            node $diagnosticPath
        } else {
            Write-Host "⚠️ Herramienta de diagnóstico no encontrada" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Error en diagnóstico: $_" -ForegroundColor Red
    }
}

# Main execution
try {
    Test-Prerequisites

    if ($DiagnosticOnly) {
        Show-Diagnostic
        exit 0
    }

    Start-MCPSystem
    Sync-MCPConfig
    Start-VSCode

    Write-Host "`n🎉 PROCESO COMPLETADO" -ForegroundColor Green
    Write-Host "VS Code debería estar ejecutándose con todos los MCPs activos" -ForegroundColor Green
    Write-Host "Usa las herramientas MCP desde VS Code para verificar funcionamiento" -ForegroundColor Yellow

} catch {
    Write-Host "❌ Error crítico: $_" -ForegroundColor Red
    exit 1
}
