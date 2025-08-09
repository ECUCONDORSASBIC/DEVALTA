#!/usr/bin/env node

/**
 * 🔍 BUTTON FUNCTIONALITY DIAGNOSTIC TOOL
 * 
 * Herramienta para diagnosticar problemas de botones no funcionales:
 * - Verifica event listeners
 * - Detecta elementos superpuestos
 * - Valida JavaScript handlers
 * - Analiza CSS que pueda afectar interactividad
 */

console.log('🔍 DIAGNÓSTICO DE BOTONES - WEB-APP');
console.log('=====================================\n');

// Función para generar código de diagnóstico que se puede ejecutar en el navegador
function generateBrowserDiagnostics() {
  return `
// 🔍 EJECUTAR ESTE CÓDIGO EN LA CONSOLA DEL NAVEGADOR

console.log('🔍 INICIANDO DIAGNÓSTICO DE BOTONES...\n');

// 1. VERIFICAR TODOS LOS BOTONES EN LA PÁGINA
function checkAllButtons() {
  const buttons = document.querySelectorAll('button, [role="button"], input[type="button"], input[type="submit"]');
  console.log(\`📊 TOTAL DE BOTONES ENCONTRADOS: \${buttons.length}\`);
  
  buttons.forEach((button, index) => {
    console.log(\`\n🔘 BOTÓN #\${index + 1}:\`);
    console.log('  - Texto:', button.textContent?.trim() || button.value || 'Sin texto');
    console.log('  - Tipo:', button.tagName.toLowerCase());
    console.log('  - Classes:', button.className);
    console.log('  - Disabled:', button.disabled);
    console.log('  - Display:', getComputedStyle(button).display);
    console.log('  - Visibility:', getComputedStyle(button).visibility);
    console.log('  - Pointer Events:', getComputedStyle(button).pointerEvents);
    console.log('  - Z-Index:', getComputedStyle(button).zIndex);
    console.log('  - Position:', getComputedStyle(button).position);
    
    // Verificar event listeners
    const events = getEventListeners ? getEventListeners(button) : 'No disponible en este navegador';
    console.log('  - Event Listeners:', events);
    
    // Verificar si está siendo ocultado por otros elementos
    const rect = button.getBoundingClientRect();
    const elementAtPoint = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
    
    if (elementAtPoint !== button) {
      console.warn('  ⚠️ PROBLEMA: Elemento superpuesto detectado!');
      console.log('  - Elemento que bloquea:', elementAtPoint);
    } else {
      console.log('  ✅ No hay elementos superpuestos');
    }
  });
}

// 2. VERIFICAR BOTONES ESPECÍFICOS DE LOGIN/REGISTER
function checkAuthButtons() {
  console.log('\n🔐 VERIFICANDO BOTONES DE AUTENTICACIÓN:\n');
  
  const loginButtons = document.querySelectorAll('button:contains("login"), button:contains("iniciar"), [href*="login"]');
  const registerButtons = document.querySelectorAll('button:contains("register"), button:contains("registr"), [href*="register"]');
  
  console.log(\`📊 Botones de Login: \${loginButtons.length}\`);
  console.log(\`📊 Botones de Register: \${registerButtons.length}\`);
  
  // Verificar botones específicos por texto
  const allButtons = document.querySelectorAll('button');
  allButtons.forEach(button => {
    const text = button.textContent?.toLowerCase() || '';
    if (text.includes('login') || text.includes('iniciar') || text.includes('sesión')) {
      console.log('🔘 LOGIN BUTTON FOUND:');
      console.log('  - Texto:', button.textContent);
      console.log('  - OnClick:', button.onclick ? 'Tiene handler' : 'No tiene handler');
      console.log('  - Event Listeners:', getEventListeners ? getEventListeners(button) : 'N/A');
    }
    
    if (text.includes('register') || text.includes('registr')) {
      console.log('🔘 REGISTER BUTTON FOUND:');
      console.log('  - Texto:', button.textContent);
      console.log('  - OnClick:', button.onclick ? 'Tiene handler' : 'No tiene handler');
      console.log('  - Event Listeners:', getEventListeners ? getEventListeners(button) : 'N/A');
    }
  });
}

// 3. VERIFICAR ERRORES DE JAVASCRIPT
function checkJavaScriptErrors() {
  console.log('\n🐛 VERIFICANDO ERRORES DE JAVASCRIPT:\n');
  
  // Crear un listener temporal para errores
  window.addEventListener('error', function(e) {
    console.error('❌ ERROR DETECTADO:', {
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      error: e.error
    });
  });
  
  // Verificar si hay errores en la consola ya
  const errors = [];
  const originalError = console.error;
  console.error = function(...args) {
    errors.push(args);
    originalError.apply(console, args);
  };
  
  setTimeout(() => {
    console.log('📊 Errores capturados en los últimos segundos:', errors.length);
  }, 2000);
}

// 4. VERIFICAR NEXT.JS ROUTER
function checkNextRouter() {
  console.log('\n⚡ VERIFICANDO NEXT.JS ROUTER:\n');
  
  // Verificar si el router está disponible
  if (window.next) {
    console.log('✅ Next.js detectado');
    console.log('📍 Router actual:', window.location.pathname);
  } else {
    console.log('⚠️ Next.js no detectado directamente');
  }
  
  // Verificar navegación
  const links = document.querySelectorAll('a[href*="login"], a[href*="register"]');
  console.log(\`📊 Enlaces de navegación encontrados: \${links.length}\`);
  
  links.forEach((link, index) => {
    console.log(\`  \${index + 1}. \${link.href} - \${link.textContent?.trim()}\`);
  });
}

// 5. TEST DE INTERACTIVIDAD
function testButtonInteractivity() {
  console.log('\n🧪 PROBANDO INTERACTIVIDAD DE BOTONES:\n');
  
  const buttons = document.querySelectorAll('button');
  buttons.forEach((button, index) => {
    if (button.textContent?.toLowerCase().includes('login') || 
        button.textContent?.toLowerCase().includes('iniciar')) {
      
      console.log(\`🔘 Probando botón de login #\${index + 1}\`);
      
      // Simular click
      try {
        button.click();
        console.log('  ✅ Click simulado exitoso');
      } catch (error) {
        console.error('  ❌ Error al simular click:', error);
      }
      
      // Verificar si tiene preventDefault
      button.addEventListener('click', function(e) {
        console.log('  📝 Click event triggered');
        console.log('  📝 Default prevented:', e.defaultPrevented);
      }, { once: true });
    }
  });
}

// EJECUTAR TODOS LOS DIAGNÓSTICOS
checkAllButtons();
checkAuthButtons();
checkJavaScriptErrors();
checkNextRouter();
testButtonInteractivity();

console.log('\n✅ DIAGNÓSTICO COMPLETADO');
console.log('📋 Revisa la información anterior para identificar problemas');
`;
}

