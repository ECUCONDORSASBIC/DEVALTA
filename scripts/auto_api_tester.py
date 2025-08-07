#!/usr/bin/env python3
"""
🧪 Auto API Tester - Testing automático de APIs
Genera y ejecuta tests automáticamente para todas las APIs
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

class AutoAPITester:
    """Testing automático de APIs"""
    
    def __init__(self):
        self.base_urls = {
            "api-server": "http://localhost:3001",
            "patients": "http://localhost:3003",
            "doctors": "http://localhost:3002", 
            "video-server": "http://localhost:8888",
        }
        
        self.test_endpoints = {
            "api-server": [
                {"path": "/api/health", "method": "GET", "expect": 200},
                {"path": "/api/v1/auth/login", "method": "POST", "expect": [400, 422]},  # Sin datos
                {"path": "/api/v1/patients", "method": "GET", "expect": [200, 401]},
                {"path": "/api/v1/doctors", "method": "GET", "expect": [200, 401]},
            ],
            "patients": [
                {"path": "/api/health", "method": "GET", "expect": 200},
                {"path": "/", "method": "GET", "expect": 200},
            ],
            "doctors": [
                {"path": "/api/health", "method": "GET", "expect": 200},
                {"path": "/", "method": "GET", "expect": 200},
            ],
            "video-server": [
                {"path": "/", "method": "GET", "expect": 200},
                {"path": "/health", "method": "GET", "expect": 200},
                {"path": "/docs", "method": "GET", "expect": 200},
            ]
        }
    
    async def run_all_tests(self):
        """Ejecuta todos los tests automáticamente"""
        print("🧪 Iniciando Auto API Testing...")
        print("=" * 50)
        
        test_results = {
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_services": 0,
                "active_services": 0,
                "total_tests": 0,
                "passed_tests": 0,
                "failed_tests": 0
            },
            "services": {}
        }
        
        for service_name, base_url in self.base_urls.items():
            print(f"\n🔧 Testing {service_name} ({base_url})...")
            
            service_result = await self._test_service(service_name, base_url)
            test_results["services"][service_name] = service_result
            
            # Actualizar resumen
            test_results["summary"]["total_services"] += 1
            if service_result["is_active"]:
                test_results["summary"]["active_services"] += 1
            
            test_results["summary"]["total_tests"] += service_result["total_tests"]
            test_results["summary"]["passed_tests"] += service_result["passed_tests"]
            test_results["summary"]["failed_tests"] += service_result["failed_tests"]
        
        # Guardar resultados
        await self._save_results(test_results)
        
        # Mostrar resumen
        self._print_summary(test_results)
        
        return test_results
    
    async def _test_service(self, service_name: str, base_url: str) -> Dict[str, Any]:
        """Testa un servicio específico"""
        
        service_result = {
            "service_name": service_name,
            "base_url": base_url,
            "is_active": False,
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0,
            "response_time_avg": 0.0,
            "tests": []
        }
        
        endpoints = self.test_endpoints.get(service_name, [])
        service_result["total_tests"] = len(endpoints)
        
        if not endpoints:
            print(f"   ⚠️ No hay tests definidos para {service_name}")
            return service_result
        
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=5)) as session:
            response_times = []
            
            for endpoint_test in endpoints:
                test_result = await self._test_endpoint(session, base_url, endpoint_test)
                service_result["tests"].append(test_result)
                
                if test_result["passed"]:
                    service_result["passed_tests"] += 1
                    service_result["is_active"] = True
                    response_times.append(test_result["response_time"])
                else:
                    service_result["failed_tests"] += 1
                
                # Mostrar resultado
                status = "✅ PASS" if test_result["passed"] else "❌ FAIL"
                print(f"   {status}: {endpoint_test['method']} {endpoint_test['path']} ({test_result['response_time']:.3f}s)")
        
        # Calcular tiempo de respuesta promedio
        if response_times:
            service_result["response_time_avg"] = sum(response_times) / len(response_times)
        
        return service_result
    
    async def _test_endpoint(self, session: aiohttp.ClientSession, base_url: str, endpoint_test: Dict) -> Dict[str, Any]:
        """Testa un endpoint específico"""
        
        url = f"{base_url}{endpoint_test['path']}"
        method = endpoint_test["method"]
        expected_codes = endpoint_test["expect"]
        if isinstance(expected_codes, int):
            expected_codes = [expected_codes]
        
        start_time = time.time()
        
        try:
            # Preparar datos para POST
            data = None
            headers = {"Content-Type": "application/json"}
            
            if method in ["POST", "PUT", "PATCH"]:
                data = json.dumps({})  # Datos vacíos por defecto
            
            async with session.request(method, url, data=data, headers=headers) as response:
                response_time = time.time() - start_time
                status_code = response.status
                
                # Verificar si el código está en los esperados
                passed = status_code in expected_codes
                
                return {
                    "url": url,
                    "method": method,
                    "status_code": status_code,
                    "expected_codes": expected_codes,
                    "passed": passed,
                    "response_time": response_time,
                    "error": None
                }
                
        except asyncio.TimeoutError:
            return {
                "url": url,
                "method": method,
                "status_code": 0,
                "expected_codes": expected_codes,
                "passed": False,
                "response_time": time.time() - start_time,
                "error": "Timeout"
            }
        except Exception as e:
            return {
                "url": url,
                "method": method,
                "status_code": 0,
                "expected_codes": expected_codes,
                "passed": False,
                "response_time": time.time() - start_time,
                "error": str(e)
            }
    
    async def _save_results(self, results: Dict[str, Any]):
        """Guarda los resultados de los tests"""
        
        # Crear directorio si no existe
        results_dir = Path("test_results")
        results_dir.mkdir(exist_ok=True)
        
        # Guardar resultado con timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        detailed_file = results_dir / f"api_tests_{timestamp}.json"
        
        with open(detailed_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, default=str)
        
        # Guardar última versión
        latest_file = results_dir / "latest_api_tests.json"
        with open(latest_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, default=str)
        
        print(f"\n💾 Resultados guardados en:")
        print(f"   📄 {detailed_file}")
        print(f"   📄 {latest_file}")
    
    def _print_summary(self, results: Dict[str, Any]):
        """Muestra resumen de resultados"""
        
        summary = results["summary"]
        
        print(f"\n📊 RESUMEN DE TESTS:")
        print("=" * 30)
        print(f"🏥 Servicios totales: {summary['total_services']}")
        print(f"✅ Servicios activos: {summary['active_services']}")
        print(f"🧪 Tests totales: {summary['total_tests']}")
        print(f"✅ Tests pasados: {summary['passed_tests']}")
        print(f"❌ Tests fallidos: {summary['failed_tests']}")
        
        if summary['total_tests'] > 0:
            success_rate = (summary['passed_tests'] / summary['total_tests']) * 100
            print(f"📈 Tasa de éxito: {success_rate:.1f}%")
        
        print(f"\n🎯 SERVICIOS ACTIVOS:")
        for service_name, service_data in results["services"].items():
            if service_data["is_active"]:
                avg_time = service_data["response_time_avg"]
                print(f"   ✅ {service_name}: {avg_time:.3f}s promedio")
        
        print(f"\n❌ SERVICIOS INACTIVOS:")
        for service_name, service_data in results["services"].items():
            if not service_data["is_active"]:
                print(f"   ❌ {service_name}: No responde")
    
    def generate_test_report(self):
        """Genera reporte de tests en HTML"""
        
        try:
            latest_file = Path("test_results/latest_api_tests.json")
            if not latest_file.exists():
                print("❌ No hay resultados de tests disponibles")
                return
            
            with open(latest_file, 'r', encoding='utf-8') as f:
                results = json.load(f)
            
            html_content = self._generate_html_report(results)
            
            report_file = Path("api_test_report.html")
            with open(report_file, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            print(f"📊 Reporte HTML generado: {report_file}")
            
        except Exception as e:
            print(f"❌ Error generando reporte: {e}")
    
    def _generate_html_report(self, results: Dict[str, Any]) -> str:
        """Genera reporte HTML"""
        
        summary = results["summary"]
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>🧪 AltaMedica API Test Report</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }}
                .container {{ max-width: 1200px; margin: 0 auto; }}
                .card {{ background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                .pass {{ color: #28a745; }}
                .fail {{ color: #dc3545; }}
                .stats {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }}
                .stat {{ background: #f8f9fa; padding: 15px; border-radius: 4px; text-align: center; }}
                .service {{ margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 4px; }}
                .test {{ margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }}
                .active {{ border-left: 4px solid #28a745; }}
                .inactive {{ border-left: 4px solid #dc3545; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🧪 AltaMedica API Test Report</h1>
                <p>Generated: {results['timestamp']}</p>
                
                <div class="card">
                    <h2>📊 Summary</h2>
                    <div class="stats">
                        <div class="stat">
                            <h3>{summary['total_services']}</h3>
                            <p>Total Services</p>
                        </div>
                        <div class="stat">
                            <h3 class="pass">{summary['active_services']}</h3>
                            <p>Active Services</p>
                        </div>
                        <div class="stat">
                            <h3>{summary['total_tests']}</h3>
                            <p>Total Tests</p>
                        </div>
                        <div class="stat">
                            <h3 class="pass">{summary['passed_tests']}</h3>
                            <p>Passed Tests</p>
                        </div>
                        <div class="stat">
                            <h3 class="fail">{summary['failed_tests']}</h3>
                            <p>Failed Tests</p>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <h2>🔧 Services Details</h2>
        """
        
        for service_name, service_data in results["services"].items():
            status_class = "active" if service_data["is_active"] else "inactive"
            status_text = "✅ Active" if service_data["is_active"] else "❌ Inactive"
            
            html += f"""
                    <div class="service {status_class}">
                        <h3>{service_name} - {status_text}</h3>
                        <p><strong>URL:</strong> {service_data['base_url']}</p>
                        <p><strong>Tests:</strong> {service_data['passed_tests']}/{service_data['total_tests']} passed</p>
                        <p><strong>Avg Response Time:</strong> {service_data['response_time_avg']:.3f}s</p>
                        
                        <h4>Test Details:</h4>
            """
            
            for test in service_data["tests"]:
                test_class = "pass" if test["passed"] else "fail"
                test_status = "✅ PASS" if test["passed"] else "❌ FAIL"
                
                html += f"""
                        <div class="test">
                            <span class="{test_class}"><strong>{test_status}</strong></span>
                            {test['method']} {test['url']} 
                            (Status: {test['status_code']}, Time: {test['response_time']:.3f}s)
                """
                
                if test.get("error"):
                    html += f"<br><em>Error: {test['error']}</em>"
                
                html += "</div>"
            
            html += "</div>"
        
        html += """
                </div>
            </div>
        </body>
        </html>
        """
        
        return html

async def main():
    """Función principal"""
    print("🧪 AltaMedica Auto API Tester")
    print("=" * 40)
    
    tester = AutoAPITester()
    
    # Ejecutar todos los tests
    results = await tester.run_all_tests()
    
    # Generar reporte HTML
    tester.generate_test_report()
    
    print(f"\n🎉 Testing completado!")
    print(f"   📊 Ver reporte: api_test_report.html")

if __name__ == "__main__":
    asyncio.run(main())
