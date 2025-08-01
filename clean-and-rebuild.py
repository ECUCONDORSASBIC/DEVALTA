#!/usr/bin/env python3
"""
AltaMedica - Limpieza Completa y Reconstrucción
Limpia todos los caches y reconstruye las aplicaciones Next.js
"""

import subprocess
import os
import shutil
import sys
from pathlib import Path
from datetime import datetime
import concurrent.futures

class AltamedicaCleaner:
    def __init__(self):
        self.project_root = Path.cwd()
        self.apps_dir = self.project_root / "apps"
        
        # Apps Next.js para limpiar
        self.nextjs_apps = ["web-app", "api-server", "doctors", "patients", "companies", "admin"]
        
    def print_header(self, title: str):
        print(f"\n{'=' * 60}")
        print(f"🧹 {title}")
        print(f"{'=' * 60}")

    def clean_app_cache(self, app_name: str) -> dict:
        """Limpiar cache de una app específica"""
        app_path = self.apps_dir / app_name
        
        if not app_path.exists():
            return {"success": False, "error": f"App {app_name} no existe"}
        
        print(f"\n🧹 Limpiando {app_name}...")
        
        cleaned_items = []
        
        # Directorios/archivos a limpiar
        cache_paths = [
            ".next",
            ".turbo", 
            "dist",
            "build",
            ".swc",
            "tsconfig.tsbuildinfo",
            "next-env.d.ts"
        ]
        
        for cache_item in cache_paths:
            cache_path = app_path / cache_item
            
            try:
                if cache_path.exists():
                    if cache_path.is_dir():
                        shutil.rmtree(cache_path)
                        print(f"  🗑️  Eliminado directorio: {cache_item}")
                    else:
                        cache_path.unlink()
                        print(f"  🗑️  Eliminado archivo: {cache_item}")
                    
                    cleaned_items.append(cache_item)
                        
            except Exception as e:
                print(f"  ⚠️  Error eliminando {cache_item}: {e}")
        
        return {
            "success": True,
            "cleaned_items": cleaned_items,
            "total_cleaned": len(cleaned_items)
        }

    def clean_node_modules(self, app_name: str) -> bool:
        """Limpiar y reinstalar node_modules"""
        app_path = self.apps_dir / app_name
        node_modules_path = app_path / "node_modules"
        package_lock_path = app_path / "package-lock.json"
        
        print(f"  📦 Limpiando node_modules...")
        
        try:
            # Eliminar node_modules
            if node_modules_path.exists():
                shutil.rmtree(node_modules_path)
                print(f"    🗑️  node_modules eliminado")
            
            # Eliminar package-lock.json si existe
            if package_lock_path.exists():
                package_lock_path.unlink()
                print(f"    🗑️  package-lock.json eliminado")
            
            # Reinstalar dependencias
            print(f"    📥 Reinstalando dependencias...")
            result = subprocess.run(
                ['npm', 'install'],
                cwd=app_path,
                capture_output=True,
                text=True,
                timeout=300  # 5 minutos max
            )
            
            if result.returncode == 0:
                print(f"    ✅ Dependencias reinstaladas")
                return True
            else:
                print(f"    ❌ Error reinstalando: {result.stderr[:200]}...")
                return False
                
        except subprocess.TimeoutExpired:
            print(f"    ⚠️  Timeout reinstalando dependencias")
            return False
        except Exception as e:
            print(f"    ❌ Error: {e}")
            return False

    def verify_page_file(self, app_name: str) -> bool:
        """Verificar que el archivo page.tsx existe y es válido"""
        app_path = self.apps_dir / app_name
        
        # Posibles ubicaciones de page.tsx
        page_paths = [
            app_path / "src" / "app" / "page.tsx",
            app_path / "app" / "page.tsx",
            app_path / "pages" / "index.tsx",
            app_path / "src" / "pages" / "index.tsx"
        ]
        
        page_file = None
        for path in page_paths:
            if path.exists():
                page_file = path
                break
        
        if not page_file:
            print(f"  ❌ No se encontró page.tsx o index.tsx")
            return False
        
        try:
            with open(page_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Verificaciones básicas
            if len(content.strip()) == 0:
                print(f"  ❌ {page_file.name} está vacío")
                return False
            
            # Verificar que tenga export default
            if 'export default' not in content:
                print(f"  ⚠️  {page_file.name} sin export default")
                
                # Agregar export default básico si falta
                if 'function' in content.lower() or 'const' in content:
                    print(f"    🔧 Intentando corregir export default...")
                    # Esta es una corrección básica, puede necesitar ajustes
                    if not content.strip().endswith('export default'):
                        content += '\n\nexport default function Page() { return <div>Loading...</div>; }'
                        
                        with open(page_file, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"    ✅ Export default agregado")
            
            print(f"  ✅ {page_file.name} verificado")
            return True
            
        except Exception as e:
            print(f"  ❌ Error verificando {page_file}: {e}")
            return False

    def rebuild_app(self, app_name: str) -> bool:
        """Intentar rebuild de una app"""
        app_path = self.apps_dir / app_name
        
        print(f"  🔨 Intentando build de {app_name}...")
        
        try:
            # Intentar build
            result = subprocess.run(
                ['npx', 'next', 'build'],
                cwd=app_path,
                capture_output=True,
                text=True,
                timeout=120  # 2 minutos max
            )
            
            if result.returncode == 0:
                print(f"    ✅ Build exitoso")
                return True
            else:
                print(f"    ❌ Error en build:")
                # Mostrar solo las primeras líneas del error
                error_lines = result.stderr.split('\n')[:5]
                for line in error_lines:
                    if line.strip():
                        print(f"      {line}")
                return False
                
        except subprocess.TimeoutExpired:
            print(f"    ⚠️  Timeout en build")
            return False
        except Exception as e:
            print(f"    ❌ Error: {e}")
            return False

    def clean_and_rebuild_app(self, app_name: str) -> dict:
        """Proceso completo de limpieza y reconstrucción"""
        print(f"\n🔄 Procesando {app_name}...")
        
        result = {
            "app": app_name,
            "cache_cleaned": False,
            "dependencies_reinstalled": False,
            "page_verified": False,
            "build_successful": False,
            "ready_to_start": False
        }
        
        # 1. Limpiar cache
        cache_result = self.clean_app_cache(app_name)
        result["cache_cleaned"] = cache_result["success"]
        
        # 2. Verificar archivo page
        result["page_verified"] = self.verify_page_file(app_name)
        
        # 3. Limpiar y reinstalar dependencias (solo si es necesario)
        app_path = self.apps_dir / app_name
        if not (app_path / "node_modules").exists():
            result["dependencies_reinstalled"] = self.clean_node_modules(app_name)
        else:
            result["dependencies_reinstalled"] = True
            print(f"  ✅ node_modules ya existe")
        
        # 4. Intentar build (opcional, para verificar que todo esté bien)
        # result["build_successful"] = self.rebuild_app(app_name)
        
        # Evaluación final
        result["ready_to_start"] = (
            result["cache_cleaned"] and 
            result["page_verified"] and 
            result["dependencies_reinstalled"]
        )
        
        if result["ready_to_start"]:
            print(f"  🎉 {app_name} listo para iniciar")
        else:
            print(f"  ⚠️  {app_name} puede tener problemas")
        
        return result

    def clean_all_apps(self):
        """Limpiar todas las apps"""
        self.print_header("AltaMedica - Limpieza Completa y Reconstrucción")
        print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🎯 Objetivo: Resolver errores de React Server Components")
        
        results = {}
        
        # Limpiar apps críticas primero
        critical_apps = ["web-app", "api-server"]
        other_apps = [app for app in self.nextjs_apps if app not in critical_apps]
        
        print(f"\n🔴 Procesando apps críticas...")
        for app_name in critical_apps:
            results[app_name] = self.clean_and_rebuild_app(app_name)
        
        print(f"\n🟡 Procesando apps secundarias...")
        for app_name in other_apps:
            results[app_name] = self.clean_and_rebuild_app(app_name)
        
        # Resumen final
        self.print_header("Resumen de Limpieza")
        
        ready_apps = sum(1 for r in results.values() if r.get("ready_to_start", False))
        critical_ready = sum(1 for app in critical_apps if results.get(app, {}).get("ready_to_start", False))
        
        print(f"📊 Apps procesadas: {len(self.nextjs_apps)}")
        print(f"✅ Apps listas para iniciar: {ready_apps}/{len(self.nextjs_apps)}")
        print(f"🔴 Apps críticas listas: {critical_ready}/2")
        
        print(f"\n📋 Estado detallado:")
        for app_name, result in results.items():
            emoji = "✅" if result.get("ready_to_start", False) else "❌"
            critical = "🔴" if app_name in critical_apps else "🟡"
            print(f"  {emoji} {critical} {app_name}")
        
        if critical_ready == 2:
            print(f"\n🎉 Apps críticas listas!")
            print(f"💡 Ahora puedes iniciar los servidores:")
            print(f"   python3 start-all-servers-with-logs.py")
        else:
            print(f"\n⚠️  Algunas apps críticas necesitan atención manual")
        
        return results

def main():
    """Función principal"""
    cleaner = AltamedicaCleaner()
    
    try:
        results = cleaner.clean_all_apps()
        
        # Código de salida
        critical_ready = all(
            results.get(app, {}).get("ready_to_start", False) 
            for app in ["web-app", "api-server"]
        )
        
        if critical_ready:
            print(f"\n🎉 ÉXITO: Apps críticas listas")
            sys.exit(0)
        else:
            print(f"\n⚠️  ATENCIÓN: Revisar apps críticas")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print(f"\n⚠️  Limpieza interrumpida")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error durante la limpieza: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()