# Auto-Claude con Window Handle - Targeting directo por ventana

Write-Output "=== AUTO-CLAUDE WINDOW HANDLE ==="

# 1. Obtener ventanas actuales de Windows Terminal
$beforeWindows = Get-Process -Name "WindowsTerminal" -ErrorAction SilentlyContinue | Select-Object Id, MainWindowHandle

Write-Output "1. Ventanas WT antes: $($beforeWindows.Count)"

# 2. Abrir nueva terminal
Write-Output "2. Abriendo nueva terminal..."
Start-Process wt -ArgumentList "new-tab", "-p", "Ubuntu-24.04"
Start-Sleep 3

# 3. Obtener ventanas después y encontrar la nueva
$afterWindows = Get-Process -Name "WindowsTerminal" -ErrorAction SilentlyContinue | Select-Object Id, MainWindowHandle
$newWindow = $afterWindows | Where-Object { $_.MainWindowHandle -notin $beforeWindows.MainWindowHandle }

if ($newWindow) {
    Write-Output "3. Nueva ventana encontrada: PID $($newWindow.Id), Handle $($newWindow.MainWindowHandle)"
    
    # 4. Activar ventana específica
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
    
    [Win32]::SetForegroundWindow($newWindow.MainWindowHandle)
    Start-Sleep 1
    
    Write-Output "4. Enviando comandos a ventana específica..."
    
    # Enviar comandos
    [System.Windows.Forms.SendKeys]::SendWait("cd /home/altamedica/devaltamedica{ENTER}")
    Start-Sleep 2
    Write-Output "   ✅ CD enviado"
    
    [System.Windows.Forms.SendKeys]::SendWait("claude{ENTER}")
    Start-Sleep 4
    Write-Output "   ✅ CLAUDE enviado"
    
    [System.Windows.Forms.SendKeys]::SendWait("1{ENTER}")
    Start-Sleep 2
    Write-Output "   ✅ YES enviado"
    
    $context = "Continuando DevAltaMedica desde sesion automatizada. Chrome Beta funcionando, comandos PowerShell verificados, API puerto 3001 activo. Objetivo: levantar web-app puerto 3000."
    [System.Windows.Forms.SendKeys]::SendWait($context)
    [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
    Write-Output "   ✅ Contexto enviado"
    
    Write-Output "5. ¡Automatización con Handle completada!"
} else {
    Write-Output "ERROR: No se pudo identificar la nueva ventana"
}

Write-Output "=== FIN AUTO-CLAUDE HANDLE ==="