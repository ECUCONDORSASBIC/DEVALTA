'use client'

import React, { forwardRef, useState, useEffect } from 'react'
import { useWizard } from './Wizard'
import { cn } from '@altamedica/utils'

// Icons using design tokens
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
)

const ErrorIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
)

// Validation types
export type ValidationRule = {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
  email?: boolean
  phone?: boolean
  numeric?: boolean
}

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  stepId: string
  fieldId: string
  description?: string
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio'
  options?: Array<{ value: string; label: string; disabled?: boolean }>
  validation?: ValidationRule
  showValidationIcon?: boolean
  rows?: number
  className?: string
  containerClassName?: string
  labelClassName?: string
  helpText?: string
  required?: boolean
  disabled?: boolean
  autoComplete?: string
  autoSave?: boolean
  debounceMs?: number
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(({
  label,
  stepId,
  fieldId,
  description,
  placeholder,
  type = 'text',
  options = [],
  validation,
  showValidationIcon = true,
  rows = 4,
  className,
  containerClassName,
  labelClassName,
  helpText,
  required = false,
  disabled = false,
  autoComplete,
  autoSave = true,
  debounceMs = 300,
  ...props
}, ref) => {
  const { data, updateStepData, setStepValid, theme } = useWizard()
  const [value, setValue] = useState(data[stepId]?.[fieldId] || '')
  const [touched, setTouched] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)

  // Get current value from wizard data
  const currentValue = data[stepId]?.[fieldId] || ''

  // Validation function
  const validateField = (val: any): string[] => {
    const validationErrors: string[] = []

    if (!validation) return validationErrors

    // Required validation
    if (validation.required && (!val || val.toString().trim() === '')) {
      validationErrors.push(`${label} is required`)
    }

    // Skip other validations if field is empty and not required
    if (!val || val.toString().trim() === '') {
      return validationErrors
    }

    // Length validations
    if (validation.minLength && val.toString().length < validation.minLength) {
      validationErrors.push(`${label} must be at least ${validation.minLength} characters`)
    }

    if (validation.maxLength && val.toString().length > validation.maxLength) {
      validationErrors.push(`${label} must not exceed ${validation.maxLength} characters`)
    }

    // Pattern validation
    if (validation.pattern && !validation.pattern.test(val.toString())) {
      validationErrors.push(`${label} format is invalid`)
    }

    // Email validation
    if (validation.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(val.toString())) {
        validationErrors.push(`${label} must be a valid email address`)
      }
    }

    // Phone validation
    if (validation.phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
      if (!phoneRegex.test(val.toString().replace(/\s/g, ''))) {
        validationErrors.push(`${label} must be a valid phone number`)
      }
    }

    // Numeric validation
    if (validation.numeric && isNaN(Number(val))) {
      validationErrors.push(`${label} must be a number`)
    }

    // Custom validation
    if (validation.custom) {
      const customResult = validation.custom(val)
      if (typeof customResult === 'string') {
        validationErrors.push(customResult)
      } else if (customResult === false) {
        validationErrors.push(`${label} is invalid`)
      }
    }

    return validationErrors
  }

  // Update field value with debouncing
  useEffect(() => {
    if (!autoSave) return

    const timeoutId = setTimeout(() => {
      const stepData = data[stepId] || {}
      const newStepData = { ...stepData, [fieldId]: value }
      updateStepData(stepId, newStepData)
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [value, stepId, fieldId, updateStepData, autoSave, debounceMs, data])

  // Validate on value change
  useEffect(() => {
    if (touched || currentValue) {
      const validationErrors = validateField(value)
      setErrors(validationErrors)
      setStepValid(stepId, validationErrors.length === 0)
    }
  }, [value, touched, validation, stepId, fieldId, setStepValid, currentValue])

  // Sync with wizard data
  useEffect(() => {
    if (currentValue !== value) {
      setValue(currentValue)
    }
  }, [currentValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setValue(newValue)
    setTouched(true)

    // Immediate update for non-auto-save mode
    if (!autoSave) {
      const stepData = data[stepId] || {}
      const newStepData = { ...stepData, [fieldId]: newValue }
      updateStepData(stepId, newStepData)
    }
  }

  const handleBlur = () => {
    setTouched(true)
  }

  const isValid = errors.length === 0
  const hasError = touched && errors.length > 0

  // Base classes for inputs
  const inputClasses = cn(
    'medical-input',
    'w-full px-4 py-2 border rounded-md transition-colors',
    'text-body placeholder:text-secondary',
    'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    hasError 
      ? 'border-error-500 bg-error-50 text-error-900' 
      : isValid && touched 
        ? 'border-success-500 bg-success-50' 
        : 'border-border-primary bg-surface',
    'dark:bg-surface-secondary dark:border-border-primary',
    className
  )

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={`${stepId}-${fieldId}`}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            className={cn(inputClasses, 'resize-vertical')}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        )

      case 'select':
        return (
          <select
            id={`${stepId}-${fieldId}`}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            className={inputClasses}
            {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map(option => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-3">
            <input
              ref={ref}
              type="checkbox"
              id={`${stepId}-${fieldId}`}
              checked={!!value}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={disabled}
              required={required}
              className={cn(
                'w-4 h-4 text-primary-500 border-border-primary rounded',
                'focus:ring-primary-500/20 focus:ring-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                hasError && 'border-error-500',
                className
              )}
              {...props}
            />
            <label htmlFor={`${stepId}-${fieldId}`} className="text-body cursor-pointer">
              {label}
              {required && <span className="text-error-500 ml-1">*</span>}
            </label>
          </div>
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {options.map(option => (
              <div key={option.value} className="flex items-center space-x-3">
                <input
                  type="radio"
                  id={`${stepId}-${fieldId}-${option.value}`}
                  name={`${stepId}-${fieldId}`}
                  value={option.value}
                  checked={value === option.value}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={disabled || option.disabled}
                  required={required}
                  className={cn(
                    'w-4 h-4 text-primary-500 border-border-primary',
                    'focus:ring-primary-500/20 focus:ring-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    hasError && 'border-error-500',
                    className
                  )}
                  {...props}
                />
                <label htmlFor={`${stepId}-${fieldId}-${option.value}`} className="text-body cursor-pointer">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        )

      case 'password':
        return (
          <div className="relative">
            <input
              ref={ref}
              type={showPassword ? 'text' : 'password'}
              id={`${stepId}-${fieldId}`}
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              autoComplete={autoComplete}
              className={cn(inputClasses, 'pr-10')}
              {...props}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        )

      default:
        return (
          <input
            ref={ref}
            type={type}
            id={`${stepId}-${fieldId}`}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            className={inputClasses}
            {...props}
          />
        )
    }
  }

  if (type === 'checkbox') {
    return (
      <div className={cn('form-field', containerClassName)}>
        {renderInput()}
        {description && (
          <p className="text-small text-secondary mt-1">{description}</p>
        )}
        {hasError && (
          <div className="mt-2 flex items-center text-error-600">
            <ErrorIcon />
            <span className="ml-2 text-small">{errors[0]}</span>
          </div>
        )}
        {helpText && (
          <p className="text-caption text-secondary mt-1">{helpText}</p>
        )}
      </div>
    )
  }

  return (
    <div className={cn('form-field', 'space-y-2', containerClassName)}>
      {/* Label */}
      <label 
        htmlFor={`${stepId}-${fieldId}`} 
        className={cn(
          'block text-small font-medium text-primary',
          labelClassName
        )}
      >
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>

      {/* Description */}
      {description && (
        <p className="text-small text-secondary -mt-1">{description}</p>
      )}

      {/* Input with validation icon */}
      <div className="relative">
        {renderInput()}
        
        {/* Validation icon */}
        {showValidationIcon && touched && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {hasError ? (
              <ErrorIcon />
            ) : isValid && value ? (
              <CheckIcon />
            ) : null}
          </div>
        )}
      </div>

      {/* Error messages */}
      {hasError && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center text-error-600">
              <ErrorIcon />
              <span className="ml-2 text-small">{error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Help text */}
      {helpText && !hasError && (
        <p className="text-caption text-secondary">{helpText}</p>
      )}
    </div>
  )
})

FormField.displayName = 'FormField'

export default FormField
