# Script de debugging MCP para Windows
# Ejecuta chequeos clave y muestra logs relevantes


# 1. Mostrar estado de servidores MCP (ejemplo: procesos activos)
Write-Host "--- MCP Servers Running (Node.js) ---"
$mcpProcs = Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like '*mcp*' }
if ($mcpProcs) {
    $mcpProcs | Select-Object Id,ProcessName,Path
} else {
    Write-Warning "No hay procesos Node.js relacionados con MCP activos. Sugerencia: ejecuta tu servidor MCP con el script adecuado o revisa la configuración."
}

# 2. Buscar logs recientes de Claude Desktop (ajusta ruta si es necesario)
$logPath = "$env:APPDATA\Claude"
Write-Host "--- Claude Desktop MCP Logs ---"
if (Test-Path $logPath) {
    $logs = Get-ChildItem -Path $logPath -Filter 'mcp*.log' | Sort-Object LastWriteTime -Descending | Select-Object -First 2
    if ($logs) {
        $logs | ForEach-Object {
            Write-Host "Log: $($_.FullName)"
            Get-Content $_.FullName -Tail 20
        }
    } else {
        Write-Warning "No se encontraron logs MCP en $logPath. Sugerencia: asegúrate de que Claude Desktop esté corriendo y configurado para generar logs."
    }
} else {
    Write-Warning "No se encontró la carpeta de logs de Claude en $logPath. Sugerencia: revisa si Claude Desktop está instalado correctamente."
}

# 3. Chequear variables de entorno relevantes (adaptado a Windows, case-insensitive)
Write-Host "--- Variables de entorno MCP (case-insensitive) ---"
$envVars = @('USER', 'USERNAME', 'HOME', 'USERPROFILE', 'PATH', 'Path', 'MCP_CONFIG', 'NODE_ENV')
$envTable = @{}
Get-ChildItem Env: | ForEach-Object { $envTable[$_.Name.ToUpper()] = $_.Value }
$missingVars = @()
foreach ($var in $envVars) {
    $val = $envTable[$var.ToUpper()]
    if ([string]::IsNullOrEmpty($val)) {
        $val = 'No definida'
        $missingVars += $var
    }
    Write-Host "$var = $val"
}
if ($missingVars.Count -gt 0) {
    Write-Warning "Variables de entorno faltantes: $($missingVars -join ', '). Sugerencia: defínelas en tu entorno o en el script de inicio si son requeridas por MCP."
}

# 3a. Chequear si Node.js está en el PATH
$nodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $nodePath) {
    Write-Warning "Node.js no está en el PATH. Sugerencia: agrega la ruta de Node.js a tu variable de entorno PATH."
}

# 3b. Mostrar todas las variables relacionadas con MCP, COPILOT, MODEL_CONTEXT, ED_
Write-Host "--- Variables MCP/COPILOT/MODEL_CONTEXT/ED_ detectadas ---"
$relVars = Get-ChildItem Env: | Where-Object { $_.Name -match 'MCP|COPILOT|MODEL_CONTEXT|ED_' }
if ($relVars) {
    $relVars | Sort-Object Name | Format-Table -AutoSize
} else {
    Write-Warning "No se detectaron variables MCP/COPILOT/MODEL_CONTEXT/ED_. Sugerencia: revisa tu configuración de entorno si esperabas verlas."
}

# 4. Mostrar configuración relevante (si existe)
$configFiles = @('mcp-config.json', 'mcp-enhanced-config.json', 'claude_desktop_config.json')
$foundConfig = $false
foreach ($file in $configFiles) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        $foundConfig = $true
        Write-Host "--- Contenido de $file ---"
        Get-Content $fullPath | Select-Object -First 20
    }
}
if (-not $foundConfig) {
    Write-Warning "No se encontró ningún archivo de configuración MCP en el directorio actual. Sugerencia: verifica que los archivos de configuración estén presentes y correctamente nombrados."
}


Write-Host "--- Variables de entorno disponibles (dump completo) ---"
Get-ChildItem Env: | Sort-Object Name | Format-Table -AutoSize

Write-Host "--- Fin del script de debugging MCP ---"
