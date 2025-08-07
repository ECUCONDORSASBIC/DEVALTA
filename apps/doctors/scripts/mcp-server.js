// mcp-server.js
// Módulo: CJS (CommonJS)
// Documentación: https://www.modelcontextprotocol.org/

const { createMcpServer } = require('@modelcontextprotocol/sdk');

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