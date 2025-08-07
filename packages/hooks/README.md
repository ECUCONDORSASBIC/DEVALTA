# @altamedica/hooks

**React hooks centralizados para la plataforma AltaMedica**

[![npm version](https://badge.fury.io/js/@altamedica%2Fhooks.svg)](https://badge.fury.io/js/@altamedica%2Fhooks)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![HIPAA Compliant](https://img.shields.io/badge/HIPAA-Compliant-green.svg)](https://www.hhs.gov/hipaa/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Biblioteca completa de React hooks especializados para aplicaciones médicas con compliance HIPAA, funcionalidades de telemedicina, IA médica integrada y performance optimizado para entornos hospitalarios.

## 🚀 Instalación

```bash
# npm
npm install @altamedica/hooks

# yarn
yarn add @altamedica/hooks

# pnpm
pnpm add @altamedica/hooks
```

## 📖 Documentación Interactiva

Explora nuestra documentación completa con ejemplos interactivos:

```bash
# Ejecutar Storybook
npm run storybook

# Construir documentación estática
npm run storybook:build
```

**🌐 [Ver Documentación Online](https://altamedica-hooks-storybook.netlify.app)**

## 📦 Características

- **🏥 Hooks Médicos**: Especializados para datos de pacientes, citas, prescripciones
- **🔐 Hooks de Autenticación**: Manejo completo de auth y roles
- **🌐 Hooks de API**: Llamadas optimizadas con cache y estados
- **⚡ Hooks de Tiempo Real**: WebSocket, polling, sincronización
- **🎨 Hooks de UI**: Modal, toast, tema, accesibilidad
- **🛠️ Hooks Utilitarios**: Debounce, storage, media queries, async
- **📊 Hooks de Performance**: Offline, monitoring, optimización
- **📝 Hooks de Formularios**: Validación, auto-save, composición
- **🔗 Hooks Compuestos**: Combinaciones complejas listas para usar

## 🎯 Uso Básico

### Importación Completa
```tsx
import { useAuth, usePatients, useDebounce } from '@altamedica/hooks';
```

### Importación por Categoría (Tree-shaking Optimizado)
```tsx
import { useAuth } from '@altamedica/hooks';
import { usePatients } from '@altamedica/hooks';
import { useDebounce } from '@altamedica/hooks';
```

## 📚 Ejemplos por Categoría

### 🏥 Hooks Médicos

```tsx
import { usePatients, useMedicalRecords, useAppointments } from '@altamedica/hooks';

function PatientDashboard() {
  const { patients, loading, error, searchPatients } = usePatients();
  const { records, loadRecords } = useMedicalRecords(selectedPatientId);
  const { appointments, scheduleAppointment } = useAppointments();

  return (
    <div>
      {loading ? <Spinner /> : <PatientList patients={patients} />}
    </div>
  );
}
```

### 🔐 Hooks de Autenticación

```tsx
import { useAuth, usePermissions } from '@altamedica/hooks';

function ProtectedComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const { hasPermission } = usePermissions();

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <div>
      <h1>Bienvenido, {user.name}</h1>
      {hasPermission('manage_patients') && <AdminPanel />}
    </div>
  );
}
```

### 🌐 Hooks de API

```tsx
import { useAltaMedicaAPI, useOptimisticUpdate } from '@altamedica/hooks';

function PatientProfile({ patientId }) {
  const { data: patient, loading, error, mutate } = useAltaMedicaAPI(
    `/patients/${patientId}`
  );
  
  const updatePatient = useOptimisticUpdate(
    (updatedData) => mutate({ ...patient, ...updatedData }),
    `/patients/${patientId}`,
    'PUT'
  );

  return (
    <PatientForm 
      patient={patient} 
      onUpdate={updatePatient}
      loading={loading}
    />
  );
}
```

### ⚡ Hooks de Tiempo Real

```tsx
import { useWebSocket, useRealTimeUpdates } from '@altamedica/hooks';

function VitalSignsMonitor({ patientId }) {
  const { data: vitals, isConnected } = useWebSocket(
    `ws://localhost:8888/patients/${patientId}/vitals`
  );
  
  const { updates, subscribe } = useRealTimeUpdates();

  useEffect(() => {
    subscribe(`patients/${patientId}`, (update) => {
      console.log('Patient updated:', update);
    });
  }, [patientId, subscribe]);

  return (
    <div>
      <StatusIndicator connected={isConnected} />
      <VitalSignsChart data={vitals} />
    </div>
  );
}
```

### 🛠️ Hooks Utilitarios

```tsx
import { 
  useDebounce, 
  useLocalStorage, 
  useMediaQuery,
  useAsync 
} from '@altamedica/hooks';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [savedSearches, setSavedSearches] = useLocalStorage('searches', []);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const { data, loading, execute } = useAsync(
    (searchQuery) => searchPatients(searchQuery)
  );

  useEffect(() => {
    if (debouncedQuery) {
      execute(debouncedQuery);
    }
  }, [debouncedQuery, execute]);

  return (
    <div>
      <SearchInput 
        value={query}
        onChange={setQuery}
        compact={isMobile}
      />
      {loading ? <Spinner /> : <SearchResults data={data} />}
    </div>
  );
}
```

### 📊 Hooks de Performance

```tsx
import { 
  useOffline, 
  usePerformanceMonitor,
  useNetworkStatus 
} from '@altamedica/hooks';

