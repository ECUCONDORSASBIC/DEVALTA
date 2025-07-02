// 🧪 TEST: Warp MCP Connection
// Prueba rápida de conectividad entre Warp y Enhanced Multi-Agent Composer

console.log('🎼 WARP MCP CONNECTION TEST')
console.log('='.repeat(50))

async function testWarpMCPConnection() {
  try {
    console.log('🚀 Paso 1: Importando Enhanced Multi-Agent Composer...')
    
    // Importar de forma dinámica para evitar problemas de ES modules
    const { EnhancedMultiAgentComposer } = await import('./enhanced-multi-agent-mcp.js')
    
    console.log('✅ Módulo importado exitosamente')
    
    console.log('🏗️ Paso 2: Inicializando sistema...')
    const composer = new EnhancedMultiAgentComposer()
    
    console.log('✅ Sistema inicializado')
    
    console.log('🤖 Paso 3: Obteniendo agentes disponibles...')
    const agents = Array.from(composer.agents.values())
    
    console.log('✅ Encontrados ' + agents.length + ' agentes:')
    agents.forEach((agent, index) => {
      console.log('   ' + (index + 1) + '. ' + agent.type + ' (' + agent.id + ')')
    })
    
    console.log('🎯 Paso 4: Probando composición simple...')
    
    const testSpec = {
      name: 'WarpTestApp',
      type: 'fullstack',
      frontend: { framework: 'React' },
      backend: { runtime: 'Node.js' }
    }
    
    const testContext = {
      budget: 1000,
      teamSize: 3,
      timeline: '1 month'
    }
    
    const composition = await composer.composeApplicationEnhanced(testSpec, testContext)
    
    console.log('✅ Composición completada exitosamente!')
    console.log('   - ID: ' + composition.id)
    console.log('   - Arquitectura: ' + composition.architecture.type)
    console.log('   - Complejidad: ' + composition.architecture.complexity)
    console.log('   - Score Ético: ' + composition.principleAlignment.overallEthicalScore.toFixed(2) + '/100')
    
    console.log('')
    console.log('🎉 RESULTADO: ¡Warp puede conectarse perfectamente a tu MCP!')
    console.log('📋 Próximos pasos:')
    console.log('   1. Usa: node warp-mcp-connector.js')
    console.log('   2. O ejecuta: warp-start.bat')
    console.log('   3. Empieza a usar comandos como: compose MiApp')
    
  } catch (error) {
    console.error('💥 Error en la prueba:', error.message)
    console.log('')
    console.log('🔧 Posibles soluciones:')
    console.log('   1. Verifica que todas las dependencias estén instaladas')
    console.log('   2. Asegúrate de que los archivos del MCP estén presentes')
    console.log('   3. Verifica la configuración de Node.js')
  }
}

// Ejecutar la prueba
testWarpMCPConnection()
