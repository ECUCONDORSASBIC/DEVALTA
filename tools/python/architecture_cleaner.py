#!/usr/bin/env python3
"""
🧹 Architecture Cleaner - Limpieza completa de arquitectura
Organiza y limpia toda la estructura del proyecto
"""

import os
import shutil
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict

class ArchitectureCleaner:
    def __init__(self):
        self.workspace = Path("c:/Users/Eduardo/Documents/devaltamedica")
        self.cleanup_plan = {
            "files_to_delete": [],
            "files_to_move": [],
            "directories_to_create": [],
            "directories_to_remove": [],
            "summary": {}
        }
        
        # Estructura objetivo
        self.target_structure = {
            "🏗️ Core": ["apps/", "packages/", "config/"],
            "📚 Documentation": ["docs/"],
            "🔧 Scripts": ["scripts/"],
            "🧪 Testing": ["tests/", "cypress/"],
            "📊 Data": ["data/", "logs/"],
            "🐳 DevOps": ["docker/", "grafana/"],
            "🤖 AI/Tools": ["ai-workspace/", "mcp-servers/"],
            "🗂️ Archive": ["archive/"]
        }
    
    def analyze_architecture(self):
        """Analiza la arquitectura actual"""
        print("🔍 Analizando arquitectura actual...")
        
        # Obtener todos los archivos y directorios
        all_items = list(self.workspace.rglob("*"))
        
        # Categorizar archivos
        categories = {
            "executables": [],
            "configs": [],
            "docs": [],
            "logs": [],
            "backups": [],
            "temp_files": [],
            "test_files": [],
            "media": [],
            "python_scripts": [],
            "js_scripts": [],
            "duplicates": [],
            "unknown": []
        }
        
        for item in all_items:
            if item.is_file():
                category = self._categorize_file(item)
                categories[category].append(item)
        
        return categories
    
    def _categorize_file(self, file_path):
        """Categoriza un archivo según su tipo y propósito"""
        name = file_path.name.lower()
        suffix = file_path.suffix.lower()
        path_str = str(file_path).lower()
        
        # Archivos ejecutables y scripts
        if suffix in ['.bat', '.ps1', '.sh', '.ahk'] or name.endswith('.cmd'):
            return "executables"
        
        # Archivos de configuración
        if any(config in name for config in ['config', '.env', 'package.json', 'tsconfig', 'eslint', 'prettier']):
            return "configs"
        
        # Documentación
        if suffix in ['.md', '.txt'] and not any(temp in name for temp in ['log', 'temp', 'backup']):
            return "docs"
        
        # Logs y temporales
        if any(log in name for log in ['log', '.log', 'debug', 'temp', 'tmp']) or suffix == '.log':
            return "logs"
        
        # Backups
        if any(backup in name for backup in ['backup', '.backup', '.bak', '-old', '_old']):
            return "backups"
        
        # Testing
        if any(test in path_str for test in ['test', 'spec', 'cypress', 'playwright']):
            return "test_files"
        
        # Media
        if suffix in ['.png', '.jpg', '.jpeg', '.gif', '.mp4', '.avi']:
            return "media"
        
        # Scripts Python
        if suffix == '.py':
            return "python_scripts"
        
        # Scripts JS
        if suffix in ['.js', '.mjs'] and 'node_modules' not in path_str:
            return "js_scripts"
        
        return "unknown"
    
    def create_cleanup_plan(self):
        """Crea un plan de limpieza"""
        print("📋 Creando plan de limpieza...")
        
        categories = self.analyze_architecture()
        
        # Archivos para eliminar
        files_to_delete = []
        files_to_delete.extend(categories["logs"])
        files_to_delete.extend(categories["temp_files"])
        files_to_delete.extend([f for f in categories["backups"] if "package.json" not in str(f)])
        
        # Directorios para crear
        new_dirs = [
            "archive",
            "docs/api",
            "docs/security", 
            "docs/architecture",
            "scripts/deployment",
            "scripts/maintenance",
            "scripts/testing",
            "config/environments",
            "tools/ai",
            "tools/python",
            "tools/monitoring"
        ]
        
        # Plan de reorganización
        move_plan = [
            # Documentación
            {"pattern": "*.md", "exclude": ["README.md"], "target": "docs/"},
            {"pattern": "*GUIDE*.md", "target": "docs/api/"},
            {"pattern": "*SECURITY*.md", "target": "docs/security/"},
            {"pattern": "*AUDIT*.md", "target": "docs/security/"},
            
            # Scripts
            {"pattern": "*.py", "exclude": ["requirements*.txt"], "target": "tools/python/"},
            {"pattern": "*.bat", "target": "scripts/deployment/"},
            {"pattern": "*.ps1", "target": "scripts/maintenance/"},
            
            # Configuraciones
            {"pattern": "*config*.json", "exclude": ["package.json"], "target": "config/"},
            {"pattern": "*.env*", "exclude": [".env", ".env.local"], "target": "config/environments/"},
            
            # Logs (archivar)
            {"pattern": "*.log", "target": "archive/logs/"},
            {"pattern": "*debug*", "target": "archive/debug/"},
            
            # Testing
            {"pattern": "*test*", "target": "archive/testing/"},
            
            # Media
            {"pattern": "*.png", "target": "archive/media/"},
            {"pattern": "*.jpg", "target": "archive/media/"},
        ]
        
        self.cleanup_plan = {
            "files_to_delete": files_to_delete,
            "files_to_move": move_plan,
            "directories_to_create": new_dirs,
            "categories": categories,
            "summary": {
                "total_files": sum(len(files) for files in categories.values()),
                "files_to_delete_count": len(files_to_delete),
                "directories_to_create_count": len(new_dirs)
            }
        }
        
        return self.cleanup_plan
    
    def execute_cleanup(self, dry_run=True):
        """Ejecuta el plan de limpieza"""
        if dry_run:
            print("🧪 MODO SIMULACIÓN - No se realizarán cambios reales")
        else:
            print("🚨 EJECUTANDO LIMPIEZA REAL")
        
        plan = self.create_cleanup_plan()
        
        # Crear directorios
        print(f"\n📁 Creando {len(plan['directories_to_create'])} directorios...")
        for dir_path in plan['directories_to_create']:
            full_path = self.workspace / dir_path
            print(f"   📂 {dir_path}")
            if not dry_run:
                full_path.mkdir(parents=True, exist_ok=True)
        
        # Eliminar archivos
        print(f"\n🗑️  Eliminando {len(plan['files_to_delete'])} archivos...")
        deleted_count = 0
        for file_path in plan['files_to_delete']:
            if file_path.exists():
                print(f"   🗑️  {file_path.relative_to(self.workspace)}")
                if not dry_run:
                    try:
                        file_path.unlink()
                        deleted_count += 1
                    except Exception as e:
                        print(f"   ❌ Error eliminando {file_path}: {e}")
        
        # Mover archivos
        print(f"\n📦 Reorganizando archivos...")
        moved_count = 0
        for move_rule in plan['files_to_move']:
            pattern = move_rule['pattern']
            target = move_rule['target']
            exclude = move_rule.get('exclude', [])
            
            matches = list(self.workspace.glob(pattern))
            matches = [f for f in matches if not any(ex in f.name for ex in exclude)]
            
            if matches:
                print(f"   📁 {pattern} → {target} ({len(matches)} archivos)")
                target_dir = self.workspace / target
                
                if not dry_run:
                    target_dir.mkdir(parents=True, exist_ok=True)
                
                for file_path in matches:
                    if file_path.is_file():
                        new_path = target_dir / file_path.name
                        print(f"      📄 {file_path.name}")
                        if not dry_run:
                            try:
                                shutil.move(str(file_path), str(new_path))
                                moved_count += 1
                            except Exception as e:
                                print(f"      ❌ Error moviendo {file_path}: {e}")
        
        # Generar reporte
        self._generate_cleanup_report(plan, dry_run, deleted_count, moved_count)
    
    def _generate_cleanup_report(self, plan, dry_run, deleted_count, moved_count):
        """Genera reporte de limpieza"""
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "mode": "simulation" if dry_run else "execution",
            "summary": {
                "total_files_analyzed": plan['summary']['total_files'],
                "files_deleted": deleted_count if not dry_run else len(plan['files_to_delete']),
                "files_moved": moved_count if not dry_run else sum(len(list(self.workspace.glob(rule['pattern']))) for rule in plan['files_to_move']),
                "directories_created": len(plan['directories_to_create'])
            },
            "categories": {cat: len(files) for cat, files in plan['categories'].items()},
            "target_structure": self.target_structure
        }
        
        # Guardar reporte
        report_name = f"cleanup_report_{'simulation' if dry_run else 'execution'}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_name, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False, default=str)
        
        # Mostrar resumen
        print(f"\n📊 RESUMEN DE LIMPIEZA:")
        print("=" * 40)
        print(f"🔍 Archivos analizados: {report['summary']['total_files_analyzed']}")
        print(f"🗑️  Archivos eliminados: {report['summary']['files_deleted']}")
        print(f"📦 Archivos movidos: {report['summary']['files_moved']}")
        print(f"📁 Directorios creados: {report['summary']['directories_created']}")
        print(f"💾 Reporte guardado: {report_name}")
        
        if dry_run:
            print(f"\n⚠️  SIMULACIÓN COMPLETADA")
            print(f"Para ejecutar realmente: python architecture_cleaner.py --execute")
        else:
            print(f"\n✅ LIMPIEZA COMPLETADA")
    
    def generate_new_structure_guide(self):
        """Genera guía de la nueva estructura"""
        
        guide_lines = [
            "# 🏗️ Nueva Estructura de Arquitectura AltaMedica",
            "",
            "## 📁 Estructura Organizada",
            "",
        ]
        
        for category, paths in self.target_structure.items():
            guide_lines.extend([
                f"### {category}",
                "",
            ])
            
            for path in paths:
                guide_lines.append(f"- **{path}** - {self._get_path_description(path)}")
            
            guide_lines.append("")
        
        guide_lines.extend([
            "## 🎯 Beneficios de la Nueva Estructura",
            "",
            "### ✅ **Organización Clara**",
            "- Archivos agrupados por propósito",
            "- Fácil navegación y mantenimiento",
            "- Estructura escalable",
            "",
            "### ✅ **Mejor Performance**",
            "- Menos archivos en root",
            "- Búsquedas más rápidas",
            "- Builds optimizados",
            "",
            "### ✅ **Mantenimiento Simplificado**",
            "- Scripts organizados por función",
            "- Documentación centralizada",
            "- Configuraciones agrupadas",
            "",
            "## 📋 Guía de Uso",
            "",
            "### 🔍 **Encontrar Archivos**",
            "```bash",
            "# Documentación",
            "docs/api/          # Guías de API",
            "docs/security/     # Documentación de seguridad",
            "docs/architecture/ # Arquitectura del sistema",
            "",
            "# Scripts",
            "scripts/deployment/   # Scripts de despliegue",
            "scripts/maintenance/  # Mantenimiento",
            "scripts/testing/      # Testing automatizado",
            "",
            "# Herramientas",
            "tools/python/      # Herramientas Python",
            "tools/ai/          # Herramientas de IA",
            "tools/monitoring/  # Monitoreo",
            "```",
            "",
            "### 🚀 **Comandos Comunes**",
            "```bash",
            "# Desarrollo",
            "pnpm dev           # Iniciar desarrollo",
            "pnpm build         # Build producción",
            "pnpm test          # Ejecutar tests",
            "",
            "# Deployment",
            "scripts/deployment/start-production.bat",
            "scripts/deployment/build-all.bat",
            "",
            "# Mantenimiento",
            "scripts/maintenance/cleanup.ps1",
            "scripts/maintenance/backup.ps1",
            "```",
            "",
            f"---",
            f"*Estructura generada el {datetime.now().strftime('%d/%m/%Y %H:%M')}*"
        ])
        
        with open('NUEVA_ESTRUCTURA_ARQUITECTURA.md', 'w', encoding='utf-8') as f:
            f.write('\n'.join(guide_lines))
        
        print(f"📚 Guía generada: NUEVA_ESTRUCTURA_ARQUITECTURA.md")
    
    def _get_path_description(self, path):
        """Obtiene descripción del path"""
        descriptions = {
            "apps/": "Aplicaciones principales (patients, doctors, api-server)",
            "packages/": "Paquetes compartidos y librerías",
            "config/": "Configuraciones del proyecto",
            "docs/": "Documentación completa del proyecto",
            "scripts/": "Scripts de automatización y deployment",
            "tests/": "Tests automatizados y e2e",
            "cypress/": "Tests Cypress",
            "data/": "Datos de la aplicación",
            "logs/": "Logs del sistema",
            "docker/": "Configuración Docker",
            "grafana/": "Monitoreo y métricas",
            "ai-workspace/": "Herramientas de IA",
            "mcp-servers/": "Servidores MCP",
            "archive/": "Archivos archivados"
        }
        return descriptions.get(path, "Directorio del proyecto")

def main():
    """Función principal"""
    cleaner = ArchitectureCleaner()
    
    print("🧹 LIMPIADOR DE ARQUITECTURA ALTAMEDICA")
    print("=" * 50)
    
    # Generar guía de nueva estructura
    cleaner.generate_new_structure_guide()
    
    # Ejecutar análisis y simulación
    cleaner.execute_cleanup(dry_run=True)
    
    print(f"\n🎯 PRÓXIMOS PASOS:")
    print("1. Revisar 'cleanup_report_simulation_*.json'")
    print("2. Verificar 'NUEVA_ESTRUCTURA_ARQUITECTURA.md'")
    print("3. Ejecutar limpieza real si está conforme:")
    print("   python architecture_cleaner.py --execute")

if __name__ == "__main__":
    import sys
    execute = "--execute" in sys.argv
    
    cleaner = ArchitectureCleaner()
    cleaner.generate_new_structure_guide()
    cleaner.execute_cleanup(dry_run=not execute)
