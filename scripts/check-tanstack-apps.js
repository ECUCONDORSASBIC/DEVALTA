const fs = require('fs');
const path = require('path');

console.log('🔍 ANÁLISIS DE TANSTACK QUERY EN APPS\n');

const appsDir = 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps';
const apps = fs.readdirSync(appsDir);

const results = [];

apps.forEach(appName => {
  const packageJsonPath = path.join(appsDir, appName, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageContent = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const hasTanstack = !!(packageContent.dependencies && packageContent.dependencies['@tanstack/react-query']);
      const hasAltamedicaHooks = !!(packageContent.dependencies && packageContent.dependencies['@altamedica/hooks']);
      
      results.push({
        app: appName,
        hasTanstack,
        hasAltamedicaHooks,
        tanstackVersion: hasTanstack ? packageContent.dependencies['@tanstack/react-query'] : null
      });
      
      console.log(`📦 ${appName}:`);
      console.log(`   - TanStack Query: ${hasTanstack ? '✅ ' + packageContent.dependencies['@tanstack/react-query'] : '❌'}`);
      console.log(`   - @altamedica/hooks: ${hasAltamedicaHooks ? '✅' : '❌'}`);
      console.log('');
    } catch (error) {
      console.log(`❌ Error reading ${appName}/package.json:`, error.message);
    }
  }
});

console.log('📊 RESUMEN:');
const withTanstack = results.filter(r => r.hasTanstack);
const withAltamedicaHooks = results.filter(r => r.hasAltamedicaHooks);
const withBoth = results.filter(r => r.hasTanstack && r.hasAltamedicaHooks);

console.log(`- Apps con TanStack Query: ${withTanstack.length}/${results.length}`);
console.log(`- Apps con @altamedica/hooks: ${withAltamedicaHooks.length}/${results.length}`);  
console.log(`- Apps con ambos: ${withBoth.length}/${results.length}`);

if (withBoth.length > 0) {
  console.log('\n🎯 APPS CON CONFLICTO POTENCIAL (TanStack + useQuery personalizado):');
  withBoth.forEach(app => {
    console.log(`   - ${app.app}: TanStack ${app.tanstackVersion}`);
  });
}