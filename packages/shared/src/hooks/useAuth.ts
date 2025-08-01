import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'company' | 'admin';
  first_name: string;
  last_name: string;
  status: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  medical_license?: string;
  specialty?: string;
  years_experience?: number;
  company_name?: string;
  company_type?: string;
  tax_id?: string;
  last_login?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'company';
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  medical_license?: string;
  specialty?: string;
  years_experience?: number;
  company_name?: string;
  company_type?: string;
  tax_id?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Inicializar estado desde localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        const userRole = localStorage.getItem('userRole');

        if (token && userData && userRole) {
          const user = JSON.parse(userData);
          setAuthState({
            user,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  // Función para hacer requests autenticados
  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token expirado o inválido
      logout();
      throw new Error('Sesión expirada');
    }

    return response;
  }, []);

  // Login
  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el login');
      }

      // Guardar en localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userData', JSON.stringify(data.user));

      setAuthState({
        user: data.user,
        token: data.token,
        isLoading: false,
        isAuthenticated: true,
      });

      return data.user;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  // Registro
  const register = useCallback(async (userData: RegisterData): Promise<User> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el registro');
      }

      // Guardar en localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userData', JSON.stringify(data.user));

      setAuthState({
        user: data.user,
        token: data.token,
        isLoading: false,
        isAuthenticated: true,
      });

      return data.user;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');

    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  // Actualizar perfil
  const updateProfile = useCallback(async (profileData: Partial<User>): Promise<User> => {
    try {
      const response = await authenticatedFetch('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error actualizando perfil');
      }

      // Actualizar estado local
      const updatedUser = { ...authState.user, ...data.user };
      localStorage.setItem('userData', JSON.stringify(updatedUser));

      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }, [authState.user, authenticatedFetch]);

  // Obtener perfil actualizado
  const refreshProfile = useCallback(async (): Promise<User> => {
    try {
      const response = await authenticatedFetch('/api/users/profile');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error obteniendo perfil');
      }

      // Actualizar estado local
      localStorage.setItem('userData', JSON.stringify(data.user));

      setAuthState(prev => ({
        ...prev,
        user: data.user,
      }));

      return data.user;
    } catch (error) {
      throw error;
    }
  }, [authenticatedFetch]);

  // Verificar si el usuario tiene un rol específico
  const hasRole = useCallback((role: string | string[]): boolean => {
    if (!authState.user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(authState.user.role);
    }
    
    return authState.user.role === role;
  }, [authState.user]);

  // Obtener URL del dashboard según el rol
  const getDashboardUrl = useCallback((): string => {
    if (!authState.user) return '/';

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
    
    switch (authState.user.role) {
      case 'patient':
        return `${baseUrl.replace('3001', '3002')}/dashboard`;
      case 'doctor':
        return `${baseUrl.replace('3001', '3003')}/dashboard`;
      case 'company':
        return `${baseUrl.replace('3001', '3004')}/dashboard`;
      case 'admin':
        return `${baseUrl.replace('3001', '3006')}/dashboard`;
      default:
        return '/dashboard';
    }
  }, [authState.user]);

  return {
    // Estado
    user: authState.user,
    token: authState.token,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,

    // Funciones
    login,
    register,
    logout,
    updateProfile,
    refreshProfile,
    authenticatedFetch,
    hasRole,
    getDashboardUrl,
  };
}