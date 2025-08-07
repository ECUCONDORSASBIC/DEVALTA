# AltaMedica - Ejecutor de Suite Completa de Depuración de Autenticación
# Autor: Eduardo Marques
# Fecha: Enero 2025

Write-Host @"
╔═══════════════════════════════════════════════════════════════════════╗
║     ALTAMEDICA - SUITE COMPLETA DE DEPURACIÓN DE AUTENTICACIÓN        ║
╚═══════════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

$global:timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$global:masterDebugDir = "MASTER_DEBUG_AUTH_$timestamp"
$global:finalReportPath = "$masterDebugDir\INFORME_CONSOLIDADO.md"

# Crear directorio maestro
New-Item -ItemType Directory -Force -Path $masterDebugDir | Out-Null

Write-Host "`n📁 Directorio de depuración: $masterDebugDir" -ForegroundColor Yellow
Write-Host "`nEsta suite ejecutará todas las herramientas de depuración disponibles." -ForegroundColor Green
Write-Host "El proceso puede tomar varios minutos..." -ForegroundColor Yellow

# Función para ejecutar herramienta y capturar resultado
function Run-DebugTool {
    param(
        [string]$ToolName,
        [string]$Command,
        [string]$Description,
        [string]$OutputDir
    )
    
    Write-Host "`n" + "="*60 -ForegroundColor Blue
    Write-Host "🔧 Ejecutando: $ToolName" -ForegroundColor Cyan
    Write-Host "   $Description" -ForegroundColor Gray
    Write-Host "="*60 -ForegroundColor Blue
    
    $startTime = Get-Date
    $toolLog = "$OutputDir\${ToolName}_log.txt"
    
    try {
        # Ejecutar comando y capturar salida
        $output = & {
            Invoke-Expression $Command 2>&1
        }
        
        # Guardar salida
        $output | Out-File -FilePath $toolLog -Encoding UTF8
        
        $duration = (Get-Date) - $startTime
        Write-Host "✅ $ToolName completado en $([math]::Round($duration.TotalSeconds, 1)) segundos" -ForegroundColor Green
        
        return @{
            Success = $true
            Duration = $duration.TotalSeconds
            Output = $output
            LogPath = $toolLog
        }
    } catch {
        Write-Host "❌ Error ejecutando $ToolName`: $_" -ForegroundColor Red
        return @{
            Success = $false
            Error = $_.Exception.Message
            LogPath = $toolLog
        }
    }
}

# 1. Ejecutar diagnóstico inicial de PowerShell
Write-Host "`n🚀 FASE 1: Diagnóstico Inicial con PowerShell" -ForegroundColor Yellow
$ps1Result = Run-DebugTool `
    -ToolName "PowerShell_Diagnostics" `
    -Command "powershell.exe -ExecutionPolicy Bypass -File .\scripts\debug-auth-complete.ps1" `
    -Description "Verificación completa de servicios y configuración" `
    -OutputDir $masterDebugDir

# Mover resultados al directorio maestro
if (Test-Path "debug_auth_*") {
    $latestDebugDir = Get-ChildItem -Path . -Filter "debug_auth_*" -Directory | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($latestDebugDir) {
        Move-Item -Path $latestDebugDir.FullName -Destination "$masterDebugDir\PowerShell_Results" -Force
    }
}

# 2. Ejecutar análisis profundo con Python
Write-Host "`n🚀 FASE 2: Análisis Profundo con Python" -ForegroundColor Yellow
$pythonResult = Run-DebugTool `
    -ToolName "Python_Deep_Analysis" `
    -Command "python .\scripts\auth_deep_analyzer.py" `
    -Description "Análisis detallado de servicios, red y autenticación" `
    -OutputDir $masterDebugDir

# Mover resultados Python
if (Test-Path "python_debug_auth_*") {
    $latestPythonDir = Get-ChildItem -Path . -Filter "python_debug_auth_*" -Directory | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($latestPythonDir) {
        Move-Item -Path $latestPythonDir.FullName -Destination "$masterDebugDir\Python_Results" -Force
    }
}

# 3. Ejecutar tests de Playwright (si está instalado)
Write-Host "`n🚀 FASE 3: Tests de UI con Playwright" -ForegroundColor Yellow
$playwrightInstalled = Get-Command npx -ErrorAction SilentlyContinue

