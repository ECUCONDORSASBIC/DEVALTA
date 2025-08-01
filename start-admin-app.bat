@echo off
title AltaMedica - Admin App (Puerto 3006)
cd /d "%~dp0apps\admin"
echo ============================================
echo  AltaMedica - Dashboard Administrativo
echo  Puerto: 3006
echo  App: admin
echo ============================================
echo.
npm run dev
pause