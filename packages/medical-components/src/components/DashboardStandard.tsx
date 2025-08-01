// 🏥 DASHBOARD STANDARD COMPONENTS - ALTAMEDICA
// Componentes estandarizados para todos los dashboards de la plataforma

import React, { ReactNode } from 'react';
import {
  Bell,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Clock,
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
  Plus
} from 'lucide-react';
import { MedicalTokens, MedicalButton, MedicalCard, MedicalBadge } from '../MedicalDesignSystem';

// ============================================================================
// DASHBOARD LAYOUT ESTÁNDAR
// ============================================================================

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: 'admin' | 'doctor' | 'patient' | 'nurse' | 'company';
  title: string;
  subtitle?: string;
  notifications?: number;
  onLogout?: () => void;
  onSettings?: () => void;
  sidebarItems?: SidebarItem[];
}

interface SidebarItem {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  badge?: number;
  active?: boolean;
  onClick?: () => void;
}

export function DashboardLayout({
  children,
  userRole,
  title,
  subtitle,
  notifications = 0,
  onLogout,
  onSettings,
  sidebarItems = []
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
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
              {/* Notificaciones */}
              <button className="relative p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-6 w-6" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
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
                      <User className="h-4 w-4" />
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
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                  
                  {mobileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <button
                        onClick={onSettings}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Configuración
                      </button>
                      <button
                        onClick={onLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
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
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 transform transition-transform duration-300 ease-in-out lg:transition-none lg:flex lg:flex-shrink-0`}>
          <div className="relative flex-1 flex flex-col min-w-0 bg-white shadow-xl">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className={`${
                      item.active
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group w-full flex items-center px-2 py-2 text-sm font-medium border-l-4 transition-colors duration-200`}
                  >
                    <div className="mr-3 h-5 w-5">{item.icon}</div>
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// DASHBOARD HEADER ESTÁNDAR
// ============================================================================

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  userRole: 'admin' | 'doctor' | 'patient' | 'nurse' | 'company';
  notifications?: number;
  lastUpdated?: string;
  onRefresh?: () => void;
  actions?: ReactNode;
}

export function DashboardHeader({
  title,
  subtitle,
  userRole,
  notifications = 0,
  lastUpdated,
  onRefresh,
  actions
}: DashboardHeaderProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

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
// KPI CARD ESTÁNDAR
// ============================================================================

interface KPICardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: ReactNode;
  color: 'critical' | 'warning' | 'stable' | 'normal' | 'info';
  trend?: 'up' | 'down' | 'stable';
  suffix?: string;
  compliance?: boolean;
  onClick?: () => void;
}

export function KPICard({
  title,
  value,
  change,
  icon,
  color,
  trend = 'stable',
  suffix = '',
  compliance = true,
  onClick
}: KPICardProps) {
  const getColorClasses = (color: string) => {
    const colors = {
      critical: 'border-red-500 bg-red-50',
      warning: 'border-yellow-500 bg-yellow-50',
      stable: 'border-green-500 bg-green-50',
      normal: 'border-blue-500 bg-blue-50',
      info: 'border-purple-500 bg-purple-50'
    };
    return colors[color as keyof typeof colors] || colors.normal;
  };

  const getIconColor = (color: string) => {
    const colors = {
      critical: 'text-red-600',
      warning: 'text-yellow-600',
      stable: 'text-green-600',
      normal: 'text-blue-600',
      info: 'text-purple-600'
    };
    return colors[color as keyof typeof colors] || colors.normal;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChangeColor = (change?: number) => {
    if (!change) return 'text-gray-500';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <MedicalCard
      variant="patient"
      status={color === 'critical' ? 'critical' : color === 'warning' ? 'warning' : 'normal'}
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${onClick ? 'hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {getTrendIcon(trend)}
              <span className={`ml-1 text-sm font-medium ${getChangeColor(change)}`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="ml-1 text-xs text-gray-500">vs período anterior</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-full ${getColorClasses(color)}`}>
          <div className={getIconColor(color)}>
            {icon}
          </div>
        </div>
      </div>
      
      {!compliance && (
        <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-xs text-red-700">Requiere atención de compliance</span>
          </div>
        </div>
      )}
    </MedicalCard>
  );
}

// ============================================================================
// KPI SECTION ESTÁNDAR
// ============================================================================

interface KPISectionProps {
  kpis: KPICardProps[];
  columns?: 1 | 2 | 3 | 4;
}

export function KPISection({ kpis, columns = 4 }: KPISectionProps) {
  const getGridCols = (cols: number) => {
    const classes = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    };
    return classes[cols as keyof typeof classes] || classes[4];
  };

  return (
    <div className={`grid ${getGridCols(columns)} gap-6 mb-8`}>
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
}

// ============================================================================
// MEDICAL DATA TABLE ESTÁNDAR
// ============================================================================

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => ReactNode;
  width?: string;
}

interface MedicalDataTableProps {
  data: any[];
  columns: Column[];
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  compliance?: boolean;
  onRowClick?: (row: any) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: any) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function MedicalDataTable({
  data,
  columns,
  sortable = false,
  filterable = false,
  pagination = false,
  compliance = true,
  onRowClick,
  onSort,
  onFilter,
  loading = false,
  emptyMessage = "No hay datos disponibles"
}: MedicalDataTableProps) {
  const [sortKey, setSortKey] = React.useState<string>('');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = React.useState<any>({});

  const handleSort = (key: string) => {
    if (!sortable) return;
    
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  const handleFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  if (loading) {
    return (
      <MedicalCard>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Cargando datos...</span>
        </div>
      </MedicalCard>
    );
  }

  return (
    <MedicalCard>
      {/* Filtros */}
      {filterable && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map((column) => (
              <div key={column.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {column.label}
                </label>
                <input
                  type="text"
                  placeholder={`Filtrar ${column.label.toLowerCase()}...`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => handleFilter(column.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    sortable && column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => handleSort(column.key)}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortable && column.sortable && sortKey === column.key && (
                      <span>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${
                    compliance ? 'border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && data.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {data.length} de {data.length} resultados
            </div>
            <div className="flex items-center space-x-2">
              <MedicalButton variant="secondary" size="sm">
                Anterior
              </MedicalButton>
              <span className="text-sm text-gray-700">Página 1 de 1</span>
              <MedicalButton variant="secondary" size="sm">
                Siguiente
              </MedicalButton>
            </div>
          </div>
        </div>
      )}
    </MedicalCard>
  );
}

