'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Star, CheckCircle, Heart, Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';

// Importación directa de Firebase Auth (sin dynamic loading para evitar errores)
import * as FirebaseAuth from 'firebase/auth';
import * as FirebaseFirestore from 'firebase/firestore';

// Configuración centralizada de Firebase
import { auth, db } from '../../config/firebase';

import Link from 'next/link';
import { getDashboardUrl } from '../../config/app-urls';
import { prepareAuthRedirect } from '../../services/shared-auth';

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
  // Nuevos campos para validaciones en tiempo real
  emailValid: boolean;
  passwordValid: boolean;
  confirmPasswordValid: boolean;
  firstNameValid: boolean;
  lastNameValid: boolean;
  phoneValid: boolean;
}

interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: 'patient' | 'doctor' | 'company' | 'admin';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLogin?: string;
}

const AuthSystemFirebase: React.FC = () => {
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
    showConfirmPassword: false,
    emailValid: false,
    passwordValid: false,
    confirmPasswordValid: false,
    firstNameValid: false,
    lastNameValid: false,
    phoneValid: false
  });

  const [currentUser, setCurrentUser] = useState<FirebaseAuth.User | null>(null);

  const updateAuthState = (updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }));
  };

  // Monitorear estado de autenticación
  useEffect(() => {
    const unsubscribe = FirebaseAuth.onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user && user.emailVerified) {
        // Obtener el perfil del usuario desde Firestore
        try {
          const userDoc = await FirebaseFirestore.getDoc(FirebaseFirestore.doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            updateAuthState({ 
              step: 'complete',
              userType: userData.userType 
            });
          } else {
            updateAuthState({ step: 'complete' });
          }
        } catch (error) {
          console.error('Error al obtener perfil de usuario:', error);
          updateAuthState({ step: 'complete' });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Validaciones en tiempo real
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8 && 
           /(?=.*[a-z])/.test(password) && 
           /(?=.*[A-Z])/.test(password) && 
           /(?=.*\d)/.test(password);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validateName = (name: string) => {
    return name.trim().length >= 2;
  };

  // Efectos para validaciones en tiempo real
  useEffect(() => {
    updateAuthState({ emailValid: validateEmail(authState.email) });
  }, [authState.email]);

  useEffect(() => {
    updateAuthState({ passwordValid: validatePassword(authState.password) });
  }, [authState.password]);

  useEffect(() => {
    updateAuthState({ 
      confirmPasswordValid: authState.password === authState.confirmPassword && authState.confirmPassword.length > 0 
    });
  }, [authState.password, authState.confirmPassword]);

  useEffect(() => {
    updateAuthState({ firstNameValid: validateName(authState.firstName) });
  }, [authState.firstName]);

  useEffect(() => {
    updateAuthState({ lastNameValid: validateName(authState.lastName) });
  }, [authState.lastName]);

  useEffect(() => {
    updateAuthState({ phoneValid: validatePhone(authState.phone) });
  }, [authState.phone]);

  const validateForm = () => {
    if (!authState.emailValid) {
      updateAuthState({ error: 'Email inválido' });
      return false;
    }

    if (!authState.passwordValid) {
      updateAuthState({ 
        error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número' 
      });
      return false;
    }

    if (authState.step === 'register') {
      if (!authState.confirmPasswordValid) {
        updateAuthState({ error: 'Las contraseñas no coinciden' });
        return false;
      }

      if (!authState.firstNameValid || !authState.lastNameValid) {
        updateAuthState({ error: 'Nombre y apellido son requeridos (mínimo 2 caracteres)' });
        return false;
      }

      if (!authState.phoneValid) {
        updateAuthState({ error: 'Teléfono inválido' });
        return false;
      }
    }

    return true;
  };

  // Crear perfil de usuario en Firestore
  const createUserProfile = async (user: FirebaseAuth.User): Promise<void> => {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      firstName: authState.firstName,
      lastName: authState.lastName,
      phone: authState.phone,
      userType: authState.userType,
      emailVerified: user.emailVerified,
      twoFactorEnabled: false, // Se activará en 2FA
      createdAt: new Date().toISOString(),
    };

    await FirebaseFirestore.setDoc(FirebaseFirestore.doc(db, 'users', user.uid), userProfile);
    
    // Actualizar perfil de Firebase Auth
    await FirebaseAuth.updateProfile(user, {
      displayName: `${authState.firstName} ${authState.lastName}`
    });
  };

  // Manejar login
  const handleLogin = async () => {
    if (!validateForm()) return;

    updateAuthState({ isLoading: true, error: '' });

    try {
      const userCredential = await FirebaseAuth.signInWithEmailAndPassword(
        auth, 
        authState.email, 
        authState.password
      );

      const user = userCredential.user;

      if (!user.emailVerified) {
        updateAuthState({ 
          error: 'Por favor verifica tu email antes de continuar',
          isLoading: false 
        });
        return;
      }

      // Obtener el perfil del usuario desde Firestore
      const userDoc = await FirebaseFirestore.getDoc(FirebaseFirestore.doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        
        // Actualizar el estado con el tipo de usuario
        updateAuthState({ userType: userData.userType });
        
        // Verificar si el usuario tiene 2FA habilitado
        if (userData.twoFactorEnabled) {
          updateAuthState({ step: 'twoFactor', isLoading: false });
        } else {
          updateAuthState({ step: 'complete', isLoading: false });
        }
      } else {
        // Si no existe el perfil (caso raro), usar el tipo por defecto
        updateAuthState({ step: 'complete', isLoading: false });
      }

    } catch (error: any) {
      let errorMessage = 'Error al iniciar sesión';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuario no encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Usuario deshabilitado';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos. Intenta más tarde';
          break;
        default:
          errorMessage = error.message || 'Error desconocido';
      }
      
      updateAuthState({ error: errorMessage, isLoading: false });
    }
  };

  // Manejar registro
  const handleRegister = async () => {
    if (!validateForm()) return;

    updateAuthState({ isLoading: true, error: '' });

    try {
      const userCredential = await FirebaseAuth.createUserWithEmailAndPassword(
        auth, 
        authState.email, 
        authState.password
      );

      const user = userCredential.user;

      // Crear perfil de usuario
      await createUserProfile(user);

      // Enviar email de verificación
      await FirebaseAuth.sendEmailVerification(user);

      updateAuthState({ 
        step: 'complete', 
        isLoading: false 
      });

    } catch (error: any) {
      let errorMessage = 'Error al crear la cuenta';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este email ya está registrado';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es muy débil';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Registro no habilitado';
          break;
        default:
          errorMessage = error.message || 'Error desconocido';
      }
      
      updateAuthState({ error: errorMessage, isLoading: false });
    }
  };

  // Manejar 2FA
  const handleTwoFactor = async () => {
    if (authState.twoFactorCode.length !== 6) {
      updateAuthState({ error: 'Código inválido' });
      return;
    }

    updateAuthState({ isLoading: true, error: '' });

    // Demo: código 123456
    if (authState.twoFactorCode === '123456') {
      updateAuthState({ step: 'complete', isLoading: false });
    } else {
      updateAuthState({ 
        error: 'Código incorrecto. Demo: usa 123456', 
        isLoading: false 
      });
    }
  };

  // Reenviar verificación de email
  const resendEmailVerification = async () => {
    if (!currentUser) return;

    try {
      await FirebaseAuth.sendEmailVerification(currentUser);
      updateAuthState({ error: 'Email de verificación reenviado' });
    } catch (error) {
      updateAuthState({ error: 'Error al enviar email de verificación' });
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
              <h2 className="text-2xl font-bold text-gray-900">Verificación de Seguridad</h2>
              <p className="text-gray-600 mt-2">
                Ingresa el código de 6 dígitos para continuar
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Demo: usa el código 123456
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Código de Verificación
                </label>
                <input
                  type="text"
                  value={authState.twoFactorCode}
                  onChange={(e) => {
                    const code = e.target.value.replace(/\D/g, '').slice(0, 6);
                    updateAuthState({ twoFactorCode: code, error: '' });
                  }}
                  className="w-full text-center text-2xl font-mono tracking-widest py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              
              <div className="text-center text-sm text-gray-600">
                ¿No recibiste el código?{' '}
                <button 
                  onClick={resendEmailVerification}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Reenviar verificación
                </button>
              </div>
              
              <button
                onClick={handleTwoFactor}
                disabled={authState.twoFactorCode.length !== 6 || authState.isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {authState.isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <span>Verificar</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
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
            
            <p className="text-xl text-gray-600 mb-2">
              {currentUser?.displayName || 'Usuario'}
            </p>
            
            <p className="text-gray-500 mb-8">
              {currentUser?.email}
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
onClick={async () => {
                  const dashboardUrl = getDashboardUrl(authState.userType);
                  
                  // Preparar datos del usuario para compartir con el microservicio
                  if (currentUser) {
                    await prepareAuthRedirect(
                      {
                        uid: currentUser.uid,
                        email: currentUser.email || '',
                        userType: authState.userType,
                        firstName: authState.firstName || currentUser.displayName?.split(' ')[0] || '',
                        lastName: authState.lastName || currentUser.displayName?.split(' ')[1] || '',
                        emailVerified: currentUser.emailVerified
                      },
                      dashboardUrl
                    );
                  } else {
                    // Fallback: redirección directa si no hay usuario
                    window.location.href = dashboardUrl;
                  }
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
                        className={`w-full py-3 px-4 pl-12 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          authState.firstName ? (authState.firstNameValid ? 'border-green-300' : 'border-red-300') : 'border-gray-300'
                        }`}
                        placeholder="Juan"
                      />
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    {authState.firstName && !authState.firstNameValid && (
                      <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>Mínimo 2 caracteres</span>
                      </p>
                    )}
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
                        className={`w-full py-3 px-4 pl-12 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          authState.lastName ? (authState.lastNameValid ? 'border-green-300' : 'border-red-300') : 'border-gray-300'
                        }`}
                        placeholder="Pérez"
                      />
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    {authState.lastName && !authState.lastNameValid && (
                      <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>Mínimo 2 caracteres</span>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={authState.phone}
                      onChange={(e) => updateAuthState({ phone: e.target.value, error: '' })}
                      className={`w-full py-3 px-4 pl-12 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        authState.phone ? (authState.phoneValid ? 'border-green-300' : 'border-red-300') : 'border-gray-300'
                      }`}
                      placeholder="+54 9 11 1234-5678"
                    />
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  {authState.phone && !authState.phoneValid && (
                    <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Teléfono inválido</span>
                    </p>
                  )}
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
                  className={`w-full py-3 px-4 pl-12 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    authState.email ? (authState.emailValid ? 'border-green-300' : 'border-red-300') : 'border-gray-300'
                  }`}
                  placeholder="tu@email.com"
                />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {authState.email && !authState.emailValid && (
                <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>Email inválido</span>
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
                  className={`w-full py-3 px-4 pr-12 pl-12 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    authState.password ? (authState.passwordValid ? 'border-green-300' : 'border-red-300') : 'border-gray-300'
                  }`}
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
              {isRegisterMode && (
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 8 caracteres, una mayúscula, una minúscula y un número
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
                    className={`w-full py-3 px-4 pr-12 pl-12 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      authState.confirmPassword ? (authState.confirmPasswordValid ? 'border-green-300' : 'border-red-300') : 'border-gray-300'
                    }`}
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
                {authState.confirmPassword && !authState.confirmPasswordValid && (
                  <p className="text-red-500 text-xs mt-1 flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>Las contraseñas no coinciden</span>
                  </p>
                )}
              </div>
            )}
            
            <button
              onClick={isRegisterMode ? handleRegister : handleLogin}
              disabled={authState.isLoading || (isRegisterMode && (!authState.emailValid || !authState.passwordValid || !authState.confirmPasswordValid || !authState.firstNameValid || !authState.lastNameValid || !authState.phoneValid)) || (!isRegisterMode && (!authState.emailValid || !authState.passwordValid))}
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
              
              {!isRegisterMode && (
                <div>
                  <Link
                    href="/forgot-password"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSystemFirebase;