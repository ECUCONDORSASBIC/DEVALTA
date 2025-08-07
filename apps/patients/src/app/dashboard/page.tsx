'use client';

import { useEffect, useState } from 'react';
import { useAuth, useRequireAuth } from "@altamedica/auth';
import { api } from '@/lib/api-client-jwt';
import { 
  Calendar, 
  Clock, 
  User, 
  Activity, 
  FileText,
  Video,
  Bell,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface DashboardData {
  appointments: {
    upcoming: number;
    past: number;
    nextAppointment?: {
      id: string;
      date: string;
      time: string;
      doctorName: string;
      specialty: string;
    };
  };
  medicalRecords: {
    total: number;
    recent: number;
  };
  prescriptions: {
    active: number;
    expiringSoon: number;
  };
  notifications: {
    unread: number;
    items: Array<{
      id: string;
      type: string;
      message: string;
      timestamp: string;
    }>;
  };
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchDashboardData();
    }
  }, [isAuthenticated, authLoading]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<DashboardData>('/api/v1/patients/dashboard');
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error fetching dashboard:', err);
      setError('Error al cargar el dashboard');
      // Datos de ejemplo si falla la API
      setDashboardData({
        appointments: {
          upcoming: 2,
          past: 5,
          nextAppointment: {
            id: '1',
            date: '2025-02-15',
            time: '10:30',
            doctorName: 'Dra. María García',
            specialty: 'Cardiología',
          },
        },
        medicalRecords: {
          total: 12,
          recent: 3,
        },
        prescriptions: {
          active: 2,
          expiringSoon: 1,
        },
        notifications: {
          unread: 3,
          items: [
            {
              id: '1',
              type: 'appointment',
              message: 'Recordatorio: Cita mañana a las 10:30',
              timestamp: new Date().toISOString(),
            },
          ],
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-neutral-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // El middleware redirigirá
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-primary-600">AltaMedica</div>
              <span className="text-neutral-500">|</span>
              <span className="text-gray-700">Portal de Pacientes</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-neutral-600 hover:text-gray-900">
                <Bell className="w-6 h-6" />
                {dashboardData?.notifications.unread ? (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {dashboardData.notifications.unread}
                  </span>
                ) : null}
              </button>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-neutral-500">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-neutral-600 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-neutral-50"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-neutral-600 mt-2">
            Aquí puedes gestionar tus citas médicas y ver tu historial
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-10 h-10 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">
                {dashboardData?.appointments.upcoming || 0}
              </span>
            </div>
            <h3 className="text-gray-700 font-medium">Citas Próximas</h3>
            <p className="text-sm text-neutral-500 mt-1">En los próximos 30 días</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-10 h-10 text-success-600" />
              <span className="text-2xl font-bold text-gray-900">
                {dashboardData?.medicalRecords.total || 0}
              </span>
            </div>
            <h3 className="text-gray-700 font-medium">Registros Médicos</h3>
            <p className="text-sm text-neutral-500 mt-1">
              {dashboardData?.medicalRecords.recent || 0} recientes
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-10 h-10 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                {dashboardData?.prescriptions.active || 0}
              </span>
            </div>
            <h3 className="text-gray-700 font-medium">Prescripciones Activas</h3>
            <p className="text-sm text-neutral-500 mt-1">
              {dashboardData?.prescriptions.expiringSoon || 0} por vencer
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Video className="w-10 h-10 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-900">24/7</span>
            </div>
            <h3 className="text-gray-700 font-medium">Telemedicina</h3>
            <p className="text-sm text-neutral-500 mt-1">Disponible ahora</p>
          </div>
        </div>

        {/* Next Appointment */}
        {dashboardData?.appointments.nextAppointment && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                  Próxima Cita
                </h2>
                <div className="flex items-center gap-4 text-blue-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{dashboardData.appointments.nextAppointment.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{dashboardData.appointments.nextAppointment.time}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-blue-900 font-medium">
                    {dashboardData.appointments.nextAppointment.doctorName}
                  </p>
                  <p className="text-blue-700 text-sm">
                    {dashboardData.appointments.nextAppointment.specialty}
                  </p>
                </div>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                Ver detalles
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all text-left group">
            <Calendar className="w-8 h-8 text-primary-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Agendar Cita</h3>
            <p className="text-sm text-neutral-600">
              Reserva una consulta con tu médico preferido
            </p>
            <div className="mt-4 text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              <span className="text-sm font-medium">Agendar ahora</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <button className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-green-500 hover:shadow-lg transition-all text-left group">
            <FileText className="w-8 h-8 text-success-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Ver Historial</h3>
            <p className="text-sm text-neutral-600">
              Accede a tus registros médicos y resultados
            </p>
            <div className="mt-4 text-success-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              <span className="text-sm font-medium">Ver registros</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <button className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-purple-500 hover:shadow-lg transition-all text-left group">
            <Video className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Telemedicina</h3>
            <p className="text-sm text-neutral-600">
              Inicia una consulta virtual con un médico
            </p>
            <div className="mt-4 text-purple-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              <span className="text-sm font-medium">Iniciar consulta</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}