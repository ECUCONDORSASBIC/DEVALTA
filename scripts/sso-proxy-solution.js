const express = require('express');
const httpProxy = require('http-proxy-middleware');
const cookieParser = require('cookie-parser');

/**
 * SSO Proxy Solution for AltaMedica
 * 
 * This proxy runs on port 8080 and forwards requests to the appropriate services
 * while maintaining cookie consistency across different ports.
 */

const app = express();
app.use(cookieParser());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[SSO Proxy] ${req.method} ${req.path} -> ${req.headers.host}`);
  console.log('[SSO Proxy] Cookies:', Object.keys(req.cookies));
  next();
});

// Routes configuration
const routes = {
  '/api': 'http://localhost:3001',
  '/patients': 'http://localhost:3003',
  '/doctors': 'http://localhost:3002',
  '/companies': 'http://localhost:3004',
  '/admin': 'http://localhost:3005',
  '/': 'http://localhost:3000', // Default to web-app
};

// Create proxy middleware for each route
Object.entries(routes).forEach(([path, target]) => {
  const proxyOptions = {
    target,
    changeOrigin: true,
    ws: true, // Enable WebSocket proxy
    pathRewrite: path === '/' ? {} : { [`^${path}`]: '' },
    onProxyReq: (proxyReq, req, res) => {
      // Forward cookies
      const cookies = req.headers.cookie;
      if (cookies) {
        proxyReq.setHeader('cookie', cookies);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Rewrite cookie domain to work with proxy
      const setCookieHeaders = proxyRes.headers['set-cookie'];
      if (setCookieHeaders) {
        proxyRes.headers['set-cookie'] = setCookieHeaders.map(cookie => {
          // Remove domain restrictions
          return cookie
            .replace(/domain=[^;]+;?/gi, '')
            .replace(/secure;?/gi, ''); // Remove secure flag for local dev
        });
      }
    }
  };
  
  app.use(path, httpProxy.createProxyMiddleware(proxyOptions));
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`
========================================
SSO Proxy Server Running on port ${PORT}
========================================

Access your apps through the proxy:
- Web App: http://localhost:${PORT}/
- Patients: http://localhost:${PORT}/patients
- Doctors: http://localhost:${PORT}/doctors
- API: http://localhost:${PORT}/api

This proxy ensures cookies work across all services.
  `);
});