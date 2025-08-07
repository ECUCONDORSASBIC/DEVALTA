#!/usr/bin/env python3
"""
🔧 Import Path Fixer
Sistema Python para detectar y corregir automáticamente errores de importación en el workspace
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Tuple, Set
from dataclasses import dataclass

@dataclass
class ImportError:
    """Representa un error de importación"""
    file_path: str
    line_number: int
    line_content: str
    import_path: str
    correct_path: str
    error_type: str

class ImportPathFixer:
    def __init__(self, workspace_root: str = None):
        self.workspace_root = Path(workspace_root or os.getcwd())
        self.apps_dir = self.workspace_root / "apps"
        self.import_errors: List[ImportError] = []
        
        print("🔧 Import Path Fixer inicializado")
        print(f"📁 Workspace: {self.workspace_root}")
        
    def scan_all_import_errors(self) -> List[ImportError]:
        """Escanea todos los errores de importación en todas las apps"""
        print("\n🔍 Escaneando errores de importación...")
        
        for app_dir in self.apps_dir.iterdir():
            if app_dir.is_dir() and (app_dir / "src").exists():
                print(f"\n📱 Analizando app: {app_dir.name}")
                app_errors = self._scan_app_imports(app_dir)
                self.import_errors.extend(app_errors)
                if app_errors:
                    print(f"⚠️  {len(app_errors)} errores encontrados en {app_dir.name}")
                else:
                    print(f"✅ Sin errores en {app_dir.name}")
        
        return self.import_errors
    
    def _scan_app_imports(self, app_dir: Path) -> List[ImportError]:
        """Escanea imports en una aplicación específica"""
        errors = []
        src_dir = app_dir / "src"
        
        # Buscar todos los archivos TypeScript/JavaScript
        for file_path in src_dir.rglob("*.{tsx,ts,jsx,js}"):
            if file_path.name.startswith('.') or '.next' in str(file_path):
                continue
                
            file_errors = self._scan_file_imports(file_path, app_dir)
            errors.extend(file_errors)
        
        return errors
    
    def _scan_file_imports(self, file_path: Path, app_dir: Path) -> List[ImportError]:
        """Escanea imports en un archivo específico"""
        errors = []
        
        try:
            content = file_path.read_text(encoding='utf-8')
            lines = content.split('\n')
            
            for line_num, line in enumerate(lines, 1):
                line = line.strip()
                if line.startswith('import ') and ('from ' in line):
                    import_match = re.search(r'from\s+[\'"]([^\'"]+)[\'"]', line)
                    if import_match:
                        import_path = import_match.group(1)
                        
                        # Verificar si es una importación relativa problemática
                        if import_path.startswith('.'):
                            error = self._check_relative_import(
                                file_path, line_num, line, import_path, app_dir
                            )
                            if error:
                                errors.append(error)
        
        except Exception as e:
            print(f"⚠️ Error leyendo {file_path}: {e}")
        
        return errors
    
    def _check_relative_import(self, file_path: Path, line_num: int, line: str, 
                             import_path: str, app_dir: Path) -> ImportError:
        """Verifica si una importación relativa es correcta"""
        
        # Calcular la ruta absoluta del import
        file_dir = file_path.parent
        
        # Resolver la ruta relativa
        try:
            resolved_path = (file_dir / import_path).resolve()
            
            # Verificar si existe como .ts, .tsx, .js, .jsx o como directorio
            possible_files = [
                resolved_path.with_suffix('.ts'),
                resolved_path.with_suffix('.tsx'),
                resolved_path.with_suffix('.js'),
                resolved_path.with_suffix('.jsx'),
                resolved_path / 'index.ts',
                resolved_path / 'index.tsx',
                resolved_path / 'index.js',
                resolved_path / 'index.jsx',
            ]
            
            # Si ninguno existe, es un error
            if not any(p.exists() for p in possible_files) and not resolved_path.is_dir():
                # Intentar encontrar la ruta correcta
                correct_path = self._find_correct_import_path(file_path, import_path, app_dir)
                
                if correct_path:
                    return ImportError(
                        file_path=str(file_path),
                        line_number=line_num,
                        line_content=line,
                        import_path=import_path,
                        correct_path=correct_path,
                        error_type="incorrect_relative_path"
                    )
        
        except Exception:
            # Error al resolver la ruta, probablemente incorrecta
            correct_path = self._find_correct_import_path(file_path, import_path, app_dir)
            if correct_path:
                return ImportError(
                    file_path=str(file_path),
                    line_number=line_num,
                    line_content=line,
                    import_path=import_path,
                    correct_path=correct_path,
                    error_type="invalid_relative_path"
                )
        
        return None
    
    def _find_correct_import_path(self, file_path: Path, import_path: str, app_dir: Path) -> str:
        """Encuentra la ruta correcta para una importación"""
        src_dir = app_dir / "src"
        file_dir = file_path.parent
        
        # Extraer el último segmento del import (lo que se está importando)
        import_segments = import_path.split('/')
        target = import_segments[-1] if import_segments else import_path
        
        # Buscar directorios/archivos que coincidan
        common_targets = {
            'components': 'components',
            'hooks': 'hooks',
            'utils': 'utils',
            'services': 'services',
            'types': 'types',
            'lib': 'lib',
            'config': 'config'
        }
        
        # Si el target es uno de los directorios comunes
        if target in common_targets:
            target_dir = src_dir / common_targets[target]
            if target_dir.exists():
                # Calcular ruta relativa desde file_dir a target_dir
                try:
                    relative_path = os.path.relpath(target_dir, file_dir)
                    return relative_path.replace(os.sep, '/')
                except ValueError:
                    return None
        
        # Buscar archivos/directorios que contengan el target
        for search_path in src_dir.rglob("*"):
            if search_path.name == target or search_path.stem == target:
                try:
                    if search_path.is_file():
                        # Es un archivo, usar sin extensión
                        relative_path = os.path.relpath(search_path.with_suffix(''), file_dir)
                    else:
                        # Es un directorio
                        relative_path = os.path.relpath(search_path, file_dir)
                    
                    return relative_path.replace(os.sep, '/')
                except ValueError:
                    continue
        
        return None
    
    def fix_all_imports(self) -> int:
        """Corrige automáticamente todos los errores de importación"""
        if not self.import_errors:
            print("✅ No hay errores de importación para corregir")
            return 0
        
        print(f"\n🔧 Corrigiendo {len(self.import_errors)} errores de importación...")
        
        fixed_count = 0
        
        # Agrupar errores por archivo
        errors_by_file = {}
        for error in self.import_errors:
            if error.file_path not in errors_by_file:
                errors_by_file[error.file_path] = []
            errors_by_file[error.file_path].append(error)
        
        # Corregir cada archivo
        for file_path, file_errors in errors_by_file.items():
            fixed = self._fix_file_imports(Path(file_path), file_errors)
            fixed_count += fixed
        
        return fixed_count
    
    def _fix_file_imports(self, file_path: Path, errors: List[ImportError]) -> int:
        """Corrige los errores de importación en un archivo específico"""
        try:
            content = file_path.read_text(encoding='utf-8')
            lines = content.split('\n')
            
            # Ordenar errores por línea (de mayor a menor para no cambiar números de línea)
            errors.sort(key=lambda e: e.line_number, reverse=True)
            
            fixed_count = 0
            
            for error in errors:
                if error.line_number <= len(lines):
                    old_line = lines[error.line_number - 1]
                    new_line = old_line.replace(
                        f'"{error.import_path}"', 
                        f'"{error.correct_path}"'
                    ).replace(
                        f"'{error.import_path}'", 
                        f"'{error.correct_path}'"
                    )
                    
                    if new_line != old_line:
                        lines[error.line_number - 1] = new_line
                        fixed_count += 1
                        print(f"✅ Corregido en {file_path.name}:{error.line_number}")
                        print(f"   {error.import_path} → {error.correct_path}")
            
            if fixed_count > 0:
                # Escribir el archivo corregido
                file_path.write_text('\n'.join(lines), encoding='utf-8')
                print(f"💾 Archivo guardado: {file_path}")
            
            return fixed_count
            
        except Exception as e:
            print(f"❌ Error corrigiendo {file_path}: {e}")
            return 0
    
    def generate_report(self) -> str:
        """Genera un reporte de errores de importación"""
        if not self.import_errors:
            return "✅ No se encontraron errores de importación"
        
        report = f"""# 🔧 Reporte de Errores de Importación

