'use client';

import React, { useState } from 'react';
import { Shield, Star, CheckCircle, Heart, Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getDashboardUrl } from '../../config/app-urls';

interface AuthState {
  step: 'login' | 'register' | 'twoFactor' | 'complete';
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: 'patient' | 'doctor' | 'company' | 'admin';
  twoFactorCode: string;
  isLoading: boolean;
  error: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
}

const SimpleAuthSystem: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    step: 'login',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    userType: 'patient',
    twoFactorCode: '',
    isLoading: false,
    error: '',
    showPassword: false,
    showConfirmPassword: false
  });

  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  };

  // Validaciones básicas
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validateForm = () => {
    if (!validateEmail(authState.email)) {
      updateAuthState({ error: 'Email inválido' });
      return false;
    }

    if (!validatePassword(authState.password)) {
      updateAuthState({ error: 'La contraseña debe tener al menos 6 caracteres' });
      return false;
    }

    if (authState.step === 'register') {
      if (authState.password !== authState.confirmPassword) {
        updateAuthState({ error: 'Las contraseñas no coinciden' });
        return false;
      }

      if (!authState.firstName.trim() || !authState.lastName.trim()) {
        updateAuthState({ error: 'Nombre y apellido son requeridos' });
        return false;
      }
    }

    return true;
  };

  // Simular login/registro
  const handleLogin = async () => {
    if (!validateForm()) return;

    updateAuthState({ isLoading: true, error: '' });

    // Simular llamada a API
    setTimeout(() => {
      if (authState.email === 'demo@altamedica.com' && authState.password === 'demo123') {
        // Redirigir según el tipo de usuario
        const redirectUrl = getDashboardUrl(authState.userType);
        window.location.href = redirectUrl;
      } else {
        updateAuthState({ 
          error: 'Credenciales inválidas. Prueba: demo@altamedica.com / demo123', 
          isLoading: false 
        });
      }
    }, 1000);
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    updateAuthState({ isLoading: true, error: '' });

    // Simular registro
    setTimeout(() => {
      updateAuthState({ step: 'complete', isLoading: false });
    }, 1000);
  };


  // === PANTALLA DE FINALIZACIÓN ===
  if (authState.step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-neutral-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12">
            <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              ¡Bienvenido a ALTAMEDICA!
            </h1>
            
            <p className="text-xl text-gray-600 mb-2">
              {authState.firstName} {authState.lastName}
            </p>
            
            <p className="text-gray-500 mb-8">
              {authState.email}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="h-6 w-6 text-blue-600" />
                </div>
                <div className="font-medium text-gray-900">Perfil Configurado</div>
                <div className="text-sm text-gray-600">Listo para usar</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div className="font-medium text-gray-900">Seguridad Activada</div>
                <div className="text-sm text-gray-600">Verificación completa</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div className="font-medium text-gray-900">Plataforma Lista</div>
                <div className="text-sm text-gray-600">Acceso completo</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={() => {
                  const redirectUrl = getDashboardUrl(authState.userType);
                  window.location.href = redirectUrl;
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Ir a mi Dashboard
              </button>
              
              <button className="w-full border-2 border-blue-300 text-blue-600 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all duration-300">
                Ver Tutorial Interactivo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === PANTALLAS DE LOGIN/REGISTER ===
  const isRegisterMode = authState.step === 'register';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-neutral-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isRegisterMode ? 'Únete a ALTAMEDICA' : 'Accede a tu cuenta ALTAMEDICA'}
            </p>
          </div>
          
          <div className="space-y-6">
            {authState.error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{authState.error}</p>
                </div>
              </div>
            )}

            {isRegisterMode && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={authState.firstName}
                        onChange={(e) => updateAuthState({ firstName: e.target.value, error: '' })}
                        className="w-full py-3 px-4 pl-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Juan"
                      />
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={authState.lastName}
                        onChange={(e) => updateAuthState({ lastName: e.target.value, error: '' })}
                        className="w-full py-3 px-4 pl-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Pérez"
                      />
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Usuario *
                  </label>
                  <select
                    value={authState.userType}
                    onChange={(e) => updateAuthState({ userType: e.target.value as any, error: '' })}
                    className="w-full py-3 px-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="patient">Paciente</option>
                    <option value="doctor">Médico</option>
                    <option value="company">Empresa/Clínica</option>
                    <option value="admin">Admin ALTAMEDICA</option>
                  </select>
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={authState.email}
                  onChange={(e) => updateAuthState({ email: e.target.value, error: '' })}
                  className="w-full py-3 px-4 pl-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {!isRegisterMode && (
                <p className="text-xs text-blue-600 mt-1">
                  Demo: demo@altamedica.com
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  type={authState.showPassword ? 'text' : 'password'}
                  value={authState.password}
                  onChange={(e) => updateAuthState({ password: e.target.value, error: '' })}
                  className="w-full py-3 px-4 pr-12 pl-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => updateAuthState({ showPassword: !authState.showPassword })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {authState.showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {!isRegisterMode && (
                <p className="text-xs text-blue-600 mt-1">
                  Demo: demo123
                </p>
              )}
            </div>

            {isRegisterMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={authState.showConfirmPassword ? 'text' : 'password'}
                    value={authState.confirmPassword}
                    onChange={(e) => updateAuthState({ confirmPassword: e.target.value, error: '' })}
                    className="w-full py-3 px-4 pr-12 pl-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => updateAuthState({ showConfirmPassword: !authState.showConfirmPassword })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {authState.showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}
            
            <button
              onClick={isRegisterMode ? handleRegister : handleLogin}
              disabled={authState.isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {authState.isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{isRegisterMode ? 'Creando cuenta...' : 'Iniciando sesión...'}</span>
                </>
              ) : (
                <>
                  <span>{isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="text-center space-y-2">
              <button
                onClick={() => updateAuthState({ 
                  step: isRegisterMode ? 'login' : 'register',
                  error: '',
                  password: '',
                  confirmPassword: ''
                })}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {isRegisterMode 
                  ? '¿Ya tienes cuenta? Inicia sesión'
                  : '¿No tienes cuenta? Regístrate'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAuthSystem;
