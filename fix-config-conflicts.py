#!/usr/bin/env python3
"""
AltaMedica - Corrección de Conflictos de Configuración
Corrige problemas entre package.json, next.config.js y otros archivos de configuración
"""

import json
import os
import sys
import shutil
from pathlib import Path
from datetime import datetime

class ConfigFixer:
    def __init__(self):
        self.project_root = Path.cwd()
        self.apps_dir = self.project_root / "apps"
        
        # Apps Next.js a corregir
        self.nextjs_apps = ["web-app", "api-server", "doctors", "patients", "companies", "admin"]
        
    def print_header(self, title: str):
        print(f"\n{'=' * 60}")
        print(f"🔧 {title}")
        print(f"{'=' * 60}")

    def restore_from_backup(self, app_name: str) -> bool:
        """Restaurar archivos desde backup si existe"""
        app_path = self.apps_dir / app_name
        
        # Buscar el backup más reciente
        backup_dirs = list(app_path.glob("backup_es_modules_*"))
        if not backup_dirs:
            print(f"  ⚠️  No se encontró backup para {app_name}")
            return False
        
        # Obtener el backup más reciente
        latest_backup = max(backup_dirs, key=lambda x: x.name)
        print(f"  📦 Restaurando desde: {latest_backup}")
        
        try:
            # Restaurar archivos importantes
            files_to_restore = ["package.json", "next.config.js", "postcss.config.js", "tailwind.config.js"]
            
            restored = []
            for file_name in files_to_restore:
                backup_file = latest_backup / file_name
                target_file = app_path / file_name
                
                if backup_file.exists():
                    shutil.copy2(backup_file, target_file)
                    restored.append(file_name)
                    print(f"    ✅ Restaurado: {file_name}")
            
            if restored:
                print(f"  🎉 Archivos restaurados: {', '.join(restored)}")
                return True
            else:
                print(f"  ⚠️  No se encontraron archivos para restaurar")
                return False
                
        except Exception as e:
            print(f"  ❌ Error restaurando backup: {e}")
            return False

    def fix_config_consistency(self, app_name: str) -> bool:
        """Arreglar consistencia entre archivos de configuración"""
        app_path = self.apps_dir / app_name
        package_json_path = app_path / "package.json"
        next_config_path = app_path / "next.config.js"
        
        if not package_json_path.exists():
            print(f"  ❌ package.json no encontrado")
            return False
        
        try:
            # Leer package.json
            with open(package_json_path, 'r', encoding='utf-8') as f:
                package_data = json.load(f)
            
            # Leer next.config.js si existe
            next_config_content = None
            if next_config_path.exists():
                with open(next_config_path, 'r', encoding='utf-8') as f:
                    next_config_content = f.read()
            
            # Determinar si debería usar ES modules
            uses_es_modules = (
                next_config_content and 
                ('export default' in next_config_content or 'import(' in next_config_content)
            )
            
            changes_made = False
            
            if uses_es_modules:
                # Si next.config.js usa ES modules, el package.json debe tener "type": "module"
                if package_data.get("type") != "module":
                    package_data["type"] = "module"
                    changes_made = True
                    print(f"  🔧 Agregado 'type': 'module' para compatibilidad con next.config.js")
            else:
                # Si no usa ES modules, convertir next.config.js a CommonJS
                if next_config_content and 'export default' in next_config_content:
                    # Convertir a CommonJS
                    new_content = next_config_content.replace('export default', 'module.exports =')
                    
                    with open(next_config_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    
                    print(f"  🔧 Convertido next.config.js a CommonJS")
                    changes_made = True
                
                # Remover "type": "module" si existe
                if package_data.get("type") == "module":
                    del package_data["type"]
                    changes_made = True
                    print(f"  🔧 Removido 'type': 'module'")
            
            # Guardar package.json si hubo cambios
            if changes_made:
                with open(package_json_path, 'w', encoding='utf-8') as f:
                    json.dump(package_data, f, indent=2, ensure_ascii=False)
                print(f"  ✅ package.json actualizado")
            
            return changes_made
            
        except Exception as e:
            print(f"  ❌ Error arreglando configuración: {e}")
            return False

    def fix_css_config(self, app_name: str) -> bool:
        """Arreglar configuración de CSS y Tailwind específicamente"""
        app_path = self.apps_dir / app_name
        
        # Verificar que globals.css existe
        css_paths = [
            app_path / "src" / "app" / "globals.css",
            app_path / "styles" / "globals.css",
            app_path / "src" / "styles" / "globals.css"
        ]
        
        globals_css_path = None
        for css_path in css_paths:
            if css_path.exists():
                globals_css_path = css_path
                break
        
        if not globals_css_path:
            print(f"  ⚠️  No se encontró globals.css")
            return False
        
        # Verificar contenido de globals.css
        try:
            with open(globals_css_path, 'r', encoding='utf-8') as f:
                css_content = f.read()
            
            # Verificar que tenga las directivas de Tailwind
            tailwind_directives = [
                '@tailwind base;',
                '@tailwind components;', 
                '@tailwind utilities;'
            ]
            
            missing_directives = []
            for directive in tailwind_directives:
                if directive not in css_content:
                    missing_directives.append(directive)
            
            if missing_directives:
                print(f"  🔧 Agregando directivas Tailwind faltantes...")
                
                # Agregar directivas al inicio del CSS
                new_content = '\n'.join(missing_directives) + '\n\n' + css_content
                
                with open(globals_css_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                print(f"    ✅ Agregadas: {', '.join(missing_directives)}")
                return True
            else:
                print(f"  ✅ globals.css tiene todas las directivas Tailwind")
                return False
                
        except Exception as e:
            print(f"  ❌ Error verificando globals.css: {e}")
            return False

    def verify_tailwind_config(self, app_name: str) -> bool:
        """Verificar configuración de Tailwind"""
        app_path = self.apps_dir / app_name
        tailwind_config_path = app_path / "tailwind.config.js"
        
        if not tailwind_config_path.exists():
            print(f"  ⚠️  tailwind.config.js no encontrado")
            return False
        
        try:
            with open(tailwind_config_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Verificar que tenga content paths configurados
            if 'content:' not in content:
                print(f"  ⚠️  tailwind.config.js sin configuración 'content'")
                return False
            
            # Verificar paths comunes
            common_paths = [
                './src/**/*.{js,ts,jsx,tsx,mdx}',
                './pages/**/*.{js,ts,jsx,tsx,mdx}',
                './components/**/*.{js,ts,jsx,tsx,mdx}',
                './app/**/*.{js,ts,jsx,tsx,mdx}'
            ]
            
            missing_paths = []
            for path in common_paths:
                if path not in content:
                    missing_paths.append(path)
            
            if missing_paths:
                print(f"  ⚠️  Posibles paths faltantes en tailwind.config.js:")
                for path in missing_paths:
                    print(f"    - {path}")
            
            print(f"  ✅ tailwind.config.js configurado")
            return True
            
        except Exception as e:
            print(f"  ❌ Error verificando tailwind.config.js: {e}")
            return False

    def fix_app(self, app_name: str) -> dict:
        """Corregir una app específica"""
        self.print_header(f"Corrigiendo Configuración de {app_name}")
        
        app_path = self.apps_dir / app_name
        if not app_path.exists():
            return {"success": False, "error": f"App {app_name} no existe"}
        
        fixes_applied = []
        
        # 1. Intentar restaurar desde backup primero
        print(f"🔍 Verificando backups...")
        if self.restore_from_backup(app_name):
            fixes_applied.append("Archivos restaurados desde backup")
        
        # 2. Arreglar consistencia de configuración
        print(f"🔍 Verificando consistencia de configuración...")
        if self.fix_config_consistency(app_name):
            fixes_applied.append("Configuración de ES modules arreglada")
        
        # 3. Arreglar configuración CSS/Tailwind
        print(f"🔍 Verificando configuración CSS...")
        if self.fix_css_config(app_name):
            fixes_applied.append("Configuración CSS/Tailwind corregida")
        
        # 4. Verificar Tailwind config
        print(f"🔍 Verificando Tailwind...")
        self.verify_tailwind_config(app_name)
        
        result = {
            "success": True,
            "fixes_applied": fixes_applied,
            "total_fixes": len(fixes_applied)
        }
        
        if fixes_applied:
            print(f"\n✅ Correcciones aplicadas:")
            for fix in fixes_applied:
                print(f"  - {fix}")
        else:
            print(f"\nℹ️  No se requirieron correcciones")
        
        return result

    def fix_all_apps(self):
        """Corregir todas las apps"""
        self.print_header("Corrección de Conflictos de Configuración - AltaMedica")
        print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🎯 Problema detectado: Conflictos entre package.json y next.config.js")
        print(f"   Esto puede causar que Tailwind CSS no funcione correctamente")
        
        results = {}
        total_fixes = 0
        
        for app_name in self.nextjs_apps:
            result = self.fix_app(app_name)
            results[app_name] = result
            total_fixes += result.get("total_fixes", 0)
        
        # Resumen final
        self.print_header("Resumen de Correcciones")
        print(f"📊 Apps procesadas: {len(self.nextjs_apps)}")
        print(f"🔧 Total de correcciones aplicadas: {total_fixes}")
        
        if total_fixes > 0:
            print(f"\n🎉 Correcciones completadas!")
            print(f"💡 Recomendaciones:")
            print(f"   1. Detén todos los servidores (Ctrl+C)")
            print(f"   2. Reinicia los servidores para aplicar cambios")
            print(f"   3. Verifica que http://localhost:3000 muestre correctamente con estilos")
        else:
            print(f"\nℹ️  No se encontraron problemas de configuración")
        
        return results

def main():
    """Función principal"""
    fixer = ConfigFixer()
    
    try:
        results = fixer.fix_all_apps()
        
        # Determinar código de salida
        total_fixes = sum(r.get("total_fixes", 0) for r in results.values())
        
        if total_fixes > 0:
            print(f"\n🎉 ÉXITO: Configuraciones corregidas")
            sys.exit(0)
        else:
            print(f"\nℹ️  INFO: No se requirieron correcciones")
            sys.exit(0)
            
    except KeyboardInterrupt:
        print(f"\n⚠️  Corrección interrumpida")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error durante la corrección: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()