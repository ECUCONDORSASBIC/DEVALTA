# 🤒 AltaMedica Patients Portal

**Puerto:** 3003 | **Tipo:** Portal de Pacientes | **Framework:** Next.js

## ⚠️ REGLA FUNDAMENTAL: USAR PACKAGES CENTRALIZADOS

### 🚫 **LO QUE NO DEBES HACER:**
```typescript
// ❌ NUNCA crear hooks de pacientes duplicados
export function useAppointments() {
  // Ya existe en @altamedica/hooks - PROHIBIDO
}

// ❌ NUNCA implementar validaciones médicas duplicadas
export function validateSymptoms() {
  // Ya existe en @altamedica/medical-utils - PROHIBIDO  
}

// ❌ NUNCA crear componentes médicos que ya existen
export function MedicalHistory() {
  // Ya existe en @altamedica/medical-components - PROHIBIDO
}
```

### ✅ **LO QUE SÍ DEBES HACER:**
```typescript
// ✅ SIEMPRE importar desde packages centralizados
import { useAuth, useAppointments, useMedicalRecords } from '@altamedica/hooks';
import { formatMedicalDate, validatePatientData } from '@altamedica/medical-utils';
import { AppointmentCard, HealthMetrics } from '@altamedica/medical-components';
import { Patient, Appointment } from '@altamedica/medical-types';
```

## 📦 **PASO 1: REVISAR PACKAGES MÉDICOS DISPONIBLES**

**ANTES de escribir cualquier código de pacientes, verifica estos packages:**

### 🪝 Hooks de Pacientes (`@altamedica/hooks`)
```bash
# Ver hooks de pacientes disponibles
cd ../../packages/hooks/src/medical
ls -la

# Hooks principales para pacientes:
# - useAppointments, useMedicalRecords, usePrescriptions
# - useHealthMetrics, useSymptomTracker, useTelemedicine
# - useInsurance, useBilling, useNotifications
```

### 🏥 Componentes para Pacientes (`@altamedica/medical-components`)
```bash
# Ver componentes para pacientes disponibles
cd ../../packages/medical-components/src/patient
ls -la

# Componentes para pacientes:
# - PatientDashboard, AppointmentBooking
# - HealthTimeline, SymptomLogger, MedicationTracker
# - TelemedicinePatient, LabResultsViewer
```

### 🔧 Utilidades de Pacientes (`@altamedica/medical-utils`)
```bash
# Ver utilidades para pacientes disponibles
cd ../../packages/medical-utils/src/patient
ls -la

# Utilidades para pacientes:
# - Health calculations, symptom analysis
# - Appointment validations, insurance helpers
# - Medication reminders, health tips
```

### 🏥 Tipos de Pacientes (`@altamedica/medical-types`)
```bash
# Ver tipos de pacientes disponibles
cd ../../packages/medical-types/src/patient
ls -la

# Tipos para pacientes:
# - Patient, PatientProfile, HealthMetrics
# - Symptom, Medication, Insurance
# - AppointmentBooking, TelemedicineSession
```

## 🚀 **Configuración de Desarrollo**

### Instalación
```bash
pnpm install
```

### Desarrollo
```bash
pnpm dev  # Puerto 3003
```

### Build
```bash
pnpm build
```

## 🏗️ **Arquitectura del Portal de Pacientes**

```
src/
├── app/                 # Next.js 13+ App Router
├── components/          # Componentes ESPECÍFICOS del portal de pacientes
│   ├── booking/         # Reserva de citas específica para pacientes
│   ├── health-tracking/ # Seguimiento de salud personal
│   └── telemedicine/    # Interface de telemedicina para pacientes
├── hooks/               # Solo hooks ESPECÍFICOS de pacientes
│   └── usePatientOnly.ts  # SOLO si no existe en packages
├── lib/                 # Configuración específica de pacientes
└── services/            # Servicios específicos del portal
```

## ✅ **Checklist Antes de Desarrollar**

### 📋 **OBLIGATORIO - Verificar Medical Packages Primero:**
- [ ] ¿El hook de paciente ya existe en `@altamedica/hooks`?
- [ ] ¿El componente médico ya existe en `@altamedica/medical-components`?
- [ ] ¿La utilidad médica ya existe en `@altamedica/medical-utils`?
- [ ] ¿El tipo médico ya existe en `@altamedica/medical-types`?

### 📋 **Solo si NO existe en packages médicos:**
- [ ] ¿Es específico de la experiencia del paciente?
- [ ] ¿No puede ser reutilizado por doctores u otras apps?
- [ ] ¿Está documentado por qué es específico del paciente?

## 🎯 **Funcionalidades Específicas del Portal de Pacientes**

### Dashboard Personal de Salud
- **Resumen de salud actual**
- **Próximas citas y medicamentos**  
- **Alertas y recordatorios personales**
- **Progreso de tratamientos**

