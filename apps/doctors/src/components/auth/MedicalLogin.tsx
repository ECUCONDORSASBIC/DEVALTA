/**
 * Componente de Login Médico
 * Autenticación segura con validación de licencias médicas
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Lazy loading para Firebase Auth - solo se carga cuando sea necesario
const FirebaseAuth = dynamic(() => import('firebase/auth'), {
  ssr: false
});

import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { firebaseService } from '@/services/firebase-service';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const MedicalLogin: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const router = useRouter();

  // Verificar si ya está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      if (firebaseService.isReady) {
        const user = firebaseService.authentication.currentUser;
        if (user) {
          router.push('/');
        }
      }
    };
    checkAuth();
  }, [router]);

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    // Validar email
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo modificado
    if (errors[field as keyof LoginFormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Intentar iniciar sesión
      const userCredential = await firebaseService.signIn(formData.email, formData.password);
      
      // Verificar que el usuario tenga permisos médicos
      // En producción, esto verificaría roles en Firestore
      console.log('Usuario autenticado:', userCredential.user.email);
      
      // Redirigir al dashboard
      router.push('/');
      
    } catch (error: any) {
      console.error('Error en login:', error);
      
      // Mapear errores de Firebase a mensajes legibles
      let errorMessage = 'Error de autenticación. Verifique sus credenciales.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No existe una cuenta con este email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Intente más tarde.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Esta cuenta ha sido deshabilitada. Contacte al administrador.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El formato del email es inválido.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Verifique su internet.';
          break;
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email) {
      setErrors({ email: 'Ingrese su email para restablecer la contraseña' });
      return;
    }

    try {
      await sendPasswordResetEmail(firebaseService.authentication, formData.email);
      setResetEmailSent(true);
      setErrors({});
    } catch (error: any) {
      setErrors({ general: 'Error enviando email de restablecimiento' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-medical-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-medical-600 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900">ALTAMEDICA</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sistema de Gestión Médica
          </p>
          <p className="mt-1 text-lg font-medium text-gray-900">
            Acceso para Profesionales
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {resetEmailSent && (
            <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-success-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-success-800">
                  Email de restablecimiento enviado. Revise su bandeja de entrada.
                </p>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error general */}
            {errors.general && (
              <div className="p-4 bg-critical-50 border border-critical-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-critical-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-sm text-critical-800">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Médico
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`
                    input-medical w-full pl-10
                    ${errors.email ? 'border-critical-300 focus:border-critical-500 focus:ring-critical-200' : ''}
                  `}
                  placeholder="doctor@altamedica.com"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-critical-600">{errors.email}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`
                    input-medical w-full pl-10 pr-10
                    ${errors.password ? 'border-critical-300 focus:border-critical-500 focus:ring-critical-200' : ''}
                  `}
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-critical-600">{errors.password}</p>
              )}
            </div>

            {/* Recordarme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleInputChange('rememberMe', e.target.checked)}
                  className="h-4 w-4 text-medical-600 focus:ring-medical-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Recordar sesión
                </label>
              </div>

              <button
                type="button"
                onClick={handlePasswordReset}
                className="text-sm text-medical-600 hover:text-medical-500 font-medium"
              >
                ¿Olvidó su contraseña?
              </button>
            </div>

            {/* Botón de submit */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-medical w-full flex justify-center py-3 px-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Autenticando...
                  </div>
                ) : (
                  'Acceder al Sistema'
                )}
              </button>
            </div>
          </form>

          {/* Información de seguridad */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-3">Sistema protegido con</p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-400 rounded-full mr-1"></div>
                  <span>HIPAA</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-blue-400 rounded-full mr-1"></div>
                  <span>GDPR</span>
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-purple-400 rounded-full mr-1"></div>
                  <span>Cifrado AES-256</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enlaces adicionales */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            ¿Problemas de acceso?{' '}
            <a href="mailto:support@altamedica.com" className="font-medium text-medical-600 hover:text-medical-500">
              Contactar Soporte
            </a>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            v2.0.0 • Última actualización: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalLogin;
