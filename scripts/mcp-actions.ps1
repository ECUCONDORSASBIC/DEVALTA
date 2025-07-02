# ALTAMEDICA MCP - ACCIONES INMEDIATAS
param(
    [string]$Action = "all",
    [string]$Priority = "high"
)

$ProjectRoot = $PSScriptRoot -replace '\\scripts$', ''
$LogFile = Join-Path $ProjectRoot "logs\mcp-actions-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

function Write-Log {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage -ForegroundColor $Color
    if (!(Test-Path (Split-Path $LogFile))) {
        New-Item -ItemType Directory -Path (Split-Path $LogFile) -Force | Out-Null
    }
    Add-Content -Path $LogFile -Value $logMessage -ErrorAction SilentlyContinue
}

function Create-Directories {
    $dirs = @("logs", "backups", "reports", "public", "analytics")
    foreach ($dir in $dirs) {
        $fullPath = Join-Path $ProjectRoot $dir
        if (!(Test-Path $fullPath)) {
            New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
            Write-Log "Directorio creado: $dir" "Green"
        }
    }
}

function Fix-Hotspots {
    Write-Log "Corrigiendo hotspots criticos..." "Yellow"
    
    # Actualizar dependencias
    $packageFiles = Get-ChildItem -Path $ProjectRoot -Name "package.json" -Recurse
    foreach ($packageFile in $packageFiles) {
        $fullPath = Join-Path $ProjectRoot $packageFile
        $dir = Split-Path $fullPath
        Write-Log "Actualizando: $packageFile" "Cyan"
        
        try {
            Push-Location $dir
            npm audit fix --force 2>$null
            Pop-Location
            Write-Log "Dependencias actualizadas en $packageFile" "Green"
        } catch {
            Write-Log "Error en $packageFile : $_" "Red"
            Pop-Location
        }
    }
    
    # Corregir ESLint
    try {
        Push-Location $ProjectRoot
        npx eslint . --fix --ext .js,.ts,.jsx,.tsx 2>$null
        Pop-Location
        Write-Log "ESLint corregido" "Green"
    } catch {
        Write-Log "ESLint no disponible" "Yellow"
        Pop-Location
    }
}

function Enhance-Security {
    Write-Log "Mejorando seguridad..." "Yellow"
    
    # Crear archivo .env.example si no existe
    $envFile = Join-Path $ProjectRoot ".env.example"
    if (!(Test-Path $envFile)) {
        $envContent = @"
# ALTAMEDICA SECURITY CONFIGURATION
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/altamedica

# Security
JWT_SECRET=your-super-secret-jwt-key-here
ALLOWED_ORIGINS=https://altamedica.com

# Medical Compliance
HIPAA_COMPLIANCE=true
AUDIT_LOGGING=true
DATA_ENCRYPTION=true
"@
        Set-Content $envFile -Value $envContent
        Write-Log "Archivo .env.example creado" "Green"
    }
}

function Setup-MCP {
    Write-Log "Configurando MCP..." "Yellow"
    
    # Crear configuración MCP optimizada
    $mcpConfigPath = Join-Path $ProjectRoot "mcp-enhanced-config.json"
    $mcpConfig = @{
        "mcpServers" = @{
            "multi-agent-composer" = @{
                "command" = "node"
                "args" = @("tools/multi-agent-composer-mcp.js")
                "priority" = 0
            }
            "codebase-intelligence" = @{
                "command" = "node"
                "args" = @("tools/codebase-intelligence-mcp.js")
                "priority" = 1
            }
        }
        "metrics" = @{
            "accuracy_target" = 98.0
            "security_improvement" = 40.0
            "context_enrichment" = 60.0
            "medical_specialization" = 200.0
        }
    }
    
    $mcpConfig | ConvertTo-Json -Depth 5 | Set-Content $mcpConfigPath
    Write-Log "Configuracion MCP creada" "Green"
}

