#!/usr/bin/env python3
"""
AltaMedica - Analizador Profundo de Errores de Autenticación
Autor: Eduardo Marques
Fecha: Enero 2025
"""

import os
import sys
import json
import time
import requests
import subprocess
import logging
import psutil
import socket
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from concurrent.futures import ThreadPoolExecutor, as_completed
import colorama
from colorama import Fore, Back, Style

# Inicializar colorama para Windows
colorama.init()

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('auth_deep_analysis.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class ServiceStatus:
    name: str
    port: int
    status: str
    response_time: Optional[float] = None
    error: Optional[str] = None
    headers: Optional[Dict] = None
    pid: Optional[int] = None
    memory_usage: Optional[float] = None
    cpu_usage: Optional[float] = None

@dataclass
class AuthTestResult:
    timestamp: str
    test_type: str
    success: bool
    response_time: float
    status_code: Optional[int] = None
    error_message: Optional[str] = None
    response_body: Optional[Dict] = None
    headers: Optional[Dict] = None

class AltaMedicaAuthAnalyzer:
    """Analizador profundo de problemas de autenticación en AltaMedica"""
    
    def __init__(self):
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.debug_dir = Path(f"python_debug_auth_{self.timestamp}")
        self.debug_dir.mkdir(exist_ok=True)
        
        self.services = {
            "Firebase Auth Emulator": 9099,
            "Firestore Emulator": 8080,
            "Functions Emulator": 5001,
            "Hosting Emulator": 5000,
            "Web App": 3000,
            "API Server": 3001,
            "Doctors Portal": 3002,
            "Patients Portal": 3003,
            "Signaling Server": 8888
        }
        
        self.test_results: List[AuthTestResult] = []
        self.service_statuses: List[ServiceStatus] = []
        
    def print_banner(self):
        """Mostrar banner de inicio"""
        print(f"{Fore.CYAN}{'='*60}")
        print(f"{Fore.CYAN}   ALTAMEDICA - ANALIZADOR PROFUNDO DE AUTENTICACIÓN")
        print(f"{Fore.CYAN}{'='*60}{Style.RESET_ALL}")
        print(f"{Fore.YELLOW}Timestamp: {self.timestamp}")
        print(f"{Fore.YELLOW}Debug Directory: {self.debug_dir}{Style.RESET_ALL}\n")
        
    def check_port_status(self, name: str, port: int) -> ServiceStatus:
        """Verificar el estado de un puerto específico"""
        start_time = time.time()
        status = ServiceStatus(name=name, port=port, status="UNKNOWN")
        
        try:
            # Verificar si el puerto está abierto
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(2)
            result = sock.connect_ex(('localhost', port))
            sock.close()
            
            if result == 0:
                # Puerto abierto, intentar hacer una petición HTTP
                try:
                    response = requests.get(f"http://localhost:{port}", timeout=5)
                    status.status = "RUNNING"
                    status.response_time = time.time() - start_time
                    status.headers = dict(response.headers)
                    
                    # Intentar obtener información del proceso
                    for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                        try:
                            for conn in proc.connections():
                                if conn.laddr.port == port:
                                    status.pid = proc.info['pid']
                                    process = psutil.Process(proc.info['pid'])
                                    status.memory_usage = process.memory_info().rss / 1024 / 1024  # MB
                                    status.cpu_usage = process.cpu_percent(interval=0.1)
                                    break
                        except (psutil.NoSuchProcess, psutil.AccessDenied):
                            continue
                            
                except requests.exceptions.RequestException as e:
                    status.status = "RUNNING_NO_HTTP"
                    status.error = str(e)
            else:
                status.status = "NOT_RUNNING"
                status.error = "Port closed"
                
        except Exception as e:
            status.status = "ERROR"
            status.error = str(e)
            
        return status
    
    def analyze_services(self):
        """Analizar todos los servicios en paralelo"""
        print(f"{Fore.YELLOW}🔍 Analizando servicios...{Style.RESET_ALL}\n")
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            future_to_service = {
                executor.submit(self.check_port_status, name, port): name 
                for name, port in self.services.items()
            }
            
            for future in as_completed(future_to_service):
                status = future.result()
                self.service_statuses.append(status)
                
                # Mostrar resultado con colores
                if status.status == "RUNNING":
                    print(f"{Fore.GREEN}✅ {status.name:<25} [{status.port:>5}] - ACTIVO "
                          f"(RT: {status.response_time:.2f}s){Style.RESET_ALL}")
                    if status.pid:
                        print(f"   PID: {status.pid}, Memoria: {status.memory_usage:.1f}MB, "
                              f"CPU: {status.cpu_usage:.1f}%")
                elif status.status == "RUNNING_NO_HTTP":
                    print(f"{Fore.YELLOW}⚠️  {status.name:<25} [{status.port:>5}] - "
                          f"PUERTO ABIERTO (sin HTTP){Style.RESET_ALL}")
                else:
                    print(f"{Fore.RED}❌ {status.name:<25} [{status.port:>5}] - "
                          f"NO DISPONIBLE{Style.RESET_ALL}")
                    if status.error:
                        print(f"   Error: {status.error}")
    
    def test_firebase_emulator_auth(self):
        """Probar autenticación directa con el emulador de Firebase"""
        print(f"\n{Fore.YELLOW}🔐 Probando Firebase Auth Emulator...{Style.RESET_ALL}")
        
        auth_url = "http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword"
        test_credentials = {
            "email": "test@altamedica.com",
            "password": "test123",
            "returnSecureToken": True
        }
        
        # Añadir key parameter (requerido por el emulador)
        params = {"key": "fake-api-key"}
        
        start_time = time.time()
        result = AuthTestResult(
            timestamp=datetime.now().isoformat(),
            test_type="firebase_emulator_direct",
            success=False,
            response_time=0
        )
        
        try:
            response = requests.post(
                auth_url, 
                json=test_credentials,
                params=params,
                timeout=10
            )
            result.response_time = time.time() - start_time
            result.status_code = response.status_code
            result.headers = dict(response.headers)
            
            if response.status_code == 200:
                result.success = True
                result.response_body = response.json()
                print(f"{Fore.GREEN}✅ Autenticación exitosa con emulador{Style.RESET_ALL}")
                print(f"   Tiempo de respuesta: {result.response_time:.3f}s")
                print(f"   ID Token recibido: {'idToken' in result.response_body}")
            else:
                result.error_message = f"HTTP {response.status_code}: {response.text}"
                print(f"{Fore.RED}❌ Error de autenticación: {result.error_message}{Style.RESET_ALL}")
                
        except requests.exceptions.ConnectionError:
            result.error_message = "No se puede conectar al emulador de Auth"
            print(f"{Fore.RED}❌ Error de conexión: {result.error_message}{Style.RESET_ALL}")
            print(f"{Fore.YELLOW}   Asegúrate de que el emulador esté corriendo{Style.RESET_ALL}")
        except Exception as e:
            result.error_message = str(e)
            print(f"{Fore.RED}❌ Error inesperado: {result.error_message}{Style.RESET_ALL}")
            
        self.test_results.append(result)
        return result
    
    def analyze_firebase_config(self):
        """Analizar la configuración de Firebase"""
        print(f"\n{Fore.YELLOW}📋 Analizando configuración de Firebase...{Style.RESET_ALL}")
        
        firebase_json_path = Path("firebase.json")
        if firebase_json_path.exists():
            with open(firebase_json_path, 'r') as f:
                config = json.load(f)
                
            # Guardar configuración para análisis
            with open(self.debug_dir / "firebase_config.json", 'w') as f:
                json.dump(config, f, indent=2)
                
            # Verificar emuladores configurados
            if 'emulators' in config:
                print(f"{Fore.GREEN}✅ Configuración de emuladores encontrada:{Style.RESET_ALL}")
                for emulator, settings in config['emulators'].items():
                    if isinstance(settings, dict) and 'port' in settings:
                        print(f"   - {emulator}: Puerto {settings['port']}")
                    else:
                        print(f"   - {emulator}: {settings}")
                        
                # Verificar emuladores críticos
                required_emulators = ['auth', 'firestore']
                missing = [em for em in required_emulators if em not in config['emulators']]
                if missing:
                    print(f"{Fore.RED}❌ Emuladores faltantes: {', '.join(missing)}{Style.RESET_ALL}")
            else:
                print(f"{Fore.RED}❌ No hay configuración de emuladores en firebase.json{Style.RESET_ALL}")
        else:
            print(f"{Fore.RED}❌ Archivo firebase.json no encontrado{Style.RESET_ALL}")
    
    def analyze_environment_variables(self):
        """Analizar variables de entorno"""
        print(f"\n{Fore.YELLOW}🔧 Analizando variables de entorno...{Style.RESET_ALL}")
        
        env_files = ['.env.local', '.env.development', '.env']
        env_vars = {}
        
        for env_file in env_files:
            env_path = Path(env_file)
            if env_path.exists():
                print(f"{Fore.GREEN}✅ Archivo {env_file} encontrado{Style.RESET_ALL}")
                with open(env_path, 'r') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            key, value = line.split('=', 1)
                            env_vars[key] = value
                            
        # Variables críticas para verificar
        critical_vars = [
            'NEXT_PUBLIC_USE_FIREBASE_EMULATOR',
            'NEXT_PUBLIC_FIREBASE_API_KEY',
            'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
            'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
        ]
        
        print(f"\n{Fore.CYAN}Variables críticas:{Style.RESET_ALL}")
        for var in critical_vars:
            if var in env_vars:
                # Ocultar valores sensibles
                display_value = env_vars[var]
                if 'KEY' in var or 'SECRET' in var:
                    display_value = display_value[:8] + '...' if len(display_value) > 8 else '***'
                print(f"   {var}: {display_value}")
            else:
                print(f"{Fore.RED}   {var}: NO DEFINIDA{Style.RESET_ALL}")
                
        # Verificar específicamente el emulador
        if env_vars.get('NEXT_PUBLIC_USE_FIREBASE_EMULATOR') == 'true':
            print(f"\n{Fore.GREEN}✅ Emuladores habilitados en la configuración{Style.RESET_ALL}")
        else:
            print(f"\n{Fore.RED}❌ Emuladores NO habilitados "
                  f"(NEXT_PUBLIC_USE_FIREBASE_EMULATOR != 'true'){Style.RESET_ALL}")
            
        # Guardar variables de entorno (ocultando valores sensibles)
        safe_env_vars = {}
        for key, value in env_vars.items():
            if any(sensitive in key.upper() for sensitive in ['KEY', 'SECRET', 'PASSWORD']):
                safe_env_vars[key] = value[:8] + '...' if len(value) > 8 else '***'
            else:
                safe_env_vars[key] = value
                
        with open(self.debug_dir / "environment_variables.json", 'w') as f:
            json.dump(safe_env_vars, f, indent=2)
    
    def test_api_health_endpoints(self):
        """Probar endpoints de salud de las APIs"""
        print(f"\n{Fore.YELLOW}🏥 Probando endpoints de salud...{Style.RESET_ALL}")
        
        health_endpoints = [
            ("API Server", "http://localhost:3001/api/health"),
            ("API Server Auth", "http://localhost:3001/api/v1/auth/health"),
            ("Signaling Server", "http://localhost:8888/health"),
            ("Web App", "http://localhost:3000/api/health")
        ]
        
        for name, url in health_endpoints:
            start_time = time.time()
            result = AuthTestResult(
                timestamp=datetime.now().isoformat(),
                test_type=f"health_check_{name.lower().replace(' ', '_')}",
                success=False,
                response_time=0
            )
            
            try:
                response = requests.get(url, timeout=5)
                result.response_time = time.time() - start_time
                result.status_code = response.status_code
                result.headers = dict(response.headers)
                
                if response.status_code == 200:
                    result.success = True
                    result.response_body = response.json() if response.headers.get('content-type', '').startswith('application/json') else {"text": response.text}
                    print(f"{Fore.GREEN}✅ {name}: OK ({result.response_time:.3f}s){Style.RESET_ALL}")
                else:
                    result.error_message = f"HTTP {response.status_code}"
                    print(f"{Fore.RED}❌ {name}: {result.error_message}{Style.RESET_ALL}")
                    
            except Exception as e:
                result.error_message = str(e)
                print(f"{Fore.RED}❌ {name}: {type(e).__name__}: {e}{Style.RESET_ALL}")
                
            self.test_results.append(result)
    
    def analyze_network_connectivity(self):
        """Analizar conectividad de red y posibles bloqueos"""
        print(f"\n{Fore.YELLOW}🌐 Analizando conectividad de red...{Style.RESET_ALL}")
        
        # Verificar interfaces de red
        interfaces = psutil.net_if_addrs()
        print(f"\nInterfaces de red activas:")
        for interface, addrs in interfaces.items():
            for addr in addrs:
                if addr.family == socket.AF_INET:
                    print(f"   {interface}: {addr.address}")
                    
        # Verificar conexiones activas en puertos relevantes
        connections = psutil.net_connections()
        relevant_ports = set(self.services.values())
        
        print(f"\nConexiones relevantes:")
        for conn in connections:
            if hasattr(conn, 'laddr') and conn.laddr.port in relevant_ports:
                status = conn.status if hasattr(conn, 'status') else 'UNKNOWN'
                print(f"   Puerto {conn.laddr.port}: {status}")
                
    def generate_detailed_report(self):
        """Generar reporte detallado del análisis"""
        print(f"\n{Fore.YELLOW}📊 Generando reporte detallado...{Style.RESET_ALL}")
        
        report = {
            "timestamp": self.timestamp,
            "summary": {
                "total_services": len(self.service_statuses),
                "services_running": len([s for s in self.service_statuses if s.status == "RUNNING"]),
                "services_down": len([s for s in self.service_statuses if s.status == "NOT_RUNNING"]),
                "total_tests": len(self.test_results),
                "tests_passed": len([t for t in self.test_results if t.success]),
                "tests_failed": len([t for t in self.test_results if not t.success])
            },
            "service_statuses": [asdict(s) for s in self.service_statuses],
            "test_results": [asdict(t) for t in self.test_results],
            "recommendations": []
        }
        
        # Generar recomendaciones basadas en los resultados
        auth_emulator = next((s for s in self.service_statuses if s.name == "Firebase Auth Emulator"), None)
        if auth_emulator and auth_emulator.status != "RUNNING":
            report["recommendations"].append({
                "priority": "CRITICAL",
                "issue": "Firebase Auth Emulator no está corriendo",
                "solution": "Ejecutar: firebase emulators:start --only auth,firestore,functions,hosting"
            })
            
        firestore_emulator = next((s for s in self.service_statuses if s.name == "Firestore Emulator"), None)
        if firestore_emulator and firestore_emulator.status != "RUNNING":
            report["recommendations"].append({
                "priority": "CRITICAL",
                "issue": "Firestore Emulator no está corriendo",
                "solution": "Ejecutar: firebase emulators:start --only auth,firestore,functions,hosting"
            })
            
        # Guardar reporte JSON
        report_path = self.debug_dir / "analysis_report.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
            
        # Generar reporte de texto legible
        text_report = self._generate_text_report(report)
        text_report_path = self.debug_dir / "ANALYSIS_REPORT.txt"
        with open(text_report_path, 'w', encoding='utf-8') as f:
            f.write(text_report)
            
        print(f"\n{Fore.GREEN}✅ Reporte generado:{Style.RESET_ALL}")
        print(f"   JSON: {report_path}")
        print(f"   Texto: {text_report_path}")
        
        # Mostrar resumen
        print(f"\n{Fore.CYAN}{'='*60}")
        print("RESUMEN DEL ANÁLISIS")
        print(f"{'='*60}{Style.RESET_ALL}")
        print(f"Servicios activos: {report['summary']['services_running']}/{report['summary']['total_services']}")
        print(f"Tests exitosos: {report['summary']['tests_passed']}/{report['summary']['total_tests']}")
        
        if report["recommendations"]:
            print(f"\n{Fore.RED}⚠️  RECOMENDACIONES CRÍTICAS:{Style.RESET_ALL}")
            for rec in report["recommendations"]:
                if rec["priority"] == "CRITICAL":
                    print(f"\n{Fore.RED}[{rec['priority']}] {rec['issue']}{Style.RESET_ALL}")
                    print(f"   Solución: {rec['solution']}")
                    
    def _generate_text_report(self, report: Dict) -> str:
        """Generar reporte en formato texto"""
        lines = []
        lines.append("="*70)
        lines.append("REPORTE DE ANÁLISIS PROFUNDO - AUTENTICACIÓN ALTAMEDICA")
        lines.append("="*70)
        lines.append(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        lines.append(f"Directorio de debug: {self.debug_dir}")
        lines.append("")
        
        # Resumen
        lines.append("RESUMEN EJECUTIVO:")
        lines.append("-"*40)
        summary = report["summary"]
        lines.append(f"Servicios activos: {summary['services_running']}/{summary['total_services']}")
        lines.append(f"Tests exitosos: {summary['tests_passed']}/{summary['total_tests']}")
        lines.append("")
        
        # Estado de servicios
        lines.append("ESTADO DE SERVICIOS:")
        lines.append("-"*40)
        for service in report["service_statuses"]:
            status_icon = "✅" if service["status"] == "RUNNING" else "❌"
            lines.append(f"{status_icon} {service['name']:<30} [{service['port']:>5}] - {service['status']}")
            if service.get("error"):
                lines.append(f"   Error: {service['error']}")
        lines.append("")
        
        # Resultados de tests
        lines.append("RESULTADOS DE TESTS:")
        lines.append("-"*40)
        for test in report["test_results"]:
            status_icon = "✅" if test["success"] else "❌"
            lines.append(f"{status_icon} {test['test_type']}: "
                        f"{'EXITOSO' if test['success'] else 'FALLIDO'} "
                        f"({test['response_time']:.3f}s)")
            if test.get("error_message"):
                lines.append(f"   Error: {test['error_message']}")
        lines.append("")
        
        # Recomendaciones
        if report["recommendations"]:
            lines.append("RECOMENDACIONES:")
            lines.append("-"*40)
            for i, rec in enumerate(report["recommendations"], 1):
                lines.append(f"\n{i}. [{rec['priority']}] {rec['issue']}")
                lines.append(f"   Solución: {rec['solution']}")
        
        return "\n".join(lines)
    
    def run_full_analysis(self):
        """Ejecutar análisis completo"""
        self.print_banner()
        
        # 1. Analizar servicios
        self.analyze_services()
        
        # 2. Analizar configuración
        self.analyze_firebase_config()
        self.analyze_environment_variables()
        
        # 3. Probar autenticación
        self.test_firebase_emulator_auth()
        
        # 4. Probar endpoints de salud
        self.test_api_health_endpoints()
        
        # 5. Analizar conectividad
        self.analyze_network_connectivity()
        
        # 6. Generar reporte
        self.generate_detailed_report()
        
        # Abrir directorio de resultados
        if sys.platform == "win32":
            os.startfile(self.debug_dir)
        
        print(f"\n{Fore.GREEN}✅ Análisis completado. "
              f"Resultados en: {self.debug_dir}{Style.RESET_ALL}")


if __name__ == "__main__":
    analyzer = AltaMedicaAuthAnalyzer()
    analyzer.run_full_analysis()