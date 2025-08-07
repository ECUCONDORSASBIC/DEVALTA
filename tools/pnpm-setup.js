#!/usr/bin/env node

/**
 * 🚀 AltaMedica pnpm Setup Definitivo
 * Configuración completa de pnpm para workspace optimizado
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PnpmSetup {
  constructor() {
    this.rootDir = process.cwd();
  }

  async setupComplete() {
    console.log('🚀 CONFIGURACIÓN DEFINITIVA DE PNPM PARA ALTAMEDICA\n');
    
    // 1. Verificar pnpm
    await this.verifyPnpm();
    
    // 2. Configurar workspace optimizado
    await this.configureWorkspace();
    
    // 3. Limpiar e instalar dependencias
    await this.cleanInstall();
    
    // 4. Verificar funcionamiento
    await this.verifySetup();
    
    // 5. Crear scripts de desarrollo
    await this.createDevScripts();
    
    console.log('✅ PNPM CONFIGURADO DEFINITIVAMENTE!\n');
    this.showCommands();
  }

  async verifyPnpm() {
    console.log('🔍 Verificando pnpm...');
    
    try {
      const version = execSync('pnpm --version', { encoding: 'utf8' }).trim();
      console.log(`   ✅ pnpm versión: ${version}`);
      
      // Verificar configuración pnpm
      try {
        const config = execSync('pnpm config list', { encoding: 'utf8' });
        console.log('   ✅ Configuración pnpm disponible');
      } catch (e) {
        console.log('   ⚠️ Configuración pnpm básica');
      }
      
    } catch (e) {
      console.log('   ❌ Error: pnpm no está disponible');
      console.log('   💡 Instalar con: npm install -g pnpm');
      process.exit(1);
    }
    
    console.log('');
  }

  async configureWorkspace() {
    console.log('⚙️ Configurando workspace optimizado...');
    
    // Verificar pnpm-workspace.yaml
    const workspaceFile = path.join(this.rootDir, 'pnpm-workspace.yaml');
    if (fs.existsSync(workspaceFile)) {
      const content = fs.readFileSync(workspaceFile, 'utf8');
      console.log('   ✅ pnpm-workspace.yaml configurado');
      console.log('   📦 Packages:', content.split('\\n').filter(line => line.includes('packages/')).length);
    } else {
      console.log('   ❌ pnpm-workspace.yaml no encontrado');
    }
    
    // Crear .pnpmrc optimizado
    const pnpmrcContent = `# AltaMedica pnpm Configuration
auto-install-peers=true
strict-peer-dependencies=false
shamefully-hoist=false
shared-workspace-lockfile=true
link-workspace-packages=true
prefer-workspace-packages=true
save-workspace-protocol=true
enable-pre-post-scripts=true
`;
    
    fs.writeFileSync(path.join(this.rootDir, '.pnpmrc'), pnpmrcContent);
    console.log('   ✅ .pnpmrc optimizado creado');
    
    console.log('');
  }

  async cleanInstall() {
    console.log('🧹 Instalación limpia con pnpm...');
    
    try {
      // Limpiar node_modules previos
      console.log('   🗑️ Limpiando instalaciones previas...');
      execSync('rm -rf node_modules pnpm-lock.yaml', { cwd: this.rootDir, stdio: 'pipe' });
      
      // Instalar con pnpm
      console.log('   📦 Instalando dependencias...');
      execSync('pnpm install', { cwd: this.rootDir, stdio: 'inherit' });
      
      console.log('   ✅ Instalación completada exitosamente');
      
    } catch (e) {
      console.log('   ⚠️ Error en instalación:', e.message);
      console.log('   💡 Continuando con verificación...');
    }
    
    console.log('');
  }

  async verifySetup() {
    console.log('✅ Verificando configuración...');
    
    try {
      // Verificar workspace
      const workspaceList = execSync('pnpm list --depth=0', { 
        cwd: this.rootDir, 
        encoding: 'utf8' 
      });
      
      console.log('   ✅ Workspace funcional');
      
      // Contar packages
      const packageCount = (workspaceList.match(/packages\//g) || []).length;
      console.log(`   📦 Packages detectados: ${packageCount}`);
      
      // Verificar apps
      const apps = ['web-app', 'api-server', 'doctors', 'patients'];
      apps.forEach(app => {
        const appPath = path.join(this.rootDir, 'apps', app);
        if (fs.existsSync(appPath)) {
          console.log(`   ✅ App: ${app}`);
        } else {
          console.log(`   ⚠️ App: ${app} (no encontrada)`);
        }
      });
      
    } catch (e) {
      console.log('   ⚠️ Error en verificación:', e.message);
    }
    
    console.log('');
  }

  async createDevScripts() {
    console.log('🛠️ Creando scripts de desarrollo optimizados...');
    
    // Script de desarrollo rápido
    const quickDevScript = `#!/bin/bash
# 🚀 AltaMedica Quick Development con pnpm

echo "🏥 INICIANDO ALTAMEDICA CON PNPM OPTIMIZADO"
echo ""

# Verificar pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm no está instalado"
    echo "💡 Instalar con: npm install -g pnpm"
    exit 1
fi

# Verificar workspace
cd "$(dirname "$0")"
if [ ! -f "pnpm-workspace.yaml" ]; then
    echo "❌ No se encontró pnpm-workspace.yaml"
    exit 1
fi

echo "✅ pnpm versión: $(pnpm --version)"
echo "📦 Workspace detectado"
echo ""

echo "🚀 Iniciando aplicaciones principales..."
echo "   • web-app (puerto 3000) - Gateway central"
echo "   • api-server (puerto 3001) - Backend APIs"
echo ""

# Iniciar aplicaciones core
pnpm run dev:core

echo ""
echo "🎯 URLs disponibles:"
echo "   🌐 Web App: http://localhost:3000"
echo "   🔧 API Server: http://localhost:3001"
echo ""
echo "✅ Stack iniciado con pnpm!"
`;
    
    fs.writeFileSync(path.join(this.rootDir, 'quick-dev.sh'), quickDevScript);
    fs.chmodSync(path.join(this.rootDir, 'quick-dev.sh'), '755');
    
    // Script de verificación pnpm
    const checkScript = `#!/usr/bin/env node

console.log('🔍 VERIFICACIÓN PNPM ALTAMEDICA\\n');

const { execSync } = require('child_process');
const fs = require('fs');

try {
  // Verificar pnpm
  const version = execSync('pnpm --version', { encoding: 'utf8' }).trim();
  console.log(\`✅ pnpm versión: \${version}\`);
  
  // Verificar workspace
  if (fs.existsSync('pnpm-workspace.yaml')) {
    console.log('✅ Workspace configurado');
    
    const workspace = fs.readFileSync('pnpm-workspace.yaml', 'utf8');
    const packages = workspace.split('\\n').filter(line => line.trim().startsWith('-')).length;
    console.log(\`📦 Packages configurados: \${packages}\`);
  }
  
  // Verificar instalación
  try {
    execSync('pnpm list --depth=0', { stdio: 'pipe' });
    console.log('✅ Dependencias instaladas');
  } catch (e) {
    console.log('⚠️ Dependencias necesitan instalación');
    console.log('💡 Ejecutar: pnpm install');
  }
  
  console.log('\\n🚀 Comandos disponibles:');
  console.log('   pnpm run dev:all     # Todas las apps');
  console.log('   pnpm run dev:core    # Core (web-app + api-server)');
  console.log('   pnpm run dev:medical # Medical (doctors + patients)');
  console.log('   ./quick-dev.sh       # Script rápido');
  
} catch (e) {
  console.log('❌ Error:', e.message);
  console.log('💡 Instalar pnpm: npm install -g pnpm');
}
`;
    
    fs.writeFileSync(path.join(this.rootDir, 'tools', 'check-pnpm.js'), checkScript);
    
    console.log('   ✅ quick-dev.sh creado');
    console.log('   ✅ check-pnpm.js creado');
    console.log('');
  }

  showCommands() {
    console.log('🎯 COMANDOS PNPM OPTIMIZADOS DISPONIBLES:\n');
    
    console.log('🚀 **DESARROLLO DIARIO:**');
    console.log('   pnpm run dev:core        # Core apps (web-app + api-server)');
    console.log('   pnpm run dev:all         # Todas las apps principales');
    console.log('   pnpm run dev:medical     # Apps médicas (doctors + patients)');
    console.log('   ./quick-dev.sh           # Script bash optimizado');
    console.log('');
    
    console.log('📦 **GESTIÓN DE PACKAGES:**');
    console.log('   pnpm install             # Instalar dependencias');
    console.log('   pnpm run build:all       # Build completo');
    console.log('   pnpm run build:packages  # Solo packages');
    console.log('   pnpm run build:apps      # Solo apps');
    console.log('');
    
    console.log('🧪 **TESTING:**');
    console.log('   pnpm run test:all        # Todos los tests');
    console.log('   pnpm run test:apps       # Tests de apps');
    console.log('   pnpm run lint:all        # Linting completo');
    console.log('');
    
    console.log('🔧 **MANTENIMIENTO:**');
    console.log('   pnpm run clean           # Limpiar builds');
    console.log('   pnpm run fresh-install   # Instalación limpia');
    console.log('   pnpm run workspace:check # Verificar workspace');
    console.log('   node tools/check-pnpm.js # Verificar pnpm setup');
    console.log('');
    
    console.log('🎯 **PRÓXIMO PASO:**');
    console.log('   pnpm run dev:core');
    console.log('   # O ejecutar: ./quick-dev.sh');
    console.log('');
  }
}

// Ejecutar setup
const setup = new PnpmSetup();
setup.setupComplete();