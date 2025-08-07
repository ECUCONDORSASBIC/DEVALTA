#!/usr/bin/env python3
"""
ALTAMEDICA - Python Testing Demo (Sin Selenium)
===============================================

Demostración de capacidades de testing Python sin requerir Selenium.
Muestra análisis de HTML, requests HTTP, y generación de reportes.

Autor: Eduardo Marques MD + Claude AI
Fecha: 2025-08-01
"""

import os
import sys
import time
import json
import urllib.request
import urllib.parse
import socket
from datetime import datetime
from typing import Dict, List, Optional
import re

# Intentar importar librerías opcionales
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

try:
    from bs4 import BeautifulSoup
    HAS_BS4 = True
except ImportError:
    HAS_BS4 = False

class AltaMedicaPythonTester:
    """Tester Python para AltaMédica sin dependencias externas"""
    
    def __init__(self):
        self.results_dir = "python_testing_results"
        os.makedirs(self.results_dir, exist_ok=True)
        
        self.apps = [
            {"name": "web-app", "port": 3000, "url": "http://localhost:3000"},
            {"name": "api-server", "port": 3001, "url": "http://localhost:3001"},
            {"name": "doctors", "port": 3002, "url": "http://localhost:3002"},
            {"name": "patients", "port": 3003, "url": "http://localhost:3003"},
            {"name": "admin", "port": 3005, "url": "http://localhost:3005"},
            {"name": "companies", "port": 3004, "url": "http://localhost:3004"}
        ]
    
    def check_port_status(self, host: str, port: int, timeout: int = 5) -> Dict:
        """Verifica estado de puerto usando sockets Python nativos"""
        result = {
            "host": host,
            "port": port,
            "status": "unknown",
            "response_time": 0,
            "error": None
        }
        
        try:
            start_time = time.time()
            
            # Crear socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            
            # Intentar conexión
            connection_result = sock.connect_ex((host, port))
            
            end_time = time.time()
            response_time = (end_time - start_time) * 1000  # ms
            
            if connection_result == 0:
                result["status"] = "open"
                result["response_time"] = round(response_time, 2)
            else:
                result["status"] = "closed"
            
            sock.close()
            
        except socket.timeout:
            result["status"] = "timeout"
            result["error"] = "Connection timeout"
        except Exception as e:
            result["status"] = "error"
            result["error"] = str(e)
        
        return result
    
    def fetch_url_content(self, url: str, timeout: int = 10) -> Dict:
        """Obtiene contenido de URL usando urllib nativo o requests"""
        result = {
            "url": url,
            "status_code": 0,
            "content": "",
            "content_length": 0,
            "headers": {},
            "response_time": 0,
            "error": None
        }
        
        try:
            start_time = time.time()
            
            if HAS_REQUESTS:
                # Usar requests si está disponible
                response = requests.get(url, timeout=timeout)
                result["status_code"] = response.status_code
                result["content"] = response.text
                result["headers"] = dict(response.headers)
            else:
                # Usar urllib nativo
                req = urllib.request.Request(url)
                req.add_header('User-Agent', 'AltaMedica-Python-Tester/1.0')
                
                with urllib.request.urlopen(req, timeout=timeout) as response:
                    result["status_code"] = response.getcode()
                    result["content"] = response.read().decode('utf-8', errors='ignore')
                    result["headers"] = dict(response.headers)
            
            end_time = time.time()
            result["response_time"] = round((end_time - start_time) * 1000, 2)
            result["content_length"] = len(result["content"])
            
        except urllib.error.HTTPError as e:
            result["status_code"] = e.code
            result["error"] = f"HTTP {e.code}: {e.reason}"
        except urllib.error.URLError as e:
            result["error"] = f"URL Error: {e.reason}"
        except Exception as e:
            result["error"] = str(e)
        
        return result
    
    def analyze_html_content(self, html: str) -> Dict:
        """Analiza contenido HTML para métricas médicas"""
        analysis = {
            "title": "",
            "has_react": False,
            "has_next_js": False,
            "medical_keywords": [],
            "forms_count": 0,
            "links_count": 0,
            "images_count": 0,
            "security_indicators": [],
            "accessibility_score": 0
        }
        
        if not html:
            return analysis
        
        # Extraer título
        title_match = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
        if title_match:
            analysis["title"] = title_match.group(1).strip()
        
        # Detectar React/Next.js
        if '__NEXT_DATA__' in html or 'next/script' in html:
            analysis["has_next_js"] = True
        if 'react' in html.lower() or '_reactInternalInstance' in html:
            analysis["has_react"] = True
        
        # Buscar palabras clave médicas
        medical_keywords = [
            'médico', 'doctor', 'paciente', 'salud', 'cita', 'consulta',
            'telemedicina', 'hipaa', 'diagnóstico', 'tratamiento', 'receta'
        ]
        
        html_lower = html.lower()
        for keyword in medical_keywords:
            if keyword in html_lower:
                analysis["medical_keywords"].append(keyword)
        
        # Contar elementos
        analysis["forms_count"] = len(re.findall(r'<form[^>]*>', html, re.IGNORECASE))
        analysis["links_count"] = len(re.findall(r'<a[^>]*href', html, re.IGNORECASE))
        analysis["images_count"] = len(re.findall(r'<img[^>]*>', html, re.IGNORECASE))
        
        # Indicadores de seguridad
        if 'https://' in html:
            analysis["security_indicators"].append("HTTPS links found")
        if 'csrf' in html.lower():
            analysis["security_indicators"].append("CSRF protection")
        if 'x-frame-options' in html.lower():
            analysis["security_indicators"].append("X-Frame-Options header")
        
        # Score de accesibilidad básico
        accessibility_score = 0
        if 'aria-' in html:
            accessibility_score += 25
        if 'alt=' in html:
            accessibility_score += 25
        if '<h1' in html:
            accessibility_score += 25
        if 'role=' in html:
            accessibility_score += 25
        
        analysis["accessibility_score"] = accessibility_score
        
        return analysis
    
    def advanced_html_analysis(self, html: str) -> Dict:
        """Análisis avanzado con BeautifulSoup si está disponible"""
        if not HAS_BS4:
            return {"error": "BeautifulSoup not available for advanced analysis"}
        
        try:
            soup = BeautifulSoup(html, 'html.parser')
            
            analysis = {
                "meta_tags": len(soup.find_all('meta')),
                "scripts": len(soup.find_all('script')),
                "stylesheets": len(soup.find_all('link', rel='stylesheet')),
                "headings": {
                    f"h{i}": len(soup.find_all(f'h{i}')) for i in range(1, 7)
                },
                "buttons": len(soup.find_all('button')),
                "inputs": len(soup.find_all('input')),
                "medical_forms": [],
                "navigation_elements": len(soup.find_all(['nav', 'header', 'footer']))
            }
            
            # Buscar formularios médicos específicos
            forms = soup.find_all('form')
            for form in forms:
                form_text = form.get_text().lower()
                if any(word in form_text for word in ['cita', 'consulta', 'paciente', 'síntoma']):
                    analysis["medical_forms"].append({
                        "type": "medical_form",
                        "action": form.get('action', ''),
                        "method": form.get('method', 'GET'),
                        "inputs": len(form.find_all('input'))
                    })
            
            return analysis
            
        except Exception as e:
            return {"error": f"Advanced analysis failed: {e}"}
    
    def test_app_comprehensive(self, app: Dict) -> Dict:
        """Test completo de una aplicación"""
        print(f"🔍 Testing completo: {app['name']} (puerto {app['port']})")
        
        result = {
            "app": app["name"],
            "timestamp": datetime.now().isoformat(),
            "port_status": {},
            "http_response": {},
            "html_analysis": {},
            "advanced_analysis": {},
            "medical_compliance": {},
            "overall_status": "unknown"
        }
        
        # Test 1: Estado del puerto
        result["port_status"] = self.check_port_status("localhost", app["port"])
        
        # Test 2: Respuesta HTTP (solo si puerto está abierto)
        if result["port_status"]["status"] == "open":
            result["http_response"] = self.fetch_url_content(app["url"])
            
            # Test 3: Análisis HTML (solo si hay contenido)
            if result["http_response"]["content"]:
                result["html_analysis"] = self.analyze_html_content(result["http_response"]["content"])
                result["advanced_analysis"] = self.advanced_html_analysis(result["http_response"]["content"])
                
                # Test 4: Compliance médico
                result["medical_compliance"] = self.evaluate_medical_compliance(
                    result["html_analysis"], 
                    result["http_response"]
                )
        
        # Determinar estado general
        if result["port_status"]["status"] == "open" and result["http_response"].get("status_code") == 200:
            result["overall_status"] = "healthy"
        elif result["port_status"]["status"] == "open":
            result["overall_status"] = "accessible_with_errors"
        else:
            result["overall_status"] = "unreachable"
        
        return result
    
    def evaluate_medical_compliance(self, html_analysis: Dict, http_response: Dict) -> Dict:
        """Evalúa compliance médico básico"""
        compliance = {
            "medical_context_score": 0,
            "security_score": 0,
            "accessibility_score": html_analysis.get("accessibility_score", 0),
            "performance_score": 0,
            "recommendations": []
        }
        
        # Score de contexto médico
        medical_keywords = html_analysis.get("medical_keywords", [])
        compliance["medical_context_score"] = min(len(medical_keywords) * 15, 100)
        
        # Score de seguridad
        security_indicators = html_analysis.get("security_indicators", [])
        compliance["security_score"] = min(len(security_indicators) * 30, 100)
        
        # Score de performance
        response_time = http_response.get("response_time", 0)
        if response_time < 1000:
            compliance["performance_score"] = 100
        elif response_time < 3000:
            compliance["performance_score"] = 75
        elif response_time < 5000:
            compliance["performance_score"] = 50
        else:
            compliance["performance_score"] = 25
        
        # Recomendaciones
        if compliance["medical_context_score"] < 50:
            compliance["recommendations"].append("Agregar más contenido médico específico")
        
        if compliance["security_score"] < 70:
            compliance["recommendations"].append("Implementar más indicadores de seguridad HIPAA")
        
        if compliance["accessibility_score"] < 75:
            compliance["recommendations"].append("Mejorar accesibilidad para compliance WCAG")
        
        if response_time > 3000:
            compliance["recommendations"].append("Optimizar tiempo de respuesta para emergencias médicas")
        
        return compliance
    
    def run_comprehensive_testing(self) -> Dict:
        """Ejecuta testing completo de todas las aplicaciones"""
        print("🏥 INICIANDO TESTING PYTHON ALTAMEDICA")
        print("=" * 50)
        
        results = {
            "testing_session": {
                "timestamp": datetime.now().isoformat(),
                "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
                "has_requests": HAS_REQUESTS,
                "has_beautifulsoup": HAS_BS4,
                "total_apps": len(self.apps),
                "tested_apps": 0,
                "healthy_apps": 0,
                "accessible_apps": 0
            },
            "app_results": [],
            "system_summary": {}
        }
        
        # Testear cada aplicación
        for app in self.apps:
            try:
                app_result = self.test_app_comprehensive(app)
                results["app_results"].append(app_result)
                results["testing_session"]["tested_apps"] += 1
                
                if app_result["overall_status"] == "healthy":
                    results["testing_session"]["healthy_apps"] += 1
                
                if app_result["port_status"]["status"] == "open":
                    results["testing_session"]["accessible_apps"] += 1
                
                # Pausa entre tests
                time.sleep(1)
                
            except Exception as e:
                print(f"❌ Error testing {app['name']}: {e}")
                error_result = {
                    "app": app["name"],
                    "error": str(e),
                    "overall_status": "error"
                }
                results["app_results"].append(error_result)
        
        # Generar resumen del sistema
        results["system_summary"] = self.generate_system_summary(results)
        
        # Guardar resultados
        report_path = self.save_results(results)
        print(f"📊 Resultados guardados: {report_path}")
        
        return results
    
    def generate_system_summary(self, results: Dict) -> Dict:
        """Genera resumen ejecutivo del sistema"""
        session = results["testing_session"]
        
        summary = {
            "system_health": f"{(session['healthy_apps'] / session['total_apps']) * 100:.0f}%",
            "accessibility_rate": f"{(session['accessible_apps'] / session['total_apps']) * 100:.0f}%",
            "critical_issues": [],
            "medical_compliance_average": 0,
            "performance_average": 0,
            "recommendations": []
        }
        
        # Analizar resultados para issues críticos
        compliance_scores = []
        performance_scores = []
        
        for app_result in results["app_results"]:
            app_name = app_result.get("app", "unknown")
            
            if app_result.get("overall_status") == "unreachable":
                summary["critical_issues"].append(f"❌ {app_name}: No accesible")
            
            # Compliance médico
            medical_compliance = app_result.get("medical_compliance", {})
            if medical_compliance:
                avg_compliance = sum([
                    medical_compliance.get("medical_context_score", 0),
                    medical_compliance.get("security_score", 0),
                    medical_compliance.get("accessibility_score", 0)
                ]) / 3
                compliance_scores.append(avg_compliance)
                
                performance_scores.append(medical_compliance.get("performance_score", 0))
        
        # Promedios
        if compliance_scores:
            summary["medical_compliance_average"] = round(sum(compliance_scores) / len(compliance_scores), 1)
        
        if performance_scores:
            summary["performance_average"] = round(sum(performance_scores) / len(performance_scores), 1)
        
        # Recomendaciones generales
        if summary["medical_compliance_average"] < 70:
            summary["recommendations"].append("🏥 Mejorar compliance médico general")
        
        if summary["performance_average"] < 75:
            summary["recommendations"].append("⚡ Optimizar performance para aplicaciones médicas")
        
        if session["accessible_apps"] < session["total_apps"]:
            summary["recommendations"].append("🚀 Iniciar todas las aplicaciones para testing completo")
        
        return summary
    
    def save_results(self, results: Dict) -> str:
        """Guarda resultados en archivo JSON"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = os.path.join(self.results_dir, f"python_testing_report_{timestamp}.json")
        
        try:
            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(results, f, indent=2, ensure_ascii=False)
            
            return report_path
        except Exception as e:
            print(f"❌ Error guardando resultados: {e}")
            return ""
    
    def print_summary_report(self, results: Dict):
        """Imprime resumen en consola"""
        print("\n" + "="*60)
        print("🏥 REPORTE PYTHON TESTING - ALTAMEDICA")
        print("="*60)
        
        session = results["testing_session"]
        summary = results["system_summary"]
        
        print(f"🐍 Python: {session['python_version']}")
        print(f"📦 Requests: {'✅' if session['has_requests'] else '❌'}")
        print(f"🥄 BeautifulSoup: {'✅' if session['has_beautifulsoup'] else '❌'}")
        
        print(f"\n📊 RESUMEN DEL SISTEMA:")
        print(f"   💓 Salud General: {summary['system_health']}")
        print(f"   🌐 Accesibilidad: {summary['accessibility_rate']}")
        print(f"   🏥 Compliance Médico: {summary['medical_compliance_average']}%")
        print(f"   ⚡ Performance: {summary['performance_average']}%")
        
        # Mostrar apps individuales
        print(f"\n🎯 ESTADO POR APLICACIÓN:")
        for app_result in results["app_results"]:
            app_name = app_result.get("app", "unknown")
            status = app_result.get("overall_status", "unknown")
            
            if status == "healthy":
                icon = "✅"
            elif status == "accessible_with_errors":
                icon = "⚠️"
            else:
                icon = "❌"
            
            print(f"   {icon} {app_name}: {status}")
        
        # Issues críticos
        if summary["critical_issues"]:
            print(f"\n🚨 ISSUES CRÍTICOS:")
            for issue in summary["critical_issues"]:
                print(f"   {issue}")
        
        # Recomendaciones
        if summary["recommendations"]:
            print(f"\n💡 RECOMENDACIONES:")
            for rec in summary["recommendations"]:
                print(f"   {rec}")
        
        print("\n" + "="*60)

def main():
    """Función principal"""
    print("🐍 AltaMédica Python Testing Demo")
    print("=" * 40)
    
    if not HAS_REQUESTS:
        print("💡 Instala 'requests' para mejor funcionalidad: pip install requests")
    
    if not HAS_BS4:
        print("💡 Instala 'beautifulsoup4' para análisis avanzado: pip install beautifulsoup4")
    
    print("")
    
    tester = AltaMedicaPythonTester()
    results = tester.run_comprehensive_testing()
    
    tester.print_summary_report(results)
    
    print(f"\n🎉 Testing Python completado!")
    print(f"📁 Resultados en: {tester.results_dir}/")

if __name__ == "__main__":
    main()