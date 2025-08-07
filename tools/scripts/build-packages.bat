@echo off
echo Building AltaMedica packages...
cd /d "C:\Users\Eduardo\Documents\devaltamedica"

echo Building medical-cache...
cd packages\medical-cache
call npm run build

echo Building types...
cd ..\types
call npm run build

echo Building firebase...
cd ..\firebase  
call npm run build

echo Building core...
cd ..\core
call npm run build

echo Building shared...
cd ..\shared
call npm run build

echo Building ui...
cd ..\ui
call npm run build

cd ..\..
echo All packages built successfully!
pause