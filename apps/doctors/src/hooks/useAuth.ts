/**
 * Hook de Autenticación para Sistema Médico
 * Gestión de sesiones, permisos y estado de usuario
 */

'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';

import { firebaseService } from '../services/firebase-service';
import { User, Role, Permission } from '../types/appointments-users';

interface AuthContextType {
  // Estado de autenticación
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Acciones de autenticación
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Gestión de permisos
  hasPermission: (permission: string, scope?: string) => boolean;
  hasRole: (roleName: string) => boolean;
  canAccessPatient: (patientId: string) => boolean;
  canModifyAppointment: (appointmentId: string) => boolean;
  
  // Metadatos de sesión
  sessionExpiry: Date | null;
  refreshSession: () => Promise<void>;
  getAccessLevel: () => 'DEPARTMENT' | 'FACILITY' | 'ORGANIZATION' | 'PATIENT_SPECIFIC';
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiry, setSessionExpiry] = useState<Date | null>(null);

  // Listener de usuario de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseService.authentication, (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        loadUserProfile(firebaseUser.uid);
        calculateSessionExpiry();
      } else {
        setUser(null);
        setSessionExpiry(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Listener de perfil de usuario en tiempo real
  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;

    if (firebaseUser) {
      const userDocRef = doc(firebaseService.firestore, 'users', firebaseUser.uid);
      
      unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = { id: docSnapshot.id, ...docSnapshot.data() } as User;
          setUser(userData);
          
          // Verificar estado de la cuenta
          if (userData.accountStatus.status !== 'ACTIVE') {
            console.warn('Cuenta de usuario no activa:', userData.accountStatus.status);
            signOut();
            return;
          }
          
          // Verificar expiración de licencias
          if (userData.professionalInfo?.licenseExpiry) {
            const licenseExpiry = new Date(userData.professionalInfo.licenseExpiry);
            const now = new Date();
            const daysUntilExpiry = Math.ceil((licenseExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysUntilExpiry <= 30) {
              console.warn(`Licencia médica expira en ${daysUntilExpiry} días`);
              // Aquí podrías mostrar una notificación
            }
          }
        } else {
          console.error('Perfil de usuario no encontrado');
          signOut();
        }
        
        setLoading(false);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [firebaseUser]);

  // Cargar perfil inicial
  const loadUserProfile = async (uid: string) => {
    try {
      const userDocRef = doc(firebaseService.firestore, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = { id: userDoc.id, ...userDoc.data() } as User;
        setUser(userData);
      } else {
        console.error('Perfil de usuario no encontrado');
        await signOut();
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Calcular expiración de sesión
  const calculateSessionExpiry = () => {
    if (user?.authorization.sessionTimeout) {
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + user.authorization.sessionTimeout);
      setSessionExpiry(expiryTime);
    }
  };

  // Iniciar sesión
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      await firebaseService.signIn(email, password);
      // El estado se actualizará automáticamente por el listener
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Cerrar sesión
  const signOut = async (): Promise<void> => {
    try {
      await firebaseService.signOut();
      setUser(null);
      setFirebaseUser(null);
      setSessionExpiry(null);
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      throw error;
    }
  };

  // Restablecer contraseña
  const resetPassword = async (email: string): Promise<void> => {
    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(firebaseService.authentication, email);
    } catch (error) {
      console.error('Error enviando reset de contraseña:', error);
      throw error;
    }
  };

  // Verificar permiso específico
  const hasPermission = (permissionName: string, scope?: string): boolean => {
    if (!user) return false;

    // Buscar permiso directo
    const directPermission = user.authorization.permissions.find(p => 
      p.name === permissionName && (!scope || p.scope === scope)
    );
    
    if (directPermission) return true;

    // Buscar permiso a través de roles
    for (const role of user.authorization.roles) {
      const rolePermission = role.permissions.includes(permissionName);
      if (rolePermission) return true;
    }

    return false;
  };

  // Verificar rol específico
  const hasRole = (roleName: string): boolean => {
    if (!user) return false;
    return user.authorization.roles.some(role => role.name === roleName);
  };

  // Verificar acceso a paciente específico
  const canAccessPatient = (patientId: string): boolean => {
    if (!user) return false;

    // Administradores tienen acceso completo
    if (hasRole('admin') || hasRole('system_admin')) return true;

    // Verificar permisos específicos del paciente
    if (hasPermission('read:patients', 'PATIENT_SPECIFIC')) {
      // Aquí se implementaría lógica adicional para verificar
      // si el usuario tiene acceso a este paciente específico
      return true;
    }

    // Verificar acceso por departamento/facilidad
    if (hasPermission('read:patients', 'DEPARTMENT') || hasPermission('read:patients', 'FACILITY')) {
      return true;
    }

    return false;
  };

  // Verificar modificación de cita
  const canModifyAppointment = (appointmentId: string): boolean => {
    if (!user) return false;

    // Verificar permisos de escritura
    return hasPermission('write:appointments') || hasPermission('update:appointments');
  };

  // Refrescar sesión
  const refreshSession = async (): Promise<void> => {
    if (firebaseUser) {
      try {
        await firebaseUser.getIdToken(true); // Forzar refresh del token
        calculateSessionExpiry();
      } catch (error) {
        console.error('Error refrescando sesión:', error);
        await signOut();
      }
    }
  };

  // Obtener nivel de acceso
  const getAccessLevel = (): 'DEPARTMENT' | 'FACILITY' | 'ORGANIZATION' | 'PATIENT_SPECIFIC' => {
    if (!user) return 'PATIENT_SPECIFIC';
    return user.authorization.dataAccessLevel;
  };

  const contextValue: AuthContextType = {
    user,
    firebaseUser,
    loading,
    isAuthenticated: !!user && !!firebaseUser,
    signIn,
    signOut,
    resetPassword,
    hasPermission,
    hasRole,
    canAccessPatient,
    canModifyAppointment,
    sessionExpiry,
    refreshSession,
    getAccessLevel
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto de autenticación
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return context;
}

// Hook para verificar autenticación requerida
export function useRequireAuth() {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      // Redirigir al login
      window.location.href = '/login';
    }
  }, [auth.loading, auth.isAuthenticated]);
  
  return auth;
}

