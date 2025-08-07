#!/bin/bash
# 🧠 GEMINI CONTEXT MAXIMIZER
# Aprovecha la ventana de contexto expandida de Gemini Code 2.5 Pro

echo "🧠 Maximizando contexto para Gemini Code 2.5 Pro..."

USER_PROMPT="$1"

# Solo para consultas complejas que se beneficien del contexto expandido
if [[ ${#USER_PROMPT} -gt 100 ]] && [[ "$USER_PROMPT" =~ (implement|create|build|design|architecture|complex|system|integrate) ]]; then
    
    echo "🎯 Consulta compleja detectada - Preparando contexto expandido..."
    
    # Crear directorio para contexto expandido
    mkdir -p .ai-responses/context
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    
    # RECOPILAR CONTEXTO MASIVO para Gemini
    CONTEXT_FILE=".ai-responses/context/full_context_$TIMESTAMP.txt"
    
    echo "=== CONTEXTO COMPLETO DEL PROYECTO ALTAMEDICA ===" > "$CONTEXT_FILE"
    echo "Timestamp: $(date)" >> "$CONTEXT_FILE"
    echo "Consulta: $USER_PROMPT" >> "$CONTEXT_FILE"
    echo "" >> "$CONTEXT_FILE"
    
    # 1. Estructura completa del proyecto
    echo "=== ESTRUCTURA DEL PROYECTO ===" >> "$CONTEXT_FILE"
    find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.py" -o -name "*.json" | head -50 >> "$CONTEXT_FILE"
    echo "" >> "$CONTEXT_FILE"
    
    # 2. Configuraciones importantes
    echo "=== CONFIGURACIONES ===" >> "$CONTEXT_FILE"
    if [[ -f "package.json" ]]; then
        echo "--- package.json ---" >> "$CONTEXT_FILE"
        cat package.json >> "$CONTEXT_FILE"
        echo "" >> "$CONTEXT_FILE"
    fi
    
    if [[ -f "tsconfig.json" ]]; then
        echo "--- tsconfig.json ---" >> "$CONTEXT_FILE"
        cat tsconfig.json >> "$CONTEXT_FILE"
        echo "" >> "$CONTEXT_FILE"
    fi
    
    if [[ -f "next.config.js" ]]; then
        echo "--- next.config.js ---" >> "$CONTEXT_FILE"
        cat next.config.js >> "$CONTEXT_FILE"
        echo "" >> "$CONTEXT_FILE"
    fi
    
    # 3. Archivos de tipos y interfaces
    echo "=== TIPOS Y INTERFACES ===" >> "$CONTEXT_FILE"
    find . -name "*.d.ts" -o -name "*types*" -o -name "*interface*" | while read file; do
        if [[ -f "$file" ]]; then
            echo "--- $file ---" >> "$CONTEXT_FILE"
            head -50 "$file" >> "$CONTEXT_FILE"
            echo "" >> "$CONTEXT_FILE"
        fi
    done
    
    # 4. Componentes principales (limitado para no sobrecargar)
    echo "=== COMPONENTES PRINCIPALES ===" >> "$CONTEXT_FILE"
    find apps/ -name "*.tsx" -o -name "*.ts" | head -20 | while read file; do
        if [[ -f "$file" ]]; then
            echo "--- $file ---" >> "$CONTEXT_FILE"
            head -30 "$file" >> "$CONTEXT_FILE"
            echo "" >> "$CONTEXT_FILE"
        fi
    done
    
    # 5. README y documentación
    echo "=== DOCUMENTACIÓN ===" >> "$CONTEXT_FILE"
    if [[ -f "README.md" ]]; then
        echo "--- README.md ---" >> "$CONTEXT_FILE"
        cat README.md >> "$CONTEXT_FILE"
        echo "" >> "$CONTEXT_FILE"
    fi
    
    # 6. Variables de entorno de ejemplo
    if [[ -f "env.example" ]]; then
        echo "--- env.example ---" >> "$CONTEXT_FILE"
        cat env.example >> "$CONTEXT_FILE"
        echo "" >> "$CONTEXT_FILE"
    fi
    
    # Preparar prompt optimizado para Gemini Code 2.5 Pro
    GEMINI_MEGA_PROMPT="Actúa como un experto desarrollador senior especializado en aplicaciones médicas con Next.js, TypeScript y React.

CONTEXTO COMPLETO DEL PROYECTO:
$(cat "$CONTEXT_FILE")

CONSULTA DEL USUARIO: $USER_PROMPT

INSTRUCCIONES PARA RESPUESTA:
1. Analiza COMPLETAMENTE el contexto del proyecto AltaMedica
2. Proporciona soluciones específicas que se integren perfectamente con el código existente
3. Considera la arquitectura de monorepo con pnpm
4. Asegúrate de que las soluciones cumplan con estándares médicos
5. Incluye código completo y funcional, no solo fragmentos
6. Menciona cualquier dependencia adicional requerida
7. Proporciona consideraciones de seguridad médica si aplica
8. Sugiere testing apropiado para la funcionalidad

Por favor, proporciona una respuesta detallada y completa aprovechando toda la información de contexto disponible."
    
    # Ejecutar Gemini Code 2.5 Pro con contexto masivo
    if command -v gemini &> /dev/null; then
        echo "🚀 Ejecutando Gemini Code 2.5 Pro con contexto MASIVO..."
        
        GEMINI_OUTPUT=".ai-responses/gemini_expanded_$TIMESTAMP.txt"
        
        (
            echo "🧠 GEMINI CODE 2.5 PRO - RESPUESTA CON CONTEXTO EXPANDIDO" > "$GEMINI_OUTPUT"
            echo "============================================================" >> "$GEMINI_OUTPUT"
            echo "Consulta: $USER_PROMPT" >> "$GEMINI_OUTPUT"
            echo "Contexto: Proyecto completo AltaMedica incluido" >> "$GEMINI_OUTPUT"
            echo "Timestamp: $(date)" >> "$GEMINI_OUTPUT"
            echo "============================================================" >> "$GEMINI_OUTPUT"
            echo "" >> "$GEMINI_OUTPUT"
            
            # Ejecutar Gemini con el prompt masivo
            echo "$GEMINI_MEGA_PROMPT" | gemini >> "$GEMINI_OUTPUT" 2>&1
            
            echo "" >> "$GEMINI_OUTPUT"
            echo "============================================================" >> "$GEMINI_OUTPUT"
            echo "✅ Gemini Code 2.5 Pro completado: $(date)" >> "$GEMINI_OUTPUT"
            echo "📊 Ventana de contexto expandida utilizada" >> "$GEMINI_OUTPUT"
        ) &
        
        echo "📡 Gemini Code 2.5 Pro ejecutándose con contexto masivo..."
        echo "📄 Contexto completo: $CONTEXT_FILE"
        echo "📝 Respuesta expandida estará en: $GEMINI_OUTPUT"
    else
        echo "⚠️ Comando 'gemini' no encontrado. Instala Gemini Code 2.5 Pro"
        echo "💡 Verifica que Gemini Code esté en tu PATH"
    fi
    
    echo "✅ Sistema de contexto expandido activado"
fi
