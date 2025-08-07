#!/usr/bin/env python3
"""
AltaMedica Package Standardization Testing
==========================================

Suite de tests para validar el sistema de estandarización de package.json

Autor: Eduardo Altamedica
Versión: 1.0.0
"""

import json
import tempfile
import shutil
from pathlib import Path
import logging
from typing import Dict, Any
import unittest

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PackageStandardizationTests(unittest.TestCase):
    """Tests para el sistema de estandarización"""
    
    def setUp(self):
        """Setup para cada test"""
        self.test_dir = Path(tempfile.mkdtemp())
        self.config_file = self.test_dir / "package-template-config.json"
        
        # Crear configuración de test
        self.test_config = {
            "templates": {
                "app": {
                    "name": "@altamedica/{APP_NAME}",
                    "version": "1.0.0",
                    "private": True,
                    "author": "Eduardo Altamedica",
                    "license": "MIT",
                    "scripts": {
                        "dev": "next dev --port {PORT}",
                        "build": "next build",
                        "start": "next start --port {PORT}"
                    },
                    "dependencies": {
                        "next": "^15.3.4",
                        "react": "^19.0.0"
                    }
                }
            },
            "appConfigurations": {
                "test-app": {
                    "port": 3000,
                    "description": "Test application",
                    "version": "0.1.0",
                    "customScripts": {
                        "dev": "next dev"
                    }
                }
            },
            "fieldsToPreserve": ["type", "main"],
            "optionalStandardizations": {
                "normalizeVersions": True,
                "preserveCustomConfigurations": True
            }
        }
        
        with open(self.config_file, 'w') as f:
            json.dump(self.test_config, f, indent=2)
        
        logger.info(f"🧪 Test setup en: {self.test_dir}")
    
    def tearDown(self):
        """Cleanup después de cada test"""
        shutil.rmtree(self.test_dir)
        logger.info("🧹 Test cleanup completado")
    
    def create_test_package(self, content: Dict[str, Any], subdir: str = "apps/test-app") -> Path:
        """Crea un package.json de test"""
        package_dir = self.test_dir / subdir
        package_dir.mkdir(parents=True, exist_ok=True)
        
        package_file = package_dir / "package.json"
        with open(package_file, 'w') as f:
            json.dump(content, f, indent=2)
        
        return package_file
    
    def test_preserve_type_module(self):
        """Test: Debe preservar 'type': 'module'"""
        logger.info("🧪 Testing: Preservar type module")
        
        original_package = {
            "name": "@altamedica/test-app",
            "type": "module",
            "version": "0.5.0",
            "scripts": {"dev": "custom command"}
        }
        
        package_file = self.create_test_package(original_package)
        
        # Simular estandarización (importar y usar la clase)
        import sys
        sys.path.append(str(self.test_dir.parent))
        
        from standardize_packages import PackageStandardizer
        standardizer = PackageStandardizer(str(self.test_dir))
        
        # Ejecutar estandarización
        success = standardizer.standardize_package(package_file, dry_run=False)
        self.assertTrue(success)
        
        # Verificar que type se preservó
        with open(package_file, 'r') as f:
            result = json.load(f)
        
        self.assertEqual(result.get("type"), "module")
        logger.info("✅ Test passed: type='module' preservado")
    
    def test_custom_scripts_preservation(self):
        """Test: Debe preservar scripts custom definidos"""
        logger.info("🧪 Testing: Preservar scripts custom")
        
        original_package = {
            "name": "@altamedica/test-app",
            "type": "module",
            "scripts": {
                "dev": "custom dev command",
                "build": "custom build",
                "custom-script": "echo 'custom'"
            }
        }
        
        package_file = self.create_test_package(original_package)
        
        import sys
        sys.path.append(str(self.test_dir.parent))
        from standardize_packages import PackageStandardizer
        
        standardizer = PackageStandardizer(str(self.test_dir))
        success = standardizer.standardize_package(package_file, dry_run=False)
        self.assertTrue(success)
        
        with open(package_file, 'r') as f:
            result = json.load(f)
        
        # El script dev debería ser el custom definido en config
        self.assertEqual(result["scripts"]["dev"], "next dev")  # Del custom config
        self.assertIn("custom-script", result["scripts"])  # Script custom preservado
        
        logger.info("✅ Test passed: Scripts custom preservados")
    
    def test_version_handling(self):
        """Test: Debe manejar versiones según configuración"""
        logger.info("🧪 Testing: Manejo de versiones")
        
        original_package = {
            "name": "@altamedica/test-app",
            "version": "0.5.0"
        }
        
        package_file = self.create_test_package(original_package)
        
        import sys
        sys.path.append(str(self.test_dir.parent))
        from standardize_packages import PackageStandardizer
        
        standardizer = PackageStandardizer(str(self.test_dir))
        success = standardizer.standardize_package(package_file, dry_run=False)
        self.assertTrue(success)
        
        with open(package_file, 'r') as f:
            result = json.load(f)
        
        # Debería usar la versión específica de la app config
        self.assertEqual(result["version"], "0.1.0")
        logger.info("✅ Test passed: Versión actualizada según config")
    
    def test_dependencies_conservative_merge(self):
        """Test: Debe hacer merge conservador de dependencias"""
        logger.info("🧪 Testing: Merge conservador de dependencias")
        
        original_package = {
            "name": "@altamedica/test-app",
            "dependencies": {
                "existing-dep": "^1.0.0",
                "react": "^18.0.0"  # Versión diferente al template
            }
        }
        
        package_file = self.create_test_package(original_package)
        
        import sys
        sys.path.append(str(self.test_dir.parent))
        from standardize_packages import PackageStandardizer
        
        standardizer = PackageStandardizer(str(self.test_dir))
        success = standardizer.standardize_package(package_file, dry_run=False)
        self.assertTrue(success)
        
        with open(package_file, 'r') as f:
            result = json.load(f)
        
        # Debe preservar dependencia existente
        self.assertIn("existing-dep", result["dependencies"])
        
        # React debería mantenerse en versión existente (conservador)
        # porque updateDependencyVersions está False por defecto
        self.assertEqual(result["dependencies"]["react"], "^18.0.0")
        
        logger.info("✅ Test passed: Merge conservador funcionando")
    
    def test_backup_creation(self):
        """Test: Debe crear backups automáticamente"""
        logger.info("🧪 Testing: Creación de backups")
        
        original_package = {"name": "@altamedica/test-app"}
        package_file = self.create_test_package(original_package)
        
        import sys
        sys.path.append(str(self.test_dir.parent))
        from standardize_packages import PackageStandardizer
        
        standardizer = PackageStandardizer(str(self.test_dir))
        success = standardizer.standardize_package(package_file, dry_run=False)
        self.assertTrue(success)
        
        # Verificar que existe backup
        backup_dir = self.test_dir / "backups"
        self.assertTrue(backup_dir.exists())
        
        # Buscar archivos de backup
        backup_files = list(backup_dir.rglob("package.json"))
        self.assertGreater(len(backup_files), 0)
        
        logger.info("✅ Test passed: Backup creado automáticamente")
    
    def test_dry_run_no_modifications(self):
        """Test: Dry run no debe modificar archivos"""
        logger.info("🧪 Testing: Dry run sin modificaciones")
        
        original_package = {"name": "@altamedica/test-app", "version": "0.5.0"}
        package_file = self.create_test_package(original_package)
        
        # Leer contenido original
        with open(package_file, 'r') as f:
            original_content = f.read()
        
        import sys
        sys.path.append(str(self.test_dir.parent))
        from standardize_packages import PackageStandardizer
        
        standardizer = PackageStandardizer(str(self.test_dir))
        success = standardizer.standardize_package(package_file, dry_run=True)
        self.assertTrue(success)
        
        # Verificar que el archivo no cambió
        with open(package_file, 'r') as f:
            current_content = f.read()
        
        self.assertEqual(original_content, current_content)
        logger.info("✅ Test passed: Dry run no modificó archivos")

