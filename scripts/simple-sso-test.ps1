# Simple SSO Test - Direct Browser Automation
Write-Host "=== Simple SSO Browser Test ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$webAppUrl = "http://localhost:3000"
$patientsAppUrl = "http://localhost:3003"
$debugUrl = "$patientsAppUrl/debug-sso"

function Open-CleanBrowser {
    param([string]$Url)
    
    Write-Host "Opening clean browser instance..." -ForegroundColor Yellow
    
    # Create a temporary profile
    $tempProfile = "$env:TEMP\AltaMedicaSSO_$(Get-Random)"
    
    # Chrome path
    $chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
    if (-not (Test-Path $chromePath)) {
        $chromePath = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    }
    
    # Launch Chrome with clean profile
    $chromeArgs = @(
        "--user-data-dir=$tempProfile",
        "--no-first-run",
        "--no-default-browser-check",
        "--new-window",
        $Url
    )
    
    Start-Process $chromePath -ArgumentList $chromeArgs
    
    Write-Host "Browser launched. Profile: $tempProfile" -ForegroundColor Green
    return $tempProfile
}

function Test-ManualFlow {
    Write-Host "`n[Manual SSO Flow Test]" -ForegroundColor Cyan
    Write-Host "This will guide you through manual testing of the SSO flow.`n" -ForegroundColor Yellow
    
    # Step 1: Open login page
    Write-Host "Step 1: Opening login page in clean browser..." -ForegroundColor White
    $profile = Open-CleanBrowser -Url "$webAppUrl/login"
    
    Write-Host "`nPlease perform the following steps:" -ForegroundColor Yellow
    Write-Host "1. Login with test credentials:" -ForegroundColor White
    Write-Host "   Email: paciente.test@email.com" -ForegroundColor Gray
    Write-Host "   Password: Patient123!" -ForegroundColor Gray
    Write-Host "2. Observe if you get redirected to $patientsAppUrl" -ForegroundColor White
    Write-Host "3. Note any errors in the console (F12)" -ForegroundColor White
    
    Read-Host "`nPress Enter when you've completed the login..."
    
    # Step 2: Check cookies
    Write-Host "`nStep 2: Checking cookies..." -ForegroundColor White
    Write-Host "In the browser, press F12 and go to Application > Cookies" -ForegroundColor Yellow
    Write-Host "Look for these cookies:" -ForegroundColor White
    Write-Host "  - sso_token" -ForegroundColor Gray
    Write-Host "  - altamedica_sso_token" -ForegroundColor Gray
    Write-Host "  - altamedica_refresh_token" -ForegroundColor Gray
    
    $hasCookies = Read-Host "`nDo you see any of these cookies? (y/n)"
    
    if ($hasCookies -eq 'y') {
        Write-Host "✓ Cookies are being set" -ForegroundColor Green
    } else {
        Write-Host "✗ Cookies are NOT being set - this is the problem" -ForegroundColor Red
    }
    
    # Step 3: Test debug page
    Write-Host "`nStep 3: Opening debug page..." -ForegroundColor White
    Write-Host "Navigate to: $debugUrl" -ForegroundColor Yellow
    Write-Host "This page will show all debugging information" -ForegroundColor White
    
    Read-Host "`nPress Enter when you're on the debug page..."
    
    # Step 4: Results
    Write-Host "`n[Test Results]" -ForegroundColor Cyan
    $redirected = Read-Host "Were you redirected to patients app after login? (y/n)"
    $accessGranted = Read-Host "Can you access the patients app without being redirected to login? (y/n)"
    
    if ($redirected -eq 'y' -and $accessGranted -eq 'y') {
        Write-Host "`n✓ SSO is working correctly!" -ForegroundColor Green
    } else {
        Write-Host "`n✗ SSO is not working. Possible issues:" -ForegroundColor Red
        if ($hasCookies -ne 'y') {
            Write-Host "  - Cookies are not being set properly" -ForegroundColor Yellow
            Write-Host "  - Solution: Use the proxy server approach" -ForegroundColor White
        }
        if ($redirected -ne 'y') {
            Write-Host "  - Redirect after login is not working" -ForegroundColor Yellow
            Write-Host "  - Check console for JavaScript errors" -ForegroundColor White
        }
        if ($accessGranted -ne 'y') {
            Write-Host "  - Middleware is not recognizing the session" -ForegroundColor Yellow
            Write-Host "  - Check server logs for middleware errors" -ForegroundColor White
        }
    }
    
    # Cleanup
    Write-Host "`nCleaning up..." -ForegroundColor Yellow
    $cleanup = Read-Host "Delete temporary browser profile? (y/n)"
    if ($cleanup -eq 'y') {
        Remove-Item -Path $profile -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "✓ Temporary profile deleted" -ForegroundColor Green
    }
}

function Show-QuickFixes {
    Write-Host "`n[Quick Fixes to Try]" -ForegroundColor Cyan
    
    Write-Host "`n1. Restart all services:" -ForegroundColor Yellow
    Write-Host "   npm run dev:all" -ForegroundColor White
    
    Write-Host "`n2. Check that .env.local exists in root:" -ForegroundColor Yellow
    Write-Host "   cat .env.local" -ForegroundColor White
    
    Write-Host "`n3. Rebuild packages:" -ForegroundColor Yellow
    Write-Host "   cd packages/shared && npm run build" -ForegroundColor White
    
    Write-Host "`n4. Use the proxy approach:" -ForegroundColor Yellow
    Write-Host "   cd scripts" -ForegroundColor White
    Write-Host "   node sso-proxy-solution.js" -ForegroundColor White
    Write-Host "   Then access via http://localhost:8080" -ForegroundColor White
    
    Write-Host "`n5. Check server logs in each terminal for errors" -ForegroundColor Yellow
}

# Main menu
Write-Host "`nChoose an option:" -ForegroundColor Cyan
Write-Host "1. Run manual SSO flow test" -ForegroundColor White
Write-Host "2. Show quick fixes" -ForegroundColor White
Write-Host "3. Open debug page directly" -ForegroundColor White

$choice = Read-Host "`nEnter your choice (1-3)"

switch ($choice) {
    "1" { Test-ManualFlow }
    "2" { Show-QuickFixes }
    "3" { 
        Open-CleanBrowser -Url $debugUrl
        Write-Host "`nDebug page opened in browser" -ForegroundColor Green
    }
    default { Write-Host "Invalid choice" -ForegroundColor Red }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green