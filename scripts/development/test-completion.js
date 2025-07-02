#!/usr/bin/env node
// TEST DIRECTO SMART COMPLETION

import { SmartCompletion } from './smart-completion-mcp.js';

async function testCompletion() {
  try {
    const completion = new SmartCompletion();
    console.log('✅ Smart Completion instanciado correctamente');
    
    // Test simple
    const result = await completion.generateCompletion({
      before: "function test() { console.log('",
      after: "'); }",
      language: "javascript",
      filePath: "test.js"
    });
    
    console.log('✅ Completion generado:', result);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testCompletion();
