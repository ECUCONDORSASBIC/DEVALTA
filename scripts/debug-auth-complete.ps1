# AltaMedica - Script Completo de Depuración de Autenticación
# Autor: Eduardo Marques
# Fecha: Enero 2025

Write-Host @"
╔═══════════════════════════════════════════════════════════════╗
║       ALTAMEDICA - DEPURACIÓN COMPLETA DE AUTENTICACIÓN       ║
╚═══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$global:timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$global:debugDir = "debug_auth_$timestamp"
$global:reportFile = "$debugDir/auth_debug_report.txt"

# Crear directorio de depuración
New-Item -ItemType Directory -Force -Path $debugDir | Out-Null

function Write-DebugLog {
    param($Message, $Type = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Type] $Message"
    Write-Host $logMessage -ForegroundColor $(if($Type -eq "ERROR"){"Red"}elseif($Type -eq "WARNING"){"Yellow"}else{"Green"})
    Add-Content -Path $reportFile -Value $logMessage
}

# 1. Verificar Estado de Firebase Emulators
function Test-FirebaseEmulators {
    Write-Host "`n🔍 VERIFICANDO FIREBASE EMULATORS..." -ForegroundColor Yellow
    
    $emulatorPorts = @{
        "Auth" = 9099
        "Firestore" = 8080
        "Functions" = 5001
        "Hosting" = 5000
        "UI" = 4000
    }
    
    $emulatorStatus = @{}
    
    foreach ($emulator in $emulatorPorts.GetEnumerator()) {
        $port = $emulator.Value
        $name = $emulator.Key
        
        try {
            $tcpConnection = Test-NetConnection -ComputerName localhost -Port $port -ErrorAction SilentlyContinue
            if ($tcpConnection.TcpTestSucceeded) {
                Write-DebugLog "✅ Emulador $name en puerto $port: ACTIVO" "INFO"
                $emulatorStatus[$name] = "RUNNING"
                
                # Verificar respuesta HTTP si es posible
                if ($name -eq "Auth") {
                    try {
                        $response = Invoke-WebRequest -Uri "http://localhost:$port" -TimeoutSec 2 -ErrorAction SilentlyContinue
                        Write-DebugLog "   - Respuesta HTTP: $($response.StatusCode)" "INFO"
                    } catch {
                        Write-DebugLog "   - Sin respuesta HTTP (puede ser normal)" "WARNING"
                    }
                }
            } else {
                Write-DebugLog "❌ Emulador $name en puerto $port: NO DISPONIBLE" "ERROR"
                $emulatorStatus[$name] = "NOT_RUNNING"
            }
        } catch {
            Write-DebugLog "❌ Error verificando $name`: $_" "ERROR"
            $emulatorStatus[$name] = "ERROR"
        }
    }
    
    return $emulatorStatus
}

# 2. Verificar Configuración de Firebase
function Test-FirebaseConfig {
    Write-Host "`n🔍 VERIFICANDO CONFIGURACIÓN DE FIREBASE..." -ForegroundColor Yellow
    
    # Verificar firebase.json
    $firebaseJsonPath = "firebase.json"
    if (Test-Path $firebaseJsonPath) {
        $firebaseConfig = Get-Content $firebaseJsonPath -Raw | ConvertFrom-Json
        Write-DebugLog "✅ firebase.json encontrado" "INFO"
        
        # Verificar configuración de emuladores
        if ($firebaseConfig.emulators) {
            Write-DebugLog "📋 Configuración de emuladores:" "INFO"
            $firebaseConfig.emulators | ConvertTo-Json -Depth 10 | Out-File "$debugDir/firebase_emulators_config.json"
            
            # Verificar cada emulador
            @("auth", "firestore", "functions", "hosting") | ForEach-Object {
                if ($firebaseConfig.emulators.$_) {
                    Write-DebugLog "   - $_`: Puerto $($firebaseConfig.emulators.$_.port)" "INFO"
                } else {
                    Write-DebugLog "   - $_`: NO CONFIGURADO" "WARNING"
                }
            }
        } else {
            Write-DebugLog "❌ No hay configuración de emuladores en firebase.json" "ERROR"
        }
    } else {
        Write-DebugLog "❌ firebase.json no encontrado" "ERROR"
    }
}

