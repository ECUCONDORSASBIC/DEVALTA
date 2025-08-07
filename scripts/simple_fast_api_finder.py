#!/usr/bin/env python3
"""
🚀 Ultra Fast API Finder - Version simplificada para encontrar todas las APIs
"""

import os
import re
import json
import time
from pathlib import Path

class SimpleFastAPIFinder:
    def __init__(self):
        self.workspace = "c:/Users/Eduardo/Documents/devaltamedica"
        self.apis = []
        
    def find_all_apis(self):
        """Encuentra todas las APIs de forma ultra rápida"""
        print("🚀 Ultra Fast API Finder iniciado...")
        start = time.time()
        
        # Definir directorios clave
        key_dirs = [
            "apps/api-server",
            "apps/patients", 
            "apps/doctors",
            "apps/admin",
            "apps/companies",
            "apps/web-app",
        ]
        
        # Escanear cada directorio
        for dir_name in key_dirs:
            dir_path = Path(self.workspace) / dir_name
            if dir_path.exists():
                print(f"📁 Escaneando {dir_name}...")
                self._scan_directory(dir_path, dir_name)
        
        # Buscar archivos Python específicos
        self._scan_python_files()
        
        # Generar resultados
        self._save_results()
        
        elapsed = time.time() - start
        print(f"⚡ Completado en {elapsed:.2f}s - {len(self.apis)} APIs encontradas")
        
        return self.apis
    
    def _scan_directory(self, dir_path, service):
        """Escanea un directorio específico"""
        try:
            # Buscar archivos de rutas específicos
            patterns = [
                "**/route.ts",
                "**/route.js", 
                "**/api/**/*.ts",
                "**/api/**/*.js",
                "**/pages/api/**/*.ts",
                "**/pages/api/**/*.js",
                "**/*.ts",
                "**/*.js"
            ]
            
            files_found = set()
            for pattern in patterns:
                try:
                    found = list(dir_path.glob(pattern))
                    files_found.update(found)
                except:
                    continue
            
            # Filtrar archivos relevantes
            relevant_files = [f for f in files_found if self._is_relevant_file(f)]
            
            for file_path in relevant_files:
                self._scan_file(file_path, service)
                
        except Exception as e:
            print(f"Error escaneando {dir_path}: {e}")
    
    def _is_relevant_file(self, file_path):
        """Determina si un archivo es relevante"""
        path_str = str(file_path).lower()
        
        # Excluir directorios irrelevantes
        exclude = ['node_modules', '.next', 'dist', 'build', '.git', '__pycache__']
        if any(ex in path_str for ex in exclude):
            return False
            
        # Incluir archivos relevantes
        include_patterns = [
            'route.ts', 'route.js',
            '/api/', 
            'server', 'handler', 'endpoint',
            'controller', 'service', 'router'
        ]
        
        return any(pattern in path_str for pattern in include_patterns)
    
    def _scan_file(self, file_path, service):
        """Escanea un archivo individual"""
        try:
            content = file_path.read_text(encoding='utf-8', errors='ignore')
            
            # Patrones de APIs más específicos
            patterns = {
                # Next.js App Router
                'nextjs_export': r'export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)',
                
                # Express/Node.js
                'express': r'(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*[\'"`]([^\'"`]+)[\'"`]',
                
                # FastAPI/Python
                'fastapi': r'@(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*[\'"`]([^\'"`]+)[\'"`]',
                
                # Fetch calls (frontend)
                'fetch': r'fetch\s*\(\s*[\'"`]([^\'"`\$\{]+)[\'"`]',
                
                # Axios calls
                'axios': r'axios\.(get|post|put|delete|patch)\s*\(\s*[\'"`]([^\'"`\$\{]+)[\'"`]',
            }
            
            for pattern_name, pattern in patterns.items():
                matches = re.finditer(pattern, content, re.IGNORECASE | re.MULTILINE)
                
                for match in matches:
                    method, path = self._extract_method_path(match, pattern_name, file_path)
                    
                    if self._is_valid_api_path(path):
                        api_info = {
                            'service': service,
                            'method': method,
                            'path': path,
                            'file': file_path.name,
                            'type': pattern_name,
                            'full_path': str(file_path.relative_to(self.workspace))
                        }
                        self.apis.append(api_info)
                        
        except Exception as e:
            pass  # Continuar con otros archivos
    
    def _extract_method_path(self, match, pattern_name, file_path):
        """Extrae método y path de la coincidencia"""
        
        if pattern_name == 'nextjs_export':
            method = match.group(1)
            path = self._build_nextjs_path(file_path)
            return method, path
            
        elif pattern_name in ['express', 'fastapi']:
            if len(match.groups()) >= 2:
                return match.group(1).upper(), match.group(2)
            
        elif pattern_name == 'fetch':
            return 'GET', match.group(1)
            
        elif pattern_name == 'axios':
            if len(match.groups()) >= 2:
                return match.group(1).upper(), match.group(2)
        
        return 'GET', '/unknown'
    
    def _build_nextjs_path(self, file_path):
        """Construye path de Next.js desde estructura de carpetas"""
        parts = file_path.parts
        
        # Buscar 'api' en el path
        api_index = None
        for i, part in enumerate(parts):
            if part == 'api':
                api_index = i
                break
        
        if api_index is not None:
            # Tomar partes después de 'api'
            path_parts = parts[api_index:]
            
            # Remover route.ts/route.js
            if path_parts[-1] in ['route.ts', 'route.js']:
                path_parts = path_parts[:-1]
            
            # Construir path
            path = '/' + '/'.join(path_parts)
            
            # Convertir [param] a :param
            path = re.sub(r'\[([^\]]+)\]', r':\1', path)
            
            return path
        
        return '/api/unknown'
    
    def _is_valid_api_path(self, path):
        """Valida si es un path de API válido"""
        if not path or path == '/unknown':
            return False
            
        # Filtrar paths inválidos
        invalid_indicators = ['${', '`', 'undefined', 'null', 'console', 'log']
        if any(indicator in path for indicator in invalid_indicators):
            return False
        
        # Debe empezar con / o ser URL válida
        if not path.startswith('/') and not path.startswith('http'):
            return False
        
        return True
    
    def _scan_python_files(self):
        """Escanea archivos Python específicos"""
        python_files = [
            "auto_login_tester.py",
            "check-servers.py", 
            "demo_video_call.py",
            "install_video_system.py",
            "medical_matching_engine.py"
        ]
        
        for py_file in python_files:
            file_path = Path(self.workspace) / py_file
            if file_path.exists():
                self._scan_file(file_path, "python-tools")
    
    def _save_results(self):
        """Guarda los resultados"""
        
        # Agrupar por servicio
        by_service = {}
        for api in self.apis:
            service = api['service']
            if service not in by_service:
                by_service[service] = []
            by_service[service].append(api)
        
        # Calcular estadísticas
        total_apis = len(self.apis)
        unique_paths = len(set(api['path'] for api in self.apis))
        services = list(by_service.keys())
        
        results = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "summary": {
                "total_apis": total_apis,
                "unique_paths": unique_paths,
                "services": len(services),
                "service_list": services
            },
            "by_service": by_service,
            "all_apis": self.apis
        }
        
        # Guardar JSON
        with open('fast_api_results.json', 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        # Generar configuración TypeScript simple
        self._generate_simple_config(results)
        
        # Mostrar resumen en consola
        self._print_summary(results)
        
        print(f"\n💾 Resultados guardados en: fast_api_results.json")
        print(f"📝 Configuración TS: simple_api_config.ts")
    
    def _generate_simple_config(self, results):
        """Genera configuración TypeScript simple"""
        
        ts_lines = [
            "// 🚀 Simple API Configuration",
            f"// Generated: {results['timestamp']}",
            f"// Total APIs: {results['summary']['total_apis']}",
            "",
            "export const API_SERVICES = {",
        ]
        
        # Mapeo de puertos
        port_map = {
            'api-server': 3001,
            'patients': 3003,
            'doctors': 3002,
            'admin': 3005,
            'companies': 3004,
            'web-app': 3000,
            'python-tools': 8888
        }
        
        for service, apis in results['by_service'].items():
            port = port_map.get(service, 8080)
            unique_paths = list(set(api['path'] for api in apis))
            
            ts_lines.extend([
                f"  '{service}': {{",
                f"    port: {port},",
                f"    baseUrl: 'http://localhost:{port}',",
                f"    endpoints: [",
            ])
            
            for path in unique_paths:
                ts_lines.append(f"      '{path}',")
            
            ts_lines.extend([
                "    ]",
                "  },",
            ])
        
        ts_lines.extend([
            "} as const;",
            "",
            f"// Total: {results['summary']['total_apis']} APIs across {results['summary']['services']} services"
        ])
        
        with open('simple_api_config.ts', 'w', encoding='utf-8') as f:
            f.write('\n'.join(ts_lines))
    
    def _print_summary(self, results):
        """Imprime resumen en consola"""
        print(f"\n🎯 RESUMEN DE APIs ENCONTRADAS:")
        print("=" * 50)
        
        for service, apis in results['by_service'].items():
            unique_paths = len(set(api['path'] for api in apis))
            methods = set(api['method'] for api in apis)
            print(f"🔧 {service.upper()}: {len(apis)} APIs ({unique_paths} rutas únicas)")
            print(f"   Métodos: {', '.join(sorted(methods))}")
            
            # Mostrar algunas rutas de ejemplo
            example_paths = list(set(api['path'] for api in apis))[:3]
            for path in example_paths:
                print(f"   📍 {path}")
            
            if len(set(api['path'] for api in apis)) > 3:
                print(f"   ... y {len(set(api['path'] for api in apis)) - 3} más")
            print()

def main():
    finder = SimpleFastAPIFinder()
    apis = finder.find_all_apis()
    return apis

if __name__ == "__main__":
    main()
