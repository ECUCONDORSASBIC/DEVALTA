// 🏥 SERVICIO MÉDICO ESPECIALIZADO ALTAMEDICA
// Operaciones médicas específicas con validaciones empresariales
// ARQUITECTURA: Separación clara de responsabilidades médicas

import { apiService, ApiService } from "./ApiService";
import type {
  Patient,
  Appointment,
  MedicalRecord,
  Prescription,
  SymptomAnalysis,
  DrugInteractionCheck,
  PaginatedResponse,
} from "../types";

export interface PatientSearchParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "email" | "createdAt";
  sortOrder?: "asc" | "desc";
  gender?: string;
  status?: string;
}

export interface AppointmentFilters {
  patientId?: string;
  doctorId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface MedicalRecordFilters {
  patientId?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

// 🏥 CLASE SERVICIO MÉDICO ESPECIALIZADO
export class MedicalService {
  private api: ApiService;

  constructor(apiInstance: ApiService = apiService) {
    this.api = apiInstance;
  }

  // 👤 GESTIÓN DE PACIENTES
  async getPatients(
    params: PatientSearchParams = {}
  ): Promise<PaginatedResponse<Patient>> {
    const queryParams = this.buildQueryParams(params);
    return this.api.get<PaginatedResponse<Patient>>(`/patients?${queryParams}`);
  }

  async getPatientById(id: string): Promise<Patient> {
    this.validateId(id, "Patient ID");
    return this.api.get<Patient>(`/patients/${id}`);
  }

  async updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
    this.validateId(id, "Patient ID");
    this.validatePatientData(data);
    return this.api.put<Patient>(`/patients/${id}`, data);
  }

  async getPatientMedicalHistory(patientId: string): Promise<MedicalRecord[]> {
    this.validateId(patientId, "Patient ID");
    return this.api.get<MedicalRecord[]>(
      `/patients/${patientId}/medical-history`
    );
  }

  // 📅 GESTIÓN DE CITAS
  async getAppointments(
    filters: AppointmentFilters = {}
  ): Promise<PaginatedResponse<Appointment>> {
    const queryParams = this.buildQueryParams(filters);
    return this.api.get<PaginatedResponse<Appointment>>(
      `/appointments?${queryParams}`
    );
  }

  async getAppointmentById(id: string): Promise<Appointment> {
    this.validateId(id, "Appointment ID");
    return this.api.get<Appointment>(`/appointments/${id}`);
  }

  async createAppointment(
    appointmentData: Partial<Appointment>
  ): Promise<Appointment> {
    this.validateAppointmentData(appointmentData);
    return this.api.post<Appointment>("/appointments", appointmentData);
  }

  async updateAppointment(
    id: string,
    data: Partial<Appointment>
  ): Promise<Appointment> {
    this.validateId(id, "Appointment ID");
    return this.api.put<Appointment>(`/appointments/${id}`, data);
  }

  async cancelAppointment(id: string, reason?: string): Promise<void> {
    this.validateId(id, "Appointment ID");
    return this.api.delete(`/appointments/${id}`, {
      headers: reason ? { "X-Cancel-Reason": reason } : undefined,
    });
  }

  // 📋 GESTIÓN DE REGISTROS MÉDICOS
  async getMedicalRecords(
    filters: MedicalRecordFilters = {}
  ): Promise<PaginatedResponse<MedicalRecord>> {
    const queryParams = this.buildQueryParams(filters);
    return this.api.get<PaginatedResponse<MedicalRecord>>(
      `/medical-records?${queryParams}`
    );
  }

  async getMedicalRecordById(id: string): Promise<MedicalRecord> {
    this.validateId(id, "Medical Record ID");
    return this.api.get<MedicalRecord>(`/medical-records/${id}`);
  }

  async createMedicalRecord(
    recordData: Partial<MedicalRecord>
  ): Promise<MedicalRecord> {
    this.validateMedicalRecordData(recordData);
    return this.api.post<MedicalRecord>("/medical-records", recordData);
  }

  // 💊 GESTIÓN DE PRESCRIPCIONES
  async getPrescriptions(
    patientId?: string
  ): Promise<PaginatedResponse<Prescription>> {
    const queryParams = patientId ? `patientId=${patientId}` : "";
    return this.api.get<PaginatedResponse<Prescription>>(
      `/prescriptions?${queryParams}`
    );
  }

  async verifyPrescription(verificationCode: string): Promise<Prescription> {
    if (!verificationCode?.trim()) {
      throw new Error("Código de verificación requerido");
    }
    return this.api.get<Prescription>(
      `/prescriptions/verify/${verificationCode}`
    );
  }

  // 🤖 SERVICIOS DE IA MÉDICA
  async analyzeSymptoms(
    symptoms: string[],
    patientInfo?: Partial<Patient>
  ): Promise<SymptomAnalysis> {
    if (!symptoms || symptoms.length === 0) {
      throw new Error("Se requiere al menos un síntoma para el análisis");
    }

    const payload = {
      symptoms: symptoms.filter((s) => s.trim()),
      patientInfo: patientInfo || {},
    };

    return this.api.post<SymptomAnalysis>("/ai/analyze-symptoms", payload);
  }

  async checkDrugInteractions(
    medications: string[]
  ): Promise<DrugInteractionCheck> {
    if (!medications || medications.length < 2) {
      throw new Error(
        "Se requieren al menos 2 medicamentos para verificar interacciones"
      );
    }

    const payload = {
      medications: medications.filter((m) => m.trim()),
    };

    return this.api.post<DrugInteractionCheck>(
      "/ai/drug-interactions",
      payload
    );
  }

  // 🔧 MÉTODOS DE UTILIDAD PRIVADOS
  private buildQueryParams(params: Record<string, any>): string {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    return queryParams.toString();
  }

  private validateId(id: string, fieldName: string): void {
    if (!id || typeof id !== "string" || id.trim().length === 0) {
      throw new Error(`${fieldName} es requerido y debe ser válido`);
    }
  }

  private validatePatientData(data: Partial<Patient>): void {
    if (data.email && !this.isValidEmail(data.email)) {
      throw new Error("Email debe tener un formato válido");
    }

    if (data.dateOfBirth && !this.isValidDate(data.dateOfBirth)) {
      throw new Error("Fecha de nacimiento debe ser válida");
    }
  }

  private validateAppointmentData(data: Partial<Appointment>): void {
    const required = ["patientId", "doctorId", "date", "time"];

    for (const field of required) {
      if (!(field in data) || !data[field as keyof Appointment]) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }

    if (data.date && !this.isValidDate(data.date)) {
      throw new Error("Fecha de cita debe ser válida");
    }
  }

  private validateMedicalRecordData(data: Partial<MedicalRecord>): void {
    const required = ["patientId", "doctorId", "type", "title", "description"];

    for (const field of required) {
      if (!(field in data) || !data[field as keyof MedicalRecord]) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}

// 🎯 INSTANCIA SINGLETON
export const medicalService = new MedicalService();

export default MedicalService;
