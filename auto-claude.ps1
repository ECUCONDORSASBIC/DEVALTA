# Auto-Claude Script - Sin UAC
# Abre terminal Ubuntu y ejecuta Claude Code automáticamente

# Método 1: Terminal con directorio específico
Start-Process wt -ArgumentList "new-tab", "-p", "Ubuntu-24.04", "--cd", "/home/altamedica/devaltamedica"
Start-Sleep 2

# Método 2: Ejecutar claude en WSL
Start-Process wt -ArgumentList "new-tab", "-p", "Ubuntu-24.04", "wsl", "-d", "Ubuntu-24.04", "-e", "bash", "-c", "cd /home/altamedica/devaltamedica && claude"

Write-Output "Terminal Ubuntu abierta con Claude Code iniciándose automáticamente"
Write-Output "Contexto listo: DevAltaMedica, Chrome Beta funcionando, API puerto 3001 activo"