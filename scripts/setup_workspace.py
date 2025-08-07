#!/usr/bin/env python3
"""
🚀 AltaMedica Workspace Setup
Script de configuración inicial para el workspace de desarrollo
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from typing import Dict, List, Optional
import locale

# Configure proper encoding for Windows
if sys.platform == 'win32':
    # Force UTF-8 encoding for stdout/stderr
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

class WorkspaceSetup:
    def __init__(self):
        self.workspace_root = Path.cwd()
        self.setup_steps = []
        self.errors = []
        
    def log(self, message: str, level: str = "INFO"):
        """Log con emojis para mejor visibilidad"""
        emoji_map = {
            "INFO": "[INFO]",
            "SUCCESS": "[OK]", 
            "WARNING": "[WARN]",
            "ERROR": "[ERROR]",
            "SETUP": "[SETUP]"
        }
        try:
            # Try to use emojis if terminal supports it
            if sys.platform != 'win32' or os.environ.get('WT_SESSION'):
                emoji_map = {
                    "INFO": "ℹ️",
                    "SUCCESS": "✅", 
                    "WARNING": "⚠️",
                    "ERROR": "❌",
                    "SETUP": "🔧"
                }
            print(f"{emoji_map.get(level, '[INFO]')} {message}")
        except Exception:
            # Fallback to plain text
            print(f"{level}: {message}")
        
    def check_prerequisites(self) -> bool:
        """Verifica prerequisitos del sistema"""
        self.log("Verificando prerequisitos...", "SETUP")
        
        # Verificar Python
        python_version = sys.version_info
        if python_version.major < 3 or python_version.minor < 8:
            self.log("Se requiere Python 3.8 o superior", "ERROR")
            return False
        self.log(f"Python {python_version.major}.{python_version.minor} ✓", "SUCCESS")
        
        # Verificar Node.js y pnpm
        try:
            node_result = subprocess.run(["node", "--version"], capture_output=True, text=True)
            if node_result.returncode == 0:
                self.log(f"Node.js {node_result.stdout.strip()} ✓", "SUCCESS")
            else:
                self.log("Node.js no encontrado", "ERROR")
                return False
                
            pnpm_result = subprocess.run(["pnpm", "--version"], capture_output=True, text=True)
            if pnpm_result.returncode == 0:
                self.log(f"pnpm {pnpm_result.stdout.strip()} ✓", "SUCCESS")
            else:
                self.log("pnpm no encontrado", "ERROR")
                return False
                
        except FileNotFoundError:
            self.log("Node.js o pnpm no están instalados", "ERROR")
            return False
            
        return True
        
    def install_python_dependencies(self):
        """Instala dependencias Python necesarias"""
        self.log("Instalando dependencias Python...", "SETUP")
        
        python_deps = [
            "fastapi",
            "uvicorn",
            "requests", 
            "aiohttp",
            "python-multipart",
            "pydantic",
            "python-jose[cryptography]",
            "jinja2"
        ]
        
        for dep in python_deps:
            try:
                subprocess.run([sys.executable, "-m", "pip", "install", dep], 
                             check=True, capture_output=True)
                self.log(f"Instalado: {dep}", "SUCCESS")
            except subprocess.CalledProcessError:
                self.log(f"Error instalando: {dep}", "WARNING")
                
    def setup_directory_structure(self):
        """Crea estructura de directorios del workspace"""
        self.log("Configurando estructura de directorios...", "SETUP")
        
        directories = [
            "tools/python",
            "tools/scripts", 
            "config",
            "docs",
            "shared/hooks/api",
            "packages",
            "logs",
            "reports"
        ]
        
        for dir_path in directories:
            full_path = self.workspace_root / dir_path
            full_path.mkdir(parents=True, exist_ok=True)
            self.log(f"Directorio creado: {dir_path}", "SUCCESS")
            
    def create_env_file(self):
        """Crea archivo .env con configuraciones por defecto"""
        self.log("Creando archivo de configuración...", "SETUP")
        
        env_content = """# AltaMedica Workspace Configuration
WORKSPACE_ROOT=.
API_BRIDGE_PORT=9000
API_SERVER_URL=http://localhost:3001
PATIENTS_APP_URL=http://localhost:3003
DOCTORS_APP_URL=http://localhost:3002
COMPANIES_APP_URL=http://localhost:3004
ADMIN_APP_URL=http://localhost:3005
WEB_APP_URL=http://localhost:3000
VIDEO_SERVER_URL=http://localhost:8888

# Development Settings
NODE_ENV=development
PYTHON_ENV=development
DEBUG=true
ENABLE_CORS=true

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/workspace.log

