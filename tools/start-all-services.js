#!/usr/bin/env node
/**
 * 🚀 INICIADOR COORDINADO DE SERVICIOS ALTAMEDICA
 * ===============================================
 * Inicia todos los servicios y verifica que funcionen
 */

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

class ServiceLauncher {
  constructor() {
    this.services = [
      { name: 'API Server', port: 3001, dir: './apps/api-server' },
      { name: 'Companies API', port: 3002, dir: './apps/companies' },
      { name: 'Doctors API', port: 3003, dir: './apps/doctors' }
    ];
    this.processes = [];
  }

  async startServices() {
    console.log('🚀 INICIANDO SERVICIOS ALTAMEDICA');
    console.log('=================================\n');

    for (const service of this.services) {
      console.log(`🔄 Iniciando ${service.name} en puerto ${service.port}...`);
      
      const process = spawn('pnpm', ['--filter', service.dir, 'dev'], {
        stdio: 'pipe',
        shell: true
      });

      process.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Ready') || output.includes('started server') || output.includes('compiled successfully')) {
          console.log(`✅ ${service.name} - INICIADO correctamente`);
        }
      });

      process.stderr.on('data', (data) => {
        const error = data.toString();
        if (error.includes('EADDRINUSE')) {
          console.log(`⚠️  ${service.name} - Puerto ${service.port} ocupado`);
        } else if (error.includes('Error')) {
          console.log(`❌ ${service.name} - Error: ${error.substring(0, 100)}...`);
        }
      });

      this.processes.push({ ...service, process });
      
      // Esperar un poco entre servicios
      await setTimeout(3000);
    }

    console.log('\n⏳ Esperando que todos los servicios se estabilicen...');
    await setTimeout(10000);

    // Verificar salud de servicios
    await this.checkServices();
  }

  async checkServices() {
    console.log('\n🏥 VERIFICANDO SALUD DE SERVICIOS');
    console.log('================================');

    for (const service of this.services) {
      try {
        const endpoint = service.port === 3001 ? '/api/v1/health' : '/api/health';
        const response = await fetch(`http://localhost:${service.port}${endpoint}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${service.name} - HEALTHY (${response.status})`);
        } else {
          console.log(`⚠️  ${service.name} - Responde pero con error (${response.status})`);
        }
      } catch (error) {
        console.log(`❌ ${service.name} - NO RESPONDE`);
      }
    }

    console.log('\n🎯 Servicios iniciados. Usa Ctrl+C para detener todos.');
  }

  async stop() {
    console.log('\n🛑 Deteniendo todos los servicios...');
    this.processes.forEach(({ name, process }) => {
      console.log(`   Deteniendo ${name}...`);
      process.kill();
    });
  }
}

// Manejar cierre limpio
process.on('SIGINT', async () => {
  console.log('\n🛑 Señal de cierre recibida...');
  process.exit(0);
});

// Iniciar servicios
const launcher = new ServiceLauncher();
launcher.startServices().catch(console.error);
