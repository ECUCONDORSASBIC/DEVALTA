import { useState, useEffect } from 'react';

// === TYPES ===
export interface DashboardStats {
  appointmentsToday: number;
  totalPatients: number;
  totalDoctors: number;
  emergenciesToday: number;
  satisfactionRate: number;
}

export interface Appointment {
  id: string;
  dateTime: string;
  type: 'consultation' | 'checkup' | 'emergency';
  status: 'confirmed' | 'pending' | 'cancelled';
  location?: string;
  room?: string;
  doctor?: {
    firstName: string;
    lastName: string;
    specialization?: string;
  };
  patient?: {
    firstName: string;
    lastName: string;
  };
}

export interface Prescription {
  id: string;
  status: 'active' | 'completed' | 'cancelled';
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  patient?: {
    firstName: string;
    lastName: string;
  };
}

export interface Activity {
  id: string;
  type: 'appointment' | 'prescription' | 'patient';
  timestamp: string;
  status?: string;
  patient?: {
    firstName: string;
    lastName: string;
  };
  firstName?: string;
  lastName?: string;
}

// === MOCK DATA ===
const mockStats: DashboardStats = {
  appointmentsToday: 12,
  totalPatients: 1547,
  totalDoctors: 89,
  emergenciesToday: 3,
  satisfactionRate: 4.9
};

const mockAppointment: Appointment = {
  id: '1',
  dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // En 2 horas
  type: 'consultation',
  status: 'confirmed',
  location: 'Hospital Central',
  room: '301',
  doctor: {
    firstName: 'Dr. Carlos',
    lastName: 'García',
    specialization: 'Cardiología'
  }
};

const mockPrescriptions: Prescription[] = [
  {
    id: '1',
    status: 'active',
    medications: [
      {
        name: 'Losartán',
        dosage: '50mg',
        frequency: 'Cada 12 horas'
      }
    ]
  },
  {
    id: '2',
    status: 'active',
    medications: [
      {
        name: 'Atorvastatina',
        dosage: '20mg',
        frequency: 'Una vez al día'
      }
    ]
  }
];

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'appointment',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Hace 30 min
    status: 'confirmed',
    patient: {
      firstName: 'María',
      lastName: 'González'
    }
  },
  {
    id: '2',
    type: 'prescription',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // Hace 45 min
    patient: {
      firstName: 'Juan',
      lastName: 'Pérez'
    }
  },
  {
    id: '3',
    type: 'patient',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Hace 2 horas
    firstName: 'Ana',
    lastName: 'López'
  }
];

// === HOOKS ===
export const useDashboardData = () => {
  const [nextAppointment, setNextAppointment] = useState<{
    data: Appointment | null;
    isLoading: boolean;
  }>({
    data: null,
    isLoading: true
  });

  const [activePrescriptions, setActivePrescriptions] = useState<{
    data: Prescription[] | null;
    isLoading: boolean;
  }>({
    data: null,
    isLoading: true
  });

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setNextAppointment({
        data: mockAppointment,
        isLoading: false
      });

      setActivePrescriptions({
        data: mockPrescriptions,
        isLoading: false
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    nextAppointment,
    activePrescriptions
  };
};

export const useLiveStats = () => {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga de estadísticas en tiempo real
    const timer = setTimeout(() => {
      setData(mockStats);
      setIsLoading(false);
    }, 800);

    // Actualizar estadísticas cada 30 segundos
    const interval = setInterval(() => {
      setData(prev => prev ? {
        ...prev,
        appointmentsToday: prev.appointmentsToday + Math.floor(Math.random() * 2),
        emergenciesToday: Math.max(0, prev.emergenciesToday + Math.floor(Math.random() * 3) - 1)
      } : null);
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return { data, isLoading };
};

export const useRecentActivity = () => {
  const [data, setData] = useState<Activity[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga de actividad reciente
    const timer = setTimeout(() => {
      setData(mockActivities);
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return { data, isLoading };
};
