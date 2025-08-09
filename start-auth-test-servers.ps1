# Script para levantar servidores para pruebas de autenticación
Write-Host "🚀 Iniciando servidores para pruebas de autenticación..." -ForegroundColor Cyan
Write-Host ""

# Definir los servidores a levantar
$servers = @(
    @{
        Name = "web-app"
        Port = 3000
        Description = "Gateway de autenticación"
        Command = "pnpm --filter web-app dev"
    },
    @{
        Name = "patients"
        Port = 3003
        Description = "Portal de pacientes"
        Command = "pnpm --filter patients dev"
    },
    @{
        Name = "doctors"
        Port = 3002
        Description = "Portal de doctores"
        Command = "pnpm --filter doctors dev"
    },
    @{
        Name = "companies"
        Port = 3004
        Description = "Portal de empresas"
        Command = "pnpm --filter companies dev"
    }
)

# Verificar que el api-server ya está corriendo
Write-Host "✅ API Server ya está corriendo en puerto 3008" -ForegroundColor Green
Write-Host ""

# Levantar cada servidor en una nueva ventana
foreach ($server in $servers) {
    Write-Host "📦 Iniciando $($server.Name) en puerto $($server.Port) - $($server.Description)" -ForegroundColor Yellow
    
    $scriptBlock = @"
cd /d C:\Users\Eduardo\Documents\devaltamedica
Write-Host '🚀 Iniciando $($server.Name) en puerto $($server.Port)' -ForegroundColor Cyan
$($server.Command)
"@
    
    Start-Process powershell -ArgumentList @("-NoExit", "-Command", $scriptBlock) -WindowStyle Normal
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "⏳ Esperando 10 segundos para que los servidores se inicialicen..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "✅ Todos los servidores deberían estar corriendo:" -ForegroundColor Green
Write-Host "   - API Server: http://localhost:3008" -ForegroundColor White
Write-Host "   - Web App (Auth Gateway): http://localhost:3000" -ForegroundColor White
Write-Host "   - Patients Portal: http://localhost:3003" -ForegroundColor White
Write-Host "   - Doctors Portal: http://localhost:3002" -ForegroundColor White
Write-Host "   - Companies Portal: http://localhost:3004" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Credenciales de prueba:" -ForegroundColor Cyan
Write-Host "   👤 PATIENT: paciente@test.com / 12345678" -ForegroundColor White
Write-Host "   👨‍⚕️ DOCTOR: doctor@test.com / 12345678" -ForegroundColor White
Write-Host "   🏢 COMPANY: empresa@test.com / 12345678" -ForegroundColor White
Write-Host "   🛡️ ADMIN: admin@test.com / 12345678" -ForegroundColor White