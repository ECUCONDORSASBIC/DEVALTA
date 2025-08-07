@echo off
echo ======================================
echo   Iniciando App de Pacientes
echo   Puerto: 3003
echo ======================================
echo.

cd apps\patients
echo Instalando dependencias...
call npm install

echo.
echo Iniciando servidor de desarrollo...
echo.
echo Una vez iniciado, puedes acceder a:
echo - http://localhost:3003
echo.
echo Para iniciar sesion:
echo 1. Ve a http://localhost:3000/login
echo 2. Ingresa tus credenciales
echo 3. Seras redirigido automaticamente
echo.

call npm run dev