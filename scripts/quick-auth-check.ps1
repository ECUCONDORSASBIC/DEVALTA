# AltaMedica - Verificación Rápida de Autenticación
Write-Host "ALTAMEDICA - DIAGNOSTICO RAPIDO DE AUTENTICACION" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$reportFile = "auth_quick_check_$timestamp.txt"

# Función para log
function Write-Log {
    param($Message, $Color = "White")
    Write-Host $Message -ForegroundColor $Color
    Add-Content -Path $reportFile -Value $Message
}

Write-Log "`nFecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "Yellow"

# 1. Verificar Firebase Emulators
Write-Log "`n1. VERIFICANDO FIREBASE EMULATORS:" "Yellow"

$emulatorPorts = @{
    "Auth Emulator" = 9099
    "Firestore Emulator" = 8080
    "Functions Emulator" = 5001
    "Hosting Emulator" = 5000
}

$emulatorStatus = @{}
foreach ($emulator in $emulatorPorts.GetEnumerator()) {
    $result = Test-NetConnection -ComputerName localhost -Port $emulator.Value -WarningAction SilentlyContinue
    if ($result.TcpTestSucceeded) {
        Write-Log "  OK - $($emulator.Key) (Puerto $($emulator.Value))" "Green"
        $emulatorStatus[$emulator.Key] = "RUNNING"
    } else {
        Write-Log "  FALLA - $($emulator.Key) (Puerto $($emulator.Value))" "Red"
        $emulatorStatus[$emulator.Key] = "NOT RUNNING"
    }
}

# 2. Verificar Aplicaciones
Write-Log "`n2. VERIFICANDO APLICACIONES:" "Yellow"

$apps = @{
    "Web App" = 3000
    "API Server" = 3001
    "Signaling Server" = 8888
}

foreach ($app in $apps.GetEnumerator()) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($app.Value)" -TimeoutSec 2 -ErrorAction SilentlyContinue
        Write-Log "  OK - $($app.Key) (Puerto $($app.Value))" "Green"
    } catch {
        Write-Log "  FALLA - $($app.Key) (Puerto $($app.Value))" "Red"
    }
}

# 3. Verificar Variables de Entorno
Write-Log "`n3. VERIFICANDO CONFIGURACION:" "Yellow"

if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -ErrorAction SilentlyContinue
    $useEmulator = $envContent | Where-Object { $_ -match "NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true" }
    
    if ($useEmulator) {
        Write-Log "  OK - Emuladores habilitados en .env.local" "Green"
    } else {
        Write-Log "  FALLA - NEXT_PUBLIC_USE_FIREBASE_EMULATOR no es 'true'" "Red"
    }
} else {
    Write-Log "  FALLA - Archivo .env.local no encontrado" "Red"
}

# 4. Test de Autenticación
Write-Log "`n4. TEST DE AUTENTICACION:" "Yellow"

$authUrl = "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key"
$body = @{
    email = "test@altamedica.com"
    password = "test123"
    returnSecureToken = $true
} | ConvertTo-Json

try {
    $authResponse = Invoke-RestMethod -Uri $authUrl -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Log "  OK - Autenticacion exitosa con emulador" "Green"
} catch {
    Write-Log "  FALLA - Error de autenticacion: $_" "Red"
}

# RESUMEN
Write-Log "`n================================================" "Cyan"
Write-Log "RESUMEN DE PROBLEMAS DETECTADOS:" "Yellow"

$problems = @()

if ($emulatorStatus["Auth Emulator"] -ne "RUNNING") {
    $problems += "Firebase Auth Emulator NO esta corriendo"
}
if ($emulatorStatus["Firestore Emulator"] -ne "RUNNING") {
    $problems += "Firestore Emulator NO esta corriendo"
}

if ($problems.Count -eq 0) {
    Write-Log "`nTodos los servicios estan funcionando correctamente!" "Green"
} else {
    Write-Log "`nPROBLEMAS ENCONTRADOS:" "Red"
    foreach ($problem in $problems) {
        Write-Log "  - $problem" "Red"
    }
    
    Write-Log "`nSOLUCION RECOMENDADA:" "Yellow"
    Write-Log "  1. Ejecutar: firebase emulators:start --only auth,firestore,functions,hosting" "White"
    Write-Log "  2. Verificar NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true en .env.local" "White"
    Write-Log "  3. Reiniciar: npm run dev:all" "White"
}

Write-Log "`nReporte guardado en: $reportFile" "Cyan"