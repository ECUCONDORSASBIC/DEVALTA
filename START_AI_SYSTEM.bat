@echo off
echo ========================================================
echo    ALTAMEDICA AI SYSTEM - Complete Setup
echo ========================================================
echo.

echo [STEP 1] Starting API Server...
echo ----------------------------------------
start "API Server" cmd /k "cd /d C:\Users\Eduardo\Documents\devaltamedica && pnpm --filter api-server dev"
echo API Server starting on port 3001...
timeout /t 15 /nobreak > nul

echo.
echo [STEP 2] Starting AI Worker...
echo ----------------------------------------
start "AI Worker" cmd /k "cd /d C:\Users\Eduardo\Documents\devaltamedica\tools\python && call start_ai_worker.bat"
echo AI Worker starting with Firebase connection...
timeout /t 5 /nobreak > nul

echo.
echo [STEP 3] System Ready!
echo ----------------------------------------
echo.
echo The AI System is now running with:
echo   - API Server: http://localhost:3001
echo   - AI Worker: Processing jobs from Firestore
echo.
echo ========================================================
echo    TEST THE SYSTEM
echo ========================================================
echo.
echo To test the AI job system, run this in a new terminal:
echo.
echo   cd C:\Users\Eduardo\Documents\devaltamedica\tools\python
echo   python test_ai_job.py
echo.
echo Or use curl:
echo.
echo   curl -X POST http://localhost:3001/api/v1/ai/jobs ^
echo        -H "Content-Type: application/json" ^
echo        -d "{\"type\": \"summarize_medical_record\", \"patientId\": \"PATIENT_TEST\"}"
echo.
echo ========================================================
echo.
echo Press any key to open the test script...
pause

echo.
echo Running test...
cd /d C:\Users\Eduardo\Documents\devaltamedica\tools\python
python test_ai_job.py

pause