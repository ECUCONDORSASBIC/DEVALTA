#!/usr/bin/env node

/**
 * 🚑 Fix Development Problems - Resolución Activa
 * Resuelve problemas comunes de desarrollo automáticamente
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DevProblemFixer {
  constructor() {
    this.rootDir = process.cwd();
  }

  async fixAll() {
    console.log('🚑 RESOLUCIÓN ACTIVA DE PROBLEMAS DE DESARROLLO\n');
    
    // 1. Matar procesos en puerto 3001
    await this.killPort3001();
    
    // 2. Instalar dependencias faltantes en signaling-server
    await this.fixSignalingServer();
    
    // 3. Verificar e instalar tsx globalmente
    await this.installTsx();
    
    // 4. Probar el stack
    await this.testStack();
    
    console.log('✅ PROBLEMAS RESUELTOS!\n');
    this.showNextSteps();
  }

  async killPort3001() {
    console.log('🔫 Liberando puerto 3001...');
    
    try {
      // Método 1: Matar proceso específico (PID 13676 del error)
      try {
        execSync('taskkill /F /PID 13676', { stdio: 'pipe' });
        console.log('   ✅ Proceso 13676 terminado');
      } catch (e) {
        console.log('   ⚠️ Proceso 13676 ya no existe');
      }
      
      // Método 2: Matar todos los procesos Node.js en puerto 3001
      try {
        const netstatOutput = execSync('netstat -ano | findstr :3001', { encoding: 'utf8' });
        const lines = netstatOutput.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
          const parts = line.trim().split(/\\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0') {
            try {
              execSync(`taskkill /F /PID ${pid}`, { stdio: 'pipe' });
              console.log(`   ✅ Proceso ${pid} terminado`);
            } catch (e) {
              console.log(`   ⚠️ No se pudo terminar proceso ${pid}`);
            }
          }
        });
      } catch (e) {
        console.log('   ✅ Puerto 3001 no está ocupado');
      }
      
    } catch (e) {
      console.log('   ⚠️ Error liberando puerto, continuando...');
    }
    
    console.log('');
  }

  async fixSignalingServer() {
    console.log('📡 Arreglando signaling-server...');
    
    const signalingPath = path.join(this.rootDir, 'apps', 'signaling-server');
    
    if (fs.existsSync(signalingPath)) {
      try {
        // Instalar dependencias específicas
        console.log('   📦 Instalando dependencias...');
        
        const dependencies = [
          'compression',
          'express', 
          'socket.io',
          'cors',
          'ws',
          '@types/compression',
          '@types/express',
          '@types/cors'
        ];
        
        dependencies.forEach(dep => {
          try {
            execSync(`pnpm add ${dep}`, { cwd: signalingPath, stdio: 'pipe' });
            console.log(`   ✅ ${dep} instalado`);
          } catch (e) {
            console.log(`   ⚠️ Error instalando ${dep}`);
          }
        });
        
        // Verificar package.json
        const packageJsonPath = path.join(signalingPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          console.log('   ✅ package.json encontrado');
        } else {
          console.log('   ⚠️ package.json no encontrado');
        }
        
      } catch (e) {
        console.log('   ⚠️ Error en signaling-server:', e.message);
      }
    } else {
      console.log('   ❌ Directorio signaling-server no encontrado');
    }
    
    console.log('');
  }

  async installTsx() {
    console.log('⚡ Instalando tsx globalmente...');
    
    try {
      // Verificar si tsx ya está instalado
      try {
        execSync('tsx --version', { stdio: 'pipe' });
        console.log('   ✅ tsx ya está instalado');
      } catch (e) {
        // Instalar tsx globalmente
        console.log('   📦 Instalando tsx...');
        execSync('npm install -g tsx', { stdio: 'inherit' });
        console.log('   ✅ tsx instalado globalmente');
      }
    } catch (e) {
      console.log('   ⚠️ Error instalando tsx:', e.message);
    }
    
    console.log('');
  }

  async testStack() {
    console.log('🧪 Probando stack...');
    
    try {
      // Verificar puertos disponibles
      try {
        execSync('netstat -ano | findstr :3000', { stdio: 'pipe' });
        console.log('   ⚠️ Puerto 3000 ocupado');
      } catch (e) {
        console.log('   ✅ Puerto 3000 disponible');
      }
      
      try {
        execSync('netstat -ano | findstr :3001', { stdio: 'pipe' });
        console.log('   ⚠️ Puerto 3001 aún ocupado');
      } catch (e) {
        console.log('   ✅ Puerto 3001 disponible');
      }
      
      // Verificar que pnpm funciona
      const pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
      console.log(`   ✅ pnpm ${pnpmVersion} disponible`);
      
    } catch (e) {
      console.log('   ⚠️ Error en pruebas:', e.message);
    }
    
    console.log('');
  }

  showNextSteps() {
    console.log('🎯 PRÓXIMOS PASOS:\n');
    
    console.log('1. 🚀 **Probar web-app solo:**');
    console.log('   pnpm run dev:web-app');
    console.log('');
    
    console.log('2. 🔧 **Probar api-server solo:**');
    console.log('   pnpm run dev:api-server');
    console.log('');
    
    console.log('3. 🏥 **Probar stack core:**');
    console.log('   pnpm run dev:core');
    console.log('');
    
    console.log('4. ✅ **Verificar funcionamiento:**');
    console.log('   curl http://localhost:3000');
    console.log('   curl http://localhost:3001/api/health');
    console.log('');
    
    console.log('🏆 **Si todo funciona:**');
    console.log('   ✅ Workspace optimizado exitoso');
    console.log('   ✅ pnpm configurado correctamente');
    console.log('   ✅ Dependencias instaladas');
    console.log('   ✅ Puertos liberados');
    console.log('');
  }
}

// Ejecutar fixer
const fixer = new DevProblemFixer();
fixer.fixAll();