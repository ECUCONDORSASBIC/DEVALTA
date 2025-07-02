# 🏥 AltaMedica - Configuración de Cursor en Español
# Script para configurar Cursor Premium con soporte completo en español

Write-Host "🚀 Configurando Cursor Premium para AltaMedica..." -ForegroundColor Green

# Configuración de idioma español para Cursor
$cursorSettings = @{
    "cursor.language" = "es"
    "cursor.chat.language" = "es"
    "cursor.completion.language" = "es"
    "cursor.explain.language" = "es"
    "cursor.fix.language" = "es"
    "cursor.test.language" = "es"
    "cursor.document.language" = "es"
    
    # Configuración específica para AltaMedica
    "cursor.project.context" = "Proyecto de sistema médico AltaMedica con Next.js, TypeScript, Firebase y arquitectura monorepo"
    "cursor.codebase.context" = "Sistema de gestión médica con APIs REST, autenticación Firebase, y múltiples aplicaciones (pacientes, doctores, empresas)"
    
    # Configuración de idioma para Copilot también
    "github.copilot.chat.localeOverride" = "es"
    "github.copilot.localeOverride" = "es"
    
    # Configuración de archivos específicos del proyecto
    "files.associations" = @{
        "*.md" = "markdown"
        "*.mdx" = "mdx"
        "*.json" = "jsonc"
        "*.ts" = "typescript"
        "*.tsx" = "typescriptreact"
    }
    
    # Palabras específicas del dominio médico
    "cSpell.words" = @(
        "Altamedica",
        "anamnesis",
        "telemedicina",
        "expediente",
        "diagnostico",
        "prescripcion",
        "HIPAA",
        "PHI",
        "clinico",
        "medico",
        "paciente",
        "doctor",
        "monorepo",
        "turbo",
        "pnpm",
        "microservicio",
        "triage",
        "emergencia",
        "urgencia",
        "consulta",
        "cita",
        "historial",
        "nextjs",
        "firestore",
        "firebase",
        "zod",
        "vitest",
        "eslint",
        "prettier"
    )
}

# Ruta de configuración de Cursor
$cursorConfigPath = "$env:APPDATA\Cursor\User\settings.json"

Write-Host "📁 Configurando Cursor en: $cursorConfigPath" -ForegroundColor Yellow

# Crear directorio si no existe
$cursorDir = Split-Path $cursorConfigPath -Parent
if (!(Test-Path $cursorDir)) {
    New-Item -ItemType Directory -Path $cursorDir -Force
    Write-Host "✅ Directorio de Cursor creado" -ForegroundColor Green
}

# Leer configuración existente o crear nueva
if (Test-Path $cursorConfigPath) {
    $existingSettings = Get-Content $cursorConfigPath | ConvertFrom-Json
    Write-Host "📖 Configuración existente encontrada" -ForegroundColor Yellow
} else {
    $existingSettings = @{}
    Write-Host "🆕 Creando nueva configuración" -ForegroundColor Yellow
}

# Fusionar configuraciones
foreach ($key in $cursorSettings.Keys) {
    $existingSettings.$key = $cursorSettings[$key]
}

# Guardar configuración
$existingSettings | ConvertTo-Json -Depth 10 | Set-Content $cursorConfigPath

Write-Host "✅ Configuración de Cursor en español completada" -ForegroundColor Green

# Mostrar beneficios de Premium
Write-Host "`n💎 BENEFICIOS DE CURSOR PREMIUM PARA ALTAMEDICA:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$benefits = @(
    "🧠 AI Codebase Intelligence - Análisis completo de tu sistema médico",
    "🔍 Advanced Code Search - Búsqueda semántica en todo el codebase",
    "🛠️ Advanced Refactoring - Refactoring inteligente de APIs médicas",
    "🧪 Advanced Testing - Generación automática de tests médicos",
    "📚 Documentation Generation - Documentación automática en español",
    "🔒 Security Analysis - Auditoría automática de compliance HIPAA"
)

foreach ($benefit in $benefits) {
    Write-Host "  $benefit" -ForegroundColor White
}

Write-Host "`n🎯 CASOS DE USO ESPECÍFICOS:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$useCases = @(
    "📊 Análisis de arquitectura de APIs médicas",
    "🔐 Implementación de compliance HIPAA",
    "⚡ Optimización de performance de Firestore",
    "🧪 Generación de tests para datos PHI",
    "📋 Documentación automática de endpoints",
    "🚀 Refactoring de monorepo médico"
)

foreach ($useCase in $useCases) {
    Write-Host "  $useCase" -ForegroundColor White
}

Write-Host "`n💰 ROI ESTIMADO:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "  💰 Inversión: $20-30/mes" -ForegroundColor Yellow
Write-Host "  ⏱️  Tiempo ahorrado: 70% en desarrollo de APIs" -ForegroundColor Green
Write-Host "  🧪 Testing: 80% automatizado" -ForegroundColor Green
Write-Host "  📚 Documentación: 90% automática" -ForegroundColor Green
Write-Host "  🔒 Compliance: Auditoría automática HIPAA" -ForegroundColor Green

Write-Host "`n🚀 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "  1. Activar Cursor Premium" -ForegroundColor White
Write-Host "  2. Reiniciar Cursor para aplicar configuración" -ForegroundColor White
Write-Host "  3. Comenzar análisis del codebase médico" -ForegroundColor White
Write-Host "  4. Implementar mejoras automáticas" -ForegroundColor White

Write-Host "`n✅ Configuración completada. ¡Cursor está listo para AltaMedica!" -ForegroundColor Green
Write-Host "📖 Revisa el archivo CURSOR_PREMIUM_BENEFICIOS.md para más detalles" -ForegroundColor Yellow 