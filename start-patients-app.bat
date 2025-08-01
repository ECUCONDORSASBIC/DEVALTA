@echo off
title AltaMedica - Patients App (Puerto 3002)
cd /d "%~dp0apps\patients"
echo ============================================
echo  AltaMedica - Portal Pacientes
echo  Puerto: 3002
echo  App: patients
echo ============================================
echo.
npm run dev
pause