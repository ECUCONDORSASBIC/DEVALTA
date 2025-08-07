#!/bin/bash
# 📊 PERFORMANCE MONITOR
# Monitorea y optimiza el rendimiento del desarrollo

echo "📊 Monitoreando rendimiento del desarrollo..."

# Detectar comandos que pueden ser lentos
if [[ "$TOOL_NAME" =~ (install|build|test|compile) ]]; then
    start_time=$(date +%s)
    echo "⏱️ Iniciando monitoreo de rendimiento para: $TOOL_NAME"
    
    # Crear archivo de monitoreo
    echo "$(date): $TOOL_NAME started" >> .performance-log
fi

# Monitorear uso de recursos si hay procesos intensivos
if pgrep -f "node\|python\|docker" > /dev/null; then
    # Verificar RAM usage
    if command -v free &> /dev/null; then
        mem_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100}')
        if (( $(echo "$mem_usage > 80" | bc -l) )); then
            echo "⚠️ Alto uso de RAM detectado: ${mem_usage}%"
            echo "💡 Sugerencia: Cerrar aplicaciones innecesarias"
        fi
    fi
    
    # Verificar CPU usage
    if command -v top &> /dev/null; then
        cpu_intensive=$(ps aux --sort=-%cpu | head -5 | grep -E "(node|python|docker)" | wc -l)
        if [[ $cpu_intensive -gt 2 ]]; then
            echo "🔥 Múltiples procesos intensivos detectados"
            echo "💡 Sugerencia: Considerar ejecutar tareas secuencialmente"
        fi
    fi
fi

# Auto-optimización de cache
if [[ -d "node_modules/.cache" ]]; then
    cache_size=$(du -sh node_modules/.cache 2>/dev/null | cut -f1)
    echo "💾 Cache de Node.js: $cache_size"
    
    # Limpiar cache si es muy grande
    if [[ $(du -s node_modules/.cache 2>/dev/null | cut -f1) -gt 1000000 ]]; then
        echo "🧹 Limpiando cache grande de Node.js..."
        rm -rf node_modules/.cache/*
        echo "✅ Cache optimizada"
    fi
fi

# Reporte de archivos grandes que pueden afectar rendimiento
large_files=$(find . -size +10M -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | head -3)
if [[ -n "$large_files" ]]; then
    echo "📁 Archivos grandes detectados:"
    echo "$large_files" | while read file; do
        size=$(du -sh "$file" | cut -f1)
        echo "  - $file ($size)"
    done
    echo "💡 Considerar optimizar o mover a .gitignore"
fi

echo "✅ Monitoreo de rendimiento completado"
