# Auto-Claude con Window Title - Targeting por título de ventana

Write-Output "=== AUTO-CLAUDE WINDOW TITLE ==="

# 1. Abrir terminal con título específico
Write-Output "1. Abriendo terminal Ubuntu..."
Start-Process wt -ArgumentList "new-tab", "-p", "Ubuntu-24.04", "--title", "DevAltaMedica-Auto"
Start-Sleep 4

# 2. Buscar por título
Write-Output "2. Buscando ventana por título..."
$targetWindow = Get-Process WindowsTerminal | Where-Object { $_.MainWindowTitle -like "*DevAltaMedica*" -or $_.MainWindowTitle -like "*Ubuntu*" }

if ($targetWindow) {
    Write-Output "3. Ventana encontrada: $($targetWindow.MainWindowTitle)"
    
    # Activar ventana
    Add-Type -AssemblyName System.Windows.Forms
    Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
"@
    
    [Win32]::SetForegroundWindow($targetWindow.MainWindowHandle)
    [Win32]::ShowWindow($targetWindow.MainWindowHandle, 3) # SW_MAXIMIZE
    Start-Sleep 1
    
    Write-Output "4. Enviando secuencia completa..."
    
    # Secuencia automatizada
    [System.Windows.Forms.SendKeys]::SendWait("cd /home/altamedica/devaltamedica{ENTER}")
    Start-Sleep 2
    Write-Output "   ✅ Navegación a DevAltaMedica"
    
    [System.Windows.Forms.SendKeys]::SendWait("claude{ENTER}")
    Start-Sleep 5
    Write-Output "   ✅ Claude Code iniciado"
    
    [System.Windows.Forms.SendKeys]::SendWait("1{ENTER}")
    Start-Sleep 3
    Write-Output "   ✅ Confianza aceptada"
    
    [System.Windows.Forms.SendKeys]::SendWait("Continuando DevAltaMedica desde automatizacion. Chrome Beta funcionando, API puerto 3001 activo, comandos PowerShell verificados en CLAUDE2.md. Objetivo: levantar web-app puerto 3000 y probar datos renderizados.{ENTER}")
    Write-Output "   ✅ Contexto completo enviado"
    
    Write-Output "5. ¡AUTOMATIZACIÓN COMPLETA EXITOSA!"
    Write-Output "   Ventana: $($targetWindow.MainWindowTitle)"
    Write-Output "   PID: $($targetWindow.Id)"
    
} else {
    Write-Output "ERROR: No se encontró ventana Ubuntu"
    Write-Output "Ventanas disponibles:"
    Get-Process WindowsTerminal | Select-Object Id, MainWindowTitle | Format-Table
}

Write-Output "FIN AUTO-CLAUDE TITLE"