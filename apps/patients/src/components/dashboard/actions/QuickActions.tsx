'use client';

import React, { useState } from 'react';

interface QuickActionsProps {
  patientId: string;
  onEmergency?: () => void;
  onActionComplete?: (action: string) => void;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  action: () => void;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  patientId,
  onEmergency,
  onActionComplete
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [confirmAction, setConfirmAction] = useState<QuickAction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Ejecutar acción
  const executeAction = async (action: QuickAction) => {
    if (action.requiresConfirmation && !confirmAction) {
      setConfirmAction(action);
      return;
    }

    try {
      setIsProcessing(true);
      await action.action();
      onActionComplete?.(action.id);
      setShowMenu(false);
      setConfirmAction(null);
    } catch (error) {
      console.error('Error ejecutando acción:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Definir acciones disponibles
  const quickActions: QuickAction[] = [
    {
      id: 'emergency',
      label: 'Activar Emergencia',
      icon: '🚨',
      color: 'bg-red-600 hover:bg-red-700',
      requiresConfirmation: true,
      confirmationMessage: '¿Está seguro de activar el protocolo de emergencia?',
      action: () => {
        onEmergency?.();
      }
    },
    {
      id: 'call-doctor',
      label: 'Llamar al Médico',
      icon: '📞',
      color: 'bg-blue-600 hover:bg-blue-700',
      action: async () => {
        // Simular llamada
        console.log('Iniciando llamada al médico...');
      }
    },
    {
      id: 'request-appointment',
      label: 'Solicitar Cita',
      icon: '📅',
      color: 'bg-green-600 hover:bg-green-700',
      action: async () => {
        // Abrir modal de solicitud de cita
        console.log('Abriendo solicitud de cita...');
      }
    },
    {
      id: 'send-message',
      label: 'Mensaje al Equipo',
      icon: '💬',
      color: 'bg-purple-600 hover:bg-purple-700',
      action: async () => {
        // Abrir chat del equipo
        console.log('Abriendo chat del equipo...');
      }
    },
    {
      id: 'request-medication',
      label: 'Solicitar Medicamento',
      icon: '💊',
      color: 'bg-yellow-600 hover:bg-yellow-700',
      action: async () => {
        // Abrir formulario de solicitud
        console.log('Solicitando medicamento...');
      }
    },
    {
      id: 'download-records',
      label: 'Descargar Expediente',
      icon: '📄',
      color: 'bg-gray-600 hover:bg-gray-700',
      action: async () => {
        // Descargar expediente
        console.log('Descargando expediente médico...');
      }
    }
  ];

  return (
    <>
      {/* Botón de acciones rápidas */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-lg"
          title="Acciones rápidas"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>

        {/* Menú desplegable */}
        {showMenu && (
          <>
            {/* Overlay para cerrar el menú */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMenu(false)}
            />
            
            {/* Menú de acciones */}
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Acciones Rápidas</h3>
              </div>
              
              <div className="p-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => executeAction(action)}
                    disabled={isProcessing}
                    className={`
                      w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-white font-medium
                      transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                      ${action.color}
                    `}
                  >
                    <span className="text-xl">{action.icon}</span>
                    <span className="text-sm">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de confirmación */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <div className="text-center">
              <span className="text-4xl block mb-4">{confirmAction.icon}</span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {confirmAction.label}
              </h3>
              <p className="text-gray-600 mb-6">
                {confirmAction.confirmationMessage}
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => executeAction(confirmAction)}
                  disabled={isProcessing}
                  className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${confirmAction.color}`}
                >
                  {isProcessing ? 'Procesando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions; 