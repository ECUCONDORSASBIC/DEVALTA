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
} from "lucide-react";

// Importación de componentes corporativos
import {
  CardCorporate,
  CardHeaderCorporate,
  CardContentCorporate,
} from "../../components/ui/CardCorporate";
import { ButtonCorporate } from "../../components/ui/ButtonCorporate";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { useAuth, usePatientData } from "../../hooks/useAuth";
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

export default function PatientDashboardImproved() {
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
      const appointmentsRes = await fetch(`/api/v1/appointments?patientId=${authState.user.id}&limit=5`, {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      const appointmentsJson = await appointmentsRes.json();
      if (!appointmentsRes.ok) throw new Error(appointmentsJson?.error || 'Error al cargar citas');
      const appointments = appointmentsJson.data || [];

      // 2. Historial médico
      const recordsRes = await fetch(`/api/v1/medical-records?patientId=${authState.user.id}&limit=5`, {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      const recordsJson = await recordsRes.json();
      if (!recordsRes.ok) throw new Error(recordsJson?.error || 'Error al cargar historial médico');
      const recentRecords = recordsJson.data || [];

      // 3. Notificaciones
      const notificationsRes = await fetch(`/api/v1/notifications?limit=5`, {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      const notificationsJson = await notificationsRes.json();
      if (!notificationsRes.ok) throw new Error(notificationsJson?.error || 'Error al cargar notificaciones');
      const notifications = notificationsJson.data?.notifications || [];
      const notificationsCount = notificationsJson.data?.unread_count || 0;

      // 4. Telemedicina (opcional, si existe endpoint)
      let telemedicineSessions = [];
      try {
        const teleRes = await fetch(`/api/v1/telemedicine/sessions?patientId=${authState.user.id}&limit=5`, {
          headers: { Authorization: `Bearer ${authState.token}` },
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="space-y-4 text-center">
          <LoadingSpinner size="lg" />
          <p className="font-medium text-gray-600">
            Cargando panel de salud...
          </p>
          <p className="text-sm text-gray-500">
            Obteniendo datos médicos actualizados
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mejorado con Branding Corporativo */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              {/* Logo Altamedica */}
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700">
                <span className="text-lg font-bold text-white">A</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Panel de Salud
                </h1>
                <p className="text-gray-600">
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
                className="flex items-center space-x-2"
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
              >
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

        {/* Métricas de Salud con Componentes Corporativos */}
        {dashboardState.healthMetrics && (
          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
            <CardCorporate
              variant="default"
              size="md"
              className="transition-shadow hover:shadow-lg"
            >
              <CardContentCorporate className="p-6">
                <div className="flex items-center">
                  <Heart className="w-8 h-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Presión Arterial
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {dashboardState.healthMetrics.bloodPressure.systolic}/
                      {dashboardState.healthMetrics.bloodPressure.diastolic}
                    </p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dashboardState.healthMetrics.bloodPressure.status)}`}
                    >
                      {dashboardState.healthMetrics.bloodPressure.status}
                    </span>
                  </div>
                </div>
              </CardContentCorporate>
            </CardCorporate>

            <CardCorporate
              variant="default"
              size="md"
              className="transition-shadow hover:shadow-lg"
            >
              <CardContentCorporate className="p-6">
                <div className="flex items-center">
                  <Activity className="w-8 h-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Frecuencia Cardíaca
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {dashboardState.healthMetrics.heartRate.value} bpm
                    </p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dashboardState.healthMetrics.heartRate.status)}`}
                    >
                      {dashboardState.healthMetrics.heartRate.status}
                    </span>
                  </div>
                </div>
              </CardContentCorporate>
            </CardCorporate>

            <CardCorporate
              variant="default"
              size="md"
              className="transition-shadow hover:shadow-lg"
            >
              <CardContentCorporate className="p-6">
                <div className="flex items-center">
                  <User className="w-8 h-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Peso</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {dashboardState.healthMetrics.weight.value} kg
                    </p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor("normal")}`}
                    >
                      {dashboardState.healthMetrics.weight.trend}
                    </span>
                  </div>
                </div>
              </CardContentCorporate>
            </CardCorporate>

            <CardCorporate
              variant="default"
              size="md"
              className="transition-shadow hover:shadow-lg"
            >
              <CardContentCorporate className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Último Chequeo
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {dashboardState.healthMetrics.lastCheckup}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Hace 12 días</p>
                  </div>
                </div>
              </CardContentCorporate>
            </CardCorporate>
          </div>
        )}

        {/* Contenido Principal Completo */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Próximas Citas - Sección Principal */}
          <div className="lg:col-span-2">
            <CardCorporate variant="default" size="lg" className="h-full">
              <CardHeaderCorporate
                title="Accesos Rápidos"
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
                                    className="flex items-center space-x-2"
                                  >
                                    <Video className="w-4 h-4" />
                                    <span>Unirse</span>
                                  </ButtonCorporate>
                                ) : (
                                  <ButtonCorporate
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center space-x-2"
                                  >
                                    <MapPin className="w-4 h-4" />
                                    <span>Direcciones</span>
                                  </ButtonCorporate>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="mb-4 text-gray-500">
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

          {/* Sidebar con Prescripciones y Accesos Rápidos */}
          <div className="space-y-6">
            {/* Prescripciones Activas */}
            <CardCorporate variant="default" size="md">
              <CardHeaderCorporate
                title="Medicación Activa"
                className="px-6 py-4 border-b border-gray-200"
              >
                <h2 className="flex items-center text-lg font-medium text-gray-900">
                  <Pill className="w-5 h-5 mr-2 text-green-600" />
                  Medicación Activa
                </h2>
              </CardHeaderCorporate>
              <CardContentCorporate className="p-6">
                {dashboardState.activePrescriptions.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardState.activePrescriptions
                      .slice(0, 3)
                      .map((prescription) => (
                        <div
                          key={prescription.id}
                          className="py-2 pl-4 border-l-4 border-green-400"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {prescription.medication}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}
                            >
                              {prescription.status === "active"
                                ? "Activa"
                                : "Completada"}
                            </span>
                          </div>
                          <p className="mb-1 text-sm text-gray-600">
                            {prescription.dosage} - {prescription.frequency}
                          </p>
                          <p className="mb-2 text-xs text-gray-500">
                            Dr. {prescription.prescribedBy}
                          </p>

                          {prescription.remainingDoses && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">
                                Dosis restantes:
                              </span>
                              <span className="font-medium text-green-600">
                                {prescription.remainingDoses}
                              </span>
                            </div>
                          )}

                          {prescription.instructions && (
                            <p className="p-2 mt-2 text-xs text-gray-600 rounded bg-green-50">
                              {prescription.instructions}
                            </p>
                          )}
                        </div>
                      ))}

                    <ButtonCorporate
                      variant="ghost"
                      size="sm"
                      className="w-full mt-4"
                      onClick={() => router.push("/prescriptions")}
                    >
                      Ver todas las prescripciones
                    </ButtonCorporate>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Pill className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-500">
                      No tienes prescripciones activas
                    </p>
                  </div>
                )}
              </CardContentCorporate>
            </CardCorporate>

            {/* Accesos Rápidos */}
            <CardCorporate variant="default" size="md">
              <CardHeaderCorporate
                title="Accesos Rápidos"
                className="px-6 py-4 border-b border-gray-200"
              >
                <h2 className="text-lg font-medium text-gray-900">
                  Accesos Rápidos
                </h2>
              </CardHeaderCorporate>
              <CardContentCorporate className="p-6">
                <div className="space-y-3">
                  <ButtonCorporate
                    variant="ghost"
                    className="justify-start w-full h-auto p-3"
                    onClick={() => router.push("/medical-history")}
                  >
                    <FileText className="w-5 h-5 mr-3 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium">Ver Historial Médico</div>
                      <div className="text-xs text-gray-500">
                        Consultar registros anteriores
                      </div>
                    </div>
                  </ButtonCorporate>

                  <ButtonCorporate
                    variant="ghost"
                    className="justify-start w-full h-auto p-3"
                    onClick={() => router.push("/test-results")}
                  >
                    <Download className="w-5 h-5 mr-3 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium">Descargar Resultados</div>
                      <div className="text-xs text-gray-500">
                        Análisis y estudios
                      </div>
                    </div>
                  </ButtonCorporate>

                  <ButtonCorporate
                    variant="ghost"
                    className="justify-start w-full h-auto p-3"
                    onClick={() => router.push("/doctors")}
                  >
                    <MapPin className="w-5 h-5 mr-3 text-purple-600" />
                    <div className="text-left">
                      <div className="font-medium">Encontrar Doctores</div>
                      <div className="text-xs text-gray-500">
                        Buscar especialistas
                      </div>
                    </div>
                  </ButtonCorporate>

                  <ButtonCorporate
                    variant="ghost"
                    className="justify-start w-full h-auto p-3"
                    onClick={() => router.push("/telemedicine")}
                  >
                    <Video className="w-5 h-5 mr-3 text-blue-500" />
                    <div className="text-left">
                      <div className="font-medium">Ir a Telemedicina</div>
                      <div className="text-xs text-gray-500">
                        Sesiones virtuales y videollamadas
                      </div>
                    </div>
                  </ButtonCorporate>

                  <ButtonCorporate
                    variant="ghost"
                    className="justify-start w-full h-auto p-3"
                    onClick={() => window.open("tel:+541122334455")}
                  >
                    <Phone className="w-5 h-5 mr-3 text-red-600" />
                    <div className="text-left">
                      <div className="font-medium">Contactar Soporte</div>
                      <div className="text-xs text-gray-500">
                        Asistencia 24/7
                      </div>
                    </div>
                  </ButtonCorporate>
                </div>
              </CardContentCorporate>
            </CardCorporate>
          </div>
        </div>

        {/* Historial Médico Reciente */}
        <div className="mt-8">
          <CardCorporate variant="default" size="lg">
            <CardHeaderCorporate
              title="Accesos Rápidos"
              className="px-6 py-4 border-b border-gray-200"
            >
              <div className="flex items-center justify-between">
                <h2 className="flex items-center text-lg font-medium text-gray-900">
                  <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                  Historial Médico Reciente
                </h2>
                <ButtonCorporate
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/medical-history")}
                >
                  Ver historial completo
                </ButtonCorporate>
              </div>
            </CardHeaderCorporate>
            <CardContentCorporate className="p-6">
              {dashboardState.recentRecords.length > 0 ? (
                <div className="space-y-6">
                  {dashboardState.recentRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-4 transition-shadow border border-gray-200 rounded-lg hover:shadow-md"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg ${
                              record.priority === "critical"
                                ? "bg-red-100"
                                : record.priority === "high"
                                  ? "bg-orange-100"
                                  : record.priority === "medium"
                                    ? "bg-yellow-100"
                                    : "bg-green-100"
                            }`}
                          >
                            <FileText
                              className={`w-5 h-5 ${
                                record.priority === "critical"
                                  ? "text-red-600"
                                  : record.priority === "high"
                                    ? "text-orange-600"
                                    : record.priority === "medium"
                                      ? "text-yellow-600"
                                      : "text-green-600"
                              }`}
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {record.diagnosis}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {record.doctorName} - {record.specialty}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-500">
                            {record.date}
                          </span>
                          <div
                            className={`text-xs px-2 py-1 rounded-full mt-1 ${
                              record.priority === "critical"
                                ? "bg-red-100 text-red-700"
                                : record.priority === "high"
                                  ? "bg-orange-100 text-orange-700"
                                  : record.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                            }`}
                          >
                            {record.priority === "critical"
                              ? "Crítico"
                              : record.priority === "high"
                                ? "Alto"
                                : record.priority === "medium"
                                  ? "Medio"
                                  : "Bajo"}
                          </div>
                        </div>
                      </div>

                      <p className="mb-3 text-sm leading-relaxed text-gray-700">
                        {record.notes}
                      </p>

                      {record.attachments && record.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {record.attachments.map((attachment, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded-full"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              {attachment}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <ButtonCorporate
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/medical-history/${record.id}`)
                          }
                        >
                          Ver detalles completos
                        </ButtonCorporate>

                        {record.attachments &&
                          record.attachments.length > 0 && (
                            <ButtonCorporate
                              variant="ghost"
                              size="sm"
                              className="flex items-center space-x-2"
                            >
                              <Download className="w-4 h-4" />
                              <span>Descargar archivos</span>
                            </ButtonCorporate>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="mb-4 text-gray-500">
                    No hay registros médicos recientes
                  </p>
                  <p className="text-sm text-gray-400">
                    Los registros aparecerán aquí después de tus consultas
                  </p>
                </div>
              )}
            </CardContentCorporate>
          </CardCorporate>
        </div>
      </div>
    </div>
  );
}
