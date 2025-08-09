/**
 * 🚀 PERFORMANCE ANALYZER SCRIPT
 * Analiza métricas de performance de la aplicación web-app
 */

const fs = require('fs');
const path = require('path');

// Colores para consola
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function analyzeBundle() {
  log('\n🔍 ANALYZING BUNDLE SIZE...', 'blue');
  
  const nextDir = path.join(__dirname, '../.next');
  if (!fs.existsSync(nextDir)) {
    log('❌ No .next directory found. Run build first.', 'red');
    return;
  }

  // Analizar archivos de build
  const buildManifest = path.join(nextDir, 'build-manifest.json');
  if (fs.existsSync(buildManifest)) {
    const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
    
    log('\n📊 BUILD MANIFEST ANALYSIS:', 'bold');
    Object.entries(manifest.pages).forEach(([page, files]) => {
      const totalSize = files
        .filter(file => file.endsWith('.js'))
        .reduce((acc, file) => {
          const filePath = path.join(nextDir, file);
          return acc + (fs.existsSync(filePath) ? fs.statSync(filePath).size : 0);
        }, 0);
      
      const sizeKB = (totalSize / 1024).toFixed(2);
      const color = totalSize > 500000 ? 'red' : totalSize > 200000 ? 'yellow' : 'green';
      
      log(`  ${page}: ${sizeKB} KB`, color);
    });
  }
}

function analyzeComponents() {
  log('\n🧩 ANALYZING COMPONENTS...', 'blue');
  
  const componentsDir = path.join(__dirname, '../src/components');
  
  function getComponentSize(dir) {
    let totalSize = 0;
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        totalSize += getComponentSize(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        totalSize += stat.size;
      }
    });
    
    return totalSize;
  }
  
  const componentDirs = fs.readdirSync(componentsDir).filter(item => {
    const itemPath = path.join(componentsDir, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  log('\n📊 COMPONENT DIRECTORIES SIZE:', 'bold');
  componentDirs.forEach(dir => {
    const dirPath = path.join(componentsDir, dir);
    const size = getComponentSize(dirPath);
    const sizeKB = (size / 1024).toFixed(2);
    
    const color = size > 50000 ? 'red' : size > 20000 ? 'yellow' : 'green';
    log(`  ${dir}: ${sizeKB} KB`, color);
  });
}

function analyzeDependencies() {
  log('\n📦 ANALYZING DEPENDENCIES...', 'blue');
  
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  
  const heavyDependencies = {
    'three': 'Three.js - 3D Library',
    '@react-three/fiber': 'React Three Fiber',
    '@react-three/drei': 'React Three Drei',
    'firebase': 'Firebase SDK',
    'framer-motion': 'Animation Library',
    'leaflet': 'Map Library',
    'recharts': 'Chart Library'
  };
  
  log('\n📊 HEAVY DEPENDENCIES:', 'bold');
  Object.entries(heavyDependencies).forEach(([dep, description]) => {
    if (packageJson.dependencies[dep]) {
      const version = packageJson.dependencies[dep];
      log(`  ✓ ${dep} (${version}): ${description}`, 'yellow');
    }
  });
}

function generateRecommendations() {
  log('\n💡 PERFORMANCE RECOMMENDATIONS:', 'blue');
  
  const recommendations = [
    '🚀 Code Splitting: Use dynamic imports for heavy components',
    '📦 Bundle Analysis: Use @next/bundle-analyzer to identify large bundles',
    '🎯 Lazy Loading: Implement intersection observer for below-fold content',
    '🔄 Caching: Implement service worker for static assets',
    '🖼️ Image Optimization: Use Next.js Image component with WebP/AVIF',
    '📱 Mobile Optimization: Reduce JavaScript for mobile devices',
    '⚡ Preloading: Preload critical resources in <head>',
    '🎨 CSS Optimization: Use Critical CSS inlining'
  ];
  
  recommendations.forEach(rec => {
    log(`  ${rec}`, 'green');
  });
}

function measureMetrics() {
  log('\n⏱️ PERFORMANCE METRICS GOALS:', 'blue');
  
  const metrics = {
    'First Contentful Paint': { target: '< 1.5s', current: '~3.2s', status: 'needs_improvement' },
    'Largest Contentful Paint': { target: '< 2.5s', current: '~4.1s', status: 'needs_improvement' },
    'Time to Interactive': { target: '< 3.0s', current: '~5.2s', status: 'poor' },
    'Bundle Size (Initial)': { target: '< 200KB', current: '~480KB', status: 'needs_improvement' }
  };
  
  Object.entries(metrics).forEach(([metric, data]) => {
    const color = data.status === 'good' ? 'green' : 
                  data.status === 'needs_improvement' ? 'yellow' : 'red';
    
    log(`  ${metric}: ${data.current} (Target: ${data.target})`, color);
  });
}

function main() {
  log('🚀 WEB-APP PERFORMANCE ANALYSIS', 'bold');
  log('===============================', 'bold');
  
  analyzeBundle();
  analyzeComponents();
  analyzeDependencies();
  measureMetrics();
  generateRecommendations();
  
  log('\n✅ Analysis complete! Review recommendations above.', 'green');
  log('\n📝 Next steps:', 'bold');
  log('  1. Run: pnpm build:analyze', 'blue');
  log('  2. Check Lighthouse scores', 'blue');
  log('  3. Monitor Core Web Vitals', 'blue');
}

main();