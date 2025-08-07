# Quick Verification Script for Copilot & Git Setup
Write-Host "🔍 Verificando configuración de Copilot y Git..." -ForegroundColor Cyan

# Test copilot-debug command
Write-Host "`n🤖 Testing copilot-debug command:" -ForegroundColor Yellow
if (Get-Command copilot-debug -ErrorAction SilentlyContinue) {
    Write-Host "✅ copilot-debug command available" -ForegroundColor Green
    Write-Host "Usage: copilot-debug 'your query'" -ForegroundColor Gray
} else {
    Write-Host "❌ copilot-debug command not found" -ForegroundColor Red
    Write-Host "Run: . `$PROFILE to reload PowerShell profile" -ForegroundColor Yellow
}

# Test GitHub CLI and Copilot extension
Write-Host "`n📱 Testing GitHub CLI:" -ForegroundColor Yellow
try {
    $ghVersion = gh --version 2>$null
    if ($ghVersion) {
        Write-Host "✅ GitHub CLI installed" -ForegroundColor Green
        
        # Test Copilot extension
        $copilotTest = gh copilot --help 2>$null
        if ($copilotTest) {
            Write-Host "✅ GitHub Copilot CLI extension working" -ForegroundColor Green
        } else {
            Write-Host "❌ GitHub Copilot CLI extension not working" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ GitHub CLI not installed or not in PATH" -ForegroundColor Red
}

# Test Git configuration
Write-Host "`n🔐 Testing Git configuration:" -ForegroundColor Yellow
$gitUser = git config --global user.name 2>$null
$gitEmail = git config --global user.email 2>$null
$credHelper = git config --global credential.helper 2>$null

if ($gitUser) { Write-Host "✅ Git user: $gitUser" -ForegroundColor Green }
else { Write-Host "❌ Git user not configured" -ForegroundColor Red }

if ($gitEmail) { Write-Host "✅ Git email: $gitEmail" -ForegroundColor Green }
else { Write-Host "❌ Git email not configured" -ForegroundColor Red }

if ($credHelper) { Write-Host "✅ Credential helper: $credHelper" -ForegroundColor Green }
else { Write-Host "❌ Credential helper not configured" -ForegroundColor Red }

Write-Host "`n🏥 AltaMedica Integration Status:" -ForegroundColor Magenta
if (Test-Path ".git\hooks\pre-commit") {
    Write-Host "✅ HIPAA compliance hooks installed" -ForegroundColor Green
} else {
    Write-Host "⚠️ HIPAA compliance hooks not found" -ForegroundColor Yellow
}

Write-Host "`n📋 Quick Commands to Test:" -ForegroundColor Cyan
Write-Host "• copilot-debug 'how to fix npm errors'" -ForegroundColor White
Write-Host "• gh copilot suggest 'git command to undo last commit'" -ForegroundColor White
Write-Host "• gh auth status" -ForegroundColor White