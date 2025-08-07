# Script para iniciar AltaMedica con SSO y dominios locales

Write-Host "Starting AltaMedica with SSO and Local Domains..." -ForegroundColor Cyan

# Cambiar al directorio del proyecto
Set-Location "C:\Users\Eduardo\Documents\devaltamedica"

# Iniciar Emuladores de Firebase
Write-Host "`nStarting Firebase Emulators..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "firebase emulators:start --only auth,firestore,functions,hosting" -WindowStyle Normal

# Esperar a que los emuladores inicien
Start-Sleep -Seconds 10

# Iniciar API Server (Puerto 3001)
Write-Host "`nStarting API Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\api-server; npm run dev" -WindowStyle Normal

# Esperar a que el API server inicie
Start-Sleep -Seconds 5

# Iniciar Web App (Puerto 3000)
Write-Host "Starting Web App..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\web-app; npm run dev" -WindowStyle Normal

# Iniciar Patients App (Puerto 3003)
Write-Host "Starting Patients App..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\patients; npm run dev" -WindowStyle Normal

# Iniciar Signaling Server (Puerto 8888)
Write-Host "Starting Signaling Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps\signaling-server; npm run dev" -WindowStyle Normal

# Mostrar informaciÃ³n de acceso
Write-Host "`nâœ… All services started!" -ForegroundColor Green
Write-Host "`nAccess the applications at:" -ForegroundColor Cyan
Write-Host "  - Web App: http://web.altamedica.local:3000" -ForegroundColor White
Write-Host "  - API Server: http://api.altamedica.local:3001" -ForegroundColor White
Write-Host "  - Patients Portal: http://patients.altamedica.local:3003" -ForegroundColor White
Write-Host "  - Signaling Server: ws://signaling.altamedica.local:8888" -ForegroundColor White

Write-Host "`nSSO Configuration:" -ForegroundColor Magenta
Write-Host "  - Cookies domain: .altamedica.local" -ForegroundColor White
Write-Host "  - Cookie name: altamedica_sso_token" -ForegroundColor White
Write-Host "  - Cookies are shared across all subdomains" -ForegroundColor White

$msg = "`nPress any key to continue..."
Write-Host $msg
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
