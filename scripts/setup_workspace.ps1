# 🚀 AltaMedica Workspace Quick Setup
# Script de configuración rápida para Windows

param(
    [switch]$SkipDependencies,
    [switch]$OpenWorkspace,
    [switch]$StartServices
)

Write-Host "🏥 AltaMedica Workspace Setup Iniciado..." -ForegroundColor Green

# Función para escribir mensajes con colores
function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$Type = "Info"
    )
    
    switch ($Type) {
        "Success" { Write-Host "✅ $Message" -ForegroundColor Green }
        "Warning" { Write-Host "⚠️ $Message" -ForegroundColor Yellow }
        "Error" { Write-Host "❌ $Message" -ForegroundColor Red }
        "Info" { Write-Host "ℹ️ $Message" -ForegroundColor Cyan }
        "Setup" { Write-Host "🔧 $Message" -ForegroundColor Magenta }
    }
}

# Verificar prerequisitos
Write-ColorMessage "Verificando prerequisitos..." "Setup"

# Verificar Python
try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-ColorMessage "Python encontrado: $pythonVersion" "Success"
    } else {
        Write-ColorMessage "Python no encontrado. Instalar Python 3.8+" "Error"
        exit 1
    }
} catch {
    Write-ColorMessage "Python no está instalado" "Error"
    exit 1
}

# Verificar Node.js
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-ColorMessage "Node.js encontrado: $nodeVersion" "Success"
    } else {
        Write-ColorMessage "Node.js no encontrado" "Error"
        exit 1
    }
} catch {
    Write-ColorMessage "Node.js no está instalado" "Error"
    exit 1
}

# Verificar pnpm
try {
    $pnpmVersion = pnpm --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-ColorMessage "pnpm encontrado: $pnpmVersion" "Success"
    } else {
        Write-ColorMessage "pnpm no encontrado. Instalando..." "Warning"
        npm install -g pnpm
        if ($LASTEXITCODE -eq 0) {
            Write-ColorMessage "pnpm instalado exitosamente" "Success"
        } else {
            Write-ColorMessage "Error instalando pnpm" "Error"
            exit 1
        }
    }
} catch {
    Write-ColorMessage "Error verificando pnpm" "Error"
    exit 1
}

# Instalar dependencias Python si no se especifica skip
if (-not $SkipDependencies) {
    Write-ColorMessage "Instalando dependencias Python..." "Setup"
    
    $pythonDeps = @(
        "fastapi",
        "uvicorn",
        "requests",
        "aiohttp", 
        "python-multipart",
        "pydantic",
        "python-jose[cryptography]",
        "jinja2"
    )
    
    foreach ($dep in $pythonDeps) {
        try {
            python -m pip install $dep --quiet
            Write-ColorMessage "Instalado: $dep" "Success"
        } catch {
            Write-ColorMessage "Error instalando: $dep" "Warning"
        }
    }
}

# Instalar dependencias Node.js
Write-ColorMessage "Instalando dependencias Node.js..." "Setup"
try {
    pnpm install
    if ($LASTEXITCODE -eq 0) {
        Write-ColorMessage "Dependencias Node.js instaladas" "Success"
    } else {
        Write-ColorMessage "Error instalando dependencias Node.js" "Warning"
    }
} catch {
    Write-ColorMessage "Error ejecutando pnpm install" "Warning"
}

# Ejecutar setup de Python
Write-ColorMessage "Ejecutando setup de workspace..." "Setup"
try {
    python setup_workspace.py
    if ($LASTEXITCODE -eq 0) {
        Write-ColorMessage "Setup de workspace completado" "Success"
    } else {
        Write-ColorMessage "Advertencias en setup de workspace" "Warning"
    }
} catch {
    Write-ColorMessage "Error en setup de workspace" "Error"
}

# Verificar que existan los archivos del workspace
$workspaceFile = "altamedica-api-workspace.code-workspace"
if (Test-Path $workspaceFile) {
    Write-ColorMessage "Archivo de workspace encontrado: $workspaceFile" "Success"
} else {
    Write-ColorMessage "Archivo de workspace no encontrado" "Error"
    exit 1
}

# Abrir workspace en VS Code si se especifica
if ($OpenWorkspace) {
    Write-ColorMessage "Abriendo workspace en VS Code..." "Setup"
    try {
        code $workspaceFile
        Write-ColorMessage "VS Code abierto con workspace" "Success"
    } catch {
        Write-ColorMessage "Error abriendo VS Code. ¿Está instalado?" "Warning"
    }
}

# Iniciar servicios si se especifica
if ($StartServices) {
    Write-ColorMessage "Iniciando servicios de desarrollo..." "Setup"
    Start-Sleep -Seconds 3
    
    # Iniciar API Bridge en background
    Start-Process -FilePath "python" -ArgumentList "tools/python/api_frontend_bridge.py" -WindowStyle Hidden
    Write-ColorMessage "API Bridge iniciado en puerto 9000" "Success"
    
    # Iniciar servicios con pnpm
    Start-Process -FilePath "pnpm" -ArgumentList "run", "dev:all" -WindowStyle Minimized
    Write-ColorMessage "Servicios de desarrollo iniciados" "Success"
}

Write-Host ""
Write-ColorMessage "🎉 ¡Setup del workspace completado!" "Success"
Write-Host ""
Write-ColorMessage "📋 Próximos pasos:" "Info"
Write-Host "   1. code altamedica-api-workspace.code-workspace"
Write-Host "   2. Ejecutar tarea '🎯 Complete Setup' en VS Code"
Write-Host "   3. Ejecutar tarea '🚀 Start All Services'"
Write-Host "   4. ¡Desarrollar con hooks reales sin mocks!"
Write-Host ""
Write-ColorMessage "📖 Lee WORKSPACE_README.md para más información" "Info"

# Mostrar URLs importantes
Write-Host ""
Write-ColorMessage "🌐 URLs de servicios:" "Info"
Write-Host "   📱 Patients App:    http://localhost:3003"
Write-Host "   👨‍⚕️ Doctors App:     http://localhost:3002"
Write-Host "   🔧 API Server:      http://localhost:3001"
Write-Host "   🌉 API Bridge:      http://localhost:9000"
Write-Host "   🏢 Companies App:   http://localhost:3004"
Write-Host "   ⚙️ Admin App:       http://localhost:3005"
Write-Host "   🌐 Web App:         http://localhost:3000"
