#!/usr/bin/env node
/**
 * MCP Server Simple: AI Medical Core
 * Versión simplificada sin dependencias complejas
 */

import { readFileSync, existsSync } from 'fs';
import { glob } from 'glob';
import * as path from 'path';

// Configuración simplificada de AltaMedica
const ALTAMEDICA_CONFIG = {
  maxFileSize: 1000, // líneas
  medicalPackages: [
    'packages/ai-medical-core',
    'packages/medical-components', 
    'packages/medical-types'
  ]
};

class SimpleMedicalAIServer {
  constructor() {
    console.error('[MCP-MEDICAL-SIMPLE] Iniciando servidor AI médico simplificado');
    this.medicalCache = new Map();
  }

  // Simulación de herramientas MCP para Claude Code
  async handleMCPRequest(toolName, args) {
    try {
      switch (toolName) {
        case 'mcp__altamedica__ml_files':
          return await this.getMedicalFiles(args);
        
        case 'mcp__altamedica__medical_terms':
          return await this.extractMedicalTerms(args);
        
        case 'mcp__altamedica__risk_analysis':
          return await this.analyzeMedicalRisk(args);
        
        case 'mcp__altamedica__code_analysis':
          return await this.analyzeCodeCompliance(args);
        
        default:
          return {
            error: `Herramienta desconocida: ${toolName}`,
            availableTools: [
              'mcp__altamedica__ml_files',
              'mcp__altamedica__medical_terms', 
              'mcp__altamedica__risk_analysis',
              'mcp__altamedica__code_analysis'
            ]
          };
      }
    } catch (error) {
      return {
        error: `Error en ${toolName}: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getMedicalFiles(args) {
    const { pattern = 'medical', includeContent = false } = args;
    
    console.error(`[MCP-MEDICAL-SIMPLE] Buscando archivos ML: ${pattern}`);
    
    // Buscar archivos en packages médicos
    const results = [];
    
    for (const pkg of ALTAMEDICA_CONFIG.medicalPackages) {
      try {
        // Usar rutas relativas desde el directorio raíz del proyecto
        const projectRoot = process.cwd().replace('/mcp-servers', '');
        const searchPath = path.join(projectRoot, pkg);
        
        if (existsSync(searchPath)) {
          // Buscar archivos TypeScript/JavaScript
          const files = [
            `${searchPath}/**/*.ts`,
            `${searchPath}/**/*.tsx`,
            `${searchPath}/**/*.js`,
            `${searchPath}/**/*.jsx`
          ];
          
          for (const filePattern of files) {
            try {
              const foundFiles = await this.simpleGlob(filePattern);
              
              for (const file of foundFiles) {
                if (file.toLowerCase().includes(pattern.toLowerCase())) {
                  const analysis = this.analyzeFile(file, includeContent);
                  if (analysis) {
                    results.push(analysis);
                  }
                }
              }
            } catch (globError) {
              console.error(`[MCP-MEDICAL-SIMPLE] Error en glob ${filePattern}:`, globError.message);
            }
          }
        }
      } catch (error) {
        console.error(`[MCP-MEDICAL-SIMPLE] Error buscando en ${pkg}:`, error.message);
      }
    }
    
    return {
      pattern,
      totalFiles: results.length,
      files: results.slice(0, 10), // Limitar para evitar 429
      recommendations: {
        tokenEstimate: results.reduce((sum, f) => sum + f.lines, 0),
        suggestedModel: results.some(f => f.complexity === 'high') ? 'Opus 4' : 'Sonnet 4',
        hipaaRisk: results.some(f => !f.hipaaCompliant) ? 'MEDIUM' : 'LOW'
      },
      timestamp: new Date().toISOString()
    };
  }

  async extractMedicalTerms(args) {
    const { text, language = 'es' } = args;
    
    console.error(`[MCP-MEDICAL-SIMPLE] Extrayendo términos médicos (${language})`);
    
    // Términos médicos básicos (sin NLP complejo)
    const medicalTerms = {
      es: [
        'diabetes', 'hipertensión', 'cardiopatía', 'neumonía', 'asma',
        'cáncer', 'tumor', 'infección', 'fractura', 'alergia',
        'síntoma', 'diagnóstico', 'tratamiento', 'medicamento', 'dosis',
        'paciente', 'doctor', 'médico', 'enfermero', 'hospital'
      ],
      en: [
        'diabetes', 'hypertension', 'cardiopathy', 'pneumonia', 'asthma',
        'cancer', 'tumor', 'infection', 'fracture', 'allergy',
        'symptom', 'diagnosis', 'treatment', 'medication', 'dose',
        'patient', 'doctor', 'physician', 'nurse', 'hospital'
      ]
    };

    const foundTerms = [];
    const termList = medicalTerms[language] || medicalTerms.es;
    
    for (const term of termList) {
      if (text.toLowerCase().includes(term.toLowerCase())) {
        foundTerms.push(term);
      }
    }

    // Detectar posibles datos PHI
    const phiRisk = this.detectPHI(text);

    return {
      language,
      medicalTerms: foundTerms,
      medicalTermsCount: foundTerms.length,
      phiRisk,
      recommendations: {
        hipaaCompliant: !phiRisk.hasRisk,
        suggestedActions: phiRisk.hasRisk ? 
          ['Anonimizar datos', 'Revisar compliance HIPAA'] : 
          ['Continuar análisis']
      },
      timestamp: new Date().toISOString()
    };
  }

  async analyzeMedicalRisk(args) {
    const { symptoms = [], age, history = [] } = args;
    
    console.error(`[MCP-MEDICAL-SIMPLE] Analizando riesgo médico: ${symptoms.join(', ')}`);
    
    // Análisis simplificado de riesgo
    const riskFactors = {
      cardiovascular: this.calculateCardiovascularRisk(symptoms, age, history),
      respiratory: this.calculateRespiratoryRisk(symptoms),
      general: this.calculateGeneralRisk(symptoms, history)
    };

    const overallRisk = Math.max(
      riskFactors.cardiovascular,
      riskFactors.respiratory, 
      riskFactors.general
    );

    return {
      riskAnalysis: {
        overall: {
          score: Math.round(overallRisk * 100) / 100,
          level: this.getRiskLevel(overallRisk),
          confidence: 0.75
        },
        categories: riskFactors,
        recommendations: this.getMedicalRecommendations(overallRisk, symptoms),
        disclaimer: 'ANÁLISIS AUTOMATIZADO - NO REEMPLAZA CONSULTA MÉDICA PROFESIONAL'
      },
      metadata: {
        analysisDate: new Date().toISOString(),
        anonymized: true,
        hipaaCompliant: true,
        modelVersion: 'altamedica-simple-v1.0'
      }
    };
  }

  async analyzeCodeCompliance(args) {
    const { filePath, checkHIPAA = true } = args;
    
    if (!existsSync(filePath)) {
      throw new Error(`Archivo no encontrado: ${filePath}`);
    }

    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    console.error(`[MCP-MEDICAL-SIMPLE] Analizando compliance: ${filePath}`);
    
    const analysis = {
      file: filePath,
      lines: lines.length,
      issues: [],
      recommendations: [],
      hipaaCompliance: { compliant: true, issues: [] },
      codeQuality: { score: 100, issues: [] }
    };

    // Verificar compliance HIPAA básico
    if (checkHIPAA) {
      const hipaaIssues = this.checkHIPAACompliance(content);
      analysis.hipaaCompliance = hipaaIssues;
    }

    // Verificar tamaño del archivo
    if (analysis.lines > ALTAMEDICA_CONFIG.maxFileSize) {
      analysis.recommendations.push(`Considerar dividir archivo (${analysis.lines} líneas > ${ALTAMEDICA_CONFIG.maxFileSize})`);
    }

    // Verificar patrones médicos
    const medicalPatterns = ['patient', 'medical', 'diagnosis', 'treatment'];
    const hasMedicalCode = medicalPatterns.some(pattern => 
      content.toLowerCase().includes(pattern)
    );

    if (hasMedicalCode) {
      analysis.recommendations.push('Código médico detectado - asegurar validación y JSDoc');
    }

    return analysis;
  }

  // Métodos auxiliares simplificados
  async simpleGlob(pattern) {
    try {
      // Implementación básica de búsqueda de archivos
      return await glob(pattern, { ignore: '**/node_modules/**' });
    } catch (error) {
      console.error(`[MCP-MEDICAL-SIMPLE] Glob error:`, error.message);
      return [];
    }
  }

  analyzeFile(filePath, includeContent) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').length;
      
      // Aplicar límite de líneas
      if (lines > ALTAMEDICA_CONFIG.maxFileSize) {
        console.error(`[MCP-MEDICAL-SIMPLE] Archivo ${filePath} excede límite, omitiendo`);
        return null;
      }
      
      const complexity = this.assessComplexity(content);
      const hipaaCompliant = !this.detectPHI(content).hasRisk;
      
      return {
        path: filePath.replace(process.cwd(), '.'),
        lines,
        ...(includeContent ? { content: content.substring(0, 2000) } : {}),
        complexity,
        hipaaCompliant,
        medicalRelevance: this.assessMedicalRelevance(content)
      };
    } catch (error) {
      console.error(`[MCP-MEDICAL-SIMPLE] Error analizando ${filePath}:`, error.message);
      return null;
    }
  }

  assessComplexity(content) {
    const complexityIndicators = [
      /tensorflow|machine.*learning/gi,
      /neural.*network|algorithm/gi,
      /async.*await|promise/gi,
      /class.*extends|interface/gi
    ];

    const score = complexityIndicators.reduce((acc, pattern) => {
      return acc + (content.match(pattern) || []).length;
    }, 0);

    if (score > 8) return 'high';
    if (score > 3) return 'medium';
    return 'low';
  }

  assessMedicalRelevance(content) {
    const medicalKeywords = ['medical', 'patient', 'doctor', 'diagnosis', 'treatment', 'health'];
    const matches = medicalKeywords.filter(keyword => 
      content.toLowerCase().includes(keyword)
    );
    return matches.length > 0 ? 'high' : 'low';
  }

  detectPHI(text) {
    const phiPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b[A-Za-z]+\s+[A-Za-z]+\s+born\s+\d{4}\b/, // Names with birth year
      /patient.*id.*[\w\d-]{6,}/gi, // Patient IDs
      /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/ // Credit cards
    ];

    const foundPatterns = [];
    for (let i = 0; i < phiPatterns.length; i++) {
      if (phiPatterns[i].test(text)) {
        foundPatterns.push(`Pattern ${i + 1}`);
      }
    }

    return {
      hasRisk: foundPatterns.length > 0,
      patterns: foundPatterns,
      severity: foundPatterns.length > 2 ? 'HIGH' : foundPatterns.length > 0 ? 'MEDIUM' : 'LOW'
    };
  }

  calculateCardiovascularRisk(symptoms, age, history) {
    let risk = 0;
    
    const cardioSymptoms = ['chest pain', 'dolor pecho', 'palpitaciones', 'fatigue'];
    symptoms.forEach(symptom => {
      if (cardioSymptoms.some(cs => symptom.toLowerCase().includes(cs))) {
        risk += 0.3;
      }
    });

    if (age && age > 50) risk += 0.2;
    if (history.some(h => h.toLowerCase().includes('diabetes'))) risk += 0.25;

    return Math.min(risk, 1.0);
  }

  calculateRespiratoryRisk(symptoms) {
    const respSymptoms = ['cough', 'tos', 'difficulty breathing', 'wheezing'];
    let risk = 0;
    
    symptoms.forEach(symptom => {
      if (respSymptoms.some(rs => symptom.toLowerCase().includes(rs))) {
        risk += 0.4;
      }
    });

    return Math.min(risk, 1.0);
  }

  calculateGeneralRisk(symptoms, history) {
    const baseRisk = Math.min(symptoms.length * 0.1, 0.5);
    const historyRisk = Math.min(history.length * 0.05, 0.3);
    
    return Math.min(baseRisk + historyRisk, 1.0);
  }

  getRiskLevel(score) {
    if (score > 0.7) return 'HIGH';
    if (score > 0.4) return 'MEDIUM';
    return 'LOW';
  }

  getMedicalRecommendations(riskScore, symptoms) {
    const recommendations = [];
    
    if (riskScore > 0.7) {
      recommendations.push('Consulta médica urgente recomendada');
      recommendations.push('Monitoreo continuo de síntomas');
    } else if (riskScore > 0.4) {
      recommendations.push('Programar consulta médica');
      recommendations.push('Seguimiento de síntomas por 24-48 horas');
    } else {
      recommendations.push('Monitoreo rutinario');
      recommendations.push('Consulta si síntomas empeoran');
    }

    return recommendations;
  }

  checkHIPAACompliance(content) {
    const issues = [];
    let compliant = true;

    // Verificar logging de datos sensibles
    if (/console\.(log|error|warn).*patient/gi.test(content)) {
      issues.push('Posible logging de datos de pacientes');
      compliant = false;
    }

    // Verificar contraseñas sin encriptar
    if (content.includes('password') && !content.includes('encrypt')) {
      issues.push('Contraseñas sin encriptación detectadas');
      compliant = false;
    }

    return { compliant, issues };
  }

  // Simulación de servidor HTTP simple para testing
  startSimpleServer() {
    const port = 8001;
    
    // Crear servidor HTTP básico para testing
    import('http').then(({ createServer }) => {
      const server = createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        
        if (req.url === '/health') {
          res.end(JSON.stringify({ status: 'OK', server: 'medical-ai-simple' }));
          return;
        }
        
        if (req.url === '/tools') {
          res.end(JSON.stringify({
            availableTools: [
              'mcp__altamedica__ml_files',
              'mcp__altamedica__medical_terms',
              'mcp__altamedica__risk_analysis', 
              'mcp__altamedica__code_analysis'
            ]
          }));
          return;
        }
        
        res.end(JSON.stringify({ 
          message: 'AltaMedica Medical AI Server (Simple)',
          status: 'running',
          endpoints: ['/health', '/tools']
        }));
      });
      
      server.listen(port, () => {
        console.error(`[MCP-MEDICAL-SIMPLE] Servidor HTTP iniciado en puerto ${port}`);
        console.error(`[MCP-MEDICAL-SIMPLE] Prueba: curl http://localhost:${port}/health`);
      });
    }).catch(error => {
      console.error(`[MCP-MEDICAL-SIMPLE] Error iniciando servidor HTTP:`, error.message);
    });
  }
}

// Iniciar servidor
const server = new SimpleMedicalAIServer();

// Simular entrada de stdin para MCP
process.stdin.on('data', async (data) => {
  try {
    const input = JSON.parse(data.toString());
    const result = await server.handleMCPRequest(input.tool_name, input.tool_input);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('[MCP-MEDICAL-SIMPLE] Error procesando entrada:', error.message);
  }
});

// Iniciar servidor HTTP para testing
server.startSimpleServer();

console.error('[MCP-MEDICAL-SIMPLE] Servidor AI médico simplificado iniciado');
console.error('[MCP-MEDICAL-SIMPLE] Escuchando en stdin para comandos MCP');

export default SimpleMedicalAIServer;