"use client";

// Este archivo es un módulo ESM (import/export). No se detectan incompatibilidades de módulos en este archivo.
// Si usas este hook en entornos CJS, puede haber incompatibilidades.

import {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
} from "react";
import { auth, db } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile as fbUpdateProfile,
  getIdToken,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

// Mantener TODOS los tipos existentes sin cambios
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "patient" | "doctor" | "admin" | "nurse";
  patientId?: string;
  doctorId?: string;
  permissions: string[];
  avatar?: string;
  phoneNumber?: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

// Contexto sin cambios
const AuthContext = createContext<{
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  checkPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Sincronizar estado de Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await getIdToken(firebaseUser);
        // Obtener perfil de usuario y paciente
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        let userData = userDoc.exists() ? userDoc.data() : null;
        // Si no existe, forzar logout por seguridad
        if (!userData) {
          await signOut(auth);
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: "Usuario no encontrado en base de datos",
          });
          return;
        }
        // Consultar perfil de paciente real
        let patientProfile = null;
        try {
          const res = await fetch(`/api/v1/patients/${firebaseUser.uid}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            patientProfile = await res.json();
          }
        } catch {}
        setAuthState({
          user: { ...userData, patientId: firebaseUser.uid },
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      const token = await getIdToken(userCred.user);
      // Sincronizar usuario y perfil
      const userDoc = await getDoc(doc(db, "users", userCred.user.uid));
      if (!userDoc.exists()) throw new Error("Usuario no encontrado en base de datos");
      const userData = userDoc.data();
      // Consultar perfil de paciente real
      let patientProfile = null;
      try {
        const res = await fetch(`/api/v1/patients/${userCred.user.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) patientProfile = await res.json();
      } catch {}
      // Guardar en storage
      if (credentials.rememberMe) {
        localStorage.setItem("altamedica_token", token);
        localStorage.setItem("altamedica_user", JSON.stringify(userData));
      } else {
        sessionStorage.setItem("altamedica_token", token);
        sessionStorage.setItem("altamedica_user", JSON.stringify(userData));
      }
      setAuthState({
        user: { ...userData, patientId: userCred.user.uid },
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Error en login",
      }));
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("altamedica_token");
    localStorage.removeItem("altamedica_user");
    sessionStorage.removeItem("altamedica_token");
    sessionStorage.removeItem("altamedica_user");
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const register = async (data: RegisterData) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // 1. Crear usuario en Firebase Auth
      const userCred = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      // 2. Actualizar perfil en Firebase Auth
      await fbUpdateProfile(userCred.user, {
        displayName: `${data.firstName} ${data.lastName}`,
        phoneNumber: data.phoneNumber,
      });
      // 3. Crear usuario en Firestore si no existe
      const userRef = doc(db, "users", userCred.user.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          id: userCred.user.uid,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: "patient",
          permissions: ["read:own_records", "write:own_appointments"],
          isActive: true,
          phoneNumber: data.phoneNumber || null,
          lastLogin: new Date().toISOString(),
        });
      }
      // 4. Crear perfil de paciente en backend
      const token = await getIdToken(userCred.user);
      const patientProfile = {
        dateOfBirth: data.dateOfBirth,
        gender: "male", // TODO: pedir en formulario
        // ...otros campos opcionales
      };
      const res = await fetch("/api/v1/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...patientProfile, uid: userCred.user.uid }),
      });
      if (!res.ok) {
        throw new Error("Error creando perfil de paciente");
      }
      // Guardar en storage
      localStorage.setItem("altamedica_token", token);
      localStorage.setItem(
        "altamedica_user",
        JSON.stringify({
          id: userCred.user.uid,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: "patient",
        })
      );
      setAuthState({
        user: {
          id: userCred.user.uid,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: "patient",
        },
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Error en registro",
      }));
      throw error;
    }
  };

  const refreshToken = async () => {
    const token =
      localStorage.getItem("altamedica_token") ||
      sessionStorage.getItem("altamedica_token");
    if (token) {
      setAuthState((prev) => ({ ...prev, token }));
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!authState.user) return;

    setAuthState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...data } : null,
    }));
  };

  const checkPermission = (permission: string): boolean => {
    if (!authState.user) return false;
    return (
      authState.user.permissions.includes(permission) ||
      authState.user.permissions.includes("*")
    );
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!authState.user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(authState.user.role);
  };

  const contextValue = {
    authState,
    login,
    logout,
    register,
    refreshToken,
    updateProfile,
    checkPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// 🪝 HOOKS SIN CAMBIOS - Mantienen compatibilidad total
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useUser() {
  const { authState } = useAuth();
  return authState.user;
}

export function useIsAuthenticated() {
  const { authState } = useAuth();
  return authState.isAuthenticated;
}

export function usePermissions() {
  const { checkPermission, hasRole } = useAuth();
  return { checkPermission, hasRole };
}

// 🛡️ COMPONENTE DE PROTECCIÓN - Sin cambios
export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
  fallback = <div>Access denied</div>,
}: {
  children: ReactNode;
  requiredPermission?: string;
  requiredRole?: string | string[];
  fallback?: ReactNode;
}) {
  const { authState, checkPermission, hasRole } = useAuth();

  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <div className="text-center mt-8">
        <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
        <p>Please log in to access this page.</p>
      </div>
    );
  }

  if (requiredPermission && !checkPermission(requiredPermission)) {
    return fallback;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return fallback;
  }

  return <>{children}</>;
}

// 🏥 HOOK DE DATOS DEL PACIENTE - Adaptado para Firebase
export function usePatientData() {
  const { authState } = useAuth();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authState.user?.patientId) {
      loadPatientData();
    }
  }, [authState.user]);

  const loadPatientData = async () => {
    try {
      // Aquí se puede mantener la llamada a la API existente
      // o migrar a Firestore gradualmente
      const response = await fetch(
        `/api/v1/patients/${authState.user!.patientId}`,
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPatientData(data);
      }
    } catch (error) {
      console.error("Failed to load patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  return { patientData, loading, refreshPatientData: loadPatientData };
}

export default useAuth;
