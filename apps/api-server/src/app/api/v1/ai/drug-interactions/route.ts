/**
 * 💊 AI Drug Interactions Endpoint
 * Verifica interacciones entre medicamentos usando IA
 */
import { NextRequest, NextResponse } from "next/server";
import { withSecurity } from '@/lib/security';

interface DrugInteractionRequest {
  drugs: string[];
  patientAge?: number;
  patientWeight?: number;
  medicalConditions?: string[];
}

interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  recommendation: string;
}

interface DrugInteractionResponse {
  interactions: DrugInteraction[];
  safetyScore: number;
  warnings: string[];
  recommendations: string[];
}

async function drugInteractionsHandler(request: NextRequest) {
  try {
    const body: DrugInteractionRequest = await request.json();
    const { drugs, patientAge, patientWeight, medicalConditions } = body;

    // Validación
    if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
      return NextResponse.json({
        success: false,
        error: "Se requieren al menos 2 medicamentos para verificar interacciones",
        code: "INSUFFICIENT_DRUGS"
      }, { status: 400 });
    }

    // Mock de análisis de interacciones (aquí iría integración con API de IA)
    const interactions: DrugInteraction[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Análisis simulado de interacciones
    for (let i = 0; i < drugs.length; i++) {
      for (let j = i + 1; j < drugs.length; j++) {
        const drug1 = drugs[i];
        const drug2 = drugs[j];
        
        // Simulación de detección de interacciones conocidas
        if (drug1.toLowerCase().includes('warfarin') && drug2.toLowerCase().includes('aspirin')) {
          interactions.push({
            drug1,
            drug2,
            severity: 'severe',
            description: 'Riesgo aumentado de sangrado',
            recommendation: 'Monitoreo estricto de INR y signos de sangrado'
          });
        }
      }
    }

    // Calcular score de seguridad
    let safetyScore = 100;
    interactions.forEach((interaction: any) => {
      switch (interaction.severity) {
        case 'severe': safetyScore -= 30; break;
        case 'moderate': safetyScore -= 15; break;
        case 'mild': safetyScore -= 5; break;
      }
    });

    // Generar recomendaciones
    if (interactions.length === 0) {
      recommendations.push('No se detectaron interacciones significativas');
    } else {
      recommendations.push('Revisar interacciones detectadas con médico especialista');
    }

    const response: DrugInteractionResponse = {
      interactions,
      safetyScore: Math.max(0, safetyScore),
      warnings,
      recommendations
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error: unknown) {
    console.error('🔥 Error en drug interactions:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export const POST = withSecurity(drugInteractionsHandler);
