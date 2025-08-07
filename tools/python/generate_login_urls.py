#!/usr/bin/env python3
"""
AltaMedica SSO - Generador de URLs de Login con Redirección
Script para generar enlaces de login con parámetros de redirección automática
"""

import urllib.parse
import webbrowser
import sys
from datetime import datetime

# Configuración de URLs base
WEB_APP_URL = "http://localhost:3000"
PROXY_SIMPLE_URL = "http://localhost:9000"
PROXY_PRODUCTION_URL = "http://localhost:9001"

# Configuración de aplicaciones
APPLICATIONS = {
    "web-app": {
        "url": "http://localhost:3000",
        "name": "Web App Principal",
        "icon": "🌐",
        "description": "Aplicación web principal de AltaMedica"
    },
    "api-server": {
        "url": "http://localhost:3001", 
        "name": "API Server",
        "icon": "🔧",
        "description": "Servidor de API y servicios backend"
    },
    "doctors": {
        "url": "http://localhost:3002",
        "name": "Doctors App",
        "icon": "👨‍⚕️", 
        "description": "Aplicación para médicos y profesionales"
    },
    "patients": {
        "url": "http://localhost:3003",
        "name": "Patients App", 
        "icon": "👨‍🦱",
        "description": "Aplicación para pacientes"
    },
    "companies": {
        "url": "http://localhost:3004",
        "name": "Companies App",
        "icon": "🏢",
        "description": "Aplicación para empresas y organizaciones"
    },
    "admin": {
        "url": "http://localhost:3005",
        "name": "Admin Panel",
        "icon": "⚙️",
        "description": "Panel de administración del sistema"
    }
}

# Usuarios de testing
TEST_USERS = {
    "patient": {
        "email": "paciente.test@email.com",
        "password": "Patient123!",
        "role": "patient",
        "name": "Paciente Test",
        "target_app": "patients"
    },
    "doctor": {
        "email": "dr.martinez@altamedica.com", 
        "password": "Doctor123!",
        "role": "doctor",
        "name": "Dr. Martínez",
        "target_app": "doctors"
    },
    "company": {
        "email": "empresa@altamedica.com",
        "password": "Company123!",
        "role": "company", 
        "name": "Empresa Test",
        "target_app": "companies"
    },
    "admin": {
        "email": "admin@altamedica.com",
        "password": "Admin123!",
        "role": "admin",
        "name": "Admin Test", 
        "target_app": "admin"
    }
}

def encode_url(url):
    """Codifica una URL para usar como parámetro de redirección"""
    return urllib.parse.quote(url, safe='')

def generate_login_url(redirect_to, proxy_type="web-app", role=None):
    """
    Genera URL de login con parámetros de redirección
    
    Args:
        redirect_to: URL de destino después del login
        proxy_type: "web-app", "proxy-simple", "proxy-production" 
        role: rol del usuario (opcional)
    """
    # Determinar URL base según el tipo de proxy
    if proxy_type == "web-app":
        base_url = f"{WEB_APP_URL}/login"
    elif proxy_type == "proxy-simple":
        base_url = f"{PROXY_SIMPLE_URL}/auth/login"
    elif proxy_type == "proxy-production":
        base_url = f"{PROXY_PRODUCTION_URL}/auth/login"
    else:
        base_url = f"{WEB_APP_URL}/login"
    
    # Codificar URL de redirección
    encoded_redirect = encode_url(redirect_to)
    
    # Construir URL completa
    params = [f"redirect={encoded_redirect}"]
    
    if role:
        params.append(f"role={role}")
    
    if params:
        login_url = f"{base_url}?{'&'.join(params)}"
    else:
        login_url = base_url
        
    return login_url

