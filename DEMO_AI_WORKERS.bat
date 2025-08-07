@echo off
echo ===============================================
echo     DEMOSTRACION SISTEMA AI WORKERS
echo     ALTAMEDICA PLATFORM - PRODUCTION READY
echo ===============================================
echo.
echo El sistema de AI Workers procesa tareas de inteligencia 
echo artificial medica de forma asincrona usando:
echo.
echo   1. API Server (Express/Next.js) - Puerto 3008
echo   2. Firebase Firestore - Base de datos en tiempo real
echo   3. Python Worker - Procesamiento con IA
echo.
echo ===============================================
echo     ARQUITECTURA DEL SISTEMA
echo ===============================================
echo.
echo  [Frontend]  -->  [API Server]  -->  [Firestore]
echo                        ^                   ^
echo                        ^                   v
echo                   [Response]         [AI Worker]
echo                                           ^
echo                                      [TensorFlow/AI]
echo.
echo ===============================================
echo     TIPOS DE JOBS SOPORTADOS
echo ===============================================
echo.
echo   - summarize_medical_record: Resume historial medico
echo   - analyze_symptoms: Analiza sintomas del paciente
echo   - generate_prescription: Genera prescripciones
echo   - analyze_lab_results: Interpreta resultados de lab
echo.
echo ===============================================
echo     FLUJO DE PROCESAMIENTO
echo ===============================================
echo.
echo   1. Cliente envia POST a /api/ai/jobs
echo   2. API crea documento en Firestore (status: queued)
echo   3. Worker detecta nuevo job via listener
echo   4. Worker procesa con modelos de IA
echo   5. Worker actualiza Firestore (status: completed)
echo   6. Cliente puede consultar resultado via GET
echo.
echo ===============================================
echo     EJEMPLO DE USO CON CURL
echo ===============================================
echo.
echo curl -X POST http://localhost:3008/api/ai/jobs \
echo   -H "Content-Type: application/json" \
echo   -d "{\"type\": \"summarize_medical_record\", \"patientId\": \"PATIENT_123\"}"
echo.
echo ===============================================
echo.
echo Para ejecutar el sistema completo:
echo.
echo   1. Terminal 1: pnpm --filter api-server dev
echo   2. Terminal 2: cd tools\python ^&^& start_ai_worker.bat
echo   3. Terminal 3: python tools\python\test_ai_job.py
echo.
echo ===============================================
echo.
pause