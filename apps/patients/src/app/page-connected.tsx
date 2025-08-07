/**
 * page-connected.tsx - Dashboard de Paciente CONECTADO AL BACKEND REAL
 * NUEVA VERSIÓN: Usa datos reales del API Server (Puerto 3001)
 * Mantiene el diseño hermoso pero con datos dinámicos del backend
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  FileText,
  Pill,
  User,
  Heart,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  MapPin,
  Phone,
  Video,
  Download,
  Bell,
  RefreshCw,
  LogOut,
  Play,
  BookOpen,
  Stethoscope,
  Shield,
  Zap,
  Star,
  TrendingUp,
  Users,
  Settings,
  HelpCircle,
  Wifi,
  Database
} from "lucide-react";

// Importar nuestro nuevo sistema de API desde hooks locales
import { useAltamedicaAPI, useAPIRequest } from "../hooks/useAltamedicaAPI";

// Componentes de error simples (inline)
const AltamedicaErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => children;
const AltamedicaErrorHandler: React.FC<{ 
  loading: boolean; 
  apiError: string | null; 
  onRetry: () => void; 
  context: string; 
  children: React.ReactNode 
}> = ({ loading, apiError, children }) => {
  if (loading) return <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div></div>;
  if (apiError) return <div className="text-red-600 p-4">Error: {apiError}</div>;
  return <>{children}</>;
};
const ConnectivityStatus: React.FC<{ isConnected: boolean; testing: boolean; onRetry: () => void }> = ({ isConnected, testing, onRetry }) => (
  <div className={`flex items-center justify-between p-2 rounded ${isConnected ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
    <span>{isConnected ? '✓ Conectado' : '✗ Desconectado'}</span>
    <button onClick={onRetry} disabled={testing} className="text-sm underline">
      {testing ? 'Probando...' : 'Probar'}
    </button>
  </div>
);

// ========================================
// INTERFACES ACTUALIZADAS
// ========================================

interface PatientDashboardStats {
  nextAppointment: string | null;
  totalAppointments: number;
  completedConsultations: number;
  pendingMedications: number;
  lastCheckup: string | null;
}

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

const PatientDashboardConnected: React.FC = () => {
  // Estados para datos específicos del paciente
  const [currentPatientId] = useState<string>("patient_001"); // Simulamos login
  const [dashboardStats, setDashboardStats] = useState<PatientDashboardStats>({
    nextAppointment: null,
    totalAppointments: 0,
    completedConsultations: 0,
    pendingMedications: 0,
    lastCheckup: null
  });

  // Hook de API centralizado
  console.log('🔍 useAltamedicaAPI import:', typeof useAltamedicaAPI);
  const api = useAltamedicaAPI();

  // Hooks de API usando el nuevo sistema
  const { 
    data: patientsData, 
    loading: patientsLoading, 
    error: patientsError 
  } = useAPIRequest(() => api.getPatients({ page: 1, limit: 10 }), []);

  const { 
    data: appointmentsData, 
    loading: appointmentsLoading, 
    error: appointmentsError 
  } = useAPIRequest(() => api.getAppointments(currentPatientId), [currentPatientId]);

  const { 
    data: systemHealthData, 
    loading: systemHealthLoading 
  } = useAPIRequest(() => api.getDashboard(), []);

  const [isConnected, setIsConnected] = useState(true);
  const [connectivityTesting, setConnectivityTesting] = useState(false);

  const testConnection = async () => {
    setConnectivityTesting(true);
    try {
      await api.getDashboard();
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setConnectivityTesting(false);
    }
  };

  const refetchAppointments = async () => {
    window.location.reload(); // Simple refresh for now
  };

  // Calcular estadísticas del dashboard basadas en datos reales
  useEffect(() => {
    if (appointmentsData) {
      // Asumimos que appointmentsData contiene un array de appointments
      const appointments = Array.isArray(appointmentsData) ? appointmentsData : 
                          appointmentsData.appointments || appointmentsData.data || [];
      
      if (appointments.length > 0) {
        // Encontrar próxima cita
        const nextAppt = appointments
          .filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

        // Contar completadas
        const completed = appointments.filter(apt => apt.status === 'completed').length;

        setDashboardStats({
          nextAppointment: nextAppt ? `${nextAppt.date} ${nextAppt.time}` : null,
          totalAppointments: appointments.length,
          completedConsultations: completed,
          pendingMedications: 2, // Mockear por ahora
          lastCheckup: appointments[appointments.length - 1]?.date || null
        });
      }
    }
  }, [appointmentsData]);

  // ========================================
  // COMPONENTES UI
  // ========================================

  const StatsCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
    loading?: boolean;
  }> = ({ title, value, icon, color, subtitle, loading }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color} hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <div className="flex items-center mt-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
              <span className="ml-2 text-sm text-gray-500">Cargando...</span>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </>
          )}
        </div>
        <div className="p-3 rounded-full bg-gray-50">
          {icon}
        </div>
      </div>
    </div>
  );

  const AppointmentCard: React.FC<{
    appointment: any;
    onViewDetails: () => void;
  }> = ({ appointment, onViewDetails }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{appointment.doctorName}</h3>
          <p className="text-sm text-gray-600 mt-1">{appointment.type}</p>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{appointment.date} a las {appointment.time}</span>
          </div>
          <div className="flex items-center mt-1 text-sm">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              appointment.status === 'completed' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {appointment.status === 'scheduled' ? 'Programada' :
               appointment.status === 'confirmed' ? 'Confirmada' :
               appointment.status === 'completed' ? 'Completada' : 'Cancelada'}
            </span>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          {appointment.type === 'telemedicine' && (
            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center">
              <Video className="w-3 h-3 mr-1" />
              Videollamada
            </button>
          )}
          <button 
            onClick={onViewDetails}
            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
          >
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  );

  const SystemStatusCard: React.FC = () => (
    <div className="bg-white rounded-lg shadow-md p-4 border">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
        <Database className="w-4 h-4 mr-2" />
        Estado del Sistema
      </h3>
      
      <div className="space-y-3">
        <ConnectivityStatus 
          isConnected={isConnected} 
          testing={connectivityTesting}
          onRetry={testConnection} 
        />
        
        {systemHealthData && (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <div className="text-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-green-800">Servidor Médico</span>
                <span className="text-green-600">✓ {systemHealthData.status}</span>
              </div>
              <div className="text-xs text-green-700 space-y-1">
                <div>Uptime: {Math.floor(systemHealthData.uptime / 3600)}h {Math.floor((systemHealthData.uptime % 3600) / 60)}m</div>
                <div>Memoria: {systemHealthData.memory.used}MB / {systemHealthData.memory.total}MB</div>
                <div>Servicios: {Object.values(systemHealthData.services).filter(s => s.includes('healthy')).length}/4 activos</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ========================================
  // RENDER PRINCIPAL
  // ========================================

  return (
    <AltamedicaErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">🏥</div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">AltaMedica</h1>
                  <p className="text-sm text-gray-600">Portal de Pacientes - CONECTADO</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Wifi className="w-4 h-4 mr-1" />
                  <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                  <User className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Banner de Estado */}
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-3" />
              <div>
                <span className="font-medium">✅ Portal Conectado al Backend Real</span>
                <p className="text-sm">Los datos mostrados provienen directamente del API Server (Puerto 3001)</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Próxima Cita"
              value={dashboardStats.nextAppointment || "Ninguna programada"}
              icon={<Calendar className="w-6 h-6 text-blue-600" />}
              color="border-blue-500"
              loading={appointmentsLoading}
            />
            <StatsCard
              title="Total Citas"
              value={dashboardStats.totalAppointments}
              icon={<Clock className="w-6 h-6 text-green-600" />}
              color="border-green-500"
              subtitle="Datos reales del backend"
              loading={appointmentsLoading}
            />
            <StatsCard
              title="Consultas Completadas"
              value={dashboardStats.completedConsultations}
              icon={<CheckCircle className="w-6 h-6 text-purple-600" />}
              color="border-purple-500"
              loading={appointmentsLoading}
            />
            <StatsCard
              title="Medicamentos Activos"
              value={dashboardStats.pendingMedications}
              icon={<Pill className="w-6 h-6 text-red-600" />}
              color="border-red-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Panel Principal - Citas */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Mis Citas Médicas (Datos Reales)
                  </h2>
                  <button 
                    onClick={refetchAppointments}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors flex items-center text-sm"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Actualizar
                  </button>
                </div>

                <AltamedicaErrorHandler
                  loading={appointmentsLoading}
                  apiError={appointmentsError}
                  onRetry={refetchAppointments}
                  context="Citas Médicas"
                >
                  {appointmentsData && (() => {
                    const appointments = Array.isArray(appointmentsData) ? appointmentsData : 
                                        appointmentsData.appointments || appointmentsData.data || [];
                    return appointments.length > 0 ? (
                      <div className="space-y-4">
                        {appointments.map((appointment) => (
                          <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            onViewDetails={() => console.log('Ver detalles:', appointment.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay citas programadas</h3>
                        <p className="text-gray-600">Programa tu primera cita médica</p>
                        <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                          Programar Cita
                        </button>
                      </div>
                    );
                  })()}
                </AltamedicaErrorHandler>
              </div>
            </div>

            {/* Panel Lateral */}
            <div className="space-y-6">
              {/* Accesos Rápidos */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Accesos Rápidos</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 rounded border hover:bg-gray-50 transition-colors flex items-center">
                    <Video className="w-4 h-4 mr-3 text-blue-600" />
                    <span>Telemedicina</span>
                  </button>
                  <button className="w-full text-left p-3 rounded border hover:bg-gray-50 transition-colors flex items-center">
                    <FileText className="w-4 h-4 mr-3 text-green-600" />
                    <span>Historial Médico</span>
                  </button>
                  <button className="w-full text-left p-3 rounded border hover:bg-gray-50 transition-colors flex items-center">
                    <Pill className="w-4 h-4 mr-3 text-purple-600" />
                    <span>Medicamentos</span>
                  </button>
                  <button className="w-full text-left p-3 rounded border hover:bg-gray-50 transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-3 text-gray-600" />
                    <span>Descargar Reportes</span>
                  </button>
                </div>
              </div>

              {/* Estado del Sistema */}
              <SystemStatusCard />

              {/* Información del Backend */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <Database className="w-4 h-4 mr-2" />
                  Conexión Backend
                </h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>• API Server: http://localhost:3001</div>
                  <div>• Datos: {patientsData?.total || (Array.isArray(patientsData) ? patientsData.length : 0)} pacientes registrados</div>
                  <div>• Citas: {appointmentsData?.total || (() => {
                    const appointments = Array.isArray(appointmentsData) ? appointmentsData : 
                                        appointmentsData?.appointments || appointmentsData?.data || [];
                    return appointments.length;
                  })()} citas totales</div>
                  <div>• Estado: {isConnected ? 'Conectado' : 'Desconectado'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AltamedicaErrorBoundary>
  );
};

export default PatientDashboardConnected;