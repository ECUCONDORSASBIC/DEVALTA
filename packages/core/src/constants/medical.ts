// ==================== MEDICAL CONSTANTS ====================

export const MEDICAL_SPECIALTIES = [
  "Cardiología",
  "Dermatología",
  "Endocrinología",
  "Gastroenterología",
  "Ginecología",
  "Hematología",
  "Infectología",
  "Medicina Interna",
  "Nefrología",
  "Neurología",
  "Oncología",
  "Oftalmología",
  "Ortopedia",
  "Otorrinolaringología",
  "Pediatría",
  "Psiquiatría",
  "Radiología",
  "Reumatología",
  "Traumatología",
  "Urología",
] as const;

export const BLOOD_TYPES = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const GENDERS = ["male", "female", "other"] as const;

export const APPOINTMENT_TYPES = [
  "consultation",
  "examination",
  "follow_up",
  "emergency",
  "surgery",
  "vaccination",
] as const;

export const APPOINTMENT_STATUSES = [
  "scheduled",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
] as const;

export const MEDICAL_RECORD_TYPES = [
  "consultation",
  "examination",
  "prescription",
  "lab_result",
  "imaging",
  "surgery",
  "vaccination",
] as const;

export const PRIORITIES = ["low", "medium", "high", "critical"] as const;

export const USER_ROLES = [
  "admin",
  "doctor",
  "patient",
  "nurse",
  "receptionist",
] as const;

// ==================== MEDICAL VALUES ====================

export const NORMAL_VITAL_SIGNS = {
  bloodPressure: {
    systolic: { min: 90, max: 140 },
    diastolic: { min: 60, max: 90 },
  },
  heartRate: { min: 60, max: 100 },
  temperature: { min: 36.1, max: 37.2 },
  respiratoryRate: { min: 12, max: 20 },
  oxygenSaturation: { min: 95, max: 100 },
} as const;

export const BMI_CATEGORIES = {
  underweight: { min: 0, max: 18.5, label: "Bajo peso" },
  normal: { min: 18.5, max: 24.9, label: "Peso normal" },
  overweight: { min: 25, max: 29.9, label: "Sobrepeso" },
  obese: { min: 30, max: 34.9, label: "Obesidad" },
  severelyObese: { min: 35, max: 39.9, label: "Obesidad severa" },
  morbidlyObese: { min: 40, max: Infinity, label: "Obesidad mórbida" },
} as const;

// ==================== MEDICAL CODES ====================

export const ICD10_CATEGORIES = [
  "A00-B99", // Enfermedades infecciosas y parasitarias
  "C00-D49", // Neoplasias
  "D50-D89", // Enfermedades de la sangre
  "E00-E89", // Enfermedades endocrinas
  "F01-F99", // Trastornos mentales
  "G00-G99", // Enfermedades del sistema nervioso
  "H00-H59", // Enfermedades del ojo
  "H60-H95", // Enfermedades del oído
  "I00-I99", // Enfermedades del sistema circulatorio
  "J00-J99", // Enfermedades del sistema respiratorio
  "K00-K95", // Enfermedades del sistema digestivo
  "L00-L99", // Enfermedades de la piel
  "M00-M99", // Enfermedades del sistema osteomuscular
  "N00-N99", // Enfermedades del sistema genitourinario
  "O00-O9A", // Embarazo, parto y puerperio
  "P00-P96", // Condiciones originadas en el período perinatal
  "Q00-Q99", // Malformaciones congénitas
  "R00-R99", // Síntomas y signos
  "S00-T88", // Traumatismos, envenenamientos
  "V01-Y99", // Causas externas
  "Z00-Z99", // Factores que influyen en el estado de salud
] as const;

// ==================== MEDICAL UNITS ====================

