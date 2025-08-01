/**
 * 🎯 AI PERSONALIZED RECOMMENDATIONS API
 * Recomendaciones personalizadas con IA avanzada
 * POST /api/v1/ai/personalized-recommendations
 */

import { adminDb } from '@/lib/firebase-admin';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { medicalAIService } from '@/services/ai/medical-ai-service';

export const dynamic = "force-dynamic";

// Schema para recomendaciones personalizadas
const PersonalizedRecommendationsSchema = z.object({
  patientId: z.string().min(1, 'ID del paciente es requerido'),
  doctorId: z.string().min(1, 'ID del doctor es requerido'),
  recommendationType: z.enum([
    'treatment',
    'lifestyle',
    'medication',
    'prevention',
    'nutrition',
    'exercise',
    'mental_health',
    'comprehensive'
  ]),
  context: z.object({
    currentSymptoms: z.array(z.string()).optional(),
    medicalHistory: z.array(z.string()).optional(),
    currentMedications: z.array(z.string()).optional(),
    lifestyleFactors: z.object({
      diet: z.string().optional(),
      exercise: z.string().optional(),
      sleep: z.string().optional(),
      stress: z.string().optional(),
      smoking: z.boolean().optional(),
      alcohol: z.boolean().optional()
    }).optional(),
    preferences: z.object({
      treatmentStyle: z.enum(['conservative', 'aggressive', 'natural', 'balanced']).optional(),
      timeAvailability: z.enum(['low', 'medium', 'high']).optional(),
      budget: z.enum(['low', 'medium', 'high']).optional()
    }).optional()
  }).optional(),
  includeAIInsights: z.boolean().default(true),
  includeEvidence: z.boolean().default(true)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = PersonalizedRecommendationsSchema.parse(body);

    const { 
      patientId, 
      doctorId, 
      recommendationType, 
      context, 
      includeAIInsights, 
      includeEvidence 
    } = validatedData;

    // Verificar permisos del doctor
    const doctorRef = adminDb.collection('doctors').doc(doctorId);
    const doctorDoc = await doctorRef.get();
    
    if (!doctorDoc.exists) {
      return createErrorResponse('Doctor no encontrado', 404);
    }

    // Verificar que el doctor tiene acceso al paciente
    const patientRef = adminDb.collection('patients').doc(patientId);
    const patientDoc = await patientRef.get();
    
    if (!patientDoc.exists) {
      return createErrorResponse('Paciente no encontrado', 404);
    }

    // Obtener datos completos del paciente
    const patientData = patientDoc.data();
    const patientProfile = {
      ...patientData,
      ...context
    };

    // Crear registro de recomendación
    const recommendationRef = adminDb.collection('ai_recommendations').doc();
    const recommendationId = recommendationRef.id;

    const recommendationData = {
      id: recommendationId,
      patientId,
      doctorId,
      recommendationType,
      context: patientProfile,
      status: 'processing',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await recommendationRef.set(recommendationData);

    // Generar recomendaciones personalizadas con IA
    const recommendations = await medicalAIService.generatePersonalizedRecommendations({
      patientProfile,
      recommendationType,
      includeAIInsights,
      includeEvidence
    });

    // Actualizar con resultados
    await recommendationRef.update({
      status: 'completed',
      recommendations,
      updatedAt: new Date()
    });

    // Crear plan de seguimiento si es necesario
    if (recommendations.followUpPlan) {
      await createFollowUpPlan(patientId, doctorId, recommendations.followUpPlan);
    }

    // Registrar en historial médico
    await addToMedicalHistory(patientId, {
      type: 'ai_recommendation',
      recommendationId,
      recommendationType,
      summary: recommendations.summary,
      timestamp: new Date()
    });

    return createSuccessResponse({
      recommendationId,
      recommendations,
      message: 'Recomendaciones personalizadas generadas exitosamente'
    });

  } catch (error) {
    console.error('Error generando recomendaciones personalizadas:', error);
    
    if (error instanceof z.ZodError) {
      return createErrorResponse('Datos de entrada inválidos', 400, error.errors);
    }

    return createErrorResponse('Error interno del servidor', 500);
  }
}

// Obtener recomendaciones personalizadas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recommendationId = searchParams.get('recommendationId');
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');
    const recommendationType = searchParams.get('recommendationType');

    if (!recommendationId && !patientId) {
      return createErrorResponse('Se requiere recommendationId o patientId', 400);
    }

    let query = adminDb.collection('ai_recommendations');

    if (recommendationId) {
      query = query.where('id', '==', recommendationId);
    } else if (patientId) {
      query = query.where('patientId', '==', patientId);
      if (doctorId) {
        query = query.where('doctorId', '==', doctorId);
      }
      if (recommendationType) {
        query = query.where('recommendationType', '==', recommendationType);
      }
    }

    const snapshot = await query.orderBy('createdAt', 'desc').limit(20).get();
    const recommendations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return createSuccessResponse({
      recommendations,
      count: recommendations.length
    });

  } catch (error) {
    console.error('Error obteniendo recomendaciones:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}

// Función para crear plan de seguimiento
async function createFollowUpPlan(patientId: string, doctorId: string, followUpPlan: any) {
  try {
    const planRef = adminDb.collection('follow_up_plans').doc();
    
    await planRef.set({
      id: planRef.id,
      patientId,
      doctorId,
      plan: followUpPlan,
      status: 'active',
      createdAt: new Date(),
      nextFollowUp: followUpPlan.nextFollowUpDate
    });

    // Crear recordatorios si es necesario
    if (followUpPlan.reminders) {
      for (const reminder of followUpPlan.reminders) {
        await createReminder(patientId, doctorId, reminder);
      }
    }

  } catch (error) {
    console.error('Error creando plan de seguimiento:', error);
  }
}

// Función para crear recordatorios
async function createReminder(patientId: string, doctorId: string, reminder: any) {
  try {
    const reminderRef = adminDb.collection('reminders').doc();
    
    await reminderRef.set({
      id: reminderRef.id,
      patientId,
      doctorId,
      type: 'follow_up',
      title: reminder.title,
      description: reminder.description,
      scheduledDate: reminder.date,
      status: 'pending',
      createdAt: new Date()
    });

  } catch (error) {
    console.error('Error creando recordatorio:', error);
  }
}

// Función para agregar al historial médico
async function addToMedicalHistory(patientId: string, entry: any) {
  try {
    const historyRef = adminDb.collection('patients').doc(patientId).collection('medical_history').doc();
    
    await historyRef.set({
      id: historyRef.id,
      ...entry,
      createdAt: new Date()
    });

  } catch (error) {
    console.error('Error agregando al historial médico:', error);
  }
} 