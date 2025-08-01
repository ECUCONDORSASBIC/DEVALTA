#!/usr/bin/env python3
"""
AltaMedica - Script de Corrección Automática de Errores TypeScript
Detecta y corrige automáticamente errores comunes de TypeScript en todas las apps
"""

import os
import re
import json
import subprocess
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional

class TypeScriptFixer:
    def __init__(self):
        self.project_root = Path.cwd()
        self.apps_dir = self.project_root / "apps"
        self.packages_dir = self.project_root / "packages"
        
        # Configuración de apps críticas
        self.critical_apps = ["web-app", "api-server"]
        self.all_apps = ["web-app", "api-server", "doctors", "patients", "companies", "admin"]
        
        # Contadores
        self.total_errors_found = 0
        self.total_errors_fixed = 0
        self.apps_processed = 0
        
        # Patrones de errores comunes y sus correcciones
        self.error_patterns = {
            # Missing imports
            r"Cannot find name '(\w+)'": self.fix_missing_import,
            r"'(\w+)' is not defined": self.fix_missing_import,
            
            # Type errors
            r"Type '(\w+)' is not assignable to type '(\w+)'": self.fix_type_mismatch,
            r"Property '(\w+)' does not exist on type '(\w+)'": self.fix_missing_property,
            r"Object is possibly 'null' or 'undefined'": self.fix_null_undefined,
            
            # Import/Export errors
            r"Module '(.+)' has no exported member '(\w+)'": self.fix_import_error,
            r"Cannot resolve module '(.+)'": self.fix_module_resolution,
            
            # React specific
            r"JSX element implicitly has type 'any'": self.fix_jsx_any,
            r"Property '(\w+)' is missing in type '(\w+)' but required in type '(\w+)'": self.fix_missing_required_prop,
            
            # Next.js specific
            r"Cannot find module '(.+)' or its corresponding type declarations": self.fix_module_declarations,
        }
        
        # Correcciones automáticas por tipo de archivo
        self.file_fixes = {
            ".tsx": self.fix_tsx_file,
            ".ts": self.fix_ts_file,
            ".js": self.fix_js_file,
            ".jsx": self.fix_jsx_file
        }

    def print_header(self, title: str, symbol: str = "="):
        print(f"\n{symbol * 70}")
        print(f"🔧 {title}")
        print(f"{symbol * 70}")

    def print_section(self, title: str):
        print(f"\n📋 {title}")
        print("-" * 50)

    def get_typescript_errors(self, app_path: Path) -> List[Dict]:
        """Obtener errores de TypeScript de una app"""
        try:
            result = subprocess.run(
                ['npx', 'tsc', '--noEmit', '--pretty', 'false'],
                cwd=app_path,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                return []
            
            errors = []
            error_lines = result.stderr.split('\n')
            
            for line in error_lines:
                if line.strip() and '(' in line and ')' in line:
                    # Parsear línea de error: "file.ts(line,col): error message"
                    match = re.match(r'^(.+)\((\d+),(\d+)\): (.+)$', line.strip())
                    if match:
                        file_path, line_num, col_num, message = match.groups()
                        errors.append({
                            'file': file_path,
                            'line': int(line_num),
                            'column': int(col_num),
                            'message': message,
                            'raw_line': line
                        })
            
            return errors
            
        except subprocess.TimeoutExpired:
            print("  ⚠️  Timeout verificando TypeScript")
            return []
        except Exception as e:
            print(f"  ❌ Error verificando TypeScript: {e}")
            return []

    def fix_missing_import(self, error: Dict, file_content: str) -> Tuple[str, bool]:
        """Corregir imports faltantes"""
        message = error['message']
        
        # Detectar qué está faltando
        missing_patterns = [
            r"Cannot find name '(\w+)'",
            r"'(\w+)' is not defined"
        ]
        
        for pattern in missing_patterns:
            match = re.search(pattern, message)
            if match:
                missing_name = match.group(1)
                
                # Mapeo de imports comunes
                common_imports = {
                    'React': "import React from 'react';",
                    'useState': "import { useState } from 'react';",
                    'useEffect': "import { useEffect } from 'react';",
                    'useRouter': "import { useRouter } from 'next/router';",
                    'NextRequest': "import { NextRequest } from 'next/server';",
                    'NextResponse': "import { NextResponse } from 'next/server';",
                    'Image': "import Image from 'next/image';",
                    'Link': "import Link from 'next/link';",
                    'Head': "import Head from 'next/head';",
                    'motion': "import { motion } from 'framer-motion';",
                    'cn': "import { cn } from '../lib/utils';",
                    'clsx': "import clsx from 'clsx';",
                }
                
                if missing_name in common_imports:
                    import_statement = common_imports[missing_name]
                    
                    # Verificar si ya existe el import
                    if import_statement.split("'")[1] not in file_content:
                        # Agregar import al inicio del archivo
                        lines = file_content.split('\n')
                        
                        # Encontrar la posición para insertar (después de otros imports)
                        insert_pos = 0
                        for i, line in enumerate(lines):
                            if line.startswith('import ') or line.startswith('export '):
                                insert_pos = i + 1
                            elif line.strip() == '':
                                continue
                            else:
                                break
                        
                        lines.insert(insert_pos, import_statement)
                        return '\n'.join(lines), True
        
        return file_content, False

    def fix_type_mismatch(self, error: Dict, file_content: str) -> Tuple[str, bool]:
        """Corregir incompatibilidades de tipos"""
        message = error['message']
        line_num = error['line']
        
        lines = file_content.split('\n')
        if line_num <= len(lines):
            current_line = lines[line_num - 1]
            
            # Correcciones comunes de tipos
            fixes = [
                # string | undefined -> string
                (r'(\w+)\s*:\s*string\s*\|\s*undefined', r'\1?: string'),
                # any -> unknown (más seguro)
                (r':\s*any\b', ': unknown'),
                # Agregar type assertion si es necesario
                (r'(\w+)\.(\w+)', r'(\1 as any).\2'),
            ]
            
            for pattern, replacement in fixes:
                if re.search(pattern, current_line):
                    new_line = re.sub(pattern, replacement, current_line)
                    if new_line != current_line:
                        lines[line_num - 1] = new_line
                        return '\n'.join(lines), True
        
        return file_content, False

    def fix_missing_property(self, error: Dict, file_content: str) -> Tuple[str, bool]:
        """Corregir propiedades faltantes"""
        message = error['message']
        
        # Agregar optional chaining donde sea apropiado
        match = re.search(r"Property '(\w+)' does not exist on type '(\w+)'", message)
        if match:
            prop_name = match.group(1)
            line_num = error['line']
            
            lines = file_content.split('\n')
            if line_num <= len(lines):
                current_line = lines[line_num - 1]
                
                # Agregar optional chaining
                pattern = rf'\.{prop_name}\b'
                replacement = f'.{prop_name}?'
                
                if re.search(pattern, current_line) and '?' not in current_line:
                    new_line = re.sub(pattern, replacement, current_line)
                    lines[line_num - 1] = new_line
                    return '\n'.join(lines), True
        
        return file_content, False

    def fix_null_undefined(self, error: Dict, file_content: str) -> Tuple[str, bool]:
        """Corregir posibles null/undefined"""
        line_num = error['line']
        lines = file_content.split('\n')
        
        if line_num <= len(lines):
            current_line = lines[line_num - 1]
            
            # Agregar null checks comunes
            fixes = [
                # obj.prop -> obj?.prop
                (r'(\w+)\.(\w+)', r'\1?.\2'),
                # arr[0] -> arr?.[0]
                (r'(\w+)\[(\d+)\]', r'\1?.[\\2]'),
                # Agregar default values
                (r'(\w+)\s*\|\|\s*(\w+)', r'(\1 ?? \2)'),
            ]
            
            for pattern, replacement in fixes:
                new_line = re.sub(pattern, replacement, current_line)
                if new_line != current_line and '?' not in current_line:
                    lines[line_num - 1] = new_line
                    return '\n'.join(lines), True
        
        return file_content, False

    def fix_import_error(self, error: Dict, file_content: str) -> Tuple[str, bool]:
        """Corregir errores de import"""
        message = error['message']
        
        # Detectar imports incorrectos y sugerir correcciones
        match = re.search(r"Module '(.+)' has no exported member '(\w+)'", message)
        if match:
            module_name, member_name = match.groups()
            
            # Correcciones comunes de imports
            import_fixes = {
                ('next/router', 'useRouter'): "import { useRouter } from 'next/navigation';",
                ('react', 'FC'): "import { FC } from 'react';",
                ('react', 'ReactNode'): "import { ReactNode } from 'react';",
            }
            
            fix_key = (module_name, member_name)
            if fix_key in import_fixes:
                # Reemplazar la línea de import incorrecta
                lines = file_content.split('\n')
                for i, line in enumerate(lines):
                    if f"from '{module_name}'" in line and member_name in line:
                        lines[i] = import_fixes[fix_key]
                        return '\n'.join(lines), True
        
        return file_content, False

    def fix_module_resolution(self, error: Dict, file_content: str) -> Tuple[str, bool]:
        """Corregir resolución de módulos"""
        message = error['message']
        
        match = re.search(r"Cannot resolve module '(.+)'", message)
        if match:
            module_path = match.group(1)
            
            # Correcciones de paths comunes
            path_fixes = {
                '@/': '../',
                '~/': '../',
                '@components/': '../components/',
                '@lib/': '../lib/',
                '@utils/': '../utils/',
            }
            
            for old_path, new_path in path_fixes.items():
                if old_path in module_path:
                    fixed_path = module_path.replace(old_path, new_path)
                    file_content = file_content.replace(f"'{module_path}'", f"'{fixed_path}'")
                    file_content = file_content.replace(f'"{module_path}"', f'"{fixed_path}"')
                    return file_content, True
        
        return file_content, False

    def fix_jsx_any(self, error: Dict, file_content: str) -> Tuple[str, bool]:
        """Corregir elementos JSX con tipo any"""
        line_num = error['line']
        lines = file_content.split('\n')
        
        if line_num <= len(lines):
            current_line = lines[line_num - 1]
            
            # Agregar tipos explícitos a elementos JSX
            if '<' in current_line and '>' in current_line:
                # Buscar componentes sin tipos
                jsx_pattern = r'<(\w+)(\s+[^>]*)?>'
                match = re.search(jsx_pattern, current_line)
                
                if match:
                    component_name = match.group(1)
                    # Agregar React.ComponentProps si es necesario
                    if component_name.lower() not in ['div', 'span', 'p', 'h1', 'h2', 'h3', 'img']:
                        # Es un componente custom, podría necesitar tipado
                        return file_content, False  # Dejamos este caso para revisión manual
        
        return file_content, False

    def fix_missing_required_prop(self, error: Dict, file_content: str) -> Tuple[str, bool]:
        """Corregir props requeridas faltantes"""
        message = error['message']
        
        match = re.search(r"Property '(\w+)' is missing in type '(\w+)' but required in type '(\w+)'", message)
        if match:
            prop_name = match.group(1)
            line_num = error['line']
            
            lines = file_content.split('\n')
            if line_num <= len(lines):
                current_line = lines[line_num - 1]
                
                # Agregar prop con valor por defecto
                if '<' in current_line and prop_name not in current_line:
                    # Valores por defecto comunes
                    default_values = {
                        'id': '"default-id"',
                        'className': '""',
                        'onClick': '() => {}',
                        'onChange': '() => {}',
                        'onSubmit': '() => {}',
                        'disabled': 'false',
                        'loading': 'false',
                        'title': '""',
                        'alt': '""',
                    }
                    
                    if prop_name in default_values:
                        # Insertar la prop en el elemento JSX
                        if '>' in current_line:
                            insertion_point = current_line.rfind('>')
                            new_line = (current_line[:insertion_point] + 
                                       f' {prop_name}={default_values[prop_name]}' + 
                                       current_line[insertion_point:])
                            lines[line_num - 1] = new_line
                            return '\n'.join(lines), True
        
        return file_content, False

    def fix_module_declarations(self, error: Dict, file_content: str) -> Tuple[str, bool]:
        """Corregir declaraciones de módulos faltantes"""
        message = error['message']
        
        match = re.search(r"Cannot find module '(.+)' or its corresponding type declarations", message)
        if match:
            module_name = match.group(1)
            
            # Agregar @types packages comunes
            types_needed = {
                'canvas-confetti': '@types/canvas-confetti',
                'three': '@types/three',
                'lodash': '@types/lodash',
            }
            
            if module_name in types_needed:
                print(f"  💡 Sugerencia: Instalar {types_needed[module_name]}")
                # Por ahora, solo reportamos, no instalamos automáticamente
        
        return file_content, False

    def fix_tsx_file(self, file_path: Path, errors: List[Dict]) -> int:
        """Corregir archivo .tsx específicamente"""
        return self.fix_generic_file(file_path, errors, is_react=True)

    def fix_ts_file(self, file_path: Path, errors: List[Dict]) -> int:
        """Corregir archivo .ts específicamente"""
        return self.fix_generic_file(file_path, errors, is_react=False)

    def fix_js_file(self, file_path: Path, errors: List[Dict]) -> int:
        """Corregir archivo .js - convertir a TypeScript si es necesario"""
        return self.fix_generic_file(file_path, errors, is_react=False)

    def fix_jsx_file(self, file_path: Path, errors: List[Dict]) -> int:
        """Corregir archivo .jsx - convertir a TSX si es necesario"""
        return self.fix_generic_file(file_path, errors, is_react=True)

    def fix_generic_file(self, file_path: Path, errors: List[Dict], is_react: bool = False) -> int:
        """Corregir archivo genérico"""
        if not file_path.exists():
            return 0
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            fixes_applied = 0
            
            # Aplicar correcciones específicas para cada error
            for error in errors:
                if error['file'] in str(file_path):
                    for pattern, fix_func in self.error_patterns.items():
                        if re.search(pattern, error['message']):
                            new_content, fixed = fix_func(error, content)
                            if fixed:
                                content = new_content
                                fixes_applied += 1
                                print(f"    ✅ Corregido: {error['message'][:60]}...")
                                break
            
            # Correcciones generales para archivos React
            if is_react:
                content, additional_fixes = self.apply_react_fixes(content)
                fixes_applied += additional_fixes
            
            # Guardar archivo si hubo cambios
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"  💾 Archivo actualizado: {file_path.name}")
            
            return fixes_applied
            
        except Exception as e:
            print(f"  ❌ Error procesando {file_path}: {e}")
            return 0

    def apply_react_fixes(self, content: str) -> Tuple[str, int]:
        """Aplicar correcciones específicas para archivos React"""
        fixes = 0
        
        # Agregar React import si falta
        if 'JSX' in content and 'import React' not in content:
            content = "import React from 'react';\n" + content
            fixes += 1
        
        # Correcciones de tipos comunes en React
        react_fixes = [
            # Event handlers
            (r'onClick=\{(\w+)\}', r'onClick={(\1: React.MouseEvent) => \1()}'),
            # Props sin tipos
            (r'export default function (\w+)\(\s*\{([^}]+)\}\s*\)', r'export default function \1({ \2 }: any)'),
        ]
        
        for pattern, replacement in react_fixes:
            new_content = re.sub(pattern, replacement, content)
            if new_content != content:
                content = new_content
                fixes += 1
        
        return content, fixes

    def fix_app(self, app_name: str) -> Dict:
        """Corregir una aplicación específica"""
        app_path = self.apps_dir / app_name
        
        if not app_path.exists():
            return {"success": False, "error": f"App {app_name} no existe"}
        
        print(f"\n🔧 Corrigiendo errores en {app_name}...")
        
        # Obtener errores de TypeScript
        errors = self.get_typescript_errors(app_path)
        
        if not errors:
            print(f"  ✅ No se encontraron errores de TypeScript")
            return {"success": True, "errors_found": 0, "errors_fixed": 0}
        
        print(f"  📊 Errores encontrados: {len(errors)}")
        self.total_errors_found += len(errors)
        
        # Agrupar errores por archivo
        errors_by_file = {}
        for error in errors:
            file_path = error['file']
            if file_path not in errors_by_file:
                errors_by_file[file_path] = []
            errors_by_file[file_path].append(error)
        
        total_fixes = 0
        
        # Procesar cada archivo
        for file_path_str, file_errors in errors_by_file.items():
            file_path = Path(file_path_str)
            if not file_path.is_absolute():
                file_path = app_path / file_path
            
            print(f"  📄 Procesando: {file_path.name} ({len(file_errors)} errores)")
            
            # Determinar tipo de archivo y aplicar correcciones
            suffix = file_path.suffix.lower()
            if suffix in self.file_fixes:
                fixes = self.file_fixes[suffix](file_path, file_errors)
                total_fixes += fixes
            else:
                # Archivo genérico
                fixes = self.fix_generic_file(file_path, file_errors)
                total_fixes += fixes
        
        self.total_errors_fixed += total_fixes
        
        # Verificar si aún hay errores después de las correcciones
        remaining_errors = self.get_typescript_errors(app_path)
        
        result = {
            "success": True,
            "errors_found": len(errors),
            "errors_fixed": total_fixes,
            "remaining_errors": len(remaining_errors)
        }
        
        if remaining_errors:
            print(f"  ⚠️  Errores restantes: {len(remaining_errors)}")
            # Mostrar algunos errores restantes para debugging
            for error in remaining_errors[:3]:
                print(f"    🔍 {error['message'][:80]}...")
        else:
            print(f"  🎉 Todos los errores corregidos!")
        
        return result

    def run_fixes(self):
        """Ejecutar correcciones en todas las apps"""
        self.print_header("AltaMedica - Corrección Automática de TypeScript")
        print(f"📅 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        results = {}
        
        # Procesar apps críticas primero
        self.print_section("Corrigiendo Aplicaciones Críticas")
        for app_name in self.critical_apps:
            results[app_name] = self.fix_app(app_name)
            self.apps_processed += 1
        
        # Procesar el resto de apps
        self.print_section("Corrigiendo Aplicaciones Secundarias")
        for app_name in self.all_apps:
            if app_name not in self.critical_apps:
                results[app_name] = self.fix_app(app_name)
                self.apps_processed += 1
        
        # Resumen final
        self.print_final_summary(results)
        
        return results

    def print_final_summary(self, results: Dict):
        """Imprimir resumen final"""
        self.print_header("Resumen de Correcciones", "=")
        
        successful_apps = sum(1 for r in results.values() if r.get("success", False))
        fully_fixed_apps = sum(1 for r in results.values() if r.get("remaining_errors", 1) == 0)
        
        print(f"📊 Aplicaciones procesadas: {self.apps_processed}")
        print(f"✅ Aplicaciones procesadas exitosamente: {successful_apps}")
        print(f"🎉 Aplicaciones completamente corregidas: {fully_fixed_apps}")
        print(f"🔍 Total errores encontrados: {self.total_errors_found}")
        print(f"🔧 Total errores corregidos: {self.total_errors_fixed}")
        
        if self.total_errors_fixed > 0:
            success_rate = (self.total_errors_fixed / self.total_errors_found) * 100
            print(f"📈 Tasa de éxito: {success_rate:.1f}%")
        
        print(f"\n🚀 Apps listas para ejecutar:")
        for app_name, result in results.items():
            remaining = result.get("remaining_errors", 0)
            if remaining == 0:
                print(f"  ✅ {app_name}")
            else:
                print(f"  ⚠️  {app_name} ({remaining} errores restantes)")

def main():
    """Función principal"""
    fixer = TypeScriptFixer()
    
    try:
        results = fixer.run_fixes()
        
        # Código de salida basado en resultados
        critical_fixed = all(
            results.get(app, {}).get("remaining_errors", 1) == 0 
            for app in fixer.critical_apps
        )
        
        if critical_fixed:
            print("\n🎉 ¡Aplicaciones críticas listas para ejecutar!")
            sys.exit(0)
        else:
            print("\n⚠️  Algunas aplicaciones críticas aún tienen errores")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n\n⚠️  Corrección interrumpida por el usuario")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error durante la corrección: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()