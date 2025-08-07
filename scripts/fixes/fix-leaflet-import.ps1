# Script para eliminar imports problemáticos de leaflet en globals.css
$file = "apps\web-app\src\app\globals.css"
$content = Get-Content $file -Raw

# Buscar y reemplazar diferentes variaciones del import de leaflet
$patterns = @(
    "@import\s+['""]leaflet/dist/leaflet\.css['""];?",
    "@import\s+leaflet/dist/leaflet\.css;?",
    "@import\s*['""]leaflet/dist/leaflet\.css['""];?"
)

foreach ($pattern in $patterns) {
    $content = $content -replace $pattern, "/* Import de leaflet eliminado - se carga vía componente */"
}

# Guardar el archivo actualizado
$content | Set-Content $file -NoNewline

Write-Output "✅ Procesado: $file"
Write-Output "🔍 Verificando resultado..."

# Verificar si aún existen imports problemáticos
$remainingImports = Select-String -Path $file -Pattern "@import.*leaflet" -AllMatches
if ($remainingImports) {
    Write-Output "⚠️  Aún hay imports de leaflet:"
    $remainingImports
} else {
    Write-Output "✅ Todos los imports de leaflet han sido eliminados"
}
