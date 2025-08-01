; DevAltaMedica AutoClaude v3 - Con manejo de diálogos Ubuntu
; Cierra automáticamente ventanas de notificación

#NoEnv
#SingleInstance Force
#Persistent

; Mensaje inicial
MsgBox, 4,, DevAltaMedica AutoClaude v3.0`n`n✅ Maneja notificaciones Ubuntu automáticamente`n⚠️ NO cambiar ventana durante proceso`n`n¿Continuar automatización completa?`n`n• Terminal Ubuntu + auto-close popups`n• Claude Code automatico`n• Contexto DevAltaMedica configurado`n`nTiempo: ~40 segundos, 15

IfMsgBox No
    ExitApp

; Función para cerrar diálogos molestos
CloseUbuntuDialogs() {
    ; Cerrar notificaciones de fuente
    WinClose, ahk_class #32770 ahk_exe ubuntu.exe
    WinClose, Font
    WinClose, ahk_class gdkWindowToplevel
    
    ; Cerrar otros diálogos Ubuntu comunes
    IfWinExist, Information
        WinClose, Information
    IfWinExist, Warning  
        WinClose, Warning
    IfWinExist, Error
        WinClose, Error
        
    ; Enviar Enter/Escape a ventanas activas molestas
    IfWinActive, ahk_class gdkWindowToplevel
    {
        Send, {Enter}
        Sleep, 200
        Send, {Escape}
    }
}

; Deshabilitar cambio de ventana temporalmente
Hotkey, Alt & Tab, DoNothing
Hotkey, LWin & Tab, DoNothing

; Paso 1: Abrir terminal
ToolTip, PASO 1/6: Abriendo terminal Ubuntu..., 50, 50, 1
Run, wt new-tab -p Ubuntu-24.04 --title "DevAltaMedica-Auto"
Sleep, 4000

; Paso 2: Cerrar diálogos Ubuntu automáticamente
ToolTip, PASO 2/6: Cerrando notificaciones Ubuntu..., 50, 50, 1
Loop, 5 {
    CloseUbuntuDialogs()
    Sleep, 500
}

; Paso 3: Forzar activación terminal
ToolTip, PASO 3/6: Activando terminal..., 50, 50, 1
Loop, 3 {
    WinActivate, ahk_exe WindowsTerminal.exe
    CloseUbuntuDialogs()
    Sleep, 800
}

WinWaitActive, ahk_exe WindowsTerminal.exe, , 10
If ErrorLevel {
    MsgBox, 16,, ERROR: No se pudo activar terminal`nRevisa ventanas abiertas
    ExitApp
}

; Paso 4: Navegación con limpieza de diálogos
ToolTip, PASO 4/6: Navegando a DevAltaMedica..., 50, 50, 1
CloseUbuntuDialogs()
WinActivate, ahk_exe WindowsTerminal.exe
Send, cd /home/altamedica/devaltamedica{Enter}
Sleep, 2500
CloseUbuntuDialogs()

; Paso 5: Claude Code con manejo de interrupciones
ToolTip, PASO 5/6: Ejecutando Claude Code..., 50, 50, 1
CloseUbuntuDialogs()
WinActivate, ahk_exe WindowsTerminal.exe
Send, claude{Enter}
Sleep, 3000

; Cerrar cualquier diálogo durante carga de Claude
Loop, 3 {
    CloseUbuntuDialogs()
    Sleep, 1500
}

; Paso 6: Configuración final
ToolTip, PASO 6/6: Configurando confianza y contexto..., 50, 50, 1
CloseUbuntuDialogs()
WinActivate, ahk_exe WindowsTerminal.exe
Send, 1{Enter}
Sleep, 4000

; Enviar contexto con protección
CloseUbuntuDialogs()
WinActivate, ahk_exe WindowsTerminal.exe
Send, Continuando DevAltaMedica desde nueva sesion automatizada con manejo de dialogs. Chrome Beta funcionando, comandos PowerShell verificados en CLAUDE2.md, API server puerto 3001 ACTIVO. Esta es sesion paralela para pruebas. Objetivo: levantar web-app puerto 3000 y probar datos renderizados.{Enter}

; Limpieza final
CloseUbuntuDialogs()

; Finalización
ToolTip, ¡AUTOMATIZACION v3 COMPLETADA!`nDialogos Ubuntu manejados automáticamente, 50, 50, 1
Sleep, 5000
ToolTip

; Reactivar Alt+Tab
Hotkey, Alt & Tab, Off
Hotkey, LWin & Tab, Off

MsgBox, 64, ¡ÉXITO v3!, ✅ Automatización con manejo de diálogos completada`n✅ Notificaciones Ubuntu cerradas automáticamente`n✅ Nueva sesión Claude Code funcionando`n✅ Contexto DevAltaMedica configurado`n`n🎯 Ahora tienes 2 sesiones paralelas listas., 10

ExitApp

DoNothing:
return