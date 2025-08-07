/**
 * Script de inicio con proxy reverso para resolver el problema de cookies SSO
 * 
 * Este script inicia un servidor proxy que permite compartir cookies entre
 * las diferentes aplicaciones del monorepo AltaMedica.
 * 
 * Ejecutar con: node start-with-proxy.js
 */

const express = require('express');
const httpProxy = require('http-proxy-middleware');
const { spawn } = require('child_process');
const chalk = require('chalk');

// Configuración de aplicaciones y sus puertos
const APPS = {
  api: { port: 3001, name: 'API Server', command: 'npm run dev:api-server' },
  patients: { port: 3003, name: 'Patients App', command: 'npm run dev:patients' },
  doctors: { port: 3002, name: 'Doctors App', command: 'npm run dev:doctors' },
  companies: { port: 3004, name: 'Companies App', command: 'npm run dev:companies' },
  admin: { port: 3005, name: 'Admin App', command: 'npm run dev:admin' },
  signaling: { port: 8888, name: 'Signaling Server', command: 'npm run dev:signaling' }
};

// Puerto del proxy principal
const PROXY_PORT = 3000;

// Crear servidor Express para el proxy
const app = express();

// Función para crear proxy middleware
function createProxyMiddleware(target) {
  return httpProxy.createProxyMiddleware({
    target: `http://localhost:${target}`,
    changeOrigin: false, // Importante: false para mantener el mismo host
    ws: true, // Soportar WebSockets
    logLevel: 'silent',
    onError: (err, req, res) => {
      console.error(chalk.red(`Proxy error: ${err.message}`));
      res.status(502).send('Proxy Error');
    }
  });
}

// Configurar rutas del proxy
app.use('/api', createProxyMiddleware(APPS.api.port));
app.use('/patients', createProxyMiddleware(APPS.patients.port));
app.use('/doctors', createProxyMiddleware(APPS.doctors.port));
app.use('/companies', createProxyMiddleware(APPS.companies.port));
app.use('/admin', createProxyMiddleware(APPS.admin.port));
app.use('/ws', createProxyMiddleware(APPS.signaling.port));

// Página principal con enlaces a todas las apps
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>AltaMedica Proxy</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        h1 { color: #333; }
        .app-list {
          list-style: none;
          padding: 0;
        }
        .app-item {
          background: white;
          margin: 10px 0;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .app-link {
          font-size: 18px;
          color: #0066cc;
          text-decoration: none;
        }
        .app-link:hover {
          text-decoration: underline;
        }
        .status {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #4CAF50;
          margin-left: 10px;
        }
        .note {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 5px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <h1>🏥 AltaMedica Development Proxy</h1>
      <p>Todas las aplicaciones están siendo servidas desde <strong>localhost:${PROXY_PORT}</strong> para compartir cookies SSO.</p>
      
      <h2>Aplicaciones Disponibles:</h2>
      <ul class="app-list">
        <li class="app-item">
          <a href="/api/health" class="app-link">API Server</a>
          <span class="status"></span>
          - Backend principal (Puerto original: ${APPS.api.port})
        </li>
        <li class="app-item">
          <a href="/patients" class="app-link">Patients Portal</a>
          <span class="status"></span>
          - Portal de pacientes (Puerto original: ${APPS.patients.port})
        </li>
        <li class="app-item">
          <a href="/doctors" class="app-link">Doctors Portal</a>
          <span class="status"></span>
          - Portal de doctores (Puerto original: ${APPS.doctors.port})
        </li>
        <li class="app-item">
          <a href="/companies" class="app-link">Companies Portal</a>
          <span class="status"></span>
          - Portal de empresas (Puerto original: ${APPS.companies.port})
        </li>
        <li class="app-item">
          <a href="/admin" class="app-link">Admin Panel</a>
          <span class="status"></span>
          - Panel administrativo (Puerto original: ${APPS.admin.port})
        </li>
      </ul>
      
      <div class="note">
        <strong>⚡ Nota:</strong> Este proxy permite que las cookies SSO se compartan correctamente entre todas las aplicaciones.
        Para hacer login, usa: <a href="/login">/login</a>
      </div>
    </body>
    </html>
  `);
});

// Ruta de login que redirige a la web-app
app.get('/login', (req, res) => {
  // Por ahora, redirigir al login de web-app en su puerto original
  res.redirect('http://localhost:3000/login');
});

// Función para iniciar una aplicación
function startApp(appKey) {
  const app = APPS[appKey];
  console.log(chalk.blue(`Starting ${app.name}...`));
  
  const child = spawn('cmd', ['/c', app.command], {
    stdio: 'pipe',
    shell: true
  });
  
  child.stdout.on('data', (data) => {
    console.log(chalk.gray(`[${app.name}] ${data.toString().trim()}`));
  });
  
  child.stderr.on('data', (data) => {
    console.error(chalk.red(`[${app.name}] ${data.toString().trim()}`));
  });
  
  child.on('error', (error) => {
    console.error(chalk.red(`Failed to start ${app.name}: ${error.message}`));
  });
  
  return child;
}

// Iniciar todas las aplicaciones
console.log(chalk.green.bold('🚀 Starting AltaMedica Development Environment with Proxy...'));

// Primero iniciar el API server
const apiProcess = startApp('api');

// Esperar un poco antes de iniciar las demás apps
setTimeout(() => {
  startApp('patients');
  startApp('signaling');
  
  // Las otras apps son opcionales
  // startApp('doctors');
  // startApp('companies');
  // startApp('admin');
}, 5000);

// Iniciar el servidor proxy
app.listen(PROXY_PORT, () => {
  console.log(chalk.green.bold(`
    ✅ Proxy server running at http://localhost:${PROXY_PORT}
    
    🍪 Las cookies SSO ahora se compartirán correctamente entre todas las aplicaciones.
    
    📝 Para hacer login:
    1. Ve a http://localhost:${PROXY_PORT}/login
    2. Inicia sesión con las credenciales de prueba
    3. Serás redirigido automáticamente a la aplicación correcta
    
    🔗 URLs disponibles:
    - API: http://localhost:${PROXY_PORT}/api
    - Patients: http://localhost:${PROXY_PORT}/patients
    - Doctors: http://localhost:${PROXY_PORT}/doctors
    - Companies: http://localhost:${PROXY_PORT}/companies
    - Admin: http://localhost:${PROXY_PORT}/admin
  `));
});

// Manejar cierre graceful
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n👋 Shutting down...'));
  process.exit(0);
});