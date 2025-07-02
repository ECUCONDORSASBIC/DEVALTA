# Integrador-MCP-AltaMedica.ps1 - VERSIÓN CORREGIDA
# Integra automáticamente todos los MCP personalizados de AltaMedica en Claude Desktop
# Autor: Agente Experto AltaMedica
# Versión: 1.1

param(
    [switch]$InstalarTodos,
    [switch]$VerificarConfiguracion,
    [switch]$RespaldoConfiguracion,
    [switch]$ValidarServidores,
    [string[]]$ServidoresEspecificos = @()
)

# Configuración de rutas
$ConfiguracionClaude = "$env:APPDATA\Claude\claude_desktop_config.json"
$DirectorioMCP = "C:\Users\Eduardo\Documents\devaltamedica\mcp-protected\servers"
$ConfiguracionTrabajo = "$DirectorioMCP\claude_desktop_config_working_20250702.json"

# Definición de servidores MCP AltaMedica
$ServidoresMCP = @{
    "ai-flow-orchestrator" = @{
        "archivo" = "ai-flow-orchestrator-mcp.js"
        "descripcion" = "Orquestador de flujos de trabajo de IA con gestión de estados"
        "dependencias" = @("@anthropic-ai/claude-3-sonnet")
    }
    "codebase-intelligence" = @{
        "archivo" = "codebase-intelligence-mcp.js"
        "descripcion" = "Análisis inteligente de código fuente y arquitectura"
        "dependencias" = @("typescript", "eslint")
    }
    "context-memory" = @{
        "archivo" = "context-memory-mcp.js"
        "descripcion" = "Sistema de memoria contextual persistente"
        "dependencias" = @("sqlite3", "node-cache")
    }
    "multi-agent-composer" = @{
        "archivo" = "multi-agent-composer-mcp.js"
        "descripcion" = "Compositor de múltiples agentes especializados"
        "dependencias" = @("rxjs", "lodash")
    }
    "smart-completion" = @{
        "archivo" = "smart-completion-mcp.js"
        "descripcion" = "Completado inteligente de código con análisis semántico"
        "dependencias" = @("openai", "tiktoken")
    }
}

function Write-EstadoOperacion {
    param(
        [string]$Mensaje,
        [string]$Tipo = "Info"
    )
    
    $Colores = @{
        "Exito" = "Green"
        "Error" = "Red"
        "Advertencia" = "Yellow"
        "Info" = "Cyan"
        "Proceso" = "Blue"
    }
    
    $Simbolos = @{
        "Exito" = "✅"
        "Error" = "❌"
        "Advertencia" = "⚠️"
        "Info" = "ℹ️"
        "Proceso" = "🔄"
    }
    
    Write-Host "$($Simbolos[$Tipo]) $Mensaje" -ForegroundColor $Colores[$Tipo]
}

function Test-ArchivoMCP {
    param([string]$RutaArchivo)
    
    if (-not (Test-Path $RutaArchivo)) {
        Write-EstadoOperacion "Archivo MCP no encontrado: $RutaArchivo" "Error"
        return $false
    }
    
    # Validar estructura básica del archivo MCP - VERSIÓN CORREGIDA
    $contenido = Get-Content $RutaArchivo -Raw
    if ($contenido -match "#!/usr/bin/env node" -or 
        $contenido -match "class.*\{" -or 
        $contenido -match "Server.*=" -or
        $contenido -match "StdioServerTransport") {
        Write-EstadoOperacion "Validación exitosa: $(Split-Path $RutaArchivo -Leaf)" "Exito"
        return $true
    }
    
    Write-EstadoOperacion "Estructura MCP inválida en: $(Split-Path $RutaArchivo -Leaf)" "Error"
    return $false
}

