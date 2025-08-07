/**
 * @fileoverview Hook compuesto para dashboards médicos
 * @module @altamedica/hooks/composed/useMedicalDashboard
 * @description Hook de alto nivel que combina datos médicos, métricas, notificaciones y estado
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/useAuth';
import { usePatients } from '../medical/usePatients';
import { useNotifications } from '../realtime/useNotifications';
import { useRealTimeUpdates } from '../realtime/useRealTimeUpdates';
import { useLocalStorage } from '../utils/useLocalStorage';
import type { 
  User, 
  Patient, 
  NotificationData,
  MessageEvent
} from '../types';

// ==========================================
// TIPOS ESPECÍFICOS
// ==========================================

interface DashboardConfig {
  /** Tipo de dashboard */
  dashboardType: 'patient' | 'doctor' | 'admin' | 'company';
  /** Layout inicial */
  defaultLayout?: DashboardLayout;
  /** Métricas a mostrar */
  enabledMetrics?: DashboardMetric[];
  /** Si debe auto-actualizar */
  autoRefresh?: boolean;
  /** Intervalo de actualización (ms) */
  refreshInterval?: number;
  /** Configuración de notificaciones */
  notificationConfig?: {
    showToasts: boolean;
    soundEnabled: boolean;
    maxNotifications: number;
  };
}

type DashboardLayout = 'grid' | 'list' | 'cards' | 'compact';
type DashboardMetric = 
  | 'patients_today'
  | 'appointments_pending'
  | 'urgent_cases'
  | 'revenue'
  | 'satisfaction'
  | 'wait_time'
  | 'bed_occupancy'
  | 'staff_online';

interface DashboardWidget {
  id: string;
  type: DashboardMetric;
  title: string;
  value: number | string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  icon?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  priority: 'high' | 'medium' | 'low';
  lastUpdated: Date;
}

interface DashboardAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  patientId?: string;
  actionRequired: boolean;
  timestamp: Date;
}

interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  todayAppointments: number;
  pendingAppointments: number;
  urgentCases: number;
  averageWaitTime: number;
  patientSatisfaction: number;
  revenue: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
  badge?: number;
}

interface UseMedicalDashboardReturn {
  // Estado del dashboard
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  
  // Datos principales
  widgets: DashboardWidget[];
  stats: DashboardStats;
  alerts: DashboardAlert[];
  recentPatients: Patient[];
  
  // Configuración
  layout: DashboardLayout;
  setLayout: (layout: DashboardLayout) => void;
  enabledMetrics: DashboardMetric[];
  toggleMetric: (metric: DashboardMetric) => void;
  
  // Acciones rápidas
  quickActions: QuickAction[];
  
  // Notificaciones
  notifications: NotificationData[];
  unreadCount: number;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Actualización
  refresh: () => Promise<void>;
  autoRefreshEnabled: boolean;
  toggleAutoRefresh: () => void;
  
  // Filtros y búsqueda
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  
  // Utilidades
  exportData: () => DashboardExport;
  resetDashboard: () => void;
}

interface DateRange {
  start: Date;
  end: Date;
}

interface DashboardExport {
  timestamp: Date;
  dashboardType: string;
  stats: DashboardStats;
  alerts: DashboardAlert[];
  period: DateRange;
}

// ==========================================
// HOOK PRINCIPAL PARA MÉDICOS
// ==========================================

/**
 * Hook compuesto para dashboard de médicos
 */
export function useDoctorDashboard(): UseMedicalDashboardReturn {
  return useMedicalDashboard({
    dashboardType: 'doctor',
    enabledMetrics: [
      'patients_today',
      'appointments_pending',
      'urgent_cases',
      'satisfaction',
      'wait_time'
    ],
    autoRefresh: true,
    refreshInterval: 30000 // 30 segundos
  });
}

/**
 * Hook compuesto para dashboard de pacientes
 */
export function usePatientDashboard(): UseMedicalDashboardReturn {
  return useMedicalDashboard({
    dashboardType: 'patient',
    enabledMetrics: [
      'appointments_pending',
      'urgent_cases'
    ],
    autoRefresh: true,
    refreshInterval: 60000 // 1 minuto
  });
}

