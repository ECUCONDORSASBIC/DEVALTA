/**
 * useLoginForm.tsx - Hook Especializado para Autenticación Médica
 * Proyecto: Altamedica Pacientes
 * Diseño: Ultra-conservador con validaciones médicas robustas
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from './useAuth';

// 📝 Interfaces específicas del formulario de login
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface LoginFormState {
  data: LoginFormData;
  errors: LoginFormErrors;
  isSubmitting: boolean;
  hasSubmitted: boolean;
  isValid: boolean;
}

// 🏥 Patrones de validación médica específicos
const MEDICAL_EMAIL_PATTERNS = {
  // Dominios médicos argentinos comunes
  medical: /^[a-zA-Z0-9._%+-]+@(hospital|clinica|sanatorio|medicina|salud|medico|altamedica)\.[a-zA-Z]{2,}$/,
  // Email general pero con validación estricta
  general: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  // Instituciones de salud argentinas
  institutions: /^[a-zA-Z0-9._%+-]+@(osde|swiss|galeno|omint|sancor|medicus|ioma|pami)\.[a-zA-Z]{2,}$/
};

// 🛡️ Configuración de seguridad de contraseña
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecial: false, // Opcional para médicos
  maxAttempts: 3,
  lockoutTime: 15 * 60 * 1000 // 15 minutos
};

/**
 * Hook especializado para formulario de login médico
 * Incluye validaciones específicas y gestión de errores robusta
 */
