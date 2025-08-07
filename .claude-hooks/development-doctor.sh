#!/bin/bash
# 🎯 DEVELOPMENT PROBLEM SOLVER
# Detecta y soluciona problemas comunes de desarrollo automáticamente

echo "🎯 Auto-detectando y solucionando problemas de desarrollo..."

# Detectar problemas comunes en el workspace
problems_found=0

# 1. Verificar dependencias faltantes
if [[ -f "package.json" ]] && [[ ! -d "node_modules" ]]; then
    echo "📦 Problema detectado: Dependencias faltantes"
    echo "🔧 Auto-solucionando: Instalando dependencias..."
    pnpm install --no-frozen-lockfile
    problems_found=$((problems_found + 1))
fi

# 2. Detectar archivos duplicados
duplicates=$(find . -name "*.backup" -o -name "*.copy" -o -name "*_backup.*" -o -name "*_copy.*" | head -5)
if [[ -n "$duplicates" ]]; then
    echo "🗂️ Problema detectado: Archivos duplicados encontrados"
    echo "🔧 Auto-solucionando: Limpiando duplicados..."
    find . -name "*.backup" -o -name "*.copy" -o -name "*_backup.*" -o -name "*_copy.*" | xargs rm -f
    problems_found=$((problems_found + 1))
fi

# 3. Detectar puertos ocupados (desarrollo)
if lsof -i:3000 >/dev/null 2>&1; then
    echo "🔌 Problema detectado: Puerto 3000 ocupado"
    echo "🔧 Auto-solucionando: Liberando puerto..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    problems_found=$((problems_found + 1))
fi

# 4. Detectar problemas de formato en código
if [[ -f "eslint.config.js" ]]; then
    unformatted=$(npx eslint . --fix-dry-run 2>/dev/null | wc -l)
    if [[ $unformatted -gt 0 ]]; then
        echo "🎨 Problema detectado: Código sin formatear"
        echo "🔧 Auto-solucionando: Formateando código..."
        npx eslint . --fix >/dev/null 2>&1
        problems_found=$((problems_found + 1))
    fi
fi

# 5. Detectar problemas de permisos
unexecutable=$(find . -name "*.sh" ! -executable -type f | head -3)
if [[ -n "$unexecutable" ]]; then
    echo "🔐 Problema detectado: Scripts sin permisos de ejecución"
    echo "🔧 Auto-solucionando: Corrigiendo permisos..."
    find . -name "*.sh" -type f -exec chmod +x {} \;
    problems_found=$((problems_found + 1))
fi

# Reporte final
if [[ $problems_found -eq 0 ]]; then
    echo "✅ Workspace en perfecto estado - No se encontraron problemas"
else
    echo "🚀 $problems_found problemas detectados y solucionados automáticamente"
fi

echo "💡 Desarrollo optimizado - Listo para programar sin fricciones"
