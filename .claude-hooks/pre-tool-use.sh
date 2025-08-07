#!/bin/bash
# � AUTO-FIX DE PROBLEMAS COMUNES
# Resuelve problemas antes de que fallen

# Auto-crear directorios que faltan
if [[ "$TOOL_NAME" == "create_file" ]]; then
    FILE_PATH=$(echo "$TOOL_ARGS" | grep -o '"filePath":"[^"]*"' | cut -d'"' -f4)
    if [[ -n "$FILE_PATH" ]]; then
        DIR_PATH=$(dirname "$FILE_PATH")
        if [[ ! -d "$DIR_PATH" ]]; then
            mkdir -p "$DIR_PATH"
            echo "� Auto-creado directorio: $DIR_PATH"
        fi
    fi
fi

# Auto-instalar dependencias si falta package
if [[ "$TOOL_ARGS" =~ (import|require).*[\'\"]\@?([a-zA-Z-]+) ]]; then
    PACKAGE=$(echo "$TOOL_ARGS" | grep -o "import.*['\"][^'\"]*['\"]" | head -1 | cut -d"'" -f2 | cut -d'"' -f2)
    if [[ -n "$PACKAGE" && "$PACKAGE" != "./"* && "$PACKAGE" != "../"* ]]; then
        if ! pnpm list "$PACKAGE" >/dev/null 2>&1; then
            echo "📦 Auto-instalando dependencia faltante: $PACKAGE"
            pnpm add "$PACKAGE"
        fi
    fi
fi