class SystemIntegrationTests(unittest.TestCase):
    """Tests de integración del sistema completo"""
    
    def setUp(self):
        """Setup para tests de integración"""
        self.root_dir = Path(__file__).parent
        logger.info(f"🧪 Integration test en: {self.root_dir}")
    
    def test_config_validation(self):
        """Test: Validar configuración real del proyecto"""
        logger.info("🧪 Testing: Validación de configuración real")
        
        import sys
        sys.path.append(str(self.root_dir))
        from standardize_packages import PackageStandardizer
        
        try:
            standardizer = PackageStandardizer(str(self.root_dir))
            is_valid = standardizer.validate_config()
            self.assertTrue(is_valid)
            logger.info("✅ Test passed: Configuración real es válida")
        except Exception as e:
            self.fail(f"Configuración inválida: {e}")
    
    def test_find_package_files(self):
        """Test: Encontrar archivos package.json en el proyecto real"""
        logger.info("🧪 Testing: Detección de archivos package.json")
        
        import sys
        sys.path.append(str(self.root_dir))
        from standardize_packages import PackageStandardizer
        
        standardizer = PackageStandardizer(str(self.root_dir))
        package_files = standardizer.find_package_files()
        
        # Debe encontrar al menos el package.json raíz
        self.assertGreater(len(package_files), 0)
        
        # Verificar que encuentra apps conocidas
        app_names = [f.parent.name for f in package_files if "apps" in f.parts]
        expected_apps = ["web-app", "api-server", "doctors", "patients", "companies", "admin"]
        
        found_apps = [app for app in expected_apps if app in app_names]
        self.assertGreater(len(found_apps), 0)
        
        logger.info(f"✅ Test passed: Encontrados {len(package_files)} archivos, {len(found_apps)} apps conocidas")
    
    def test_real_app_detection(self):
        """Test: Detección correcta de tipos de aplicaciones reales"""
        logger.info("🧪 Testing: Detección de tipos de aplicaciones")
        
        import sys
        sys.path.append(str(self.root_dir))
        from standardize_packages import PackageStandardizer
        
        standardizer = PackageStandardizer(str(self.root_dir))
        
        # Test con web-app real
        web_app_file = self.root_dir / "apps" / "web-app" / "package.json"
        if web_app_file.exists():
            package_type = standardizer.detect_package_type(web_app_file, {})
            app_name = standardizer.get_app_name(web_app_file)
            
            self.assertEqual(package_type, "app")
            self.assertEqual(app_name, "web-app")
            logger.info("✅ Test passed: web-app detectada correctamente")

