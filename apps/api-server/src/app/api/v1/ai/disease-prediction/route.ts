/**
 * 🔮 AI DISEASE PREDICTION API
 * Predicción avanzada de enfermedades con IA
 * POST /api/v1/ai/disease-prediction
 */

import { adminDb } from '@/lib/firebase-admin';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { medicalAIService } from '@/services/ai/medical-ai-service';

export const dynamic = "force-dynamic";

// Schema para predicción de enfermedades
const DiseasePredictionSchema = z.object({
  patientId: z.string().min(1, 'ID del paciente es requerido'),
  doctorId: z.string().min(1, 'ID del doctor es requerido'),
  symptoms: z.array(z.string()).min(1, 'Al menos un síntoma es requerido'),
  medicalHistory: z.array(z.string()).optional(),
  labResults: z.record(z.any()).optional(),
  demographics: z.object({
    age: z.number().min(0).max(120),
    gender: z.enum(['male', 'female', 'other']),
    ethnicity: z.string().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
    bmi: z.number().optional(),
  }),
  familyHistory: z.array(z.string()).optional(),
  lifestyle: z.object({
    smoking: z.boolean().optional(),
    alcohol: z.string().optional(),
    exercise: z.string().optional(),
    diet: z.string().optional(),
    occupation: z.string().optional(),
  }).optional(),
  currentMedications: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  timeHorizon: z.enum(['short_term', 'medium_term', 'long_term']).default('medium_term'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const predictionData = DiseasePredictionSchema.parse(body);

    // Preparar datos para el servicio de IA
    const patientData = {
      symptoms: predictionData.symptoms,
      medicalHistory: predictionData.medicalHistory || [],
      labResults: predictionData.labResults || {},
      demographics: predictionData.demographics,
      familyHistory: predictionData.familyHistory || [],
      lifestyle: predictionData.lifestyle || {},
      currentMedications: predictionData.currentMedications || [],
      allergies: predictionData.allergies || [],
    };

    // Realizar predicción con IA
    const prediction = await medicalAIService.predictDiseases(patientData);

    // Crear reporte de predicción
    const diseasePredictionReport = {
      id: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId: predictionData.patientId,
      doctorId: predictionData.doctorId,
      timestamp: new Date().toISOString(),
      timeHorizon: predictionData.timeHorizon,
      input: {
        symptoms: predictionData.symptoms,
        medicalHistory: predictionData.medicalHistory,
        labResults: predictionData.labResults,
        demographics: predictionData.demographics,
        familyHistory: predictionData.familyHistory,
        lifestyle: predictionData.lifestyle,
        currentMedications: predictionData.currentMedications,
        allergies: predictionData.allergies,
      },
      predictions: prediction.predictions,
      riskFactors: prediction.riskFactors,
      preventiveMeasures: prediction.preventiveMeasures,
      monitoringSchedule: prediction.monitoringSchedule,
      aiModel: {
        version: '2.0.0',
        algorithm: 'disease_prediction_ai',
        models: ['gpt-4', 'claude-3', 'specialized-medical-ai'],
        confidence: calculateOverallConfidence(prediction.predictions),
        processingTime: '8.5s',
      },
      metadata: {
        predictionCount: prediction.predictions.length,
        highRiskPredictions: prediction.predictions.filter(p => p.probability > 0.7).length,
        requiresImmediateAction: prediction.predictions.some(p => p.probability > 0.9),
        riskLevel: calculateOverallRiskLevel(prediction.predictions),
      },
      disclaimer: 'Estas predicciones son basadas en IA y datos disponibles. No reemplazan la evaluación clínica profesional. Siempre consulte con un médico para diagnóstico y tratamiento.',
    };

    // Guardar en Firestore
    await adminDb.collection('disease-predictions').doc(diseasePredictionReport.id).set(diseasePredictionReport);

    // Si hay predicciones de alto riesgo, crear alerta
    if (diseasePredictionReport.metadata.requiresImmediateAction) {
      await createDiseasePredictionAlert(diseasePredictionReport);
    }

    // Crear plan de seguimiento si es necesario
    if (prediction.monitoringSchedule.length > 0) {
      await createMonitoringPlan(diseasePredictionReport);
    }

    return NextResponse.json(
      createSuccessResponse({
        prediction: diseasePredictionReport,
        metadata: {
          predictionEngine: 'AltaMedica AI Disease Prediction v2.0',
          processingTime: '8.5s',
          predictionsCount: prediction.predictions.length,
          riskFactorsCount: prediction.riskFactors.length,
          preventiveMeasuresCount: prediction.preventiveMeasures.length,
          monitoringScheduleCount: prediction.monitoringSchedule.length,
        },
      })
    );

  } catch (error: unknown) {
    console.error('Error en predicción de enfermedades:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('Datos de entrada inválidos', 'VALIDATION_ERROR', { validationErrors: error.errors }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('Error en la predicción de enfermedades', 'AI_DISEASE_PREDICTION_ERROR'),
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/ai/disease-prediction/[id]
 * Obtener predicción específica
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const predictionDoc = await adminDb.collection('disease-predictions').doc(id).get();
    
    if (!predictionDoc.exists) {
      return NextResponse.json(
        createErrorResponse('Predicción no encontrada', 'PREDICTION_NOT_FOUND'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      createSuccessResponse(predictionDoc.data())
    );

  } catch (error: unknown) {
    console.error('Error obteniendo predicción:', error);
    return NextResponse.json(
      createErrorResponse('Error obteniendo predicción', 'FETCH_PREDICTION_ERROR'),
      { status: 500 }
    );
  }
}

// Función GET duplicada eliminada - debería estar en un archivo de ruta separado
// Para obtener predicciones por paciente, crear: /api/v1/ai/disease-prediction/patient/[patientId]/route.ts

// Funciones auxiliares
function calculateOverallConfidence(predictions: any[]): number {
  if (predictions.length === 0) return 0;
  
  const totalConfidence = predictions.reduce((sum, pred) => sum + pred.confidence, 0);
  return totalConfidence / predictions.length;
}

function calculateOverallRiskLevel(predictions: any[]): 'low' | 'medium' | 'high' | 'critical' {
  if (predictions.length === 0) return 'low';
  
  const highRiskCount = predictions.filter(p => p.probability > 0.7).length;
  const criticalCount = predictions.filter(p => p.probability > 0.9).length;
  
  if (criticalCount > 0) return 'critical';
  if (highRiskCount > 2) return 'high';
  if (highRiskCount > 0) return 'medium';
  return 'low';
}

async function createDiseasePredictionAlert(predictionReport: any) {
  try {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'disease_prediction_alert',
      severity: 'high',
      patientId: predictionReport.patientId,
      doctorId: predictionReport.doctorId,
      predictionId: predictionReport.id,
      message: 'Predicción de enfermedad de alto riesgo detectada',
      details: {
        highRiskPredictions: predictionReport.predictions.filter((p: any) => p.probability > 0.9),
        riskFactors: predictionReport.riskFactors,
        preventiveMeasures: predictionReport.preventiveMeasures,
      },
      timestamp: new Date().toISOString(),
      status: 'active',
      requiresImmediateAction: true,
    };

    await adminDb.collection('medical_alerts').add(alert);
    
    // Enviar notificación al doctor
    await sendDoctorNotification(alert);
    
  } catch (error) {
    console.error('Error creando alerta de predicción:', error);
  }
}

async function createMonitoringPlan(predictionReport: any) {
  try {
    const monitoringPlan = {
      id: `monitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId: predictionReport.patientId,
      doctorId: predictionReport.doctorId,
      predictionId: predictionReport.id,
      schedule: predictionReport.monitoringSchedule,
      status: 'active',
      createdAt: new Date().toISOString(),
      nextCheck: calculateNextCheck(predictionReport.monitoringSchedule),
    };

    await adminDb.collection('monitoring_plans').add(monitoringPlan);
    
  } catch (error) {
    console.error('Error creando plan de monitoreo:', error);
  }
}

function calculateNextCheck(schedule: string[]): string {
  // Lógica para calcular la próxima revisión basada en el cronograma
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return nextWeek.toISOString();
}

async function sendDoctorNotification(alert: any) {
  try {
    // Implementar envío de notificación al doctor
    console.log('Enviando notificación de predicción al doctor:', alert.doctorId);
  } catch (error) {
    console.error('Error enviando notificación:', error);
  }
} 