# Clear Session Script for AltaMedica SSO Testing
Write-Host "=== Clearing All Sessions and Cookies ===" -ForegroundColor Yellow

# Function to clear browser data
function Clear-BrowserData {
    Write-Host "`n[1] Clearing Chrome browser data..." -ForegroundColor Cyan
    
    # Kill Chrome processes
    $chromeProcesses = Get-Process -Name "chrome" -ErrorAction SilentlyContinue
    if ($chromeProcesses) {
        Write-Host "  Closing Chrome processes..." -ForegroundColor Gray
        Stop-Process -Name "chrome" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
    
    # Clear Chrome cache and cookies
    $chromePath = "$env:LOCALAPPDATA\Google\Chrome\User Data\Default"
    if (Test-Path $chromePath) {
        $filesToDelete = @(
            "Cookies",
            "Cookies-journal",
            "Web Data",
            "Web Data-journal",
            "History",
            "History-journal"
        )
        
        foreach ($file in $filesToDelete) {
            $fullPath = Join-Path $chromePath $file
            if (Test-Path $fullPath) {
                try {
                    Remove-Item $fullPath -Force -ErrorAction Stop
                    Write-Host "  ✓ Deleted: $file" -ForegroundColor Green
                } catch {
                    Write-Host "  ✗ Could not delete: $file" -ForegroundColor Red
                }
            }
        }
    }
}

# Function to clear application data via HTTP
function Clear-AppData {
    Write-Host "`n[2] Clearing application sessions..." -ForegroundColor Cyan
    
    # Clear cookies for each app
    $apps = @(
        @{Name="Web App"; Port=3000},
        @{Name="API Server"; Port=3001},
        @{Name="Patients App"; Port=3003},
        @{Name="Doctors App"; Port=3002}
    )
    
    foreach ($app in $apps) {
        try {
            # Create a logout request to clear server-side sessions
            $url = "http://localhost:$($app.Port)/api/auth/logout"
            $response = Invoke-WebRequest -Uri $url -Method POST -UseBasicParsing -ErrorAction SilentlyContinue
            Write-Host "  ✓ Cleared session for $($app.Name)" -ForegroundColor Green
        } catch {
            Write-Host "  - No logout endpoint for $($app.Name) (normal)" -ForegroundColor Gray
        }
    }
}

# Function to create a clean test environment
function Create-CleanEnvironment {
    Write-Host "`n[3] Creating clean test environment..." -ForegroundColor Cyan
    
    # Create a new Chrome profile for testing
    $testProfilePath = "$env:LOCALAPPDATA\Google\Chrome\AltaMedicaTestProfile"
    if (Test-Path $testProfilePath) {
        Remove-Item $testProfilePath -Recurse -Force
    }
    New-Item -ItemType Directory -Path $testProfilePath -Force | Out-Null
    Write-Host "  ✓ Created clean Chrome test profile" -ForegroundColor Green
    
    # Create launch command
    $chromeExe = "C:\Program Files\Google\Chrome\Application\chrome.exe"
    if (-not (Test-Path $chromeExe)) {
        $chromeExe = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    }
    
    $launchCommand = @"
& "$chromeExe" --user-data-dir="$testProfilePath" --disable-web-security --disable-site-isolation-trials --disable-features=IsolateOrigins,site-per-process http://localhost:3000/login
"@
    
    Write-Host "`n[4] Launch command for clean testing:" -ForegroundColor Yellow
    Write-Host $launchCommand -ForegroundColor White
    
    # Save launch script
    $launchScript = "$PSScriptRoot\launch-clean-chrome.ps1"
    Set-Content -Path $launchScript -Value $launchCommand
    Write-Host "`n  ✓ Saved launch script to: $launchScript" -ForegroundColor Green
}

# Main execution
Write-Host "`nChoose an option:" -ForegroundColor Cyan
Write-Host "1. Clear all browser data (Chrome)" -ForegroundColor White
Write-Host "2. Clear application sessions only" -ForegroundColor White
Write-Host "3. Create clean test environment" -ForegroundColor White
Write-Host "4. All of the above" -ForegroundColor White

$choice = Read-Host "`nEnter your choice (1-4)"

switch ($choice) {
    "1" { Clear-BrowserData }
    "2" { Clear-AppData }
    "3" { Create-CleanEnvironment }
    "4" {
        Clear-BrowserData
        Clear-AppData
        Create-CleanEnvironment
    }
    default { Write-Host "Invalid choice" -ForegroundColor Red }
}

Write-Host "`n=== Session Clearing Complete ===" -ForegroundColor Green
Write-Host "You can now test the SSO flow with a clean session" -ForegroundColor Yellow