# Script para reiniciar aplicaciones con configuración de emuladores actualizada
Write-Host "REINICIANDO APLICACIONES CON EMULADORES HABILITADOS" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# Matar procesos existentes de Node.js (excepto emuladores)
Write-Host "`nDeteniendo aplicaciones existentes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -notlike "*firebase*emulators*"
} | Stop-Process -Force

Start-Sleep -Seconds 2

# Verificar que los emuladores siguen corriendo
Write-Host "`nVerificando emuladores..." -ForegroundColor Yellow
$authEmulator = Test-NetConnection -ComputerName localhost -Port 9099 -WarningAction SilentlyContinue
$firestoreEmulator = Test-NetConnection -ComputerName localhost -Port 8080 -WarningAction SilentlyContinue

if ($authEmulator.TcpTestSucceeded -and $firestoreEmulator.TcpTestSucceeded) {
    Write-Host "  OK - Emuladores activos" -ForegroundColor Green
} else {
    Write-Host "  ERROR - Emuladores no detectados. Iniciando..." -ForegroundColor Red
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Eduardo\Documents\devaltamedica'; firebase emulators:start --only auth,firestore --project demo-project" -WindowStyle Normal
    Start-Sleep -Seconds 10
}

# Iniciar aplicaciones con la nueva configuración
Write-Host "`nIniciando aplicaciones con emuladores habilitados..." -ForegroundColor Green

# API Server
Write-Host "  - Iniciando API Server (3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Eduardo\Documents\devaltamedica\apps\api-server'; npm run dev" -WindowStyle Minimized

Start-Sleep -Seconds 3

# Web App
Write-Host "  - Iniciando Web App (3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Eduardo\Documents\devaltamedica\apps\web-app'; npm run dev" -WindowStyle Minimized

Start-Sleep -Seconds 3

# Patients App
Write-Host "  - Iniciando Patients App (3003)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Eduardo\Documents\devaltamedica\apps\patients'; npm run dev" -WindowStyle Minimized

Start-Sleep -Seconds 3

# Signaling Server
Write-Host "  - Iniciando Signaling Server (8888)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Eduardo\Documents\devaltamedica\apps\signaling-server'; npm run dev" -WindowStyle Minimized

Write-Host "`nEsperando que las aplicaciones inicien..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verificar estado final
Write-Host "`nVERIFICANDO ESTADO FINAL:" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow

$services = @{
    "Firebase Auth Emulator" = 9099
    "Firestore Emulator" = 8080
    "Web App" = 3000
    "API Server" = 3001
    "Patients App" = 3003
    "Signaling Server" = 8888
}

$allGood = $true
foreach ($service in $services.GetEnumerator()) {
    $test = Test-NetConnection -ComputerName localhost -Port $service.Value -WarningAction SilentlyContinue
    if ($test.TcpTestSucceeded) {
        Write-Host "  OK - $($service.Key) (Puerto $($service.Value))" -ForegroundColor Green
    } else {
        Write-Host "  FALLA - $($service.Key) (Puerto $($service.Value))" -ForegroundColor Red
        $allGood = $false
    }
}

if ($allGood) {
    Write-Host "`nTODOS LOS SERVICIOS ESTAN FUNCIONANDO!" -ForegroundColor Green
    Write-Host "`nAhora puedes hacer login con:" -ForegroundColor Cyan
    Write-Host "  - test@altamedica.com / test123" -ForegroundColor White
    Write-Host "  - doctor@altamedica.com / doctor123" -ForegroundColor White
    Write-Host "  - patient@altamedica.com / patient123" -ForegroundColor White
    Write-Host "  - admin@altamedica.com / admin123" -ForegroundColor White
    Write-Host "`nAccede a:" -ForegroundColor Cyan
    Write-Host "  - Web App: http://localhost:3000" -ForegroundColor White
    Write-Host "  - Patients App: http://localhost:3003" -ForegroundColor White
    Write-Host "  - Firebase Emulator UI: http://localhost:4000" -ForegroundColor White
} else {
    Write-Host "`nALGUNOS SERVICIOS NO INICIARON CORRECTAMENTE" -ForegroundColor Red
    Write-Host "Revisa las ventanas de PowerShell para ver los logs" -ForegroundColor Yellow
}