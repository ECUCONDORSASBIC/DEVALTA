"""
Instalador de dependencias para el sistema de videollamadas AltaMedica
"""

import subprocess
import sys
import os

def install_python_packages():
    """Instalar paquetes Python necesarios"""
    packages = [
        "fastapi",
        "uvicorn[standard]",
        "websockets",
        "requests",
        "python-jose[cryptography]",
        "python-multipart",
        "aiofiles",
        "jinja2"
    ]
    
    print("🐍 Instalando paquetes Python para videollamadas...")
    print("=" * 50)
    
    for package in packages:
        print(f"📦 Instalando {package}...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✅ {package} instalado correctamente")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error instalando {package}: {e}")
            return False
        print()
    
    return True

def check_python_version():
    """Verificar versión de Python"""
    version = sys.version_info
    print(f"🐍 Python versión: {version.major}.{version.minor}.{version.micro}")
    
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Se requiere Python 3.8 o superior")
        return False
    
    print("✅ Versión de Python compatible")
    return True

def create_start_script():
    """Crear script de inicio para el servidor de videollamadas"""
    start_script = """@echo off
echo 🏥 Iniciando servidor de videollamadas AltaMedica...
echo.
echo 📹 Servidor WebRTC en puerto 8888
echo 🌐 Interfaz web disponible en: http://localhost:8888
echo 👨‍⚕️ URL para doctores: http://localhost:3001 (Doctors App)
echo 👨‍🦱 URL para pacientes: http://localhost:3000 (Patients App)
echo.

python telemedicine_video_server.py

pause
"""
    
    with open("start-video-server.bat", "w", encoding="utf-8") as f:
        f.write(start_script)
    
    print("✅ Script de inicio creado: start-video-server.bat")

def create_requirements_file():
    """Crear archivo requirements.txt"""
    requirements = """fastapi>=0.104.1
uvicorn[standard]>=0.24.0
websockets>=12.0
requests>=2.31.0
python-jose[cryptography]>=3.3.0
python-multipart>=0.0.6
aiofiles>=23.2.1
jinja2>=3.1.2
"""
    
    with open("requirements-video.txt", "w") as f:
        f.write(requirements)
    
    print("✅ Archivo de requisitos creado: requirements-video.txt")

def main():
    print("🏥 AltaMedica - Instalador del Sistema de Videollamadas")
    print("=" * 60)
    print()
    
    # Verificar Python
    if not check_python_version():
        return
    print()
    
    # Crear archivo de requisitos
    create_requirements_file()
    print()
    
    # Instalar paquetes
    if not install_python_packages():
        print("❌ Error en la instalación de paquetes")
        return
    
    # Crear script de inicio
    create_start_script()
    print()
    
    print("🎉 ¡Instalación completada!")
    print("=" * 40)
    print()
    print("📋 Próximos pasos:")
    print("1. Ejecuta 'start-video-server.bat' para iniciar el servidor")
    print("2. Abre http://localhost:8888 para probar el sistema")
    print("3. Integra con las apps de Next.js usando video_call_client.py")
    print()
    print("🔧 Para desarrollo:")
    print("- Servidor de videollamadas: python telemedicine_video_server.py")
    print("- Cliente de prueba: python video_call_client.py")
    print()
    print("🌐 URLs de integración:")
    print("- API videollamadas: http://localhost:8888/api/")
    print("- WebSocket: ws://localhost:8888/ws/")
    print("- Interfaz web: http://localhost:8888/video-call/{room_id}")

if __name__ == "__main__":
    main()
