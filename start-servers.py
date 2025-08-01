#!/usr/bin/env python3
"""
AltaMedica - Script para levantar todos los servidores en procesos separados
Cada servidor se ejecuta en su propio proceso hijo con su propia terminal
"""

import subprocess
import time
import os
import sys
from pathlib import Path

# Configuración de servidores
SERVERS = [
    {
        "name": "Web App Gateway", 
        "path": "apps/web-app", 
        "port": 3000,
        "priority": 1,
        "critical": True
    },
    {
        "name": "API Server", 
        "path": "apps/api-server", 
        "port": 3001,
        "priority": 2,
        "critical": True
    },
    {
        "name": "Signaling Server WebRTC", 
        "path": "apps/signaling-server", 
        "port": 8888,
        "priority": 3,
        "critical": False
    },
    {
        "name": "Doctors App", 
        "path": "apps/doctors", 
        "port": 3003,
        "priority": 4,
        "critical": False
    },
    {
        "name": "Patients App", 
        "path": "apps/patients", 
        "port": 3002,
        "priority": 5,
        "critical": False
    },
    {
        "name": "Companies App", 
        "path": "apps/companies", 
        "port": 3004,
        "priority": 6,
        "critical": False
    },
    {
        "name": "Admin App", 
        "path": "apps/admin", 
        "port": 3006,
        "priority": 7,
        "critical": False
    }
]

def start_server(server):
    """Inicia un servidor en un proceso separado"""
    print(f"🚀 Iniciando {server['name']} en puerto {server['port']}...")
    
    try:
        # Cambiar al directorio del servidor
        server_path = Path(server['path'])
        if not server_path.exists():
            print(f"❌ Error: Directorio {server_path} no encontrado")
            return None
            
        # Comando para ejecutar en nueva terminal (Windows)
        if os.name == 'nt':  # Windows
            cmd = f'start "AltaMedica - {server["name"]} (:{server["port"]})" cmd /k "cd /d {server_path.absolute()} && npm run dev"'
            process = subprocess.Popen(cmd, shell=True)
        else:  # Linux/WSL
            # Usar gnome-terminal, xterm, o tmux según disponibilidad
            cmd = f'cd {server_path} && npm run dev'
            # Intentar con diferentes terminales
            try:
                # Opción 1: gnome-terminal
                process = subprocess.Popen([
                    'gnome-terminal', 
                    '--title', f'AltaMedica - {server["name"]} (:{server["port"]})',
                    '--', 'bash', '-c', f'{cmd}; exec bash'
                ])
            except FileNotFoundError:
                try:
                    # Opción 2: xterm
                    process = subprocess.Popen([
                        'xterm', 
                        '-title', f'AltaMedica - {server["name"]}',
                        '-e', f'bash -c "{cmd}; exec bash"'
                    ])
                except FileNotFoundError:
                    # Opción 3: ejecutar en background (sin terminal separada)
                    print(f"⚠️  No se encontró terminal gráfica, ejecutando {server['name']} en background...")
                    process = subprocess.Popen(
                        ['bash', '-c', cmd],
                        cwd=server_path,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE
                    )
        
        print(f"✅ {server['name']} iniciado (PID: {process.pid})")
        return process
        
    except Exception as e:
        print(f"❌ Error iniciando {server['name']}: {e}")
        return None

def main():
    """Función principal"""
    print("=" * 60)
    print("🏥 AltaMedica - Iniciando Todos los Servidores")
    print("=" * 60)
    print()
    
    # Verificar que estamos en el directorio correcto
    if not Path("apps").exists():
        print("❌ Error: No se encontró el directorio 'apps'")
        print("   Ejecuta este script desde la raíz del proyecto AltaMedica")
        sys.exit(1)
    
    processes = []
    
    # Ordenar servidores por prioridad
    servers_sorted = sorted(SERVERS, key=lambda x: x['priority'])
    
    # Iniciar servidores críticos primero
    print("🔴 Iniciando servidores críticos...")
    for server in servers_sorted:
        if server['critical']:
            process = start_server(server)
            if process:
                processes.append((server, process))
                time.sleep(3)  # Esperar entre servidores críticos
    
    print()
    print("🟡 Iniciando servidores secundarios...")
    
    # Iniciar servidores secundarios
    for server in servers_sorted:
        if not server['critical']:
            process = start_server(server)
            if process:
                processes.append((server, process))
                time.sleep(2)  # Esperar menos entre servidores secundarios
    
    print()
    print("=" * 60)
    print("🎉 Todos los servidores iniciados!")
    print("=" * 60)
    print()
    print("📋 Puertos configurados:")
    for server in servers_sorted:
        status = "🔴 CRÍTICO" if server['critical'] else "🟢 Secundario"
        if server['port'] == 8888:
            print(f"  - {server['name']}: ws://localhost:{server['port']} {status}")
        else:
            print(f"  - {server['name']}: http://localhost:{server['port']} {status}")
    
    print()
    print("🔍 Para verificar el estado:")
    print("  python3 check-servers.py")
    print()
    print("⚠️  Para detener todos los servidores:")
    print("  python3 stop-servers.py")
    print()
    
    # Mantener el script corriendo para mostrar información
    try:
        print("Presiona Ctrl+C para salir del monitor...")
        while True:
            time.sleep(10)
            # Verificar que los procesos siguen vivos
            alive_count = 0
            for server, process in processes:
                if process.poll() is None:  # Proceso aún corriendo
                    alive_count += 1
            
            print(f"📊 Servidores activos: {alive_count}/{len(processes)}")
            
    except KeyboardInterrupt:
        print("\n👋 Saliendo del monitor...")
        print("   Los servidores siguen ejecutándose en background")

if __name__ == "__main__":
    main()