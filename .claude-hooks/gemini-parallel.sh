#!/bin/bash
# 🧠 GEMINI PARALLEL AI CONSULTATION
# Consulta paralela a Gemini para obtener múltiples perspectivas

echo "🧠 Activando consulta paralela a Gemini AI..."

# Detectar si es una consulta que se beneficiaría de múltiples AI
USER_PROMPT="$1"

if [[ ${#USER_PROMPT} -gt 50 ]] && [[ "$USER_PROMPT" =~ (como|how|explain|code|implement|debug|fix|create|build) ]]; then
    echo "🤖 Consulta compleja detectada - Preparando consulta paralela a Gemini..."
    
    # Crear directorio para respuestas AI si no existe
    mkdir -p .ai-responses
    
    # Timestamp para esta consulta
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    
    # Guardar prompt del usuario
    echo "$USER_PROMPT" > ".ai-responses/prompt_$TIMESTAMP.txt"
    
    # Preparar consulta optimizada para Gemini
    GEMINI_PROMPT="Context: Medical software development with Next.js, TypeScript, React.
Question: $USER_PROMPT
Please provide: 1) Direct answer, 2) Code examples if applicable, 3) Best practices, 4) Potential issues to avoid."
    
    # Llamada a Gemini Code 2.5 Pro local via terminal
    if command -v gemini &> /dev/null; then
        echo "🚀 Enviando consulta a Gemini Code 2.5 Pro..."
        
        # Recopilar contexto del proyecto para Gemini
        PROJECT_CONTEXT=""
        
        # Agregar contexto de archivos relevantes
        if [[ -f "package.json" ]]; then
            PROJECT_CONTEXT+="\n=== PACKAGE.JSON ===\n$(head -20 package.json)"
        fi
        
        if [[ -f "README.md" ]]; then
            PROJECT_CONTEXT+="\n=== README ===\n$(head -15 README.md)"
        fi
        
        # Agregar estructura del proyecto
        PROJECT_CONTEXT+="\n=== PROJECT STRUCTURE ===\n$(find . -maxdepth 2 -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.py" | head -10)"
        
        # Crear prompt enriquecido para Gemini
        GEMINI_ENHANCED_PROMPT="Contexto del proyecto:
$PROJECT_CONTEXT

Pregunta del usuario: $USER_PROMPT

Por favor, proporciona una respuesta detallada considerando:
1. El contexto completo del proyecto médico AltaMedica
2. Best practices para desarrollo con Next.js/TypeScript
3. Integración con sistemas médicos y compliance
4. Código optimizado y escalable
5. Consideraciones de seguridad médica"
        
        # Ejecutar Gemini en background
        (
            echo "🧠 Ejecutando Gemini Code 2.5 Pro con contexto expandido..." > ".ai-responses/gemini_$TIMESTAMP.txt"
            echo "Timestamp: $(date)" >> ".ai-responses/gemini_$TIMESTAMP.txt"
            echo "Context: Proyecto médico AltaMedica" >> ".ai-responses/gemini_$TIMESTAMP.txt"
            echo "=================================" >> ".ai-responses/gemini_$TIMESTAMP.txt"
            
            # Ejecutar Gemini Code directamente
            echo "$GEMINI_ENHANCED_PROMPT" | gemini >> ".ai-responses/gemini_$TIMESTAMP.txt" 2>&1
            
            echo "=================================" >> ".ai-responses/gemini_$TIMESTAMP.txt"
            echo "✅ Respuesta Gemini completada: $(date)" >> ".ai-responses/gemini_$TIMESTAMP.txt"
        ) &
        
        echo "📡 Consulta enviada a Gemini en paralelo - Respuesta estará en .ai-responses/"
    fi
    
    # Limpiar respuestas antiguas (mantener solo las últimas 10)
    ls -t .ai-responses/gemini_*.txt 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null
    
    echo "✅ Sistema de AI paralelo activado"
fi
