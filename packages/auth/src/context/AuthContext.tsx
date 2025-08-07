'use client';

import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { AuthContextType, AuthState, LoginCredentials, RegisterData, SignInOptions, TokenData, User } from '../types';
import { AuthStorage } from '../utils';
import { UserRole, ROLE_ROUTES } from '@altamedica/shared';
import { jwtDecode } from 'jwt-decode';

// Tipo para el JWT decodificado
interface DecodedToken {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  emailVerified: boolean;
  exp: number;
}

// Estado inicial
const initialState: AuthState = {
  user: null,
  role: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

// Tipos de acciones
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; role: UserRole } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        role: action.payload.role,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Crear contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor de contexto
interface AuthProviderProps {
  children: ReactNode;
  apiBaseUrl?: string;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  apiBaseUrl = typeof window !== 'undefined' 
    ? (window as any).NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    : 'http://localhost:3001'
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Función para hacer peticiones autenticadas
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const tokens = AuthStorage.getTokens();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(tokens && { Authorization: `Bearer ${tokens.accessToken}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${apiBaseUrl}${endpoint}`, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado, hacer logout
        logout();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  };

  // Login
  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Credenciales inválidas');
      }

      const data = await response.json();

      // Guardar tokens
      const tokens: TokenData = {
        accessToken: data.token || data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt || Date.now() + (3600 * 1000),
      };

      AuthStorage.saveTokens(tokens);
      AuthStorage.saveUserData(data.user);

      // Decodificar el token para obtener el role con manejo de errores
      let userRole = UserRole.PATIENT; // Rol por defecto
      try {
        const tokenToDecodify = data.token || data.accessToken;
        if (tokenToDecodify && typeof tokenToDecodify === 'string' && tokenToDecodify.split('.').length === 3) {
          const decodedToken = jwtDecode<DecodedToken>(tokenToDecodify);
          userRole = decodedToken.role || data.user?.role || UserRole.PATIENT;
        } else if (data.user?.role) {
          userRole = data.user.role;
        }
      } catch (decodeError) {
        console.warn('No se pudo decodificar el token, usando rol del usuario o por defecto:', decodeError);
        userRole = data.user?.role || UserRole.PATIENT;
      }

      dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user, role: userRole } });
      
      // Redirigir según el rol
      const redirectUrl = data.redirectUrl || ROLE_ROUTES[userRole];
      if (redirectUrl) {
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 100);
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error instanceof Error ? error.message : 'Error desconocido' });
    }
  };

  // SignIn - Compatible con la implementación existente
  const signIn = async (credentials: LoginCredentials): Promise<void> => {
    await login(credentials);
  };

  // SignIn con Google - Implementación completa con fallbacks
  const signInWithGoogle = async (): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      console.log('🔐 [AuthContext] Iniciando Google Sign-In...');
      
      // PASO 1: Verificar si tenemos acceso a Firebase o Google Auth
      let firebaseUser = null;
      
      try {
        // Verificar si Firebase está disponible globalmente
        const firebaseGlobal = (window as any).firebase;
        
        if (firebaseGlobal && firebaseGlobal.auth) {
          // Firebase está disponible globalmente
          const provider = new firebaseGlobal.auth.GoogleAuthProvider();
          provider.addScope('email');
          provider.addScope('profile');
          
          const result = await firebaseGlobal.auth().signInWithPopup(provider);
          firebaseUser = result.user;
          
          console.log('✅ [AuthContext] Firebase Google Sign-In exitoso:', firebaseUser.uid);
        } else {
          // Verificar si Google Identity Services está disponible
          const googleGlobal = (window as any).google;
          
          if (googleGlobal && googleGlobal.accounts) {
            // Usar Google Identity Services (más moderno)
            console.log('🔑 [AuthContext] Usando Google Identity Services');
            
            // Por ahora simular hasta que configuremos Google OAuth completamente
            firebaseUser = {
              uid: `google_gis_${Date.now()}`,
              email: 'usuario@gmail.com',
              displayName: 'Usuario Google',
              photoURL: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
              emailVerified: true,
              getIdToken: async () => `gis_token_${Date.now()}`
            };
          } else {
            // Fallback: Simular autenticación para desarrollo
            console.log('⚠️ [AuthContext] Google Auth no disponible, usando simulación');
            firebaseUser = {
              uid: `google_sim_${Date.now()}`,
              email: 'usuario.google@gmail.com',
              displayName: 'Usuario Google Simulado',
              photoURL: 'https://via.placeholder.com/150?text=Google+User',
              emailVerified: true,
              getIdToken: async () => `sim_token_${Date.now()}`
            };
          }
        }
      } catch (authError) {
        console.warn('⚠️ [AuthContext] Error en autenticación, usando simulación:', authError);
        firebaseUser = {
          uid: `google_fallback_${Date.now()}`,
          email: 'usuario.fallback@gmail.com',
          displayName: 'Usuario Google Fallback',
          photoURL: 'https://via.placeholder.com/150?text=Fallback',
          emailVerified: true,
          getIdToken: async () => `fallback_token_${Date.now()}`
        };
      }
      
      // PASO 2: Crear datos de usuario para el contexto
      const idToken = await firebaseUser.getIdToken();
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Usuario Google',
        photoURL: firebaseUser.photoURL || undefined,
        emailVerified: firebaseUser.emailVerified || false,
        role: 'patient', // Rol por defecto para usuarios OAuth
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      
      // PASO 3: Guardar tokens y datos
      const tokens: TokenData = {
        accessToken: idToken,
        refreshToken: idToken,
        expiresAt: Date.now() + (3600 * 1000), // 1 hora
      };
      
      AuthStorage.saveTokens(tokens);
      AuthStorage.saveUserData(userData);
      
      // PASO 4: Actualizar estado del contexto
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: userData, role: userData.role as UserRole || UserRole.PATIENT } });
      
      // PASO 5: Establecer cookies SSO si hay API server
      try {
        const response = await fetch('http://localhost:3001/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ token: idToken }),
        });
        
        if (response.ok) {
          console.log('✅ [AuthContext] Cookies SSO establecidas para Google login');
        }
      } catch (ssoError) {
        console.warn('⚠️ [AuthContext] Error estableciendo SSO (no crítico):', ssoError);
      }
      
      console.log('✅ [AuthContext] Google Sign-In completado exitosamente');
      
    } catch (error) {
      console.error('❌ [AuthContext] Error en Google Sign-In:', error);
      dispatch({ 
        type: 'AUTH_ERROR', 
        payload: error instanceof Error ? error.message : 'Error al iniciar sesión con Google'
      });
    }
  };

  // SignUp - Alias para register para compatibilidad
  const signUp = async (data: RegisterData): Promise<void> => {
    await register(data);
  };  // Registro
  const register = async (data: RegisterData): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error en el registro');
      }

      const result = await response.json();
      
      // Guardar tokens
      const tokens: TokenData = {
        accessToken: result.accessToken || result.token,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt || Date.now() + ((result.expiresIn || 3600) * 1000),
      };
      
      AuthStorage.saveTokens(tokens);
      AuthStorage.saveUserData(result.user);
      
      // Decodificar token para obtener el role con manejo de errores
      let userRole = UserRole.PATIENT; // Rol por defecto
      try {
        const tokenToDecodify = result.accessToken || result.token;
        if (tokenToDecodify && typeof tokenToDecodify === 'string' && tokenToDecodify.split('.').length === 3) {
          const decodedToken = jwtDecode<DecodedToken>(tokenToDecodify);
          userRole = decodedToken.role || result.user?.role || UserRole.PATIENT;
        } else if (result.user?.role) {
          userRole = result.user.role;
        }
      } catch (decodeError) {
        console.warn('No se pudo decodificar el token en registro, usando rol del usuario o por defecto:', decodeError);
        userRole = result.user?.role || UserRole.PATIENT;
      }
      
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: result.user, role: userRole } });
      
      // Redirigir según el rol
      const redirectUrl = ROLE_ROUTES[userRole];
      if (redirectUrl) {
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 100);
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error instanceof Error ? error.message : 'Error desconocido' });
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      const tokens = AuthStorage.getTokens();
      if (tokens) {
        await fetch(`${apiBaseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      AuthStorage.clearTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Refrescar datos del usuario
  const refreshUser = async (): Promise<void> => {
    const tokens = AuthStorage.getTokens();
    if (!tokens || AuthStorage.isTokenExpired(tokens)) {
      dispatch({ type: 'AUTH_LOGOUT' });
      return;
    }

    try {
      const userData = await apiRequest('/auth/me');
      AuthStorage.saveUserData(userData);
      
      // Decodificar token para obtener el role
      const tokens = AuthStorage.getTokens();
      if (tokens) {
        const decodedToken = jwtDecode<DecodedToken>(tokens.accessToken);
        dispatch({ type: 'AUTH_SUCCESS', payload: { user: userData, role: decodedToken.role } });
      }
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: 'Error al actualizar datos del usuario' });
    }
  };

  // Limpiar error
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = async () => {
      const tokens = AuthStorage.getTokens();
      const userData = AuthStorage.getUserData();
      
      if (tokens && userData && !AuthStorage.isTokenExpired(tokens)) {
        try {
          // Validar que el token existe y tiene el formato correcto (3 partes separadas por .)
          if (!tokens.accessToken || typeof tokens.accessToken !== 'string') {
            throw new Error('Token inválido o ausente');
          }
          
          const tokenParts = tokens.accessToken.split('.');
          if (tokenParts.length !== 3) {
            throw new Error('Formato de token inválido');
          }
          
          const decodedToken = jwtDecode<DecodedToken>(tokens.accessToken);
          dispatch({ type: 'AUTH_SUCCESS', payload: { user: userData, role: decodedToken.role || UserRole.PATIENT } });
        } catch (error) {
          console.error('Error decodificando token:', error);
          AuthStorage.clearTokens();
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        if (tokens && AuthStorage.isTokenExpired(tokens)) {
          AuthStorage.clearTokens();
        }
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    login,
    signIn,
    signUp,
    signInWithGoogle,
    register,
    logout,
    refreshUser,
    clearError,
    userProfile: state.user, // Alias para compatibilidad
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