export const MEDICAL_UNITS = {
  weight: "kg",
  height: "cm",
  temperature: "°C",
  bloodPressure: "mmHg",
  heartRate: "lpm",
  respiratoryRate: "rpm",
  oxygenSaturation: "%",
  bloodGlucose: "mg/dL",
  cholesterol: "mg/dL",
  creatinine: "mg/dL",
  hemoglobin: "g/dL",
  whiteBloodCells: "cells/μL",
  platelets: "cells/μL",
} as const;

// ==================== MEDICAL COLORS ====================

export const MEDICAL_COLORS = {
  primary: "#2563eb", // Blue
  secondary: "#64748b", // Slate
  success: "#16a34a", // Green
  warning: "#ca8a04", // Yellow
  danger: "#dc2626", // Red
  info: "#0891b2", // Cyan
  emergency: "#dc2626", // Red
  critical: "#991b1b", // Dark Red
  normal: "#16a34a", // Green
  abnormal: "#ca8a04", // Yellow
  high: "#dc2626", // Red
  low: "#0891b2", // Cyan
} as const;

// ==================== MEDICAL ICONS ====================

export const MEDICAL_ICONS = {
  patient: "👤",
  doctor: "👨‍⚕️",
  nurse: "👩‍⚕️",
  hospital: "🏥",
  ambulance: "🚑",
  medicine: "💊",
  syringe: "💉",
  stethoscope: "🩺",
  thermometer: "🌡️",
  heart: "❤️",
  brain: "🧠",
  bone: "🦴",
  eye: "👁️",
  ear: "👂",
  tooth: "🦷",
  blood: "🩸",
  dna: "🧬",
  microscope: "🔬",
  xray: "📷",
  pill: "💊",
  bandage: "🩹",
  wheelchair: "♿",
  crutches: "🩼",
} as const;

// ==================== MEDICAL MESSAGES ====================

export const MEDICAL_MESSAGES = {
  appointment: {
    created: "Cita creada exitosamente",
    updated: "Cita actualizada exitosamente",
    cancelled: "Cita cancelada exitosamente",
    confirmed: "Cita confirmada exitosamente",
    reminder: "Recordatorio de cita médica",
  },
  prescription: {
    created: "Prescripción creada exitosamente",
    updated: "Prescripción actualizada exitosamente",
    cancelled: "Prescripción cancelada exitosamente",
    completed: "Prescripción completada exitosamente",
  },
  medicalRecord: {
    created: "Registro médico creado exitosamente",
    updated: "Registro médico actualizado exitosamente",
    archived: "Registro médico archivado exitosamente",
  },
  labResult: {
    created: "Resultado de laboratorio creado exitosamente",
    updated: "Resultado de laboratorio actualizado exitosamente",
    abnormal: "Resultado de laboratorio anormal detectado",
  },
  patient: {
    created: "Paciente registrado exitosamente",
    updated: "Información del paciente actualizada exitosamente",
    discharged: "Paciente dado de alta exitosamente",
  },
  doctor: {
    created: "Doctor registrado exitosamente",
    updated: "Información del doctor actualizada exitosamente",
    verified: "Doctor verificado exitosamente",
  },
} as const;

// ==================== MEDICAL VALIDATION ====================

export const MEDICAL_VALIDATION = {
  dni: {
    pattern: /^\d{8}$/,
    message: "El DNI debe tener 8 dígitos",
  },
  phone: {
    pattern: /^\+?[\d\s\-\(\)]+$/,
    message: "Número de teléfono inválido",
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Email inválido",
  },
  bloodPressure: {
    systolic: { min: 70, max: 200 },
    diastolic: { min: 40, max: 130 },
    message: "Valores de presión arterial fuera de rango",
  },
  heartRate: {
    min: 40,
    max: 200,
    message: "Frecuencia cardíaca fuera de rango",
  },
  temperature: {
    min: 35,
    max: 42,
    message: "Temperatura fuera de rango",
  },
  weight: {
    min: 0.5,
    max: 500,
    message: "Peso fuera de rango",
  },
  height: {
    min: 30,
    max: 250,
    message: "Altura fuera de rango",
  },
} as const;
