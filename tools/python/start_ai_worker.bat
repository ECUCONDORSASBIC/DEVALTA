@echo off
echo Starting AI Worker for AltaMedica Platform...
echo.

REM Set Firebase credentials
set GOOGLE_APPLICATION_CREDENTIALS=C:\Users\Eduardo\Documents\devaltamedica\apps\api-server\altamedic-20f69-firebase-adminsdk-fbsvc-06a561d259.json

REM Check if credentials file exists
if not exist "%GOOGLE_APPLICATION_CREDENTIALS%" (
    echo ERROR: Firebase credentials file not found!
    echo Looking for: %GOOGLE_APPLICATION_CREDENTIALS%
    pause
    exit /b 1
)

echo Firebase credentials configured: %GOOGLE_APPLICATION_CREDENTIALS%
echo.

REM Activate virtual environment and run worker
cd /d C:\Users\Eduardo\Documents\devaltamedica\tools\python
echo Activating Python virtual environment...
call .venv\Scripts\activate.bat

echo.
echo Starting AI Worker...
echo Press Ctrl+C to stop the worker
echo.
python workers\ai_worker.py

pause