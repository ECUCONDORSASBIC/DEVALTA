/**
 * @fileoverview Hook optimizado de IA médica con memoization
 * @module @altamedica/hooks/medical/useMedicalAI
 * @description Versión optimizada con memoization para mejorar performance
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../auth/useAuth';
import { useNotifications } from '../realtime/useNotifications';

// Import types from original file
import type {
  MedicalAIConfig,
  AIAnalysisResult,
  SymptomInput,
  PatientContext,
  DiagnosticSuggestion,
  TreatmentRecommendation,
  MedicalResponse,
  VitalSignsAnalysis,
  LabAnalysis,
  ImagingAnalysis,
  VitalSigns,
  LabResult,
  ImagingData,
  DrugInteraction,
  Medication,
  RiskAssessment,
  ClinicalGuideline,
  TranslationResult,
  PreventiveRecommendation,
  MedicalSpecialty,
  CriticalAlert,
  PrivacyViolation,
  AnalysisAuditEntry,
  UseMedicalAIReturn,
  AIAnalysisExport,
  SymptomAnalysis
} from './types/medical-ai.types';

// ==========================================
// OPTIMIZED HOOK WITH MEMOIZATION
// ==========================================

export function useMedicalAI(config: MedicalAIConfig): UseMedicalAIReturn {
  const { user } = useAuth();
  const { sendNotification } = useNotifications();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<AIAnalysisResult[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [auditLog, setAuditLog] = useState<AnalysisAuditEntry[]>([]);
  
  // Refs for stable references
  const configRef = useRef(config);
  const analysisCache = useRef<Map<string, AIAnalysisResult>>(new Map());
  
  // Update config ref when it changes
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Memoized helper functions
  const generateCacheKey = useCallback((
    symptoms: SymptomInput[],
    context: PatientContext
  ): string => {
    const sortedSymptoms = [...symptoms].sort((a, b) => a.symptom.localeCompare(b.symptom));
    return JSON.stringify({
      symptoms: sortedSymptoms,
      age: context.age,
      gender: context.gender,
      conditions: context.medicalHistory?.chronicConditions?.sort()
    });
  }, []);

  const calculateUrgency = useCallback((symptoms: SymptomInput[]): 'low' | 'medium' | 'high' | 'critical' => {
    const maxSeverity = Math.max(...symptoms.map(s => s.severity));
    const emergencySymptoms = ['chest pain', 'difficulty breathing', 'severe headache', 'loss of consciousness'];
    
    const hasEmergencySymptom = symptoms.some(s => 
      emergencySymptoms.some(es => s.symptom.toLowerCase().includes(es))
    );
    
    if (hasEmergencySymptom || maxSeverity === 5) return 'critical';
    if (maxSeverity >= 4) return 'high';
    if (maxSeverity >= 3) return 'medium';
    return 'low';
  }, []);

  const identifyRedFlags = useCallback((
    symptoms: SymptomInput[],
    context: PatientContext
  ): string[] => {
    const redFlags: string[] = [];
    
    symptoms.forEach(symptom => {
      if (symptom.symptom.toLowerCase().includes('chest pain') && symptom.severity >= 4) {
        redFlags.push('Dolor torácico severo - descartar síndrome coronario agudo');
      }
      if (symptom.symptom.toLowerCase().includes('difficulty breathing') && symptom.severity >= 3) {
        redFlags.push('Dificultad respiratoria - evaluar urgentemente');
      }
    });
    
    if (context.age > 65 && symptoms.some(s => s.symptom.includes('confusion'))) {
      redFlags.push('Confusión en adulto mayor - descartar delirium o infección');
    }
    
    return redFlags;
  }, []);

  // Memoized analysis functions
  const analyzeSymptoms = useCallback(async (
    symptoms: SymptomInput[],
    patientContext: PatientContext
  ): Promise<AIAnalysisResult> => {
    const cacheKey = generateCacheKey(symptoms, patientContext);
    
    // Check cache first
    if (analysisCache.current.has(cacheKey)) {
      const cachedResult = analysisCache.current.get(cacheKey)!;
      // Return cached result if less than 5 minutes old
      if (Date.now() - cachedResult.timestamp.getTime() < 5 * 60 * 1000) {
        return cachedResult;
      }
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const startTime = Date.now();
      
      // Anonymize data if required
      const processedContext = configRef.current.anonymizeData 
        ? anonymizePatientData(patientContext)
        : patientContext;

      // Simulate AI analysis (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const urgency = calculateUrgency(symptoms);
      const redFlags = identifyRedFlags(symptoms, processedContext);

      const symptomAnalysis: SymptomAnalysis = {
        primarySymptoms: symptoms.filter(s => s.severity >= 3).map(s => s.symptom),
        secondarySymptoms: symptoms.filter(s => s.severity < 3).map(s => s.symptom),
        urgencyLevel: urgency,
        redFlags,
        followUpQuestions: generateFollowUpQuestions(symptoms),
        recommendedTests: recommendTests(symptoms, processedContext)
      };

      const result: AIAnalysisResult = {
        id: `analysis_${Date.now()}`,
        timestamp: new Date(),
        confidence: calculateConfidence(symptoms, processedContext),
        processingTime: Date.now() - startTime,
        symptomAnalysis,
        diagnosticSuggestions: await generateDiagnosticSuggestions(symptoms, processedContext),
        treatmentRecommendations: await generateTreatmentRecommendations(symptoms, processedContext),
        modelUsed: configRef.current.primaryModel,
        specialtyContext: determineRelevantSpecialties(symptoms),
        requiresHumanReview: requiresHumanReview(symptoms, processedContext),
        privacyCompliant: true,
        auditTrail: [...auditLog]
      };

      // Cache the result
      analysisCache.current.set(cacheKey, result);
      
      // Limit cache size to 100 entries
      if (analysisCache.current.size > 100) {
        const firstKey = analysisCache.current.keys().next().value;
        analysisCache.current.delete(firstKey);
      }

      setAnalysisHistory(prev => [...prev, result]);
      addAuditEntry('symptom_analysis', symptoms.map(s => s.symptom), 'completed');

      // Handle critical alerts
      if (urgency === 'critical' && configRef.current.onCriticalAlert) {
        configRef.current.onCriticalAlert({
          type: 'emergency_symptoms',
          message: 'Síntomas críticos detectados',
          symptoms: symptoms.filter(s => s.severity >= 4).map(s => s.symptom),
          recommendedAction: 'Buscar atención médica inmediata',
          urgency: 'immediate'
        });
      }

      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, [generateCacheKey, calculateUrgency, identifyRedFlags]);

  // Memoized drug interaction checker
  const checkDrugInteractions = useCallback(async (
    medications: Medication[]
  ): Promise<DrugInteraction[]> => {
    const cacheKey = `drugs_${medications.map(m => m.name).sort().join('_')}`;
    
    // Check cache
    const cached = analysisCache.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp.getTime() < 10 * 60 * 1000) {
      return cached.drugInteractions || [];
    }

    // Simulate drug interaction check
    await new Promise(resolve => setTimeout(resolve, 500));

    const interactions: DrugInteraction[] = [];
    
    // Simple interaction detection (replace with real API)
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        if (hasInteraction(medications[i], medications[j])) {
          interactions.push({
            drug1: medications[i].name,
            drug2: medications[j].name,
            severity: 'moderate',
            description: `Posible interacción entre ${medications[i].name} y ${medications[j].name}`,
            recommendation: 'Consultar con médico'
          });
        }
      }
    }

    return interactions;
  }, []);

  // Memoized vital signs analyzer
  const analyzeVitalSigns = useCallback(async (
    vitalSigns: VitalSigns,
    patientContext: PatientContext
  ): Promise<VitalSignsAnalysis> => {
    const normalRanges = useMemo(() => getNormalRanges(patientContext), [patientContext]);
    
    const abnormalValues = Object.entries(vitalSigns)
      .filter(([param, value]) => {
        const range = normalRanges[param];
        return range && (value < range.min || value > range.max);
      })
      .map(([param, value]) => ({
        parameter: param,
        value: value as number,
        status: (value as number) < normalRanges[param].min ? 'low' : 'high' as 'low' | 'high',
        severity: calculateSeverity(param, value as number, normalRanges[param]) as 'mild' | 'moderate' | 'severe'
      }));

    return {
      normalRanges,
      abnormalValues,
      clinicalInterpretation: generateClinicalInterpretation(abnormalValues),
      recommendations: generateVitalSignsRecommendations(abnormalValues),
      urgency: determineVitalSignsUrgency(abnormalValues)
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      analysisCache.current.clear();
    };
  }, []);

  // Return memoized hook interface
  return useMemo(() => ({
    isAnalyzing,
    analysisHistory,
    error,
    analyzeSymptoms,
    getDiagnosticSuggestions: async (symptoms, context) => {
      const result = await analyzeSymptoms(
        symptoms.map(s => ({ symptom: s, severity: 3, duration: '1 day' })),
        context
      );
      return result.diagnosticSuggestions;
    },
    checkDrugInteractions,
    assessRisk: async (context) => assessPatientRisk(context),
    analyzeVitalSigns,
    analyzeLab: async (labResults, context) => analyzeLabResults(labResults, context),
    analyzeImaging: async (imagingData, context) => analyzeImagingData(imagingData, context),
    getTreatmentOptions: async (diagnosis, context) => getTreatmentOptions(diagnosis, context),
    getPreventiveRecommendations: async (context) => getPreventiveRecommendations(context),
    askMedicalQuestion: async (question, context) => askMedicalQuestion(question, context),
    getClinicalGuidelines: async (condition, specialty) => getClinicalGuidelines(condition, specialty),
    explainDiagnosis: async (diagnosis, audience) => explainDiagnosis(diagnosis, audience),
    translateMedicalTerms: async (terms, targetLanguage) => translateMedicalTerms(terms, targetLanguage),
    updateSpecialties: (specialties) => {
      configRef.current = { ...configRef.current, specialties };
    },
    setConfidenceThreshold: (threshold) => {
      configRef.current = { ...configRef.current, confidenceThreshold: threshold };
    },
    getAuditLog: () => [...auditLog],
    clearAnalysisHistory: () => {
      setAnalysisHistory([]);
      analysisCache.current.clear();
    },
    exportAnalysisData: () => ({
      version: '1.0',
      exportDate: new Date(),
      analysisCount: analysisHistory.length,
      analyses: analysisHistory,
      auditLog: auditLog
    })
  }), [
    isAnalyzing,
    analysisHistory,
    error,
    analyzeSymptoms,
    checkDrugInteractions,
    analyzeVitalSigns,
    auditLog
  ]);
}

// Helper functions (implement these based on your needs)
function anonymizePatientData(context: PatientContext): PatientContext {
  return {
    ...context,
    // Remove identifying information
    id: 'anonymous',
    name: undefined
  };
}

function generateFollowUpQuestions(symptoms: SymptomInput[]): string[] {
  // Implementation based on symptoms
  return [];
}

function recommendTests(symptoms: SymptomInput[], context: PatientContext): string[] {
  // Implementation based on symptoms and context
  return [];
}

function calculateConfidence(symptoms: SymptomInput[], context: PatientContext): number {
  // Implementation based on data quality and completeness
  return 0.85;
}

function generateDiagnosticSuggestions(
  symptoms: SymptomInput[],
  context: PatientContext
): Promise<DiagnosticSuggestion[]> {
  // Implementation
  return Promise.resolve([]);
}

function generateTreatmentRecommendations(
  symptoms: SymptomInput[],
  context: PatientContext
): Promise<TreatmentRecommendation[]> {
  // Implementation
  return Promise.resolve([]);
}

function determineRelevantSpecialties(symptoms: SymptomInput[]): MedicalSpecialty[] {
  // Implementation
  return ['general_medicine'];
}

function requiresHumanReview(symptoms: SymptomInput[], context: PatientContext): boolean {
  // Implementation
  return symptoms.some(s => s.severity >= 4);
}

function hasInteraction(med1: Medication, med2: Medication): boolean {
  // Implementation
  return false;
}

function getNormalRanges(context: PatientContext): Record<string, { min: number; max: number; unit: string }> {
  // Implementation based on age, gender, etc.
  return {
    heartRate: { min: 60, max: 100, unit: 'bpm' },
    bloodPressureSystolic: { min: 90, max: 140, unit: 'mmHg' },
    bloodPressureDiastolic: { min: 60, max: 90, unit: 'mmHg' },
    temperature: { min: 36.5, max: 37.5, unit: '°C' },
    oxygenSaturation: { min: 95, max: 100, unit: '%' }
  };
}

function calculateSeverity(param: string, value: number, range: { min: number; max: number }): string {
  // Implementation
  return 'mild';
}

function generateClinicalInterpretation(abnormalValues: any[]): string {
  // Implementation
  return 'Clinical interpretation based on abnormal values';
}

function generateVitalSignsRecommendations(abnormalValues: any[]): string[] {
  // Implementation
  return [];
}

function determineVitalSignsUrgency(abnormalValues: any[]): 'routine' | 'urgent' | 'immediate' {
  // Implementation
  return 'routine';
}

// Placeholder functions for other features
async function assessPatientRisk(context: PatientContext): Promise<RiskAssessment> {
  throw new Error('Not implemented');
}

async function analyzeLabResults(labResults: LabResult[], context: PatientContext): Promise<LabAnalysis> {
  throw new Error('Not implemented');
}

async function analyzeImagingData(imagingData: ImagingData, context: PatientContext): Promise<ImagingAnalysis> {
  throw new Error('Not implemented');
}

async function getTreatmentOptions(diagnosis: string, context: PatientContext): Promise<TreatmentRecommendation[]> {
  return [];
}

async function getPreventiveRecommendations(context: PatientContext): Promise<PreventiveRecommendation[]> {
  return [];
}

async function askMedicalQuestion(question: string, context?: PatientContext): Promise<MedicalResponse> {
  throw new Error('Not implemented');
}

async function getClinicalGuidelines(condition: string, specialty?: MedicalSpecialty): Promise<ClinicalGuideline[]> {
  return [];
}

async function explainDiagnosis(diagnosis: string, audience: 'patient' | 'professional'): Promise<string> {
  return '';
}

async function translateMedicalTerms(terms: string[], targetLanguage: 'es' | 'en'): Promise<TranslationResult[]> {
  return [];
}

function addAuditEntry(action: string, dataAccessed: string[], result: string): void {
  // Implementation
}