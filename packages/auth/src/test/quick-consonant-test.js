#!/usr/bin/env node

/**
 * 🧪 Script de prueba rápida para validar "Edward"
 */

// Simular las definiciones necesarias
const VOWELS = /[aeiouáéíóúAEIOUÁÉÍÓÚ]/;
const CONSONANTS = /[bcdfghjklmnpqrstvwxyzñBCDFGHJKLMNPQRSTVWXYZÑ]/;

function analyzeEdward() {
  console.log('🔍 Análisis detallado de "Edward"');
  console.log('='.repeat(40));
  
  const name = 'Edward';
  const chars = name.toLowerCase().split('');
  
  console.log('Caracteres:', chars);
  console.log('Análisis letra por letra:');
  
  chars.forEach((char, index) => {
    const isVowel = VOWELS.test(char);
    const isConsonant = CONSONANTS.test(char);
    
    console.log(`  ${index + 1}. "${char}" - ${isVowel ? 'VOCAL' : isConsonant ? 'CONSONANTE' : 'OTRO'}`);
  });
  
  // Buscar secuencias de consonantes
  let consecutiveConsonants = 0;
  let maxSequence = 0;
  let currentSequence = '';
  let sequences = [];
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    
    if (CONSONANTS.test(char)) {
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
  
  return maxSequence;
}

function testOtherNames() {
  console.log('\n🔬 Comparación con otros nombres');
  console.log('='.repeat(40));
  
  const testNames = [
    'Edward',     // Esperado: 2 consonantes máx (dw)
    'Christian',  // Esperado: 4 consonantes (chri) 
    'Roberto',    // Esperado: 1 consonante máx (separadas por vocales)
    'Francisco',  // Esperado: 3 consonantes (ncr o isc)
    'Esteban'     // Esperado: 3 consonantes (stb)
  ];
  
  testNames.forEach(name => {
    console.log(`\n--- Analizando "${name}" ---`);
    const chars = name.toLowerCase().split('');
    
    let maxSequence = 0;
    let consecutiveConsonants = 0;
    let currentSequence = '';
    
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      
      if (CONSONANTS.test(char)) {
        consecutiveConsonants++;
        currentSequence += char;
        maxSequence = Math.max(maxSequence, consecutiveConsonants);
      } else {
        if (currentSequence.length > 1) {
          console.log(`  Secuencia: "${currentSequence}" (${consecutiveConsonants} consonantes)`);
        }
        consecutiveConsonants = 0;
        currentSequence = '';
      }
    }
    
    // Verificar la última secuencia
    if (currentSequence.length > 1) {
      console.log(`  Secuencia: "${currentSequence}" (${consecutiveConsonants} consonantes)`);
    }
    
    console.log(`  ➤ Máxima secuencia: ${maxSequence} consonantes`);
    console.log(`  ➤ ¿Válido con límite 3? ${maxSequence <= 3 ? '✅ SÍ' : '❌ NO'}`);
  });
}

console.log('🚀 ANÁLISIS DE CONSONANTES CONSECUTIVAS');
console.log('='.repeat(50));

const maxEdward = analyzeEdward();
testOtherNames();

console.log('\n🎯 CONCLUSIONES:');
console.log(`- Edward tiene ${maxEdward} consonantes consecutivas máximo`);
console.log('- NO necesita estar en la lista de excepciones');
console.log('- Debería pasar la validación estándar normalmente');
console.log('\n✅ Corrección aplicada: Edward removido de excepciones');
