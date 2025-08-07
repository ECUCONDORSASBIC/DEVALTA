# Script para depurar el flujo SSO de login
Write-Host "`n=== DEPURACION SSO LOGIN ===" -ForegroundColor Cyan

# 1. Verificar que el API server esté corriendo
Write-Host "`n1. Verificando API Server..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET
    Write-Host "   OK - API Server activo" -ForegroundColor Green
} catch {
    Write-Host "   ERROR - API Server no responde" -ForegroundColor Red
    Write-Host "   Ejecuta: npm run dev:api-server" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar el endpoint de login
Write-Host "`n2. Verificando endpoint de login..." -ForegroundColor Yellow
Write-Host "   Este endpoint requiere un token de Firebase valido" -ForegroundColor Gray

# 3. Verificar cookies en el navegador
Write-Host "`n3. Para verificar cookies SSO:" -ForegroundColor Yellow
Write-Host "   1. Abre DevTools (F12)" -ForegroundColor Gray
Write-Host "   2. Ve a Application > Cookies" -ForegroundColor Gray
Write-Host "   3. Busca 'altamedica_sso_token'" -ForegroundColor Gray

# 4. Pasos para depurar
Write-Host "`n4. Pasos de depuracion:" -ForegroundColor Yellow
Write-Host "   a) Abre la consola del navegador (F12)" -ForegroundColor Gray
Write-Host "   b) Intenta hacer login" -ForegroundColor Gray
Write-Host "   c) Busca estos logs:" -ForegroundColor Gray
Write-Host "      - [AuthContext] Obteniendo token SSO..." -ForegroundColor DarkGray
Write-Host "      - [AuthContext] Token SSO obtenido" -ForegroundColor DarkGray
Write-Host "      - [AuthContext] Redirigiendo con SSO a:" -ForegroundColor DarkGray

Write-Host "`n5. Si el login se queda en 'Cargando dashboard 100%':" -ForegroundColor Yellow
Write-Host "   - Verifica que haya un log de redireccion" -ForegroundColor Gray
Write-Host "   - Revisa si hay errores de CORS" -ForegroundColor Gray
Write-Host "   - Confirma que la cookie SSO se establece" -ForegroundColor Gray

Write-Host "`n=== FIN DE DEPURACION ===" -ForegroundColor Cyan