// Script ultra simple para verificar el estado actual
const fetch = require('node-fetch');

async function checkStatus() {
  console.log('🔍 VERIFICACIÓN RÁPIDA DE ESTADO\n');
  
  // 1. Web App (Login)
  try {
    const web = await fetch('http://localhost:3000');
    console.log(`✅ Web App (3000): ${web.ok ? 'ACTIVA' : 'ERROR'}`);
  } catch (e) {
    console.log('❌ Web App (3000): NO RESPONDE');
  }
  
  // 2. API Server
  try {
    const api = await fetch('http://localhost:3001/api/health');
    const health = await api.text();
    console.log(`✅ API Server (3001): ${api.ok ? 'ACTIVO' : 'ERROR'} - ${health}`);
  } catch (e) {
    console.log('❌ API Server (3001): NO RESPONDE');
  }
  
  // 3. Patients App
  try {
    const patients = await fetch('http://localhost:3003');
    console.log(`✅ Patients App (3003): ${patients.ok ? 'ACTIVA' : 'ERROR'}`);
  } catch (e) {
    console.log('❌ Patients App (3003): NO RESPONDE');
  }
  
  // 4. Signaling Server
  try {
    const signal = await fetch('http://localhost:8888/health');
    console.log(`✅ Signaling (8888): ${signal.ok ? 'ACTIVO' : 'ERROR'}`);
  } catch (e) {
    console.log('❌ Signaling (8888): NO RESPONDE');
  }
  
  console.log('\n📋 RESUMEN:');
  console.log('- Si algún servicio no responde, inícialo con npm run dev');
  console.log('- La contraseña correcta parece ser: test123');
  console.log('- El usuario eeecucondor@gmail.com tiene rol: patient');
}

// Verificar node-fetch
try {
  require.resolve('node-fetch');
  checkStatus();
} catch (e) {
  const { execSync } = require('child_process');
  console.log('Instalando node-fetch...');
  execSync('npm install node-fetch@2', { stdio: 'inherit' });
  delete require.cache[require.resolve('./quick-status-check.js')];
  require('./quick-status-check.js');
}