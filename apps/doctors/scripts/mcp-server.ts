// mcp-server.ts
// Módulo: ESM (TypeScript)
// Documentación: https://www.modelcontextprotocol.org/

import { createMcpServer } from '@modelcontextprotocol/sdk';

const server = createMcpServer({
  port: 4000, // Cambia el puerto si tienes más servidores MCP
  resources: [
    {
      id: 'hello',
      type: 'text',
      getContent: async () => '¡Servidor MCP de Doctors activo!',
    },
  ],
  tools: [],
});

server.start();
console.log('Servidor MCP (Doctors) corriendo en el puerto 4000'); 