### Reserva de Citas para Pacientes
```typescript
// ✅ CORRECTO - Interface de reserva específica para pacientes
export function PatientAppointmentBooking() {
  const { availableSlots, preferences, insurance } = usePatientBooking();
  
  return (
    <div>
      <DoctorSearch /> {/* Específico para búsqueda de pacientes */}
      <TimeSlotSelector slots={availableSlots} />
      <InsuranceVerification insurance={insurance} />
      <AppointmentConfirmation /> {/* De @altamedica/medical-components */}
    </div>
  );
}
```

### Telemedicina para Pacientes
```typescript
// ✅ CORRECTO - Interface de telemedicina desde perspectiva del paciente
export function PatientTelemedicineInterface() {
  const { 
    doctorConnection, 
    consultationRoom, 
    patientTools 
  } = usePatientTelemedicine();
  
  return (
    <div>
      <WaitingRoom room={consultationRoom} />
      <VideoConsultation connection={doctorConnection} />
      <PatientNotesPanel tools={patientTools} />
    </div>
  );
}
```

## 🔗 **Dependencies Médicas para Pacientes**

```json
{
  "@altamedica/hooks": "workspace:*",
  "@altamedica/medical-components": "workspace:*", 
  "@altamedica/medical-utils": "workspace:*",
  "@altamedica/medical-types": "workspace:*",
  "@altamedica/ui": "workspace:*",
  "@altamedica/telemedicine-core": "workspace:*"
}
```

## 📊 **Funcionalidades Principales para Pacientes**

### Gestión Personal de Salud
- **Historial médico personal**
- **Seguimiento de síntomas**
- **Registro de medicamentos**
- **Métricas de salud (peso, presión, etc.)**

### Seguimiento de Tratamientos
```typescript
// ✅ CORRECTO - Herramientas de seguimiento para pacientes
export function TreatmentTracking() {
  const { 
    medications, 
    symptoms, 
    vitals,
    progress 
  } = usePatientTracking();
  
  return (
    <div>
      <MedicationReminders medications={medications} />
      <SymptomLogger symptoms={symptoms} />
      <VitalSigns vitals={vitals} />
      <ProgressTracker progress={progress} />
    </div>
  );
}
```

### Comunicación con Proveedores
```typescript
// ✅ CORRECTO - Sistema de mensajería para pacientes
export function PatientMessaging() {
  const { 
    conversations, 
    doctors, 
    appointments 
  } = usePatientCommunication();
  
  return (
    <div>
      <DoctorList doctors={doctors} />
      <MessageThread conversations={conversations} />
      <AppointmentRequests requests={appointments} />
    </div>
  );
}
```

## 🛡️ **Privacidad y Control de Datos**

### Consentimiento del Paciente
```typescript
// ✅ CORRECTO - Gestión de consentimientos específica para pacientes
import { useConsent, updateConsent } from '@altamedica/medical-security';

export function PatientConsentManagement() {
  const { consents, updateConsent } = useConsent();
  
  const handleConsentChange = (type: string, granted: boolean) => {
    updateConsent({
      type,
      granted,
      timestamp: new Date(),
      patientSignature: true
    });
  };
  
  return (
    <ConsentManager 
      consents={consents} 
      onUpdate={handleConsentChange} 
    />
  );
}
```

### Control de Acceso a Datos
```typescript
// ✅ CORRECTO - Control de datos específico del paciente
export function PatientDataControls() {
  const { dataSharing, privacy } = usePatientPrivacy();
  
  return (
    <div>
      <DataSharingPreferences sharing={dataSharing} />
      <PrivacySettings settings={privacy} />
      <DataExportTools /> {/* Derecho a portabilidad */}
    </div>
  );
}
```

## 🩺 **Herramientas de Salud Personal**

### Autoevaluación de Síntomas
```typescript
// ✅ CORRECTO - Usar herramientas centralizadas de síntomas
import { 
  SymptomChecker, 
  RiskAssessment 
} from '@altamedica/medical-components';

export function SelfAssessmentTools() {
  return (
    <div>
      <SymptomChecker mode="patient" />
      <RiskAssessment level="basic" />
      <UrgencyIndicator /> {/* Específico para guiar al paciente */}
    </div>
  );
}
```

### Calculadoras de Salud
```typescript
// ✅ CORRECTO - Calculadoras accesibles para pacientes
import { 
  calculateBMI, 
  calculateWaterIntake,
  calculateCalories 
} from '@altamedica/medical-utils';

export function HealthCalculators() {
  return (
    <div>
      <BMICalculator calculator={calculateBMI} />
      <WaterIntakeCalculator calculator={calculateWaterIntake} />
      <CalorieCalculator calculator={calculateCalories} />
    </div>
  );
}
```

## 🎨 **UI/UX Optimizada para Pacientes**

