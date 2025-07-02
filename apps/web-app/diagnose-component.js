const fs = require('fs');

// Verificar errores de sintaxis básicos en el componente
const filePath = './src/components/hospital3d/Hospital3DSimulator.tsx';

try {
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log('=== DIAGNÓSTICO DE ERRORES ===\n');
  
  // 1. Verificar que el archivo esté bien formateado
  const lines = content.split('\n');
  console.log(`📄 Total de líneas: ${lines.length}`);
  
  // 2. Verificar imports
  const hasReactImport = content.includes("import React");
  const hasThreeImport = content.includes("import * as THREE from 'three'");
  const hasUseClient = content.includes("'use client'");
  
  console.log(`✨ 'use client': ${hasUseClient ? '✅' : '❌'}`);
  console.log(`⚛️  React import: ${hasReactImport ? '✅' : '❌'}`);
  console.log(`🎮 Three.js import: ${hasThreeImport ? '✅' : '❌'}`);
  
  // 3. Verificar estructura del componente
  const hasComponentDeclaration = content.includes('const Hospital3DSimulator: React.FC');
  const hasExport = content.includes('export default Hospital3DSimulator');
  
  console.log(`🏗️  Declaración del componente: ${hasComponentDeclaration ? '✅' : '❌'}`);
  console.log(`📤 Export default: ${hasExport ? '✅' : '❌'}`);
  
  // 4. Verificar hooks
  const hasUseEffect = content.includes('useEffect');
  const hasUseState = content.includes('useState');
  const hasUseRef = content.includes('useRef');
  const hasUseCallback = content.includes('useCallback');
  
  console.log(`🎣 useEffect: ${hasUseEffect ? '✅' : '❌'}`);
  console.log(`🎣 useState: ${hasUseState ? '✅' : '❌'}`);
  console.log(`🎣 useRef: ${hasUseRef ? '✅' : '❌'}`);
  console.log(`🎣 useCallback: ${hasUseCallback ? '✅' : '❌'}`);
  
  // 5. Verificar función initializeScene
  const hasInitializeScene = content.includes('initializeScene');
  const hasCheckContainerReady = content.includes('checkContainerReady');
  
  console.log(`🚀 initializeScene: ${hasInitializeScene ? '✅' : '❌'}`);
  console.log(`📦 checkContainerReady: ${hasCheckContainerReady ? '✅' : '❌'}`);
  
  // 6. Buscar errores comunes
  console.log('\n=== BÚSQUEDA DE ERRORES COMUNES ===\n');
  
  // Comillas mal cerradas
  const singleQuotes = (content.match(/'/g) || []).length;
  const doubleQuotes = (content.match(/"/g) || []).length;
  console.log(`🔤 Comillas simples: ${singleQuotes} ${singleQuotes % 2 === 0 ? '✅' : '❌ (impar)'}`);
  console.log(`🔤 Comillas dobles: ${doubleQuotes} ${doubleQuotes % 2 === 0 ? '✅' : '❌ (impar)'}`);
  
  // Llaves y paréntesis
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;
  
  console.log(`🫸 Llaves: ${openBraces} abrir, ${closeBraces} cerrar ${openBraces === closeBraces ? '✅' : '❌'}`);
  console.log(`🫸 Paréntesis: ${openParens} abrir, ${closeParens} cerrar ${openParens === closeParens ? '✅' : '❌'}`);
  
  // 7. Verificar primeras líneas del useEffect
  const useEffectMatch = content.match(/useEffect\s*\(\s*\(\s*\)\s*=>\s*\{([\s\S]*?)\}, \[/);
  if (useEffectMatch) {
    console.log('\n📋 Contenido del useEffect (primeras líneas):');
    const effectContent = useEffectMatch[1].split('\n').slice(0, 5);
    effectContent.forEach((line, i) => {
      console.log(`  ${i + 1}: ${line.trim()}`);
    });
  } else {
    console.log('\n❌ No se encontró useEffect o tiene formato incorrecto');
  }
  
  // 8. Verificar si hay errores de sintaxis obvios en las primeras líneas
  console.log('\n📋 Primeras 10 líneas del archivo:');
  lines.slice(0, 10).forEach((line, i) => {
    console.log(`  ${i + 1}: ${line}`);
  });
  
} catch (error) {
  console.error('❌ Error al leer el archivo:', error.message);
}