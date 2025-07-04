/**
 * Servicio de cifrado compatible con SSR
 * Solución para el error: window is not defined
 */

export class EncryptionService {
  private encryptionKey: CryptoKey | null = null;
  private isInitialized = false;
  private isClient = false;

  constructor() {
    // Verificar si estamos en el cliente
    this.isClient = typeof window !== 'undefined';
    
    // Solo inicializar en el cliente
    if (this.isClient) {
      this.initializeEncryption().catch(error => {
        console.error('Error en inicialización de cifrado:', error);
      });
    }
  }

  /**
   * Verificar si el servicio está disponible
   */
  private isAvailable(): boolean {
    return this.isClient && typeof window !== 'undefined' && !!window.crypto && !!window.crypto.subtle;
  }

  /**
   * Inicializar el cifrado solo en el cliente
   */
  private async initializeEncryption(): Promise<void> {
    if (!this.isAvailable()) {
      console.warn('Encryption service no disponible en SSR');
      return;
    }

    try {
      // Verificar soporte de Web Crypto API
      if (!window.crypto?.subtle) {
        console.warn('Web Crypto API no soportada');
        return;
      }

      // Generar clave de cifrado
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(this.getEncryptionPassword()),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      this.encryptionKey = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: new TextEncoder().encode('altamedica-salt'),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      this.isInitialized = true;
      console.info('Servicio de cifrado inicializado correctamente');
    } catch (error) {
      console.error('Error inicializando cifrado:', error);
      // No lanzar error, simplemente marcar como no disponible
      this.isInitialized = false;
    }
  }

  /**
   * Obtener contraseña de cifrado
   */
  private getEncryptionPassword(): string {
    if (this.isClient) {
      return process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'altamedica-default-key-2024';
    }
    return 'server-fallback-key';
  }

