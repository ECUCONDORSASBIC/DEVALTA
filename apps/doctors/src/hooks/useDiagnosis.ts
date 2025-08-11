/**
 * 🤖 Hook para Diagnóstico Médico con IA
 * Integración con servicio de análisis inteligente para consultas médicas
 */

import { apiClient, withOptions } from '@/lib/api-client';
import { useAuth } from "@altamedica/auth";
import { useCallback, useState } from 'react';

export interface DiagnosisInput {
  patientId: string;
  symptoms: string[];
  vitalSigns?: {
    bloodPressure?: { systolic: number; diastolic: number };
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
  };
  medicalHistory?: string[];
  currentMedications?: string[];
  chiefComplaint: string;
  presentIllness?: string;
  duration?: string;
  severity?: 'mild' | 'moderate' | 'severe' | 'critical';
}

export interface DiagnosisResult {
  id: string;
  timestamp: string;
  confidence: number;
  primaryDiagnosis: {
    condition: string;
    icdCode: string;
    probability: number;
    description: string;
  };
  differentialDiagnoses: Array<{
    condition: string;
    icdCode: string;
    probability: number;
    reasoning: string;
  }>;
  recommendedTests: Array<{
    test: string;
    priority: 'stat' | 'urgent' | 'routine';
    reasoning: string;
  }>;
  treatmentSuggestions: Array<{
    treatment: string;
    type: 'medication' | 'procedure' | 'lifestyle' | 'referral';
    details: string;
    contraindications?: string[];
  }>;
  redFlags: Array<{
    flag: string;
    severity: 'high' | 'medium' | 'low';
    action: string;
  }>;
  followUpRecommendations: {
    timeframe: string;
    instructions: string;
    specialistReferral?: string;
  };
  educationalContent?: {
    patientEducation: string[];
    preventiveMeasures: string[];
  };
}

export interface DiagnosisHistoryItem extends DiagnosisResult {
  patientName: string;
  patientAge: number;
  consultationDate: string;
  doctorNotes?: string;
  outcome?: 'confirmed' | 'modified' | 'rejected';
  finalDiagnosis?: string;
}

interface UseDiagnosisReturn {
  // Estado
  isAnalyzing: boolean;
  currentAnalysis: DiagnosisResult | null;
  history: DiagnosisHistoryItem[];
  error: string | null;
  
  // Acciones
  analyzeDiagnosis: (input: DiagnosisInput) => Promise<DiagnosisResult | null>;
  saveToHistory: (result: DiagnosisResult, additionalData: Partial<DiagnosisHistoryItem>) => Promise<void>;
  loadHistory: () => Promise<void>;
  clearCurrentAnalysis: () => void;
  updateDiagnosisOutcome: (diagnosisId: string, outcome: 'confirmed' | 'modified' | 'rejected', finalDiagnosis?: string) => Promise<void>;
}

export function useDiagnosis(): UseDiagnosisReturn {
  const { user } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<DiagnosisResult | null>(null);
  const [history, setHistory] = useState<DiagnosisHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Analizar diagnóstico con IA
  const analyzeDiagnosis = useCallback(async (input: DiagnosisInput): Promise<DiagnosisResult | null> => {
    if (!user?.token) {
      setError('Usuario no autenticado');
      return null;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Validar entrada mínima
      if (!input.symptoms.length || !input.chiefComplaint) {
        throw new Error('Se requieren síntomas y motivo de consulta');
      }

      // Llamar al endpoint de IA
  const response = await apiClient.post('/api/v1/diagnosis/analyze', {
        ...input,
        doctorId: user.id,
        requestTime: new Date().toISOString()
  }, { headers: { 'Authorization': `Bearer ${user.token}` } });

      const result: DiagnosisResult = {
        id: response.data.id || `diag-${Date.now()}`,
        timestamp: new Date().toISOString(),
        confidence: response.data.confidence || 0,
        primaryDiagnosis: response.data.primaryDiagnosis,
        differentialDiagnoses: response.data.differentialDiagnoses || [],
        recommendedTests: response.data.recommendedTests || [],
        treatmentSuggestions: response.data.treatmentSuggestions || [],
        redFlags: response.data.redFlags || [],
        followUpRecommendations: response.data.followUpRecommendations || {
          timeframe: '1 semana',
          instructions: 'Seguimiento según evolución'
        },
        educationalContent: response.data.educationalContent
      };

      // Validar respuesta crítica
      if (result.confidence < 0.3) {
        console.warn('⚠️ Confianza baja en el diagnóstico:', result.confidence);
      }

      // Alertar si hay red flags críticos
      const criticalFlags = result.redFlags.filter(f => f.severity === 'high');
      if (criticalFlags.length > 0) {
        console.error('🚨 Red flags críticos detectados:', criticalFlags);
      }

      setCurrentAnalysis(result);
      return result;

    } catch (error: any) {
      console.error('Error en análisis de diagnóstico:', error);
      
      // Manejo específico de errores
      if (error.response?.status === 429) {
        setError('Límite de solicitudes excedido. Intente en unos minutos.');
      } else if (error.response?.status === 503) {
        setError('Servicio de IA temporalmente no disponible');
      } else {
        setError(error.message || 'Error al analizar diagnóstico');
      }
      
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [user]);

  // Guardar en historial
  const saveToHistory = useCallback(async (
    result: DiagnosisResult, 
    additionalData: Partial<DiagnosisHistoryItem>
  ): Promise<void> => {
    if (!user?.token) {
      setError('Usuario no autenticado');
      return;
    }

    try {
      const historyItem: DiagnosisHistoryItem = {
        ...result,
        patientName: additionalData.patientName || 'Paciente',
        patientAge: additionalData.patientAge || 0,
        consultationDate: new Date().toISOString(),
        doctorNotes: additionalData.doctorNotes,
        ...additionalData
      };

      // Guardar en backend
  await apiClient.post('/api/v1/diagnosis/history', historyItem, { headers: { 'Authorization': `Bearer ${user.token}` } });

      // Actualizar estado local
      setHistory(prev => [historyItem, ...prev]);

      // Log para auditoría HIPAA
      if (process.env.NODE_ENV === 'development') {
        console.log('📋 Diagnóstico guardado en historial:', {
          diagnosisId: result.id,
          patientId: additionalData.patientName,
          confidence: result.confidence
        });
      }

    } catch (error: any) {
      console.error('Error guardando en historial:', error);
      setError('Error al guardar diagnóstico en historial');
      throw error;
    }
  }, [user]);

  // Cargar historial
  const loadHistory = useCallback(async (): Promise<void> => {
    if (!user?.token) return;

    try {
      const opts = withOptions({
        headers: { 'Authorization': `Bearer ${user.token}` },
        params: { doctorId: user.id, limit: 50, orderBy: 'consultationDate', order: 'desc' }
      });
      const response = await apiClient.get(opts.getQuery('/api/v1/diagnosis/history'), { headers: opts.headers });

      setHistory(response.data.items || []);
    } catch (error) {
      console.error('Error cargando historial:', error);
      setError('Error al cargar historial de diagnósticos');
    }
  }, [user]);

  // Actualizar resultado de diagnóstico
  const updateDiagnosisOutcome = useCallback(async (
    diagnosisId: string, 
    outcome: 'confirmed' | 'modified' | 'rejected',
    finalDiagnosis?: string
  ): Promise<void> => {
    if (!user?.token) return;

    try {
      await apiClient.patch(`/api/v1/diagnosis/history/${diagnosisId}`, {
        outcome,
        finalDiagnosis,
        updatedBy: user.id,
        updatedAt: new Date().toISOString()
      }, { headers: { 'Authorization': `Bearer ${user.token}` } });

      // Actualizar estado local
      setHistory(prev => prev.map(item => 
        item.id === diagnosisId 
          ? { ...item, outcome, finalDiagnosis }
          : item
      ));

    } catch (error) {
      console.error('Error actualizando diagnóstico:', error);
      setError('Error al actualizar resultado del diagnóstico');
    }
  }, [user]);

  // Limpiar análisis actual
  const clearCurrentAnalysis = useCallback(() => {
    setCurrentAnalysis(null);
    setError(null);
  }, []);

  return {
    isAnalyzing,
    currentAnalysis,
    history,
    error,
    analyzeDiagnosis,
    saveToHistory,
    loadHistory,
    clearCurrentAnalysis,
    updateDiagnosisOutcome
  };
}

// Hook para usar diagnóstico con datos mock en desarrollo
export function useDiagnosisMock(): UseDiagnosisReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<DiagnosisResult | null>(null);
  const [history, setHistory] = useState<DiagnosisHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const analyzeDiagnosis = useCallback(async (input: DiagnosisInput): Promise<DiagnosisResult | null> => {
    setIsAnalyzing(true);
    setError(null);

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Generar diagnóstico mock basado en síntomas
      const mockResult: DiagnosisResult = {
        id: `diag-${Date.now()}`,
        timestamp: new Date().toISOString(),
        confidence: 0.85,
        primaryDiagnosis: {
          condition: 'Faringitis Aguda',
          icdCode: 'J02.9',
          probability: 0.85,
          description: 'Inflamación aguda de la faringe, probablemente de origen viral'
        },
        differentialDiagnoses: [
          {
            condition: 'Amigdalitis Bacteriana',
            icdCode: 'J03.9',
            probability: 0.65,
            reasoning: 'Considerar si hay exudado purulento o fiebre alta persistente'
          },
          {
            condition: 'Mononucleosis Infecciosa',
            icdCode: 'B27.9',
            probability: 0.25,
            reasoning: 'Menos probable sin adenopatías generalizadas'
          }
        ],
        recommendedTests: [
          {
            test: 'Test rápido de estreptococo',
            priority: 'routine',
            reasoning: 'Descartar faringitis estreptocócica'
          },
          {
            test: 'Hemograma completo',
            priority: 'routine',
            reasoning: 'Si los síntomas persisten más de 7 días'
          }
        ],
        treatmentSuggestions: [
          {
            treatment: 'Paracetamol 500mg cada 6-8 horas',
            type: 'medication',
            details: 'Para control de dolor y fiebre',
            contraindications: ['Insuficiencia hepática severa']
          },
          {
            treatment: 'Reposo e hidratación abundante',
            type: 'lifestyle',
            details: 'Mínimo 2 litros de líquidos al día'
          },
          {
            treatment: 'Gárgaras con agua tibia y sal',
            type: 'lifestyle',
            details: 'Cada 3-4 horas para alivio local'
          }
        ],
        redFlags: [],
        followUpRecommendations: {
          timeframe: '48-72 horas',
          instructions: 'Volver si empeora o no mejora en 3 días',
          specialistReferral: 'Otorrinolaringólogo si persiste más de 2 semanas'
        },
        educationalContent: {
          patientEducation: [
            'La mayoría de las faringitis son virales y se resuelven solas',
            'Los antibióticos no son efectivos contra virus',
            'Mantener buena higiene de manos para evitar contagio'
          ],
          preventiveMeasures: [
            'Evitar cambios bruscos de temperatura',
            'No fumar ni exponerse al humo',
            'Mantener ambientes ventilados'
          ]
        }
      };

      setCurrentAnalysis(mockResult);
      return mockResult;

    } catch (error) {
      setError('Error en diagnóstico mock');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const saveToHistory = useCallback(async (result: DiagnosisResult, additionalData: Partial<DiagnosisHistoryItem>) => {
    const historyItem: DiagnosisHistoryItem = {
      ...result,
      patientName: additionalData.patientName || 'Paciente Demo',
      patientAge: additionalData.patientAge || 32,
      consultationDate: new Date().toISOString(),
      ...additionalData
    };
    
    setHistory(prev => [historyItem, ...prev]);
  }, []);

  const loadHistory = useCallback(async () => {
    // Mock data
    setHistory([
      {
        id: 'diag-mock-1',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        confidence: 0.82,
        primaryDiagnosis: {
          condition: 'Hipertensión Arterial',
          icdCode: 'I10',
          probability: 0.82,
          description: 'Hipertensión arterial esencial'
        },
        differentialDiagnoses: [],
        recommendedTests: [],
        treatmentSuggestions: [],
        redFlags: [],
        followUpRecommendations: {
          timeframe: '1 mes',
          instructions: 'Control de presión arterial'
        },
        patientName: 'Juan Pérez',
        patientAge: 45,
        consultationDate: new Date(Date.now() - 86400000).toISOString(),
        outcome: 'confirmed'
      }
    ]);
  }, []);

  const updateDiagnosisOutcome = useCallback(async (diagnosisId: string, outcome: 'confirmed' | 'modified' | 'rejected', finalDiagnosis?: string) => {
    setHistory(prev => prev.map(item => 
      item.id === diagnosisId 
        ? { ...item, outcome, finalDiagnosis }
        : item
    ));
  }, []);

  const clearCurrentAnalysis = useCallback(() => {
    setCurrentAnalysis(null);
    setError(null);
  }, []);

  return {
    isAnalyzing,
    currentAnalysis,
    history,
    error,
    analyzeDiagnosis,
    saveToHistory,
    loadHistory,
    clearCurrentAnalysis,
    updateDiagnosisOutcome
  };
}