# Test completo del sistema AI Workers
Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   TEST COMPLETO SISTEMA AI WORKERS" -ForegroundColor Cyan
Write-Host "   ALTAMEDICA PLATFORM" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar servidor
Write-Host "[1] Verificando API Server..." -ForegroundColor Yellow
$serverRunning = $false
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3008/api/health" -Method GET -ErrorAction Stop
    Write-Host "[OK] API Server funcionando en puerto 3008" -ForegroundColor Green
    $serverRunning = $true
} catch {
    Write-Host "[ERROR] API Server no está respondiendo" -ForegroundColor Red
    Write-Host "Por favor, inicia el servidor con: pnpm --filter api-server dev" -ForegroundColor Yellow
}

if ($serverRunning) {
    Write-Host ""
    Write-Host "[2] Creando AI Job de prueba..." -ForegroundColor Yellow
    
    $jobData = @{
        type = "summarize_medical_record"
        patientId = "PATIENT_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        context = @{
            requestedBy = "PowerShell Test"
            priority = "normal"
            testMode = $true
        }
    } | ConvertTo-Json
    
    Write-Host "Payload:" -ForegroundColor Cyan
    Write-Host $jobData
    
    try {
        # Intentar crear el job
        $result = Invoke-RestMethod -Uri "http://localhost:3008/api/ai/jobs" `
            -Method POST `
            -Body $jobData `
            -ContentType "application/json" `
            -ErrorAction Stop
            
        Write-Host ""
        Write-Host "[OK] Job creado exitosamente!" -ForegroundColor Green
        Write-Host "Job ID: $($result.id)" -ForegroundColor White
        Write-Host "Status: $($result.status)" -ForegroundColor White
        Write-Host "Type: $($result.type)" -ForegroundColor White
        
        Write-Host ""
        Write-Host "=================================================" -ForegroundColor Cyan
        Write-Host "   SIGUIENTE PASO" -ForegroundColor Cyan
        Write-Host "=================================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "El job ha sido creado en Firestore." -ForegroundColor White
        Write-Host "Para procesarlo, ejecuta el AI Worker:" -ForegroundColor White
        Write-Host ""
        Write-Host "  cd tools\python" -ForegroundColor Yellow
        Write-Host "  start_ai_worker.bat" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "El worker detectará y procesará el job automáticamente." -ForegroundColor White
        
    } catch {
        Write-Host ""
        Write-Host "[ERROR] No se pudo crear el job" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Posibles causas:" -ForegroundColor Yellow
        Write-Host "1. El endpoint /api/ai/jobs no está registrado" -ForegroundColor White
        Write-Host "2. Firebase Admin SDK no está inicializado" -ForegroundColor White
        Write-Host "3. El servidor necesita reiniciarse para tomar los cambios" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   FIN DEL TEST" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan