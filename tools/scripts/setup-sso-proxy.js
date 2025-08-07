/**
 * SSO Proxy Server para AltaMedica
 * 
 * Este proxy resuelve el problema de compartir cookies entre diferentes puertos
 * redirigiendo todas las aplicaciones a través de un único dominio.
 * 
 * Configuración:
 * - Proxy principal: http://localhost:9000
 * - /auth/* -> web-app (3000)
 * - /api/* -> api-server (3001)
 * - /patients/* -> patients-app (3003)
 * - /doctors/* -> doctors-app (3002)
 * - /companies/* -> companies-app (3004)
 * - /admin/* -> admin-app (3005)
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 9000;

// Middleware para cookies
app.use(cookieParser());

// Configuración de proxies
const proxyConfigs = {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
    ws: true, // Para WebSocket
    onProxyReq: (proxyReq, req) => {
      // Preservar cookies
      if (req.headers.cookie) {
        proxyReq.setHeader('Cookie', req.headers.cookie);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Modificar cookies para funcionar con el proxy
      const cookies = proxyRes.headers['set-cookie'];
      if (cookies) {
        proxyRes.headers['set-cookie'] = cookies.map(cookie => {
          // Remover restricciones de dominio en desarrollo
          return cookie
            .replace(/Domain=[^;]+;?/gi, '')
            .replace(/Secure;?/gi, '')
            .replace(/SameSite=None/gi, 'SameSite=Lax');
        });
      }
    }
  },
  '/patients': {
    target: 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: {
      '^/patients': '' // Remover /patients del path
    },
    onProxyReq: (proxyReq, req) => {
      if (req.headers.cookie) {
        proxyReq.setHeader('Cookie', req.headers.cookie);
      }
    }
  },
  '/doctors': {
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: {
      '^/doctors': ''
    },
    onProxyReq: (proxyReq, req) => {
      if (req.headers.cookie) {
        proxyReq.setHeader('Cookie', req.headers.cookie);
      }
    }
  },
  '/companies': {
    target: 'http://localhost:3004',
    changeOrigin: true,
    pathRewrite: {
      '^/companies': ''
    },
    onProxyReq: (proxyReq, req) => {
      if (req.headers.cookie) {
        proxyReq.setHeader('Cookie', req.headers.cookie);
      }
    }
  },
  '/admin': {
    target: 'http://localhost:3005',
    changeOrigin: true,
    pathRewrite: {
      '^/admin': ''
    },
    onProxyReq: (proxyReq, req) => {
      if (req.headers.cookie) {
        proxyReq.setHeader('Cookie', req.headers.cookie);
      }
    }
  },
  '/auth': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    pathRewrite: {
      '^/auth': ''
    },
    onProxyReq: (proxyReq, req) => {
      if (req.headers.cookie) {
        proxyReq.setHeader('Cookie', req.headers.cookie);
      }
    }
  }
};

// Aplicar proxies
Object.entries(proxyConfigs).forEach(([path, config]) => {
  app.use(path, createProxyMiddleware(config));
});

// Ruta raíz - redirigir a web-app
app.get('/', (req, res) => {
  res.redirect('/auth');
});

// Página de información del proxy
app.get('/proxy-info', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>AltaMedica SSO Proxy</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .route { background: #f0f0f0; padding: 10px; margin: 5px 0; border-radius: 5px; }
          .status { color: green; font-weight: bold; }
          code { background: #e0e0e0; padding: 2px 5px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <h1>🏥 AltaMedica SSO Proxy Server</h1>
        <p class="status">✅ Proxy activo en puerto ${PORT}</p>
        
        <h2>Rutas Configuradas:</h2>
        <div class="route">
          <strong>Login/Auth:</strong> <code>http://localhost:${PORT}/auth/login</code> → web-app (3000)
        </div>
        <div class="route">
          <strong>API:</strong> <code>http://localhost:${PORT}/api/*</code> → api-server (3001)
        </div>
        <div class="route">
          <strong>Pacientes:</strong> <code>http://localhost:${PORT}/patients</code> → patients-app (3003)
        </div>
        <div class="route">
          <strong>Doctores:</strong> <code>http://localhost:${PORT}/doctors</code> → doctors-app (3002)
        </div>
        <div class="route">
          <strong>Empresas:</strong> <code>http://localhost:${PORT}/companies</code> → companies-app (3004)
        </div>
        <div class="route">
          <strong>Admin:</strong> <code>http://localhost:${PORT}/admin</code> → admin-app (3005)
        </div>
        
        <h2>Cómo usar:</h2>
        <ol>
          <li>Accede a <code>http://localhost:${PORT}/auth/login</code> para iniciar sesión</li>
          <li>Las cookies SSO se compartirán automáticamente entre todas las apps</li>
          <li>Serás redirigido a la app correspondiente según tu rol</li>
        </ol>
        
        <h2>Estado de las Aplicaciones:</h2>
        <p>Asegúrate de que todas las aplicaciones estén corriendo en sus puertos respectivos.</p>
      </body>
    </html>
  `);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('===========================================');
  console.log('🏥 AltaMedica SSO Proxy Server');
  console.log('===========================================');
  console.log(`✅ Proxy activo en: http://localhost:${PORT}`);
  console.log('');
  console.log('📍 Rutas configuradas:');
  console.log(`   - Login: http://localhost:${PORT}/auth/login`);
  console.log(`   - API: http://localhost:${PORT}/api/*`);
  console.log(`   - Pacientes: http://localhost:${PORT}/patients`);
  console.log(`   - Doctores: http://localhost:${PORT}/doctors`);
  console.log(`   - Empresas: http://localhost:${PORT}/companies`);
  console.log(`   - Admin: http://localhost:${PORT}/admin`);
  console.log('');
  console.log('ℹ️  Info del proxy: http://localhost:${PORT}/proxy-info');
  console.log('===========================================');
});