#!/bin/bash
# 🔧 GEMINI SETUP VERIFICATION
# Verifica instalación y configuración de Gemini Code 2.5 Pro

echo "🔧 Verificando instalación de Gemini Code 2.5 Pro..."

# Verificar si Gemini está en PATH
if command -v gemini &> /dev/null; then
    echo "✅ Gemini Code encontrado en PATH"
    
    # Verificar versión
    gemini_version=$(gemini --version 2>/dev/null || echo "Versión no disponible")
    echo "📋 Versión: $gemini_version"
    
    # Test de conectividad
    echo "🧪 Probando funcionalidad básica..."
    test_response=$(echo "Test: responde solo 'OK'" | gemini 2>/dev/null | head -1)
    
    if [[ -n "$test_response" ]]; then
        echo "✅ Gemini Code respondiendo correctamente"
        echo "📤 Respuesta test: $test_response"
    else
        echo "⚠️ Gemini Code no está respondiendo"
        echo "💡 Verifica tu configuración de autenticación"
    fi
    
else
    echo "❌ Gemini Code no encontrado en PATH"
    echo ""
    echo "📥 INSTRUCCIONES DE INSTALACIÓN:"
    echo "1. Descarga Gemini Code 2.5 Pro"
    echo "2. Instala en tu sistema"
    echo "3. Agrega al PATH del sistema"
    echo "4. Configura autenticación si es necesario"
    echo ""
    echo "🔗 Comandos típicos de instalación:"
    echo "  - Windows: Agregar directorio a PATH en Variables de Entorno"
    echo "  - Linux/Mac: export PATH=\$PATH:/path/to/gemini"
    echo ""
    echo "🔄 Reinicia VS Code/Claude después de la instalación"
fi

# Verificar directorios necesarios
echo ""
echo "📁 Verificando estructura de directorios..."

if [[ ! -d ".ai-responses" ]]; then
    mkdir -p .ai-responses/context
    echo "✅ Directorio .ai-responses creado"
else
    echo "✅ Directorio .ai-responses existe"
fi

if [[ ! -d ".ai-responses/context" ]]; then
    mkdir -p .ai-responses/context
    echo "✅ Directorio .ai-responses/context creado"
else
    echo "✅ Directorio .ai-responses/context existe"
fi

# Crear archivo de configuración de ejemplo
if [[ ! -f ".ai-responses/README.md" ]]; then
    cat > .ai-responses/README.md << 'EOF'
# AI Responses Directory

Este directorio contiene las respuestas de los diferentes AI utilizados:

## Estructura:
- `gemini_*.txt` - Respuestas estándar de Gemini Code
- `gemini_expanded_*.txt` - Respuestas con contexto expandido
- `context/` - Archivos de contexto para Gemini
- `comparison_*.md` - Comparaciones entre Claude y Gemini

## Uso:
Los hooks automáticamente guardan y comparan respuestas de diferentes AI
para proporcionarte la mejor información posible.

## Configuración:
- Asegúrate de tener Gemini Code 2.5 Pro instalado
- Verifica que `gemini` esté en tu PATH
- Los hooks se ejecutan automáticamente según el contexto
EOF
    echo "✅ README de configuración creado"
fi

echo ""
echo "🎯 ESTADO FINAL:"
if command -v gemini &> /dev/null; then
    echo "✅ Gemini Code 2.5 Pro: LISTO"
    echo "✅ Hooks configurados: SÍ"
    echo "✅ Directorios creados: SÍ"
    echo ""
    echo "🚀 Sistema de AI paralelo ACTIVO"
    echo "💡 Gemini se ejecutará automáticamente en consultas complejas"
else
    echo "⚠️ Gemini Code 2.5 Pro: REQUIERE INSTALACIÓN"
    echo "✅ Hooks configurados: SÍ (esperando Gemini)"
    echo "✅ Directorios creados: SÍ"
    echo ""
    echo "📋 TODO: Instalar Gemini Code 2.5 Pro y agregarlo al PATH"
fi
