'use client';

import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Search, 
  B                <button 
                  type="button"
                  className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  aria-label="Abrir menú de usuario"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                </button> User, 
  Settings, 
  LogOut,
  Briefcase,
  Users,
  BarChart3,
  MapPin,  Plus,
  Home
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Panel Principal', href: '/', icon: Home, current: true, description: 'Ir al panel principal del dashboard' },
  { name: 'Ofertas de Trabajo', href: '/jobs', icon: Briefcase, current: false, description: 'Ver y gestionar ofertas de trabajo médico' },
  { name: 'Aplicaciones', href: '/applications', icon: Users, current: false, description: 'Revisar aplicaciones de candidatos' },
  { name: 'Análisis', href: '/analytics', icon: BarChart3, current: false, description: 'Ver estadísticas y métricas' },
  { name: 'Ubicaciones', href: '/location', icon: MapPin, current: false, description: 'Gestionar ubicaciones y centros médicos' },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" aria-hidden="true" />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú de navegación"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Search className="h-5 w-5" />
                  </div>                  <input
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                    placeholder="Buscar empleos, médicos o empresas..."
                    type="search"
                    aria-label="Buscar en el portal médico"
                  />
                </div>
              </div>
            </div>            <div className="ml-4 flex items-center md:ml-6">
              <button 
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Crear nueva oferta de trabajo"
              >
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                Nueva Oferta
              </button>

              <button
                type="button"
                className="ml-3 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Ver notificaciones"
              >
                <Bell className="h-6 w-6" aria-hidden="true" />
                <span className="sr-only">Notificaciones</span>
              </button>

              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <button
                  type="button"
                  className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  aria-label="Abrir menú de usuario"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8" id="main-content">
              <h1 className="sr-only">Contenido principal del dashboard</h1>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent() {
  return (
    <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">Altamédica</span>
          </div>
        </div>        <nav className="mt-5 flex-1 px-2 space-y-1" role="navigation" aria-label="Navegación principal">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                title={item.description}
                className={`${
                  item.current
                    ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
                aria-current={item.current ? 'page' : undefined}
              >
                <Icon
                  className={`${
                    item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 flex-shrink-0 h-6 w-6`}
                  aria-hidden="true"
                />
                {item.name}
              </a>
            );
          })}
        </nav>
      </div>      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <button 
            className="flex-shrink-0 p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Configuración del sistema"
          >
            <Settings className="h-5 w-5 text-gray-400 hover:text-gray-500" aria-hidden="true" />
          </button>
          <button 
            className="flex-shrink-0 p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Cerrar sesión"
          >
            <LogOut className="h-5 w-5 text-gray-400 hover:text-gray-500" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
