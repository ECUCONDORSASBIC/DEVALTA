# Script para arreglar el problema de autenticación en patients app

Write-Host "`n=== SOLUCION TEMPORAL PARA PATIENTS APP ===" -ForegroundColor Cyan

Write-Host "`nEl problema actual es que patients app intenta verificar SSO antes de que el usuario haga login." -ForegroundColor Yellow
Write-Host "Esto causa el error 'No se puede conectar con el servidor' cuando en realidad es normal no tener sesion." -ForegroundColor Yellow

Write-Host "`n1. SOLUCION RAPIDA:" -ForegroundColor Green
Write-Host "   - Hacer login primero en http://localhost:3000/login" -ForegroundColor Gray
Write-Host "   - Usar credenciales de paciente: paciente.test@email.com / Patient123!" -ForegroundColor Gray
Write-Host "   - Esperar la redireccion automatica a http://localhost:3003" -ForegroundColor Gray

Write-Host "`n2. SOLUCION TEMPORAL (Deshabilitar SSO):" -ForegroundColor Green
Write-Host "   - Editar apps/patients/.env.local" -ForegroundColor Gray
Write-Host "   - Cambiar NEXT_PUBLIC_DISABLE_SSO=true" -ForegroundColor Gray
Write-Host "   - Reiniciar patients app" -ForegroundColor Gray

Write-Host "`n3. FLUJO CORRECTO:" -ForegroundColor Green
Write-Host "   a) Usuario entra a http://localhost:3003" -ForegroundColor Gray
Write-Host "   b) No hay sesion SSO -> Redirigir a login" -ForegroundColor Gray
Write-Host "   c) Login en http://localhost:3000/login" -ForegroundColor Gray
Write-Host "   d) Se crea cookie SSO" -ForegroundColor Gray
Write-Host "   e) Redireccion automatica a http://localhost:3003" -ForegroundColor Gray
Write-Host "   f) Ahora SI hay sesion SSO valida" -ForegroundColor Gray

Write-Host "`n=== VERIFICANDO SERVICIOS ===" -ForegroundColor Cyan

# Verificar API Server
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET
    Write-Host "OK - API Server activo en puerto 3001" -ForegroundColor Green
} catch {
    Write-Host "ERROR - API Server no responde" -ForegroundColor Red
    Write-Host "Ejecuta: cd apps/api-server && npm run dev" -ForegroundColor Yellow
}

# Verificar Web App
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
    Write-Host "OK - Web App activa en puerto 3000" -ForegroundColor Green
} catch {
    Write-Host "ERROR - Web App no responde" -ForegroundColor Red
    Write-Host "Ejecuta: cd apps/web-app && npm run dev" -ForegroundColor Yellow
}

# Verificar Patients App
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3003" -UseBasicParsing
    Write-Host "OK - Patients App activa en puerto 3003" -ForegroundColor Green
} catch {
    Write-Host "ERROR - Patients App no responde" -ForegroundColor Red
    Write-Host "Ejecuta: cd apps/patients && npm run dev" -ForegroundColor Yellow
}

Write-Host "`n=== FIN ===" -ForegroundColor Cyan