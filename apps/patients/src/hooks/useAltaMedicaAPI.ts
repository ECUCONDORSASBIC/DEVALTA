// 🔥 HOOK MAESTRO ALTAMEDICA API
// Conecta con los 55+ endpoints implementados
// PROACTIVO: <350 líneas, tipado estricto, manejo de errores

import { useState, useEffect, useCallback } from 'react';

// 📝 TIPOS PRINCIPALES
export interface APIResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface APIError {
  message: string;
  status: number;
  code?: string;
}

// 🌐 CONFIGURACIÓN BASE
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_VERSION = '/api/v1';

class AltaMedicaAPIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = `${API_BASE_URL}${API_VERSION}`;
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('altamedica_token');
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // 🔐 AUTENTICACIÓN
  async login(email: string, password: string) {
    // Cargar Firebase dinámicamente para evitar SSR issues
    const {
      initializeFirebase,
      signInWithEmailAndPassword,
      getFirebaseAuth,
    } = await import('@altamedica/firebase');

    // Asegurar inicialización
    initializeFirebase();
    const auth = getFirebaseAuth();

    // Autenticar con Firebase (email / password)
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    // Enviar idToken al backend para obtener perfil y/o claims
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Guardar idToken para futuras peticiones (Bearer)
    this.token = idToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('altamedica_token', this.token);
    }

    return data;
  }

  async logout() {
    try {
      const { getFirebaseAuth, signOut } = await import('@altamedica/firebase');
      try {
        const auth = getFirebaseAuth();
        await signOut(auth);
      } catch {
        /* ignore signOut errors */
      }

      // Notificar al backend (opcional)
      await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } finally {
      this.token = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('altamedica_token');
      }
    }
  }

  async getProfile() {
    const response = await fetch(`${this.baseURL}/auth/me`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Profile fetch failed: ${response.statusText}`);
    }

    return response.json();
  }

  // 👤 PACIENTES
  async getPatients(params?: { page?: number; limit?: number; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const response = await fetch(`${this.baseURL}/patients?${queryParams}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Patients fetch failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getPatient(id: string) {
    const response = await fetch(`${this.baseURL}/patients/${id}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Patient fetch failed: ${response.statusText}`);
    }

    return response.json();
  }

  async updatePatient(id: string, data: any) {
    const response = await fetch(`${this.baseURL}/patients/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Patient update failed: ${response.statusText}`);
    }

    return response.json();
  }

  // 📅 CITAS
  async getAppointments(patientId?: string, params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = patientId 
      ? `/patients/${patientId}/appointments`
      : '/appointments';

    const response = await fetch(`${this.baseURL}${endpoint}?${queryParams}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Appointments fetch failed: ${response.statusText}`);
    }

    return response.json();
  }

  async createAppointment(data: any) {
    const response = await fetch(`${this.baseURL}/appointments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Appointment creation failed: ${response.statusText}`);
    }

    return response.json();
  }

  async updateAppointment(id: string, data: any) {
    const response = await fetch(`${this.baseURL}/appointments/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Appointment update failed: ${response.statusText}`);
    }

    return response.json();
  }

  async cancelAppointment(id: string) {
    const response = await fetch(`${this.baseURL}/appointments/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Appointment cancellation failed: ${response.statusText}`);
    }

    return response.json();
  }

  // 📋 REGISTROS MÉDICOS
  async getMedicalRecords(params?: { page?: number; limit?: number; patientId?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.patientId) queryParams.append('patientId', params.patientId);

    const response = await fetch(`${this.baseURL}/medical-records?${queryParams}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Medical records fetch failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getMedicalRecord(id: string) {
    const response = await fetch(`${this.baseURL}/medical-records/${id}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Medical record fetch failed: ${response.statusText}`);
    }

    return response.json();
  }

  // 💊 PRESCRIPCIONES
  async getPrescriptions(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${this.baseURL}/prescriptions?${queryParams}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Prescriptions fetch failed: ${response.statusText}`);
    }

    return response.json();
  }

  async verifyPrescription(params: { code?: string; patientId?: string; doctorId?: string }) {
    const queryParams = new URLSearchParams();
    if (params.code) queryParams.append('code', params.code);
    if (params.patientId) queryParams.append('patientId', params.patientId);
    if (params.doctorId) queryParams.append('doctorId', params.doctorId);

    const response = await fetch(`${this.baseURL}/prescriptions/verify?${queryParams}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Prescription verification failed: ${response.statusText}`);
    }

    return response.json();
  }

  // 🤖 IA MÉDICA
  async analyzeSymptoms(symptoms: string[], patientInfo?: any) {
    const response = await fetch(`${this.baseURL}/ai/analyze-symptoms`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ symptoms, patientInfo }),
    });

    if (!response.ok) {
      throw new Error(`Symptom analysis failed: ${response.statusText}`);
    }

    return response.json();
  }

  async checkDrugInteractions(medications: string[]) {
    const response = await fetch(`${this.baseURL}/ai/drug-interactions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ medications }),
    });

    if (!response.ok) {
      throw new Error(`Drug interaction check failed: ${response.statusText}`);
    }

    return response.json();
  }

  // 📊 DASHBOARD
  async getDashboard(patientId?: string) {
    const endpoint = patientId 
      ? `/dashboard/patient/${patientId}` 
      : '/dashboard';

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Dashboard fetch failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getDashboardStats() {
    const response = await fetch(`${this.baseURL}/dashboard/stats`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Dashboard stats fetch failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// 🎯 SINGLETON INSTANCE
const apiClient = new AltaMedicaAPIClient();

// 🪝 HOOK PRINCIPAL
export function useAltaMedicaAPI() {
  return apiClient;
}

// 🔄 HOOK GENÉRICO PARA REQUESTS
export function useAPIRequest<T>(
  requestFn: () => Promise<T>,
  dependencies: any[] = []
): APIResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const executeRequest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await requestFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    executeRequest();
  }, [executeRequest]);

  return {
    data,
    loading,
    error,
    success: data !== null && error === null,
  };
}

export default useAltaMedicaAPI;
