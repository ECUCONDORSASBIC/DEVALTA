#!/usr/bin/env python3
"""
🧹 Simple Architecture Cleaner - Limpieza segura de arquitectura
"""

import os
import json
from pathlib import Path
from datetime import datetime

class SimpleArchitectureCleaner:
    def __init__(self):
        self.workspace = Path("c:/Users/Eduardo/Documents/devaltamedica")
        
    def analyze_root_files(self):
        """Analiza solo archivos en el directorio raíz"""
        print("🔍 Analizando archivos en directorio raíz...")
        
        try:
            # Solo archivos en el directorio raíz
            root_files = [f for f in self.workspace.iterdir() if f.is_file()]
            
            categories = {
                "scripts_python": [],
                "scripts_batch": [],
                "scripts_powershell": [],
                "scripts_js": [],
                "configs": [],
                "docs": [],
                "logs": [],
                "temp_files": [],
                "media": [],
                "data_files": [],
                "keep_files": []
            }
            
            # Archivos que SIEMPRE mantener en root
            keep_in_root = {
                'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml',
                'tsconfig.json', 'README.md', '.gitignore', '.env',
                'docker-compose.yml', 'Dockerfile', 'firebase.json'
            }
            
            for file_path in root_files:
                name = file_path.name.lower()
                
                if file_path.name in keep_in_root:
                    categories["keep_files"].append(file_path)
                elif name.endswith('.py'):
                    categories["scripts_python"].append(file_path)
                elif name.endswith(('.bat', '.cmd')):
                    categories["scripts_batch"].append(file_path)
                elif name.endswith('.ps1'):
                    categories["scripts_powershell"].append(file_path)
                elif name.endswith('.js') and 'config' not in name:
                    categories["scripts_js"].append(file_path)
                elif any(config in name for config in ['config', '.env']) and file_path.name not in keep_in_root:
                    categories["configs"].append(file_path)
                elif name.endswith('.md') and file_path.name != 'README.md':
                    categories["docs"].append(file_path)
                elif any(log in name for log in ['log', '.log', 'debug']):
                    categories["logs"].append(file_path)
                elif name.endswith(('.png', '.jpg', '.jpeg')):
                    categories["media"].append(file_path)
                elif name.endswith(('.json', '.txt')) and 'package' not in name:
                    categories["data_files"].append(file_path)
                else:
                    categories["temp_files"].append(file_path)
            
            return categories
            
        except Exception as e:
            print(f"❌ Error analizando archivos: {e}")
            return {}
    
    def create_organization_plan(self):
        """Crea plan de organización"""
        categories = self.analyze_root_files()
        
        if not categories:
            return None
        
        # Plan de organización
        organization_plan = {
            "directories_to_create": [
                "tools/python",
                "tools/scripts", 
                "tools/monitoring",
                "config/environments",
                "docs/guides",
                "docs/security",
                "archive/logs",
                "archive/media",
                "archive/data"
            ],
            "move_operations": [
                {"files": categories["scripts_python"], "target": "tools/python/"},
                {"files": categories["scripts_batch"], "target": "tools/scripts/"},
                {"files": categories["scripts_powershell"], "target": "tools/scripts/"},
                {"files": categories["scripts_js"], "target": "tools/scripts/"},
                {"files": categories["configs"], "target": "config/environments/"},
                {"files": categories["docs"], "target": "docs/guides/"},
                {"files": categories["logs"], "target": "archive/logs/"},
                {"files": categories["media"], "target": "archive/media/"},
                {"files": categories["data_files"], "target": "archive/data/"}
            ],
            "keep_in_root": categories["keep_files"],
            "statistics": {
                "total_files": len([f for files in categories.values() for f in files]),
                "files_to_move": len([f for cat, files in categories.items() 
                                    if cat != "keep_files" for f in files]),
                "files_to_keep": len(categories["keep_files"])
            }
        }
        
        return organization_plan
    
    def generate_cleanup_script(self):
        """Genera script de limpieza PowerShell"""
        plan = self.create_organization_plan()
        
        if not plan:
            print("❌ No se pudo crear el plan")
            return
        
        ps_lines = [
            "# 🧹 Script de Limpieza de Arquitectura AltaMedica",
            "# Generado automáticamente",
            f"# Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            "",
            'Write-Host "🧹 Iniciando limpieza de arquitectura..." -ForegroundColor Green',
            "",
            "# Crear directorios",
            'Write-Host "📁 Creando directorios organizados..." -ForegroundColor Cyan',
        ]
        
        # Crear directorios
        for directory in plan["directories_to_create"]:
            ps_lines.append(f'New-Item -ItemType Directory -Path "{directory}" -Force | Out-Null')
            ps_lines.append(f'Write-Host "   📂 {directory}" -ForegroundColor Gray')
        
        ps_lines.extend([
            "",
            "# Mover archivos",
            'Write-Host "📦 Reorganizando archivos..." -ForegroundColor Cyan',
        ])
        
        # Operaciones de movimiento
        for operation in plan["move_operations"]:
            if operation["files"]:
                target = operation["target"]
                ps_lines.append(f'Write-Host "   📁 → {target}" -ForegroundColor Yellow')
                
                for file_path in operation["files"]:
                    filename = file_path.name
                    ps_lines.extend([
                        f'if (Test-Path "{filename}") {{',
                        f'    Move-Item "{filename}" "{target}{filename}" -Force',
                        f'    Write-Host "      ✅ {filename}" -ForegroundColor Green',
                        f'}} else {{',
                        f'    Write-Host "      ⚠️  {filename} no encontrado" -ForegroundColor Yellow',
                        f'}}',
                    ])
        
        ps_lines.extend([
            "",
            "# Resumen",
            f'Write-Host "📊 Limpieza completada:" -ForegroundColor Green',
            f'Write-Host "   🗂️  Archivos organizados: {plan["statistics"]["files_to_move"]}" -ForegroundColor Gray',
            f'Write-Host "   📌 Archivos en root: {plan["statistics"]["files_to_keep"]}" -ForegroundColor Gray',
            f'Write-Host "   📁 Directorios creados: {len(plan["directories_to_create"])}" -ForegroundColor Gray',
            "",
            'Write-Host "✅ Arquitectura limpia y organizada!" -ForegroundColor Green',
        ])
        
        # Guardar script
        with open('cleanup_architecture.ps1', 'w', encoding='utf-8') as f:
            f.write('\n'.join(ps_lines))
        
        # Guardar plan en JSON
        with open('architecture_plan.json', 'w', encoding='utf-8') as f:
            json.dump(plan, f, indent=2, ensure_ascii=False, default=str)
        
        return plan
    
    def show_preview(self):
        """Muestra preview de la limpieza"""
        categories = self.analyze_root_files()
        
        if not categories:
            print("❌ No se pudo analizar la arquitectura")
            return
        
        print(f"\n📊 ANÁLISIS DE ARQUITECTURA ACTUAL:")
        print("=" * 50)
        
        total_files = 0
        for category, files in categories.items():
            if files:
                count = len(files)
                total_files += count
                category_name = category.replace('_', ' ').title()
                print(f"📁 {category_name}: {count} archivos")
                
                # Mostrar algunos ejemplos
                examples = [f.name for f in files[:3]]
                for example in examples:
                    print(f"   📄 {example}")
                
                if count > 3:
                    print(f"   ... y {count - 3} más")
                print()
        
        print(f"📊 Total archivos en root: {total_files}")
        
        # Mostrar archivos que se mantendrán en root
        if categories.get("keep_files"):
            print(f"\n✅ ARCHIVOS QUE SE MANTIENEN EN ROOT:")
            for file_path in categories["keep_files"]:
                print(f"   📌 {file_path.name}")
        
        return categories

def main():
    """Función principal"""
    cleaner = SimpleArchitectureCleaner()
    
    print("🧹 LIMPIADOR SIMPLE DE ARQUITECTURA")
    print("=" * 40)
    
    # Mostrar preview
    categories = cleaner.show_preview()
    
    if categories:
        # Generar plan y script
        plan = cleaner.generate_cleanup_script()
        
        if plan:
            print(f"\n🎯 PLAN DE LIMPIEZA GENERADO:")
            print("=" * 30)
            print(f"📁 Directorios a crear: {len(plan['directories_to_create'])}")
            print(f"📦 Archivos a mover: {plan['statistics']['files_to_move']}")
            print(f"📌 Archivos en root: {plan['statistics']['files_to_keep']}")
            
            print(f"\n💾 Archivos generados:")
            print(f"   🧹 cleanup_architecture.ps1 - Script de limpieza")
            print(f"   📊 architecture_plan.json - Plan detallado")
            
            print(f"\n🚀 Para ejecutar la limpieza:")
            print(f"   PowerShell: .\\cleanup_architecture.ps1")

if __name__ == "__main__":
    main()