# 3. Verificar Variables de Entorno
function Test-EnvironmentVariables {
    Write-Host "`n🔍 VERIFICANDO VARIABLES DE ENTORNO..." -ForegroundColor Yellow
    
    $requiredEnvVars = @(
        "NEXT_PUBLIC_USE_FIREBASE_EMULATOR",
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    )
    
    $envStatus = @{}
    
    # Verificar archivos .env
    $envFiles = @(".env.local", ".env.development", ".env")
    foreach ($envFile in $envFiles) {
        if (Test-Path $envFile) {
            Write-DebugLog "📄 Archivo $envFile encontrado" "INFO"
            $content = Get-Content $envFile
            
            foreach ($var in $requiredEnvVars) {
                $value = $content | Where-Object { $_ -match "^$var=" } | ForEach-Object { $_ -replace "^$var=", "" }
                if ($value) {
                    $envStatus[$var] = $value
                    Write-DebugLog "   - $var = $value" "INFO"
                }
            }
        }
    }
    
    # Verificar si USE_FIREBASE_EMULATOR está en true
    if ($envStatus["NEXT_PUBLIC_USE_FIREBASE_EMULATOR"] -eq "true") {
        Write-DebugLog "✅ Emuladores habilitados en configuración" "INFO"
    } else {
        Write-DebugLog "❌ Emuladores NO habilitados (NEXT_PUBLIC_USE_FIREBASE_EMULATOR != true)" "ERROR"
    }
    
    return $envStatus
}

# 4. Verificar Aplicaciones Next.js
function Test-NextApps {
    Write-Host "`n🔍 VERIFICANDO APLICACIONES NEXT.JS..." -ForegroundColor Yellow
    
    $apps = @{
        "web-app" = 3000
        "api-server" = 3001
        "doctors" = 3002
        "patients" = 3003
        "companies" = 3004
        "admin" = 3005
    }
    
    $appStatus = @{}
    
    foreach ($app in $apps.GetEnumerator()) {
        $appName = $app.Key
        $port = $app.Value
        
        Write-DebugLog "Verificando $appName en puerto $port..." "INFO"
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$port" -TimeoutSec 3 -ErrorAction SilentlyContinue
            Write-DebugLog "✅ $appName`: ACTIVO (Status: $($response.StatusCode))" "INFO"
            $appStatus[$appName] = "RUNNING"
            
            # Guardar headers de respuesta
            $response.Headers | Out-File "$debugDir/${appName}_headers.txt"
            
        } catch {
            if ($_.Exception.Response) {
                $statusCode = [int]$_.Exception.Response.StatusCode
                Write-DebugLog "⚠️ $appName`: Responde pero con error (Status: $statusCode)" "WARNING"
                $appStatus[$appName] = "ERROR_$statusCode"
            } else {
                Write-DebugLog "❌ $appName`: NO DISPONIBLE" "ERROR"
                $appStatus[$appName] = "NOT_RUNNING"
            }
        }
    }
    
    return $appStatus
}

# 5. Verificar Conectividad de Red
function Test-NetworkConnectivity {
    Write-Host "`n🔍 VERIFICANDO CONECTIVIDAD DE RED..." -ForegroundColor Yellow
    
    # Verificar localhost
    $localhostTest = Test-NetConnection -ComputerName localhost -Port 80 -WarningAction SilentlyContinue
    Write-DebugLog "Localhost conectividad: $($localhostTest.TcpTestSucceeded)" "INFO"
    
    # Verificar DNS
    try {
        $dnsTest = Resolve-DnsName localhost -ErrorAction SilentlyContinue
        Write-DebugLog "DNS localhost resuelve a: $($dnsTest.IPAddress -join ', ')" "INFO"
    } catch {
        Write-DebugLog "❌ Error resolviendo DNS localhost" "ERROR"
    }
    
    # Verificar firewall
    Write-DebugLog "Verificando reglas de firewall..." "INFO"
    $firewallRules = Get-NetFirewallRule | Where-Object { $_.DisplayName -like "*node*" -or $_.DisplayName -like "*firebase*" }
    if ($firewallRules) {
        Write-DebugLog "Reglas de firewall encontradas: $($firewallRules.Count)" "INFO"
        $firewallRules | Select-Object DisplayName, Enabled, Direction, Action | Out-File "$debugDir/firewall_rules.txt"
    } else {
        Write-DebugLog "⚠️ No se encontraron reglas de firewall para Node/Firebase" "WARNING"
    }
}

