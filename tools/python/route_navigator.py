#!/usr/bin/env python3
"""
🧭 AltaMedica Route Navigator
Sistema Python para mapear y generar automáticamente todas las rutas de la aplicación
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
import fnmatch

@dataclass
class PageInfo:
    """Información de una página"""
    path: str
    route: str
    app: str
    title: str
    component_name: str
    is_dynamic: bool
    params: List[str]
    layout: Optional[str] = None
    auth_required: bool = False
    role_required: Optional[str] = None

@dataclass
class AppRoutes:
    """Rutas de una aplicación específica"""
    app_name: str
    base_url: str
    port: int
    pages: List[PageInfo]
    total_routes: int

class RouteNavigator:
    def __init__(self, workspace_root: str = None):
        self.workspace_root = Path(workspace_root or os.getcwd())
        self.apps_dir = self.workspace_root / "apps"
        self.routes_map: Dict[str, AppRoutes] = {}
        
        # Configuración de apps
        self.app_config = {
            "patients": {"base_url": "http://localhost:3003", "port": 3003},
            "doctors": {"base_url": "http://localhost:3002", "port": 3002},
            "admin": {"base_url": "http://localhost:3005", "port": 3005},
            "api-server": {"base_url": "http://localhost:3001", "port": 3001},
            "companies": {"base_url": "http://localhost:3004", "port": 3004},
            "web-app": {"base_url": "http://localhost:3000", "port": 3000}
        }
        
        print("🧭 Route Navigator inicializado")
        print(f"📁 Workspace: {self.workspace_root}")
        
    def scan_all_routes(self) -> Dict[str, AppRoutes]:
        """Escanea todas las rutas de todas las aplicaciones"""
        print("\n🔍 Escaneando todas las rutas...")
        
        for app_dir in self.apps_dir.iterdir():
            if app_dir.is_dir() and app_dir.name in self.app_config:
                print(f"\n📱 Analizando app: {app_dir.name}")
                routes = self._scan_app_routes(app_dir)
                self.routes_map[app_dir.name] = routes
                print(f"✅ {routes.total_routes} rutas encontradas en {app_dir.name}")
        
        return self.routes_map
    
    def _scan_app_routes(self, app_dir: Path) -> AppRoutes:
        """Escanea las rutas de una aplicación específica"""
        app_name = app_dir.name
        config = self.app_config[app_name]
        pages: List[PageInfo] = []
        
        # Buscar páginas en src/app (Next.js App Router)
        app_routes_dir = app_dir / "src" / "app"
        if app_routes_dir.exists():
            pages.extend(self._scan_nextjs_app_router(app_routes_dir, app_name))
        
        # Buscar páginas en src/pages (Next.js Pages Router)
        pages_dir = app_dir / "src" / "pages"
        if pages_dir.exists():
            pages.extend(self._scan_nextjs_pages_router(pages_dir, app_name))
            
        return AppRoutes(
            app_name=app_name,
            base_url=config["base_url"],
            port=config["port"],
            pages=pages,
            total_routes=len(pages)
        )
    
    def _scan_nextjs_app_router(self, app_dir: Path, app_name: str) -> List[PageInfo]:
        """Escanea rutas de Next.js App Router"""
        pages = []
        
        for page_file in app_dir.rglob("page.tsx"):
            relative_path = page_file.relative_to(app_dir)
            route_parts = list(relative_path.parts[:-1])  # Excluir 'page.tsx'
            
            # Construir la ruta
            if not route_parts:
                route = "/"
            else:
                route = "/" + "/".join(route_parts)
            
            # Detectar parámetros dinámicos
            is_dynamic = any('[' in part and ']' in part for part in route_parts)
            params = [part.strip('[]') for part in route_parts if '[' in part and ']' in part]
            
            # Leer metadatos del archivo
            title, auth_required, role_required = self._extract_page_metadata(page_file)
            
            page_info = PageInfo(
                path=str(page_file),
                route=route,
                app=app_name,
                title=title,
                component_name=self._generate_component_name(route_parts),
                is_dynamic=is_dynamic,
                params=params,
                auth_required=auth_required,
                role_required=role_required
            )
            
            pages.append(page_info)
        
        return pages
    
    def _scan_nextjs_pages_router(self, pages_dir: Path, app_name: str) -> List[PageInfo]:
        """Escanea rutas de Next.js Pages Router"""
        pages = []
        
        for page_file in pages_dir.rglob("*.tsx"):
            if page_file.name.startswith("_"):  # Excluir _app.tsx, _document.tsx
                continue
                
            relative_path = page_file.relative_to(pages_dir)
            route_parts = list(relative_path.parts)
            
            # Remover extensión
            route_parts[-1] = route_parts[-1].replace('.tsx', '')
            
            # Construir ruta
            if route_parts == ['index']:
                route = "/"
            else:
                route_parts = [part for part in route_parts if part != 'index']
                route = "/" + "/".join(route_parts) if route_parts else "/"
            
            # Detectar parámetros dinámicos
            is_dynamic = any('[' in part and ']' in part for part in route_parts)
            params = [part.strip('[]') for part in route_parts if '[' in part and ']' in part]
            
            # Leer metadatos
            title, auth_required, role_required = self._extract_page_metadata(page_file)
            
            page_info = PageInfo(
                path=str(page_file),
                route=route,
                app=app_name,
                title=title,
                component_name=self._generate_component_name(route_parts),
                is_dynamic=is_dynamic,
                params=params,
                auth_required=auth_required,
                role_required=role_required
            )
            
            pages.append(page_info)
        
        return pages
    
    def _extract_page_metadata(self, page_file: Path) -> Tuple[str, bool, Optional[str]]:
        """Extrae metadatos del archivo de página"""
        try:
            content = page_file.read_text(encoding='utf-8')
            
            # Buscar título
            title_match = re.search(r'title[\'"]?\s*[:=]\s*[\'"]([^\'"]+)[\'"]', content, re.IGNORECASE)
            title = title_match.group(1) if title_match else self._generate_title_from_path(page_file)
            
            # Buscar indicadores de autenticación
            auth_required = bool(re.search(r'(useAuth|requireAuth|authenticated|withAuth)', content, re.IGNORECASE))
            
            # Buscar requerimientos de rol
            role_match = re.search(r'role[\'"]?\s*[:=]\s*[\'"]([^\'"]+)[\'"]', content, re.IGNORECASE)
            role_required = role_match.group(1) if role_match else None
            
            return title, auth_required, role_required
            
        except Exception as e:
            print(f"⚠️ Error leyendo metadatos de {page_file}: {e}")
            return self._generate_title_from_path(page_file), False, None
    
    def _generate_title_from_path(self, page_file: Path) -> str:
        """Genera un título desde la ruta del archivo"""
        parts = page_file.parts
        if 'app' in parts:
            app_index = parts.index('app')
            route_parts = parts[app_index + 1:-1]  # Excluir 'app' y 'page.tsx'
        else:
            route_parts = parts[:-1]
        
        if not route_parts:
            return "Home"
        
        # Convertir a título legible
        title_parts = []
        for part in route_parts:
            if '[' in part and ']' in part:
                title_parts.append(part.strip('[]').replace('-', ' ').title())
            else:
                title_parts.append(part.replace('-', ' ').title())
        
        return " - ".join(title_parts)
    
    def _generate_component_name(self, route_parts: List[str]) -> str:
        """Genera el nombre del componente desde las partes de la ruta"""
        if not route_parts:
            return "HomePage"
        
        name_parts = []
        for part in route_parts:
            if '[' in part and ']' in part:
                name_parts.append(part.strip('[]').replace('-', '').title())
            else:
                name_parts.append(part.replace('-', '').title())
        
        return "".join(name_parts) + "Page"
    
    def generate_routes_config(self) -> str:
        """Genera archivo de configuración de rutas"""
        config = {
            "generated_at": str(self.workspace_root),
            "total_apps": len(self.routes_map),
            "total_routes": sum(app.total_routes for app in self.routes_map.values()),
            "apps": {
                app_name: asdict(app_routes) 
                for app_name, app_routes in self.routes_map.items()
            }
        }
        
        return json.dumps(config, indent=2, ensure_ascii=False)
    
    def generate_navigation_helper(self) -> str:
        """Genera helper de navegación en TypeScript"""
        typescript_code = '''// 🧭 Generado automáticamente por RouteNavigator
// No editar manualmente - se regenera automáticamente

export interface RouteInfo {
  path: string;
  title: string;
  app: string;
  requiresAuth: boolean;
  role?: string;
  params?: string[];
}

export interface AppInfo {
  name: string;
  baseUrl: string;
  port: number;
  routes: RouteInfo[];
}

// 📱 Configuración de aplicaciones
export const APPS: Record<string, AppInfo> = {
'''
        
        for app_name, app_routes in self.routes_map.items():
            typescript_code += f'''  {app_name}: {{
    name: "{app_name}",
    baseUrl: "{app_routes.base_url}",
    port: {app_routes.port},
    routes: [
'''
            
            for page in app_routes.pages:
                params_str = json.dumps(page.params) if page.params else "undefined"
                role_str = f'"{page.role_required}"' if page.role_required else "undefined"
                
                typescript_code += f'''      {{
        path: "{page.route}",
        title: "{page.title}",
        app: "{app_name}",
        requiresAuth: {str(page.auth_required).lower()},
        role: {role_str},
        params: {params_str}
      }},
'''
            
            typescript_code += '''    ]
  },
'''
        
        typescript_code += '''};

// 🔗 Helper functions
export const getAppUrl = (appName: string, route: string = "/"): string => {
  const app = APPS[appName];
  if (!app) throw new Error(`App ${appName} not found`);
  return `${app.baseUrl}${route}`;
};

export const getAllRoutes = (): RouteInfo[] => {
  return Object.values(APPS).flatMap(app => app.routes);
};

export const getRoutesByApp = (appName: string): RouteInfo[] => {
  return APPS[appName]?.routes || [];
};

export const findRoute = (path: string, appName?: string): RouteInfo | undefined => {
  const routes = appName ? getRoutesByApp(appName) : getAllRoutes();
  return routes.find(route => route.path === path);
};

export const getAuthenticatedRoutes = (): RouteInfo[] => {
  return getAllRoutes().filter(route => route.requiresAuth);
};

export const getRoutesByRole = (role: string): RouteInfo[] => {
  return getAllRoutes().filter(route => route.role === role);
};

// 📊 Estadísticas
export const getRoutesStats = () => {
  const allRoutes = getAllRoutes();
  return {
    totalApps: Object.keys(APPS).length,
    totalRoutes: allRoutes.length,
    authenticatedRoutes: allRoutes.filter(r => r.requiresAuth).length,
    dynamicRoutes: allRoutes.filter(r => r.params && r.params.length > 0).length,
    routesByApp: Object.entries(APPS).map(([name, app]) => ({
      app: name,
      count: app.routes.length
    }))
  };
};
'''
        
        return typescript_code
    
    def generate_markdown_report(self) -> str:
        """Genera reporte en Markdown"""
        total_routes = sum(app.total_routes for app in self.routes_map.values())
        
        markdown = f'''# 🧭 Mapa de Rutas AltaMedica

**Generado automáticamente por RouteNavigator**

## 📊 Resumen

- **Total de aplicaciones:** {len(self.routes_map)}
- **Total de rutas:** {total_routes}
- **Fecha de generación:** {Path.cwd()}

## 📱 Aplicaciones

'''
        
        for app_name, app_routes in self.routes_map.items():
            auth_routes = sum(1 for page in app_routes.pages if page.auth_required)
            dynamic_routes = sum(1 for page in app_routes.pages if page.is_dynamic)
            
            markdown += f'''### {app_name.title()}

- **URL Base:** {app_routes.base_url}
- **Puerto:** {app_routes.port}
- **Total de rutas:** {app_routes.total_routes}
- **Rutas autenticadas:** {auth_routes}
- **Rutas dinámicas:** {dynamic_routes}

#### Rutas disponibles:

| Ruta | Título | Autenticación | Rol | Parámetros |
|------|--------|---------------|-----|------------|
'''
            
            for page in sorted(app_routes.pages, key=lambda p: p.route):
                auth_icon = "🔒" if page.auth_required else "🔓"
                role_text = page.role_required or "-"
                params_text = ", ".join(page.params) if page.params else "-"
                
                markdown += f'| `{page.route}` | {page.title} | {auth_icon} | {role_text} | {params_text} |\n'
            
            markdown += '\n'
        
        return markdown
    
    def save_all_outputs(self):
        """Guarda todos los archivos generados"""
        output_dir = self.workspace_root / "tools" / "python" / "generated"
        output_dir.mkdir(exist_ok=True)
        
        # Guardar configuración JSON
        config_path = output_dir / "routes_config.json"
        config_path.write_text(self.generate_routes_config(), encoding='utf-8')
        print(f"✅ Configuración guardada: {config_path}")
        
        # Guardar helper TypeScript
        helper_path = output_dir / "navigation_helper.ts"
        helper_path.write_text(self.generate_navigation_helper(), encoding='utf-8')
        print(f"✅ Helper TypeScript guardado: {helper_path}")
        
        # Guardar reporte Markdown
        report_path = output_dir / "ROUTES_MAP.md"
        report_path.write_text(self.generate_markdown_report(), encoding='utf-8')
        print(f"✅ Reporte guardado: {report_path}")
        
        # Copiar helper a cada app
        self._copy_helper_to_apps(helper_path)
    
    def _copy_helper_to_apps(self, helper_path: Path):
        """Copia el helper de navegación a cada aplicación"""
        helper_content = helper_path.read_text(encoding='utf-8')
        
        for app_name in self.routes_map.keys():
            app_dir = self.apps_dir / app_name / "src" / "utils"
            app_dir.mkdir(exist_ok=True)
            
            app_helper_path = app_dir / "navigation.ts"
            app_helper_path.write_text(helper_content, encoding='utf-8')
            print(f"📋 Helper copiado a: {app_helper_path}")

def main():
    """Función principal"""
    print("🧭 AltaMedica Route Navigator")
    print("="*50)
    
    navigator = RouteNavigator()
    
    # Escanear todas las rutas
    routes_map = navigator.scan_all_routes()
    
    if not routes_map:
        print("❌ No se encontraron aplicaciones para escanear")
        return
    
    # Generar todos los archivos
    navigator.save_all_outputs()
    
    # Mostrar resumen
    total_routes = sum(app.total_routes for app in routes_map.values())
    print(f"\n🎯 Resumen final:")
    print(f"   📱 {len(routes_map)} aplicaciones escaneadas")
    print(f"   🔗 {total_routes} rutas totales encontradas")
    print(f"   📁 Archivos generados en tools/python/generated/")
    print(f"   📋 Helpers copiados a cada aplicación")
    
    print("\n✨ Sistema de navegación generado exitosamente!")
    print("\n📋 Archivos generados:")
    print("   • routes_config.json - Configuración completa")
    print("   • navigation_helper.ts - Helper TypeScript")
    print("   • ROUTES_MAP.md - Reporte legible")
    print("   • src/utils/navigation.ts en cada app")

if __name__ == "__main__":
    main()
