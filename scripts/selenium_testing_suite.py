#!/usr/bin/env python3
"""
ALTAMEDICA - Suite de Testing con Python + Selenium
====================================================

Herramientas avanzadas de testing automatizado para la plataforma médica AltaMédica.
Incluye testing visual, funcional, performance y compliance HIPAA.

Autor: Eduardo Marques MD + Claude AI
Fecha: 2025-08-01
"""

import os
import sys
import time
import json
import logging
import argparse
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from urllib.parse import urljoin

# Selenium imports
try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.action_chains import ActionChains
    from selenium.common.exceptions import TimeoutException, NoSuchElementException
except ImportError:
    print("❌ ERROR: Selenium no está instalado")
    print("📦 Instalar con: pip install selenium")
    print("🌐 También necesitas ChromeDriver: https://chromedriver.chromium.org/")
    sys.exit(1)

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('selenium_testing.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class AppConfig:
    """Configuración de aplicaciones AltaMédica"""
    name: str
    port: int
    url: str
    health_endpoint: str = "/api/health"
    expected_title: str = ""
    critical_elements: List[str] = None

# Configuración de aplicaciones AltaMédica
ALTAMEDICA_APPS = [
    AppConfig(
        name="web-app",
        port=3000,
        url="http://localhost:3000",
        expected_title="ALTAMEDICA - Portal Médico Inteligente",
        critical_elements=[
            "//h1[contains(text(), 'Tu salud digital')]",
            "//button[contains(text(), 'Iniciar Sesión')]",
            "//button[contains(text(), 'Registrarse')]"
        ]
    ),
    AppConfig(
        name="api-server",
        port=3001,
        url="http://localhost:3001",
        expected_title="",
        critical_elements=[]
    ),
    AppConfig(
        name="doctors",
        port=3002,
        url="http://localhost:3002",
        expected_title="Portal Médicos - AltaMédica",
        critical_elements=[
            "//nav",
            "//main",
            "//footer"
        ]
    ),
    AppConfig(
        name="patients",
        port=3003,
        url="http://localhost:3003",
        expected_title="Portal Pacientes - AltaMédica",
        critical_elements=[
            "//nav",
            "//main"
        ]
    ),
    AppConfig(
        name="admin",
        port=3005,
        url="http://localhost:3005",
        expected_title="Panel Admin - AltaMédica",
        critical_elements=[
            "//nav",
            "//main"
        ]
    ),
    AppConfig(
        name="companies",
        port=3004,
        url="http://localhost:3004",
        expected_title="Portal Empresas - AltaMédica",
        critical_elements=[
            "//nav",
            "//main"
        ]
    )
]

class AltaMedicaSeleniumTester:
    """Suite principal de testing con Selenium para AltaMédica"""
    
    def __init__(self, headless: bool = True, timeout: int = 30):
        self.headless = headless
        self.timeout = timeout
        self.driver = None
        self.results = []
        self.screenshots_dir = "selenium_screenshots"
        self.reports_dir = "selenium_reports"
        
        # Crear directorios
        os.makedirs(self.screenshots_dir, exist_ok=True)
        os.makedirs(self.reports_dir, exist_ok=True)
        
    def setup_driver(self) -> webdriver.Chrome:
        """Configura y retorna driver Chrome optimizado para testing médico"""
        logger.info("🚀 Configurando ChromeDriver para testing médico...")
        
        chrome_options = Options()
        
        if self.headless:
            chrome_options.add_argument("--headless")
        
        # Optimizaciones para plataforma médica
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--disable-plugins")
        chrome_options.add_argument("--disable-images")  # Faster loading
        
        # Headers médicos HIPAA
        chrome_options.add_argument("--user-agent=AltaMedica-Testing-Bot/1.0 (Medical-Platform-Testing)")
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.implicitly_wait(10)
            self.driver.set_page_load_timeout(self.timeout)
            logger.info("✅ ChromeDriver configurado exitosamente")
            return self.driver
        except Exception as e:
            logger.error(f"❌ Error configurando ChromeDriver: {e}")
            raise
    
    def test_app_availability(self, app: AppConfig) -> Dict:
        """Test básico de disponibilidad de aplicación"""
        logger.info(f"🔍 Testing disponibilidad: {app.name} ({app.url})")
        
        result = {
            "app": app.name,
            "url": app.url,
            "timestamp": datetime.now().isoformat(),
            "status": "unknown",
            "response_time": 0,
            "title": "",
            "errors": [],
            "screenshot": ""
        }
        
        try:
            start_time = time.time()
            self.driver.get(app.url)
            end_time = time.time()
            
            result["response_time"] = round((end_time - start_time) * 1000, 2)  # ms
            result["title"] = self.driver.title
            result["status"] = "accessible"
            
            # Screenshot
            screenshot_path = f"{self.screenshots_dir}/{app.name}_{int(time.time())}.png"
            self.driver.save_screenshot(screenshot_path)
            result["screenshot"] = screenshot_path
            
            logger.info(f"✅ {app.name}: Accesible ({result['response_time']}ms)")
            
        except TimeoutException:
            result["status"] = "timeout"
            result["errors"].append("Timeout loading page")
            logger.warning(f"⏰ {app.name}: Timeout")
            
        except Exception as e:
            result["status"] = "error"
            result["errors"].append(str(e))
            logger.error(f"❌ {app.name}: Error - {e}")
        
        return result
    
    def test_critical_elements(self, app: AppConfig) -> Dict:
        """Test de elementos críticos de la interfaz"""
        if not app.critical_elements:
            return {"status": "skipped", "message": "No critical elements defined"}
        
        logger.info(f"🎯 Testing elementos críticos: {app.name}")
        
        result = {
            "total_elements": len(app.critical_elements),
            "found_elements": 0,
            "missing_elements": [],
            "element_details": []
        }
        
        try:
            self.driver.get(app.url)
            
            for xpath in app.critical_elements:
                try:
                    element = WebDriverWait(self.driver, 10).until(
                        EC.presence_of_element_located((By.XPATH, xpath))
                    )
                    result["found_elements"] += 1
                    result["element_details"].append({
                        "xpath": xpath,
                        "found": True,
                        "text": element.text[:100] if element.text else "No text",
                        "visible": element.is_displayed()
                    })
                    logger.info(f"✅ Elemento encontrado: {xpath}")
                    
                except (TimeoutException, NoSuchElementException):
                    result["missing_elements"].append(xpath)
                    result["element_details"].append({
                        "xpath": xpath,
                        "found": False,
                        "error": "Element not found"
                    })
                    logger.warning(f"❌ Elemento faltante: {xpath}")
            
            success_rate = (result["found_elements"] / result["total_elements"]) * 100
            logger.info(f"📊 {app.name}: {result['found_elements']}/{result['total_elements']} elementos ({success_rate:.1f}%)")
            
        except Exception as e:
            result["error"] = str(e)
            logger.error(f"❌ Error testing elementos críticos: {e}")
        
        return result
    
    def test_performance_metrics(self, app: AppConfig) -> Dict:
        """Test de métricas de performance web"""
        logger.info(f"⚡ Testing performance: {app.name}")
        
        result = {
            "load_time": 0,
            "dom_ready_time": 0,
            "page_size": 0,
            "network_requests": 0,
            "js_errors": []
        }
        
        try:
            # Habilitar logs del navegador
            self.driver.get(app.url)
            
            # JavaScript para métricas de performance
            performance_script = """
            return {
                loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
                pageSize: document.documentElement.outerHTML.length
            };
            """
            
            metrics = self.driver.execute_script(performance_script)
            result.update(metrics)
            
            # Obtener errores de JavaScript
            logs = self.driver.get_log('browser')
            js_errors = [log for log in logs if log['level'] == 'SEVERE']
            result["js_errors"] = [error['message'] for error in js_errors]
            
            logger.info(f"📈 {app.name}: Load {metrics.get('loadTime', 0)}ms, DOM {metrics.get('domReady', 0)}ms")
            
        except Exception as e:
            result["error"] = str(e)
            logger.error(f"❌ Error testing performance: {e}")
        
        return result
    
    def test_medical_compliance(self, app: AppConfig) -> Dict:
        """Test específico de compliance médico HIPAA"""
        logger.info(f"🏥 Testing compliance médico: {app.name}")
        
        result = {
            "hipaa_compliance": {
                "https_required": False,
                "secure_headers": [],
                "privacy_policy": False,
                "medical_disclaimers": False
            },
            "accessibility": {
                "alt_texts": 0,
                "aria_labels": 0,
                "heading_structure": []
            },
            "medical_elements": []
        }
        
        try:
            self.driver.get(app.url)
            
            # Check HTTPS
            result["hipaa_compliance"]["https_required"] = app.url.startswith("https://")
            
            # Check for medical elements
            medical_keywords = ["médico", "doctor", "paciente", "salud", "hipaa", "privacidad"]
            page_text = self.driver.find_element(By.TAG_NAME, "body").text.lower()
            
            for keyword in medical_keywords:
                if keyword in page_text:
                    result["medical_elements"].append(keyword)
            
            # Accessibility checks
            images = self.driver.find_elements(By.TAG_NAME, "img")
            result["accessibility"]["alt_texts"] = len([img for img in images if img.get_attribute("alt")])
            
            aria_elements = self.driver.find_elements(By.XPATH, "//*[@aria-label]")
            result["accessibility"]["aria_labels"] = len(aria_elements)
            
            # Heading structure
            headings = self.driver.find_elements(By.XPATH, "//h1 | //h2 | //h3 | //h4 | //h5 | //h6")
            result["accessibility"]["heading_structure"] = [
                {"tag": h.tag_name, "text": h.text[:50]} for h in headings[:10]
            ]
            
            logger.info(f"🏥 {app.name}: {len(result['medical_elements'])} elementos médicos encontrados")
            
        except Exception as e:
            result["error"] = str(e)
            logger.error(f"❌ Error testing compliance: {e}")
        
        return result
    
    def run_comprehensive_test(self, app: AppConfig) -> Dict:
        """Ejecuta suite completa de tests para una aplicación"""
        logger.info(f"🚀 Iniciando test completo: {app.name}")
        
        comprehensive_result = {
            "app": app.name,
            "timestamp": datetime.now().isoformat(),
            "availability": {},
            "critical_elements": {},
            "performance": {},
            "medical_compliance": {}
        }
        
        try:
            # Test 1: Disponibilidad
            comprehensive_result["availability"] = self.test_app_availability(app)
            
            # Solo continuar si la app está accesible
            if comprehensive_result["availability"]["status"] == "accessible":
                
                # Test 2: Elementos críticos
                comprehensive_result["critical_elements"] = self.test_critical_elements(app)
                
                # Test 3: Performance
                comprehensive_result["performance"] = self.test_performance_metrics(app)
                
                # Test 4: Compliance médico
                comprehensive_result["medical_compliance"] = self.test_medical_compliance(app)
                
            else:
                logger.warning(f"⚠️ Saltando tests adicionales para {app.name} - No accesible")
        
        except Exception as e:
            logger.error(f"❌ Error en test completo {app.name}: {e}")
            comprehensive_result["error"] = str(e)
        
        return comprehensive_result
    
    def test_all_apps(self) -> List[Dict]:
        """Ejecuta tests en todas las aplicaciones AltaMédica"""
        logger.info("🎭 INICIANDO TESTING COMPLETO ALTAMEDICA")
        logger.info("=" * 50)
        
        self.setup_driver()
        all_results = []
        
        try:
            for app in ALTAMEDICA_APPS:
                result = self.run_comprehensive_test(app)
                all_results.append(result)
                self.results.append(result)
                
                # Pausa entre tests
                time.sleep(2)
            
            # Generar reporte final
            report_path = self.generate_final_report(all_results)
            logger.info(f"📊 Reporte generado: {report_path}")
            
        except Exception as e:
            logger.error(f"❌ Error en testing masivo: {e}")
        
        finally:
            if self.driver:
                self.driver.quit()
                logger.info("🔚 ChromeDriver cerrado")
        
        return all_results
    
    def generate_final_report(self, results: List[Dict]) -> str:
        """Genera reporte final consolidado"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = f"{self.reports_dir}/altamedica_testing_report_{timestamp}.json"
        
        # Estadísticas generales
        total_apps = len(results)
        accessible_apps = len([r for r in results if r.get("availability", {}).get("status") == "accessible"])
        
        final_report = {
            "report_metadata": {
                "timestamp": datetime.now().isoformat(),
                "total_apps_tested": total_apps,
                "accessible_apps": accessible_apps,
                "success_rate": f"{(accessible_apps/total_apps)*100:.1f}%" if total_apps > 0 else "0%",
                "testing_tool": "AltaMedica Selenium Suite v1.0"
            },
            "summary": {
                "system_health": f"{(accessible_apps/total_apps)*100:.0f}%" if total_apps > 0 else "0%",
                "critical_issues": [],
                "recommendations": []
            },
            "detailed_results": results
        }
        
        # Análisis de problemas críticos
        for result in results:
            app_name = result["app"]
            if result.get("availability", {}).get("status") != "accessible":
                final_report["summary"]["critical_issues"].append(
                    f"❌ {app_name}: No accesible - {result.get('availability', {}).get('errors', ['Unknown error'])[0] if result.get('availability', {}).get('errors') else 'Unknown error'}"
                )
                final_report["summary"]["recommendations"].append(
                    f"🔧 Iniciar {app_name}: cd apps/{app_name} && npm run dev"
                )
        
        # Guardar reporte
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(final_report, f, indent=2, ensure_ascii=False)
        
        # Imprimir resumen en consola
        self.print_summary_report(final_report)
        
        return report_path
    
    def print_summary_report(self, report: Dict):
        """Imprime resumen del reporte en consola"""
        print("\n" + "="*60)
        print("🏥 REPORTE FINAL - ALTAMEDICA SELENIUM TESTING")
        print("="*60)
        
        metadata = report["report_metadata"]
        summary = report["summary"]
        
        print(f"⏰ Timestamp: {metadata['timestamp']}")
        print(f"📊 Apps Testeadas: {metadata['total_apps_tested']}")
        print(f"✅ Apps Accesibles: {metadata['accessible_apps']}")
        print(f"💓 Salud del Sistema: {summary['system_health']}")
        
        if summary["critical_issues"]:
            print(f"\n🚨 PROBLEMAS CRÍTICOS ({len(summary['critical_issues'])}):")
            for issue in summary["critical_issues"]:
                print(f"   {issue}")
        
        if summary["recommendations"]:
            print(f"\n💡 RECOMENDACIONES ({len(summary['recommendations'])}):")
            for rec in summary["recommendations"]:
                print(f"   {rec}")
        
        print("\n" + "="*60)

def main():
    """Función principal con argumentos CLI"""
    parser = argparse.ArgumentParser(description="AltaMédica Selenium Testing Suite")
    parser.add_argument("--headless", action="store_true", help="Ejecutar en modo headless")
    parser.add_argument("--timeout", type=int, default=30, help="Timeout en segundos")
    parser.add_argument("--app", type=str, help="Testear solo una app específica")
    parser.add_argument("--continuous", action="store_true", help="Modo de monitoreo continuo")
    
    args = parser.parse_args()
    
    tester = AltaMedicaSeleniumTester(headless=args.headless, timeout=args.timeout)
    
    if args.continuous:
        logger.info("🔄 Modo de monitoreo continuo activado (Ctrl+C para detener)")
        try:
            while True:
                tester.test_all_apps()
                logger.info("⏸️ Esperando 5 minutos antes del próximo ciclo...")
                time.sleep(300)  # 5 minutos
        except KeyboardInterrupt:
            logger.info("🛑 Monitoreo continuo detenido por usuario")
    
    elif args.app:
        # Testear app específica
        app_config = next((app for app in ALTAMEDICA_APPS if app.name == args.app), None)
        if app_config:
            tester.setup_driver()
            result = tester.run_comprehensive_test(app_config)
            print(json.dumps(result, indent=2, ensure_ascii=False))
            tester.driver.quit()
        else:
            print(f"❌ App '{args.app}' no encontrada. Apps disponibles: {[app.name for app in ALTAMEDICA_APPS]}")
    
    else:
        # Test completo de todas las apps
        tester.test_all_apps()

if __name__ == "__main__":
    main()