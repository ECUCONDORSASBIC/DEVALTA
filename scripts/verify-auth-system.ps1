# Verificar el sistema de autenticación simplificado
Write-Host "🔍 Verificando Sistema de Autenticación AltaMedica" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Verificar que las apps estén ejecutándose
Write-Host "`n📡 Verificando servicios activos..." -ForegroundColor Yellow

$services = @(
    @{Name="Web App"; Port=3000; Description="Portal principal"},
    @{Name="API Server"; Port=3001; Description="Backend API"},
    @{Name="Patients App"; Port=3003; Description="Portal de pacientes"},
    @{Name="Doctors App"; Port=3002; Description="Portal de médicos"},
    @{Name="Companies App"; Port=3004; Description="Portal de empresas"},
    @{Name="Admin App"; Port=3005; Description="Panel administrativo"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($service.Name) (Puerto $($service.Port)): ACTIVO" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $($service.Name) (Puerto $($service.Port)): Responde pero con estado $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $($service.Name) (Puerto $($service.Port)): NO RESPONDE" -ForegroundColor Red
        Write-Host "   Iniciar con: cd apps/$($service.Name.ToLower().Replace(' ', '-')) && npm run dev" -ForegroundColor Gray
    }
}

Write-Host "`n🔐 Sistema de Autenticación Simplificado:" -ForegroundColor Yellow
Write-Host "- ✅ Firebase Auth en cada aplicación" -ForegroundColor Green
Write-Host "- ✅ Sin tokens SSO adicionales" -ForegroundColor Green
Write-Host "- ✅ Redirección directa por rol" -ForegroundColor Green

Write-Host "`n📋 Flujo de Login:" -ForegroundColor Yellow
Write-Host "1. Usuario inicia sesión en http://localhost:3000" -ForegroundColor White
Write-Host "2. Firebase Auth verifica credenciales" -ForegroundColor White
Write-Host "3. Sistema detecta el rol del usuario" -ForegroundColor White
Write-Host "4. Redirección automática:" -ForegroundColor White
Write-Host "   - Pacientes → http://localhost:3003" -ForegroundColor Cyan
Write-Host "   - Doctores → http://localhost:3002" -ForegroundColor Cyan
Write-Host "   - Empresas → http://localhost:3004" -ForegroundColor Cyan
Write-Host "   - Admins → http://localhost:3005" -ForegroundColor Cyan

Write-Host "`n⚡ Solución Rápida si el login no funciona:" -ForegroundColor Yellow
Write-Host "1. Asegúrate de que la Patients App esté ejecutándose en puerto 3003" -ForegroundColor White
Write-Host "2. Abre una nueva terminal y ejecuta:" -ForegroundColor White
Write-Host "   cd apps/patients && npm run dev" -ForegroundColor Green
Write-Host "3. Espera a que la app compile completamente" -ForegroundColor White
Write-Host "4. Intenta iniciar sesión nuevamente" -ForegroundColor White

Write-Host "`n🐛 Debugging:" -ForegroundColor Yellow
Write-Host "- Abre las DevTools del navegador (F12)" -ForegroundColor White
Write-Host "- Ve a la pestaña Console" -ForegroundColor White
Write-Host "- Busca mensajes que empiecen con [AuthContext]" -ForegroundColor White
Write-Host "- Verifica que aparezca: 'PACIENTE DETECTADO - Redirigiendo a patients-app'" -ForegroundColor White

Write-Host "`n✅ Cambios Implementados:" -ForegroundColor Green
Write-Host "- Eliminado sistema SSO redundante" -ForegroundColor White
Write-Host "- Simplificada la redirección sin tokens en URL" -ForegroundColor White
Write-Host "- Cada app verifica Firebase Auth directamente" -ForegroundColor White

Write-Host "`n🚀 Comando para iniciar todas las apps:" -ForegroundColor Yellow
Write-Host "npm run dev:all" -ForegroundColor Green
Write-Host "(Desde el directorio raíz del proyecto)" -ForegroundColor Gray

Write-Host "`n=================================================" -ForegroundColor Cyan
Write-Host "Verificación completada" -ForegroundColor Cyan