function New-ConfiguracionMCP {
    Write-EstadoOperacion "Generando configuración MCP completa para AltaMedica..." "Proceso"
    
    # Crear hashtable en lugar de PSCustomObject para evitar problemas con ContainsKey
    $configuracion = @{
        mcpServers = @{}
    }
    
    # Cargar configuración existente si existe
    if (Test-Path $ConfiguracionClaude) {
        try {
            $configuracionExistente = Get-Content $ConfiguracionClaude | ConvertFrom-Json
            if ($configuracionExistente.mcpServers) {
                # Convertir PSCustomObject a hashtable
                $configuracionExistente.mcpServers.PSObject.Properties | ForEach-Object {
                    $configuracion.mcpServers[$_.Name] = @{
                        command = $_.Value.command
                        args = @($_.Value.args)
                        env = @{}
                    }
                    if ($_.Value.env) {
                        $_.Value.env.PSObject.Properties | ForEach-Object {
                            $configuracion.mcpServers[$_.Name].env[$_.Name] = $_.Value
                        }
                    }
                }
            }
        }
        catch {
            Write-EstadoOperacion "Error al leer configuración existente: $_" "Advertencia"
        }
    }
    
    # Agregar servidores MCP de AltaMedica
    foreach ($servidor in $ServidoresMCP.Keys) {
        $archivoServidor = Join-Path $DirectorioMCP $ServidoresMCP[$servidor].archivo
        
        if (Test-ArchivoMCP $archivoServidor) {
            $configuracion.mcpServers[$servidor] = @{
                command = "node"
                args = @($archivoServidor)
                env = @{
                    NODE_ENV = "production"
                    MCP_WORKSPACE = "C:\Users\Eduardo\Documents\devaltamedica"
                    ALTAMEDICA_ENV = "development"
                }
            }
            
            Write-EstadoOperacion "Servidor $servidor configurado correctamente" "Exito"
        }
    }
    
    # Agregar servidores estándar esenciales
    $servidoresEstandar = @{
        "filesystem" = @{
            command = "npx"
            args = @("-y", "@modelcontextprotocol/server-filesystem", "C:\Users\Eduardo\Documents\devaltamedica")
            env = @{}
        }
        "memory" = @{
            command = "npx"
            args = @("-y", "@modelcontextprotocol/server-memory")
            env = @{}
        }
    }
    
    foreach ($servidor in $servidoresEstandar.Keys) {
        if (-not $configuracion.mcpServers.ContainsKey($servidor)) {
            $configuracion.mcpServers[$servidor] = $servidoresEstandar[$servidor]
            Write-EstadoOperacion "Servidor estándar $servidor agregado" "Info"
        }
    }
    
    return $configuracion
}

function Backup-ConfiguracionClaude {
    if (Test-Path $ConfiguracionClaude) {
        $rutaBackup = "$ConfiguracionClaude.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $ConfiguracionClaude $rutaBackup
        Write-EstadoOperacion "Respaldo creado: $rutaBackup" "Exito"
        return $rutaBackup
    }
    return $null
}

function Test-ValidezConfiguracion {
    param([hashtable]$Configuracion)
    
    if (-not $Configuracion.mcpServers) {
        Write-EstadoOperacion "Configuración inválida: falta mcpServers" "Error"
        return $false
    }
    
    $servidoresValidos = 0
    foreach ($servidor in $Configuracion.mcpServers.Keys) {
        $config = $Configuracion.mcpServers[$servidor]
        if ($config.command -and $config.args) {
            $servidoresValidos++
        }
    }
    
    Write-EstadoOperacion "Servidores MCP válidos detectados: $servidoresValidos" "Info"
    return $servidoresValidos -gt 0
}

function Install-TodosLosMCP {
    Write-EstadoOperacion "Iniciando instalación completa de MCP AltaMedica..." "Proceso"
    
    # Crear respaldo
    $backup = Backup-ConfiguracionClaude
    
    # Generar nueva configuración
    $nuevaConfiguracion = New-ConfiguracionMCP
    
    # Validar configuración
    if (-not (Test-ValidezConfiguracion $nuevaConfiguracion)) {
        Write-EstadoOperacion "Configuración generada inválida. Abortando." "Error"
        return $false
    }
    
    # Crear directorio de Claude si no existe
    $directorioClaude = Split-Path $ConfiguracionClaude -Parent
    if (-not (Test-Path $directorioClaude)) {
        New-Item -ItemType Directory -Path $directorioClaude -Force | Out-Null
        Write-EstadoOperacion "Directorio Claude creado: $directorioClaude" "Info"
    }
    
    # Escribir configuración
    try {
        $nuevaConfiguracion | ConvertTo-Json -Depth 10 | Out-File $ConfiguracionClaude -Encoding UTF8
        Write-EstadoOperacion "Configuración MCP instalada exitosamente" "Exito"
        
        # Mostrar resumen
        Write-Host "`n📊 RESUMEN DE INSTALACIÓN:" -ForegroundColor Magenta
        Write-Host "═══════════════════════════════════════" -ForegroundColor Gray
        
        foreach ($servidor in $nuevaConfiguracion.mcpServers.Keys) {
            $comando = $nuevaConfiguracion.mcpServers[$servidor].command
            Write-Host "  🔸 $servidor ($comando)" -ForegroundColor White
        }
        
        Write-Host "`n🔄 PRÓXIMOS PASOS:" -ForegroundColor Yellow
        Write-Host "  1. Reinicia Claude Desktop completamente" -ForegroundColor Gray
        Write-Host "  2. Verifica que los servidores estén activos" -ForegroundColor Gray
        Write-Host "  3. Ejecuta: .\Check-MCPServer.ps1 -ValidarTodos" -ForegroundColor Gray
        
        return $true
    }
    catch {
        Write-EstadoOperacion "Error al escribir configuración: $_" "Error"
        
        # Restaurar backup si existe
        if ($backup -and (Test-Path $backup)) {
            Copy-Item $backup $ConfiguracionClaude -Force
            Write-EstadoOperacion "Configuración restaurada desde backup" "Info"
        }
        
        return $false
    }
}

