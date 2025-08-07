# Enable GitHub Copilot Debug Commands
# Run this script in PowerShell as Administrator

Write-Host "🤖 Habilitando GitHub Copilot Debug Command..." -ForegroundColor Green

# 1. Install GitHub CLI if not present
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing GitHub CLI..." -ForegroundColor Yellow
    winget install --id GitHub.cli
} else {
    Write-Host "✅ GitHub CLI already installed" -ForegroundColor Green
}

# 2. Install/Update GitHub Copilot CLI extension
Write-Host "🔧 Installing GitHub Copilot CLI extension..." -ForegroundColor Yellow
gh extension install github/gh-copilot --force

# 3. Enable Copilot debug features
Write-Host "🐛 Enabling Copilot debug features..." -ForegroundColor Yellow

# Create alias for copilot-debug command
$aliasCommand = @"
function copilot-debug {
    param([string]`$query)
    if (`$query) {
        gh copilot suggest --type shell "`$query"
    } else {
        Write-Host "Usage: copilot-debug 'your debugging query'" -ForegroundColor Yellow
        Write-Host "Example: copilot-debug 'how to fix npm build errors'" -ForegroundColor Cyan
    }
}
"@

# Add to PowerShell profile
$profilePath = $PROFILE.AllUsersAllHosts
if (-not (Test-Path $profilePath)) {
    New-Item -Path $profilePath -ItemType File -Force
}

# Check if alias already exists
$profileContent = Get-Content $profilePath -ErrorAction SilentlyContinue
if ($profileContent -notcontains "function copilot-debug") {
    Add-Content -Path $profilePath -Value "`n# GitHub Copilot Debug Command"
    Add-Content -Path $profilePath -Value $aliasCommand
    Write-Host "✅ Added copilot-debug command to PowerShell profile" -ForegroundColor Green
} else {
    Write-Host "✅ copilot-debug command already exists in profile" -ForegroundColor Green
}

# 4. Configure VS Code settings for enhanced debugging
$vscodeSettingsPath = "$env:APPDATA\Code\User\settings.json"
if (Test-Path $vscodeSettingsPath) {
    Write-Host "🔧 Updating VS Code settings for enhanced Copilot debugging..." -ForegroundColor Yellow
    
    $settings = Get-Content $vscodeSettingsPath | ConvertFrom-Json
    if (-not $settings.'github.copilot.chat.debug.enable') {
        $settings | Add-Member -Type NoteProperty -Name 'github.copilot.chat.debug.enable' -Value $true -Force
        $settings | Add-Member -Type NoteProperty -Name 'github.copilot.conversation.debug' -Value $true -Force
        $settings | ConvertTo-Json -Depth 10 | Set-Content $vscodeSettingsPath
        Write-Host "✅ VS Code Copilot debug settings enabled" -ForegroundColor Green
    }
}

Write-Host "🎉 GitHub Copilot Debug setup complete!" -ForegroundColor Green
Write-Host "📝 Available commands:" -ForegroundColor Cyan
Write-Host "  • copilot-debug 'your query' - Debug assistance" -ForegroundColor White
Write-Host "  • gh copilot suggest - Command suggestions" -ForegroundColor White
Write-Host "  • gh copilot explain - Code explanations" -ForegroundColor White
Write-Host "🔄 Restart your terminal to use the new commands" -ForegroundColor Yellow