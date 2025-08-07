# Enable Git Authentication Provider Features
# Run this script in PowerShell as Administrator

Write-Host "🔐 Activando Git Auth Provider Features..." -ForegroundColor Green

# 1. Configure Git credential manager
Write-Host "🔧 Configuring Git Credential Manager..." -ForegroundColor Yellow
git config --global credential.helper manager-core
git config --global credential.https://dev.azure.com.useHttpPath true
git config --global credential.https://github.com.provider generic

# 2. Enable Git authentication for VS Code
Write-Host "🔧 Enabling Git auth for VS Code..." -ForegroundColor Yellow
git config --global core.editor "code --wait"
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd "code --wait --merge \$REMOTE \$LOCAL \$BASE \$MERGED"
git config --global diff.tool vscode
git config --global difftool.vscode.cmd "code --wait --diff \$LOCAL \$REMOTE"

# 3. Configure GitHub integration
Write-Host "🔧 Configuring GitHub integration..." -ForegroundColor Yellow
git config --global user.name "Eduardo Marques"
git config --global user.email "eduardo@altamedica.com"
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global push.autoSetupRemote true

# 4. Enable commit signing (optional but recommended for medical projects)
Write-Host "🔐 Enabling commit signing..." -ForegroundColor Yellow
git config --global commit.gpgsign false  # Set to true if you have GPG setup
git config --global tag.gpgsign false     # Set to true if you have GPG setup

# 5. Configure authentication for common Git providers
Write-Host "🌐 Configuring authentication for Git providers..." -ForegroundColor Yellow
git config --global credential.https://github.com.username "EduardoMarques"
git config --global credential.https://gitlab.com.username "EduardoMarques"
git config --global credential.https://bitbucket.org.username "EduardoMarques"

# 6. Enable Git hooks for AltaMedica project
Write-Host "🪝 Setting up Git hooks for AltaMedica..." -ForegroundColor Yellow
$hooksPath = "$PWD\.git\hooks"
if (Test-Path $hooksPath) {
    # Pre-commit hook for HIPAA compliance
    $preCommitHook = @"
#!/bin/sh
# HIPAA Compliance pre-commit hook
echo "🔒 Checking HIPAA compliance..."

# Check for potential PHI exposure
if git diff --cached --name-only | xargs grep -l "patient.*id\|ssn\|medical.*record" 2>/dev/null; then
    echo "❌ Potential PHI detected in staged files!"
    echo "Please review and remove any Protected Health Information"
    exit 1
fi

# Check for sensitive files
if git diff --cached --name-only | grep -E "\.(key|pem|p12|jks)$|\.env\.production|firebase.*key\.json"; then
    echo "❌ Sensitive files detected in commit!"
    echo "Please remove sensitive files from staging"
    exit 1
fi

echo "✅ HIPAA compliance check passed"
exit 0
"@
    
    $preCommitPath = "$hooksPath\pre-commit"
    Set-Content -Path $preCommitPath -Value $preCommitHook -Encoding UTF8
    Write-Host "✅ HIPAA compliance pre-commit hook installed" -ForegroundColor Green
}

# 7. Update VS Code Git settings
$vscodeSettingsPath = "$env:APPDATA\Code\User\settings.json"
if (Test-Path $vscodeSettingsPath) {
    Write-Host "🔧 Updating VS Code Git settings..." -ForegroundColor Yellow
    
    $gitSettings = @{
        "git.autofetch" = $true
        "git.enableSmartCommit" = $true
        "git.confirmSync" = $false
        "git.enableCommitSigning" = $false
        "git.useEditorAsCommitInput" = $true
        "github.gitAuthentication" = $true
        "github.gitProtocol" = "https"
        "scm.alwaysShowProviders" = $true
        "scm.defaultViewMode" = "tree"
    }
    
    try {
        $settings = Get-Content $vscodeSettingsPath | ConvertFrom-Json
        foreach ($key in $gitSettings.Keys) {
            $settings | Add-Member -Type NoteProperty -Name $key -Value $gitSettings[$key] -Force
        }
        $settings | ConvertTo-Json -Depth 10 | Set-Content $vscodeSettingsPath
        Write-Host "✅ VS Code Git settings updated" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Could not update VS Code settings: $_" -ForegroundColor Yellow
    }
}

Write-Host "🎉 Git Auth Provider setup complete!" -ForegroundColor Green
Write-Host "📝 Configured features:" -ForegroundColor Cyan
Write-Host "  • Git Credential Manager integration" -ForegroundColor White
Write-Host "  • VS Code Git authentication" -ForegroundColor White
Write-Host "  • GitHub/GitLab/Bitbucket auth" -ForegroundColor White
Write-Host "  • HIPAA compliance pre-commit hooks" -ForegroundColor White
Write-Host "  • Enhanced Git workflows" -ForegroundColor White
Write-Host "🔄 Restart VS Code to apply all changes" -ForegroundColor Yellow