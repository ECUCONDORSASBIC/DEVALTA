# 🌐 CLAUDE.md - Web App Application Guide

Este archivo proporciona orientación completa a Claude Code (claude.ai/code) cuando trabaja con la aplicación Web App del proyecto AltaMedica Platform.

## 🎯 Visión General

**Web App** (Puerto 3000) es el **gateway principal y punto de entrada** para toda la plataforma AltaMedica. Sirve como landing page pública, sistema de autenticación centralizado y router inteligente que dirige a los usuarios a sus portales específicos según su rol.

### Estado Actual: 🟡 7.2/10

- ✅ Landing page funcional con animaciones 3D
- ✅ Sistema de autenticación SSO implementado
- ✅ Redirección por roles funcionando
- ⚠️ Necesita optimización de performance
- ⚠️ Algunos componentes 3D requieren refactoring
- 🔄 Migración a App Router en progreso

## 🏗️ Arquitectura de la Aplicación

### Estructura del Directorio

```
C:\Users\Eduardo\Documents\devaltamedica\apps\web-app\
│
├── 📁 src\
│   ├── 📁 app\                     # Next.js App Router
│   │   ├── 📁 (auth)\              # Grupo de rutas de autenticación
│   │   │   ├── login\              # Página de login SSO
│   │   │   ├── register\           # Registro de nuevos usuarios
│   │   │   ├── forgot-password\    # Recuperación de contraseña
│   │   │   ├── verify-email\       # Verificación de email
│   │   │   └── complete-profile\   # Completar perfil después de registro
│   │   │
│   │   ├── 📁 anamnesis-juego\     # Demo interactiva de anamnesis
│   │   ├── 📁 hospital3d\          # Visualización 3D del hospital
│   │   ├── 📁 calculadora-precios\ # Calculadora de precios médicos
│   │   ├── 📁 demo\                # Demos de funcionalidad
│   │   ├── 📁 landing-demo\        # Landing page demo
│   │   ├── 📁 help\                # Centro de ayuda
│   │   ├── 📁 status\              # Estado del sistema
│   │   │
│   │   ├── layout.tsx              # Layout principal
│   │   ├── page.tsx                # Home page
│   │   ├── providers.tsx           # Providers globales
│   │   ├── error.tsx               # Error boundary
│   │   ├── loading.tsx             # Loading state
│   │   └── not-found.tsx           # 404 page
│   │
│   ├── 📁 components\
│   │   ├── 📁 auth\                # Componentes de autenticación
│   │   │   ├── AuthSystem.tsx      # Sistema de auth principal
│   │   │   ├── LoginForm.tsx       # Formulario de login
│   │   │   ├── RegisterForm.tsx    # Formulario de registro
│   │   │   ├── AuthGuard.tsx       # Protección de rutas
│   │   │   └── RouteGuard.tsx      # Guard para redirección
│   │   │
│   │   ├── 📁 3d\                  # Componentes Three.js
│   │   │   └── HospitalBackdrop.tsx
│   │   │
│   │   ├── 📁 anamnesis\           # Sistema de anamnesis
│   │   │   ├── AnamnesisInteractivaAvanzada.tsx
│   │   │   ├── AvatarPaciente3D.tsx
│   │   │   └── GameComponents.tsx
│   │   │
│   │   ├── 📁 home\                # Componentes de home
│   │   │   ├── HeroSection.tsx
│   │   │   ├── VideoCarousel.tsx
│   │   │   ├── ServicesGrid.tsx
│   │   │   └── MetricsDisplay.tsx
│   │   │
│   │   ├── 📁 landing\             # Componentes de landing
│   │   │   ├── RoleSelector.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   └── Testimonials.tsx
│   │   │
│   │   ├── 📁 layout\              # Sistema de layout
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Container.tsx
│   │   │   └── ResponsiveLayout.tsx
│   │   │
│   │   ├── 📁 marketplace\         # Mapas del marketplace
│   │   │   ├── SafeMarketplaceMap.tsx
│   │   │   └── ClientMapComponent.tsx
│   │   │
│   │   ├── 📁 medical\             # Componentes médicos
│   │   │   ├── SignosVitales.tsx
│   │   │   ├── ProximaCita.tsx
│   │   │   └── map\
│   │   │       └── AltamedicaInteractiveMap.tsx
│   │   │
│   │   ├── 📁 scene\               # Escenas 3D complejas
│   │   │   ├── patient3d\          # Sistema 3D de pacientes
│   │   │   │   ├── Patient3DAvatar.tsx
│   │   │   │   ├── AnamnesisInterface.tsx
│   │   │   │   └── steps\          # Pasos de anamnesis
│   │   │   └── contexts\
│   │   │       └── SceneControlsContext.tsx
│   │   │
│   │   └── 📁 ui\                  # Componentes UI base
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── wizard\              # Sistema de wizard
│   │       │   ├── Wizard.tsx
│   │       │   └── WizardStep.tsx
│   │       └── design-system.ts
│   │
│   ├── 📁 config\
│   │   ├── app-urls.ts             # URLs de la aplicación
│   │   ├── auth-config.ts          # Configuración de auth
│   │   └── migration-config.ts     # Config de migración
│   │
│   ├── 📁 hooks\
│   │   ├── useFirebase.ts          # Hook de Firebase
│   │   ├── useRedirection.ts       # Hook de redirección
│   │   ├── useProtectedRoute.ts    # Hook de rutas protegidas
│   │   ├── useAnamnesis.ts         # Hook de anamnesis
│   │   └── useHydrationSafe.ts     # Hook para SSR seguro
│   │
│   ├── 📁 services\
│   │   ├── anamnesisService.ts     # Servicio de anamnesis
│   │   ├── redirect-service.ts     # Servicio de redirección
│   │   ├── firebase-chat.ts        # Chat con Firebase
│   │   └── analytics.ts            # Analytics
│   │
│   ├── 📁 lib\
│   │   ├── api-client.ts           # Cliente API
│   │   ├── firestore.ts            # Configuración Firestore
│   │   ├── auth-middleware.ts      # Middleware de auth
│   │   └── rate-limiter.ts         # Rate limiting
│   │
│   └── middleware.ts                # Middleware Next.js
│
├── 📁 public\
│   ├── videos\                      # Videos de demostración
│   ├── images\                      # Imágenes estáticas
│   └── models\                      # Modelos 3D
│
├── 📄 package.json
├── 📄 next.config.js                # Configuración Next.js
├── 📄 middleware.ts                 # Middleware global
├── 📄 tailwind.config.js           # Configuración Tailwind
└── 📄 tsconfig.json                # TypeScript config
```

