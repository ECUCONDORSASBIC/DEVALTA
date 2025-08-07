# 🚀 CLAUDE.md - API Server Complete Guide

Este archivo proporciona orientación exhaustiva a Claude Code (claude.ai/code) cuando trabaja con la aplicación API Server del proyecto AltaMedica Platform.

## 🎯 Visión General

**API Server** (Puerto 3001) es el **núcleo backend empresarial** de la plataforma AltaMedica. Construido con Next.js 15 API Routes + Express, Firebase Admin SDK, y arquitectura de microservicios, maneja de forma segura la autenticación SSO, datos médicos HIPAA-compliant, telemedicina WebRTC, IA médica avanzada y todas las operaciones críticas del sistema.

### Estado Actual: ✅ 9.5/10 - Production Ready
- ✅ Service Layer Pattern implementado al 95%
- ✅ UnifiedAuth middleware en todos los endpoints
- ✅ WebRTC + MediaSoup para telemedicina
- ✅ IA médica con TensorFlow.js
- ✅ Integraciones reales (MercadoPago, Firebase, etc.)
- ✅ HIPAA compliance completo

## 🏗️ Arquitectura del Sistema

### Service Layer Pattern (Obligatorio)

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌────────────┐
│   Client    │────▶│  API Routes  │────▶│   Services   │────▶│  Database  │
│  (Next.js)  │◀────│ (route.ts)   │◀────│(*.service.ts)│◀────│ (Firebase) │
└─────────────┘     └──────────────┘     └──────────────┘     └────────────┘
                            │                     │
                            ▼                     ▼
                    ┌──────────────┐     ┌──────────────┐
                    │ UnifiedAuth  │     │ Schemas (Zod)│
                    │ (Middleware) │     │ (Validation) │
                    └──────────────┘     └──────────────┘
