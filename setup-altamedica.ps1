# AltaMedica Platform - Setup Script
# Simplified medical setup for Windows

Write-Host "AltaMedica Platform - Medical Setup" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Check admin privileges
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "ERROR: Administrator privileges required" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator" -ForegroundColor Yellow
    pause
    exit 1
}

$ProjectRoot = "C:\Users\Eduardo\Documents\devaltamedica"
Set-Location $ProjectRoot

Write-Host "Project Root: $ProjectRoot" -ForegroundColor Cyan

# Step 1: Create directories
Write-Host "Step 1: Creating medical directories..." -ForegroundColor Yellow

$Dirs = @(
    "backups\postgresql",
    "backups\redis", 
    "backups\firebase",
    "logs\medical",
    "config\medical",
    "data\medical"
)

foreach ($Dir in $Dirs) {
    $FullPath = Join-Path $ProjectRoot $Dir
    if (!(Test-Path $FullPath)) {
        New-Item -ItemType Directory -Path $FullPath -Force | Out-Null
        Write-Host "  Created: $Dir" -ForegroundColor Green
    } else {
        Write-Host "  Exists: $Dir" -ForegroundColor Gray
    }
}

# Step 2: Check Node.js
Write-Host "Step 2: Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Node.js not found" -ForegroundColor Red
    Write-Host "  Install from: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Step 3: Check/Install pnpm
Write-Host "Step 3: Checking pnpm..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "  pnpm found: v$pnpmVersion" -ForegroundColor Green
} catch {
    Write-Host "  pnpm not found. Installing..." -ForegroundColor Yellow
    npm install -g pnpm@latest
    Write-Host "  pnpm installed successfully" -ForegroundColor Green
}

# Step 4: Install project dependencies
Write-Host "Step 4: Installing project dependencies..." -ForegroundColor Yellow
try {
    Write-Host "  Running pnpm install..." -ForegroundColor Cyan
    pnpm install
    
    Write-Host "  Building packages..." -ForegroundColor Cyan
    pnpm build
    
    Write-Host "  Dependencies and build completed successfully" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: Failed to install dependencies" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Set environment variables
Write-Host "Step 5: Setting medical environment variables..." -ForegroundColor Yellow

$EnvVars = @{
    "MEDICAL_MONITORING_ENABLED" = "true"
    "HIPAA_COMPLIANCE_ENABLED" = "true"
    "POSTGRES_HOST" = "localhost"
    "POSTGRES_PORT" = "5432"
    "REDIS_HOST" = "localhost"
    "REDIS_PORT" = "6379"
}

foreach ($var in $EnvVars.GetEnumerator()) {
    [System.Environment]::SetEnvironmentVariable($var.Key, $var.Value, [System.EnvironmentVariableTarget]::User)
    Write-Host "  Set: $($var.Key) = $($var.Value)" -ForegroundColor Green
}

# Step 6: Create medical configuration
Write-Host "Step 6: Creating medical configuration..." -ForegroundColor Yellow

$config = @{
    project = "AltaMedica Medical Platform"
    version = "2.0"
    setup_date = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
    applications = @{
        web_app = @{ port = 3000; critical = $true }
        api_server = @{ port = 3001; critical = $true }
        doctors_app = @{ port = 3002; critical = $true }
        patients_app = @{ port = 3003; critical = $true }
    }
    medical_compliance = @{
        hipaa_enabled = $true
        phi_encryption = $true
        audit_logging = $true
    }
}

$configPath = Join-Path $ProjectRoot "medical-config.json"
$config | ConvertTo-Json -Depth 4 | Out-File -FilePath $configPath -Encoding UTF8
Write-Host "  Medical configuration created: medical-config.json" -ForegroundColor Green

# Step 7: Check databases (optional)
Write-Host "Step 7: Checking databases..." -ForegroundColor Yellow

# Check PostgreSQL
try {
    $pgVersion = psql --version
    Write-Host "  PostgreSQL found: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "  PostgreSQL not found" -ForegroundColor Red
    Write-Host "  Install from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
}

# Check Redis
try {
    $redisTest = redis-cli ping 2>$null
    if ($redisTest -eq "PONG") {
        Write-Host "  Redis working correctly" -ForegroundColor Green
    } else {
        Write-Host "  Redis installed but not running" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  Redis not found" -ForegroundColor Red
    Write-Host "  Install with: choco install redis-64" -ForegroundColor Yellow
}

# Step 8: Run system check
Write-Host "Step 8: Running system verification..." -ForegroundColor Yellow
$monitoringScript = Join-Path $ProjectRoot "scripts\monitoring\medical-monitoring.js"
if (Test-Path $monitoringScript) {
    try {
        node $monitoringScript
        Write-Host "  System verification completed" -ForegroundColor Green
    } catch {
        Write-Host "  System verification had issues" -ForegroundColor Yellow
    }
} else {
    Write-Host "  Monitoring script not found" -ForegroundColor Yellow
}

# Show results
Write-Host ""
Write-Host "ALTAMEDICA PLATFORM SETUP COMPLETED" -ForegroundColor Green -BackgroundColor Black
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. START MEDICAL APPLICATIONS:" -ForegroundColor Cyan
Write-Host "   pnpm dev:min                    # Minimal applications" -ForegroundColor White
Write-Host "   node start-all-servers.js       # All applications" -ForegroundColor White
Write-Host ""

Write-Host "2. ACCESS APPLICATIONS:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000           # Web App Gateway" -ForegroundColor White
Write-Host "   http://localhost:3002           # Doctors Portal" -ForegroundColor White
Write-Host "   http://localhost:3003           # Patients Portal" -ForegroundColor White
Write-Host ""

Write-Host "3. VERIFY SYSTEM:" -ForegroundColor Cyan
Write-Host "   node scripts\monitoring\medical-monitoring.js" -ForegroundColor White
Write-Host ""

Write-Host "IMPORTANT:" -ForegroundColor Red
Write-Host "   - Restart PowerShell to apply environment variables" -ForegroundColor Yellow
Write-Host "   - Install PostgreSQL and Redis if needed" -ForegroundColor Yellow
Write-Host "   - Configure Firebase credentials" -ForegroundColor Yellow
Write-Host ""

Write-Host "AltaMedica Platform is ready for development!" -ForegroundColor Green

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")