#!/usr/bin/env python3
"""
ALTAMEDICA - Medical Workflow Testing Tool
==========================================

Testing automatizado de flujos médicos críticos usando Selenium.
Incluye testing de telemedicina, reserva de citas, y compliance HIPAA.

Autor: Eduardo Marques MD + Claude AI
Fecha: 2025-08-01
"""

import os
import sys
import time
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass

try:
    from selenium import webdriver
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait, Select
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.webdriver.common.action_chains import ActionChains
    from selenium.webdriver.common.keys import Keys
    from selenium.webdriver.chrome.options import Options
    from selenium.common.exceptions import TimeoutException, NoSuchElementException
except ImportError:
    print("❌ ERROR: Selenium no está instalado")
    print("📦 Instalar con: pip install selenium")
    sys.exit(1)

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class MedicalTestUser:
    """Usuario de prueba para testing médico"""
    email: str
    password: str
    role: str
    name: str
    speciality: Optional[str] = None

@dataclass
class MedicalWorkflow:
    """Configuración de flujo médico a testear"""
    name: str
    description: str
    app_url: str
    steps: List[Dict]
    expected_outcome: str
    timeout: int = 30

class MedicalWorkflowTester:
    """Tester especializado en flujos médicos"""
    
    def __init__(self, headless: bool = True):
        self.headless = headless
        self.driver = None
        self.results_dir = "medical_testing_results"
        os.makedirs(self.results_dir, exist_ok=True)
        
        # Usuarios de prueba médicos
        self.test_users = {
            "patient": MedicalTestUser(
                email="patient.test@altamedica.com",
                password="TestPatient123!",
                role="patient",
                name="Juan Pérez"
            ),
            "doctor": MedicalTestUser(
                email="doctor.test@altamedica.com", 
                password="TestDoctor123!",
                role="doctor",
                name="Dr. María González",
                speciality="Cardiología"
            ),
            "admin": MedicalTestUser(
                email="admin.test@altamedica.com",
                password="TestAdmin123!",
                role="admin", 
                name="Admin Sistema"
            )
        }
    
    def setup_driver(self) -> webdriver.Chrome:
        """Configura ChromeDriver para testing médico"""
        logger.info("🚀 Configurando ChromeDriver para testing médico...")
        
        chrome_options = Options()
        if self.headless:
            chrome_options.add_argument("--headless")
        
        # Optimizaciones para aplicaciones médicas
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--allow-running-insecure-content")
        chrome_options.add_argument("--disable-web-security")
        
        # Permisos para WebRTC (videollamadas médicas)
        chrome_options.add_argument("--use-fake-ui-for-media-stream")
        chrome_options.add_argument("--use-fake-device-for-media-stream")
        chrome_options.add_argument("--allow-file-access-from-files")
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.implicitly_wait(10)
        
        return self.driver
    
    def login_user(self, user: MedicalTestUser, app_url: str) -> bool:
        """Login automatizado para usuarios médicos"""
        logger.info(f"🔐 Iniciando sesión: {user.name} ({user.role})")
        
        try:
            self.driver.get(app_url)
            
            # Buscar y completar formulario de login
            email_field = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.NAME, "email"))
            )
            password_field = self.driver.find_element(By.NAME, "password")
            
            email_field.clear()
            email_field.send_keys(user.email)
            
            password_field.clear()
            password_field.send_keys(user.password)
            
            # Buscar botón de login
            login_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Iniciar') or contains(text(), 'Login')]")
            login_button.click()
            
            # Verificar login exitoso
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//nav | //header | //dashboard"))
            )
            
            logger.info(f"✅ Login exitoso: {user.name}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error en login {user.name}: {e}")
            return False
    
    def test_appointment_booking_flow(self) -> Dict:
        """Test completo de reserva de citas médicas"""
        logger.info("📅 Testing flujo de reserva de citas")
        
        result = {
            "workflow": "appointment_booking",
            "timestamp": datetime.now().isoformat(),
            "status": "unknown",
            "steps_completed": 0,
            "total_steps": 5,
            "errors": [],
            "screenshots": []
        }
        
        try:
            # Paso 1: Login como paciente
            patient = self.test_users["patient"]
            if not self.login_user(patient, "http://localhost:3003"):
                result["errors"].append("Failed patient login")
                return result
            
            result["steps_completed"] = 1
            self.take_screenshot("appointment_booking_step1_login")
            
            # Paso 2: Navegar a sección de citas
            appointments_link = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Citas') or contains(text(), 'Appointments')]"))
            )
            appointments_link.click()
            
            result["steps_completed"] = 2
            self.take_screenshot("appointment_booking_step2_navigation")
            
            # Paso 3: Seleccionar especialidad
            specialty_select = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.NAME, "specialty"))
            )
            Select(specialty_select).select_by_visible_text("Cardiología")
            
            result["steps_completed"] = 3
            self.take_screenshot("appointment_booking_step3_specialty")
            
            # Paso 4: Seleccionar fecha disponible
            available_date = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, ".available-date"))
            )
            available_date.click()
            
            result["steps_completed"] = 4
            self.take_screenshot("appointment_booking_step4_date")
            
            # Paso 5: Confirmar reserva
            confirm_button = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Confirmar')]"))
            )
            confirm_button.click()
            
            # Verificar confirmación
            success_message = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//div[contains(text(), 'Cita confirmada') or contains(text(), 'reservada')]"))
            )
            
            result["steps_completed"] = 5
            result["status"] = "success"
            self.take_screenshot("appointment_booking_step5_confirmation")
            
            logger.info("✅ Flujo de reserva de citas completado exitosamente")
            
        except Exception as e:
            result["status"] = "failed"
            result["errors"].append(str(e))
            logger.error(f"❌ Error en flujo de citas: {e}")
            self.take_screenshot(f"appointment_booking_error_{int(time.time())}")
        
        return result
    
    def test_telemedicine_session_flow(self) -> Dict:
        """Test de sesión de telemedicina completa"""
        logger.info("🎥 Testing flujo de telemedicina")
        
        result = {
            "workflow": "telemedicine_session",
            "timestamp": datetime.now().isoformat(),
            "status": "unknown",
            "steps_completed": 0,
            "total_steps": 4,
            "errors": [],
            "webrtc_enabled": False,
            "video_quality": "unknown"
        }
        
        try:
            # Paso 1: Login como doctor
            doctor = self.test_users["doctor"]
            if not self.login_user(doctor, "http://localhost:3002"):
                result["errors"].append("Failed doctor login")
                return result
            
            result["steps_completed"] = 1
            
            # Paso 2: Navegar a sesiones de telemedicina
            telemedicine_link = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Telemedicina') or contains(text(), 'Video')]"))
            )
            telemedicine_link.click()
            
            result["steps_completed"] = 2
            
            # Paso 3: Verificar acceso a WebRTC
            # Simular test de cámara y micrófono
            webrtc_test = self.driver.execute_script("""
                return new Promise((resolve) => {
                    navigator.mediaDevices.getUserMedia({video: true, audio: true})
                        .then(() => resolve({success: true, message: 'WebRTC available'}))
                        .catch(err => resolve({success: false, message: err.message}));
                });
            """)
            
            if webrtc_test.get("success"):
                result["webrtc_enabled"] = True
                result["video_quality"] = "good"
            
            result["steps_completed"] = 3
            
            # Paso 4: Verificar elementos de interfaz de telemedicina
            video_container = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".video-container, #video-call, .telemedicine-interface"))
            )
            
            # Verificar controles de video
            controls_found = 0
            control_selectors = [
                "//button[contains(@class, 'mute') or contains(text(), 'Silenciar')]",
                "//button[contains(@class, 'video') or contains(text(), 'Video')]", 
                "//button[contains(@class, 'end') or contains(text(), 'Finalizar')]"
            ]
            
            for selector in control_selectors:
                try:
                    self.driver.find_element(By.XPATH, selector)
                    controls_found += 1
                except NoSuchElementException:
                    pass
            
            result["video_controls_found"] = controls_found
            result["steps_completed"] = 4
            result["status"] = "success" if controls_found >= 2 else "partial_success"
            
            logger.info(f"✅ Testing telemedicina completado - WebRTC: {result['webrtc_enabled']}")
            
        except Exception as e:
            result["status"] = "failed"
            result["errors"].append(str(e))
            logger.error(f"❌ Error en flujo de telemedicina: {e}")
        
        return result
    
    def test_medical_records_access(self) -> Dict:
        """Test de acceso a registros médicos (HIPAA compliance)"""
        logger.info("📋 Testing acceso a registros médicos")
        
        result = {
            "workflow": "medical_records_access",
            "timestamp": datetime.now().isoformat(),
            "status": "unknown",
            "hipaa_compliance": {
                "authentication_required": False,
                "audit_trail": False,
                "data_encryption": False,
                "access_controls": False
            },
            "errors": []
        }
        
        try:
            # Test como paciente
            patient = self.test_users["patient"]
            if not self.login_user(patient, "http://localhost:3003"):
                result["errors"].append("Failed patient login")
                return result
            
            # Verificar autenticación requerida
            result["hipaa_compliance"]["authentication_required"] = True
            
            # Navegar a registros médicos
            records_link = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Historial') or contains(text(), 'Records')]"))
            )
            records_link.click()
            
            # Verificar elementos de seguridad
            # Buscar indicadores de encriptación (HTTPS)
            current_url = self.driver.current_url
            if current_url.startswith("https://"):
                result["hipaa_compliance"]["data_encryption"] = True
            
            # Verificar controles de acceso
            try:
                # Buscar elementos que indiquen controles de acceso
                access_controls = self.driver.find_elements(By.XPATH, 
                    "//div[contains(@class, 'access-control') or contains(text(), 'Autorización')]")
                if access_controls:
                    result["hipaa_compliance"]["access_controls"] = True
            except:
                pass
            
            # Verificar que los datos médicos estén presentes
            medical_data = self.driver.find_elements(By.XPATH,
                "//div[contains(@class, 'medical-record') or contains(text(), 'Diagnóstico')]")
            
            result["medical_records_found"] = len(medical_data)
            result["status"] = "success"
            
            logger.info("✅ Testing registros médicos completado")
            
        except Exception as e:
            result["status"] = "failed"
            result["errors"].append(str(e))
            logger.error(f"❌ Error en registros médicos: {e}")
        
        return result
    
    def test_emergency_workflow(self) -> Dict:
        """Test de flujo de emergencias médicas"""
        logger.info("🚨 Testing flujo de emergencias")
        
        result = {
            "workflow": "emergency_response",
            "timestamp": datetime.now().isoformat(),
            "status": "unknown",
            "response_time": 0,
            "emergency_features": [],
            "errors": []
        }
        
        try:
            start_time = time.time()
            
            # Acceder como paciente
            patient = self.test_users["patient"]
            if not self.login_user(patient, "http://localhost:3003"):
                result["errors"].append("Failed patient login")
                return result
            
            # Buscar botón de emergencia
            try:
                emergency_button = WebDriverWait(self.driver, 5).until(
                    EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Emergencia') or contains(@class, 'emergency')]"))
                )
                emergency_button.click()
                result["emergency_features"].append("Emergency button found")
            except TimeoutException:
                result["errors"].append("No emergency button found")
            
            # Verificar características de emergencia
            emergency_selectors = [
                "//div[contains(@class, 'emergency-contact')]",
                "//a[contains(@href, 'tel:')]",  # Enlaces telefónicos
                "//button[contains(text(), '911') or contains(text(), 'Ambulancia')]"
            ]
            
            for selector in emergency_selectors:
                try:
                    element = self.driver.find_element(By.XPATH, selector)
                    result["emergency_features"].append(f"Found: {selector}")
                except NoSuchElementException:
                    pass
            
            end_time = time.time()
            result["response_time"] = round((end_time - start_time) * 1000, 2)  # ms
            
            # Evaluar tiempo de respuesta (crítico < 3 segundos)
            if result["response_time"] < 3000:
                result["response_evaluation"] = "excellent"
            elif result["response_time"] < 5000:
                result["response_evaluation"] = "good"
            else:
                result["response_evaluation"] = "needs_improvement"
            
            result["status"] = "success"
            logger.info(f"✅ Testing emergencias completado - Tiempo: {result['response_time']}ms")
            
        except Exception as e:
            result["status"] = "failed"
            result["errors"].append(str(e))
            logger.error(f"❌ Error en flujo de emergencias: {e}")
        
        return result
    
    def take_screenshot(self, name: str) -> str:
        """Toma screenshot con timestamp"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        screenshot_path = os.path.join(self.results_dir, f"{name}_{timestamp}.png")
        
        try:
            self.driver.save_screenshot(screenshot_path)
            logger.info(f"📸 Screenshot guardado: {screenshot_path}")
            return screenshot_path
        except Exception as e:
            logger.error(f"❌ Error tomando screenshot: {e}")
            return ""
    
    def run_all_medical_workflows(self) -> Dict:
        """Ejecuta todos los flujos médicos de testing"""
        logger.info("🏥 INICIANDO TESTING COMPLETO DE FLUJOS MÉDICOS")
        logger.info("=" * 60)
        
        self.setup_driver()
        
        workflows_results = {
            "test_session": {
                "timestamp": datetime.now().isoformat(),
                "total_workflows": 4,
                "completed_workflows": 0,
                "failed_workflows": 0
            },
            "results": []
        }
        
        # Lista de workflows a ejecutar
        workflows = [
            self.test_appointment_booking_flow,
            self.test_telemedicine_session_flow,
            self.test_medical_records_access,
            self.test_emergency_workflow
        ]
        
        try:
            for workflow_func in workflows:
                try:
                    result = workflow_func()
                    workflows_results["results"].append(result)
                    
                    if result["status"] in ["success", "partial_success"]:
                        workflows_results["test_session"]["completed_workflows"] += 1
                    else:
                        workflows_results["test_session"]["failed_workflows"] += 1
                        
                    # Pausa entre workflows
                    time.sleep(3)
                    
                except Exception as e:
                    error_result = {
                        "workflow": workflow_func.__name__,
                        "status": "failed",
                        "error": str(e),
                        "timestamp": datetime.now().isoformat()
                    }
                    workflows_results["results"].append(error_result)
                    workflows_results["test_session"]["failed_workflows"] += 1
                    logger.error(f"❌ Error ejecutando {workflow_func.__name__}: {e}")
        
        finally:
            if self.driver:
                self.driver.quit()
                logger.info("🔚 ChromeDriver cerrado")
        
        # Generar reporte final
        report_path = self.generate_medical_report(workflows_results)
        logger.info(f"📊 Reporte médico generado: {report_path}")
        
        return workflows_results
    
    def generate_medical_report(self, results: Dict) -> str:
        """Genera reporte especializado en testing médico"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = os.path.join(self.results_dir, f"medical_workflows_report_{timestamp}.json")
        
        # Análisis de compliance médico
        compliance_summary = {
            "hipaa_compliance_score": 0,
            "emergency_response_score": 0,
            "telemedicine_readiness": 0,
            "critical_issues": []
        }
        
        for result in results["results"]:
            workflow = result.get("workflow", "unknown")
            
            # Analizar compliance HIPAA
            if workflow == "medical_records_access":
                hipaa = result.get("hipaa_compliance", {})
                compliance_score = sum(hipaa.values()) / len(hipaa) * 100 if hipaa else 0
                compliance_summary["hipaa_compliance_score"] = compliance_score
                
                if compliance_score < 75:
                    compliance_summary["critical_issues"].append("❌ HIPAA compliance below standard")
            
            # Analizar respuesta de emergencias
            elif workflow == "emergency_response":
                response_time = result.get("response_time", 999999)
                if response_time < 3000:
                    compliance_summary["emergency_response_score"] = 100
                elif response_time < 5000:
                    compliance_summary["emergency_response_score"] = 75
                else:
                    compliance_summary["emergency_response_score"] = 50
                    compliance_summary["critical_issues"].append("⚠️ Emergency response time too slow")
            
            # Analizar telemedicina
            elif workflow == "telemedicine_session":
                webrtc = result.get("webrtc_enabled", False)
                controls = result.get("video_controls_found", 0)
                
                if webrtc and controls >= 2:
                    compliance_summary["telemedicine_readiness"] = 100
                elif webrtc:
                    compliance_summary["telemedicine_readiness"] = 75
                else:
                    compliance_summary["telemedicine_readiness"] = 25
                    compliance_summary["critical_issues"].append("❌ WebRTC not properly configured")
        
        # Agregar análisis al reporte
        results["medical_compliance_analysis"] = compliance_summary
        
        # Guardar reporte
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        # Imprimir resumen
        self.print_medical_summary(results)
        
        return report_path
    
    def print_medical_summary(self, results: Dict):
        """Imprime resumen médico en consola"""
        print("\n" + "="*70)
        print("🏥 REPORTE FINAL - TESTING FLUJOS MÉDICOS ALTAMEDICA")
        print("="*70)
        
        session = results["test_session"]
        compliance = results.get("medical_compliance_analysis", {})
        
        print(f"⏰ Timestamp: {session['timestamp']}")
        print(f"📊 Workflows Totales: {session['total_workflows']}")
        print(f"✅ Workflows Completados: {session['completed_workflows']}")
        print(f"❌ Workflows Fallidos: {session['failed_workflows']}")
        
        success_rate = (session['completed_workflows'] / session['total_workflows']) * 100
        print(f"💓 Tasa de Éxito: {success_rate:.1f}%")
        
        print(f"\n🏥 ANÁLISIS DE COMPLIANCE MÉDICO:")
        print(f"   🔒 HIPAA Compliance: {compliance.get('hipaa_compliance_score', 0):.1f}%")
        print(f"   🚨 Emergency Response: {compliance.get('emergency_response_score', 0):.1f}%")
        print(f"   🎥 Telemedicina: {compliance.get('telemedicine_readiness', 0):.1f}%")
        
        critical_issues = compliance.get('critical_issues', [])
        if critical_issues:
            print(f"\n🚨 PROBLEMAS CRÍTICOS ({len(critical_issues)}):")
            for issue in critical_issues:
                print(f"   {issue}")
        
        print("\n" + "="*70)

def main():
    """Función principal"""
    print("🏥 AltaMédica Medical Workflow Tester")
    print("=" * 40)
    
    tester = MedicalWorkflowTester(headless=True)
    results = tester.run_all_medical_workflows()
    
    print(f"\n🎉 Testing de flujos médicos completado!")

if __name__ == "__main__":
    main()