function Show-EstadoActual {
    Write-Host "`n🔍 ESTADO ACTUAL MCP ALTAMEDICA" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════════" -ForegroundColor Gray
    
    # Verificar configuración actual
    if (Test-Path $ConfiguracionClaude) {
        try {
            $config = Get-Content $ConfiguracionClaude | ConvertFrom-Json
            $servidores = $config.mcpServers.PSObject.Properties.Name
            
            Write-Host "📁 Archivo configuración: ENCONTRADO" -ForegroundColor Green
            Write-Host "🖥️  Servidores configurados: $($servidores.Count)" -ForegroundColor White
            
            foreach ($servidor in $servidores) {
                Write-Host "   • $servidor" -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "📁 Archivo configuración: CORRUPTO" -ForegroundColor Red
        }
    }
    else {
        Write-Host "📁 Archivo configuración: NO ENCONTRADO" -ForegroundColor Yellow
    }
    
    # Verificar archivos MCP
    Write-Host "`n🔧 SERVIDORES MCP DISPONIBLES:" -ForegroundColor White
    foreach ($servidor in $ServidoresMCP.Keys) {
        $archivo = Join-Path $DirectorioMCP $ServidoresMCP[$servidor].archivo
        $estado = if (Test-Path $archivo) { "✅ DISPONIBLE" } else { "❌ FALTANTE" }
        $color = if (Test-Path $archivo) { "Green" } else { "Red" }
        
        Write-Host "   $servidor`: $estado" -ForegroundColor $color
    }
}

# Ejecución principal del script
Write-Host "`n🤖 INTEGRADOR MCP ALTAMEDICA v1.1 (CORREGIDO)" -ForegroundColor Magenta
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Gray

switch ($true) {
    $VerificarConfiguracion {
        Show-EstadoActual
    }
    
    $RespaldoConfiguracion {
        $backup = Backup-ConfiguracionClaude
        if ($backup) {
            Write-EstadoOperacion "Respaldo completado exitosamente" "Exito"
        } else {
            Write-EstadoOperacion "No hay configuración para respaldar" "Advertencia"
        }
    }
    
    $ValidarServidores {
        Write-EstadoOperacion "Validando todos los servidores MCP..." "Proceso"
        $servidoresValidos = 0
        
        foreach ($servidor in $ServidoresMCP.Keys) {
            $archivo = Join-Path $DirectorioMCP $ServidoresMCP[$servidor].archivo
            if (Test-ArchivoMCP $archivo) {
                $servidoresValidos++
            }
        }
        
        Write-EstadoOperacion "Validación completada: $servidoresValidos/$($ServidoresMCP.Count) servidores válidos" "Info"
    }
    
    $InstalarTodos {
        if (Install-TodosLosMCP) {
            Write-EstadoOperacion "Instalación completa de MCP AltaMedica finalizada" "Exito"
        } else {
            Write-EstadoOperacion "Error durante la instalación. Revisa los logs anteriores" "Error"
        }
    }
    
    default {
        Show-EstadoActual
        Write-Host "`n💡 USO DEL SCRIPT:" -ForegroundColor Yellow
        Write-Host "  -InstalarTodos          : Instala todos los MCP de AltaMedica" -ForegroundColor Gray
        Write-Host "  -VerificarConfiguracion : Muestra el estado actual" -ForegroundColor Gray
        Write-Host "  -RespaldoConfiguracion  : Crea respaldo de la configuración" -ForegroundColor Gray
        Write-Host "  -ValidarServidores      : Valida archivos MCP disponibles" -ForegroundColor Gray
        
        Write-Host "`n🚀 EJEMPLO DE USO:" -ForegroundColor Green
        Write-Host "  .\Integrador-MCP-AltaMedica.ps1 -InstalarTodos" -ForegroundColor White
    }
}
