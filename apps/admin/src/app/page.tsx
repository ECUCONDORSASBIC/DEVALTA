'use client';

import React, { useState } from 'react';

// --- UTILITIES ---
const cn = (...inputs: any[]) => {
  const classes: string[] = [];
  for (const input of inputs) {
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object' && input !== null) {
      for (const key in input) {
        if (input[key]) {
          classes.push(key);
        }
      }
    }
  }
  return Array.from(new Set(classes)).join(' ');
};

// --- ICONOS SVG MODERNOS 2028 ---
const IconShield = ({ className, ...rest }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconUsers = ({ className, ...rest }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M20 8v6" />
    <path d="M23 11h-6" />
  </svg>
);

const IconCalendar = ({ className, ...rest }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 9h18" />
  </svg>
);

const IconTrendingUp = ({ className, ...rest }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path d="M3 17l6 -6l4 4l8 -8" />
    <path d="M14 7l7 0l0 7" />
  </svg>
);

const IconBarChart = ({ className, ...rest }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path d="M3 12h4v8H3zM9 8h4v12H9zM15 4h4v16h-4z" />
  </svg>
);

const IconSettings = ({ className, ...rest }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1-1.51 1.65 1.65 0 0 0-1.82-.33l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconDatabase = ({ className, ...rest }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
  </svg>
);

const IconMonitor = ({ className, ...rest }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const IconArrowRight = ({ className, ...rest }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path d="M5 12l14 0" />
    <path d="M13 18l6 -6" />
    <path d="M13 6l6 6" />
  </svg>
);

const IconAlertCircle = ({ className, ...rest }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// --- DATOS MOCK ESPECÍFICOS PARA ADMIN ---
const MOCK_ADMIN_DATA = {
  profile: {
    name: "Admin Principal",
    role: "Administrador del Sistema",
    experience: "8 años",
    location: "Buenos Aires, Argentina"
  },
  stats: {
    totalUsers: 2847,
    activeUsers: 2156,
    totalDoctors: 156,
    totalPatients: 2156,
    totalAppointments: 1247,
    systemUptime: 99.8,
    monthlyRevenue: 125000,
    pendingApprovals: 23,
    systemAlerts: 2,
    dataBackups: 156
  },
  systemAlerts: [
    {
      id: "1",
      type: "SYSTEM_MAINTENANCE",
      title: "Mantenimiento Programado",
      message: "Actualización de seguridad programada para mañana 02:00 AM",
      priority: "MEDIUM",
      timestamp: "2024-12-01T10:30:00Z"
    },
    {
      id: "2",
      type: "PERFORMANCE_ALERT",
      title: "Alto Uso de Recursos",
      message: "El servidor de base de datos está al 85% de capacidad",
      priority: "HIGH",
      timestamp: "2024-12-01T09:15:00Z"
    }
  ],
  recentActivity: [
    {
      id: "1",
      type: "USER_REGISTRATION",
      description: "Nuevo doctor registrado - Dr. Carlos Rodríguez",
      timestamp: "2024-12-01T08:00:00Z"
    },
    {
      id: "2",
      type: "SYSTEM_UPDATE",
      description: "Actualización de seguridad completada",
      timestamp: "2024-12-01T07:30:00Z"
    },
    {
      id: "3",
      type: "BACKUP_COMPLETED",
      description: "Backup automático completado exitosamente",
      timestamp: "2024-12-01T07:00:00Z"
    },
    {
      id: "4",
      type: "AUDIT_LOG",
      description: "Auditoría de seguridad mensual completada",
      timestamp: "2024-12-01T06:45:00Z"
    }
  ]
};

// --- COMPONENTES DEL DASHBOARD ---
const MetricCard = ({ title, value, icon: Icon, trend, trendValue, linkTo, linkText, gradient = "from-blue-50 to-indigo-50", iconBg = "bg-blue-100 text-blue-600" }: any) => (
  <div className={`bg-gradient-to-br ${gradient} border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 group backdrop-blur-sm`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center mb-4">
          <div className={`${iconBg} p-3 rounded-xl shadow-sm mr-3 group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-semibold tracking-wider text-gray-600 uppercase">{title}</h3>
        </div>
        <p className="mb-2 text-4xl font-bold text-gray-800" aria-label={`${title}: ${value}`}>
          {value}
        </p>
        {trend && trendValue && (
          <div className="flex items-center mb-3">
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
              {trendValue}
            </span>
            <IconTrendingUp className={`w-4 h-4 ml-1 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600 rotate-180' : 'text-gray-600'}`} />
          </div>
        )}
        {linkTo && linkText && (
          <a 
            href={linkTo} 
            className="inline-flex items-center text-sm font-medium text-blue-600 rounded-md hover:text-blue-800 group/link focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`${linkText} - ${title}`}
          >
            {linkText} 
            <IconArrowRight className="ml-1 w-4 h-4 transition-transform transform group-hover/link:translate-x-1" />
          </a>
        )}
      </div>
    </div>
  </div>
);

const ActionCard = ({ title, description, icon: Icon, linkTo, iconColor = "text-blue-600", hoverColor = "hover:bg-blue-50", badge }: any) => (
  <a 
    href={linkTo}
    className={`group block p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${hoverColor}`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center mb-3">
          <div className={`${iconColor} p-3 rounded-xl bg-gray-50 mr-3 group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            {badge && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {badge}
              </span>
            )}
          </div>
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-800">
          Acceder
          <IconArrowRight className="ml-1 w-4 h-4 transition-transform transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  </a>
);

const AlertCard = ({ alert }: any) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <div className={`border rounded-xl p-4 ${getPriorityColor(alert.priority)}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          {alert.title && <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>}
          <p className="text-sm opacity-90">{alert.message}</p>
        </div>
        <span className="text-xs opacity-75">{formatTime(alert.timestamp)}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide">
          {alert.priority}
        </span>
        <button className="text-xs font-medium hover:underline">
          Ver detalles
        </button>
      </div>
    </div>
  );
};

const ActivityItem = ({ activity }: any) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="flex items-start space-x-3">
      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{activity.description}</p>
        <p className="text-xs text-gray-500">
          {formatTime(activity.timestamp)}
        </p>
      </div>
    </div>
  );
};

// --- UTILIDADES DE FORMATO ---
const formatCurrency = (amount: number, currency = 'ARS') => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('es-AR').format(value);
};

const AdminDashboard: React.FC = () => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-AR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <IconShield className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">ALTAMEDICA Admin</h1>
                <p className="text-sm text-gray-500">Panel de Administración del Sistema</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{MOCK_ADMIN_DATA.profile.name}</p>
                <p className="text-xs text-gray-500">{MOCK_ADMIN_DATA.profile.role}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                {MOCK_ADMIN_DATA.profile.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {MOCK_ADMIN_DATA.profile.name}!
          </h2>
          <p className="text-gray-600">
            {formatDate(new Date())} • {formatTime(new Date())}
          </p>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Usuarios Activos"
            value={formatNumber(MOCK_ADMIN_DATA.stats.activeUsers)}
            icon={IconUsers}
            trend="up"
            trendValue="+45 este mes"
            linkTo="/users"
            linkText="Gestionar usuarios"
            gradient="from-green-50 to-emerald-50"
            iconBg="bg-green-100 text-green-600"
          />
          <MetricCard
            title="Uptime del Sistema"
            value={`${MOCK_ADMIN_DATA.stats.systemUptime}%`}
            icon={IconMonitor}
            trend="up"
            trendValue="+0.2% vs mes pasado"
            gradient="from-blue-50 to-indigo-50"
            iconBg="bg-blue-100 text-blue-600"
          />
          <MetricCard
            title="Ingresos Mensuales"
            value={formatCurrency(MOCK_ADMIN_DATA.stats.monthlyRevenue)}
            icon={IconBarChart}
            trend="up"
            trendValue="+12% vs mes pasado"
            gradient="from-amber-50 to-orange-50"
            iconBg="bg-amber-100 text-amber-600"
          />
          <MetricCard
            title="Aprobaciones Pendientes"
            value={MOCK_ADMIN_DATA.stats.pendingApprovals}
            icon={IconCalendar}
            trend="down"
            trendValue="-5 vs ayer"
            linkTo="/approvals"
            linkText="Revisar aprobaciones"
            gradient="from-purple-50 to-violet-50"
            iconBg="bg-purple-100 text-purple-600"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Actions & System Stats */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Accesos Rápidos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ActionCard
                  title="Gestión de Usuarios"
                  description="Administra usuarios, roles y permisos del sistema"
                  icon={IconUsers}
                  linkTo="/users"
                  iconColor="text-blue-600"
                  hoverColor="hover:bg-blue-50"
                  badge="Crítico"
                />
                <ActionCard
                  title="Configuración del Sistema"
                  description="Configura parámetros y políticas del sistema"
                  icon={IconSettings}
                  linkTo="/settings"
                  iconColor="text-green-600"
                  hoverColor="hover:bg-green-50"
                />
                <ActionCard
                  title="Monitoreo del Sistema"
                  description="Monitorea rendimiento y estado de servicios"
                  icon={IconMonitor}
                  linkTo="/monitoring"
                  iconColor="text-purple-600"
                  hoverColor="hover:bg-purple-50"
                />
                <ActionCard
                  title="Base de Datos"
                  description="Administra bases de datos y backups"
                  icon={IconDatabase}
                  linkTo="/database"
                  iconColor="text-amber-600"
                  hoverColor="hover:bg-amber-50"
                />
              </div>
            </div>

            {/* System Statistics */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Estadísticas del Sistema</h3>
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{MOCK_ADMIN_DATA.stats.totalDoctors}</div>
                    <div className="text-sm text-gray-600">Doctores</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{MOCK_ADMIN_DATA.stats.totalPatients}</div>
                    <div className="text-sm text-gray-600">Pacientes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{MOCK_ADMIN_DATA.stats.totalAppointments}</div>
                    <div className="text-sm text-gray-600">Citas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">{MOCK_ADMIN_DATA.stats.dataBackups}</div>
                    <div className="text-sm text-gray-600">Backups</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Alerts & Activity */}
          <div className="space-y-8">
            {/* System Alerts */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Alertas del Sistema</h3>
              <div className="space-y-3">
                {MOCK_ADMIN_DATA.systemAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="space-y-4">
                  {MOCK_ADMIN_DATA.recentActivity.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            </div>

            {/* Security & Compliance */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <IconShield className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Seguridad & Cumplimiento</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">HIPAA Compliance</span>
                  <span className="text-sm font-medium text-green-600">✅ Activo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">GDPR Compliance</span>
                  <span className="text-sm font-medium text-green-600">✅ Activo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Auditoría de Seguridad</span>
                  <span className="text-sm font-medium text-green-600">✅ Completada</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Último Backup</span>
                  <span className="text-sm font-medium text-gray-900">Hoy 07:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