/**
 * Hook compuesto para dashboard de administración
 */
export function useAdminDashboard(): UseMedicalDashboardReturn {
  return useMedicalDashboard({
    dashboardType: 'admin',
    enabledMetrics: [
      'patients_today',
      'appointments_pending',
      'urgent_cases',
      'revenue',
      'satisfaction',
      'wait_time',
      'bed_occupancy',
      'staff_online'
    ],
    autoRefresh: true,
    refreshInterval: 15000 // 15 segundos
  });
}

// ==========================================
// HOOK BASE
// ==========================================

/**
 * Hook base para dashboards médicos
 */
export function useMedicalDashboard(
  config: DashboardConfig
): UseMedicalDashboardReturn {
  const {
    dashboardType,
    defaultLayout = 'grid',
    enabledMetrics: initialMetrics = [],
    autoRefresh = true,
    refreshInterval = 30000,
    notificationConfig = {
      showToasts: true,
      soundEnabled: true,
      maxNotifications: 50
    }
  } = config;

  // ==========================================
  // ESTADO LOCAL
  // ==========================================

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
    end: new Date()
  });

  // ==========================================
  // PERSISTENCIA LOCAL
  // ==========================================

  const [layout, setLayout] = useLocalStorage<DashboardLayout>(
    `dashboard_layout_${dashboardType}`,
    defaultLayout
  );

  const [enabledMetrics, setEnabledMetrics] = useLocalStorage<DashboardMetric[]>(
    `dashboard_metrics_${dashboardType}`,
    initialMetrics
  );

  const [autoRefreshEnabled, setAutoRefreshEnabled] = useLocalStorage(
    `dashboard_auto_refresh_${dashboardType}`,
    autoRefresh
  );

  // ==========================================
  // HOOKS DEPENDIENTES
  // ==========================================

  const { user, hasPermission } = useAuth();
  
  const { 
    patients, 
    getPatientsByDoctor, 
    getRecentPatients,
    isLoading: patientsLoading 
  } = usePatients();

  const notifications = useNotifications({
    notificationTypes: ['medical_alert', 'appointment', 'system'],
    userConfig: {
      userType: dashboardType as any,
      preferences: {
        enableSound: notificationConfig.soundEnabled,
        enableDesktop: notificationConfig.showToasts
      }
    }
  });

  const realtime = useRealTimeUpdates({
    transport: 'websocket',
    channels: [
      `dashboard_${dashboardType}`,
      `alerts_${user?.id}`,
      'medical_updates',
      'system_notifications'
    ]
  }, {
    onEvent: handleRealtimeUpdate
  });

  // ==========================================
  // DATOS CALCULADOS
  // ==========================================

  const stats = useMemo((): DashboardStats => {
    const userPatients = dashboardType === 'patient' 
      ? patients.filter(p => p.id === user?.id)
      : dashboardType === 'doctor'
      ? getPatientsByDoctor(user?.id || '')
      : patients;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      totalPatients: userPatients.length,
      activePatients: userPatients.filter(p => p.status === 'active').length,
      todayAppointments: calculateTodayAppointments(userPatients),
      pendingAppointments: calculatePendingAppointments(userPatients),
      urgentCases: userPatients.filter(p => p.priority === 'urgent').length,
      averageWaitTime: calculateAverageWaitTime(userPatients),
      patientSatisfaction: calculateSatisfactionScore(userPatients),
      revenue: calculateRevenue(userPatients, dateRange)
    };
  }, [patients, user, dashboardType, dateRange, getPatientsByDoctor]);

  const recentPatients = useMemo(() => {
    return getRecentPatients(10).filter(patient => {
      if (searchTerm) {
        return patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               patient.email.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });
  }, [getRecentPatients, searchTerm]);

  const quickActions = useMemo((): QuickAction[] => {
    const actions: QuickAction[] = [];

    if (dashboardType === 'doctor') {
      actions.push(
        {
          id: 'new_appointment',
          label: 'Nueva Cita',
          icon: '📅',
          action: () => window.location.href = '/appointments/new'
        },
        {
          id: 'emergency_call',
          label: 'Llamada Emergencia',
          icon: '🚨',
          action: () => handleEmergencyCall(),
          badge: alerts.filter(a => a.type === 'critical').length
        },
        {
          id: 'prescriptions',
          label: 'Recetas',
          icon: '💊',
          action: () => window.location.href = '/prescriptions'
        }
      );
    }

    if (dashboardType === 'patient') {
      actions.push(
        {
          id: 'book_appointment',
          label: 'Agendar Cita',
          icon: '📅',
          action: () => window.location.href = '/appointments/book'
        },
        {
          id: 'telemedicine',
          label: 'Telemedicina',
          icon: '💻',
          action: () => window.location.href = '/telemedicine'
        },
        {
          id: 'medical_records',
          label: 'Historial',
          icon: '📋',
          action: () => window.location.href = '/records'
        }
      );
    }

    if (dashboardType === 'admin') {
      actions.push(
        {
          id: 'user_management',
          label: 'Usuarios',
          icon: '👥',
          action: () => window.location.href = '/admin/users',
          disabled: !hasPermission('manage_users')
        },
        {
          id: 'system_reports',
          label: 'Reportes',
          icon: '📊',
          action: () => window.location.href = '/admin/reports',
          disabled: !hasPermission('view_analytics')
        }
      );
    }

    return actions;
  }, [dashboardType, hasPermission, alerts]);

  // ==========================================
  // MANEJADORES DE EVENTOS
  // ==========================================

  function handleRealtimeUpdate(event: MessageEvent) {
    switch (event.type) {
      case 'dashboard_metric_update':
        updateMetricWidget(event.data);
        break;
        
      case 'new_alert':
        addAlert(event.data);
        break;
        
      case 'patient_status_change':
        refreshPatientData();
        break;
        
      case 'appointment_update':
        refreshAppointmentData();
        break;
    }
  }

  const updateMetricWidget = useCallback((metricData: any) => {
    setWidgets(prev => prev.map(widget => 
      widget.type === metricData.type
        ? { ...widget, value: metricData.value, lastUpdated: new Date() }
        : widget
    ));
  }, []);

  const addAlert = useCallback((alertData: any) => {
    const alert: DashboardAlert = {
      id: alertData.id || `alert_${Date.now()}`,
      type: alertData.type,
      title: alertData.title,
      message: alertData.message,
      patientId: alertData.patientId,
      actionRequired: alertData.actionRequired || false,
      timestamp: new Date()
    };

    setAlerts(prev => [alert, ...prev.slice(0, 49)]); // Mantener máximo 50 alertas
  }, []);

  // ==========================================
  // MÉTODOS PRINCIPALES
  // ==========================================

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Simular carga de datos (en producción, llamar APIs reales)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Actualizar widgets basados en métricas habilitadas
      const newWidgets: DashboardWidget[] = enabledMetrics.map(metric => 
        createWidget(metric, stats)
      );

      setWidgets(newWidgets);
      setLastUpdated(new Date());

    } catch (error) {
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [enabledMetrics, stats]);

  const toggleMetric = useCallback((metric: DashboardMetric) => {
    setEnabledMetrics(prev => 
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  }, [setEnabledMetrics]);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled(prev => !prev);
  }, [setAutoRefreshEnabled]);

  const markNotificationAsRead = useCallback((id: string) => {
    notifications.markAsRead([id]);
  }, [notifications]);

  const clearAllNotifications = useCallback(() => {
    notifications.markAllAsRead();
  }, [notifications]);

  const exportData = useCallback((): DashboardExport => {
    return {
      timestamp: new Date(),
      dashboardType,
      stats,
      alerts,
      period: dateRange
    };
  }, [dashboardType, stats, alerts, dateRange]);

  const resetDashboard = useCallback(() => {
    setLayout(defaultLayout);
    setEnabledMetrics(initialMetrics);
    setAutoRefreshEnabled(autoRefresh);
    setSearchTerm('');
    setDateRange({
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    });
  }, [defaultLayout, initialMetrics, autoRefresh, setLayout, setEnabledMetrics, setAutoRefreshEnabled]);

  // ==========================================
  // MÉTODOS HELPER
  // ==========================================

  function createWidget(metric: DashboardMetric, stats: DashboardStats): DashboardWidget {
    const baseWidget = {
      id: `widget_${metric}`,
      type: metric,
      lastUpdated: new Date(),
      priority: 'medium' as const
    };

    switch (metric) {
      case 'patients_today':
        return {
          ...baseWidget,
          title: 'Pacientes Hoy',
          value: stats.activePatients,
          icon: '👥',
          color: 'blue',
          trend: 'stable'
        };
        
      case 'appointments_pending':
        return {
          ...baseWidget,
          title: 'Citas Pendientes',
          value: stats.pendingAppointments,
          icon: '📅',
          color: 'yellow',
          priority: stats.pendingAppointments > 10 ? 'high' : 'medium'
        };
        
      case 'urgent_cases':
        return {
          ...baseWidget,
          title: 'Casos Urgentes',
          value: stats.urgentCases,
          icon: '🚨',
          color: 'red',
          priority: stats.urgentCases > 0 ? 'high' : 'low'
        };
        
      case 'satisfaction':
        return {
          ...baseWidget,
          title: 'Satisfacción',
          value: `${stats.patientSatisfaction.toFixed(1)}/5`,
          icon: '⭐',
          color: stats.patientSatisfaction >= 4 ? 'green' : 'yellow'
        };
        
      default:
        return {
          ...baseWidget,
          title: metric.replace('_', ' ').toUpperCase(),
          value: 0,
          icon: '📊',
          color: 'blue'
        };
    }
  }

  function calculateTodayAppointments(patients: Patient[]): number {
    // Implementar lógica real
    return Math.floor(Math.random() * 20);
  }

  function calculatePendingAppointments(patients: Patient[]): number {
    // Implementar lógica real
    return Math.floor(Math.random() * 15);
  }

  function calculateAverageWaitTime(patients: Patient[]): number {
    // Implementar lógica real
    return Math.floor(Math.random() * 30) + 10;
  }

  function calculateSatisfactionScore(patients: Patient[]): number {
    // Implementar lógica real
    return 3.5 + Math.random() * 1.5;
  }

  function calculateRevenue(patients: Patient[], range: DateRange): number {
    // Implementar lógica real
    return Math.floor(Math.random() * 100000) + 50000;
  }

  function refreshPatientData() {
    // Implementar refresh específico de pacientes
  }

  function refreshAppointmentData() {
    // Implementar refresh específico de citas
  }

  function handleEmergencyCall() {
    // Implementar llamada de emergencia
    notifications.sendMedicalAlert({
      title: 'Llamada de Emergencia Activada',
      message: 'Se ha activado el protocolo de emergencia',
      type: 'medical_alert',
      priority: 'critical'
    });
  }

  // ==========================================
  // EFECTOS
  // ==========================================

  // Auto-refresh
  useEffect(() => {
    if (autoRefreshEnabled) {
      const interval = setInterval(refresh, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefreshEnabled, refreshInterval, refresh]);

  // Carga inicial
  useEffect(() => {
    refresh();
  }, []);

  // ==========================================
  // RETURN
  // ==========================================

  return {
    // Estado
    isLoading: isLoading || patientsLoading,
    error,
    lastUpdated,
    
    // Datos
    widgets,
    stats,
    alerts,
    recentPatients,
    
    // Configuración
    layout,
    setLayout,
    enabledMetrics,
    toggleMetric,
    
    // Acciones
    quickActions,
    
    // Notificaciones
    notifications: notifications.notifications,
    unreadCount: notifications.unreadCount,
    markNotificationAsRead,
    clearAllNotifications,
    
    // Actualización
    refresh,
    autoRefreshEnabled,
    toggleAutoRefresh,
    
    // Filtros
    searchTerm,
    setSearchTerm,
    dateRange,
    setDateRange,
    
    // Utilidades
    exportData,
    resetDashboard
  };
}