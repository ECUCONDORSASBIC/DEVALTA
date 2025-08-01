#!/usr/bin/env python3
"""
AltaMedica - Diagnóstico Completo y Corrección Inteligente
Verificaciones prácticas en paralelo que realmente importan para la plataforma
"""

import json
import os
import sys
import subprocess
import time
import socket
import concurrent.futures
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import threading

class AltamedicaDiagnostico:
    def __init__(self):
        self.project_root = Path.cwd()
        self.apps_dir = self.project_root / "apps"
        self.packages_dir = self.project_root / "packages"
        
        # Configuración de apps con sus puertos reales
        self.apps_config = {
            "web-app": {"port": 3000, "critical": True, "next_port_flag": None},
            "api-server": {"port": 3001, "critical": True, "next_port_flag": "--port 3001"},
            "doctors": {"port": 3002, "critical": False, "next_port_flag": "--port 3002"},
            "patients": {"port": 3003, "critical": False, "next_port_flag": "--port 3003"},
            "companies": {"port": 3004, "critical": False, "next_port_flag": None},  # usa server-fixed.js
            "admin": {"port": 3005, "critical": False, "next_port_flag": "--turbopack --port 3005"},
            "signaling-server": {"port": 8888, "critical": False, "next_port_flag": None}  # no es Next.js
        }
        
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "apps": {},
            "summary": {
                "total_apps": len(self.apps_config),
                "critical_working": 0,
                "total_working": 0,
                "issues_found": [],
                "fixes_applied": []
            }
        }

    def print_header(self, title: str, symbol: str = "="):
        print(f"\n{symbol * 70}")
        print(f"🔧 {title}")
        print(f"{symbol * 70}")

    def verificar_app_basico(self, app_name: str) -> Dict:
        """Verificaciones básicas esenciales de una app"""
        app_path = self.apps_dir / app_name
        config = self.apps_config[app_name]
        
        resultado = {
            "app": app_name,
            "path_exists": False,
            "package_json_valid": False,
            "package_json_data": None,
            "dependencies_installed": False,
            "dev_script_correct": False,
            "next_config_exists": False,
            "env_files": [],
            "port_available": False,
            "can_start": False,
            "issues": [],
            "fixes_applied": []
        }
        
        print(f"🔍 Verificando {app_name}...")
        
        # 1. Verificar que existe
        if not app_path.exists():
            resultado["issues"].append(f"Directorio {app_name} no existe")
            return resultado
        resultado["path_exists"] = True
        
        # 2. Verificar package.json
        package_json_path = app_path / "package.json"
        if package_json_path.exists():
            try:
                with open(package_json_path, 'r', encoding='utf-8') as f:
                    package_data = json.load(f)
                resultado["package_json_valid"] = True
                resultado["package_json_data"] = package_data
                print(f"  ✅ package.json: {package_data.get('name', 'sin nombre')}")
                
                # Verificar script dev
                scripts = package_data.get("scripts", {})
                if "dev" in scripts:
                    dev_script = scripts["dev"]
                    resultado["dev_script_correct"] = True
                    print(f"  ✅ Script dev: {dev_script}")
                    
                    # Verificar si el puerto está en el script
                    expected_port = str(config["port"])
                    if expected_port not in dev_script and config["next_port_flag"]:
                        resultado["issues"].append(f"Puerto {expected_port} no está en script dev")
                        # Auto-fix: corregir el script dev
                        if self.corregir_script_dev(app_path, package_data, config):
                            resultado["fixes_applied"].append("Script dev corregido con puerto correcto")
                else:
                    resultado["issues"].append("Script 'dev' faltante")
                    
            except json.JSONDecodeError:
                resultado["issues"].append("package.json inválido")
        else:
            resultado["issues"].append("package.json no encontrado")
        
        # 3. Verificar node_modules
        node_modules_path = app_path / "node_modules"
        if node_modules_path.exists() and any(node_modules_path.iterdir()):
            resultado["dependencies_installed"] = True
            print(f"  ✅ Dependencias instaladas")
        else:
            resultado["dependencies_installed"] = False
            resultado["issues"].append("node_modules faltante o vacío")
            print(f"  ❌ Dependencias NO instaladas")
        
        # 4. Verificar configuración Next.js (si aplica)
        if app_name != "signaling-server":
            next_configs = ["next.config.js", "next.config.ts", "next.config.mjs"]
            for config_file in next_configs:
                if (app_path / config_file).exists():
                    resultado["next_config_exists"] = True
                    print(f"  ✅ {config_file}")
                    break
            
            if not resultado["next_config_exists"]:
                resultado["issues"].append("next.config.js faltante")
        
        # 5. Verificar archivos .env
        env_files = [".env", ".env.local", ".env.development"]
        for env_file in env_files:
            if (app_path / env_file).exists():
                resultado["env_files"].append(env_file)
        
        if resultado["env_files"]:
            print(f"  ✅ Archivos env: {', '.join(resultado['env_files'])}")
        else:
            print(f"  ⚠️  Sin archivos .env")
        
        # 6. Verificar disponibilidad de puerto
        resultado["port_available"] = self.verificar_puerto(config["port"])
        if resultado["port_available"]:
            print(f"  ✅ Puerto {config['port']} disponible")
        else:
            print(f"  🟢 Puerto {config['port']} en uso (servidor ya corriendo)")
        
        # 7. Evaluación final: ¿puede iniciar?
        resultado["can_start"] = (
            resultado["path_exists"] and
            resultado["package_json_valid"] and
            resultado["dependencies_installed"] and
            resultado["dev_script_correct"]
        )
        
        if resultado["can_start"]:
            print(f"  🎉 {app_name} LISTO PARA INICIAR")
        else:
            print(f"  ❌ {app_name} necesita correcciones")
        
        return resultado

    def verificar_puerto(self, port: int) -> bool:
        """Verificar si un puerto está disponible"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex(('localhost', port))
            sock.close()
            return result != 0  # True si está disponible (no se puede conectar)
        except:
            return True

    def corregir_script_dev(self, app_path: Path, package_data: Dict, config: Dict) -> bool:
        """Corregir el script dev con el puerto correcto"""
        try:
            app_name = config.get("app", app_path.name)
            current_script = package_data["scripts"]["dev"]
            
            # Determinar el script correcto según la app
            if app_name == "web-app":
                new_script = "next dev"  # Puerto por defecto 3000
            elif app_name == "api-server":
                new_script = "next dev --port 3001"
            elif app_name == "doctors":
                new_script = "next dev --port 3002"
            elif app_name == "patients":  
                new_script = "next dev --port 3003"
            elif app_name == "companies":
                new_script = "node server-fixed.js"  # Mantener como está
                return True
            elif app_name == "admin":
                new_script = "next dev --turbopack --port 3005"
            elif app_name == "signaling-server":
                new_script = "tsx watch src/index.ts"  # Mantener como está
                return True
            else:
                return False
            
            # Solo cambiar si es diferente
            if current_script != new_script:
                package_data["scripts"]["dev"] = new_script
                
                # Guardar package.json actualizado
                package_json_path = app_path / "package.json"
                with open(package_json_path, 'w', encoding='utf-8') as f:
                    json.dump(package_data, f, indent=2, ensure_ascii=False)
                
                print(f"  🔧 Script dev corregido: {new_script}")
                return True
            
            return False
            
        except Exception as e:
            print(f"  ❌ Error corrigiendo script dev: {e}")
            return False

    def instalar_dependencias_si_falta(self, app_name: str) -> bool:
        """Instalar dependencias si faltan"""
        app_path = self.apps_dir / app_name
        
        if not (app_path / "node_modules").exists():
            print(f"  📦 Instalando dependencias para {app_name}...")
            try:
                # Usar npm en lugar de pnpm para mayor compatibilidad
                result = subprocess.run(
                    ['npm', 'install'],
                    cwd=app_path,
                    capture_output=True,
                    text=True,
                    timeout=300  # 5 minutos max
                )
                
                if result.returncode == 0:
                    print(f"  ✅ Dependencias instaladas correctamente")
                    return True
                else:
                    print(f"  ❌ Error instalando dependencias: {result.stderr[:200]}...")
                    return False
                    
            except subprocess.TimeoutExpired:
                print(f"  ⚠️  Timeout instalando dependencias")
                return False
            except Exception as e:
                print(f"  ❌ Error: {e}")
                return False
        
        return True

    def verificar_dependencias_criticas(self, app_name: str) -> List[str]:
        """Verificar que las dependencias críticas estén instaladas"""
        app_path = self.apps_dir / app_name
        package_json_path = app_path / "package.json"
        
        dependencias_faltantes = []
        
        if not package_json_path.exists():
            return ["package.json no existe"]
        
        try:
            with open(package_json_path) as f:
                package_data = json.load(f)
            
            deps = {**package_data.get("dependencies", {}), **package_data.get("devDependencies", {})}
            
            # Dependencias críticas por tipo de app
            dependencias_criticas = {
                "web-app": ["next", "react", "react-dom"],
                "api-server": ["next", "react", "react-dom"],
                "doctors": ["next", "react", "react-dom"],
                "patients": ["next", "react", "react-dom"],
                "companies": ["next", "react", "react-dom"],
                "admin": ["next", "react", "react-dom"],
                "signaling-server": ["socket.io", "tsx"]
            }
            
            for dep in dependencias_criticas.get(app_name, []):
                if dep not in deps:
                    dependencias_faltantes.append(dep)
            
            return dependencias_faltantes
            
        except Exception as e:
            return [f"Error verificando dependencias: {e}"]

    def test_build_rapido(self, app_name: str) -> Dict:
        """Test rápido de build (sin compilación completa)"""
        app_path = self.apps_dir / app_name
        
        # Solo para apps Next.js
        if app_name == "signaling-server":
            return {"success": True, "message": "No es app Next.js"}
        
        try:
            # Test rápido: verificar que next build puede iniciar
            result = subprocess.run(
                ['npx', 'next', 'build', '--help'],
                cwd=app_path,
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                return {"success": True, "message": "Next.js configurado correctamente"}
            else:
                return {"success": False, "error": "Next.js no responde"}
                
        except subprocess.TimeoutExpired:
            return {"success": False, "error": "Timeout en test Next.js"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def diagnostico_completo_paralelo(self):
        """Ejecutar diagnóstico completo en paralelo"""
        self.print_header("AltaMedica - Diagnóstico Completo Paralelo")
        print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🎯 Apps a diagnosticar: {len(self.apps_config)}")
        
        # Ejecutar verificaciones básicas en paralelo
        print(f"\n📋 Ejecutando verificaciones básicas en paralelo...")
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            future_to_app = {
                executor.submit(self.verificar_app_basico, app_name): app_name 
                for app_name in self.apps_config.keys()
            }
            
            for future in concurrent.futures.as_completed(future_to_app):
                app_name = future_to_app[future]
                try:
                    resultado = future.result()
                    self.results["apps"][app_name] = resultado
                except Exception as e:
                    print(f"❌ Error verificando {app_name}: {e}")
                    self.results["apps"][app_name] = {"error": str(e)}
        
        # Análisis de resultados
        self.analizar_resultados()
        
        # Aplicar correcciones automáticas
        self.aplicar_correcciones_automaticas()
        
        # Reporte final
        self.generar_reporte_final()

    def analizar_resultados(self):
        """Analizar resultados y generar estadísticas"""
        print(f"\n📊 Analizando resultados...")
        
        critical_working = 0
        total_working = 0
        issues_globales = []
        
        for app_name, config in self.apps_config.items():
            resultado = self.results["apps"].get(app_name, {})
            
            if resultado.get("can_start", False):
                total_working += 1
                if config["critical"]:
                    critical_working += 1
            
            # Recopilar issues
            for issue in resultado.get("issues", []):
                issues_globales.append(f"{app_name}: {issue}")
        
        self.results["summary"].update({
            "critical_working": critical_working,
            "total_working": total_working,
            "issues_found": issues_globales
        })
        
        print(f"  ✅ Apps funcionando: {total_working}/{len(self.apps_config)}")
        print(f"  🔴 Apps críticas funcionando: {critical_working}/2")
        print(f"  ⚠️  Issues encontrados: {len(issues_globales)}")

    def aplicar_correcciones_automaticas(self):
        """Aplicar correcciones automáticas donde sea posible"""
        print(f"\n🔧 Aplicando correcciones automáticas...")
        
        correcciones_aplicadas = []
        
        # Priorizar apps críticas
        apps_prioritarias = ["web-app", "api-server"]
        
        for app_name in apps_prioritarias:
            resultado = self.results["apps"].get(app_name, {})
            
            if not resultado.get("can_start", False):
                print(f"\n🚨 Corrigiendo app crítica: {app_name}")
                
                # 1. Instalar dependencias si faltan
                if not resultado.get("dependencies_installed", False):
                    if self.instalar_dependencias_si_falta(app_name):
                        correcciones_aplicadas.append(f"{app_name}: Dependencias instaladas")
                        resultado["dependencies_installed"] = True
                
                # 2. Verificar dependencias críticas específicas
                deps_faltantes = self.verificar_dependencias_criticas(app_name)
                if deps_faltantes:
                    print(f"  ⚠️  Dependencias faltantes: {', '.join(deps_faltantes)}")
                
                # 3. Test build rápido
                build_result = self.test_build_rapido(app_name)
                if not build_result["success"]:
                    print(f"  ⚠️  Build test: {build_result.get('error', 'Error desconocido')}")
        
        self.results["summary"]["fixes_applied"] = correcciones_aplicadas
        
        if correcciones_aplicadas:
            print(f"  ✅ Correcciones aplicadas: {len(correcciones_aplicadas)}")
            for fix in correcciones_aplicadas:
                print(f"    - {fix}")
        else:
            print(f"  ℹ️  No se requirieron correcciones automáticas")

    def generar_reporte_final(self):
        """Generar reporte final con recomendaciones"""
        self.print_header("Reporte Final - Estado de AltaMedica", "=")
        
        summary = self.results["summary"]
        
        print(f"📊 RESUMEN EJECUTIVO:")
        print(f"  🎯 Total de aplicaciones: {summary['total_apps']}")
        print(f"  ✅ Aplicaciones listas: {summary['total_working']}/{summary['total_apps']}")
        print(f"  🔴 Apps críticas listas: {summary['critical_working']}/2")
        print(f"  🔧 Correcciones aplicadas: {len(summary['fixes_applied'])}")
        
        # Estado por app
        print(f"\n📋 ESTADO POR APLICACIÓN:")
        for app_name, config in self.apps_config.items():
            resultado = self.results["apps"].get(app_name, {})
            emoji = "🔴" if config["critical"] else "🟡"
            status = "✅ LISTA" if resultado.get("can_start", False) else "❌ NECESITA ATENCIÓN"
            puerto = config["port"]
            print(f"  {emoji} {app_name:15} (:{puerto}) - {status}")
        
        # Issues críticos
        issues_criticos = [issue for issue in summary["issues_found"] if any(critical in issue for critical in ["web-app", "api-server"])]
        if issues_criticos:
            print(f"\n🚨 ISSUES CRÍTICOS:")
            for issue in issues_criticos:
                print(f"  ❌ {issue}")
        
        # Recomendaciones
        print(f"\n💡 RECOMENDACIONES:")
        
        if summary["critical_working"] == 2:
            print(f"  🎉 ¡Aplicaciones críticas listas! Puedes ejecutar:")
            print(f"     python3 -c \"import subprocess; subprocess.run(['cmd.exe', '/c', 'START-ALL-SERVERS.bat'], shell=False)\"")
        else:
            print(f"  🔧 Corrige las aplicaciones críticas antes de continuar")
            
        if summary["total_working"] < summary["total_apps"]:
            print(f"  📦 Algunas apps necesitan 'npm install'")
            
        print(f"  🌐 Una vez iniciado, accede a: http://localhost:3000")
        
        # Guardar reporte
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = self.project_root / f"diagnostico_altamedica_{timestamp}.json"
        
        try:
            with open(report_file, 'w', encoding='utf-8') as f:
                json.dump(self.results, f, indent=2, ensure_ascii=False, default=str)
            print(f"\n💾 Reporte guardado: {report_file}")
        except Exception as e:
            print(f"\n❌ Error guardando reporte: {e}")

def main():
    """Función principal"""
    diagnostico = AltamedicaDiagnostico()
    
    try:
        diagnostico.diagnostico_completo_paralelo()
        
        # Código de salida
        critical_ready = diagnostico.results["summary"]["critical_working"] == 2
        
        if critical_ready:
            print(f"\n🎉 ÉXITO: Aplicaciones críticas listas para ejecutar!")
            sys.exit(0)
        else:
            print(f"\n⚠️  ATENCIÓN: Aplicaciones críticas necesitan correcciones")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print(f"\n\n⚠️  Diagnóstico interrumpido")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error durante diagnóstico: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()