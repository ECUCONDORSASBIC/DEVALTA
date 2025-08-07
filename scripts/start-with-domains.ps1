# Start AltaMedica with Local Domains
Write-Host "=== Starting AltaMedica with Local Domains ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check domain configuration
Write-Host "[1] Checking domain configuration..." -ForegroundColor Yellow
try {
    $result = Resolve-DnsName "altamedica.local" -ErrorAction Stop
    Write-Host "✓ Domains are configured" -ForegroundColor Green
} catch {
    Write-Host "✗ Domains not configured!" -ForegroundColor Red
    Write-Host "Run as Administrator: .\scripts\setup-local-domains.ps1" -ForegroundColor Yellow
    exit 1
}

# Step 2: Rebuild packages if needed
$rebuild = Read-Host "`nRebuild packages? (y/n)"
if ($rebuild -eq 'y') {
    Write-Host "`n[2] Building packages..." -ForegroundColor Yellow
    Set-Location (Join-Path $PSScriptRoot "..")
    npm run build:packages
}

# Step 3: Start services
Write-Host "`n[3] Starting all services..." -ForegroundColor Yellow
Write-Host "This will open multiple terminal windows" -ForegroundColor Gray

# Start services in new windows
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..' ; npm run dev:all"

# Wait for services to start
Write-Host "`nWaiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 4: Open browser with correct URLs
Write-Host "`n[4] Opening AltaMedica in browser..." -ForegroundColor Yellow

# Create a simple HTML page with links
$htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <title>AltaMedica Local Development</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2563eb; }
        .links { display: grid; gap: 15px; margin-top: 30px; }
        .link { display: flex; align-items: center; padding: 15px; background: #f3f4f6; border-radius: 8px; text-decoration: none; color: #111827; transition: all 0.3s; }
        .link:hover { background: #e5e7eb; transform: translateX(5px); }
        .link strong { display: inline-block; width: 150px; }
        .status { margin-left: auto; }
        .instructions { margin-top: 30px; padding: 20px; background: #fef3c7; border-radius: 8px; }
        .test-btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 AltaMedica Local Development</h1>
        <p>SSO is configured with local domains. Click any link below to access the applications:</p>
        
        <div class="links">
            <a href="http://altamedica.local:3000" class="link">
                <strong>🌐 Web App</strong>
                <span>Main landing page and login</span>
            </a>
            <a href="http://api.altamedica.local:3001/api/health" class="link">
                <strong>🔌 API Server</strong>
                <span>Backend API health check</span>
            </a>
            <a href="http://patients.altamedica.local:3003" class="link">
                <strong>👤 Patients App</strong>
                <span>Patient portal (login via Web App first)</span>
            </a>
            <a href="http://doctors.altamedica.local:3002" class="link">
                <strong>👨‍⚕️ Doctors App</strong>
                <span>Doctor portal</span>
            </a>
            <a href="http://companies.altamedica.local:3004" class="link">
                <strong>🏢 Companies App</strong>
                <span>Company portal</span>
            </a>
            <a href="http://admin.altamedica.local:3005" class="link">
                <strong>⚡ Admin App</strong>
                <span>Administration panel</span>
            </a>
            <a href="http://patients.altamedica.local:3003/debug-sso" class="link">
                <strong>🔍 Debug SSO</strong>
                <span>SSO debugging information</span>
            </a>
        </div>
        
        <div class="instructions">
            <h3>📋 Instructions:</h3>
            <ol>
                <li>Start by logging in at the <strong>Web App</strong></li>
                <li>After login, you'll be redirected to the appropriate portal</li>
                <li>The SSO cookie will allow access to all apps</li>
                <li>Use the Debug SSO page to troubleshoot any issues</li>
            </ol>
        </div>
        
        <a href="http://altamedica.local:3000/login" class="test-btn">Start Login Flow →</a>
    </div>
</body>
</html>
"@

$htmlPath = Join-Path $env:TEMP "altamedica-local.html"
Set-Content -Path $htmlPath -Value $htmlContent

# Open in default browser
Start-Process $htmlPath

Write-Host "`n✓ AltaMedica is running with local domains!" -ForegroundColor Green
Write-Host "`nURLs:" -ForegroundColor Cyan
Write-Host "  Main: http://altamedica.local:3000" -ForegroundColor White
Write-Host "  Patients: http://patients.altamedica.local:3003" -ForegroundColor White
Write-Host "  Doctors: http://doctors.altamedica.local:3002" -ForegroundColor White

Write-Host "`nPress Ctrl+C to stop all services" -ForegroundColor Yellow