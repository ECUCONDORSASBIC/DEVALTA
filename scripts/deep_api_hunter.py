#!/usr/bin/env python3
"""
🕵️ Deep API Hunter - Cazador profundo de APIs
Encuentra TODAS las APIs ocultas en tu codebase
"""

import os
import re
import json
import ast
import time
import asyncio
import aiohttp
from pathlib import Path
from typing import Dict, List, Any, Set
from dataclasses import dataclass, asdict
from datetime import datetime
import concurrent.futures

@dataclass
class FoundAPI:
    """API encontrada en el código"""
    path: str
    method: str
    file_path: str
    line_number: int
    service: str
    port: int
    pattern_type: str  # nextjs, express, fastapi, etc.
    context: str  # Líneas de código alrededor
    requires_auth: bool = False
    middleware: List[str] = None
    params: List[str] = None

class DeepAPIHunter:
    """Cazador profundo de APIs"""
    
    def __init__(self):
        self.workspace_path = Path("c:/Users/Eduardo/Documents/devaltamedica")
        self.found_apis: List[FoundAPI] = []
        self.scanned_files = 0
        self.total_files = 0
        
        # Patrones mejorados para detectar APIs
        self.api_patterns = {
            # Next.js App Router
            "nextjs_app_route": [
                r"export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(",
                r"export\s+\{\s*(\w+(?:\s*,\s*\w+)*)\s*\}.*?(?:GET|POST|PUT|DELETE|PATCH)",
            ],
            
            # Next.js Pages API
            "nextjs_pages_api": [
                r"export\s+default\s+(?:async\s+)?function\s+handler",
                r"req\.method\s*===?\s*['\"]?(GET|POST|PUT|DELETE|PATCH)['\"]?",
            ],
            
            # Express.js
            "express": [
                r"app\.(get|post|put|delete|patch|use)\s*\(\s*['\"]([^'\"]+)['\"]",
                r"router\.(get|post|put|delete|patch|use)\s*\(\s*['\"]([^'\"]+)['\"]",
                r"\.route\s*\(\s*['\"]([^'\"]+)['\"]\s*\)\s*\.(get|post|put|delete|patch)",
            ],
            
            # FastAPI
            "fastapi": [
                r"@app\.(get|post|put|delete|patch)\s*\(\s*['\"]([^'\"]+)['\"]",
                r"@router\.(get|post|put|delete|patch)\s*\(\s*['\"]([^'\"]+)['\"]",
            ],
            
            # Fetch calls (client-side API usage)
            "fetch_calls": [
                r"fetch\s*\(\s*['\"`]([^'\"`,\s]+)['\"`]",
                r"fetch\s*\(\s*`([^`]+)`",
                r"\.get\s*\(\s*['\"`]([^'\"`,\s]+)['\"`]",
                r"\.post\s*\(\s*['\"`]([^'\"`,\s]+)['\"`]",
                r"axios\.(get|post|put|delete|patch)\s*\(\s*['\"`]([^'\"`,\s]+)['\"`]",
            ],
            
            # GraphQL
            "graphql": [
                r"type\s+Query\s*\{",
                r"type\s+Mutation\s*\{",
                r"gql`[\s\S]*?query\s+(\w+)",
                r"gql`[\s\S]*?mutation\s+(\w+)",
            ],
            
            # WebSocket
            "websocket": [
                r"new\s+WebSocket\s*\(\s*['\"`]([^'\"`,\s]+)['\"`]",
                r"io\s*\(\s*['\"`]([^'\"`,\s]+)['\"`]",
                r"@app\.websocket\s*\(\s*['\"]([^'\"]+)['\"]",
            ],
            
            # Configuración de rutas
            "route_config": [
                r"['\"]path['\"]:\s*['\"]([^'\"]+)['\"]",
                r"['\"]route['\"]:\s*['\"]([^'\"]+)['\"]",
                r"['\"]endpoint['\"]:\s*['\"]([^'\"]+)['\"]",
            ]
        }
        
        # Patrones para detectar puertos
        self.port_patterns = [
            r"PORT\s*[=:]\s*(\d+)",
            r"port\s*[=:]\s*(\d+)",
            r"listen\s*\(\s*(\d+)",
            r"localhost:(\d+)",
            r"http://[^:]*:(\d+)",
        ]
        
        # Servicios conocidos con más puertos
        self.known_services = {
            "api-server": [3001],
            "web-app": [3000],
            "patients": [3003], 
            "doctors": [3002],
            "admin": [3005],
            "companies": [3004],
            "video-server": [8888],
            "gateway": [8080, 8000],
            "auth": [3010],
            "notification": [3020],
            "payment": [3030],
        }
    
    async def hunt_all_apis(self) -> Dict[str, Any]:
        """Caza profunda de todas las APIs"""
        print("🕵️ Iniciando caza profunda de APIs...")
        print("=" * 60)
        
        start_time = time.time()
        
        # 1. Escanear estructura completa
        print("📁 Analizando estructura del proyecto...")
        await self._analyze_project_structure()
        
        # 2. Buscar APIs en código fuente
        print(f"\n🔍 Escaneando {self.total_files} archivos de código...")
        await self._deep_scan_source_code()
        
        # 3. Buscar configuraciones
        print("\n⚙️ Buscando archivos de configuración...")
        await self._scan_config_files()
        
        # 4. Detectar puertos en uso
        print("\n🌐 Detectando servicios en puertos...")
        await self._detect_running_services()
        
        # 5. Generar reporte completo
        results = await self._generate_comprehensive_report()
        
        elapsed = time.time() - start_time
        print(f"\n🎯 Caza completada en {elapsed:.2f}s")
        print(f"📊 {len(self.found_apis)} APIs encontradas")
        print(f"📄 {self.scanned_files} archivos escaneados")
        
        return results
    
    async def _analyze_project_structure(self):
        """Analiza la estructura completa del proyecto"""
        
        # Contar archivos relevantes
        extensions = {'.ts', '.js', '.py', '.json', '.yaml', '.yml', '.md'}
        
        for ext in extensions:
            files = list(self.workspace_path.rglob(f"*{ext}"))
            # Filtrar archivos irrelevantes
            files = [f for f in files if not any(exclude in str(f) for exclude in [
                'node_modules', '.next', '.git', '__pycache__', 'dist', 'build'
            ])]
            self.total_files += len(files)
        
        print(f"   📊 {self.total_files} archivos relevantes encontrados")
    
    async def _deep_scan_source_code(self):
        """Escaneo profundo del código fuente"""
        
        # Archivos a escanear
        file_patterns = [
            "**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", 
            "**/*.py", "**/*.json", "**/*.md"
        ]
        
        tasks = []
        for pattern in file_patterns:
            files = list(self.workspace_path.glob(pattern))
            # Filtrar archivos
            files = [f for f in files if not any(exclude in str(f) for exclude in [
                'node_modules', '.next', '.git', '__pycache__', 'dist', 'build',
                '.vscode', 'coverage', 'logs'
            ])]
            
            for file_path in files:
                tasks.append(self._scan_file_for_apis(file_path))
        
        # Procesar archivos en paralelo
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(self._scan_file_sync, file_path) for file_path in self._get_all_source_files()]
            
            for future in concurrent.futures.as_completed(futures):
                try:
                    apis = future.result()
                    self.found_apis.extend(apis)
                    self.scanned_files += 1
                    
                    if self.scanned_files % 100 == 0:
                        print(f"   📄 Escaneados: {self.scanned_files}/{self.total_files}")
                        
                except Exception as e:
                    print(f"   ⚠️ Error escaneando archivo: {e}")
    
    def _get_all_source_files(self) -> List[Path]:
        """Obtiene todos los archivos de código fuente"""
        files = []
        extensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.json']
        
        for ext in extensions:
            pattern_files = list(self.workspace_path.rglob(f"*{ext}"))
            # Filtrar
            pattern_files = [f for f in pattern_files if not any(exclude in str(f) for exclude in [
                'node_modules', '.next', '.git', '__pycache__', 'dist', 'build'
            ])]
            files.extend(pattern_files)
        
        return files
    
    def _scan_file_sync(self, file_path: Path) -> List[FoundAPI]:
        """Versión sincrónica del escaneo de archivos"""
        try:
            return asyncio.run(self._scan_file_for_apis(file_path))
        except:
            return []
    
    async def _scan_file_for_apis(self, file_path: Path) -> List[FoundAPI]:
        """Escanea un archivo específico en busca de APIs"""
        
        try:
            content = file_path.read_text(encoding='utf-8', errors='ignore')
            lines = content.split('\n')
        except Exception as e:
            return []
        
        found_apis = []
        service_name = self._determine_service(file_path)
        
        # Buscar con cada patrón
        for pattern_type, patterns in self.api_patterns.items():
            for pattern in patterns:
                matches = re.finditer(pattern, content, re.IGNORECASE | re.MULTILINE)
                
                for match in matches:
                    # Encontrar número de línea
                    line_num = content[:match.start()].count('\n') + 1
                    
                    # Extraer contexto
                    context_start = max(0, line_num - 3)
                    context_end = min(len(lines), line_num + 3)
                    context = '\n'.join(lines[context_start:context_end])
                    
                    # Determinar método y path
                    method, path = self._extract_method_and_path(match, pattern_type, content)
                    
                    if path and path.startswith('/'):
                        api = FoundAPI(
                            path=path,
                            method=method,
                            file_path=str(file_path),
                            line_number=line_num,
                            service=service_name,
                            port=self._get_service_port(service_name),
                            pattern_type=pattern_type,
                            context=context,
                            requires_auth=self._detect_auth_in_context(context),
                            middleware=self._extract_middleware(context),
                            params=self._extract_params(path)
                        )
                        found_apis.append(api)
        
        return found_apis
    
    def _determine_service(self, file_path: Path) -> str:
        """Determina a qué servicio pertenece un archivo"""
        path_str = str(file_path).lower()
        
        if 'apps/api-server' in path_str or 'api-server' in path_str:
            return 'api-server'
        elif 'apps/patients' in path_str or 'patients' in path_str:
            return 'patients'
        elif 'apps/doctors' in path_str or 'doctors' in path_str:
            return 'doctors'
        elif 'apps/admin' in path_str or 'admin' in path_str:
            return 'admin'
        elif 'apps/companies' in path_str or 'companies' in path_str:
            return 'companies'
        elif 'apps/web-app' in path_str or 'web-app' in path_str:
            return 'web-app'
        elif 'video' in path_str:
            return 'video-server'
        elif 'gateway' in path_str:
            return 'gateway'
        elif 'auth' in path_str:
            return 'auth'
        else:
            return 'unknown'
    
    def _get_service_port(self, service_name: str) -> int:
        """Obtiene el puerto de un servicio"""
        ports = self.known_services.get(service_name, [8080])
        return ports[0] if ports else 8080
    
    def _extract_method_and_path(self, match, pattern_type: str, content: str) -> tuple:
        """Extrae método HTTP y path de un match"""
        
        if pattern_type == "nextjs_app_route":
            method = match.group(1) if match.groups() else "GET"
            # Para Next.js App Router, el path viene de la estructura de carpetas
            return method, "/api/unknown"
        
        elif pattern_type == "express" or pattern_type == "fastapi":
            if len(match.groups()) >= 2:
                method = match.group(1).upper()
                path = match.group(2)
                return method, path
            elif len(match.groups()) == 1:
                return "GET", match.group(1)
        
        elif pattern_type == "fetch_calls":
            path = match.group(1) if match.groups() else match.group(0)
            # Limpiar la URL
            if '${' in path or '`' in path:
                # Template string, extraer parte estática
                path = re.sub(r'\$\{[^}]+\}', ':param', path)
            return "GET", path
        
        return "GET", "/unknown"
    
    def _detect_auth_in_context(self, context: str) -> bool:
        """Detecta si requiere autenticación basado en el contexto"""
        auth_keywords = [
            'auth', 'token', 'jwt', 'bearer', 'authorization',
            'requireAuth', 'authenticate', 'verifyToken', 
            'middleware', 'guard', 'protected'
        ]
        
        context_lower = context.lower()
        return any(keyword in context_lower for keyword in auth_keywords)
    
    def _extract_middleware(self, context: str) -> List[str]:
        """Extrae middleware del contexto"""
        middleware = []
        
        # Buscar patrones de middleware
        middleware_patterns = [
            r'(\w*[Aa]uth\w*)',
            r'(\w*[Mm]iddleware\w*)',
            r'(\w*[Gg]uard\w*)',
            r'(\w*[Vv]erify\w*)',
        ]
        
        for pattern in middleware_patterns:
            matches = re.findall(pattern, context)
            middleware.extend(matches)
        
        return list(set(middleware))
    
    def _extract_params(self, path: str) -> List[str]:
        """Extrae parámetros de una ruta"""
        params = []
        
        # Parámetros de Next.js [param]
        next_params = re.findall(r'\[([^\]]+)\]', path)
        params.extend(next_params)
        
        # Parámetros de Express :param
        express_params = re.findall(r':(\w+)', path)
        params.extend(express_params)
        
        # Parámetros de FastAPI {param}
        fastapi_params = re.findall(r'\{([^}]+)\}', path)
        params.extend(fastapi_params)
        
        return list(set(params))
    
    async def _scan_config_files(self):
        """Busca APIs en archivos de configuración"""
        
        config_files = [
            "package.json", "next.config.js", "next.config.ts",
            "docker-compose.yml", "docker-compose.yaml",
            "ecosystem.config.js", "pm2.config.js",
            "webpack.config.js", "vite.config.ts",
            "*.env", "*.env.local", "*.env.development"
        ]
        
        for pattern in config_files:
            files = list(self.workspace_path.rglob(pattern))
            for file_path in files:
                try:
                    content = file_path.read_text(encoding='utf-8', errors='ignore')
                    
                    # Buscar puertos y URLs
                    port_matches = re.findall(r'(\d{4,5})', content)
                    url_matches = re.findall(r'http[s]?://[^\s\'"]+', content)
                    
                    # Procesar hallazgos...
                    
                except Exception as e:
                    continue
    
    async def _detect_running_services(self):
        """Detecta servicios corriendo en puertos"""
        
        # Probar puertos comunes
        common_ports = [3000, 3001, 3002, 3003, 3004, 3005, 8000, 8080, 8888, 9000]
        
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=2)) as session:
            for port in common_ports:
                try:
                    url = f"http://localhost:{port}"
                    async with session.get(url) as response:
                        if response.status < 500:
                            print(f"   ✅ Servicio activo en puerto {port}")
                            
                            # Intentar obtener más endpoints
                            await self._probe_service_endpoints(session, url, port)
                            
                except:
                    continue
    
    async def _probe_service_endpoints(self, session: aiohttp.ClientSession, base_url: str, port: int):
        """Sondea endpoints comunes en un servicio"""
        
        common_endpoints = [
            "/", "/health", "/status", "/api", "/docs", "/swagger",
            "/api/health", "/api/status", "/api/docs",
            "/api/v1", "/api/v2", "/v1", "/v2",
            "/graphql", "/api/graphql",
            "/api/auth", "/auth", "/login",
            "/api/users", "/api/patients", "/api/doctors",
            "/api/appointments", "/api/records",
            "/api/video-calls", "/api/chat"
        ]
        
        for endpoint in common_endpoints:
            try:
                async with session.get(f"{base_url}{endpoint}") as response:
                    if response.status < 404:  # Encontrado o redirigido
                        api = FoundAPI(
                            path=endpoint,
                            method="GET",
                            file_path="discovered_by_probing",
                            line_number=0,
                            service=f"port_{port}",
                            port=port,
                            pattern_type="probed",
                            context=f"Discovered by probing {base_url}{endpoint}",
                            requires_auth=False
                        )
                        self.found_apis.append(api)
                        
            except:
                continue
    
    async def _generate_comprehensive_report(self) -> Dict[str, Any]:
        """Genera reporte comprehensivo"""
        
        # Agrupar APIs por servicio
        apis_by_service = {}
        for api in self.found_apis:
            if api.service not in apis_by_service:
                apis_by_service[api.service] = []
            apis_by_service[api.service].append(api)
        
        # Estadísticas
        total_apis = len(self.found_apis)
        unique_paths = len(set(api.path for api in self.found_apis))
        services_count = len(apis_by_service)
        
        # Crear reporte
        report = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_apis_found": total_apis,
                "unique_paths": unique_paths,
                "services_count": services_count,
                "files_scanned": self.scanned_files,
                "pattern_types": list(set(api.pattern_type for api in self.found_apis))
            },
            "apis_by_service": {}
        }
        
        # Detalles por servicio
        for service, apis in apis_by_service.items():
            service_data = {
                "service_name": service,
                "total_apis": len(apis),
                "unique_paths": len(set(api.path for api in apis)),
                "methods": list(set(api.method for api in apis)),
                "apis": [asdict(api) for api in apis]
            }
            report["apis_by_service"][service] = service_data
        
        # Guardar reporte
        await self._save_comprehensive_report(report)
        
        return report
    
    async def _save_comprehensive_report(self, report: Dict[str, Any]):
        """Guarda el reporte comprehensivo"""
        
        # Crear directorio
        results_dir = Path("deep_api_hunt_results")
        results_dir.mkdir(exist_ok=True)
        
        # Guardar JSON detallado
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        detailed_file = results_dir / f"deep_hunt_{timestamp}.json"
        
        with open(detailed_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, default=str)
        
        # Guardar última versión
        latest_file = results_dir / "latest_deep_hunt.json"
        with open(latest_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, default=str)
        
        # Generar reporte HTML
        await self._generate_html_report(report, results_dir)
        
        print(f"\n💾 Reportes guardados:")
        print(f"   📄 {detailed_file}")
        print(f"   📄 {latest_file}")
        print(f"   🌐 {results_dir}/deep_hunt_report.html")
    
    async def _generate_html_report(self, report: Dict[str, Any], results_dir: Path):
        """Genera reporte HTML visual"""
        
        summary = report["summary"]
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>🕵️ Deep API Hunt Report - AltaMedica</title>
            <style>
                body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                       margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }}
                .container {{ max-width: 1400px; margin: 0 auto; }}
                .header {{ background: white; padding: 30px; border-radius: 15px; text-align: center; 
                          box-shadow: 0 10px 30px rgba(0,0,0,0.2); margin-bottom: 30px; }}
                .stats {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
                         gap: 20px; margin: 30px 0; }}
                .stat {{ background: white; padding: 25px; border-radius: 10px; text-align: center;
                        box-shadow: 0 5px 15px rgba(0,0,0,0.1); transition: transform 0.3s; }}
                .stat:hover {{ transform: translateY(-5px); }}
                .stat h3 {{ font-size: 2.5em; margin: 0; color: #667eea; }}
                .stat p {{ margin: 10px 0 0; color: #666; font-weight: 500; }}
                .service {{ background: white; margin: 20px 0; padding: 25px; border-radius: 10px;
                           box-shadow: 0 5px 15px rgba(0,0,0,0.1); }}
                .service h3 {{ color: #764ba2; border-bottom: 2px solid #eee; padding-bottom: 10px; }}
                .api {{ background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 8px;
                       border-left: 4px solid #667eea; }}
                .method {{ display: inline-block; padding: 5px 10px; border-radius: 20px; 
                          color: white; font-size: 12px; font-weight: bold; margin-right: 10px; }}
                .GET {{ background: #28a745; }}
                .POST {{ background: #007bff; }}
                .PUT {{ background: #ffc107; color: #000; }}
                .DELETE {{ background: #dc3545; }}
                .PATCH {{ background: #6f42c1; }}
                .path {{ font-family: 'Monaco', 'Consolas', monospace; font-weight: bold; }}
                .meta {{ font-size: 12px; color: #666; margin-top: 10px; }}
                .auth {{ color: #dc3545; font-weight: bold; }}
                .no-auth {{ color: #28a745; }}
                pre {{ background: #f1f3f4; padding: 15px; border-radius: 5px; overflow-x: auto; 
                      font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🕵️ Deep API Hunt Report</h1>
                    <h2>AltaMedica Platform</h2>
                    <p>Generated: {report['timestamp']}</p>
                </div>
                
                <div class="stats">
                    <div class="stat">
                        <h3>{summary['total_apis_found']}</h3>
                        <p>APIs Encontradas</p>
                    </div>
                    <div class="stat">
                        <h3>{summary['unique_paths']}</h3>
                        <p>Rutas Únicas</p>
                    </div>
                    <div class="stat">
                        <h3>{summary['services_count']}</h3>
                        <p>Servicios</p>
                    </div>
                    <div class="stat">
                        <h3>{summary['files_scanned']}</h3>
                        <p>Archivos Escaneados</p>
                    </div>
                </div>
        """
        
        # Servicios y APIs
        for service_name, service_data in report["apis_by_service"].items():
            html += f"""
                <div class="service">
                    <h3>🔧 {service_name.title()} ({service_data['total_apis']} APIs)</h3>
                    <p><strong>Puerto:</strong> {service_data['apis'][0]['port'] if service_data['apis'] else 'N/A'}</p>
                    <p><strong>Métodos:</strong> {', '.join(service_data['methods'])}</p>
            """
            
            for api in service_data['apis']:
                auth_class = "auth" if api['requires_auth'] else "no-auth"
                auth_text = "🔒 Auth Required" if api['requires_auth'] else "🔓 Public"
                
                html += f"""
                    <div class="api">
                        <span class="method {api['method']}">{api['method']}</span>
                        <span class="path">{api['path']}</span>
                        <span class="{auth_class}">{auth_text}</span>
                        <div class="meta">
                            📁 {Path(api['file_path']).name} : {api['line_number']} | 
                            🔍 {api['pattern_type']} | 
                            ⚙️ {', '.join(api['middleware']) if api['middleware'] else 'No middleware'}
                        </div>
                """
                
                if api['params']:
                    html += f"<div class='meta'>📋 Params: {', '.join(api['params'])}</div>"
                
                html += "</div>"
            
            html += "</div>"
        
        html += """
            </div>
            <script>
                // Ordenar servicios por número de APIs
                document.addEventListener('DOMContentLoaded', function() {
                    console.log('🕵️ Deep API Hunt Report loaded');
                });
            </script>
        </body>
        </html>
        """
        
        html_file = results_dir / "deep_hunt_report.html"
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html)

async def main():
    """Función principal"""
    print("🕵️ Deep API Hunter - Cazador Profundo de APIs")
    print("=" * 60)
    print("Encontrando TODAS las APIs en tu codebase...")
    
    hunter = DeepAPIHunter()
    results = await hunter.hunt_all_apis()
    
    summary = results["summary"]
    
    print(f"\n🎯 RESULTADOS FINALES:")
    print("=" * 40)
    print(f"📊 APIs encontradas: {summary['total_apis_found']}")
    print(f"🎯 Rutas únicas: {summary['unique_paths']}")
    print(f"🏢 Servicios: {summary['services_count']}")
    print(f"📄 Archivos escaneados: {summary['files_scanned']}")
    
    print(f"\n🏆 SERVICIOS CON MÁS APIs:")
    for service, data in results["apis_by_service"].items():
        print(f"   {service}: {data['total_apis']} APIs")
    
    print(f"\n📊 Ver reporte completo: deep_api_hunt_results/deep_hunt_report.html")

if __name__ == "__main__":
    asyncio.run(main())
