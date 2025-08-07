# 👤 @altamedica/patient-services

Paquete centralizado para la gestión de servicios de pacientes en toda la plataforma AltaMedica.

## 🎯 Objetivo

Este paquete implementa la **Misión: Unificar servicios de pacientes en package compartido** del audit de oportunidades, consolidando toda la lógica de negocio relacionada con pacientes en un solo lugar reutilizable.

## 📦 Instalación

```bash
pnpm add @altamedica/patient-services
```

## 🚀 Uso Básico

### Crear Servicio de Pacientes

```typescript
import { createPatientsService } from '@altamedica/patient-services';
import { apiClient } from './api-client';

// Crear instancia del servicio
export const patientsService = createPatientsService(apiClient);
```

### Operaciones CRUD

```typescript
// Obtener todos los pacientes
const response = await patientsService.getPatients(1, 20);

// Obtener paciente por ID
const patient = await patientsService.getPatientById('patient-id');

// Crear nuevo paciente
const newPatient = await patientsService.createPatient({
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan@example.com',
  dateOfBirth: '1990-01-01',
});

// Actualizar paciente
const updated = await patientsService.updatePatient('patient-id', {
  phone: '+57 300 123 4567',
});

// Eliminar paciente
const deleted = await patientsService.deletePatient('patient-id');
```

### Utilidades

```typescript
import {
  formatPatientName,
  calculateAge,
  validateEmail,
  getPatientStatusInfo,
  filterPatients,
} from '@altamedica/patient-services';

// Formatear nombre del paciente
const name = formatPatientName(patient);

// Calcular edad
const age = calculateAge('1990-01-01');

// Validar email
const isValidEmail = validateEmail('test@example.com');

// Obtener información de estado con estilos
const statusInfo = getPatientStatusInfo('active');

// Filtrar pacientes localmente
const filtered = filterPatients(patients, 'search term');
```

## 🎣 Hook de React (En aplicaciones Next.js)

```typescript
import { usePatientsNew } from '../hooks/usePatientsNew';

function PatientsComponent() {
  const {
    patients,
    loading,
    error,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient
  } = usePatientsNew({
    page: 1,
    limit: 20,
    autoFetch: true
  });

  return (
    <div>
      {loading && <div>Cargando...</div>}
      {error && <div>Error: {error}</div>}
      {patients.map(patient => (
        <div key={patient.id}>
          {formatPatientName(patient)}
        </div>
      ))}
    </div>
  );
}
```

## 📋 Interfaces Principales

### Patient

```typescript
interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age: number;
  gender?: 'male' | 'female' | 'other';
  bloodType?: string;
  allergies?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  lastVisit: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}
```

### CreatePatientRequest

```typescript
interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  gender?: 'male' | 'female' | 'other';
  bloodType?: string;
  allergies?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
}
```

### ApiClient Interface

```typescript
interface ApiClient {
  get<T>(endpoint: string): Promise<ApiResponse<T>>;
  post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>;
  put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>;
  patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>;
  delete<T>(endpoint: string): Promise<ApiResponse<T>>;
}
```

## 🔧 Configuración

El servicio requiere un cliente API que implemente la interfaz `ApiClient`. Esto permite:

- **Flexibilidad**: Usar cualquier cliente HTTP
- **Testing**: Fácil mocking en pruebas
- **Configuración**: Adaptar a diferentes entornos

## 🎨 Utilidades Incluidas

- `formatPatientName()` - Formatear nombres de pacientes
- `calculateAge()` - Calcular edad desde fecha de nacimiento
- `validateEmail()` - Validar direcciones de email
- `validatePhone()` - Validar números de teléfono
- `formatPhone()` - Formatear teléfonos para mostrar
- `getPatientInitials()` - Obtener iniciales del paciente
- `getPatientStatusInfo()` - Estado con información de estilo
- `hasCompleteProfile()` - Verificar perfil completo
- `getTimeSinceLastVisit()` - Tiempo desde última visita
- `filterPatients()` - Filtrar pacientes localmente
- `groupPatientsByLastName()` - Agrupar por apellido

## ✅ Beneficios

1. **Reutilización**: Mismo código en `patients`, `doctors`, `admin`
2. **Mantenimiento**: Un solo lugar para actualizar lógica
3. **Consistencia**: Comportamiento uniforme en toda la app
4. **Testing**: Fácil de probar de forma aislada
5. **Performance**: Optimizaciones centralizadas

## 🔄 Migración

### Antes (apps/patients/src/services/patients-service.ts)

```typescript
import { apiClient } from './api-client';
// Lógica duplicada en cada app...
```

### Después (apps/patients/src/services/patients-service-new.ts)

```typescript
import { createPatientsService } from '@altamedica/patient-services';
import { apiClient } from './api-client';

export const patientsService = createPatientsService(apiClient);
```

## 📁 Estructura del Paquete

```
packages/patient-services/
├── package.json          # Configuración del paquete
├── tsconfig.json         # Config TypeScript
└── src/
    ├── index.ts          # Punto de entrada principal
    ├── patients.service.ts # Servicio principal
    └── utils.ts          # Utilidades complementarias
```

## 🚧 Estado de Implementación

- ✅ Paquete creado y configurado
- ✅ Servicio principal implementado
- ✅ Utilidades implementadas
- ✅ Integrado en app `patients`
- ✅ Hook de React creado
- ✅ Ejemplo de componente
- ⏳ Pendiente: Integrar en app `doctors`
- ⏳ Pendiente: Eliminar código duplicado
- ⏳ Pendiente: Tests unitarios

## 🧪 Testing

```typescript
import { createPatientsService } from '@altamedica/patient-services';

// Mock del API client
const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

const service = createPatientsService(mockApiClient);

// Test
mockApiClient.get.mockResolvedValue({
  success: true,
  data: { patients: [], total: 0 },
});

const result = await service.getPatients();
expect(result.success).toBe(true);
```

## 📈 Próximos Pasos

1. **Integrar en `doctors` app**
2. **Crear tests unitarios**
3. **Documentar APIs del backend**
4. **Optimizar performance**
5. **Añadir cache inteligente**
