# tools/scripts/start-e2e-env.ps1
# Este script inicia los servidores necesarios para el entorno de pruebas E2E.

# Obtener la ruta del directorio raíz del script
$scriptPath = $PSScriptRoot
$rootDir = (Get-Item $scriptPath).parent.parent.parent.FullName

# Definir las rutas y URLs de las aplicaciones
$apps = @(
    @{
        Name = "API Server"
        Path = (Join-Path $rootDir "apps/api-server")
        Port = 3008
        Url = "http://localhost:3008/api/health" # Asumiendo que tienes un endpoint de health check
        Process = $null
    },
    @{
        Name = "Web App"
        Path = (Join-Path $rootDir "apps/web-app")
        Port = 3003 # El puerto que se asignó dinámicamente antes
        Url = "http://localhost:3003"
        Process = $null
    },
    @{
        Name = "Companies App"
        Path = (Join-Path $rootDir "apps/companies")
        Port = 3006
        Url = "http://localhost:3006"
        Process = $null
    }
)

# Función para verificar si un puerto está libre
function Test-Port {
    param($port)
    try {
        $listener = [System.Net.Sockets.TcpListener]$port
        $listener.Start()
        $listener.Stop()
        return $true
    } catch {
        return $false
    }
}

# Iniciar los servidores en nuevas ventanas de terminal
Write-Host "🚀 Iniciando servidores para el entorno E2E..."

foreach ($app in $apps) {
    if (Test-Port $app.Port) {
        Write-Host "Iniciando $($app.Name) en el puerto $($app.Port)..."
        $process = Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$($app.Path)'; pnpm dev" -PassThru
        $app.Process = $process
    } else {
        Write-Warning "$($app.Name) - El puerto $($app.Port) ya está en uso. Asumiendo que el servidor ya está corriendo."
    }
}

# Función de sondeo de salud (Health Check)
function Wait-For-Server {
    param(
        [string]$Url,
        [string]$ServerName,
        [int]$TimeoutSeconds = 120
    )
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    while ($stopwatch.Elapsed.TotalSeconds -lt $TimeoutSeconds) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ $ServerName está listo en $Url"
                return $true
            }
        } catch {
            # Ignorar errores de conexión mientras el servidor se levanta
        }
        Write-Host "Aguardando por $ServerName..."
        Start-Sleep -Seconds 5
    }
    
    Write-Error "$ServerName no respondió en $Url después de $TimeoutSeconds segundos."
    return $false
}

# Esperar a que todos los servidores estén listos
Write-Host "🔎 Verificando el estado de los servidores..."
$allReady = $true
foreach ($app in $apps) {
    if (-not (Wait-For-Server -Url $app.Url -ServerName $app.Name)) {
        $allReady = $false
    }
}

if ($allReady) {
    Write-Host "👍 Entorno E2E completamente listo para las pruebas."
} else {
    Write-Error "🔥 No todos los servidores se iniciaron correctamente. Abortando."
    # Opcional: detener los procesos que sí se iniciaron
    # $apps | Where-Object { $_.Process -ne $null } | ForEach-Object { Stop-Process -Id $_.Process.Id -Force }
    exit 1
}