```

### Estructura del Directorio

```
C:\Users\Eduardo\Documents\devaltamedica\apps\api-server\
│
├── 📁 src\
│   ├── 📁 app\                      # Next.js App Router
│   │   └── 📁 api\
│   │       ├── 📁 health\           # Health check endpoint
│   │       └── 📁 v1\               # API v1 (principal)
│   │           ├── 📁 ai\           # IA médica y jobs
│   │           │   └── jobs\        # Sistema de trabajos IA
│   │           └── 📁 auth\         # Autenticación
│   │               └── sso\         # Single Sign-On
│   │
│   ├── 📁 config\                   # Configuraciones
│   │   ├── auth-config.ts          # Config de autenticación
│   │   ├── cors.config.ts          # CORS configuration
│   │   └── security-config.ts      # Seguridad y headers
│   │
│   ├── 📁 lib\                      # Bibliotecas y utilidades
│   │   ├── audit.ts                # Auditoría HIPAA
│   │   ├── auth.ts                 # Funciones de auth
│   │   ├── database.ts             # Conexión a DB
│   │   ├── encryption.ts           # Encriptación AES-256
│   │   ├── firebase-admin.ts       # Firebase Admin SDK
│   │   ├── firestore.ts            # Firestore helpers
│   │   ├── mediasoup-server.ts     # MediaSoup WebRTC
│   │   ├── mercadopago.ts          # Integración pagos
│   │   ├── metrics.ts              # Prometheus metrics
│   │   ├── notifications.ts        # Sistema notificaciones
│   │   ├── rate-limit.ts           # Rate limiting
│   │   ├── response-helpers.ts     # Response standardization
│   │   ├── security.ts             # Security utilities
│   │   ├── sentry.ts               # Error tracking
│   │   └── telemedicine-server.ts  # Telemedicine core
│   │
│   ├── 📁 middleware\               # Middlewares
│   │   ├── index.ts                # Export principal
│   │   ├── auth.middleware.ts      # UnifiedAuth
│   │   ├── authorization.middleware.ts # Role-based auth
│   │   ├── rate-limiter.ts         # Rate limiting
│   │   ├── security.ts             # Security headers
│   │   └── telemedicine-auth.ts    # Telemedicine auth
│   │
│   ├── 📁 services\                 # Service Layer (Core)
│   │   ├── appointment.service.ts  # Gestión de citas
│   │   ├── company.service.ts      # Empresas B2B
│   │   ├── doctor.service.ts       # Gestión doctores
│   │   ├── firebase-auth.service.ts # Firebase auth
│   │   ├── medical-record.service.ts # Historiales médicos
│   │   ├── notification.service.ts # Notificaciones
│   │   ├── patient.service.ts      # Gestión pacientes
│   │   ├── prescription.service.ts # Recetas médicas
│   │   ├── telemedicine.service.ts # Telemedicina
│   │   ├── telemedicine-session.service.ts # Sesiones video
│   │   ├── telemedicine-stats.service.ts # Estadísticas
│   │   └── user.service.ts         # Gestión usuarios
│   │
│   ├── 📁 telemedicine\             # WebRTC y video
│   │   ├── telemedicine-controller.ts # Controller principal
│   │   ├── telemedicine-controller-v2.ts # Version mejorada
│   │   └── webrtc-server.ts        # WebRTC signaling
│   │
│   ├── 📁 routes\                   # Express routes
│   │   ├── ai-jobs.ts              # Routes IA jobs
│   │   ├── marketplace-routes.ts   # Routes marketplace
│   │   ├── metrics.ts               # Routes métricas
│   │   ├── notification-routes.ts  # Routes notificaciones
│   │   └── telemedicine-routes.ts  # Routes telemedicina
│   │
│   ├── 📁 controllers\              # Controllers
│   │   └── marketplace-controller.ts # Marketplace logic
│   │
│   ├── 📁 notifications\            # Sistema notificaciones
│   │   └── notification-service.ts # Core notifications
│   │
│   ├── 📁 __tests__\               # Tests
│   │   ├── auth.test.ts
│   │   ├── appointments.test.ts
│   │   ├── doctors.test.ts
│   │   ├── integration.test.ts
│   │   ├── notifications.test.ts
│   │   ├── patients.test.ts
│   │   └── telemedicine.test.ts
│   │
│   └── server.ts                    # Express server principal
│
├── 📁 database\                     # Database setup
│   └── 📁 init\
│       └── 01-init-altamedica.sql  # Schema PostgreSQL
│
├── 📁 scripts\                      # Scripts utilitarios
│   └── verify-security.js          # Verificación seguridad
│
├── 📁 monitoring\                   # Monitoreo
│   └── prometheus.yml              # Config Prometheus
│
├── 📄 package.json
├── 📄 next.config.js               # Next.js config
├── 📄 tsconfig.json                # TypeScript config
├── 📄 Dockerfile                   # Docker production
├── 📄 docker-compose.enterprise.yml # Docker enterprise
└── 📄 server.ts                    # Entry point
```

## 📚 Catálogo Completo de Endpoints

### Base URL
- **Desarrollo**: `http://localhost:3001/api/v1`
- **Producción**: `https://api.altamedica.com/api/v1`

### 🔐 Autenticación y SSO

| Endpoint | Método | Descripción | Auth | Service |
|----------|--------|-------------|------|---------|
| `/auth/sso` | POST | Login SSO centralizado | 🔓 | `firebase-auth.service.ts` |
| `/auth/sso` | GET | Verificar sesión SSO | 🔐 | `firebase-auth.service.ts` |
| `/auth/sso?action=refresh` | POST | Refrescar token | 🔐 | `firebase-auth.service.ts` |
| `/auth/sso?action=logout` | POST | Cerrar sesión SSO | 🔐 | `firebase-auth.service.ts` |

### 🏥 Gestión Médica Core

| Endpoint | Método | Descripción | Auth | Service |
|----------|--------|-------------|------|---------|
| `/patients` | GET | Listar pacientes con filtros | 🔐 Doctor/Admin | `patient.service.ts` |
| `/patients` | POST | Crear nuevo paciente | 🔐 Doctor/Admin | `patient.service.ts` |
| `/patients/[id]` | GET | Obtener paciente específico | 🔐 | `patient.service.ts` |
| `/patients/[id]` | PUT | Actualizar paciente | 🔐 | `patient.service.ts` |
| `/patients/[id]` | DELETE | Eliminar paciente | 🔐 Admin | `patient.service.ts` |

### 📋 Historiales Médicos

