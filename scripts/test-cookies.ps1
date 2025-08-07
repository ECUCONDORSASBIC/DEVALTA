# Test Cookie Setting in API
Write-Host "=== Testing Cookie Configuration ===" -ForegroundColor Cyan

function Test-CookieSetting {
    Write-Host "`n[1] Testing test-login endpoint..." -ForegroundColor Yellow
    
    $body = @{
        email = "test@altamedica.com"
        role = "patient"
    } | ConvertTo-Json
    
    try {
        # Use Invoke-RestMethod for better error handling
        $uri = "http://localhost:3001/api/v1/auth/test-login"
        
        # Create web session to capture cookies
        $session = [Microsoft.PowerShell.Commands.WebRequestSession]::new()
        
        $response = Invoke-WebRequest -Uri $uri `
            -Method POST `
            -Body $body `
            -ContentType "application/json" `
            -WebSession $session `
            -UseBasicParsing
        
        Write-Host "✓ Response received: $($response.StatusCode)" -ForegroundColor Green
        
        # Check response headers
        Write-Host "`n[2] Response Headers:" -ForegroundColor Yellow
        $response.Headers.GetEnumerator() | Where-Object { $_.Key -like "*cookie*" } | ForEach-Object {
            Write-Host "  $($_.Key): $($_.Value)" -ForegroundColor Gray
        }
        
        # Check cookies in session
        Write-Host "`n[3] Cookies in Session:" -ForegroundColor Yellow
        $cookies = $session.Cookies.GetCookies("http://localhost:3001")
        if ($cookies.Count -eq 0) {
            Write-Host "  ✗ No cookies found in session!" -ForegroundColor Red
        } else {
            foreach ($cookie in $cookies) {
                Write-Host "  ✓ $($cookie.Name) = $($cookie.Value.Substring(0, [Math]::Min(30, $cookie.Value.Length)))..." -ForegroundColor Green
                Write-Host "    Domain: $($cookie.Domain), Path: $($cookie.Path)" -ForegroundColor Gray
            }
        }
        
        # Parse response
        $data = $response.Content | ConvertFrom-Json
        Write-Host "`n[4] Response Data:" -ForegroundColor Yellow
        Write-Host "  Success: $($data.success)" -ForegroundColor Gray
        Write-Host "  Redirect URL: $($data.data.redirectUrl)" -ForegroundColor Gray
        
        # Test cross-origin cookie access
        Write-Host "`n[5] Testing cross-origin access..." -ForegroundColor Yellow
        try {
            $patientResponse = Invoke-WebRequest -Uri "http://localhost:3003/api/debug-headers" `
                -WebSession $session `
                -UseBasicParsing
            
            $debugData = $patientResponse.Content | ConvertFrom-Json
            Write-Host "  Cookies visible at port 3003:" -ForegroundColor Cyan
            $debugData.cookies | Get-Member -MemberType NoteProperty | ForEach-Object {
                Write-Host "    $($_.Name)" -ForegroundColor Gray
            }
        } catch {
            Write-Host "  ✗ Cannot access port 3003 with cookies" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "✗ Error: $_" -ForegroundColor Red
        if ($_.ErrorDetails) {
            Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
}

function Test-DirectBrowser {
    Write-Host "`n[Browser Test]" -ForegroundColor Cyan
    Write-Host "Open browser and navigate to:" -ForegroundColor Yellow
    Write-Host "http://localhost:3001/api/v1/auth/test-login" -ForegroundColor White
    Write-Host "`nUse these tools to test:" -ForegroundColor Yellow
    Write-Host "1. Postman or Thunder Client" -ForegroundColor White
    Write-Host "2. Browser DevTools (F12) > Network tab" -ForegroundColor White
    Write-Host "3. Check Application > Cookies after request" -ForegroundColor White
    
    Write-Host "`nPayload to send (POST):" -ForegroundColor Yellow
    Write-Host '{
  "email": "test@altamedica.com",
  "role": "patient"
}' -ForegroundColor Gray
}

# Main menu
Write-Host "`nChoose test option:" -ForegroundColor Cyan
Write-Host "1. Test cookie setting via PowerShell" -ForegroundColor White
Write-Host "2. Instructions for browser test" -ForegroundColor White
Write-Host "3. Check current services status" -ForegroundColor White

$choice = Read-Host "`nEnter choice (1-3)"

switch ($choice) {
    "1" { Test-CookieSetting }
    "2" { Test-DirectBrowser }
    "3" { 
        Write-Host "`nChecking services..." -ForegroundColor Yellow
        $services = @(3000, 3001, 3003, 8080, 8888)
        foreach ($port in $services) {
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:$port" -UseBasicParsing -TimeoutSec 2
                Write-Host "✓ Port $port is responding" -ForegroundColor Green
            } catch {
                Write-Host "✗ Port $port is not responding" -ForegroundColor Red
            }
        }
    }
    default { Write-Host "Invalid choice" -ForegroundColor Red }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan