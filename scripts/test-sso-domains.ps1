# Test SSO with Local Domains
Write-Host "=== Testing SSO with Local Domains ===" -ForegroundColor Cyan
Write-Host ""

# Check if domains are configured
Write-Host "[1] Checking domain configuration..." -ForegroundColor Yellow
$testDomains = @("altamedica.local", "api.altamedica.local", "patients.altamedica.local")

$allConfigured = $true
foreach ($domain in $testDomains) {
    try {
        $result = Resolve-DnsName $domain -ErrorAction Stop
        Write-Host "✓ $domain -> $($result.IPAddress)" -ForegroundColor Green
    } catch {
        Write-Host "✗ $domain not configured" -ForegroundColor Red
        $allConfigured = $false
    }
}

if (-not $allConfigured) {
    Write-Host "`nERROR: Domains not configured!" -ForegroundColor Red
    Write-Host "Run this command as Administrator:" -ForegroundColor Yellow
    Write-Host "  .\scripts\setup-local-domains.ps1" -ForegroundColor White
    exit 1
}

# Test SSO flow
Write-Host "`n[2] Testing SSO authentication flow..." -ForegroundColor Yellow

function Test-SSOWithDomains {
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    
    # Step 1: Test login endpoint
    Write-Host "`n  Testing login at api.altamedica.local..." -ForegroundColor Cyan
    
    $loginBody = @{
        email = "test@altamedica.com"
        role = "patient"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "http://api.altamedica.local:3001/api/v1/auth/test-login" `
            -Method POST `
            -Body $loginBody `
            -ContentType "application/json" `
            -WebSession $session `
            -UseBasicParsing
        
        Write-Host "  ✓ Login successful" -ForegroundColor Green
        
        # Check cookies
        $cookies = $session.Cookies.GetCookies("http://api.altamedica.local:3001")
        Write-Host "`n  Cookies set by API:" -ForegroundColor Cyan
        foreach ($cookie in $cookies) {
            Write-Host "    - $($cookie.Name)" -ForegroundColor Gray
            Write-Host "      Domain: $($cookie.Domain)" -ForegroundColor Gray
            Write-Host "      Path: $($cookie.Path)" -ForegroundColor Gray
        }
        
        # Step 2: Test cross-domain cookie access
        Write-Host "`n  Testing cookie access at patients.altamedica.local..." -ForegroundColor Cyan
        
        try {
            # The cookies should be accessible across subdomains
            $patientsResponse = Invoke-WebRequest -Uri "http://patients.altamedica.local:3003/api/debug-headers" `
                -WebSession $session `
                -UseBasicParsing
            
            $debugData = $patientsResponse.Content | ConvertFrom-Json
            
            if ($debugData.cookies.altamedica_sso_token) {
                Write-Host "  ✓ SSO token is accessible across domains!" -ForegroundColor Green
                Write-Host "  ✓ SSO is working correctly!" -ForegroundColor Green
                return $true
            } else {
                Write-Host "  ✗ SSO token not found at patients domain" -ForegroundColor Red
                Write-Host "  Available cookies:" -ForegroundColor Yellow
                $debugData.cookies | Get-Member -MemberType NoteProperty | ForEach-Object {
                    Write-Host "    - $($_.Name)" -ForegroundColor Gray
                }
                return $false
            }
        } catch {
            Write-Host "  ✗ Failed to access patients app: $_" -ForegroundColor Red
            return $false
        }
        
    } catch {
        Write-Host "  ✗ Login failed: $_" -ForegroundColor Red
        if ($_.ErrorDetails) {
            Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        return $false
    }
}

# Run the test
$success = Test-SSOWithDomains

# Show results and next steps
Write-Host "`n[3] Test Results" -ForegroundColor Yellow
if ($success) {
    Write-Host "✓ SSO is working with local domains!" -ForegroundColor Green
    Write-Host "`nYou can now access:" -ForegroundColor Cyan
    Write-Host "  - http://altamedica.local:3000 (Login here)" -ForegroundColor White
    Write-Host "  - http://patients.altamedica.local:3003 (Auto-login via SSO)" -ForegroundColor White
    Write-Host "  - http://doctors.altamedica.local:3002 (Auto-login via SSO)" -ForegroundColor White
} else {
    Write-Host "✗ SSO is not working properly" -ForegroundColor Red
    Write-Host "`nTroubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Make sure all services are running:" -ForegroundColor White
    Write-Host "   npm run dev:all" -ForegroundColor Gray
    Write-Host "2. Rebuild packages with new configuration:" -ForegroundColor White
    Write-Host "   npm run build:packages" -ForegroundColor Gray
    Write-Host "3. Clear browser cookies and cache" -ForegroundColor White
    Write-Host "4. Try using an incognito/private window" -ForegroundColor White
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan