#!/usr/bin/env python3
"""
AltaMedica - Levantador de Servidores con Logs en Tiempo Real
Inicia todos los servidores y captura sus logs para diagnóstico
"""

import subprocess
import threading
import time
import os
import signal
import sys
from pathlib import Path
from datetime import datetime
import queue
import select

class AltamedicaServerManager:
    def __init__(self):
        self.project_root = Path.cwd()
        self.apps_dir = self.project_root / "apps"
        self.logs_dir = self.project_root / "server_logs"
        self.logs_dir.mkdir(exist_ok=True)
        
        # Configuración de servidores
        self.servers = {
            "signaling-server": {
                "path": "apps/signaling-server",
                "command": ["npm", "run", "dev"],
                "port": 8888,
                "critical": False,
                "process": None,
                "log_file": None
            },
            "web-app": {
                "path": "apps/web-app", 
                "command": ["npm", "run", "dev"],
                "port": 3000,
                "critical": True,
                "process": None,
                "log_file": None
            },
            "api-server": {
                "path": "apps/api-server",
                "command": ["npm", "run", "dev"],
                "port": 3001,
                "critical": True,
                "process": None,
                "log_file": None
            },
            "doctors": {
                "path": "apps/doctors",
                "command": ["npm", "run", "dev"],
                "port": 3002,
                "critical": False,
                "process": None,
                "log_file": None
            },
            "patients": {
                "path": "apps/patients",
                "command": ["npm", "run", "dev"],
                "port": 3003,
                "critical": False,
                "process": None,
                "log_file": None
            },
            "companies": {
                "path": "apps/companies",
                "command": ["npm", "run", "dev"],
                "port": 3004,
                "critical": False,
                "process": None,
                "log_file": None
            },
            "admin": {
                "path": "apps/admin",
                "command": ["npm", "run", "dev"],
                "port": 3005,
                "critical": False,
                "process": None,
                "log_file": None
            }
        }
        
        self.running = True
        self.start_time = datetime.now()

    def print_header(self, title: str):
        print(f"\n{'=' * 70}")
        print(f"🚀 {title}")
        print(f"{'=' * 70}")

    def print_server_status(self, server_name: str, status: str, message: str = ""):
        timestamp = datetime.now().strftime("%H:%M:%S")
        emoji_map = {
            "starting": "🔄",
            "running": "✅",
            "error": "❌",
            "stopped": "⏹️"
        }
        emoji = emoji_map.get(status, "ℹ️")
        
        critical = "🔴" if self.servers[server_name]["critical"] else "🟡"
        port = self.servers[server_name]["port"]
        
        print(f"[{timestamp}] {emoji} {critical} {server_name:15} (:{port}) - {status.upper()}")
        if message:
            print(f"         📝 {message}")

    def log_reader(self, server_name: str, process: subprocess.Popen, log_file):
        """Lee los logs de un proceso y los escribe a archivo y consola"""
        try:
            while self.running and process.poll() is None:
                # Leer stdout
                if process.stdout:
                    line = process.stdout.readline()
                    if line:
                        line_str = line.decode('utf-8', errors='ignore').strip()
                        if line_str:
                            timestamp = datetime.now().strftime("%H:%M:%S")
                            log_entry = f"[{timestamp}] [{server_name}] {line_str}"
                            
                            # Escribir a archivo
                            log_file.write(log_entry + "\n")
                            log_file.flush()
                            
                            # Mostrar en consola logs importantes
                            if any(keyword in line_str.lower() for keyword in 
                                 ["ready", "error", "listen", "started", "compiled", "failed", "warn"]):
                                print(f"  📋 {log_entry}")
                
                # Leer stderr
                if process.stderr:
                    line = process.stderr.readline()
                    if line:
                        line_str = line.decode('utf-8', errors='ignore').strip()
                        if line_str:
                            timestamp = datetime.now().strftime("%H:%M:%S")
                            log_entry = f"[{timestamp}] [{server_name}] ERROR: {line_str}"
                            
                            # Escribir a archivo
                            log_file.write(log_entry + "\n")
                            log_file.flush()
                            
                            # Mostrar errores siempre
                            print(f"  ❌ {log_entry}")
                
                time.sleep(0.1)
                
        except Exception as e:
            print(f"  ⚠️  Error leyendo logs de {server_name}: {e}")

    def start_server(self, server_name: str) -> bool:
        """Iniciar un servidor específico"""
        server_config = self.servers[server_name]
        server_path = self.project_root / server_config["path"]
        
        if not server_path.exists():
            self.print_server_status(server_name, "error", f"Directorio no existe: {server_path}")
            return False
        
        # Crear archivo de log
        log_filename = f"{server_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        log_filepath = self.logs_dir / log_filename
        
        try:
            log_file = open(log_filepath, 'w', encoding='utf-8')
            server_config["log_file"] = log_file
            
            self.print_server_status(server_name, "starting", f"Iniciando en {server_path}")
            
            # Iniciar proceso
            process = subprocess.Popen(
                server_config["command"],
                cwd=server_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                universal_newlines=False,
                bufsize=1
            )
            
            server_config["process"] = process
            
            # Iniciar thread para leer logs
            log_thread = threading.Thread(
                target=self.log_reader,
                args=(server_name, process, log_file),
                daemon=True
            )
            log_thread.start()
            
            # Esperar un poco para ver si inicia correctamente
            time.sleep(2)
            
            if process.poll() is None:
                self.print_server_status(server_name, "running", f"Log: {log_filepath}")
                return True
            else:
                self.print_server_status(server_name, "error", f"Proceso terminó inmediatamente (código: {process.returncode})")
                return False
                
        except Exception as e:
            self.print_server_status(server_name, "error", f"Error iniciando: {e}")
            return False

    def check_server_health(self, server_name: str) -> str:
        """Verificar salud de un servidor"""
        server_config = self.servers[server_name]
        process = server_config.get("process")
        
        if not process:
            return "not_started"
        
        if process.poll() is None:
            return "running"
        else:
            return f"stopped (código: {process.returncode})"

    def print_status_summary(self):
        """Imprimir resumen del estado de todos los servidores"""
        print(f"\n📊 ESTADO DE SERVIDORES:")
        print(f"   Tiempo transcurrido: {datetime.now() - self.start_time}")
        
        running_count = 0
        critical_running = 0
        critical_total = sum(1 for s in self.servers.values() if s["critical"])
        
        for server_name, server_config in self.servers.items():
            status = self.check_server_health(server_name)
            
            if status == "running":
                running_count += 1
                if server_config["critical"]:
                    critical_running += 1
            
            emoji = "✅" if status == "running" else "❌"
            critical_marker = "🔴" if server_config["critical"] else "🟡"
            port = server_config["port"]
            
            print(f"   {emoji} {critical_marker} {server_name:15} (:{port}) - {status}")
        
        print(f"\n   📈 Total funcionando: {running_count}/{len(self.servers)}")
        print(f"   🔴 Críticos funcionando: {critical_running}/{critical_total}")
        
        if critical_running == critical_total:
            print(f"   🎉 ¡Servidores críticos listos!")
            print(f"   🌐 Acceso: http://localhost:3000")

    def monitor_servers(self):
        """Monitorear servidores y mostrar estado periódicamente"""
        try:
            while self.running:
                time.sleep(30)  # Estado cada 30 segundos
                self.print_status_summary()
                
        except KeyboardInterrupt:
            print(f"\n⚠️  Deteniendo monitoreo...")

    def stop_all_servers(self):
        """Detener todos los servidores"""
        print(f"\n🛑 Deteniendo todos los servidores...")
        
        for server_name, server_config in self.servers.items():
            process = server_config.get("process")
            log_file = server_config.get("log_file")
            
            if process and process.poll() is None:
                self.print_server_status(server_name, "stopped", "Deteniendo...")
                try:
                    process.terminate()
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                except Exception as e:
                    print(f"  ⚠️  Error deteniendo {server_name}: {e}")
            
            if log_file:
                log_file.close()
        
        self.running = False

    def start_all_servers(self):
        """Iniciar todos los servidores"""
        self.print_header("AltaMedica - Iniciando Todos los Servidores")
        print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"📂 Logs guardados en: {self.logs_dir}")
        
        # Iniciar servidores críticos primero
        critical_servers = [name for name, config in self.servers.items() if config["critical"]]
        other_servers = [name for name, config in self.servers.items() if not config["critical"]]
        
        print(f"\n🔴 Iniciando servidores críticos...")
        for server_name in critical_servers:
            self.start_server(server_name)
            time.sleep(3)  # Esperar entre servidores críticos
        
        print(f"\n🟡 Iniciando servidores secundarios...")
        for server_name in other_servers:
            self.start_server(server_name)
            time.sleep(2)  # Esperar menos entre secundarios
        
        # Estado inicial
        time.sleep(5)
        self.print_status_summary()
        
        print(f"\n💡 INSTRUCCIONES:")
        print(f"   - Los logs se guardan automáticamente en {self.logs_dir}")
        print(f"   - Presiona Ctrl+C para detener todos los servidores")
        print(f"   - Estado actualizado cada 30 segundos")
        
        # Iniciar monitoreo
        monitor_thread = threading.Thread(target=self.monitor_servers, daemon=True)
        monitor_thread.start()
        
        # Mantener el script corriendo
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            print(f"\n\n⚠️  Interrupción recibida...")
        finally:
            self.stop_all_servers()
            print(f"\n✅ Todos los servidores detenidos.")
            print(f"📁 Logs disponibles en: {self.logs_dir}")

def main():
    """Función principal"""
    manager = AltamedicaServerManager()
    
    # Manejar señales para cleanup
    def signal_handler(signum, frame):
        print(f"\n🛑 Señal recibida ({signum})")
        manager.stop_all_servers()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        manager.start_all_servers()
    except Exception as e:
        print(f"❌ Error: {e}")
        manager.stop_all_servers()
        sys.exit(1)

if __name__ == "__main__":
    main()