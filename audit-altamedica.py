#!/usr/bin/env python3
"""
AltaMedica - Script de Auditoría y Análisis Completo
Diagnóstico exhaustivo del monorepo para identificar problemas de inicialización
"""

import json
import os
import sys
import subprocess
import time
import socket
import requests
from pathlib import Path
from datetime import datetime
import shutil

class AltamedicaAuditor:
    def __init__(self):
        self.project_root = Path.cwd()
        self.apps_dir = self.project_root / "apps" 
        self.packages_dir = self.project_root / "packages"
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "summary": {},
            "apps": {},
            "packages": {},
            "dependencies": {},
            "environment": {},
            "configuration": {},
            "errors": [],
            "recommendations": []
        }
        
        # Configuración de apps
        self.apps_config = {
            "web-app": {"port": 3000, "critical": True, "type": "nextjs"},
            "api-server": {"port": 3001, "critical": True, "type": "nextjs"},
            "patients": {"port": 3002, "critical": False, "type": "nextjs"},
            "doctors": {"port": 3003, "critical": False, "type": "nextjs"},
            "companies": {"port": 3004, "critical": False, "type": "nextjs"},
            "admin": {"port": 3006, "critical": False, "type": "nextjs"},
            "signaling-server": {"port": 8888, "critical": False, "type": "nodejs"}
        }

    def print_header(self, title, symbol="="):
        print(f"\n{symbol * 70}")
        print(f"🔍 {title}")
        print(f"{symbol * 70}")

    def print_section(self, title):
        print(f"\n📋 {title}")
        print("-" * 50)

    def check_system_requirements(self):
        """Verificar requisitos del sistema"""
        self.print_section("Verificando Requisitos del Sistema")
        
        # Node.js
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            node_version = result.stdout.strip()
            print(f"✅ Node.js: {node_version}")
            self.results["environment"]["node_version"] = node_version
        except FileNotFoundError:
            print("❌ Node.js no encontrado")
            self.results["errors"].append("Node.js no está instalado")

        # npm
        try:
            result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
            npm_version = result.stdout.strip()
            print(f"✅ npm: {npm_version}")
            self.results["environment"]["npm_version"] = npm_version
        except FileNotFoundError:
            print("❌ npm no encontrado")

        # pnpm
        try:
            result = subprocess.run(['pnpm', '--version'], capture_output=True, text=True)
            pnpm_version = result.stdout.strip()
            print(f"✅ pnpm: {pnpm_version}")
            self.results["environment"]["pnpm_version"] = pnpm_version
        except FileNotFoundError:
            print("⚠️  pnpm no encontrado (usando npm)")
            self.results["environment"]["pnpm_version"] = None

    def check_project_structure(self):
        """Verificar estructura del proyecto"""
        self.print_section("Verificando Estructura del Proyecto")
        
        # Archivos principales
        main_files = [
            "package.json", "pnpm-workspace.yaml", "tsconfig.json", 
            "docker-compose.yml", "ecosystem.config.cjs"
        ]
        
        for file in main_files:
            if (self.project_root / file).exists():
                print(f"✅ {file}")
            else:
                print(f"❌ {file} faltante")
                self.results["errors"].append(f"Archivo {file} no encontrado en raíz")

        # Directorios
        if self.apps_dir.exists():
            apps = [d.name for d in self.apps_dir.iterdir() if d.is_dir()]
            print(f"✅ Apps encontradas: {', '.join(apps)}")
            self.results["summary"]["apps_found"] = len(apps)
        else:
            print("❌ Directorio apps/ no encontrado")
            self.results["errors"].append("Directorio apps/ faltante")

        if self.packages_dir.exists():
            packages = [d.name for d in self.packages_dir.iterdir() if d.is_dir()]
            print(f"✅ Packages encontrados: {', '.join(packages)}")
            self.results["summary"]["packages_found"] = len(packages)
        else:
            print("⚠️  Directorio packages/ no encontrado")

    def analyze_app(self, app_name):
        """Analizar una aplicación específica"""
        app_path = self.apps_dir / app_name
        app_result = {
            "exists": False,
            "package_json": None,
            "dependencies_installed": False,
            "next_config": None,
            "env_files": [],
            "typescript_config": None,
            "build_status": None,
            "errors": []
        }

        if not app_path.exists():
            app_result["errors"].append(f"Directorio {app_name} no existe")
            return app_result

        app_result["exists"] = True
        print(f"\n🔍 Analizando app: {app_name}")

        # package.json
        package_json_path = app_path / "package.json"
        if package_json_path.exists():
            try:
                with open(package_json_path) as f:
                    package_data = json.load(f)
                app_result["package_json"] = package_data
                print(f"  ✅ package.json válido")
                print(f"  📦 Nombre: {package_data.get('name', 'N/A')}")
                print(f"  🏷️  Versión: {package_data.get('version', 'N/A')}")
                
                # Scripts
                scripts = package_data.get("scripts", {})
                if "dev" in scripts:
                    print(f"  🚀 Script dev: {scripts['dev']}")
                else:
                    app_result["errors"].append("Script 'dev' no encontrado")
                    
            except json.JSONDecodeError as e:
                app_result["errors"].append(f"package.json inválido: {e}")
                print(f"  ❌ package.json inválido: {e}")
        else:
            app_result["errors"].append("package.json no encontrado")
            print(f"  ❌ package.json no encontrado")

        # node_modules
        node_modules_path = app_path / "node_modules"
        if node_modules_path.exists():
            app_result["dependencies_installed"] = True
            print(f"  ✅ Dependencias instaladas")
        else:
            app_result["dependencies_installed"] = False
            print(f"  ❌ Dependencias no instaladas")
            app_result["errors"].append("node_modules faltante")

        # next.config.js
        next_configs = ["next.config.js", "next.config.ts", "next.config.mjs"]
        for config_file in next_configs:
            config_path = app_path / config_file
            if config_path.exists():
                app_result["next_config"] = config_file
                print(f"  ✅ {config_file} encontrado")
                break
        else:
            if self.apps_config[app_name]["type"] == "nextjs":
                print(f"  ⚠️  Configuración Next.js no encontrada")

        # Variables de entorno
        env_files = [".env", ".env.local", ".env.development", ".env.production"]
        for env_file in env_files:
            env_path = app_path / env_file
            if env_path.exists():
                app_result["env_files"].append(env_file)
                print(f"  ✅ {env_file}")

        if not app_result["env_files"]:
            print(f"  ⚠️  No se encontraron archivos .env")

        # tsconfig.json
        tsconfig_path = app_path / "tsconfig.json"
        if tsconfig_path.exists():
            try:
                with open(tsconfig_path) as f:
                    tsconfig_data = json.load(f)
                app_result["typescript_config"] = tsconfig_data
                print(f"  ✅ tsconfig.json válido")
            except json.JSONDecodeError as e:
                app_result["errors"].append(f"tsconfig.json inválido: {e}")
                print(f"  ❌ tsconfig.json inválido: {e}")
        else:
            print(f"  ⚠️  tsconfig.json no encontrado")

        return app_result

    def test_app_startup(self, app_name):
        """Probar inicio de aplicación"""
        app_path = self.apps_dir / app_name
        app_config = self.apps_config[app_name]
        
        print(f"\n🧪 Probando inicio de {app_name}...")
        
        if not app_path.exists():
            return {"success": False, "error": "App no existe"}

        try:
            # Intentar compilación TypeScript primero
            if (app_path / "tsconfig.json").exists():
                print(f"  🔍 Verificando TypeScript...")
                result = subprocess.run(
                    ['npx', 'tsc', '--noEmit'], 
                    cwd=app_path, 
                    capture_output=True, 
                    text=True, 
                    timeout=30
                )
                
                if result.returncode != 0:
                    print(f"  ❌ Errores de TypeScript:")
                    error_lines = result.stderr.split('\n')[:10]  # Primeras 10 líneas
                    for line in error_lines:
                        if line.strip():
                            print(f"    {line}")
                    return {"success": False, "error": "Errores de TypeScript", "details": result.stderr}

            # Probar build
            if app_config["type"] == "nextjs":
                print(f"  🔨 Probando build de Next.js...")
                result = subprocess.run(
                    ['npx', 'next', 'build'], 
                    cwd=app_path, 
                    capture_output=True, 
                    text=True, 
                    timeout=60
                )
                
                if result.returncode == 0:
                    print(f"  ✅ Build exitoso")
                    return {"success": True, "build_output": result.stdout}
                else:
                    print(f"  ❌ Error en build:")
                    error_lines = result.stderr.split('\n')[:10]
                    for line in error_lines:
                        if line.strip():
                            print(f"    {line}")
                    return {"success": False, "error": "Error en build", "details": result.stderr}
            
            return {"success": True, "message": "Verificaciones básicas pasaron"}
            
        except subprocess.TimeoutExpired:
            return {"success": False, "error": "Timeout en verificación"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def check_port_availability(self):
        """Verificar disponibilidad de puertos"""
        self.print_section("Verificando Puertos")
        
        for app_name, config in self.apps_config.items():
            port = config["port"]
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                sock.settimeout(1)
                result = sock.connect_ex(('localhost', port))
                sock.close()
                
                if result == 0:
                    print(f"  🟢 Puerto {port} ({app_name}): EN USO")
                else:
                    print(f"  ⚪ Puerto {port} ({app_name}): DISPONIBLE")
            except Exception as e:
                print(f"  ❌ Puerto {port} ({app_name}): ERROR - {e}")

    def generate_recommendations(self):
        """Generar recomendaciones basadas en el análisis"""
        self.print_section("Generando Recomendaciones")
        
        recommendations = []
        
        # Verificar errores críticos por app
        for app_name, app_data in self.results["apps"].items():
            if not app_data.get("dependencies_installed", False):
                recommendations.append({
                    "priority": "HIGH",
                    "category": "Dependencies",
                    "app": app_name,
                    "issue": "Dependencias no instaladas",
                    "solution": f"cd apps/{app_name} && npm install"
                })
            
            if app_data.get("errors"):
                for error in app_data["errors"]:
                    if "package.json" in error:
                        recommendations.append({
                            "priority": "HIGH",
                            "category": "Configuration",
                            "app": app_name,
                            "issue": error,
                            "solution": "Verificar y corregir package.json"
                        })

        # Problemas de entorno
        if not self.results["environment"].get("pnpm_version"):
            recommendations.append({
                "priority": "MEDIUM",
                "category": "Environment",
                "issue": "pnpm no está instalado",
                "solution": "npm install -g pnpm"
            })

        self.results["recommendations"] = recommendations
        
        for rec in recommendations:
            priority_emoji = {"HIGH": "🔴", "MEDIUM": "🟡", "LOW": "🟢"}
            emoji = priority_emoji.get(rec["priority"], "⚪")
            app_info = f" [{rec['app']}]" if rec.get("app") else ""
            print(f"  {emoji} {rec['category']}{app_info}: {rec['issue']}")
            print(f"    💡 Solución: {rec['solution']}")

    def run_full_audit(self):
        """Ejecutar auditoría completa"""
        self.print_header("AltaMedica - Auditoría Completa del Sistema")
        print(f"📅 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"📂 Directorio: {self.project_root}")
        
        # 1. Verificar sistema
        self.check_system_requirements()
        
        # 2. Verificar estructura
        self.check_project_structure()
        
        # 3. Analizar cada app
        self.print_section("Análisis Detallado de Aplicaciones")
        for app_name in self.apps_config.keys():
            app_result = self.analyze_app(app_name)
            self.results["apps"][app_name] = app_result
        
        # 4. Probar startups
        self.print_section("Pruebas de Inicialización")
        for app_name in ["web-app", "api-server"]:  # Solo apps críticas
            startup_result = self.test_app_startup(app_name)
            self.results["apps"][app_name]["startup_test"] = startup_result
        
        # 5. Verificar puertos
        self.check_port_availability()
        
        # 6. Generar recomendaciones
        self.generate_recommendations()
        
        # 7. Resumen final
        self.print_final_summary()
        
        # 8. Guardar reporte
        self.save_report()

    def print_final_summary(self):
        """Imprimir resumen final"""
        self.print_header("Resumen Final", "=")
        
        total_apps = len(self.apps_config)
        working_apps = 0
        critical_working = 0
        critical_total = 0
        
        for app_name, config in self.apps_config.items():
            app_data = self.results["apps"].get(app_name, {})
            if config["critical"]:
                critical_total += 1
                startup_test = app_data.get("startup_test", {})
                if startup_test.get("success", False):
                    critical_working += 1
                    working_apps += 1
            else:
                # Para apps no críticas, considerar si tienen dependencias instaladas
                if app_data.get("dependencies_installed", False):
                    working_apps += 1

        print(f"📊 Aplicaciones analizadas: {total_apps}")
        print(f"✅ Aplicaciones funcionales: {working_apps}/{total_apps}")
        print(f"🔴 Aplicaciones críticas funcionales: {critical_working}/{critical_total}")
        
        total_errors = sum(len(app.get("errors", [])) for app in self.results["apps"].values())
        print(f"❌ Total de errores encontrados: {total_errors}")
        print(f"💡 Recomendaciones generadas: {len(self.results['recommendations'])}")
        
        if critical_working == critical_total:
            print("\n🎉 ¡Todas las aplicaciones críticas están listas!")
        else:
            print(f"\n⚠️  {critical_total - critical_working} aplicaciones críticas necesitan atención")

    def save_report(self):
        """Guardar reporte detallado"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = self.project_root / f"audit_report_{timestamp}.json"
        
        try:
            with open(report_file, 'w') as f:
                json.dump(self.results, f, indent=2, default=str)
            print(f"\n💾 Reporte guardado: {report_file}")
        except Exception as e:
            print(f"\n❌ Error guardando reporte: {e}")

def main():
    """Función principal"""
    auditor = AltamedicaAuditor()
    
    try:
        auditor.run_full_audit()
    except KeyboardInterrupt:
        print("\n\n⚠️  Auditoría interrumpida por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error durante la auditoría: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()