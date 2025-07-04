/**
 * Servicio de Autenticación para Pacientes
 * Conecta con la API del servidor para registro y login
 */

export interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'company' | 'admin';
  first_name: string;
  last_name: string;
  status: 'active' | 'suspended' | 'pending' | 'inactive';
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  last_login?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'company';
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  blood_type?: string;
  allergies?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

class AuthService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private saveToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private getAuthHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Registrar un nuevo usuario
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      const result = await this.handleResponse<AuthResponse>(response);
      
      if (result.success && result.token) {
        this.saveToken(result.token);
      }

      return result;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  /**
   * Iniciar sesión
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(credentials),
      });

      const result = await this.handleResponse<AuthResponse>(response);
      
      if (result.success && result.token) {
        this.saveToken(result.token);
      }

      return result;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.clearToken();
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Obtener el token actual
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Obtener información del usuario actual
   */
  async getCurrentUser(): Promise<User | null> {
    if (!this.token) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/me`, {
        headers: this.getAuthHeaders(),
      });

      const result = await this.handleResponse<{ user: User }>(response);
      return result.user;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      this.clearToken();
      return null;
    }
  }

  /**
   * Actualizar perfil del usuario
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      const result = await this.handleResponse<{ user: User }>(response);
      return result.user;
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/change-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      await this.handleResponse(response);
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      throw error;
    }
  }

  /**
   * Solicitar restablecimiento de contraseña
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email }),
      });

      await this.handleResponse(response);
    } catch (error) {
      console.error('Error solicitando restablecimiento:', error);
      throw error;
    }
  }

  /**
   * Restablecer contraseña con token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          token,
          new_password: newPassword,
        }),
      });

      await this.handleResponse(response);
    } catch (error) {
      console.error('Error restableciendo contraseña:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const authService = new AuthService(); 