/**
 * HealthMetricCard.tsx - Tarjeta de Métrica de Salud
 * Proyecto: Altamedica Pacientes
 * Diseño: Componente corporativo para métricas médicas
 */

"use client";

import React from "react";
import { CardCorporate, CardContentCorporate } from "./CardCorporate";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface HealthMetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  status: "normal" | "warning" | "critical" | "excellent";
  trend?: "up" | "down" | "stable";
  icon: React.ReactNode;
  description?: string;
  lastUpdated?: string;
  onClick?: () => void;
  className?: string;
}

export const HealthMetricCard: React.FC<HealthMetricCardProps> = ({
  title,
  value,
  unit,
  status,
  trend,
  icon,
  description,
  lastUpdated,
  onClick,
  className = "",
}) => {
  const statusConfig = {
    normal: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: "text-green-600",
      badge: "bg-green-100 text-green-800",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: "text-yellow-600",
      badge: "bg-yellow-100 text-yellow-800",
    },
    critical: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "text-red-600",
      badge: "bg-red-100 text-red-800",
    },
    excellent: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: "text-blue-600",
      badge: "bg-blue-100 text-blue-800",
    },
  };

  const trendIcons = {
    up: <TrendingUp className="w-4 h-4 text-green-600" />,
    down: <TrendingDown className="w-4 h-4 text-red-600" />,
    stable: <Minus className="w-4 h-4 text-gray-600" />,
  };

  const config = statusConfig[status];

  return (
    <CardCorporate
      variant="default"
      size="md"
      className={`transition-all duration-300 hover:shadow-lg cursor-pointer ${config.bg} ${config.border} ${className}`}
      onClick={onClick}
    >
      <CardContentCorporate className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${config.icon} bg-white bg-opacity-50`}>
            <div className="w-6 h-6">
              {icon}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {trend && trendIcons[trend]}
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.badge}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>

        <div className="mb-2">
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </h3>
          <div className="flex items-baseline space-x-1">
            <span className={`text-2xl font-bold ${config.text}`}>
              {value}
            </span>
            {unit && (
              <span className="text-sm text-gray-500">
                {unit}
              </span>
            )}
          </div>
        </div>

        {description && (
          <p className="text-sm text-gray-600 mb-3">
            {description}
          </p>
        )}

        {lastUpdated && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Actualizado: {lastUpdated}</span>
            <span className="text-blue-600 hover:text-blue-800">
              Ver detalles →
            </span>
          </div>
        )}
      </CardContentCorporate>
    </CardCorporate>
  );
}; 