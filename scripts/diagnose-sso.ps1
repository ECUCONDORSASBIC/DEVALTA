# SSO Diagnosis Script for AltaMedica
Write-Host "=== SSO Flow Diagnosis Tool ===" -ForegroundColor Cyan
Write-Host ""

# Function to test HTTP endpoint with cookies
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = "",
        [Microsoft.PowerShell.Commands.WebRequestSession]$Session
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            UseBasicParsing = $true
            SessionVariable = 'session'
        }
        
        if ($Session) {
            $params.WebSession = $Session
        }
        
        if ($Body -and $Method -eq "POST") {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        
        Write-Host "✓ $Method $Url - Status: $($response.StatusCode)" -ForegroundColor Green
        
        # Display cookies
        if ($response.Headers['Set-Cookie']) {
            Write-Host "  Cookies set:" -ForegroundColor Yellow
            $response.Headers['Set-Cookie'] | ForEach-Object {
                Write-Host "    $_" -ForegroundColor Gray
            }
        }
        
        return @{
            Success = $true
            Response = $response
            Session = $session
        }
    }
    catch {
        Write-Host "✗ $METHOD $Url - Error: $_" -ForegroundColor Red
        return @{
            Success = $false
            Error = $_
        }
    }
}

# Test 1: Check if services are running
Write-Host "`n[1] Checking services status..." -ForegroundColor Yellow
$services = @(
    @{Name="Web App"; Url="http://localhost:3000"; Expected="Next.js"},
    @{Name="API Server"; Url="http://localhost:3001/api/health"; Expected="ok"},
    @{Name="Patients App"; Url="http://localhost:3003"; Expected="html"}
)

foreach ($service in $services) {
    Test-Endpoint -Url $service.Url | Out-Null
}

# Test 2: Login flow
Write-Host "`n[2] Testing login flow..." -ForegroundColor Yellow
$loginData = @{
    token = "dummy-firebase-token"
} | ConvertTo-Json

$loginResult = Test-Endpoint -Url "http://localhost:3001/api/v1/auth/login" `
    -Method "POST" `
    -Body $loginData

if ($loginResult.Success) {
    Write-Host "  Login response:" -ForegroundColor Cyan
    $content = $loginResult.Response.Content | ConvertFrom-Json
    Write-Host "    Success: $($content.success)" -ForegroundColor Gray
    Write-Host "    Redirect URL: $($content.data.redirectUrl)" -ForegroundColor Gray
}

# Test 3: Check cookie propagation
Write-Host "`n[3] Testing cookie propagation..." -ForegroundColor Yellow
Write-Host "  Attempting to access patients app with cookies..." -ForegroundColor Cyan

if ($loginResult.Success -and $loginResult.Session) {
    $patientsResult = Test-Endpoint -Url "http://localhost:3003" `
        -Session $loginResult.Session
}

# Test 4: Direct cookie inspection
Write-Host "`n[4] Browser cookie inspection commands:" -ForegroundColor Yellow
Write-Host "  Open Chrome DevTools and run:" -ForegroundColor Cyan
Write-Host "    document.cookie" -ForegroundColor White
Write-Host "    Or check Application > Cookies" -ForegroundColor White

# Test 5: Check Firebase Admin initialization
Write-Host "`n[5] Checking Firebase Admin setup..." -ForegroundColor Yellow
$envVars = @(
    "FIREBASE_ADMIN_PROJECT_ID",
    "FIREBASE_ADMIN_CLIENT_EMAIL",
    "FIREBASE_ADMIN_PRIVATE_KEY"
)

foreach ($var in $envVars) {
    $value = [System.Environment]::GetEnvironmentVariable($var)
    if ($value) {
        Write-Host "  ✓ $var is set" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $var is NOT set" -ForegroundColor Red
    }
}

Write-Host "`n=== Diagnosis Complete ===" -ForegroundColor Cyan
Write-Host "Run this script while monitoring the application logs for detailed debugging" -ForegroundColor Yellow