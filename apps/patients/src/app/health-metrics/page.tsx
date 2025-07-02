"use client";

import React, { useState } from "react";
import {
  Activity,
  Heart,
  Thermometer,
  Scale,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

interface HealthMetric {
  id: string;
  type:
    | "bloodPressure"
    | "heartRate"
    | "weight"
    | "temperature"
    | "bloodSugar"
    | "oxygenSaturation";
  value: number;
  unit: string;
  date: string;
  time: string;
  status: "normal" | "elevated" | "high" | "low" | "critical";
  notes?: string;
}

interface BloodPressureMetric {
  systolic: number;
  diastolic: number;
  date: string;
  time: string;
  status: "normal" | "elevated" | "high" | "low" | "critical";
}

export default function HealthMetricsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "year"
  >("week");
  const [selectedMetric, setSelectedMetric] = useState<string>("all");

  // Mock data
  const bloodPressureData: BloodPressureMetric[] = [
    {
      systolic: 120,
      diastolic: 80,
      date: "2025-01-27",
      time: "08:00",
      status: "normal",
    },
    {
      systolic: 125,
      diastolic: 82,
      date: "2025-01-26",
      time: "08:00",
      status: "normal",
    },
    {
      systolic: 118,
      diastolic: 78,
      date: "2025-01-25",
      time: "08:00",
      status: "normal",
    },
    {
      systolic: 130,
      diastolic: 85,
      date: "2025-01-24",
      time: "08:00",
      status: "elevated",
    },
    {
      systolic: 122,
      diastolic: 81,
      date: "2025-01-23",
      time: "08:00",
      status: "normal",
    },
  ];

  const heartRateData: HealthMetric[] = [
    {
      id: "1",
      type: "heartRate",
      value: 72,
      unit: "bpm",
      date: "2025-01-27",
      time: "08:00",
      status: "normal",
    },
    {
      id: "2",
      type: "heartRate",
      value: 75,
      unit: "bpm",
      date: "2025-01-26",
      time: "08:00",
      status: "normal",
    },
    {
      id: "3",
      type: "heartRate",
      value: 68,
      unit: "bpm",
      date: "2025-01-25",
      time: "08:00",
      status: "normal",
    },
    {
      id: "4",
      type: "heartRate",
      value: 82,
      unit: "bpm",
      date: "2025-01-24",
      time: "08:00",
      status: "elevated",
    },
    {
      id: "5",
      type: "heartRate",
      value: 70,
      unit: "bpm",
      date: "2025-01-23",
      time: "08:00",
      status: "normal",
    },
  ];

  const weightData: HealthMetric[] = [
    {
      id: "1",
      type: "weight",
      value: 75.2,
      unit: "kg",
      date: "2025-01-27",
      time: "08:00",
      status: "normal",
    },
    {
      id: "2",
      type: "weight",
      value: 75.5,
      unit: "kg",
      date: "2025-01-26",
      time: "08:00",
      status: "normal",
    },
    {
      id: "3",
      type: "weight",
      value: 75.8,
      unit: "kg",
      date: "2025-01-25",
      time: "08:00",
      status: "normal",
    },
    {
      id: "4",
      type: "weight",
      value: 76.1,
      unit: "kg",
      date: "2025-01-24",
      time: "08:00",
      status: "normal",
    },
    {
      id: "5",
      type: "weight",
      value: 75.9,
      unit: "kg",
      date: "2025-01-23",
      time: "08:00",
      status: "normal",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "text-green-600 bg-green-100";
      case "elevated":
        return "text-yellow-600 bg-yellow-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "low":
        return "text-blue-600 bg-blue-100";
      case "critical":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "normal":
        return "Normal";
      case "elevated":
        return "Elevado";
      case "high":
        return "Alto";
      case "low":
        return "Bajo";
      case "critical":
        return "Crítico";
      default:
        return "Desconocido";
    }
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous)
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (current < previous)
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case "bloodPressure":
        return <Activity className="w-6 h-6 text-blue-600" />;
      case "heartRate":
        return <Heart className="w-6 h-6 text-red-600" />;
      case "weight":
        return <Scale className="w-6 h-6 text-purple-600" />;
      case "temperature":
        return <Thermometer className="w-6 h-6 text-orange-600" />;
      default:
        return <Activity className="w-6 h-6 text-gray-600" />;
    }
  };

  const currentBP = bloodPressureData[0];
  const currentHR = heartRateData[0];
  const currentWeight = weightData[0];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Métricas de Salud
          </h1>
          <p className="text-gray-600">
            Seguimiento de tus indicadores vitales
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Agregar Medición
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="week">Última Semana</option>
          <option value="month">Último Mes</option>
          <option value="year">Último Año</option>
        </select>
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas las Métricas</option>
          <option value="bloodPressure">Presión Arterial</option>
          <option value="heartRate">Frecuencia Cardíaca</option>
          <option value="weight">Peso</option>
          <option value="temperature">Temperatura</option>
        </select>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Presión Arterial */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {getMetricIcon("bloodPressure")}
              <h3 className="text-lg font-semibold text-gray-900">
                Presión Arterial
              </h3>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentBP.status)}`}
            >
              {getStatusLabel(currentBP.status)}
            </span>
          </div>

          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-gray-900">
              {currentBP.systolic}/{currentBP.diastolic}
            </div>
            <div className="text-sm text-gray-600">mmHg</div>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Última medición:{" "}
            {new Date(currentBP.date).toLocaleDateString("es-ES")}{" "}
            {currentBP.time}
          </div>
        </div>

        {/* Frecuencia Cardíaca */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {getMetricIcon("heartRate")}
              <h3 className="text-lg font-semibold text-gray-900">
                Frecuencia Cardíaca
              </h3>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentHR.status)}`}
            >
              {getStatusLabel(currentHR.status)}
            </span>
          </div>

          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-gray-900">
              {currentHR.value}
            </div>
            <div className="text-sm text-gray-600">{currentHR.unit}</div>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Última medición:{" "}
            {new Date(currentHR.date).toLocaleDateString("es-ES")}{" "}
            {currentHR.time}
          </div>
        </div>

        {/* Peso */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {getMetricIcon("weight")}
              <h3 className="text-lg font-semibold text-gray-900">Peso</h3>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentWeight.status)}`}
            >
              {getStatusLabel(currentWeight.status)}
            </span>
          </div>

          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-gray-900">
              {currentWeight.value}
            </div>
            <div className="text-sm text-gray-600">{currentWeight.unit}</div>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Última medición:{" "}
            {new Date(currentWeight.date).toLocaleDateString("es-ES")}{" "}
            {currentWeight.time}
          </div>
        </div>
      </div>

      {/* Gráficos y Tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Presión Arterial - Tabla */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Historial Presión Arterial
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2">Fecha</th>
                  <th className="text-left py-2">Sistólica</th>
                  <th className="text-left py-2">Diastólica</th>
                  <th className="text-left py-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {bloodPressureData.map((reading, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2">
                      {new Date(reading.date).toLocaleDateString("es-ES")}
                    </td>
                    <td className="py-2 font-medium">{reading.systolic}</td>
                    <td className="py-2 font-medium">{reading.diastolic}</td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reading.status)}`}
                      >
                        {getStatusLabel(reading.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Frecuencia Cardíaca - Tabla */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Historial Frecuencia Cardíaca
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2">Fecha</th>
                  <th className="text-left py-2">Frecuencia</th>
                  <th className="text-left py-2">Estado</th>
                  <th className="text-left py-2">Tendencia</th>
                </tr>
              </thead>
              <tbody>
                {heartRateData.map((reading, index) => (
                  <tr key={reading.id} className="border-b border-gray-100">
                    <td className="py-2">
                      {new Date(reading.date).toLocaleDateString("es-ES")}
                    </td>
                    <td className="py-2 font-medium">
                      {reading.value} {reading.unit}
                    </td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reading.status)}`}
                      >
                        {getStatusLabel(reading.status)}
                      </span>
                    </td>
                    <td className="py-2">
                      {index < heartRateData.length - 1 &&
                        getTrendIcon(
                          reading.value,
                          heartRateData[index + 1].value
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Información Adicional */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información de Salud
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Rangos Normales</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Presión Arterial: 90/60 - 120/80 mmHg</li>
              <li>• Frecuencia Cardíaca: 60-100 bpm</li>
              <li>• Temperatura: 36.5°C - 37.5°C</li>
              <li>• Oxigenación: 95-100%</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Recomendaciones</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Mide tu presión arterial por la mañana</li>
              <li>• Mantén un registro diario de tus mediciones</li>
              <li>• Consulta a tu médico si hay cambios significativos</li>
              <li>• Mantén un estilo de vida saludable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
