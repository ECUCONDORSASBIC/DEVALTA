#!/bin/bash
# 🔧 AUTO-FIX ERRORS
# Soluciona errores comunes automáticamente

ERROR_MSG="$1"
echo "🔧 Auto-solucionando error: $ERROR_MSG"

# Auto-fix errores comunes de desarrollo
if [[ "$ERROR_MSG" =~ "permission denied" ]]; then
    echo "🛠️ Corrigiendo permisos..."
    chmod +x *.sh *.py *.js 2>/dev/null
    echo "✅ Permisos corregidos"
fi

if [[ "$ERROR_MSG" =~ "module not found" ]] || [[ "$ERROR_MSG" =~ "cannot find module" ]]; then
    echo "📦 Auto-instalando dependencias faltantes..."
    if [[ -f "package.json" ]]; then
        pnpm install --no-frozen-lockfile
    fi
    if [[ -f "requirements.txt" ]]; then
        pip install -r requirements.txt
    fi
    echo "✅ Dependencias instaladas"
fi

if [[ "$ERROR_MSG" =~ "port.*already in use" ]]; then
    echo "🔄 Puerto ocupado - liberando..."
    # Extraer número de puerto del error
    PORT=$(echo "$ERROR_MSG" | grep -o '[0-9]\{4,5\}' | head -1)
    if [[ -n "$PORT" ]]; then
        lsof -ti:$PORT | xargs kill -9 2>/dev/null
        echo "✅ Puerto $PORT liberado"
    fi
fi

if [[ "$ERROR_MSG" =~ "enoent" ]] || [[ "$ERROR_MSG" =~ "no such file" ]]; then
    echo "📁 Creando directorios faltantes..."
    mkdir -p node_modules .next dist build out coverage
    echo "✅ Directorios creados"
fi

echo "🚀 Error procesado - continuando desarrollo..."
