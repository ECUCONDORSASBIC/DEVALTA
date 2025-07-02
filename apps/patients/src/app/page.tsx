"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  FileText,
  Pill,
  User,
  Activity,
  Video,
  Bell,
  Settings,
  Heart,
  HelpCircle,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Phone,
} from "lucide-react";

// Optimización por Agente UI/UX Designer (8sjwr2i6c)
const medicalColors = {
  primary: "bg-blue-600 hover:bg-blue-700",
  success: "bg-emerald-600 hover:bg-emerald-700", 
  warning: "bg-amber-500 hover:bg-amber-600",
  urgent: "bg-red-500 hover:bg-red-600",
  calm: "bg-slate-100 hover:bg-slate-200",
  trust: "bg-blue-50",
};

// Optimización por Agente Especialista Pacientes (pva6mflr1)
interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  priority: "high" | "medium" | "low";
  urgency?: boolean;
  accessible?: boolean;
}

export default function OptimizedPatientsPage() {
  const router = useRouter();
  const [focusedCard, setFocusedCard] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<string>("");

  // Priorización inteligente para UX de pacientes
  const priorityActions: QuickAction[] = [
    {
      id: "emergency",
      title: "Urgencias Médicas",
      description: "Contacto directo para emergencias 24/7",
      icon: Phone,
      href: "/emergency",
      priority: "high",
      urgency: true,
      accessible: true,
    },
    {
      id: "appointments",
      title: "Próximas Citas",
      description: "Ver y gestionar tus próximas consultas",
      icon: Calendar,
      href: "/appointments",
      priority: "high",
      accessible: true,
    },
    {
      id: "prescriptions",
      title: "Mis Medicamentos",
      description: "Recetas activas y recordatorios",
      icon: Pill,
      href: "/prescriptions",
      priority: "high",
      accessible: true,
    },
    {
      id: "telemedicine", 
      title: "Consulta Virtual",
      description: "Videollamada con tu médico",
      icon: Video,
      href: "/telemedicine",
      priority: "medium",
      accessible: true,
    },
  ];

  const secondaryActions: QuickAction[] = [
    {
      id: "dashboard",
      title: "Mi Estado de Salud",
      description: "Resumen personalizado de tu salud",
      icon: Heart,
      href: "/dashboard", 
      priority: "medium",
      accessible: true,
    },
    {
      id: "medical-history",
      title: "Historial Médico",
      description: "Consulta tu información clínica",
      icon: FileText,
      href: "/medical-history",
      priority: "medium",
    },
    {
      id: "health-metrics",
      title: "Mis Métricas",
      description: "Seguimiento de signos vitales",
      icon: Activity,
      href: "/health-metrics",
      priority: "low",
    },
    {
      id: "profile",
      title: "Mi Información",
      description: "Actualizar datos personales",
      icon: User,
      href: "/profile",
      priority: "low",
    },
  ];

  // Gestión de estado para accesibilidad
  useEffect(() => {
    setAnnouncements("Página del paciente cargada. Usar Tab para navegar.");
  }, []);

  // Función de navegación accesible
  const handleNavigation = (href: string, title: string) => {
    setAnnouncements(`Navegando a ${title}`);
    router.push(href);
  };

  // Función para manejo de teclado
  const handleKeyDown = (event: React.KeyboardEvent, href: string, title: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigation(href, title);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Anuncio para lectores de pantalla */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcements}
      </div>

      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        {/* Header Optimizado - Design System Médico */}
        <header className="text-center mb-8 md:mb-12" role="banner">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <Heart 
                className="w-8 h-8 md:w-12 md:h-12 text-blue-600" 
                aria-hidden="true"
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
                Mi Portal de Salud
              </h1>
              <p className="text-sm md:text-base text-gray-600">ALTAMEDICA</p>
            </div>
          </div>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Tu salud en tus manos. Gestiona tus citas, medicamentos y consultas de forma segura.
          </p>
        </header>

        {/* Alertas Importantes */}
        <section className="mb-8" aria-labelledby="alerts-heading">
          <h2 id="alerts-heading" className="sr-only">Alertas importantes</h2>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-amber-600 mr-3" aria-hidden="true" />
              <div>
                <p className="text-amber-800 font-medium">
                  Recordatorio: Tienes una cita programada para mañana a las 10:00 AM
                </p>
                <button 
                  className="text-amber-600 hover:text-amber-800 text-sm underline mt-1"
                  onClick={() => handleNavigation("/appointments", "Mis Citas")}
                >
                  Ver detalles
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Estadísticas Rápidas - Simplificadas */}
        <section className="mb-8 md:mb-12" aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="text-xl font-semibold text-gray-900 mb-4">
            Resumen Rápido
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
              <div className="text-xl md:text-2xl font-bold text-blue-600 mb-1">3</div>
              <div className="text-sm text-gray-600">Próximas Citas</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
              <div className="text-xl md:text-2xl font-bold text-emerald-600 mb-1">5</div>
              <div className="text-sm text-gray-600">Medicamentos</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
              <div className="text-xl md:text-2xl font-bold text-purple-600 mb-1">2</div>
              <div className="text-sm text-gray-600">Resultados</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
              <div className="text-xl md:text-2xl font-bold text-green-600 mb-1">✓</div>
              <div className="text-sm text-gray-600">Todo al día</div>
            </div>
          </div>
        </section>

        {/* Acciones Prioritarias */}
        <section className="mb-8 md:mb-12" aria-labelledby="priority-heading">
          <h2 id="priority-heading" className="text-xl font-semibold text-gray-900 mb-6">
            Acciones Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {priorityActions.map((action) => {
              const IconComponent = action.icon;
              const isUrgent = action.urgency;
              
              return (
                <div
                  key={action.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${action.title}: ${action.description}`}
                  onFocus={() => setFocusedCard(action.id)}
                  onBlur={() => setFocusedCard(null)}
                  onKeyDown={(e) => handleKeyDown(e, action.href, action.title)}
                  onClick={() => handleNavigation(action.href, action.title)}
                  className={`
                    relative bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer 
                    transform transition-all duration-200 
                    hover:scale-[1.02] hover:shadow-md hover:border-blue-300
                    focus:scale-[1.02] focus:shadow-md focus:border-blue-500 focus:outline-none
                    ${focusedCard === action.id ? 'ring-4 ring-blue-200' : ''}
                    ${isUrgent ? 'border-red-200 bg-red-50' : 'border-gray-200'}
                  `}
                >
                  {isUrgent && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        URGENTE
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-4">
                    <div className={`
                      p-3 rounded-lg flex-shrink-0
                      ${isUrgent ? 'bg-red-100' : 'bg-blue-100'}
                    `}>
                      <IconComponent 
                        className={`w-6 h-6 ${isUrgent ? 'text-red-600' : 'text-blue-600'}`}
                        aria-hidden="true"
                      />
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">
                        {action.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                    
                    <ChevronRight 
                      className="w-5 h-5 text-gray-400 flex-shrink-0" 
                      aria-hidden="true"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Acciones Secundarias */}
        <section className="mb-8" aria-labelledby="secondary-heading">
          <h2 id="secondary-heading" className="text-xl font-semibold text-gray-900 mb-6">
            Más Opciones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {secondaryActions.map((action) => {
              const IconComponent = action.icon;
              
              return (
                <div
                  key={action.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${action.title}: ${action.description}`}
                  onKeyDown={(e) => handleKeyDown(e, action.href, action.title)}
                  onClick={() => handleNavigation(action.href, action.title)}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer 
                           transform transition-all duration-200 hover:scale-105 hover:shadow-md
                           focus:scale-105 focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-gray-100 rounded-lg mr-3">
                      <IconComponent className="w-5 h-5 text-gray-600" aria-hidden="true" />
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm">
                      {action.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {action.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Soporte Accesible */}
        <section className="mb-8">
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-blue-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    ¿Necesitas Ayuda?
                  </h3>
                  <p className="text-blue-700 text-sm">
                    Nuestro equipo está disponible 24/7 para asistirte
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleNavigation("/support", "Soporte")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg 
                         transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Contactar
              </button>
            </div>
          </div>
        </section>

        {/* Footer Accesible */}
        <footer className="text-center text-gray-500 text-sm" role="contentinfo">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" aria-hidden="true" />
            <span>Plataforma certificada y segura</span>
          </div>
          <p>© 2025 Altamedica. Protegemos tu privacidad y datos médicos.</p>
        </footer>
      </div>
    </div>
  );
}