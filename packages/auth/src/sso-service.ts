/**
 * Servicio SSO (Single Sign-On) para AltaMedica
 * Maneja la autenticación centralizada entre todas las aplicaciones
 */

import { 
  getAuth, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signInWithCustomToken,
  Auth
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, Firestore } from 'firebase/firestore';

interface SSOConfig {
  apiServerUrl: string;
  webAppUrl: string;
  currentAppPort: string;
  appName: string;
}

interface SSOUser {
  uid: string;
  email: string;
  role: 'patient' | 'doctor' | 'company' | 'admin' | 'empresa';
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  metadata: {
    lastLoginAt: string;
    createdAt: string;
  };
}

interface SSOToken {
  token: string;
  expiresAt: number;
  refreshToken: string;
  user: SSOUser;
}

class SingleSignOnService {
  private config: SSOConfig;
  private auth: Auth | null = null;
  private db: Firestore | null = null;
  private tokenKey = 'altamedica_sso_token';
  private userKey = 'altamedica_sso_user';
  private roleRedirectMap: Record<string, string> = {
    patient: 'http://localhost:3003',
    doctor: 'http://localhost:3002',
    company: 'http://localhost:3004',
    empresa: 'http://localhost:3004', // Alias para company
    admin: 'http://localhost:3005'
  };

  constructor(config: SSOConfig) {
    this.config = config;
    
    // Inicializar Firebase solo si estamos en el cliente
    if (typeof window !== 'undefined') {
      this.initializeFirebase();
    }
  }

  private initializeFirebase() {
    try {
      this.auth = getAuth();
      this.db = getFirestore();
    } catch (error) {
      console.error('[SSO] Error inicializando Firebase:', error);
    }
  }

