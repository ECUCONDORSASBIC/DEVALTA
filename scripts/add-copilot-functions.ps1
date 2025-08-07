# Add Copilot functions to PowerShell profile
$profilePath = $PROFILE.CurrentUserAllHosts

if (-not (Test-Path $profilePath)) {
    New-Item -Path $profilePath -ItemType File -Force
    Write-Host "Created PowerShell profile at: $profilePath" -ForegroundColor Green
}

$functionsToAdd = @'

# GitHub Copilot Debug Functions for AltaMedica
function copilot-debug {
    param([string]$query)
    if ($query) {
        Write-Host "Consulting GitHub Copilot for: $query" -ForegroundColor Cyan
        gh copilot suggest -t shell $query
    } else {
        Write-Host "Usage: copilot-debug 'your debugging query'" -ForegroundColor Yellow
        Write-Host "Examples:" -ForegroundColor Cyan
        Write-Host "  copilot-debug 'fix npm build errors'" -ForegroundColor White
        Write-Host "  copilot-debug 'docker container not starting'" -ForegroundColor White
        Write-Host "  copilot-debug 'git merge conflict resolution'" -ForegroundColor White
    }
}

function copilot-git {
    param([string]$query)
    if ($query) {
        Write-Host "Git assistance from Copilot: $query" -ForegroundColor Cyan
        gh copilot suggest -t git $query
    } else {
        Write-Host "Usage: copilot-git 'your git query'" -ForegroundColor Yellow
    }
}

function copilot-explain {
    param([string]$command)
    if ($command) {
        Write-Host "Explaining command: $command" -ForegroundColor Cyan
        gh copilot explain $command
    } else {
        Write-Host "Usage: copilot-explain 'command to explain'" -ForegroundColor Yellow
    }
}

# AltaMedica specific shortcuts
function altamedica-help {
    Write-Host "AltaMedica Development Shortcuts:" -ForegroundColor Magenta
    Write-Host "  copilot-debug 'query'  - Debug assistance" -ForegroundColor White
    Write-Host "  copilot-git 'query'    - Git assistance" -ForegroundColor White
    Write-Host "  copilot-explain 'cmd'  - Explain command" -ForegroundColor White
    Write-Host "  npm run dev:all        - Start all services" -ForegroundColor White
    Write-Host "  npm run test:all       - Run all tests" -ForegroundColor White
}

Write-Host "GitHub Copilot functions loaded for AltaMedica!" -ForegroundColor Green
'@

# Check if functions already exist
$currentProfile = Get-Content $profilePath -ErrorAction SilentlyContinue -Raw
if ($currentProfile -notlike "*copilot-debug*") {
    Add-Content -Path $profilePath -Value $functionsToAdd
    Write-Host "Added Copilot functions to PowerShell profile" -ForegroundColor Green
    Write-Host "Profile location: $profilePath" -ForegroundColor Yellow
    Write-Host "Run '. `$PROFILE' to reload profile in current session" -ForegroundColor Cyan
} else {
    Write-Host "Copilot functions already exist in profile" -ForegroundColor Yellow
}