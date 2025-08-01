const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Leer certificados
const options = {
  key: fs.readFileSync(path.join(__dirname, 'certificates', 'localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certificates', 'localhost.pem'))
};

// Crear proxy HTTPS hacia el servidor Next.js
const server = https.createServer(options);

// Iniciar Next.js en modo HTTP normal
const nextProcess = spawn('npm', ['run', 'dev:http'], {
  stdio: 'inherit',
  shell: true
});

// Proxy las peticiones
server.on('request', (req, res) => {
  const proxy = require('http').request({
    hostname: 'localhost',
    port: 3004,
    path: req.url,
    method: req.method,
    headers: req.headers
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  req.pipe(proxy);
});

server.listen(3005, () => {
  console.log('HTTPS server running at https://localhost:3005');
  console.log('Proxying to Next.js at http://localhost:3004');
});

// Limpiar al salir
process.on('SIGINT', () => {
  nextProcess.kill();
  process.exit();
});