/**
 * Página principal simplificada para evitar errores de webpack
 * Sin dependencias complejas ni providers de autenticación
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Heart,
  Activity,
  User,
  CheckCircle,
  Clock,
  Bell,
  RefreshCw,
  Brain,
  Video,
  Pill,
  FileText
} from "lucide-react";

import { 
  SimpleCard, 
  SimpleCardHeader, 
  SimpleCardContent, 
  SimpleButton, 
  SimpleLoadingSpinner 
} from "../components/ui/SimpleCard";

interface MockAppointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: string;
  status: string;
  location?: string;
}

interface MockHealthMetric {
  label: string;
  value: string;
  status: string;
  icon: React.ReactNode;
}

export default function PatientDashboardSimple() {
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState<MockAppointment[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<MockHealthMetric[]>([]);

  // Simular carga de datos
  useEffect(() => {
    const loadData = async () => {
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Datos mock
      setAppointments([
        {
          id: "apt-001",
          doctorName: "Dr. Carlos Mendoza",
          specialty: "Cardiología",
          date: "2025-02-15",
          time: "14:30",
          type: "consultation",
          status: "confirmed",
          location: "Consultorio 205, 2do Piso"
        },
        {
          id: "apt-002",
          doctorName: "Dra. Ana López",
          specialty: "Medicina General",
          date: "2025-02-20",
          time: "10:00",
          type: "telemedicine",
          status: "scheduled",
          location: "Telemedicina"
        }
      ]);

      setHealthMetrics([
        {
          label: "Presión Arterial",
          value: "120/80",
          status: "Normal",
          icon: <Heart className="w-5 h-5 text-sky-600" />
        },
        {
          label: "Ritmo Cardíaco",
          value: "72 bpm",
          status: "Estable",
          icon: <Activity className="w-5 h-5 text-sky-600" />
        },
        {
          label: "Peso Corporal",
          value: "70 kg",
          status: "Estable",
          icon: <User className="w-5 h-5 text-sky-600" />
        },
        {
          label: "Último Chequeo",
          value: "15 Ene 2025",
          status: "Reciente",
          icon: <CheckCircle className="w-5 h-5 text-sky-600" />
        }
      ]);

      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="space-y-4 text-center">
          <SimpleLoadingSpinner size="lg" />
          <p className="font-medium text-gray-600">
            Cargando datos del paciente...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600">
                <span className="text-lg font-bold text-white">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Bienvenido, Juan Pérez
                </h1>
                <p className="text-sm text-gray-500">
                  Tu portal de salud personal
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notificaciones */}
              <div className="relative">
                <SimpleButton variant="ghost" size="sm">
                  <Bell className="w-5 h-5" />
                  <span className="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
                    3
                  </span>
                </SimpleButton>
              </div>

              {/* Refresh */}
              <SimpleButton
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
              >
                <RefreshCw className="w-4 h-4" />
              </SimpleButton>
            </div>
          </div>
        </div>
      </div>

      {/* Barra contextual */}
      <div className="bg-sky-50 border-b border-sky-200">
        <div className="px-4 py-3 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="w-5 h-5 text-sky-600" />
              <div>
                <span className="text-sm font-medium text-sky-800">
                  Tu salud digital, siempre contigo
                </span>
                <p className="text-xs text-sky-700">
                  Acceso 24/7 a médicos certificados
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">Sistema Activo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        
        {/* Sistema de Diagnóstico IA */}
        <div className="mb-8">
          <SimpleCard className="border-sky-300 bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100">
            <SimpleCardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl shadow-lg">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Diagnóstico Inteligente
                      </h2>
                      <p className="text-sm text-sky-600 font-medium">
                        Análisis médico con IA avanzada
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Recibe diagnósticos presuntivos basados en inteligencia artificial 
                    que analizan tus síntomas en tiempo real.
                  </p>
                  
                  <div className="flex gap-3">
                    <SimpleButton variant="primary">
                      <Brain className="w-5 h-5 mr-2" />
                      Iniciar Diagnóstico IA
                    </SimpleButton>
                    <SimpleButton variant="ghost">
                      <FileText className="w-4 h-4 mr-2" />
                      Ver Historial
                    </SimpleButton>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-xl p-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">
                    Análisis recientes
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">Gripe estacional</p>
                        <p className="text-xs text-gray-600">Derivado a medicina general</p>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            </SimpleCardContent>
          </SimpleCard>
        </div>

        {/* Métricas de salud */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {healthMetrics.map((metric, index) => (
              <SimpleCard key={index} className="hover:shadow-md transition-shadow">
                <SimpleCardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{metric.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                      <p className="text-sm text-green-600">{metric.status}</p>
                    </div>
                    {metric.icon}
                  </div>
                </SimpleCardContent>
              </SimpleCard>
            ))}
          </div>
        </div>

        {/* Próximas citas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SimpleCard>
              <SimpleCardHeader title="Próximas Citas">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center text-lg font-medium text-gray-900">
                    <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                    Próximas Citas
                  </h2>
                  <SimpleButton variant="ghost" size="sm">
                    Ver todas
                  </SimpleButton>
                </div>
              </SimpleCardHeader>
              <SimpleCardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {appointment.type === "telemedicine" ? (
                              <Video className="w-4 h-4" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {appointment.doctorName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {appointment.specialty}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {appointment.status === "confirmed" ? "Confirmada" : "Programada"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{appointment.date} - {appointment.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <SimpleButton variant="ghost" size="sm">
                          Ver detalles
                        </SimpleButton>
                        <SimpleButton variant="secondary" size="sm">
                          {appointment.type === "telemedicine" ? (
                            <>
                              <Video className="w-4 h-4 mr-1" />
                              Unirse
                            </>
                          ) : (
                            "Direcciones"
                          )}
                        </SimpleButton>
                      </div>
                    </div>
                  ))}
                </div>
              </SimpleCardContent>
            </SimpleCard>
          </div>

          {/* Sidebar */}
          <div>
            <SimpleCard>
              <SimpleCardHeader title="Prescripciones Activas" />
              <SimpleCardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Pill className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Enalapril</p>
                      <p className="text-xs text-gray-600">10mg - 1 vez al día</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Pill className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Aspirina</p>
                      <p className="text-xs text-gray-600">100mg - 1 vez al día</p>
                    </div>
                  </div>
                </div>
                <SimpleButton variant="primary" className="w-full mt-4">
                  Ver todas las prescripciones
                </SimpleButton>
              </SimpleCardContent>
            </SimpleCard>
          </div>
        </div>
      </div>
    </div>
  );
}