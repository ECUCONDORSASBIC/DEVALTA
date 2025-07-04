/**
 * 🔔 Provider de Notificaciones
 * Gestiona el estado global de notificaciones y muestra toasts automáticamente
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationToast } from './NotificationToast';

interface NotificationContextType {
  showToast: (notification: any) => void;
  clearToasts: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  autoShowToasts?: boolean;
}

export function NotificationProvider({ 
  children, 
  maxToasts = 3,
  autoShowToasts = true 
}: NotificationProviderProps) {
  const [toasts, setToasts] = useState<any[]>([]);
  
  const {
    notifications,
    markAsRead,
    isConnected
  } = useNotifications({
    autoConnect: true
  });

  // Mostrar toasts automáticamente para nuevas notificaciones
  useEffect(() => {
    if (!autoShowToasts) return;

    // Obtener la notificación más reciente
    const latestNotification = notifications[0];
    if (!latestNotification) return;

    // Verificar si ya se mostró como toast
    const alreadyShown = toasts.some(toast => toast.id === latestNotification.id);
    if (alreadyShown) return;

    // Mostrar toast solo para notificaciones de alta prioridad o no leídas
    if (latestNotification.priority === 'high' || 
        latestNotification.priority === 'urgent' || 
        !latestNotification.is_read) {
      showToast(latestNotification);
    }
  }, [notifications, autoShowToasts, toasts]);

  const showToast = (notification: any) => {
    setToasts(prev => {
      // Limitar número de toasts
      const newToasts = [...prev, notification];
      if (newToasts.length > maxToasts) {
        return newToasts.slice(-maxToasts);
      }
      return newToasts;
    });
  };

  const clearToasts = () => {
    setToasts([]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleToastAction = (notification: any) => {
    // Marcar como leída si no lo está
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  const contextValue: NotificationContextType = {
    showToast,
    clearToasts
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast, index) => (
          <div
            key={`${toast.id}-${index}`}
            style={{
              transform: `translateY(${index * 80}px)`
            }}
          >
            <NotificationToast
              notification={toast}
              onClose={removeToast}
              onAction={handleToastAction}
              duration={toast.priority === 'urgent' ? 10000 : 5000}
            />
          </div>
        ))}
      </div>

      {/* Connection status indicator (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? '🔗 Conectado' : '❌ Desconectado'}
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

// Hook para usar el contexto
export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
} 