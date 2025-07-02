/**
 * FormError.tsx - Componente de Visualización de Errores Médicos
 * Proyecto: Altamedica Pacientes  
 * Diseño: Sistema robusto de manejo de errores con clasificación médica
 */

import React from 'react';

interface FormErrorProps {
  /** Mensaje de error a mostrar */
  message?: string;
  /** Lista de múltiples errores */
  errors?: string[];
  /** Tipo de error médico para clasificación visual */
  errorType?: 'validation' | 'medical' | 'system' | 'security' | 'network';
  /** ID del campo asociado para accesibilidad */
  fieldId?: string;
  /** Clase CSS adicional */
  className?: string;
  /** Callback cuando el usuario interactúa con el error */
  onErrorClick?: () => void;
  /** Indica si el error es crítico */
  critical?: boolean;
}

/**
 * FormError - Visualización estandarizada de errores en formularios médicos
 * Implementa clasificación por tipo de error y accesibilidad completa
 */
export const FormError: React.FC<FormErrorProps> = ({
  message,
  errors,
  errorType = 'validation',
  fieldId,
  className = '',
  onErrorClick,
  critical = false
}) => {
  // Si no hay errores, no renderizar el componente
  if (!message && (!errors || errors.length === 0)) {
    return null;
  }

  // Configuración visual según tipo de error médico
  const getErrorStyling = (): string => {
    const baseStyle = 'p-3 rounded-md border-l-4 transition-all duration-300';
    
    switch (errorType) {
      case 'medical':
        return `${baseStyle} bg-red-50 border-red-500 text-red-800`;
      case 'system':
        return `${baseStyle} bg-orange-50 border-orange-500 text-orange-800`;
      case 'security':
        return `${baseStyle} bg-purple-50 border-purple-500 text-purple-800`;
      case 'network':
        return `${baseStyle} bg-blue-50 border-blue-500 text-blue-800`;
      default: // validation
        return `${baseStyle} bg-yellow-50 border-yellow-500 text-yellow-800`;
    }
  };

  // Ícono según tipo de error
  const getErrorIcon = (): string => {
    switch (errorType) {
      case 'medical':
        return '🏥';
      case 'system':
        return '⚠️';
      case 'security':
        return '🔒';
      case 'network':
        return '🌐';
      default:
        return '❌';
    }
  };

  // Combinación de clases finales
  const finalClassName = `
    ${getErrorStyling()}
    ${critical ? 'ring-2 ring-red-300 shadow-lg' : ''}
    ${onErrorClick ? 'cursor-pointer hover:shadow-md' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div
      className={finalClassName}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      aria-describedby={fieldId ? `${fieldId}-error` : undefined}
      onClick={onErrorClick}
      tabIndex={onErrorClick ? 0 : undefined}
      onKeyDown={onErrorClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onErrorClick();
        }
      } : undefined}
    >
      <div className="flex items-start space-x-2">
        {/* Ícono de error */}
        <span 
          className="text-lg flex-shrink-0 mt-0.5"
          aria-hidden="true"
        >
          {getErrorIcon()}
        </span>
        
        {/* Contenido del error */}
        <div className="flex-1">
          {/* Indicador de tipo de error */}
          <div className="flex items-center mb-1">
            <span className="text-xs font-semibold uppercase tracking-wide">
              {errorType === 'medical' ? 'Error Médico' : 
               errorType === 'system' ? 'Error del Sistema' :
               errorType === 'security' ? 'Error de Seguridad' :
               errorType === 'network' ? 'Error de Conexión' :
               'Error de Validación'}
            </span>
            {critical && (
              <span className="ml-2 text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                CRÍTICO
              </span>
            )}
          </div>

          {/* Mensaje único */}
          {message && (
            <p 
              className="text-sm font-medium"
              id={fieldId ? `${fieldId}-error` : undefined}
            >
              {message}
            </p>
          )}

          {/* Lista de múltiples errores */}
          {errors && errors.length > 0 && (
            <ul className="text-sm space-y-1 mt-2">
              {errors.map((error, index) => (
                <li 
                  key={index}
                  className="flex items-start space-x-2"
                >
                  <span className="text-xs mt-1">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Información adicional para errores críticos */}
          {critical && (
            <div className="mt-3 p-2 bg-white bg-opacity-50 rounded text-xs">
              <strong>Acción requerida:</strong> Este error requiere atención inmediata. 
              Contacte al administrador del sistema si persiste.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormError;