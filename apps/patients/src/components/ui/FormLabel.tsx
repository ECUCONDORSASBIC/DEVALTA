/**
 * FormLabel.tsx - Componente de Etiqueta Corporativa para Formularios
 * Proyecto: Altamedica Pacientes
 * Diseño: Ultra-conservador con validaciones médicas específicas
 */

import React from 'react';

interface FormLabelProps {
  /** Texto de la etiqueta */
  children: React.ReactNode;
  /** ID del campo asociado (obligatorio para accesibilidad) */
  htmlFor: string;
  /** Indica si el campo es obligatorio */
  required?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Tipo de validación médica aplicada */
  medicalValidation?: 'patient-id' | 'medical-record' | 'prescription' | 'diagnosis' | 'standard';
  /** Descripción de ayuda para el usuario */
  helpText?: string;
}

/**
 * FormLabel - Etiqueta estandarizada para formularios médicos
 * Cumple con estándares de accesibilidad WCAG 2.1 AA y normativas sanitarias
 */
export const FormLabel: React.FC<FormLabelProps> = ({
  children,
  htmlFor,
  required = false,
  className = '',
  medicalValidation = 'standard',
  helpText
}) => {
  // Validación médica específica para etiquetas críticas
  const getMedicalIndicator = (): string => {
    switch (medicalValidation) {
      case 'patient-id':
        return 'text-red-600 font-bold';
      case 'medical-record':
        return 'text-blue-600 font-semibold';
      case 'prescription':
        return 'text-purple-600 font-semibold';
      case 'diagnosis':
        return 'text-orange-600 font-semibold';
      default:
        return 'text-gray-700';
    }
  };

  const baseClasses = `
    block text-sm font-medium mb-2
    transition-colors duration-200
    ${getMedicalIndicator()}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="form-label-container">
      <label 
        htmlFor={htmlFor}
        className={baseClasses}
        aria-required={required}
      >
        {children}
        {required && (
          <span 
            className="text-red-500 ml-1 font-bold" 
            aria-label="Campo obligatorio"
            title="Este campo es obligatorio"
          >
            *
          </span>
        )}
        {medicalValidation !== 'standard' && (
          <span 
            className="ml-2 text-xs px-2 py-1 bg-gray-100 rounded-full"
            title={`Campo médico: ${medicalValidation}`}
          >
            {medicalValidation.toUpperCase()}
          </span>
        )}
      </label>
      {helpText && (
        <p 
          className="text-xs text-gray-500 mt-1 mb-2"
          id={`${htmlFor}-help`}
          role="note"
        >
          {helpText}
        </p>
      )}
    </div>
  );
};

export default FormLabel;