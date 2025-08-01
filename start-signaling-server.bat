@echo off
title AltaMedica - Signaling Server (Puerto 8888)
cd /d "%~dp0apps\signaling-server"
echo ============================================
echo  AltaMedica - Signaling Server WebRTC
echo  Puerto: 8888
echo  App: signaling-server
echo ============================================
echo.
npm run dev
pause