#!/usr/bin/env python3
"""
🚀 Quick API Mapper - Mapeo rápido de APIs para desarrollo
Herramienta simple para mapear APIs backend → frontend
"""

import requests
import json
from datetime import datetime
from pathlib import Path

class QuickAPIMapper:
    """Mapeador rápido de APIs"""
    
    def __init__(self):
        self.services = {
            "api-server": "http://localhost:3001",
            "patients": "http://localhost:3003", 
            "doctors": "http://localhost:3002",
            "video-server": "http://localhost:8888",
        }
        
    def quick_scan(self):
        """Escaneo rápido de APIs activas"""
        print("🔍 Escaneando APIs rápidamente...\n")
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "active_services": [],
            "endpoints_found": {}
        }
        
        for service, url in self.services.items():
            print(f"🔧 Verificando {service}...")
            
            # Verificar si está activo
            try:
                response = requests.get(f"{url}/api/health", timeout=3)
                if response.status_code < 500:
                    print(f"   ✅ Activo: {url}")
                    results["active_services"].append(service)
                    
                    # Buscar endpoints comunes
                    endpoints = self._find_common_endpoints(url)
                    results["endpoints_found"][service] = endpoints
                    
                    print(f"   📊 {len(endpoints)} endpoints encontrados")
                else:
                    print(f"   ❌ Error HTTP: {response.status_code}")
            except Exception as e:
                print(f"   ❌ No responde: {e}")
        
        # Generar mapeo para frontend
        self._generate_frontend_map(results)
        
        return results
    
    def _find_common_endpoints(self, base_url):
        """Encuentra endpoints comunes"""
        common_paths = [
            "/api/health",
            "/api/v1/auth/login",
            "/api/v1/auth/logout", 
            "/api/v1/patients",
            "/api/v1/doctors",
            "/api/v1/appointments",
            "/api/video-calls/create",
            "/api/video-calls/active",
            "/docs",
            "/"
        ]
        
        found_endpoints = []
        
        for path in common_paths:
            try:
                response = requests.get(f"{base_url}{path}", timeout=2)
                if response.status_code < 500:
                    found_endpoints.append({
                        "path": path,
                        "status": response.status_code,
                        "method": "GET"
                    })
            except:
                pass
        
        return found_endpoints
    
    def _generate_frontend_map(self, results):
        """Genera mapeo para el frontend"""
        
        # Crear configuración API para frontend
        api_config = {
            "// Auto-generated API configuration": f"// Generated: {datetime.now().isoformat()}",
            "API_SERVICES": {}
        }
        
        for service in results["active_services"]:
            service_url = self.services[service]
            endpoints = results["endpoints_found"].get(service, [])
            
            api_config["API_SERVICES"][service.upper()] = {
                "baseUrl": service_url,
                "endpoints": {ep["path"]: ep["path"] for ep in endpoints}
            }
        
        # Guardar configuración
        config_file = Path("frontend_api_config.json")
        with open(config_file, 'w') as f:
            json.dump(api_config, f, indent=2)
        
        print(f"\n✅ Configuración guardada en: {config_file}")
        
        # Generar código TypeScript simple
        ts_code = self._generate_simple_typescript(api_config)
        ts_file = Path("api-config.ts")
        with open(ts_file, 'w') as f:
            f.write(ts_code)
        
        print(f"✅ Tipos TypeScript guardados en: {ts_file}")
    
    def _generate_simple_typescript(self, config):
        """Genera TypeScript simple para el frontend"""
        
        ts_lines = [
            "// Auto-generated API configuration for AltaMedica",
            f"// Generated: {datetime.now().isoformat()}",
            "",
            "export const API_CONFIG = {",
        ]
        
        for service_name, service_config in config["API_SERVICES"].items():
            ts_lines.extend([
                f"  {service_name}: {{",
                f"    baseUrl: '{service_config['baseUrl']}',",
                "    endpoints: {",
            ])
            
            for endpoint_name, endpoint_path in service_config["endpoints"].items():
                safe_name = endpoint_path.replace("/", "_").replace("-", "_").upper()
                ts_lines.append(f"      {safe_name}: '{endpoint_path}',")
            
            ts_lines.extend([
                "    }",
                "  },",
            ])
        
        ts_lines.extend([
            "} as const;",
            "",
            "// Helper function",
            "export function buildUrl(service: keyof typeof API_CONFIG, endpoint: string): string {",
            "  return `${API_CONFIG[service].baseUrl}${endpoint}`;",
            "}",
            "",
            "// Usage example:",
            "// const loginUrl = buildUrl('API_SERVER', '/api/v1/auth/login');",
        ])
        
        return "\n".join(ts_lines)

def main():
    """Función principal"""
    print("🚀 AltaMedica Quick API Mapper")
    print("=" * 50)
    
    mapper = QuickAPIMapper()
    results = mapper.quick_scan()
    
    print(f"\n📊 RESUMEN:")
    print(f"   ✅ {len(results['active_services'])} servicios activos")
    total_endpoints = sum(len(eps) for eps in results['endpoints_found'].values())
    print(f"   📡 {total_endpoints} endpoints encontrados")
    print(f"   📝 Archivos generados: frontend_api_config.json, api-config.ts")
    
    print(f"\n🎯 PRÓXIMOS PASOS:")
    print("   1. Importa api-config.ts en tu frontend")
    print("   2. Usa buildUrl() para construir URLs")
    print("   3. Ejecuta api_discovery_hub.py para análisis completo")

if __name__ == "__main__":
    main()
