'use client';

import React from 'react';
import { useAuth, useUserPermissions } from '@/contexts/AuthContext';
import AuthGuard from '@/components/auth/AuthGuard';
import { 
  Heart, 
  Calendar, 
  Users, 
  Activity, 
  Bell, 
  Settings, 
  LogOut,
  Shield,
  Stethoscope,
  Building2,
  UserCheck
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user, userProfile, signOut } = useAuth();
  const { hasPermission, isAdmin, isDoctor, isPatient, isCompany } = useUserPermissions();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getDashboardTitle = () => {
    if (isAdmin()) return 'Panel de Administración';
    if (isDoctor()) return 'Panel Médico';
    if (isPatient()) return 'Mi Portal de Salud';
    if (isCompany()) return 'Portal Empresarial';
    return 'Dashboard';
  };

  const getDashboardIcon = () => {
    if (isAdmin()) return <Shield className="h-8 w-8" />;
    if (isDoctor()) return <Stethoscope className="h-8 w-8" />;
    if (isPatient()) return <Heart className="h-8 w-8" />;
    if (isCompany()) return <Building2 className="h-8 w-8" />;
    return <UserCheck className="h-8 w-8" />;
  };

  const getQuickActions = () => {
    const commonActions = [
      {
        title: 'Configuración',
        description: 'Ajustes de cuenta',
        icon: <Settings className="h-6 w-6" />,
        href: '/settings',
        color: 'from-gray-500 to-gray-600'
      }
    ];

    if (isAdmin()) {
      return [
          {
            title: 'Gestión de Usuarios',
            description: 'Administrar usuarios del sistema',
            icon: <Users className="h-6 w-6" />,
            href: '/admin/users',
            color: 'from-purple-500 to-purple-600'
          },
          {
            title: 'Analíticas',
            description: 'Métricas del sistema',
            icon: <Activity className="h-6 w-6" />,
            href: '/admin/analytics',
            color: 'from-green-500 to-green-600'
          },
          ...commonActions
        ];
    }

    if (isDoctor()) {
        return [
          {
            title: 'Mis Pacientes',
            description: 'Lista de pacientes asignados',
            icon: <Users className="h-6 w-6" />,
            href: '/doctor/patients',
            color: 'from-blue-500 to-blue-600'
          },
          {
            title: 'Citas Médicas',
            description: 'Agenda y citas programadas',
            icon: <Calendar className="h-6 w-6" />,
            href: '/doctor/appointments',
            color: 'from-cyan-500 to-cyan-600'
          },
          ...commonActions
        ];
    }

    if (isPatient()) {
        return [
          {
            title: 'Mis Citas',
            description: 'Próximas citas médicas',
            icon: <Calendar className="h-6 w-6" />,
            href: '/patient/appointments',
            color: 'from-blue-500 to-blue-600'
          },
          {
            title: 'Historial Médico',
            description: 'Mi historial de salud',
            icon: <Activity className="h-6 w-6" />,
            href: '/patient/history',
            color: 'from-green-500 to-green-600'
          },
          ...commonActions
        ];
    }

    if (isCompany()) {
        return [
          {
            title: 'Empleados',
            description: 'Gestión de personal médico',
            icon: <Users className="h-6 w-6" />,
            href: '/company/staff',
            color: 'from-blue-500 to-blue-600'
          },
          {
            title: 'Estadísticas',
            description: 'Métricas de la clínica',
            icon: <Activity className="h-6 w-6" />,
            href: '/company/analytics',
            color: 'from-green-500 to-green-600'
          },
          ...commonActions
        ];
    }

    return commonActions;
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white">
                  {getDashboardIcon()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">ALTAMEDICA</h1>
                  <p className="text-sm text-gray-600">{getDashboardTitle()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {userProfile?.firstName} {userProfile?.lastName}
                    </p>
                    <p className="text-xs text-gray-600 capitalize">{userProfile?.role}</p>
                  </div>
                  
                  <button
                    onClick={handleSignOut}
                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                    title="Cerrar Sesión"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h3 className="welcome-title">
              ¡Bienvenido, {userProfile?.firstName}!
            </h3>
            <p className="welcome-subtitle">
              Gestiona tu {isPatient() ? 'salud' : 'trabajo'} de manera eficiente con ALTAMEDICA
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Estado de Cuenta</p>
                  <p className="text-2xl font-bold text-green-600">Activa</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Verificación 2FA</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {userProfile?.twoFactorEnabled ? 'Activa' : 'Inactiva'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Email</p>
                  <p className="text-2xl font-bold text-green-600">
                    {user?.emailVerified ? 'Verificado' : 'Pendiente'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Última Conexión</p>
                  <p className="text-lg font-bold text-gray-900">Ahora</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Acciones Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getQuickActions().map((action, index) => (
                <button
                  key={index}
                  onClick={() => window.location.href = action.href}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300 text-left group"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        {action.title}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  ¡Tu salud es nuestra prioridad!
                </h3>
                <p className="text-blue-100 mb-4">
                  Explora todas las funcionalidades que ALTAMEDICA tiene para ofrecerte.
                </p>
                <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                  Explorar Funciones
                </button>
              </div>
              <div className="hidden md:block">
                <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Heart className="h-16 w-16 text-white" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
};

export default DashboardPage;