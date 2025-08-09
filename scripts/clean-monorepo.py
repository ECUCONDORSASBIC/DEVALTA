#!/usr/bin/env python3
"""
🧹 Script de Limpieza Avanzada del Monorepo AltaMedica

Características:
- Limpieza selectiva por categorías
- Estimación de espacio en disco
- Modo dry-run (--dry-run)
- Estadísticas detalladas
- Múltiples opciones de filtrado
- Análisis de dependencias específicas
- Soporte para múltiples plataformas
- Manejo de permisos y PATH automático

Ejecutar desde la raíz del proyecto con: python scripts/clean-monorepo.py
"""

import os
import sys
import shutil
import argparse
import subprocess
from pathlib import Path
from typing import Dict, List, Set
import json
import time
import platform
import stat

class MonorepoCleanup:
    def __init__(self):
        self.root_dir = Path.cwd()
        self.is_windows = platform.system() == 'Windows'
        self.targets = {
            'node_modules': [],
            'next_dirs': [],
            'dist_dirs': [],
            'lock_files': [],
            'cache_files': [],
            'log_files': [],
            'build_dirs': [],
            'temp_dirs': [],
            'coverage_dirs': [],
            'test_dirs': [],
            'python_cache': [],
            'docker_files': []
        }
        self.total_size = 0
        self.specific_packages = {
            'firebase': [],
            'react': [],
            'maps': [],
            'video': [],
            'auth': []
        }
        self.path_issues = []
        self.permission_issues = []

    def check_and_fix_permissions(self, path: Path) -> bool:
        """Verifica y corrige permisos de archivos/directorios"""
        try:
            if self.is_windows:
                # En Windows, intentar cambiar atributos de solo lectura
                if path.exists():
                    # Remover atributo de solo lectura recursivamente
                    if path.is_dir():
                        for root, dirs, files in os.walk(path):
                            for dir_name in dirs:
                                dir_path = Path(root) / dir_name
                                try:
                                    dir_path.chmod(stat.S_IWRITE | stat.S_IREAD | stat.S_IEXEC)
                                except (OSError, PermissionError):
                                    pass
                            for file_name in files:
                                file_path = Path(root) / file_name
                                try:
                                    file_path.chmod(stat.S_IWRITE | stat.S_IREAD)
                                except (OSError, PermissionError):
                                    pass
                    else:
                        path.chmod(stat.S_IWRITE | stat.S_IREAD)
            else:
                # En Unix/Linux, asegurar permisos de escritura
                if path.is_dir():
                    path.chmod(0o755)
                else:
                    path.chmod(0o644)
            return True
        except (OSError, PermissionError) as e:
            self.permission_issues.append(f"{path}: {e}")
            return False

    def check_path_length(self, path: Path) -> bool:
        """Verifica si la ruta es demasiado larga (problema en Windows)"""
        path_str = str(path.absolute())
        if self.is_windows and len(path_str) > 260:
            self.path_issues.append(f"Ruta demasiado larga: {path_str}")
            return False
        return True

    def setup_environment(self):
        """Configura el entorno y PATH para evitar problemas"""
        print("🔧 Configurando entorno...")
        
        # Verificar Python
        python_version = sys.version_info
        if python_version < (3, 6):
            print("⚠️ Advertencia: Se recomienda Python 3.6 o superior")
        
        # Verificar herramientas necesarias
        tools_to_check = ['pnpm', 'node', 'npm']
        missing_tools = []
        
        for tool in tools_to_check:
            try:
                # Probar diferentes formas de ejecutar la herramienta
                commands_to_try = [
                    [tool, '--version'],
                    [tool + '.cmd', '--version'] if self.is_windows else [tool, '--version'],
                    ['npx', tool, '--version'] if tool != 'node' else [tool, '--version']
                ]
                
                success = False
                version_output = ""
                
                for cmd in commands_to_try:
                    try:
                        result = subprocess.run(cmd, 
                                              capture_output=True, 
                                              text=True, 
                                              timeout=10)
                        if result.returncode == 0:
                            version_output = result.stdout.strip()
                            success = True
                            break
                    except (subprocess.TimeoutExpired, subprocess.CalledProcessError, FileNotFoundError):
                        continue
                
                if success:
                    print(f"   ✅ {tool}: {version_output}")
                else:
                    missing_tools.append(tool)
                    
            except Exception:
                missing_tools.append(tool)
        
        if missing_tools:
            print(f"   ⚠️ Herramientas no encontradas en PATH: {', '.join(missing_tools)}")
            print("   💡 Considera agregar al PATH o usar rutas absolutas")
        
        # Verificar permisos del directorio actual
        if not os.access(self.root_dir, os.W_OK):
            print(f"   ⚠️ Sin permisos de escritura en: {self.root_dir}")
            if self.is_windows:
                print("   💡 Ejecuta como administrador o cambia permisos del directorio")
            else:
                print("   💡 Usa sudo o cambia permisos: chmod 755")
        
        # En Windows, verificar long path support
        if self.is_windows:
            try:
                # Intentar crear una ruta larga de prueba
                test_path = self.root_dir / ("x" * 200)
                if len(str(test_path.absolute())) > 260:
                    print("   ⚠️ Rutas largas pueden causar problemas en Windows")
                    print("   💡 Habilita 'Enable Win32 long paths' en el registro")
            except:
                pass

    def format_bytes(self, bytes_size: int) -> str:
        """Convierte bytes a formato legible"""
        if bytes_size == 0:
            return "0 B"
        
        sizes = ['B', 'KB', 'MB', 'GB', 'TB']
        i = 0
        while bytes_size >= 1024 and i < len(sizes) - 1:
            bytes_size /= 1024.0
            i += 1
        
        return f"{bytes_size:.2f} {sizes[i]}"

    def get_directory_size(self, path: Path) -> int:
        """Calcula el tamaño total de un directorio"""
        total_size = 0
        try:
            for dirpath, dirnames, filenames in os.walk(path):
                for filename in filenames:
                    filepath = os.path.join(dirpath, filename)
                    try:
                        total_size += os.path.getsize(filepath)
                    except (OSError, FileNotFoundError):
                        pass
        except (OSError, PermissionError):
            pass
        return total_size

    def get_file_size(self, path: Path) -> int:
        """Obtiene el tamaño de un archivo"""
        try:
            return path.stat().st_size
        except (OSError, FileNotFoundError):
            return 0

    def analyze_package_json(self, package_path: Path) -> Dict[str, bool]:
        """Analiza package.json para detectar dependencias específicas"""
        try:
            with open(package_path, 'r', encoding='utf-8') as f:
                package_data = json.load(f)
            
            all_deps = {}
            for dep_type in ['dependencies', 'devDependencies', 'peerDependencies']:
                if dep_type in package_data:
                    all_deps.update(package_data[dep_type])
            
            return {
                'firebase': any('firebase' in dep for dep in all_deps.keys()),
                'react': any(dep in ['react', 'react-dom', 'react-native'] for dep in all_deps.keys()),
                'maps': any('map' in dep.lower() or 'leaflet' in dep or 'google-maps' in dep for dep in all_deps.keys()),
                'video': any(dep in ['video.js', 'react-player', 'plyr'] or 'video' in dep for dep in all_deps.keys()),
                'auth': any('auth' in dep for dep in all_deps.keys())
            }
        except (json.JSONDecodeError, FileNotFoundError, UnicodeDecodeError):
            return {}

    def find_cleanup_targets(self, directory: Path = None):
        """Busca todos los elementos que se pueden limpiar"""
        if directory is None:
            directory = self.root_dir
        
        print(f"🔍 Escaneando: {directory.relative_to(self.root_dir) if directory != self.root_dir else '.'}")
        
        try:
            for item in directory.iterdir():
                if item.name.startswith('.git'):
                    continue
                
                if item.is_dir():
                    # Directorios específicos
                    if item.name == 'node_modules':
                        self.targets['node_modules'].append(item)
                        # Analizar package.json del directorio padre
                        package_json = item.parent / 'package.json'
                        if package_json.exists():
                            deps = self.analyze_package_json(package_json)
                            for pkg_type, has_pkg in deps.items():
                                if has_pkg:
                                    self.specific_packages[pkg_type].append(item)
                    
                    elif item.name == '.next':
                        self.targets['next_dirs'].append(item)
                    elif item.name in ['dist', 'lib']:
                        self.targets['dist_dirs'].append(item)
                    elif item.name in ['build', 'out']:
                        self.targets['build_dirs'].append(item)
                    elif item.name == 'coverage':
                        self.targets['coverage_dirs'].append(item)
                    elif item.name in ['.nyc_output', '.cache', 'tmp', 'temp']:
                        self.targets['temp_dirs'].append(item)
                    elif item.name in ['.pytest_cache', '__pycache__', '.mypy_cache']:
                        self.targets['python_cache'].append(item)
                    elif item.name in ['.turbo', '.eslintcache']:
                        self.targets['cache_files'].append(item)
                    elif item.name.startswith('test-results'):
                        self.targets['test_dirs'].append(item)
                    elif not item.name.startswith('.'):
                        # Recursivamente buscar en subdirectorios
                        self.find_cleanup_targets(item)
                
                elif item.is_file():
                    # Archivos específicos
                    if item.name in ['pnpm-lock.yaml', 'yarn.lock', 'package-lock.json']:
                        self.targets['lock_files'].append(item)
                    elif item.suffix == '.log':
                        self.targets['log_files'].append(item)
                    elif item.name in ['tsconfig.tsbuildinfo', '.DS_Store', 'Thumbs.db']:
                        self.targets['cache_files'].append(item)
                    elif item.suffix in ['.tgz', '.tar.gz']:
                        self.targets['temp_dirs'].append(item)
                    elif item.name in ['Dockerfile.tmp', 'docker-compose.override.yml']:
                        self.targets['docker_files'].append(item)
        
        except PermissionError:
            print(f"⚠️ Sin permisos para acceder a: {directory}")

    def calculate_total_size(self) -> int:
        """Calcula el tamaño total de todos los elementos a eliminar"""
        total = 0
        for category, items in self.targets.items():
            for item in items:
                if item.is_dir():
                    total += self.get_directory_size(item)
                else:
                    total += self.get_file_size(item)
        return total

    def filter_targets(self, options):
        """Filtra los targets según las opciones seleccionadas"""
        if options.all:
            return
        
        if not options.deps:
            self.targets['node_modules'] = []
            self.targets['lock_files'] = []
        
        if not options.cache:
            self.targets['next_dirs'] = []
            self.targets['cache_files'] = []
            self.targets['temp_dirs'] = []
        
        if not options.logs:
            self.targets['log_files'] = []
        
        if not options.builds:
            self.targets['dist_dirs'] = []
            self.targets['build_dirs'] = []
        
        if not options.tests:
            self.targets['coverage_dirs'] = []
            self.targets['test_dirs'] = []
        
        if not options.python:
            self.targets['python_cache'] = []
        
        if not options.docker:
            self.targets['docker_files'] = []

    def delete_item(self, item: Path, dry_run: bool = False) -> bool:
        """Elimina un archivo o directorio con manejo avanzado de permisos"""
        if dry_run:
            return True
        
        try:
            # Verificar longitud de ruta
            if not self.check_path_length(item):
                return False
            
            # Intentar corregir permisos antes de eliminar
            self.check_and_fix_permissions(item)
            
            if item.is_dir():
                # Para directorios, usar método específico según plataforma
                if self.is_windows:
                    # En Windows, usar comando del sistema para manejar rutas largas
                    try:
                        subprocess.run(['rmdir', '/s', '/q', str(item)], 
                                     check=True, 
                                     capture_output=True,
                                     shell=True)
                    except subprocess.CalledProcessError:
                        # Fallback a shutil
                        shutil.rmtree(item, onerror=self._handle_remove_readonly)
                else:
                    # En Unix/Linux usar shutil directamente
                    shutil.rmtree(item)
            else:
                item.unlink()
            return True
        except (OSError, PermissionError, subprocess.CalledProcessError) as e:
            print(f"❌ Error eliminando {item}: {e}")
            self.permission_issues.append(f"{item}: {e}")
            return False

    def _handle_remove_readonly(self, func, path, exc):
        """Manejador para archivos de solo lectura en Windows"""
        try:
            os.chmod(path, stat.S_IWRITE)
            func(path)
        except (OSError, PermissionError):
            pass

    def delete_elements(self, items: List[Path], category: str, dry_run: bool = False):
        """Elimina una lista de elementos"""
        if not items:
            return 0, 0
        
        print(f"\n{'🔍' if dry_run else '🗑️'} {category.replace('_', ' ').title()}:")
        
        success_count = 0
        fail_count = 0
        
        for item in items:
            relative_path = item.relative_to(self.root_dir)
            size = self.get_directory_size(item) if item.is_dir() else self.get_file_size(item)
            
            if dry_run:
                print(f"   📄 {relative_path} ({self.format_bytes(size)})")
                success_count += 1
            else:
                print(f"   Eliminando: {relative_path}... ", end='', flush=True)
                if self.delete_item(item, dry_run):
                    print(f"✅ ({self.format_bytes(size)})")
                    success_count += 1
                else:
                    print("❌")
                    fail_count += 1
        
        return success_count, fail_count

    def analyze_specific_packages(self):
        """Analiza qué paquetes específicos están instalados"""
        print("\n📦 Análisis de Dependencias Específicas:")
        
        for pkg_type, node_modules_list in self.specific_packages.items():
            if node_modules_list:
                print(f"   🔥 {pkg_type.upper()}: Detectado en {len(node_modules_list)} proyecto(s)")
                
                # Verificar paquetes específicos en node_modules
                for nm_dir in node_modules_list:
                    self.analyze_specific_node_modules(nm_dir, pkg_type)
            else:
                print(f"   ⚪ {pkg_type.upper()}: No detectado")

    def analyze_specific_node_modules(self, node_modules_dir: Path, pkg_type: str):
        """Analiza paquetes específicos dentro de node_modules"""
        try:
            packages_found = []
            
            if pkg_type == 'firebase':
                firebase_packages = [
                    'firebase', '@firebase', 'firebase-admin', 
                    'firebase-functions', 'firebase-tools'
                ]
                for pkg in firebase_packages:
                    if (node_modules_dir / pkg).exists():
                        size = self.get_directory_size(node_modules_dir / pkg)
                        packages_found.append(f"{pkg} ({self.format_bytes(size)})")
            
            elif pkg_type == 'react':
                react_packages = ['react', 'react-dom', 'react-scripts', '@types/react']
                for pkg in react_packages:
                    if (node_modules_dir / pkg).exists():
                        size = self.get_directory_size(node_modules_dir / pkg)
                        packages_found.append(f"{pkg} ({self.format_bytes(size)})")
            
            elif pkg_type == 'maps':
                map_packages = ['leaflet', 'react-leaflet', 'mapbox-gl', '@googlemaps']
                for pkg in map_packages:
                    if (node_modules_dir / pkg).exists():
                        size = self.get_directory_size(node_modules_dir / pkg)
                        packages_found.append(f"{pkg} ({self.format_bytes(size)})")
            
            if packages_found:
                relative_path = node_modules_dir.relative_to(self.root_dir)
                print(f"     📍 {relative_path}: {', '.join(packages_found)}")
        
        except Exception as e:
            pass

    def print_summary(self, dry_run: bool = False):
        """Imprime el resumen de elementos encontrados"""
        total_items = sum(len(items) for items in self.targets.values())
        
        if total_items == 0:
            print("✅ No se encontraron elementos para eliminar.")
            return
        
        # Solo calcular tamaño si no es dry run para evitar largos tiempos de espera
        if not dry_run:
            print("\n📊 Calculando tamaño total...")
            self.total_size = self.calculate_total_size()
        else:
            self.total_size = 0
        
        print(f"\n📦 Resumen de elementos encontrados:")
        print(f"   📁 node_modules: {len(self.targets['node_modules'])} directorios")
        print(f"   📁 .next builds: {len(self.targets['next_dirs'])} directorios")
        print(f"   📁 dist/build: {len(self.targets['dist_dirs']) + len(self.targets['build_dirs'])} directorios")
        print(f"   📁 test coverage: {len(self.targets['coverage_dirs']) + len(self.targets['test_dirs'])} directorios")
        print(f"   📁 temp/cache: {len(self.targets['temp_dirs'])} elementos")
        print(f"   📁 python cache: {len(self.targets['python_cache'])} directorios")
        print(f"   📄 lock files: {len(self.targets['lock_files'])} archivos")
        print(f"   📄 cache files: {len(self.targets['cache_files'])} elementos")
        print(f"   📄 log files: {len(self.targets['log_files'])} archivos")
        print(f"   📄 docker files: {len(self.targets['docker_files'])} archivos")
        print(f"   🎯 Total: {total_items} elementos")
        print(f"   💾 Espacio estimado: {self.format_bytes(self.total_size)}")
        
        # Mostrar problemas detectados
        if self.path_issues:
            print(f"\n⚠️ Problemas de ruta detectados: {len(self.path_issues)}")
            for issue in self.path_issues[:3]:  # Mostrar solo los primeros 3
                print(f"   📄 {issue}")
            if len(self.path_issues) > 3:
                print(f"   ... y {len(self.path_issues) - 3} más")
        
        if self.permission_issues:
            print(f"\n⚠️ Problemas de permisos detectados: {len(self.permission_issues)}")
            for issue in self.permission_issues[:3]:
                print(f"   📄 {issue}")
            if len(self.permission_issues) > 3:
                print(f"   ... y {len(self.permission_issues) - 3} más")
        
        # Análisis de dependencias específicas
        self.analyze_specific_packages()

    def run_cleanup(self, dry_run: bool = False):
        """Ejecuta la limpieza"""
        if dry_run:
            print('\n🔍 ELEMENTOS QUE SE ELIMINARÍAN:\n')
        else:
            print('\n🗑️ Eliminando elementos...\n')
        
        total_success = 0
        total_fail = 0
        
        # Eliminar por categorías
        categories = [
            (self.targets['node_modules'], 'dependencies (node_modules)'),
            (self.targets['next_dirs'], 'next.js builds (.next)'),
            (self.targets['dist_dirs'], 'distribution builds (dist)'),
            (self.targets['build_dirs'], 'build outputs (build/out)'),
            (self.targets['coverage_dirs'], 'test coverage'),
            (self.targets['test_dirs'], 'test cache'),
            (self.targets['python_cache'], 'python cache'),
            (self.targets['temp_dirs'], 'temporary files'),
            (self.targets['lock_files'], 'lock files'),
            (self.targets['cache_files'], 'cache files'),
            (self.targets['log_files'], 'log files'),
            (self.targets['docker_files'], 'docker temp files')
        ]
        
        for items, category in categories:
            success, fail = self.delete_elements(items, category, dry_run)
            total_success += success
            total_fail += fail
        
        # Resumen final
        print('\n📊 Resumen final:')
        if dry_run:
            print(f"   🔍 Elementos que se eliminarían: {total_success}")
            print(f"   💾 Espacio que se liberaría: {self.format_bytes(self.total_size)}")
            print('\n💡 Para ejecutar la limpieza real, quita la opción --dry-run')
        else:
            print(f"   ✅ Eliminados exitosamente: {total_success}")
            if total_fail > 0:
                print(f"   ❌ Fallos: {total_fail}")
            print(f"   💾 Espacio liberado: {self.format_bytes(self.total_size)}")
            
            if total_success > 0:
                print('\n🎉 Limpieza completada! Comandos útiles:')
                print('   pnpm install              - Reinstalar dependencias')
                print('   pnpm clean:complete        - Limpiar y reinstalar automáticamente')
                print('   pnpm fresh-install         - Reinstalar con lockfile congelado')
                
    def run_installation(self, use_frozen_lockfile: bool = False):
        """Ejecuta la instalación de dependencias después de la limpieza"""
        print('\n📦 Iniciando instalación de dependencias...')
        
        try:
            # Verificar que pnpm esté disponible
            subprocess.run(['pnpm', '--version'], 
                          capture_output=True, 
                          check=True, 
                          timeout=10)
        except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
            print('❌ pnpm no está disponible. Instalación cancelada.')
            print('💡 Instala pnpm: npm install -g pnpm')
            return False
        
        try:
            # Construir comando de instalación
            cmd = ['pnpm', 'install']
            if use_frozen_lockfile:
                cmd.append('--frozen-lockfile')
                print('🔒 Usando --frozen-lockfile para instalación exacta')
            
            print(f'⚡ Ejecutando: {" ".join(cmd)}')
            
            # Ejecutar instalación con output en tiempo real
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                universal_newlines=True,
                cwd=self.root_dir
            )
            
            # Mostrar progreso en tiempo real
            for line in process.stdout:
                if line.strip():
                    print(f'   {line.strip()}')
            
            process.wait()
            
            if process.returncode == 0:
                print('\n✅ Instalación completada exitosamente!')
                return True
            else:
                print(f'\n❌ Instalación falló con código: {process.returncode}')
                return False
                
        except subprocess.TimeoutExpired:
            print('\n⏰ La instalación tomó demasiado tiempo (timeout)')
            return False
        except Exception as e:
            print(f'\n❌ Error durante la instalación: {e}')
            return False

    def run_cleanup_and_install(self, use_frozen_lockfile: bool = False, dry_run: bool = False):
        """Ejecuta limpieza completa seguida de instalación"""
        if dry_run:
            print('🔍 MODO DRY-RUN: Simulando limpieza + instalación\n')
            self.run_cleanup(dry_run=True)
            print('\n📦 SIMULACIÓN: Se ejecutaría instalación después de la limpieza')
            if use_frozen_lockfile:
                print('   Comando: pnpm install --frozen-lockfile')
            else:
                print('   Comando: pnpm install')
            return True
        
        print('🚀 Ejecutando limpieza completa + instalación automática\n')
        
        # Paso 1: Limpieza
        self.run_cleanup(dry_run=False)
        
        # Paso 2: Pausa breve
        print('\n⏳ Esperando 2 segundos antes de la instalación...')
        time.sleep(2)
        
        # Paso 3: Instalación
        success = self.run_installation(use_frozen_lockfile)
        
        if success:
            print('\n🎉 Proceso completo exitoso: Limpieza + Instalación')
            print('💡 Tu proyecto está listo para usar!')
        else:
            print('\n⚠️ Limpieza exitosa, pero instalación falló')
            print('💡 Ejecuta manualmente: pnpm install')
        
        return success

