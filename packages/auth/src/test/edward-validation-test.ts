/**
 * 🧪 Prueba Específica para Validar "Edward"
 * Verifica que "Edward" pasa la validación sin necesidad de excepción
 */

import { NameValidator, validateFirstName } from '../validators/name-validators';

/**
 * 🔍 Analiza las consonantes consecutivas en "Edward"
 */
function analyzeEdward(): void {
  console.log('🔍 Análisis detallado de "Edward"');
  console.log('='.repeat(40));
  
  const name = 'Edward';
  const chars = name.toLowerCase().split('');
  
  console.log('Caracteres:', chars);
  console.log('Análisis letra por letra:');
  
  chars.forEach((char, index) => {
    const isVowel = /[aeiouáéíóú]/.test(char);
    const isConsonant = /[bcdfghjklmnpqrstvwxyzñ]/.test(char);
    
    console.log(`  ${index + 1}. "${char}" - ${isVowel ? 'VOCAL' : isConsonant ? 'CONSONANTE' : 'OTRO'}`);
  });
  
  // Buscar secuencias de consonantes
  let consecutiveConsonants = 0;
  let maxSequence = 0;
  let currentSequence = '';
  let sequences: string[] = [];
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    
    if (/[bcdfghjklmnpqrstvwxyzñ]/.test(char)) {
      consecutiveConsonants++;
      currentSequence += char;
      maxSequence = Math.max(maxSequence, consecutiveConsonants);
    } else {
      if (currentSequence.length > 0) {
        sequences.push(`"${currentSequence}" (${consecutiveConsonants} consonantes)`);
      }
      consecutiveConsonants = 0;
      currentSequence = '';
    }
  }
  
  // Verificar la última secuencia
  if (currentSequence.length > 0) {
    sequences.push(`"${currentSequence}" (${consecutiveConsonants} consonantes)`);
  }
  
  console.log('\n📊 Secuencias de consonantes encontradas:');
  sequences.forEach(seq => console.log(`  - ${seq}`));
  console.log(`\n🎯 Máxima secuencia de consonantes consecutivas: ${maxSequence}`);
  console.log(`✅ ¿Pasa validación estándar (máx 3)? ${maxSequence <= 3 ? 'SÍ' : 'NO'}`);
}

/**
 * 🧪 Prueba con el validador actual
 */
function testEdwardValidation(): void {
  console.log('\n🧪 Prueba con validador actual');
  console.log('='.repeat(40));
  
  const result = validateFirstName('Edward');
  
  console.log('Resultado:', {
    isValid: result.isValid,
    errors: result.errors,
    warnings: result.warnings,
    suggestions: result.suggestions
  });
  
  console.log(`\n${result.isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}: Edward ${result.isValid ? 'pasa' : 'no pasa'} la validación`);
  
  if (result.errors.length > 0) {
    console.log('Errores:');
    result.errors.forEach(error => console.log(`  - ${error}`));
  }
  
  if (result.warnings.length > 0) {
    console.log('Advertencias:');
    result.warnings.forEach(warning => console.log(`  - ${warning}`));
  }
}

/**
 * 🔬 Prueba con diferentes configuraciones
 */
function testDifferentConfigurations(): void {
  console.log('\n🔬 Prueba con diferentes configuraciones');
  console.log('='.repeat(40));
  
  const configurations = [
    { name: 'Estándar (3 consonantes)', limit: 3 },
    { name: 'Estricto (2 consonantes)', limit: 2 },
    { name: 'Muy estricto (1 consonante)', limit: 1 },
    { name: 'Flexible (4 consonantes)', limit: 4 }
  ];
  
  configurations.forEach(config => {
    const validator = new NameValidator({
      consonantLimit: config.limit,
      checkConsonantLimit: true
    });
    
    const result = validator.validateName('Edward', 'firstName');
    const status = result.isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO';
    
    console.log(`  ${config.name}: ${status}`);
    if (!result.isValid) {
      console.log(`    └─ ${result.errors[0]}`);
    }
  });
}

/**
 * 🚀 Ejecutar todas las pruebas
 */
export function runEdwardTests(): void {
  console.log('🚀 SUITE DE PRUEBAS PARA "EDWARD"');
  console.log('='.repeat(50));
  
  analyzeEdward();
  testEdwardValidation();
  testDifferentConfigurations();
  
  console.log('\n🎯 CONCLUSIÓN:');
  console.log('Edward tiene máximo 2 consonantes consecutivas (d-w),');
  console.log('por lo que debería pasar la validación estándar sin excepciones.');
}

// Ejecutar automáticamente si se importa
if (typeof window !== 'undefined') {
  (window as any).runEdwardTests = runEdwardTests;
  (window as any).analyzeEdward = analyzeEdward;
}

export { analyzeEdward, testDifferentConfigurations, testEdwardValidation };

