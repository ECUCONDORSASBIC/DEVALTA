/**
 * 📦 Exportaciones principales del Sistema de Validación Avanzada
 * AltaMedica - Validadores de Nombres y Apellidos
 * 
 * @package @altamedica/auth
 * @version 1.0.0
 * @description Sistema avanzado de validación para nombres propios con:
 *   - Control de consonantes consecutivas (máximo 3, configurable)
 *   - Control de vocales consecutivas (máximo 3, configurable)
 *   - Excepciones para nombres conocidos (Edward, etc.)
 *   - Soporte internacional con acentos y caracteres especiales
 *   - Integración directa con FormField
 */

// 🎯 Validadores principales
export {
    NameValidator, testNameValidation, validateFirstName, validateFullName, validateLastName
} from './name-validators';

// 🔗 Integración con FormField
export {
    createAdvancedValidation, createCustomNameValidation, FORM_VALIDATION_EXAMPLES, PRESET_VALIDATIONS, testFormFieldIntegration,
    USAGE_EXAMPLES
} from './form-integration';

// 📋 Tipos TypeScript
export type {
    FormFieldValidation, NameValidationConfig,
    NameValidationResult, SupportedLocale, ValidationContext, ValidationError, ValidationErrorCode, ValidationMetadata, ValidationPreset, ValidationResponse, ValidationRule, ValidationSuggestion, ValidationWarning
} from '../types/validation-types';

// 🎨 Constantes y configuraciones
export {
    createNameValidationRule, LOCALE_CONFIGS, NAME_VALIDATION_PRESETS,
    VALIDATION_ERROR_CODES
} from '../types/validation-types';

// Para importaciones internas
import { createAdvancedValidation, createCustomNameValidation, PRESET_VALIDATIONS } from './form-integration';
import { NameValidator } from './name-validators';

// 🚀 Exports de conveniencia para uso rápido
export const QuickValidations = {
  // Validaciones más comunes
  standardFirstName: () => createAdvancedValidation('firstName', 'STANDARD_FIRST_NAME'),
  standardLastName: () => createAdvancedValidation('lastName', 'STANDARD_LAST_NAME'),
  
  // Validaciones médicas estrictas
  medicalFirstName: () => createAdvancedValidation('firstName', 'MEDICAL_STRICT'),
  medicalLastName: () => createAdvancedValidation('lastName', 'MEDICAL_STRICT'),
  
  // Validaciones internacionales
  internationalName: () => createAdvancedValidation('firstName', 'INTERNATIONAL'),
  
  // Validaciones personalizadas comunes
  strictName: (consonantLimit = 2, vowelLimit = 2) => createCustomNameValidation({
    type: 'firstName',
    consonantLimit,
    vowelLimit,
    strictMode: true,
    allowHyphens: false,
    allowApostrophes: false
  }),
  
  flexibleName: (consonantLimit = 4, vowelLimit = 4) => createCustomNameValidation({
    type: 'firstName',
    consonantLimit,
    vowelLimit,
    strictMode: false,
    allowHyphens: true,
    allowApostrophes: true,
    allowMiddleNames: true
  })
};

// 📚 Ejemplos de uso rápido
export const QUICK_USAGE_EXAMPLES = {
  basic: `
// ✅ Uso básico en FormField
import { PRESET_VALIDATIONS } from '@altamedica/auth';

<FormField 
  validation={PRESET_VALIDATIONS.firstName} 
  label="Nombre" 
/>
  `,
  
  custom: `
// 🔧 Validación personalizada
import { QuickValidations } from '@altamedica/auth';

<FormField 
  validation={QuickValidations.strictName(2, 2)} 
  label="Nombre (Estricto)" 
/>
  `,
  
  medical: `
// 🏥 Para formularios médicos
import { PRESET_VALIDATIONS } from '@altamedica/auth';

<FormField validation={PRESET_VALIDATIONS.medicalFirstName} />
<FormField validation={PRESET_VALIDATIONS.medicalLastName} />
  `,
  
  testing: `
// 🧪 Pruebas y validación directa
import { validateFirstName, testNameValidation } from '@altamedica/auth';

const result = validateFirstName('Edward');
console.log(result); // { isValid: true, errors: [], warnings: [...] }

// Ejecutar suite de pruebas
testNameValidation();
  `
};

// 🎯 Configuraciones predefinidas por contexto
export const CONTEXT_CONFIGS = {
  // Registro de usuarios generales
  USER_REGISTRATION: {
    firstName: PRESET_VALIDATIONS.firstName,
    lastName: PRESET_VALIDATIONS.lastName
  },
  
  // Registro de profesionales médicos
  MEDICAL_PROFESSIONAL: {
    firstName: PRESET_VALIDATIONS.medicalFirstName,
    lastName: PRESET_VALIDATIONS.medicalLastName
  },
  
  // Formularios internacionales
  INTERNATIONAL_FORM: {
    firstName: PRESET_VALIDATIONS.internationalFirstName,
    lastName: PRESET_VALIDATIONS.internationalLastName
  },
  
  // Formularios con validación muy estricta
  STRICT_VALIDATION: {
    firstName: QuickValidations.strictName(2, 2),
    lastName: createCustomNameValidation({
      type: 'lastName',
      consonantLimit: 2,
      vowelLimit: 2,
      strictMode: true,
      allowHyphens: false
    })
  }
};

// 🔍 Función de utilidad para debugging
export function debugValidation(name: string, type: 'firstName' | 'lastName' = 'firstName'): void {
  console.log(`🔍 Debug de Validación: "${name}"`);
  console.log('='.repeat(50));
  
  const validator = new NameValidator({
    checkConsonantLimit: true,
    checkVowelLimit: true,
    consonantLimit: 3,
    vowelLimit: 3
  });
  
  const result = validator.validateName(name, type);
  
  console.log(`✅ Válido: ${result.isValid}`);
  
  if (result.errors.length > 0) {
    console.log(`❌ Errores: ${result.errors.join(', ')}`);
  }
  
  if (result.warnings.length > 0) {
    console.log(`⚠️ Advertencias: ${result.warnings.join(', ')}`);
  }
  
  if (result.suggestions && result.suggestions.length > 0) {
    console.log(`💡 Sugerencias: ${result.suggestions.join(', ')}`);
  }
  
  console.log('='.repeat(50));
}

// Export por defecto
export default {
  NameValidator,
  createAdvancedValidation,
  createCustomNameValidation,
  PRESET_VALIDATIONS,
  QuickValidations,
  CONTEXT_CONFIGS,
  debugValidation
};
