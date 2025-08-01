// Auth Core Types
import { User, UserType } from '../../types/user';

// Re-export User type for convenience
export type { User, UserType };

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  phone?: string;
  companyId?: string;
  departmentId?: string;
  specialtyId?: string;
  licenseNumber?: string;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRoles?: string[];
}

export interface RoleGuardProps {
  children: React.ReactNode;
  roles: string[];
  fallback?: React.ReactNode;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (userData: RegisterData) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<User>;
  refreshProfile: () => Promise<User>;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  getDashboardUrl: () => string;
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

export interface LoadingState {
  isLoading: boolean;
  error: AuthError | null;
}

// Framework-specific types
export interface ReactAuthProviderProps extends AuthProviderProps {}
export interface AngularAuthProviderProps extends AuthProviderProps {}
export interface VueAuthProviderProps extends AuthProviderProps {}
