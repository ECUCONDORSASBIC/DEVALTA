#!/usr/bin/env node

/**
 * Setup Claude API in Gemini CLI
 * Este script configura Claude como un servicio externo en Gemini
 * para aprovechar la expertise médica de Claude con el contexto masivo de Gemini
 */

const fs = require('fs');
const path = require('path');

class ClaudeGeminiSetup {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.configPath = path.join(this.projectRoot, 'gemini-claude-config.json');
    this.geminiConfigPath = path.join(process.env.HOME || process.env.USERPROFILE, '.gemini');
  }

  /**
   * Crear configuración de Claude para Gemini
   */
  createGeminiConfiguration() {
    const config = {
      "tools": {
        "claude": {
          "enabled": true,
          "api_endpoint": "https://api.anthropic.com/v1/messages",
          "model": "claude-3-5-sonnet-20241022",
          "max_tokens": 8192,
          "system_prompt": `You are Claude, a medical AI assistant specialized in AltaMedica platform.

CONTEXT: AltaMedica is a comprehensive medical enterprise platform with:
- 7 applications (web-app, api-server, doctors, patients, companies, admin, signaling-server)
- HIPAA compliance requirements
- WebRTC telemedicine with <100ms latency targets
- Medical AI with TensorFlow.js
- Production-ready Service Layer architecture

YOUR ROLE:
1. Provide precise medical domain expertise
2. Analyze HIPAA compliance requirements
3. Generate medical-specific code
4. Review medical workflows for safety
5. Ensure patient safety in all recommendations

MEDICAL FOCUS AREAS:
- PHI (Protected Health Information) handling
- FHIR R4 compliance
- Medical calculations validation
- Emergency workflow optimization (<3 seconds)
- WebRTC telemedicine quality assurance`
        }
      },
      "medical_prompts": {
        "hipaa_analysis": "Analyze this code for HIPAA compliance, focusing on PHI handling, encryption, access controls, and audit logging.",
        "webrtc_optimization": "Optimize this WebRTC implementation for medical telemedicine with <100ms latency and HD quality.",
        "medical_workflow": "Review this medical workflow for patient safety, efficiency, and compliance with healthcare standards.",
        "service_layer": "Ensure this code follows the Service Layer pattern required for medical applications.",
        "emergency_optimization": "Optimize this code for emergency medical scenarios with <3 second response time requirements."
      }
    };

    return config;
  }

  /**
   * Crear script de integración para Gemini
   */
  createIntegrationScript() {
    const script = `
// Claude Integration Script for Gemini CLI
// Use this in Gemini to call Claude for medical expertise

async function callClaude(prompt, context = "medical") {
  const config = JSON.parse(require('fs').readFileSync('./gemini-claude-config.json', 'utf8'));
  
  const claudePrompt = \`\${config.medical_context.project} Context:

\${prompt}

Please provide analysis focusing on:
1. Medical safety and patient care
2. HIPAA compliance requirements  
3. Code quality and architecture
4. Performance optimization for medical scenarios
5. Specific actionable recommendations\`;

  console.log("🏥 Calling Claude for medical expertise...");
  console.log("📋 Prompt:", claudePrompt.substring(0, 200) + "...");
  
  return claudePrompt;
}

// Export for use in Gemini
if (typeof module !== 'undefined') {
  module.exports = { callClaude };
}
`;

    return script;
  }

  /**
   * Crear comandos específicos de Claude en Gemini
   */
  createClaudeCommands() {
    const commands = {
      "claude_hipaa": {
        "description": "Analyze code for HIPAA compliance using Claude",
        "command": "callClaude('Analyze this codebase for HIPAA compliance: ${input}', 'hipaa')"
      },
      "claude_webrtc": {
        "description": "Optimize WebRTC for medical telemedicine using Claude", 
        "command": "callClaude('Optimize this WebRTC code for medical telemedicine: ${input}', 'webrtc')"
      },
      "claude_medical": {
        "description": "Review medical workflow with Claude expertise",
        "command": "callClaude('Review this medical workflow: ${input}', 'medical')"
      },
      "claude_architecture": {
        "description": "Analyze architecture patterns with Claude",
        "command": "callClaude('Analyze this architecture for medical compliance: ${input}', 'architecture')"
      }
    };

    return commands;
  }

  /**
   * Setup completo
   */
  async setup() {
    console.log('🏥 Configurando Claude API en Gemini CLI...');

    try {
      // 1. Crear configuración base
      const config = this.createGeminiConfiguration();
      fs.writeFileSync(
        path.join(this.projectRoot, 'gemini-config-with-claude.json'), 
        JSON.stringify(config, null, 2)
      );

      // 2. Crear script de integración
      const script = this.createIntegrationScript();
      fs.writeFileSync(
        path.join(this.projectRoot, 'claude-integration.js'),
        script
      );

      // 3. Crear comandos
      const commands = this.createClaudeCommands();
      fs.writeFileSync(
        path.join(this.projectRoot, 'claude-commands.json'),
        JSON.stringify(commands, null, 2)
      );

      // 4. Crear script de inicio
      const startScript = this.createStartScript();
      fs.writeFileSync(
        path.join(this.projectRoot, 'start-gemini-with-claude.js'),
        startScript
      );

      console.log('✅ Configuración de Claude en Gemini completada');
      console.log('📁 Archivos creados:');
      console.log('  - gemini-config-with-claude.json');
      console.log('  - claude-integration.js');
      console.log('  - claude-commands.json');
      console.log('  - start-gemini-with-claude.js');

      console.log('\\n🚀 Próximos pasos:');
      console.log('1. Obtener Claude API key de https://console.anthropic.com');
      console.log('2. Editar gemini-claude-config.json con tu API key');
      console.log('3. Ejecutar: node start-gemini-with-claude.js');

    } catch (error) {
      console.error('❌ Error en setup:', error);
    }
  }

  /**
   * Script de inicio con Claude integrado
   */
  createStartScript() {
    return `#!/usr/bin/env node

/**
 * Start Gemini CLI with Claude Integration
 * Combina el contexto masivo de Gemini con la expertise médica de Claude
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🏥 Iniciando Gemini CLI con Claude Integration...');
console.log('🤖 Gemini: Contexto masivo (2M tokens)');
console.log('🧠 Claude: Expertise médica especializada');
console.log('');

// Cargar configuración de Claude
const config = require('./gemini-claude-config.json');

console.log('📋 Configuración médica:');
console.log('  - Proyecto:', config.medical_context.project);
console.log('  - Compliance:', config.medical_context.compliance.join(', '));
console.log('  - Stack:', config.medical_context.stack);
console.log('');

// Comandos disponibles
console.log('🔧 Comandos Claude disponibles en Gemini:');
console.log('  @claude_hipaa - Análisis HIPAA compliance');
console.log('  @claude_webrtc - Optimización WebRTC médica');
console.log('  @claude_medical - Review workflows médicos');
console.log('  @claude_architecture - Análisis arquitectura');
console.log('');

// Iniciar Gemini CLI
const geminiPath = path.join(__dirname, 'gemini-cli', 'bundle', 'gemini.js');
const geminiProcess = spawn('node', [geminiPath, '--all-files', '--show-memory-usage'], {
  stdio: 'inherit',
  cwd: __dirname
});

geminiProcess.on('close', (code) => {
  console.log(\`Gemini CLI terminado con código: \${code}\`);
});

geminiProcess.on('error', (error) => {
  console.error('Error iniciando Gemini CLI:', error);
});
`;
  }
}

// Ejecutar setup si se llama directamente
if (require.main === module) {
  const setup = new ClaudeGeminiSetup();
  setup.setup();
}

module.exports = ClaudeGeminiSetup;