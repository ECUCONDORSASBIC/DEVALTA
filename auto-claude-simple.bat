@echo off
REM Auto-Claude Simple - Método alternativo con batch

echo 🚀 Iniciando automatización completa Claude Code...

REM Abrir Windows Terminal con Ubuntu
start wt new-tab -p Ubuntu-24.04

REM Esperar que se abra
timeout /t 3

REM Enviar comandos usando PowerShell
powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('cd /home/altamedica/devaltamedica{ENTER}'); Start-Sleep 2; [System.Windows.Forms.SendKeys]::SendWait('claude{ENTER}'); Start-Sleep 3; [System.Windows.Forms.SendKeys]::SendWait('1{ENTER}'); Start-Sleep 2; [System.Windows.Forms.SendKeys]::SendWait('Continuando DevAltaMedica. Chrome Beta funcionando, comandos PowerShell verificados, API puerto 3001 activo. Objetivo: levantar web-app puerto 3000 y probar datos renderizados.{ENTER}')"

echo ✅ Automatización completada!
pause