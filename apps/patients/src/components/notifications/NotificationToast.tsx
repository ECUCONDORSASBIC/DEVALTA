/**
 * 🔔 Toast de Notificaciones en Tiempo Real
 * Muestra notificaciones emergentes con animaciones
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';

interface NotificationToastProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error' | 'appointment' | 'prescription' | 'system';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    created_at: string;
    action_url?: string;
    action_text?: string;
  };
  onClose: (id: string) => void;
  onAction?: (notification: any) => void;
  duration?: number;
}

export function NotificationToast({
  notification,
  onClose,
  onAction,
  duration = 5000
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Mostrar con animación
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Auto-cerrar después del tiempo especificado
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300); // Tiempo de animación de salida
  };

  const handleAction = () => {
    if (onAction) {
      onAction(notification);
    }
    if (notification.action_url) {
      window.open(notification.action_url, '_blank');
    }
    handleClose();
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'appointment':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'appointment':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'error':
        return 'border-l-red-500';
      case 'appointment':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const getPriorityBadge = () => {
    if (notification.priority === 'urgent') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Urgente
        </span>
      );
    }
    if (notification.priority === 'high') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          Alta
        </span>
      );
    }
    return null;
  };

  return (
    <div
      className={`
        fixed top-4 right-4 w-96 max-w-sm z-50
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isClosing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getBackgroundColor()} border rounded-lg shadow-lg
        ${getBorderColor()} border-l-4
      `}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  {notification.title}
                </h4>
                {getPriorityBadge()}
              </div>
              
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
              
              {/* Timestamp */}
              <p className="text-xs text-gray-500 mt-2">
                {new Date(notification.created_at).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-2 p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Action button */}
        {notification.action_url && notification.action_text && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={handleAction}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {notification.action_text}
            </button>
          </div>
        )}
      </div>

      {/* Progress bar for auto-close */}
      <div className="h-1 bg-gray-200 rounded-b-lg overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300 ease-linear"
          style={{
            width: isClosing ? '0%' : '100%',
            transitionDuration: `${duration}ms`
          }}
        />
      </div>
    </div>
  );
} 