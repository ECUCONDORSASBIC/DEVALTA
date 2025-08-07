'use client';

import React, { useState } from 'react';
import { Shield, Star, CheckCircle, Heart } from 'lucide-react';

interface AuthState {
  step: 'login' | 'register' | 'twoFactor' | 'complete';
  email: string;
  password: string;
  confirmPassword: string;
  twoFactorCode: string;
  isLoading: boolean;
}

const AuthSystem: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    step: 'login',
    email: '',
    password: '',
    confirmPassword: '',
    twoFactorCode: '',
    isLoading: false
  });

  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  };

  const handleTwoFactor = () => {
    if (authState.twoFactorCode.length === 6) {
      updateAuthState({ isLoading: true });
      setTimeout(() => {
        updateAuthState({ step: 'complete', isLoading: false });
      }, 1500);
    }
  };

  // === PANTALLA DE 2FA ===
  if (authState.step === 'twoFactor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-neutral-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verificación 2FA</h2>
              <p className="text-gray-600 mt-2">
                Ingresa el código de 6 dígitos enviado a{' '}
                <span className="font-medium">{authState.email}</span>
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Código de Verificación
                </label>
                <input
                  type="text"
                  value={authState.twoFactorCode}
                  onChange={(e) => {
                    const code = e.target.value.replace(/\D/g, '').slice(0, 6);
                    updateAuthState({ twoFactorCode: code });
                    if (code.length === 6) {
                      setTimeout(handleTwoFactor, 500);
                    }
                  }}
                  className="w-full text-center text-2xl font-mono tracking-widest py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              
              <div className="text-center text-sm text-gray-600">
                ¿No recibiste el código?{' '}
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  Reenviar código
                </button>
              </div>
              
              <button
                onClick={handleTwoFactor}
                disabled={authState.twoFactorCode.length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                Verificar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            
            <p className="text-xl text-gray-600 mb-8">
              Tu cuenta ha sido creada exitosamente. Estás listo para 
              revolucionar tu experiencia médica.
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
                <div className="text-sm text-gray-600">2FA habilitado</div>
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
              <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                Ir a mi Dashboard
              </button>
              
              <button className="w-full border-2 border-blue-300 text-blue-600 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all duration-300">
                Ver Tutorial Interactivo
              </button>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                ¿Necesitas ayuda? Nuestro equipo está disponible 24/7
                <br />
                <a href="#" className="text-blue-600 hover:text-blue-800">soporte@altamedica.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === PANTALLA POR DEFECTO (LOGIN) ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-neutral-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
            <p className="text-gray-600 mt-2">Accede a tu cuenta ALTAMEDICA</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={authState.email}
                onChange={(e) => updateAuthState({ email: e.target.value })}
                className="w-full py-3 px-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={authState.password}
                onChange={(e) => updateAuthState({ password: e.target.value })}
                className="w-full py-3 px-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            
            <button
              onClick={() => updateAuthState({ step: 'twoFactor' })}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSystem;
