// 🏥 DASHBOARD LAYOUT UNIFICADO - ALTAMEDICA
// Layout estándar para todos los dashboards de la plataforma

import React, { ReactNode, useState, useEffect } from 'react';
import {
  Bell,
  RefreshCw,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Home,
  BarChart3,
  Users,
  Calendar,
  FileText,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { MedicalTokens, MedicalButton, MedicalCard, MedicalBadge } from '../MedicalDesignSystem';

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

interface SidebarItem {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  badge?: number;
  active?: boolean;
  onClick?: () => void;
  children?: SidebarItem[];
}

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: 'admin' | 'doctor' | 'patient' | 'nurse' | 'company';
  title: string;
  subtitle?: string;
  notifications?: number;
  onLogout?: () => void;
  onSettings?: () => void;
  onRefresh?: () => void;
  sidebarItems?: SidebarItem[];
  showSearch?: boolean;
  showFilters?: boolean;
  showActions?: boolean;
  actions?: ReactNode;
  compliance?: boolean;
  lastUpdated?: string;
}

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  userRole: 'admin' | 'doctor' | 'patient' | 'nurse' | 'company';
  notifications?: number;
  lastUpdated?: string;
  onRefresh?: () => void;
  actions?: ReactNode;
  showSearch?: boolean;
  showFilters?: boolean;
}

// ============================================================================
// DASHBOARD LAYOUT PRINCIPAL
// ============================================================================

export function DashboardLayout({
  children,
  userRole,
  title,
  subtitle,
  notifications = 0,
  onLogout,
  onSettings,
  onRefresh,
  sidebarItems = [],
  showSearch = false,
  showFilters = false,
  showActions = false,
  actions,
  compliance = true,
  lastUpdated
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [sidebarOpen]);

  const getRoleColor = (role: string) => {
    const colors = {
      admin: MedicalTokens.colors.roles.admin,
      doctor: MedicalTokens.colors.roles.doctor,
      nurse: MedicalTokens.colors.roles.nurse,
      patient: MedicalTokens.colors.roles.patient,
      company: MedicalTokens.colors.roles.admin
    };
    return colors[role as keyof typeof colors] || MedicalTokens.colors.roles.admin;
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      admin: Shield,
      doctor: User,
      nurse: User,
      patient: User,
      company: Users
    };
    return icons[role as keyof typeof icons] || User;
  };

  const RoleIcon = getRoleIcon(userRole);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Principal */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-4 lg:ml-0">
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-gray-500">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Acciones del usuario */}
            <div className="flex items-center space-x-4">
              {/* Búsqueda */}
              {showSearch && (
                <div className="hidden md:block">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Filtros */}
              {showFilters && (
                <MedicalButton variant="secondary" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </MedicalButton>
              )}

              {/* Actualizar */}
              {onRefresh && (
                <MedicalButton
                  variant="secondary"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Actualizar
                </MedicalButton>
              )}

              {/* Notificaciones */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors">
                <Bell className="h-6 w-6" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {notifications > 99 ? '99+' : notifications}
                  </span>
                )}
              </button>

              {/* Usuario */}
              <div className="flex items-center space-x-3">
                <div className="hidden md:block">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: getRoleColor(userRole) }}
                    >
                      <RoleIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 capitalize">{userRole}</p>
                      <p className="text-xs text-gray-500">Usuario Activo</p>
                    </div>
                  </div>
                </div>

                {/* Menú de usuario */}
                <div className="relative">
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                  
                  {mobileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <button
                        onClick={onSettings}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Settings className="h-4 w-4 mr-2 inline" />
                        Configuración
                      </button>
                      <button
                        onClick={onLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2 inline" />
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:inset-0 
          transform transition-transform duration-300 ease-in-out lg:transition-none 
          lg:flex lg:flex-shrink-0
          fixed lg:relative z-40
        `}>
          <div className="relative flex-1 flex flex-col min-w-0 bg-white shadow-xl lg:shadow-none">
            {/* Botón cerrar en mobile */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menú</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {sidebarItems.map((item) => (
                  <div key={item.id}>
                    <button
                      onClick={item.onClick}
                      className={`
                        ${
                          item.active
                            ? 'bg-blue-100 border-blue-500 text-blue-700'
                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } 
                        group w-full flex items-center px-2 py-2 text-sm font-medium border-l-4 transition-colors duration-200 rounded-r-md
                      `}
                    >
                      <div className="mr-3 h-5 w-5">{item.icon}</div>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                    
                    {/* Sub-items */}
                    {item.children && item.active && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <button
                            key={child.id}
                            onClick={child.onClick}
                            className="w-full flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            <div className="mr-2 h-4 w-4">{child.icon}</div>
                            {child.label}
                            {child.badge && (
                              <span className="ml-auto bg-gray-100 text-gray-600 text-xs font-medium px-1.5 py-0.5 rounded-full">
                                {child.badge}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Footer del sidebar */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: getRoleColor(userRole) }}
                >
                  <RoleIcon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 capitalize">{userRole}</p>
                  <p className="text-xs text-gray-500">Altamedica</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenido principal */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header del contenido */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    {subtitle && (
                      <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                    )}
                    {lastUpdated && (
                      <p className="mt-1 text-xs text-gray-400">
                        Última actualización: {lastUpdated}
                      </p>
                    )}
                  </div>
                  
                  {actions && (
                    <div className="flex items-center space-x-2">
                      {actions}
                    </div>
                  )}
                </div>
              </div>

              {/* Contenido */}
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Compliance Warning */}
      {compliance && (
        <div className="fixed bottom-4 right-4 z-50">
          <MedicalCard variant="alert" status="normal" className="p-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-xs text-gray-600">Compliance HIPAA Activo</span>
            </div>
          </MedicalCard>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DASHBOARD HEADER COMPONENT
// ============================================================================

export function DashboardHeader({
  title,
  subtitle,
  userRole,
  notifications = 0,
  lastUpdated,
  onRefresh,
  actions,
  showSearch = false,
  showFilters = false
}: DashboardHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
          {lastUpdated && (
            <p className="mt-1 text-xs text-gray-400">
              Última actualización: {lastUpdated}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {actions}
          
          {onRefresh && (
            <MedicalButton
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </MedicalButton>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SIDEBAR ITEMS PREDEFINIDOS
// ============================================================================

export const getDefaultSidebarItems = (userRole: string): SidebarItem[] => {
  const baseItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      active: true
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: <Users className="h-5 w-5" />
    },
    {
      id: 'calendar',
      label: 'Calendario',
      icon: <Calendar className="h-5 w-5" />
    },
    {
      id: 'documents',
      label: 'Documentos',
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 'security',
      label: 'Seguridad',
      icon: <Shield className="h-5 w-5" />
    },
    {
      id: 'activity',
      label: 'Actividad',
      icon: <Activity className="h-5 w-5" />
    }
  ];

  // Personalizar según el rol
  switch (userRole) {
    case 'admin':
      return baseItems;
    case 'doctor':
      return baseItems.filter(item => ['dashboard', 'analytics', 'calendar', 'documents', 'activity'].includes(item.id));
    case 'patient':
      return baseItems.filter(item => ['dashboard', 'calendar', 'documents'].includes(item.id));
    case 'nurse':
      return baseItems.filter(item => ['dashboard', 'analytics', 'calendar', 'documents', 'activity'].includes(item.id));
    case 'company':
      return baseItems.filter(item => ['dashboard', 'analytics', 'users', 'documents'].includes(item.id));
    default:
      return baseItems;
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default DashboardLayout;
export type { DashboardLayoutProps, DashboardHeaderProps, SidebarItem }; 