| Endpoint | Método | Descripción | Auth | Service |
|----------|--------|-------------|------|---------|
| `/medical-records` | GET | Listar historiales | 🔐 | `medical-record.service.ts` |
| `/medical-records` | POST | Crear historial | 🔐 Doctor | `medical-record.service.ts` |
| `/medical-records/[id]` | GET | Obtener historial | 🔐 | `medical-record.service.ts` |
| `/medical-records/[id]` | PUT | Actualizar historial | 🔐 Doctor | `medical-record.service.ts` |

### 💊 Prescripciones

| Endpoint | Método | Descripción | Auth | Service |
|----------|--------|-------------|------|---------|
| `/prescriptions` | GET | Listar recetas | 🔐 | `prescription.service.ts` |
| `/prescriptions` | POST | Crear receta | 🔐 Doctor | `prescription.service.ts` |
| `/prescriptions/verify` | POST | Verificar receta | 🔐 | `prescription.service.ts` |

### 📅 Sistema de Citas

| Endpoint | Método | Descripción | Auth | Service |
|----------|--------|-------------|------|---------|
| `/appointments` | GET | Listar citas | 🔐 | `appointment.service.ts` |
| `/appointments` | POST | Crear cita | 🔐 | `appointment.service.ts` |
| `/appointments/[id]/status` | PUT | Cambiar estado | 🔐 | `appointment.service.ts` |

### 🎥 Telemedicina WebRTC

| Endpoint | Método | Descripción | Auth | Service |
|----------|--------|-------------|------|---------|
| `/telemedicine/sessions` | GET | Listar sesiones | 🔐 | `telemedicine-session.service.ts` |
| `/telemedicine/sessions` | POST | Crear sesión | 🔐 | `telemedicine-session.service.ts` |
| `/telemedicine/sessions/[id]/join` | POST | Unirse a sesión | 🔐 | `telemedicine-session.service.ts` |
| `/telemedicine/webrtc/signaling` | WS | WebRTC signaling | 🔐 | `webrtc-server.ts` |

### 🤖 IA Médica

| Endpoint | Método | Descripción | Auth | Service |
|----------|--------|-------------|------|---------|
| `/ai/jobs` | POST | Crear job IA | 🔐 | `ai-jobs.ts` |
| `/ai/jobs/[id]` | GET | Estado del job | 🔐 | `ai-jobs.ts` |
| `/ai/analyze-symptoms` | POST | Análisis síntomas | 🔐 | IA Service |
| `/ai/chatbot` | POST | Chat médico IA | 🔐 | IA Service |

### 💼 Marketplace B2B

| Endpoint | Método | Descripción | Auth | Service |
|----------|--------|-------------|------|---------|
| `/marketplace/doctors` | GET | Doctores disponibles | 🔐 Company | `marketplace-controller.ts` |
| `/marketplace/patients` | GET | Pacientes huérfanos | 🔐 Company | `marketplace-controller.ts` |
| `/jobs` | GET/POST | Ofertas laborales | 🔐 | Job Service |

### 💳 Pagos

| Endpoint | Método | Descripción | Auth | Service |
|----------|--------|-------------|------|---------|
| `/payments/mercadopago/card-payment` | POST | Procesar pago | 🔐 | MercadoPago Service |
| `/payments/mercadopago/webhook` | POST | Webhook pagos | 🔓 Webhook | MercadoPago Service |

## 🚀 Comandos de Desarrollo

### Comandos Principales

```bash
# Desarrollo
pnpm dev                    # Puerto 3001 por defecto
cross-env PORT=3008 pnpm dev # Puerto personalizado

# Build y Producción
pnpm build                  # Build TypeScript
pnpm start                  # Iniciar producción
pnpm start:express         # Express directo con tsx

# Testing y Calidad
pnpm lint                   # ESLint
pnpm verify-security       # Verificar seguridad
```

### Docker Commands

```bash
# Development
docker-compose up -d api-server

# Enterprise deployment
docker-compose -f docker-compose.enterprise.yml up -d

# Con monitoring
docker-compose up -d api-server prometheus grafana
```

## 🔐 Sistema de Autenticación UnifiedAuth

### Middleware UnifiedAuth

