# ============================================================================
# PowerShell Terminal Spawner for Eduardo's DevAltaMédica
# Bridges WSL limitations for spawning Windows Terminal
# Usage: .\spawn-terminal.ps1 -Title "My Terminal" -Command "echo hello"
# ============================================================================

param(
    [string]$Title = "AltaMédica Dev",
    [string]$Command = "source ~/.claude/QUICK_INIT.sh",
    [string]$App = "main"
)

function Spawn-AltaMedicaTerminal {
    param($Title, $Command, $App)
    
    Write-Host "🚀 Spawning terminal: $Title" -ForegroundColor Green
    
    # Construir comando completo
    $fullCommand = "source ~/.claude/QUICK_INIT.sh && $Command"
    
    # Argumentos para Windows Terminal
    $wtArgs = @(
        "-w", "0",
        "new-tab",
        "--title", $Title,
        "--",
        "wsl", "bash", "-l", "-c",
        "$fullCommand; exec bash"
    )
    
    try {
        # Intentar ejecutar Windows Terminal
        Start-Process "wt" -ArgumentList $wtArgs -NoNewWindow
        Write-Host "✅ Terminal spawned successfully!" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Error spawning terminal: $($_.Exception.Message)" -ForegroundColor Red
        
        # Fallback: crear batch file
        $batchFile = "$env:TEMP\altamedica_terminal_$(Get-Date -Format 'yyyyMMdd_HHmmss').bat"
        $batchContent = "wt $($wtArgs -join ' ')"
        Set-Content -Path $batchFile -Value $batchContent
        
        Write-Host "💡 Fallback batch created: $batchFile" -ForegroundColor Yellow
        Write-Host "   Execute manually: $batchFile" -ForegroundColor Yellow
        
        return $false
    }
}

# Funciones específicas para Eduardo
function Spawn-WebAppTerminal {
    Spawn-AltaMedicaTerminal -Title "Eduardo-WebApp" -Command "web && echo '📱 WebApp ready'" -App "web"
}

function Spawn-DoctorsTerminal {
    Spawn-AltaMedicaTerminal -Title "Eduardo-Doctors" -Command "doctors && echo '👨‍⚕️ Doctors ready'" -App "doctors"
}

function Spawn-PatientsTerminal {
    Spawn-AltaMedicaTerminal -Title "Eduardo-Patients" -Command "patients && echo '🏥 Patients ready'" -App "patients"
}

function Spawn-MainTerminal {
    Spawn-AltaMedicaTerminal -Title "Eduardo-Main" -Command "dev && echo '🚀 Main project ready'" -App "main"
}

# Main execution
switch ($App.ToLower()) {
    "web" { Spawn-WebAppTerminal }
    "doctors" { Spawn-DoctorsTerminal }
    "patients" { Spawn-PatientsTerminal }
    "main" { Spawn-MainTerminal }
    default { 
        Spawn-AltaMedicaTerminal -Title $Title -Command $Command -App $App
    }
}

Write-Host ""
Write-Host "🏥 AltaMédica Terminal Spawner - Eduardo's System" -ForegroundColor Cyan
Write-Host "Usage examples:" -ForegroundColor Gray
Write-Host "  .\spawn-terminal.ps1 -App web" -ForegroundColor Gray
Write-Host "  .\spawn-terminal.ps1 -Title 'My Terminal' -Command 'echo hello'" -ForegroundColor Gray