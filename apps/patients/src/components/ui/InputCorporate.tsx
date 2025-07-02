/**
 * InputCorporate.tsx - Componente de Input Corporativo para Formularios Médicos
 * Proyecto: Altamedica Pacientes
 * Diseño: Ultra-robusto con validaciones médicas especializadas
 */

import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';

interface InputCorporateProps {
  /** Tipo de input HTML */
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'date' | 'time' | 'datetime-local';
  /** Valor del input */
  value?: string | number;
  /** Placeholder del input */
  placeholder?: string;
  /** Indica si el campo está deshabilitado */
  disabled?: boolean;
  /** Indica si es de solo lectura */
  readOnly?: boolean;
  /** Indica si el campo es obligatorio */
  required?: boolean;
  /** Callback cuando cambia el valor */
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Callback cuando se pierde el foco */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /** Callback cuando se gana el foco */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /** Callback al presionar Enter */
  onEnterKey?: (value: string) => void;
  /** ID único del input */
  id?: string;
  /** Nombre del campo para formularios */
  name?: string;
  /** Clase CSS adicional */
  className?: string;
  /** Mensaje de error a mostrar */
  error?: string;
  /** Estado de validación visual */
  validationState?: 'valid' | 'invalid' | 'neutral';
  /** Tipo de validación médica */
  medicalType?: 'patient-id' | 'medical-record' | 'dni' | 'phone' | 'email' | 'prescription' | 'standard';
  /** Longitud máxima permitida */
  maxLength?: number;
  /** Longitud mínima requerida */
  minLength?: number;
  /** Patrón de validación regex */
  pattern?: string;
  /** Texto de ayuda descriptivo */
  helpText?: string;
  /** Prefijo visual (ej: $, +, etc.) */
  prefix?: string;
  /** Sufijo visual */
  suffix?: string;
  /** Autocompletado del navegador */
  autoComplete?: string;
  /** Tamaño del input */
  size?: 'sm' | 'md' | 'lg';
}

export interface InputCorporateRef {
  focus: () => void;
  blur: () => void;
  select: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
  validate: () => boolean;
}

/**
 * InputCorporate - Input estandarizado para formularios médicos
 * Implementa validaciones especializadas y cumple normativas sanitarias
 */
