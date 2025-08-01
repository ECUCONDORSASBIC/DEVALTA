import { useState, useEffect } from 'react';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  primaryDiagnosis: string;
  comorbidities: string[];
  lastVisit: string;
  nextAppointment: string;
  healthScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  insuranceProvider: string;
  contactNumber: string;
  email: string;
  address: string;
  emergencyContact: string;
  medications: string[];
  allergies: string[];
  bloodType: string;
  height: number;
  weight: number;
  bmi: number;
}

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  type: 'in_person' | 'telemedicine_video' | 'telemedicine_audio' | 'follow_up' | 'emergency';
  specialty: string;
  reason: string;
  duration: number;
  insuranceCovered: boolean;
  copay: number;
  notes: string;
  symptoms: string[];
}

interface TelemedicineSession {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  status: 'waiting' | 'active' | 'ended' | 'cancelled';
  startTime: string;
  endTime?: string;
  duration?: number;
  type: 'video' | 'audio' | 'chat';
  notes: string;
  symptoms: string[];
  diagnosis?: string;
  prescription?: string[];
  followUpDate?: string;
}

interface MarketplaceOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  specialty: string;
  type: 'job' | 'contract' | 'consultation' | 'partnership';
  salary: string;
  postedDate: string;
  applications: number;
  rating: number;
  urgent?: boolean;
  description: string;
  requirements: string[];
  benefits: string[];
  experience: string;
  schedule: string;
  remote?: boolean;
  companyLogo?: string;
  companySize: string;
  companyIndustry: string;
}

interface DashboardStats {
  totalPatients: number;
  activeAppointments: number;
  telemedicineSessions: number;
  marketplaceOffers: number;
  pendingAppointments: number;
  completedAppointments: number;
  patientSatisfaction: number;
  monthlyRevenue: number;
}

export function useDashboardData() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [telemedicineSessions, setTelemedicineSessions] = useState<TelemedicineSession[]>([]);
  const [marketplaceOffers, setMarketplaceOffers] = useState<MarketplaceOffer[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    activeAppointments: 0,
    telemedicineSessions: 0,
    marketplaceOffers: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    patientSatisfaction: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar pacientes
  const loadPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      const data = await response.json();
      
      if (data.success) {
        setPatients(data.data);
      } else {
        console.error('Error loading patients:', data.error);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  // Cargar citas
  const loadAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      const data = await response.json();
      
      if (data.success) {
        setAppointments(data.data);
      } else {
        console.error('Error loading appointments:', data.error);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  // Cargar sesiones de telemedicina
  const loadTelemedicineSessions = async () => {
    try {
      const response = await fetch('/api/telemedicine');
      const data = await response.json();
      
      if (data.success) {
        setTelemedicineSessions(data.data);
      } else {
        console.error('Error loading telemedicine sessions:', data.error);
      }
    } catch (error) {
      console.error('Error loading telemedicine sessions:', error);
    }
  };

  // Cargar ofertas del marketplace
  const loadMarketplaceOffers = async () => {
    try {
      const response = await fetch('/api/marketplace');
      const data = await response.json();
      
      if (data.success) {
        setMarketplaceOffers(data.data);
      } else {
        console.error('Error loading marketplace offers:', data.error);
      }
    } catch (error) {
      console.error('Error loading marketplace offers:', error);
    }
  };

  // Aplicar a una oferta del marketplace
  const applyToOffer = async (offerId: string, coverLetter?: string) => {
    try {
      const response = await fetch('/api/marketplace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offerId,
          doctorId: 'doc1', // ID del doctor actual
          coverLetter: coverLetter || 'Interesado en la posición',
          resume: 'CV del doctor'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error applying to offer:', error);
      return { success: false, error: 'Error al aplicar a la oferta' };
    }
  };

  // Crear nueva sesión de telemedicina
  const createTelemedicineSession = async (sessionData: {
    patientId: string;
    patientName: string;
    type: 'video' | 'audio' | 'chat';
    notes: string;
    symptoms: string[];
  }) => {
    try {
      const response = await fetch('/api/telemedicine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...sessionData,
          doctorId: 'doc1',
          doctorName: 'Dr. Carlos López'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Recargar sesiones
        await loadTelemedicineSessions();
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error creating telemedicine session:', error);
      return { success: false, error: 'Error al crear la sesión' };
    }
  };

  // Actualizar sesión de telemedicina
  const updateTelemedicineSession = async (sessionId: string, updates: {
    status?: 'waiting' | 'active' | 'ended' | 'cancelled';
    endTime?: string;
    duration?: number;
    diagnosis?: string;
    prescription?: string[];
    followUpDate?: string;
  }) => {
    try {
      const response = await fetch('/api/telemedicine', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          ...updates
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Recargar sesiones
        await loadTelemedicineSessions();
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error updating telemedicine session:', error);
      return { success: false, error: 'Error al actualizar la sesión' };
    }
  };

  // Crear nueva cita
  const createAppointment = async (appointmentData: {
    patientName: string;
    patientId: string;
    date: string;
    time: string;
    type: 'in_person' | 'telemedicine_video' | 'telemedicine_audio' | 'follow_up' | 'emergency';
    specialty: string;
    reason: string;
    duration: number;
    insuranceCovered: boolean;
    copay: number;
    notes: string;
    symptoms: string[];
  }) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...appointmentData,
          doctorId: 'doc1',
          doctorName: 'Dr. Carlos López'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Recargar citas
        await loadAppointments();
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      return { success: false, error: 'Error al crear la cita' };
    }
  };

  // Calcular estadísticas
  const calculateStats = () => {
    const totalPatients = patients.length;
    const activeAppointments = appointments.filter(a => a.status === 'scheduled').length;
    const telemedicineSessionsCount = telemedicineSessions.filter(s => s.status === 'active').length;
    const marketplaceOffersCount = marketplaceOffers.length;
    const pendingAppointments = appointments.filter(a => a.status === 'scheduled').length;
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    
    // Calcular ingresos mensuales (simulado)
    const monthlyRevenue = completedAppointments * 50; // €50 por cita completada
    
    // Calcular satisfacción del paciente (simulado)
    const patientSatisfaction = 4.8; // Basado en calificaciones

    setStats({
      totalPatients,
      activeAppointments,
      telemedicineSessions: telemedicineSessionsCount,
      marketplaceOffers: marketplaceOffersCount,
      pendingAppointments,
      completedAppointments,
      patientSatisfaction,
      monthlyRevenue
    });
  };

  // Cargar todos los datos
  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadPatients(),
        loadAppointments(),
        loadTelemedicineSessions(),
        loadMarketplaceOffers()
      ]);
    } catch (error) {
      setError('Error al cargar los datos del dashboard');
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadAllData();
  }, []);

  // Efecto para recalcular estadísticas cuando cambian los datos
  useEffect(() => {
    calculateStats();
  }, [patients, appointments, telemedicineSessions, marketplaceOffers]);

  return {
    // Datos
    patients,
    appointments,
    telemedicineSessions,
    marketplaceOffers,
    stats,
    
    // Estado
    loading,
    error,
    
    // Funciones
    loadPatients,
    loadAppointments,
    loadTelemedicineSessions,
    loadMarketplaceOffers,
    applyToOffer,
    createTelemedicineSession,
    updateTelemedicineSession,
    createAppointment,
    loadAllData
  };
} 