def print_header():
    """Imprime el header del script"""
    print("=" * 80)
    print("🏥 AltaMedica SSO - Generador de URLs de Login")
    print("=" * 80)
    print(f"⏰ Generado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

def print_applications():
    """Muestra todas las aplicaciones disponibles"""
    print("📱 APLICACIONES DISPONIBLES:")
    print("-" * 50)
    
    for app_key, app_info in APPLICATIONS.items():
        print(f"{app_info['icon']} {app_info['name']}")
        print(f"   URL: {app_info['url']}")
        print(f"   📝 {app_info['description']}")
        print()

def generate_all_urls():
    """Genera URLs para todas las combinaciones posibles"""
    print("🔗 URLS DE LOGIN GENERADAS:")
    print("=" * 80)
    
    for proxy_name, proxy_desc in [
        ("web-app", "Web App Login"),
        ("proxy-simple", "Proxy Simple (Testing)"),
        ("proxy-production", "Proxy Production (Firebase)")
    ]:
        print(f"\n📍 {proxy_desc.upper()}")
        print("-" * 60)
        
        for app_key, app_info in APPLICATIONS.items():
            redirect_url = app_info['url']
            login_url = generate_login_url(redirect_url, proxy_name)
            
            print(f"{app_info['icon']} {app_info['name']}:")
            print(f"   {login_url}")
            print()

def generate_user_specific_urls():
    """Genera URLs específicas por tipo de usuario"""
    print("👤 URLS POR TIPO DE USUARIO:")
    print("=" * 80)
    
    for user_key, user_info in TEST_USERS.items():
        print(f"\n{user_info['name']} ({user_info['role'].upper()})")
        print("-" * 40)
        print(f"📧 Email: {user_info['email']}")
        print(f"🔑 Password: {user_info['password']}")
        
        # URL para la aplicación objetivo del usuario
        target_app = APPLICATIONS[user_info['target_app']]
        target_url = target_app['url']
        
        print(f"🎯 Aplicación objetivo: {target_app['icon']} {target_app['name']}")
        print()
        
        # Generar URLs para cada tipo de proxy
        for proxy_name, proxy_desc in [
            ("web-app", "Web App"),
            ("proxy-simple", "Proxy Simple"),
            ("proxy-production", "Proxy Production")
        ]:
            login_url = generate_login_url(target_url, proxy_name, user_info['role'])
            print(f"   {proxy_desc}: {login_url}")
        
        print()

def generate_quick_test_links():
    """Genera links rápidos para testing"""
    print("⚡ LINKS RÁPIDOS PARA TESTING:")
    print("=" * 80)
    
    quick_tests = [
        {
            "name": "🧪 Test Paciente → Patients App",
            "redirect": APPLICATIONS["patients"]["url"],
            "role": "patient"
        },
        {
            "name": "🧪 Test Doctor → Doctors App", 
            "redirect": APPLICATIONS["doctors"]["url"],
            "role": "doctor"
        },
        {
            "name": "🧪 Test Empresa → Companies App",
            "redirect": APPLICATIONS["companies"]["url"], 
            "role": "company"
        },
        {
            "name": "🧪 Test Admin → Admin Panel",
            "redirect": APPLICATIONS["admin"]["url"],
            "role": "admin"
        }
    ]
    
    for test in quick_tests:
        print(f"\n{test['name']}")
        print("-" * 50)
        
        for proxy_name, proxy_desc in [
            ("web-app", "Web App"),
            ("proxy-simple", "Proxy Simple"), 
            ("proxy-production", "Proxy Production")
        ]:
            url = generate_login_url(test['redirect'], proxy_name, test['role'])
            print(f"   {proxy_desc}: {url}")

def open_url_in_browser(url):
    """Abre una URL en el navegador"""
    try:
        webbrowser.open(url)
        print(f"✅ Abriendo en navegador: {url}")
        return True
    except Exception as e:
        print(f"❌ Error abriendo navegador: {e}")
        return False

def interactive_mode():
    """Modo interactivo para generar URLs específicas"""
    print("🎮 MODO INTERACTIVO:")
    print("=" * 80)
    
    print("Selecciona la aplicación de destino:")
    app_keys = list(APPLICATIONS.keys())
    
    for i, (app_key, app_info) in enumerate(APPLICATIONS.items(), 1):
        print(f"{i}. {app_info['icon']} {app_info['name']} ({app_info['url']})")
    
    try:
        choice = int(input("\nElige una opción (1-6): ")) - 1
        if 0 <= choice < len(app_keys):
            selected_app_key = app_keys[choice]
            selected_app = APPLICATIONS[selected_app_key]
            
            print(f"\n✅ Seleccionado: {selected_app['icon']} {selected_app['name']}")
            
            print("\nSelecciona el tipo de proxy:")
            print("1. Web App Login (puerto 3000)")
            print("2. Proxy Simple - Testing (puerto 9000)")
            print("3. Proxy Production - Firebase (puerto 9001)")
            
            proxy_choice = int(input("Elige una opción (1-3): "))
            proxy_types = ["web-app", "proxy-simple", "proxy-production"]
            
            if 1 <= proxy_choice <= 3:
                selected_proxy = proxy_types[proxy_choice - 1]
                
                # Generar URL
                login_url = generate_login_url(selected_app['url'], selected_proxy)
                
                print(f"\n🔗 URL Generada:")
                print(f"{login_url}")
                
                # Preguntar si abrir en navegador
                open_browser = input("\n¿Abrir en navegador? (s/n): ").lower().strip()
                if open_browser in ['s', 'si', 'yes', 'y']:
                    open_url_in_browser(login_url)
                    
            else:
                print("❌ Opción de proxy inválida")
        else:
            print("❌ Opción de aplicación inválida")
            
    except (ValueError, KeyboardInterrupt):
        print("\n❌ Operación cancelada")

def main():
    """Función principal"""
    print_header()
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--interactive" or sys.argv[1] == "-i":
            interactive_mode()
            return
        elif sys.argv[1] == "--help" or sys.argv[1] == "-h":
            print("Uso:")
            print("  python generate_login_urls.py              # Generar todas las URLs")
            print("  python generate_login_urls.py -i           # Modo interactivo")
            print("  python generate_login_urls.py --help       # Mostrar ayuda")
            return
    
    # Mostrar todas las URLs generadas
    print_applications()
    generate_all_urls()
    generate_user_specific_urls() 
    generate_quick_test_links()
    
    print("\n" + "=" * 80)
    print("💡 TIP: Usa 'python generate_login_urls.py -i' para modo interactivo")
    print("=" * 80)

if __name__ == "__main__":
    main()
