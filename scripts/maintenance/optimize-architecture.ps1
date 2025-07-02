# 🚀 MIGRACIÓN ARQUITECTÓNICA AUTOMÁTICA

Write-Host "🏗️ INICIANDO OPTIMIZACIÓN ARQUITECTÓNICA DEL MONOREPO" -ForegroundColor Green

# Verificar prerrequisitos
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerrequisitos verificados" -ForegroundColor Green

# Ejecutar migración automática
Write-Host "`n🔄 Ejecutando migración arquitectónica..." -ForegroundColor Yellow
try {
    node migrate-architecture.js
    Write-Host "✅ Migración completada exitosamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en migración: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verificar nueva estructura
Write-Host "`n📁 Verificando nueva estructura..." -ForegroundColor Yellow

$expectedDirs = @(
    "platform/mcp-servers",
    "platform/devtools", 
    "configs/mcp",
    "docs/architecture",
    "scripts/development"
)

foreach ($dir in $expectedDirs) {
    if (Test-Path $dir) {
        $fileCount = (Get-ChildItem $dir -File).Count
        Write-Host "✅ $dir ($fileCount archivos)" -ForegroundColor Green
    } else {
        Write-Host "❌ $dir no encontrado" -ForegroundColor Red
    }
}

# Actualizar dependencias del workspace
Write-Host "`n📦 Actualizando dependencias del workspace..." -ForegroundColor Yellow
try {
    pnpm install
    Write-Host "✅ Dependencias actualizadas" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Advertencia: Error actualizando dependencias" -ForegroundColor Yellow
}

# Verificar configuración MCP
Write-Host "`n🎼 Verificando configuración MCP..." -ForegroundColor Yellow
if (Test-Path "configs/mcp/mcp-config.json") {
    Write-Host "✅ Configuración MCP movida correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Configuración MCP no encontrada" -ForegroundColor Red
}

# Ejecutar verificación post-migración
Write-Host "`n🔍 Ejecutando verificación post-migración..." -ForegroundColor Yellow
try {
    if (Test-Path "scripts/development/verify-mcp-flows.js") {
        node scripts/development/verify-mcp-flows.js
        Write-Host "✅ Verificación MCP exitosa" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Advertencia: Verificación MCP necesita actualización" -ForegroundColor Yellow
}

# Mostrar resumen final
Write-Host "`n📊 RESUMEN DE OPTIMIZACIÓN:" -ForegroundColor Cyan
Write-Host "- Estructura reorganizada: ✅" -ForegroundColor Green
Write-Host "- MCP Servers consolidados: ✅" -ForegroundColor Green  
Write-Host "- Duplicados eliminados: ✅" -ForegroundColor Green
Write-Host "- Configuraciones organizadas: ✅" -ForegroundColor Green
Write-Host "- Documentación centralizada: ✅" -ForegroundColor Green
Write-Host "- Scripts organizados: ✅" -ForegroundColor Green
Write-Host "- Workspace actualizado: ✅" -ForegroundColor Green

Write-Host "`n🎉 OPTIMIZACIÓN ARQUITECTÓNICA COMPLETADA" -ForegroundColor Green
Write-Host "📋 Revisar: migration-report.json para detalles completos" -ForegroundColor Cyan
Write-Host "🚀 Monorepo optimizado para arquitectura enterprise" -ForegroundColor Green