  /**
   * Cifrar datos
   */
  async encrypt(data: string): Promise<string> {
    // Fallback para SSR
    if (!this.isAvailable() || !this.isInitialized) {
      console.warn('Encryption no disponible, retornando datos sin cifrar');
      return data;
    }

    try {
      if (!this.encryptionKey) {
        await this.initializeEncryption();
      }

      if (!this.encryptionKey) {
        throw new Error('Clave de cifrado no disponible');
      }

      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        this.encryptionKey,
        dataBuffer
      );

      // Combinar IV y datos cifrados
      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedBuffer), iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Error en cifrado:', error);
      // Retornar datos sin cifrar en caso de error
      return data;
    }
  }

  /**
   * Descifrar datos
   */
  async decrypt(encryptedData: string): Promise<string> {
    // Fallback para SSR
    if (!this.isAvailable() || !this.isInitialized) {
      console.warn('Decryption no disponible, retornando datos tal como están');
      return encryptedData;
    }

    try {
      if (!this.encryptionKey) {
        await this.initializeEncryption();
      }

      if (!this.encryptionKey) {
        throw new Error('Clave de cifrado no disponible');
      }

      const combined = new Uint8Array(
        atob(encryptedData).split('').map(char => char.charCodeAt(0))
      );

      const iv = combined.slice(0, 12);
      const encryptedBuffer = combined.slice(12);

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        this.encryptionKey,
        encryptedBuffer
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Error en descifrado:', error);
      // Retornar datos tal como están en caso de error
      return encryptedData;
    }
  }

  /**
   * Verificar si el cifrado está disponible
   */
  isEncryptionAvailable(): boolean {
    return this.isAvailable() && this.isInitialized;
  }

  /**
   * Inicializar de forma lazy (para usar en componentes)
   */
  async ensureInitialized(): Promise<void> {
    if (!this.isClient) return;
    
    if (!this.isInitialized) {
      await this.initializeEncryption();
    }
  }

  /**
   * Generar hash para búsquedas (determinístico)
   */
  async hashForSearch(data: string): Promise<string> {
    if (!this.isAvailable()) {
      console.warn('Hash no disponible en SSR, retornando string vacío');
      return '';
    }

    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data.toLowerCase().trim());
      
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = new Uint8Array(hashBuffer);
      
      return btoa(String.fromCharCode(...hashArray));
    } catch (error) {
      console.error('Error generando hash:', error);
      return '';
    }
  }

  /**
   * Generar hash seguro (no determinístico)
   */
  async hash(data: string): Promise<string> {
    if (!this.isAvailable()) {
      console.warn('Hash seguro no disponible en SSR, retornando string vacío');
      return '';
    }

    try {
      const encoder = new TextEncoder();
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const dataWithSalt = new Uint8Array(encoder.encode(data).length + salt.length);
      
      dataWithSalt.set(encoder.encode(data));
      dataWithSalt.set(salt, encoder.encode(data).length);
      
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataWithSalt);
      const hashArray = new Uint8Array(hashBuffer);
      
      // Combinar salt + hash
      const combined = new Uint8Array(salt.length + hashArray.length);
      combined.set(salt);
      combined.set(hashArray, salt.length);
      
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Error generando hash seguro:', error);
      return '';
    }
  }

  /**
   * Verificar hash
   */
  async verifyHash(data: string, hash: string): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('Verificación de hash no disponible en SSR');
      return false;
    }

    try {
      const combined = new Uint8Array(
        atob(hash).split('').map(char => char.charCodeAt(0))
      );
      
      const salt = combined.slice(0, 16);
      const originalHash = combined.slice(16);
      
      const encoder = new TextEncoder();
      const dataWithSalt = new Uint8Array(encoder.encode(data).length + salt.length);
      dataWithSalt.set(encoder.encode(data));
      dataWithSalt.set(salt, encoder.encode(data).length);
      
      const newHashBuffer = await window.crypto.subtle.digest('SHA-256', dataWithSalt);
      const newHash = new Uint8Array(newHashBuffer);
      
      return this.constantTimeCompare(originalHash, newHash);
    } catch (error) {
      console.error('Error verificando hash:', error);
      return false;
    }
  }

  /**
   * Generar clave de sesión para archivos
   */
  async generateSessionKey(): Promise<string> {
    if (!this.isAvailable()) {
      console.warn('Generación de clave de sesión no disponible en SSR');
      return '';
    }

    try {
      const key = window.crypto.getRandomValues(new Uint8Array(32));
      return btoa(String.fromCharCode(...key));
    } catch (error) {
      console.error('Error generando clave de sesión:', error);
      return '';
    }
  }

  /**
   * Cifrar archivo
   */
  async encryptFile(file: File, sessionKey?: string): Promise<{ encryptedFile: Blob, key: string }> {
    if (!this.isAvailable()) {
      console.warn('Cifrado de archivo no disponible en SSR');
      return { encryptedFile: file, key: '' };
    }

    try {
      const key = sessionKey || await this.generateSessionKey();
      const keyBuffer = new Uint8Array(atob(key).split('').map(char => char.charCodeAt(0)));
      
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      const fileBuffer = await file.arrayBuffer();
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        fileBuffer
      );

      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedBuffer), iv.length);

      const encryptedBlob = new Blob([combined], { type: 'application/octet-stream' });
      
      return { encryptedFile: encryptedBlob, key };
    } catch (error) {
      console.error('Error cifrando archivo:', error);
      return { encryptedFile: file, key: '' };
    }
  }

  /**
   * Descifrar archivo
   */
  async decryptFile(encryptedBlob: Blob, sessionKey: string): Promise<Blob> {
    if (!this.isAvailable()) {
      console.warn('Descifrado de archivo no disponible en SSR');
      return encryptedBlob;
    }

    try {
      const keyBuffer = new Uint8Array(atob(sessionKey).split('').map(char => char.charCodeAt(0)));
      
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      const encryptedBuffer = await encryptedBlob.arrayBuffer();
      const combined = new Uint8Array(encryptedBuffer);
      
      const iv = combined.slice(0, 12);
      const ciphertext = combined.slice(12);
      
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        ciphertext
      );

      return new Blob([decryptedBuffer]);
    } catch (error) {
      console.error('Error descifrando archivo:', error);
      return encryptedBlob;
    }
  }

  /**
   * Firmar datos
   */
  async signData(data: string, privateKey?: CryptoKey): Promise<string> {
    if (!this.isAvailable()) {
      console.warn('Firma de datos no disponible en SSR');
      return '';
    }

    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      const signingKey = privateKey || await this.getSigningKey();
      const signature = await window.crypto.subtle.sign(
        { name: 'HMAC' },
        signingKey,
        dataBuffer
      );
      
      return btoa(String.fromCharCode(...new Uint8Array(signature)));
    } catch (error) {
      console.error('Error firmando datos:', error);
      return '';
    }
  }

  /**
   * Verificar firma
   */
  async verifySignature(data: string, signature: string): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('Verificación de firma no disponible en SSR');
      return false;
    }

    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const signatureBuffer = new Uint8Array(atob(signature).split('').map(char => char.charCodeAt(0)));
      
      return await window.crypto.subtle.verify(
        { name: 'HMAC' },
        await this.getSigningKey(),
        signatureBuffer,
        dataBuffer
      );
    } catch (error) {
      console.error('Error verificando firma:', error);
      return false;
    }
  }

  /**
   * Obtener clave de firma
   */
  private async getSigningKey(): Promise<CryptoKey> {
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(this.getSigningPassword()),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('altamedica-signing-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
  }

  /**
   * Obtener contraseña de firma
   */
  private getSigningPassword(): string {
    if (this.isClient) {
      return process.env.NEXT_PUBLIC_SIGNING_KEY || 'altamedica-signing-key-2024';
    }
    return 'server-signing-fallback';
  }

  /**
   * Comparación segura en tiempo constante
   */
  private constantTimeCompare(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i];
    }
    return result === 0;
  }
}

// Singleton para uso global
let encryptionServiceInstance: EncryptionService | null = null;

export const getEncryptionService = (): EncryptionService => {
  if (!encryptionServiceInstance) {
    encryptionServiceInstance = new EncryptionService();
  }
  return encryptionServiceInstance;
};

// Export default para compatibilidad
export default getEncryptionService();
