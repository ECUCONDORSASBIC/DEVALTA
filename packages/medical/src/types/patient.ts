/**
 * Patient-related type definitions
 * @module @altamedica/medical/types/patient
 */

export interface Patient {
  id: string;
  name: string;
  email: string;
  medicalRecordId?: string;
  emergencyContact?: string;
  birthDate?: Date;
  phoneNumber?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
}

export interface PatientCreate extends Omit<Patient, 'id'> {
  password?: string;
}

export interface PatientUpdate extends Partial<Patient> {
  id: string;
}