# API Bridge Settings
BRIDGE_TIMEOUT=30
BRIDGE_RETRY_COUNT=3
HEALTH_CHECK_INTERVAL=60
"""
        
        env_path = self.workspace_root / ".env"
        with open(env_path, "w", encoding="utf-8") as f:
            f.write(env_content)
        self.log("Archivo .env creado", "SUCCESS")
        
    def create_gitignore(self):
        """Crea/actualiza .gitignore con patrones del workspace"""
        self.log("Configurando .gitignore...", "SETUP")
        
        gitignore_content = """
# Workspace specific
logs/
reports/
*.pyc
__pycache__/
.env.local
.vscode/settings.json

# Python
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
env.bak/
venv.bak/
pip-log.txt
pip-delete-this-directory.txt

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*
dist/
.next/

# IDEs
.vscode/launch.json
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
"""
        
        gitignore_path = self.workspace_root / ".gitignore"
        
        # Leer contenido existente si existe
        existing_content = ""
        if gitignore_path.exists():
            with open(gitignore_path, "r", encoding="utf-8") as f:
                existing_content = f.read()
                
        # Solo agregar si no existe ya
        if "# Workspace specific" not in existing_content:
            with open(gitignore_path, "a", encoding="utf-8") as f:
                f.write(gitignore_content)
            self.log(".gitignore actualizado", "SUCCESS")
        else:
            self.log(".gitignore ya configurado", "INFO")
            
    def install_recommended_extensions(self):
        """Lista las extensiones recomendadas para instalar"""
        self.log("Extensiones recomendadas para VS Code:", "INFO")
        
        extensions = [
            "ms-vscode.vscode-typescript-next - TypeScript avanzado",
            "ms-python.python - Soporte Python completo", 
            "ms-python.debugpy - Debug Python",
            "esbenp.prettier-vscode - Formateo de código",
            "dbaeumer.vscode-eslint - Linting JavaScript/TypeScript",
            "bradlc.vscode-tailwindcss - TailwindCSS",
            "humao.rest-client - Testing de APIs"
        ]
        
        print("\nPara instalar automaticamente, ejecuta:")
        for ext in extensions:
            ext_id = ext.split(" - ")[0]
            print(f"   code --install-extension {ext_id}")
            
    def validate_workspace_structure(self) -> bool:
        """Valida que la estructura del workspace esté correcta"""
        self.log("Validando estructura del workspace...", "SETUP")
        
        required_files = [
            "package.json",
            "pnpm-workspace.yaml",
            "altamedica-api-workspace.code-workspace"
        ]
        
        required_dirs = [
            "apps",
            "tools/python"
        ]
        
        all_valid = True
        
        for file_path in required_files:
            if not (self.workspace_root / file_path).exists():
                self.log(f"Archivo requerido no encontrado: {file_path}", "WARNING")
                all_valid = False
            else:
                self.log(f"Archivo encontrado: {file_path}", "SUCCESS")
                
        for dir_path in required_dirs:
            if not (self.workspace_root / dir_path).exists():
                self.log(f"Directorio requerido no encontrado: {dir_path}", "WARNING") 
                all_valid = False
            else:
                self.log(f"Directorio encontrado: {dir_path}", "SUCCESS")
                
        return all_valid
        
    def run_setup(self):
        """Ejecuta el setup completo del workspace"""
        self.log("Iniciando setup del workspace AltaMedica...", "SETUP")
        
        if not self.check_prerequisites():
            self.log("Prerequisites no cumplidos. Setup cancelado.", "ERROR")
            return False
            
        try:
            self.setup_directory_structure()
            self.install_python_dependencies()
            self.create_env_file()
            self.create_gitignore()
            
            if self.validate_workspace_structure():
                self.log("Setup del workspace completado exitosamente!", "SUCCESS")
                self.log("Lee WORKSPACE_README.md para mas informacion", "INFO")
                self.install_recommended_extensions()
                return True
            else:
                self.log("Setup completado con advertencias", "WARNING")
                return True
                
        except Exception as e:
            self.log(f"Error durante el setup: {str(e)}", "ERROR")
            return False

def main():
    """Función principal"""
    setup = WorkspaceSetup()
    success = setup.run_setup()
    
    if success:
        print("\nWorkspace listo para usar!")
        print("Proximos pasos:")
        print("   1. Abrir altamedica-api-workspace.code-workspace en VS Code")
        print("   2. Ejecutar tarea 'Complete Setup'")
        print("   3. Ejecutar tarea 'Start All Services'")
        print("   4. Comenzar a desarrollar!")
    else:
        print("\nSetup incompleto. Revisa los errores arriba.")
        sys.exit(1)

if __name__ == "__main__":
    main()
