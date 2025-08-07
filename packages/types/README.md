# @altamedica/types

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Workspace](https://img.shields.io/badge/Workspace-Package-green)](https://pnpm.io/workspaces)
[![HIPAA Compliant](https://img.shields.io/badge/HIPAA-Compliant-red)](https://www.hhs.gov/hipaa/index.html)

Sistema de tipos TypeScript centralizado para la plataforma AltaMedica. Proporciona validaciones Zod, interfaces TypeScript y tipos médicos especializados que garantizan consistencia y seguridad de tipos en todo el monorepo.

## 🎯 **Propósito**

Este paquete unifica todos los tipos de datos médicos, validaciones y esquemas API utilizados en las aplicaciones de AltaMedica, asegurando:

- **Type Safety**: 100% de cobertura TypeScript en todas las apps
- **Validación centralizada**: Esquemas Zod reutilizables
- **HIPAA Compliance**: Tipos específicos para PHI (Protected Health Information)
- **Consistencia**: Definiciones únicas para toda la plataforma

## 📦 **Instalación**

```bash
# Instalar en workspace (recomendado)
pnpm add @altamedica/types --filter @altamedica/your-app

# O en el package.json de tu app
{
  "dependencies": {
    "@altamedica/types": "workspace:*"
  }
}
```

## 🚀 **Uso Básico**

### **Importar Tipos**
```typescript
import type { 
  User, 
  DoctorProfile, 
  PatientProfile, 
  Appointment,
  MedicalRecord 
} from '@altamedica/types';
```

### **Usar Validaciones Zod**
```typescript
import { 
  validateUser, 
  validateCreateAppointment,
  UserSchema,
  AppointmentSchema 
} from '@altamedica/types';

// Validar datos de entrada
try {
  const validUser = validateUser(userData);
  console.log('✅ Usuario válido:', validUser);
} catch (error) {
  console.error('❌ Datos inválidos:', error.message);
}

// Usar schemas directamente
const result = UserSchema.safeParse(userData);
if (result.success) {
  // Datos válidos - result.data tiene tipos correctos
} else {
  // Manejar errores - result.error.issues
}
```

### **Tipos de API**
```typescript
import type { 
  ApiResponse,
  LoginRequest,
  CreatePatientRequest,
  AppointmentFilters 
} from '@altamedica/types';

// Función de API tipada
async function loginUser(credentials: LoginRequest): Promise<ApiResponse<User>> {
  // ... lógica de login
}
```

## 📋 **Categorías de Tipos**

### 🔐 **Autenticación y Usuarios**
- `User`, `UserRole` - Tipos de usuario base
- `LoginRequest`, `RegisterRequest` - Credenciales de acceso
- `AuthToken`, `RefreshTokenRequest` - Gestión de tokens

### 👨‍⚕️ **Perfiles Médicos**
- `DoctorProfile`, `Specialty` - Información de doctores
- `PatientProfile`, `BloodType` - Datos de pacientes
- `Company` - Empresas y organizaciones médicas

### 📅 **Citas y Consultas**
- `Appointment`, `AppointmentStatus`, `AppointmentType`
- `CreateAppointmentRequest`, `UpdateAppointmentRequest`
- `AppointmentFilters` - Para búsquedas y filtros

### 📝 **Registros Médicos**
- `MedicalRecord`, `MedicalRecordType`, `Priority`
- `LabTestResult`, `Medication`
- `Prescription` - Recetas médicas

### 🌐 **API y Respuestas**
- `ApiResponse`, `ApiError` - Respuestas estándar
- `PaginatedResponse`, `SearchFilters` - Paginación y búsquedas
- `FileUpload` - Gestión de archivos médicos

### 📊 **Analytics y Reportes**
- `AnalyticsData` - Métricas del sistema
- `AnalyticsRequest`, `AnalyticsResponse` - Solicitudes de reportes

## 🏥 **Tipos Médicos Específicos (Argentina)**

### **Datos Médicos Argentinos**
```typescript
import type { 
  PacienteBase, 
  ProvinciaArgentina, 
  ObraSocial, 
  CitaMedica 
} from '@altamedica/types';

// Tipos específicos para Argentina
const paciente: PacienteBase = {
  id: "pac_001",
  numeroHistoriaClinica: "HC001234",
  nombres: "Juan Carlos",
  apellidos: "Pérez González",
  tipoDocumento: "DNI",
  numeroDocumento: "12345678",
  direccion: {
    provincia: "BUENOS_AIRES", // ProvinciaArgentina enum
    ciudad: "La Plata",
    // ... otros campos
  },
  obraSocial: {
    nombre: "OSDE",
    codigoRNOS: "1-0001-0", // Registro Nacional de Obras Sociales
    // ... otros campos
  }
};
```

## 🛡️ **Compliance HIPAA**

Este paquete incluye tipos específicos para cumplir con HIPAA:

```typescript
import type { 
  NivelAccesoPHI, 
  RegistroAuditoria, 
  AccionAuditoria 
} from '@altamedica/types';

// Niveles de acceso a PHI
type AccessLevel = NivelAccesoPHI; // 'COMPLETO' | 'LIMITADO' | 'SOLO_LECTURA' | 'NINGUNO'

// Auditoría automática
const audit: RegistroAuditoria = {
  timestamp: new Date(),
  accion: 'ACCESO_PACIENTE',
  recursoAccedido: 'paciente/12345',
  // ... otros campos de auditoría
};
```

## 📖 **Validaciones Disponibles**

### **Funciones de Validación**
```typescript
// Usuarios
validateUser(data) → User
validateCreateUser(data) → CreateUser
validateUpdateUser(data) → UpdateUser

// Doctores
validateDoctorProfile(data) → DoctorProfile
validateCreateDoctorProfile(data) → CreateDoctorProfile
validateUpdateDoctorProfile(data) → UpdateDoctorProfile

// Pacientes
validatePatientProfile(data) → PatientProfile
validateCreatePatientProfile(data) → CreatePatientProfile
validateUpdatePatientProfile(data) → UpdatePatientProfile

// Citas
validateAppointment(data) → Appointment
validateCreateAppointment(data) → CreateAppointment
validateUpdateAppointment(data) → UpdateAppointment

// Registros médicos
validateMedicalRecord(data) → MedicalRecord
validateCreateMedicalRecord(data) → CreateMedicalRecord
validateUpdateMedicalRecord(data) → UpdateMedicalRecord

// Empresas
validateCompany(data) → Company
validateCreateCompany(data) → CreateCompany
validateUpdateCompany(data) → UpdateCompany
```

## 🔄 **Manejo de Conflictos de Nombres**

Algunos tipos tienen nombres similares entre diferentes módulos. Hemos resuelto esto con aliases:

```typescript
// Tipos con conflictos resueltos
import type {
  ApiResponse,              // Schema Zod principal
  DetailedApiResponse,      // De types/api
  CommonApiResponse,        // De common
  
  ApiError,                 // Schema Zod principal  
  DetailedApiError,         // De types/api
  CommonApiError,           // De common
  
  Location,                 // De types/base
  CommonLocation            // De common
} from '@altamedica/types';
```

## 🏗️ **Estructura del Paquete**

```
packages/types/
├── src/
│   ├── index.ts              # Exportaciones principales
│   ├── api.ts               # Tipos de API client
│   ├── common.ts            # Tipos comunes
│   └── types/
│       ├── api.ts           # Tipos de API detallados
│       ├── base.ts          # Tipos base del sistema
│       └── medical.ts       # Tipos médicos específicos
├── dist/                    # Archivos compilados
├── package.json            
└── README.md               # Esta documentación
```

## 🔧 **Scripts Disponibles**

```bash
# Compilar tipos
pnpm build

# Verificar tipos sin compilar
pnpm type-check

# Limpiar archivos compilados
pnpm clean
```

## 📱 **Aplicaciones que usan este paquete**

- ✅ **API Server** - Validaciones de endpoints
- ✅ **Companies** - Portal de empresas
- ✅ **Admin** - Panel de administración
- ✅ **Doctors** - App de doctores
- ✅ **Patients** - Portal de pacientes
- ✅ **Web App** - Landing page
- ✅ **Signaling Server** - Servidor WebRTC

## 📚 **Ejemplos Prácticos**

### **Crear Cita Médica**
```typescript
import { validateCreateAppointment, AppointmentType } from '@altamedica/types';

const appointmentData = {
  patientId: "pat_123",
  doctorId: "doc_456",
  date: new Date(),
  duration: 30,
  type: "consultation" as AppointmentType,
  isTelemedicine: true,
  symptoms: ["dolor de cabeza", "fiebre"]
};

try {
  const validAppointment = validateCreateAppointment(appointmentData);
  // ✅ Cita válida, enviar a API
} catch (error) {
  // ❌ Datos inválidos
  console.error('Error de validación:', error.message);
}
```

### **Filtrar Doctores**
```typescript
import type { DoctorFilters, Specialty } from '@altamedica/types';

const filters: DoctorFilters = {
  search: "cardiólogo",
  specialties: ["cardiology", "general_practice"] as Specialty[],
  experienceMin: 5,
  page: 1,
  limit: 10,
  sortBy: "experience",
  sortOrder: "desc"
};

// Usar filtros en API call
const doctors = await api.getDoctors(filters);
```

### **Validar Respuesta de API**
```typescript
import { ApiResponseSchema } from '@altamedica/types';

const response = await fetch('/api/patients');
const data = await response.json();

const result = ApiResponseSchema.safeParse(data);
if (result.success) {
  // ✅ Respuesta válida
  console.log('Datos:', result.data.data);
} else {
  // ❌ Respuesta inválida
  console.error('Error API:', result.error.issues);
}
```

## 🤝 **Contribuir**

1. **Agregar nuevos tipos**: Edita los archivos en `src/types/`
2. **Agregar validaciones**: Usa Zod schemas en `src/index.ts`
3. **Compilar**: Ejecuta `pnpm build` antes de commit
4. **Testing**: Asegúrate de que todas las apps compilen sin errores

## 📝 **Notas Importantes**

- ⚠️ **Cambios Breaking**: Cualquier cambio en los tipos existentes debe ser coordinado con todas las apps
- 🔒 **PHI Compliance**: Siempre marca los campos de PHI como opcionales u encriptados
- 🎯 **Performance**: Usa `export type` para evitar imports innecesarios en runtime
- 📊 **Versionado**: Sigue semantic versioning para actualizaciones del paquete

---

**📞 Soporte**: Para dudas sobre tipos o validaciones, consulta con el equipo de desarrollo en el canal #types-support

**🔄 Última actualización**: Enero 2025 - v1.0.0