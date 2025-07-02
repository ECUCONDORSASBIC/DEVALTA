"const fetch = require('node-fetch');

const mcpServerUrl = 'http://localhost:3000'; // Asegúrate de que coincida con tu configuración real

async function initiateWarpClient() {
  try {
    const response = await fetch(${mcpServerUrl}/compose_application, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spec: {
          name: 'DemoApp',
          type: 'fullstack',
          frontend: { framework: 'React' },
          backend: { runtime: 'Node.js' },
        },
        context: {
          budget: 5000,
          teamSize: 5,
          timeline: '3 months',
        },
      }),
    });
    
    const result = await response.json();
    console.log('Resultado de la Composición:', result);
  } catch (error) {
    console.error('Error conectando al MCP:', error);
  }
}

initiateWarpClient();"