function AppWrapper() {
  const isOffline = useOffline();
  const { metrics, startMonitoring } = usePerformanceMonitor();
  const { effectiveType, downlink } = useNetworkStatus();

  useEffect(() => {
    startMonitoring();
  }, [startMonitoring]);

  return (
    <div>
      {isOffline && <OfflineBanner />}
      {effectiveType === 'slow-2g' && <SlowConnectionWarning />}
      <App />
      <PerformanceIndicator metrics={metrics} />
    </div>
  );
}
```

### 🔗 Hooks Compuestos

```tsx
import { usePatientPortal, useDoctorWorkflow } from '@altamedica/hooks';

function PatientPortal() {
  const {
    patient,
    appointments,
    prescriptions,
    vitals,
    loading,
    error,
    refreshAll
  } = usePatientPortal(patientId);

  return (
    <Portal>
      <PatientHeader patient={patient} />
      <AppointmentsSection appointments={appointments} />
      <PrescriptionsSection prescriptions={prescriptions} />
      <VitalSignsSection vitals={vitals} />
    </Portal>
  );
}

function DoctorWorkspace() {
  const {
    currentPatient,
    schedule,
    notifications,
    switchPatient,
    updateSchedule
  } = useDoctorWorkflow();

  return (
    <Workspace>
      <Sidebar schedule={schedule} onPatientSelect={switchPatient} />
      <MainArea patient={currentPatient} />
      <NotificationCenter notifications={notifications} />
    </Workspace>
  );
}
```

## 🏗️ Arquitectura

### Tree-shaking Optimizado

```tsx
// ✅ Importa solo lo que necesitas
import { useAuth } from '@altamedica/hooks';
import { usePatients } from '@altamedica/hooks';

// ❌ Evita importaciones completas en producción
import * as hooks from '@altamedica/hooks';
```

### Categorías Disponibles

```tsx
'@altamedica/hooks/medical'     // Hooks médicos especializados
'@altamedica/hooks/auth'        // Autenticación y autorización
'@altamedica/hooks/api'         // Llamadas a API y manejo de datos
'@altamedica/hooks/realtime'    // Tiempo real y WebSocket
'@altamedica/hooks/ui'          // Interfaz de usuario
'@altamedica/hooks/utils'       // Utilidades generales
'@altamedica/hooks/performance' // Performance y optimización
'@altamedica/hooks/forms'       // Formularios y validación
'@altamedica/hooks/composed'    // Hooks compuestos complejos
```

## 🔒 Seguridad y Compliance

### HIPAA Compliance
Los hooks que manejan datos médicos sensibles (PHI) incluyen:

```tsx
// Automáticamente cifra datos médicos sensibles
const { value: patientData } = useSecureStorage(`patient_${id}`, null, {
  encryptionLevel: 'hipaa',
  ttl: 30 * 60 * 1000 // 30 minutos
});

// Audit logging automático para acciones médicas
const { logAccess } = useHIPAAAuditLog();
```

### Manejo Seguro de Datos

```tsx
// Hooks con cleanup automático
const { data, cleanup } = useMedicalData(patientId);

useEffect(() => {
  return cleanup; // Limpia datos sensibles al desmontar
}, [cleanup]);
```

## 📖 API Reference

### Hooks Médicos
- `usePatients()` - Manejo completo de pacientes
- `useMedicalRecords()` - Historiales médicos
- `useAppointments()` - Gestión de citas
- `usePrescriptions()` - Prescripciones y medicamentos
- `useVitalSigns()` - Signos vitales
- `useMedicalAI()` - Integración con IA médica

### Hooks de Autenticación
- `useAuth()` - Autenticación principal
- `usePermissions()` - Manejo de permisos
- `useRole()` - Verificación de roles
- `useSession()` - Manejo de sesiones

### Hooks de API
- `useAltaMedicaAPI()` - API principal
- `useOptimisticUpdate()` - Actualizaciones optimistas
- `useInfiniteQuery()` - Paginación infinita
- `useMutation()` - Mutaciones con cache

### Hooks Utilitarios
- `useDebounce()` - Debounce avanzado
- `useLocalStorage()` - Storage con cifrado
- `useMediaQuery()` - Media queries responsivas
- `useAsync()` - Operaciones asíncronas

## 🧪 Testing

```tsx
import { renderHook, act } from '@testing-library/react';
import { usePatients } from '@altamedica/hooks';

test('usePatients loads patient data', async () => {
  const { result } = renderHook(() => usePatients());
  
  expect(result.current.loading).toBe(true);
  
  await act(async () => {
    await result.current.loadPatients();
  });
  
  expect(result.current.loading).toBe(false);
  expect(result.current.patients).toHaveLength(5);
});
```

## 🤝 Contribución

1. Crea una rama para tu feature
2. Añade tests para tu hook
3. Documenta con JSDoc y ejemplos
4. Envía PR con descripción detallada

## 📄 Licencia

MIT © AltaMedica Platform

## 🚀 Roadmap

- [ ] Hooks de IA médica avanzada
- [ ] Integración con FHIR R4
- [ ] Hooks de análisis predictivo
- [ ] Soporte para dispositivos IoT médicos
- [ ] Hooks de blockchain para records médicos