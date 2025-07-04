# 🎯 ALTAMEDICA CLI INTEGRATION
# Para uso en Cursor IDE

# Función para ejecutar comandos Altamedica desde Cursor
function altamedica() {
    local workspace="C:\\Users\\Eduardo\\Documents\\devaltamedica"
    
    # Cambiar al workspace
    cd "$workspace" 2>/dev/null || {
        echo "❌ Error: No se puede acceder al workspace Altamedica"
        echo "📁 Esperado: $workspace"
        return 1
    }
    
    # Establecer contexto de Cursor
    export CURSOR_CONTEXT="true"
    export VSCODE_CONTEXT="cursor"
    
    # Ejecutar comando usando el bridge
    if [ "$#" -eq 0 ]; then
        echo "🏥 Altamedica CLI - Cursor Integration"
        echo "Uso: altamedica <comando> [argumentos]"
        echo ""
        echo "Comandos disponibles:"
        echo "  start     - Iniciar servidor MCP"
        echo "  agents    - Listar agentes médicos"
        echo "  status    - Estado del sistema"
        echo "  compose   - Crear aplicación médica"
        echo "  logs      - Ver logs del sistema"
        echo ""
        echo "Ejemplo: altamedica start"
        return 0
    fi
    
    echo "🎯 Ejecutando desde Cursor: altamedica $*"
    node altamedica-bridge.js "$@"
    
    # Limpiar variables de entorno
    unset CURSOR_CONTEXT
    unset VSCODE_CONTEXT
}

# Alias para facilidad de uso
alias m="altamedica"
alias altamed="altamedica"

# Función de autocompletado
_altamedica_complete() {
    local commands="start stop restart status agents compose intel logs health performance config version help negotiate alert backup env"
    COMPREPLY=($(compgen -W "$commands" -- "${COMP_WORDS[1]}"))
}

# Registrar autocompletado
complete -F _altamedica_complete altamedica
complete -F _altamedica_complete m

echo "✅ Altamedica CLI cargado para Cursor"
echo "💡 Uso: altamedica <comando> o simplemente: m <comando>"
