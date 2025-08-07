#!/usr/bin/env node

/**
 * 🚑 Quick Fix para Apps después de Workspace Optimization
 */

const fs = require('fs');
const path = require('path');

class QuickFix {
  constructor() {
    this.rootDir = process.cwd();
    this.appsDir = path.join(this.rootDir, 'apps');
  }

  async fixAll() {
    console.log('🚑 QUICK FIX - Reparando apps después de optimización\n');
    
    // 1. Fix web-app dependencies
    await this.fixWebApp();
    
    // 2. Fix api-server dependencies  
    await this.fixApiServer();
    
    // 3. Fix other apps
    await this.fixOtherApps();
    
    console.log('✅ QUICK FIX COMPLETADO!\n');
    console.log('🚀 Reinicia las apps con:');
    console.log('   cd apps/web-app && npm run dev');
    console.log('   cd apps/api-server && npm run dev');
  }

  async fixWebApp() {
    console.log('🌐 Fixing web-app...');
    
    const webAppPackageJson = path.join(this.appsDir, 'web-app', 'package.json');
    if (fs.existsSync(webAppPackageJson)) {
      const pkg = JSON.parse(fs.readFileSync(webAppPackageJson, 'utf8'));
      
      // Limpiar completamente las dependencias internas problemáticas
      const deps = pkg.dependencies || {};
      const newDeps = {};
      
      // Solo mantener dependencias externas
      Object.keys(deps).forEach(dep => {
        if (!dep.startsWith('@altamedica/')) {
          newDeps[dep] = deps[dep];
        }
      });
      
      // Agregar solo las esenciales que existen
      newDeps['@altamedica/firebase'] = 'workspace:*';
      
      pkg.dependencies = newDeps;
      
      fs.writeFileSync(webAppPackageJson, JSON.stringify(pkg, null, 2));
      console.log('   ✅ web-app: dependencias limpiadas');
    }
  }

  async fixApiServer() {
    console.log('🔧 Fixing api-server...');
    
    const apiPackageJson = path.join(this.appsDir, 'api-server', 'package.json');
    if (fs.existsSync(apiPackageJson)) {
      const pkg = JSON.parse(fs.readFileSync(apiPackageJson, 'utf8'));
      
      const deps = pkg.dependencies || {};
      const newDeps = {};
      
      // Solo mantener dependencias externas
      Object.keys(deps).forEach(dep => {
        if (!dep.startsWith('@altamedica/')) {
          newDeps[dep] = deps[dep];
        }
      });
      
      // Agregar solo las que existen realmente
      newDeps['@altamedica/firebase'] = 'workspace:*';
      newDeps['@altamedica/types'] = 'workspace:*';
      
      pkg.dependencies = newDeps;
      
      fs.writeFileSync(apiPackageJson, JSON.stringify(pkg, null, 2));
      console.log('   ✅ api-server: dependencias limpiadas');
    }
  }

  async fixOtherApps() {
    console.log('🔄 Fixing other apps...');
    
    const apps = ['doctors', 'patients', 'companies', 'admin'];
    
    for (const app of apps) {
      const appPackageJson = path.join(this.appsDir, app, 'package.json');
      if (fs.existsSync(appPackageJson)) {
        const pkg = JSON.parse(fs.readFileSync(appPackageJson, 'utf8'));
        
        const deps = pkg.dependencies || {};
        const newDeps = {};
        
        // Solo mantener dependencias externas
        Object.keys(deps).forEach(dep => {
          if (!dep.startsWith('@altamedica/')) {
            newDeps[dep] = deps[dep];
          }
        });
        
        // Agregar solo las que existen
        newDeps['@altamedica/firebase'] = 'workspace:*';
        newDeps['@altamedica/ui'] = 'workspace:*';
        newDeps['@altamedica/medical'] = 'workspace:*';
        
        pkg.dependencies = newDeps;
        
        fs.writeFileSync(appPackageJson, JSON.stringify(pkg, null, 2));
        console.log(`   ✅ ${app}: dependencias limpiadas`);
      }
    }
  }
}

// Ejecutar fix
const fixer = new QuickFix();
fixer.fixAll();