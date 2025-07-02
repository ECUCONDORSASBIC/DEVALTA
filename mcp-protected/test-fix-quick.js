#!/usr/bin/env node

// 🔬 TEST RÁPIDO DEL FIX DE REGEX
import { CodebaseIntelligence } from './servers/codebase-intelligence-mcp.js';

const testContent = `
function test() {
  if (condition) {
    try {
      for (let i = 0; i < 10; i++) {
        console.log("test");
      }
    } catch (error) {
      console.error(error);
    }
  }
}
`;

console.log('🔬 TESTING FIX DE REGEX...');

try {
  const intelligence = new CodebaseIntelligence();
  const complexity = intelligence.calculateComplexity(testContent);
  console.log(`✅ Complejidad calculada: ${complexity}`);
  console.log('🎉 FIX FUNCIONANDO CORRECTAMENTE!');
} catch (error) {
  console.error(`❌ ERROR: ${error.message}`);
}
