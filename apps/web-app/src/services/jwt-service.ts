import { JWT_CONFIG, COOKIE_CONFIG, getCookieConfig } from '@/config/auth-config';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  iat?: number;
  exp?: number;
}

/**
 * Servicio para manejar JWT de forma consistente en todas las apps
 */
export class JWTService {
  /**
   * Decodifica un token JWT (sin verificar firma)
   * Útil para el cliente
   */
  static decodeToken(token: string): TokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT inválido');
      }
      
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }
  
  /**
   * Verifica si un token ha expirado
   */
  static isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return true;
    }
    
    // exp está en segundos, Date.now() en milisegundos
    return Date.now() >= payload.exp * 1000;
  }
  
  /**
   * Obtiene el tiempo restante del token en milisegundos
   */
  static getTokenTimeLeft(token: string): number {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return 0;
    }
    
    const expirationTime = payload.exp * 1000;
    const timeLeft = expirationTime - Date.now();
    return timeLeft > 0 ? timeLeft : 0;
  }
  
  /**
   * Guarda el token en cookies
   */
  static setToken(token: string, type: 'access' | 'refresh' = 'access'): void {
    if (typeof window === 'undefined') return;
    
    const cookieConfig = getCookieConfig();
    const cookieName = type === 'access' 
      ? COOKIE_CONFIG.names.accessToken 
      : COOKIE_CONFIG.names.refreshToken;
    
    // Construir string de cookie
    let cookieString = `${cookieName}=${token}`;
    cookieString += `; path=${cookieConfig.path}`;
    cookieString += `; max-age=${cookieConfig.maxAge}`;
    cookieString += `; domain=${cookieConfig.domain}`;
    
    if (cookieConfig.secure) {
      cookieString += '; secure';
    }
    
    cookieString += `; samesite=${cookieConfig.sameSite}`;
    
    if (cookieConfig.httpOnly) {
      // Nota: httpOnly no se puede establecer desde JavaScript del cliente
      console.warn('httpOnly cookies deben ser establecidas por el servidor');
    }
    
    document.cookie = cookieString;
  }
  
  /**
   * Obtiene el token de las cookies
   */
  static getToken(type: 'access' | 'refresh' = 'access'): string | null {
    if (typeof window === 'undefined') return null;
    
    const cookieName = type === 'access' 
      ? COOKIE_CONFIG.names.accessToken 
      : COOKIE_CONFIG.names.refreshToken;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === cookieName) {
        return value;
      }
    }
    
    return null;
  }
  
  /**
   * Elimina el token de las cookies
   */
  static removeToken(type: 'access' | 'refresh' | 'all' = 'all'): void {
    if (typeof window === 'undefined') return;
    
    const cookieConfig = getCookieConfig();
    
    const removeTokenCookie = (cookieName: string) => {
      document.cookie = `${cookieName}=; path=${cookieConfig.path}; domain=${cookieConfig.domain}; max-age=0`;
    };
    
    if (type === 'all') {
      removeTokenCookie(COOKIE_CONFIG.names.accessToken);
      removeTokenCookie(COOKIE_CONFIG.names.refreshToken);
      removeTokenCookie(COOKIE_CONFIG.names.userRole);
    } else {
      const cookieName = type === 'access' 
        ? COOKIE_CONFIG.names.accessToken 
        : COOKIE_CONFIG.names.refreshToken;
      removeTokenCookie(cookieName);
    }
  }
  
  /**
   * Guarda el rol del usuario en una cookie separada
   * (útil para verificaciones rápidas sin decodificar el token)
   */
  static setUserRole(role: string): void {
    if (typeof window === 'undefined') return;
    
    const cookieConfig = getCookieConfig();
    let cookieString = `${COOKIE_CONFIG.names.userRole}=${role}`;
    cookieString += `; path=${cookieConfig.path}`;
    cookieString += `; max-age=${cookieConfig.maxAge}`;
    cookieString += `; domain=${cookieConfig.domain}`;
    
    if (cookieConfig.secure) {
      cookieString += '; secure';
    }
    
    cookieString += `; samesite=${cookieConfig.sameSite}`;
    
    document.cookie = cookieString;
  }
  
  /**
   * Obtiene el rol del usuario de la cookie
   */
  static getUserRole(): string | null {
    if (typeof window === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === COOKIE_CONFIG.names.userRole) {
        return value;
      }
    }
    
    return null;
  }
  
  /**
   * Verifica si el usuario tiene un token válido
   */
  static isAuthenticated(): boolean {
    const token = this.getToken('access');
    if (!token) return false;
    
    return !this.isTokenExpired(token);
  }
  
  /**
   * Obtiene la información del usuario del token
   */
  static getCurrentUser(): TokenPayload | null {
    const token = this.getToken('access');
    if (!token) return null;
    
    return this.decodeToken(token);
  }
  
  /**
   * Maneja el refresh del token
   */
  static async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = this.getToken('refresh');
      if (!refreshToken || this.isTokenExpired(refreshToken)) {
        return false;
      }
      
      // Llamar al endpoint de refresh
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      
      // Guardar nuevo access token
      if (data.accessToken) {
        this.setToken(data.accessToken, 'access');
        
        // Actualizar rol si viene en la respuesta
        if (data.role) {
          this.setUserRole(data.role);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }
  
  /**
   * Configura un intervalo para refrescar el token automáticamente
   */
  static setupAutoRefresh(): () => void {
    const checkAndRefresh = async () => {
      const token = this.getToken('access');
      if (!token) return;
      
      const timeLeft = this.getTokenTimeLeft(token);
      
      // Si quedan menos de 5 minutos, refrescar
      if (timeLeft < 5 * 60 * 1000 && timeLeft > 0) {
        await this.refreshAccessToken();
      }
    };
    
    // Verificar cada minuto
    const intervalId = setInterval(checkAndRefresh, 60 * 1000);
    
    // Retornar función de limpieza
    return () => clearInterval(intervalId);
  }
}

// Exportar instancia para conveniencia
export const jwtService = JWTService;