  /**
   * Verifica si hay una sesión SSO activa
   */
  async checkSSOSession(): Promise<SSOUser | null> {
    console.log('[SSO] Verificando sesión SSO...');
    
    // 1. Verificar token local
    const localToken = this.getLocalToken();
    if (localToken && !this.isTokenExpired(localToken)) {
      console.log('[SSO] Token local válido encontrado');
      return localToken.user;
    }

    // 2. Verificar con el servidor API (usando el nuevo endpoint SSO)
    try {
      const response = await fetch(`${this.config.apiServerUrl}/api/v1/auth/sso`, {
        method: 'GET',
        credentials: 'include', // Importante para cookies
        headers: {
          'Content-Type': 'application/json',
          ...(localToken ? { 'Authorization': `Bearer ${localToken.token}` } : {})
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[SSO] Sesión SSO válida en servidor');
        
        // Si viene con datos completos, guardar token localmente
        if (data.data?.token) {
          this.saveToken({
            token: data.data.token,
            refreshToken: data.data.refreshToken || '',
            expiresAt: data.data.expiresAt || Date.now() + 3600000,
            user: data.data.user
          });
        }
        
        // Autenticar en Firebase si es necesario
        if (this.auth && !this.auth.currentUser && data.data?.customToken) {
          await signInWithCustomToken(this.auth, data.data.customToken);
        }
        
        return data.data?.user || null;
      }
    } catch (error) {
      console.error('[SSO] Error verificando sesión:', error);
    }

    return null;
  }

  /**
   * Inicia sesión SSO
   */
  async signIn(email: string, password: string): Promise<SSOUser> {
    console.log('[SSO] Iniciando sesión SSO...');
    
    try {
      // 1. Autenticar con el nuevo endpoint SSO
      const response = await fetch(`${this.config.apiServerUrl}/api/v1/auth/sso`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || error.message || 'Error de autenticación');
      }

      const result = await response.json();
      const data = result.data || result;
      console.log('[SSO] Login exitoso, usuario:', data.user);

      // 2. Guardar token y datos del usuario
      const tokenData: SSOToken = {
        token: data.token,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        user: data.user
      };
      this.saveToken(tokenData);

      // 3. Autenticar en Firebase con custom token
      if (this.auth && data.customToken) {
        await signInWithCustomToken(this.auth, data.customToken);
      }

      // 4. Sincronizar sesión con otras apps
      await this.syncSessionAcrossApps(tokenData);

      return data.user;
    } catch (error) {
      console.error('[SSO] Error en login:', error);
      throw error;
    }
  }

  /**
   * Cierra sesión SSO en todas las apps
   */
  async signOut(): Promise<void> {
    console.log('[SSO] Cerrando sesión SSO...');
    
    try {
      // 1. Cerrar sesión en el servidor SSO
      await fetch(`${this.config.apiServerUrl}/api/v1/auth/sso?action=logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // 2. Cerrar sesión en Firebase
      if (this.auth) {
        await this.auth.signOut();
      }

      // 3. Limpiar almacenamiento local
      this.clearLocalStorage();

      // 4. Notificar a otras apps
      this.broadcastLogout();

      // 5. Redirigir al login
      window.location.href = `${this.config.webAppUrl}/login`;
    } catch (error) {
      console.error('[SSO] Error en logout:', error);
    }
  }

  /**
   * Obtiene la URL de redirección según el rol del usuario
   */
  getRedirectUrl(user: SSOUser, requestedUrl?: string): string {
    console.log('[SSO] Determinando URL de redirección para rol:', user.role);
    
    // Si hay una URL solicitada específica, validarla
    if (requestedUrl) {
      try {
        const url = new URL(requestedUrl);
        const allowedPorts = ['3000', '3001', '3002', '3003', '3004', '3005'];
        
        if (url.hostname === 'localhost' && allowedPorts.includes(url.port)) {
          // Verificar que el usuario tenga acceso a esa app
          const targetPort = url.port;
          const allowedRole = this.getRequiredRoleForPort(targetPort);
          
          if (this.userHasAccess(user.role, allowedRole)) {
            console.log('[SSO] Redirigiendo a URL solicitada:', requestedUrl);
            return requestedUrl;
          }
        }
      } catch (error) {
        console.error('[SSO] URL solicitada inválida:', requestedUrl);
      }
    }
    
    // Redirección por defecto según el rol
    const redirectUrl = this.roleRedirectMap[user.role] || this.config.webAppUrl;
    console.log('[SSO] Redirigiendo a URL por rol:', redirectUrl);
    return redirectUrl;
  }

  /**
   * Sincroniza la sesión con todas las apps
   */
  private async syncSessionAcrossApps(tokenData: SSOToken): Promise<void> {
    console.log('[SSO] Sincronizando sesión con otras apps...');
    
    // Usar BroadcastChannel para sincronizar entre pestañas/ventanas
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('altamedica_sso');
      channel.postMessage({
        type: 'sso_login',
        data: tokenData
      });
      channel.close();
    }

    // También usar localStorage events para navegadores que no soportan BroadcastChannel
    window.localStorage.setItem('sso_sync', JSON.stringify({
      type: 'login',
      timestamp: Date.now(),
      user: tokenData.user
    }));
  }

  /**
   * Escucha cambios de sesión SSO
   */
  onSessionChange(callback: (user: SSOUser | null) => void): () => void {
    const listeners: Array<() => void> = [];

    // 1. Escuchar cambios de Firebase Auth
    if (this.auth) {
      const unsubscribe = onAuthStateChanged(this.auth, async (firebaseUser) => {
        if (firebaseUser) {
          const ssoUser = await this.getUserFromFirebase(firebaseUser);
          callback(ssoUser);
        } else {
          callback(null);
        }
      });
      listeners.push(unsubscribe);
    }

    // 2. Escuchar BroadcastChannel
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('altamedica_sso');
      const handler = (event: MessageEvent) => {
        if (event.data.type === 'sso_login') {
          this.saveToken(event.data.data);
          callback(event.data.data.user);
        } else if (event.data.type === 'sso_logout') {
          this.clearLocalStorage();
          callback(null);
        }
      };
      channel.addEventListener('message', handler);
      listeners.push(() => {
        channel.removeEventListener('message', handler);
        channel.close();
      });
    }

    // 3. Escuchar cambios en localStorage
    const storageHandler = (event: StorageEvent) => {
      if (event.key === 'sso_sync' && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          if (data.type === 'login') {
            callback(data.user);
          } else if (data.type === 'logout') {
            callback(null);
          }
        } catch (error) {
          console.error('[SSO] Error procesando evento storage:', error);
        }
      }
    };
    window.addEventListener('storage', storageHandler);
    listeners.push(() => window.removeEventListener('storage', storageHandler));

    // Cleanup function
    return () => {
      listeners.forEach(cleanup => cleanup());
    };
  }

  /**
   * Verifica si el usuario actual tiene acceso a la app actual
   */
  async verifyAccess(): Promise<boolean> {
    const user = await this.checkSSOSession();
    if (!user) return false;

    const requiredRole = this.getRequiredRoleForCurrentApp();
    return this.userHasAccess(user.role, requiredRole);
  }

  /**
   * Helpers privados
   */
  
  private getLocalToken(): SSOToken | null {
    try {
      const tokenStr = localStorage.getItem(this.tokenKey);
      return tokenStr ? JSON.parse(tokenStr) : null;
    } catch {
      return null;
    }
  }

  private saveToken(tokenData: SSOToken): void {
    localStorage.setItem(this.tokenKey, JSON.stringify(tokenData));
    localStorage.setItem(this.userKey, JSON.stringify(tokenData.user));
  }

  private clearLocalStorage(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('sso_sync');
  }

  private isTokenExpired(token: SSOToken): boolean {
    return Date.now() > token.expiresAt;
  }

  private broadcastLogout(): void {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('altamedica_sso');
      channel.postMessage({ type: 'sso_logout' });
      channel.close();
    }

    window.localStorage.setItem('sso_sync', JSON.stringify({
      type: 'logout',
      timestamp: Date.now()
    }));
  }

  private async getUserFromFirebase(firebaseUser: FirebaseUser): Promise<SSOUser | null> {
    if (!this.db) return null;

    try {
      const userDoc = await getDoc(doc(this.db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) return null;

      const userData = userDoc.data();
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        role: userData.role || 'patient',
        displayName: userData.displayName || firebaseUser.displayName,
        photoURL: userData.photoURL || firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        metadata: {
          lastLoginAt: firebaseUser.metadata.lastSignInTime || '',
          createdAt: firebaseUser.metadata.creationTime || ''
        }
      };
    } catch (error) {
      console.error('[SSO] Error obteniendo usuario de Firebase:', error);
      return null;
    }
  }

  private getRequiredRoleForPort(port: string): string | null {
    const portRoleMap: Record<string, string> = {
      '3003': 'patient',
      '3002': 'doctor',
      '3004': 'company',
      '3005': 'admin'
    };
    return portRoleMap[port] || null;
  }

  private getRequiredRoleForCurrentApp(): string | null {
    return this.getRequiredRoleForPort(this.config.currentAppPort);
  }

  private userHasAccess(userRole: string, requiredRole: string | null): boolean {
    if (!requiredRole) return true; // App pública
    
    // Admin tiene acceso a todo
    if (userRole === 'admin') return true;
    
    // Verificar rol específico
    if (userRole === requiredRole) return true;
    
    // Manejar alias
    if (userRole === 'empresa' && requiredRole === 'company') return true;
    
    return false;
  }

  /**
   * Actualiza el token de autenticación
   */
  async refreshToken(): Promise<void> {
    console.log('[SSO] Refrescando token...');
    
    try {
      const localToken = this.getLocalToken();
      if (!localToken || !localToken.refreshToken) {
        throw new Error('No hay refresh token disponible');
      }

      const response = await fetch(`${this.config.apiServerUrl}/api/v1/auth/sso?action=refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: localToken.refreshToken })
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        
        const tokenData: SSOToken = {
          token: data.token,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt,
          user: data.user
        };
        
        this.saveToken(tokenData);
        
        // Re-autenticar en Firebase si hay custom token
        if (this.auth && data.customToken) {
          await signInWithCustomToken(this.auth, data.customToken);
        }
        
        console.log('[SSO] Token refrescado exitosamente');
      } else {
        // Token expirado, redirigir al login
        await this.signOut();
      }
    } catch (error) {
      console.error('[SSO] Error refrescando token:', error);
      await this.signOut();
    }
  }
}

// Singleton para uso global
let ssoInstance: SingleSignOnService | null = null;

export function initializeSSO(config: SSOConfig): SingleSignOnService {
  if (!ssoInstance) {
    ssoInstance = new SingleSignOnService(config);
  }
  return ssoInstance;
}

export function getSSO(): SingleSignOnService {
  if (!ssoInstance) {
    throw new Error('SSO no inicializado. Llama a initializeSSO primero.');
  }
  return ssoInstance;
}

export { SingleSignOnService, type SSOConfig, type SSOUser, type SSOToken };