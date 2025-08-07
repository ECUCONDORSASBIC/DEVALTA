// 🎨 STATUS BADGE - COMPONENTE DE ESTADO MÉDICO
// Badge especializado para estados clínicos y médicos con iconografía específica
// MÉDICO-ESPECÍFICO: Estados de citas, pacientes, tratamientos y procesos médicos
// MIGRADO DESDE: apps/patients/src/components/ui/StatusBadge.tsx

'use client';

import React from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle, Activity, Heart } from 'lucide-react';

// 🏥 TIPOS DE ESTADO MÉDICOS EXTENDIDOS
export type StatusType = 
  | 'confirmed' | 'scheduled' | 'completed' | 'cancelled' 
  | 'active' | 'inactive' | 'pending' | 'approved' | 'rejected'
  | 'success' | 'warning' | 'error' | 'info'
  | 'in_progress' | 'no_show' | 'rescheduled'
  | 'critical' | 'stable' | 'improving' | 'emergency';

export interface StatusBadgeProps {
  /** Tipo de estado médico */
  status: StatusType;
  /** Texto personalizado del badge */
  text?: string;
  /** Tamaño del badge */
  size?: 'sm' | 'md' | 'lg';
  /** Mostrar icono representativo */
  showIcon?: boolean;
  /** Animación para estados críticos */
  animate?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

// 🎨 CONFIGURACIÓN DE ESTADOS MÉDICOS
const getStatusConfig = (status: StatusType) => {
  const configs = {
    // 📅 ESTADOS DE CITAS MÉDICAS
    confirmed: { 
      color: 'bg-green-100 text-green-800 border-green-200', 
      icon: CheckCircle,
      defaultText: 'Confirmado',
      pulse: false
    },
    scheduled: { 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      icon: Clock,
      defaultText: 'Programado',
      pulse: false
    },
    completed: { 
      color: 'bg-gray-100 text-gray-800 border-gray-200', 
      icon: CheckCircle,
      defaultText: 'Completado',
      pulse: false
    },
    cancelled: { 
      color: 'bg-red-100 text-red-800 border-red-200', 
      icon: XCircle,
      defaultText: 'Cancelado',
      pulse: false
    },
    in_progress: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Activity,
      defaultText: 'En Progreso',
      pulse: true
    },
    no_show: {
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: AlertCircle,
      defaultText: 'No Asistió',
      pulse: false
    },
    rescheduled: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: Clock,
      defaultText: 'Reprogramado',
      pulse: false
    },

    // 🔄 ESTADOS GENERALES
    active: { 
      color: 'bg-green-100 text-green-800 border-green-200', 
      icon: CheckCircle,
      defaultText: 'Activo',
      pulse: false
    },
    inactive: { 
      color: 'bg-gray-100 text-gray-800 border-gray-200', 
      icon: XCircle,
      defaultText: 'Inactivo',
      pulse: false
    },
    pending: { 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      icon: Clock,
      defaultText: 'Pendiente',
      pulse: true
    },
    approved: { 
      color: 'bg-green-100 text-green-800 border-green-200', 
      icon: CheckCircle,
      defaultText: 'Aprobado',
      pulse: false
    },
    rejected: { 
      color: 'bg-red-100 text-red-800 border-red-200', 
      icon: XCircle,
      defaultText: 'Rechazado',
      pulse: false
    },

    // 🎯 ESTADOS DE SISTEMA
    success: { 
      color: 'bg-green-100 text-green-800 border-green-200', 
      icon: CheckCircle,
      defaultText: 'Éxito',
      pulse: false
    },
    warning: { 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
      icon: AlertCircle,
      defaultText: 'Advertencia',
      pulse: true
    },
    error: { 
      color: 'bg-red-100 text-red-800 border-red-200', 
      icon: XCircle,
      defaultText: 'Error',
      pulse: false
    },
    info: { 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      icon: AlertCircle,
      defaultText: 'Información',
      pulse: false
    },

    // 🏥 ESTADOS MÉDICOS ESPECÍFICOS
    critical: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: AlertCircle,
      defaultText: 'Crítico',
      pulse: true
    },
    stable: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: Heart,
      defaultText: 'Estable',
      pulse: false
    },
    improving: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Activity,
      defaultText: 'Mejorando',
      pulse: false
    },
    emergency: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: AlertCircle,
      defaultText: 'Emergencia',
      pulse: true
    }
  };

  return configs[status] || configs.info;
};

// 📏 CONFIGURACIÓN DE TAMAÑOS
const SIZE_CONFIG = {
  sm: {
    container: 'px-2 py-1 text-xs',
    icon: 'w-3 h-3'
  },
  md: {
    container: 'px-3 py-1 text-sm',
    icon: 'w-4 h-4'
  },
  lg: {
    container: 'px-4 py-2 text-base',
    icon: 'w-5 h-5'
  }
};

// 🎨 COMPONENTE PRINCIPAL STATUS BADGE
export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  text, 
  size = 'md',
  showIcon = true,
  animate = false,
  className = ''
}) => {
  // 🛡️ VALIDACIÓN ROBUSTA
  if (!status) {
    console.warn('StatusBadge: status es requerido');
    return null;
  }

  const config = getStatusConfig(status);
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;
  const displayText = text || config.defaultText;
  
  // 🚨 ANIMACIONES PARA ESTADOS CRÍTICOS
  const shouldAnimate = animate || config.pulse;
  const animationClass = shouldAnimate ? 'animate-pulse' : '';

  // 🎯 CLASES DINÁMICAS
  const containerClasses = `
    inline-flex items-center font-medium rounded-full border transition-all duration-200
    ${config.color} 
    ${sizeConfig.container}
    ${animationClass}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <span className={containerClasses}>
      {showIcon && Icon && (
        <Icon className={`mr-1 ${sizeConfig.icon} flex-shrink-0`} />
      )}
      <span className="truncate">
        {displayText}
      </span>
      
      {/* 🚨 INDICADOR ESPECIAL PARA EMERGENCIAS */}
      {status === 'emergency' && (
        <div className="ml-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
      )}
      
      {/* 🔄 INDICADOR PARA ESTADOS EN PROGRESO */}
      {status === 'in_progress' && (
        <div className="ml-1 w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
      )}
    </span>
  );
};

// 🎯 EXPORTS
export default StatusBadge;