; Auto-Claude Final - AutoHotkey (más preciso que PowerShell)
; Instalar AutoHotkey y ejecutar este script

#NoEnv
#SingleInstance Force

; Variables
ContextText := "Continuando DevAltaMedica desde sesion automatizada. Chrome Beta funcionando, comandos PowerShell verificados en CLAUDE2.md, API puerto 3001 activo. Esta es sesion paralela para pruebas. Objetivo: levantar web-app puerto 3000 y probar datos renderizados."

; 1. Abrir Windows Terminal Ubuntu
Run, wt new-tab -p Ubuntu-24.04
Sleep, 4000

; 2. Buscar ventana Windows Terminal y activarla
WinActivate, ahk_exe WindowsTerminal.exe
WinWaitActive, ahk_exe WindowsTerminal.exe, , 5

; 3. Enviar comandos secuencialmente
Send, cd /home/altamedica/devaltamedica{Enter}
Sleep, 2000

Send, claude{Enter}
Sleep, 5000

; 4. Responder al diálogo de confianza
Send, 1{Enter}
Sleep, 3000

; 5. Enviar contexto del proyecto
Send, %ContextText%{Enter}

; 6. Mensaje de confirmación
MsgBox, 0, Éxito, ¡Claude Code automatizado correctamente!`n`nAhora tienes 2 sesiones paralelas:, 3

ExitApp