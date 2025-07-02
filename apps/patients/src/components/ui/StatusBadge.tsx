// 🎨 COMPONENTE UI: StatusBadge  
// PROACTIVO: <100 líneas, reutilizable, tipado

import React from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

export type StatusType = 
  | 'confirmed' | 'scheduled' | 'completed' | 'cancelled' 
  | 'active' | 'inactive' | 'pending' | 'approved' | 'rejected'
  | 'success' | 'warning' | 'error' | 'info';

interface StatusBadgeProps {
  status: StatusType;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  text, 
  size = 'md',
  showIcon = true 
}) => {
  const getStatusConfig = (status: StatusType) => {
    const configs = {
      confirmed: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle,
        defaultText: 'Confirmado' 
      },
      scheduled: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: Clock,
        defaultText: 'Programado' 
      },
      completed: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: CheckCircle,
        defaultText: 'Completado' 
      },
      cancelled: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircle,
        defaultText: 'Cancelado' 
      },
      active: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle,
        defaultText: 'Activo' 
      },
      inactive: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: XCircle,
        defaultText: 'Inactivo' 
      },
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: Clock,
        defaultText: 'Pendiente' 
      },
      approved: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle,
        defaultText: 'Aprobado' 
      },
      rejected: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircle,
        defaultText: 'Rechazado' 
      },
      success: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle,
        defaultText: 'Éxito' 
      },
      warning: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: AlertCircle,
        defaultText: 'Advertencia' 
      },
      error: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircle,
        defaultText: 'Error' 
      },
      info: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: AlertCircle,
        defaultText: 'Información' 
      }
    };

    return configs[status] || configs.info;
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm', 
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const displayText = text || config.defaultText;

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full border
      ${config.color} ${sizeClasses[size]}
    `}>
      {showIcon && (
        <Icon className={`mr-1 ${iconSizes[size]}`} />
      )}
      {displayText}
    </span>
  );
};

export default StatusBadge;
