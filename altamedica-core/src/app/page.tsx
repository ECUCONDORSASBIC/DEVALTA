// Página Principal de Altamedica
// Dashboard médico principal con navegación y acceso a todas las funcionalidades

'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { 
  Heart, 
  Users, 
  Calendar, 
  FileText, 
  Phone, 
  Shield,
  Activity,
  Settings,
  LogOut,
  Menu,
  Bell
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Lazy loading para componentes médicos
const DashboardMedico = React.lazy(() => import('@/components/medical/DashboardMedico'))
const GestionPacientes = React.lazy(() => import('@/components/medical/GestionPacientes'))
const GestionCitas = React.lazy(() => import('@/components/medical/GestionCitas'))
const Telemedicina = React.lazy(() => import('@/components/medical/Telemedicina'))

// Componente de carga médica
const LoadingMedical = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-medical-primary/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-medical-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-medical-neutral font-medium">Cargando módulo médico...</p>
    </div>
  </div>
)

interface MenuItem {
  id: string
  nombre: string
  icono: React.ReactNode
  descripcion: string
  activo?: boolean
}

export default function HomePage() {
  const [vistaActiva, setVistaActiva] = useState('dashboard')
  const [sidebarAbierta, setSidebarAbierta] = useState(true)
  const [usuarioMedico, setUsuarioMedico] = useState({
    nombre: 'Dr. Eduardo',
    especialidad: 'Medicina Interna',
    licencia: 'MP 12345',
    avatar: '/avatars/doctor-default.png'
  })

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      nombre: 'Dashboard',
      icono: <Activity className="w-5 h-5" />,
      descripcion: 'Vista general del sistema médico',
      activo: vistaActiva === 'dashboard'
    },
    {
      id: 'pacientes',
      nombre: 'Pacientes',
      icono: <Users className="w-5 h-5" />,
      descripcion: 'Gestión integral de pacientes',
      activo: vistaActiva === 'pacientes'
    },
    {
      id: 'citas',
      nombre: 'Agenda',
      icono: <Calendar className="w-5 h-5" />,
      descripcion: 'Programación y gestión de citas',
      activo: vistaActiva === 'citas'
    },
    {
      id: 'telemedicina',
      nombre: 'Telemedicina',
      icono: <Phone className="w-5 h-5" />,
      descripcion: 'Consultas médicas remotas',
      activo: vistaActiva === 'telemedicina'
    },
    {
      id: 'historias',
      nombre: 'Historias Clínicas',
      icono: <FileText className="w-5 h-5" />,
      descripcion: 'Acceso a historias clínicas',
      activo: vistaActiva === 'historias'
    }
  ]

  const renderContenidoPrincipal = () => {
    switch (vistaActiva) {
      case 'dashboard':
        return (
          <Suspense fallback={<LoadingMedical />}>
            <DashboardMedico />
          </Suspense>
        )
      case 'pacientes':
        return (
          <Suspense fallback={<LoadingMedical />}>
            <GestionPacientes />
          </Suspense>
        )
      case 'citas':
        return (
          <Suspense fallback={<LoadingMedical />}>
            <GestionCitas />
          </Suspense>
        )
      case 'telemedicina':
        return (
          <Suspense fallback={<LoadingMedical />}>
            <Telemedicina />
          </Suspense>
        )
      case 'historias':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-medical-text mb-4">
              Historias Clínicas
            </h2>
            <div className="bg-medical-surface rounded-lg border border-gray-200 p-8 text-center">
              <FileText className="w-16 h-16 text-medical-neutral mx-auto mb-4" />
              <p className="text-medical-neutral">
                Módulo de Historias Clínicas en desarrollo
              </p>
            </div>
          </div>
        )
      default:
        return (
          <Suspense fallback={<LoadingMedical />}>
            <DashboardMedico />
          </Suspense>
        )
    }
  }

  return (
    <div className="flex h-screen bg-medical-background">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarAbierta && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="w-80 bg-medical-surface border-r border-gray-200 flex flex-col"
          >
            {/* Header del Sidebar */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-medical-primary rounded-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-medical-text">
                    Altamedica
                  </h1>
                  <p className="text-sm text-medical-neutral">
                    Sistema Médico Integral
                  </p>
                </div>
              </div>

              {/* Compliance Badge */}
              <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-hipaa-secure/10 rounded-lg border border-hipaa-secure/20">
                <Shield className="w-4 h-4 text-hipaa-secure" />
                <span className="text-xs font-medium text-hipaa-secure">
                  HIPAA Compliant
                </span>
              </div>
            </div>

            {/* Perfil del médico */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-medical-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {usuarioMedico.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-medical-text">
                    {usuarioMedico.nombre}
                  </h3>
                  <p className="text-sm text-medical-neutral">
                    {usuarioMedico.especialidad}
                  </p>
                  <p className="text-xs text-medical-neutral">
                    {usuarioMedico.licencia}
                  </p>
                </div>
              </div>
            </div>

            {/* Navegación */}
            <nav className="flex-1 p-6">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setVistaActiva(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${vistaActiva === item.id ? 'bg-medical-primary text-white' : 'text-medical-neutral hover:bg-gray-100'}`
                    >
                      {item.icono}
                      <div className="flex-1 text-left">
                        <span className="font-medium">{item.nombre}</span>
                        <p className={`text-xs mt-1 ${vistaActiva === item.id ? 'text-white/80' : 'text-medical-neutral'}`}>
                          {item.descripcion}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Footer del Sidebar */}
            <div className="p-6 border-t border-gray-200">
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 px-4 py-3 text-medical-neutral hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings className="w-5 h-5" />
                  <span>Configuración</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Principal */}
        <header className="bg-medical-surface border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarAbierta(!sidebarAbierta)}
                className="p-2 text-medical-neutral hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div>
                <h2 className="text-lg font-semibold text-medical-text capitalize">
                  {menuItems.find(item => item.id === vistaActiva)?.nombre || 'Dashboard'}
                </h2>
                <p className="text-sm text-medical-neutral">
                  {menuItems.find(item => item.id === vistaActiva)?.descripcion}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notificaciones */}
              <button className="p-2 text-medical-neutral hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Estado del sistema */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">
                  Sistema Operativo
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Área de Contenido */}
        <main className="flex-1 overflow-auto">
          <motion.div
            key={vistaActiva}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderContenidoPrincipal()}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