if ($playwrightInstalled) {
    # Verificar si Playwright está instalado
    $playwrightCheck = npx playwright --version 2>$null
    if ($playwrightCheck) {
        $playwrightResult = Run-DebugTool `
            -ToolName "Playwright_UI_Tests" `
            -Command "npx playwright test tests/auth-debug.spec.ts --reporter=json" `
            -Description "Tests automatizados del flujo de login" `
            -OutputDir $masterDebugDir
            
        # Mover resultados de Playwright
        if (Test-Path "playwright_debug_*") {
            $latestPlaywrightDir = Get-ChildItem -Path . -Filter "playwright_debug_*" -Directory | Sort-Object LastWriteTime -Descending | Select-Object -First 1
            if ($latestPlaywrightDir) {
                Move-Item -Path $latestPlaywrightDir.FullName -Destination "$masterDebugDir\Playwright_Results" -Force
            }
        }
    } else {
        Write-Host "⚠️  Playwright no instalado. Instalalo con: npm install -D @playwright/test" -ForegroundColor Yellow
        $playwrightResult = @{ Success = $false; Error = "Playwright no instalado" }
    }
} else {
    Write-Host "⚠️  NPX no encontrado. Saltando tests de Playwright" -ForegroundColor Yellow
    $playwrightResult = @{ Success = $false; Error = "NPX no disponible" }
}

# 4. Capturar estado actual del sistema
Write-Host "`n🚀 FASE 4: Captura de Estado del Sistema" -ForegroundColor Yellow

# Procesos Node.js
Write-Host "   📊 Capturando procesos Node.js..." -ForegroundColor Gray
Get-Process -Name node -ErrorAction SilentlyContinue | 
    Select-Object Id, ProcessName, StartTime, CPU, WorkingSet, CommandLine |
    Export-Csv "$masterDebugDir\node_processes.csv" -NoTypeInformation

# Puertos en uso
Write-Host "   📊 Capturando puertos en uso..." -ForegroundColor Gray
netstat -ano | findstr "LISTENING" | Out-File "$masterDebugDir\listening_ports.txt"

# Variables de entorno relevantes
Write-Host "   📊 Capturando variables de entorno..." -ForegroundColor Gray
Get-ChildItem Env: | Where-Object { $_.Name -like "*FIREBASE*" -or $_.Name -like "*NEXT*" } |
    Select-Object Name, Value | Export-Csv "$masterDebugDir\environment_variables.csv" -NoTypeInformation

# 5. Analizar archivos de configuración
Write-Host "`n🚀 FASE 5: Análisis de Configuración" -ForegroundColor Yellow

$configFiles = @(
    @{ Path = "firebase.json"; Name = "Firebase_Config" },
    @{ Path = ".env.local"; Name = "Env_Local" },
    @{ Path = ".env.development"; Name = "Env_Development" },
    @{ Path = "apps\web-app\next.config.js"; Name = "Next_Config" }
)

foreach ($config in $configFiles) {
    if (Test-Path $config.Path) {
        Write-Host "   📄 Analizando $($config.Name)..." -ForegroundColor Gray
        Copy-Item -Path $config.Path -Destination "$masterDebugDir\$($config.Name)_backup.txt" -Force
    }
}

# 6. Generar informe consolidado
Write-Host "`n📊 Generando Informe Consolidado..." -ForegroundColor Yellow

$report = @"
# INFORME CONSOLIDADO DE DEPURACIÓN DE AUTENTICACIÓN
## AltaMedica Platform

**Fecha:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Directorio de Debug:** ``$masterDebugDir``

---

## 📋 RESUMEN EJECUTIVO

Este informe consolida los resultados de múltiples herramientas de depuración ejecutadas para diagnosticar problemas de autenticación en la plataforma AltaMedica.

### 🔍 Herramientas Ejecutadas:

| Herramienta | Estado | Duración | Descripción |
|-------------|--------|----------|-------------|
| PowerShell Diagnostics | $(if($ps1Result.Success){"✅ Exitoso"}else{"❌ Fallido"}) | $([math]::Round($ps1Result.Duration, 1))s | Diagnóstico inicial de servicios |
| Python Deep Analysis | $(if($pythonResult.Success){"✅ Exitoso"}else{"❌ Fallido"}) | $([math]::Round($pythonResult.Duration, 1))s | Análisis profundo de red y auth |
| Playwright UI Tests | $(if($playwrightResult.Success){"✅ Exitoso"}else{"❌ Fallido"}) | $(if($playwrightResult.Duration){[math]::Round($playwrightResult.Duration, 1).ToString() + "s"}else{"N/A"}) | Tests automatizados de UI |

---

## 🔴 PROBLEMAS CRÍTICOS DETECTADOS

"@

# Analizar resultados y extraer problemas
$criticalIssues = @()

# Verificar servicios críticos
$servicesDown = @()
if (Test-Path "$masterDebugDir\PowerShell_Results\auth_debug_report.txt") {
    $psReport = Get-Content "$masterDebugDir\PowerShell_Results\auth_debug_report.txt" -Raw
    if ($psReport -match "Emulador.*NO.*disponible") {
        $servicesDown += "Firebase Emulators no están corriendo"
    }
}

if ($servicesDown.Count -gt 0) {
    $report += @"

### 1. Servicios No Disponibles
$(foreach ($service in $servicesDown) { "- ❌ $service`n" })

**Solución Recomendada:**
``````bash
firebase emulators:start --only auth,firestore,functions,hosting
``````

"@
}

