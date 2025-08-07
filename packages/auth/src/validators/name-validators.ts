/**
 * 🎯 Validadores Avanzados de Nombres y Apellidos
 * AltaMedica - Sistema de Validación Inteligente
 * 
 * Implementa validaciones sofisticadas para nombres propios con:
 * - Control de consonantes consecutivas (máximo 3)
 * - Control de vocales consecutivas (máximo 3) 
 * - Excepciones para nombres conocidos (Edward, etc.)
 * - Validación de caracteres especiales
 * - Soporte internacional (acentos, ñ, etc.)
 */

// 🔤 Definición de vocales y consonantes
const VOWELS = /[aeiouáéíóúAEIOUÁÉÍÓÚ]/;
const CONSONANTS = /[bcdfghjklmnpqrstvwxyzñBCDFGHJKLMNPQRSTVWXYZÑ]/;

// 📝 Excepciones conocidas de nombres con más de 3 consonantes consecutivas
const KNOWN_CONSONANT_EXCEPTIONS = [
  // Nombres con 4+ consonantes consecutivas reales
  'christian', 'christopher', 'patricia', 'patrick', 'andrew', 'andre',
  'esteban', 'estrella', 'esther', 'astrid', 'ernst',
  // Nombres con clusters consonánticos complejos
  'francisco', 'bernardo', 'leonardo', 'fernando', 'armando', 
  'rodrigo', 'edmundo', 'edmund', 'reynaldo', 'rolando', 'orlando'
  // Nota: 'edward' removido - solo tiene 2 consonantes consecutivas máximo (dw)
];

// 📝 Excepciones conocidas de nombres con más de 3 vocales consecutivas
const KNOWN_VOWEL_EXCEPTIONS = [
  'aiaiaia', 'eueueu', 'aeoaeo', 'iaiaia', 'uauaua'
  // Note: En español es raro tener 3+ vocales consecutivas en nombres reales
];

export interface NameValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

export interface NameValidationOptions {
  allowMiddleNames?: boolean;
  allowHyphens?: boolean;
  allowApostrophes?: boolean;
  minLength?: number;
  maxLength?: number;
  checkConsonantLimit?: boolean;
  checkVowelLimit?: boolean;
  consonantLimit?: number;
  vowelLimit?: number;
  strictMode?: boolean;
}

/**
 * 🔍 Validador Principal de Nombres y Apellidos
 */
export class NameValidator {
  private options: Required<NameValidationOptions>;

  constructor(options: NameValidationOptions = {}) {
    this.options = {
      allowMiddleNames: true,
      allowHyphens: true,
      allowApostrophes: true,
      minLength: 2,
      maxLength: 50,
      checkConsonantLimit: true,
      checkVowelLimit: true,
      consonantLimit: 3,
      vowelLimit: 3,
      strictMode: false,
      ...options
    };
  }

  /**
   * 🎯 Validación completa de nombre o apellido
   */
  validateName(name: string, type: 'firstName' | 'lastName' = 'firstName'): NameValidationResult {
    const result: NameValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    if (!name || typeof name !== 'string') {
      result.isValid = false;
      result.errors.push('El nombre es requerido');
      return result;
    }

    const trimmedName = name.trim();
    
    // Validaciones básicas
    this.validateBasicFormat(trimmedName, result, type);
    this.validateLength(trimmedName, result);
    this.validateCharacters(trimmedName, result);
    
    // Validaciones avanzadas
    if (this.options.checkConsonantLimit) {
      this.validateConsonantSequences(trimmedName, result);
    }
    
    if (this.options.checkVowelLimit) {
      this.validateVowelSequences(trimmedName, result);
    }

    // Validaciones específicas por tipo
    if (type === 'firstName') {
      this.validateFirstName(trimmedName, result);
    } else {
      this.validateLastName(trimmedName, result);
    }

    return result;
  }

