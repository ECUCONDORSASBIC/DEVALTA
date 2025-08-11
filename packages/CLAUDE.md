# 📦 CLAUDE.md - Packages Directory Complete Guide

Este archivo proporciona orientación exhaustiva a Claude Code (claude.ai/code) cuando trabaja con los paquetes compartidos del proyecto AltaMedica Platform.

## 🎯 Visión General

contiene **26 paquetes compartidos** que forman la base arquitectónica de toda la plataforma AltaMedica. Estos paquetes proporcionan funcionalidad central, componentes reutilizables, servicios médicos especializados y utilidades que son consumidas por las 7 aplicaciones principales del ecosistema Y ES PRIORIDAD QUE SE EREVISE ANTES DE CREAR ARCHIVOS EN LAS CARPETAS DE LAS APLICACIONES EVITANDO ASI LA DUPLICACION.

## 🏗️ Arquitectura de Paquetes

### Estructura Completa del Directorio

```
C:\Users\Eduardo\Documents\devaltamedica\packages\
│
├── 🔐 AUTENTICACIÓN Y SEGURIDAD
│   ├── auth\                    # SSO, JWT, manejo de sesiones
│   ├── auth-service\            # Capa de servicio de autenticación
│   └── firebase\                # Cliente Firebase y configuración
│       └── firebase-admin\      # SDK Admin para operaciones servidor
│       └── firebase-config\     # Configuración centralizada Firebase
│
├── 🎨 UI Y SISTEMA DE DISEÑO
│   ├── ui\                      # Componentes React + Radix UI + Tailwind
│   └── tailwind-config\         # Configuración Tailwind compartida
│
├── 📊 TIPOS Y VALIDACIÓN
│   ├── types\                   # TypeScript definitions + Zod schemas
│   └── typescript-config\       # Configuración TypeScript base
│
├── 🔗 HOOKS Y ESTADO
│   ├── hooks\                   # Biblioteca completa de React hooks
│   ├── marketplace-hooks\       # Hooks específicos del marketplace B2B
│   └── medical-hooks\           # Hooks especializados médicos
│
├── 🏥 DOMINIO MÉDICO
│   ├── medical\                 # Componentes y utilidades médicas
│   ├── medical-types\           # Tipos específicos médicos
│   ├── medical-services\        # Servicios de dominio médico
│   ├── medical-cache\           # Cache HIPAA-compliant
│   ├── patient-services\        # Servicios especializados pacientes
│   └── telemedicine-core\       # WebRTC y videollamadas médicas
│
├── 🌐 API Y COMUNICACIÓN
│   ├── api-client\              # Cliente API con TanStack Query
│   └── api-helpers\             # Utilidades para respuestas API
│
├── 💾 DATOS Y PERSISTENCIA
│   ├── database\                # Prisma ORM + repositorios
│   └── shared\                  # Servicios y utilidades compartidas
│
├── 🤖 INTELIGENCIA ARTIFICIAL
│   └── ai-agents\               # Agentes IA para diagnóstico
│
├── 🔧 HERRAMIENTAS Y CONFIGURACIÓN
│   ├── utils\                   # Utilidades cross-platform
│   ├── eslint-config\           # Configuración ESLint compartida
│   └── e2e-tests\               # Tests E2E con Playwright
```

## 📦 Detalle de Cada Paquete

### 🔐 **@altamedica/auth** (v1.0.0)

**Propósito**: Sistema de autenticación SSO centralizado con JWT y manejo de sesiones.

```typescript
// Estructura de exports
export {
  // Hooks
  useAuth,
  useSSO,
  useSession,

  // Components
  AuthProvider,
  ProtectedRoute,

  // Services
  ssoClient,
  ssoService,

  // Types
  User,
  AuthState,
  UserRole,
};
```

**Archivos clave**:

- `src/sso-client.ts` - Cliente SSO con fallback localStorage
- `src/sso-service.ts` - Servicio SSO backend
- `src/context/AuthContext.tsx` - Provider de autenticación
- `src/hooks/index.ts` - Hooks de autenticación

**Dependencias workspace**:

- `@altamedica/firebase`
- `@altamedica/shared`

---

### 🎨 **@altamedica/ui** (v1.0.0)

**Propósito**: Sistema de diseño médico basado en Tailwind CSS + Radix UI.

