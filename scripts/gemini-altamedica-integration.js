#!/usr/bin/env node

/**
 * Gemini CLI Integration para AltaMedica
 * 
 * Este script configura Gemini CLI para trabajar con el contexto completo
 * de AltaMedica aprovechando los 2 millones de tokens de contexto.
 * 
 * Uso:
 * - node scripts/gemini-altamedica-integration.js --setup
 * - node scripts/gemini-altamedica-integration.js --analyze-codebase
 * - node scripts/gemini-altamedica-integration.js --test-analysis
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

class GeminiAltamedicaIntegration {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.geminiCliPath = path.join(this.projectRoot, 'gemini-cli', 'bundle', 'gemini.js');
    this.configPath = path.join(this.projectRoot, '.gemini-config.json');
    
    this.altamedicaContext = {
      apps: [
        'web-app',
        'api-server', 
        'doctors',
        'patients',
        'companies',
        'admin',
        'signaling-server'
      ],
      packages: [
        'core',
        'ui',
        'firebase',
        'types',
        'auth',
        'database',
        'medical',
        'telemedicine-core',
        'medical-cache'
      ],
      keyFiles: [
        'CLAUDE.md',
        'package.json',
        'pnpm-workspace.yaml',
        'docker-compose.yml',
        'ecosystem.config.cjs'
      ]
    };
  }

  /**
   * Configurar Gemini CLI para AltaMedica
   */
  async setup() {
    console.log('🏥 Configurando Gemini CLI para AltaMedica...');
    
    // Crear configuración específica para AltaMedica
    const config = {
      "model": "gemini-2.0-flash-exp",
      "temperature": 0.3,
      "maxTokens": 2000000,
      "context": {
        "project": "AltaMedica - Medical Enterprise Platform",
        "domain": "Healthcare/Telemedicine",
        "compliance": ["HIPAA", "SOC2", "WCAG 2.2 AA"],
        "stack": "Next.js 15 + React 19 + TypeScript 5+ + Firebase + WebRTC",
        "architecture": "Monorepo with 7 apps + shared packages"
      },
      "systemPrompt": `You are a specialized AI assistant for AltaMedica, a comprehensive medical enterprise platform.

KEY CONTEXT:
- Healthcare/telemedicine platform with HIPAA compliance requirements
- 7 applications: web-app, api-server, doctors, patients, companies, admin, signaling-server
- Shared packages for core utilities, UI components, Firebase integration
- Medical-specific requirements: patient safety, PHI protection, FHIR compliance
- WebRTC telemedicine with <100ms latency requirements
- Created by Eduardo Marques, MD with medical expertise

PRIORITIES:
1. Patient safety and medical accuracy
2. HIPAA compliance and PHI protection
3. Code quality and TypeScript safety
4. WebRTC performance optimization
5. Medical workflow efficiency

RESTRICTIONS:
- Never expose PHI in logs or debugging
- All medical calculations require comprehensive testing
- Follow FHIR R4 standards for medical data
- Maintain audit trails for compliance`,
      "tools": [
        "file-system",
        "shell",
        "web-search",
        "memory"
      ]
    };

    await this.writeConfig(config);
    console.log('✅ Configuración de Gemini CLI creada');
    
    // Verificar instalación
    await this.verifyInstallation();
  }

  /**
   * Análisis completo del codebase con Gemini
   */
  async analyzeCodebase() {
    console.log('🔍 Iniciando análisis completo del codebase con Gemini...');
    
    const analysisPrompt = `
Analiza el codebase completo de AltaMedica y proporciona:

1. **Arquitectura General**:
   - Estado de cada aplicación (web-app, api-server, doctors, patients, companies, admin, signaling-server)
   - Integración entre aplicaciones
   - Packages compartidos y su uso

2. **Análisis Médico**:
   - Funcionalidades médicas implementadas
   - Compliance HIPAA actual
   - Areas que necesitan mejora médica

3. **Calidad Técnica**:
   - Patrones de código consistentes
   - Testing coverage
   - Áreas que necesitan refactoring

4. **Performance**:
   - WebRTC implementation status
   - API response times
   - Database optimization opportunities

5. **Recomendaciones Prioritarias**:
   - Top 5 mejoras técnicas
   - Top 3 mejoras médicas
   - Roadmap sugerido para próximas 4 semanas

Incluye análisis de archivos específicos de configuración y documentación.
`;

    await this.runGeminiAnalysis(analysisPrompt, 'codebase-analysis');
  }

  /**
   * Análisis de testing específico
   */
  async testAnalysis() {
    console.log('🧪 Iniciando análisis de testing con Gemini...');
    
    const testPrompt = `
Analiza la estrategia de testing actual de AltaMedica:

1. **Coverage Actual**:
   - Unit tests por aplicación
   - E2E tests implementados
   - Testing de funcionalidades médicas críticas

2. **Medical Testing**:
   - Testing de cálculos médicos
   - Validación HIPAA
   - Testing de compliance

3. **WebRTC Testing**:
   - Testing de calidad de video
   - Testing de latencia
   - Testing de conectividad

4. **Automation**:
   - CI/CD testing pipeline
   - Testing de regresión
   - Testing de performance

5. **Recomendaciones**:
   - Tests faltantes críticos
   - Mejoras en automation
   - Testing de scenarios médicos edge cases

Proporciona ejemplos específicos de tests que deberían implementarse.
`;

    await this.runGeminiAnalysis(testPrompt, 'testing-analysis');
  }

  /**
   * Ejecutar análisis con Gemini CLI
   */
  async runGeminiAnalysis(prompt, outputName) {
    return new Promise((resolve, reject) => {
      const outputFile = path.join(this.projectRoot, `analysis-${outputName}-${Date.now()}.md`);
      
      const geminiProcess = spawn('node', [this.geminiCliPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: this.projectRoot
      });

      let output = '';
      let errors = '';

      geminiProcess.stdout.on('data', (data) => {
        output += data.toString();
        process.stdout.write(data);
      });

      geminiProcess.stderr.on('data', (data) => {
        errors += data.toString();
        process.stderr.write(data);
      });

      geminiProcess.on('close', (code) => {
        if (code === 0) {
          fs.writeFileSync(outputFile, output);
          console.log(`✅ Análisis completado: ${outputFile}`);
          resolve(outputFile);
        } else {
          console.error(`❌ Error en análisis: ${errors}`);
          reject(new Error(errors));
        }
      });

      // Enviar el prompt
      geminiProcess.stdin.write(prompt + '\n');
      geminiProcess.stdin.end();
    });
  }

  /**
   * Verificar instalación de Gemini CLI
   */
  async verifyInstallation() {
    return new Promise((resolve, reject) => {
      // Usar comillas dobles para Windows
      const command = `node "${this.geminiCliPath}" --version`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error verificando Gemini CLI:', error);
          // Intentar con path relativo
          const relativeCommand = 'node gemini-cli/bundle/gemini.js --version';
          exec(relativeCommand, (error2, stdout2, stderr2) => {
            if (error2) {
              reject(error2);
            } else {
              console.log('✅ Gemini CLI verificado (ruta relativa):', stdout2.trim());
              resolve(stdout2);
            }
          });
        } else {
          console.log('✅ Gemini CLI verificado:', stdout.trim());
          resolve(stdout);
        }
      });
    });
  }

  /**
   * Escribir configuración
   */
  async writeConfig(config) {
    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
  }

  /**
   * Crear prompts especializados para AltaMedica
   */
  createMedicalPrompts() {
    const prompts = {
      hipaaCompliance: `
Analiza el compliance HIPAA actual en AltaMedica:
- Encryption de PHI
- Audit logging
- Access controls
- Data retention policies
- Backup security
Proporciona recomendaciones específicas para mejorar compliance.
`,
      
      webrtcOptimization: `
Analiza la implementación WebRTC en AltaMedica:
- Latencia actual y optimizaciones
- Calidad de video/audio
- Signaling server performance
- MediaSoup integration
- STUN/TURN configuration
Proporciona optimizaciones técnicas específicas.
`,
      
      medicalWorkflows: `
Analiza los workflows médicos implementados:
- Patient journey desde registro hasta consulta
- Doctor workflow para citas y telemedicina
- Company onboarding y gestión
- Admin oversight y compliance
Identifica bottlenecks y mejoras de UX médico.
`,
      
      apiArchitecture: `
Analiza la arquitectura API de AltaMedica:
- Service layer implementation
- UnifiedAuth middleware
- Rate limiting strategies
- Medical data validation
- Real-time capabilities
Proporciona mejoras de performance y security.
`
    };

    const promptsFile = path.join(this.projectRoot, 'medical-prompts.json');
    fs.writeFileSync(promptsFile, JSON.stringify(prompts, null, 2));
    console.log('✅ Prompts médicos creados:', promptsFile);
  }
}

// CLI execution
async function main() {
  const integration = new GeminiAltamedicaIntegration();
  const args = process.argv.slice(2);

  try {
    if (args.includes('--setup')) {
      await integration.setup();
      integration.createMedicalPrompts();
    } else if (args.includes('--analyze-codebase')) {
      await integration.analyzeCodebase();
    } else if (args.includes('--test-analysis')) {
      await integration.testAnalysis();
    } else {
      console.log(`
🏥 Gemini CLI Integration para AltaMedica

Comandos disponibles:
  --setup              Configurar Gemini CLI para AltaMedica
  --analyze-codebase   Análisis completo del codebase
  --test-analysis      Análisis de estrategia de testing

Ejemplos:
  node scripts/gemini-altamedica-integration.js --setup
  node scripts/gemini-altamedica-integration.js --analyze-codebase
  node scripts/gemini-altamedica-integration.js --test-analysis
`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = GeminiAltamedicaIntegration;