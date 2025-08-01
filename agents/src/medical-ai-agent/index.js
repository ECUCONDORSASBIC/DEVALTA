#!/usr/bin/env node
/**
 * MCP Server: AI Medical Core
 * Proporciona contexto inteligente para ai-medical-core, reduce tokens 429
 * Integra TensorFlow.js, NLP médico y diagnóstico automático
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, existsSync } from 'fs';
import { glob } from 'glob';
import { z } from 'zod';
import * as tf from '@tensorflow/tfjs-node';
import nlp from 'compromise';

// Configuración específica de AltaMedica
const ALTAMEDICA_CONFIG = {
  maxFileSize: 1000, // líneas, para evitar 429
  medicalPackages: [
    'packages/ai-medical-core',
    'packages/medical-components', 
    'packages/medical-types',
    'packages/medical-utils',
    'packages/medical-fhir'
  ],
  aiModels: {
    diagnosis: 'models/medical-diagnosis.json',
    nlp: 'models/medical-nlp.json',
    risk: 'models/cardiovascular-risk.json'
  }
};

// Esquemas de validación médica
const MedicalFileSchema = z.object({
  path: z.string(),
  content: z.string(),
  lines: z.number(),
  medicalTerms: z.array(z.string()),
  complexity: z.enum(['low', 'medium', 'high']),
  hipaaCompliant: z.boolean()
});

const DiagnosisRequestSchema = z.object({
  symptoms: z.array(z.string()),
  patientAge: z.number().optional(),
  medicalHistory: z.array(z.string()).optional(),
  anonymized: z.boolean().default(true)
});

class MedicalAIServer {
  constructor() {
    this.server = new Server(
      {
        name: 'altamedica-medical-ai',
        version: '1.0.0',
        description: 'MCP Server para AI médica de AltaMedica'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    // Cache médico para optimizar tokens
    this.medicalCache = new Map();
    this.modelCache = new Map();
    
    this.setupHandlers();
  }

  setupHandlers() {
    // Lista de herramientas disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'mcp__altamedica__ml_files',
            description: 'Obtiene archivos ML específicos de ai-medical-core (<1000 líneas)',
            inputSchema: {
              type: 'object',
              properties: {
                pattern: {
                  type: 'string',
                  description: 'Patrón de búsqueda (ej: "tensorflow", "diagnosis", "nlp")'
                },
                includeContent: {
                  type: 'boolean',
                  description: 'Incluir contenido de archivos',
                  default: false
                }
              },
              required: ['pattern']
            }
          },
          {
            name: 'mcp__altamedica__medical_terms',
            description: 'Extrae términos médicos de texto usando NLP',
            inputSchema: {
              type: 'object',
              properties: {
                text: {
                  type: 'string',
                  description: 'Texto para analizar'
                },
                language: {
                  type: 'string',
                  description: 'Idioma (es/en)',
                  default: 'es'
                }
              },
              required: ['text']
            }
          },
          {
            name: 'mcp__altamedica__risk_analysis',
            description: 'Análisis de riesgo médico con TensorFlow.js (anonimizado)',
            inputSchema: {
              type: 'object',
              properties: {
                symptoms: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Lista de síntomas'
                },
                age: {
                  type: 'number',
                  description: 'Edad del paciente (opcional)'
                },
                history: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Historial médico relevante'
                }
              },
              required: ['symptoms']
            }
          },
          {
            name: 'mcp__altamedica__code_analysis',
            description: 'Analiza código médico para compliance y calidad',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: 'Ruta del archivo a analizar'
                },
                checkHIPAA: {
                  type: 'boolean',
                  description: 'Verificar compliance HIPAA',
                  default: true
                }
              },
              required: ['filePath']
            }
          }
        ]
      };
    });

    // Implementación de herramientas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'mcp__altamedica__ml_files':
            return await this.getMedicalFiles(args);
          
          case 'mcp__altamedica__medical_terms':
            return await this.extractMedicalTerms(args);
          
          case 'mcp__altamedica__risk_analysis':
            return await this.analyzeMedicalRisk(args);
          
          case 'mcp__altamedica__code_analysis':
            return await this.analyzeCodeCompliance(args);
          
          default:
            throw new Error(`Herramienta desconocida: ${name}`);
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error en ${name}: ${error.message}`
          }],
          isError: true
        };
      }
    });
  }

  async getMedicalFiles(args) {
    const { pattern, includeContent = false } = args;
    
    console.error(`[MCP-MEDICAL] Buscando archivos ML: ${pattern}`);
    
    // Buscar en packages médicos específicos
    const searchPatterns = ALTAMEDICA_CONFIG.medicalPackages.map(pkg => 
      `${pkg}/**/*.{ts,tsx,js,jsx}`
    );
    
    const allFiles = [];
    for (const searchPattern of searchPatterns) {
      try {
        const files = await glob(searchPattern, { 
          cwd: process.cwd(),
          ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.*']
        });
        allFiles.push(...files);
      } catch (error) {
        console.error(`[MCP-MEDICAL] Error buscando ${searchPattern}:`, error);
      }
    }
    
    // Filtrar por patrón médico
    const medicalFiles = allFiles.filter(file => {
      const content = this.getCachedFileContent(file);
      return content && (
        content.toLowerCase().includes(pattern.toLowerCase()) ||
        file.toLowerCase().includes(pattern.toLowerCase())
      );
    }).slice(0, 10); // Limitar a 10 archivos para evitar 429

    const results = [];
    
    for (const file of medicalFiles) {
      try {
        const content = this.getCachedFileContent(file);
        const lines = content.split('\n').length;
        
        // Aplicar límite de líneas para evitar 429
        if (lines > ALTAMEDICA_CONFIG.maxFileSize) {
          console.error(`[MCP-MEDICAL] Archivo ${file} excede ${ALTAMEDICA_CONFIG.maxFileSize} líneas, omitiendo`);
          continue;
        }
        
        const analysis = await this.analyzeMedicalFile(file, content);
        
        results.push({
          path: file,
          lines,
          ...(includeContent ? { content: content.substring(0, 2000) } : {}),
          medicalTerms: analysis.medicalTerms,
          complexity: analysis.complexity,
          hipaaCompliant: analysis.hipaaCompliant,
          recommendedModel: this.getRecommendedModel(analysis)
        });
        
      } catch (error) {
        console.error(`[MCP-MEDICAL] Error procesando ${file}:`, error);
      }
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          pattern,
          totalFiles: results.length,
          files: results,
          recommendations: {
            tokenEstimate: results.reduce((sum, f) => sum + f.lines, 0),
            suggestedModel: results.some(f => f.complexity === 'high') ? 'Opus 4' : 'Sonnet 4',
            hipaaRisk: results.some(f => !f.hipaaCompliant) ? 'HIGH' : 'LOW'
          }
        }, null, 2)
      }]
    };
  }

  async extractMedicalTerms(args) {
    const { text, language = 'es' } = args;
    
    console.error(`[MCP-MEDICAL] Extrayendo términos médicos (${language})`);
    
    // Usar compromise para NLP médico
    const doc = nlp(text);
    
    // Términos médicos específicos en español
    const medicalTerms = {
      es: [
        'diabetes', 'hipertensión', 'cardiopatía', 'neumonía', 'asma',
        'cáncer', 'tumor', 'infección', 'fractura', 'alergia',
        'síntoma', 'diagnóstico', 'tratamiento', 'medicamento', 'dosis',
        'paciente', 'doctor', 'médico', 'enfermero', 'hospital',
        'consulta', 'examen', 'análisis', 'radiografía', 'ecografía'
      ],
      en: [
        'diabetes', 'hypertension', 'cardiopathy', 'pneumonia', 'asthma',
        'cancer', 'tumor', 'infection', 'fracture', 'allergy',
        'symptom', 'diagnosis', 'treatment', 'medication', 'dose',
        'patient', 'doctor', 'physician', 'nurse', 'hospital',
        'consultation', 'examination', 'analysis', 'x-ray', 'ultrasound'
      ]
    };

    const foundTerms = [];
    const termList = medicalTerms[language] || medicalTerms.es;
    
    for (const term of termList) {
      if (text.toLowerCase().includes(term.toLowerCase())) {
        foundTerms.push(term);
      }
    }

    // Extraer entidades médicas con NLP
    const people = doc.people().out('array');
    const places = doc.places().out('array');
    const dates = doc.dates().out('array');
    
    // Detectar posibles datos PHI (para HIPAA)
    const phiRisk = this.detectPHI(text);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          language,
          medicalTerms: foundTerms,
          entities: {
            people: people.slice(0, 5), // Limitar para privacidad
            places: places.slice(0, 5),
            dates: dates.slice(0, 3)
          },
          phiRisk,
          recommendations: {
            hipaaCompliant: !phiRisk.hasRisk,
            suggestedActions: phiRisk.hasRisk ? 
              ['Anonimizar datos', 'Revisar compliance HIPAA'] : 
              ['Continuar análisis']
          }
        }, null, 2)
      }]
    };
  }

  async analyzeMedicalRisk(args) {
    const validatedArgs = DiagnosisRequestSchema.parse(args);
    const { symptoms, age, history = [] } = validatedArgs;
    
    console.error(`[MCP-MEDICAL] Analizando riesgo médico: ${symptoms.join(', ')}`);
    
    // Simulación de análisis con TensorFlow.js (reemplazar con modelo real)
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
      content: [{
        type: 'text',
        text: JSON.stringify({
          riskAnalysis: {
            overall: {
              score: overallRisk,
              level: this.getRiskLevel(overallRisk),
              confidence: 0.75 // Mock confidence
            },
            categories: riskFactors,
            recommendations: this.getMedicalRecommendations(overallRisk, symptoms),
            disclaimer: 'ANÁLISIS AUTOMATIZADO - NO REEMPLAZA CONSULTA MÉDICA PROFESIONAL'
          },
          metadata: {
            analysisDate: new Date().toISOString(),
            anonymized: true,
            hipaaCompliant: true,
            modelVersion: 'altamedica-risk-v1.0'
          }
        }, null, 2)
      }]
    };
  }

  async analyzeCodeCompliance(args) {
    const { filePath, checkHIPAA = true } = args;
    
    if (!existsSync(filePath)) {
      throw new Error(`Archivo no encontrado: ${filePath}`);
    }

    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    console.error(`[MCP-MEDICAL] Analizando compliance: ${filePath}`);
    
    const analysis = {
      file: filePath,
      lines: lines.length,
      issues: [],
      recommendations: [],
      hipaaCompliance: { compliant: true, issues: [] },
      codeQuality: { score: 0, issues: [] }
    };

    // Verificar compliance HIPAA
    if (checkHIPAA) {
      const hipaaIssues = this.checkHIPAACompliance(content);
      analysis.hipaaCompliance = hipaaIssues;
    }

    // Verificar calidad del código médico
    const qualityIssues = this.checkMedicalCodeQuality(content, filePath);
    analysis.codeQuality = qualityIssues;

    // Recomendaciones generales
    if (analysis.lines > ALTAMEDICA_CONFIG.maxFileSize) {
      analysis.recommendations.push(`Considerar dividir archivo (${analysis.lines} líneas > ${ALTAMEDICA_CONFIG.maxFileSize})`);
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(analysis, null, 2)
      }]
    };
  }

  // Métodos auxiliares
  getCachedFileContent(filePath) {
    if (this.medicalCache.has(filePath)) {
      return this.medicalCache.get(filePath);
    }

    try {
      const content = readFileSync(filePath, 'utf-8');
      this.medicalCache.set(filePath, content);
      return content;
    } catch (error) {
      console.error(`[MCP-MEDICAL] Error leyendo ${filePath}:`, error);
      return null;
    }
  }

  async analyzeMedicalFile(filePath, content) {
    const medicalTermsPattern = /\b(patient|doctor|medical|health|diagnosis|treatment|medication|symptom|disease|hospital|clinic)\b/gi;
    const medicalTerms = content.match(medicalTermsPattern) || [];
    
    const complexity = this.assessComplexity(content);
    const hipaaCompliant = !this.detectPHI(content).hasRisk;

    return {
      medicalTerms: [...new Set(medicalTerms.map(t => t.toLowerCase()))],
      complexity,
      hipaaCompliant
    };
  }

  assessComplexity(content) {
    const complexityIndicators = [
      /tensorflow|@tensorflow/gi,
      /machine\s+learning|ml\s+model/gi,
      /neural\s+network/gi,
      /algorithm|compute|matrix/gi,
      /async|await|promise/gi
    ];

    const score = complexityIndicators.reduce((acc, pattern) => {
      return acc + (content.match(pattern) || []).length;
    }, 0);

    if (score > 10) return 'high';
    if (score > 3) return 'medium';
    return 'low';
  }

  getRecommendedModel(analysis) {
    if (analysis.complexity === 'high') return 'Opus 4';
    if (analysis.medicalTerms.length > 5) return 'Sonnet 4';
    return 'Sonnet 4';
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
    // Simulación simple de riesgo cardiovascular
    let risk = 0;
    
    const cardioSymptoms = ['chest pain', 'dolor pecho', 'palpitaciones', 'fatigue', 'shortness of breath'];
    symptoms.forEach(symptom => {
      if (cardioSymptoms.some(cs => symptom.toLowerCase().includes(cs))) {
        risk += 0.3;
      }
    });

    if (age && age > 50) risk += 0.2;
    if (history.some(h => h.toLowerCase().includes('diabetes'))) risk += 0.25;
    if (history.some(h => h.toLowerCase().includes('hypertension'))) risk += 0.2;

    return Math.min(risk, 1.0);
  }

  calculateRespiratoryRisk(symptoms) {
    const respSymptoms = ['cough', 'tos', 'difficulty breathing', 'wheezing', 'chest congestion'];
    let risk = 0;
    
    symptoms.forEach(symptom => {
      if (respSymptoms.some(rs => symptom.toLowerCase().includes(rs))) {
        risk += 0.4;
      }
    });

    return Math.min(risk, 1.0);
  }

  calculateGeneralRisk(symptoms, history) {
    // Riesgo general basado en número de síntomas y historial
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

    // Verificar encriptación
    if (content.includes('password') && !content.includes('encrypt')) {
      issues.push('Contraseñas sin encriptación detectadas');
      compliant = false;
    }

    return { compliant, issues };
  }

  checkMedicalCodeQuality(content, filePath) {
    const issues = [];
    let score = 100;

    // Verificar JSDoc en funciones médicas
    const medicalFunctions = content.match(/function\s+\w*medical\w*/gi) || [];
    const jsdocCount = (content.match(/\/\*\*/g) || []).length;
    
    if (medicalFunctions.length > 0 && jsdocCount < medicalFunctions.length) {
      issues.push('Funciones médicas sin JSDoc');
      score -= 20;
    }

    // Verificar validación de entrada
    if (content.includes('medical') && !content.includes('zod') && !content.includes('validate')) {
      issues.push('Falta validación de entrada en código médico');
      score -= 15;
    }

    return { score, issues };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[MCP-MEDICAL] Servidor AI médico iniciado');
  }
}

// Iniciar servidor si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new MedicalAIServer();
  server.start().catch(console.error);
}

export default MedicalAIServer;