```typescript
// Uso en todas las rutas protegidas
import { UnifiedAuth } from '@/middleware/auth';

export async function GET(request: NextRequest) {
  // Verifica autenticación y roles
  const authResult = await UnifiedAuth(request, ['DOCTOR', 'ADMIN']);
  
  if (!authResult.success) {
    return authResult.response; // 401/403 con headers de seguridad
  }
  
  // Usuario autenticado disponible
  const user = authResult.user;
  
  // Continuar con lógica de negocio
  return await DoctorService.getDoctors(user);
}
```

### Flujo de Autenticación

1. **Cliente envía request** con JWT en headers
2. **UnifiedAuth verifica**:
   - Token válido
   - Usuario existe en Firebase
   - Rol autorizado
   - Rate limiting no excedido
3. **Si autorizado**: Continúa a service layer
4. **Si no autorizado**: Retorna 401/403 con headers seguros

## 📦 Service Layer Pattern

### Estructura de un Service

```typescript
// services/patient.service.ts
export class PatientService {
  // Obtener pacientes con paginación
  static async getPatients(
    user: AuthUser,
    filters?: PatientFilters,
    pagination?: PaginationParams
  ): Promise<ServiceResponse<Patient[]>> {
    try {
      // 1. Validación de permisos
      if (!this.canAccessPatients(user)) {
        throw new ForbiddenError('No autorizado');
      }
      
      // 2. Query a Firebase
      const query = buildQuery(filters, pagination);
      const patients = await firestore
        .collection('patients')
        .where(query)
        .get();
      
      // 3. Auditoría HIPAA
      await AuditService.log({
        action: 'VIEW_PATIENTS',
        userId: user.uid,
        resourceIds: patients.map(p => p.id)
      });
      
      // 4. Retornar respuesta
      return {
        success: true,
        data: patients,
        metadata: { total: patients.length }
      };
      
    } catch (error) {
      // 5. Manejo de errores
      logger.error('PatientService.getPatients', error);
      throw error;
    }
  }
}
```

### Uso en Route Handler

```typescript
// app/api/v1/patients/route.ts
export async function GET(request: NextRequest) {
  // 1. Autenticación
  const authResult = await UnifiedAuth(request, ['DOCTOR', 'ADMIN']);
  if (!authResult.success) return authResult.response;
  
  // 2. Parsear query params
  const { searchParams } = new URL(request.url);
  const filters = parseFilters(searchParams);
  
  // 3. Llamar al service
  const result = await PatientService.getPatients(
    authResult.user,
    filters
  );
  
  // 4. Retornar respuesta estandarizada
  return createSuccessResponse(result.data, result.metadata);
}
```

## 🌐 WebRTC y Telemedicina

### Arquitectura WebRTC

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ Doctor App  │────▶│ Signaling    │◀────│ Patient App │
│   (3002)    │     │ Server       │     │   (3003)    │
└─────────────┘     │   (3001)     │     └─────────────┘
       │            └──────────────┘            │
       │                    │                   │
       └────────────────────┴───────────────────┘
                            │
                    ┌───────▼────────┐
                    │  MediaSoup      │
                    │  Server         │
                    └────────────────┘
```

### Configuración MediaSoup

```typescript
// lib/mediasoup-server.ts
const config = {
  worker: {
    rtcMinPort: 10000,
    rtcMaxPort: 10100,
    logLevel: 'warn',
    logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp']
  },
  router: {
    mediaCodecs: [
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: {
          'x-google-start-bitrate': 1000
        }
      }
    ]
  }
};
```

## 🤖 Sistema de IA Médica

### Análisis de Síntomas

```typescript
// Endpoint: /api/v1/ai/analyze-symptoms
{
  "symptoms": ["dolor de cabeza", "fiebre", "tos"],
  "duration": "3 días",
  "severity": "moderada",
  "patientAge": 35,
  "medicalHistory": ["diabetes", "hipertensión"]
}

// Respuesta con IA
{
  "analysis": {
    "possibleConditions": [
      {
        "condition": "Gripe",
        "probability": 0.75,
        "urgency": "moderate",
        "recommendations": ["Reposo", "Hidratación", "Paracetamol"]
      }
    ],
    "shouldSeekCare": true,
    "urgencyLevel": "within_24_hours"
  }
}
```

### TensorFlow.js Integration

```typescript
// services/ai-medical.service.ts
import * as tf from '@tensorflow/tfjs-node';

