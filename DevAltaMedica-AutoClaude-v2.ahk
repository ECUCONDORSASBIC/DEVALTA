; DevAltaMedica AutoClaude v2 - Focus Forzado
; Mantiene foco automáticamente, no se puede interrumpir

#NoEnv
#SingleInstance Force
#Persistent

; Mensaje inicial CON ADVERTENCIA
MsgBox, 4,, DevAltaMedica AutoClaude v2.0`n`n⚠️ IMPORTANTE: NO CAMBIAR DE VENTANA`n⚠️ Dejar que termine automáticamente`n`n¿Continuar automatización?`n`n• Terminal Ubuntu`n• Claude Code automatico`n• Contexto DevAltaMedica`n`nTiempo estimado: 30 segundos, 15

IfMsgBox No
    ExitApp

; Deshabilitar Alt+Tab temporalmente
Hotkey, Alt & Tab, DoNothing
Hotkey, LWin & Tab, DoNothing

; Paso 1: Abrir terminal
ToolTip, PASO 1/5: Abriendo terminal Ubuntu..., 50, 50, 1
Run, wt new-tab -p Ubuntu-24.04 --title "DevAltaMedica-Auto"
Sleep, 5000

; Paso 2: Forzar activación múltiple
ToolTip, PASO 2/5: Forzando activación terminal..., 50, 50, 1
Loop, 3 {
    WinActivate, ahk_exe WindowsTerminal.exe
    Sleep, 500
    WinActivate, DevAltaMedica-Auto
    Sleep, 500
}

; Verificar que está activa
WinWaitActive, ahk_exe WindowsTerminal.exe, , 10
If ErrorLevel {
    MsgBox, 16,, ERROR: Terminal no se activó`nReintenta manualmente
    ExitApp
}

; Paso 3: Comandos con refuerzo de foco
ToolTip, PASO 3/5: Navegando a DevAltaMedica..., 50, 50, 1
WinActivate, ahk_exe WindowsTerminal.exe
Send, cd /home/altamedica/devaltamedica{Enter}
Sleep, 3000

; Paso 4: Claude Code con verificación
ToolTip, PASO 4/5: Ejecutando Claude Code..., 50, 50, 1
WinActivate, ahk_exe WindowsTerminal.exe
Send, claude{Enter}
Sleep, 7000

; Paso 5: Configuración final
ToolTip, PASO 5/5: Enviando confianza y contexto..., 50, 50, 1
WinActivate, ahk_exe WindowsTerminal.exe
Send, 1{Enter}
Sleep, 4000

; Contexto completo
WinActivate, ahk_exe WindowsTerminal.exe
Send, Continuando DevAltaMedica desde nueva sesion automatizada. Chrome Beta funcionando, comandos PowerShell verificados en CLAUDE2.md, API server puerto 3001 ACTIVO. Esta es sesion paralela para pruebas comparativas. Objetivo: levantar web-app puerto 3000 y probar obtencion datos renderizados HTML de Next.js.{Enter}

; Finalización
ToolTip, ¡AUTOMATIZACION EXITOSA!`nNo cambiar ventana por 5 segundos..., 50, 50, 1
Sleep, 5000
ToolTip

; Reactivar Alt+Tab
Hotkey, Alt & Tab, Off
Hotkey, LWin & Tab, Off

MsgBox, 64, ¡ÉXITO!, ¡Automatización completada exitosamente!`n`n✅ Nueva sesión Claude Code creada`n✅ Contexto DevAltaMedica configurado`n✅ Ya puedes cambiar de ventana`n`nAhora tienes 2 sesiones paralelas funcionando., 8

ExitApp

DoNothing:
return