```typescript
// Categorías de componentes
export {
  // Medical Components
  PatientCard,
  AppointmentCard,
  HealthMetricCard,
  VitalSignsChart,

  // Core UI
  Button,
  Card,
  Input,
  Badge,

  // Forms
  MedicalIntakeForm,
  SearchFilter,
  FormError,

  // Dashboard
  MetricCard,
  StatsGrid,
  CustomizableMedicalDashboard,

  // AI Components
  MedicalAIAssistant,
  PredictiveHealthAnalytics,
};
```

**Storybook**: Puerto 6006 para documentación interactiva

```bash
cd packages/ui
pnpm storybook
```

---

### 📊 **@altamedica/types** (v1.0.0)

**Propósito**: Definiciones TypeScript centralizadas con validación Zod.

```typescript
// Estructura modular de exports
import { Patient, PatientSchema } from '@altamedica/types/medical/patient';
import { Doctor, DoctorSchema } from '@altamedica/types/medical/doctor';
import { Appointment } from '@altamedica/types/medical/clinical';
import { APIResponse } from '@altamedica/types/api';
import { HIPAACompliance } from '@altamedica/types/security';
```

**Características**:

- Exports modulares para tree-shaking óptimo
- Esquemas Zod para validación runtime
- Tipos FHIR R4 compliant
- Guards y validators incluidos

---

### 🔗 **@altamedica/hooks** (v1.0.0)

**Propósito**: Biblioteca exhaustiva de React hooks organizados por dominio.

```typescript
// Organización por categorías
export {
  // Medical Domain
  usePatients,
  useMedicalAI,
  useHealthMetrics,

  // Authentication
  useAuth,
  usePermissions,

  // API Integration
  useAltamedicaAPI,
  useOptimistic,
  usePagination,

  // Real-time
  useWebSocket,
  useNotifications,
  useRealTimeUpdates,

  // UI/UX
  useTheme,
  useToast,
  useModal,
  useAccessibility,

  // Utils
  useDebounce,
  useLocalStorage,
  useMediaQuery,
  useAsync,
};
```

**Sub-exports disponibles**:

- `/medical` - Hooks médicos
- `/auth` - Hooks de autenticación
- `/api` - Hooks de integración API
- `/realtime` - Hooks tiempo real
- `/ui` - Hooks de interfaz
- `/utils` - Hooks utilitarios
- `/performance` - Hooks de optimización
- `/forms` - Hooks de formularios
- `/composed` - Hooks compuestos

---

### 🏥 **@altamedica/medical** (v1.0.0)

**Propósito**: Componentes y utilidades del dominio médico.

```typescript
// Estructura del paquete
packages/medical/
├── src/
│   ├── components/       # Componentes médicos React
│   ├── hooks/           # Hooks especializados médicos
│   ├── utils/           # Cálculos y validaciones médicas
│   ├── types/           # Tipos del dominio médico
│   └── config/          # Configuración médica (FHIR, etc)
```

**Utilidades médicas**:

- Cálculos BMI, dosis medicamentos
- Validación datos clínicos
- Formateo fechas médicas
- Conversiones unidades médicas

---

### 🌐 **@altamedica/api-client** (v1.0.0)

**Propósito**: Cliente API unificado con TanStack Query y caché inteligente.

```typescript
// Hooks disponibles
export {
  // Domain hooks
  useAppointments,
  usePatients,
  useDoctors,
  usePrescriptions,
  useTelemedicine,

  // Optimistic updates
  useOptimisticAppointments,

  // Core client
  apiClient,

  // Cache strategies
  cacheStrategies,
};
```

**Características**:

- Manejo automático de errores
- Reintentos configurables
- Caché con invalidación inteligente
- Optimistic updates para UX fluida
- Type-safe con tipos de `@altamedica/types`

---

### 💾 **@altamedica/database** (v1.0.0)

**Propósito**: Capa de acceso a datos con Prisma ORM y repositorios.

```typescript
// Estructura de repositorios
export {
  // Repositories
  PatientRepository,
  MedicalRecordRepository,
  BaseRepository,

  // Services
  CompanyService,
  B2CCommunicationService,

  // Core
  DatabaseConnection,

  // Schemas
  appointmentSchemas,
  medicalSchemas,
  userSchemas,
};
```

**Características**:

- Patrón Repository para abstracción de datos
- Soporte Firebase y PostgreSQL
- Schemas Zod para validación
- Auditoría HIPAA integrada

---

### 📡 **@altamedica/telemedicine-core** (v1.0.0)

**Propósito**: Implementación WebRTC para videollamadas médicas.

```typescript
// API principal
export {
  // Hooks
  useTelemedicineUnified,
  useWebRTC,

  // Services
  videoCallClient,
  webrtcService,

  // Types
  TelemedicineSession,
  WebRTCConfig,
};
```

**Características**:

- Latencia optimizada <100ms
- Soporte STUN/TURN
- Grabación de sesiones (HIPAA compliant)
- Calidad adaptativa según bandwidth

---

### 🤖 **@altamedica/ai-agents** (v1.0.0)

**Propósito**: Agentes IA para diagnóstico y análisis médico.

```typescript
// Servicios disponibles
export { aiAgentsService, diagnosticAgent, symptomAnalyzer, drugInteractionChecker };
```

---

### 🔧 **@altamedica/utils** (v1.0.0)

**Propósito**: Utilidades cross-platform y helpers.

```typescript
export {
  // Funciones
  cn, // Class names utility
  formatting, // Formateo de datos
  validation, // Validaciones comunes
  storage, // LocalStorage wrapper

  // Hooks utilitarios
  useDebounce,
  useLocalStorage,
  useMediaQuery,

  // Servicios
  ApiOptimizationMiddleware,
  RedirectManager,
  TechnicalKnowledgeService,
};
```

---

### 🛠️ **@altamedica/shared** (v1.0.0)

**Propósito**: Servicios y constantes compartidas entre aplicaciones.

```typescript
export {
  // Services
  adminService,
  jwtService,
  notificationService,
  paymentService,

  // Constants
  API_ENDPOINTS,
  USER_ROLES,

  // Types
  UserRoles,
  Roles,
};
```

---

### 🏥 **@altamedica/patient-services** (v1.0.0)

**Propósito**: Servicios especializados para gestión de pacientes.

---

### 🏪 **@altamedica/marketplace-hooks** (v1.0.0)

**Propósito**: Hooks específicos del marketplace B2B.

```typescript
export {
  useCompanyProfile,
  useDoctorProfile,
  useJobApplications,
  useMarketplaceAnalytics,
  useMarketplaceJobs,
  useMarketplaceMessaging,
};
```

---

### 🔧 Paquetes de Configuración

- **@altamedica/typescript-config** - Configuración TypeScript base
- **@altamedica/eslint-config** - Reglas ESLint compartidas
- **@altamedica/tailwind-config** - Tema y configuración Tailwind

## 🚀 Comandos de Desarrollo

### Comandos Globales (desde la raíz)

```bash
# Construir todos los paquetes
pnpm build

# Construir paquete específico
pnpm --filter @altamedica/[package-name] build

# Ejecutar tests en todos los paquetes
pnpm test

# Linting global
pnpm lint

# Type checking global
pnpm type-check
```

### Comandos por Paquete

```bash
# Navegar al paquete
cd packages/[package-name]

# Desarrollo con watch mode
pnpm dev
pnpm build:watch

# Testing
pnpm test
pnpm test:watch
pnpm test:coverage

# Linting y formato
pnpm lint
pnpm lint:fix

# Type checking
pnpm type-check

# Limpieza
pnpm clean
```

### Comandos Especializados

```bash
# UI Package - Storybook
cd packages/ui
pnpm storybook          # Desarrollo
pnpm build-storybook    # Build producción

# Types Package - Bundle analysis
cd packages/types
pnpm analyze-bundle

# Hooks Package - Storybook
cd packages/hooks
pnpm storybook
```

## 📐 Patrones de Arquitectura

### Estructura Estándar de Paquete

```
packages/[package-name]/
├── src/
│   ├── index.ts              # Export principal
│   ├── components/           # Componentes React (si aplica)
│   │   ├── ComponentName.tsx
│   │   └── index.ts
│   ├── hooks/               # Custom hooks (si aplica)
│   │   ├── useHookName.ts
│   │   └── index.ts
│   ├── services/            # Lógica de negocio
│   │   ├── ServiceName.ts
│   │   └── index.ts
│   ├── utils/               # Funciones utilitarias
│   │   ├── helpers.ts
│   │   └── index.ts
│   ├── types/               # TypeScript types
│   │   ├── index.ts
│   │   └── domain.types.ts
│   └── constants/           # Constantes
│       └── index.ts
│
├── __tests__/               # Tests unitarios
│   ├── components/
│   ├── hooks/
│   └── utils/
│
├── stories/                 # Storybook (para UI packages)
│   └── Component.stories.tsx
│
├── dist/                    # Build output (generado)
│   ├── index.js
│   ├── index.esm.js
│   └── index.d.ts
│
├── package.json             # Configuración del paquete
├── tsconfig.json           # TypeScript config
├── tsconfig.esm.json       # ESM build config
├── README.md               # Documentación
└── CHANGELOG.md            # Historial de cambios
```

### Convenciones de Export

```typescript
// index.ts - Export principal
export * from './components';
export * from './hooks';
export * from './types';
export * from './utils';

// Sub-exports en package.json
{
  "exports": {
    ".": "./src/index.ts",
    "./components": "./src/components/index.ts",
    "./hooks": "./src/hooks/index.ts",
    "./types": "./src/types/index.ts",
    "./utils": "./src/utils/index.ts"
  }
}
```

### Patrones de Importación

```typescript
// Importación principal
import { Button, Card } from '@altamedica/ui';

// Importación modular (tree-shaking optimizado)
import { usePatients } from '@altamedica/hooks/medical';
import { PatientSchema } from '@altamedica/types/medical/patient';

// Importación de tipos
import type { Patient, Doctor } from '@altamedica/types';
```

## 🔄 Flujo de Dependencias

### Jerarquía de Dependencias

```
Nivel 0 (Sin dependencias):
├── typescript-config
├── eslint-config
├── tailwind-config
└── utils

Nivel 1 (Dependencias básicas):
├── types (usa: typescript-config)
├── medical-types (usa: types)
└── shared (usa: types)

Nivel 2 (Dependencias intermedias):
├── firebase (usa: types, shared)
├── firebase-admin (usa: firebase)
├── firebase-config (usa: firebase)
├── auth (usa: firebase, shared)
└── database (usa: types, shared)

Nivel 3 (Dependencias complejas):
├── ui (usa: types, utils, tailwind-config)
├── hooks (usa: types, auth, firebase)
├── api-client (usa: types, auth, hooks)
├── medical (usa: types, medical-types)
└── medical-hooks (usa: medical, hooks)

Nivel 4 (Alto nivel):
├── auth-service (usa: auth, database)
├── patient-services (usa: medical, database)
├── medical-services (usa: medical, patient-services)
├── marketplace-hooks (usa: hooks, api-client)
└── telemedicine-core (usa: hooks, medical-hooks)

Nivel 5 (Integración):
└── ai-agents (usa: medical, api-client, types)
```

### Reglas de Dependencia

1. **No circular dependencies** - Los paquetes no pueden tener dependencias circulares
2. **Dependency direction** - Las dependencias fluyen de alto nivel a bajo nivel
3. **Workspace protocol** - Usar `workspace:*` para dependencias internas
4. **Peer dependencies** - React y React-DOM son peer dependencies

## 🧪 Testing Strategy

### Tipos de Tests por Paquete

```bash
# Unit Tests (todos los paquetes)
pnpm test

# Integration Tests (paquetes con API)
pnpm test:integration

# Component Tests (paquetes UI)
pnpm test:components

# Hook Tests (paquetes con hooks)
pnpm test:hooks

# Medical Tests (paquetes médicos)
pnpm test:medical

# E2E Tests (desde e2e-tests package)
cd packages/e2e-tests
pnpm test:e2e
```

### Coverage Requirements

- **Minimum coverage**: 80% para utilidades
- **Medical packages**: 95% coverage requerido
- **UI components**: 90% coverage + tests de accesibilidad
- **Hooks**: 85% coverage + tests de edge cases

## 🔒 Seguridad y Compliance

### HIPAA Compliance en Paquetes

**Paquetes críticos para HIPAA**:

- `@altamedica/auth` - Autenticación y autorización
- `@altamedica/medical-cache` - Cache de datos PHI
- `@altamedica/database` - Persistencia de datos médicos
- `@altamedica/telemedicine-core` - Comunicación segura

**Requisitos**:

1. Encriptación AES-256-GCM para PHI
2. Audit logging en todas las operaciones médicas
3. Access control basado en roles
4. Data retention policies implementadas

### Security Checklist

- [ ] No hardcoded credentials
- [ ] Environment variables para configuración sensible
- [ ] Input validation con Zod schemas
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS protection en componentes UI
- [ ] CSRF tokens en formularios
- [ ] Rate limiting en API client
- [ ] Secure session management

## 🐛 Troubleshooting

### Problemas Comunes

**Build failures**:

```bash
# Limpiar y reconstruir
pnpm clean
pnpm install
pnpm build
```

**Type errors entre paquetes**:

```bash
# Verificar versiones de TypeScript
pnpm why typescript

# Reconstruir tipos
pnpm --filter @altamedica/types build
```

**Import resolution issues**:

```bash
# Verificar exports en package.json
# Verificar que el build se completó
cd packages/[package-name]
ls dist/  # Debe contener archivos .js y .d.ts
```

**Workspace dependency issues**:

```bash
# Actualizar lockfile
pnpm install --force

# Verificar workspace protocol
grep "workspace:" packages/*/package.json
```

## 📊 Métricas de Paquetes

### Estadísticas Actuales

- **Total de paquetes**: 26
- **Líneas de código**: ~75,000
- **Componentes React**: 150+
- **Hooks personalizados**: 80+
- **Tipos TypeScript**: 200+
- **Tests**: 800+
- **Coverage promedio**: 82%

### Tamaño de Bundles

| Paquete                | Size (min) | Size (gzip) |
| ---------------------- | ---------- | ----------- |
| @altamedica/ui         | 145 KB     | 42 KB       |
| @altamedica/hooks      | 89 KB      | 28 KB       |
| @altamedica/types      | 35 KB      | 11 KB       |
| @altamedica/auth       | 67 KB      | 21 KB       |
| @altamedica/medical    | 112 KB     | 36 KB       |
| @altamedica/api-client | 78 KB      | 24 KB       |

## 🚀 Mejores Prácticas

### Desarrollo de Nuevos Paquetes

1. **Naming**: `@altamedica/[domain]-[function]`
2. **Structure**: Seguir estructura estándar
3. **Exports**: Definir exports claros en package.json
4. **Types**: Incluir tipos TypeScript
5. **Tests**: Mínimo 80% coverage
6. **Docs**: README completo con ejemplos
7. **Changelog**: Mantener CHANGELOG.md actualizado

### Versionado

- Usar SemVer estricto
- Breaking changes requieren major version bump
- Features nuevas: minor version
- Bug fixes: patch version
- Todos los paquetes están en v1.0.0 actualmente

### Performance

- Tree-shaking habilitado con sideEffects: false
- Lazy loading para componentes pesados
- Memoización en hooks costosos
- Code splitting en puntos naturales

## 📝 Notas para Windows Development

### Consideraciones Especiales

```json
// Scripts en package.json compatibles con Windows
{
  "scripts": {
    "clean": "powershell -Command \"Remove-Item -Path dist -Recurse -Force -ErrorAction SilentlyContinue\"",
    "build": "tsc"
  }
}
```

### Path Handling

- Usar `path.join()` en lugar de concatenación
- Forward slashes funcionan en Windows Node.js
- Evitar comandos bash/Unix en scripts

Esta documentación exhaustiva proporciona todo lo necesario para trabajar eficientemente con los paquetes compartidos de AltaMedica Platform, asegurando consistencia, calidad y cumplimiento médico en todo el ecosistema.

## Cambios recientes de arquitectura

- Autenticación unificada: estandarizamos nombres de cookies de sesión a `altamedica_token` y `altamedica_refresh` con compatibilidad temporal para `auth-token`/`refresh-token`. Usa `@altamedica/auth` → `AUTH_COOKIES` y `LEGACY_AUTH_COOKIES`.
- Cumplimiento HIPAA: evita almacenar tokens en localStorage/sessionStorage. El api-server escribe cookies HttpOnly/Secure.
- Corrección de build en @altamedica/api-helpers: se añadió `@types/minimatch` como dependencia de desarrollo.
