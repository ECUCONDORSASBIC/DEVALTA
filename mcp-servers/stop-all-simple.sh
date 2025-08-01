#!/bin/bash
# Script para detener todos los servidores MCP de AltaMedica

echo "🛑 Deteniendo servidores MCP de AltaMedica..."

# Función para detener un servidor
stop_server() {
    local name=$1
    local script_pattern=$2
    
    echo "🔍 Buscando procesos de $name..."
    
    # Buscar por patrón del script
    local pids=$(pgrep -f "$script_pattern" 2>/dev/null || true)
    
    if [ -n "$pids" ]; then
        echo "🛑 Deteniendo $name (PIDs: $pids)..."
        kill $pids 2>/dev/null || true
        
        # Esperar un momento
        sleep 2
        
        # Verificar si terminó
        local remaining=$(pgrep -f "$script_pattern" 2>/dev/null || true)
        if [ -n "$remaining" ]; then
            echo "💀 Forzando terminación de $name..."
            kill -9 $remaining 2>/dev/null || true
        fi
        
        echo "✅ $name detenido"
    else
        echo "ℹ️  $name no estaba ejecutándose"
    fi
}

# Detener cada servidor
stop_server "Medical AI Server" "medical-ai-server-simple.js"
stop_server "WebRTC Metrics Server" "webrtc-metrics-server-simple.js"  
stop_server "HIPAA Compliance Server" "hipaa-compliance-server-simple.js"

# Limpiar archivos PID
echo "🧹 Limpiando archivos PID..."
rm -f pids/*.pid 2>/dev/null || true

# Verificar puertos
echo ""
echo "🔍 Verificando que los puertos estén libres..."

for port in 8001 8002 8003; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Puerto $port aún en uso"
        local pid=$(lsof -ti:$port)
        echo "   PID: $pid - ejecutando: $(ps -p $pid -o comm= 2>/dev/null || echo 'proceso desconocido')"
    else
        echo "✅ Puerto $port libre"
    fi
done

echo ""
echo "📊 Estado final:"

# Verificar que no hay procesos MCP ejecutándose
local remaining=$(pgrep -f "server-simple.js" 2>/dev/null || true)
if [ -n "$remaining" ]; then
    echo "⚠️  Procesos MCP aún ejecutándose:"
    ps -p $remaining -o pid,comm,args 2>/dev/null || true
else
    echo "✅ Todos los servidores MCP detenidos correctamente"
fi

echo ""
echo "🏥 Servidores MCP de AltaMedica detenidos"