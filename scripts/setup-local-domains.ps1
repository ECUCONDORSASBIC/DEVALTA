# Setup Local Domains for AltaMedica SSO
# This script must be run as Administrator

Write-Host "=== AltaMedica Local Domain Setup ===" -ForegroundColor Cyan
Write-Host "This script will configure local domains for SSO development" -ForegroundColor Yellow
Write-Host ""

# Check if running as Administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Hosts file path
$hostsFile = "$env:SystemRoot\System32\drivers\etc\hosts"

# Backup hosts file
$backupFile = "$hostsFile.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $hostsFile $backupFile
Write-Host "✓ Backed up hosts file to: $backupFile" -ForegroundColor Green

# Define domains
$domains = @(
    @{IP="127.0.0.1"; Domain="altamedica.local"; Description="Main domain"},
    @{IP="127.0.0.1"; Domain="api.altamedica.local"; Description="API Server"},
    @{IP="127.0.0.1"; Domain="patients.altamedica.local"; Description="Patients App"},
    @{IP="127.0.0.1"; Domain="doctors.altamedica.local"; Description="Doctors App"},
    @{IP="127.0.0.1"; Domain="companies.altamedica.local"; Description="Companies App"},
    @{IP="127.0.0.1"; Domain="admin.altamedica.local"; Description="Admin App"},
    @{IP="127.0.0.1"; Domain="signaling.altamedica.local"; Description="WebRTC Signaling"}
)

# Read current hosts file
$hostsContent = Get-Content $hostsFile -Raw

# Check and add domains
Write-Host "`nAdding domains to hosts file..." -ForegroundColor Yellow
$added = 0
$skipped = 0

foreach ($domain in $domains) {
    if ($hostsContent -notmatch [regex]::Escape($domain.Domain)) {
        # Add domain
        Add-Content -Path $hostsFile -Value "$($domain.IP)`t$($domain.Domain)`t# $($domain.Description)"
        Write-Host "✓ Added: $($domain.Domain)" -ForegroundColor Green
        $added++
    } else {
        Write-Host "- Skipped: $($domain.Domain) (already exists)" -ForegroundColor Gray
        $skipped++
    }
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "  Added: $added domains" -ForegroundColor Green
Write-Host "  Skipped: $skipped domains" -ForegroundColor Gray

# Flush DNS cache
Write-Host "`nFlushing DNS cache..." -ForegroundColor Yellow
ipconfig /flushdns | Out-Null
Write-Host "✓ DNS cache flushed" -ForegroundColor Green

# Test domains
Write-Host "`nTesting domain resolution..." -ForegroundColor Yellow
$testDomain = "altamedica.local"
try {
    $result = Resolve-DnsName $testDomain -ErrorAction Stop
    Write-Host "✓ Domain resolution working: $testDomain -> $($result.IPAddress)" -ForegroundColor Green
} catch {
    Write-Host "✗ Domain resolution failed. You may need to restart your browser." -ForegroundColor Red
}

# Create port mapping info
Write-Host "`n=== Port Mapping ===" -ForegroundColor Cyan
Write-Host "altamedica.local:3000       -> Web App (Landing)" -ForegroundColor White
Write-Host "api.altamedica.local:3001   -> API Server" -ForegroundColor White
Write-Host "patients.altamedica.local:3003 -> Patients App" -ForegroundColor White
Write-Host "doctors.altamedica.local:3002  -> Doctors App" -ForegroundColor White
Write-Host "companies.altamedica.local:3004 -> Companies App" -ForegroundColor White
Write-Host "admin.altamedica.local:3005    -> Admin App" -ForegroundColor White
Write-Host "signaling.altamedica.local:8888 -> WebRTC Signaling" -ForegroundColor White

Write-Host "`n=== Next Steps ===" -ForegroundColor Yellow
Write-Host "1. Run the nginx setup script to configure reverse proxy" -ForegroundColor White
Write-Host "2. Update cookie configuration to use .altamedica.local domain" -ForegroundColor White
Write-Host "3. Access apps using the new domains" -ForegroundColor White

Write-Host "`n✓ Setup complete!" -ForegroundColor Green