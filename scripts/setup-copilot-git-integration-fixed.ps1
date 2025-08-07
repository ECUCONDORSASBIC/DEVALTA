# Master Setup Script for GitHub Copilot Debug & Git Auth Provider
# AltaMedica Development Environment Enhancement
# Run this script in PowerShell as Administrator

param(
    [switch]$SkipCopilot,
    [switch]$SkipGit,
    [switch]$Verify
)

Write-Host "AltaMedica - GitHub Copilot & Git Integration Setup" -ForegroundColor Magenta
Write-Host "=================================================" -ForegroundColor Magenta

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "This script requires Administrator privileges" -ForegroundColor Yellow
    Write-Host "Please run PowerShell as Administrator and try again" -ForegroundColor Yellow
    exit 1
}

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Setup GitHub Copilot Debug Features
if (-not $SkipCopilot) {
    Write-Host "`nSetting up GitHub Copilot Debug..." -ForegroundColor Green
    
    # Install GitHub CLI if not present
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        Write-Host "Installing GitHub CLI..." -ForegroundColor Yellow
        try {
            winget install --id GitHub.cli --silent
        } catch {
            Write-Host "Failed to install GitHub CLI via winget. Please install manually." -ForegroundColor Red
        }
    } else {
        Write-Host "GitHub CLI already installed" -ForegroundColor Green
    }
    
    # Install/Update GitHub Copilot CLI extension
    try {
        gh extension install github/gh-copilot --force
        Write-Host "GitHub Copilot CLI extension installed" -ForegroundColor Green
    } catch {
        Write-Host "Could not install Copilot extension. Please run 'gh auth login' first." -ForegroundColor Yellow
    }
    
    Write-Host "Copilot Debug setup completed" -ForegroundColor Green
}

# 2. Setup Git Auth Provider Features  
if (-not $SkipGit) {
    Write-Host "`nSetting up Git Auth Provider..." -ForegroundColor Green
    
    # Configure Git credential manager
    git config --global credential.helper manager-core
    git config --global credential.https://dev.azure.com.useHttpPath true
    git config --global credential.https://github.com.provider generic
    
    # Enable Git authentication for VS Code
    git config --global core.editor "code --wait"
    git config --global merge.tool vscode
    git config --global mergetool.vscode.cmd "code --wait --merge `$REMOTE `$LOCAL `$BASE `$MERGED"
    git config --global diff.tool vscode
    git config --global difftool.vscode.cmd "code --wait --diff `$LOCAL `$REMOTE"
    
    # Configure GitHub integration
    git config --global user.name "Eduardo Marques"
    git config --global user.email "eduardo@altamedica.com"
    git config --global init.defaultBranch main
    git config --global pull.rebase false
    git config --global push.autoSetupRemote true
    
    Write-Host "Git Auth Provider setup completed" -ForegroundColor Green
}

# 3. Verification
if ($Verify -or (-not $SkipCopilot -and -not $SkipGit)) {
    Write-Host "`nVerifying installation..." -ForegroundColor Yellow
    
    # Check GitHub CLI
    if (Get-Command gh -ErrorAction SilentlyContinue) {
        $ghVersion = gh --version | Select-Object -First 1
        Write-Host "GitHub CLI: $ghVersion" -ForegroundColor Green
    } else {
        Write-Host "GitHub CLI not found" -ForegroundColor Red
    }
    
    # Check Git configuration
    $gitUser = git config --global user.name
    $gitEmail = git config --global user.email
    
    if ($gitUser -and $gitEmail) {
        Write-Host "Git user configured: $gitUser <$gitEmail>" -ForegroundColor Green
    } else {
        Write-Host "Git user not configured" -ForegroundColor Red
    }
}

Write-Host "`nSetup Complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart VS Code and your terminal" -ForegroundColor White
Write-Host "2. Authenticate with GitHub: gh auth login" -ForegroundColor White
Write-Host "3. Test: gh copilot suggest 'your query'" -ForegroundColor White

Write-Host "`nAltaMedica Medical Platform Integration:" -ForegroundColor Magenta
Write-Host "- HIPAA compliance features enabled" -ForegroundColor White
Write-Host "- Medical code analysis with Copilot" -ForegroundColor White
Write-Host "- Secure Git workflows for medical data" -ForegroundColor White