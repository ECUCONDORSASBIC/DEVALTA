# Script de diagnóstico automático para SSO
# Verifica todos los componentes del sistema de autenticación

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🔬 Diagnóstico Automático SSO" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$issues = @()
$warnings = @()
$successes = @()

# 1. Verificar Node.js
Write-Host "`n🔍 Verificando entorno..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        $successes += "✅ Node.js instalado: $nodeVersion"
    } else {
        $issues += "❌ Node.js no está instalado"
    }
} catch {
    $issues += "❌ Error verificando Node.js: $_"
}

# 2. Verificar servicios
Write-Host "`n🔍 Verificando servicios..." -ForegroundColor Yellow

function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

$services = @(
    @{Name="Web App"; Port=3000; Critical=$true},
    @{Name="API Server"; Port=3001; Critical=$true},
    @{Name="Patients App"; Port=3003; Critical=$true},
    @{Name="Signaling Server"; Port=8888; Critical=$false},
    @{Name="SSO Proxy"; Port=9000; Critical=$false}
)

foreach ($service in $services) {
    if (Test-Port -Port $service.Port) {
        $successes += "✅ $($service.Name) activo en puerto $($service.Port)"
    } else {
        if ($service.Critical) {
            $issues += "❌ $($service.Name) NO está corriendo en puerto $($service.Port)"
        } else {
            $warnings += "⚠️ $($service.Name) no está activo en puerto $($service.Port) (opcional)"
        }
    }
}

# 3. Verificar archivos críticos
Write-Host "`n🔍 Verificando archivos..." -ForegroundColor Yellow

$criticalFiles = @(
    @{Path=".\apps\patients\src\middleware.ts"; Name="Middleware de Patients"},
    @{Path=".\apps\patients\src\providers\AuthProvider.tsx"; Name="AuthProvider"},
    @{Path=".\setup-sso-proxy.js"; Name="Proxy SSO"},
    @{Path=".\packages\shared\src\auth\sso-service.ts"; Name="Servicio SSO"}
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file.Path) {
        $successes += "✅ $($file.Name) existe"
    } else {
        $issues += "❌ $($file.Name) no encontrado en: $($file.Path)"
    }
}

# 4. Verificar health endpoints
Write-Host "`n🔍 Verificando endpoints de salud..." -ForegroundColor Yellow

$endpoints = @(
    @{Name="API Health"; Url="http://localhost:3001/api/health"},
    @{Name="API Auth"; Url="http://localhost:3001/api/v1/auth/status"}
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri $endpoint.Url -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $successes += "✅ $($endpoint.Name) respondiendo correctamente"
        } else {
            $warnings += "⚠️ $($endpoint.Name) respondió con código: $($response.StatusCode)"
        }
    } catch {
        if ($endpoint.Name -eq "API Health") {
            $issues += "❌ $($endpoint.Name) no responde"
        } else {
            $warnings += "⚠️ $($endpoint.Name) no disponible"
        }
    }
}

# 5. Mostrar resultados
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "📊 RESULTADOS DEL DIAGNÓSTICO" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

if ($successes.Count -gt 0) {
    Write-Host "`n✅ COMPONENTES FUNCIONANDO:" -ForegroundColor Green
    foreach ($success in $successes) {
        Write-Host "   $success" -ForegroundColor Green
    }
}

if ($warnings.Count -gt 0) {
    Write-Host "`n⚠️ ADVERTENCIAS:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "   $warning" -ForegroundColor Yellow
    }
}

if ($issues.Count -gt 0) {
    Write-Host "`n❌ PROBLEMAS ENCONTRADOS:" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "   $issue" -ForegroundColor Red
    }
}

# 6. Recomendaciones
Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "💡 RECOMENDACIONES" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

if ($issues.Count -eq 0) {
    Write-Host "`n✅ El sistema parece estar configurado correctamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Yellow
    Write-Host "1. Ejecuta: .\test-sso-redirect.ps1" -ForegroundColor White
    Write-Host "2. Sigue las instrucciones de prueba" -ForegroundColor White
    
    if (-not (Test-Port -Port 9000)) {
        Write-Host ""
        Write-Host "💡 TIP: Para mejor experiencia, usa el proxy SSO:" -ForegroundColor Yellow
        Write-Host "   node setup-sso-proxy.js" -ForegroundColor White
    }
} else {
    Write-Host "`n⚠️ Se encontraron problemas que deben resolverse:" -ForegroundColor Yellow
    
    if ($issues -match "Node.js") {
        Write-Host ""
        Write-Host "1. Instala Node.js desde: https://nodejs.org/" -ForegroundColor White
    }
    
    $missingServices = $issues | Where-Object { $_ -match "NO está corriendo" }
    if ($missingServices.Count -gt 0) {
        Write-Host ""
        Write-Host "2. Inicia los servicios faltantes:" -ForegroundColor White
        Write-Host "   Opción A: .\start-with-sso.ps1 (inicia todo)" -ForegroundColor Green
        Write-Host "   Opción B: npm run dev:all (sin proxy)" -ForegroundColor Yellow
    }
    
    $missingFiles = $issues | Where-Object { $_ -match "no encontrado" }
    if ($missingFiles.Count -gt 0) {
        Write-Host ""
        Write-Host "3. Archivos faltantes detectados." -ForegroundColor White
        Write-Host "   Verifica que estés en el directorio correcto:" -ForegroundColor White
        Write-Host "   cd C:\Users\Eduardo\Documents\devaltamedica" -ForegroundColor Gray
    }
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host "📝 Diagnóstico completado" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan