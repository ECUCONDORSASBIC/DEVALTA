# 🔧 AltaMedica API Server

**Puerto:** 3001 | **Tipo:** Backend API | **Framework:** Next.js API Routes

## ⚠️ REGLA FUNDAMENTAL: USAR PACKAGES CENTRALIZADOS

### 🚫 **LO QUE NO DEBES HACER:**
```typescript
// ❌ NUNCA crear servicios que ya existen
export class PatientService {
  // Ya existe en @altamedica/api-client - PROHIBIDO
}

// ❌ NUNCA implementar validadores duplicados
export function validateEmail() {
  // Ya existe en @altamedica/utils - PROHIBIDO  
}

// ❌ NUNCA crear tipos médicos duplicados
interface Patient {
  // Ya existe en @altamedica/types - PROHIBIDO
}
```

### ✅ **LO QUE SÍ DEBES HACER:**
```typescript
// ✅ SIEMPRE importar desde packages centralizados
import { PatientService, AppointmentService } from '@altamedica/api-client';
import { validateEmail, hashPassword } from '@altamedica/utils';
import { Patient, Appointment, MedicalRecord } from '@altamedica/types';
import { authenticateUser } from '@altamedica/auth';
```

## 📦 **PASO 1: REVISAR PACKAGES DISPONIBLES**

**ANTES de escribir cualquier código de API, verifica estos packages:**

### 🔌 API Client (`@altamedica/api-client`)
```bash
# Ver servicios disponibles
cd ../../packages/api-client/src
ls -la

# Servicios principales:
# - PatientService, AppointmentService
# - AuthService, NotificationService
# - TelemedicineService, PrescriptionService
```

### 🔐 Autenticación (`@altamedica/auth`)
```bash
# Ver middleware de auth disponible
cd ../../packages/auth/src
ls -la

# Componentes de auth:
# - JWT validation, Role checking
# - Session management, HIPAA compliance
```

### 🗃️ Database (`@altamedica/database`)
```bash
# Ver modelos y servicios de DB
cd ../../packages/database/src
ls -la

# Servicios de base de datos:
# - Prisma models, DB operations
# - Query optimization, Migrations
```

## 🚀 **Configuración de Desarrollo**

### Instalación
```bash
pnpm install
```

### Desarrollo
```bash
pnpm dev  # Puerto 3001
```

### Build
```bash
pnpm build
```

## 🏗️ **Arquitectura de la API**

```
src/
├── app/api/             # API Routes (Next.js 13+)
│   ├── v1/             # API v1 endpoints
│   │   ├── auth/       # Solo lógica específica de endpoints
│   │   ├── patients/   # Usar @altamedica/api-client
│   │   └── appointments/
│   └── health/         # Health checks específicos
├── middleware/         # Solo middleware ESPECÍFICO del servidor
├── lib/                # Configuración específica del servidor
└── services/           # Solo servicios ESPECÍFICOS del servidor
```

## ✅ **Checklist Antes de Desarrollar Endpoints**

### 📋 **OBLIGATORIO - Verificar Packages Primero:**
- [ ] ¿El servicio ya existe en `@altamedica/api-client`?
- [ ] ¿El middleware ya existe en `@altamedica/auth`?
- [ ] ¿La validación ya existe en `@altamedica/utils`?
- [ ] ¿Los tipos ya existen en `@altamedica/types`?

### 📋 **Solo si NO existe en packages:**
- [ ] ¿Es específico del servidor API?
- [ ] ¿Es lógica de routing/endpoints únicamente?
- [ ] ¿Está documentado por qué es específico?

## 🎯 **Funcionalidades Específicas del API Server**

### Endpoints API-Específicos
```typescript
// ✅ CORRECTO - Lógica específica de endpoints
export async function GET(request: NextRequest) {
  // Usar servicios centralizados
  const patientService = new PatientService();
  const patients = await patientService.getAll();
  
  return createSuccessResponse(patients); // De @altamedica/utils
}

// ✅ CORRECTO - Middleware específico del servidor
export function apiRateLimit() {
  // Lógica específica de rate limiting para este servidor
}
```

### Rutas API Disponibles
- **`/api/v1/auth`** - Autenticación y autorización
- **`/api/v1/patients`** - Gestión de pacientes  
- **`/api/v1/appointments`** - Gestión de citas
- **`/api/v1/telemedicine`** - Sesiones de telemedicina
- **`/api/health`** - Health checks del servidor

## 🔗 **Dependencies Principales**

```json
{
  "@altamedica/api-client": "workspace:*",
  "@altamedica/auth": "workspace:*",
  "@altamedica/database": "workspace:*", 
  "@altamedica/utils": "workspace:*",
  "@altamedica/types": "workspace:*"
}
```

## 🛡️ **Seguridad y Autenticación**

### Usar Auth Centralizado
```typescript
// ✅ CORRECTO - Usar middleware centralizado
import { requireAuth, checkRole } from '@altamedica/auth';

export const GET = requireAuth(
  checkRole(['doctor', 'admin'])(
    async function handler(request: NextRequest) {
      // Lógica del endpoint
    }
  )
);
```

### Validación de Datos
```typescript
// ✅ CORRECTO - Usar validadores centralizados
import { validatePatientData } from '@altamedica/utils';
import { PatientSchema } from '@altamedica/types';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = validatePatientData(body, PatientSchema);
  
  if (!validation.success) {
    return createErrorResponse(validation.errors);
  }
  
  // Procesar datos validados...
}
```

## 📊 **Monitoreo y Logs**

### Health Checks
- **`/api/health`** - Estado general del servidor
- **`/api/health/detailed`** - Información detallada del sistema
- **`/api/health/dependencies`** - Estado de dependencias externas

### Métricas Específicas del Servidor
```typescript
// ✅ CORRECTO - Métricas específicas del API server
export function useAPIMetrics() {
  // Solo métricas específicas de este servidor
  // No duplicar métricas que ya están en packages
}
```

## 🚨 **Code Review Checklist**

### ❌ **Rechazar PR si:**
- Implementa servicios que ya existen en @altamedica/api-client
- Duplica middleware de @altamedica/auth
- Crea validadores que ya existen en @altamedica/utils
- No justifica por qué algo es específico del servidor

### ✅ **Aprobar PR si:**
- Usa packages centralizados para toda la lógica
- Solo contiene lógica específica de routing/endpoints
- Implementa middleware específico del servidor
- Está bien documentado y justificado

## 📈 **Performance y Escalabilidad**

### Rate Limiting
```typescript
// ✅ CORRECTO - Específico del servidor
export const rateLimit = {
  '/api/v1/auth': { requests: 10, window: '15m' },
  '/api/v1/patients': { requests: 100, window: '1m' },
  '/api/v1/appointments': { requests: 50, window: '1m' }
};
```

### Caching
```typescript
// ✅ CORRECTO - Cache específico del servidor
export function apiCache(endpoint: string, ttl: number) {
  // Lógica de cache específica para endpoints de este servidor
}
```

---

## 🎯 **RECUERDA:**
> **"EL API SERVER ES SOLO ROUTING - LA LÓGICA ESTÁ EN PACKAGES"**
> 
> Este servidor debe ser principalmente routing y configuración. La lógica de negocio está en los packages centralizados.

## 📞 **Soporte**

- **API Documentation:** `/api/docs` (cuando esté disponible)
- **Health Status:** `/api/health`
- **Issues:** GitHub Issues