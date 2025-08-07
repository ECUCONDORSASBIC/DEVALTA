/**
 * AltaMedica SSO Production Proxy Server
 * Servidor proxy completo que se integra con Firebase y API Server
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fetch = require('node-fetch'); // npm install node-fetch

const app = express();
const PORT = 9001; // Puerto diferente para no conflictuar
const JWT_SECRET = process.env.JWT_SECRET || 'altamedica-sso-secret-key';

// URLs de servicios
const API_SERVER_URL = process.env.API_SERVER_URL || 'http://localhost:3001';
const WEB_APP_URL = process.env.WEB_APP_URL || 'http://localhost:3000';

// Almacenamiento temporal de sesiones
const ssoSessions = new Map();

// Configuración de CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://localhost:9001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());
app.use(cookieParser());

// Mapeo de roles a URLs
const ROLE_REDIRECTS = {
  'patient': 'http://localhost:3003',
  'doctor': 'http://localhost:3002', 
  'company': 'http://localhost:3004',
  'admin': 'http://localhost:3005'
};

// Generar token SSO
function generateSSOToken(user) {
  const tokenPayload = {
    uid: user.uid,
    email: user.email,
    role: user.role || user.userType,
    displayName: user.displayName || user.firstName + ' ' + user.lastName,
    email_verified: user.email_verified || true,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 días
  };
  
  return jwt.sign(tokenPayload, JWT_SECRET);
}

// Crear ID único para sesión
function generateSessionId() {
  return 'sso_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'altamedica-sso-production-proxy',
    timestamp: new Date().toISOString(),
    sessions: ssoSessions.size,
    integrations: {
      'firebase': 'via-api-server',
      'api-server': API_SERVER_URL,
      'web-app': WEB_APP_URL
    },
    services: {
      'web-app': 'http://localhost:3000',
      'api-server': 'http://localhost:3001',
      'doctors': 'http://localhost:3002',
      'patients': 'http://localhost:3003',
      'companies': 'http://localhost:3004',
      'admin': 'http://localhost:3005'
    }
  });
});

// Endpoint de login - Se integra con API Server/Firebase
app.post('/auth/login', async (req, res) => {
  console.log('📝 [SSO-Prod] Login request:', { email: req.body.email });
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email y password son requeridos'
    });
  }
  
  try {
    // 1. Autenticar con el API Server (que maneja Firebase)
    console.log('🔥 [SSO-Prod] Autenticando con API Server...');
    
    const apiResponse = await fetch(`${API_SERVER_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!apiResponse.ok) {
      const error = await apiResponse.json();
      console.log('❌ [SSO-Prod] Error del API Server:', error);
      
      return res.status(apiResponse.status).json({
        success: false,
        error: error.message || 'Error de autenticación'
      });
    }
    
    const authData = await apiResponse.json();
    console.log('✅ [SSO-Prod] Autenticación exitosa:', { 
      email: authData.data?.user?.email,
      role: authData.data?.user?.role 
    });
    
    // 2. Extraer datos del usuario
    const user = authData.data.user;
    const firebaseToken = authData.data.token;
    
    if (!user) {
      return res.status(500).json({
        success: false,
        error: 'No se pudieron obtener datos del usuario'
      });
    }
    
    // 3. Generar token SSO y sesión
    const ssoToken = generateSSOToken(user);
    const sessionId = generateSessionId();
    
    // 4. Guardar sesión con datos completos
    ssoSessions.set(sessionId, {
      user: user,
      ssoToken: ssoToken,
      firebaseToken: firebaseToken,
      createdAt: new Date(),
      lastAccess: new Date()
    });
    
    // 5. Establecer cookies SSO
    res.cookie('altamedica_sso_token', ssoToken, {
      httpOnly: false,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });
    
    res.cookie('sso_session_id', sessionId, {
      httpOnly: false,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });
    
    // 6. Determinar URL de redirección
    const userRole = user.role || user.userType || 'patient';
    const redirectUrl = ROLE_REDIRECTS[userRole] || 'http://localhost:3000';
    
    console.log('✅ [SSO-Prod] Login completo para:', email, 'Rol:', userRole, 'Redirect:', redirectUrl);
    
    res.json({
      success: true,
      message: 'Login exitoso',
      user: {
        uid: user.uid,
        email: user.email,
        role: userRole,
        displayName: user.displayName || user.firstName + ' ' + user.lastName,
        email_verified: user.email_verified || true,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
      },
      session_token: sessionId,
      redirect_url: redirectUrl,
      firebase_token: firebaseToken // Para debugging
    });
    
  } catch (error) {
    console.error('❌ [SSO-Prod] Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor: ' + error.message
    });
  }
});

// Verificar sesión
app.get('/auth/verify', (req, res) => {
  const token = req.cookies.altamedica_sso_token;
  const sessionId = req.cookies.sso_session_id;
  
  console.log('🔍 [SSO-Prod] Verificando sesión - Token:', !!token, 'SessionID:', !!sessionId);
  
  if (!token) {
    return res.status(401).json({
      valid: false,
      error: 'No hay token SSO'
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Actualizar último acceso si hay session ID
    if (sessionId && ssoSessions.has(sessionId)) {
      const session = ssoSessions.get(sessionId);
      session.lastAccess = new Date();
      ssoSessions.set(sessionId, session);
      
      console.log('✅ [SSO-Prod] Sesión válida para:', decoded.email, 'Firebase token disponible:', !!session.firebaseToken);
      
      res.json({
        valid: true,
        user: decoded,
        firebase_token: session.firebaseToken // Para sincronización
      });
    } else {
      console.log('✅ [SSO-Prod] Token válido (sin sesión completa) para:', decoded.email);
      res.json({
        valid: true,
        user: decoded
      });
    }
    
  } catch (error) {
    console.log('❌ [SSO-Prod] Token inválido:', error.message);
    res.status(401).json({
      valid: false,
      error: 'Token SSO inválido'
    });
  }
});

// Obtener info del usuario con datos de Firebase
app.get('/auth/user-info', async (req, res) => {
  const token = req.cookies.altamedica_sso_token;
  const sessionId = req.cookies.sso_session_id;
  
  if (!token) {
    return res.json({
      authenticated: false,
      error: 'No hay token SSO'
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Si tenemos sesión completa, incluir datos de Firebase
    if (sessionId && ssoSessions.has(sessionId)) {
      const session = ssoSessions.get(sessionId);
      
      res.json({
        authenticated: true,
        user: decoded,
        session: {
          createdAt: session.createdAt,
          lastAccess: session.lastAccess,
          hasFirebaseToken: !!session.firebaseToken
        }
      });
    } else {
      res.json({
        authenticated: true,
        user: decoded
      });
    }
    
  } catch (error) {
    res.json({
      authenticated: false,
      error: 'Token SSO inválido'
    });
  }
});

// Redirección automática según rol
app.get('/auth/redirect', (req, res) => {
  const token = req.cookies.altamedica_sso_token;
  
  if (!token) {
    return res.redirect(`${WEB_APP_URL}/login`);
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userRole = decoded.role || 'patient';
    const redirectUrl = ROLE_REDIRECTS[userRole] || WEB_APP_URL;
    
    console.log('🔄 [SSO-Prod] Redirigiendo a:', redirectUrl, 'para rol:', userRole);
    res.redirect(redirectUrl);
    
  } catch (error) {
    res.redirect(`${WEB_APP_URL}/login`);
  }
});

// Logout - Limpia tanto SSO como Firebase
app.post('/auth/logout', async (req, res) => {
  const sessionId = req.cookies.sso_session_id;
  const token = req.cookies.altamedica_sso_token;
  
  // Obtener datos de la sesión antes de eliminarla
  let firebaseToken = null;
  if (sessionId && ssoSessions.has(sessionId)) {
    const session = ssoSessions.get(sessionId);
    firebaseToken = session.firebaseToken;
    ssoSessions.delete(sessionId);
  }
  
  // Si tenemos token de Firebase, intentar logout en API Server
  if (firebaseToken) {
    try {
      console.log('🔥 [SSO-Prod] Haciendo logout en Firebase via API Server...');
      
      await fetch(`${API_SERVER_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firebaseToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ [SSO-Prod] Logout de Firebase exitoso');
    } catch (error) {
      console.log('⚠️ [SSO-Prod] Error en logout de Firebase:', error.message);
    }
  }
  
  // Limpiar cookies SSO
  res.clearCookie('altamedica_sso_token');
  res.clearCookie('sso_session_id');
  
  console.log('🚪 [SSO-Prod] Logout completo exitoso');
  
  res.json({
    success: true,
    message: 'Logout exitoso'
  });
});

// Proxy para API server con autenticación
app.use('/proxy/api-server', createProxyMiddleware({
  target: API_SERVER_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/proxy/api-server': ''
  },
  onProxyReq: (proxyReq, req, res) => {
    // Reenviar cookies SSO y headers de autenticación
    if (req.cookies.altamedica_sso_token) {
      proxyReq.setHeader('Cookie', `altamedica_sso_token=${req.cookies.altamedica_sso_token}`);
    }
    
    // Si hay sesión completa, agregar token de Firebase
    const sessionId = req.cookies.sso_session_id;
    if (sessionId && ssoSessions.has(sessionId)) {
      const session = ssoSessions.get(sessionId);
      if (session.firebaseToken) {
        proxyReq.setHeader('Authorization', `Bearer ${session.firebaseToken}`);
      }
    }
  }
}));

// Test endpoint para probar integración
app.post('/auth/test-integration', async (req, res) => {
  try {
    // Probar conexión con API Server
    const healthResponse = await fetch(`${API_SERVER_URL}/api/health`);
    const healthData = await healthResponse.json();
    
    res.json({
      success: true,
      integration_status: {
        api_server: {
          url: API_SERVER_URL,
          status: healthResponse.ok ? 'connected' : 'error',
          response: healthData
        },
        firebase: 'via-api-server',
        proxy_sessions: ssoSessions.size
      }
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      integration_status: {
        api_server: {
          url: API_SERVER_URL,
          status: 'error'
        }
      }
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n🎉 AltaMedica SSO Production Proxy iniciado exitosamente!');
  console.log(`📍 Servidor disponible en: http://localhost:${PORT}`);
  console.log('\n🔗 Integraciones:');
  console.log(`   • API Server: ${API_SERVER_URL}`);
  console.log(`   • Web App: ${WEB_APP_URL}`);
  console.log('   • Firebase: Via API Server');
  console.log('\n📋 Endpoints disponibles:');
  console.log('   • POST /auth/login - Iniciar sesión (con Firebase)');
  console.log('   • GET  /auth/verify - Verificar sesión');
  console.log('   • GET  /auth/user-info - Info del usuario');
  console.log('   • GET  /auth/redirect - Redirección automática');
  console.log('   • POST /auth/logout - Cerrar sesión (SSO + Firebase)');
  console.log('   • POST /auth/test-integration - Test de integración');
  console.log('   • GET  /health - Health check');
  console.log('\n🛑 Presiona Ctrl+C para detener el servidor\n');
});

// Cleanup de sesiones viejas cada 30 minutos
setInterval(() => {
  const now = new Date();
  for (const [sessionId, session] of ssoSessions.entries()) {
    const timeDiff = now - session.lastAccess;
    const hoursOld = timeDiff / (1000 * 60 * 60);
    
    if (hoursOld > 24) {
      ssoSessions.delete(sessionId);
      console.log('🧹 [SSO-Prod] Sesión limpiada:', sessionId);
    }
  }
}, 30 * 60 * 1000);