def run_performance_test():
    """Test de rendimiento del sistema"""
    logger.info("🚀 Ejecutando test de rendimiento...")
    
    import time
    import sys
    
    root_dir = Path(__file__).parent
    sys.path.append(str(root_dir))
    from standardize_packages import PackageStandardizer
    
    start_time = time.time()
    
    try:
        standardizer = PackageStandardizer(str(root_dir))
        package_files = standardizer.find_package_files()
        
        logger.info(f"📦 Archivos encontrados: {len(package_files)}")
        
        # Simular procesamiento (dry run)
        for package_file in package_files[:5]:  # Solo primeros 5 para performance
            standardizer.standardize_package(package_file, dry_run=True)
        
        end_time = time.time()
        duration = end_time - start_time
        
        logger.info(f"⏱️  Tiempo total: {duration:.2f} segundos")
        logger.info(f"📊 Promedio por archivo: {duration/min(5, len(package_files)):.2f} segundos")
        
        if duration < 10:  # Menos de 10 segundos es aceptable
            logger.info("✅ Performance test passed: Tiempo aceptable")
            return True
        else:
            logger.warning("⚠️  Performance test warning: Tiempo elevado")
            return False
            
    except Exception as e:
        logger.error(f"❌ Performance test failed: {e}")
        return False

def main():
    """Ejecutar todos los tests"""
    logger.info("🧪 Iniciando suite de tests AltaMedica Package Standardization")
    logger.info("=" * 70)
    
    # Test unitarios
    logger.info("🔬 Ejecutando tests unitarios...")
    unit_suite = unittest.TestLoader().loadTestsFromTestCase(PackageStandardizationTests)
    unit_runner = unittest.TextTestRunner(verbosity=2)
    unit_result = unit_runner.run(unit_suite)
    
    # Tests de integración
    logger.info("🔗 Ejecutando tests de integración...")
    integration_suite = unittest.TestLoader().loadTestsFromTestCase(SystemIntegrationTests)
    integration_runner = unittest.TextTestRunner(verbosity=2)
    integration_result = integration_runner.run(integration_suite)
    
    # Test de rendimiento
    performance_passed = run_performance_test()
    
    # Resumen final
    logger.info("=" * 70)
    logger.info("📊 RESUMEN DE TESTS")
    logger.info("=" * 70)
    
    unit_passed = unit_result.wasSuccessful()
    integration_passed = integration_result.wasSuccessful()
    
    logger.info(f"🔬 Tests Unitarios: {'✅ PASSED' if unit_passed else '❌ FAILED'}")
    logger.info(f"🔗 Tests Integración: {'✅ PASSED' if integration_passed else '❌ FAILED'}")
    logger.info(f"🚀 Test Rendimiento: {'✅ PASSED' if performance_passed else '⚠️  WARNING'}")
    
    total_tests = unit_result.testsRun + integration_result.testsRun + 1
    passed_tests = (1 if unit_passed else 0) + (1 if integration_passed else 0) + (1 if performance_passed else 0)
    
    logger.info(f"📈 Total: {passed_tests}/3 categorías exitosas")
    
    if unit_passed and integration_passed:
        logger.info("🎉 ¡Sistema de estandarización validado exitosamente!")
        logger.info("")
        logger.info("🚀 Próximos pasos:")
        logger.info("1. python3 standardize-packages.py --validate")
        logger.info("2. python3 standardize-packages.py --dry-run")
        logger.info("3. python3 standardize-packages.py")
        return True
    else:
        logger.error("❌ Algunos tests fallaron. Revisar logs para detalles.")
        return False

if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)