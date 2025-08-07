# AltaMedica Workspace Setup Script
# PowerShell version for Windows

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "AltaMedica Workspace Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check prerequisites
Write-Host "`nChecking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "[OK] npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] npm not found." -ForegroundColor Red
    exit 1
}

# Check/Install pnpm
Write-Host "`nChecking pnpm..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version 2>$null
    if ($pnpmVersion) {
        Write-Host "[OK] pnpm $pnpmVersion" -ForegroundColor Green
    } else {
        throw "pnpm not found"
    }
} catch {
    Write-Host "pnpm not found. Installing pnpm globally..." -ForegroundColor Yellow
    npm install -g pnpm
    $pnpmVersion = pnpm --version
    Write-Host "[OK] pnpm $pnpmVersion installed" -ForegroundColor Green
}

# Create directory structure
Write-Host "`nCreating directory structure..." -ForegroundColor Yellow
$directories = @(
    "tools/python",
    "tools/scripts",
    "config",
    "docs",
    "shared/hooks/api",
    "packages",
    "logs",
    "reports"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "[OK] Created directory: $dir" -ForegroundColor Green
    } else {
        Write-Host "[INFO] Directory exists: $dir" -ForegroundColor Gray
    }
}

# Install dependencies
Write-Host "`nInstalling project dependencies..." -ForegroundColor Yellow
try {
    pnpm install
    Write-Host "[OK] Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Could not install dependencies: $_" -ForegroundColor Yellow
}

# Create .env file if not exists
if (!(Test-Path ".env")) {
    Write-Host "`nCreating .env file..." -ForegroundColor Yellow
    @"
# AltaMedica Workspace Configuration
WORKSPACE_ROOT=.
API_BRIDGE_PORT=9000
API_SERVER_URL=http://localhost:3001
PATIENTS_APP_URL=http://localhost:3003
DOCTORS_APP_URL=http://localhost:3002
COMPANIES_APP_URL=http://localhost:3004
ADMIN_APP_URL=http://localhost:3005
WEB_APP_URL=http://localhost:3000
VIDEO_SERVER_URL=http://localhost:8888

# Development Settings
NODE_ENV=development
PYTHON_ENV=development
DEBUG=true
ENABLE_CORS=true

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/workspace.log

# API Bridge Settings
BRIDGE_TIMEOUT=30
BRIDGE_RETRY_COUNT=3
HEALTH_CHECK_INTERVAL=60
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "[OK] .env file created" -ForegroundColor Green
} else {
    Write-Host "[INFO] .env file already exists" -ForegroundColor Gray
}

# Python dependencies
Write-Host "`nInstalling Python dependencies..." -ForegroundColor Yellow
$pythonDeps = @(
    "fastapi",
    "uvicorn",
    "requests",
    "aiohttp",
    "python-multipart",
    "pydantic",
    "python-jose[cryptography]",
    "jinja2"
)

foreach ($dep in $pythonDeps) {
    try {
        python -m pip install $dep --quiet
        Write-Host "[OK] Installed: $dep" -ForegroundColor Green
    } catch {
        Write-Host "[WARN] Could not install: $dep" -ForegroundColor Yellow
    }
}

# Validate workspace structure
Write-Host "`nValidating workspace structure..." -ForegroundColor Yellow
$requiredFiles = @(
    "package.json",
    "pnpm-workspace.yaml"
)

$isValid = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "[OK] Found: $file" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Missing: $file" -ForegroundColor Yellow
        $isValid = $false
    }
}

# Summary
Write-Host "`n=================================" -ForegroundColor Cyan
Write-Host "Setup Summary" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

if ($isValid) {
    Write-Host "`nWorkspace setup completed successfully!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "  1. Open altamedica-api-workspace.code-workspace in VS Code"
    Write-Host "  2. Run 'pnpm dev' to start all services"
    Write-Host "  3. Check WORKSPACE_README.md for more information"
} else {
    Write-Host "`nWorkspace setup completed with warnings." -ForegroundColor Yellow
    Write-Host "Please check the missing files above." -ForegroundColor Yellow
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')