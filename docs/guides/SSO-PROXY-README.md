# 🏥 AltaMedica SSO Authentication Proxy

## 🎯 Propósito

Este sistema **elimina completamente la dependencia de Next.js providers** para autenticación, implementando un **proxy SSO centralizado en Python** que:

- ✅ **Centraliza la autenticación** para todas las apps de AltaMedica
- ✅ **Redirige automáticamente** según roles de usuario
- ✅ **Valida tokens Firebase** sin providers complicados
- ✅ **Maneja cookies de sesión** de forma transparente
- ✅ **Cumple auditoría HIPAA** con logs automáticos
- ✅ **Proxy transparente** para todas las aplicaciones

---

## 🚀 Inicio Rápido

### 1. Iniciar el Proxy SSO
```bash
# Opción 1: Script Windows (recomendado)
start-sso-proxy.bat

# Opción 2: Comando directo
python sso-auth-proxy.py
```

El proxy estará disponible en: **http://localhost:9000**

### 2. Probar la Funcionalidad
Abrir en el navegador: `test-sso-client.html`

### 3. Usuarios de Testing Predefinidos
| Email | Password | Rol | Redirecciona a |
|-------|----------|-----|----------------|
| `paciente.test@email.com` | `Patient123!` | PATIENT | http://localhost:3003 |
| `dr.martinez@altamedica.com` | `Doctor123!` | DOCTOR | http://localhost:3002 |
| `empresa@altamedica.com` | `Company123!` | COMPANY | http://localhost:3004 |
| `admin@altamedica.com` | `Admin123!` | ADMIN | http://localhost:3005 |

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                   Usuario Web Browser                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│            SSO Auth Proxy (Puerto 9000)                    │
│  • Autenticación centralizada                              │
│  • Validación de tokens Firebase                           │
│  • Gestión de cookies de sesión                            │
│  • Redirección automática por roles                        │
│  • Auditoría HIPAA                                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Web App    │ │ API Server  │ │ Signaling   │
│ (Puerto     │ │ (Puerto     │ │ (Puerto     │
│  3000)      │ │  3001)      │ │  8888)      │
└─────────────┘ └─────────────┘ └─────────────┘
        ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Doctors    │ │  Patients   │ │ Companies   │
│ (Puerto     │ │ (Puerto     │ │ (Puerto     │
│  3002)      │ │  3003)      │ │  3004)      │
└─────────────┘ └─────────────┘ └─────────────┘
                      ▼
                ┌─────────────┐
                │    Admin    │
                │ (Puerto     │
                │  3005)      │
                └─────────────┘
```

---

## 🔗 Endpoints Disponibles

### Autenticación
- **POST** `/auth/login` - Login centralizado con email/password
- **POST** `/auth/logout` - Logout y limpieza de cookies
- **GET** `/auth/verify` - Verificar validez del token de sesión
- **GET** `/auth/redirect` - Redirección automática según rol de usuario
- **GET** `/auth/user-info` - Información del usuario autenticado

### Sistema
- **GET** `/health` - Health check del proxy y todas las aplicaciones
- **GET** `/` - Información del servicio y endpoints disponibles

### Proxy
- **ANY** `/proxy/{app}/{path}` - Proxy transparente a aplicaciones AltaMedica

---

## 🏥 Integración con Aplicaciones AltaMedica

### Reemplazar Providers de Next.js

**Antes (con providers complicados):**
```jsx
// ❌ Complejo y propenso a errores
export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <UserProvider>
        <RoleProvider>
          <Component {...pageProps} />
        </RoleProvider>
      </UserProvider>
    </AuthProvider>
  );
}
```

**Después (con SSO Proxy):**
```jsx
// ✅ Simple y directo
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