export const useLoginForm = () => {
  // 🔐 Estado del formulario
  const [formState, setFormState] = useState<LoginFormState>({
    data: {
      email: '',
      password: '',
      rememberMe: false
    },
    errors: {},
    isSubmitting: false,
    hasSubmitted: false,
    isValid: false
  });

  // 🚨 Control de intentos fallidos
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);

  // 📊 Referencias para manejo avanzado
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const submitTimeRef = useRef<number>(0);

  // 🪝 Hook de autenticación
  const { login, authState } = useAuth();

  // ⏰ Verificar lockout periódicamente
  useEffect(() => {
    if (lockoutEndTime) {
      const interval = setInterval(() => {
        if (Date.now() > lockoutEndTime) {
          setIsLockedOut(false);
          setLockoutEndTime(null);
          setFailedAttempts(0);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lockoutEndTime]);

  // 🔍 Validación de email médico
  const validateEmail = useCallback((email: string): string | undefined => {
    if (!email) {
      return 'El email es obligatorio';
    }

    // Verificar formato básico
    if (!MEDICAL_EMAIL_PATTERNS.general.test(email)) {
      return 'Formato de email inválido';
    }

    // Validación adicional para dominios médicos (preferencia)
    const isMedicalDomain = MEDICAL_EMAIL_PATTERNS.medical.test(email) || 
                           MEDICAL_EMAIL_PATTERNS.institutions.test(email);

    // Warning suave para dominios no médicos (no bloquea)
    if (!isMedicalDomain && email.includes('@gmail.com')) {
      // Solo advertencia, no error
      console.warn('Dominio personal detectado, se recomienda usar email institucional');
    }

    // Validaciones específicas
    if (email.length > 100) {
      return 'Email demasiado largo (máximo 100 caracteres)';
    }

    return undefined;
  }, []);

  // 🔒 Validación de contraseña
  const validatePassword = useCallback((password: string): string | undefined => {
    if (!password) {
      return 'La contraseña es obligatoria';
    }

    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
      return `La contraseña debe tener al menos ${PASSWORD_REQUIREMENTS.minLength} caracteres`;
    }

    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
      return 'La contraseña debe contener al menos una mayúscula';
    }

    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
      return 'La contraseña debe contener al menos una minúscula';
    }

    if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
      return 'La contraseña debe contener al menos un número';
    }

    if (PASSWORD_REQUIREMENTS.requireSpecial && !/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      return 'La contraseña debe contener al menos un carácter especial';
    }

    return undefined;
  }, []);

  // ✅ Validación completa del formulario
  const validateForm = useCallback((): LoginFormErrors => {
    const errors: LoginFormErrors = {};

    const emailError = validateEmail(formState.data.email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(formState.data.password);
    if (passwordError) errors.password = passwordError;

    return errors;
  }, [formState.data, validateEmail, validatePassword]);

  // 📝 Actualizar campo del formulario
  const updateField = useCallback((field: keyof LoginFormData, value: string | boolean) => {
    setFormState(prev => {
      const newData = { ...prev.data, [field]: value };
      const newErrors = { ...prev.errors };
      
      // Limpiar error del campo al escribir
      if (field in newErrors) {
        delete newErrors[field];
      }

      // Validación en tiempo real (solo después del primer submit)
      if (prev.hasSubmitted) {
        if (field === 'email') {
          const emailError = validateEmail(value as string);
          if (emailError) newErrors.email = emailError;
        } else if (field === 'password') {
          const passwordError = validatePassword(value as string);
          if (passwordError) newErrors.password = passwordError;
        }
      }

      const allErrors = prev.hasSubmitted ? validateForm() : newErrors;
      const isValid = Object.keys(allErrors).length === 0;

      return {
        ...prev,
        data: newData,
        errors: allErrors,
        isValid
      };
    });
  }, [validateEmail, validatePassword, validateForm]);

  // 🚀 Manejo del submit
  const handleSubmit = useCallback(async (): Promise<boolean> => {
    // Verificar lockout
    if (isLockedOut) {
      const remainingTime = Math.ceil((lockoutEndTime! - Date.now()) / 1000 / 60);
      setFormState(prev => ({
        ...prev,
        errors: { 
          general: `Cuenta bloqueada. Intente nuevamente en ${remainingTime} minutos.` 
        }
      }));
      return false;
    }

    // Marcar como enviado y validar
    setFormState(prev => ({ ...prev, hasSubmitted: true }));
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormState(prev => ({
        ...prev,
        errors,
        isValid: false
      }));
      
      // Enfocar primer campo con error
      if (errors.email && emailInputRef.current) {
        emailInputRef.current.focus();
      } else if (errors.password && passwordInputRef.current) {
        passwordInputRef.current.focus();
      }
      
      return false;
    }

    // Prevenir double-submit
    const now = Date.now();
    if (now - submitTimeRef.current < 1000) {
      return false;
    }
    submitTimeRef.current = now;

    setFormState(prev => ({ ...prev, isSubmitting: true, errors: {} }));

    try {
      await login({
        email: formState.data.email,
        password: formState.data.password,
        rememberMe: formState.data.rememberMe
      });

      // Reset de intentos fallidos en login exitoso
      setFailedAttempts(0);
      setIsLockedOut(false);
      setLockoutEndTime(null);

      return true;
    } catch (error) {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);

      // Implementar lockout después de máximo de intentos
      if (newFailedAttempts >= PASSWORD_REQUIREMENTS.maxAttempts) {
        setIsLockedOut(true);
        setLockoutEndTime(Date.now() + PASSWORD_REQUIREMENTS.lockoutTime);
        
        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
          errors: { 
            general: `Demasiados intentos fallidos. Cuenta bloqueada por ${PASSWORD_REQUIREMENTS.lockoutTime / 60000} minutos.` 
          }
        }));
      } else {
        const remainingAttempts = PASSWORD_REQUIREMENTS.maxAttempts - newFailedAttempts;
        
        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
          errors: { 
            general: `Credenciales inválidas. ${remainingAttempts} intentos restantes.` 
          }
        }));
      }

      return false;
    }
  }, [formState.data, validateForm, login, failedAttempts, isLockedOut, lockoutEndTime]);

  // 🔄 Reset del formulario
  const resetForm = useCallback(() => {
    setFormState({
      data: {
        email: '',
        password: '',
        rememberMe: false
      },
      errors: {},
      isSubmitting: false,
      hasSubmitted: false,
      isValid: false
    });
    setFailedAttempts(0);
    setIsLockedOut(false);
    setLockoutEndTime(null);
  }, []);

  // 🎯 Enfocar campo específico
  const focusField = useCallback((field: keyof Pick<LoginFormData, 'email' | 'password'>) => {
    if (field === 'email' && emailInputRef.current) {
      emailInputRef.current.focus();
    } else if (field === 'password' && passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, []);

  // 📊 Información de estado para UI
  const getSecurityInfo = useCallback(() => {
    return {
      failedAttempts,
      remainingAttempts: Math.max(0, PASSWORD_REQUIREMENTS.maxAttempts - failedAttempts),
      isLockedOut,
      lockoutRemainingTime: lockoutEndTime ? Math.max(0, lockoutEndTime - Date.now()) : 0
    };
  }, [failedAttempts, isLockedOut, lockoutEndTime]);

  return {
    // Estado del formulario
    formState,
    
    // Funciones de control
    updateField,
    handleSubmit,
    resetForm,
    focusField,
    
    // Referencias para inputs
    emailInputRef,
    passwordInputRef,
    
    // Estado de autenticación general
    isAuthenticated: authState.isAuthenticated,
    authLoading: authState.isLoading,
    
    // Información de seguridad
    securityInfo: getSecurityInfo(),
    
    // Funciones de validación individuales (para uso externo)
    validateEmail,
    validatePassword
  };
};

export default useLoginForm;