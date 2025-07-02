const fs = require('fs');
const path = require('path');

const appsToFix = [
  'api-server',
  'doctors', 
  'companies',
  'web-app',
  'anthropic-simulator'
];

const tailwindStandaloneConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};`;

const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`;

function fixApp(appName) {
  const appPath = path.join(__dirname, 'apps', appName);
  
  console.log(`🔧 Arreglando ${appName}...`);
  
  // Fix Tailwind config
  const tailwindPath = path.join(appPath, 'tailwind.config.js');
  if (fs.existsSync(tailwindPath)) {
    fs.writeFileSync(tailwindPath, tailwindStandaloneConfig);
    console.log(`  ✅ Tailwind config actualizado`);
  }
  
  // Fix PostCSS config  
  const postcssPath = path.join(appPath, 'postcss.config.js');
  if (fs.existsSync(postcssPath)) {
    fs.writeFileSync(postcssPath, postcssConfig);
    console.log(`  ✅ PostCSS config actualizado`);
  }
  
  // Fix package.json - remove "type": "module" if exists
  const packagePath = path.join(appPath, 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    if (packageContent.type === 'module') {
      delete packageContent.type;
      fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2));
      console.log(`  ✅ package.json actualizado (removido type: module)`);
    }
  }
  
  console.log(`✅ ${appName} arreglado!\n`);
}

console.log('🚀 Iniciando reparación de todas las aplicaciones...\n');

appsToFix.forEach(fixApp);

console.log('🎉 ¡Todas las aplicaciones han sido arregladas!');
console.log('\n📋 Resumen de aplicaciones procesadas:');
appsToFix.forEach(app => console.log(`  - ${app}`));

console.log('\n🏃‍♂️ Ahora puedes ejecutar:');
console.log('  pnpm dev:all  # Para ejecutar todas las apps');
console.log('  o ejecutar cada app individualmente');
