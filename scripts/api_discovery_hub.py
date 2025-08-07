#!/usr/bin/env python3
"""
🔥 AltaMedica API Discovery & Testing Hub
Automatiza el descubrimiento, testing y documentación de todas las APIs
"""

import os
import json
import time
import asyncio
import aiohttp
import requests
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
import ast
import re
from concurrent.futures import ThreadPoolExecutor, as_completed

@dataclass
class APIEndpoint:
    """Representa un endpoint de API descubierto"""
    path: str
    method: str
    service: str
    port: int
    description: str = ""
    parameters: List[Dict] = None
    response_schema: Dict = None
    requires_auth: bool = False
    roles: List[str] = None
    last_tested: Optional[datetime] = None
    status: str = "unknown"  # unknown, working, error, timeout
    response_time: float = 0.0
    error_message: str = ""

@dataclass
class APIService:
    """Representa un servicio completo"""
    name: str
    base_url: str
    port: int
    endpoints: List[APIEndpoint]
    health_status: str = "unknown"
    last_check: Optional[datetime] = None

class APIDiscoveryHub:
    """Hub principal para descubrimiento y testing de APIs"""
    
    def __init__(self):
        self.services: Dict[str, APIService] = {}
        self.workspace_path = Path("c:/Users/Eduardo/Documents/devaltamedica")
        self.results_path = Path("api_discovery_results")
        self.results_path.mkdir(exist_ok=True)
        
        # Configuración de servicios conocidos
        self.known_services = {
            "api-server": {"port": 3001, "base_url": "http://localhost:3001"},
            "web-app": {"port": 3000, "base_url": "http://localhost:3000"},
            "patients": {"port": 3003, "base_url": "http://localhost:3003"},
            "doctors": {"port": 3002, "base_url": "http://localhost:3002"},
            "admin": {"port": 3005, "base_url": "http://localhost:3005"},
            "companies": {"port": 3004, "base_url": "http://localhost:3004"},
            "video-server": {"port": 8888, "base_url": "http://localhost:8888"},
        }
    
    async def discover_all_apis(self) -> Dict[str, Any]:
        """Descubre todas las APIs automáticamente"""
        print("🔍 Iniciando descubrimiento automático de APIs...")
        
        discovery_results = {
            "timestamp": datetime.now().isoformat(),
            "total_services": 0,
            "total_endpoints": 0,
            "services": {},
            "summary": {}
        }
        
        # 1. Escanear código fuente para encontrar endpoints
        print("\n📂 Escaneando código fuente...")
        source_endpoints = await self._scan_source_code()
        
        # 2. Verificar servicios activos
        print("\n🌐 Verificando servicios activos...")
        active_services = await self._check_active_services()
        
        # 3. Combinar resultados
        for service_name, config in self.known_services.items():
            endpoints = source_endpoints.get(service_name, [])
            is_active = service_name in active_services
            
            service = APIService(
                name=service_name,
                base_url=config["base_url"],
                port=config["port"],
                endpoints=endpoints,
                health_status="active" if is_active else "inactive",
                last_check=datetime.now()
            )
            
            self.services[service_name] = service
            discovery_results["services"][service_name] = {
                "base_url": service.base_url,
                "port": service.port,
                "status": service.health_status,
                "endpoints_count": len(endpoints),
                "endpoints": [asdict(ep) for ep in endpoints]
            }
        
        discovery_results["total_services"] = len(self.services)
        discovery_results["total_endpoints"] = sum(len(s.endpoints) for s in self.services.values())
        
        # Guardar resultados
        await self._save_discovery_results(discovery_results)
        
        print(f"\n✅ Descubrimiento completado:")
        print(f"   📊 {discovery_results['total_services']} servicios")
        print(f"   📊 {discovery_results['total_endpoints']} endpoints")
        
        return discovery_results
    
    async def _scan_source_code(self) -> Dict[str, List[APIEndpoint]]:
        """Escanea el código fuente para encontrar endpoints"""
        endpoints_by_service = {}
        
        # Patrones para detectar endpoints
        patterns = {
            # Next.js API routes
            "nextjs_route": r"export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(",
            # Express routes
            "express_route": r"app\.(get|post|put|delete|patch)\s*\(\s*['\"]([^'\"]+)['\"]",
            # FastAPI routes
            "fastapi_route": r"@app\.(get|post|put|delete|patch)\s*\(\s*['\"]([^'\"]+)['\"]",
        }
        
        for service_name in self.known_services.keys():
            service_path = self.workspace_path / "apps" / service_name
            if not service_path.exists():
                service_path = self.workspace_path / service_name
            
            if service_path.exists():
                endpoints = await self._scan_service_directory(service_path, service_name, patterns)
                endpoints_by_service[service_name] = endpoints
        
        return endpoints_by_service
    
    async def _scan_service_directory(self, service_path: Path, service_name: str, patterns: Dict) -> List[APIEndpoint]:
        """Escanea un directorio de servicio específico"""
        endpoints = []
        
        # Buscar archivos relevantes
        file_patterns = ["**/*.ts", "**/*.js", "**/*.py"]
        
        for pattern in file_patterns:
            for file_path in service_path.glob(pattern):
                if any(exclude in str(file_path) for exclude in [".next", "node_modules", "__pycache__"]):
                    continue
                
                try:
                    content = file_path.read_text(encoding='utf-8')
                    file_endpoints = self._extract_endpoints_from_file(content, file_path, service_name)
                    endpoints.extend(file_endpoints)
                except Exception as e:
                    print(f"⚠️ Error leyendo {file_path}: {e}")
        
        return endpoints
    
    def _extract_endpoints_from_file(self, content: str, file_path: Path, service_name: str) -> List[APIEndpoint]:
        """Extrae endpoints de un archivo específico"""
        endpoints = []
        
        # Detectar rutas de Next.js API
        if "/api/" in str(file_path) or "route.ts" in str(file_path):
            # Extraer métodos HTTP
            methods = re.findall(r"export\s+(?:async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(", content)
            if methods:
                # Construir path desde la estructura de archivos
                api_path = self._build_api_path_from_file(file_path, service_name)
                for method in methods:
                    endpoint = APIEndpoint(
                        path=api_path,
                        method=method.upper(),
                        service=service_name,
                        port=self.known_services[service_name]["port"],
                        description=f"Auto-discovered from {file_path.name}",
                        requires_auth=self._detect_auth_requirement(content)
                    )
                    endpoints.append(endpoint)
        
        # Detectar rutas de Express
        express_routes = re.findall(r"app\.(get|post|put|delete|patch)\s*\(\s*['\"]([^'\"]+)['\"]", content)
        for method, path in express_routes:
            endpoint = APIEndpoint(
                path=path,
                method=method.upper(),
                service=service_name,
                port=self.known_services[service_name]["port"],
                description=f"Express route from {file_path.name}",
                requires_auth=self._detect_auth_requirement(content)
            )
            endpoints.append(endpoint)
        
        # Detectar rutas de FastAPI
        fastapi_routes = re.findall(r"@app\.(get|post|put|delete|patch)\s*\(\s*['\"]([^'\"]+)['\"]", content)
        for method, path in fastapi_routes:
            endpoint = APIEndpoint(
                path=path,
                method=method.upper(),
                service=service_name,
                port=self.known_services[service_name]["port"],
                description=f"FastAPI route from {file_path.name}",
                requires_auth=self._detect_auth_requirement(content)
            )
            endpoints.append(endpoint)
        
        return endpoints
    
    def _build_api_path_from_file(self, file_path: Path, service_name: str) -> str:
        """Construye el path de API desde la estructura de archivos"""
        parts = file_path.parts
        
        # Encontrar la parte "api"
        try:
            api_index = parts.index("api")
            path_parts = parts[api_index:]
            
            # Remover "route.ts" si existe
            if path_parts[-1] == "route.ts":
                path_parts = path_parts[:-1]
            
            # Construir path
            api_path = "/" + "/".join(path_parts)
            return api_path
        except ValueError:
            return f"/api/unknown/{file_path.stem}"
    
    def _detect_auth_requirement(self, content: str) -> bool:
        """Detecta si un endpoint requiere autenticación"""
        auth_indicators = [
            "requireAuth", "authMiddleware", "verifyToken", "authenticate",
            "Authorization", "Bearer", "JWT", "auth", "token"
        ]
        return any(indicator in content for indicator in auth_indicators)
    
    async def _check_active_services(self) -> List[str]:
        """Verifica qué servicios están activos"""
        active_services = []
        
        for service_name, config in self.known_services.items():
            try:
                async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=3)) as session:
                    # Intentar diferentes endpoints de health check
                    health_endpoints = ["/api/health", "/health", "/", "/docs"]
                    
                    for endpoint in health_endpoints:
                        try:
                            async with session.get(f"{config['base_url']}{endpoint}") as response:
                                if response.status < 500:
                                    active_services.append(service_name)
                                    print(f"✅ {service_name} está activo ({config['base_url']})")
                                    break
                        except:
                            continue
                    else:
                        print(f"❌ {service_name} no responde ({config['base_url']})")
                        
            except Exception as e:
                print(f"❌ Error verificando {service_name}: {e}")
        
        return active_services
    
    async def test_all_endpoints(self) -> Dict[str, Any]:
        """Testa todos los endpoints descubiertos"""
        print("🧪 Iniciando testing de todos los endpoints...")
        
        test_results = {
            "timestamp": datetime.now().isoformat(),
            "total_tests": 0,
            "passed": 0,
            "failed": 0,
            "skipped": 0,
            "results_by_service": {}
        }
        
        for service_name, service in self.services.items():
            if service.health_status != "active":
                print(f"⏭️ Saltando {service_name} (inactivo)")
                continue
            
            service_results = await self._test_service_endpoints(service)
            test_results["results_by_service"][service_name] = service_results
            
            test_results["total_tests"] += service_results["total"]
            test_results["passed"] += service_results["passed"]
            test_results["failed"] += service_results["failed"]
            test_results["skipped"] += service_results["skipped"]
        
        # Guardar resultados de tests
        await self._save_test_results(test_results)
        
        print(f"\n🏁 Testing completado:")
        print(f"   ✅ {test_results['passed']} pasaron")
        print(f"   ❌ {test_results['failed']} fallaron")
        print(f"   ⏭️ {test_results['skipped']} saltados")
        
        return test_results
    
    async def _test_service_endpoints(self, service: APIService) -> Dict[str, Any]:
        """Testa los endpoints de un servicio específico"""
        print(f"\n🔧 Testing {service.name}...")
        
        results = {
            "service_name": service.name,
            "base_url": service.base_url,
            "total": len(service.endpoints),
            "passed": 0,
            "failed": 0,
            "skipped": 0,
            "endpoints": []
        }
        
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
            for endpoint in service.endpoints:
                result = await self._test_single_endpoint(session, service, endpoint)
                results["endpoints"].append(result)
                
                if result["status"] == "passed":
                    results["passed"] += 1
                elif result["status"] == "failed":
                    results["failed"] += 1
                else:
                    results["skipped"] += 1
                
                print(f"   {result['status'].upper()}: {endpoint.method} {endpoint.path}")
        
        return results
    
    async def _test_single_endpoint(self, session: aiohttp.ClientSession, service: APIService, endpoint: APIEndpoint) -> Dict[str, Any]:
        """Testa un endpoint individual"""
        full_url = f"{service.base_url}{endpoint.path}"
        
        try:
            start_time = time.time()
            
            # Preparar headers
            headers = {"Content-Type": "application/json"}
            
            # Para métodos que requieren body, enviar un JSON vacío
            data = None
            if endpoint.method in ["POST", "PUT", "PATCH"]:
                data = "{}"
            
            async with session.request(
                method=endpoint.method,
                url=full_url,
                headers=headers,
                data=data
            ) as response:
                response_time = time.time() - start_time
                
                # Actualizar endpoint con resultados
                endpoint.last_tested = datetime.now()
                endpoint.response_time = response_time
                
                if response.status < 500:
                    endpoint.status = "working"
                    return {
                        "endpoint": endpoint.path,
                        "method": endpoint.method,
                        "status": "passed",
                        "status_code": response.status,
                        "response_time": response_time,
                        "url": full_url
                    }
                else:
                    endpoint.status = "error"
                    endpoint.error_message = f"HTTP {response.status}"
                    return {
                        "endpoint": endpoint.path,
                        "method": endpoint.method,
                        "status": "failed",
                        "status_code": response.status,
                        "response_time": response_time,
                        "error": f"HTTP {response.status}",
                        "url": full_url
                    }
                    
        except asyncio.TimeoutError:
            endpoint.status = "timeout"
            endpoint.error_message = "Timeout"
            return {
                "endpoint": endpoint.path,
                "method": endpoint.method,
                "status": "failed",
                "error": "Timeout",
                "url": full_url
            }
        except Exception as e:
            endpoint.status = "error"
            endpoint.error_message = str(e)
            return {
                "endpoint": endpoint.path,
                "method": endpoint.method,
                "status": "failed",
                "error": str(e),
                "url": full_url
            }
    
    async def generate_typescript_types(self) -> str:
        """Genera tipos TypeScript para el frontend"""
        print("📝 Generando tipos TypeScript...")
        
        typescript_content = [
            "// Auto-generated TypeScript types for AltaMedica APIs",
            f"// Generated at: {datetime.now().isoformat()}",
            "",
            "// API Configuration",
            "export const API_SERVICES = {",
        ]
        
        for service_name, service in self.services.items():
            typescript_content.extend([
                f"  {service_name.upper()}: {{",
                f"    baseUrl: '{service.base_url}',",
                f"    port: {service.port},",
                "    endpoints: {",
            ])
            
            for endpoint in service.endpoints:
                safe_name = endpoint.path.replace("/", "_").replace("-", "_").replace(":", "_").upper()
                typescript_content.append(f"      {safe_name}: '{endpoint.path}',")
            
            typescript_content.extend([
                "    }",
                "  },",
            ])
        
        typescript_content.extend([
            "} as const;",
            "",
            "// API Client type",
            "export interface APIEndpoint {",
            "  path: string;",
            "  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';",
            "  requiresAuth: boolean;",
            "  service: string;",
            "}",
            "",
            "// Auto-discovered endpoints",
            "export const DISCOVERED_ENDPOINTS: APIEndpoint[] = [",
        ])
        
        for service in self.services.values():
            for endpoint in service.endpoints:
                typescript_content.extend([
                    "  {",
                    f"    path: '{endpoint.path}',",
                    f"    method: '{endpoint.method}',",
                    f"    requiresAuth: {str(endpoint.requires_auth).lower()},",
                    f"    service: '{endpoint.service}',",
                    "  },",
                ])
        
        typescript_content.extend([
            "];",
            "",
            "// Helper function to build API URLs",
            "export function buildApiUrl(service: keyof typeof API_SERVICES, endpoint: string): string {",
            "  return `${API_SERVICES[service].baseUrl}${endpoint}`;",
            "}",
        ])
        
        typescript_types = "\n".join(typescript_content)
        
        # Guardar archivo TypeScript
        types_file = self.results_path / "api-types.ts"
        types_file.write_text(typescript_types, encoding='utf-8')
        
        print(f"✅ Tipos TypeScript guardados en: {types_file}")
        return typescript_types
    
    async def _save_discovery_results(self, results: Dict[str, Any]):
        """Guarda los resultados del descubrimiento"""
        results_file = self.results_path / f"discovery_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, default=str)
        
        # También guardar la versión más reciente
        latest_file = self.results_path / "latest_discovery.json"
        with open(latest_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, default=str)
    
    async def _save_test_results(self, results: Dict[str, Any]):
        """Guarda los resultados de los tests"""
        results_file = self.results_path / f"test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, default=str)
        
        # También guardar la versión más reciente
        latest_file = self.results_path / "latest_tests.json"
        with open(latest_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, default=str)

