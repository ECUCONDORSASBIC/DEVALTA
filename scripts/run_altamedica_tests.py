#!/usr/bin/env python3
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
        print("\n1️⃣ Ejecutando suite principal...")
        selenium_results = run_full_selenium_suite()
        all_results["results"]["selenium_suite"] = selenium_results
        all_results["test_session"]["completed_suites"] += 1
        
        # Tests visuales
        print("\n2️⃣ Ejecutando tests visuales...")
        visual_results = run_visual_regression_tests()
        all_results["results"]["visual_regression"] = visual_results
        all_results["test_session"]["completed_suites"] += 1
        
        # Tests de flujos médicos
        print("\n3️⃣ Ejecutando tests médicos...")
        medical_results = run_medical_workflow_tests()
        all_results["results"]["medical_workflows"] = medical_results
        all_results["test_session"]["completed_suites"] += 1
        
        print("\n🎉 TODOS LOS TESTS COMPLETADOS!")
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
