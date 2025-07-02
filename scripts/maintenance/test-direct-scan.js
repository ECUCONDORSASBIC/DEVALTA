#!/usr/bin/env node

// Test directo del escáner de codebase
import fs from 'fs/promises';
import path from 'path';

async function testScan() {
  const rootPath = 'c:\\Users\\Eduardo\\Documents\\altamedicadev';
  
  console.log(`🔍 Testing direct scan of: ${rootPath}`);
  
  try {
    // Test básico de acceso a directorio
    const stats = await fs.stat(rootPath);
    console.log(`✅ Directory exists: ${stats.isDirectory()}`);
    
    // Test de listado de archivos
    const entries = await fs.readdir(rootPath, { withFileTypes: true });
    console.log(`📁 Found ${entries.length} entries in root`);
    
    // Mostrar algunos archivos
    const files = entries.filter(e => e.isFile()).slice(0, 5);
    const dirs = entries.filter(e => e.isDirectory()).slice(0, 5);
    
    console.log(`📄 Files: ${files.map(f => f.name).join(', ')}`);
    console.log(`📂 Dirs: ${dirs.map(d => d.name).join(', ')}`);
    
    // Test recursivo en un directorio
    if (dirs.length > 0) {
      const testDir = path.join(rootPath, dirs[0].name);
      try {
        const subEntries = await fs.readdir(testDir, { withFileTypes: true });
        console.log(`📁 ${dirs[0].name} contains ${subEntries.length} entries`);
      } catch (err) {
        console.log(`❌ Cannot read ${dirs[0].name}: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

testScan();
