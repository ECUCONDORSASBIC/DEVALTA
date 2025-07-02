# PowerShell script to set up PM2 startup on Windows login
# This script creates a scheduled task to run PM2 resurrect on user login

param(
    [string]$ProjectPath = (Get-Location).Path,
    [switch]$Force
)

Write-Host "🚀 Setting up PM2 startup configuration..." -ForegroundColor Green

# Check if PM2 is installed
try {
    $pm2Version = & pm2 --version
    Write-Host "✅ PM2 version $pm2Version detected" -ForegroundColor Green
} catch {
    Write-Host "❌ PM2 not found. Please install PM2 first: npm install -g pm2" -ForegroundColor Red
    exit 1
}

# Get current working directory
$workingDir = $ProjectPath
Write-Host "📁 Project directory: $workingDir" -ForegroundColor Cyan

# Create PM2 startup script
$startupScript = @"
# PM2 Startup Script for ALTAMEDICADEV
Set-Location '$workingDir'
pm2 resurrect
"@

$startupScriptPath = Join-Path $workingDir "scripts\pm2-startup.ps1"
$startupScript | Out-File -FilePath $startupScriptPath -Encoding UTF8

Write-Host "📝 Created startup script at: $startupScriptPath" -ForegroundColor Green

# Create scheduled task
$taskName = "PM2-ALTAMEDICADEV-Startup"
$taskDescription = "Start PM2 processes for ALTAMEDICADEV on user login"

# Check if task already exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($existingTask -and -not $Force) {
    Write-Host "⚠️  Scheduled task '$taskName' already exists." -ForegroundColor Yellow
    Write-Host "Use -Force parameter to recreate it." -ForegroundColor Yellow
    exit 0
}

if ($existingTask -and $Force) {
    Write-Host "🗑️  Removing existing scheduled task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Create new scheduled task
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$startupScriptPath`""
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description $taskDescription

Write-Host "✅ Scheduled task '$taskName' created successfully!" -ForegroundColor Green
Write-Host "📋 Task will run PM2 resurrect on user login" -ForegroundColor Cyan

# Save current PM2 configuration
Write-Host "💾 Saving current PM2 configuration..." -ForegroundColor Green
pm2 save

Write-Host "🎉 PM2 startup setup complete!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "To test the setup:" -ForegroundColor Cyan
Write-Host "1. Start your processes: pnpm pm2:start" -ForegroundColor White
Write-Host "2. Save configuration: pnpm pm2:save" -ForegroundColor White
Write-Host "3. Test resurrection: pm2 kill && pm2 resurrect" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "The scheduled task will automatically resurrect your PM2 processes on next login." -ForegroundColor Green
