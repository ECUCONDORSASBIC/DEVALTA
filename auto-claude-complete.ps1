# Auto-Claude Complete - Automatización Total
# Abre terminal, navega, ejecuta claude, y responde automáticamente

param(
    [string]$Context = "Continuando DevAltaMedica. Chrome Beta funcionando, API puerto 3001 activo. Objetivo: levantar web-app puerto 3000."
)

# 1. Abrir terminal Ubuntu
Write-Output "Abriendo terminal Ubuntu..."
$process = Start-Process wt -ArgumentList "new-tab", "-p", "Ubuntu-24.04" -PassThru
Start-Sleep 3

# 2. Usar PowerShell para enviar comandos automáticamente
Write-Output "Navegando a directorio DevAltaMedica..."
Add-Type -AssemblyName System.Windows.Forms

# Simular escritura de comandos
[System.Windows.Forms.SendKeys]::SendWait("cd /home/altamedica/devaltamedica{ENTER}")
Start-Sleep 2

Write-Output "Ejecutando Claude Code..."
[System.Windows.Forms.SendKeys]::SendWait("claude{ENTER}")
Start-Sleep 3

Write-Output "Respondiendo Yes proceed..."
[System.Windows.Forms.SendKeys]::SendWait("1{ENTER}")
Start-Sleep 2

Write-Output "Enviando contexto del proyecto..."
[System.Windows.Forms.SendKeys]::SendWait($Context)
[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")

Write-Output "Automatizacion completada! Claude Code deberia estar funcionando con contexto."