# 6. Capturar Logs de Procesos
function Capture-ProcessLogs {
    Write-Host "`n🔍 CAPTURANDO INFORMACIÓN DE PROCESOS..." -ForegroundColor Yellow
    
    # Buscar procesos Node.js
    $nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-DebugLog "Procesos Node.js encontrados: $($nodeProcesses.Count)" "INFO"
        $nodeProcesses | Select-Object Id, ProcessName, StartTime, CPU, WorkingSet | Out-File "$debugDir/node_processes.txt"
    } else {
        Write-DebugLog "❌ No se encontraron procesos Node.js" "ERROR"
    }
    
    # Verificar puertos en uso
    Write-DebugLog "Puertos en uso:" "INFO"
    netstat -ano | findstr "LISTENING" | Out-File "$debugDir/listening_ports.txt"
}

# 7. Test de Autenticación Manual
function Test-ManualAuth {
    Write-Host "`n🔍 PROBANDO AUTENTICACIÓN MANUAL..." -ForegroundColor Yellow
    
    $authUrl = "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key"
    $testPayload = @{
        email = "test@altamedica.com"
        password = "test123"
        returnSecureToken = $true
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $authUrl -Method POST -Body $testPayload -ContentType "application/json" -ErrorAction Stop
        Write-DebugLog "✅ Emulador de Auth responde correctamente" "INFO"
        $response | ConvertTo-Json | Out-File "$debugDir/auth_test_response.json"
    } catch {
        Write-DebugLog "❌ Error conectando al emulador de Auth: $_" "ERROR"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            Write-DebugLog "Respuesta de error: $errorBody" "ERROR"
            $errorBody | Out-File "$debugDir/auth_error_response.txt"
        }
    }
}

# 8. Generar Reporte Final
function Generate-FinalReport {
    Write-Host "`n📊 GENERANDO REPORTE FINAL..." -ForegroundColor Yellow
    
    $report = @"
═══════════════════════════════════════════════════════════════
        REPORTE DE DEPURACIÓN DE AUTENTICACIÓN - ALTAMEDICA
═══════════════════════════════════════════════════════════════
Fecha: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Directorio de debug: $debugDir

RESUMEN EJECUTIVO:
-----------------
"@

    # Análisis de problemas encontrados
    $problems = @()
    $emulatorStatus = Test-FirebaseEmulators
    
    if ($emulatorStatus["Auth"] -ne "RUNNING") {
        $problems += "❌ Emulador de Auth NO está corriendo"
    }
    if ($emulatorStatus["Firestore"] -ne "RUNNING") {
        $problems += "❌ Emulador de Firestore NO está corriendo"
    }
    
    if ($problems.Count -eq 0) {
        $report += "`n✅ Todos los servicios críticos están funcionando correctamente`n"
    } else {
        $report += "`n⚠️ SE ENCONTRARON LOS SIGUIENTES PROBLEMAS:`n"
        $problems | ForEach-Object { $report += "  $_`n" }
    }
    
    $report += @"

RECOMENDACIONES:
----------------
1. Si los emuladores no están corriendo:
   - Ejecutar: firebase emulators:start --only auth,firestore,functions,hosting
   
2. Si hay problemas de configuración:
   - Verificar que NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true en .env.local
   
3. Si hay errores de red:
   - Verificar firewall de Windows
   - Reiniciar servicios de red

ARCHIVOS GENERADOS:
------------------
"@

    Get-ChildItem $debugDir | ForEach-Object {
        $report += "  - $($_.Name)`n"
    }
    
    $report | Out-File "$debugDir/REPORTE_FINAL.txt"
    Write-Host $report -ForegroundColor Cyan
}

# Ejecutar todas las pruebas
Write-DebugLog "Iniciando depuración completa de autenticación..." "INFO"

Test-FirebaseConfig
$emulatorStatus = Test-FirebaseEmulators
$envStatus = Test-EnvironmentVariables
$appStatus = Test-NextApps
Test-NetworkConnectivity
Capture-ProcessLogs
Test-ManualAuth
Generate-FinalReport

Write-Host "`n✅ Depuración completada. Revisa el directorio: $debugDir" -ForegroundColor Green
Write-Host "📄 Reporte principal: $debugDir\REPORTE_FINAL.txt" -ForegroundColor Yellow

# Abrir el directorio de resultados
explorer $debugDir