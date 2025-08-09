/**
 * 🔒 Script de Auditoría de Seguridad Interactivo
 * Basado en el método socrático para descubrir problemas
 */

const { chromium } = require('@playwright/test');
const readline = require('readline');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Interfaz para preguntas
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (question) => new Promise(resolve => rl.question(question, resolve));

async function runSecurityAudit() {
  console.log(`${colors.cyan}╔════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║     🔒 AUDITORÍA DE SEGURIDAD SSO - MÉTODO SOCRÁTICO     ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════╝${colors.reset}\n`);

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const auditResults = {
    singleEntryPoint: null,
    cookiesSecure: null,
    tokenValidation: null,
    accessControl: null,
    auditLogging: null
  };

  // PREGUNTA 1: Punto de Entrada Único
  console.log(`${colors.yellow}📋 PREGUNTA 1: ¿Cuál es el punto de entrada para autenticación?${colors.reset}`);
  console.log("Voy a intentar acceder directamente a diferentes puertos...\n");
  
  const ports = [3000, 3002, 3003, 3005, 3006];
  const accessResults = [];
  
  for (const port of ports) {
    try {
      await page.goto(`http://localhost:${port}`, { 
        waitUntil: 'domcontentloaded', 
        timeout: 5000 
      });
      const url = page.url();
      const requiresLogin = url.includes('/login');
      
      accessResults.push({
        port,
        accessible: true,
        requiresLogin,
        url
      });
      
      console.log(`Puerto ${port}: ${requiresLogin ? '✅ Redirige a login' : '❌ Acceso directo sin login'}`);
    } catch (error) {
      console.log(`Puerto ${port}: ⚠️ No responde`);
      accessResults.push({ port, accessible: false });
    }
  }
  
  const directAccess = accessResults.filter(r => r.accessible && !r.requiresLogin);
  if (directAccess.length > 0) {
    console.log(`\n${colors.red}❌ PROBLEMA: ${directAccess.length} puertos permiten acceso sin autenticación${colors.reset}`);
    auditResults.singleEntryPoint = false;
  } else {
    console.log(`\n${colors.green}✅ BIEN: Todos los puertos requieren autenticación${colors.reset}`);
    auditResults.singleEntryPoint = true;
  }
  
  await ask('\nPresiona ENTER para continuar...');

  // PREGUNTA 2: Cookies Seguras
  console.log(`\n${colors.yellow}📋 PREGUNTA 2: ¿Las cookies de autenticación son seguras?${colors.reset}`);
  console.log("Intentando hacer login y verificar cookies...\n");
  
  // Intentar login en puerto que responda
  const loginPort = accessResults.find(r => r.accessible)?.port || 3000;
  
  try {
    await page.goto(`http://localhost:${loginPort}/login`, { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    // Intentar login con credenciales de prueba
    await page.fill('input[type="email"]', 'doctor@test.com').catch(() => {});
    await page.fill('input[type="password"]', '12345678').catch(() => {});
    await page.click('button[type="submit"]').catch(() => {});
    
    await page.waitForTimeout(3000);
    
    // Verificar cookies
    const cookies = await context.cookies();
    const authCookies = cookies.filter(c => 
      c.name.toLowerCase().includes('auth') || 
      c.name.toLowerCase().includes('token') ||
      c.name.toLowerCase().includes('session')
    );
    
    if (authCookies.length > 0) {
      console.log(`Encontradas ${authCookies.length} cookies de autenticación:\n`);
      
      authCookies.forEach(cookie => {
        const isSecure = cookie.httpOnly && cookie.secure && cookie.sameSite;
        console.log(`Cookie: ${cookie.name}`);
        console.log(`  HttpOnly: ${cookie.httpOnly ? '✅' : '❌'} ${!cookie.httpOnly ? '(Vulnerable a XSS!)' : ''}`);
        console.log(`  Secure: ${cookie.secure ? '✅' : '⚠️'} ${!cookie.secure ? '(Se transmite en HTTP!)' : ''}`);
        console.log(`  SameSite: ${cookie.sameSite || '❌'} ${!cookie.sameSite ? '(Vulnerable a CSRF!)' : ''}`);
        
        if (!isSecure) {
          auditResults.cookiesSecure = false;
        }
      });
      
      if (auditResults.cookiesSecure !== false) {
        auditResults.cookiesSecure = true;
        console.log(`\n${colors.green}✅ Cookies configuradas correctamente${colors.reset}`);
      } else {
        console.log(`\n${colors.red}❌ PROBLEMA: Cookies inseguras detectadas${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}❌ NO HAY COOKIES DE AUTENTICACIÓN${colors.reset}`);
      console.log("Esto significa que probablemente se usa localStorage (INSEGURO)\n");
      
      // Verificar localStorage
      const hasLocalStorage = await page.evaluate(() => {
        return !!(localStorage.getItem('token') || 
                 localStorage.getItem('authToken') || 
                 localStorage.getItem('user'));
      });
      
      if (hasLocalStorage) {
        console.log(`${colors.red}⚠️ CRÍTICO: Token encontrado en localStorage (vulnerable a XSS)${colors.reset}`);
      }
      
      auditResults.cookiesSecure = false;
    }
  } catch (error) {
    console.log(`${colors.yellow}No se pudo verificar (${error.message})${colors.reset}`);
  }
  
  await ask('\nPresiona ENTER para continuar...');

  // PREGUNTA 3: Control de Acceso
  console.log(`\n${colors.yellow}📋 PREGUNTA 3: ¿Qué pasa si accedo sin autenticación?${colors.reset}`);
  console.log("Intentando acceder a endpoints sensibles...\n");
  
  const sensitiveEndpoints = [
    '/api/patients',
    '/api/medical-records', 
    '/api/prescriptions',
    '/dashboard',
    '/patients/123'
  ];
  
  let unauthorizedAccess = 0;
  
  for (const endpoint of sensitiveEndpoints) {
    try {
      const response = await page.goto(`http://localhost:3008${endpoint}`, {
        waitUntil: 'domcontentloaded',
        timeout: 5000
      });
      
      const status = response?.status() || 0;
      
      if (status === 401 || status === 403) {
        console.log(`${endpoint}: ✅ Acceso denegado (${status})`);
      } else if (status === 200) {
        console.log(`${endpoint}: ❌ ACCESO PERMITIDO SIN AUTH (${status})`);
        unauthorizedAccess++;
      } else {
        console.log(`${endpoint}: ⚠️ Estado ${status}`);
      }
    } catch (error) {
      console.log(`${endpoint}: ⚠️ Error de conexión`);
    }
  }
  
  if (unauthorizedAccess > 0) {
    console.log(`\n${colors.red}❌ CRÍTICO: ${unauthorizedAccess} endpoints permiten acceso sin autenticación${colors.reset}`);
    console.log(`${colors.red}Esto viola HIPAA y puede resultar en multas millonarias${colors.reset}`);
    auditResults.accessControl = false;
  } else {
    console.log(`\n${colors.green}✅ Todos los endpoints requieren autenticación${colors.reset}`);
    auditResults.accessControl = true;
  }
  
  await ask('\nPresiona ENTER para continuar...');

  // PREGUNTA 4: Reflexión Socrática
  console.log(`\n${colors.cyan}════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}                    PREGUNTAS DE REFLEXIÓN                  ${colors.reset}`);
  console.log(`${colors.cyan}════════════════════════════════════════════════════════${colors.reset}\n`);
  
  console.log(`${colors.magenta}Basándote en lo que observaste:${colors.reset}\n`);
  
  console.log("1. ¿Por qué crees que es peligroso permitir acceso directo sin pasar por un login central?");
  console.log("   💭 Reflexiona sobre: trazabilidad, auditoría, control de sesiones\n");
  
  console.log("2. Si fueras un atacante, ¿cómo explotarías la falta de cookies httpOnly?");
  console.log("   💭 Piensa en: XSS, robo de tokens, suplantación de identidad\n");
  
  console.log("3. ¿Qué consecuencias legales podría tener el acceso no autorizado a datos médicos?");
  console.log("   💭 Considera: HIPAA ($50K-$2M por violación), GDPR, demandas\n");
  
  console.log("4. ¿Cómo afecta la experiencia del usuario no tener un SSO funcionando?");
  console.log("   💭 Imagina: múltiples logins, sesiones inconsistentes, frustración\n");
  
  await ask('\nPresiona ENTER para ver el resumen...');

  // RESUMEN FINAL
  console.log(`\n${colors.cyan}════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}                    RESUMEN DE AUDITORÍA                    ${colors.reset}`);
  console.log(`${colors.cyan}════════════════════════════════════════════════════════${colors.reset}\n`);
  
  const scorecard = [
    { 
      item: 'Punto de entrada único',
      status: auditResults.singleEntryPoint,
      impact: 'ALTO'
    },
    {
      item: 'Cookies seguras (httpOnly)',
      status: auditResults.cookiesSecure,
      impact: 'CRÍTICO'
    },
    {
      item: 'Control de acceso',
      status: auditResults.accessControl,
      impact: 'CRÍTICO'
    }
  ];
  
  console.log('SCORECARD DE SEGURIDAD:\n');
  scorecard.forEach(item => {
    const icon = item.status === true ? '✅' : item.status === false ? '❌' : '❓';
    const color = item.status === true ? colors.green : colors.red;
    console.log(`${color}${icon} ${item.item} - Impacto: ${item.impact}${colors.reset}`);
  });
  
  const passed = scorecard.filter(i => i.status === true).length;
  const total = scorecard.length;
  const percentage = (passed / total * 100).toFixed(0);
  
  console.log(`\n📊 Puntuación: ${passed}/${total} (${percentage}%)\n`);
  
  if (percentage < 50) {
    console.log(`${colors.red}⚠️ ESTADO CRÍTICO: El sistema NO es seguro para producción${colors.reset}`);
    console.log(`${colors.red}   Riesgo de violación HIPAA y pérdida de datos${colors.reset}`);
  } else if (percentage < 80) {
    console.log(`${colors.yellow}⚠️ ESTADO MEDIO: Mejoras importantes necesarias${colors.reset}`);
  } else {
    console.log(`${colors.green}✅ ESTADO BUENO: Sistema razonablemente seguro${colors.reset}`);
  }
  
  console.log(`\n${colors.cyan}RECOMENDACIONES PRIORITARIAS:${colors.reset}`);
  console.log("1. Implementar login centralizado en web-app");
  console.log("2. Configurar cookies httpOnly + Secure + SameSite");
  console.log("3. Agregar middleware de autenticación en todas las apps");
  console.log("4. Implementar logs de auditoría para HIPAA");
  console.log("5. Configurar rate limiting y protección CSRF");
  
  // Guardar reporte
  const report = {
    date: new Date().toISOString(),
    results: auditResults,
    score: `${passed}/${total}`,
    percentage: percentage + '%',
    critical_issues: scorecard.filter(i => i.status === false && i.impact === 'CRÍTICO').length
  };
  
  require('fs').writeFileSync(
    'security-audit-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log(`\n📄 Reporte guardado en: security-audit-report.json`);
  
  await browser.close();
  rl.close();
}

// Ejecutar auditoría
console.clear();
runSecurityAudit().catch(console.error);