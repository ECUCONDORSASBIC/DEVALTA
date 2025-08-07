#!/bin/bash
# 🚀 HOOK PARA RESOLVER PROBLEMAS DE DESARROLLO
# Se ejecuta cuando el usuario envía un prompt

# Detectar si es un error de desarrollo y auto-solucionarlo
if [[ "$USER_PROMPT" =~ (error|failed|not found|cannot find|missing) ]]; then
    echo "🔧 Detectado posible problema de desarrollo..."
    
    # Problemas comunes y sus soluciones
    if [[ "$USER_PROMPT" =~ "module.*not found" ]]; then
        echo "📦 Problema de dependencia detectado - Verificando packages..."
        if [[ ! -d "node_modules" ]]; then
            echo "🔄 Instalando dependencias..."
            pnpm install >/dev/null 2>&1 &
        fi
    fi
    
    if [[ "$USER_PROMPT" =~ "port.*already.*use" ]]; then
        echo "🔌 Puerto ocupado detectado - Liberando puertos..."
        # Matar procesos de desarrollo en puertos comunes
        lsof -ti:3000,3001,3002,3003 | xargs kill -9 2>/dev/null
    fi
    
    if [[ "$USER_PROMPT" =~ "build.*fail" ]]; then
        echo "🏗️ Error de build detectado - Limpiando cache..."
        rm -rf .next dist out build 2>/dev/null
        pnpm run build >/dev/null 2>&1 &
    fi
fi

# Auto-suggestions basadas en el prompt
if [[ "$USER_PROMPT" =~ "create.*component" ]]; then
    echo "💡 Tip: ¿Quieres que cree un componente TypeScript + Tailwind?"
fi

if [[ "$USER_PROMPT" =~ "fix.*bug" ]]; then
    echo "🐛 Tip: ¿Necesitas que revise los logs de error?"
fi
