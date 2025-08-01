// AuthService - Handles authentication logic
import { API_BASE_URL } from '../constants/auth.constants';
import { LoginCredentials, RegisterData, AuthState } from '../types/auth.types';
import { User } from '../../types/user';

class AuthService {
  private authState: AuthState;

  constructor() {
    this.authState = {
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    };
  }

  public async login(credentials: LoginCredentials) {
    this.authState.isLoading = true;
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
        throw new Error(data.error || 'Login error');
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userType', data.user.userType);
      localStorage.setItem('userData', JSON.stringify(data.user));

      this.authState = {
        user: data.user,
        token: data.token,
        isLoading: false,
        isAuthenticated: true,
      };
    } catch (error) {
      this.authState.isLoading = false;
      throw error;
    }
  }

  public async register(userData: RegisterData) {
    this.authState.isLoading = true;
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
        throw new Error(data.error || 'Registration error');
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userType', data.user.userType);
      localStorage.setItem('userData', JSON.stringify(data.user));

      this.authState = {
        user: data.user,
        token: data.token,
        isLoading: false,
        isAuthenticated: true,
      };
    } catch (error) {
      this.authState.isLoading = false;
      throw error;
    }
  }

  public async logout() {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authState.token}`,
        },
      });
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('userData');
      
      this.authState = {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    }
  }

  public async refresh() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authState.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Token refresh failed');
      }

      localStorage.setItem('authToken', data.token);
      this.authState.token = data.token;
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  public getAuthState(): AuthState {
    return { ...this.authState };
  }

  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated && !!this.authState.token;
  }

  public getToken(): string | null {
    return this.authState.token;
  }

  public getUser(): User | null {
    return this.authState.user;
  }
}

export default AuthService;
