#!/usr/bin/env python3
"""
ALTAMEDICA - Setup Python Testing Environment
=============================================

Script de configuración automática para herramientas de testing Python + Selenium.
Instala dependencias, configura ChromeDriver y prepara el entorno de testing.

Autor: Eduardo Marques MD + Claude AI  
Fecha: 2025-08-01
"""

import os
import sys
import subprocess
import platform
import urllib.request
import zipfile
import json
from pathlib import Path

def check_python_version():
    """Verifica versión de Python"""
    print("🐍 Verificando versión de Python...")
    
    if sys.version_info < (3, 7):
        print("❌ ERROR: Se requiere Python 3.7 o superior")
        print(f"   Versión actual: {sys.version}")
        return False
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
    return True

def install_python_packages():
    """Instala paquetes Python necesarios"""
    print("📦 Instalando paquetes Python...")
    
    packages = [
        "selenium>=4.15.0",
        "pillow>=10.0.0", 
        "numpy>=1.24.0",
        "requests>=2.31.0",
        "beautifulsoup4>=4.12.0",
        "lxml>=4.9.0"
    ]
    
    for package in packages:
        try:
            print(f"   📦 Instalando {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"   ✅ {package} instalado")
        except subprocess.CalledProcessError as e:
            print(f"   ❌ Error instalando {package}: {e}")
            return False
    
    print("✅ Todos los paquetes Python instalados")
    return True

def download_chromedriver():
    """Descarga y configura ChromeDriver"""
    print("🌐 Configurando ChromeDriver...")
    
    # Detectar sistema operativo
    system = platform.system().lower()
    
    if system == "windows":
        chromedriver_url = "https://chromedriver.storage.googleapis.com/114.0.5735.90/chromedriver_win32.zip"
        chromedriver_name = "chromedriver.exe"
    elif system == "darwin":
        chromedriver_url = "https://chromedriver.storage.googleapis.com/114.0.5735.90/chromedriver_mac64.zip"
        chromedriver_name = "chromedriver"
    else:
        chromedriver_url = "https://chromedriver.storage.googleapis.com/114.0.5735.90/chromedriver_linux64.zip"
        chromedriver_name = "chromedriver"
    
    # Crear directorio de drivers
    drivers_dir = Path("drivers")
    drivers_dir.mkdir(exist_ok=True)
    
    chromedriver_path = drivers_dir / chromedriver_name
    
    # Verificar si ya existe
    if chromedriver_path.exists():
        print(f"   ✅ ChromeDriver ya existe: {chromedriver_path}")
        return str(chromedriver_path)
    
    try:
        print(f"   📥 Descargando ChromeDriver para {system}...")
        urllib.request.urlretrieve(chromedriver_url, "chromedriver.zip")
        
        print("   📂 Extrayendo ChromeDriver...")
        with zipfile.ZipFile("chromedriver.zip", 'r') as zip_ref:
            zip_ref.extractall(drivers_dir)
        
        # Dar permisos de ejecución en Unix
        if system != "windows":
            os.chmod(chromedriver_path, 0o755)
        
        # Limpiar archivo zip
        os.remove("chromedriver.zip")
        
        print(f"   ✅ ChromeDriver configurado: {chromedriver_path}")
        return str(chromedriver_path)
        
    except Exception as e:
        print(f"   ❌ Error configurando ChromeDriver: {e}")
        print("   💡 Puedes descargar manualmente desde: https://chromedriver.chromium.org/")
        return None

def create_test_configuration():
    """Crea archivo de configuración para testing"""
    print("⚙️ Creando configuración de testing...")
    
    config = {
        "altamedica_testing": {
            "apps": [
                {
                    "name": "web-app",
                    "url": "http://localhost:3000",
                    "port": 3000,
                    "critical_for_auth": True
                },
                {
                    "name": "api-server", 
                    "url": "http://localhost:3001",
                    "port": 3001,
                    "critical_for_backend": True
                },
                {
                    "name": "doctors",
                    "url": "http://localhost:3002", 
                    "port": 3002,
                    "role_required": "doctor"
                },
                {
                    "name": "patients",
                    "url": "http://localhost:3003",
                    "port": 3003, 
                    "role_required": "patient"
                },
                {
                    "name": "admin",
                    "url": "http://localhost:3005",
                    "port": 3005,
                    "role_required": "admin"
                },
                {
                    "name": "companies",
                    "url": "http://localhost:3004", 
                    "port": 3004,
                    "role_required": "company"
                }
            ],
            "test_users": {
                "patient": {
                    "email": "patient.test@altamedica.com",
                    "password": "TestPatient123!",
                    "role": "patient"
                },
                "doctor": {
                    "email": "doctor.test@altamedica.com",
                    "password": "TestDoctor123!",
                    "role": "doctor"
                },
                "admin": {
                    "email": "admin.test@altamedica.com",
                    "password": "TestAdmin123!",
                    "role": "admin"
                }
            },
            "selenium_config": {
                "implicit_wait": 10,
                "page_load_timeout": 30,
                "script_timeout": 30,
                "window_size": [1920, 1080]
            },
            "medical_compliance": {
                "hipaa_required": True,
                "emergency_response_max_time": 3000,
                "webrtc_required": True,
                "accessibility_required": True
            }
        }
    }
    
    config_path = "altamedica_testing_config.json"
    
    try:
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        
        print(f"   ✅ Configuración creada: {config_path}")
        return config_path
        
    except Exception as e:
        print(f"   ❌ Error creando configuración: {e}")
        return None

def create_test_runner_script():
    """Crea script principal para ejecutar tests"""
    print("🚀 Creando script ejecutor de tests...")
    
    runner_script = """#!/usr/bin/env python3
'''
ALTAMEDICA - Test Runner Principal
=================================

Script principal para ejecutar todas las herramientas de testing Python + Selenium.
Uso: python run_altamedica_tests.py [opción]
'''

import sys
import os
import argparse
from datetime import datetime

# Importar herramientas de testing
try:
    from selenium_testing_suite import AltaMedicaSeleniumTester
    from visual_regression_tester import VisualRegressionTester, create_altamedica_visual_configs
    from medical_workflow_tester import MedicalWorkflowTester
except ImportError as e:
    print(f"❌ Error importando herramientas: {e}")
    print("💡 Asegúrate de ejecutar setup_python_testing.py primero")
    sys.exit(1)

def run_full_selenium_suite():
    '''Ejecuta suite completa de Selenium'''
    print("🎭 EJECUTANDO SUITE COMPLETA DE SELENIUM")
    print("=" * 50)
    
    tester = AltaMedicaSeleniumTester(headless=True)
    results = tester.test_all_apps()
    
    return results

def run_visual_regression_tests():
    '''Ejecuta tests de regresión visual'''
    print("🎨 EJECUTANDO TESTS DE REGRESIÓN VISUAL")
    print("=" * 50)
    
    tester = VisualRegressionTester()
    configs = create_altamedica_visual_configs()
    results = tester.run_visual_tests(configs)
    
    return results

def run_medical_workflow_tests():
    '''Ejecuta tests de flujos médicos'''
    print("🏥 EJECUTANDO TESTS DE FLUJOS MÉDICOS")
    print("=" * 50)
    
    tester = MedicalWorkflowTester(headless=True)
    results = tester.run_all_medical_workflows()
    
    return results

def run_all_tests():
    '''Ejecuta todos los tests disponibles'''
    print("🚀 EJECUTANDO TODOS LOS TESTS ALTAMEDICA")
    print("=" * 60)
    
    all_results = {
        "test_session": {
            "timestamp": datetime.now().isoformat(),
            "total_suites": 3,
            "completed_suites": 0
        },
        "results": {}
    }
    
    try:
        # Suite principal de Selenium
        print("\\n1️⃣ Ejecutando suite principal...")
        selenium_results = run_full_selenium_suite()
        all_results["results"]["selenium_suite"] = selenium_results
        all_results["test_session"]["completed_suites"] += 1
        
        # Tests visuales
        print("\\n2️⃣ Ejecutando tests visuales...")
        visual_results = run_visual_regression_tests()
        all_results["results"]["visual_regression"] = visual_results
        all_results["test_session"]["completed_suites"] += 1
        
        # Tests de flujos médicos
        print("\\n3️⃣ Ejecutando tests médicos...")
        medical_results = run_medical_workflow_tests()
        all_results["results"]["medical_workflows"] = medical_results
        all_results["test_session"]["completed_suites"] += 1
        
        print("\\n🎉 TODOS LOS TESTS COMPLETADOS!")
        print(f"✅ Suites ejecutadas: {all_results['test_session']['completed_suites']}")
        
    except Exception as e:
        print(f"❌ Error ejecutando tests: {e}")
    
    return all_results

def main():
    parser = argparse.ArgumentParser(description="AltaMédica Python Testing Runner")
    parser.add_argument("--suite", choices=["selenium", "visual", "medical", "all"], 
                       default="all", help="Suite de tests a ejecutar")
    parser.add_argument("--headless", action="store_true", help="Ejecutar en modo headless")
    
    args = parser.parse_args()
    
    print(f"🏥 AltaMédica Testing Suite - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    if args.suite == "selenium":
        run_full_selenium_suite()
    elif args.suite == "visual":
        run_visual_regression_tests()
    elif args.suite == "medical":
        run_medical_workflow_tests()
    else:
        run_all_tests()

if __name__ == "__main__":
    main()
"""
    
    runner_path = "run_altamedica_tests.py"
    
    try:
        with open(runner_path, 'w', encoding='utf-8') as f:
            f.write(runner_script)
        
        # Dar permisos de ejecución en Unix
        if platform.system() != "Windows":
            os.chmod(runner_path, 0o755)
        
        print(f"   ✅ Script ejecutor creado: {runner_path}")
        return runner_path
        
    except Exception as e:
        print(f"   ❌ Error creando script ejecutor: {e}")
        return None

def create_documentation():
    """Crea documentación de las herramientas"""
    print("📚 Creando documentación...")
    
    documentation = """# AltaMédica - Herramientas de Testing Python + Selenium

## 🎯 Descripción General

Suite completa de herramientas de testing automatizado para la plataforma médica AltaMédica, implementada con Python + Selenium.

## 🛠️ Herramientas Incluidas

### 1. selenium_testing_suite.py
**Suite principal de testing con Selenium**
- Testing de disponibilidad de aplicaciones
- Verificación de elementos críticos de UI
- Métricas de performance web
- Compliance médico HIPAA
- Generación de reportes automáticos

**Uso:**
```bash
python selenium_testing_suite.py --headless --timeout 30
python selenium_testing_suite.py --app web-app
python selenium_testing_suite.py --continuous  # Monitoreo continuo
```

### 2. visual_regression_tester.py  
**Testing visual y detección de regresiones**
- Capturas de pantalla automatizadas
- Comparación visual entre versiones
- Detección de cambios visuales
- Reportes HTML con imágenes

**Uso:**
```bash
python visual_regression_tester.py
```

### 3. medical_workflow_tester.py
**Testing de flujos médicos específicos**
- Reserva de citas médicas
- Sesiones de telemedicina
- Acceso a registros médicos
- Flujos de emergencia médica
- Compliance HIPAA automatizado

**Uso:**
```bash
python medical_workflow_tester.py
```

### 4. run_altamedica_tests.py
**Ejecutor principal de todos los tests**
```bash
python run_altamedica_tests.py --suite all
python run_altamedica_tests.py --suite selenium
python run_altamedica_tests.py --suite visual
python run_altamedica_tests.py --suite medical
```

## 📦 Instalación

### Requisitos
- Python 3.7+
- Google Chrome instalado
- Sistema operativo: Windows, macOS, Linux

### Instalación Automática
```bash
python setup_python_testing.py
```

### Instalación Manual
```bash
pip install selenium pillow numpy requests beautifulsoup4 lxml
```

## 🏥 Configuración Médica

### Aplicaciones AltaMédica Testeadas
- **web-app (3000)**: Gateway central y autenticación
- **api-server (3001)**: Backend APIs y WebSocket
- **doctors (3002)**: Portal médicos profesionales  
- **patients (3003)**: Portal pacientes
- **admin (3005)**: Panel administrativo
- **companies (3004)**: Portal empresas B2B

### Usuarios de Prueba
Configurados en `altamedica_testing_config.json`:
- **Paciente**: patient.test@altamedica.com
- **Doctor**: doctor.test@altamedica.com  
- **Admin**: admin.test@altamedica.com

### Compliance Médico
- ✅ **HIPAA**: Verificación automática de compliance
- ✅ **WebRTC**: Testing de videollamadas médicas
- ✅ **Emergencias**: Tiempo de respuesta < 3 segundos
- ✅ **Accesibilidad**: Compliance WCAG 2.1 AA

## 📊 Reportes Generados

### Ubicaciones de Reportes
- `selenium_reports/`: Reportes JSON de testing general
- `visual_testing/reports/`: Reportes HTML de testing visual
- `medical_testing_results/`: Reportes de flujos médicos
- `selenium_screenshots/`: Capturas de pantalla
- `visual_testing/baselines/`: Imágenes baseline para comparación

### Tipos de Reportes
1. **JSON detallado**: Datos completos para análisis
2. **HTML visual**: Reportes con imágenes y gráficos
3. **Screenshots**: Evidencia visual de tests
4. **Compliance médico**: Análisis específico HIPAA

## 🚀 Ejecución en Producción

### Testing Continuo
```bash
python selenium_testing_suite.py --continuous
```

### Testing Programado (cron)
```bash
# Cada hora
0 * * * * cd /path/to/scripts && python run_altamedica_tests.py

# Diario a las 2 AM
0 2 * * * cd /path/to/scripts && python run_altamedica_tests.py --suite all
```

### Integración CI/CD
Agregar a pipeline de deployment:
```yaml
- name: Run AltaMédica Tests
  run: python run_altamedica_tests.py --suite all --headless
```

## 🔧 Solución de Problemas

### ChromeDriver Issues
```bash
# Verificar versión Chrome
google-chrome --version

# Descargar ChromeDriver compatible
# https://chromedriver.chromium.org/
```

### Timeouts en Testing
- Aumentar timeout: `--timeout 60`
- Verificar que apps estén iniciadas
- Comprobar puertos disponibles

### Errores de Selenium
- Verificar versión de Selenium: `pip show selenium`
- Actualizar: `pip install --upgrade selenium`
- Chrome en modo headless: `--headless`

## 🏥 Consideraciones Médicas

### Datos de Prueba
- **NUNCA** usar datos médicos reales
- Usar solo usuarios de prueba configurados
- Datos anonymizados exclusivamente

### Compliance y Seguridad
- Tests diseñados para verificar HIPAA
- Auditoría automática de accesos
- Verificación de encriptación HTTPS
- Control de accesos por roles

### Performance Médica
- **Emergencias**: < 3 segundos respuesta
- **Telemedicina**: WebRTC funcional
- **Accesibilidad**: WCAG AA compliance
- **Disponibilidad**: 99.9% uptime target

---

**Autor**: Eduardo Marques MD + Claude AI  
**Fecha**: 2025-08-01  
**Versión**: 1.0.0  
**Licencia**: MIT  
"""
    
    doc_path = "PYTHON_TESTING_README.md"
    
    try:
        with open(doc_path, 'w', encoding='utf-8') as f:
            f.write(documentation)
        
        print(f"   ✅ Documentación creada: {doc_path}")
        return doc_path
        
    except Exception as e:
        print(f"   ❌ Error creando documentación: {e}")
        return None

def main():
    """Función principal de setup"""
    print("🏥 ALTAMEDICA - SETUP PYTHON TESTING ENVIRONMENT")
    print("=" * 60)
    print("Configurando herramientas de testing Python + Selenium...")
    print("")
    
    success_steps = 0
    total_steps = 6
    
    # Paso 1: Verificar Python
    if check_python_version():
        success_steps += 1
    
    # Paso 2: Instalar paquetes
    if install_python_packages():
        success_steps += 1
    
    # Paso 3: Configurar ChromeDriver
    chromedriver_path = download_chromedriver()
    if chromedriver_path:
        success_steps += 1
    
    # Paso 4: Crear configuración
    config_path = create_test_configuration()
    if config_path:
        success_steps += 1
    
    # Paso 5: Crear script ejecutor
    runner_path = create_test_runner_script()
    if runner_path:
        success_steps += 1
    
    # Paso 6: Crear documentación
    doc_path = create_documentation()
    if doc_path:
        success_steps += 1
    
    print("\n" + "=" * 60)
    print("🎉 SETUP COMPLETADO!")
    print("=" * 60)
    print(f"✅ Pasos completados: {success_steps}/{total_steps}")
    
    if success_steps == total_steps:
        print("\n🚀 HERRAMIENTAS LISTAS PARA USAR:")
        print("   1. python selenium_testing_suite.py")
        print("   2. python visual_regression_tester.py") 
        print("   3. python medical_workflow_tester.py")
        print("   4. python run_altamedica_tests.py")
        print(f"\n📚 Documentación: {doc_path}")
        print(f"⚙️ Configuración: {config_path}")
        
        print("\n💡 PRÓXIMOS PASOS:")
        print("   1. Iniciar aplicaciones AltaMédica (npm run dev:all)")
        print("   2. Ejecutar: python run_altamedica_tests.py")
        print("   3. Revisar reportes generados")
        
    else:
        print(f"\n⚠️ Setup incompleto ({success_steps}/{total_steps})")
        print("💡 Revisar errores anteriores y volver a ejecutar")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()