# 🚀 ALTAMEDICA WARP INTEGRATION
# Configuración para Warp Terminal

# Función principal para Altamedica en Warp
function altamedica() {
    local workspace="C:\\Users\\Eduardo\\Documents\\devaltamedica"
    
    # Banner para Warp
    echo "🚀 Altamedica CLI - Warp Terminal"
    
    # Verificar workspace
    if [[ ! -d "$workspace" ]]; then
        echo "❌ Workspace no encontrado: $workspace"
        return 1
    fi
    
    # Cambiar al workspace
    cd "$workspace"
    
    # Establecer contexto de Warp
    export WARP_CONTEXT="true"
    export TERM_PROGRAM="WarpTerminal"
    
    # Si no hay argumentos, mostrar ayuda
    if [[ $# -eq 0 ]]; then
        echo ""
        echo "🏥 COMANDOS ALTAMEDICA DISPONIBLES:"
        echo ""
        echo "🚀 BÁSICOS:"
        echo "  altamedica start      - Iniciar servidor MCP Enhanced Multi-Agent"
        echo "  altamedica stop       - Detener servidor MCP"
        echo "  altamedica restart    - Reiniciar servidor MCP"
        echo "  altamedica status     - Estado del sistema y agentes"
        echo ""
        echo "🤖 AGENTES:"
        echo "  altamedica agents     - Listar 17 agentes médicos especializados"
        echo "  altamedica negotiate  - Iniciar negociación entre agentes"
        echo ""
        echo "🎼 COMPOSICIÓN:"
        echo "  altamedica compose [nombre]  - Crear aplicación médica"
        echo ""
        echo "🧠 INTELIGENCIA:"
        echo "  altamedica intel      - Reporte de inteligencia del sistema"
        echo "  altamedica health     - Verificar salud del sistema médico"
        echo "  altamedica performance - Análisis cognitivo de agentes"
        echo ""
        echo "📊 MONITOREO:"
        echo "  altamedica logs       - Ver logs del sistema"
        echo "  altamedica config     - Ver configuración"
        echo "  altamedica version    - Información del sistema"
        echo ""
        echo "💡 EJEMPLO DE USO:"
        echo "  altamedica start && altamedica agents"
        echo ""
        return 0
    fi
    
    # Ejecutar comando con feedback visual de Warp
    echo "⚡ Ejecutando: altamedica $*"
    echo "📍 Workspace: $workspace"
    echo ""
    
    # Ejecutar usando el bridge
    node altamedica-bridge.js "$@"
    local exit_code=$?
    
    # Feedback de resultado
    if [[ $exit_code -eq 0 ]]; then
        echo ""
        echo "✅ Comando completado exitosamente"
    else
        echo ""
        echo "❌ Comando falló con código $exit_code"
    fi
    
    # Limpiar variables
    unset WARP_CONTEXT
    unset TERM_PROGRAM
    
    return $exit_code
}

# Alias específicos para Warp
alias m="altamedica"
alias altamed="altamedica"
alias am="altamedica"

# Funciones de conveniencia para Warp
function altamedica-start() {
    altamedica start
}

function altamedica-agents() {
    altamedica agents
}

function altamedica-status() {
    altamedica status
}

function altamedica-compose() {
    if [[ $# -eq 0 ]]; then
        echo "💡 Uso: altamedica-compose <nombre-de-aplicacion>"
        echo "Ejemplo: altamedica-compose \"Portal de Pacientes\""
        return 1
    fi
    altamedica compose "$1"
}

# Autocompletado para Warp
function _altamedica_completions() {
    local commands=(
        "start" "stop" "restart" "status" "agents" "compose" 
        "intel" "logs" "health" "performance" "config" "version" 
        "help" "negotiate" "alert" "backup" "env"
    )
    
    local current_word="${COMP_WORDS[COMP_CWORD]}"
    local suggestions=($(compgen -W "${commands[*]}" -- "$current_word"))
    
    COMPREPLY=("${suggestions[@]}")
}

# Registrar autocompletado
complete -F _altamedica_completions altamedica
complete -F _altamedica_completions m
complete -F _altamedica_completions altamed
complete -F _altamedica_completions am

# Función de bienvenida para Warp
function altamedica-welcome() {
    echo "🚀 Bienvenido a Altamedica CLI en Warp Terminal"
    echo ""
    echo "🏥 Sistema médico inteligente con 17 agentes especializados"
    echo "🎼 Enhanced Multi-Agent Composer integrado"
    echo "🧠 Inteligencia artificial médica avanzada"
    echo ""
    echo "💡 Comando principal: altamedica o simplemente: m"
    echo "📚 Ayuda completa: altamedica help"
    echo ""
    echo "🎯 Estado rápido:"
    altamedica status
}

# Banner de inicio
echo "✅ Altamedica CLI cargado para Warp Terminal"
echo "🚀 Funciones disponibles: altamedica, m, altamed, am"
echo "💡 Ejecuta 'altamedica-welcome' para ver introducción completa"
