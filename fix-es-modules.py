#!/usr/bin/env python3
"""
AltaMedica - Corrección de Errores ES Modules
Script específico para corregir problemas de ES modules en Next.js
"""

import json
import os
import sys
import subprocess
from pathlib import Path
from datetime import datetime

class ESModulesFixer:
    def __init__(self):
        self.project_root = Path.cwd()
        self.apps_dir = self.project_root / "apps"
        
    def print_header(self, title: str):
        print(f"\n{'=' * 60}")
        print(f"🔧 {title}")
        print(f"{'=' * 60}")

    def fix_package_json_es_modules(self, app_name: str) -> bool:
        """Corregir configuración ES modules en package.json"""
        app_path = self.apps_dir / app_name
        package_json_path = app_path / "package.json"
        
        if not package_json_path.exists():
            print(f"❌ package.json no encontrado en {app_name}")
            return False
        
        try:
            # Leer package.json actual
            with open(package_json_path, 'r', encoding='utf-8') as f:
                package_data = json.load(f)
            
            original_data = package_data.copy()
            changes_made = False
            
            print(f"🔍 Analizando package.json de {app_name}...")
            
            # Verificar si tiene "type": "module"
            if package_data.get("type") == "module":
                print(f"  ⚠️  Encontrado 'type': 'module' - esto puede causar problemas con Next.js")
                
                # Para apps Next.js, remover "type": "module"
                if app_name in ["web-app", "api-server", "doctors", "patients", "companies", "admin"]:
                    del package_data["type"]
                    changes_made = True
                    print(f"  🔧 Removido 'type': 'module' para compatibilidad con Next.js")
            
            # Verificar configuración de next.config.js para ES modules
            next_config_path = app_path / "next.config.js"
            if next_config_path.exists():
                # Renombrar a .mjs si es necesario para ES modules
                if package_data.get("type") == "module":
                    new_next_config = app_path / "next.config.mjs"
                    if not new_next_config.exists():
                        os.rename(next_config_path, new_next_config)
                        print(f"  🔧 Renombrado next.config.js a next.config.mjs")
            
            # Guardar cambios si se hicieron
            if changes_made:
                with open(package_json_path, 'w', encoding='utf-8') as f:
                    json.dump(package_data, f, indent=2, ensure_ascii=False)
                print(f"  ✅ package.json actualizado")
                return True
            else:
                print(f"  ℹ️  No se requirieron cambios")
                return False
                
        except Exception as e:
            print(f"  ❌ Error procesando package.json: {e}")
            return False

    def fix_next_config(self, app_name: str) -> bool:
        """Corregir configuración de next.config.js"""
        app_path = self.apps_dir / app_name
        
        # Buscar archivos de configuración Next.js
        config_files = ["next.config.js", "next.config.mjs", "next.config.ts"]
        config_path = None
        
        for config_file in config_files:
            potential_path = app_path / config_file
            if potential_path.exists():
                config_path = potential_path
                break
        
        if not config_path:
            print(f"  ⚠️  No se encontró next.config.js en {app_name}")
            return False
        
        try:
            # Leer configuración actual
            with open(config_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            print(f"🔍 Analizando {config_path.name}...")
            
            # Agregar configuración experimental para ES modules si no existe
            experimental_config = """
  experimental: {
    esmExternals: 'loose',
  },"""
            
            if 'experimental:' not in content and 'esmExternals' not in content:
                # Buscar donde insertar la configuración
                if 'module.exports = {' in content:
                    # CommonJS format
                    insert_point = content.find('module.exports = {') + len('module.exports = {')
                    content = content[:insert_point] + experimental_config + content[insert_point:]
                elif 'export default {' in content:
                    # ES modules format
                    insert_point = content.find('export default {') + len('export default {')
                    content = content[:insert_point] + experimental_config + content[insert_point:]
                
                if content != original_content:
                    with open(config_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"  ✅ Agregada configuración experimental para ES modules")
                    return True
            
            print(f"  ℹ️  Configuración ya presente o no necesaria")
            return False
            
        except Exception as e:
            print(f"  ❌ Error procesando next.config: {e}")
            return False

    def fix_postcss_config(self, app_name: str) -> bool:
        """Corregir configuración de PostCSS"""
        app_path = self.apps_dir / app_name
        postcss_config_path = app_path / "postcss.config.js"
        
        if not postcss_config_path.exists():
            return False
        
        try:
            with open(postcss_config_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Si usa ES modules syntax pero el package.json no tiene "type": "module"
            if 'export default' in content:
                # Convertir a CommonJS
                content = content.replace('export default', 'module.exports =')
                
                with open(postcss_config_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print(f"  ✅ PostCSS config convertido a CommonJS")
                return True
                
        except Exception as e:
            print(f"  ❌ Error procesando postcss.config.js: {e}")
            
        return False

    def fix_tailwind_config(self, app_name: str) -> bool:
        """Corregir configuración de Tailwind"""
        app_path = self.apps_dir / app_name
        tailwind_config_path = app_path / "tailwind.config.js"
        
        if not tailwind_config_path.exists():
            return False
        
        try:
            with open(tailwind_config_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Similar fix para Tailwind
            if 'export default' in content:
                content = content.replace('export default', 'module.exports =')
                
                with open(tailwind_config_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print(f"  ✅ Tailwind config convertido a CommonJS")
                return True
                
        except Exception as e:
            print(f"  ❌ Error procesando tailwind.config.js: {e}")
            
        return False

    def create_backup(self, app_name: str):
        """Crear backup antes de hacer cambios"""
        app_path = self.apps_dir / app_name
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        backup_dir = app_path / f"backup_es_modules_{timestamp}"
        backup_dir.mkdir(exist_ok=True)
        
        # Backup de archivos importantes
        files_to_backup = ["package.json", "next.config.js", "next.config.mjs", "postcss.config.js", "tailwind.config.js"]
        
        backed_up = []
        for file_name in files_to_backup:
            file_path = app_path / file_name
            if file_path.exists():
                backup_path = backup_dir / file_name
                import shutil
                shutil.copy2(file_path, backup_path)
                backed_up.append(file_name)
        
        if backed_up:
            print(f"  💾 Backup creado: {backup_dir}")
            print(f"     Archivos: {', '.join(backed_up)}")

    def fix_app(self, app_name: str) -> dict:
        """Aplicar todas las correcciones a una app"""
        self.print_header(f"Corrigiendo ES Modules en {app_name}")
        
        app_path = self.apps_dir / app_name
        if not app_path.exists():
            return {"success": False, "error": f"App {app_name} no existe"}
        
        # Crear backup
        self.create_backup(app_name)
        
        fixes_applied = []
        
        # 1. Corregir package.json
        if self.fix_package_json_es_modules(app_name):
            fixes_applied.append("package.json corregido")
        
        # 2. Corregir next.config.js
        if self.fix_next_config(app_name):
            fixes_applied.append("next.config.js actualizado")
        
        # 3. Corregir postcss.config.js
        if self.fix_postcss_config(app_name):
            fixes_applied.append("postcss.config.js corregido")
        
        # 4. Corregir tailwind.config.js
        if self.fix_tailwind_config(app_name):
            fixes_applied.append("tailwind.config.js corregido")
        
        result = {
            "success": True,
            "fixes_applied": fixes_applied,
            "total_fixes": len(fixes_applied)
        }
        
        if fixes_applied:
            print(f"\n✅ Correcciones aplicadas a {app_name}:")
            for fix in fixes_applied:
                print(f"  - {fix}")
        else:
            print(f"\nℹ️  No se requirieron correcciones para {app_name}")
        
        return result

    def fix_all_apps(self):
        """Corregir todas las apps con problemas de ES modules"""
        self.print_header("Corrección de ES Modules - AltaMedica")
        print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Apps Next.js que pueden tener problemas de ES modules
        apps_to_fix = ["api-server", "web-app", "doctors", "patients", "companies", "admin"]
        
        results = {}
        total_fixes = 0
        
        for app_name in apps_to_fix:
            result = self.fix_app(app_name)
            results[app_name] = result
            total_fixes += result.get("total_fixes", 0)
        
        # Resumen final
        self.print_header("Resumen de Correcciones")
        print(f"📊 Apps procesadas: {len(apps_to_fix)}")
        print(f"🔧 Total de correcciones aplicadas: {total_fixes}")
        
        if total_fixes > 0:
            print(f"\n🎉 Correcciones completadas. Reinicia los servidores para aplicar cambios.")
            print(f"💡 Comando sugerido:")
            print(f"   cd apps/api-server && npm run dev")
        else:
            print(f"\nℹ️  No se encontraron problemas de ES modules")

def main():
    """Función principal"""
    fixer = ESModulesFixer()
    
    try:
        fixer.fix_all_apps()
        sys.exit(0)
    except KeyboardInterrupt:
        print(f"\n⚠️  Corrección interrumpida")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error durante la corrección: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()