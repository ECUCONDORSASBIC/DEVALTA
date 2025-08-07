#!/usr/bin/env python3
"""
🧹 Real Architecture Cleaner - Limpieza que realmente funciona
"""

import os
import shutil
from pathlib import Path

class RealCleaner:
    def __init__(self):
        self.workspace = Path("c:/Users/Eduardo/Documents/devaltamedica")
        
    def create_directories(self):
        """Crea los directorios necesarios"""
        dirs = [
            "tools/python",
            "tools/scripts", 
            "config/environments",
            "docs/guides",
            "archive/logs",
            "archive/data"
        ]
        
        for dir_path in dirs:
            full_path = self.workspace / dir_path
            full_path.mkdir(parents=True, exist_ok=True)
            print(f"📂 {dir_path}")
    
    def move_files_real(self):
        """Mueve archivos realmente"""
        
        # Archivos que mantener en root
        keep_files = {
            'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml',
            'tsconfig.json', 'README.md', '.gitignore', '.env',
            'docker-compose.yml', 'Dockerfile', 'firebase.json',
            'RESUMEN_FINAL_COMPLETO.md'
        }
        
        moves = {
            # Python scripts
            "tools/python": [
                "api_cleanup_analyzer.py", "api_discovery_hub.py", "api_organizer.py",
                "architecture_cleaner.py", "auto_api_tester.py", "auto_login_tester.py",
                "check-servers.py", "cleanup_script.py", "deep_api_hunter.py",
                "demo_video_call.py", "execute_ps.py", "generate_login_urls.py",
                "install_video_system.py", "install-package-standardization.py",
                "launcher.py", "medical_analytics_server.py", "medical_matching_engine.py",
                "quick_api_mapper.py", "quick_test_links.py", "simple_architecture_cleaner.py",
                "simple_fast_api_finder.py", "sso-auth-proxy.py", "start-servers.py",
                "start_video_server.py", "telemedicine_video_server.py",
                "test-package-standardization.py", "test_flow_manager.py",
                "test_video_simple.py", "turbo_api_scanner.py", "video_call_client.py"
            ],
            
            # Scripts
            "tools/scripts": [
                "build-packages.bat", "build.bat", "debug-patients-imports.bat",
                "execute-now.cmd", "fix-nextjs-build-error.bat", "fix-sso-dependencies.bat",
                "install-proxy-deps.bat", "launch_video_system.bat", "PRUEBA-FINAL-VIDEOLLAMADAS.bat",
                "quick-fix-patients.bat", "restart-patients-app.bat", "start-altamedica.bat",
                "start-patients-app.bat", "start-services.bat", "start-sistema-completo-con-analytics.bat",
                "start-sso-proxy-production.bat", "start-sso-proxy-simple.bat", "start-sso-proxy.bat",
                "start-telemedicine-system.bat", "start-video-server.bat", "start-videollamadas-completo.bat",
                "test-video-system.bat", ".eslintrc.security.js", "auditoria-sso-automatica.js",
                "claude-integration.js", "execute-autonomous-update.js", "execute-updates.js",
                "launcher-fixed.js", "launcher.js", "medical-compliance-monitor.js",
                "notification-system.js", "quick-test-telemedicine.js", "setup-sso-proxy.js",
                "simple-sso-proxy.js", "sso-proxy-production.js", "sso-proxy-server.js",
                "sso-proxy-simple.js", "sso-proxy-solution.js", "start-with-proxy.js",
                "test-es-modules.js", "test-integration.js", "test-telemedicine-integration.js",
                "webhook-notification-test.js", "cleanup_architecture.ps1"
            ],
            
            # Configs
            "config/environments": [
                ".env.docker", ".env.example", ".env.local", ".gemini-config.json",
                "api-config.ts", "claude_desktop_config.json", "clean_api_config.ts",
                "ecosystem.config.cjs", "eslint.config.js", "frontend_api_config.json",
                "gemini-claude-config.json", "gemini-config-with-claude.json",
                "jest.config.cjs", "organized_api_config.ts", "package-template-config.json",
                "simple_api_config.ts", "tsconfig.tsbuildinfo", "turbo_api_config.ts"
            ],
            
            # Logs
            "archive/logs": [
                "altamedica-notifications.log", "auth_deep_analysis.log", "firestore-debug.log",
                "login-filled.png", "login-final.png", "login-initial.png",
                "sso-auth-proxy.log", "test-notifications.log"
            ],
            
            # Data
            "archive/data": [
                "altamedica-alerts.json", "audit_report_20250731_070051.json",
                "auth_quick_check_20250803_113440.txt", "auth_quick_check_20250803_113711.txt",
                "auth_quick_check_20250803_114022.txt", "auth_quick_check_20250803_114153.txt",
                "claude-commands.json", "cleanup_analysis.json", "diagnostico_altamedica_20250731_071828.json",
                "fast_api_results.json", "firestore.indexes.json", "medical-compliance-report.json",
                "organized_apis.json", "requirements-video.txt", "turbo_scan_results.json",
                "webhook-delivery-report.json", "architecture_plan.json"
            ]
        }
        
        moved_count = 0
        
        for target_dir, files in moves.items():
            target_path = self.workspace / target_dir
            target_path.mkdir(parents=True, exist_ok=True)
            
            print(f"\n📁 → {target_dir}")
            
            for filename in files:
                source = self.workspace / filename
                if source.exists() and filename not in keep_files:
                    try:
                        dest = target_path / filename
                        shutil.move(str(source), str(dest))
                        print(f"   ✅ {filename}")
                        moved_count += 1
                    except Exception as e:
                        print(f"   ❌ Error moviendo {filename}: {e}")
                else:
                    if filename not in keep_files:
                        print(f"   ⚠️  {filename} no encontrado")
        
        return moved_count
    
    def clean_remaining_files(self):
        """Limpia archivos restantes que no son esenciales"""
        
        # Archivos para eliminar definitivamente
        files_to_delete = [
            "📹", "not staged for commit", "tash list", "git",
            "ersEduardoDocumentsdevaltamedica git status",
            "env.example", "proxy-package.json", "package.json.backup",
            "quick-dev.sh", "frontend-integration-example.ts",
            "videoCall-integration.ts", "api_test_report.html",
            "dashboard.html", "test-sso-client.html", "test-sso-production-client.html",
            "test-video-call.html"
        ]
        
        deleted_count = 0
        print(f"\n🗑️  Eliminando archivos innecesarios:")
        
        for filename in files_to_delete:
            file_path = self.workspace / filename
            if file_path.exists():
                try:
                    if file_path.is_file():
                        file_path.unlink()
                    elif file_path.is_dir():
                        shutil.rmtree(file_path)
                    print(f"   🗑️  {filename}")
                    deleted_count += 1
                except Exception as e:
                    print(f"   ❌ Error eliminando {filename}: {e}")
        
        return deleted_count
    
    def run_real_cleanup(self):
        """Ejecuta la limpieza real"""
        print("🧹 LIMPIEZA REAL DE ARQUITECTURA")
        print("=" * 40)
        
        # 1. Crear directorios
        print("\n📁 Creando directorios...")
        self.create_directories()
        
        # 2. Mover archivos
        print("\n📦 Moviendo archivos...")
        moved = self.move_files_real()
        
        # 3. Eliminar archivos innecesarios
        deleted = self.clean_remaining_files()
        
        # 4. Verificar resultado
        remaining_files = list(self.workspace.glob("*"))
        remaining_files = [f for f in remaining_files if f.is_file()]
        
        print(f"\n📊 RESULTADO REAL:")
        print("=" * 20)
        print(f"📦 Archivos movidos: {moved}")
        print(f"🗑️  Archivos eliminados: {deleted}")
        print(f"📁 Archivos restantes en root: {len(remaining_files)}")
        
        print(f"\n✅ ARCHIVOS RESTANTES EN ROOT:")
        for file_path in sorted(remaining_files):
            print(f"   📄 {file_path.name}")
        
        return moved, deleted, len(remaining_files)

def main():
    cleaner = RealCleaner()
    moved, deleted, remaining = cleaner.run_real_cleanup()
    
    print(f"\n🎯 LIMPIEZA COMPLETADA REALMENTE:")
    print(f"✅ {moved} archivos organizados")
    print(f"🗑️  {deleted} archivos eliminados")
    print(f"📌 {remaining} archivos esenciales en root")

if __name__ == "__main__":
    main()