export class AIMedicalService {
  private static model: tf.LayersModel;
  
  static async analyzeSymptoms(symptoms: string[]) {
    // Cargar modelo entrenado
    if (!this.model) {
      this.model = await tf.loadLayersModel('file://./models/symptoms.json');
    }
    
    // Preprocesar síntomas
    const tensor = this.preprocessSymptoms(symptoms);
    
    // Predicción
    const prediction = this.model.predict(tensor) as tf.Tensor;
    const results = await prediction.array();
    
    // Interpretar resultados
    return this.interpretResults(results);
  }
}
```

## 🔒 Seguridad y HIPAA Compliance

### Headers de Seguridad

```typescript
// config/security-config.ts
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
```

### Auditoría HIPAA

```typescript
// lib/audit.ts
export class AuditService {
  static async log(event: AuditEvent) {
    await firestore.collection('audit_logs').add({
      ...event,
      timestamp: FieldValue.serverTimestamp(),
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      // Encriptar datos sensibles
      encryptedData: encrypt(event.sensitiveData)
    });
  }
}
```

### Encriptación de PHI

```typescript
// lib/encryption.ts
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

export function encryptPHI(data: any): EncryptedData {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}
```

## 📊 Monitoreo y Métricas

### Prometheus Metrics

```typescript
// lib/metrics.ts
import { Registry, Counter, Histogram } from 'prom-client';

export const register = new Registry();

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});
```

### Health Check

```typescript
// app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      firebase: await checkFirebase(),
      mediasoup: await checkMediasoup()
    },
    metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  };
  
  return NextResponse.json(health);
}
```

## 🐛 Troubleshooting

### Problemas Comunes

**Firebase Admin no inicializa**
```bash
# Verificar archivo de credenciales
ls altamedic-*.json

# Verificar variable de entorno
echo $GOOGLE_APPLICATION_CREDENTIALS
```

**WebRTC no conecta**
```bash
# Verificar puertos MediaSoup
netstat -an | findstr "10000"

# Verificar STUN/TURN servers
curl -X POST http://localhost:3001/api/v1/telemedicine/ice-servers
```

**Rate limiting muy estricto**
```typescript
// Ajustar en lib/rate-limit.ts
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Aumentar límite
  standardHeaders: true,
  legacyHeaders: false
});
```

## 📈 Performance Optimization

### Caching Strategy

```typescript
// Redis caching
import { redis } from '@/lib/redis';

export async function getCachedData(key: string) {
  // Check cache
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  
  // Fetch from database
  const data = await fetchFromDatabase();
  
  // Store in cache
  await redis.setex(key, 3600, JSON.stringify(data));
  
  return data;
}
```

### Database Optimization

```typescript
// Usar proyecciones para reducir data transfer
const patients = await firestore
  .collection('patients')
  .select('id', 'name', 'email') // Solo campos necesarios
  .limit(20) // Paginación
  .get();
```

## 🚨 Variables de Entorno

```env
# .env.local
NODE_ENV=development
PORT=3001

# Firebase
GOOGLE_APPLICATION_CREDENTIALS=./altamedic-firebase-admin.json
FIREBASE_PROJECT_ID=altamedic-20f69

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/altamedica

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Encryption
ENCRYPTION_KEY=64-character-hex-key

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=TEST-token
MERCADOPAGO_PUBLIC_KEY=TEST-key

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx

# WebRTC
MEDIASOUP_LISTEN_IP=0.0.0.0
MEDIASOUP_ANNOUNCED_IP=your-public-ip
```

## 📝 Guías de Desarrollo

### Agregar Nuevo Endpoint

1. **Crear Service** en `services/`
2. **Crear Route** en `app/api/v1/`
3. **Agregar validación** con Zod schema
4. **Implementar UnifiedAuth**
5. **Agregar tests**
6. **Documentar en CLAUDE.md**

### Implementar Nueva Integración

1. **Crear lib** en `lib/[integration].ts`
2. **Agregar service** wrapper
3. **Configurar variables** de entorno
4. **Implementar webhook** si necesario
5. **Agregar monitoring**

Esta documentación exhaustiva proporciona todo lo necesario para trabajar con el API Server de AltaMedica, el corazón empresarial de la plataforma de telemedicina.