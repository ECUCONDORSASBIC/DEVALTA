# Complete SSO Flow Test Script
Write-Host "=== SSO Flow Integration Test ===" -ForegroundColor Cyan

# Test configuration
$email = "paciente.test@email.com"
$password = "Patient123!"

function Test-LoginFlow {
    Write-Host "`n[1] Testing complete login flow..." -ForegroundColor Yellow
    
    # Step 1: Get Firebase ID token from web-app
    Write-Host "  Step 1: Getting Firebase ID token..." -ForegroundColor Cyan
    
    # This simulates what the web-app does
    $loginBody = @{
        email = $email
        password = $password
        returnSecureToken = $true
    } | ConvertTo-Json
    
    try {
        # In real scenario, this would be Firebase Auth API
        # For now, we'll use a mock token
        $mockIdToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJ0ZXN0LXVzZXItMTIzIiwiZW1haWwiOiJwYWNpZW50ZS50ZXN0QGVtYWlsLmNvbSIsImlhdCI6MTYxNjIzOTAyMn0.mock-signature"
        
        Write-Host "  ✓ Got ID token (mock)" -ForegroundColor Green
        
        # Step 2: Call API server login endpoint
        Write-Host "`n  Step 2: Calling API server login..." -ForegroundColor Cyan
        
        $apiLoginBody = @{
            token = $mockIdToken
        } | ConvertTo-Json
        
        $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
        
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/auth/login" `
            -Method POST `
            -Body $apiLoginBody `
            -ContentType "application/json" `
            -WebSession $session `
            -UseBasicParsing
        
        $responseData = $response.Content | ConvertFrom-Json
        
        Write-Host "  ✓ Login successful" -ForegroundColor Green
        Write-Host "    - Success: $($responseData.success)" -ForegroundColor Gray
        Write-Host "    - Redirect URL: $($responseData.data.redirectUrl)" -ForegroundColor Gray
        
        # Step 3: Check cookies
        Write-Host "`n  Step 3: Checking cookies..." -ForegroundColor Cyan
        $cookies = $session.Cookies.GetCookies("http://localhost:3001")
        
        foreach ($cookie in $cookies) {
            Write-Host "    - $($cookie.Name): $($cookie.Value.Substring(0, 20))..." -ForegroundColor Gray
        }
        
        # Step 4: Test access to patients app
        Write-Host "`n  Step 4: Testing access to patients app..." -ForegroundColor Cyan
        
        $patientsResponse = Invoke-WebRequest -Uri "http://localhost:3003" `
            -WebSession $session `
            -UseBasicParsing `
            -MaximumRedirection 0 `
            -ErrorAction SilentlyContinue
        
        if ($patientsResponse.StatusCode -eq 200) {
            Write-Host "  ✓ Successfully accessed patients app" -ForegroundColor Green
        } elseif ($patientsResponse.StatusCode -eq 302 -or $patientsResponse.StatusCode -eq 307) {
            Write-Host "  ! Got redirect: $($patientsResponse.Headers.Location)" -ForegroundColor Yellow
            if ($patientsResponse.Headers.Location -like "*login*") {
                Write-Host "  ✗ Redirected to login - SSO failed" -ForegroundColor Red
            }
        }
        
        return $session
        
    } catch {
        Write-Host "  ✗ Error: $_" -ForegroundColor Red
        
        # Handle PowerShell 7+ error response
        if ($_.ErrorDetails) {
            Write-Host "  Error details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        
        # Try to get response body for older PowerShell versions
        try {
            if ($_.Exception.Response) {
                $responseStream = $_.Exception.Response.GetResponseStream()
                if ($responseStream) {
                    $reader = New-Object System.IO.StreamReader($responseStream)
                    $responseBody = $reader.ReadToEnd()
                    Write-Host "  Response body: $responseBody" -ForegroundColor Red
                    $reader.Close()
                }
            }
        } catch {
            # Ignore secondary errors
        }
        
        return $null
    }
}

function Test-DirectAccess {
    param($Session)
    
    Write-Host "`n[2] Testing direct access to protected endpoints..." -ForegroundColor Yellow
    
    $endpoints = @(
        "http://localhost:3003/api/debug-headers",
        "http://localhost:3003/debug-sso"
    )
    
    foreach ($endpoint in $endpoints) {
        try {
            Write-Host "  Testing: $endpoint" -ForegroundColor Cyan
            $response = Invoke-WebRequest -Uri $endpoint `
                -WebSession $Session `
                -UseBasicParsing
            
            Write-Host "  ✓ Access granted (Status: $($response.StatusCode))" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Access denied: $_" -ForegroundColor Red
        }
    }
}

function Show-DebugInfo {
    Write-Host "`n[3] Debug Information:" -ForegroundColor Yellow
    Write-Host "  - Make sure all services are running:" -ForegroundColor Cyan
    Write-Host "    npm run dev:all" -ForegroundColor White
    Write-Host "  - Check browser console for errors" -ForegroundColor Cyan
    Write-Host "  - Visit http://localhost:3003/debug-sso for detailed info" -ForegroundColor Cyan
    
    Write-Host "`n[4] Common Issues:" -ForegroundColor Yellow
    Write-Host "  1. Cookies not shared between ports" -ForegroundColor Red
    Write-Host "     Solution: Use the proxy server (port 8080)" -ForegroundColor Green
    Write-Host "  2. Firebase Admin not configured" -ForegroundColor Red
    Write-Host "     Solution: Check .env.local file" -ForegroundColor Green
    Write-Host "  3. Middleware running multiple times" -ForegroundColor Red
    Write-Host "     Solution: Check middleware matcher config" -ForegroundColor Green
}

# Main execution
$session = Test-LoginFlow

if ($session) {
    Test-DirectAccess -Session $session
}

Show-DebugInfo

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan