/**
 * Este archivo es un módulo ESM (import/export). No se detectan incompatibilidades de módulos en este archivo.
 * Si usas este dashboard en entornos CJS, puede haber incompatibilidades.
 */

/**
 * page.tsx - Dashboard de Paciente Mejorado y Robusto
 * Proyecto: Altamedica Pacientes
 * Diseño: Refactorización conservadora con componentes corporativos
 */

"use client";

import {
  Activity,
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Heart,
  LogOut,
  MapPin,
  Phone,
  Pill,
  RefreshCw,
  Shield,
  Stethoscope,
  User,
  Video
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

// Importación de componentes desde @altamedica/ui centralizado
import { useDiagnosticEngine } from "@altamedica/hooks/medical";
import {
  ButtonCorporate,
  CardContentCorporate,
  CardCorporate,
  CardHeaderCorporate,
  DiagnosticAssistant,
  HealthMetricCard,
  LoadingSpinner
} from "@altamedica/ui";
import AccessibilityControls from "../components/accessibility/AccessibilityControls";
// 🚫 DESACTIVADO TEMPORALMENTE PARA TESTING
// import { useAuth } from "../providers/AuthProviderSimple";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 📝 Interfaces TypeScript robustas
interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: "consultation" | "follow_up" | "emergency" | "telemedicine";
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  location?: string;
  notes?: string;
}

interface MedicalRecord {
  id: string;
  date: string;
  doctorName: string;
  specialty: string;
  diagnosis: string;
  notes: string;
  attachments?: string[];
  priority: "low" | "medium" | "high" | "critical";
}

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  date: string;
  endDate?: string;
  status: "active" | "completed" | "cancelled";
  instructions?: string;
  remainingDoses?: number;
}

interface HealthMetrics {
  bloodPressure: {
    systolic: number;
    diastolic: number;
    date: string;
    status: "normal" | "elevated" | "high" | "critical";
  };
  heartRate: {
    value: number;
    date: string;
    status: "normal" | "low" | "high";
  };
  weight: {
    value: number;
    date: string;
    trend: "stable" | "increasing" | "decreasing";
  };
  lastCheckup: string;
}

interface DashboardError {
  code: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
}

// 🎯 Estado del dashboard robusto
interface DashboardState {
  appointments: Appointment[];
  recentRecords: MedicalRecord[];
  activePrescriptions: Prescription[];
  healthMetrics: HealthMetrics | null;
  notifications: number;
  isLoading: boolean;
  isRefreshing: boolean;
  errors: DashboardError[];
  lastUpdated: string | null;
}

// 🎯 Funciones de generación de datos mock
function generateMockAppointments(): Appointment[] {
  return [
    {
      id: "apt-001",
      doctorName: "Dr. Carlos Mendoza",
      specialty: "Cardiología",
      date: "2025-02-15",
      time: "14:30",
      type: "consultation",
      status: "confirmed",
      location: "Consultorio 205, 2do Piso",
      notes: "Control de presión arterial"
    },
    {
      id: "apt-002",
      doctorName: "Dra. Ana López",
      specialty: "Medicina General",
      date: "2025-02-20",
      time: "10:00",
      type: "telemedicine",
      status: "scheduled",
      location: "Telemedicina",
      notes: "Revisión de análisis de laboratorio"
    }
  ];
}

function generateMockRecords(): MedicalRecord[] {
  return [
    {
      id: "rec-001",
      date: "2025-01-10",
      doctorName: "Dr. Carlos Mendoza",
      specialty: "Cardiología",
      diagnosis: "Hipertensión arterial leve",
      notes: "Paciente con presión arterial elevada. Se recomienda dieta hiposódica.",
      priority: "medium"
    },
    {
      id: "rec-002",
      date: "2025-01-08",
      doctorName: "Dr. Roberto Silva",
      specialty: "Medicina de Emergencias",
      diagnosis: "Angina de pecho",
      notes: "Dolor torácico evaluado. Descartado infarto agudo.",
      priority: "high"
    }
  ];
}

