/**
 * FormGroup.tsx - Componente Contenedor de Grupos de Formulario
 * Proyecto: Altamedica Pacientes
 * Diseño: Contenedor robusto que integra Label, Input y Error de forma cohesiva
 */

import React from 'react';
import { FormLabel } from './FormLabel';
import { FormError } from './FormError';
import { InputCorporate, InputCorporateRef } from './InputCorporate';

interface FormGroupProps {
  /** Etiqueta del campo */
  label: string;
  /** ID único del campo (se propaga automáticamente) */
  id: string;
  /** Indica si el campo es obligatorio */
  required?: boolean;
  /** Texto de ayuda descriptivo */
  helpText?: string;
  /** Mensaje de error */
  error?: string;
  /** Lista de múltiples errores */
  errors?: string[];
  /** Tipo de error para clasificación visual */
  errorType?: 'validation' | 'medical' | 'system' | 'security' | 'network';
  /** Indica si el error es crítico */
  criticalError?: boolean;
  /** Tipo de validación médica */
  medicalValidation?: 'patient-id' | 'medical-record' | 'prescription' | 'diagnosis' | 'standard';
  /** Clase CSS adicional para el contenedor */
  className?: string;
  /** Espaciado vertical del grupo */
  spacing?: 'compact' | 'normal' | 'relaxed';
  /** Layout del grupo */
  layout?: 'vertical' | 'horizontal';
  /** Props específicas para el InputCorporate */
  inputProps?: Omit<React.ComponentProps<typeof InputCorporate>, 'id' | 'error'>;
  /** Ref del input interno */
  inputRef?: React.Ref<InputCorporateRef>;
  /** Callback cuando cambia el valor */
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Callback cuando se valida el campo */
  onValidation?: (isValid: boolean, message?: string) => void;
}

/**
 * FormGroup - Contenedor integral para campos de formulario médico
 * Integra automáticamente Label, Input y Error manteniendo consistencia visual
 */
export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  id,
  required = false,
  helpText,
  error,
  errors,
  errorType = 'validation',
  criticalError = false,
  medicalValidation = 'standard',
  className = '',
  spacing = 'normal',
  layout = 'vertical',
  inputProps = {},
  inputRef,
  onChange,
  onValidation
}) => {
  // Configuración de espaciado
  const getSpacingClasses = (): string => {
    switch (spacing) {
      case 'compact':
        return 'space-y-1';
      case 'relaxed':
        return 'space-y-4';
      default: // normal
        return 'space-y-2';
    }
  };

  // Configuración de layout
  const getLayoutClasses = (): string => {
    if (layout === 'horizontal') {
      return 'sm:flex sm:items-start sm:space-x-4 sm:space-y-0';
    }
    return 'flex flex-col';
  };

  // Clases del contenedor principal
  const containerClasses = `
    form-group
    ${getLayoutClasses()}
    ${getSpacingClasses()}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Determinar estado de validación visual
  const hasErrors = !!(error || (errors && errors.length > 0));
  const validationState = hasErrors ? 'invalid' : 'neutral';

  // Manejo de cambios con validación
  const handleChange = (value: string, event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(value, event);
    
    // Callback de validación si está definido
    if (onValidation) {
      const isValid = !hasErrors && value.length > 0;
      onValidation(isValid, hasErrors ? (error || errors?.[0]) : undefined);
    }
  };

  return (
    <div className={containerClasses}>
      {/* Contenedor de Label */}
      <div className={layout === 'horizontal' ? 'sm:w-1/3 sm:flex-shrink-0' : ''}>
        <FormLabel
          htmlFor={id}
          required={required}
          medicalValidation={medicalValidation}
          helpText={layout === 'horizontal' ? helpText : undefined}
        >
          {label}
        </FormLabel>
      </div>

      {/* Contenedor de Input y Error */}
      <div className={layout === 'horizontal' ? 'sm:w-2/3' : 'w-full'}>
        {/* Input */}
        <InputCorporate
          {...inputProps}
          id={id}
          ref={inputRef}
          required={required}
          error={error}
          validationState={validationState}
          medicalType={medicalValidation === 'standard' ? 'standard' : medicalValidation}
          helpText={layout === 'vertical' ? helpText : undefined}
          onChange={handleChange}
        />

        {/* Error Display */}
        {hasErrors && (
          <div className="mt-2">
            <FormError
              message={error}
              errors={errors}
              errorType={errorType}
              fieldId={id}
              critical={criticalError}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * FormGroupCompact - Versión compacta del FormGroup para formularios densos
 */
export const FormGroupCompact: React.FC<FormGroupProps> = (props) => {
  return (
    <FormGroup
      {...props}
      spacing="compact"
      className={`form-group-compact ${props.className || ''}`}
    />
  );
};

/**
 * FormGroupHorizontal - Versión horizontal del FormGroup para layouts amplios
 */
export const FormGroupHorizontal: React.FC<FormGroupProps> = (props) => {
  return (
    <FormGroup
      {...props}
      layout="horizontal"
      spacing="normal"
      className={`form-group-horizontal ${props.className || ''}`}
    />
  );
};

export default FormGroup;