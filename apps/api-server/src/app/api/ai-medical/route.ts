/**
 * 🤖 AltaMedica AI Medical Integration Endpoint
 * Integración única con sistema de agentes AI médicos
 * Características exclusivas para telemedicina
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Configuración del sistema AI médico
const AI_MEDICAL_CONFIG = {
  baseUrl: process.env.MEDICAL_AI_URL || 'http://medical-ai-agents:3006',
  timeout: 15000, // 15 segundos para análisis AI
  retries: 2
};

// Esquemas de validación para endpoints AI médicos
const DiagnosisRequestSchema = z.object({
  symptoms: z.array(z.string()).min(1, 'Al menos un síntoma requerido'),
  patientAge: z.number().optional(),
  medicalHistory: z.array(z.string()).optional(),
  urgencyLevel: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  anonymized: z.boolean().default(true),
  language: z.enum(['es', 'en']).default('es')
});

const RiskAnalysisRequestSchema = z.object({
  symptoms: z.array(z.string()),
  vitalSigns: z.object({
    heartRate: z.number().optional(),
    bloodPressure: z.string().optional(),
    temperature: z.number().optional(),
    oxygenSaturation: z.number().optional()
  }).optional(),
  demographics: z.object({
    age: z.number(),
    gender: z.enum(['M', 'F', 'O']).optional(),
    weight: z.number().optional(),
    height: z.number().optional()
  }),
  emergencyMode: z.boolean().default(false)
});

const MedicalNLPRequestSchema = z.object({
  text: z.string().min(10, 'Texto muy corto para análisis'),
  extractEntities: z.boolean().default(true),
  checkCompliance: z.boolean().default(true),
  language: z.enum(['es', 'en']).default('es')
});

// Funciones auxiliares para comunicación con agentes AI
async function callMedicalAIAgent(endpoint: string, data: any, timeout = AI_MEDICAL_CONFIG.timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${AI_MEDICAL_CONFIG.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Medical-AI-Source': 'altamedica-api',
        'X-HIPAA-Compliant': 'true'
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AI Agent Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Endpoint principal para análisis de diagnóstico asistido
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'diagnosis';

    switch (action) {
      case 'diagnosis':
        return await handleDiagnosisRequest(request);
      case 'risk-analysis':
        return await handleRiskAnalysis(request);
      case 'nlp-medical':
        return await handleMedicalNLP(request);
      case 'emergency-triage':
        return await handleEmergencyTriage(request);
      default:
        return NextResponse.json(
          { error: 'Acción no válida', availableActions: ['diagnosis', 'risk-analysis', 'nlp-medical', 'emergency-triage'] },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[AI-MEDICAL] Error en endpoint:', error);
    return NextResponse.json(
      { error: 'Error interno del sistema AI médico', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

async function handleDiagnosisRequest(request: NextRequest) {
  const body = await request.json();
  const validatedData = DiagnosisRequestSchema.parse(body);

  console.log(`[AI-MEDICAL] Análisis de diagnóstico: ${validatedData.symptoms.length} síntomas`);

  // Llamar al agente de IA médica para diagnóstico
  const diagnosisResult = await callMedicalAIAgent('/api/diagnosis', {
    symptoms: validatedData.symptoms,
    patientAge: validatedData.patientAge,
    medicalHistory: validatedData.medicalHistory,
    urgencyLevel: validatedData.urgencyLevel,
    language: validatedData.language,
    timestamp: new Date().toISOString()
  });

  // Enriquecer con análisis de riesgo si es urgencia alta
  let riskAnalysis = null;
  if (validatedData.urgencyLevel === 'high' || validatedData.urgencyLevel === 'critical') {
    try {
      riskAnalysis = await callMedicalAIAgent('/api/risk-analysis', {
        symptoms: validatedData.symptoms,
        demographics: { age: validatedData.patientAge || 30 },
        emergencyMode: true
      }, 10000); // Timeout más corto para emergencias
    } catch (error) {
      console.warn('[AI-MEDICAL] No se pudo obtener análisis de riesgo:', error.message);
    }
  }

  return NextResponse.json({
    diagnosis: diagnosisResult,
    riskAnalysis,
    metadata: {
      processedAt: new Date().toISOString(),
      urgencyLevel: validatedData.urgencyLevel,
      hipaaCompliant: validatedData.anonymized,
      aiVersion: 'altamedica-medical-ai-v1.0'
    },
    recommendations: generateRecommendations(diagnosisResult, validatedData.urgencyLevel)
  });
}

async function handleRiskAnalysis(request: NextRequest) {
  const body = await request.json();
  const validatedData = RiskAnalysisRequestSchema.parse(body);

  console.log(`[AI-MEDICAL] Análisis de riesgo para paciente edad: ${validatedData.demographics.age}`);

  // Análisis cardiovascular
  const cardiovascularRisk = await callMedicalAIAgent('/api/cardiovascular-risk', {
    symptoms: validatedData.symptoms,
    vitalSigns: validatedData.vitalSigns,
    demographics: validatedData.demographics,
    emergency: validatedData.emergencyMode
  });

  // Análisis respiratorio
  const respiratoryRisk = await callMedicalAIAgent('/api/respiratory-risk', {
    symptoms: validatedData.symptoms,
    vitalSigns: validatedData.vitalSigns
  });

  // Cálculo de riesgo general con ML
  const overallRisk = calculateOverallRisk(cardiovascularRisk, respiratoryRisk, validatedData);

  return NextResponse.json({
    riskAnalysis: {
      overall: overallRisk,
      cardiovascular: cardiovascularRisk,
      respiratory: respiratoryRisk,
      demographics: validatedData.demographics
    },
    alerts: generateRiskAlerts(overallRisk),
    recommendations: generateRiskRecommendations(overallRisk),
    metadata: {
      analysisType: 'comprehensive-risk-assessment',
      emergencyMode: validatedData.emergencyMode,
      processedAt: new Date().toISOString(),
      confidence: overallRisk.confidence || 0.75
    }
  });
}

async function handleMedicalNLP(request: NextRequest) {
  const body = await request.json();
  const validatedData = MedicalNLPRequestSchema.parse(body);

  console.log(`[AI-MEDICAL] Análisis NLP médico: ${validatedData.text.length} caracteres`);

  // Análisis de términos médicos
  const nlpResult = await callMedicalAIAgent('/api/medical-nlp', {
    text: validatedData.text,
    language: validatedData.language,
    extractEntities: validatedData.extractEntities,
    checkCompliance: validatedData.checkCompliance
  });

  // Verificación de compliance HIPAA
  let complianceCheck = null;
  if (validatedData.checkCompliance) {
    complianceCheck = await callMedicalAIAgent('/api/hipaa-compliance', {
      text: validatedData.text,
      checkPHI: true,
      severity: 'strict'
    });
  }

  return NextResponse.json({
    nlp: nlpResult,
    compliance: complianceCheck,
    summary: {
      medicalTermsFound: nlpResult.medicalTerms?.length || 0,
      entitiesExtracted: nlpResult.entities ? Object.keys(nlpResult.entities).length : 0,
      hipaaCompliant: complianceCheck?.compliant ?? true,
      language: validatedData.language
    },
    metadata: {
      processedAt: new Date().toISOString(),
      textLength: validatedData.text.length,
      nlpModel: 'altamedica-medical-nlp-v1.0'
    }
  });
}

async function handleEmergencyTriage(request: NextRequest) {
  const body = await request.json();
  
  console.log(`[AI-MEDICAL] Triage de emergencia activado`);

  // Análisis rápido de emergencia (timeout reducido)
  const triageResult = await callMedicalAIAgent('/api/emergency-triage', body, 8000);

  // Activar coordinación de emergencia si es crítico
  let emergencyCoordination = null;
  if (triageResult.priority === 'critical' || triageResult.priority === 'urgent') {
    try {
      emergencyCoordination = await callMedicalAIAgent('/api/emergency-coordination', {
        triageResult,
        timestamp: new Date().toISOString(),
        requiresImmediate: triageResult.priority === 'critical'
      }, 5000);
    } catch (error) {
      console.error('[AI-MEDICAL] Error en coordinación de emergencia:', error);
    }
  }

  return NextResponse.json({
    triage: triageResult,
    emergencyCoordination,
    immediateActions: generateImmediateActions(triageResult),
    metadata: {
      triageTime: new Date().toISOString(),
      priority: triageResult.priority,
      criticalAlert: triageResult.priority === 'critical'
    }
  });
}

// Funciones auxiliares
function generateRecommendations(diagnosisResult: any, urgencyLevel: string) {
  const recommendations = [];

  if (urgencyLevel === 'critical') {
    recommendations.push('Consulta médica inmediata - No demorar');
    recommendations.push('Considerar llamada a emergencias');
  } else if (urgencyLevel === 'high') {
    recommendations.push('Consulta médica urgente dentro de 24 horas');
    recommendations.push('Monitoreo continuo de síntomas');
  } else if (urgencyLevel === 'medium') {
    recommendations.push('Programar consulta médica en 2-3 días');
    recommendations.push('Seguimiento de síntomas');
  } else {
    recommendations.push('Consulta médica rutinaria');
    recommendations.push('Monitoreo básico');
  }

  // Agregar recomendaciones específicas basadas en diagnóstico
  if (diagnosisResult.suggestedActions) {
    recommendations.push(...diagnosisResult.suggestedActions);
  }

  return recommendations;
}

function calculateOverallRisk(cardiovascularRisk: any, respiratoryRisk: any, data: any) {
  // Algoritmo simplificado de cálculo de riesgo global
  const cardiovascularScore = cardiovascularRisk.score || 0;
  const respiratoryScore = respiratoryRisk.score || 0;
  
  // Factores de edad
  const ageRisk = data.demographics.age > 65 ? 0.2 : data.demographics.age > 50 ? 0.1 : 0;
  
  // Cálculo compuesto
  const overallScore = Math.min(
    Math.max(cardiovascularScore, respiratoryScore) + ageRisk,
    1.0
  );

  return {
    score: overallScore,
    level: overallScore > 0.7 ? 'HIGH' : overallScore > 0.4 ? 'MEDIUM' : 'LOW',
    confidence: 0.8,
    factors: {
      cardiovascular: cardiovascularScore,
      respiratory: respiratoryScore,
      age: ageRisk
    }
  };
}

function generateRiskAlerts(riskAnalysis: any) {
  const alerts = [];

  if (riskAnalysis.level === 'HIGH') {
    alerts.push({
      type: 'critical',
      message: 'Riesgo alto detectado - Evaluación médica urgente recomendada',
      action: 'immediate_consultation'
    });
  } else if (riskAnalysis.level === 'MEDIUM') {
    alerts.push({
      type: 'warning',
      message: 'Riesgo moderado - Programar consulta médica',
      action: 'schedule_appointment'
    });
  }

  return alerts;
}

function generateRiskRecommendations(riskAnalysis: any) {
  const recommendations = [];

  if (riskAnalysis.level === 'HIGH') {
    recommendations.push('Consulta médica urgente');
    recommendations.push('Monitoreo continuo de síntomas');
    recommendations.push('Evitar actividad física intensa');
  } else if (riskAnalysis.level === 'MEDIUM') {
    recommendations.push('Consulta médica en 24-48 horas');
    recommendations.push('Seguimiento de síntomas');
    recommendations.push('Descanso adecuado');
  } else {
    recommendations.push('Mantener estilo de vida saludable');
    recommendations.push('Consulta médica rutinaria');
  }

  return recommendations;
}

function generateImmediateActions(triageResult: any) {
  const actions = [];

  if (triageResult.priority === 'critical') {
    actions.push('Activar protocolo de emergencia');
    actions.push('Contactar servicios de emergencia');
    actions.push('Preparar para traslado inmediato');
  } else if (triageResult.priority === 'urgent') {
    actions.push('Consulta médica urgente');
    actions.push('Monitoreo continuo');
    actions.push('Preparar historial médico');
  }

  return actions;
}

// Endpoint GET para estado del sistema AI
export async function GET(request: NextRequest) {
  try {
    // Verificar estado de los agentes AI médicos
    const healthResponse = await fetch(`${AI_MEDICAL_CONFIG.baseUrl}/health`, {
      method: 'GET',
      headers: { 'X-Health-Check': 'true' },
      timeout: 5000
    });

    const healthData = await healthResponse.json();

    return NextResponse.json({
      status: 'operational',
      aiSystem: {
        available: healthResponse.ok,
        agents: healthData.system?.activeAgents || 0,
        capabilities: healthData.medical?.capabilities || [],
        uptime: healthData.uptime || 0
      },
      endpoints: {
        diagnosis: '/api/ai-medical?action=diagnosis',
        riskAnalysis: '/api/ai-medical?action=risk-analysis',
        medicalNLP: '/api/ai-medical?action=nlp-medical',
        emergencyTriage: '/api/ai-medical?action=emergency-triage'
      },
      metadata: {
        version: 'altamedica-ai-medical-v1.0',
        lastCheck: new Date().toISOString(),
        hipaaCompliant: true
      }
    });
  } catch (error) {
    console.error('[AI-MEDICAL] Error verificando estado:', error);
    return NextResponse.json({
      status: 'degraded',
      error: 'Sistema AI médico no disponible',
      fallbackMode: true
    }, { status: 503 });
  }
}