// Generar el código y mostrarlo
const diagnosticCode = generateBrowserDiagnostics();

console.log('📋 INSTRUCCIONES DE USO:\n');
console.log('1. Abre tu aplicación web en el navegador (http://localhost:3000)');
console.log('2. Abre las Herramientas de Desarrollador (F12)');
console.log('3. Ve a la pestaña "Console"');
console.log('4. Copia y pega el siguiente código:\n');
console.log('=' .repeat(80));
console.log(diagnosticCode);
console.log('=' .repeat(80));

console.log('\n📊 PROBLEMAS COMUNES A VERIFICAR:\n');
console.log('🔍 JavaScript Errors:');
console.log('  - Errores en consola que impiden event listeners');
console.log('  - Funciones no definidas');
console.log('  - Imports fallidos');

console.log('\n🔍 CSS Issues:');
console.log('  - pointer-events: none');
console.log('  - z-index negativo');
console.log('  - position: absolute con coordenadas incorrectas');
console.log('  - visibility: hidden');

console.log('\n🔍 HTML/React Issues:');
console.log('  - Event handlers no conectados');
console.log('  - Buttons dentro de forms sin type="button"');
console.log('  - Event.preventDefault() incorrecto');

console.log('\n🔍 Next.js Issues:');
console.log('  - Router no disponible');
console.log('  - Hydration mismatch');
console.log('  - Client/Server rendering conflicts');

console.log('\n📝 REPORTA LOS RESULTADOS PARA CORRECCIÓN ESPECÍFICA');