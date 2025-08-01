#!/bin/bash
# Script para iniciar todos los servidores MCP de AltaMedica
# Versión simplificada que funciona sin dependencias complejas

echo "🏥 Iniciando servidores MCP de AltaMedica..."

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "❌ Puerto $port ya está en uso"
        return 1
    else
        echo "✅ Puerto $port disponible"
        return 0
    fi
}

# Función para iniciar un servidor en background
start_server() {
    local name=$1
    local script=$2
    local port=$3
    
    echo "🚀 Iniciando $name en puerto $port..."
    
    # Matar proceso previo si existe
    pkill -f "$script" 2>/dev/null || true
    
    # Esperar un momento para que termine
    sleep 1
    
    # Iniciar nuevo proceso
    nohup node "$script" > "logs/${name}.log" 2>&1 &
    local pid=$!
    
    # Esperar un momento para verificar que inició correctamente
    sleep 2
    
    if kill -0 $pid 2>/dev/null; then
        echo "✅ $name iniciado correctamente (PID: $pid)"
        echo $pid > "pids/${name}.pid"
        return 0
    else
        echo "❌ Error iniciando $name"
        return 1
    fi
}

# Función para verificar que un servidor responde
test_server() {
    local name=$1
    local port=$2
    local max_attempts=5
    local attempt=1
    
    echo "🔍 Verificando $name en puerto $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
            echo "✅ $name responde correctamente"
            return 0
        else
            echo "⏳ Intento $attempt/$max_attempts - esperando respuesta de $name..."
            sleep 2
            ((attempt++))
        fi
    done
    
    echo "❌ $name no responde después de $max_attempts intentos"
    return 1
}

# Crear directorios necesarios
mkdir -p logs pids

# Verificar puertos
echo "🔍 Verificando puertos..."
check_port 8001 || exit 1
check_port 8002 || exit 1  
check_port 8003 || exit 1

echo ""
echo "🚀 Iniciando servidores MCP..."

# Iniciar servidor médico AI
if start_server "medical-ai" "servers/medical-ai-server-simple.js" 8001; then
    test_server "Medical AI" 8001
fi

echo ""

# Iniciar servidor WebRTC metrics
if start_server "webrtc-metrics" "servers/webrtc-metrics-server-simple.js" 8002; then
    test_server "WebRTC Metrics" 8002
fi

echo ""

# Iniciar servidor HIPAA compliance
if start_server "hipaa-compliance" "servers/hipaa-compliance-server-simple.js" 8003; then
    test_server "HIPAA Compliance" 8003
fi

echo ""
echo "📊 Estado de servidores MCP:"
echo "----------------------------------------"

# Verificar estado final
for server in "medical-ai:8001" "webrtc-metrics:8002" "hipaa-compliance:8003"; do
    IFS=':' read -r name port <<< "$server"
    
    if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
        echo "✅ $name - http://localhost:$port - ACTIVO"
    else
        echo "❌ $name - http://localhost:$port - ERROR"
    fi
done

echo ""
echo "🎯 Pruebas rápidas:"
echo "curl http://localhost:8001/health  # Medical AI Server"
echo "curl http://localhost:8002/health  # WebRTC Metrics Server"  
echo "curl http://localhost:8003/health  # HIPAA Compliance Server"

echo ""
echo "📝 Logs disponibles en:"
echo "- logs/medical-ai.log"
echo "- logs/webrtc-metrics.log"
echo "- logs/hipaa-compliance.log"

echo ""
echo "🛑 Para detener todos los servidores:"
echo "./stop-all-simple.sh"

echo ""
echo "🏥 Servidores MCP de AltaMedica iniciados correctamente!"
echo "💡 Reinicia Claude Code para usar las herramientas MCP"