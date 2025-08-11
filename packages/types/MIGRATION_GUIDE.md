# 📋 Guía de Migración de Tipos - AltaMedica Platform

## 🎯 Objetivo

Esta guía documenta el proceso de migración para unificar los tipos duplicados de `Patient` y `Appointment` en el proyecto AltaMedica Platform, consolidándolos en `@altamedica/types`.

---

## 🩺 Migración de Tipos Patient

### Estado Actual

| Archivo | Ubicación | Estado | Acción |
|---------|-----------|---------|---------|
| **patient.ts** | `packages/types/src/patient.ts` | ✅ **Master (237 líneas)** | **MANTENER - Ya es la versión más completa** |
| **patient.ts** | `packages/medical/src/types/patient.ts` | 🔴 Duplicado básico (37 líneas) | **ELIMINAR** |
| **patient types** | `apps/patients/src/types/` | ❌ No existe | N/A |
| **patient types** | `apps/doctors/src/types/` | ❌ No existe | N/A |

### ✅ Decisión: Usar versión existente

La versión en `packages/types/src/patient.ts` **ya es la implementación unificada ideal**. Incluye:
- ✅ Esquemas Zod completos con validación
- ✅ Tipos TypeScript inferidos
- ✅ Información médica detallada (alergias, condiciones crónicas, medicaciones)
- ✅ Cumplimiento HIPAA (campos de auditoría, consentimientos)
- ✅ Internacionalización (español por defecto)

### 📝 Pasos de Migración para Patient

1. **Actualizar imports en `packages/medical`:**
   ```typescript
   // ANTES:
   import { Patient } from '../types/patient';
   
   // DESPUÉS:
   import { Patient } from '@altamedica/types';
   ```

2. **Eliminar archivo duplicado:**
   ```bash
   # Eliminar después de actualizar todos los imports
   rm packages/medical/src/types/patient.ts
   ```

3. **Verificar compatibilidad de campos:**
   - El tipo básico tiene menos campos que el completo
   - Todos los campos del tipo básico existen en el completo
   - Migración es 100% compatible

---

## 📅 Migración de Tipos Appointment

### Estado Actual

| Archivo | Ubicación | Líneas | Estado | Acción |
|---------|-----------|--------|---------|---------|
| **appointments-users.ts** | `apps/doctors/src/types/` | 433 | ✅ **Más completa** | **Base para unificación** |
| **appointment.ts** | `packages/types/src/` | 187 | 🟡 Versión simple | **REEMPLAZAR** |
| **appointment-unified.ts** | `packages/types/src/` | NUEVO | ✅ **Nueva versión unificada** | **USAR ESTA** |

### 🎯 Nueva Implementación Unificada

He creado `appointment-unified.ts` que combina lo mejor de ambas versiones:

#### Características de la versión unificada:
- ✅ **Sistema completo RBAC/ABAC** de la versión doctors
- ✅ **Esquemas Zod** de la versión packages/types
- ✅ **Campos clínicos avanzados** (diagnóstico, prescripciones, procedimientos)
- ✅ **Sistema de notificaciones** multi-canal
- ✅ **Tracking de estado** con historial completo
- ✅ **Soporte para telemedicina** y citas híbridas
- ✅ **Billing y seguros** integrados
- ✅ **Auditoría HIPAA** completa
- ✅ **Funciones de utilidad** incluidas

### 📝 Pasos de Migración para Appointment

#### Fase 1: Preparación
```typescript
// 1. Renombrar el archivo actual para backup
mv packages/types/src/appointment.ts packages/types/src/appointment.old.ts

// 2. Renombrar la versión unificada
mv packages/types/src/appointment-unified.ts packages/types/src/appointment.ts
```

#### Fase 2: Actualizar Imports

**En apps que usan el tipo simple:**
```typescript
// ANTES:
import { Appointment, AppointmentStatus } from '@altamedica/types';

// DESPUÉS (sin cambios, pero revisar uso):
import { Appointment, AppointmentStatus } from '@altamedica/types';
// Los enums ahora son UPPERCASE: 'SCHEDULED' en lugar de 'Programada'
```

**En doctors app:**
```typescript
// ANTES:
import { Appointment } from '../types/appointments-users';

// DESPUÉS:
import { Appointment } from '@altamedica/types';
```

#### Fase 3: Mapeo de Cambios Principales

