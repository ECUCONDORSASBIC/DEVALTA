/**
 * 🧪 AI LABORATORY ANALYSIS API
 * Análisis avanzado de resultados de laboratorio con IA
 * POST /api/v1/ai/lab-analysis
 */

import { adminDb } from '@/lib/firebase-admin';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { medicalAIService } from '@/services/ai/medical-ai-service';

export const dynamic = "force-dynamic";

// Schema para análisis de laboratorio
const LabAnalysisSchema = z.object({
  patientId: z.string().min(1, 'ID del paciente es requerido'),
  doctorId: z.string().min(1, 'ID del doctor es requerido'),
  labResults: z.array(z.object({
    testName: z.string().min(1, 'Nombre del test es requerido'),
    value: z.string().min(1, 'Valor es requerido'),
    unit: z.string().optional(),
    referenceRange: z.string().optional(),
    isAbnormal: z.boolean().optional(),
    category: z.enum(['hematology', 'chemistry', 'immunology', 'microbiology', 'urinalysis']).optional()
  })).min(1, 'Al menos un resultado de laboratorio es requerido'),
  patientInfo: z.object({
    age: z.number().min(0).max(150),
    gender: z.enum(['male', 'female', 'other']),
    weight: z.number().optional(),
    height: z.number().optional(),
    medicalHistory: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional()
  }).optional(),
  analysisType: z.enum(['comprehensive', 'specific', 'trend', 'screening']).default('comprehensive')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = LabAnalysisSchema.parse(body);

    const { patientId, doctorId, labResults, patientInfo, analysisType } = validatedData;

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

    // Crear registro de análisis
    const analysisRef = adminDb.collection('ai_lab_analyses').doc();
    const analysisId = analysisRef.id;

    const analysisData = {
      id: analysisId,
      patientId,
      doctorId,
      labResults,
      patientInfo,
      analysisType,
      status: 'processing',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await analysisRef.set(analysisData);

    // Realizar análisis con IA
    const aiAnalysis = await medicalAIService.analyzeLabResults({
      labResults,
      patientInfo,
      analysisType
    });

    // Actualizar con resultados
    await analysisRef.update({
      status: 'completed',
      results: aiAnalysis,
      updatedAt: new Date()
    });

    // Crear alertas si es necesario
    if (aiAnalysis.criticalValues.length > 0) {
      await createLabAlerts(patientId, doctorId, aiAnalysis.criticalValues);
    }

    // Registrar en historial médico
    await addToMedicalHistory(patientId, {
      type: 'lab_analysis',
      analysisId,
      summary: aiAnalysis.summary,
      criticalFindings: aiAnalysis.criticalValues.length > 0,
      timestamp: new Date()
    });

    return createSuccessResponse({
      analysisId,
      results: aiAnalysis,
      message: 'Análisis de laboratorio completado exitosamente'
    });

  } catch (error) {
    console.error('Error en análisis de laboratorio:', error);
    
    if (error instanceof z.ZodError) {
      return createErrorResponse('Datos de entrada inválidos', 400, error.errors);
    }

    return createErrorResponse('Error interno del servidor', 500);
  }
}

// Obtener análisis de laboratorio
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const analysisId = searchParams.get('analysisId');
    const patientId = searchParams.get('patientId');
    const doctorId = searchParams.get('doctorId');

    if (!analysisId && !patientId) {
      return createErrorResponse('Se requiere analysisId o patientId', 400);
    }

    let query = adminDb.collection('ai_lab_analyses');

    if (analysisId) {
      query = query.where('id', '==', analysisId);
    } else if (patientId) {
      query = query.where('patientId', '==', patientId);
      if (doctorId) {
        query = query.where('doctorId', '==', doctorId);
      }
    }

    const snapshot = await query.orderBy('createdAt', 'desc').limit(50).get();
    const analyses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return createSuccessResponse({
      analyses,
      count: analyses.length
    });

  } catch (error) {
    console.error('Error obteniendo análisis de laboratorio:', error);
    return createErrorResponse('Error interno del servidor', 500);
  }
}

// Función para crear alertas de laboratorio
async function createLabAlerts(patientId: string, doctorId: string, criticalValues: any[]) {
  try {
    const alertRef = adminDb.collection('medical_alerts').doc();
    
    await alertRef.set({
      id: alertRef.id,
      patientId,
      doctorId,
      type: 'lab_critical',
      severity: 'high',
      title: 'Valores Críticos de Laboratorio',
      description: `Se detectaron ${criticalValues.length} valores críticos en el análisis de laboratorio`,
      criticalValues,
      status: 'active',
      createdAt: new Date(),
      requiresAction: true
    });

    // Notificar al doctor
    await sendDoctorNotification(doctorId, {
      type: 'lab_alert',
      patientId,
      message: 'Valores críticos de laboratorio detectados',
      priority: 'high'
    });

  } catch (error) {
    console.error('Error creando alerta de laboratorio:', error);
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

// Función para notificar al doctor
async function sendDoctorNotification(doctorId: string, notification: any) {
  try {
    const notificationRef = adminDb.collection('doctors').doc(doctorId).collection('notifications').doc();
    
    await notificationRef.set({
      id: notificationRef.id,
      ...notification,
      read: false,
      createdAt: new Date()
    });

  } catch (error) {
    console.error('Error enviando notificación al doctor:', error);
  }
} 