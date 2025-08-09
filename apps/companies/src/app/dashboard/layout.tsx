/**
 * 🏥 LAYOUT EMPRESARIAL - ALTAMEDICA COMPANIES
 * Layout profesional para instituciones médicas
 */

'use client';

import { Badge, Button } from '@altamedica/ui';
import { cn } from '@altamedica/utils';
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';
import CompanyNavigation from '@/components/navigation/CompanyNavigation';
import { IntelligentAlerts } from '@/components/hospital/IntelligentAlerts';
import {
  Activity,
  ArrowRightLeft,
  BarChart3,
  Bell,
  BriefcaseMedical,
  Building2,
  ChevronDown,
  FileText,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Stethoscope,
  TrendingUp,
  UserX,
  Users,
  X,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}


// Componente para mostrar la hora de sincronización (SSR-safe)
function SyncStatus() {
  const [syncTime, setSyncTime] = useState<string>('--:--:--');

  useEffect(() => {
    const updateTime = () => {
      setSyncTime(new Date().toLocaleTimeString());
    };
    
    updateTime(); // Actualizar inmediatamente
    const interval = setInterval(updateTime, 1000); // Actualizar cada segundo
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-slate-500">Última sincronización:</span>
      <span className="text-xs text-slate-400 font-mono">{syncTime}</span>
    </div>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  // Mock data - en producción vendría de auth context
  const hospital = {
    name: 'Hospital San Vicente',
    logo: '/hospital-logo.png',
    plan: 'Enterprise',
    notifications: 8
  };

  const user = {
    name: 'Dr. Eduardo Marques',
    role: 'Director Médico',
    email: 'eduardo@hospital-sanvicente.com',
    avatar: '/avatar.jpg'
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar para móvil */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-6">
            <span className="text-xl font-semibold text-gray-900">AltaMedica</span>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <CompanyNavigation
            expandedItems={expandedItems}
            toggleExpanded={toggleExpanded}
            onNavigate={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Sidebar desktop - Estilo Torre de Control */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col bg-slate-900 border-r border-slate-800">
          {/* Logo y nombre del sistema */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">AltaMedica</h2>
                <p className="text-xs text-slate-400">Control System v2.0</p>
              </div>
            </div>
          </div>

          <CompanyNavigation
            expandedItems={expandedItems}
            toggleExpanded={toggleExpanded}
            onNavigate={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-72">
        {/* Header - Estilo Torre de Control */}
        <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 shadow-xl">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center flex-1">
              <button
                type="button"
                className="text-slate-400 hover:text-slate-300 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Panel de Control Central */}
              <div className="ml-4 lg:ml-0 flex-1">
                <div className="flex items-center space-x-6">
                  <div className="text-white">
                    <h2 className="text-lg font-bold">CENTRO DE CONTROL HOSPITALARIO</h2>
                    <p className="text-xs text-slate-400">Sistema de Redistribución Inteligente v2.0</p>
                  </div>
                  
                  {/* Búsqueda Avanzada */}
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="search"
                        className="block w-full rounded-lg border border-slate-600 bg-slate-800 py-2 pl-10 pr-3 text-sm text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                        placeholder="ID Hospital, Paciente, Código de emergencia..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Panel de Estado del Sistema - Estilo Torre de Control */}
              <div className="hidden md:flex items-center space-x-3">
                {/* Estado General del Sistema */}
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/30 backdrop-blur">
                  <div className="relative">
                    <Activity className="h-5 w-5 text-green-400" />
                    <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-xs text-green-300 font-medium">SISTEMA</p>
                    <p className="text-sm text-green-400 font-bold">OPERATIVO</p>
                  </div>
                </div>
                
                {/* Modo de Redistribución */}
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600/20 to-blue-500/20 border border-blue-500/30 backdrop-blur">
                  <ArrowRightLeft className="h-5 w-5 text-blue-400 animate-pulse" />
                  <div>
                    <p className="text-xs text-blue-300 font-medium">REDISTRIBUCIÓN</p>
                    <p className="text-sm text-blue-400 font-bold">AUTOMÁTICA</p>
                  </div>
                </div>
                
                {/* Alertas Críticas */}
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600/20 to-orange-500/20 border border-orange-500/30 backdrop-blur">
                  <AlertTriangle className="h-5 w-5 text-orange-400 animate-pulse" />
                  <div>
                    <p className="text-xs text-orange-300 font-medium">ALERTAS</p>
                    <p className="text-sm text-orange-400 font-bold">2 CRÍTICAS</p>
                  </div>
                </div>
                
                {/* Actividad del Marketplace */}
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-purple-500/20 border border-purple-500/30 backdrop-blur">
                  <BriefcaseMedical className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-xs text-purple-300 font-medium">VACANTES</p>
                    <p className="text-sm text-purple-400 font-bold">3 ACTIVAS</p>
                  </div>
                </div>
              </div>

              {/* Notificaciones - Estilo Torre de Control */}
              <div className="relative">
                <button
                  type="button"
                  className="relative rounded-lg bg-slate-700/50 backdrop-blur border border-slate-600 p-2.5 text-slate-400 hover:text-slate-300 hover:bg-slate-700 transition-all"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell className="h-5 w-5" />
                  {hospital.notifications > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">
                      {hospital.notifications}
                    </span>
                  )}
                </button>

                {/* Dropdown de notificaciones - Estilo Torre de Control */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-96 rounded-lg bg-slate-800 border border-slate-700 shadow-2xl">
                    <div className="p-4 border-b border-slate-700">
                      <h3 className="text-sm font-semibold text-white flex items-center justify-between">
                        <span>CENTRO DE ALERTAS</span>
                        <span className="text-xs text-slate-400">Tiempo Real</span>
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-2 space-y-2">
                        <NotificationItem 
                          type="critical"
                          title="🚨 Déficit Crítico de Personal"
                          message="Hospital Central: faltan 3 cardiólogos. Sistema publicó vacante automáticamente"
                          time="Hace 2 min"
                        />
                        <NotificationItem 
                          type="redistribution"
                          title="🔄 Redistribución Sugerida"
                          message="8 pacientes de Hospital Sur pueden ser transferidos"
                          time="Hace 5 min"
                        />
                        <NotificationItem 
                          type="success"
                          title="✅ Redistribución Completada"
                          message="5 pacientes reasignados exitosamente a Hospital Norte"
                          time="Hace 12 min"
                        />
                        <NotificationItem 
                          type="job"
                          title="💼 Vacante Auto-Publicada"
                          message="Enfermero UTI - Hospital Las Américas (3 aplicaciones)"
                          time="Hace 25 min"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Perfil de usuario - Estilo Torre de Control */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center space-x-3 rounded-lg bg-slate-700/50 backdrop-blur border border-slate-600 px-3 py-2 hover:bg-slate-700 transition-all"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.role}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {/* Dropdown de perfil - Estilo Torre de Control */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg bg-slate-800 border border-slate-700 shadow-2xl">
                    <div className="p-2">
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                      >
                        <Users className="h-4 w-4" />
                        <span>Mi Perfil</span>
                      </Link>
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Configuración</span>
                      </Link>
                      <hr className="my-2 border-slate-700" />
                      <button className="flex w-full items-center space-x-2 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all">
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Breadcrumbs - Estilo Torre de Control */}
        <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Breadcrumbs />
            <SyncStatus />
          </div>
        </div>

        {/* Contenido de la página - Fondo oscuro */}
        <main className="flex-1 bg-slate-950">
          <div className="py-6">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>

        {/* Footer - Estilo Torre de Control */}
        <footer className="bg-slate-900 border-t border-slate-800">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                © 2025 AltaMedica Control System. Todos los derechos reservados.
              </p>
              <div className="flex items-center space-x-4">
                <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                  Privacidad
                </Link>
                <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                  Términos
                </Link>
                <Link href="/compliance" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                  HIPAA Compliance
                </Link>
                <span className="text-xs text-slate-600">|</span>
                <span className="text-xs text-slate-600 font-mono">v2.0.1</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}


// Componente de notificación - Estilo Torre de Control
function NotificationItem({ type, title, message, time }: any) {
  const getIcon = () => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'redistribution':
        return <ArrowRightLeft className="h-5 w-5 text-blue-400" />;
      case 'success':
        return <Activity className="h-5 w-5 text-green-400" />;
      case 'job':
        return <BriefcaseMedical className="h-5 w-5 text-purple-400" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      default:
        return <Bell className="h-5 w-5 text-blue-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'critical':
        return 'bg-red-900/20 border-red-500/30 hover:bg-red-900/30';
      case 'redistribution':
        return 'bg-blue-900/20 border-blue-500/30 hover:bg-blue-900/30';
      case 'success':
        return 'bg-green-900/20 border-green-500/30 hover:bg-green-900/30';
      case 'job':
        return 'bg-purple-900/20 border-purple-500/30 hover:bg-purple-900/30';
      default:
        return 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50';
    }
  };

  const getPriorityIndicator = () => {
    if (type === 'critical') {
      return <div className="absolute top-2 right-2 h-2 w-2 bg-red-400 rounded-full animate-pulse"></div>;
    }
    return null;
  };

  return (
    <div className={`relative flex space-x-3 rounded-lg p-3 border backdrop-blur cursor-pointer transition-all ${getBackgroundColor()}`}>
      {getPriorityIndicator()}
      <div className="flex-shrink-0">
        <div className="h-10 w-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
          {getIcon()}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-slate-400 mt-1">{message}</p>
        <p className="text-xs text-slate-500 mt-2">{time}</p>
      </div>
    </div>
  );
}