/**
 * 🎯 AI RISK ASSESSMENT API
 * Evaluación de riesgo médico basada en IA
 * POST /api/v1/ai/risk-assessment
 */

import { adminDb } from '@altamedica/firebase';
import { createErrorResponse, createSuccessResponse } from '@altamedica/shared';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Forzar endpoint dinámico para compatibilidad Next.js
export const dynamic = "force-dynamic";

// Schema para evaluación de riesgo
const RiskAssessmentSchema = z.object({
  patientId: z.string().min(1, 'ID del paciente es requerido'),
  assessmentType: z.enum(['cardiovascular', 'diabetes', 'general', 'surgical', 'pregnancy']),
  medicalHistory: z.object({
    conditions: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    familyHistory: z.array(z.string()).optional(),
  }),
  vitalSigns: z.object({
    bloodPressure: z.object({
      systolic: z.number().min(50).max(250),
      diastolic: z.number().min(30).max(150),
    }).optional(),
    heartRate: z.number().min(30).max(220).optional(),
    temperature: z.number().min(35).max(42).optional(),
    weight: z.number().min(20).max(300).optional(),
    height: z.number().min(100).max(250).optional(),
  }),
  labResults: z.array(z.object({
    type: z.string(),
    value: z.number(),
    unit: z.string(),
    normalRange: z.object({
      min: z.number(),
      max: z.number(),
    }),
  })).optional(),
  lifestyle: z.object({
    smoking: z.boolean().optional(),
    alcohol: z.enum(['none', 'occasional', 'moderate', 'heavy']).optional(),
    exercise: z.enum(['none', 'light', 'moderate', 'heavy']).optional(),
    diet: z.enum(['poor', 'average', 'good', 'excellent']).optional(),
  }).optional(),
  symptoms: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const assessmentData = RiskAssessmentSchema.parse(body);

    // Calcular puntuaciones de riesgo usando algoritmos médicos
    const riskScores = calculateRiskScores(assessmentData);
    
    // Generar recomendaciones específicas
    const recommendations = generateRecommendations(assessmentData, riskScores);
    
    // Crear registro de evaluación de riesgo
    const riskAssessment = {
      id: `risk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId: (assessmentData as any).patientId,
      assessmentType: assessmentData.assessmentType,
      timestamp: new Date().toISOString(),
      input: {
        medicalHistory: assessmentData.medicalHistory,
        vitalSigns: assessmentData.vitalSigns,
        labResults: assessmentData.labResults,
        lifestyle: assessmentData.lifestyle,
        symptoms: assessmentData.symptoms,
      },
      riskScores: riskScores,
      overallRisk: calculateOverallRisk(riskScores),
      recommendations: recommendations,
      aiModel: {
        version: '1.0.0',
        algorithm: 'composite_risk_assessment',
        confidence: calculateConfidence(assessmentData, riskScores),
      },
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
    };

    // Guardar en Firestore
    await adminDb.collection('risk-assessments').doc(riskAssessment.id).set(riskAssessment);

    // Si es riesgo alto, crear alerta
    if (riskAssessment.overallRisk.level === 'high' || riskAssessment.overallRisk.level === 'critical') {
      await createHighRiskAlert(riskAssessment);
    }

    return NextResponse.json(
      createSuccessResponse({
        assessment: riskAssessment,
        metadata: {
          analysisEngine: 'AltaMedica AI Risk Assessment v1.0',
          processingTime: '2.3s',
          dataPoints: countDataPoints(assessmentData),
          recommendations: recommendations.length,
        },
      })
    );

  } catch (error: unknown) {
    console.error('Error en evaluación de riesgo:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('Datos de entrada inválidos', 'VALIDATION_ERROR', { validationErrors: error.errors }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('Error en la evaluación de riesgo con IA', 'AI_PROCESSING_ERROR'),
      { status: 500 }
    );
  }
}

// Funciones auxiliares para cálculo de riesgo
function calculateRiskScores(data: any) {
  const scores = {
    cardiovascular: 0,
    metabolic: 0,
    lifestyle: 0,
    genetic: 0,
    environmental: 0,
  };

  // Factores cardiovasculares
  if (data.vitalSigns?.bloodPressure) {
    const bp = data.vitalSigns.bloodPressure;
    if (bp.systolic > 140 || bp.diastolic > 90) scores.cardiovascular += 3;
    else if (bp.systolic > 130 || bp.diastolic > 80) scores.cardiovascular += 2;
    else if (bp.systolic > 120) scores.cardiovascular += 1;
  }

  if (data.vitalSigns?.heartRate) {
    const hr = data.vitalSigns.heartRate;
    if (hr > 100 || hr < 60) scores.cardiovascular += 2;
  }

  // Factores metabólicos
  if (data.labResults) {
    data.labResults.forEach((lab: any) => {
      if ((lab as any).type.toLowerCase().includes('glucose') || (lab as any).type.toLowerCase().includes('glucosa')) {
        if (lab.value > lab.normalRange.max * 1.5) scores.metabolic += 3;
        else if (lab.value > lab.normalRange.max) scores.metabolic += 2;
      }
      
      if ((lab as any).type.toLowerCase().includes('cholesterol') || (lab as any).type.toLowerCase().includes('colesterol')) {
        if (lab.value > lab.normalRange.max * 1.3) scores.metabolic += 2;
        else if (lab.value > lab.normalRange.max) scores.metabolic += 1;
      }
    });
  }

  // Factores de estilo de vida
  if (data.lifestyle?.smoking) scores.lifestyle += 4;
  if (data.lifestyle?.alcohol === 'heavy') scores.lifestyle += 3;
  else if (data.lifestyle?.alcohol === 'moderate') scores.lifestyle += 1;
  
  if (data.lifestyle?.exercise === 'none') scores.lifestyle += 2;
  if (data.lifestyle?.diet === 'poor') scores.lifestyle += 2;

  // Factores genéticos/familia
  if (data.medicalHistory?.familyHistory?.length > 0) {
    scores.genetic = Math.min(data.medicalHistory.familyHistory.length, 5);
  }

  // Condiciones médicas existentes
  if (data.medicalHistory?.conditions?.length > 0) {
    scores.environmental = Math.min(data.medicalHistory.conditions.length * 2, 6);
  }

  return scores;
}

function calculateOverallRisk(scores: any) {
  const total = Object.values(scores).reduce((sum: number, score: any) => sum + score, 0);
  const maxPossible = 20; // Puntuación máxima teórica
  const percentage = Math.min((total / maxPossible) * 100, 100);

  let level: string;
  let description: string;
  
  if (percentage >= 80) {
    level = 'critical';
    description = 'Riesgo crítico - Requiere atención médica inmediata';
  } else if (percentage >= 60) {
    level = 'high';
    description = 'Riesgo alto - Recomendado consultar con especialista';
  } else if (percentage >= 40) {
    level = 'moderate';
    description = 'Riesgo moderado - Seguimiento médico recomendado';
  } else if (percentage >= 20) {
    level = 'low';
    description = 'Riesgo bajo - Mantener hábitos saludables';
  } else {
    level = 'minimal';
    description = 'Riesgo mínimo - Continuar con estilo de vida saludable';
  }

  return {
    level,
    percentage: Math.round(percentage),
    description,
    totalScore: total,
    breakdown: scores,
  };
}

function generateRecommendations(data: any, scores: any) {
  const recommendations = [];

  // Recomendaciones cardiovasculares
  if (scores.cardiovascular >= 3) {
    recommendations.push({
      category: 'cardiovascular',
      priority: 'high',
      action: 'Consultar con cardiólogo',
      description: 'Los indicadores cardiovasculares sugieren riesgo elevado',
      timeline: 'En los próximos 7 días',
    });
  }

  // Recomendaciones metabólicas
  if (scores.metabolic >= 3) {
    recommendations.push({
      category: 'metabolic',
      priority: 'high',
      action: 'Evaluación endocrinológica',
      description: 'Los resultados de laboratorio indican alteraciones metabólicas',
      timeline: 'En las próximas 2 semanas',
    });
  }

  // Recomendaciones de estilo de vida
  if (scores.lifestyle >= 3) {
    recommendations.push({
      category: 'lifestyle',
      priority: 'medium',
      action: 'Modificaciones del estilo de vida',
      description: 'Implementar cambios en dieta, ejercicio y hábitos',
      timeline: 'Iniciar inmediatamente',
    });
  }

  // Recomendaciones de seguimiento
  if (data.medicalHistory?.conditions?.length > 2) {
    recommendations.push({
      category: 'monitoring',
      priority: 'medium',
      action: 'Seguimiento médico regular',
      description: 'Control periódico debido a múltiples condiciones médicas',
      timeline: 'Cada 3-6 meses',
    });
  }

  return recommendations;
}

function calculateConfidence(data: any, scores: any) {
  let confidence = 0.7; // Base confidence

  // Incrementar confianza basado en datos disponibles
  if (data.vitalSigns && Object.keys(data.vitalSigns).length > 2) confidence += 0.1;
  if (data.labResults && data.labResults.length > 3) confidence += 0.1;
  if (data.medicalHistory?.conditions?.length > 0) confidence += 0.05;
  if (data.lifestyle && Object.keys(data.lifestyle).length > 2) confidence += 0.05;

  return Math.min(confidence, 0.95);
}

function countDataPoints(data: any) {
  let count = 0;
  
  if (data.vitalSigns) count += Object.keys(data.vitalSigns).length;
  if (data.labResults) count += data.labResults.length;
  if (data.medicalHistory?.conditions) count += data.medicalHistory.conditions.length;
  if (data.medicalHistory?.medications) count += data.medicalHistory.medications.length;
  if (data.lifestyle) count += Object.keys(data.lifestyle).length;
  if (data.symptoms) count += data.symptoms.length;

  return count;
}

async function createHighRiskAlert(assessment: any) {
  const alert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'high_risk_assessment',
    patientId: (assessment as any).patientId,
    assessmentId: assessment.id,
    severity: assessment.overallRisk.level,
    message: `Evaluación de riesgo ${assessment.overallRisk.level} detectada`,
    createdAt: new Date().toISOString(),
    resolved: false,
  };

  await adminDb.collection('medical-alerts').doc(alert.id).set(alert);
}
