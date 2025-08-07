#!/usr/bin/env python3
"""
AltaMedica SSO Authentication Proxy
Servidor Python que centraliza la autenticación y redirige usuarios según sus roles
Elimina la dependencia de Next.js providers
"""

import asyncio
import json
import logging
import os
import sys
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from urllib.parse import urlparse, parse_qs

import aiohttp
from aiohttp import web, ClientSession
import aiohttp_cors
import firebase_admin
from firebase_admin import auth, credentials
import jwt

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('sso-auth-proxy.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('AltaMedicaSSO')

class AltaMedicaAuthProxy:
    def __init__(self):
        self.app = web.Application()
        self.setup_routes()
        self.setup_cors()
        self.initialize_firebase()
        
        # URLs de las aplicaciones
        self.app_urls = {
            'web-app': 'http://localhost:3000',
            'api-server': 'http://localhost:3001',
            'doctors': 'http://localhost:3002',
            'patients': 'http://localhost:3003',
            'companies': 'http://localhost:3004',
            'admin': 'http://localhost:3005',
            'signaling': 'ws://localhost:8888'
        }
        
        # Mapeo de roles a aplicaciones
        self.role_redirects = {
            'PATIENT': 'http://localhost:3003',
            'DOCTOR': 'http://localhost:3002',
            'COMPANY': 'http://localhost:3004',
            'ADMIN': 'http://localhost:3005',
            'GUEST': 'http://localhost:3000'
        }
        
    def initialize_firebase(self):
        """Inicializar Firebase Admin SDK"""
        try:
            # Buscar archivo de credenciales de Firebase
            firebase_key_path = None
            possible_paths = [
                'apps/api-server/altamedic-20f69-firebase-adminsdk-fbsvc-06a561d259.json',
                'firebase-service-account.json',
                os.path.expanduser('~/.firebase/altamedica-key.json')
            ]
            
            for path in possible_paths:
                if os.path.exists(path):
                    firebase_key_path = path
                    break
            
            if firebase_key_path and not firebase_admin._apps:
                cred = credentials.Certificate(firebase_key_path)
                firebase_admin.initialize_app(cred)
                logger.info(f"Firebase inicializado con credenciales: {firebase_key_path}")
            else:
                logger.warning("Firebase Admin SDK no inicializado - usando modo emulador")
                
        except Exception as e:
            logger.error(f"Error inicializando Firebase: {e}")
    
    def setup_cors(self):
        """Configurar CORS para todas las aplicaciones AltaMedica"""
        cors = aiohttp_cors.setup(self.app, defaults={
            "http://localhost:3000": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*",
                allow_methods="*"
            ),
            "http://localhost:3001": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*", 
                allow_headers="*",
                allow_methods="*"
            ),
            "http://localhost:3002": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*", 
                allow_methods="*"
            ),
            "http://localhost:3003": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*",
                allow_methods="*"
            ),
            "http://localhost:3004": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*",
                allow_methods="*"
            ),
            "http://localhost:3005": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*",
                allow_methods="*"
            )
        })
        
        # Aplicar CORS a todas las rutas
        for route in self.app.router.routes():
            cors.add(route)
    
    def setup_routes(self):
        """Configurar rutas del proxy SSO"""
        self.app.router.add_post('/auth/login', self.handle_login)
        self.app.router.add_post('/auth/logout', self.handle_logout)
        self.app.router.add_get('/auth/verify', self.verify_token)
        self.app.router.add_get('/auth/redirect', self.handle_redirect)
        self.app.router.add_get('/auth/user-info', self.get_user_info)
        self.app.router.add_get('/health', self.health_check)
        self.app.router.add_get('/', self.root_handler)
        
        # Proxy para todas las aplicaciones
        self.app.router.add_route('*', '/proxy/{app}/{path:.*}', self.proxy_handler)
    
    async def root_handler(self, request):
        """Handler para la ruta raíz"""
        return web.json_response({
            'service': 'AltaMedica SSO Auth Proxy',
            'status': 'active',
            'version': '1.0.0',
            'timestamp': datetime.now().isoformat(),
            'available_endpoints': [
                '/auth/login',
                '/auth/logout', 
                '/auth/verify',
                '/auth/redirect',
                '/auth/user-info',
                '/health',
                '/proxy/{app}/{path}'
            ]
        })
    
    async def health_check(self, request):
        """Health check del proxy SSO"""
        health_status = {
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'services': {}
        }
        
        # Verificar conectividad con cada aplicación
        async with ClientSession() as session:
            for app_name, app_url in self.app_urls.items():
                if app_url.startswith('ws://'):
                    continue  # Skip WebSocket URLs for HTTP health checks
                    
                try:
                    async with session.get(f"{app_url}/health", timeout=2) as resp:
                        if resp.status == 200:
                            health_status['services'][app_name] = 'healthy'
                        else:
                            health_status['services'][app_name] = f'unhealthy (status: {resp.status})'
                except Exception as e:
                    health_status['services'][app_name] = f'unreachable ({str(e)})'
        
        return web.json_response(health_status)
    
    async def handle_login(self, request):
        """Manejar login centralizado y redirección por roles"""
        try:
            data = await request.json()
            email = data.get('email')
            password = data.get('password', '')
            token = data.get('token')  # Token de Firebase si ya existe
            
            if not email:
                return web.json_response(
                    {'error': 'Email requerido', 'success': False},
                    status=400
                )
            
            # Validar token de Firebase si se proporciona
            user_data = None
            if token:
                user_data = await self.validate_firebase_token(token)
                if not user_data:
                    return web.json_response(
                        {'error': 'Token inválido', 'success': False},
                        status=401
                    )
            else:
                # Autenticación con email/password (para testing)
                user_data = await self.authenticate_user(email, password)
                if not user_data:
                    return web.json_response(
                        {'error': 'Credenciales inválidas', 'success': False},
                        status=401
                    )
            
            # Determinar rol y URL de redirección
            user_role = user_data.get('role', 'GUEST').upper()
            redirect_url = self.role_redirects.get(user_role, self.role_redirects['GUEST'])
            
            # Generar token de sesión
            session_token = self.generate_session_token(user_data)
            
            # Log de auditoría HIPAA
            await self.log_auth_event('LOGIN_SUCCESS', user_data, request)
            
            response_data = {
                'success': True,
                'user': {
                    'uid': user_data.get('uid'),
                    'email': user_data.get('email'),
                    'displayName': user_data.get('displayName', ''),
                    'role': user_role,
                    'verified': user_data.get('email_verified', False)
                },
                'redirect_url': redirect_url,
                'session_token': session_token,
                'expires_at': (datetime.now() + timedelta(hours=24)).isoformat()
            }
            
            # Configurar cookies de sesión
            response = web.json_response(response_data)
            response.set_cookie(
                'altamedica_session',
                session_token,
                max_age=86400,  # 24 horas
                httponly=True,
                secure=False,  # True en producción
                samesite='Lax'
            )
            response.set_cookie(
                'altamedica_role',
                user_role,
                max_age=86400,
                httponly=False,  # Accesible desde JS
                secure=False,
                samesite='Lax'
            )
            
            logger.info(f"Login exitoso para {email} con rol {user_role}")
            return response
            
        except Exception as e:
            logger.error(f"Error en login: {str(e)}")
            await self.log_auth_event('LOGIN_ERROR', {'error': str(e)}, request)
            return web.json_response(
                {'error': 'Error interno del servidor', 'success': False},
                status=500
            )
    
    async def handle_logout(self, request):
        """Manejar logout centralizado"""
        try:
            # Obtener información del usuario de las cookies
            session_token = request.cookies.get('altamedica_session')
            
            if session_token:
                user_data = self.decode_session_token(session_token)
                await self.log_auth_event('LOGOUT', user_data, request)
            
            # Limpiar cookies
            response = web.json_response({'success': True, 'message': 'Logout exitoso'})
            response.del_cookie('altamedica_session')
            response.del_cookie('altamedica_role')
            
            return response
            
        except Exception as e:
            logger.error(f"Error en logout: {str(e)}")
            return web.json_response(
                {'error': 'Error en logout', 'success': False},
                status=500
            )
    
    async def verify_token(self, request):
        """Verificar token de sesión"""
        try:
            session_token = request.cookies.get('altamedica_session')
            
            if not session_token:
                return web.json_response(
                    {'valid': False, 'error': 'No session token'},
                    status=401
                )
            
            user_data = self.decode_session_token(session_token)
            if not user_data:
                return web.json_response(
                    {'valid': False, 'error': 'Invalid session token'},
                    status=401
                )
            
            return web.json_response({
                'valid': True,
                'user': user_data,
                'expires_at': user_data.get('exp', 0)
            })
            
        except Exception as e:
            logger.error(f"Error verificando token: {str(e)}")
            return web.json_response(
                {'valid': False, 'error': 'Token verification failed'},
                status=500
            )
    
    async def handle_redirect(self, request):
        """Manejar redirección automática por roles"""
        try:
            # Verificar sesión actual
            session_token = request.cookies.get('altamedica_session')
            user_role = request.cookies.get('altamedica_role', 'GUEST')
            
            if not session_token:
                # Sin sesión, redirigir a web-app para login
                redirect_url = self.role_redirects['GUEST']
            else:
                # Con sesión, redirigir según rol
                redirect_url = self.role_redirects.get(user_role.upper(), self.role_redirects['GUEST'])
            
            # Parámetros adicionales de la URL
            query_params = request.query_string
            if query_params:
                redirect_url += f"?{query_params}"
            
            logger.info(f"Redirigiendo usuario con rol {user_role} a {redirect_url}")
            
            # Redirección HTTP 302
            return web.Response(
                status=302,
                headers={'Location': redirect_url}
            )
            
        except Exception as e:
            logger.error(f"Error en redirección: {str(e)}")
            return web.Response(
                status=302,
                headers={'Location': self.role_redirects['GUEST']}
            )
    
    async def get_user_info(self, request):
        """Obtener información del usuario actual"""
        try:
            session_token = request.cookies.get('altamedica_session')
            
            if not session_token:
                return web.json_response(
                    {'error': 'No authenticated user', 'authenticated': False},
                    status=401
                )
            
            user_data = self.decode_session_token(session_token)
            if not user_data:
                return web.json_response(
                    {'error': 'Invalid session', 'authenticated': False},
                    status=401
                )
            
            return web.json_response({
                'authenticated': True,
                'user': {
                    'uid': user_data.get('uid'),
                    'email': user_data.get('email'),
                    'displayName': user_data.get('displayName', ''),
                    'role': user_data.get('role', 'GUEST'),
                    'verified': user_data.get('email_verified', False)
                }
            })
            
        except Exception as e:
            logger.error(f"Error obteniendo información de usuario: {str(e)}")
            return web.json_response(
                {'error': 'Error getting user info', 'authenticated': False},
                status=500
            )
    
    async def proxy_handler(self, request):
        """Proxy para redireccionar requests a las aplicaciones correspondientes"""
        try:
            app_name = request.match_info['app']
            path = request.match_info['path']
            
            if app_name not in self.app_urls:
                return web.json_response(
                    {'error': f'App {app_name} not found'},
                    status=404
                )
            
            target_url = f"{self.app_urls[app_name]}/{path}"
            
            # Verificar autenticación para rutas protegidas
            if path.startswith('api/') or app_name in ['doctors', 'patients', 'companies', 'admin']:
                session_token = request.cookies.get('altamedica_session')
                if not session_token or not self.decode_session_token(session_token):
                    return web.json_response(
                        {'error': 'Authentication required'},
                        status=401
                    )
            
            # Proxy del request
            async with ClientSession() as session:
                async with session.request(
                    request.method,
                    target_url,
                    headers=request.headers,
                    data=await request.read(),
                    params=request.query
                ) as resp:
                    body = await resp.read()
                    
                    return web.Response(
                        body=body,
                        status=resp.status,
                        headers=resp.headers
                    )
                    
        except Exception as e:
            logger.error(f"Error en proxy: {str(e)}")
            return web.json_response(
                {'error': 'Proxy error'},
                status=500
            )
    
    async def validate_firebase_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Validar token de Firebase"""
        try:
            if firebase_admin._apps:
                # Producción con Firebase Admin SDK
                decoded_token = auth.verify_id_token(token)
                return {
                    'uid': decoded_token['uid'],
                    'email': decoded_token.get('email'),
                    'displayName': decoded_token.get('name', ''),
                    'email_verified': decoded_token.get('email_verified', False),
                    'role': decoded_token.get('role', 'PATIENT')  # Rol por defecto
                }
            else:
                # Desarrollo - validación básica JWT (sin verificar firma)
                payload = jwt.decode(token, options={"verify_signature": False})
                return {
                    'uid': payload.get('user_id', payload.get('sub')),
                    'email': payload.get('email'),
                    'displayName': payload.get('name', ''),
                    'email_verified': payload.get('email_verified', False),
                    'role': payload.get('role', 'PATIENT')
                }
        except Exception as e:
            logger.error(f"Error validando token Firebase: {str(e)}")
            return None
    
    async def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """Autenticación básica para testing (solo desarrollo)"""
        # Usuarios de testing predefinidos
        test_users = {
            'paciente.test@email.com': {
                'uid': 'patient_test_12345',
                'email': 'paciente.test@email.com',
                'displayName': 'Juan Pérez',
                'role': 'PATIENT',
                'email_verified': True,
                'password': 'Patient123!'
            },
            'dr.martinez@altamedica.com': {
                'uid': 'doctor_test_67890',
                'email': 'dr.martinez@altamedica.com',
                'displayName': 'Dr. Martínez',
                'role': 'DOCTOR',
                'email_verified': True,
                'password': 'Doctor123!'
            },
            'empresa@altamedica.com': {
                'uid': 'company_test_abcde',
                'email': 'empresa@altamedica.com',
                'displayName': 'Empresa Test',
                'role': 'COMPANY',
                'email_verified': True,
                'password': 'Company123!'
            },
            'admin@altamedica.com': {
                'uid': 'admin_test_fghij',
                'email': 'admin@altamedica.com',
                'displayName': 'Admin AltaMédica',
                'role': 'ADMIN',
                'email_verified': True,
                'password': 'Admin123!'
            }
        }
        
        user = test_users.get(email)
        if user and user['password'] == password:
            return {k: v for k, v in user.items() if k != 'password'}
        
        return None
    
    def generate_session_token(self, user_data: Dict[str, Any]) -> str:
        """Generar token de sesión JWT"""
        payload = {
            'uid': user_data.get('uid'),
            'email': user_data.get('email'),
            'displayName': user_data.get('displayName', ''),
            'role': user_data.get('role'),
            'email_verified': user_data.get('email_verified', False),
            'iat': datetime.now().timestamp(),
            'exp': (datetime.now() + timedelta(hours=24)).timestamp()
        }
        
        # Clave secreta (en producción usar variable de entorno)
        secret_key = os.getenv('JWT_SECRET_KEY', 'altamedica-dev-secret-key-2025')
        
        return jwt.encode(payload, secret_key, algorithm='HS256')
    
    def decode_session_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Decodificar token de sesión JWT"""
        try:
            secret_key = os.getenv('JWT_SECRET_KEY', 'altamedica-dev-secret-key-2025')
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            
            # Verificar que no haya expirado
            if payload.get('exp', 0) < datetime.now().timestamp():
                return None
                
            return payload
        except Exception as e:
            logger.error(f"Error decodificando token de sesión: {str(e)}")
            return None
    
    async def log_auth_event(self, event_type: str, user_data: Dict[str, Any], request):
        """Log de eventos de autenticación para auditoría HIPAA"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'event_type': event_type,
            'user_email': user_data.get('email', 'unknown'),
            'user_uid': user_data.get('uid', 'unknown'),
            'user_role': user_data.get('role', 'unknown'),
            'ip_address': request.remote,
            'user_agent': request.headers.get('User-Agent', 'unknown'),
            'success': event_type.endswith('_SUCCESS')
        }
        
        # Log para auditoría HIPAA
        logger.info(f"AUTH_AUDIT: {json.dumps(log_entry)}")
        
        # Escribir a archivo de auditoría separado
        try:
            with open('hipaa-audit.log', 'a') as f:
                f.write(f"{json.dumps(log_entry)}\n")
        except Exception as e:
            logger.error(f"Error escribiendo log de auditoría: {str(e)}")

async def main():
    """Función principal para iniciar el servidor SSO"""
    proxy = AltaMedicaAuthProxy()
    
    # Configurar servidor
    runner = web.AppRunner(proxy.app)
    await runner.setup()
    
    # Puerto del proxy SSO
    site = web.TCPSite(runner, 'localhost', 9000)
    await site.start()
    
    logger.info("🚀 AltaMedica SSO Auth Proxy iniciado en http://localhost:9000")
    logger.info("📋 Endpoints disponibles:")
    logger.info("   • POST /auth/login - Login centralizado")
    logger.info("   • POST /auth/logout - Logout")
    logger.info("   • GET /auth/verify - Verificar token")
    logger.info("   • GET /auth/redirect - Redirección automática por rol")
    logger.info("   • GET /auth/user-info - Información del usuario")
    logger.info("   • GET /health - Health check")
    logger.info("   • * /proxy/{app}/{path} - Proxy a aplicaciones")
    logger.info("")
    logger.info("🏥 Aplicaciones AltaMedica:")
    for app_name, app_url in proxy.app_urls.items():
        logger.info(f"   • {app_name}: {app_url}")
    logger.info("")
    logger.info("👥 Usuarios de testing disponibles:")
    logger.info("   • paciente.test@email.com / Patient123! (PATIENT)")
    logger.info("   • dr.martinez@altamedica.com / Doctor123! (DOCTOR)")
    logger.info("   • empresa@altamedica.com / Company123! (COMPANY)")
    logger.info("   • admin@altamedica.com / Admin123! (ADMIN)")
    
    # Mantener el servidor corriendo
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        logger.info("🛑 Deteniendo AltaMedica SSO Auth Proxy...")
        await runner.cleanup()

if __name__ == '__main__':
    # Instalar dependencias si no están disponibles
    try:
        import aiohttp
        import firebase_admin
        import jwt
    except ImportError as e:
        print(f"❌ Dependencia faltante: {e}")
        print("📦 Instalando dependencias...")
        os.system('pip install aiohttp aiohttp-cors firebase-admin PyJWT')
        print("✅ Dependencias instaladas. Reinicia el script.")
        sys.exit(1)
    
    asyncio.run(main())