// Hook para verificar permisos específicos
export function usePermission(permission: string, scope?: string) {
  const auth = useAuth();
  
  return {
    hasPermission: auth.hasPermission(permission, scope),
    loading: auth.loading,
    user: auth.user
  };
}

// Hook para gestión de sesión
export function useSession() {
  const auth = useAuth();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!auth.sessionExpiry) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = auth.sessionExpiry!.getTime() - now.getTime();
      
      if (diff <= 0) {
        auth.signOut();
        return;
      }
      
      setTimeLeft(Math.floor(diff / 1000));
      
      // Advertencia a 5 minutos
      if (diff <= 5 * 60 * 1000 && diff > 4 * 60 * 1000) {
        console.warn('Sesión expira en 5 minutos');
        // Aquí podrías mostrar una notificación
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [auth.sessionExpiry, auth.signOut]);

  return {
    sessionExpiry: auth.sessionExpiry,
    timeLeft,
    refreshSession: auth.refreshSession,
    isNearExpiry: timeLeft !== null && timeLeft < 300 // 5 minutos
  };
}

// Hook para verificar roles específicos
export function useRole(roleName: string) {
  const auth = useAuth();
  
  return {
    hasRole: auth.hasRole(roleName),
    loading: auth.loading,
    user: auth.user
  };
}

// Hook de protección de rutas
export function useRouteProtection(requiredPermissions: string[] = [], requiredRoles: string[] = []) {
  const auth = useAuth();
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    if (auth.loading) return;

    if (!auth.isAuthenticated) {
      setCanAccess(false);
      return;
    }

    // Verificar permisos requeridos
    const hasRequiredPermissions = requiredPermissions.length === 0 || 
      requiredPermissions.every(permission => auth.hasPermission(permission));

    // Verificar roles requeridos
    const hasRequiredRoles = requiredRoles.length === 0 || 
      requiredRoles.some(role => auth.hasRole(role));

    setCanAccess(hasRequiredPermissions && hasRequiredRoles);
  }, [auth, requiredPermissions, requiredRoles]);

  return {
    canAccess,
    loading: auth.loading,
    user: auth.user,
    redirect: () => {
      if (!auth.isAuthenticated) {
        window.location.href = '/login';
      } else {
        window.location.href = '/unauthorized';
      }
    }
  };
}

export default useAuth;
