# Script para verificar el estado de todas las aplicaciones
Write-Host "`nVERIFICANDO ESTADO DE APLICACIONES ALTAMEDICA" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Función para verificar un puerto
function Test-Port {
    param($Port, $AppName, $Url)
    
    Write-Host -NoNewline "`nVerificando $AppName (Puerto $Port)... "
    
    $tcpTest = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    
    if ($tcpTest.TcpTestSucceeded) {
        Write-Host "ACTIVO" -ForegroundColor Green
        
        # Intentar hacer una petición HTTP
        try {
            $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
            Write-Host "  Estado HTTP: $($response.StatusCode)" -ForegroundColor Gray
        } catch {
            Write-Host "  Estado HTTP: Error - $_" -ForegroundColor Yellow
        }
    } else {
        Write-Host "INACTIVO" -ForegroundColor Red
    }
}

# Verificar cada aplicación
$apps = @(
    @{Name="Web App"; Port=3000; Url="http://localhost:3000"},
    @{Name="API Server"; Port=3001; Url="http://localhost:3001/api/health"},
    @{Name="Doctors App"; Port=3002; Url="http://localhost:3002"},
    @{Name="Patients App"; Port=3003; Url="http://localhost:3003"},
    @{Name="Companies App"; Port=3004; Url="http://localhost:3004"},
    @{Name="Admin App"; Port=3005; Url="http://localhost:3005"},
    @{Name="Signaling Server"; Port=8888; Url="http://localhost:8888/health"},
    @{Name="SSO Proxy"; Port=3100; Url="http://localhost:3100/health"}
)

foreach ($app in $apps) {
    Test-Port -Port $app.Port -AppName $app.Name -Url $app.Url
}

# Resumen
Write-Host "`n`nRESUMEN:" -ForegroundColor Cyan
Write-Host "--------" -ForegroundColor Cyan

# Contar aplicaciones activas
$activeCount = 0
foreach ($app in $apps) {
    $tcpTest = Test-NetConnection -ComputerName localhost -Port $app.Port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($tcpTest.TcpTestSucceeded) {
        $activeCount++
    }
}

Write-Host "Aplicaciones activas: $activeCount de $($apps.Count)" -ForegroundColor $(if ($activeCount -eq $apps.Count) { "Green" } elseif ($activeCount -gt 0) { "Yellow" } else { "Red" })

# Comandos útiles
Write-Host "`nCOMANDOS UTILES:" -ForegroundColor Cyan
Write-Host "---------------" -ForegroundColor Cyan
Write-Host "Iniciar todas las apps: npm run dev:all" -ForegroundColor White
Write-Host "Iniciar con SSO proxy: ./start-with-sso-proxy.ps1" -ForegroundColor White
Write-Host "Probar SSO: ./test-sso-direct.ps1" -ForegroundColor White

# URLs importantes
Write-Host "`nURLs IMPORTANTES:" -ForegroundColor Cyan
Write-Host "----------------" -ForegroundColor Cyan
Write-Host "Login principal: http://localhost:3000/login" -ForegroundColor White
Write-Host "Debug SSO Patients: http://localhost:3003/debug-sso" -ForegroundColor White
Write-Host "API Health: http://localhost:3001/api/health" -ForegroundColor White