export const InputCorporate = forwardRef<InputCorporateRef, InputCorporateProps>(({
  type = 'text',
  value = '',
  placeholder,
  disabled = false,
  readOnly = false,
  required = false,
  onChange,
  onBlur,
  onFocus,
  onEnterKey,
  id,
  name,
  className = '',
  error,
  validationState = 'neutral',
  medicalType = 'standard',
  maxLength,
  minLength,
  pattern,
  helpText,
  prefix,
  suffix,
  autoComplete,
  size = 'md'
}, ref) => {
  // Estados internos
  const [internalValue, setInternalValue] = useState<string>(String(value));
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Ref interno para el input
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Validación médica especializada
  const getMedicalValidation = useCallback((val: string): { isValid: boolean; message?: string } => {
    if (!val && !required) return { isValid: true };
    if (!val && required) return { isValid: false, message: 'Este campo es obligatorio' };

    switch (medicalType) {
      case 'patient-id':
        // Validación de ID de paciente (formato: PAT-XXXXXX)
        const patientIdPattern = /^PAT-\d{6}$/;
        return {
          isValid: patientIdPattern.test(val),
          message: patientIdPattern.test(val) ? undefined : 'Formato: PAT-123456'
        };
      
      case 'dni':
        // Validación de DNI (8 dígitos)
        const dniPattern = /^\d{8}$/;
        return {
          isValid: dniPattern.test(val),
          message: dniPattern.test(val) ? undefined : 'DNI debe tener 8 dígitos'
        };
      
      case 'phone':
        // Validación de teléfono médico
        const phonePattern = /^(\+?54)?[\s-]?(\d{2,4})[\s-]?\d{3,4}[\s-]?\d{4}$/;
        return {
          isValid: phonePattern.test(val),
          message: phonePattern.test(val) ? undefined : 'Formato: +54 11 1234-5678'
        };
      
      case 'email':
        // Validación de email médico estricta
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return {
          isValid: emailPattern.test(val),
          message: emailPattern.test(val) ? undefined : 'Email no válido'
        };
      
      case 'medical-record':
        // Validación de número de historia clínica
        const recordPattern = /^HC-\d{8}$/;
        return {
          isValid: recordPattern.test(val),
          message: recordPattern.test(val) ? undefined : 'Formato: HC-12345678'
        };
      
      default:
        return { isValid: true };
    }
  }, [medicalType, required]);

  // Configuración de estilos según tamaño
  const getSizeClasses = (): string => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-4 py-3 text-lg';
      default: // md
        return 'px-3 py-2.5 text-base';
    }
  };

  // Configuración de estado visual
  const getStateClasses = (): string => {
    if (error || validationState === 'invalid') {
      return 'border-red-500 focus:border-red-600 focus:ring-red-200';
    }
    if (validationState === 'valid') {
      return 'border-green-500 focus:border-green-600 focus:ring-green-200';
    }
    if (isFocused) {
      return 'border-blue-500 focus:border-blue-600 focus:ring-blue-200';
    }
    return 'border-gray-300 focus:border-blue-500 focus:ring-blue-200';
  };

  // Clases base del input
  const baseInputClasses = `
    w-full rounded-md border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    disabled:bg-gray-100 disabled:cursor-not-allowed
    read-only:bg-gray-50 read-only:cursor-default
    ${getSizeClasses()}
    ${getStateClasses()}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Manejo de cambios
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInternalValue(newValue);
    setHasInteracted(true);
    onChange?.(newValue, event);
  }, [onChange]);

  // Manejo de foco
  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(event);
  }, [onFocus]);

  // Manejo de pérdida de foco
  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasInteracted(true);
    onBlur?.(event);
  }, [onBlur]);

  // Manejo de tecla Enter
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && onEnterKey) {
      event.preventDefault();
      onEnterKey(internalValue);
    }
  }, [internalValue, onEnterKey]);

  // Imperativa API
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    select: () => inputRef.current?.select(),
    getValue: () => internalValue,
    setValue: (val: string) => setInternalValue(val),
    validate: () => getMedicalValidation(internalValue).isValid
  }), [internalValue, getMedicalValidation]);

  // Validación en tiempo real
  const validation = hasInteracted ? getMedicalValidation(internalValue) : { isValid: true };

  return (
    <div className="input-corporate-container">
      {/* Contenedor con prefijo/sufijo */}
      <div className="relative">
        {/* Prefijo */}
        {prefix && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-gray-500 text-sm">{prefix}</span>
          </div>
        )}

        {/* Input principal */}
        <input
          ref={inputRef}
          type={type}
          value={internalValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          id={id}
          name={name}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          autoComplete={autoComplete}
          className={`${baseInputClasses} ${prefix ? 'pl-10' : ''} ${suffix ? 'pr-10' : ''}`}
          aria-invalid={!validation.isValid || !!error}
          aria-describedby={`${id}-help ${id}-error`}
        />

        {/* Sufijo */}
        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-gray-500 text-sm">{suffix}</span>
          </div>
        )}

        {/* Indicador de validación */}
        {hasInteracted && validation.isValid && !error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span className="text-green-500 text-sm">✓</span>
          </div>
        )}
      </div>

      {/* Texto de ayuda */}
      {helpText && (
        <p 
          id={`${id}-help`}
          className="mt-1 text-xs text-gray-500"
        >
          {helpText}
        </p>
      )}

      {/* Mensaje de error */}
      {(error || (!validation.isValid && hasInteracted)) && (
        <p 
          id={`${id}-error`}
          className="mt-1 text-xs text-red-600"
          role="alert"
        >
          {error || validation.message}
        </p>
      )}

      {/* Contador de caracteres */}
      {maxLength && (
        <div className="mt-1 text-xs text-gray-400 text-right">
          {internalValue.length}/{maxLength}
        </div>
      )}
    </div>
  );
});

InputCorporate.displayName = 'InputCorporate';

export default InputCorporate;