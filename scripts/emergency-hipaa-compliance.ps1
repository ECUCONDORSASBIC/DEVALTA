#!/usr/bin/env pwsh

param(
    [switch]$DryRun,
    [switch]$Force
)

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry
}

Write-Log "INICIANDO SCRIPT DE EMERGENCIA HIPAA" "CRITICAL"
Write-Log "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "INFO"
Write-Log "Usuario: $env:USERNAME" "INFO"
Write-Log "Directorio: $PWD" "INFO"

# Verificar si estamos en el directorio correcto
if (!(Test-Path "package.json")) {
    Write-Log "ERROR: No se encontró package.json. Ejecutar desde la raíz del proyecto." "ERROR"
    exit 1
}

# 1. DESHABILITAR APIS NO COMPLIANT
Write-Log "PASO 1: Deshabilitando APIs no compliant..." "WARN"

$apiFiles = @(
    "apps/api-server/src/app/api/v1/applications/route.ts",
    "apps/api-server/src/app/api/v1/dashboard/analytics/route.ts",
    "apps/api-server/src/app/api/v1/medical-locations/route.ts"
)

foreach ($file in $apiFiles) {
    if (Test-Path $file) {
        $backupFile = "$file.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        if (!$DryRun) {
            Copy-Item $file $backupFile
            Write-Log "Backup creado: $backupFile" "INFO"
            
            $emergencyContent = "// EMERGENCY HIPAA: API DISABLED`n// Original file backed up to: $backupFile`n// Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`nexport async function GET() {`n  return new Response(JSON.stringify({`n    error: 'API_DISABLED_EMERGENCY_HIPAA',`n    message: 'This API has been disabled due to HIPAA compliance emergency',`n    timestamp: new Date().toISOString()`n  }), {`n    status: 503,`n    headers: { 'Content-Type': 'application/json' }`n  })`n}`n`nexport async function POST() {`n  return new Response(JSON.stringify({`n    error: 'API_DISABLED_EMERGENCY_HIPAA',`n    message: 'This API has been disabled due to HIPAA compliance emergency',`n    timestamp: new Date().toISOString()`n  }), {`n    status: 503,`n    headers: { 'Content-Type': 'application/json' }`n  })`n}"
            Set-Content $file $emergencyContent
            Write-Log "API deshabilitada: $file" "WARN"
        } else {
            Write-Log "DRY RUN: Se deshabilitaría: $file" "INFO"
        }
    }
}

# 2. DESHABILITAR COMPONENTES DE TELEMEDICINA
Write-Log "PASO 2: Deshabilitando componentes de telemedicina..." "WARN"

$telemedicineFiles = @(
    "apps/patients/src/components/telemedicine/WebRTCVideoCall.tsx",
    "apps/patients/src/hooks/useWebRTC.ts",
    "apps/patients/src/hooks/useTelemedicineSession.ts"
)

foreach ($file in $telemedicineFiles) {
    if (Test-Path $file) {
        $backupFile = "$file.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        if (!$DryRun) {
            Copy-Item $file $backupFile
            Write-Log "Backup creado: $backupFile" "INFO"
            
            $emergencyContent = "// EMERGENCY HIPAA: TELEMEDICINE DISABLED`n// Original file backed up to: $backupFile`n// Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`nimport React from 'react';`n`nexport default function EmergencyTelemedicineComponent() {`n  return (`n    <div className='flex items-center justify-center min-h-[400px] bg-red-50 border-2 border-red-200 rounded-lg p-8'>`n      <div className='text-center'>`n        <h2 className='text-xl font-semibold text-red-800 mb-2'>`n          Telemedicina Deshabilitada`n        </h2>`n        <p className='text-red-600 mb-4'>`n          Esta funcionalidad ha sido deshabilitada temporalmente debido a una emergencia de compliance HIPAA.`n        </p>`n      </div>`n    </div>`n  );`n}"
            Set-Content $file $emergencyContent
            Write-Log "Telemedicina deshabilitada: $file" "WARN"
        } else {
            Write-Log "DRY RUN: Se deshabilitaría telemedicina: $file" "INFO"
        }
    }
}

# 3. DESHABILITAR DATOS MOCK
Write-Log "PASO 3: Deshabilitando datos mock..." "WARN"

$mockFiles = @(
    "apps/companies/companies/lib/mock-data.ts",
    "apps/web-app/src/hooks/dashboard/useDashboardData.ts"
)

