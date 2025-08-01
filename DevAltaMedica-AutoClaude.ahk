; DevAltaMedica AutoClaude - Automatización Completa v2.0
; Crea nueva sesión Claude Code automáticamente
; Ejecutar: Doble clic en este archivo

#NoEnv
#SingleInstance Force
#Persistent

; Configuración
ContextText := "Continuando DevAltaMedica desde nueva sesion automatizada paralela. Estado actual: Chrome Beta funcionando (18 procesos activos), comandos PowerShell verificados y documentados en CLAUDE2.md, API server puerto 3001 ACTIVO, enlace simbolico /home/altamedica/devaltamedica funcional. Esta es sesion para pruebas comparativas con sesion principal. Objetivo principal: levantar web-app puerto 3000 y probar obtencion de datos renderizados HTML completos de Next.js."

; Mensaje inicial
MsgBox, 4,, DevAltaMedica AutoClaude`n`n¿Iniciar automatización completa?`n`n• Abrirá terminal Ubuntu`n• Ejecutará Claude Code`n• Configurará contexto proyecto`n`nContinuar?, 10

IfMsgBox No
    ExitApp

; Paso 1: Abrir Windows Terminal Ubuntu
ToolTip, Paso 1/5: Abriendo terminal Ubuntu..., 10, 10
Run, wt new-tab -p Ubuntu-24.04
Sleep, 4000

; Paso 2: Activar ventana Windows Terminal
ToolTip, Paso 2/5: Activando ventana terminal..., 10, 10
WinActivate, ahk_exe WindowsTerminal.exe
WinWaitActive, ahk_exe WindowsTerminal.exe, , 8

If ErrorLevel {
    MsgBox, 16,, Error: No se pudo activar Windows Terminal`nIntentar manualmente
    ExitApp
}

; Paso 3: Navegar al directorio DevAltaMedica
ToolTip, Paso 3/5: Navegando a DevAltaMedica..., 10, 10
Send, cd /home/altamedica/devaltamedica{Enter}
Sleep, 2500

; Paso 4: Ejecutar Claude Code
ToolTip, Paso 4/5: Ejecutando Claude Code..., 10, 10
Send, claude{Enter}
Sleep, 6000

; Paso 5: Responder diálogo de confianza
ToolTip, Paso 5/5: Configurando confianza y contexto..., 10, 10
Send, 1{Enter}
Sleep, 3500

; Enviar contexto completo del proyecto
Send, %ContextText%{Enter}
Sleep, 1000

; Finalización
ToolTip, ¡Automatización completada exitosamente!, 10, 10
SetTimer, RemoveToolTip, 3000

MsgBox, 64, Éxito - DevAltaMedica, ¡Automatización completada!`n`nAhora tienes 2 sesiones Claude Code:`n• Sesión principal (actual)`n• Sesión paralela (nueva)`n`nAmbas con contexto DevAltaMedica completo., 5

ExitApp

RemoveToolTip:
ToolTip
return