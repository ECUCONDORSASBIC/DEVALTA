#!/usr/bin/env python3
"""
ALTAMEDICA - Visual Regression Testing Tool
===========================================

Herramienta especializada para testing visual, capturas de pantalla comparativas
y detección de regresiones visuales en la plataforma médica.

Autor: Eduardo Marques MD + Claude AI
Fecha: 2025-08-01
"""

import os
import sys
import time
import json
import hashlib
from datetime import datetime
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from PIL import Image, ImageDraw, ImageFont
import numpy as np

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException
except ImportError:
    print("❌ ERROR: Selenium no está instalado")
    print("📦 Instalar con: pip install selenium pillow numpy")
    sys.exit(1)

@dataclass
class ScreenshotConfig:
    """Configuración para capturas de pantalla"""
    name: str
    url: str
    viewport: Tuple[int, int]
    element_selector: Optional[str] = None
    wait_for_element: Optional[str] = None
    scroll_to_bottom: bool = False

class VisualRegressionTester:
    """Testing visual y comparación de capturas de pantalla"""
    
    def __init__(self, base_dir: str = "visual_testing"):
        self.base_dir = base_dir
        self.screenshots_dir = os.path.join(base_dir, "screenshots")
        self.baselines_dir = os.path.join(base_dir, "baselines")
        self.diffs_dir = os.path.join(base_dir, "diffs")
        self.reports_dir = os.path.join(base_dir, "reports")
        
        # Crear directorios
        for directory in [self.screenshots_dir, self.baselines_dir, self.diffs_dir, self.reports_dir]:
            os.makedirs(directory, exist_ok=True)
        
        self.driver = None
    
    def setup_driver(self) -> webdriver.Chrome:
        """Configura driver Chrome para capturas consistentes"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--hide-scrollbars")
        chrome_options.add_argument("--disable-web-security")
        chrome_options.add_argument("--disable-features=VizDisplayCompositor")
        
        self.driver = webdriver.Chrome(options=chrome_options)
        return self.driver
    
    def take_screenshot(self, config: ScreenshotConfig, timestamp: str = None) -> str:
        """Toma captura de pantalla según configuración"""
        if not timestamp:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        screenshot_path = os.path.join(
            self.screenshots_dir, 
            f"{config.name}_{timestamp}.png"
        )
        
        try:
            # Configurar viewport
            self.driver.set_window_size(*config.viewport)
            
            # Navegar a URL
            self.driver.get(config.url)
            
            # Esperar elemento específico si se especifica
            if config.wait_for_element:
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, config.wait_for_element))
                )
            
            # Scroll si es necesario
            if config.scroll_to_bottom:
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(2)
                self.driver.execute_script("window.scrollTo(0, 0);")
                time.sleep(1)
            
            # Tomar captura
            if config.element_selector:
                # Captura de elemento específico
                element = self.driver.find_element(By.CSS_SELECTOR, config.element_selector)
                element.screenshot(screenshot_path)
            else:
                # Captura de página completa
                self.driver.save_screenshot(screenshot_path)
            
            print(f"📸 Screenshot guardado: {screenshot_path}")
            return screenshot_path
            
        except Exception as e:
            print(f"❌ Error tomando screenshot {config.name}: {e}")
            return ""
    
    def compare_images(self, image1_path: str, image2_path: str, tolerance: float = 0.1) -> Dict:
        """Compara dos imágenes y retorna métricas de diferencia"""
        try:
            # Cargar imágenes
            img1 = Image.open(image1_path).convert('RGB')
            img2 = Image.open(image2_path).convert('RGB')
            
            # Redimensionar a mismo tamaño si es necesario
            if img1.size != img2.size:
                print(f"⚠️ Redimensionando imágenes: {img1.size} vs {img2.size}")
                min_width = min(img1.size[0], img2.size[0])
                min_height = min(img1.size[1], img2.size[1])
                img1 = img1.resize((min_width, min_height))
                img2 = img2.resize((min_width, min_height))
            
            # Convertir a arrays numpy
            arr1 = np.array(img1)
            arr2 = np.array(img2)
            
            # Calcular diferencias
            diff = np.abs(arr1.astype(float) - arr2.astype(float))
            diff_percentage = np.mean(diff) / 255.0 * 100
            
            # Crear imagen de diferencias
            diff_img = Image.fromarray(np.uint8(diff))
            
            # Métricas detalladas
            pixel_differences = np.sum(diff > tolerance * 255)
            total_pixels = arr1.shape[0] * arr1.shape[1]
            changed_pixels_percentage = (pixel_differences / total_pixels) * 100
            
            result = {
                "difference_percentage": round(diff_percentage, 2),
                "changed_pixels_percentage": round(changed_pixels_percentage, 2),
                "total_pixels": total_pixels,
                "changed_pixels": int(pixel_differences),
                "tolerance": tolerance,
                "images_identical": diff_percentage < tolerance,
                "diff_image": diff_img
            }
            
            return result
            
        except Exception as e:
            print(f"❌ Error comparando imágenes: {e}")
            return {"error": str(e)}
    
    def create_diff_image(self, image1_path: str, image2_path: str, output_path: str) -> str:
        """Crea imagen visual de diferencias"""
        try:
            img1 = Image.open(image1_path).convert('RGB')
            img2 = Image.open(image2_path).convert('RGB')
            
            # Redimensionar si es necesario
            if img1.size != img2.size:
                min_width = min(img1.size[0], img2.size[0])
                min_height = min(img1.size[1], img2.size[1])
                img1 = img1.resize((min_width, min_height))
                img2 = img2.resize((min_width, min_height))
            
            # Crear imagen combinada (lado a lado)
            combined_width = img1.size[0] * 2 + 20  # Espacio entre imágenes
            combined_height = img1.size[1] + 100  # Espacio para labels
            
            combined = Image.new('RGB', (combined_width, combined_height), 'white')
            
            # Pegar imágenes
            combined.paste(img1, (0, 50))
            combined.paste(img2, (img1.size[0] + 20, 50))
            
            # Agregar labels
            draw = ImageDraw.Draw(combined)
            try:
                font = ImageFont.truetype("arial.ttf", 16)
            except:
                font = ImageFont.load_default()
            
            draw.text((10, 10), "Baseline", fill='black', font=font)
            draw.text((img1.size[0] + 30, 10), "Current", fill='black', font=font)
            
            # Línea divisora
            draw.line([(img1.size[0] + 10, 0), (img1.size[0] + 10, combined_height)], fill='red', width=2)
            
            # Guardar
            combined.save(output_path)
            print(f"🔍 Imagen de diferencias guardada: {output_path}")
            return output_path
            
        except Exception as e:
            print(f"❌ Error creando imagen de diferencias: {e}")
            return ""
    
    def run_visual_tests(self, configs: List[ScreenshotConfig]) -> Dict:
        """Ejecuta suite completa de tests visuales"""
        print("🎨 INICIANDO TESTING VISUAL ALTAMEDICA")
        print("=" * 50)
        
        self.setup_driver()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        results = {
            "timestamp": timestamp,
            "total_tests": len(configs),
            "passed_tests": 0,
            "failed_tests": 0,
            "test_results": []
        }
        
        try:
            for config in configs:
                print(f"\n📸 Testing visual: {config.name}")
                
                # Tomar screenshot actual
                current_screenshot = self.take_screenshot(config, timestamp)
                
                if not current_screenshot:
                    continue
                
                # Buscar baseline
                baseline_pattern = f"{config.name}_baseline.png"
                baseline_path = os.path.join(self.baselines_dir, baseline_pattern)
                
                test_result = {
                    "name": config.name,
                    "url": config.url,
                    "current_screenshot": current_screenshot,
                    "baseline_screenshot": baseline_path,
                    "has_baseline": os.path.exists(baseline_path),
                    "comparison": {}
                }
                
                if os.path.exists(baseline_path):
                    # Comparar con baseline
                    comparison = self.compare_images(baseline_path, current_screenshot)
                    test_result["comparison"] = comparison
                    
                    # Crear imagen de diferencias si hay cambios
                    if not comparison.get("images_identical", False):
                        diff_path = os.path.join(
                            self.diffs_dir, 
                            f"{config.name}_diff_{timestamp}.png"
                        )
                        self.create_diff_image(baseline_path, current_screenshot, diff_path)
                        test_result["diff_image"] = diff_path
                        
                        print(f"⚠️ Diferencias detectadas: {comparison.get('difference_percentage', 0)}%")
                        results["failed_tests"] += 1
                    else:
                        print("✅ Imagen idéntica al baseline")
                        results["passed_tests"] += 1
                else:
                    # Crear baseline si no existe
                    import shutil
                    shutil.copy2(current_screenshot, baseline_path)
                    print(f"📋 Baseline creado: {baseline_path}")
                    test_result["baseline_created"] = True
                    results["passed_tests"] += 1
                
                results["test_results"].append(test_result)
        
        finally:
            if self.driver:
                self.driver.quit()
        
        # Generar reporte
        report_path = self.generate_visual_report(results)
        print(f"\n📊 Reporte visual generado: {report_path}")
        
        return results
    
    def generate_visual_report(self, results: Dict) -> str:
        """Genera reporte HTML visual"""
        timestamp = results["timestamp"]
        report_path = os.path.join(self.reports_dir, f"visual_report_{timestamp}.html")
        
        # HTML template
        html_content = f"""
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>AltaMédica - Reporte Visual Testing</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 30px; }}
                .summary {{ background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                .test-result {{ background: white; margin: 20px 0; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                .passed {{ border-left: 5px solid #28a745; }}
                .failed {{ border-left: 5px solid #dc3545; }}
                .baseline-created {{ border-left: 5px solid #007bff; }}
                .screenshot {{ max-width: 300px; margin: 10px; border: 1px solid #ddd; border-radius: 5px; }}
                .diff-image {{ max-width: 600px; margin: 10px; border: 2px solid #dc3545; border-radius: 5px; }}
                .metrics {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }}
                .metric {{ background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }}
                .metric-value {{ font-size: 24px; font-weight: bold; color: #495057; }}
                .metric-label {{ font-size: 14px; color: #6c757d; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏥 AltaMédica - Reporte Visual Testing</h1>
                <p>Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            </div>
            
            <div class="summary">
                <h2>📊 Resumen Ejecutivo</h2>
                <div class="metrics">
                    <div class="metric">
                        <div class="metric-value">{results['total_tests']}</div>
                        <div class="metric-label">Tests Totales</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value" style="color: #28a745;">{results['passed_tests']}</div>
                        <div class="metric-label">Tests Pasados</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value" style="color: #dc3545;">{results['failed_tests']}</div>
                        <div class="metric-label">Tests Fallidos</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value" style="color: #007bff;">{(results['passed_tests']/results['total_tests']*100) if results['total_tests'] > 0 else 0:.1f}%</div>
                        <div class="metric-label">Tasa de Éxito</div>
                    </div>
                </div>
            </div>
        """
        
        # Agregar resultados individuales
        for test in results["test_results"]:
            status_class = "baseline-created" if test.get("baseline_created") else ("passed" if test.get("comparison", {}).get("images_identical", True) else "failed")
            status_icon = "📋" if test.get("baseline_created") else ("✅" if test.get("comparison", {}).get("images_identical", True) else "❌")
            
            html_content += f"""
            <div class="test-result {status_class}">
                <h3>{status_icon} {test['name']}</h3>
                <p><strong>URL:</strong> {test['url']}</p>
            """
            
            if test.get("baseline_created"):
                html_content += "<p><strong>Estado:</strong> Baseline creado exitosamente</p>"
            elif test.get("comparison"):
                comp = test["comparison"]
                html_content += f"""
                <p><strong>Diferencia:</strong> {comp.get('difference_percentage', 0)}%</p>
                <p><strong>Píxeles cambiados:</strong> {comp.get('changed_pixels_percentage', 0)}%</p>
                """
            
            # Agregar imágenes si existen
            if os.path.exists(test["current_screenshot"]):
                rel_path = os.path.relpath(test["current_screenshot"], self.reports_dir)
                html_content += f'<img src="{rel_path}" class="screenshot" alt="Screenshot actual">'
            
            if test.get("diff_image") and os.path.exists(test["diff_image"]):
                rel_path = os.path.relpath(test["diff_image"], self.reports_dir)
                html_content += f'<img src="{rel_path}" class="diff-image" alt="Imagen de diferencias">'
            
            html_content += "</div>"
        
        html_content += """
            </body>
        </html>
        """
        
        # Guardar reporte
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return report_path

def create_altamedica_visual_configs() -> List[ScreenshotConfig]:
    """Configuraciones de testing visual para AltaMédica"""
    return [
        ScreenshotConfig(
            name="web_app_homepage",
            url="http://localhost:3000",
            viewport=(1920, 1080),
            wait_for_element="h1",
            scroll_to_bottom=True
        ),
        ScreenshotConfig(
            name="web_app_mobile",
            url="http://localhost:3000",
            viewport=(375, 667),
            wait_for_element="h1"
        ),
        ScreenshotConfig(
            name="doctors_portal",
            url="http://localhost:3002",
            viewport=(1920, 1080),
            wait_for_element="body"
        ),
        ScreenshotConfig(
            name="patients_portal",
            url="http://localhost:3003",
            viewport=(1920, 1080),
            wait_for_element="body"
        ),
        ScreenshotConfig(
            name="admin_panel",
            url="http://localhost:3005",
            viewport=(1920, 1080),
            wait_for_element="body"
        ),
        ScreenshotConfig(
            name="companies_portal",
            url="http://localhost:3004",
            viewport=(1920, 1080),
            wait_for_element="body"
        )
    ]

def main():
    """Función principal"""
    print("🎨 AltaMédica Visual Regression Tester")
    print("=" * 40)
    
    tester = VisualRegressionTester()
    configs = create_altamedica_visual_configs()
    
    results = tester.run_visual_tests(configs)
    
    print(f"\n🎉 Testing visual completado!")
    print(f"✅ Tests pasados: {results['passed_tests']}")
    print(f"❌ Tests fallidos: {results['failed_tests']}")

if __name__ == "__main__":
    main()