**Total de errores:** {len(self.import_errors)}

## 📊 Resumen por Tipo

"""
        
        # Agrupar por tipo de error
        errors_by_type = {}
        for error in self.import_errors:
            if error.error_type not in errors_by_type:
                errors_by_type[error.error_type] = []
            errors_by_type[error.error_type].append(error)
        
        for error_type, errors in errors_by_type.items():
            report += f"### {error_type}\n"
            report += f"**Cantidad:** {len(errors)}\n\n"
            
            for error in errors[:5]:  # Mostrar solo los primeros 5
                file_name = Path(error.file_path).name
                report += f"- `{file_name}:{error.line_number}` - `{error.import_path}` → `{error.correct_path}`\n"
            
            if len(errors) > 5:
                report += f"- ... y {len(errors) - 5} más\n"
            
            report += "\n"
        
        report += "## 📁 Errores por Archivo\n\n"
        
        # Agrupar por archivo
        errors_by_file = {}
        for error in self.import_errors:
            if error.file_path not in errors_by_file:
                errors_by_file[error.file_path] = []
            errors_by_file[error.file_path].append(error)
        
        for file_path, errors in errors_by_file.items():
            relative_path = Path(file_path).relative_to(self.workspace_root)
            report += f"### {relative_path}\n"
            report += f"**Errores:** {len(errors)}\n\n"
            
            for error in errors:
                report += f"- Línea {error.line_number}: `{error.import_path}` → `{error.correct_path}`\n"
            
            report += "\n"
        
        return report
    
    def save_report(self):
        """Guarda el reporte de errores"""
        output_dir = self.workspace_root / "tools" / "python" / "generated"
        output_dir.mkdir(exist_ok=True)
        
        report_path = output_dir / "IMPORT_ERRORS_REPORT.md"
        report_path.write_text(self.generate_report(), encoding='utf-8')
        print(f"📄 Reporte guardado: {report_path}")

def main():
    """Función principal"""
    print("🔧 Import Path Fixer")
    print("="*50)
    
    fixer = ImportPathFixer()
    
    # Escanear errores
    errors = fixer.scan_all_import_errors()
    
    if not errors:
        print("\n✅ ¡No se encontraron errores de importación!")
        return
    
    print(f"\n⚠️  Total de errores encontrados: {len(errors)}")
    
    # Generar reporte
    fixer.save_report()
    
    # Preguntar si corregir automáticamente
    print(f"\n🔧 ¿Corregir automáticamente {len(errors)} errores? (y/N): ", end="")
    try:
        response = input().strip().lower()
        if response in ['y', 'yes', 's', 'si']:
            fixed = fixer.fix_all_imports()
            print(f"\n✅ {fixed} errores corregidos exitosamente")
            print("🔄 Recomendación: Limpiar caché de Next.js (rm -rf .next)")
        else:
            print("❌ Corrección cancelada")
    except KeyboardInterrupt:
        print("\n❌ Operación cancelada")
    
    print(f"\n📄 Ver reporte completo en: tools/python/generated/IMPORT_ERRORS_REPORT.md")

if __name__ == "__main__":
    main()
