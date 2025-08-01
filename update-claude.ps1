# Script para actualizar Claude Code
Write-Host "Actualizando Claude Code..." -ForegroundColor Yellow

# Intentar con pnpm primero
try {
    Write-Host "Intentando con pnpm..." -ForegroundColor Cyan
    pnpm update -g @anthropic-ai/claude-code
    Write-Host "Claude Code actualizado exitosamente con pnpm!" -ForegroundColor Green
} catch {
    Write-Host "pnpm no disponible, intentando con npm..." -ForegroundColor Yellow
    try {
        npm update -g @anthropic-ai/claude-code
        Write-Host "Claude Code actualizado exitosamente con npm!" -ForegroundColor Green
    } catch {
        Write-Host "Error al actualizar Claude Code: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Actualización completada." -ForegroundColor Green