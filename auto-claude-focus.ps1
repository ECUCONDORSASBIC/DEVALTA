# Auto-Claude con Focus - Activa ventana terminal antes de enviar comandos

Write-Output "Auto-Claude con Focus Correcto"

# 1. Abrir terminal
Write-Output "1. Abriendo terminal Ubuntu..."
$wt = Start-Process wt -ArgumentList "new-tab", "-p", "Ubuntu-24.04" -PassThru
Start-Sleep 4

# 2. Encontrar y activar ventana Windows Terminal
Write-Output "2. Buscando ventana Windows Terminal..."
$wtProcesses = Get-Process -Name "WindowsTerminal" -ErrorAction SilentlyContinue
Write-Output "Procesos WT encontrados: $($wtProcesses.Count)"

# 3. Activar la última ventana (más reciente)
if ($wtProcesses) {
    $latestWT = $wtProcesses | Sort-Object StartTime -Descending | Select-Object -First 1
    Write-Output "3. Activando ventana PID: $($latestWT.Id)"
    
    # Importar funciones Win32
    Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Win32API {
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    
    [DllImport("user32.dll")]
    public static extern bool BringWindowToTop(IntPtr hWnd);
}
"@
    
    # Activar ventana terminal
    $hwnd = $latestWT.MainWindowHandle
    [Win32API]::ShowWindow($hwnd, 9)  # SW_RESTORE
    [Win32API]::BringWindowToTop($hwnd)
    [Win32API]::SetForegroundWindow($hwnd)
    Start-Sleep 2
    
    Write-Output "4. Enviando comandos a ventana activa..."
    Add-Type -AssemblyName System.Windows.Forms
    
    # Enviar comandos con delays
    [System.Windows.Forms.SendKeys]::SendWait("cd /home/altamedica/devaltamedica{ENTER}")
    Start-Sleep 2
    Write-Output "   - CD enviado"
    
    [System.Windows.Forms.SendKeys]::SendWait("claude{ENTER}")
    Start-Sleep 5
    Write-Output "   - CLAUDE enviado"
    
    [System.Windows.Forms.SendKeys]::SendWait("1{ENTER}")
    Start-Sleep 3
    Write-Output "   - YES enviado"
    
    [System.Windows.Forms.SendKeys]::SendWait("Continuando DevAltaMedica desde nueva sesion automatizada. Chrome Beta funcionando, comandos PowerShell verificados, API puerto 3001 activo. Objetivo: levantar web-app puerto 3000.{ENTER}")
    Write-Output "   - Contexto enviado"
    
    Write-Output "5. Automatizacion con focus completada!"
    
} else {
    Write-Output "ERROR: No se encontraron procesos Windows Terminal"
}