## 🚀 Comandos de Desarrollo

### Comandos Principales

```bash
# Desarrollo
pnpm dev                 # Inicia servidor de desarrollo (puerto 3000)
pnpm dev:direct         # Desarrollo sin wrapper script

# Build y Producción
pnpm build              # Build de producción
pnpm start              # Iniciar servidor de producción
pnpm lint               # Linting con ESLint

# Testing
pnpm playwright:install # Instalar Playwright para E2E tests
```

### Scripts Especiales

```javascript
// run-dev.js - Script wrapper para desarrollo
// Maneja configuración especial para Windows y optimizaciones
```

## 🔑 Funcionalidades Principales

### 1. Sistema de Autenticación SSO

```typescript
// Flujo de autenticación
1. Usuario accede a /login
2. AuthSystem.tsx maneja el login con Firebase
3. SSO token se genera y almacena
4. Redirección basada en rol:
   - PATIENT → http://localhost:3003
   - DOCTOR → http://localhost:3002
   - COMPANY → http://localhost:3004
   - ADMIN → http://localhost:3005
```

### 2. Landing Page con Three.js

```typescript
// Componentes 3D principales
- Hospital3DClient: Visualización interactiva del hospital
- Patient3DAvatar: Avatar 3D para anamnesis
- Medical3DCanvas: Canvas base para escenas médicas
```

### 3. Sistema de Anamnesis Interactiva

```typescript
// Flujo de anamnesis
1. /anamnesis-juego - Versión gamificada
2. /anamnesis-interactiva - Versión profesional
3. Componentes modulares por pasos:
   - IdentificationStep
   - MotivoConsultaStep
   - EnfermedadActualStep
   - AntecedentesStep
   - etc.
```

