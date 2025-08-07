// Script de Selenium WebDriver para automatizar y diagnosticar el login
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function testLogin() {
  console.log('🚀 Iniciando test de login con Selenium...\n');
  
  // Configurar opciones de Chrome
  const options = new chrome.Options();
  options.addArguments('--disable-blink-features=AutomationControlled');
  options.excludeSwitches(['enable-automation']);
  
  // Crear driver
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  try {
    // Navegar a la página
    console.log('📍 Navegando a http://localhost:3000/login...');
    await driver.get('http://localhost:3000/login');
    
    // Esperar a que la página cargue
    await driver.wait(until.elementLocated(By.css('input[type="email"]')), 10000);
    console.log('✅ Página cargada\n');
    
    // Tomar screenshot inicial
    const screenshot = await driver.takeScreenshot();
    require('fs').writeFileSync('login-selenium-inicial.png', screenshot, 'base64');
    
    // Verificar estado del botón
    const button = await driver.findElement(By.css('button[type="submit"]'));
    const isDisabled = await button.getAttribute('disabled');
    console.log('🔘 Estado inicial del botón:', isDisabled ? 'DESHABILITADO' : 'HABILITADO');
    
    // Llenar formulario
    console.log('\n📝 Llenando formulario...');
    const emailInput = await driver.findElement(By.css('input[type="email"]'));
    await emailInput.sendKeys('eeecucondor@gmail.com');
    
    const passwordInput = await driver.findElement(By.css('input[type="password"]'));
    await passwordInput.sendKeys('test123');
    
    // Verificar estado después
    const isDisabledAfter = await button.getAttribute('disabled');
    console.log('🔘 Estado después de llenar:', isDisabledAfter ? 'DESHABILITADO' : 'HABILITADO');
    
    if (isDisabledAfter) {
      console.log('⚠️  Habilitando botón con JavaScript...');
      await driver.executeScript('document.querySelector("button[type=\\"submit\\"]").disabled = false;');
    }
    
    // Hacer clic
    console.log('\n🖱️ Haciendo clic en login...');
    await button.click();
    
    // Esperar posible navegación
    await driver.sleep(5000);
    
    // Verificar URL
    const currentUrl = await driver.getCurrentUrl();
    console.log('\n📍 URL actual:', currentUrl);
    
    if (currentUrl.includes('localhost:3003')) {
      console.log('✅ ¡LOGIN EXITOSO!');
    } else {
      console.log('❌ Login no completado');
      
      // Buscar errores
      try {
        const errors = await driver.findElements(By.css('.text-red-600'));
        for (let error of errors) {
          const text = await error.getText();
          if (text) console.log('Error encontrado:', text);
        }
      } catch (e) {
        // No hay errores visibles
      }
    }
    
    // Obtener logs del navegador
    const logs = await driver.manage().logs().get('browser');
    if (logs.length > 0) {
      console.log('\n📋 Logs del navegador:');
      logs.forEach(log => {
        if (log.message.includes('AuthContext') || log.level.name === 'SEVERE') {
          console.log(`[${log.level.name}] ${log.message}`);
        }
      });
    }
    
    console.log('\n💡 Navegador abierto. Presiona Enter para cerrar...');
    await new Promise(resolve => process.stdin.once('data', resolve));
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  } finally {
    await driver.quit();
  }
}

// Verificar si Selenium está instalado
try {
  require.resolve('selenium-webdriver');
  testLogin().catch(console.error);
} catch (e) {
  console.log('❌ Selenium WebDriver no está instalado\n');
  console.log('Instálalo con:');
  console.log('  npm install --save-dev selenium-webdriver');
  console.log('\nTambién necesitas ChromeDriver:');
  console.log('  npm install --save-dev chromedriver');
}