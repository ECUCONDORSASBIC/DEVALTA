#!/usr/bin/env python3
"""
🌐 URL Manager - Sistema completo de gestión de URLs
Añade URLs completas al sistema de navegación existente
"""

import os
import json
import webbrowser
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
import subprocess
import time

@dataclass
class URLInfo:
    """Información completa de una URL"""
    name: str
    url: str
    app: str
    route: str
    description: str
    status: str = "unknown"  # active, inactive, error
    requires_auth: bool = False
    role_required: Optional[str] = None

class URLManager:
    def __init__(self, workspace_root: str = None):
        self.workspace_root = Path(workspace_root or os.getcwd())
        self.routes_config_path = self.workspace_root / "tools" / "python" / "generated" / "routes_config.json"
        self.urls: Dict[str, List[URLInfo]] = {}
        
        print("🌐 URL Manager inicializado")
        print(f"📁 Workspace: {self.workspace_root}")
        
        # Cargar configuración de rutas existente
        self._load_routes_config()
        
    def _load_routes_config(self):
        """Carga la configuración de rutas generada por RouteNavigator"""
        if self.routes_config_path.exists():
            try:
                with open(self.routes_config_path, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                    self._process_routes_config(config)
                print("✅ Configuración de rutas cargada")
            except Exception as e:
                print(f"⚠️ Error cargando configuración: {e}")
        else:
            print("⚠️ Configuración de rutas no encontrada. Ejecuta route_navigator.py primero")
    
    def _process_routes_config(self, config: dict):
        """Procesa la configuración de rutas para generar URLs"""
        apps = config.get('apps', {})
        
        for app_name, app_info in apps.items():
            self.urls[app_name] = []
            base_url = app_info.get('base_url', f'http://localhost:3000')
            
            for page in app_info.get('pages', []):
                url_info = URLInfo(
                    name=f"{app_name.title()} - {page.get('title', 'Page')}",
                    url=f"{base_url}{page.get('route', '/')}",
                    app=app_name,
                    route=page.get('route', '/'),
                    description=page.get('title', 'No description'),
                    requires_auth=page.get('auth_required', False),
                    role_required=page.get('role_required')
                )
                self.urls[app_name].append(url_info)
    
    def check_url_status(self, url: str, timeout: int = 5) -> str:
        """Verifica el estado de una URL"""
        try:
            import requests
            response = requests.get(url, timeout=timeout)
            if response.status_code == 200:
                return "active"
            elif response.status_code in [401, 403]:
                return "auth_required"
            else:
                return "error"
        except ImportError:
            # Si requests no está disponible, usar curl
            try:
                result = subprocess.run(
                    ['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', url],
                    capture_output=True, text=True, timeout=timeout
                )
                status_code = result.stdout.strip()
                if status_code == '200':
                    return "active"
                elif status_code in ['401', '403']:
                    return "auth_required"
                else:
                    return "error"
            except:
                return "unknown"
        except:
            return "inactive"
    
    def check_all_urls(self):
        """Verifica el estado de todas las URLs"""
        print("\n🔍 Verificando estado de URLs...")
        
        total_urls = sum(len(urls) for urls in self.urls.values())
        current = 0
        
        for app_name, urls in self.urls.items():
            print(f"\n📱 Verificando {app_name}...")
            
            for url_info in urls:
                current += 1
                print(f"   [{current}/{total_urls}] {url_info.name}... ", end="", flush=True)
                
                status = self.check_url_status(url_info.url)
                url_info.status = status
                
                status_emoji = {
                    "active": "✅",
                    "inactive": "❌", 
                    "error": "⚠️",
                    "auth_required": "🔒",
                    "unknown": "❓"
                }.get(status, "❓")
                
                print(f"{status_emoji} {status}")
    
    def open_url(self, app: str, route: str = "/"):
        """Abre una URL específica en el navegador"""
        if app not in self.urls:
            print(f"❌ App '{app}' no encontrada")
            return False
        
        # Buscar la ruta específica
        target_url = None
        for url_info in self.urls[app]:
            if url_info.route == route:
                target_url = url_info.url
                break
        
        if not target_url:
            # Si no se encuentra la ruta exacta, usar la primera URL del app
            if self.urls[app]:
                target_url = self.urls[app][0].url
            else:
                print(f"❌ No hay URLs disponibles para '{app}'")
                return False
        
        print(f"🌐 Abriendo: {target_url}")
        webbrowser.open(target_url)
        return True
    
    def list_urls(self, app: Optional[str] = None, status_filter: Optional[str] = None):
        """Lista URLs con filtros opcionales"""
        if app:
            apps_to_show = {app: self.urls.get(app, [])}
        else:
            apps_to_show = self.urls
        
        print(f"\n🌐 URLs Disponibles:")
        print("=" * 80)
        
        for app_name, urls in apps_to_show.items():
            if not urls:
                continue
                
            # Filtrar por status si se especifica
            if status_filter:
                urls = [u for u in urls if u.status == status_filter]
                if not urls:
                    continue
            
            print(f"\n📱 {app_name.upper()}")
            print("-" * 40)
            
            for url_info in urls:
                status_emoji = {
                    "active": "✅",
                    "inactive": "❌", 
                    "error": "⚠️",
                    "auth_required": "🔒",
                    "unknown": "❓"
                }.get(url_info.status, "❓")
                
                auth_info = ""
                if url_info.requires_auth:
                    role = f" ({url_info.role_required})" if url_info.role_required else ""
                    auth_info = f" 🔐{role}"
                
                print(f"  {status_emoji} {url_info.name}{auth_info}")
                print(f"      {url_info.url}")
                print(f"      {url_info.description}")
                print()
    
    def generate_url_shortcuts(self):
        """Genera archivos de acceso directo para URLs importantes"""
        shortcuts_dir = self.workspace_root / "shortcuts"
        shortcuts_dir.mkdir(exist_ok=True)
        
        print(f"\n🔗 Generando shortcuts en: {shortcuts_dir}")
        
        # URLs principales de cada app
        main_urls = [
            ("patients", "/", "Pacientes - Dashboard"),
            ("doctors", "/", "Doctores - Dashboard"), 
            ("admin", "/", "Admin - Dashboard"),
            ("api-server", "/dashboard", "API Server - Monitor"),
            ("companies", "/", "Empresas - Portal"),
            ("web-app", "/", "Web App - Principal")
        ]
        
        for app, route, name in main_urls:
            if app in self.urls:
                url_info = next((u for u in self.urls[app] if u.route == route), None)
                if url_info:
                    # Crear archivo .url para Windows
                    shortcut_path = shortcuts_dir / f"{name.replace(' - ', '_').replace(' ', '_')}.url"
                    with open(shortcut_path, 'w') as f:
                        f.write(f"[InternetShortcut]\n")
                        f.write(f"URL={url_info.url}\n")
                        f.write(f"IconIndex=0\n")
                    
                    print(f"✅ Creado: {shortcut_path.name}")
        
        # Crear HTML con todas las URLs
        html_path = shortcuts_dir / "AltaMedica_URLs.html"
        self._generate_html_dashboard(html_path)
        print(f"✅ Dashboard HTML: {html_path.name}")
    
    def _generate_html_dashboard(self, html_path: Path):
        """Genera un dashboard HTML con todas las URLs"""
        html_content = '''<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AltaMedica - Dashboard de URLs</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
        }
        .header h1 {
            font-size: 3em;
            margin: 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .apps-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
        }
        .app-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s ease;
        }
        .app-card:hover {
            transform: translateY(-5px);
        }
        .app-title {
            font-size: 1.5em;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        .app-icon {
            font-size: 1.5em;
            margin-right: 10px;
        }
        .url-link {
            display: block;
            padding: 12px 15px;
            margin: 8px 0;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            text-decoration: none;
            color: #333;
            transition: all 0.3s ease;
        }
        .url-link:hover {
            background: #e9ecef;
            border-color: #007bff;
            transform: translateX(5px);
        }
        .url-title {
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .url-description {
            font-size: 0.9em;
            color: #666;
            margin-top: 5px;
        }
        .status-badge {
            font-size: 0.8em;
            padding: 2px 8px;
            border-radius: 12px;
            font-weight: 500;
        }
        .status-active { background: #d4edda; color: #155724; }
        .status-inactive { background: #f8d7da; color: #721c24; }
        .status-auth { background: #fff3cd; color: #856404; }
        .status-unknown { background: #e2e3e5; color: #383d41; }
        .footer {
            text-align: center;
            color: white;
            margin-top: 40px;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 AltaMedica</h1>
            <p>Dashboard de URLs - Navegación Centralizada</p>
        </div>
        
        <div class="apps-grid">
'''
        
        app_icons = {
            'patients': '🧑‍⚕️',
            'doctors': '👨‍⚕️', 
            'admin': '⚙️',
            'api-server': '🔧',
            'companies': '🏢',
            'web-app': '🌐'
        }
        
        for app_name, urls in self.urls.items():
            if not urls:
                continue
                
            icon = app_icons.get(app_name, '📱')
            html_content += f'''
            <div class="app-card">
                <div class="app-title">
                    <span class="app-icon">{icon}</span>
                    {app_name.title()}
                </div>
'''
            
            for url_info in urls:
                status_class = {
                    "active": "status-active",
                    "inactive": "status-inactive",
                    "auth_required": "status-auth",
                    "unknown": "status-unknown"
                }.get(url_info.status, "status-unknown")
                
                status_text = {
                    "active": "✅ Activo",
                    "inactive": "❌ Inactivo", 
                    "auth_required": "🔒 Auth",
                    "unknown": "❓ Desconocido"
                }.get(url_info.status, "❓")
                
                html_content += f'''
                <a href="{url_info.url}" class="url-link" target="_blank">
                    <div class="url-title">
                        {url_info.description}
                        <span class="status-badge {status_class}">{status_text}</span>
                    </div>
                    <div class="url-description">{url_info.url}</div>
                </a>
'''
            
            html_content += '            </div>\n'
        
        html_content += '''
        </div>
        
        <div class="footer">
            <p>🐍 Generado automáticamente por Python URL Manager</p>
            <p>Actualizado: ''' + time.strftime("%Y-%m-%d %H:%M:%S") + '''</p>
        </div>
    </div>
</body>
</html>'''
        
        html_path.write_text(html_content, encoding='utf-8')
    
    def save_urls_config(self):
        """Guarda la configuración de URLs"""
        output_dir = self.workspace_root / "tools" / "python" / "generated"
        output_dir.mkdir(exist_ok=True)
        
        urls_config = {
            "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "total_apps": len(self.urls),
            "total_urls": sum(len(urls) for urls in self.urls.values()),
            "urls": {
                app_name: [asdict(url) for url in urls]
                for app_name, urls in self.urls.items()
            }
        }
        
        config_path = output_dir / "urls_config.json"
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(urls_config, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Configuración de URLs guardada: {config_path}")

def main():
    """Función principal"""
    print("🌐 AltaMedica URL Manager")
    print("=" * 50)
    
    manager = URLManager()
    
    if not manager.urls:
        print("\n❌ No se encontraron URLs.")
        print("💡 Ejecuta primero: python tools/python/route_navigator.py")
        return
    
    # Verificar estado de URLs
    manager.check_all_urls()
    
    # Listar URLs
    manager.list_urls()
    
    # Generar shortcuts
    manager.generate_url_shortcuts()
    
    # Guardar configuración
    manager.save_urls_config()
    
    # Resumen final
    total_urls = sum(len(urls) for urls in manager.urls.values())
    active_urls = sum(1 for urls in manager.urls.values() for url in urls if url.status == "active")
    
    print(f"\n🎯 Resumen:")
    print(f"   🌐 {total_urls} URLs totales")
    print(f"   ✅ {active_urls} URLs activas")
    print(f"   📱 {len(manager.urls)} aplicaciones")
    print(f"   🔗 Shortcuts creados en: shortcuts/")
    print(f"   📄 Dashboard HTML: shortcuts/AltaMedica_URLs.html")
    
    # Preguntar si abrir dashboard
    try:
        print(f"\n🌐 ¿Abrir dashboard HTML? (y/N): ", end="")
        response = input().strip().lower()
        if response in ['y', 'yes', 's', 'si']:
            html_path = manager.workspace_root / "shortcuts" / "AltaMedica_URLs.html"
            webbrowser.open(f"file://{html_path.absolute()}")
            print("🌐 Dashboard abierto en el navegador")
    except KeyboardInterrupt:
        print("\n👋 ¡Hasta luego!")

if __name__ == "__main__":
    main()
