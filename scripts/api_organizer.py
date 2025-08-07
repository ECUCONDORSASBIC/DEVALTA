#!/usr/bin/env python3
"""
📋 API Organizer - Reorganiza APIs de manera clara y accesible
"""

import json
from collections import defaultdict

class APIOrganizer:
    def __init__(self):
        self.organized_apis = {}
        
    def reorganize_apis(self):
        """Reorganiza las APIs de manera más clara"""
        print("📋 Reorganizando APIs de manera clara...")
        
        # Cargar APIs limpias
        with open('fast_api_results.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        apis = data['all_apis']
        
        # Filtrar APIs válidas (sin unknown, test, old)
        valid_apis = []
        for api in apis:
            if self._is_valid_api(api):
                valid_apis.append(api)
        
        # Organizar por dominio/funcionalidad
        self._organize_by_domain(valid_apis)
        
        # Generar configuración organizada
        self._generate_organized_config()
        
        return self.organized_apis
    
    def _is_valid_api(self, api):
        """Determina si una API es válida para incluir"""
        # Filtrar APIs inválidas
        invalid_indicators = [
            '/api/unknown', '/unknown', 'route-old', 'route-complex',
            'test-sso', 'test-env', 'create-test-user', 'debug-headers',
            'firestore-integration-test'
        ]
        
        # Filtrar llamadas externas
        if api['path'].startswith('http') and 'localhost' not in api['path']:
            return False
        
        # Filtrar archivos/paths inválidos
        for indicator in invalid_indicators:
            if indicator in api['path'] or indicator in api['file']:
                return False
        
        return True
    
    def _organize_by_domain(self, apis):
        """Organiza APIs por dominio funcional"""
        
        # Mapear por funcionalidad
        domains = {
            # Core Business
            'patients': {
                'description': 'Gestión de Pacientes',
                'apis': [],
                'common_prefix': '/api/v1/patients'
            },
            'doctors': {
                'description': 'Gestión de Doctores', 
                'apis': [],
                'common_prefix': '/api/v1/doctors'
            },
            'appointments': {
                'description': 'Citas Médicas',
                'apis': [],
                'common_prefix': '/api/appointments'
            },
            'telemedicine': {
                'description': 'Telemedicina y Videollamadas',
                'apis': [],
                'common_prefix': '/api/telemedicine'
            },
            
            # Medical Data
            'anamnesis': {
                'description': 'Anamnesis y Historiales',
                'apis': [],
                'common_prefix': '/api/v1/anamnesis'
            },
            'medical_records': {
                'description': 'Expedientes Médicos',
                'apis': [],
                'common_prefix': '/api/v1/medical-records'
            },
            'prescriptions': {
                'description': 'Recetas Médicas',
                'apis': [],
                'common_prefix': '/api/v1/prescriptions'
            },
            'reports': {
                'description': 'Reportes Médicos',
                'apis': [],
                'common_prefix': '/api/v1/reports'
            },
            
            # Business
            'companies': {
                'description': 'Empresas/Instituciones',
                'apis': [],
                'common_prefix': '/api/v1/companies'
            },
            'marketplace': {
                'description': 'Marketplace B2B',
                'apis': [],
                'common_prefix': '/api/marketplace'
            },
            'jobs': {
                'description': 'Ofertas de Trabajo',
                'apis': [],
                'common_prefix': '/api/v1/job'
            },
            
            # Auth & Admin
            'auth': {
                'description': 'Autenticación y Autorización',
                'apis': [],
                'common_prefix': '/api/v1/auth'
            },
            'admin': {
                'description': 'Administración del Sistema',
                'apis': [],
                'common_prefix': '/api/admin'
            },
            'users': {
                'description': 'Gestión de Usuarios',
                'apis': [],
                'common_prefix': '/api/users'
            },
            
            # Technical
            'payments': {
                'description': 'Pagos y Facturación',
                'apis': [],
                'common_prefix': '/api/v1/payments'
            },
            'ai': {
                'description': 'Inteligencia Artificial',
                'apis': [],
                'common_prefix': '/api/v1/ai'
            },
            'webrtc': {
                'description': 'WebRTC y Comunicaciones',
                'apis': [],
                'common_prefix': '/api/rooms'
            },
            
            # System
            'health': {
                'description': 'Estado del Sistema',
                'apis': [],
                'common_prefix': '/api/health'
            },
            'matching': {
                'description': 'Sistema de Matching',
                'apis': [],
                'common_prefix': '/api/matching'
            },
            'other': {
                'description': 'Otros Endpoints',
                'apis': [],
                'common_prefix': ''
            }
        }
        
        # Clasificar APIs por dominio
        for api in apis:
            classified = False
            path = api['path']
            
            # Intentar clasificar por path
            for domain_key, domain_info in domains.items():
                if domain_key == 'other':
                    continue
                    
                # Múltiples formas de match
                keywords = self._get_domain_keywords(domain_key)
                
                if any(keyword in path.lower() for keyword in keywords):
                    domains[domain_key]['apis'].append(api)
                    classified = True
                    break
            
            # Si no se clasificó, va a "other"
            if not classified:
                domains['other']['apis'].append(api)
        
        # Eliminar dominios vacíos
        self.organized_apis = {k: v for k, v in domains.items() if v['apis']}
    
    def _get_domain_keywords(self, domain_key):
        """Obtiene keywords para clasificar por dominio"""
        keywords_map = {
            'patients': ['patient', 'paciente'],
            'doctors': ['doctor', 'medico', 'physician'],
            'appointments': ['appointment', 'cita'],
            'telemedicine': ['telemedicine', 'session', 'webrtc', 'room'],
            'anamnesis': ['anamnesis', 'anamnes'],
            'medical_records': ['medical-record', 'expediente'],
            'prescriptions': ['prescription', 'receta'],
            'reports': ['report', 'reporte'],
            'companies': ['compan', 'empresa'],
            'marketplace': ['marketplace', 'listing'],
            'jobs': ['job', 'trabajo', 'empleo'],
            'auth': ['auth', 'login', 'token'],
            'admin': ['admin', 'system'],
            'users': ['user', 'usuario'],
            'payments': ['payment', 'pago', 'mercadopago'],
            'ai': ['/ai/', 'artificial', 'prediction'],
            'webrtc': ['webrtc', 'room'],
            'health': ['health', 'status'],
            'matching': ['matching', 'partner']
        }
        
        return keywords_map.get(domain_key, [domain_key])
    
    def _generate_organized_config(self):
        """Genera configuración TypeScript organizada"""
        
        # Calcular estadísticas
        total_apis = sum(len(domain['apis']) for domain in self.organized_apis.values())
        
        ts_lines = [
            "// 🎯 Organized API Configuration - Clear & Accessible",
            f"// Total APIs: {total_apis} organized by domain",
            "// Structure: domain.service.endpoint for easy access",
            "",
            "// 📚 Available Domains:",
        ]
        
        # Documentar dominios disponibles
        for domain_key, domain_info in self.organized_apis.items():
            if domain_info['apis']:
                ts_lines.append(f"// - {domain_key}: {domain_info['description']} ({len(domain_info['apis'])} APIs)")
        
        ts_lines.extend([
            "",
            "export const API_DOMAINS = {",
        ])
        
        # Generar cada dominio
        for domain_key, domain_info in self.organized_apis.items():
            if not domain_info['apis']:
                continue
                
            ts_lines.extend([
                f"  // {domain_info['description']}",
                f"  {domain_key}: {{",
                f"    description: '{domain_info['description']}',",
                f"    totalApis: {len(domain_info['apis'])},",
                "    services: {",
            ])
            
            # Agrupar por servicio dentro del dominio
            by_service = defaultdict(list)
            for api in domain_info['apis']:
                service_name = api['service'].replace('apps/', '').replace('-', '_')
                by_service[service_name].append(api)
            
            # Generar cada servicio
            for service_name, service_apis in by_service.items():
                port = self._get_service_port(service_name)
                unique_paths = self._get_unique_paths(service_apis)
                
                ts_lines.extend([
                    f"      {service_name}: {{",
                    f"        port: {port},",
                    f"        baseUrl: 'http://localhost:{port}',",
                    f"        endpoints: {{",
                ])
                
                # Generar endpoints con nombres más simples
                for path in unique_paths:
                    endpoint_name = self._generate_endpoint_name(path, domain_key)
                    ts_lines.append(f"          {endpoint_name}: '{path}',")
                
                ts_lines.extend([
                    "        }",
                    "      },",
                ])
            
            ts_lines.extend([
                "    }",
                "  },",
                "",
            ])
        
        # Helper functions
        ts_lines.extend([
            "} as const;",
            "",
            "// 🚀 Helper Functions for Easy Access",
            "export const API = {",
            "  // Build complete URL",
            "  url: (domain: keyof typeof API_DOMAINS, service: string, endpoint: string): string => {",
            "    const domainConfig = API_DOMAINS[domain];",
            "    const serviceConfig = domainConfig.services[service as keyof typeof domainConfig.services];",
            "    return `${serviceConfig.baseUrl}${serviceConfig.endpoints[endpoint as keyof typeof serviceConfig.endpoints]}`;",
            "  },",
            "",
            "  // Get service info", 
            "  service: (domain: keyof typeof API_DOMAINS, service: string) => {",
            "    return API_DOMAINS[domain].services[service as keyof typeof API_DOMAINS[domain].services];",
            "  },",
            "",
            "  // Get all endpoints for a domain",
            "  domain: (domain: keyof typeof API_DOMAINS) => {",
            "    return API_DOMAINS[domain];",
            "  }",
            "};",
            "",
            "// 📖 Usage Examples:",
            "// API.url('patients', 'api_server', 'list')        // http://localhost:3001/api/v1/patients",
            "// API.url('telemedicine', 'api_server', 'create')  // http://localhost:3001/api/telemedicine/sessions",
            "// API.service('doctors', 'doctors').port           // 3002",
            "// API.domain('auth').description                   // 'Autenticación y Autorización'",
            "",
            f"// 📊 Summary: {total_apis} APIs organized across {len(self.organized_apis)} domains"
        ])
        
        # Guardar configuración organizada
        with open('organized_api_config.ts', 'w', encoding='utf-8') as f:
            f.write('\n'.join(ts_lines))
        
        # Generar guía de uso
        self._generate_usage_guide()
        
        # Generar JSON para referencia
        self._save_organized_json()
    
    def _get_service_port(self, service_name):
        """Obtiene el puerto del servicio"""
        port_map = {
            'api_server': 3001,
            'patients': 3003, 
            'doctors': 3002,
            'admin': 3005,
            'companies': 3004,
            'web_app': 3000,
            'python_tools': 8888
        }
        return port_map.get(service_name, 8080)
    
    def _get_unique_paths(self, apis):
        """Obtiene paths únicos ordenados"""
        paths = list(set(api['path'] for api in apis))
        return sorted(paths)
    
    def _generate_endpoint_name(self, path, domain):
        """Genera nombre simple para endpoint"""
        # Simplificar nombres comunes
        simple_names = {
            # Genéricos
            f'/api/v1/{domain}': 'list',
            f'/api/v1/{domain}s': 'list',
            f'/api/{domain}': 'list',
            f'/api/{domain}s': 'list',
            
            # Con ID
            'id': 'byId',
            'get': 'get',
            'post': 'create',
            'put': 'update',
            'delete': 'delete',
        }
        
        # Limpiar path para generar nombre
        clean_path = path.replace('/api/v1/', '').replace('/api/', '')
        clean_path = clean_path.replace(':', '').replace('/', '_')
        clean_path = clean_path.replace('-', '_')
        
        # Casos especiales
        if path.endswith('/:id') or '[id]' in path:
            return 'byId'
        elif path == f'/api/v1/{domain}' or path == f'/api/{domain}':
            return 'list'
        elif 'health' in path:
            return 'health'
        elif 'status' in path:
            return 'status'
        elif 'search' in path:
            return 'search'
        elif 'create' in path:
            return 'create'
        elif 'update' in path:
            return 'update'
        elif 'delete' in path:
            return 'delete'
        else:
            # Generar nombre basado en el path
            parts = clean_path.split('_')
            if len(parts) > 1:
                return '_'.join(parts[-2:]) if len(parts) > 2 else clean_path
            return clean_path or 'root'
    
    def _generate_usage_guide(self):
        """Genera guía de uso"""
        guide_lines = [
            "# 📚 API Usage Guide - Easy Access to All Endpoints",
            "",
            "## 🎯 Quick Start",
            "",
            "```typescript",
            "import { API } from './organized_api_config';",
            "",
            "// Get patient list",
            "const patientsUrl = API.url('patients', 'api_server', 'list');",
            "// Result: http://localhost:3001/api/v1/patients",
            "",
            "// Get specific patient",
            "const patientUrl = API.url('patients', 'api_server', 'byId');", 
            "// Result: http://localhost:3001/api/v1/patients/:id",
            "",
            "// Create appointment",
            "const appointmentUrl = API.url('appointments', 'doctors', 'list');",
            "// Result: http://localhost:3002/api/appointments",
            "```",
            "",
            "## 🗂️ Available Domains",
            "",
        ]
        
        # Documentar cada dominio
        for domain_key, domain_info in self.organized_apis.items():
            if not domain_info['apis']:
                continue
                
            guide_lines.extend([
                f"### {domain_info['description']} (`{domain_key}`)",
                f"- **Total APIs:** {len(domain_info['apis'])}",
                "",
            ])
            
            # Mostrar servicios disponibles
            by_service = defaultdict(list)
            for api in domain_info['apis']:
                service_name = api['service'].replace('apps/', '').replace('-', '_')
                by_service[service_name].append(api)
            
            for service_name, service_apis in by_service.items():
                port = self._get_service_port(service_name)
                guide_lines.append(f"- **{service_name}** (port {port}): {len(service_apis)} endpoints")
            
            guide_lines.append("")
        
        guide_lines.extend([
            "## 🔗 Common Patterns",
            "",
            "```typescript",
            "// Health checks",
            "API.url('health', 'api_server', 'health')  // System health",
            "API.url('health', 'patients', 'health')    // Patients app health",
            "",
            "// Authentication",
            "API.url('auth', 'api_server', 'login')     // Login endpoint",
            "API.url('auth', 'api_server', 'refresh')   // Token refresh", 
            "",
            "// CRUD operations",
            "API.url('patients', 'api_server', 'list')    // GET list",
            "API.url('patients', 'api_server', 'byId')    // GET by ID",
            "API.url('patients', 'api_server', 'create')  // POST create",
            "API.url('patients', 'api_server', 'update')  // PUT update",
            "```",
            "",
            f"**Total APIs Organized:** {sum(len(d['apis']) for d in self.organized_apis.values())}",
            "",
            "---",
            "*Generated by API Organizer - Making APIs easy to find and use*"
        ])
        
        with open('API_USAGE_GUIDE.md', 'w', encoding='utf-8') as f:
            f.write('\n'.join(guide_lines))
    
    def _save_organized_json(self):
        """Guarda JSON organizado para referencia"""
        json_data = {}
        
        for domain_key, domain_info in self.organized_apis.items():
            json_data[domain_key] = {
                'description': domain_info['description'],
                'total_apis': len(domain_info['apis']),
                'services': {}
            }
            
            # Agrupar por servicio
            by_service = defaultdict(list)
            for api in domain_info['apis']:
                service_name = api['service'].replace('apps/', '').replace('-', '_')
                by_service[service_name].append(api)
            
            for service_name, service_apis in by_service.items():
                json_data[domain_key]['services'][service_name] = {
                    'port': self._get_service_port(service_name),
                    'total_apis': len(service_apis),
                    'endpoints': [api['path'] for api in service_apis]
                }
        
        with open('organized_apis.json', 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)

def main():
    organizer = APIOrganizer()
    organized = organizer.reorganize_apis()
    
    print(f"\n🎯 APIS ORGANIZADAS POR DOMINIO:")
    print("=" * 40)
    
    total = 0
    for domain, info in organized.items():
        count = len(info['apis'])
        total += count
        print(f"📁 {domain}: {count} APIs - {info['description']}")
    
    print(f"\n✅ Total: {total} APIs organizadas")
    print(f"📄 Archivos generados:")
    print(f"   🎯 organized_api_config.ts - Configuración organizada")
    print(f"   📚 API_USAGE_GUIDE.md - Guía de uso")
    print(f"   📊 organized_apis.json - Referencia JSON")

if __name__ == "__main__":
    main()
