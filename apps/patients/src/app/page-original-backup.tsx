/**
 * page.tsx - Dashboard de Paciente Renovado con Videos Explicativos
 * Proyecto: Altamedica Pacientes
 * Diseño: Dashboard corporativo con branding Altamedica y videos educativos
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
} from "lucide-react";

// Importación de componentes corporativos
import {
  CardCorporate,
  CardHeaderCorporate,
  CardContentCorporate,
} from "../components/ui/CardCorporate";
import { ButtonCorporate } from "../components/ui/ButtonCorporate";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { VideoCard } from "../components/ui/VideoCard";
import { QuickAccessCard } from "../components/ui/QuickAccessCard";
import { HealthMetricCard } from "../components/ui/HealthMetricCard";
import { useAuth, usePatientData } from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import DashboardLayout from "./dashboard-layout";
import { buildApiUrl, getDefaultHeaders } from "../config/api";
import { AnamnesisCard } from "../components/AnamnesisCard";

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

// 🎥 Videos explicativos de Altamedica
const EXPLANATORY_VIDEOS = [
  {
    id: "1",
    title: "Cómo usar tu portal de paciente",
    description: "Aprende a navegar por todas las funciones de tu portal de salud personal",
    videoUrl: "/videos/portal-guide.mp4",
    thumbnailUrl: "/images/video-thumbnails/portal-guide.jpg",
    duration: "3:45",
    category: "salud" as const,
  },
  {
    id: "2",
    title: "Agendar citas médicas online",
    description: "Guía completa para programar tus citas de manera rápida y sencilla",
    videoUrl: "/videos/appointment-booking.mp4",
    thumbnailUrl: "/images/video-thumbnails/appointment-booking.jpg",
    duration: "2:30",
    category: "citas" as const,
  },
  {
    id: "3",
    title: "Tu primera consulta de telemedicina",
    description: "Todo lo que necesitas saber para tu primera videollamada médica",
    videoUrl: "/videos/telemedicine-guide.mp4",
    thumbnailUrl: "/images/video-thumbnails/telemedicine-guide.jpg",
    duration: "4:15",
    category: "telemedicina" as const,
  },
  {
    id: "4",
    title: "Entendiendo tu historial médico",
    description: "Cómo interpretar y gestionar tu información médica de forma segura",
    videoUrl: "/videos/medical-history.mp4",
    thumbnailUrl: "/images/video-thumbnails/medical-history.jpg",
    duration: "3:20",
    category: "historial" as const,
  },
];

// 🚀 Accesos rápidos del dashboard
const QUICK_ACCESS_ITEMS = [
  {
    id: "appointments",
    title: "Agendar Cita",
    description: "Programa tu próxima consulta médica de forma rápida y sencilla",
    icon: <Calendar className="w-6 h-6" />,
    href: "/appointments/new",
    color: "blue" as const,
    isNew: false,
  },
  {
    id: "telemedicine",
    title: "Telemedicina",
    description: "Consulta con tu médico desde la comodidad de tu hogar",
    icon: <Video className="w-6 h-6" />,
    href: "/telemedicine",
    color: "purple" as const,
    isNew: true,
  },
  {
    id: "medical-history",
    title: "Historial Clínico",
    description: "Accede a todos tus registros médicos y resultados de pruebas",
    icon: <FileText className="w-6 h-6" />,
    href: "/medical-history",
    color: "green" as const,
    isNew: false,
  },
  {
    id: "prescriptions",
    title: "Medicamentos",
    description: "Gestiona tus prescripciones y recordatorios de medicación",
    icon: <Pill className="w-6 h-6" />,
    href: "/prescriptions",
    color: "red" as const,
    isNew: false,
  },
  {
    id: "lab-results",
    title: "Resultados de Laboratorio",
    description: "Consulta tus análisis y estudios médicos más recientes",
    icon: <Stethoscope className="w-6 h-6" />,
    href: "/lab-results",
    color: "orange" as const,
    isNew: false,
  },
  {
    id: "support",
    title: "Soporte 24/7",
    description: "Obtén ayuda técnica y médica cuando la necesites",
    icon: <HelpCircle className="w-6 h-6" />,
    href: "/support",
    color: "teal" as const,
    isNew: false,
  },
];

function PatientDashboardContent() {
  const router = useRouter();
  const { authState, logout } = useAuth();
  const { patientData, loading: patientLoading } = usePatientData();

  // Estado del dashboard
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    appointments: [],
    recentRecords: [],
    activePrescriptions: [],
    healthMetrics: null,
    notifications: 0,
    isLoading: true,
    isRefreshing: false,
    errors: [],
    lastUpdated: null,
  });

  // Estado de errores y loading global
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Efecto de inicialización
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Función principal de carga de datos reales
  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (!authState?.user || !authState.token) return;
    setDashboardState((prev) => ({
      ...prev,
      isLoading: !isRefresh,
      isRefreshing: isRefresh,
      errors: [],
    }));
    setGlobalError(null);
    try {
      // 1. Citas
      const appointmentsRes = await fetch(buildApiUrl(`/api/v1/appointments?patientId=${authState.user.id}&limit=5`), {
        headers: getDefaultHeaders(authState.token),
      });
      const appointmentsJson = await appointmentsRes.json();
      if (!appointmentsRes.ok) throw new Error(appointmentsJson?.error || 'Error al cargar citas');
      const appointments = appointmentsJson.data || [];

      // 2. Historial médico
      const recordsRes = await fetch(buildApiUrl(`/api/v1/medical-records?patientId=${authState.user.id}&limit=5`), {
        headers: getDefaultHeaders(authState.token),
      });
      const recordsJson = await recordsRes.json();
      if (!recordsRes.ok) throw new Error(recordsJson?.error || 'Error al cargar historial médico');
      const recentRecords = recordsJson.data || [];

      // 3. Notificaciones
      const notificationsRes = await fetch(buildApiUrl(`/api/v1/notifications?limit=5`), {
        headers: getDefaultHeaders(authState.token),
      });
      const notificationsJson = await notificationsRes.json();
      if (!notificationsRes.ok) throw new Error(notificationsJson?.error || 'Error al cargar notificaciones');
      const notifications = notificationsJson.data?.notifications || [];
      const notificationsCount = notificationsJson.data?.unread_count || 0;

      // 4. Telemedicina (opcional, si existe endpoint)
      let telemedicineSessions = [];
      try {
        const teleRes = await fetch(buildApiUrl(`/api/v1/telemedicine/sessions?patientId=${authState.user.id}&limit=5`), {
          headers: getDefaultHeaders(authState.token),
        });
        if (teleRes.ok) {
          const teleJson = await teleRes.json();
          telemedicineSessions = teleJson.data || [];
        }
      } catch {}

      setDashboardState((prev) => ({
        ...prev,
        appointments,
        recentRecords,
        notifications: notificationsCount,
        isLoading: false,
        isRefreshing: false,
        lastUpdated: new Date().toISOString(),
        errors: [],
      }));
    } catch (error: any) {
      setGlobalError(error.message || 'Error general al cargar el dashboard');
      setDashboardState((prev) => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        errors: [{
          code: 'DASHBOARD_LOAD_ERROR',
          message: error.message || 'Error general al cargar el dashboard',
          severity: 'high',
          timestamp: new Date().toISOString(),
        }],
      }));
    }
  }, [authState?.user, authState?.token]);

  // 🔄 Función de refresco manual
  const handleRefresh = useCallback(() => {
    loadDashboardData(true);
  }, [loadDashboardData]);

  // 🚪 Función de logout segura
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Error durante logout:", error);
    }
  }, [logout, router]);

  // 🎨 Función para obtener colores de estado
  const getStatusColor = useCallback((status: string): string => {
    const statusColors = {
      confirmed: "text-green-700 bg-green-100 border-green-200",
      scheduled: "text-blue-700 bg-blue-100 border-blue-200",
      completed: "text-gray-700 bg-gray-100 border-gray-200",
      cancelled: "text-red-700 bg-red-100 border-red-200",
      active: "text-green-700 bg-green-100 border-green-200",
      normal: "text-green-700 bg-green-100",
      elevated: "text-yellow-700 bg-yellow-100",
      high: "text-orange-700 bg-orange-100",
      critical: "text-red-700 bg-red-100",
    };
    return (
      statusColors[status as keyof typeof statusColors] ||
      "text-gray-700 bg-gray-100"
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

  // 🔄 Estado de carga principal
  if (dashboardState.isLoading || patientLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="space-y-6 text-center">
          <div className="relative">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">A</span>
            </div>
            <div className="absolute inset-0 w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              Cargando tu portal de salud
            </h2>
            <p className="text-gray-600">
              Preparando tu información médica personalizada
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header Corporativo Altamedica */}
      <div className="bg-white border-b border-blue-100 shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              {/* Logo Altamedica */}
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
                <span className="text-xl font-bold text-white">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Portal de Salud
                </h1>
                <p className="text-blue-600 font-medium">
                  Bienvenido, {userInfo.displayName}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Botón de Refresh */}
              <ButtonCorporate
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={dashboardState.isRefreshing}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <RefreshCw
                  className={`w-4 h-4 ${dashboardState.isRefreshing ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Actualizar</span>
              </ButtonCorporate>

              {/* Notificaciones */}
              <button className="relative p-2 text-gray-600 transition-colors hover:text-blue-600">
                <Bell className="w-6 h-6" />
                {dashboardState.notifications > 0 && (
                  <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
                    {dashboardState.notifications}
                  </span>
                )}
              </button>

              {/* Agendar Cita */}
              <ButtonCorporate
                variant="primary"
                size="sm"
                onClick={() => router.push("/appointments/new")}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Cita
              </ButtonCorporate>

              {/* Logout */}
              <ButtonCorporate
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
              </ButtonCorporate>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Información de última actualización */}
        {dashboardState.lastUpdated && (
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-500">
              Última actualización: {new Date(dashboardState.lastUpdated).toLocaleString('es-ES')}
            </p>
          </div>
        )}

        {/* Errores del Dashboard */}
        {dashboardState.errors.length > 0 && (
          <div className="mb-6">
            {dashboardState.errors.map((error, index) => (
              <div
                key={index}
                className="p-4 mb-4 border border-red-200 rounded-lg bg-red-50"
              >
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-800">
                    Error del Sistema
                  </span>
                </div>
                <p className="mt-2 text-red-700">{error.message}</p>
                <p className="mt-1 text-xs text-red-600">
                  Código: {error.code}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Métricas de Salud con Componentes Renovados */}
        {dashboardState.healthMetrics && (
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
            <HealthMetricCard
              title="Presión Arterial"
              value={`${dashboardState.healthMetrics.bloodPressure.systolic}/${dashboardState.healthMetrics.bloodPressure.diastolic}`}
              unit="mmHg"
              status={dashboardState.healthMetrics.bloodPressure.status === "normal" ? "normal" : "warning"}
              icon={<Heart className="w-6 h-6" />}
              description="Última medición"
              lastUpdated={dashboardState.healthMetrics.bloodPressure.date}
              onClick={() => router.push("/health-metrics")}
            />

            <HealthMetricCard
              title="Frecuencia Cardíaca"
              value={dashboardState.healthMetrics.heartRate.value}
              unit="bpm"
              status={dashboardState.healthMetrics.heartRate.status === "normal" ? "normal" : "warning"}
              icon={<Activity className="w-6 h-6" />}
              description="Ritmo cardíaco actual"
              lastUpdated={dashboardState.healthMetrics.heartRate.date}
              onClick={() => router.push("/health-metrics")}
            />

            <HealthMetricCard
              title="Peso"
              value={dashboardState.healthMetrics.weight.value}
              unit="kg"
              status="normal"
              trend={dashboardState.healthMetrics.weight.trend === "stable" ? "stable" : dashboardState.healthMetrics.weight.trend === "increasing" ? "up" : "down"}
              icon={<User className="w-6 h-6" />}
              description="Control de peso"
              lastUpdated={dashboardState.healthMetrics.weight.date}
              onClick={() => router.push("/health-metrics")}
            />

            <HealthMetricCard
              title="Último Chequeo"
              value={dashboardState.healthMetrics.lastCheckup}
              status="excellent"
              icon={<CheckCircle className="w-6 h-6" />}
              description="Fecha de última revisión"
              onClick={() => router.push("/medical-history")}
            />
                  </div>
        )}

        {/* Accesos Rápidos */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Accesos Rápidos
            </h2>
            <p className="text-gray-600">
              Navega rápidamente por las funciones principales
            </p>
                  </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {QUICK_ACCESS_ITEMS.map((item) => (
              <QuickAccessCard
                key={item.id}
                title={item.title}
                description={item.description}
                icon={item.icon}
                href={item.href}
                color={item.color}
                isNew={item.isNew}
                onClick={() => router.push(item.href)}
              />
            ))}
                  </div>
                </div>

        {/* Contenido Principal Completo */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Próximas Citas - Sección Principal */}
          <div className="lg:col-span-2">
            <CardCorporate variant="default" size="lg" className="h-full">
              <CardHeaderCorporate
                title="Próximas Citas"
                className="px-6 py-4 border-b border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center text-lg font-medium text-gray-900">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Próximas Citas
                  </h2>
                  <ButtonCorporate
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/appointments")}
                  >
                    Ver todas
                  </ButtonCorporate>
                </div>
              </CardHeaderCorporate>
              <CardContentCorporate className="p-6">
                {dashboardState.appointments.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardState.appointments
                      .slice(0, 3)
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-4 transition-all duration-200 border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                {getTypeIcon(appointment.type)}
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {appointment.doctorName}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {appointment.specialty}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}
                            >
                              {appointment.status === "confirmed"
                                ? "Confirmada"
                                : appointment.status === "scheduled"
                                  ? "Programada"
                                  : appointment.status === "completed"
                                    ? "Completada"
                                    : "Cancelada"}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>
                                {appointment.date} - {appointment.time}
                              </span>
                            </div>
                            {appointment.location && (
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{appointment.location}</span>
                              </div>
                            )}
                          </div>

                          {appointment.notes && (
                            <p className="p-2 mt-3 text-sm text-gray-700 rounded bg-gray-50">
                              {appointment.notes}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-4">
                            <ButtonCorporate
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(`/appointments/${appointment.id}`)
                              }
                            >
                              Ver detalles
                            </ButtonCorporate>

                            {appointment.status === "confirmed" && (
                              <div className="flex space-x-2">
                                {appointment.type === "telemedicine" ||
                                appointment.location === "Telemedicina" ? (
                                  <ButtonCorporate
                                    variant="secondary"
                                    size="sm"
                                    className="flex items-center space-x-2 bg-purple-100 text-purple-700 hover:bg-purple-200"
                                    onClick={() =>
                                      router.push(`/telemedicine/${appointment.id}`)
                                    }
                                  >
                                    <Video className="w-4 h-4" />
                                    <span>Unirse</span>
                                  </ButtonCorporate>
                                ) : (
                                  <ButtonCorporate
                                    variant="secondary"
                                    size="sm"
                                    className="flex items-center space-x-2 bg-blue-100 text-blue-700 hover:bg-blue-200"
                                    onClick={() =>
                                      router.push(`/appointments/${appointment.id}`)
                                    }
                                  >
                                    <Phone className="w-4 h-4" />
                                    <span>Llamar</span>
                                  </ButtonCorporate>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No tienes citas programadas
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Agenda tu próxima consulta médica
                    </p>
                    <ButtonCorporate
                      variant="primary"
                      onClick={() => router.push("/appointments/new")}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      Agendar Cita
                    </ButtonCorporate>
                  </div>
                )}
              </CardContentCorporate>
            </CardCorporate>
          </div>

          {/* Videos Explicativos - Nueva Sección */}
          <div className="lg:col-span-1">
            <CardCorporate variant="default" size="lg" className="h-full">
              <CardHeaderCorporate
                title="Videos Explicativos"
                className="px-6 py-4 border-b border-gray-200"
              >
                <div className="flex items-center justify-between">
                <h2 className="flex items-center text-lg font-medium text-gray-900">
                    <Play className="w-5 h-5 mr-2 text-purple-600" />
                    Aprende con Altamedica
                </h2>
                    <ButtonCorporate
                      variant="ghost"
                      size="sm"
                    onClick={() => router.push("/videos")}
                    >
                    Ver todos
                    </ButtonCorporate>
                  </div>
              </CardHeaderCorporate>
              <CardContentCorporate className="p-6">
                <div className="space-y-4">
                  {EXPLANATORY_VIDEOS.slice(0, 2).map((video) => (
                    <VideoCard
                      key={video.id}
                      title={video.title}
                      description={video.description}
                      videoUrl={video.videoUrl}
                      thumbnailUrl={video.thumbnailUrl}
                      duration={video.duration}
                      category={video.category}
                      onFavorite={() => console.log('Favorito:', video.id)}
                      onShare={() => console.log('Compartir:', video.id)}
                    />
                  ))}
                      </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                        <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Star className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                        ¿Necesitas ayuda?
                            </h3>
                            <p className="text-sm text-gray-600">
                        Nuestros videos te guían paso a paso
                            </p>
                          </div>
                        </div>
                          </div>
              </CardContentCorporate>
            </CardCorporate>
                        </div>
                      </div>

        {/* Sección de Anamnesis */}
        <div className="mt-8">
          <AnamnesisCard />
        </div>
      </div>
    </div>
  );
}

export default function PatientDashboardImproved() {
  return (
    <DashboardLayout>
      <PatientDashboardContent />
    </DashboardLayout>
  );
}
