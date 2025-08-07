# Master Setup Script for GitHub Copilot Debug & Git Auth Provider
# AltaMedica Development Environment Enhancement
# Run this script in PowerShell as Administrator

param(
    [switch]$SkipCopilot,
    [switch]$SkipGit,
    [switch]$Verify
)

Write-Host "🏥 AltaMedica - GitHub Copilot & Git Integration Setup" -ForegroundColor Magenta
Write-Host "=================================================" -ForegroundColor Magenta

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "⚠️ This script requires Administrator privileges" -ForegroundColor Yellow
    Write-Host "Please run PowerShell as Administrator and try again" -ForegroundColor Yellow
    exit 1
}

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Setup GitHub Copilot Debug Features
if (-not $SkipCopilot) {
    Write-Host "`n🤖 Setting up GitHub Copilot Debug..." -ForegroundColor Green
    & "$scriptPath\enable-copilot-debug.ps1"
    Write-Host "✅ Copilot Debug setup completed" -ForegroundColor Green
}

# 2. Setup Git Auth Provider Features  
if (-not $SkipGit) {
    Write-Host "`n🔐 Setting up Git Auth Provider..." -ForegroundColor Green
    & "$scriptPath\enable-git-auth.ps1"
    Write-Host "✅ Git Auth Provider setup completed" -ForegroundColor Green
}

# 3. Verification
if ($Verify -or (-not $SkipCopilot -and -not $SkipGit)) {
    Write-Host "`n🔍 Verifying installation..." -ForegroundColor Yellow
    
    # Check GitHub CLI
    if (Get-Command gh -ErrorAction SilentlyContinue) {
        $ghVersion = gh --version | Select-Object -First 1
        Write-Host "✅ GitHub CLI: $ghVersion" -ForegroundColor Green
        
        # Check Copilot extension
        $copilotExt = gh extension list | Select-String "gh-copilot"
        if ($copilotExt) {
            Write-Host "✅ GitHub Copilot CLI extension installed" -ForegroundColor Green
        } else {
            Write-Host "❌ GitHub Copilot CLI extension not found" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ GitHub CLI not found" -ForegroundColor Red
    }
    
    # Check Git configuration
    $gitUser = git config --global user.name
    $gitEmail = git config --global user.email
    $gitCredHelper = git config --global credential.helper
    
    if ($gitUser -and $gitEmail) {
        Write-Host "✅ Git user configured: $gitUser <$gitEmail>" -ForegroundColor Green
    } else {
        Write-Host "❌ Git user not configured" -ForegroundColor Red
    }
    
    if ($gitCredHelper) {
        Write-Host "✅ Git credential helper: $gitCredHelper" -ForegroundColor Green
    } else {
        Write-Host "❌ Git credential helper not configured" -ForegroundColor Red
    }
    
    # Check VS Code settings
    $vscodeSettingsPath = "$env:APPDATA\Code\User\settings.json"
    if (Test-Path $vscodeSettingsPath) {
        Write-Host "✅ VS Code settings file found" -ForegroundColor Green
        try {
            $settings = Get-Content $vscodeSettingsPath | ConvertFrom-Json
            if ($settings.'github.copilot.chat.debug.enable') {
                Write-Host "✅ Copilot debug enabled in VS Code" -ForegroundColor Green
            }
            if ($settings.'github.gitAuthentication') {
                Write-Host "✅ Git authentication enabled in VS Code" -ForegroundColor Green
            }
        } catch {
            Write-Host "⚠️ Could not parse VS Code settings" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ VS Code settings file not found" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart VS Code and your terminal" -ForegroundColor White
Write-Host "2. Authenticate with GitHub: gh auth login" -ForegroundColor White
Write-Host "3. Test copilot-debug command in terminal" -ForegroundColor White
Write-Host "4. Use Ctrl+Shift+P > 'GitHub Copilot: Debug' in VS Code" -ForegroundColor White

Write-Host "`n🏥 AltaMedica Medical Platform Integration:" -ForegroundColor Magenta
Write-Host "• HIPAA compliance hooks enabled" -ForegroundColor White
Write-Host "• Medical code analysis with Copilot" -ForegroundColor White
Write-Host "• Secure Git workflows for PHI protection" -ForegroundColor White