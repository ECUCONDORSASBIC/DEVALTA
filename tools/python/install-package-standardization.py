#!/usr/bin/env python3
"""
AltaMedica Package Standardization Installer
===========================================

Instalador completo del sistema de estandarización de package.json

Autor: Eduardo Altamedica
Versión: 1.0.0
"""

import sys
import os
import subprocess
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_python_version():
    """Verifica versión de Python"""
    if sys.version_info < (3, 7):
        logger.error("❌ Se requiere Python 3.7 o superior")
        return False
    logger.info(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detectado")
    return True

def check_git_repository():
    """Verifica que estamos en un repositorio Git"""
    if not Path(".git").exists():
        logger.error("❌ No se detectó repositorio Git")
        return False
    logger.info("✅ Repositorio Git detectado")
    return True

def run_tests():
    """Ejecuta tests del sistema"""
    logger.info("🧪 Ejecutando tests del sistema...")
    try:
        result = subprocess.run([
            sys.executable, "test-package-standardization.py"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            logger.info("✅ Tests pasaron exitosamente")
            return True
        else:
            logger.error(f"❌ Tests fallaron: {result.stderr}")
            return False
    except Exception as e:
        logger.error(f"❌ Error ejecutando tests: {e}")
        return False

def install_automation():
    """Instala sistema de automatización"""
    logger.info("🔧 Instalando sistema de automatización...")
    try:
        result = subprocess.run([
            sys.executable, "setup-package-automation.py", "--install-all"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            logger.info("✅ Sistema de automatización instalado")
            return True
        else:
            logger.error(f"❌ Error instalando automatización: {result.stderr}")
            return False
    except Exception as e:
        logger.error(f"❌ Error en instalación: {e}")
        return False

def validate_configuration():
    """Valida configuración del sistema"""
    logger.info("🔍 Validando configuración...")
    try:
        result = subprocess.run([
            sys.executable, "standardize-packages.py", "--validate"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            logger.info("✅ Configuración válida")
            return True
        else:
            logger.error(f"❌ Configuración inválida: {result.stderr}")
            return False
    except Exception as e:
        logger.error(f"❌ Error validando configuración: {e}")
        return False

def demo_dry_run():
    """Ejecuta demo en modo dry-run"""
    logger.info("🎯 Ejecutando demo (dry-run)...")
    try:
        result = subprocess.run([
            sys.executable, "standardize-packages.py", "--dry-run"
        ], capture_output=True, text=True)
        
        logger.info("📋 Resultado del dry-run:")
        print(result.stdout)
        
        if result.returncode == 0:
            logger.info("✅ Demo dry-run exitoso")
            return True
        else:
            logger.warning(f"⚠️  Demo dry-run con advertencias: {result.stderr}")
            return True  # Dry-run warnings son aceptables
    except Exception as e:
        logger.error(f"❌ Error en demo: {e}")
        return False

def main():
    """Instalación completa paso a paso"""
    logger.info("🚀 INSTALADOR DE SISTEMA DE ESTANDARIZACIÓN ALTAMEDICA")
    logger.info("=" * 70)
    
    steps = [
        ("🐍 Verificar Python", check_python_version),
        ("📂 Verificar Git", check_git_repository),
        ("🧪 Ejecutar Tests", run_tests),
        ("🔧 Instalar Automatización", install_automation),
        ("🔍 Validar Configuración", validate_configuration),
        ("🎯 Demo Dry-Run", demo_dry_run),
    ]
    
    success_count = 0
    
    for step_name, step_function in steps:
        logger.info(f"\n{step_name}")
        logger.info("-" * 40)
        
        try:
            if step_function():
                success_count += 1
                logger.info(f"✅ {step_name} completado")
            else:
                logger.error(f"❌ {step_name} falló")
                
                # Preguntar si continuar
                response = input(f"\n¿Continuar con la instalación? (y/n): ").lower()
                if response != 'y':
                    logger.info("⏹️  Instalación cancelada por el usuario")
                    return False
        except KeyboardInterrupt:
            logger.info("\n⏹️  Instalación cancelada por el usuario")
            return False
        except Exception as e:
            logger.error(f"❌ Error inesperado en {step_name}: {e}")
            return False
    
    # Resumen final
    logger.info("\n" + "=" * 70)
    logger.info("📊 RESUMEN DE INSTALACIÓN")
    logger.info("=" * 70)
    logger.info(f"✅ Pasos completados: {success_count}/{len(steps)}")
    
    if success_count == len(steps):
        logger.info("🎉 ¡INSTALACIÓN COMPLETADA EXITOSAMENTE!")
        
        logger.info("\n🎯 PRÓXIMOS PASOS:")
        logger.info("1. Revisar cambios propuestos:")
        logger.info("   python3 standardize-packages.py --dry-run")
        
        logger.info("\n2. Aplicar estandarización (OPCIONAL):")
        logger.info("   python3 standardize-packages.py")
        
        logger.info("\n3. Comandos disponibles:")
        logger.info("   npm run standardize          # Estandarizar todo")
        logger.info("   npm run standardize:validate # Solo validar")
        logger.info("   npm run workspace:check      # Verificar estado")
        
        logger.info("\n📖 Documentación:")
        logger.info("   Ver: PACKAGE_AUTOMATION_README.md")
        
        logger.info("\n🔒 IMPORTANTE:")
        logger.info("   ✅ Tu configuración actual de 'type': 'module' se preserva")
        logger.info("   ✅ Scripts custom se mantienen")
        logger.info("   ✅ Solo se estandarizan diferencias menores")
        
        return True
    else:
        failed_steps = len(steps) - success_count
        logger.warning(f"⚠️  Instalación parcial: {failed_steps} pasos fallaron")
        logger.info("\n💡 Puedes intentar ejecutar manualmente:")
        logger.info("   python3 setup-package-automation.py")
        logger.info("   python3 test-package-standardization.py")
        return False

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        logger.info("\n⏹️  Instalación interrumpida")
        sys.exit(1)
    except Exception as e:
        logger.error(f"\n❌ Error fatal: {e}")
        sys.exit(1)