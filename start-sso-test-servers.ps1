# start-sso-test-servers.ps1
# Script para iniciar todos los servidores necesarios para el test SSO

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " INICIANDO SERVIDORES PARA TEST SSO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
$expectedPath = "C:\Users\Eduardo\Documents\devaltamedica"
if ((Get-Location).Path -ne $expectedPath) {
    Write-Host "Cambiando al directorio del proyecto..." -ForegroundColor Yellow
    Set-Location $expectedPath
}

# Función para verificar si un puerto está en uso
function Test-Port {
    param($Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
    return $connection
}

# Lista de servicios a iniciar
$services = @(
    @{Name="Web-App (Gateway SSO)"; Port=3000; Command="pnpm --filter web-app dev"; Critical=$true},
    @{Name="API Server"; Port=3001; Command="pnpm --filter api-server dev"; Critical=$true},
    @{Name="Doctors App"; Port=3002; Command="pnpm --filter doctors dev"; Critical=$false},
    @{Name="Patients App"; Port=3003; Command="pnpm --filter patients dev"; Critical=$false},
    @{Name="Companies App"; Port=3004; Command="pnpm --filter companies dev"; Critical=$false},
    @{Name="Admin App"; Port=3005; Command="pnpm --filter admin dev"; Critical=$false}
)

Write-Host "Verificando puertos..." -ForegroundColor Yellow
Write-Host ""

$portsInUse = @()
foreach ($service in $services) {
    if (Test-Port -Port $service.Port) {
        Write-Host "✅ Puerto $($service.Port) - $($service.Name) ya está en uso" -ForegroundColor Green
        $portsInUse += $service.Port
    } else {
        Write-Host "⚠️  Puerto $($service.Port) - $($service.Name) está libre" -ForegroundColor Yellow
    }
}

Write-Host ""

# Si los servicios críticos ya están corriendo, ofrecer ejecutar el test directamente
if (($portsInUse -contains 3000) -and ($portsInUse -contains 3001)) {
    Write-Host "Los servicios críticos ya están ejecutándose." -ForegroundColor Green
    Write-Host ""
    $runTest = Read-Host "¿Deseas ejecutar el test ahora? (S/N)"
    
    if ($runTest -eq 'S' -or $runTest -eq 's') {
        Write-Host ""
        Write-Host "Ejecutando test SSO..." -ForegroundColor Cyan
        npx playwright test test-sso-flow.spec.js --reporter=list
        exit
    }
}

# Preguntar si iniciar los servicios
Write-Host "Para ejecutar el test SSO necesitas los siguientes servicios:" -ForegroundColor Cyan
Write-Host "  - Web-App (puerto 3000) - CRÍTICO" -ForegroundColor White
Write-Host "  - API Server (puerto 3001) - CRÍTICO" -ForegroundColor White
Write-Host "  - Patients, Doctors, Companies, Admin Apps (opcionales)" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "¿Deseas iniciar los servicios? (1=Todos, 2=Solo críticos, 3=Cancelar)"

if ($choice -eq '3') {
    Write-Host "Operación cancelada." -ForegroundColor Yellow
    exit
}

# Determinar qué servicios iniciar
$servicesToStart = @()
if ($choice -eq '1') {
    $servicesToStart = $services
} elseif ($choice -eq '2') {
    $servicesToStart = $services | Where-Object { $_.Critical -eq $true }
} else {
    Write-Host "Opción no válida. Cancelando." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Iniciando servicios..." -ForegroundColor Cyan
Write-Host ""

# Iniciar cada servicio en una nueva ventana de PowerShell
foreach ($service in $servicesToStart) {
    if (-not ($portsInUse -contains $service.Port)) {
        Write-Host "🚀 Iniciando $($service.Name) en puerto $($service.Port)..." -ForegroundColor Yellow
        
        # Crear comando para nueva ventana
        $windowTitle = $service.Name
        $startCommand = "cd '$expectedPath'; $($service.Command)"
        
        # Iniciar en nueva ventana de PowerShell
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Iniciando $windowTitle...' -ForegroundColor Cyan; $startCommand" -WindowStyle Normal
        
        # Esperar un poco entre servicios
        Start-Sleep -Seconds 2
    }
}

Write-Host ""
Write-Host "Esperando a que los servicios se inicien..." -ForegroundColor Yellow

# Esperar a que los servicios críticos estén listos
$maxAttempts = 30
$attempts = 0
$allReady = $false

while ($attempts -lt $maxAttempts -and -not $allReady) {
    Start-Sleep -Seconds 2
    $attempts++
    
    $webAppReady = Test-Port -Port 3000
    $apiReady = Test-Port -Port 3001
    
    if ($webAppReady -and $apiReady) {
        $allReady = $true
        Write-Host ""
        Write-Host "✅ Servicios críticos listos!" -ForegroundColor Green
    } else {
        Write-Host "." -NoNewline -ForegroundColor Yellow
    }
}

if (-not $allReady) {
    Write-Host ""
    Write-Host "⚠️  Timeout: Los servicios no se iniciaron en el tiempo esperado" -ForegroundColor Red
    Write-Host "Por favor, verifica los logs de cada servicio." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " SERVICIOS LISTOS PARA TESTING" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Mostrar estado final
foreach ($service in $services) {
    if (Test-Port -Port $service.Port) {
        Write-Host "✅ $($service.Name): http://localhost:$($service.Port)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $($service.Name): No disponible" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Ahora puedes ejecutar el test con:" -ForegroundColor Cyan
Write-Host "  npx playwright test test-sso-flow.spec.js --reporter=list" -ForegroundColor White
Write-Host ""

$runNow = Read-Host "¿Ejecutar el test ahora? (S/N)"

if ($runNow -eq 'S' -or $runNow -eq 's') {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host " EJECUTANDO TEST SSO" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    npx playwright test test-sso-flow.spec.js --reporter=list
    
    Write-Host ""
    Write-Host "Test completado." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Para ejecutar el test manualmente usa:" -ForegroundColor Yellow
    Write-Host "  npx playwright test test-sso-flow.spec.js --reporter=list" -ForegroundColor White
}

Write-Host ""
Write-Host "Para detener los servicios, cierra las ventanas de PowerShell o presiona Ctrl+C en cada una." -ForegroundColor Yellow