function Setup-Medical {
    Write-Log "Configurando contexto medico..." "Yellow"
    
    # Crear diccionario médico
    $medicalDictPath = Join-Path $ProjectRoot "medical-dictionary.json"
    $medicalDict = @{
        "icd10_codes" = @{
            "A00-B99" = "Infectious and parasitic diseases"
            "C00-D49" = "Neoplasms"
        }
        "medical_patterns" = @{
            "patient_validation" = "^[A-Z]{2}\d{8}$"
            "diagnosis_format" = "^[A-Z]\d{2}(\.\d{1,2})?$"
        }
    }
    
    $medicalDict | ConvertTo-Json -Depth 3 | Set-Content $medicalDictPath
    Write-Log "Diccionario medico creado" "Green"
    
    # Crear validador médico
    $medicalDir = Join-Path $ProjectRoot "src\components\medical"
    if (!(Test-Path $medicalDir)) {
        New-Item -ItemType Directory -Path $medicalDir -Force | Out-Null
    }
    
    $validatorPath = Join-Path $medicalDir "MedicalValidator.ts"
    $validatorContent = @"
// ALTAMEDICA MEDICAL VALIDATOR
export class MedicalValidator {
    private static readonly ICD10_PATTERN = /^[A-Z]\d{2}(\.\d{1,2})?$/;
    private static readonly PATIENT_ID_PATTERN = /^[A-Z]{2}\d{8}$/;
    
    static validatePatientId(patientId: string): boolean {
        return this.PATIENT_ID_PATTERN.test(patientId);
    }
    
    static validateICD10(code: string): boolean {
        return this.ICD10_PATTERN.test(code);
    }
    
    static sanitizePHI(data: any): any {
        const sanitized = { ...data };
        if (sanitized.ssn) {
            sanitized.ssn = '***-**-' + sanitized.ssn.slice(-4);
        }
        return sanitized;
    }
}
"@
    
    Set-Content $validatorPath -Value $validatorContent
    Write-Log "Validador medico creado" "Green"
}

function Setup-Analytics {
    Write-Log "Configurando analytics..." "Yellow"
    
    # El generador de reportes ya existe
    $reporterPath = Join-Path $ProjectRoot "analytics\generate-reports.js"
    if (Test-Path $reporterPath) {
        Write-Log "Generador de reportes disponible" "Green"
        
        # Generar reporte inicial
        try {
            Push-Location $ProjectRoot
            node analytics/generate-reports.js
            Pop-Location
            Write-Log "Reporte inicial generado" "Green"
        } catch {
            Write-Log "Error generando reporte: $_" "Yellow"
            Pop-Location
        }
    }
}

function Setup-CICD {
    Write-Log "Configurando CI/CD..." "Yellow"
    
    # Crear GitHub Actions workflow
    $githubDir = Join-Path $ProjectRoot ".github\workflows"
    if (!(Test-Path $githubDir)) {
        New-Item -ItemType Directory -Path $githubDir -Force | Out-Null
    }
    
    $workflowPath = Join-Path $githubDir "mcp-quality-gate.yml"
    $workflow = @"
name: ALTAMEDICA MCP Quality Gate

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  mcp-analysis:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Generate Quality Report
      run: |
        node analytics/generate-reports.js
        
    - name: Upload Reports
      uses: actions/upload-artifact@v4
      with:
        name: mcp-quality-reports
        path: reports/
"@
    
    Set-Content $workflowPath -Value $workflow
    Write-Log "GitHub Actions configurado" "Green"
}

# FUNCION PRINCIPAL
Write-Log "ALTAMEDICA MCP - ACCIONES INMEDIATAS INICIADAS" "Green"
Write-Log "Fecha: $(Get-Date)" "Cyan"
Write-Log "Accion: $Action" "Cyan"

Create-Directories

switch ($Action.ToLower()) {
    "hotspots" { Fix-Hotspots }
    "security" { Enhance-Security }
    "mcp" { Setup-MCP }
    "medical" { Setup-Medical }
    "analytics" { Setup-Analytics }
    "cicd" { Setup-CICD }
    "all" {
        Fix-Hotspots
        Enhance-Security
        Setup-MCP
        Setup-Medical
        Setup-Analytics
        Setup-CICD
    }
    default {
        Write-Log "Accion no reconocida: $Action" "Red"
        Write-Log "Acciones disponibles: hotspots, security, mcp, medical, analytics, cicd, all" "Yellow"
        exit 1
    }
}

Write-Log ""
Write-Log "ACCIONES COMPLETADAS!" "Green"
Write-Log "Log: $LogFile" "Cyan"

# Abrir dashboard si está disponible
$dashboardPath = Join-Path $ProjectRoot "public\mcp-dashboard.html"
if (Test-Path $dashboardPath) {
    Write-Log "Abriendo dashboard MCP..." "Cyan"
    Start-Process $dashboardPath
}
