/**
 * SSO Proxy Server para desarrollo local
 * Soluciona el problema de cookies entre diferentes puertos
 * 
 * Este servidor actúa como proxy para manejar la autenticación SSO
 * y permite compartir sesiones entre aplicaciones en diferentes puertos
 */

const express = require('express');
const httpProxy = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const PORT = 3100; // Puerto del proxy SSO

// Configuración de aplicaciones
const APPS = {
  'web': 'http://localhost:3000',
  'api': 'http://localhost:3001',
  'doctors': 'http://localhost:3002',
  'patients': 'http://localhost:3003',
  'companies': 'http://localhost:3004',
  'admin': 'http://localhost:3005',
};

// Middleware
app.use(cookieParser());
app.use(express.json());

// CORS configurado para todas las aplicaciones
app.use(cors({
  origin: Object.values(APPS),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Estado de sesiones SSO (en producción usar Redis)
const ssoSessions = new Map();

// Endpoint para establecer cookie SSO
app.post('/sso/set-cookie', (req, res) => {
  const { token, user } = req.body;
  
  if (!token || !user) {
    return res.status(400).json({ error: 'Token y usuario requeridos' });
  }

  // Guardar sesión
  ssoSessions.set(token, {
    user,
    createdAt: new Date(),
    lastAccess: new Date()
  });

  // Establecer cookie que funciona en todos los puertos
  res.cookie('altamedica_sso_token', token, {
    httpOnly: true,
    secure: false, // false para desarrollo local
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    // NO establecer domain para que funcione en localhost
  });

  res.json({ success: true, message: 'Cookie SSO establecida' });
});

// Endpoint para verificar sesión SSO
app.get('/sso/verify', (req, res) => {
  const token = req.cookies.altamedica_sso_token;
  
  if (!token) {
    return res.status(401).json({ error: 'No hay token SSO' });
  }

  const session = ssoSessions.get(token);
  
  if (!session) {
    return res.status(401).json({ error: 'Sesión SSO inválida' });
  }

  // Actualizar último acceso
  session.lastAccess = new Date();
  ssoSessions.set(token, session);

  res.json({
    valid: true,
    user: session.user,
    token
  });
});

// Endpoint para logout SSO
app.post('/sso/logout', (req, res) => {
  const token = req.cookies.altamedica_sso_token;
  
  if (token) {
    ssoSessions.delete(token);
  }

  res.clearCookie('altamedica_sso_token');
  res.json({ success: true, message: 'Logout SSO exitoso' });
});

// Proxy para aplicaciones
Object.entries(APPS).forEach(([name, target]) => {
  app.use(`/${name}/*`, httpProxy.createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^/${name}`]: ''
    },
    onProxyReq: (proxyReq, req, res) => {
      // Reenviar cookies
      if (req.cookies.altamedica_sso_token) {
        proxyReq.setHeader('Cookie', `altamedica_sso_token=${req.cookies.altamedica_sso_token}`);
      }
    }
  }));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'sso-proxy',
    sessions: ssoSessions.size,
    apps: Object.keys(APPS)
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🔐 SSO Proxy Server corriendo en http://localhost:${PORT}`);
  console.log('📱 Aplicaciones configuradas:');
  Object.entries(APPS).forEach(([name, url]) => {
    console.log(`   - ${name}: ${url} → http://localhost:${PORT}/${name}`);
  });
  console.log('\n✅ Usa el proxy para acceder a las aplicaciones y compartir sesión SSO');
});

// Limpiar sesiones expiradas cada hora
setInterval(() => {
  const now = new Date();
  const expirationTime = 7 * 24 * 60 * 60 * 1000; // 7 días
  
  for (const [token, session] of ssoSessions.entries()) {
    if (now - session.createdAt > expirationTime) {
      ssoSessions.delete(token);
    }
  }
}, 60 * 60 * 1000); // cada hora