foreach ($file in $mockFiles) {
    if (Test-Path $file) {
        $backupFile = "$file.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        if (!$DryRun) {
            Copy-Item $file $backupFile
            Write-Log "Backup creado: $backupFile" "INFO"
            
            $emergencyData = "// EMERGENCY HIPAA: MOCK DATA DISABLED`n// Original file backed up to: $backupFile`n// Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`nexport const MOCK_DATA_DISABLED = {`n  error: 'MOCK_DATA_DISABLED_EMERGENCY_HIPAA',`n  message: 'Mock data has been disabled due to HIPAA compliance emergency',`n  timestamp: new Date().toISOString(),`n  compliance: {`n    hipaa: 'DISABLED',`n    gdpr: 'DISABLED',`n    fhir: 'DISABLED'`n  }`n};`n`n// Exportar arrays vacíos para evitar errores`nexport const MOCK_LISTINGS: any[] = [];`nexport const MOCK_COMPANIES: any[] = [];`nexport const MOCK_DOCTORS: any[] = [];`nexport const mockStats = null;`nexport const mockAppointment = null;`nexport const mockPrescriptions: any[] = [];`nexport const mockActivities: any[] = [];"
            Set-Content $file $emergencyData
            Write-Log "Datos mock deshabilitados: $file" "WARN"
        } else {
            Write-Log "DRY RUN: Se deshabilitarían datos mock: $file" "INFO"
        }
    }
}

# 4. CREAR ARCHIVO DE ESTADO DE EMERGENCIA
Write-Log "PASO 4: Creando archivo de estado de emergencia..." "WARN"

$emergencyStateFile = "EMERGENCY_HIPAA_STATE.json"
$emergencyState = @{
    emergency = @{
        activated = $true
        timestamp = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
        reason = "HIPAA Compliance Emergency"
        severity = "CRITICAL"
        actions = @(
            "APIs no compliant deshabilitadas",
            "Telemedicina deshabilitada",
            "Datos mock deshabilitados"
        )
    }
    compliance = @{
        hipaa = "DISABLED"
        gdpr = "DISABLED"
        fhir = "DISABLED"
        audit = "ENABLED"
        encryption = "ENABLED"
    }
    system = @{
        status = "EMERGENCY_MODE"
        safeForProduction = $false
        requiresAudit = $true
        nextSteps = @(
            "Implementar base de datos real",
            "Conectar autenticación real",
            "Implementar backend de telemedicina",
            "Auditoría de seguridad externa"
        )
    }
}

if (!$DryRun) {
    $emergencyState | ConvertTo-Json -Depth 10 | Set-Content $emergencyStateFile
    Write-Log "Archivo de estado creado: $emergencyStateFile" "INFO"
} else {
    Write-Log "DRY RUN: Se crearía archivo de estado: $emergencyStateFile" "INFO"
}

# 5. RESUMEN FINAL
Write-Log "PASO 5: Generando resumen..." "INFO"

$summary = "=== RESUMEN DE EMERGENCIA HIPAA ===`nTimestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`nModo: $(if ($DryRun) { 'DRY RUN' } else { 'EJECUCIÓN REAL' })`n`nACCIONES REALIZADAS:`n- APIs no compliant deshabilitadas`n- Componentes de telemedicina deshabilitados`n- Datos mock deshabilitados`n- Archivo de estado creado`n`nESTADO DEL SISTEMA:`n- NO SEGURO PARA PRODUCCIÓN`n- REQUIERE IMPLEMENTACIÓN DE COMPLIANCE`n- NECESITA AUDITORÍA EXTERNA`n`nPRÓXIMOS PASOS CRÍTICOS:`n1. Implementar base de datos real con encriptación`n2. Conectar autenticación Firebase real`n3. Implementar backend WebRTC para telemedicina`n4. Auditoría de seguridad externa`n5. Certificación HIPAA"

Write-Log $summary "INFO"

if ($DryRun) {
    Write-Log "MODO DRY RUN: No se realizaron cambios reales" "INFO"
    Write-Log "Para ejecutar cambios reales, usar: .\scripts\emergency-hipaa-compliance.ps1 -Force" "INFO"
} else {
    Write-Log "EMERGENCIA HIPAA ACTIVADA - SISTEMA NO SEGURO PARA PRODUCCIÓN" "CRITICAL"
    Write-Log "Se requieren acciones inmediatas para compliance" "CRITICAL"
}

Write-Log "Script de emergencia completado" "INFO" 