# Verificar configuración
$configIssues = @()
if (Test-Path "$masterDebugDir\Python_Results\environment_variables.json") {
    $envVars = Get-Content "$masterDebugDir\Python_Results\environment_variables.json" | ConvertFrom-Json
    if (-not $envVars.NEXT_PUBLIC_USE_FIREBASE_EMULATOR -or $envVars.NEXT_PUBLIC_USE_FIREBASE_EMULATOR -ne "true") {
        $configIssues += "NEXT_PUBLIC_USE_FIREBASE_EMULATOR no está configurado como 'true'"
    }
}

if ($configIssues.Count -gt 0) {
    $report += @"

### 2. Problemas de Configuración
$(foreach ($issue in $configIssues) { "- ⚠️ $issue`n" })

**Solución Recomendada:**
Verificar archivo ``.env.local`` y asegurar:
``````env
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
``````

"@
}

$report += @"

---

## 📁 ESTRUCTURA DE RESULTADOS

El directorio ``$masterDebugDir`` contiene:

``````
$masterDebugDir/
├── PowerShell_Results/     # Resultados del diagnóstico PowerShell
│   ├── auth_debug_report.txt
│   ├── firebase_emulators_config.json
│   └── ...
├── Python_Results/         # Resultados del análisis Python
│   ├── analysis_report.json
│   ├── ANALYSIS_REPORT.txt
│   └── ...
├── Playwright_Results/     # Resultados de tests UI (si disponible)
│   ├── auth_test_report.json
│   └── screenshots/
├── node_processes.csv      # Procesos Node.js activos
├── listening_ports.txt     # Puertos en escucha
├── environment_variables.csv # Variables de entorno
└── *_backup.txt           # Copias de archivos de configuración
``````

---

## 🚀 PRÓXIMOS PASOS RECOMENDADOS

1. **Verificar Firebase Emulators:**
   ``````bash
   firebase emulators:start --only auth,firestore,functions,hosting
   ``````

2. **Verificar configuración de entorno:**
   - Revisar ``.env.local``
   - Confirmar ``NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true``

3. **Reiniciar servicios:**
   ``````bash
   npm run dev:all
   ``````

4. **Ejecutar monitor en tiempo real:**
   ``````powershell
   .\scripts\auth-realtime-monitor.ps1 -SaveLogs
   ``````

---

## 📞 INFORMACIÓN DE SOPORTE

- **Documentación:** Ver archivos individuales en cada subdirectorio
- **Logs detallados:** Disponibles en cada carpeta de resultados
- **Monitor continuo:** Usar el script de monitor en tiempo real para observación continua

---

*Informe generado automáticamente por la Suite de Depuración de AltaMedica*
"@

# Guardar informe
$report | Out-File -FilePath $finalReportPath -Encoding UTF8

# Mostrar resumen final
Write-Host "`n" + "="*70 -ForegroundColor Green
Write-Host "✅ SUITE DE DEPURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "="*70 -ForegroundColor Green

Write-Host "`n📊 RESUMEN DE RESULTADOS:" -ForegroundColor Cyan
Write-Host "   - Directorio maestro: $masterDebugDir" -ForegroundColor White
Write-Host "   - Informe consolidado: $finalReportPath" -ForegroundColor White
Write-Host "   - Herramientas ejecutadas: 3/3" -ForegroundColor White

# Detectar problemas principales
$mainIssues = @()
if ($servicesDown.Count -gt 0) {
    $mainIssues += "Servicios Firebase no están corriendo"
}
if ($configIssues.Count -gt 0) {
    $mainIssues += "Problemas de configuración detectados"
}

if ($mainIssues.Count -gt 0) {
    Write-Host "`n⚠️  PROBLEMAS DETECTADOS:" -ForegroundColor Red
    foreach ($issue in $mainIssues) {
        Write-Host "   - $issue" -ForegroundColor Yellow
    }
    
    Write-Host "`n💡 SOLUCIÓN RÁPIDA:" -ForegroundColor Green
    Write-Host "   1. Ejecutar: firebase emulators:start --only auth,firestore,functions,hosting" -ForegroundColor White
    Write-Host "   2. Verificar NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true en .env.local" -ForegroundColor White
    Write-Host "   3. Reiniciar: npm run dev:all" -ForegroundColor White
} else {
    Write-Host "`n✅ No se detectaron problemas críticos" -ForegroundColor Green
}

Write-Host "`n📂 Abriendo directorio de resultados..." -ForegroundColor Yellow
explorer $masterDebugDir

Write-Host "`n🎯 Para monitoreo continuo, ejecuta:" -ForegroundColor Cyan
Write-Host "   .\scripts\auth-realtime-monitor.ps1 -SaveLogs" -ForegroundColor White
Write-Host "`n"