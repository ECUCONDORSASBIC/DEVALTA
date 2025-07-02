"use client";

import { useState, useEffect } from "react";
import { Building, Heart, MapPin, Star } from "lucide-react";

// Componente de carga para el mapa
function MapLoadingSkeleton() {
  return (
    <div className="h-[600px] bg-gradient-to-br from-blue-50 to-sky-100 rounded-lg flex items-center justify-center border border-gray-200">
      <div className="text-center space-y-4 max-w-md">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-blue-600 opacity-50" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Cargando mapa médico interactivo
          </p>
          <p className="text-xs text-gray-500">
            Conectando con la red ALTAMEDICA...
          </p>
        </div>
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}

// Componente de métricas
function SafeMetrics() {
  const [metrics, setMetrics] = useState({
    totalDoctors: 0,
    activePatients: 0,
    todayConsultations: 0,
    efficiency: 0,
  });

  useEffect(() => {
    // Simular carga de métricas
    const timer = setTimeout(() => {
      setMetrics({
        totalDoctors: 1234,
        activePatients: 8567,
        todayConsultations: 156,
        efficiency: 94.2,
      });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        title="Total Médicos"
        value={metrics.totalDoctors.toLocaleString()}
        change="+12% este mes"
        icon="👨‍⚕️"
        colorClass="bg-blue-100 text-blue-600"
        trend="up"
      />
      <MetricCard
        title="Pacientes Activos"
        value={metrics.activePatients.toLocaleString()}
        change="+8% este mes"
        icon="👥"
        colorClass="bg-green-100 text-green-600"
        trend="up"
      />
      <MetricCard
        title="Consultas Hoy"
        value={metrics.todayConsultations.toString()}
        change="Actualizado hace 5 min"
        icon="📅"
        colorClass="bg-purple-100 text-purple-600"
        trend="neutral"
      />
      <MetricCard
        title="Eficiencia"
        value={`${metrics.efficiency}%`}
        change="+3.2% este mes"
        icon="📊"
        colorClass="bg-orange-100 text-orange-600"
        trend="up"
      />
    </div>
  );
}

function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="p-3 bg-gray-100 rounded-full">
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="mt-4">
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: string;
  colorClass: string;
  trend: "up" | "down" | "neutral";
}

function MetricCard({
  title,
  value,
  change,
  icon,
  colorClass,
  trend,
}: MetricCardProps) {
  const trendIcon = {
    up: "↗️",
    down: "↘️",
    neutral: "🕐",
  }[trend];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClass}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className="mr-1">{trendIcon}</span>
        <span
          className={`font-medium ${
            trend === "up"
              ? "text-green-600"
              : trend === "down"
                ? "text-red-600"
                : "text-gray-600"
          }`}
        >
          {change}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPageSafe() {
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMapReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Médico ALTAMEDICA
          </h1>
          <p className="text-gray-600">
            Monitoreo en tiempo real de la red médica empresarial
          </p>
        </div>

        {/* Métricas */}
        <SafeMetrics />

        {/* Mapa Interactivo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-3 mr-4 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Red Médica Interactiva
                </h3>
                <p className="text-gray-600">
                  Visualización en tiempo real de especialistas en AMBA
                </p>
              </div>
            </div>
          </div>

          {isMapReady ? <MapLoadingSkeleton /> : <MapLoadingSkeleton />}
        </div>

        {/* Lista de Médicos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Especialistas Disponibles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DoctorCards />
          </div>
        </div>
      </div>
    </div>
  );
}

function DoctorCardsSkeleton() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-gray-50 rounded-lg p-6 animate-pulse">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </>
  );
}

function DoctorCards() {
  const doctors = [
    {
      id: 1,
      name: "Dr. Carlos Mendoza",
      specialty: "Cardiología Empresarial",
      location: "Buenos Aires, AMBA",
      rating: 4.9,
      status: "Disponible",
    },
    {
      id: 2,
      name: "Dra. Ana López",
      specialty: "Medicina Ocupacional",
      location: "Córdoba",
      rating: 4.8,
      status: "Ocupado",
    },
    {
      id: 3,
      name: "Dr. Roberto Domínguez",
      specialty: "Neurología Corporativa",
      location: "Rosario",
      rating: 4.7,
      status: "Disponible",
    },
  ];

  return (
    <>
      {doctors.map((doctor) => (
        <div
          key={doctor.id}
          className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-blue-600 font-semibold">
                {doctor.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
              <p className="text-sm text-gray-600">{doctor.specialty}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              {doctor.location}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-sm font-medium">{doctor.rating}</span>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  doctor.status === "Disponible"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {doctor.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
