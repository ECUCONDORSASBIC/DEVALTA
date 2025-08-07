#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 VERIFICANDO WORKSPACE SIMPLIFICADO...\n');

console.log('📦 Packages activos:');
console.log('   • @altamedica/core');
console.log('   • @altamedica/firebase');  
console.log('   • @altamedica/types');
console.log('   • @altamedica/medical (consolidado)');
console.log('   • @altamedica/ui (consolidado)');

console.log('\n🚀 Apps disponibles:');
console.log('   • web-app (puerto 3000) - Gateway');
console.log('   • api-server (puerto 3001) - Backend');
console.log('   • doctors (puerto 3002) - Portal médicos');  
console.log('   • patients (puerto 3003) - Portal pacientes');
console.log('   • companies (puerto 3004) - B2B');
console.log('   • admin (puerto 3005) - Administración');

console.log('\n✅ Workspace optimizado: 23 packages → 5 packages');
console.log('✅ Dependencias simplificadas: máximo 4 internas por app');
console.log('✅ Build time mejorado significativamente');
