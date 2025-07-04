/**
 * Dashboard Administrativo Principal
 * Gestión global del sistema Altamedica
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  Activity,
  Shield,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  RefreshCw,
  Bell,
  UserCheck,
  FileText,
  Database,
  Server,
  Globe,
  Lock,
  Key,
  Monitor,
  Zap,
  Target,
  Award,
  Heart,
  Stethoscope,
  Briefcase,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Star,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import useAdminDashboard from '@/hooks/useAdminDashboard';
import AdminStats from './AdminStats';
import UserManagement from './UserManagement';
import SystemHealth from './SystemHealth';
import AuditLogs from './AuditLogs';

interface AdminDashboardProps {
  initialView?: 'overview' | 'users' | 'companies' | 'doctors' | 'patients' | 'analytics' | 'security' | 'settings';
}

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalCompanies: number;
  totalDoctors: number;
  totalPatients: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  uptime: string;
  activeSessions: number;
  pendingApprovals: number;
  securityAlerts: number;
}

interface UserStats {
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  activeUsersToday: number;
  userGrowthRate: number;
}

interface SecurityMetrics {
  failedLoginAttempts: number;
  suspiciousActivities: number;
  dataBreachAttempts: number;
  lastSecurityScan: string;
  encryptionStatus: 'active' | 'warning' | 'inactive';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialView = 'overview' }) => {
  const [currentView, setCurrentView] = useState(initialView);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalUsers: 1247,
    activeUsers: 892,
    totalCompanies: 45,
    totalDoctors: 234,
    totalPatients: 968,
    systemHealth: 'excellent',
    uptime: '99.9%',
    activeSessions: 156,
    pendingApprovals: 12,
    securityAlerts: 3
  });

  const [userStats, setUserStats] = useState<UserStats>({
    newUsersToday: 23,
    newUsersThisWeek: 156,
    newUsersThisMonth: 647,
    activeUsersToday: 892,
    userGrowthRate: 12.5
  });

  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics>({
    failedLoginAttempts: 8,
    suspiciousActivities: 2,
    dataBreachAttempts: 0,
    lastSecurityScan: '2025-01-15 14:30:00',
    encryptionStatus: 'active'
  });

  const [isLoading, setIsLoading] = useState(false);

  const {
    user,
    isLoading: useAdminDashboardIsLoading,
    error,
    stats,
    recentUsers,
    systemHealth,
    auditLogs,
    selectedView,
    showNotifications,
    refreshDashboard,
    setSelectedView,
    toggleNotifications,
    updateUserRole,
    suspendUser,
    activateUser,
    viewAuditLog,
    exportReport
  } = useAdminDashboard();

  // Establecer vista inicial
  useEffect(() => {
    setSelectedView(initialView);
  }, [initialView, setSelectedView]);

  // Simular carga de datos
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="w-5 h-5" />;
      case 'good': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <AlertTriangle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Métricas del Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Totales</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalUsers.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+{userStats.userGrowthRate}%</span>
            <span className="text-gray-500 ml-1">este mes</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Empresas</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalCompanies}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+3</span>
            <span className="text-gray-500 ml-1">esta semana</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Médicos</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalDoctors}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Stethoscope className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+12</span>
            <span className="text-gray-500 ml-1">este mes</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pacientes</p>
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalPatients.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+8.2%</span>
            <span className="text-gray-500 ml-1">este mes</span>
          </div>
        </div>
      </div>

      {/* Estado del Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Salud General</span>
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(systemMetrics.systemHealth)}`}>
                {getHealthIcon(systemMetrics.systemHealth)}
                <span className="ml-1 capitalize">{systemMetrics.systemHealth}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm font-medium text-green-600">{systemMetrics.uptime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sesiones Activas</span>
              <span className="text-sm font-medium text-blue-600">{systemMetrics.activeSessions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Aprobaciones Pendientes</span>
              <span className="text-sm font-medium text-yellow-600">{systemMetrics.pendingApprovals}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad de Usuarios</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Nuevos Hoy</span>
              <span className="text-sm font-medium text-green-600">+{userStats.newUsersToday}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Nuevos Esta Semana</span>
              <span className="text-sm font-medium text-blue-600">+{userStats.newUsersThisWeek}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Nuevos Este Mes</span>
              <span className="text-sm font-medium text-purple-600">+{userStats.newUsersThisMonth}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Activos Hoy</span>
              <span className="text-sm font-medium text-green-600">{userStats.activeUsersToday}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seguridad</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Intentos Fallidos</span>
              <span className="text-sm font-medium text-red-600">{securityMetrics.failedLoginAttempts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Actividades Sospechosas</span>
              <span className="text-sm font-medium text-yellow-600">{securityMetrics.suspiciousActivities}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Intentos de Breach</span>
              <span className="text-sm font-medium text-green-600">{securityMetrics.dataBreachAttempts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Último Escaneo</span>
              <span className="text-sm font-medium text-blue-600">{securityMetrics.lastSecurityScan}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <UserCheck className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Aprobar Usuarios</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Shield className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Auditoría</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Reportes</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="w-8 h-8 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">Configuración</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Gestión de Usuarios</h2>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Usuario
          </button>
        </div>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Acceso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">JD</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">Juan Doe</div>
                      <div className="text-sm text-gray-500">juan.doe@email.com</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Paciente
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Hace 2 horas
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Crecimiento de Usuarios</h3>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-gray-500">Gráfico de Crecimiento</span>
            </div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad por Rol</h3>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-gray-500">Gráfico de Roles</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Panel de Seguridad</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Alertas de Seguridad</h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-red-900">Intento de acceso sospechoso</p>
                  <p className="text-xs text-red-600">Hace 5 minutos</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Múltiples intentos de login</p>
                  <p className="text-xs text-yellow-600">Hace 15 minutos</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Estado de Encriptación</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Datos de Usuario</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Encriptado
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Comunicaciones</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  TLS 1.3
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Backup</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Encriptado
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuración del Sistema</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración General</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Modo de Mantenimiento</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition"></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Notificaciones por Email</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-5"></span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Autenticación MFA</span>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-5"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'analytics':
        return renderAnalytics();
      case 'security':
        return renderSecurity();
      case 'settings':
        return renderSettings();
      default:
        return renderOverview();
    }
  };

  // Navegación del dashboard
  const navigationItems = [
    {
      id: 'overview' as const,
      label: 'Resumen',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      badge: null
    },
    {
      id: 'users' as const,
      label: 'Usuarios',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: stats.pendingApprovals > 0 ? stats.pendingApprovals : null
    },
    {
      id: 'health' as const,
      label: 'Salud del Sistema',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      badge: systemHealth.issues.length > 0 ? systemHealth.issues.length : null,
      urgent: systemHealth.status === 'CRITICAL'
    },
    {
      id: 'audit' as const,
      label: 'Auditoría',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      badge: null
    },
    {
      id: 'reports' as const,
      label: 'Reportes',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      badge: null
    }
  ];

  // Manejo de errores de autenticación
  if (!user && !useAdminDashboardIsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Acceso Administrativo Requerido
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Necesitas permisos de administrador para acceder a este panel.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Error del Sistema
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error}
            </p>
            <button
              onClick={refreshDashboard}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Dashboard */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Título y navegación */}
            <div className="flex items-center space-x-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Panel Administrativo
                </h1>
                {user && (
                  <p className="text-sm text-gray-600">
                    Administrador: {user.displayName || user.email}
                  </p>
                )}
              </div>

              {/* Navegación horizontal */}
              <nav className="hidden md:flex space-x-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedView(item.id)}
                    className={`
                      relative flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${selectedView === item.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                    {item.badge && (
                      <span className={`
                        ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                        ${item.urgent 
                          ? 'bg-red-100 text-red-800 animate-pulse' 
                          : 'bg-gray-100 text-gray-800'
                        }
                      `}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Acciones del header */}
            <div className="flex items-center space-x-4">
              {/* Notificaciones */}
              <button
                onClick={toggleNotifications}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.19 4.19A4 4 0 004 6v6a4 4 0 004 4h6a4 4 0 004-4V6a4 4 0 00-4-4H8a4 4 0 00-2.81 1.19z" />
                </svg>
                {stats.criticalAlerts > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.criticalAlerts}
                  </span>
                )}
              </button>

              {/* Refresh */}
              <button
                onClick={refreshDashboard}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md disabled:opacity-50"
              >
                <svg className={`h-6 w-6 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              {/* Perfil */}
              <div className="relative">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {selectedView === 'overview' && (
              <AdminStats 
                stats={stats}
                recentUsers={recentUsers}
                systemHealth={systemHealth}
                onRefresh={refreshDashboard}
              />
            )}
            
            {selectedView === 'users' && (
              <UserManagement 
                users={recentUsers}
                onUpdateRole={updateUserRole}
                onSuspendUser={suspendUser}
                onActivateUser={activateUser}
              />
            )}
            
            {selectedView === 'health' && (
              <SystemHealth 
                health={systemHealth}
                onRefresh={refreshDashboard}
              />
            )}
            
            {selectedView === 'audit' && (
              <AuditLogs 
                logs={auditLogs}
                onViewLog={viewAuditLog}
                onExport={exportReport}
              />
            )}
            
            {selectedView === 'reports' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Reportes del Sistema
                </h2>
                <p className="text-gray-600">
                  Generación de reportes en desarrollo...
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard; 