### Tema Centrado en el Paciente
```typescript
// ✅ CORRECTO - Tema específico para experiencia del paciente
export const patientTheme = {
  colors: {
    primary: '#059669',      // Verde salud
    secondary: '#0369a1',    // Azul confianza
    comfort: '#f3f4f6',     // Gris calmante
    success: '#10b981',     // Verde éxito
    warning: '#f59e0b'      // Amarillo precaución
  },
  patient: {
    wellness: '#84cc16',
    comfort: '#a3a3a3',
    energy: '#0ea5e9'
  }
};
```

### Accesibilidad Mejorada
```typescript
// ✅ CORRECTO - Componentes accesibles para todos los pacientes
export function AccessiblePatientInterface() {
  return (
    <div role="main" aria-label="Portal del Paciente">
      <HighContrastMode />
      <FontSizeControls />
      <ScreenReaderSupport />
      <KeyboardNavigation />
    </div>
  );
}
```

## 📱 **Experiencia Móvil Optimizada**

### PWA para Pacientes
```typescript
// ✅ CORRECTO - PWA específica para pacientes móviles
export function PatientPWAFeatures() {
  return (
    <div>
      <OfflineMode /> {/* Ver datos básicos sin conexión */}
      <PushNotifications /> {/* Recordatorios de medicamentos */}
      <LocationServices /> {/* Encontrar farmacias cercanas */}
    </div>
  );
}
```

## 🚨 **Code Review Checklist para Pacientes**

### ❌ **Rechazar PR si:**
- Implementa funcionalidades que ya existen en medical packages
- No considera la perspectiva del paciente
- No incluye validaciones de privacidad
- No es accesible para diferentes niveles de alfabetización digital
- No justifica por qué es específico del portal de pacientes

### ✅ **Aprobar PR si:**
- Usa packages médicos centralizados
- Optimiza la experiencia del paciente
- Incluye controles de privacidad apropiados
- Es accesible y fácil de usar
- Está bien documentado desde la perspectiva del paciente

## 📈 **Performance para Experiencia del Paciente**

### Carga Optimizada
```typescript
// ✅ CORRECTO - Priorización de contenido para pacientes
const HealthDashboard = lazy(() => import('./components/HealthDashboard'));
const AppointmentBooking = lazy(() => import('./components/AppointmentBooking'));
const EmergencyContacts = lazy(() => import('./components/EmergencyContacts'), {
  ssr: true // Crítico para emergencias
});
```

### Cache Centrado en el Paciente
```typescript
// ✅ CORRECTO - Cache optimizado para datos del paciente
export function usePatientDataCache() {
  const cacheOptions = {
    personalData: { ttl: 600000 }, // 10 minutos
    appointments: { ttl: 300000 }, // 5 minutos
    medications: { ttl: 86400000 } // 24 horas (menos crítico)
  };
  
  // Cache optimizado para la experiencia del paciente
}
```

## 🧪 **Testing Centrado en el Paciente**

### Tests de Usabilidad
```bash
# Tests de experiencia del paciente
pnpm test:patient-ux

# Tests de accesibilidad
pnpm test:accessibility

# Tests de flujos críticos para pacientes
pnpm test:e2e:patient-critical
```

### Cypress Tests para Pacientes
```typescript
// ✅ Tests específicos del flujo del paciente
describe('Patient Portal User Experience', () => {
  it('should allow easy appointment booking', () => {
    // Test de reserva de citas intuitiva
  });
  
  it('should provide clear health information', () => {
    // Test de claridad en información médica
  });
  
  it('should be accessible for patients with disabilities', () => {
    // Test de accesibilidad completa
  });
});
```

## 🏥 **Educación y Empoderamiento del Paciente**

### Recursos Educativos
```typescript
// ✅ CORRECTO - Contenido educativo específico para pacientes
export function PatientEducation() {
  return (
    <div>
      <HealthTips /> {/* Tips personalizados */}
      <MedicalGlossary /> {/* Términos médicos explicados */}
      <TreatmentGuides /> {/* Guías de tratamiento */}
      <PreventionTips /> {/* Consejos de prevención */}
    </div>
  );
}
```

### Herramientas de Autogestión
```typescript
// ✅ CORRECTO - Herramientas para empoderar al paciente
export function SelfManagementTools() {
  return (
    <div>
      <GoalSetting /> {/* Metas de salud personales */}
      <ProgressTracking /> {/* Seguimiento de progreso */}
      <HealthJournal /> {/* Diario de salud */}
      <MedicationAdherence /> {/* Adherencia a medicamentos */}
    </div>
  );
}
```

---

## 🎯 **RECUERDA:**
> **"PACIENTE PRIMERO, TECNOLOGÍA DESPUÉS"**
> 
> La experiencia del paciente y la facilidad de uso son prioritarios sobre cualquier consideración técnica compleja.

## 📞 **Soporte para Pacientes**

- **Patient Documentation:** `../../packages/medical-*/README.md`
- **Help Center:** Centro de ayuda 24/7
- **Patient Support:** Chat en vivo para pacientes
- **Emergency:** Línea directa de emergencias médicas