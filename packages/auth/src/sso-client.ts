/**
 * Cliente SSO para manejar autenticación entre aplicaciones
 * Solución híbrida: Cookies + localStorage + BroadcastChannel
 */

import { SingleSignOnService, initializeSSO, getSSO } from './sso-service';

interface SSOConfig {
  apiUrl: string;
  proxyUrl?: string;
  useProxy?: boolean;
}

export class SSOClient {
  private ssoService: SingleSignOnService;
  private config: SSOConfig;
  private broadcastChannel?: BroadcastChannel;
  
  constructor(config: SSOConfig) {
    this.config = config;
    this.ssoService = initializeSSO({
      apiServerUrl: config.apiUrl,
      webAppUrl: 'http://localhost:3000',
      currentAppPort: '3003',
      appName: 'patients'
    });
    
    // Inicializar BroadcastChannel para sincronización entre pestañas
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('altamedica_sso');
      this.setupBroadcastListener();
    }
  }

  /**
   * Obtener token SSO con fallback a localStorage
   */
  async getToken(): Promise<string | null> {
    // 1. Intentar obtener de cookies
    const cookieToken = this.getCookieToken();
    if (cookieToken) {
      return cookieToken;
    }

    // 2. Fallback a localStorage
    const localToken = this.getLocalStorageToken();
    if (localToken) {
      // Verificar que el token sigue siendo válido
      const isValid = await this.verifyToken(localToken);
      if (isValid) {
        return localToken;
      } else {
        // Token inválido, limpiar
        this.clearLocalStorage();
      }
    }

    // 3. Si usamos proxy, intentar verificar con el servidor proxy
    if (this.config.useProxy && this.config.proxyUrl) {
      try {
        const response = await fetch(`${this.config.proxyUrl}/sso/verify`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.valid && data.token) {
            // Guardar en localStorage para futuras peticiones
            this.saveToLocalStorage(data.token, data.user);
            return data.token;
          }
        }
      } catch (error) {
        console.error('Error verificando con proxy SSO:', error);
      }
    }

    return null;
  }

  /**
   * Login SSO - guardar token en múltiples lugares
   */
  async login(token: string, user: any): Promise<void> {
    // 1. Guardar en localStorage
    this.saveToLocalStorage(token, user);

    // 2. Si usamos proxy, establecer cookie a través del proxy
    if (this.config.useProxy && this.config.proxyUrl) {
      try {
        await fetch(`${this.config.proxyUrl}/sso/set-cookie`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ token, user })
        });
      } catch (error) {
        console.error('Error estableciendo cookie SSO en proxy:', error);
      }
    }

    // 3. Intentar establecer cookie localmente (puede fallar entre puertos)
    this.setCookieToken(token);

    // 4. Notificar a otras pestañas/apps
    this.broadcastLogin(token, user);
  }

  /**
   * Logout SSO - limpiar todo
   */
  async logout(): Promise<void> {
    // 1. Limpiar localStorage
    this.clearLocalStorage();

    // 2. Limpiar cookies
    this.clearCookies();

    // 3. Si usamos proxy, hacer logout en el proxy
    if (this.config.useProxy && this.config.proxyUrl) {
      try {
        await fetch(`${this.config.proxyUrl}/sso/logout`, {
          method: 'POST',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Error haciendo logout en proxy SSO:', error);
      }
    }

    // 4. Notificar a otras pestañas/apps
    this.broadcastLogout();
  }

  /**
   * Verificar si un token es válido
   */
  private async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/v1/auth/verify-sso`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  }

  /**
   * Obtener token de cookies
   */
  private getCookieToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'altamedica_sso_token') {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  /**
   * Establecer token en cookies
   */
  private setCookieToken(token: string): void {
    if (typeof document === 'undefined') return;
    
    // Intentar establecer cookie (puede fallar entre puertos)
    document.cookie = `altamedica_sso_token=${encodeURIComponent(token)}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
  }

  /**
   * Obtener token de localStorage
   */
  private getLocalStorageToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const ssoData = localStorage.getItem('altamedica_sso');
      if (ssoData) {
        const { token, expiresAt } = JSON.parse(ssoData);
        
        // Verificar si no ha expirado
        if (new Date(expiresAt) > new Date()) {
          return token;
        }
      }
    } catch (error) {
      console.error('Error leyendo localStorage:', error);
    }
    
    return null;
  }

  /**
   * Guardar en localStorage
   */
  private saveToLocalStorage(token: string, user: any): void {
    if (typeof window === 'undefined') return;
    
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 días
      
      localStorage.setItem('altamedica_sso', JSON.stringify({
        token,
        user,
        expiresAt: expiresAt.toISOString()
      }));
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
    }
  }

  /**
   * Limpiar localStorage
   */
  private clearLocalStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('altamedica_sso');
      localStorage.removeItem('altamedica_user');
    } catch (error) {
      console.error('Error limpiando localStorage:', error);
    }
  }

  /**
   * Limpiar cookies
   */
  private clearCookies(): void {
    if (typeof document === 'undefined') return;
    
    // Limpiar cookie con diferentes configuraciones de path/domain
    const cookieConfigs = [
      'altamedica_sso_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'altamedica_sso_token=; path=/; domain=localhost; expires=Thu, 01 Jan 1970 00:00:00 GMT',
      'altamedica_sso_token=; path=/; domain=.localhost; expires=Thu, 01 Jan 1970 00:00:00 GMT',
    ];
    
    cookieConfigs.forEach(config => {
      document.cookie = config;
    });
  }

  /**
   * Configurar listener de BroadcastChannel
   */
  private setupBroadcastListener(): void {
    if (!this.broadcastChannel) return;
    
    this.broadcastChannel.onmessage = (event) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'login':
          // Otra pestaña/app hizo login
          this.saveToLocalStorage(data.token, data.user);
          // Emitir evento para que la app se actualice
          window.dispatchEvent(new CustomEvent('sso-login', { detail: data }));
          break;
          
        case 'logout':
          // Otra pestaña/app hizo logout
          this.clearLocalStorage();
          this.clearCookies();
          // Emitir evento para que la app se actualice
          window.dispatchEvent(new CustomEvent('sso-logout'));
          break;
          
        case 'token-refresh':
          // Token fue actualizado
          this.saveToLocalStorage(data.token, data.user);
          break;
      }
    };
  }

  /**
   * Notificar login a otras pestañas/apps
   */
  private broadcastLogin(token: string, user: any): void {
    if (!this.broadcastChannel) return;
    
    this.broadcastChannel.postMessage({
      type: 'login',
      data: { token, user }
    });
  }

  /**
   * Notificar logout a otras pestañas/apps
   */
  private broadcastLogout(): void {
    if (!this.broadcastChannel) return;
    
    this.broadcastChannel.postMessage({
      type: 'logout'
    });
  }

  /**
   * Obtener usuario actual
   */
  async getCurrentUser(): Promise<any | null> {
    const token = await this.getToken();
    if (!token) return null;
    
    try {
      // Intentar obtener de localStorage primero
      const ssoData = localStorage.getItem('altamedica_sso');
      if (ssoData) {
        const { user } = JSON.parse(ssoData);
        if (user) return user;
      }
      
      // Si no está en localStorage, obtener del API
      const response = await fetch(`${this.config.apiUrl}/api/v1/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        return userData;
      }
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
    }
    
    return null;
  }
}

// Singleton para uso global
let ssoClientInstance: SSOClient | null = null;

export function initSSOClient(config: SSOConfig): SSOClient {
  if (!ssoClientInstance) {
    ssoClientInstance = new SSOClient(config);
  }
  return ssoClientInstance;
}

export function getSSOClient(): SSOClient | null {
  return ssoClientInstance;
}