// Hook simple para obtener usuario
function useAuth() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch('http://localhost:9000/auth/user-info', { credentials: 'include' })
      .then(res => res.json())
      .then(data => data.authenticated ? setUser(data.user) : setUser(null));
  }, []);
  
  return user;
}
```

### Autenticación en APIs

**Middleware simplificado:**
```javascript
// apps/api-server/src/middleware/sso-auth.js
export async function ssoAuthMiddleware(req, res, next) {
  try {
    const response = await fetch('http://localhost:9000/auth/verify', {
      headers: { cookie: req.headers.cookie }
    });
    
    const result = await response.json();
    
    if (result.valid) {
      req.user = result.user;
      next();
    } else {
      res.status(401).json({ error: 'No autorizado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error de autenticación' });
  }
}
```

---

## 🔒 Seguridad y Compliance HIPAA

### Auditoría Automática
Todos los eventos de autenticación se registran automáticamente:
```json
{
  "timestamp": "2025-01-26T10:30:00.000Z",
  "event_type": "LOGIN_SUCCESS",
  "user_email": "dr.martinez@altamedica.com",
  "user_uid": "doctor_test_67890",
  "user_role": "DOCTOR",
  "ip_address": "127.0.0.1",
  "user_agent": "Mozilla/5.0...",
  "success": true
}
```

### Archivos de Log
- `sso-auth-proxy.log` - Logs generales del proxy
- `hipaa-audit.log` - Logs específicos de auditoría HIPAA

### Tokens de Sesión
- **Algoritmo**: JWT con HS256
- **Duración**: 24 horas
- **Cookies**: HttpOnly, SameSite=Lax
- **Secreto**: Configurable via `JWT_SECRET_KEY`

---

## 🧪 Testing y Debugging

### 1. Health Check Completo
```bash
curl http://localhost:9000/health
```

### 2. Test de Login
```bash
curl -X POST http://localhost:9000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "paciente.test@email.com", "password": "Patient123!"}'
```

### 3. Test de Redirección
```bash
curl -i http://localhost:9000/auth/redirect
```

### 4. Cliente Web Interactivo
Abrir `test-sso-client.html` en cualquier navegador para testing completo con interfaz gráfica.

---

## ⚙️ Configuración Avanzada

### Variables de Entorno
```bash
# Token secreto para JWT (producción)
JWT_SECRET_KEY=tu-clave-secreta-super-segura

# Configuración Firebase (opcional)
GOOGLE_APPLICATION_CREDENTIALS=ruta/a/firebase-service-account.json
```

### Personalización de URLs
Modificar en `sso-auth-proxy.py`:
```python
self.app_urls = {
    'web-app': 'http://localhost:3000',
    'api-server': 'http://localhost:3001',
    # ... agregar más aplicaciones
}

self.role_redirects = {
    'PATIENT': 'http://localhost:3003',
    'DOCTOR': 'http://localhost:3002',
    # ... personalizar redirecciones
}
```

---

## 🔧 Troubleshooting

### Problema: "Dependencia faltante"
```bash
# Instalar dependencias manualmente
pip install aiohttp aiohttp-cors firebase-admin PyJWT
```

### Problema: "Puerto 9000 ocupado"
```bash
# Windows
netstat -ano | findstr :9000
taskkill /F /PID <PID>

# Cambiar puerto en sso-auth-proxy.py línea ~450
site = web.TCPSite(runner, 'localhost', 9001)  # Cambiar a 9001
```

### Problema: "Firebase no conecta"
El proxy funciona sin Firebase en modo de desarrollo usando usuarios de testing predefinidos.

### Problema: "CORS errors"
El proxy ya incluye configuración CORS completa para todos los puertos de AltaMedica.

---

## 📊 Ventajas vs Next.js Providers

| Aspecto | Next.js Providers | SSO Proxy Python |
|---------|-------------------|-------------------|
| **Complejidad** | ❌ Alta (múltiples providers anidados) | ✅ Baja (un solo servicio) |
| **Debugging** | ❌ Difícil (estados complejos) | ✅ Fácil (logs centralizados) |
| **Performance** | ❌ Re-renders frecuentes | ✅ Caching inteligente |
| **Mantenimiento** | ❌ Múltiples archivos | ✅ Un solo archivo |
| **Testing** | ❌ Mocks complejos | ✅ APIs HTTP simples |
| **HIPAA Audit** | ❌ Manual | ✅ Automático |
| **Escalabilidad** | ❌ Limitada | ✅ Microservicio independiente |

---

## 🎯 Próximos Pasos

1. **Ejecutar el proxy**: `start-sso-proxy.bat`
2. **Probar con el cliente**: Abrir `test-sso-client.html`
3. **Integrar en aplicaciones**: Reemplazar providers con llamadas HTTP
4. **Configurar producción**: Variables de entorno y Firebase real
5. **Monitorear logs**: Revisar auditoría HIPAA

---

**🏥 AltaMedica Platform - Centralizando la autenticación médica**  
*Eliminando la complejidad de Next.js providers con Python y APIs REST*