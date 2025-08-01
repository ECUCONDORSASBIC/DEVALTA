@echo off
title AltaMedica - Doctors App (Puerto 3003)
cd /d "%~dp0apps\doctors"
echo ============================================
echo  AltaMedica - Portal Doctores
echo  Puerto: 3003
echo  App: doctors
echo ============================================
echo.
npm run dev
pause