@echo off
title AltaMedica Docker
echo Iniciando AltaMedica Docker...
docker-compose -f docker-compose.dev.yml up --build -d
echo Servicios iniciados
echo Web App: http://localhost:3000
echo API Server: http://localhost:3001
echo Doctors: http://localhost:3002
echo Patients: http://localhost:3003
echo Companies: http://localhost:3004
echo Admin: http://localhost:3005
pause

