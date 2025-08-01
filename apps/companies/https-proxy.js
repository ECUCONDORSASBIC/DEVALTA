const https = require('https');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');

// Crear proxy
const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:3004',
  changeOrigin: true,
  ws: true
});

// Configuración HTTPS
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certificates', 'localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certificates', 'localhost.pem'))
};

// Crear servidor HTTPS
const server = https.createServer(httpsOptions, (req, res) => {
  proxy.web(req, res, {}, (err) => {
    console.error('Proxy error:', err);
    res.writeHead(502);
    res.end('Bad Gateway');
  });
});

// Manejar WebSocket
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

// Manejar errores del proxy
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (res.writeHead) {
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    res.end('Proxy error');
  }
});

const HTTPS_PORT = 3005;

server.listen(HTTPS_PORT, () => {
  console.log(`HTTPS Proxy server running at https://localhost:${HTTPS_PORT}`);
  console.log('Proxying to Next.js at http://localhost:3004');
  console.log('');
  console.log('To use:');
  console.log('1. Run "npm run dev:http" in another terminal');
  console.log(`2. Access https://localhost:${HTTPS_PORT}`);
});