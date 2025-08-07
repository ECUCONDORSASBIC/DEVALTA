# AltaMedica AI Integration - Create Instructions
param(
    [string]$Context = "Optimizar sistema de citas médicas con WebRTC y compliance HIPAA"
)

Write-Host "🤖 Creando instrucciones para integración AI..." -ForegroundColor Cyan

# Crear directorio AI workspace
$aiWorkspace = "ai-workspace"
if (!(Test-Path $aiWorkspace)) {
    New-Item -Path $aiWorkspace -ItemType Directory -Force
    Write-Host "✅ Workspace AI creado" -ForegroundColor Green
}

# Instrucciones para Gemini
$geminiInstructions = @"
🏥 CONTEXTO MÉDICO ALTAMEDICA - ANÁLISIS REQUERIDO

WORKSPACE: C:\Users\Eduardo\Documents\devaltamedica\devaltamedica\

OBJETIVO: $Context

ANÁLISIS NECESARIO:
1. Identificar funciones de appointments en apps/api-server/src/app/api/v1/appointments/
2. Buscar patrones HIPAA en middleware y validaciones
3. Mapear WebRTC telemedicine en apps/api-server/src/app/api/v1/telemedicine/
4. Revisar components médicos en apps/doctors/ y apps/patients/

ARCHIVOS CLAVE A ANALIZAR:
- apps/api-server/src/app/api/v1/appointments/route.ts
- apps/api-server/src/app/api/v1/telemedicine/sessions/route.ts
- apps/api-server/src/lib/middleware.ts
- apps/doctors/src/components/
- apps/patients/src/components/

ENTREGA A CLAUDE:
- Ubicaciones exactas de funciones médicas
- Patrones HIPAA identificados
- Oportunidades de optimización
- Dependencies críticas
- Approach recomendado para mejoras

FORMATO: JSON con ubicaciones específicas y recomendaciones
"@

# Instrucciones para Claude
$claudeInstructions = @"
⚡ CLAUDE - EJECUCIÓN BASADA EN ANÁLISIS GEMINI

RECIBIR DE GEMINI:
- Análisis de codebase médico
- Ubicaciones específicas de archivos
- Patrones HIPAA identificados
- Oportunidades de optimización

EJECUTAR:
1. Leer archivos específicos identificados por Gemini
2. Ejecutar testing de APIs médicas relevantes
3. Verificar performance actual del sistema
4. Implementar mejoras sugeridas
5. Validar compliance HIPAA

COMANDOS A EJECUTAR:
- node scripts/validate-apps.js
- Testing específico de endpoints identificados
- Performance testing de APIs críticas
- Verificación de WebRTC functionality

PREPARAR PARA COPILOT:
- Contexto técnico específico
- Issues de performance identificados
- Requerimientos de optimización médica
- Compliance requirements
"@

# Instrucciones para GitHub Copilot
$copilotInstructions = @"
🛠️ GITHUB COPILOT - OPTIMIZACIÓN DE CÓDIGO MÉDICO

COMANDO PRINCIPAL:
copilot-debug "optimize AltaMedica medical appointment system with WebRTC and HIPAA compliance"

CONTEXTO RECIBIDO DE CLAUDE:
- Análisis técnico del sistema actual
- Performance metrics identificados
- Issues específicos encontrados
- Medical compliance requirements

GENERAR:
1. Código optimizado para sistema de citas médicas
2. Mejoras de performance para WebRTC telemedicine
3. Enhanced HIPAA compliance validations
4. Medical workflow optimizations
5. Error handling improvements

CONSIDERACIONES MÉDICAS:
- Patient safety first
- HIPAA PHI protection
- Emergency response optimization
- Medical data integrity
- Audit trail requirements
"@

# Guardar instrucciones
$geminiInstructions | Out-File -FilePath "$aiWorkspace\gemini-instructions.txt" -Encoding UTF8
$claudeInstructions | Out-File -FilePath "$aiWorkspace\claude-instructions.txt" -Encoding UTF8
$copilotInstructions | Out-File -FilePath "$aiWorkspace\copilot-instructions.txt" -Encoding UTF8

Write-Host "📋 Instrucciones creadas en ai-workspace/" -ForegroundColor Green
Write-Host "🧠 Gemini: gemini-instructions.txt" -ForegroundColor Yellow
Write-Host "⚡ Claude: claude-instructions.txt" -ForegroundColor Yellow  
Write-Host "🛠️ Copilot: copilot-instructions.txt" -ForegroundColor Yellow

Write-Host "`n🎯 PRÓXIMOS PASOS:" -ForegroundColor Magenta
Write-Host "1. Comparte gemini-instructions.txt con Gemini (PID 13768)" -ForegroundColor White
Write-Host "2. Gemini analiza y proporciona contexto médico" -ForegroundColor White
Write-Host "3. Claude ejecuta basándose en análisis de Gemini" -ForegroundColor White
Write-Host "4. GitHub Copilot optimiza código médico" -ForegroundColor White

Write-Host "`n🚀 AI Integration Ready for Medical Development!" -ForegroundColor Green