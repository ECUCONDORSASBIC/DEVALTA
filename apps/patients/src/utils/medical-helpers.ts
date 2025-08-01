import { VitalSigns, Medication, MedicalCondition } from '../types/medical-types';

// Formateo de fechas
export const formatDate = (date: Date | string, format: 'full' | 'short' | 'relative' = 'full'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'relative') {
    return getRelativeTime(dateObj);
  }
  
  if (format === 'short') {
    return dateObj.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  return dateObj.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Tiempo relativo
const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Hace un momento';
  if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
  if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
  if (diffInSeconds < 2592000) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  
  return formatDate(date, 'short');
};

// Cálculo de puntuación de salud
export const calculateHealthScore = (data: {
  vitalSigns: VitalSigns;
  medications: Medication[];
  conditions: MedicalCondition[];
  age: number;
}): number => {
  let score = 100;
  
  // Evaluar signos vitales
  const vitals = data.vitalSigns;
  
  // Frecuencia cardíaca
  if (vitals.heartRate.status === 'critical') score -= 20;
  else if (vitals.heartRate.status === 'warning') score -= 10;
  
  // Presión arterial
  if (vitals.bloodPressure.status === 'critical') score -= 20;
  else if (vitals.bloodPressure.status === 'warning') score -= 10;
  
  // Temperatura
  if (vitals.temperature.status === 'critical') score -= 15;
  else if (vitals.temperature.status === 'warning') score -= 5;
  
  // Saturación de oxígeno
  if (vitals.oxygenSaturation?.status === 'critical') score -= 15;
  else if (vitals.oxygenSaturation?.status === 'warning') score -= 5;
  
  // Evaluar condiciones médicas
  const severeConditions = data.conditions.filter(c => c.severity === 'severe');
  const moderateConditions = data.conditions.filter(c => c.severity === 'moderate');
  
  score -= severeConditions.length * 10;
  score -= moderateConditions.length * 5;
  
  // Evaluar edad
  if (data.age > 80) score -= 5;
  else if (data.age > 65) score -= 3;
  
  // Evaluar medicamentos
  const activeMedications = data.medications.filter(m => m.status === 'active');
  if (activeMedications.length > 5) score -= 5;
  else if (activeMedications.length > 3) score -= 3;
  
  return Math.max(0, Math.min(100, score));
};

// Validación de rangos normales
export const getVitalSignStatus = (value: number, normalRange: { min: number; max: number }, criticalRange?: { min: number; max: number }): 'normal' | 'warning' | 'critical' => {
  if (criticalRange && (value < criticalRange.min || value > criticalRange.max)) {
    return 'critical';
  }
  
  if (value < normalRange.min || value > normalRange.max) {
    return 'warning';
  }
  
  return 'normal';
};

// Rangos normales por edad
export const getNormalRanges = (age: number) => ({
  heartRate: {
    min: age < 1 ? 100 : age < 10 ? 70 : 60,
    max: age < 1 ? 160 : age < 10 ? 120 : 100
  },
  bloodPressure: {
    systolic: { min: 90, max: 140 },
    diastolic: { min: 60, max: 90 }
  },
  temperature: { min: 36.1, max: 37.2 },
  oxygenSaturation: { min: 95, max: 100 },
  respiratoryRate: {
    min: age < 1 ? 30 : age < 3 ? 24 : age < 6 ? 22 : age < 12 ? 20 : 12,
    max: age < 1 ? 60 : age < 3 ? 40 : age < 6 ? 34 : age < 12 ? 30 : 20
  }
});

// Cálculo de IMC
export const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

// Clasificación de IMC
export const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Bajo peso';
  if (bmi < 25) return 'Peso normal';
  if (bmi < 30) return 'Sobrepeso';
  if (bmi < 35) return 'Obesidad clase I';
  if (bmi < 40) return 'Obesidad clase II';
  return 'Obesidad clase III';
};

// Formateo de valores médicos
export const formatMedicalValue = (value: number | string, unit: string): string => {
  if (typeof value === 'number') {
    return `${value.toFixed(1)} ${unit}`;
  }
  return `${value} ${unit}`;
};

// Validación de alergias críticas
export const hasCriticalAllergies = (allergies: any[]): boolean => {
  return allergies.some(allergy => allergy.severity === 'life-threatening');
};

// Cálculo de riesgo cardiovascular
export const calculateCardiovascularRisk = (data: {
  age: number;
  gender: string;
  bloodPressure: { systolic: number; diastolic: number };
  cholesterol?: { total: number; hdl: number };
  diabetes: boolean;
  smoking: boolean;
}): 'low' | 'medium' | 'high' => {
  let riskScore = 0;
  
  // Edad
  if (data.age >= 65) riskScore += 3;
  else if (data.age >= 55) riskScore += 2;
  else if (data.age >= 45) riskScore += 1;
  
  // Género
  if (data.gender === 'male') riskScore += 1;
  
  // Presión arterial
  if (data.bloodPressure.systolic >= 160 || data.bloodPressure.diastolic >= 100) riskScore += 3;
  else if (data.bloodPressure.systolic >= 140 || data.bloodPressure.diastolic >= 90) riskScore += 2;
  
  // Diabetes
  if (data.diabetes) riskScore += 2;
  
  // Tabaquismo
  if (data.smoking) riskScore += 2;
  
  if (riskScore >= 6) return 'high';
  if (riskScore >= 3) return 'medium';
  return 'low';
};

// Generación de alertas médicas
export const generateMedicalAlerts = (data: {
  vitalSigns: VitalSigns;
  medications: Medication[];
  conditions: MedicalCondition[];
  allergies: any[];
}): any[] => {
  const alerts = [];
  
  // Alertas de signos vitales
  if (data.vitalSigns.hasAnomalies) {
    alerts.push({
      type: 'vital_sign',
      severity: 'critical',
      title: 'Anomalías en Signos Vitales',
      message: 'Se detectaron valores fuera del rango normal'
    });
  }
  
  // Alertas de medicamentos
  const medicationsNeedingRefill = data.medications.filter(m => 
    m.status === 'active' && m.refillsRemaining !== undefined && m.refillsRemaining <= 0
  );
  
  if (medicationsNeedingRefill.length > 0) {
    alerts.push({
      type: 'medication',
      severity: 'warning',
      title: 'Refills Pendientes',
      message: `${medicationsNeedingRefill.length} medicamento(s) requiere(n) refill`
    });
  }
  
  // Alertas de condiciones severas
  const severeConditions = data.conditions.filter(c => c.severity === 'severe');
  if (severeConditions.length > 0) {
    alerts.push({
      type: 'condition',
      severity: 'warning',
      title: 'Condiciones Severas Activas',
      message: `${severeConditions.length} condición(es) severa(s) requiere(n) monitoreo`
    });
  }
  
  return alerts;
}; 