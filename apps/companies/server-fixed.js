import { createServer } from 'https';
import { createServer as createHttpServer } from 'http';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3004;

// Configurar la aplicación Next.js
const app = next({ dev });
const handle = app.getRequestHandler();

console.log('Preparing Next.js application...');

app.prepare().then(() => {
  // Verificar si tenemos certificados
  const certPath = path.join(__dirname, 'certificates', 'localhost.pem');
  const keyPath = path.join(__dirname, 'certificates', 'localhost-key.pem');
  
  const useHttps = fs.existsSync(certPath) && fs.existsSync(keyPath);
  
  if (useHttps) {
    console.log('Found SSL certificates, starting HTTPS server...');
    
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };

    createServer(httpsOptions, (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on https://${hostname}:${port}`);
      console.log(`> HTTPS enabled with local certificates`);
    });
  } else {
    console.log('No SSL certificates found, starting HTTP server...');
    
    createHttpServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> To enable HTTPS, run the certificate generation commands`);
    });
  }
});