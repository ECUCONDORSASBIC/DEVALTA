/**
 * page.tsx - Página de Login de Altamedica Pacientes
 * Proyecto: Altamedica Pacientes
 * Diseño: Página completa con layout médico profesional
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginMedicalForm } from '../../components/auth/LoginMedicalForm';
import { useAuth } from '../../hooks/useAuth';

/**
 * LoginPage - Página principal de autenticación médica
 * Layout profesional con branding Altamedica y UX optimizada
 */
const LoginPage: React.FC = () => {
  const router = useRouter();
  const { authState } = useAuth();

  // 🔄 Redirección si ya está autenticado
  useEffect(() => {
    if (authState.isAuthenticated && !authState.isLoading) {
      router.replace('/dashboard');
    }
  }, [authState.isAuthenticated, authState.isLoading, router]);

  // 🎉 Manejo de login exitoso
  const handleLoginSuccess = () => {
    console.log('✅ Login completado exitosamente');
    // Analytics o tracking personalizado aquí
  };

  // 🚨 Manejo de errores de login
  const handleLoginError = (error: string) => {
    console.error('❌ Error en login:', error);
    // Manejo de errores personalizado aquí
  };

  // 🔄 Mostrar loading si está verificando autenticación
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // 🚫 No mostrar página si ya está autenticado
  if (authState.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Panel Izquierdo - Branding y Información */}
      <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        {/* Patrón de fondo médico */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-24 h-24 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-16 h-16 border-2 border-white rounded-full"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center h-full p-8 text-white">
          {/* Logo y Branding */}
          <div className="text-center space-y-6 max-w-md">
            <div className="mx-auto w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-3xl font-bold text-white">A</span>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold leading-tight">
                Altamedica
                <span className="block text-2xl font-normal text-blue-100">Pacientes</span>
              </h1>
              <p className="text-blue-100 text-lg">
                Sistema de gestión médica integral
              </p>
            </div>

            {/* Características destacadas */}
            <div className="space-y-4 mt-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <span className="text-sm">🏥</span>
                </div>
                <span className="text-blue-100">Acceso a historia clínica completa</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <span className="text-sm">📅</span>
                </div>
                <span className="text-blue-100">Gestión de citas y telemedicina</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <span className="text-sm">🔒</span>
                </div>
                <span className="text-blue-100">Datos protegidos y encriptados</span>
              </div>
            </div>

            {/* Información de versión */}
            <div className="mt-8 pt-6 border-t border-blue-500 border-opacity-30">
              <p className="text-blue-200 text-xs">
                Versión 2.1.0 • Certificado ISO 27001
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Derecho - Formulario de Login */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <LoginMedicalForm
            onLoginSuccess={handleLoginSuccess}
            onLoginError={handleLoginError}
            showRegisterLink={true}
            showForgotPassword={true}
            autoRedirect={true}
            redirectUrl="/dashboard"
            className="w-full"
          />

          {/* Información de soporte */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                ¿Necesitas ayuda?
              </p>
              <div className="flex justify-center space-x-4 text-xs">
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                  onClick={() => router.push('/soporte')}
                >
                  Centro de Ayuda
                </button>
                <span className="text-gray-400">•</span>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                  onClick={() => window.open('tel:+541122334455')}
                >
                  Llamar Soporte
                </button>
              </div>
            </div>
          </div>

          {/* Información legal y compliance */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              Al iniciar sesión, aceptas nuestros{' '}
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => router.push('/terminos')}
              >
                Términos de Servicio
              </button>{' '}
              y{' '}
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => router.push('/privacidad')}
              >
                Política de Privacidad
              </button>
              . Este sistema cumple con las regulaciones de protección de datos médicos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;