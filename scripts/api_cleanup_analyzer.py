#!/usr/bin/env python3
"""
🧹 API Cleanup Analyzer - Identifica APIs para eliminar
"""

import json
import re
from collections import defaultdict
from pathlib import Path

class APICleanupAnalyzer:
    def __init__(self):
        self.apis = []
        self.cleanup_recommendations = {
            "duplicates": [],
            "test_apis": [],
            "old_files": [],
            "unknown_paths": [],
            "external_apis": [],
            "deprecated": [],
            "debug_apis": []
        }
        
    def analyze_cleanup(self):
        """Analiza todas las APIs para recomendar limpieza"""
        print("🧹 Analizando APIs para cleanup...")
        
        # Cargar datos
        with open('fast_api_results.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        self.apis = data['all_apis']
        
        # Ejecutar análisis
        self._find_duplicates()
        self._find_test_apis()
        self._find_old_files()
        self._find_unknown_paths()
        self._find_external_apis()
        self._find_deprecated_apis()
        self._find_debug_apis()
        
        # Generar reporte
        self._generate_cleanup_report()
        
        return self.cleanup_recommendations
    
    def _find_duplicates(self):
        """Encuentra APIs duplicadas"""
        path_methods = defaultdict(list)
        
        for api in self.apis:
            key = f"{api['path']}:{api['method']}"
            path_methods[key].append(api)
        
        # Encontrar duplicados reales
        for key, apis in path_methods.items():
            if len(apis) > 1:
                # Agrupar por servicio
                by_service = defaultdict(list)
                for api in apis:
                    by_service[api['service']].append(api)
                
                # Si hay múltiples en el mismo servicio, son duplicados
                for service, service_apis in by_service.items():
                    if len(service_apis) > 1:
                        self.cleanup_recommendations["duplicates"].extend(service_apis[1:])  # Mantener el primero
    
    def _find_test_apis(self):
        """Encuentra APIs de testing"""
        test_indicators = [
            'test', 'debug', 'mock', 'demo', 'example', 
            'sandbox', 'dev', 'temp', 'tmp'
        ]
        
        for api in self.apis:
            path_lower = api['path'].lower()
            file_lower = api['file'].lower()
            
            if any(indicator in path_lower or indicator in file_lower for indicator in test_indicators):
                # Algunos casos específicos que son legítimos
                if any(legitimate in path_lower for legitimate in ['/debug-headers', '/debug-refresh']):
                    continue  # Mantener estos
                
                self.cleanup_recommendations["test_apis"].append(api)
    
    def _find_old_files(self):
        """Encuentra archivos viejos/obsoletos"""
        old_indicators = [
            'route-old.ts', 'route-complex.ts', '.backup', 
            '.bak', '-old', '_old', 'deprecated'
        ]
        
        for api in self.apis:
            if any(indicator in api['file'] or indicator in api['full_path'] for indicator in old_indicators):
                self.cleanup_recommendations["old_files"].append(api)
    
    def _find_unknown_paths(self):
        """Encuentra paths desconocidos o malformados"""
        for api in self.apis:
            if api['path'] in ['/api/unknown', '/unknown']:
                self.cleanup_recommendations["unknown_paths"].append(api)
    
    def _find_external_apis(self):
        """Encuentra llamadas a APIs externas que no son endpoints"""
        for api in self.apis:
            if api['path'].startswith('http') and 'localhost' not in api['path']:
                self.cleanup_recommendations["external_apis"].append(api)
    
    def _find_deprecated_apis(self):
        """Encuentra APIs posiblemente deprecadas"""
        deprecated_patterns = [
            '/v0/', '/old/', '/legacy/', '/deprecated/'
        ]
        
        for api in self.apis:
            if any(pattern in api['path'] for pattern in deprecated_patterns):
                self.cleanup_recommendations["deprecated"].append(api)
    
    def _find_debug_apis(self):
        """Encuentra APIs de debug específicas"""
        debug_paths = [
            '/api/debug-headers',
            '/api/debug-refresh', 
            '/api/firestore-integration-test',
            '/api/create-test-user'
        ]
        
        for api in self.apis:
            if api['path'] in debug_paths:
                self.cleanup_recommendations["debug_apis"].append(api)
    
    def _generate_cleanup_report(self):
        """Genera reporte de cleanup"""
        
        total_to_remove = sum(len(apis) for apis in self.cleanup_recommendations.values())
        total_apis = len(self.apis)
        
        print(f"\n🧹 REPORTE DE CLEANUP DE APIs")
        print("=" * 50)
        print(f"📊 Total APIs: {total_apis}")
        print(f"🗑️  APIs a eliminar: {total_to_remove}")
        print(f"✅ APIs a mantener: {total_apis - total_to_remove}")
        print(f"📉 Reducción: {(total_to_remove/total_apis)*100:.1f}%")
        print()
        
        # Detalles por categoría
        for category, apis in self.cleanup_recommendations.items():
            if apis:
                print(f"🔍 {category.upper().replace('_', ' ')}: {len(apis)} APIs")
                
                # Agrupar por servicio para mostrar resumen
                by_service = defaultdict(list)
                for api in apis:
                    by_service[api['service']].append(api)
                
                for service, service_apis in by_service.items():
                    print(f"   📁 {service}: {len(service_apis)} APIs")
                    
                    # Mostrar algunos ejemplos
                    examples = list(set(api['path'] for api in service_apis))[:3]
                    for example in examples:
                        print(f"      🗑️  {example}")
                    
                    if len(examples) > 3:
                        print(f"      ... y {len(service_apis) - 3} más")
                print()
        
        # Generar archivos de cleanup
        self._save_cleanup_files()
    
    def _save_cleanup_files(self):
        """Guarda archivos para el cleanup"""
        
        # Lista de archivos para eliminar
        files_to_delete = set()
        
        for category, apis in self.cleanup_recommendations.items():
            for api in apis:
                if category in ['old_files', 'test_apis']:
                    files_to_delete.add(api['full_path'])
        
        # Script de cleanup
        cleanup_script = [
            "#!/usr/bin/env python3",
            "# 🧹 Script de limpieza automática de APIs",
            "import os",
            "from pathlib import Path",
            "",
            "def cleanup_files():",
            "    \"\"\"Elimina archivos obsoletos\"\"\"",
            "    workspace = Path('c:/Users/Eduardo/Documents/devaltamedica')",
            "    files_to_delete = [",
        ]
        
        for file_path in sorted(files_to_delete):
            cleanup_script.append(f"        '{file_path}',")
        
        cleanup_script.extend([
            "    ]",
            "",
            "    deleted = 0",
            "    for file_path in files_to_delete:",
            "        full_path = workspace / file_path",
            "        if full_path.exists():",
            "            try:",
            "                full_path.unlink()",
            "                print(f'🗑️  Eliminado: {file_path}')",
            "                deleted += 1",
            "            except Exception as e:",
            "                print(f'❌ Error eliminando {file_path}: {e}')",
            "",
            "    print(f'\\n✅ Cleanup completado: {deleted} archivos eliminados')",
            "",
            "if __name__ == '__main__':",
            "    cleanup_files()"
        ])
        
        with open('cleanup_script.py', 'w', encoding='utf-8') as f:
            f.write('\n'.join(cleanup_script))
        
        # JSON detallado
        with open('cleanup_analysis.json', 'w', encoding='utf-8') as f:
            json.dump(self.cleanup_recommendations, f, indent=2, ensure_ascii=False)
        
        # APIs limpias (después del cleanup)
        clean_apis = []
        apis_to_remove = set()
        
        for category, apis in self.cleanup_recommendations.items():
            for api in apis:
                api_key = f"{api['service']}:{api['method']}:{api['path']}:{api['file']}"
                apis_to_remove.add(api_key)
        
        for api in self.apis:
            api_key = f"{api['service']}:{api['method']}:{api['path']}:{api['file']}"
            if api_key not in apis_to_remove:
                clean_apis.append(api)
        
        # Generar configuración limpia
        self._generate_clean_config(clean_apis)
        
        print(f"💾 Archivos generados:")
        print(f"   📄 cleanup_analysis.json - Análisis detallado")
        print(f"   🧹 cleanup_script.py - Script de limpieza")
        print(f"   ✨ clean_api_config.ts - Configuración limpia")
    
    def _generate_clean_config(self, clean_apis):
        """Genera configuración TypeScript limpia"""
        
        # Agrupar por servicio
        by_service = defaultdict(list)
        for api in clean_apis:
            by_service[api['service']].append(api)
        
        ts_lines = [
            "// ✨ Clean API Configuration (After Cleanup)",
            f"// Clean APIs: {len(clean_apis)}",
            f"// Generated: {json.dumps(None, default=str)}",
            "",
            "export const CLEAN_API_CONFIG = {",
        ]
        
        port_map = {
            'apps/api-server': 3001,
            'apps/patients': 3003,
            'apps/doctors': 3002,
            'apps/admin': 3005,
            'apps/companies': 3004,
            'apps/web-app': 3000,
            'python-tools': 8888
        }
        
        for service, apis in by_service.items():
            port = port_map.get(service, 8080)
            unique_paths = list(set(api['path'] for api in apis if api['path'] != '/api/unknown'))
            
            if not unique_paths:  # Skip services with no valid paths
                continue
                
            ts_lines.extend([
                f"  '{service.replace('apps/', '').replace('-', '_')}': {{",
                f"    port: {port},",
                f"    baseUrl: 'http://localhost:{port}',",
                f"    totalApis: {len(apis)},",
                "    endpoints: [",
            ])
            
            for path in sorted(unique_paths):
                ts_lines.append(f"      '{path}',")
            
            ts_lines.extend([
                "    ]",
                "  },",
            ])
        
        ts_lines.extend([
            "} as const;",
            "",
            f"// Summary: {len(clean_apis)} clean APIs ready for production use"
        ])
        
        with open('clean_api_config.ts', 'w', encoding='utf-8') as f:
            f.write('\n'.join(ts_lines))

def main():
    analyzer = APICleanupAnalyzer()
    recommendations = analyzer.analyze_cleanup()
    
    print(f"\n🎯 RECOMENDACIONES FINALES:")
    print("=" * 30)
    print("1. Revisar 'cleanup_analysis.json' para detalles")
    print("2. Ejecutar 'python cleanup_script.py' para limpiar")
    print("3. Usar 'clean_api_config.ts' como configuración final")
    
    return recommendations

if __name__ == "__main__":
    main()
