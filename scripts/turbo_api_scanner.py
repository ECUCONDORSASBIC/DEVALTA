#!/usr/bin/env python3
"""
⚡ Turbo API Scanner - Scanner ultrarrápido de APIs
Encuentra todas las APIs en segundos
"""

import os
import re
import json
import time
from pathlib import Path
from typing import Dict, List, Set
from dataclasses import dataclass, asdict
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

@dataclass
class QuickAPI:
    """API encontrada rápidamente"""
    path: str
    method: str
    service: str
    file: str
    line: int
    type: str  # express, nextjs, fastapi, etc.

class TurboAPIScanner:
    """Scanner ultrarrápido de APIs"""
    
    def __init__(self):
        self.workspace = Path("c:/Users/Eduardo/Documents/devaltamedica")
        self.apis: List[QuickAPI] = []
        
        # Patrones optimizados
        self.patterns = {
            "express": r"(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*['\"]([^'\"]+)['\"]",
            "nextjs_route": r"export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)",
            "nextjs_handler": r"req\.method\s*===?\s*['\"]?(GET|POST|PUT|DELETE|PATCH)['\"]?",
            "fastapi": r"@(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*['\"]([^'\"]+)['\"]",
            "fetch": r"fetch\s*\(\s*['\"`]([^'\"`,\s]+)['\"`]",
            "axios": r"axios\.(get|post|put|delete|patch)\s*\(\s*['\"`]([^'\"`,\s]+)['\"`]",
        }
        
        # Servicios conocidos
        self.services = {
            'api-server': [3001],
            'patients': [3003],
            'doctors': [3002],
            'admin': [3005],
            'companies': [3004],
            'web-app': [3000],
            'video-server': [8888],
        }
    
    def scan_all(self) -> Dict:
        """Escaneo principal ultrarrápido"""
        print("⚡ Iniciando Turbo API Scanner...")
        start = time.time()
        
        # 1. Encontrar archivos relevantes
        files = self._get_relevant_files()
        print(f"📁 {len(files)} archivos a escanear")
        
        # 2. Escanear en paralelo
        self._parallel_scan(files)
        
        # 3. Generar resultados
        results = self._generate_results()
        
        elapsed = time.time() - start
        print(f"⚡ Completado en {elapsed:.2f}s")
        print(f"🎯 {len(self.apis)} APIs encontradas")
        
        return results
    
    def _get_relevant_files(self) -> List[Path]:
        """Encuentra archivos relevantes rápidamente"""
        files = []
        
        # Patrones de archivos importantes
        patterns = [
            "apps/*/src/**/*.ts",
            "apps/*/src/**/*.js", 
            "apps/**/api/**/*.ts",
            "apps/**/pages/**/*.ts",
            "apps/**/route.ts",
            "*.py",
            "packages/**/*.ts",
            "agents/**/*.ts",
        ]
        
        for pattern in patterns:
            try:
                found = list(self.workspace.glob(pattern))
                # Filtrar rápidamente
                found = [f for f in found if 'node_modules' not in str(f) and '.next' not in str(f)]
                files.extend(found)
            except:
                continue
        
        return list(set(files))  # Eliminar duplicados
    
    def _parallel_scan(self, files: List[Path]):
        """Escaneo en paralelo"""
        
        with ThreadPoolExecutor(max_workers=8) as executor:
            futures = [executor.submit(self._scan_file, f) for f in files]
            
            completed = 0
            for future in as_completed(futures):
                try:
                    apis = future.result()
                    self.apis.extend(apis)
                    completed += 1
                    
                    if completed % 50 == 0:
                        print(f"   📄 Procesados: {completed}/{len(files)}")
                        
                except Exception as e:
                    pass  # Continuar con otros archivos
    
    def _scan_file(self, file_path: Path) -> List[QuickAPI]:
        """Escanea un archivo individual"""
        try:
            content = file_path.read_text(encoding='utf-8', errors='ignore')
            lines = content.split('\n')
        except:
            return []
        
        apis = []
        service = self._get_service(file_path)
        
        # Next.js App Router - detectar por estructura de carpetas
        if 'route.ts' in str(file_path) or 'route.js' in str(file_path):
            apis.extend(self._scan_nextjs_app_router(file_path, content, service))
        
        # Patrones regex
        for pattern_type, pattern in self.patterns.items():
            matches = re.finditer(pattern, content, re.IGNORECASE)
            
            for match in matches:
                line_num = content[:match.start()].count('\n') + 1
                method, path = self._extract_data(match, pattern_type, file_path)
                
                if path and self._is_valid_path(path):
                    api = QuickAPI(
                        path=path,
                        method=method,
                        service=service,
                        file=file_path.name,
                        line=line_num,
                        type=pattern_type
                    )
                    apis.append(api)
        
        return apis
    
    def _scan_nextjs_app_router(self, file_path: Path, content: str, service: str) -> List[QuickAPI]:
        """Escanea Next.js App Router específicamente"""
        apis = []
        
        # Detectar métodos exportados
        methods = re.findall(r'export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)', content)
        
        if methods:
            # Construir path desde estructura de carpetas
            path = self._build_nextjs_path(file_path)
            
            for method in methods:
                api = QuickAPI(
                    path=path,
                    method=method,
                    service=service,
                    file=file_path.name,
                    line=1,
                    type='nextjs_app_router'
                )
                apis.append(api)
        
        return apis
    
    def _build_nextjs_path(self, file_path: Path) -> str:
        """Construye path de API desde estructura Next.js"""
        parts = file_path.parts
        
        # Buscar 'api' en el path
        try:
            api_index = None
            for i, part in enumerate(parts):
                if part == 'api':
                    api_index = i
                    break
            
            if api_index is not None:
                path_parts = parts[api_index:]
                
                # Remover 'route.ts' o 'route.js'
                if path_parts[-1] in ['route.ts', 'route.js']:
                    path_parts = path_parts[:-1]
                
                # Construir path
                path = '/' + '/'.join(path_parts)
                
                # Convertir [param] a :param
                path = re.sub(r'\[([^\]]+)\]', r':\1', path)
                
                return path
        except:
            pass
        
        return '/api/unknown'
    
    def _get_service(self, file_path: Path) -> str:
        """Determina servicio por path"""
        path_str = str(file_path).lower()
        
        if 'apps/api-server' in path_str:
            return 'api-server'
        elif 'apps/patients' in path_str:
            return 'patients'
        elif 'apps/doctors' in path_str:
            return 'doctors'
        elif 'apps/admin' in path_str:
            return 'admin'
        elif 'apps/companies' in path_str:
            return 'companies'
        elif 'apps/web-app' in path_str:
            return 'web-app'
        elif 'video' in path_str:
            return 'video-server'
        else:
            return 'unknown'
    
    def _extract_data(self, match, pattern_type: str, file_path: Path) -> tuple:
        """Extrae método y path del match"""
        
        if pattern_type in ['express', 'fastapi']:
            if len(match.groups()) >= 2:
                return match.group(1).upper(), match.group(2)
            
        elif pattern_type == 'nextjs_route':
            return match.group(1), self._build_nextjs_path(file_path)
            
        elif pattern_type in ['fetch', 'axios']:
            if pattern_type == 'axios' and len(match.groups()) >= 2:
                return match.group(1).upper(), match.group(2)
            elif len(match.groups()) >= 1:
                return 'GET', match.group(1)
        
        return 'GET', '/unknown'
    
    def _is_valid_path(self, path: str) -> bool:
        """Valida si es un path de API válido"""
        if not path:
            return False
        
        # Filtrar paths no válidos
        invalid = ['unknown', 'undefined', 'null', '${', '`']
        if any(inv in path for inv in invalid):
            return False
        
        # Debe empezar con / o ser una URL
        if not path.startswith('/') and not path.startswith('http'):
            return False
        
        return True
    
    def _generate_results(self) -> Dict:
        """Genera resultados finales"""
        
        # Agrupar por servicio
        by_service = {}
        for api in self.apis:
            if api.service not in by_service:
                by_service[api.service] = []
            by_service[api.service].append(api)
        
        # Estadísticas
        unique_paths = len(set(api.path for api in self.apis))
        methods = set(api.method for api in self.apis)
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_apis": len(self.apis),
                "unique_paths": unique_paths,
                "services": len(by_service),
                "methods": list(methods)
            },
            "by_service": {}
        }
        
        # Detalles por servicio
        for service, apis in by_service.items():
            port = self.services.get(service, [8080])[0]
            
            results["by_service"][service] = {
                "name": service,
                "port": port,
                "total_apis": len(apis),
                "unique_paths": len(set(api.path for api in apis)),
                "methods": list(set(api.method for api in apis)),
                "apis": [asdict(api) for api in apis]
            }
        
        # Guardar resultados
        self._save_results(results)
        
        return results
    
    def _save_results(self, results: Dict):
        """Guarda resultados"""
        
        # JSON detallado
        with open('turbo_scan_results.json', 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        # Generar configuración TypeScript
        self._generate_typescript_config(results)
        
        # Generar reporte HTML rápido
        self._generate_quick_html(results)
        
        print(f"💾 Resultados guardados:")
        print(f"   📄 turbo_scan_results.json")
        print(f"   📝 turbo_api_config.ts")
        print(f"   🌐 turbo_report.html")
    
    def _generate_typescript_config(self, results: Dict):
        """Genera configuración TypeScript"""
        
        ts_lines = [
            "// 🔥 Auto-generated Turbo API Config",
            f"// Generated: {datetime.now().isoformat()}",
            f"// Total APIs: {results['summary']['total_apis']}",
            "",
            "export const TURBO_API_CONFIG = {",
        ]
        
        for service_name, service_data in results["by_service"].items():
            ts_lines.extend([
                f"  {service_name.upper().replace('-', '_')}: {{",
                f"    name: '{service_name}',",
                f"    port: {service_data['port']},",
                f"    baseUrl: 'http://localhost:{service_data['port']}',",
                f"    totalApis: {service_data['total_apis']},",
                "    endpoints: {",
            ])
            
            # Agrupar por path único
            unique_paths = {}
            for api in service_data['apis']:
                path = api['path']
                if path not in unique_paths:
                    unique_paths[path] = []
                unique_paths[path].append(api['method'])
            
            for path, methods in unique_paths.items():
                safe_name = path.replace('/', '_').replace('-', '_').replace(':', '_').upper()
                if safe_name.startswith('_'):
                    safe_name = safe_name[1:]
                ts_lines.append(f"      {safe_name}: '{path}',")
            
            ts_lines.extend([
                "    }",
                "  },",
            ])
        
        ts_lines.extend([
            "} as const;",
            "",
            "// Helper functions",
            "export function buildApiUrl(service: keyof typeof TURBO_API_CONFIG, endpoint: string): string {",
            "  return `${TURBO_API_CONFIG[service].baseUrl}${endpoint}`;",
            "}",
            "",
            "export function getServiceInfo(service: keyof typeof TURBO_API_CONFIG) {",
            "  return TURBO_API_CONFIG[service];",
            "}",
            "",
            f"// Summary: {results['summary']['total_apis']} APIs across {results['summary']['services']} services",
        ])
        
        with open('turbo_api_config.ts', 'w') as f:
            f.write('\n'.join(ts_lines))
    
    def _generate_quick_html(self, results: Dict):
        """Genera reporte HTML rápido"""
        
        summary = results["summary"]
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>⚡ Turbo API Scanner Report</title>
            <style>
                body {{ font-family: system-ui, -apple-system, sans-serif; margin: 20px; background: #f0f2f5; }}
                .header {{ background: linear-gradient(135deg, #667eea, #764ba2); color: white; 
                          padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px; }}
                .stats {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
                         gap: 15px; margin: 20px 0; }}
                .stat {{ background: white; padding: 20px; border-radius: 8px; text-align: center; 
                        box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
                .stat h3 {{ font-size: 2em; margin: 0; color: #667eea; }}
                .service {{ background: white; margin: 15px 0; padding: 20px; border-radius: 8px;
                           box-shadow: 0 2px 8px rgba(0,0,0,0.1); }}
                .service h3 {{ color: #764ba2; margin-top: 0; }}
                .api-list {{ max-height: 300px; overflow-y: auto; }}
                .api {{ background: #f8f9fa; margin: 8px 0; padding: 12px; border-radius: 5px; 
                       border-left: 4px solid #667eea; }}
                .method {{ display: inline-block; padding: 4px 8px; border-radius: 12px; 
                          color: white; font-size: 11px; font-weight: bold; margin-right: 8px; }}
                .GET {{ background: #28a745; }}
                .POST {{ background: #007bff; }}
                .PUT {{ background: #ffc107; color: #000; }}
                .DELETE {{ background: #dc3545; }}
                .PATCH {{ background: #6f42c1; }}
                .path {{ font-family: Monaco, Consolas, monospace; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>⚡ Turbo API Scanner</h1>
                <p>Ultrafast API Discovery for AltaMedica</p>
                <p>Generated: {results['timestamp']}</p>
            </div>
            
            <div class="stats">
                <div class="stat">
                    <h3>{summary['total_apis']}</h3>
                    <p>Total APIs</p>
                </div>
                <div class="stat">
                    <h3>{summary['unique_paths']}</h3>
                    <p>Unique Paths</p>
                </div>
                <div class="stat">
                    <h3>{summary['services']}</h3>
                    <p>Services</p>
                </div>
                <div class="stat">
                    <h3>{len(summary['methods'])}</h3>
                    <p>HTTP Methods</p>
                </div>
            </div>
        """
        
        # Servicios
        for service_name, service_data in results["by_service"].items():
            html += f"""
            <div class="service">
                <h3>🔧 {service_name.title()} ({service_data['total_apis']} APIs)</h3>
                <p><strong>Port:</strong> {service_data['port']} | 
                   <strong>Methods:</strong> {', '.join(service_data['methods'])}</p>
                
                <div class="api-list">
            """
            
            for api in service_data['apis']:
                html += f"""
                    <div class="api">
                        <span class="method {api['method']}">{api['method']}</span>
                        <span class="path">{api['path']}</span>
                        <small style="color: #666; margin-left: 10px;">
                            {api['file']} | {api['type']}
                        </small>
                    </div>
                """
            
            html += "</div></div>"
        
        html += """
        </body>
        </html>
        """
        
        with open('turbo_report.html', 'w') as f:
            f.write(html)

def main():
    """Función principal"""
    scanner = TurboAPIScanner()
    results = scanner.scan_all()
    
    print(f"\n🎯 RESUMEN FINAL:")
    print("=" * 30)
    for service, data in results["by_service"].items():
        print(f"   {service}: {data['total_apis']} APIs")
    
    print(f"\n📊 Ver reporte: turbo_report.html")

if __name__ == "__main__":
    main()
