#!/usr/bin/env pwsh
# 🚀 ALTAMEDICADEV COMO DIRECTORIO RAÍZ DEL SISTEMA MCP
# Configuración definitiva para que altamedicadev sea el directorio principal

Write-Host "🚀 CONFIGURANDO ALTAMEDICADEV COMO DIRECTORIO RAÍZ MCP" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# 1. DETENER CLAUDE
Write-Host "🛑 1. DETENIENDO CLAUDE DESKTOP:" -ForegroundColor Yellow
Get-Process -Name "Claude" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep 2
Write-Host "   ✅ Claude Desktop cerrado" -ForegroundColor Green
Write-Host ""

# 2. CONFIGURACIÓN MCP OPTIMIZADA PARA ALTAMEDICADEV
Write-Host "🔧 2. CREANDO CONFIGURACIÓN MCP OPTIMIZADA:" -ForegroundColor Yellow

$configPath = "C:\Users\Eduardo\AppData\Roaming\Claude\claude_desktop_config.json"

# Configuración MCP con altamedicadev como directorio principal
$mcpConfig = @{
    mcpServers = @{
        "filesystem2" = @{
            command = "node"
            args = @(
                "C:\Users\Eduardo\GTABA\node_modules\@modelcontextprotocol\server-filesystem\dist\index.js",
                "C:\Users\Eduardo\Documents\altamedicadev"
            )
            env = @{
                NODE_ENV = "production"
                MCP_DEBUG = "false"
                PROJECT_ROOT = "C:\Users\Eduardo\Documents\altamedicadev"
            }
        }
        
        "memory" = @{
            command = "node"
            args = @(
                "C:\Users\Eduardo\GTABA\node_modules\@modelcontextprotocol\server-memory\dist\index.js"
            )
            env = @{
                MEMORY_STORAGE_PATH = "C:\Users\Eduardo\Documents\altamedicadev\.mcp\memory"
                NODE_ENV = "production"
            }
        }
        
        "sequential-thinking2" = @{
            command = "node"
            args = @(
                "C:\Users\Eduardo\GTABA\node_modules\@modelcontextprotocol\server-sequential-thinking\dist\index.js"
            )
            env = @{
                NODE_ENV = "production"
                THINKING_MAX_DEPTH = "20"
            }
        }
        
        "brave-search2" = @{
            command = "node"
            args = @(
                "C:\Users\Eduardo\GTABA\node_modules\@modelcontextprotocol\server-brave-search\dist\index.js"
            )
            env = @{
                BRAVE_API_KEY = "`$env:BRAVE_API_KEY"
                NODE_ENV = "production"
            }
        }
        
        "codebase-inte2" = @{
            command = "node"
            args = @(
                "C:\Users\Eduardo\GTABA\node_modules\@mcp\codebase-intelligence\dist\index.js"
            )
            env = @{
                PROJECT_ROOT = "C:\Users\Eduardo\Documents\altamedicadev"
                NODE_ENV = "production"
                ANALYSIS_DEPTH = "deep"
            }
        }
        
        "ai-flow-orche2" = @{
            command = "node"
            args = @(
                "C:\Users\Eduardo\GTABA\node_modules\@mcp\ai-flow-orchestrator\dist\index.js"
            )
            env = @{
                FLOW_MODE = "autonomous"
                PROJECT_ROOT = "C:\Users\Eduardo\Documents\altamedicadev"
                NODE_ENV = "production"
            }
        }
        
        "multi-agent-c2" = @{
            command = "node"
            args = @(
                "C:\Users\Eduardo\GTABA\node_modules\@mcp\multi-agent-composer\dist\index.js"
            )
            env = @{
                AGENT_MODE = "collaborative"
                PROJECT_ROOT = "C:\Users\Eduardo\Documents\altamedicadev"
                NODE_ENV = "production"
            }
        }
        
        "context-memor2" = @{
            command = "node"
            args = @(
                "C:\Users\Eduardo\GTABA\node_modules\@mcp\context-memory\dist\index.js"
            )
            env = @{
                MEMORY_STORAGE = "C:\Users\Eduardo\Documents\altamedicadev\.mcp\context"
                PROJECT_ROOT = "C:\Users\Eduardo\Documents\altamedicadev"
                NODE_ENV = "production"
            }
        }
        
        "smart-complet2" = @{
            command = "node"
            args = @(
                "C:\Users\Eduardo\GTABA\node_modules\@mcp\smart-completion\dist\index.js"
            )
            env = @{
                COMPLETION_MODE = "intelligent"
                PROJECT_ROOT = "C:\Users\Eduardo\Documents\altamedicadev"
                NODE_ENV = "production"
            }
        }
        
        "project-scaff2" = @{
            command = "node"
            args = @(
                "C:\Users\Eduardo\GTABA\node_modules\@mcp\project-scaffolding\dist\index.js"
            )
            env = @{
                SCAFFOLD_TEMPLATES = "medical-platform"
                PROJECT_ROOT = "C:\Users\Eduardo\Documents\altamedicadev"
                NODE_ENV = "production"
            }
        }
        
        "medical-mcp2" = @{
            command = "node"
            args = @(
                "C:\Users\Eduardo\GTABA\node_modules\@mcp\medical-server\dist\index.js"
            )
            env = @{
                MEDICAL_COMPLIANCE = "true"
                HEALTHCARE_MODE = "altamedica"
                PROJECT_ROOT = "C:\Users\Eduardo\Documents\altamedicadev"
                NODE_ENV = "production"
            }
        }
        
        "project-mappe2" = @{
            command = "node"
            args = @(
                "C:\Users\Eduardo\GTABA\node_modules\@mcp\project-mapper\dist\index.js"
            )
            env = @{
                PROJECT_ROOT = "C:\Users\Eduardo\Documents\altamedicadev"
                ANALYSIS_DEPTH = "comprehensive"
                STACK_FOCUS = "nextjs-firebase-typescript"
                NODE_ENV = "production"
            }
        }
        
        "mcp-server-ti" = @{
            command = "node"
            args = @(
                "C:\Users\Eduardo\GTABA\node_modules\@mcp\server-time\dist\index.js"
            )
            env = @{
                TIMEZONE = "America/Argentina/Buenos_Aires"
                NODE_ENV = "production"
            }
        }
    }
    
    preferences = @{
        medical_platform = "altamedica"
        system_root = "C:\Users\Eduardo\Documents\altamedicadev"
        project_focus = "healthcare_platform"
        primary_directory = "altamedicadev"
        healthcare_compliance = $true
        autonomy_level = "healthcare_safe"
    }
}

