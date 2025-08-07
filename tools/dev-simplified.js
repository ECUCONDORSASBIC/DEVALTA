#!/usr/bin/env node

/**
 * 🚀 AltaMedica Development - Simplificado
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🏥 ALTAMEDICA DEVELOPMENT - STACK SIMPLIFICADO\n');

const apps = [
  { name: 'web-app', port: 3000, path: 'apps/web-app' },
  { name: 'api-server', port: 3001, path: 'apps/api-server' },
  { name: 'doctors', port: 3002, path: 'apps/doctors' },
  { name: 'patients', port: 3003, path: 'apps/patients' }
];

console.log('📦 Iniciando apps principales...\n');

apps.forEach(app => {
  console.log(`🚀 Iniciando ${app.name} en puerto ${app.port}...`);
  
  const child = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, app.path),
    stdio: 'inherit',
    shell: true
  });
  
  child.on('error', (err) => {
    console.error(`❌ Error iniciando ${app.name}:`, err.message);
  });
});

console.log(`
✅ Stack iniciado! URLs disponibles:

🌐 Web App (Gateway):     http://localhost:3000
🔧 API Server:            http://localhost:3001  
🏥 Doctors Portal:        http://localhost:3002
👤 Patients Portal:       http://localhost:3003

📊 Health Checks:
   curl http://localhost:3001/api/health
   
🎯 Todo funcionando con workspace simplificado!
`);
