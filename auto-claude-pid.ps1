# Auto-Claude con PID Targeting - Automatización precisa
# Obtiene PID del proceso terminal y envía comandos específicamente a esa ventana

param(
    [string]$Context = "Continuando DevAltaMedica. Chrome Beta funcionando, comandos PowerShell verificados, API puerto 3001 activo. Objetivo: levantar web-app puerto 3000 y probar datos renderizados."
)

Write-Output "=== AUTO-CLAUDE CON PID TARGETING ==="

# 1. Abrir Windows Terminal y capturar PID
Write-Output "1. Abriendo terminal Ubuntu y capturando PID..."
$wtProcess = Start-Process wt -ArgumentList "new-tab", "-p", "Ubuntu-24.04" -PassThru
$wtPID = $wtProcess.Id
Write-Output "Windows Terminal PID: $wtPID"

# Esperar que se cargue completamente
Start-Sleep 4

# 2. Obtener handle de la ventana específica
Add-Type -AssemblyName System.Windows.Forms
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Win32 {
    [DllImport("user32.dll")]
    public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
    
    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);
    
    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    
    [DllImport("user32.dll")]
    public static extern IntPtr GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
}
"@

# 3. Encontrar ventana del proceso específico
Write-Output "2. Buscando ventana del proceso Windows Terminal..."
$wtWindows = Get-Process -Name "WindowsTerminal" -ErrorAction SilentlyContinue
if ($wtWindows) {
    $targetWindow = $wtWindows | Where-Object { $_.Id -eq $wtPID }
    if ($targetWindow) {
        $hwnd = $targetWindow.MainWindowHandle
        Write-Output "Ventana encontrada: $hwnd"
        
        # Activar la ventana específica
        [Win32]::SetForegroundWindow($hwnd)
        [Win32]::ShowWindow($hwnd, 9) # SW_RESTORE
        Start-Sleep 1
        
        Write-Output "3. Enviando comandos al proceso específico..."
        
        # Enviar comandos secuencialmente
        [System.Windows.Forms.SendKeys]::SendWait("cd /home/altamedica/devaltamedica{ENTER}")
        Start-Sleep 2
        Write-Output "   - Comando CD enviado"
        
        [System.Windows.Forms.SendKeys]::SendWait("claude{ENTER}")
        Start-Sleep 4
        Write-Output "   - Comando CLAUDE enviado"
        
        [System.Windows.Forms.SendKeys]::SendWait("1{ENTER}")
        Start-Sleep 3
        Write-Output "   - Respuesta YES enviada"
        
        [System.Windows.Forms.SendKeys]::SendWait($Context)
        [System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
        Write-Output "   - Contexto enviado"
        
        Write-Output "4. ¡Automatización con PID completada!"
        Write-Output "   Terminal PID: $wtPID"
        Write-Output "   Ventana Handle: $hwnd"
    } else {
        Write-Output "ERROR: No se encontró ventana para PID $wtPID"
    }
} else {
    Write-Output "ERROR: No se encontró proceso WindowsTerminal"
}

Write-Output "=== FIN AUTO-CLAUDE PID ==="