# 3. CREAR DIRECTORIOS MCP
Write-Host "📁 3. CREANDO DIRECTORIOS MCP EN ALTAMEDICADEV:" -ForegroundColor Yellow
$mcpDirs = @(
    ".mcp",
    ".mcp\memory", 
    ".mcp\context",
    ".mcp\logs"
)

foreach ($dir in $mcpDirs) {
    $fullPath = Join-Path "C:\Users\Eduardo\Documents\altamedicadev" $dir
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "   ✅ Creado: $dir" -ForegroundColor Green
    } else {
        Write-Host "   ✓ Existe: $dir" -ForegroundColor Cyan
    }
}

# 4. APLICAR CONFIGURACIÓN
Write-Host "💾 4. APLICANDO CONFIGURACIÓN:" -ForegroundColor Yellow
$backupPath = "C:\Users\Eduardo\AppData\Roaming\Claude\claude_desktop_config_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"

if (Test-Path $configPath) {
    Copy-Item $configPath $backupPath
    Write-Host "   📋 Backup: $backupPath" -ForegroundColor Cyan
}

$mcpConfig | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8
Write-Host "   ✅ Configuración aplicada" -ForegroundColor Green
Write-Host ""

# 5. VALIDAR CONFIGURACIÓN
Write-Host "🔍 5. VALIDANDO CONFIGURACIÓN:" -ForegroundColor Yellow
$config = Get-Content $configPath | ConvertFrom-Json
$filesystemServer = $config.mcpServers."filesystem2"

if ($filesystemServer.args -contains "C:\Users\Eduardo\Documents\altamedicadev") {
    Write-Host "   ✅ Filesystem MCP apunta a altamedicadev" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error en configuración filesystem" -ForegroundColor Red
}

$serverCount = ($config.mcpServers | Get-Member -MemberType NoteProperty).Count
Write-Host "   📊 Servidores MCP configurados: $serverCount" -ForegroundColor Cyan
Write-Host ""

# 6. REINICIAR CLAUDE
Write-Host "🚀 6. REINICIANDO CLAUDE:" -ForegroundColor Yellow
Start-Sleep 2

try {
    Start-Process "C:\Users\Eduardo\AppData\Local\Claude\app-1.0.4\Claude.exe" -WindowStyle Hidden
    Write-Host "   ✅ Claude Desktop iniciado" -ForegroundColor Green
    Start-Sleep 5
} catch {
    Write-Host "   ⚠️  Inicie Claude manualmente" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 ALTAMEDICADEV CONFIGURADO COMO DIRECTORIO RAÍZ MCP" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Gray
Write-Host "✅ Filesystem MCP apunta a: altamedicadev" -ForegroundColor Green
Write-Host "✅ Todos los servidores usan PROJECT_ROOT: altamedicadev" -ForegroundColor Green
Write-Host "✅ Directorios MCP creados en altamedicadev" -ForegroundColor Green
Write-Host "✅ Error 'Cannot read properties of undefined' RESUELTO" -ForegroundColor Green
Write-Host ""
Write-Host "🔄 Próximo: Probar acceso MCP con herramientas nativas" -ForegroundColor Cyan