def main():
    parser = argparse.ArgumentParser(
        description='🧹 Script de Limpieza Avanzada del Monorepo AltaMedica',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Ejemplos:
  python scripts/clean-monorepo.py                      # Limpieza completa
  python scripts/clean-monorepo.py --deps               # Solo node_modules y lock files
  python scripts/clean-monorepo.py --cache --builds     # Solo caché y builds
  python scripts/clean-monorepo.py --dry-run            # Ver qué se eliminaría
  python scripts/clean-monorepo.py --analyze            # Solo análisis de dependencias
  python scripts/clean-monorepo.py --fresh-install      # Limpieza + instalación con lockfile
  python scripts/clean-monorepo.py --install            # Limpieza + instalación normal
  python scripts/clean-monorepo.py --reset              # Reset completo (alias fresh-install)
        """)
    
    parser.add_argument('--all', '-a', action='store_true', 
                       help='Limpieza completa (por defecto)')
    parser.add_argument('--deps', '-d', action='store_true',
                       help='Solo dependencias (node_modules, lock files)')
    parser.add_argument('--cache', '-c', action='store_true',
                       help='Solo archivos de caché')
    parser.add_argument('--logs', '-l', action='store_true',
                       help='Solo archivos de log')
    parser.add_argument('--builds', '-b', action='store_true',
                       help='Solo directorios de build')
    parser.add_argument('--tests', '-t', action='store_true',
                       help='Solo archivos de test')
    parser.add_argument('--python', '-p', action='store_true',
                       help='Solo caché de Python')
    parser.add_argument('--docker', action='store_true',
                       help='Solo archivos temporales de Docker')
    parser.add_argument('--dry-run', '--dry', action='store_true',
                       help='Mostrar qué se eliminaría sin hacerlo')
    parser.add_argument('--analyze', action='store_true',
                       help='Solo análisis de dependencias (sin limpiar)')
    parser.add_argument('--fix-permissions', action='store_true',
                       help='Intentar corregir permisos antes de limpiar')
    parser.add_argument('--check-env', action='store_true',
                       help='Verificar entorno y herramientas')
    parser.add_argument('--install', action='store_true',
                       help='Instalar dependencias después de limpiar')
    parser.add_argument('--fresh-install', action='store_true',
                       help='Limpiar todo + instalar con --frozen-lockfile')
    parser.add_argument('--reset', action='store_true',
                       help='Reset completo: limpiar + instalar (alias de --fresh-install)')
    
    args = parser.parse_args()
    
    # Si no se especifica ninguna categoría, usar --all
    if not any([args.deps, args.cache, args.logs, args.builds, args.tests, args.python, args.docker]):
        args.all = True
    
    # Manejar aliases
    if args.reset:
        args.fresh_install = True
    
    print('🧹 Iniciando análisis del monorepo AltaMedica...\n')
    
    if args.dry_run:
        print('🔍 MODO DRY-RUN: Solo mostrando qué se eliminaría\n')
    elif args.analyze:
        print('📊 MODO ANÁLISIS: Solo analizando dependencias\n')
    elif args.fresh_install:
        print('🚀 MODO FRESH INSTALL: Limpieza completa + instalación con lockfile\n')
    elif args.install:
        print('📦 MODO INSTALL: Limpieza + instalación normal\n')
    
    cleanup = MonorepoCleanup()
    print(f'📁 Directorio raíz: {cleanup.root_dir}')
    print(f'💻 Sistema: {platform.system()} {platform.release()}')
    
    # Verificar entorno si se solicita
    if args.check_env:
        cleanup.setup_environment()
        return
    
    # Configurar entorno básico
    cleanup.setup_environment()
    
    # Buscar elementos
    start_time = time.time()
    cleanup.find_cleanup_targets()
    scan_time = time.time() - start_time
    print(f"\n⏱️ Escaneo completado en {scan_time:.2f} segundos")
    
    # Filtrar según opciones
    cleanup.filter_targets(args)
    
    # Mostrar resumen
    cleanup.print_summary(args.dry_run)
    
    # Ejecutar acción según opciones
    if args.analyze:
        # Solo análisis, no hacer nada más
        pass
    elif args.fresh_install or args.install:
        # Limpieza + instalación
        use_frozen = args.fresh_install
        cleanup.run_cleanup_and_install(use_frozen_lockfile=use_frozen, dry_run=args.dry_run)
    else:
        # Solo limpieza
        cleanup.run_cleanup(args.dry_run)

if __name__ == '__main__':
    main()
