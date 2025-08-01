'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import firebaseAuth, { UserProfile as FirebaseUserProfile, RegisterData } from '@/services/firebase-auth';
import { toast } from 'sonner';
import { RedirectService } from '@/services/redirect-service';

// Extender el tipo UserProfile para incluir campos adicionales si es necesario
export interface UserProfile extends FirebaseUserProfile {
  userType?: 'patient' | 'doctor' | 'company' | 'admin';
  twoFactorEnabled?: boolean;
  isActive?: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: RegisterData) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Efecto para escuchar cambios en el estado de autenticación
  useEffect(() => {
    console.log('🔄 [AuthContext] Inicializando listener de autenticación...');
    setLoading(true);
    
    const unsubscribe = firebaseAuth.onAuthChange(async (firebaseUser) => {
      console.log('🔔 [AuthContext] Cambio de estado de auth detectado:', firebaseUser?.uid || 'null');
      
      try {
        if (firebaseUser) {
          console.log('👤 [AuthContext] Usuario autenticado:', firebaseUser.email);
          setUser(firebaseUser);
          
          // Obtener perfil del usuario desde Firestore
          console.log('📋 [AuthContext] Obteniendo perfil de Firestore...');
          const profile = await firebaseAuth.getUserProfile(firebaseUser.uid);
          
          if (profile) {
            console.log('✅ [AuthContext] Perfil obtenido:', {
              uid: profile.uid,
              email: profile.email,
              role: profile.role
            });
            
            setUserProfile({
              ...profile,
              userType: profile.role as UserProfile['userType'],
              twoFactorEnabled: false, // Por defecto, actualizar según necesidad
              isActive: true,
            });
          } else {
            // Si no hay perfil, crear uno básico
            console.warn('⚠️ [AuthContext] No se encontró perfil para el usuario:', firebaseUser.uid);
          }
        } else {
          console.log('🚪 [AuthContext] Usuario no autenticado');
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('❌ [AuthContext] Error obteniendo perfil de usuario:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        console.log('✅ [AuthContext] Carga completada');
        setLoading(false);
      }
    });

    return () => {
      console.log('🔚 [AuthContext] Limpiando listener de autenticación');
      unsubscribe();
    };
  }, []);

  // Método de inicio de sesión
  const signIn = async (email: string, password: string) => {
    console.log('🔐 [AuthContext] Iniciando proceso de login...');
    console.log('📧 [AuthContext] Email:', email);
    
    try {
      setError(null);
      setLoading(true);
      
      console.log('🔥 [AuthContext] Llamando a firebaseAuth.signIn...');
      const firebaseUser = await firebaseAuth.signIn(email, password);
      console.log('✅ [AuthContext] Usuario autenticado:', firebaseUser.uid);
      
      console.log('👤 [AuthContext] Obteniendo perfil de usuario...');
      const profile = await firebaseAuth.getUserProfile(firebaseUser.uid);
      console.log('📋 [AuthContext] Perfil obtenido:', profile);
      
      if (!profile) {
        console.error('❌ [AuthContext] Perfil de usuario no encontrado');
        throw new Error('Perfil de usuario no encontrado');
      }
      
      console.log('🎭 [AuthContext] Rol del usuario:', profile.role);
      toast.success('¡Bienvenido de vuelta!');
      
      // Redirigir según el rol del usuario
      console.log('🚀 [AuthContext] Preparando redirección en 1.5 segundos...');
      setTimeout(() => {
        let redirectUrl = '/dashboard';
        
        if (profile.role === 'patient') {
          // Los pacientes se quedan en web-app
          redirectUrl = '/dashboard';
          console.log('🏥 [AuthContext] Paciente detectado, redirigiendo a:', redirectUrl);
        } else if (profile.role === 'doctor') {
          // Los doctores van a localhost:3002
          redirectUrl = 'http://localhost:3002/dashboard';
          console.log('👨‍⚕️ [AuthContext] Doctor detectado, redirigiendo a:', redirectUrl);
        } else if (profile.role === 'company') {
          // Las empresas van a localhost:3004
          redirectUrl = 'http://localhost:3004/dashboard';
          console.log('🏢 [AuthContext] Empresa detectada, redirigiendo a:', redirectUrl);
        } else if (profile.role === 'admin') {
          // Los admins van a localhost:3005
          redirectUrl = 'http://localhost:3005/dashboard';
          console.log('🔧 [AuthContext] Admin detectado, redirigiendo a:', redirectUrl);
        } else {
          // Fallback
          console.warn('⚠️ [AuthContext] Rol desconocido:', profile.role, ', usando fallback');
          redirectUrl = '/dashboard';
        }
        
        console.log('➡️ [AuthContext] Ejecutando redirección a:', redirectUrl);
        window.location.href = redirectUrl;
      }, 1500); // Dar tiempo para que se muestre el toast
    } catch (err) {
      console.error('❌ [AuthContext] Error en signIn:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Método de registro
  const signUp = async (userData: RegisterData) => {
    try {
      setError(null);
      setLoading(true);
      
      await firebaseAuth.signUp(userData);
      toast.success('¡Cuenta creada exitosamente! Revisa tu email para verificar tu cuenta.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear cuenta';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cerrar sesión
  const handleSignOut = async () => {
    try {
      setError(null);
      setLoading(true);
      
      await firebaseAuth.signOut();
      
      // Limpiar estado local
      setUser(null);
      setUserProfile(null);
      
      // Limpiar cookies si las hay
      document.cookie = 'altamedica_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      toast.success('Sesión cerrada exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cerrar sesión';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Inicio de sesión con Google
  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const firebaseUser = await firebaseAuth.signInWithGoogle();
      const profile = await firebaseAuth.getUserProfile(firebaseUser.uid);
      
      toast.success('¡Bienvenido!');
      
      // Redirigir según el rol del usuario
      setTimeout(() => {
        if (profile?.role === 'patient') {
          window.location.href = '/dashboard';
        } else if (profile?.role === 'doctor') {
          window.location.href = 'http://localhost:3002/dashboard';
        } else if (profile?.role === 'company') {
          window.location.href = 'http://localhost:3004/dashboard';
        } else if (profile?.role === 'admin') {
          window.location.href = 'http://localhost:3005/dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión con Google';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Inicio de sesión con Facebook
  const signInWithFacebook = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const firebaseUser = await firebaseAuth.signInWithFacebook();
      const profile = await firebaseAuth.getUserProfile(firebaseUser.uid);
      
      toast.success('¡Bienvenido!');
      
      // Redirigir según el rol del usuario
      setTimeout(() => {
        if (profile?.role === 'patient') {
          window.location.href = '/dashboard';
        } else if (profile?.role === 'doctor') {
          window.location.href = 'http://localhost:3002/dashboard';
        } else if (profile?.role === 'company') {
          window.location.href = 'http://localhost:3004/dashboard';
        } else if (profile?.role === 'admin') {
          window.location.href = 'http://localhost:3005/dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión con Facebook';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Restablecer contraseña
  const resetPassword = async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      
      await firebaseAuth.resetPassword(email);
      toast.success('Email de recuperación enviado. Revisa tu bandeja de entrada.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar email de recuperación';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar perfil
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('Usuario no autenticado');
      
      setError(null);
      setLoading(true);
      
      await firebaseAuth.updateUserProfile(updates);
      
      // Actualizar estado local
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
      
      toast.success('Perfil actualizado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar perfil';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refrescar perfil
  const refreshProfile = async () => {
    try {
      if (!user) return;
      
      setError(null);
      const profile = await firebaseAuth.getUserProfile(user.uid);
      
      if (profile) {
        setUserProfile({
          ...profile,
          userType: profile.role as UserProfile['userType'],
          twoFactorEnabled: false,
          isActive: true,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al refrescar perfil';
      setError(errorMessage);
      console.error('Error refreshing profile:', err);
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signUp,
    signOut: handleSignOut,
    signInWithGoogle,
    signInWithFacebook,
    resetPassword,
    refreshProfile,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para verificar si el usuario está autenticado
export const useRequireAuth = (redirectTo: string = '/login') => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = redirectTo;
    }
  }, [user, loading, redirectTo]);

  return { user, loading };
};

// Hook para verificar permisos por tipo de usuario
export const useUserPermissions = () => {
  const { userProfile } = useAuth();

  const hasPermission = (requiredType: UserProfile['userType'] | UserProfile['userType'][]) => {
    if (!userProfile) return false;
    
    if (Array.isArray(requiredType)) {
      return requiredType.includes(userProfile.userType);
    }
    
    return userProfile.userType === requiredType;
  };

  const isAdmin = () => hasPermission('admin');
  const isDoctor = () => hasPermission('doctor');
  const isPatient = () => hasPermission('patient');
  const isCompany = () => hasPermission('company');
  const isMedicalStaff = () => hasPermission(['doctor', 'admin']);

  return {
    hasPermission,
    isAdmin,
    isDoctor,
    isPatient,
    isCompany,
    isMedicalStaff,
  };
};