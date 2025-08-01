#!/usr/bin/env python3
"""
AltaMedica - Script para verificar el estado de todos los servidores
"""

import requests
import socket
import time
import sys
from datetime import datetime

# Configuración de servidores para verificar
SERVERS = [
    {"name": "Web App Gateway", "url": "http://localhost:3000", "port": 3000, "critical": True},
    {"name": "API Server", "url": "http://localhost:3001", "port": 3001, "critical": True},
    {"name": "Patients App", "url": "http://localhost:3002", "port": 3002, "critical": False},
    {"name": "Doctors App", "url": "http://localhost:3003", "port": 3003, "critical": False},
    {"name": "Companies App", "url": "http://localhost:3004", "port": 3004, "critical": False},
    {"name": "Admin App", "url": "http://localhost:3006", "port": 3006, "critical": False},
    {"name": "Signaling Server", "port": 8888, "critical": False, "websocket": True}
]

def check_port(port):
    """Verifica si un puerto está abierto"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex(('localhost', port))
        sock.close()
        return result == 0
    except:
        return False

def check_http_server(url, timeout=5):
    """Verifica si un servidor HTTP está respondiendo"""
    try:
        response = requests.get(url, timeout=timeout)
        return {
            "status": "online",
            "status_code": response.status_code,
            "response_time": response.elapsed.total_seconds()
        }
    except requests.exceptions.ConnectionError:
        return {"status": "connection_error"}
    except requests.exceptions.Timeout:
        return {"status": "timeout"}
    except Exception as e:
        return {"status": "error", "error": str(e)}

def main():
    """Función principal"""
    print("=" * 70)
    print(f"🔍 AltaMedica - Health Check de Servidores")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    print()
    
    online_count = 0
    critical_online = 0
    critical_total = 0
    
    for server in SERVERS:
        name = server["name"]
        port = server["port"]
        is_critical = server.get("critical", False)
        
        if is_critical:
            critical_total += 1
        
        print(f"📡 Verificando {name} (puerto {port})...", end=" ")
        
        # Verificar puerto
        port_open = check_port(port)
        
        if not port_open:
            print("❌ Puerto cerrado")
            continue
        
        # Verificar HTTP si no es WebSocket
        if server.get("websocket"):
            print("✅ Puerto abierto (WebSocket)")
            online_count += 1
            if is_critical:
                critical_online += 1
        else:
            url = server["url"]
            result = check_http_server(url)
            
            if result["status"] == "online":
                status_code = result["status_code"]
                response_time = result["response_time"] * 1000  # a milisegundos
                
                if status_code == 200:
                    print(f"✅ Online (HTTP {status_code}, {response_time:.0f}ms)")
                    online_count += 1
                    if is_critical:
                        critical_online += 1
                else:
                    print(f"⚠️  HTTP {status_code} ({response_time:.0f}ms)")
            else:
                print(f"❌ {result['status']}")
    
    print()
    print("=" * 70)
    print("📊 Resumen:")
    print(f"   🟢 Servidores online: {online_count}/{len(SERVERS)}")
    print(f"   🔴 Servidores críticos: {critical_online}/{critical_total}")
    
    if critical_online == critical_total:
        print("   ✅ Todos los servidores críticos están funcionando")
    else:
        print("   ❌ Algunos servidores críticos están offline")
    
    print()
    print("🌐 URLs de acceso:")
    for server in SERVERS:
        if not server.get("websocket"):
            status = "🔴 CRÍTICO" if server.get("critical") else "🟢 Secundario"
            print(f"   - {server['name']}: {server['url']} {status}")
    
    print(f"   - Signaling Server: ws://localhost:8888 🟢 WebRTC")
    print()
    
    # Código de salida basado en estado
    if critical_online < critical_total:
        print("⚠️  Exiting with error code (critical servers offline)")
        sys.exit(1)
    elif online_count < len(SERVERS):
        print("⚠️  Some secondary servers are offline")
        sys.exit(2)
    else:
        print("🎉 All servers are healthy!")
        sys.exit(0)

if __name__ == "__main__":
    main()