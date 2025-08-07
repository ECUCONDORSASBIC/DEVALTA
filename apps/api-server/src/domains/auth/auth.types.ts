export interface AuthUser {
  id: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'COMPANY';
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SSOLoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SSOLoginResponse {
  success: boolean;
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  redirectUrl?: string;
  error?: string;
}

export interface SSOTokenRequest {
  refreshToken: string;
}

export interface SSOTokenResponse {
  success: boolean;
  accessToken?: string;
  error?: string;
}

export interface AuthContext {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role?: string;
}