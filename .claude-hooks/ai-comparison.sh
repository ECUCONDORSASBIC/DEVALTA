#!/bin/bash
# 🧠 AI RESPONSE COMPARISON  
# Compara respuestas de Claude vs Gemini Code 2.5 Pro

echo "🧠 Comparando respuestas Claude vs Gemini Code 2.5 Pro..."

# Buscar respuestas recientes de Gemini (incluyendo las expandidas)
if [[ -d ".ai-responses" ]]; then
    latest_gemini=$(ls -t .ai-responses/gemini_*.txt 2>/dev/null | head -1)
    latest_expanded=$(ls -t .ai-responses/gemini_expanded_*.txt 2>/dev/null | head -1)
    
    echo "📊 Análisis de respuestas AI disponibles:"
    echo "🔵 Claude: Respuesta principal (conversación actual)"
    
    if [[ -n "$latest_expanded" ]]; then
        echo "🟠 Gemini 2.5 Pro (Contexto Expandido): $(basename "$latest_expanded")"
        
        # Mostrar extract de la respuesta expandida de Gemini
        echo ""
        echo "🟠 Extract de Gemini Code 2.5 Pro (Contexto Expandido):"
        echo "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓"
        
        # Extraer sección de respuesta (después de los headers)
        sed -n '/============================================================/,/============================================================/p' "$latest_expanded" | 
        sed '1d;$d' | head -15
        echo "▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓"
        echo ""
        
        # Análisis del tamaño de respuesta
        expanded_size=$(wc -l < "$latest_expanded")
        echo "📈 Gemini 2.5 Pro (Expandido): $expanded_size líneas con contexto completo"
        
        # Crear comparación detallada
        comparison_file=".ai-responses/comparison_detailed_$(date +%Y%m%d_%H%M%S).md"
        cat > "$comparison_file" << EOF
# Comparación Detallada: Claude vs Gemini Code 2.5 Pro

## 🔵 Claude (Conversación Principal)
- **Fortalezas**: Respuesta conversacional, contextualmente relevante
- **Contexto**: Conversación en curso
- **Estilo**: Interactivo y adaptativo

## 🟠 Gemini Code 2.5 Pro (Contexto Expandido)  
- **Archivo**: $latest_expanded
- **Tamaño**: $expanded_size líneas
- **Contexto**: Proyecto completo AltaMedica incluido
- **Fortalezas**: Mayor ventana de contexto, análisis profundo del codebase

## 📊 Análisis Comparativo

### Ventajas de Claude:
- Respuesta inmediata en conversación
- Adaptación al flujo de trabajo actual
- Interacción directa con herramientas VS Code

### Ventajas de Gemini 2.5 Pro:
- Contexto masivo del proyecto completo
- Análisis profundo de arquitectura
- Consideración de todo el codebase
- Soluciones más integradas al proyecto existente

## 💡 Recomendación de Uso

1. **Para consultas rápidas**: Usar Claude (conversación principal)
2. **Para arquitectura/diseño**: Revisar respuesta Gemini expandida
3. **Para implementación**: Combinar insights de ambos AI
4. **Para debugging complejo**: Aprovechar contexto expandido de Gemini

## 🔄 Próximos Pasos
- [ ] Revisar respuesta completa de Gemini: $latest_expanded
- [ ] Combinar mejores prácticas de ambas respuestas
- [ ] Implementar solución híbrida si es aplicable

EOF
        
        echo "📝 Comparación detallada creada: $comparison_file"
        
    elif [[ -n "$latest_gemini" ]]; then
        echo "� Gemini Code: $(basename "$latest_gemini")"
        
        # Mostrar extract de respuesta estándar
        echo ""
        echo "🟠 Extract de Gemini Code:"
        head -n 10 "$latest_gemini" | tail -n +3
        echo ""
        
        gemini_size=$(wc -l < "$latest_gemini")
        echo "📈 Gemini Code: $gemini_size líneas"
    fi
    
    # Verificar si Gemini Code está disponible para futuras consultas
    if command -v gemini &> /dev/null; then
        echo "✅ Gemini Code 2.5 Pro disponible para consultas con contexto expandido"
    else
        echo "⚠️ Gemini Code no detectado en PATH"
        echo "💡 Instala Gemini Code 2.5 Pro para aprovechar contexto expandido"
    fi
    
    # Estadísticas de uso
    total_gemini_responses=$(ls .ai-responses/gemini_*.txt 2>/dev/null | wc -l)
    expanded_responses=$(ls .ai-responses/gemini_expanded_*.txt 2>/dev/null | wc -l)
    
    echo ""
    echo "📊 Estadísticas de uso AI:"
    echo "  - Respuestas Gemini estándar: $total_gemini_responses"
    echo "  - Respuestas Gemini expandidas: $expanded_responses"
    
    # Cleanup de archivos antiguos (mantener últimos 5)
    ls -t .ai-responses/comparison_*.md 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null
    ls -t .ai-responses/gemini_*.txt 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null
    
    echo "💡 Tip: Usa ambas respuestas para obtener la mejor solución posible"
fi
