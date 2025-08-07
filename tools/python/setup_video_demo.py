#!/usr/bin/env python3
"""
🛠️ Instalador de dependencias para Video Demo Generator
"""

import subprocess
import sys
import os
from pathlib import Path

def install_dependencies():
    """Instala todas las dependencias necesarias"""
    
    print("🛠️ Instalando dependencias para Video Demo Generator...")
    
    # Dependencias Python
    python_deps = [
        "playwright==1.40.0",
        "pyttsx3==2.90",
        "Pillow==10.0.1",
        "opencv-python==4.8.1.78"
    ]
    
    print("\n📦 Instalando dependencias Python...")
    for dep in python_deps:
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", dep], 
                         check=True, capture_output=True)
            print(f"✅ Instalado: {dep}")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error instalando {dep}: {e}")
    
    # Instalar browsers de Playwright
    print("\n🌐 Instalando browsers de Playwright...")
    try:
        subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], 
                     check=True, capture_output=True)
        print("✅ Chromium instalado")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error instalando Chromium: {e}")
    
    # Verificar FFmpeg
    print("\n🎬 Verificando FFmpeg...")
    try:
        result = subprocess.run(["ffmpeg", "-version"], 
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            print("✅ FFmpeg encontrado")
        else:
            print("❌ FFmpeg no funciona correctamente")
            print_ffmpeg_installation()
    except (subprocess.TimeoutExpired, FileNotFoundError):
        print("❌ FFmpeg no encontrado")
        print_ffmpeg_installation()
    
    print("\n✅ Instalación completada!")

def print_ffmpeg_installation():
    """Muestra instrucciones para instalar FFmpeg"""
    print("\n📋 Para instalar FFmpeg:")
    
    if os.name == 'nt':  # Windows
        print("   Windows:")
        print("   1. Descargar de: https://ffmpeg.org/download.html")
        print("   2. Extraer y agregar al PATH")
        print("   3. O usar: winget install ffmpeg")
        print("   4. O usar: choco install ffmpeg")
    else:  # Linux/Mac
        print("   Linux: sudo apt install ffmpeg")
        print("   Mac: brew install ffmpeg")

def create_demo_launcher():
    """Crea un launcher fácil de usar"""
    
    launcher_content = '''@echo off
echo 🎬 AltaMedica Video Demo Generator
echo ===================================

echo 📋 Verificando servicios...
curl -s http://localhost:3003/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Patients app no está ejecutándose en puerto 3003
    echo    Ejecuta: pnpm --filter patients dev
    pause
    exit /b 1
)

curl -s http://localhost:3002/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Doctors app no está ejecutándose en puerto 3002
    echo    Ejecuta: pnpm --filter doctors dev
    pause
    exit /b 1
)

echo ✅ Servicios verificados

echo 🚀 Iniciando generador de video...
python tools/python/video_demo_generator.py

pause
'''
    
    launcher_path = Path("launch_video_demo.bat")
    launcher_path.write_text(launcher_content, encoding='utf-8')
    print(f"🚀 Launcher creado: {launcher_path}")

if __name__ == "__main__":
    install_dependencies()
    create_demo_launcher()
    
    print("\n🎯 Todo listo para crear videos!")
    print("🚀 Ejecuta: python tools/python/video_demo_generator.py")
    print("🚀 O usa: launch_video_demo.bat")
