/**
 * Servidor de prueba simple para testear endpoints SSO
 */

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3099; // Puerto diferente para testing

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005'],
  credentials: true
}));
app.use(express.json());

// Mock data
const mockUsers = [
  {
    uid: 'patient-123',
    email: 'patient@altamedica.com',
    role: 'patient',
    displayName: 'Juan Pérez',
    emailVerified: true
  },
  {
    uid: 'doctor-456', 
    email: 'doctor@altamedica.com',
    role: 'doctor',
    displayName: 'Dra. María García',
    emailVerified: true
  }
];

const JWT_SECRET = 'altamedica-test-secret-2025';
const sessions = new Map(); // Simple session store

// Rate limiting simple
const rateLimitStore = new Map();
const RATE_LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos

function rateLimit(req, res, next) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, []);
  }
  
  const requests = rateLimitStore.get(ip).filter(time => time > windowStart);
  
  if (requests.length >= RATE_LIMIT) {
    return res.status(429).json({
      error: { message: 'Demasiados intentos. Intente más tarde.' }
    });
  }
  
  requests.push(now);
  rateLimitStore.set(ip, requests);
  next();
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'altamedica-test-api'
  });
});

// SSO Login
app.post('/api/v1/auth/sso', rateLimit, (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 [TEST SSO] Login attempt:', email);
  
  // Validar campos requeridos
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { message: 'Email y contraseña son requeridos' }
    });
  }
  
  // Mock authentication - buscar usuario
  const user = mockUsers.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { message: 'Credenciales inválidas' }
    });
  }
  
  // Generar tokens
  const accessToken = jwt.sign(
    {
      uid: user.uid,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      emailVerified: user.emailVerified
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  const refreshToken = jwt.sign(
    { uid: user.uid, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  // Crear sesión
  const sessionId = `test_session_${user.uid}_${Date.now()}`;
  sessions.set(sessionId, {
    uid: user.uid,
    email: user.email,
    role: user.role,
    createdAt: new Date(),
    active: true
  });
  
  // Respuesta exitosa
  const response = {
    success: true,
    data: {
      token: accessToken,
      refreshToken,
      customToken: `custom_token_${user.uid}`, // Mock Firebase token
      sessionId,
      expiresAt: Date.now() + 3600000,
      user: {
        uid: user.uid,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        metadata: {
          lastLoginAt: new Date().toISOString(),
          createdAt: '2025-01-01T00:00:00.000Z'
        }
      },
      redirectUrl: user.role === 'patient' ? 'http://localhost:3003/dashboard' : 'http://localhost:3002/dashboard'
    }
  };
  
  console.log('✅ [TEST SSO] Login exitoso:', user.email);
  res.json(response);
});

// SSO Verify
app.get('/api/v1/auth/sso', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  
  console.log('🔍 [TEST SSO] Verify attempt');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Token no proporcionado' }
    });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = mockUsers.find(u => u.uid === decoded.uid);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Usuario no encontrado' }
      });
    }
    
    console.log('✅ [TEST SSO] Token válido:', user.email);
    res.json({
      success: true,
      data: {
        valid: true,
        user: {
          uid: user.uid,
          email: user.email,
          role: user.role,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        },
        redirectUrl: user.role === 'patient' ? 'http://localhost:3003/dashboard' : 'http://localhost:3002/dashboard'
      }
    });
  } catch (error) {
    console.log('❌ [TEST SSO] Token inválido:', error.message);
    res.status(401).json({
      success: false,
      error: { message: 'Token inválido o expirado' }
    });
  }
});

// SSO Refresh
app.post('/api/v1/auth/sso', (req, res) => {
  const { action } = req.query;
  
  if (action === 'refresh') {
    const { refreshToken } = req.body;
    
    console.log('🔄 [TEST SSO] Refresh attempt');
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: { message: 'Refresh token requerido' }
      });
    }
    
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET);
      
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          success: false,
          error: { message: 'Tipo de token inválido' }
        });
      }
      
      const user = mockUsers.find(u => u.uid === decoded.uid);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Usuario no encontrado' }
        });
      }
      
      // Generar nuevos tokens
      const newAccessToken = jwt.sign(
        {
          uid: user.uid,
          email: user.email,
          role: user.role,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      
      const newRefreshToken = jwt.sign(
        { uid: user.uid, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      console.log('✅ [TEST SSO] Token refrescado:', user.email);
      res.json({
        success: true,
        data: {
          token: newAccessToken,
          refreshToken: newRefreshToken,
          customToken: `custom_token_${user.uid}`,
          expiresAt: Date.now() + 3600000,
          user: {
            uid: user.uid,
            email: user.email,
            role: user.role,
            displayName: user.displayName,
            emailVerified: user.emailVerified
          }
        }
      });
    } catch (error) {
      console.log('❌ [TEST SSO] Refresh token inválido:', error.message);
      res.status(401).json({
        success: false,
        error: { message: 'Refresh token inválido o expirado' }
      });
    }
  } else if (action === 'logout') {
    console.log('👋 [TEST SSO] Logout');
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  }
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  res.status(500).json({
    success: false,
    error: { message: 'Error interno del servidor' }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor de prueba SSO ejecutándose en http://localhost:${PORT}`);
  console.log('📊 Endpoints disponibles:');
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   POST http://localhost:${PORT}/api/v1/auth/sso (login)`);
  console.log(`   GET  http://localhost:${PORT}/api/v1/auth/sso (verify)`);
  console.log(`   POST http://localhost:${PORT}/api/v1/auth/sso?action=refresh`);
  console.log(`   POST http://localhost:${PORT}/api/v1/auth/sso?action=logout`);
  
  console.log('\n👥 Usuarios de prueba:');
  console.log('   patient@altamedica.com / cualquier_password');
  console.log('   doctor@altamedica.com / cualquier_password');
});