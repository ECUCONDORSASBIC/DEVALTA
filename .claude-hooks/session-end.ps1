# 🎯 SMART SESSION END
# Cierre inteligente de sesión con auto-optimización

Write-Host "🎯 Finalizando sesión con optimización automática..." -ForegroundColor Green

# Auto-cleanup de archivos temporales
Write-Host "🧹 Limpiando archivos temporales..." -ForegroundColor Yellow
Get-ChildItem -Path . -Recurse -Include "*.tmp", "*.temp", "*.log.*", "*.cache" -Force | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue

# Auto-commit de cambios si hay trabajo en progreso
if (git status --porcelain 2>$null) {
    Write-Host "💾 Auto-guardando progreso..." -ForegroundColor Cyan
    git add .
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "Auto-save: Session end $timestamp" 2>$null
    Write-Host "✅ Progreso guardado automáticamente" -ForegroundColor Green
}

# Reporte de productividad de la sesión
$fileChanges = (git diff --name-only HEAD~1 2>$null | Measure-Object).Count
if ($fileChanges -gt 0) {
    Write-Host "📊 Sesión productiva: $fileChanges archivos modificados" -ForegroundColor Green
} else {
    Write-Host "📊 Sesión de exploración completada" -ForegroundColor Yellow
}

# Optimizar para próxima sesión
Write-Host "⚡ Optimizando para próxima sesión..." -ForegroundColor Magenta
if (Test-Path "package.json") {
    pnpm install --frozen-lockfile --silent 2>$null
}

Write-Host "🚀 Sesión finalizada - Todo optimizado para continuar" -ForegroundColor Green