### 4. Role-Based Routing

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Verificar autenticación
  // Obtener rol del usuario
  // Redirigir según rol
  // Aplicar protecciones HIPAA
}
```

## 📦 Dependencias Principales

### Paquetes Workspace

```json
{
  "@altamedica/auth-service": "workspace:*",
  "@altamedica/firebase-config": "workspace:*",
  "@altamedica/shared": "workspace:*",
  "@altamedica/ui": "workspace:*",
  "@altamedica/utils": "workspace:*"
}
```

### Librerías Externas Clave

- **Next.js 15.3.4**: Framework React con App Router
- **React 19.0.0**: Última versión de React
- **Three.js** (@react-three/fiber, @react-three/drei): Gráficos 3D
- **Firebase 10.0.0**: Autenticación y base de datos
- **Leaflet**: Mapas interactivos
- **Framer Motion**: Animaciones
- **React Hook Form**: Manejo de formularios
- **TanStack Query**: Estado del servidor
- **Sentry**: Monitoreo de errores

## 🎨 Sistema de Diseño

### Configuración de Tailwind

```javascript
// tailwind.config.js
{
  content: ["./src/**/*.{tsx,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "AltaMedica Blue",
        secondary: "Medical Green",
        // Paleta médica personalizada
      }
    }
  }
}
```

### Componentes UI Propios

```typescript
// Sistema de componentes en src/components/ui/
- Button: Botones con variantes médicas
- Card: Tarjetas para información médica
- Wizard: Sistema de pasos para formularios médicos
- Tabs: Navegación por pestañas
```

## 🔐 Seguridad y Autenticación

### Flujo de Autenticación

1. **Login Page** (`/login`)
   - Email/Password
   - Google OAuth
   - Recuperación de contraseña

2. **Registro** (`/register`)
   - Validación de datos médicos
   - Selección de rol
   - Verificación de email

3. **Protección de Rutas**

   ```typescript
   // AuthGuard.tsx
   - Verificación de token
   - Validación de permisos
   - Redirección si no autorizado
   ```

4. **Middleware de Seguridad**
   ```typescript
   // middleware.ts
   - Rate limiting
   - CORS headers
   - CSP policies
   - XSS protection
   ```

## 🌐 Integración con API

### Cliente API

```typescript
// lib/api-client.ts
const apiClient = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Para cookies SSO
};
```

### Hooks de API

```typescript
// hooks/useAPI.ts
export function useAPI() {
  // Manejo de autenticación
  // Interceptores de request/response
  // Manejo de errores centralizado
  // Retry logic
}
```

## 🎮 Características Especiales

### 1. Anamnesis Gamificada

```typescript
// /anamnesis-juego
- Avatar 3D interactivo
- Sistema de puntos y logros
- Progreso visual
- Exportación de datos médicos
```

### 2. Visualización 3D del Hospital

```typescript
// /hospital3d
- Modelo 3D navegable
- Información por departamento
- Tour virtual
- Integración con citas
```

### 3. Calculadora de Precios

```typescript
// /calculadora-precios
- Estimación de costos médicos
- Comparación de planes
- Cálculo de seguros
- Exportación PDF
```

## 🐛 Problemas Conocidos y Soluciones

### 1. Hydration Mismatch

```typescript
// Solución: useHydrationSafe hook
const isHydrated = useHydrationSafe();
if (!isHydrated) return <LoadingScreen />;
```

### 2. Leaflet en SSR

```typescript
// Solución: Dynamic imports
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <MapSkeleton />
});
```

### 3. Three.js Performance

```typescript
// Optimizaciones
- Lazy loading de modelos
- LOD (Level of Detail)
- Instanced meshes
- Texture compression
```

## 📊 Métricas y Monitoreo

### Sentry Integration

```typescript
// Configurado en next.config.js
- Error tracking automático
- Performance monitoring
- User feedback
- Release tracking
```

### Analytics

```typescript
// services/analytics.ts
- Eventos de usuario
- Flujos de conversión
- Métricas de performance
- A/B testing
```

## 🔄 Estado de Migración

### Migración a App Router

- ✅ Estructura de carpetas migrada
- ✅ Layouts implementados
- ✅ Server Components donde aplica
- 🔄 Optimización de Client Components
- 🔄 Implementación de Streaming
- ⏳ Error boundaries mejorados

### Próximas Mejoras

1. **Performance**
   - Implementar ISR para páginas estáticas
   - Optimizar bundle size
   - Mejorar FCP y LCP

2. **UX**
   - Skeleton loaders
   - Optimistic updates
   - Mejor feedback visual

3. **Accesibilidad**
   - WCAG 2.2 AA compliance
   - Navegación por teclado
   - Screen reader support

## 🚨 Configuración de Entorno

### Variables de Entorno Requeridas

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
NEXT_PUBLIC_SENTRY_DSN=xxx
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=xxx
```

## 📝 Guías de Desarrollo

### Agregar Nueva Página

```typescript
// 1. Crear carpeta en app/
// 2. Agregar page.tsx
// 3. Implementar metadata
// 4. Agregar loading.tsx si necesario
// 5. Proteger con AuthGuard si es privada
```

### Crear Componente 3D

```typescript
// 1. Usar @react-three/fiber
// 2. Implementar lazy loading
// 3. Agregar fallback 2D
// 4. Optimizar geometrías y texturas
// 5. Testear en dispositivos móviles
```

### Implementar Nueva Feature

```typescript
// 1. Crear branch feature/
// 2. Implementar componentes en components/
// 3. Agregar hooks en hooks/
// 4. Conectar con API
// 5. Agregar tests
// 6. Documentar en CLAUDE.md
```

## 🧪 Testing

### E2E Tests con Playwright

```bash
# Instalar Playwright
pnpm playwright:install

# Ejecutar tests
pnpm exec playwright test

# Modo UI
pnpm exec playwright test --ui
```

### Casos de Prueba Críticos

1. **Flujo de Login**
2. **Redirección por Roles**
3. **Anamnesis Completa**
4. **Navegación 3D**
5. **Formularios Médicos**

Esta aplicación es el corazón de la plataforma AltaMedica, proporcionando una experiencia de usuario excepcional con tecnología de punta en visualización 3D y una arquitectura robusta para el manejo de datos médicos sensibles.

## 🔧 Unificación de Next Config (HIPAA)

- Esta app ahora consume un preset compartido: `@altamedica/config-next`.
- Beneficios: headers HIPAA y CSP consistentes, menos duplicación, ajustes automáticos en dev.
- Archivo afectado: `next.config.js` usa `createNextConfig({ appName: 'web-app' })` con overrides locales.
