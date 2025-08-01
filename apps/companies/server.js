const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3004;

// Configurar la aplicación Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Configuración HTTPS con los certificados generados
  const httpsOptions = {
    key: fs.readFileSync(path.join(process.cwd(), 'certificates', 'localhost-key.pem')),
    cert: fs.readFileSync(path.join(process.cwd(), 'certificates', 'localhost.pem'))
  };

  createServer(httpsOptions, async (req, res) => {
    try {
      // Parse URL
      const parsedUrl = parse(req.url, true);
      const { pathname, query } = parsedUrl;

      // Handle Next.js static files
      if (pathname.startsWith('/_next/')) {
        await handle(req, res, parsedUrl);
      } 
      // Handle public files
      else if (pathname.startsWith('/') && fs.existsSync(path.join(process.cwd(), 'public', pathname))) {
        await handle(req, res, parsedUrl);
      }
      // Handle all other routes
      else {
        await handle(req, res, parsedUrl);
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on https://${hostname}:${port}`);
      console.log(`> HTTPS enabled with local certificates`);
      console.log(`> Next.js ${dev ? 'development' : 'production'} mode`);
    });
});