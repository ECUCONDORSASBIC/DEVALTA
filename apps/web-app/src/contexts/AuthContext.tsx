'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@altamedica/firebase/src/config-production';
import { useSafeContext } from '@/components/error/SafeContext';

export interface UserProfile {
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
  profilePicture?: string;
  isActive: boolean;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useSafeContext(
    AuthContext,
    'useAuth debe usarse dentro de un AuthProvider'
  );
  
  if (context === null || context === undefined) {
    console.warn('AuthContext no disponible - retornando valores por defecto');
    return {
      user: null,
      userProfile: null,
      loading: true,
      signOut: async () => {},
      refreshProfile: async () => {}
    };
  }
  
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Prevenir errores de hidratación
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const fetchUserProfile = async (firebaseUser: FirebaseUser): Promise<UserProfile | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user);
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const profile = await fetchUserProfile(firebaseUser);
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signOut: handleSignOut,
    refreshProfile,
  };

  // Prevenir renderizado hasta hidratación completa
  if (!isHydrated) {
    return (
      <div suppressHydrationWarning>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Inicializando autenticación...</p>
          </div>
        </div>
      </div>
    );
  }

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
    userType: userProfile?.userType,
  };
};