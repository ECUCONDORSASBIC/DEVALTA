; Auto-Claude DevAltaMedica - Automatización completa
; Ejecuta toda la secuencia sin intervención manual

#NoEnv
#SingleInstance Force

; Abrir Windows Terminal con Ubuntu
Run, wt new-tab -p Ubuntu-24.04
Sleep, 3000

; Enviar comandos automáticamente
Send, cd /home/altamedica/devaltamedica{Enter}
Sleep, 2000

Send, claude{Enter}
Sleep, 4000

; Responder "Yes, proceed" automáticamente
Send, 1{Enter}
Sleep, 3000

; Enviar contexto del proyecto
Send, Continuando DevAltaMedica. Chrome Beta funcionando, comandos PowerShell verificados en CLAUDE2.md, API server puerto 3001 activo. Objetivo: levantar web-app puerto 3000 y probar datos renderizados. Esta es sesion paralela para pruebas comparativas.{Enter}

; Mensaje de confirmación
MsgBox, 0, Auto-Claude, ¡Automatización completada! Claude Code debería estar funcionando.
ExitApp