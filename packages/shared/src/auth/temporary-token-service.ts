/**
 * temporary-token-service.ts
 * Servicio de tokens temporales para autenticación cross-app
 * Implementación conservadora con máxima seguridad
 * 
 * Análisis de seguridad:
 * - Tokens de un solo uso
 * - Expiración corta (5 minutos)
 * - Validación en servidor
 * - Cifrado de datos sensibles
 */

import crypto from 'crypto';

// Configuración robusta con valores seguros por defecto
interface TemporaryTokenConfig {
  secretKey: string;
  expirationMinutes?: number;
  algorithm?: string;
  encoding?: BufferEncoding;
}

// Estructura del token temporal
interface TemporaryToken {
  id: string;
  userId: string;
  email: string;
  role: string;
  originalToken: string; // Token JWT original
  createdAt: string;
  expiresAt: string;
  used: boolean;
  metadata: {
    sourceApp: string;
    targetApp: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

/**
 * Servicio conservador para generar tokens temporales seguros
 * Diseñado para minimizar riesgos de seguridad
 */
export class TemporaryTokenService {
  private config: Required<TemporaryTokenConfig>;
  private tokenStore: Map<string, TemporaryToken> = new Map();
  
  constructor(config: TemporaryTokenConfig) {
    // Validación exhaustiva de configuración
    if (!config.secretKey || config.secretKey.length < 32) {
      throw new Error('Secret key debe tener al menos 32 caracteres por seguridad');
    }
    
    // Configuración con valores seguros por defecto
    this.config = {
      secretKey: config.secretKey,
      expirationMinutes: config.expirationMinutes || 5, // 5 minutos por defecto
      algorithm: config.algorithm || 'aes-256-gcm',
      encoding: config.encoding || 'base64url'
    };
    
    // Limpieza automática de tokens expirados cada minuto
    this.startCleanupInterval();
  }

  /**
   * Genera un token temporal seguro
   * Análisis: Este método crea un token único que solo puede usarse una vez
   */
  async generateTemporaryToken(
    userData: {
      userId: string;
      email: string;
      role: string;
      originalToken: string;
    },
    metadata: {
      sourceApp: string;
      targetApp: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<string> {
    try {
      // Validación de entrada
      this.validateUserData(userData);
      this.validateMetadata(metadata);
      
      // Generar ID único criptográficamente seguro
      const tokenId = crypto.randomBytes(32).toString('hex');
      
      // Crear estructura del token
      const temporaryToken: TemporaryToken = {
        id: tokenId,
        userId: userData.userId,
        email: userData.email,
        role: userData.role,
        originalToken: userData.originalToken,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + this.config.expirationMinutes * 60000).toISOString(),
        used: false,
        metadata
      };
      
      // Almacenar en memoria (en producción usar Redis)
      this.tokenStore.set(tokenId, temporaryToken);
      
      // Cifrar el token para transmisión
      const encryptedToken = await this.encryptToken(tokenId);
      
      // Log de auditoría
      console.log(`[AUDIT] Token temporal creado: ${tokenId.substring(0, 8)}... para usuario ${userData.email}`);
      
      return encryptedToken;
      
    } catch (error) {
      console.error('[ERROR] Error generando token temporal:', error);
      throw new Error('No se pudo generar token temporal seguro');
    }
  }

  /**
   * Valida y consume un token temporal
   * Análisis: Token solo puede usarse una vez (mayor seguridad)
   */
  async validateAndConsumeToken(encryptedToken: string): Promise<TemporaryToken | null> {
    try {
      // Descifrar token
      const tokenId = await this.decryptToken(encryptedToken);
      
      // Buscar en store
      const token = this.tokenStore.get(tokenId);
      
      // Validaciones exhaustivas
      if (!token) {
        console.warn(`[SECURITY] Intento de usar token inexistente: ${tokenId.substring(0, 8)}...`);
        return null;
      }
      
      if (token.used) {
        console.warn(`[SECURITY] Intento de reusar token: ${tokenId.substring(0, 8)}...`);
        return null;
      }
      
      if (new Date(token.expiresAt) < new Date()) {
        console.warn(`[SECURITY] Intento de usar token expirado: ${tokenId.substring(0, 8)}...`);
        return null;
      }
      
      // Marcar como usado (un solo uso)
      token.used = true;
      this.tokenStore.set(tokenId, token);
      
      // Log de auditoría
      console.log(`[AUDIT] Token temporal consumido: ${tokenId.substring(0, 8)}... por usuario ${token.email}`);
      
      // Eliminar después de uso (seguridad adicional)
      setTimeout(() => {
        this.tokenStore.delete(tokenId);
      }, 1000);
      
      return token;
      
    } catch (error) {
      console.error('[ERROR] Error validando token:', error);
      return null;
    }
  }

  /**
   * Cifrado seguro del token
   * Análisis: Usa AES-256-GCM para máxima seguridad
   */
  private async encryptToken(tokenId: string): Promise<string> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      this.config.algorithm,
      Buffer.from(this.config.secretKey, 'hex'),
      iv
    );
    
    let encrypted = cipher.update(tokenId, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Obtener tag de autenticación
    const authTag = (cipher as any).getAuthTag();
    
    // Combinar iv + authTag + encrypted
    const combined = Buffer.concat([iv, authTag, encrypted]);
    
    return combined.toString(this.config.encoding);
  }

  /**
   * Descifrado seguro del token
   */
  private async decryptToken(encryptedToken: string): Promise<string> {
    const combined = Buffer.from(encryptedToken, this.config.encoding);
    
    // Extraer componentes
    const iv = combined.slice(0, 16);
    const authTag = combined.slice(16, 32);
    const encrypted = combined.slice(32);
    
    const decipher = crypto.createDecipheriv(
      this.config.algorithm,
      Buffer.from(this.config.secretKey, 'hex'),
      iv
    );
    
    (decipher as any).setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  }

  /**
   * Validaciones robustas de datos
   */
  private validateUserData(userData: any): void {
    if (!userData.userId || !userData.email || !userData.role || !userData.originalToken) {
      throw new Error('Datos de usuario incompletos');
    }
    
    // Validar formato email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Email inválido');
    }
    
    // Validar roles permitidos
    const allowedRoles = ['patient', 'doctor', 'admin', 'company'];
    if (!allowedRoles.includes(userData.role)) {
      throw new Error('Rol no permitido');
    }
  }

  private validateMetadata(metadata: any): void {
    if (!metadata.sourceApp || !metadata.targetApp) {
      throw new Error('Metadata de aplicaciones requerida');
    }
    
    // Validar nombres de apps
    const allowedApps = ['web-app', 'patients', 'doctors', 'companies'];
    if (!allowedApps.includes(metadata.sourceApp) || !allowedApps.includes(metadata.targetApp)) {
      throw new Error('Aplicación no reconocida');
    }
  }

  /**
   * Limpieza automática de tokens expirados
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = new Date();
      let cleaned = 0;
      
      for (const [tokenId, token] of this.tokenStore.entries()) {
        if (new Date(token.expiresAt) < now || token.used) {
          this.tokenStore.delete(tokenId);
          cleaned++;
        }
      }
      
      if (cleaned > 0) {
        console.log(`[CLEANUP] ${cleaned} tokens temporales eliminados`);
      }
    }, 60000); // Cada minuto
  }

  /**
   * Métodos de utilidad para monitoreo
   */
  getActiveTokensCount(): number {
    return this.tokenStore.size;
  }

  getTokenStats(): {
    total: number;
    used: number;
    expired: number;
    active: number;
  } {
    const now = new Date();
    let used = 0;
    let expired = 0;
    let active = 0;
    
    for (const token of this.tokenStore.values()) {
      if (token.used) used++;
      else if (new Date(token.expiresAt) < now) expired++;
      else active++;
    }
    
    return {
      total: this.tokenStore.size,
      used,
      expired,
      active
    };
  }
}

// Exportar instancia singleton con configuración segura
let serviceInstance: TemporaryTokenService | null = null;

export function getTemporaryTokenService(config?: TemporaryTokenConfig): TemporaryTokenService {
  if (!serviceInstance) {
    if (!config) {
      throw new Error('Configuración requerida para primera inicialización');
    }
    serviceInstance = new TemporaryTokenService(config);
  }
  return serviceInstance;
}