function generateMockPrescriptions(): Prescription[] {
  return [
    {
      id: "pres-001",
      medication: "Enalapril",
      dosage: "10mg",
      frequency: "1 vez al día",
      prescribedBy: "Dr. Carlos Mendoza",
      date: "2025-01-10",
      endDate: "2025-07-10",
      status: "active",
      instructions: "Tomar en la mañana con el desayuno",
      remainingDoses: 150
    },
    {
      id: "pres-002",
      medication: "Aspirina",
      dosage: "100mg",
      frequency: "1 vez al día",
      prescribedBy: "Dr. Carlos Mendoza",
      date: "2025-01-10",
      status: "active",
      instructions: "Tomar después del almuerzo"
    }
  ];
}

function generateMockHealthMetrics(): HealthMetrics {
  return {
    bloodPressure: {
      systolic: 120,
      diastolic: 80,
      date: new Date().toISOString(),
      status: "normal"
    },
    heartRate: {
      value: 72,
      date: new Date().toISOString(),
      status: "normal"
    },
    weight: {
      value: 70,
      date: new Date().toISOString(),
      trend: "stable"
    },
    lastCheckup: "2025-01-15"
  };
}

export default function PatientDashboardImproved() {
  const router = useRouter();
  
  // 🚫 DESACTIVADO TEMPORALMENTE PARA TESTING - usando datos mock
  // const authState = useAuth();
  const authState = {
    isAuthenticated: true,
    isLoading: false,
    user: {
      id: 'patient_test_12345',
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'paciente.test@email.com',
      age: 35,
      sex: 'M' as 'M' | 'F'
    },
    firebaseUser: null,
    logout: () => console.log('Logout mock')
  };
  
  // Diagnostic Engine State
  const [diagnosticStarted, setDiagnosticStarted] = useState<boolean>(false);
  const diagnosticEngine = useDiagnosticEngine({
    age: authState.user.age || 35,
    sex: authState.user.sex || 'M',
    onSafetyWarning: (warnings) => {
      console.warn('⚠️ Safety warnings:', warnings);
      // Show urgent care modal if needed
      if (warnings.length > 0) {
        setGlobalError(`Atención médica urgente recomendada: ${warnings.join(', ')}`);
      }
    },
    maxQuestions: 12
  });

  // Estado del dashboard
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    appointments: [],
    recentRecords: [],
    activePrescriptions: [],
    healthMetrics: null,
    notifications: 0,
    isLoading: true, // Siempre inicia cargando
    isRefreshing: false,
    errors: [],
    lastUpdated: null,
  });

  // Estado de errores y loading global
  const [globalError, setGlobalError] = useState<string | null>(null);

  // 🚫 FUNCIÓN DE CARGA MOCK PARA TESTING - Sin llamadas API
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    console.log('🧪 [Dashboard] Cargando datos mock para testing...');
    
    setDashboardState((prev) => ({
      ...prev,
      isLoading: !isRefresh,
      isRefreshing: isRefresh,
      errors: [],
    }));
    setGlobalError(null);
    
    // Simular delay de carga
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Usar datos mock en lugar de llamadas API
      const appointments = generateMockAppointments();
      const recentRecords = generateMockRecords();
      const activePrescriptions = generateMockPrescriptions();
      const healthMetrics = generateMockHealthMetrics();
      const notificationsCount = 3; // Mock notifications

      setDashboardState((prev) => ({
        ...prev,
        appointments,
        recentRecords,
        activePrescriptions,
        healthMetrics,
        notifications: notificationsCount,
        isLoading: false,
        isRefreshing: false,
        lastUpdated: new Date().toISOString(),
        errors: [],
      }));
      
      console.log('✅ [Dashboard] Datos mock cargados exitosamente');
    } catch (error: any) {
      console.error('❌ [Dashboard] Error cargando datos mock:', error);
      setDashboardState((prev) => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        errors: [{
          code: 'DASHBOARD_LOAD_ERROR',
          message: error.message || 'Error al cargar los datos del dashboard',
          severity: 'high',
          timestamp: new Date().toISOString(),
        }],
      }));
    }
  }, []);

  // 🚫 CARGAR DATOS AUTOMÁTICAMENTE PARA TESTING - Sin validación de auth
  useEffect(() => {
    console.log('🚀 [Dashboard] Cargando datos mock automáticamente...');
    loadDashboardData();
  }, [loadDashboardData]);

  // 🔄 Función de refresco manual
  const handleRefresh = useCallback(() => {
    loadDashboardData(true);
  }, [loadDashboardData]);

  // 🚪 Función de logout segura
  const handleLogout = useCallback(async () => {
    try {
      await authState.logout();
      router.push("/login");
    } catch (error) {
      console.error("Error durante logout:", error);
    }
  }, [authState.logout, router]);

  // 🎨 Función para obtener colores de estado
  const getStatusColor = useCallback((status: string): string => {
    const statusColors = {
      confirmed: "text-success-700 bg-success-100 border-success-200",
      scheduled: "text-primary-700 bg-primary-100 border-primary-200",
      completed: "text-neutral-700 bg-neutral-100 border-neutral-200",
      cancelled: "text-alert-700 bg-alert-100 border-alert-200",
      active: "text-success-700 bg-success-100 border-success-200",
      normal: "text-success-700 bg-success-100",
      elevated: "text-alert-700 bg-alert-100",
      high: "text-alert-700 bg-alert-100",
      critical: "text-alert-700 bg-alert-100",
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      "text-neutral-700 bg-neutral-100"
    );
  }, []);

  // 🔄 Función para obtener ícono de tipo de cita
  const getTypeIcon = useCallback((type: string) => {
    const icons = {
      consultation: <User className="w-4 h-4" />,
      follow_up: <Clock className="w-4 h-4" />,
      emergency: <AlertCircle className="w-4 h-4" />,
      telemedicine: <Video className="w-4 h-4" />,
    };
    return (
      icons[type as keyof typeof icons] || <Calendar className="w-4 h-4" />
    );
  }, []);

  // 📊 Información del usuario memoizada
  const userInfo = useMemo(() => {
    const user = authState.user;
    if (!user) return { displayName: "Usuario", email: "No disponible" };

    const displayName = `${user.firstName} ${user.lastName}`;
    return { displayName, email: user.email };
  }, [authState.user]);

  // 💬 Mensajes contextuales basados en el estado del paciente
  const contextualMessage = useMemo(() => {
    const hasUpcomingAppointments = dashboardState.appointments.length > 0;
    const hasActivePrescriptions = dashboardState.activePrescriptions.length > 0;
    const hasNotifications = dashboardState.notifications > 0;

  if (typeof dashboardState.notifications === 'number' && dashboardState.notifications > 0) {
      return {
        title: "Tienes actualizaciones importantes",
        subtitle: "Revisa tus notificaciones para mantenerte al día",
        cta: "Ver Notificaciones",
        icon: "bell",
        variant: "amber"
      };
    }

    if (hasUpcomingAppointments) {
      return {
        title: "Tu próxima cita está confirmada",
        subtitle: "Prepárate para tu consulta médica",
        cta: "Ver Detalles",
        icon: "calendar",
        variant: "blue"
      };
    }

    if (hasActivePrescriptions) {
      return {
        title: "Recordatorio de medicamentos",
        subtitle: "Mantén tu tratamiento al día",
        cta: "Ver Prescripciones",
        icon: "pill",
        variant: "green"
      };
    }

    return {
      title: "Tu salud digital, siempre contigo",
      subtitle: "Acceso 24/7 a médicos certificados y gestión inteligente",
      cta: "Comenzar Consulta",
      icon: "heart",
      variant: "purple"
    };
  }, [dashboardState.appointments.length, dashboardState.activePrescriptions.length, dashboardState.notifications]);

  // Mostrar loading solo si el dashboard no tiene datos todavía
  if (dashboardState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="space-y-4 text-center">
          <LoadingSpinner size="lg" />
          <p className="font-medium text-neutral-600">
            Actualizando datos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Controles de Accesibilidad */}
      <AccessibilityControls />
      
      {/* Header Mejorado con Branding Corporativo */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              {/* Logo Altamedica */}
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600">
                <span className="text-lg font-bold text-white">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-800">
                  Bienvenido, {userInfo.displayName}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-4 h-4 text-primary-600" />
                  <Link href="/profile" className="text-sm text-primary-700 font-medium hover:underline">Mi Perfil</Link>
                </div>
                <p className="text-sm text-neutral-500 mt-1">
                  Tu portal de salud personal.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="w-4 h-4 text-success-600" />
                  <span className="text-xs text-success-700">Cumplimos con estándares HIPAA y protección de datos médicos</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notificaciones */}
              <Link href="/notifications">
                <div className="relative">
                  <ButtonCorporate
                    variant="ghost"
                    size="sm"
                    className={`p-2 ${dashboardState.notifications > 0 ? 'text-alert-600 bg-alert-50 hover:bg-alert-100' : 'text-neutral-600 hover:text-primary-600'}`}
                  >
                    <Bell className="w-5 h-5" />
                    {dashboardState.notifications > 0 && (
                      <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-alert-500 rounded-full -top-1 -right-1 animate-pulse">
                        {dashboardState.notifications}
                      </span>
                    )}
                  </ButtonCorporate>
                </div>
              </Link>

              {/* Botón de Refresh */}
              <ButtonCorporate
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={dashboardState.isRefreshing}
                className="flex items-center space-x-2 text-neutral-600 hover:text-primary-600"
              >
                <RefreshCw
                  className={`w-4 h-4 ${dashboardState.isRefreshing ? "animate-spin" : ""}`}
                />
              </ButtonCorporate>

              {/* Logout */}
              <ButtonCorporate
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-alert-600 hover:text-alert-700 p-2"
              >
                <LogOut className="w-4 h-4" />
              </ButtonCorporate>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Estado Contextual Inteligente */}
      <div className="bg-primary-50 border-b border-primary-200">
        <div className="px-4 py-3 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {contextualMessage.icon === 'bell' && <Bell className="w-5 h-5 text-primary-600" />}
              {contextualMessage.icon === 'calendar' && <Calendar className="w-5 h-5 text-primary-600" />}
              {contextualMessage.icon === 'pill' && <Pill className="w-5 h-5 text-success-600" />}
              {contextualMessage.icon === 'heart' && <Heart className="w-5 h-5 text-primary-600" />}
              <div>
                <span className="text-sm font-medium text-primary-800">
                  {contextualMessage.title}
                </span>
                <p className="text-xs text-primary-700">
                  {contextualMessage.subtitle}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ButtonCorporate
                variant="ghost"
                size="sm"
                className="text-xs px-3 py-1 text-primary-700 hover:bg-primary-100"
                onClick={() => {
                  if (contextualMessage.icon === 'bell') router.push('/notifications');
                  else if (contextualMessage.icon === 'calendar') router.push('/appointments');
                  else if (contextualMessage.icon === 'pill') router.push('/prescriptions');
                  else router.push('/telemedicine/instant');
                }}
              >
                {contextualMessage.cta}
              </ButtonCorporate>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-neutral-600">Sistema Activo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal - Optimizado para móvil */}
      <div className="px-3 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8 md:py-8">
        
        {/* Información de última actualización */}
        {dashboardState.lastUpdated && (
          <div className="mb-6 text-center">
            <p className="text-sm text-neutral-500">
              Última actualización: {dashboardState.lastUpdated}
            </p>
          </div>
        )}

        {/* Errores del Dashboard */}
        {dashboardState.errors.length > 0 && (
          <div className="mb-6">
            {dashboardState.errors.map((error, index) => (
              <div
                key={index}
                className="p-4 mb-4 border border-alert-200 rounded-lg bg-alert-50"
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-alert-600" />
                  <span className="font-medium text-alert-800">
                    Error del Sistema
                  </span>
                </div>
                <p className="mt-2 text-alert-700">{error.message}</p>
                <p className="mt-1 text-xs text-alert-600">
                  Código: {error.code}
                </p>
              </div>
            ))}
          </div>
        )}

        

        {/* Sistema de Diagnóstico Presuntivo con IA - Versión Compacta */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Diagnóstico Presuntivo - 1/3 del espacio en desktop */}
            <div className="lg:col-span-1">
              <DiagnosticAssistant
                currentQuestion={diagnosticEngine.currentQuestion}
                hypotheses={diagnosticEngine.session?.hypotheses || []}
                progress={diagnosticEngine.progress || { answered: 0 }}
                isLoading={diagnosticEngine.isLoading}
                isComplete={diagnosticEngine.isComplete}
                onAnswer={diagnosticEngine.submitAnswer}
                onReset={diagnosticEngine.resetSession}
                onStart={() => {
                  setDiagnosticStarted(true);
                  diagnosticEngine.startSession();
                }}
                sessionStarted={diagnosticStarted && !!diagnosticEngine.session}
                patientInfo={{
                  age: authState.user.age || 35,
                  sex: authState.user.sex || 'M'
                }}
              />
            </div>
            
            {/* Accesos Rápidos - 2/3 del espacio en desktop */}
            <div className="lg:col-span-2">
              <CardCorporate variant="default" size="lg" className="h-full">
                <CardHeaderCorporate
                  title="Centro de Salud Digital"
                  className="px-6 py-4 border-b border-neutral-200"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center text-lg font-medium text-neutral-900">
                      <Heart className="w-5 h-5 mr-2 text-red-500" />
                      Tu Salud al Alcance
                    </h2>
                  </div>
                </CardHeaderCorporate>
                <CardContentCorporate className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Acceso a Telemedicina */}
                    <button
                      onClick={() => router.push("/telemedicine")}
                      className="flex flex-col items-center justify-center p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                    >
                      <Video className="w-8 h-8 text-primary-600 mb-2" />
                      <span className="text-sm font-medium text-neutral-900">Telemedicina</span>
                      <span className="text-xs text-neutral-600">Consulta virtual</span>
                    </button>
                    
                    {/* Agendar Cita */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      {/* Agendar Cita */}
                      <button
                        onClick={() => router.push("/appointments/new")}
                        className="flex flex-col items-center justify-center p-6 bg-success-50 hover:bg-success-100 rounded-xl shadow transition-colors"
                      >
                        <Calendar className="w-10 h-10 text-success-600 mb-2" />
                        <span className="text-base font-semibold text-neutral-900">Agendar Cita</span>
                        <span className="text-xs text-neutral-600">Presencial</span>
                      </button>
                      {/* Historial Médico */}
                      <button
                        onClick={() => router.push("/medical-history")}
                        className="flex flex-col items-center justify-center p-6 bg-primary-50 hover:bg-primary-100 rounded-xl shadow transition-colors"
                      >
                        <FileText className="w-10 h-10 text-primary-600 mb-2" />
                        <span className="text-base font-semibold text-neutral-900">Historial</span>
                        <span className="text-xs text-neutral-600">Expediente médico</span>
                      </button>
                      {/* Medicamentos */}
                      <button
                        onClick={() => router.push("/prescriptions")}
                        className="flex flex-col items-center justify-center p-6 bg-alert-50 hover:bg-alert-100 rounded-xl shadow transition-colors"
                      >
                        <Pill className="w-10 h-10 text-alert-600 mb-2" />
                        <span className="text-base font-semibold text-neutral-900">Medicamentos</span>
                        <span className="text-xs text-neutral-600">Recetas activas</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Accesos secundarios */}
                      <button onClick={() => router.push("/lab-results")} className="flex flex-col items-center justify-center p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                        <Activity className="w-8 h-8 text-primary-600 mb-2" />
                        <span className="text-sm font-medium text-neutral-900">Laboratorio</span>
                        <span className="text-xs text-neutral-600">Resultados</span>
                      </button>
                      <button onClick={() => router.push("/emergency")} className="flex flex-col items-center justify-center p-4 bg-alert-50 hover:bg-alert-100 rounded-lg transition-colors">
                        <AlertCircle className="w-8 h-8 text-alert-600 mb-2" />
                        <span className="text-sm font-medium text-neutral-900">Emergencia</span>
                        <span className="text-xs text-neutral-600">SOS 24/7</span>
                      </button>
                      <button onClick={() => router.push("/doctors")} className="flex flex-col items-center justify-center p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                        <Stethoscope className="w-8 h-8 text-primary-600 mb-2" />
                        <span className="text-sm font-medium text-neutral-900">Médicos</span>
                        <span className="text-xs text-neutral-600">Buscar especialista</span>
                      </button>
                      <button onClick={() => router.push("/health-metrics")} className="flex flex-col items-center justify-center p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors">
                        <User className="w-8 h-8 text-neutral-600 mb-2" />
                        <span className="text-sm font-medium text-neutral-900">Mi Perfil</span>
                        <span className="text-xs text-neutral-600">Datos de salud</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Banner informativo */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-primary-50 rounded-lg border border-primary-200">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-6 h-6 text-primary-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-sky-900">
                          Tu información médica está protegida
                        </p>
                        <p className="text-xs text-primary-700">
                          Cumplimos con estándares HIPAA y protección de datos médicos
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContentCorporate>
              </CardCorporate>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardState.healthMetrics ? (
              <>
                <HealthMetricCard
                  icon={<Heart className="w-5 h-5 text-primary-600" />}
                  title="Presión Arterial"
                  value={dashboardState.healthMetrics.bloodPressure.systolic > 0 
                    ? `${dashboardState.healthMetrics.bloodPressure.systolic}/${dashboardState.healthMetrics.bloodPressure.diastolic}`
                    : 'Sin datos'
                  }
                  status="normal"
                />
                <HealthMetricCard
                  icon={<Activity className="w-5 h-5 text-primary-600" />}
                  title="Ritmo Cardíaco"
                  value={dashboardState.healthMetrics.heartRate.value > 0 
                    ? `${dashboardState.healthMetrics.heartRate.value} bpm`
                    : 'Sin datos'
                  }
                  status="normal"
                />
                <HealthMetricCard
                  icon={<User className="w-5 h-5 text-primary-600" />}
                  title="Peso Corporal"
                  value={dashboardState.healthMetrics.weight.value > 0 
                    ? `${dashboardState.healthMetrics.weight.value} kg`
                    : 'Sin datos'
                  }
                  status="normal"
                />
                <HealthMetricCard
                  icon={<CheckCircle className="w-5 h-5 text-primary-600" />}
                  title="Último Chequeo"
                  value={dashboardState.healthMetrics.lastCheckup 
                    ? new Date(dashboardState.healthMetrics.lastCheckup).toLocaleDateString()
                    : 'No disponible'
                  }
                  status="normal"
                />
              </>
            ) : (
              // Placeholder cuando no hay métricas
              <>
                <HealthMetricCard
                  icon={<Heart className="w-5 h-5 text-primary-600" />}
                  title="Presión Arterial"
                  value="Sin datos"
                  status="normal"
                />
                <HealthMetricCard
                  icon={<Activity className="w-5 h-5 text-primary-600" />}
                  title="Ritmo Cardíaco"
                  value="Sin datos"
                  status="normal"
                />
                <HealthMetricCard
                  icon={<User className="w-5 h-5 text-primary-600" />}
                  title="Peso Corporal"
                  value="Sin datos"
                  status="normal"
                />
                <HealthMetricCard
                  icon={<CheckCircle className="w-5 h-5 text-primary-600" />}
                  title="Último Chequeo"
                  value="No disponible"
                  status="normal"
                />
              </>
            )}
          </div>
        </div>

        {/* Contenido Principal Completo */}
        <div className="grid grid-cols-1 gap-6 lg:gap-8">
          {/* Próximas Citas - Sección más compacta */}
          <div className="w-full">
            <CardCorporate variant="default" size="lg">
              <CardHeaderCorporate title="Citas" className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center text-base sm:text-lg font-medium text-neutral-900">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary-600" />
                    Próximas Citas
                  </h2>
                  <ButtonCorporate
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/appointments")}
                    className="text-xs sm:text-sm"
                  >
                    Ver todas
                  </ButtonCorporate>
                </div>
              </CardHeaderCorporate>
              <CardContentCorporate className="p-4 sm:p-6">
                {dashboardState.appointments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dashboardState.appointments
                      .slice(0, 2)
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-3 sm:p-4 border border-neutral-200 rounded-lg hover:border-blue-300 transition-colors"
                        >
                          <div className="space-y-2">
                            {/* Doctor y Especialidad */}
                            <div>
                              <h3 className="font-medium text-neutral-900 text-sm sm:text-base">
                                {appointment.doctorName}
                              </h3>
                              <p className="text-xs sm:text-sm text-neutral-600">
                                {appointment.specialty}
                              </p>
                            </div>

                            {/* Estado */}
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}
                            >
                              {appointment.status === "confirmed" ? "Confirmada" : "Programada"}
                            </span>

                            {/* Fecha y hora */}
                            <div className="flex items-center space-x-2 text-xs sm:text-sm text-neutral-600">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                              <span>{appointment.date} - {appointment.time}</span>
                            </div>

                            {/* Ubicación */}
                            {appointment.location && (
                              <div className="flex items-center space-x-2 text-xs sm:text-sm text-neutral-600">
                                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                <span>{appointment.location}</span>
                              </div>
                            )}

                            {/* Notas */}
                            {appointment.notes && (
                              <p className="text-xs text-neutral-600 italic">
                                {appointment.notes}
                              </p>
                            )}

                            {/* Acciones */}
                            <div className="flex items-center justify-between pt-2">
                              <ButtonCorporate
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/appointments/${appointment.id}`)}
                                className="text-xs"
                              >
                                Ver detalles
                              </ButtonCorporate>

                              {appointment.status === "confirmed" && (
                                <ButtonCorporate
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs"
                                >
                                  {appointment.type === "telemedicine" || appointment.location === "Telemedicina" ? (
                                    <span className="flex items-center space-x-1">
                                      <Video className="w-3 h-3" />
                                      <span>Unirse</span>
                                    </span>
                                  ) : (
                                    <span className="flex items-center space-x-1">
                                      <MapPin className="w-3 h-3" />
                                      <span>Direcciones</span>
                                    </span>
                                  )}
                                </ButtonCorporate>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="mb-4 text-neutral-500">
                      No tienes citas programadas
                    </p>
                    <ButtonCorporate
                      variant="primary"
                      onClick={() => router.push("/appointments/new")}
                    >
                      Agendar primera cita
                    </ButtonCorporate>
                  </div>
                )}
              </CardContentCorporate>
            </CardCorporate>
          </div>

          {/* Sección de Medicación y Accesos Rápidos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Medicación Activa */}
            <CardCorporate variant="default" size="md">
              <CardHeaderCorporate title="Prescripciones" className="px-4 py-3 border-b border-neutral-200">
                <h3 className="flex items-center text-base font-medium text-neutral-900">
                  <Pill className="w-4 h-4 mr-2 text-success-600" />
                  Medicación Activa
                </h3>
              </CardHeaderCorporate>
              <CardContentCorporate className="p-4">
                {dashboardState.activePrescriptions.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardState.activePrescriptions.slice(0, 2).map((prescription) => (
                      <div key={prescription.id} className="flex items-start space-x-3">
                        <div className="w-1 h-full bg-green-400 rounded-full"></div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-neutral-800">{prescription.medication}</h4>
                          <p className="text-xs text-neutral-600">{prescription.dosage} - {prescription.frequency}</p>
                        </div>
                      </div>
                    ))}
                    <ButtonCorporate
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => router.push("/prescriptions")}
                    >
                      Ver todas
                    </ButtonCorporate>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500 text-center py-4">
                    No tienes medicación activa
                  </p>
                )}
              </CardContentCorporate>
            </CardCorporate>

            {/* Accesos Rápidos Compactos */}
            <CardCorporate variant="default" size="md">
              <CardHeaderCorporate title="Historial Médico" className="px-4 py-3 border-b border-neutral-200">
                <h3 className="text-base font-medium text-neutral-900">Accesos Rápidos</h3>
              </CardHeaderCorporate>
              <CardContentCorporate className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => router.push("/medical-history")}
                    className="flex flex-col items-center p-3 text-center hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    <FileText className="w-5 h-5 text-primary-600 mb-1" />
                    <span className="text-xs font-medium text-neutral-700">Historial</span>
                  </button>
                  <button
                    onClick={() => router.push("/test-results")}
                    className="flex flex-col items-center p-3 text-center hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5 text-success-600 mb-1" />
                    <span className="text-xs font-medium text-neutral-700">Resultados</span>
                  </button>
                  <button
                    onClick={() => router.push("/doctors")}
                    className="flex flex-col items-center p-3 text-center hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5 text-primary-600 mb-1" />
                    <span className="text-xs font-medium text-neutral-700">Doctores</span>
                  </button>
                  <button
                    onClick={() => router.push("/support")}
                    className="flex flex-col items-center p-3 text-center hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    <Phone className="w-5 h-5 text-alert-600 mb-1" />
                    <span className="text-xs font-medium text-neutral-700">Soporte 24/7</span>
                  </button>
                </div>
              </CardContentCorporate>
            </CardCorporate>
          </div>
        </div>

        
      </div>
    </div>
  );
}