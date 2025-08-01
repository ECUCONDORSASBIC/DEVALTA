/**
 * Hook de Autenticación para Sistema Médico
 * Gestión de sesiones, permisos y estado de usuario
 */

'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Lazy loading para Firebase Auth - solo se carga cuando sea necesario
const FirebaseAuth = dynamic(() => import('firebase/auth'), {
  ssr: false
});

const FirebaseFirestore = dynamic(() => import('firebase/firestore'), {
  ssr: false
});

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

  // Verificar permiso específico
  const hasPermission = (permissionName: string, scope?: string): boolean => {
    if (!user) return false;
    return user.authorization.permissions.some(p => 
      p.name === permissionName && (!scope || p.scope === scope)
    );
  };

  // Verificar rol específico
  const hasRole = (roleName: string): boolean => {
    if (!user) return false;
    return user.authorization.roles.some(role => role.name === roleName);
  };

  const contextValue: AuthContextType = {
    user,
    firebaseUser,
    loading,
    isAuthenticated: !!user && !!firebaseUser,
    signIn,
    signOut,
    resetPassword: async () => {},
    hasPermission,
    hasRole,
    canAccessPatient: () => true,
    canModifyAppointment: () => true,
    sessionExpiry,
    refreshSession: async () => {},
    getAccessLevel: () => 'FACILITY'
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

export default useAuth; 