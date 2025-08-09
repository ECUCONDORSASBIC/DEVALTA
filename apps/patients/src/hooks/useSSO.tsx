/**
 * Hook personalizado para gestión de SSO en la aplicación de pacientes
 */

import { getSSO, initializeSSO, type SSOUser } from '@altamedica/auth/sso-service';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

// Configuración SSO para la app de pacientes
const SSO_CONFIG = {
  apiServerUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3008',
  webAppUrl: process.env.NEXT_PUBLIC_WEB_APP_URL || 'http://localhost:3000',
  currentAppPort: '3003',
  appName: 'patients'
};

// Inicializar SSO al cargar el módulo
if (typeof window !== 'undefined') {
  initializeSSO(SSO_CONFIG);
}

interface UseSSO {
  user: SSOUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export function useSSO(): UseSSO {
  const [user, setUser] = useState<SSOUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // Iniciar sesión con Google
  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sso = getSSO();
      if (!sso.auth) throw new Error('Firebase Auth no inicializado');
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(sso.auth, provider);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();
      // Enviar el token de Google al backend para crear sesión SSO
      const response = await fetch(`${SSO_CONFIG.apiServerUrl}/api/v1/auth/login-google`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idToken })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || error.message || 'Error autenticando con Google');
      }
      const data = await response.json();
      // Actualizar usuario local con datos del backend
      setUser(data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Google');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Verificar sesión SSO al montar el componente
  useEffect(() => {
    checkSession();

    // Escuchar cambios de sesión SSO
    const sso = getSSO();
    const unsubscribe = sso.onSessionChange((updatedUser) => {
      console.log('[useSSO] Sesión SSO cambió:', updatedUser);
      setUser(updatedUser);
      
      // Si no hay usuario y estamos en una ruta protegida, redirigir al login
      if (!updatedUser && window.location.pathname !== '/login') {
        router.push('/login');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Verificar sesión SSO
  const checkSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const sso = getSSO();
      const ssoUser = await sso.checkSSOSession();
      
      if (ssoUser) {
        console.log('[useSSO] Usuario SSO encontrado:', ssoUser);
        
        // Verificar que el usuario tiene el rol correcto para esta app
        if (ssoUser.role !== 'patient' && ssoUser.role !== 'admin') {
          throw new Error('No tienes permisos para acceder a esta aplicación');
        }
        
        setUser(ssoUser);
      } else {
        console.log('[useSSO] No hay sesión SSO activa');
        setUser(null);
      }
    } catch (err: any) {
      console.error('[useSSO] Error verificando sesión:', err);
      setError(err.message || 'Error verificando sesión');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Iniciar sesión SSO
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const sso = getSSO();
      const ssoUser = await sso.signIn(email, password);
      
      // Verificar que el usuario tiene el rol correcto
      if (ssoUser.role !== 'patient' && ssoUser.role !== 'admin') {
        throw new Error('Esta cuenta no tiene acceso al portal de pacientes');
      }
      
      console.log('[useSSO] Login exitoso:', ssoUser);
      setUser(ssoUser);
      
      // Redirigir al dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('[useSSO] Error en login:', err);
      setError(err.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Cerrar sesión SSO
  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const sso = getSSO();
      await sso.signOut();
      
      console.log('[useSSO] Logout exitoso');
      setUser(null);
      
      // La redirección al login se maneja en el servicio SSO
    } catch (err: any) {
      console.error('[useSSO] Error en logout:', err);
      setError(err.message || 'Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refrescar sesión SSO
  const refreshSession = useCallback(async () => {
    try {
      const sso = getSSO();
      await sso.refreshToken();
      console.log('[useSSO] Sesión refrescada exitosamente');
    } catch (err: any) {
      console.error('[useSSO] Error refrescando sesión:', err);
      setError(err.message || 'Error refrescando sesión');
      
      // Si falla el refresh, verificar sesión completa
      await checkSession();
    }
  }, [checkSession]);

  // Auto-refresh del token cada 45 minutos
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      console.log('[useSSO] Auto-refresh del token');
      refreshSession();
    }, 45 * 60 * 1000); // 45 minutos

    return () => clearInterval(interval);
  }, [user, refreshSession]);

  return {
    user,
    loading,
    error,
    signIn,
    signInWithGoogle,
    signOut,
    checkSession,
    refreshSession
  };
}

/**
 * Hook para proteger rutas que requieren autenticación
 */
export function useRequireAuth(redirectTo = '/login') {
  const { user, loading } = useSSO();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      console.log('[useRequireAuth] Usuario no autenticado, redirigiendo a:', redirectTo);
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading };
}

/**
 * Hook para rutas públicas (login, registro) que no deben ser accesibles si ya hay sesión
 */
export function usePublicRoute(redirectTo = '/dashboard') {
  const { user, loading } = useSSO();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      console.log('[usePublicRoute] Usuario ya autenticado, redirigiendo a:', redirectTo);
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading };
}