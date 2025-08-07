#!/bin/bash
# � SMART NOTIFICATIONS
# Muestra solo notificaciones útiles, ignora spam

# Filtrar notificaciones útiles vs spam
if [[ "$NOTIFICATION_TEXT" =~ (completed|finished|ready|error|failed) ]]; then
    # Solo mostrar notificaciones importantes
    echo "📢 $NOTIFICATION_TEXT"
    
    # Auto-actions basadas en notificación
    if [[ "$NOTIFICATION_TEXT" =~ "build.*completed" ]]; then
        echo "🚀 Build completado - App lista para testing"
    fi
    
    if [[ "$NOTIFICATION_TEXT" =~ "error" ]]; then
        echo "🔍 Error detectado - Revisando logs..."
        # Auto-mostrar últimos errores
        tail -n 10 *.log 2>/dev/null | grep -i error | tail -3
    fi
else
    # Silenciar notificaciones irrelevantes
    echo >/dev/null
fi
