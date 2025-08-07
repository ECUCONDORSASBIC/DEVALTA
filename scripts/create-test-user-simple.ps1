# Crear usuario de prueba en Firebase Auth Emulator
Write-Host "Creando usuario de prueba en Firebase Auth Emulator..." -ForegroundColor Yellow

$signUpUrl = "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key"

$userData = @{
    email = "test@altamedica.com"
    password = "test123"
    returnSecureToken = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $signUpUrl -Method POST -Body $userData -ContentType "application/json"
    
    Write-Host "`nUsuario creado exitosamente!" -ForegroundColor Green
    Write-Host "Email: test@altamedica.com" -ForegroundColor Cyan
    Write-Host "Password: test123" -ForegroundColor Cyan
    Write-Host "User ID: $($response.localId)" -ForegroundColor Cyan
    
    # Crear más usuarios de prueba
    $additionalUsers = @(
        @{ email = "doctor@altamedica.com"; password = "doctor123"; role = "doctor" },
        @{ email = "patient@altamedica.com"; password = "patient123"; role = "patient" },
        @{ email = "admin@altamedica.com"; password = "admin123"; role = "admin" }
    )
    
    Write-Host "`nCreando usuarios adicionales..." -ForegroundColor Yellow
    
    foreach ($user in $additionalUsers) {
        $body = @{
            email = $user.email
            password = $user.password
            returnSecureToken = $true
        } | ConvertTo-Json
        
        try {
            $resp = Invoke-RestMethod -Uri $signUpUrl -Method POST -Body $body -ContentType "application/json"
            Write-Host "  OK - $($user.email) (role: $($user.role))" -ForegroundColor Green
        } catch {
            Write-Host "  Error - $($user.email): $_" -ForegroundColor Red
        }
    }
    
} catch {
    $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorBody.error.message -eq "EMAIL_EXISTS") {
        Write-Host "El usuario ya existe!" -ForegroundColor Yellow
    } else {
        Write-Host "Error creando usuario: $($errorBody.error.message)" -ForegroundColor Red
    }
}

Write-Host "`nProbando autenticacion..." -ForegroundColor Yellow

# Probar login
$signInUrl = "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key"
$loginData = @{
    email = "test@altamedica.com"
    password = "test123"
    returnSecureToken = $true
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri $signInUrl -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "Autenticacion exitosa! Token recibido." -ForegroundColor Green
    Write-Host "`nAhora puedes usar las siguientes credenciales para login:" -ForegroundColor Cyan
    Write-Host "- test@altamedica.com / test123" -ForegroundColor White
    Write-Host "- doctor@altamedica.com / doctor123" -ForegroundColor White
    Write-Host "- patient@altamedica.com / patient123" -ForegroundColor White
    Write-Host "- admin@altamedica.com / admin123" -ForegroundColor White
} catch {
    Write-Host "Error en autenticacion: $_" -ForegroundColor Red
}