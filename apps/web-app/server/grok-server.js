const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = process.env.GROK_SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Variables globales para mantener la sesión
let browser = null;
let page = null;
let isAuthenticated = false;

// Función para conectar a Grok
async function connectToGrok(credentials = null) {
  try {
    console.log('🚀 Iniciando conexión a Grok...');
    
    // Iniciar navegador
    browser = await puppeteer.launch({ 
      headless: false, // Cambiar a true en producción
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // Configurar viewport y user agent
    await page.setViewport({ width: 1280, height: 720 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Navegar a Grok
    console.log('🌐 Navegando a Grok...');
    await page.goto('https://grok.x.ai/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Si hay credenciales, intentar login
    if (credentials && credentials.email && credentials.password) {
      console.log('🔐 Intentando autenticación...');
      await performLogin(credentials);
    } else {
      console.log('⚠️ No hay credenciales, login manual requerido');
    }
    
    return { success: true, message: 'Conectado a Grok' };
    
  } catch (error) {
    console.error('❌ Error conectando a Grok:', error);
    return { success: false, message: error.message };
  }
}

// Función para realizar login
async function performLogin(credentials) {
  try {
    // Buscar botón de login
    const loginSelectors = [
      'button[data-testid="login-button"]',
      'a[href*="login"]',
      'button:contains("Login")',
      'button:contains("Sign in")',
      '.login-button'
    ];

    let loginButton = null;
    for (const selector of loginSelectors) {
      try {
        loginButton = await page.$(selector);
        if (loginButton) break;
      } catch (e) {
        continue;
      }
    }

    if (loginButton) {
      await loginButton.click();
      await page.waitForTimeout(2000);

      // Llenar credenciales
      await page.type('input[type="email"]', credentials.email);
      await page.type('input[type="password"]', credentials.password);
      
      // Enviar formulario
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
      
      isAuthenticated = true;
      console.log('✅ Login exitoso');
    }
  } catch (error) {
    console.error('❌ Error en login:', error);
  }
}

// Función para enviar mensaje
async function sendMessage(message) {
  try {
    if (!page) {
      throw new Error('No conectado a Grok');
    }

    console.log('📤 Enviando mensaje:', message);

    // Buscar campo de entrada
    const inputSelectors = [
      'textarea[placeholder*="Ask Grok"]',
      'textarea[placeholder*="message"]',
      'textarea[placeholder*="chat"]',
      'div[contenteditable="true"]',
      'textarea'
    ];

    let inputElement = null;
    for (const selector of inputSelectors) {
      try {
        inputElement = await page.$(selector);
        if (inputElement) break;
      } catch (e) {
        continue;
      }
    }

    if (!inputElement) {
      throw new Error('No se encontró el campo de entrada');
    }

    // Escribir y enviar mensaje
    await inputElement.click();
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.type(message);
    await page.keyboard.press('Enter');

    // Esperar respuesta
    await page.waitForTimeout(5000);

    // Obtener respuesta
    const response = await getLastResponse();
    
    return { success: true, response };
    
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error);
    return { success: false, message: error.message };
  }
}

// Función para obtener la última respuesta
async function getLastResponse() {
  try {
    const responseSelectors = [
      '[data-testid="assistant-message"]:last-child',
      '.assistant-message:last-child',
      '.message.assistant:last-child',
      '[data-role="assistant"]:last-child'
    ];

    for (const selector of responseSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await element.evaluate(el => el.textContent);
          return text?.trim() || 'Respuesta no disponible';
        }
      } catch (e) {
        continue;
      }
    }

    return 'Respuesta no disponible';
  } catch (error) {
    return 'Error obteniendo respuesta';
  }
}

// Función para desconectar
async function disconnect() {
  try {
    if (browser) {
      await browser.close();
      browser = null;
      page = null;
      isAuthenticated = false;
    }
    return { success: true, message: 'Desconectado' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// Rutas API
app.post('/connect', async (req, res) => {
  const { credentials } = req.body;
  const result = await connectToGrok(credentials);
  res.json(result);
});

app.post('/send', async (req, res) => {
  const { message } = req.body;
  const result = await sendMessage(message);
  res.json(result);
});

app.post('/disconnect', async (req, res) => {
  const result = await disconnect();
  res.json(result);
});

app.get('/status', (req, res) => {
  res.json({
    connected: !!browser,
    authenticated: isAuthenticated,
    message: 'Servidor Grok funcionando'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Grok corriendo en puerto ${PORT}`);
  console.log(`📡 API disponible en: http://localhost:${PORT}`);
});

module.exports = { app, connectToGrok, sendMessage, disconnect }; 