# FastAPI App para el dashboard web
app = FastAPI(title="AltaMedica API Discovery Hub", version="1.0.0")
hub = APIDiscoveryHub()

@app.get("/", response_class=HTMLResponse)
async def dashboard():
    """Dashboard principal del hub"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>🔥 AltaMedica API Discovery Hub</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
            .button:hover { background: #0056b3; }
            .status-good { color: #28a745; }
            .status-bad { color: #dc3545; }
            .status-warning { color: #ffc107; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
            .endpoint { background: #f8f9fa; padding: 10px; margin: 5px 0; border-radius: 4px; border-left: 4px solid #007bff; }
            .method-get { border-left-color: #28a745; }
            .method-post { border-left-color: #007bff; }
            .method-put { border-left-color: #ffc107; }
            .method-delete { border-left-color: #dc3545; }
            pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🔥 AltaMedica API Discovery & Testing Hub</h1>
            
            <div class="card">
                <h2>🚀 Acciones Principales</h2>
                <button class="button" onclick="runDiscovery()">🔍 Descubrir APIs</button>
                <button class="button" onclick="runTests()">🧪 Ejecutar Tests</button>
                <button class="button" onclick="generateTypes()">📝 Generar Tipos TS</button>
                <button class="button" onclick="viewResults()">📊 Ver Resultados</button>
                <button class="button" onclick="runFullScan()">⚡ Escaneo Completo</button>
            </div>
            
            <div class="card">
                <h2>📊 Estado del Sistema</h2>
                <div id="status">Cargando...</div>
            </div>
            
            <div class="card">
                <h2>📋 Resultados</h2>
                <div id="results">Los resultados aparecerán aquí después de ejecutar las acciones.</div>
            </div>
        </div>
        
        <script>
            async function runDiscovery() {
                document.getElementById('results').innerHTML = '🔍 Ejecutando descubrimiento...';
                try {
                    const response = await fetch('/api/discover');
                    const data = await response.json();
                    displayResults('Discovery', data);
                } catch (error) {
                    document.getElementById('results').innerHTML = `❌ Error: ${error.message}`;
                }
            }
            
            async function runTests() {
                document.getElementById('results').innerHTML = '🧪 Ejecutando tests...';
                try {
                    const response = await fetch('/api/test');
                    const data = await response.json();
                    displayResults('Tests', data);
                } catch (error) {
                    document.getElementById('results').innerHTML = `❌ Error: ${error.message}`;
                }
            }
            
            async function generateTypes() {
                document.getElementById('results').innerHTML = '📝 Generando tipos TypeScript...';
                try {
                    const response = await fetch('/api/generate-types');
                    const data = await response.text();
                    document.getElementById('results').innerHTML = `
                        <h3>✅ Tipos TypeScript Generados</h3>
                        <pre>${data}</pre>
                    `;
                } catch (error) {
                    document.getElementById('results').innerHTML = `❌ Error: ${error.message}`;
                }
            }
            
            async function viewResults() {
                try {
                    const response = await fetch('/api/results');
                    const data = await response.json();
                    displayResults('Latest Results', data);
                } catch (error) {
                    document.getElementById('results').innerHTML = `❌ Error: ${error.message}`;
                }
            }
            
            async function runFullScan() {
                document.getElementById('results').innerHTML = '⚡ Ejecutando escaneo completo...';
                try {
                    const response = await fetch('/api/full-scan');
                    const data = await response.json();
                    displayResults('Full Scan', data);
                } catch (error) {
                    document.getElementById('results').innerHTML = `❌ Error: ${error.message}`;
                }
            }
            
            function displayResults(title, data) {
                const html = `
                    <h3>✅ ${title} Completado</h3>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                `;
                document.getElementById('results').innerHTML = html;
            }
            
            // Cargar estado inicial
            async function loadStatus() {
                try {
                    const response = await fetch('/api/status');
                    const data = await response.json();
                    document.getElementById('status').innerHTML = `
                        <div class="grid">
                            <div><strong>Servicios:</strong> ${data.total_services}</div>
                            <div><strong>Endpoints:</strong> ${data.total_endpoints}</div>
                            <div><strong>Último escaneo:</strong> ${data.last_scan || 'Nunca'}</div>
                        </div>
                    `;
                } catch (error) {
                    document.getElementById('status').innerHTML = '❌ Error cargando estado';
                }
            }
            
            loadStatus();
        </script>
    </body>
    </html>
    """

