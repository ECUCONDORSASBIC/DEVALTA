#!/usr/bin/env node
// 🔬 TEST DIRECTO DEL CODEBASE INTELLIGENCE MCP

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test directo de la función de escaneo
async function testScanRepository() {
  console.log('🔬 INICIANDO TEST DIRECTO DE ESCANEO...');

  try {
    // Importar la clase
    const { CodebaseIntelligence } = await import('./servers/codebase-intelligence-mcp.js');

    console.log('✅ Clase CodebaseIntelligence importada correctamente');

    // Crear instancia y probar escaneo
    const intelligence = new CodebaseIntelligence();
    console.log('✅ Instancia creada');

    // Probar escaneo del directorio raíz
    const testPath = "c:\\Users\\Eduardo\\Documents\\altamedicadev";
    console.log(`🔍 Escaneando: ${testPath}`);

    const results = await intelligence.scanRepository(testPath, { maxDepth: 2 });
    console.log('✅ Escaneo completado!');
    console.log(`📊 Resultados: ${results.files} archivos, ${results.linesOfCode} líneas`);

    return results;
  } catch (error) {
    console.error('❌ Error en test:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
}

testScanRepository()
  .then(results => {
    console.log('🎉 TEST EXITOSO:', JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 TEST FALLÓ:', error);
    process.exit(1);
  });
