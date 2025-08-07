import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Middleware para autenticación basada en cookies HttpOnly
 * Extrae tokens de cookies seguras para validación interna
 */
export class CookieAuthMiddleware {
  /**
   * Extrae el token de autenticación de las cookies HttpOnly
   */
  static getTokenFromCookies(): string | null {
    try {
      const cookieStore = cookies();
      const token = cookieStore.get('altamedica_token')?.value;
      
      return token || null;
    } catch (error) {
      console.warn('🍪 [CookieAuth] Error al leer cookies:', error);
      return null;
    }
  }

  /**
   * Extrae el refresh token de las cookies HttpOnly
   */
  static getRefreshTokenFromCookies(): string | null {
    try {
      const cookieStore = cookies();
      const refreshToken = cookieStore.get('altamedica_refresh')?.value;
      
      return refreshToken || null;
    } catch (error) {
      console.warn('🍪 [CookieAuth] Error al leer refresh token:', error);
      return null;
    }
  }

  /**
   * Extrae información del usuario de las cookies (no sensibles)
   */
  static getUserInfoFromCookies(): any | null {
    try {
      const cookieStore = cookies();
      const userInfo = cookieStore.get('altamedica_user')?.value;
      
      if (userInfo) {
        return JSON.parse(userInfo);
      }
      
      return null;
    } catch (error) {
      console.warn('🍪 [CookieAuth] Error al leer información de usuario:', error);
      return null;
    }
  }

  /**
   * Obtiene el token de autenticación desde cookies o Authorization header
   * Prioriza cookies HttpOnly para mayor seguridad
   */
  static getAuthToken(request: NextRequest): string | null {
    // 1. Intentar obtener desde cookies HttpOnly (más seguro)
    const cookieToken = this.getTokenFromCookies();
    if (cookieToken) {
      console.log('🍪 [CookieAuth] Token obtenido desde cookies HttpOnly');
      return cookieToken;
    }

    // 2. Fallback a Authorization header (compatibilidad)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const headerToken = authHeader.substring(7);
      console.log('🔑 [CookieAuth] Token obtenido desde Authorization header');
      return headerToken;
    }

    console.log('❌ [CookieAuth] No se encontró token válido');
    return null;
  }

  /**
   * Valida si hay una sesión válida (token + usuario)
   */
  static hasValidSession(): boolean {
    const token = this.getTokenFromCookies();
    const userInfo = this.getUserInfoFromCookies();
    
    return !!(token && userInfo && userInfo.uid);
  }

  /**
   * Obtiene información completa de autenticación
   */
  static getAuthInfo(request: NextRequest) {
    return {
      token: this.getAuthToken(request),
      refreshToken: this.getRefreshTokenFromCookies(),
      userInfo: this.getUserInfoFromCookies(),
      hasValidSession: this.hasValidSession(),
      source: this.getTokenFromCookies() ? 'cookies' : 'header'
    };
  }
}

/**
 * Helper para logging de auditoría de cookies
 */
export function logCookieAuth(request: NextRequest, action: string) {
  const authInfo = CookieAuthMiddleware.getAuthInfo(request);
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  console.log(`🍪 [CookieAuth] ${action}:`, {
    hasToken: !!authInfo.token,
    hasRefreshToken: !!authInfo.refreshToken,
    hasUserInfo: !!authInfo.userInfo,
    hasValidSession: authInfo.hasValidSession,
    tokenSource: authInfo.source,
    userUid: authInfo.userInfo?.uid || 'none',
    userRole: authInfo.userInfo?.role || 'none',
    ip,
    timestamp: new Date().toISOString()
  });
}

export default CookieAuthMiddleware;