| Campo Anterior | Campo Nuevo | Notas |
|----------------|-------------|--------|
| `start: Date` | `scheduling.scheduledDateTime: string` | ISO 8601 string |
| `end: Date` | Calculado desde `estimatedDuration` | |
| `status: "Programada"` | `status: "SCHEDULED"` | Enums en inglés |
| `doctor: {id, name}` | `professionalId: string` | Solo ID, datos en otra tabla |
| `patient: {id, name}` | `patientId: string` | Solo ID, datos en otra tabla |

#### Fase 4: Adaptar Código

**Ejemplo de adaptación para campos anidados:**
```typescript
// ANTES:
const appointmentTime = appointment.start;
const doctorName = appointment.doctor.name;

// DESPUÉS:
const appointmentTime = new Date(appointment.scheduling.scheduledDateTime);
const doctorName = await getDoctorById(appointment.professionalId).name;
```

**Ejemplo de manejo de status:**
```typescript
// ANTES:
if (appointment.status === "Programada") { }

// DESPUÉS:
if (appointment.status === "SCHEDULED") { }
// O usar la constante:
if (appointment.status === AppointmentStatus.SCHEDULED) { }
```

---

## 🔧 Herramientas de Migración

### Script de Búsqueda de Imports

```bash
# Buscar todos los archivos que importan tipos Patient
grep -r "from.*patient" --include="*.ts" --include="*.tsx" apps/ packages/

# Buscar todos los archivos que importan tipos Appointment  
grep -r "from.*appointment" --include="*.ts" --include="*.tsx" apps/ packages/
```

### Validación Post-Migración

```typescript
// test-utils/validate-types.ts
import { patientSchema, appointmentSchema } from '@altamedica/types';

// Validar que los datos existentes cumplan con los nuevos esquemas
export function validatePatientData(data: unknown) {
  return patientSchema.safeParse(data);
}

export function validateAppointmentData(data: unknown) {
  return appointmentSchema.safeParse(data);
}
```

---

## ⚠️ Consideraciones Importantes

### 1. Breaking Changes en Appointment

- **Estructura más anidada**: Los datos ahora están organizados en objetos (scheduling, clinicalInfo, etc.)
- **IDs en lugar de objetos**: patient y doctor ahora son IDs, no objetos embebidos
- **Enums en inglés**: Cambio de español a inglés para consistencia
- **Fechas como strings**: ISO 8601 strings en lugar de objetos Date

### 2. Compatibilidad con Base de Datos

- Los nuevos tipos son más extensos
- Campos opcionales permiten migración gradual
- Considerar migración de datos existentes

### 3. Validación en Runtime

```typescript
// Usar los esquemas Zod para validar en las APIs
import { appointmentSchema } from '@altamedica/types';

export async function createAppointment(data: unknown) {
  // Validar datos antes de procesar
  const validated = appointmentSchema.parse(data);
  // Proceder con datos validados...
}
```

---

## 📅 Timeline Recomendado

| Semana | Actividad |
|--------|-----------|
| **Semana 1** | ✅ Crear tipos unificados y guía de migración |
| **Semana 1** | 🔄 Migrar tipos Patient (simple, sin breaking changes) |
| **Semana 2** | 🔄 Migrar tipos Appointment en packages |
| **Semana 2** | 🔄 Actualizar apps una por una |
| **Semana 3** | 🔄 Testing exhaustivo |
| **Semana 4** | 🔄 Eliminar archivos obsoletos |

---

## ✅ Checklist de Migración

### Para Patient:
- [ ] Actualizar imports en `packages/medical`
- [ ] Verificar que no hay otros imports
- [ ] Eliminar `packages/medical/src/types/patient.ts`
- [ ] Actualizar documentación

### Para Appointment:
- [ ] Renombrar archivos según plan
- [ ] Actualizar imports en `packages/`
- [ ] Actualizar imports en `apps/doctors`
- [ ] Actualizar imports en `apps/patients`
- [ ] Actualizar imports en `apps/companies`
- [ ] Actualizar imports en `apps/admin`
- [ ] Adaptar código para nueva estructura
- [ ] Actualizar tests
- [ ] Eliminar archivos obsoletos
- [ ] Actualizar documentación

---

## 🆘 Soporte

Si encuentras problemas durante la migración:

1. Revisa los esquemas Zod para entender la estructura esperada
2. Usa las funciones de utilidad incluidas en los tipos
3. Valida los datos con `safeParse` para debugging
4. Documenta cualquier caso edge encontrado

---

**Última actualización:** Enero 2025  
**Versión:** 1.0