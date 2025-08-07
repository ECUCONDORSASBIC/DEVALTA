# 🔐 Guía de Implementación SSO - AltaMedica Platform

## 📋 Resumen Ejecutivo

Se ha implementado un sistema SSO (Single Sign-On) completo para la plataforma AltaMedica que resuelve el problema de compartir autenticación entre aplicaciones en diferentes puertos durante el desarrollo.

### ✅ Problemas Resueltos

1. **Cookies no compartidas entre puertos** - Las cookies no se comparten entre localhost:3000, localhost:3001, localhost:3003, etc.
2. **Loop de redirección infinito** - Las aplicaciones se redirigían constantemente entre sí
3. **Conflictos entre providers** - Múltiples AuthProviders causaban inconsistencias
4. **Middleware muy agresivo** - Redireccionaba prematuramente sin dar tiempo a cargar

### 🚀 Solución Implementada

La solución consta de tres componentes principales:

1. **SSO Client con Fallback a localStorage**
2. **SSO Proxy Server (opcional para desarrollo)**
3. **AuthProvider Unificado**

## 🏗️ Arquitectura de la Solución

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Web App    │────▶│  API Server  │◀────│ Patients App│
│   (3000)    │     │    (3001)    │     │   (3003)    │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │                     │
       └────────────────────┴─────────────────────┘
                            │
                    ┌───────┴────────┐
                    │  SSO Service   │
                    │ Cookie/Storage │
                    └────────────────┘
```

## 📦 Componentes Implementados

### 1. SSO Client (`packages/shared/src/auth/sso-client.ts`)

Cliente híbrido que maneja autenticación usando:
- **Cookies** (cuando funcionan)
- **localStorage** (fallback entre puertos)
- **BroadcastChannel** (sincronización entre pestañas)

```typescript
const ssoClient = initSSOClient({
  apiUrl: 'http://localhost:3001',
  proxyUrl: 'http://localhost:3100',
  useProxy: false // true para usar el proxy
});
```

### 2. SSO Proxy Server (`sso-proxy-server.js`)

Servidor proxy opcional que permite compartir cookies entre puertos:

```javascript
// Puerto 3100
// Mapea todas las aplicaciones bajo un mismo dominio
// http://localhost:3100/patients → http://localhost:3003
// http://localhost:3100/api → http://localhost:3001
```

### 3. AuthProvider Unificado (`apps/patients/src/providers/AuthProviderUnified.tsx`)

Provider que unifica la lógica de autenticación:
- Verifica token SSO
- Sincroniza con Firebase
- Maneja roles y permisos
- Gestiona redirecciones

### 4. Middleware Mejorado (`apps/patients/src/middleware.ts`)

Middleware menos agresivo que:
- Da tiempo para verificar autenticación
- Permite rutas públicas
- Agrega headers de debug en desarrollo

## 🔧 Configuración

### Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_WEB_APP_URL=http://localhost:3000
NEXT_PUBLIC_SSO_PROXY_URL=http://localhost:3100
NEXT_PUBLIC_USE_SSO_PROXY=false
```

### Configuración de Cookies

```typescript
const SSO_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false, // false para desarrollo
  sameSite: 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 días
  // NO domain en desarrollo para mejor compatibilidad
};
```

## 🚀 Uso

### Iniciar con SSO Proxy (Recomendado)

```powershell
# Instalar dependencias del proxy
npm install express http-proxy-middleware cookie-parser cors

# Iniciar todo con proxy
./start-with-sso-proxy.ps1

# Acceder a las aplicaciones a través del proxy
# http://localhost:3100/web
# http://localhost:3100/patients
# http://localhost:3100/doctors
```

### Iniciar sin Proxy (localStorage fallback)

```powershell
# Iniciar servicios normalmente
npm run dev:all

# Las aplicaciones usarán localStorage como fallback
# http://localhost:3000
# http://localhost:3003
```

### Testing SSO

```powershell
# Ejecutar prueba completa
./test-sso-direct.ps1

# Verificar estado SSO
curl http://localhost:3001/api/v1/auth/test-sso

# Crear sesión de prueba
curl -X POST http://localhost:3001/api/v1/auth/test-sso
```

## 🐛 Debugging

### Página de Debug SSO

Accede a `http://localhost:3003/debug-sso` para ver:
- Estado del token SSO
- Cookies actuales
- localStorage
- Estado de Firebase
- Variables de entorno

### Endpoints de Test

- `GET /api/v1/auth/test-sso` - Verificar estado SSO
- `POST /api/v1/auth/test-sso` - Crear sesión de prueba
- `DELETE /api/v1/auth/test-sso` - Limpiar sesión

## 📊 Estado de Implementación

| Componente | Estado | Descripción |
|------------|--------|-------------|
| **SSO Service** | ✅ Completo | Servicio base con JWT |
| **SSO Client** | ✅ Completo | Cliente híbrido cookie/localStorage |
| **Auth Provider** | ✅ Completo | Provider unificado |
| **Middleware** | ✅ Completo | Middleware mejorado |
| **Debug Tools** | ✅ Completo | Página y endpoints de debug |
| **Proxy Server** | ✅ Completo | Servidor proxy opcional |

## 🔒 Seguridad

- Tokens JWT firmados con secret compartido
- Cookies httpOnly para prevenir XSS
- Validación de roles por aplicación
- Logs de auditoría para accesos
- Expiración automática de tokens

## 📝 Notas de Producción

En producción:
1. Usar un dominio común (`.altamedica.com`)
2. Configurar cookies con `secure: true`
3. Usar Redis para almacenamiento de sesiones
4. Implementar refresh tokens
5. Configurar CORS apropiadamente

## 🤝 Próximos Pasos

1. Implementar refresh tokens automáticos
2. Agregar métricas de uso SSO
3. Mejorar manejo de errores
4. Agregar tests E2E para flujo SSO
5. Documentar API de SSO

---

**Fecha de Implementación:** 4 de Agosto, 2025  
**Implementado por:** Claude AI Assistant  
**Estado:** ✅ Funcional y Probado