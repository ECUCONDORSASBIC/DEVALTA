"use client";
// 🔐 HOOK DE AUTENTICACIÓN ALTAMEDICA - VERSIÓN SIMPLIFICADA
// Implementación temporal sin Firebase para resolver errores

import {
  useState,
  useEffect,
  useContext,
  createContext,
  ReactNode,
} from "react";

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

// 🏗️ PROVIDER SIMPLIFICADO - Implementación mock temporal
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Verificar estado inicial
    const checkInitialAuth = async () => {
      try {
        // Intentar recuperar de localStorage
        const storedUser =
          localStorage.getItem("altamedica_user") ||
          sessionStorage.getItem("altamedica_user");
        const token =
          localStorage.getItem("altamedica_token") ||
          sessionStorage.getItem("altamedica_token");

        if (storedUser && token) {
          const user = JSON.parse(storedUser);
          setAuthState({
            user,
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
      } catch (error) {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Error verificando autenticación",
        });
      }
    };

    checkInitialAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Simular delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser: User = {
        id: "mock-user-id",
        email: credentials.email,
        firstName: "Mock",
        lastName: "User",
        role: "patient",
        patientId: "mock-patient-id",
        permissions: ["read:own_records", "write:own_appointments"],
        isActive: true,
      };

      const mockToken = "mock-jwt-token";

      // Guardar en localStorage
      if (credentials.rememberMe) {
        localStorage.setItem("altamedica_token", mockToken);
        localStorage.setItem("altamedica_user", JSON.stringify(mockUser));
      } else {
        sessionStorage.setItem("altamedica_token", mockToken);
        sessionStorage.setItem("altamedica_user", JSON.stringify(mockUser));
      }

      setAuthState({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Error en login",
      }));
      throw error;
    }
  };

  const logout = async () => {
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
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Simular delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUser: User = {
        id: "mock-user-id",
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "patient",
        patientId: "mock-patient-id",
        permissions: ["read:own_records", "write:own_appointments"],
        isActive: true,
      };

      const mockToken = "mock-jwt-token";

      localStorage.setItem("altamedica_token", mockToken);
      localStorage.setItem("altamedica_user", JSON.stringify(mockUser));

      setAuthState({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Error en registro",
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