  /**
   * 📋 Validación de formato básico
   */
  private validateBasicFormat(name: string, result: NameValidationResult, type: string): void {
    // Debe empezar con letra
    if (!/^[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(name)) {
      result.isValid = false;
      result.errors.push(`${type === 'firstName' ? 'El nombre' : 'El apellido'} debe comenzar con una letra`);
    }

    // No debe terminar con espacio, guión o apóstrofe
    if (/[\s\-']$/.test(name)) {
      result.isValid = false;
      result.errors.push(`${type === 'firstName' ? 'El nombre' : 'El apellido'} no puede terminar con espacio, guión o apóstrofe`);
    }

    // No debe tener espacios dobles
    if (/\s{2,}/.test(name)) {
      result.isValid = false;
      result.errors.push('No se permiten espacios dobles');
    }
  }

  /**
   * 📏 Validación de longitud
   */
  private validateLength(name: string, result: NameValidationResult): void {
    if (name.length < this.options.minLength) {
      result.isValid = false;
      result.errors.push(`Debe tener al menos ${this.options.minLength} caracteres`);
    }

    if (name.length > this.options.maxLength) {
      result.isValid = false;
      result.errors.push(`No puede exceder ${this.options.maxLength} caracteres`);
    }
  }

  /**
   * 🔤 Validación de caracteres permitidos
   */
  private validateCharacters(name: string, result: NameValidationResult): void {
    // Caracteres base permitidos: letras, espacios, acentos, ñ
    let allowedPattern = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]*$/;

    // Añadir guiones si están permitidos
    if (this.options.allowHyphens) {
      allowedPattern = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s\-]*$/;
    }

    // Añadir apóstrofes si están permitidos
    if (this.options.allowApostrophes) {
      allowedPattern = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s\-']*$/;
    }

    if (!allowedPattern.test(name)) {
      result.isValid = false;
      result.errors.push('Contiene caracteres no permitidos. Solo se permiten letras, espacios' + 
        (this.options.allowHyphens ? ', guiones' : '') +
        (this.options.allowApostrophes ? ', apóstrofes' : ''));
    }

    // Validar que no tenga números
    if (/\d/.test(name)) {
      result.isValid = false;
      result.errors.push('No se permiten números en nombres o apellidos');
    }

    // Validar caracteres especiales no permitidos
    if (/[<>@#$%^&*()+={}[\]|\\:";.,?/]/.test(name)) {
      result.isValid = false;
      result.errors.push('Contiene caracteres especiales no permitidos');
    }
  }

  /**
   * 🅰️ Validación de secuencias de consonantes
   */
  private validateConsonantSequences(name: string, result: NameValidationResult): void {
    const nameForCheck = name.toLowerCase().replace(/[\s\-']/g, '');
    
    // Verificar si es una excepción conocida
    const isException = KNOWN_CONSONANT_EXCEPTIONS.some(exception => 
      nameForCheck.includes(exception) || exception.includes(nameForCheck)
    );

    if (isException) {
      result.warnings.push('Este nombre tiene una secuencia de consonantes inusual pero es un nombre conocido');
      return;
    }

    // Buscar secuencias de consonantes
    let consecutiveConsonants = 0;
    let maxConsonantSequence = 0;
    let currentSequence = '';

    for (let i = 0; i < nameForCheck.length; i++) {
      const char = nameForCheck[i];
      
      if (CONSONANTS.test(char)) {
        consecutiveConsonants++;
        currentSequence += char;
        maxConsonantSequence = Math.max(maxConsonantSequence, consecutiveConsonants);
      } else {
        if (consecutiveConsonants > this.options.consonantLimit) {
          result.isValid = false;
          result.errors.push(
            `Secuencia de consonantes demasiado larga: "${currentSequence}" (${consecutiveConsonants} consonantes). ` +
            `Máximo permitido: ${this.options.consonantLimit}`
          );
        }
        consecutiveConsonants = 0;
        currentSequence = '';
      }
    }

    // Verificar la última secuencia
    if (consecutiveConsonants > this.options.consonantLimit) {
      result.isValid = false;
      result.errors.push(
        `Secuencia de consonantes demasiado larga al final: "${currentSequence}" (${consecutiveConsonants} consonantes). ` +
        `Máximo permitido: ${this.options.consonantLimit}`
      );
    }

    // Advertencia si está cerca del límite
    if (maxConsonantSequence === this.options.consonantLimit) {
      result.warnings.push(`Secuencia de consonantes en el límite permitido (${this.options.consonantLimit})`);
    }
  }

  /**
   * 🅰️ Validación de secuencias de vocales
   */
  private validateVowelSequences(name: string, result: NameValidationResult): void {
    const nameForCheck = name.toLowerCase().replace(/[\s\-']/g, '');
    
    // Verificar si es una excepción conocida (muy raro en español)
    const isException = KNOWN_VOWEL_EXCEPTIONS.some(exception => 
      nameForCheck.includes(exception)
    );

    if (isException) {
      result.warnings.push('Este nombre tiene una secuencia de vocales inusual pero es aceptable');
      return;
    }

    // Buscar secuencias de vocales
    let consecutiveVowels = 0;
    let maxVowelSequence = 0;
    let currentSequence = '';

    for (let i = 0; i < nameForCheck.length; i++) {
      const char = nameForCheck[i];
      
      if (VOWELS.test(char)) {
        consecutiveVowels++;
        currentSequence += char;
        maxVowelSequence = Math.max(maxVowelSequence, consecutiveVowels);
      } else {
        if (consecutiveVowels > this.options.vowelLimit) {
          result.isValid = false;
          result.errors.push(
            `Secuencia de vocales demasiado larga: "${currentSequence}" (${consecutiveVowels} vocales). ` +
            `Máximo permitido: ${this.options.vowelLimit}`
          );
        }
        consecutiveVowels = 0;
        currentSequence = '';
      }
    }

    // Verificar la última secuencia
    if (consecutiveVowels > this.options.vowelLimit) {
      result.isValid = false;
      result.errors.push(
        `Secuencia de vocales demasiado larga al final: "${currentSequence}" (${consecutiveVowels} vocales). ` +
        `Máximo permitido: ${this.options.vowelLimit}`
      );
    }

    // Advertencia si está cerca del límite
    if (maxVowelSequence === this.options.vowelLimit) {
      result.warnings.push(`Secuencia de vocales en el límite permitido (${this.options.vowelLimit})`);
    }
  }

  /**
   * 👤 Validaciones específicas para nombres
   */
  private validateFirstName(name: string, result: NameValidationResult): void {
    // Los nombres pueden tener múltiples partes si allowMiddleNames está habilitado
    if (!this.options.allowMiddleNames && /\s/.test(name)) {
      result.warnings.push('Este nombre contiene espacios. Considera usar el campo de segundo nombre si está disponible');
    }

    // Validar capitalización
    if (this.options.strictMode) {
      this.validateCapitalization(name, result, 'nombre');
    }
  }

  /**
   * 👥 Validaciones específicas para apellidos
   */
  private validateLastName(name: string, result: NameValidationResult): void {
    // Los apellidos compuestos son comunes
    const parts = name.split(/[\s\-]/);
    
    if (parts.length > 3) {
      result.warnings.push('Apellido con muchas partes. Verifica que sea correcto');
    }

    // Validar capitalización
    if (this.options.strictMode) {
      this.validateCapitalization(name, result, 'apellido');
    }
  }

  /**
   * 🔤 Validación de capitalización
   */
  private validateCapitalization(name: string, result: NameValidationResult, type: string): void {
    const parts = name.split(/[\s\-]/);
    
    for (const part of parts) {
      if (part.length === 0) continue;
      
      // Debe empezar con mayúscula
      if (!/^[A-ZÁÉÍÓÚÑ]/.test(part)) {
        result.warnings.push(`${type} debe comenzar con mayúscula: "${part}"`);
      }
      
      // No debe ser todo mayúsculas (excepto si es muy corto)
      if (part.length > 2 && part === part.toUpperCase()) {
        result.warnings.push(`${type} no debería estar completamente en mayúsculas: "${part}"`);
      }
    }
  }
}

/**
 * 🚀 Funciones de conveniencia para validación rápida
 */

/**
 * Validar nombre con configuración estándar
 */
export function validateFirstName(name: string): NameValidationResult {
  const validator = new NameValidator({
    allowMiddleNames: true,
    consonantLimit: 3,
    vowelLimit: 3,
    strictMode: false
  });
  return validator.validateName(name, 'firstName');
}

/**
 * Validar apellido con configuración estándar
 */
export function validateLastName(name: string): NameValidationResult {
  const validator = new NameValidator({
    allowMiddleNames: true,
    allowHyphens: true,
    consonantLimit: 3,
    vowelLimit: 3,
    strictMode: false
  });
  return validator.validateName(name, 'lastName');
}

/**
 * Validar nombre completo (nombre + apellido)
 */
export function validateFullName(firstName: string, lastName: string): {
  firstName: NameValidationResult;
  lastName: NameValidationResult;
  isValid: boolean;
} {
  const firstNameResult = validateFirstName(firstName);
  const lastNameResult = validateLastName(lastName);
  
  return {
    firstName: firstNameResult,
    lastName: lastNameResult,
    isValid: firstNameResult.isValid && lastNameResult.isValid
  };
}

/**
 * 🧪 Función de prueba con nombres de ejemplo
 */
export function testNameValidation(): void {
  console.log('🧪 Pruebas de Validación de Nombres\n');
  
  const testCases = [
    { name: 'Edward', type: 'firstName' as const, shouldPass: true, note: 'Solo 2 consonantes consecutivas (dw)' },
    { name: 'Christian', type: 'firstName' as const, shouldPass: true, note: 'Excepción conocida (4 consonantes)' },
    { name: 'María José', type: 'firstName' as const, shouldPass: true, note: 'Nombre compuesto válido' },
    { name: 'Xxxyyy', type: 'firstName' as const, shouldPass: false, note: '4 consonantes consecutivas' },
    { name: 'Aeiou', type: 'firstName' as const, shouldPass: false, note: '5 vocales consecutivas' },
    { name: 'José-Luis', type: 'firstName' as const, shouldPass: true, note: 'Nombre con guión válido' },
    { name: 'O\'Connor', type: 'lastName' as const, shouldPass: true, note: 'Apellido con apóstrofe válido' },
    { name: 'García', type: 'lastName' as const, shouldPass: true, note: 'Apellido con acento válido' },
    { name: 'X1Y2Z3', type: 'firstName' as const, shouldPass: false, note: 'Contiene números' },
  ];

  const validator = new NameValidator();
  
  testCases.forEach(({ name, type, shouldPass, note }) => {
    const result = validator.validateName(name, type);
    const passed = result.isValid === shouldPass;
    const status = passed ? '✅' : '❌';
    
    console.log(`${status} "${name}" (${type}): ${note}`);
    if (!result.isValid) {
      console.log(`   Errores: ${result.errors.join(', ')}`);
    }
    if (result.warnings.length > 0) {
      console.log(`   Advertencias: ${result.warnings.join(', ')}`);
    }
    console.log('');
  });
}

// Exportar el validador por defecto
export default NameValidator;
