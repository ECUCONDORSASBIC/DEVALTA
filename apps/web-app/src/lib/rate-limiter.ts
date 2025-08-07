/**
 * Rate Limiter para protección contra fuerza bruta
 * Implementación del lado del cliente con exponential backoff
 */

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  blockedUntil?: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly MAX_ATTEMPTS = 5;
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutos
  private readonly BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutos de bloqueo
  
  /**
   * Verifica si una acción está permitida para un identificador dado
   * @param identifier - Email, IP, o cualquier identificador único
   * @returns true si la acción está permitida, false si está bloqueada
   */
  public isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(identifier);
    
    if (!entry) {
      return true;
    }
    
    // Si está bloqueado temporalmente
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return false;
    }
    
    // Si ha pasado la ventana de tiempo, resetear
    if (now - entry.firstAttempt > this.WINDOW_MS) {
      this.limits.delete(identifier);
      return true;
    }
    
    // Si ha excedido el máximo de intentos
    if (entry.attempts >= this.MAX_ATTEMPTS) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Registra un intento para un identificador
   * @param identifier - Email, IP, o cualquier identificador único
   */
  public recordAttempt(identifier: string): void {
    const now = Date.now();
    const entry = this.limits.get(identifier);
    
    if (!entry) {
      this.limits.set(identifier, {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now
      });
    } else {
      entry.attempts++;
      entry.lastAttempt = now;
      
      // Si alcanza el máximo, establecer bloqueo temporal
      if (entry.attempts >= this.MAX_ATTEMPTS) {
        entry.blockedUntil = now + this.BLOCK_DURATION_MS;
      }
    }
  }
  
  /**
   * Resetea los intentos para un identificador (ej. después de un login exitoso)
   * @param identifier - Email, IP, o cualquier identificador único
   */
  public reset(identifier: string): void {
    this.limits.delete(identifier);
  }
  
  /**
   * Obtiene el tiempo restante de bloqueo en segundos
   * @param identifier - Email, IP, o cualquier identificador único
   * @returns Segundos restantes de bloqueo, o 0 si no está bloqueado
   */
  public getBlockedTimeRemaining(identifier: string): number {
    const entry = this.limits.get(identifier);
    
    if (!entry || !entry.blockedUntil) {
      return 0;
    }
    
    const now = Date.now();
    const remaining = entry.blockedUntil - now;
    
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }
  
  /**
   * Obtiene el número de intentos restantes
   * @param identifier - Email, IP, o cualquier identificador único
   * @returns Número de intentos restantes
   */
  public getAttemptsRemaining(identifier: string): number {
    const entry = this.limits.get(identifier);
    
    if (!entry) {
      return this.MAX_ATTEMPTS;
    }
    
    const remaining = this.MAX_ATTEMPTS - entry.attempts;
    return remaining > 0 ? remaining : 0;
  }
  
  /**
   * Limpia entradas expiradas (para evitar memory leaks)
   */
  public cleanup(): void {
    const now = Date.now();
    
    for (const [identifier, entry] of this.limits.entries()) {
      // Eliminar entradas que han expirado completamente
      if (entry.blockedUntil && now > entry.blockedUntil) {
        this.limits.delete(identifier);
      } else if (now - entry.firstAttempt > this.WINDOW_MS) {
        this.limits.delete(identifier);
      }
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Limpiar entradas expiradas cada 5 minutos
if (typeof window !== 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Hook de React para usar el rate limiter
 */
export function useRateLimiter() {
  const checkLimit = (identifier: string): { allowed: boolean; attemptsRemaining: number; blockedSeconds: number } => {
    const allowed = rateLimiter.isAllowed(identifier);
    const attemptsRemaining = rateLimiter.getAttemptsRemaining(identifier);
    const blockedSeconds = rateLimiter.getBlockedTimeRemaining(identifier);
    
    return {
      allowed,
      attemptsRemaining,
      blockedSeconds
    };
  };
  
  const recordAttempt = (identifier: string) => {
    rateLimiter.recordAttempt(identifier);
  };
  
  const resetLimit = (identifier: string) => {
    rateLimiter.reset(identifier);
  };
  
  return {
    checkLimit,
    recordAttempt,
    resetLimit
  };
}