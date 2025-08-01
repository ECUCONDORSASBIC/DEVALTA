// Tipos para el sistema de decisión clínica

export type AgeRange = '<1' | '1-5' | '6-12' | '13-17' | '18-40' | '41-65' | '>65';

export type Gender = 'male' | 'female' | 'other';

export type SymptomSeverity = 'mild' | 'moderate' | 'severe' | 'critical';

export interface ClinicalContext {
  age: number;
  ageRange: AgeRange;
  gender: Gender;
  currentSymptom?: SymptomLocation;
  severity?: SymptomSeverity;
  riskFactors: string[];
  medicalHistory: string[];
}

export interface SymptomLocation {
  bodyPart: string;
  side?: 'left' | 'right' | 'bilateral';
  specific?: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'slider' | 'checkbox' | 'radio' | 'text' | 'multiselect';
  options?: Array<{ value: string; label: string }>;
  range?: { min: number; max: number; step: number };
  required: boolean;
  category: 'symptom' | 'history' | 'risk' | 'lifestyle';
  pediatricText?: string; // Texto alternativo para pacientes pediátricos
}

export interface DiagnosisSuggestion {
  code: string;
  name: string;
  probability: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  reasoning: string[];
}

export interface ClinicalRule {
  id: string;
  conditions: {
    ageRange?: AgeRange[];
    gender?: Gender[];
    symptoms?: string[];
    riskFactors?: string[];
    severity?: SymptomSeverity[];
  };
  questions?: Question[];
  diagnoses?: DiagnosisSuggestion[];
}

// Utilidades para categorización de edad
export function getAgeRange(age: number): AgeRange {
  if (age < 1) return '<1';
  if (age <= 5) return '1-5';
  if (age <= 12) return '6-12';
  if (age <= 17) return '13-17';
  if (age <= 40) return '18-40';
  if (age <= 65) return '41-65';
  return '>65';
}

// Mapeo de rangos etarios a categorías clínicas
export const AGE_CATEGORIES = {
  '<1': 'infant',
  '1-5': 'toddler',
  '6-12': 'child',
  '13-17': 'adolescent',
  '18-40': 'youngAdult',
  '41-65': 'middleAged',
  '>65': 'elderly'
} as const;

export type AgeCategory = typeof AGE_CATEGORIES[AgeRange];