@app.get("/api/discover")
async def api_discover():
    """Endpoint para descubrir APIs"""
    results = await hub.discover_all_apis()
    return results

@app.get("/api/test")
async def api_test():
    """Endpoint para ejecutar tests"""
    results = await hub.test_all_endpoints()
    return results

@app.get("/api/generate-types")
async def api_generate_types():
    """Endpoint para generar tipos TypeScript"""
    types = await hub.generate_typescript_types()
    return types

@app.get("/api/full-scan")
async def api_full_scan():
    """Endpoint para escaneo completo"""
    # Ejecutar descubrimiento
    discovery = await hub.discover_all_apis()
    
    # Ejecutar tests
    tests = await hub.test_all_endpoints()
    
    # Generar tipos
    types = await hub.generate_typescript_types()
    
    return {
        "discovery": discovery,
        "tests": tests,
        "types_generated": True,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/status")
async def api_status():
    """Estado actual del sistema"""
    return {
        "total_services": len(hub.services),
        "total_endpoints": sum(len(s.endpoints) for s in hub.services.values()),
        "last_scan": datetime.now().isoformat() if hub.services else None,
        "services": list(hub.services.keys())
    }

@app.get("/api/results")
async def api_results():
    """Últimos resultados guardados"""
    try:
        latest_discovery = hub.results_path / "latest_discovery.json"
        latest_tests = hub.results_path / "latest_tests.json"
        
        results = {}
        
        if latest_discovery.exists():
            with open(latest_discovery, 'r', encoding='utf-8') as f:
                results["discovery"] = json.load(f)
        
        if latest_tests.exists():
            with open(latest_tests, 'r', encoding='utf-8') as f:
                results["tests"] = json.load(f)
        
        return results
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    print("🔥 Iniciando AltaMedica API Discovery & Testing Hub...")
    print("📍 Dashboard: http://localhost:9999")
    print("📊 API Docs: http://localhost:9999/docs")
    
    # Ejecutar escaneo inicial
    asyncio.run(hub.discover_all_apis())
    
    # Iniciar servidor
    uvicorn.run(app, host="0.0.0.0", port=9999)
