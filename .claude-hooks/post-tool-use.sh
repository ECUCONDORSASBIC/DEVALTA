#!/bin/bash
# 🧹 AUTO-CLEANUP Y OPTIMIZACIÓN
# Limpia y optimiza después de cada acción

# Eliminar archivos duplicados automáticamente
if [[ "$TOOL_NAME" == "create_file" ]]; then
    find . -name "*.backup" -type f -mtime +1 -delete 2>/dev/null
    find . -name "*.tmp" -type f -delete 2>/dev/null
    find . -name "*-copy.*" -type f -mtime +1 -delete 2>/dev/null
    
    # Auto-format archivos TypeScript/JavaScript recién creados
    FILE_PATH=$(echo "$TOOL_ARGS" | grep -o '"filePath":"[^"]*"' | cut -d'"' -f4)
    if [[ "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]]; then
        if command -v prettier >/dev/null 2>&1; then
            prettier --write "$FILE_PATH" 2>/dev/null
            echo "✨ Auto-formateado: $FILE_PATH"
        fi
    fi
fi

# Auto-restart de servidor si se modifican archivos críticos
if [[ "$TOOL_NAME" == "replace_string_in_file" ]]; then
    FILE_PATH=$(echo "$TOOL_ARGS" | grep -o '"filePath":"[^"]*"' | cut -d'"' -f4)
    if [[ "$FILE_PATH" =~ (page\.tsx|layout\.tsx|api.*\.ts)$ ]]; then
        # Tocar archivo para trigger hot reload
        touch "$FILE_PATH"
        echo "🔄 Hot reload activado para: $FILE_PATH"
    fi
fi

# Limpiar node_modules duplicados en apps
if [[ "$TOOL_NAME" == "run_in_terminal" && "$TOOL_ARGS" =~ "install" ]]; then
    # Eliminar node_modules duplicados en subdirectorios
    find ./apps -name "node_modules" -type d -path "*/node_modules/*/node_modules" -exec rm -rf {} + 2>/dev/null
    echo "🧹 Limpiados node_modules duplicados"
fi
