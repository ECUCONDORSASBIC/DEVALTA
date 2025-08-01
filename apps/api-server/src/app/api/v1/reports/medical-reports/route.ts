/**
 * 📊 MEDICAL REPORTS API - ALTAMEDICA
 * Generate personalized medical reports with advanced export capabilities
 */

import { NextRequest, NextResponse } from "next/server";
import { 
  logger, 
  createSuccessResponse, 
  createErrorResponse, 
  UnauthorizedError,
  AppError,
  validateSchema
} from "@/lib/response-helpers";
import { z } from "zod";
import { medicalCache } from '@/lib/mock-medical';
import { optimizeApiRequest } from '@/lib/mock-medical';

// Report types
export enum ReportType {
  PATIENT_SUMMARY = 'patient_summary',
  APPOINTMENT_HISTORY = 'appointment_history',
  MEDICATION_REVIEW = 'medication_review',
  LAB_RESULTS = 'lab_results',
  VITAL_SIGNS = 'vital_signs',
  TREATMENT_PLAN = 'treatment_plan',
  PROGRESS_REPORT = 'progress_report',
  DISCHARGE_SUMMARY = 'discharge_summary',
  REFERRAL_LETTER = 'referral_letter',
  MEDICAL_CERTIFICATE = 'medical_certificate'
}

// Export formats
export enum ExportFormat {
  PDF = 'pdf',
  DOCX = 'docx',
  HTML = 'html',
  JSON = 'json',
  CSV = 'csv'
}

// Report configuration schema
const reportConfigSchema = z.object({
  type: z.nativeEnum(ReportType),
  patientId: z.string(),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }).optional(),
  includeSections: z.array(z.string()).optional(),
  excludeSections: z.array(z.string()).optional(),
  format: z.nativeEnum(ExportFormat).default(ExportFormat.PDF),
  template: z.string().optional(),
  language: z.string().default('es'),
  includeCharts: z.boolean().default(true),
  includeImages: z.boolean().default(true),
  watermark: z.boolean().default(false),
  password: z.string().optional()
});

// Report data structure
interface ReportData {
  id: string;
  type: ReportType;
  patientId: string;
  generatedAt: Date;
  generatedBy: string;
  data: Record<string, any>;
  metadata: {
    sections: string[];
    charts: string[];
    images: string[];
    wordCount: number;
    pageCount: number;
  };
}

export async function POST(request: NextRequest) {
  const startTime = performance.now();

  try {
    // Use optimization middleware
    await optimizeApiRequest(request, {
      enableCache: true,
      enableDeduplication: true,
      enableMetrics: true,
      cacheTTL: {
        'POST:/api/v1/reports/medical-reports': 10 * 60 * 1000, // 10 minutes
      }
    });

    // Mock authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authorization header required');
    }

    // Mock user data
    const user = {
      uid: 'mock-user-id',
      role: 'doctor',
      name: 'Dr. Juan Pérez',
      license: 'MED123456'
    };

    // Parse request body
    const body = await request.json();
    const validation = validateSchema(reportConfigSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', validation.error),
        { status: 400 }
      );
    }

    const config = validation.data;
    
    logger.info(
      `Generating medical report: ${config.type} for patient ${config.patientId}, format: ${config.format}`
    );

    // Generate report data
    const reportData = await generateMedicalReport(config, user);

    // Export report in requested format
    const exportedReport = await exportReport(reportData, config);

    const executionTime = performance.now() - startTime;

    return NextResponse.json(createSuccessResponse({
      reportId: reportData.id,
      type: config.type,
      patientId: config.patientId,
      format: config.format,
      downloadUrl: exportedReport.downloadUrl,
      metadata: {
        generatedAt: reportData.generatedAt,
        generatedBy: reportData.generatedBy,
        executionTime: executionTime,
        fileSize: exportedReport.fileSize,
        sections: reportData.metadata.sections,
        wordCount: reportData.metadata.wordCount,
        pageCount: reportData.metadata.pageCount
      }
    }), {
      headers: {
        'X-Report-ID': reportData.id,
        'X-Execution-Time': `${executionTime.toFixed(2)}ms`,
        'X-Report-Type': config.type
      }
    });

  } catch (error: unknown) {
    logger.error("Generate medical report error:", error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse((error as any).code, (error as any).message, error.details),
        { status: (error as any).statusCode }
      );
    }

    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'Internal server error'),
      { status: 500 }
    );
  }
}

/**
 * Generate medical report data
 */
async function generateMedicalReport(config: any, user: any): Promise<ReportData> {
  const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Mock patient data
  const patientData = {
    id: config.patientId,
    name: 'María González',
    age: 45,
    gender: 'F',
    bloodType: 'O+',
    allergies: ['Penicilina', 'Sulfamidas'],
    chronicConditions: ['Hipertensión', 'Diabetes tipo 2'],
    emergencyContact: {
      name: 'Carlos González',
      relationship: 'Esposo',
      phone: '+52 55 1234 5678'
    }
  };

  // Generate report based on type
  let reportContent: Record<string, any> = {};

  switch (config.type) {
    case ReportType.PATIENT_SUMMARY:
      reportContent = await generatePatientSummary(patientData, config);
      break;
    case ReportType.APPOINTMENT_HISTORY:
      reportContent = await generateAppointmentHistory(patientData, config);
      break;
    case ReportType.MEDICATION_REVIEW:
      reportContent = await generateMedicationReview(patientData, config);
      break;
    case ReportType.LAB_RESULTS:
      reportContent = await generateLabResults(patientData, config);
      break;
    case ReportType.VITAL_SIGNS:
      reportContent = await generateVitalSigns(patientData, config);
      break;
    case ReportType.TREATMENT_PLAN:
      reportContent = await generateTreatmentPlan(patientData, config);
      break;
    case ReportType.PROGRESS_REPORT:
      reportContent = await generateProgressReport(patientData, config);
      break;
    case ReportType.DISCHARGE_SUMMARY:
      reportContent = await generateDischargeSummary(patientData, config);
      break;
    case ReportType.REFERRAL_LETTER:
      reportContent = await generateReferralLetter(patientData, config);
      break;
    case ReportType.MEDICAL_CERTIFICATE:
      reportContent = await generateMedicalCertificate(patientData, config);
      break;
    default:
      throw new Error(`Unsupported report type: ${config.type}`);
  }

  return {
    id: reportId,
    type: config.type,
    patientId: config.patientId,
    generatedAt: new Date(),
    generatedBy: user.name,
    data: reportContent,
    metadata: {
      sections: Object.keys(reportContent),
      charts: config.includeCharts ? ['vital_signs_trend', 'medication_compliance'] : [],
      images: config.includeImages ? ['patient_photo', 'lab_results'] : [],
      wordCount: calculateWordCount(reportContent),
      pageCount: estimatePageCount(reportContent, config.format)
    }
  };
}

/**
 * Generate patient summary report
 */
async function generatePatientSummary(patient: any, config: any): Promise<Record<string, any>> {
  return {
    header: {
      title: 'Resumen del Paciente',
      patientName: patient.name,
      patientId: patient.id,
      generatedDate: new Date().toISOString(),
      doctor: 'Dr. Juan Pérez'
    },
    patientInfo: {
      personalData: {
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        bloodType: patient.bloodType,
        dateOfBirth: '1978-03-15'
      },
      medicalHistory: {
        allergies: patient.allergies,
        chronicConditions: patient.chronicConditions,
        surgeries: [
          { procedure: 'Apendicectomía', date: '2010-06-20', hospital: 'Hospital General' },
          { procedure: 'Cesárea', date: '2005-08-12', hospital: 'Hospital de la Mujer' }
        ],
        familyHistory: {
          father: ['Hipertensión', 'Diabetes'],
          mother: ['Artritis'],
          siblings: ['Asma (hermano)']
        }
      }
    },
    currentStatus: {
      activeMedications: [
        { name: 'Metformina', dosage: '500mg', frequency: '2x día', startDate: '2020-01-15' },
        { name: 'Losartán', dosage: '50mg', frequency: '1x día', startDate: '2019-08-20' }
      ],
      lastVitalSigns: {
        bloodPressure: '135/85 mmHg',
        heartRate: '72 bpm',
        temperature: '36.8°C',
        weight: '68 kg',
        height: '165 cm',
        bmi: '25.0'
      },
      recentLabResults: {
        glucose: '110 mg/dL',
        hba1c: '6.2%',
        cholesterol: '180 mg/dL',
        triglycerides: '150 mg/dL'
      }
    },
    recommendations: [
      'Continuar con dieta baja en carbohidratos',
      'Ejercicio aeróbico 30 minutos 5 días por semana',
      'Monitoreo de glucosa en ayunas semanal',
      'Control de presión arterial diario',
      'Cita de seguimiento en 3 meses'
    ]
  };
}

/**
 * Generate appointment history report
 */
async function generateAppointmentHistory(patient: any, config: any): Promise<Record<string, any>> {
  const appointments = [
    {
      date: '2024-12-15',
      time: '10:00',
      doctor: 'Dr. Juan Pérez',
      specialty: 'Medicina General',
      reason: 'Control de diabetes e hipertensión',
      diagnosis: 'Diabetes tipo 2 controlada, Hipertensión estable',
      treatment: 'Ajuste de medicación',
      followUp: '3 meses'
    },
    {
      date: '2024-09-20',
      time: '14:30',
      doctor: 'Dr. Ana Martínez',
      specialty: 'Cardiología',
      reason: 'Evaluación cardiológica',
      diagnosis: 'Función cardíaca normal',
      treatment: 'Continuar medicación actual',
      followUp: '6 meses'
    },
    {
      date: '2024-06-10',
      time: '09:15',
      doctor: 'Dr. Juan Pérez',
      specialty: 'Medicina General',
      reason: 'Control rutinario',
      diagnosis: 'Estable',
      treatment: 'Sin cambios',
      followUp: '3 meses'
    }
  ];

  return {
    header: {
      title: 'Historial de Citas Médicas',
      patientName: patient.name,
      patientId: patient.id,
      period: `${config.dateRange?.start || '2024-01-01'} - ${config.dateRange?.end || '2024-12-31'}`
    },
    summary: {
      totalAppointments: appointments.length,
      specialties: ['Medicina General', 'Cardiología'],
      mostFrequentDoctor: 'Dr. Juan Pérez',
      averageInterval: '3 meses'
    },
    appointments: appointments.map(apt => ({
      ...apt,
      status: 'completed',
      duration: '30 minutos',
      notes: 'Paciente cooperativa, sin complicaciones'
    }))
  };
}

/**
 * Generate medication review report
 */
async function generateMedicationReview(patient: any, config: any): Promise<Record<string, any>> {
  const medications = [
    {
      name: 'Metformina',
      dosage: '500mg',
      frequency: '2x día',
      startDate: '2020-01-15',
      indication: 'Diabetes tipo 2',
      effectiveness: 'Buena',
      sideEffects: 'Náuseas ocasionales',
      compliance: '95%',
      lastRefill: '2024-12-01',
      nextRefill: '2025-01-01'
    },
    {
      name: 'Losartán',
      dosage: '50mg',
      frequency: '1x día',
      startDate: '2019-08-20',
      indication: 'Hipertensión',
      effectiveness: 'Excelente',
      sideEffects: 'Ninguno reportado',
      compliance: '98%',
      lastRefill: '2024-12-05',
      nextRefill: '2025-01-05'
    }
  ];

  return {
    header: {
      title: 'Revisión de Medicamentos',
      patientName: patient.name,
      patientId: patient.id,
      reviewDate: new Date().toISOString()
    },
    currentMedications: medications,
    analysis: {
      totalMedications: medications.length,
      averageCompliance: '96.5%',
      potentialInteractions: 'Ninguna detectada',
      recommendations: [
        'Continuar con medicación actual',
        'Mantener horarios regulares',
        'Reportar efectos secundarios inmediatamente'
      ]
    },
    discontinuedMedications: [
      {
        name: 'Glimepirida',
        reason: 'Control adecuado con Metformina',
        date: '2023-06-15'
      }
    ]
  };
}

/**
 * Generate lab results report
 */
async function generateLabResults(patient: any, config: any): Promise<Record<string, any>> {
  const labResults = {
    '2024-12-10': {
      glucose: { value: 110, unit: 'mg/dL', normal: '70-100', status: 'elevated' },
      hba1c: { value: 6.2, unit: '%', normal: '<5.7', status: 'elevated' },
      cholesterol: { value: 180, unit: 'mg/dL', normal: '<200', status: 'normal' },
      triglycerides: { value: 150, unit: 'mg/dL', normal: '<150', status: 'borderline' },
      creatinine: { value: 0.9, unit: 'mg/dL', normal: '0.6-1.2', status: 'normal' },
      alt: { value: 25, unit: 'U/L', normal: '7-55', status: 'normal' }
    },
    '2024-09-15': {
      glucose: { value: 115, unit: 'mg/dL', normal: '70-100', status: 'elevated' },
      hba1c: { value: 6.5, unit: '%', normal: '<5.7', status: 'elevated' },
      cholesterol: { value: 185, unit: 'mg/dL', normal: '<200', status: 'normal' },
      triglycerides: { value: 160, unit: 'mg/dL', normal: '<150', status: 'elevated' }
    }
  };

  return {
    header: {
      title: 'Resultados de Laboratorio',
      patientName: patient.name,
      patientId: patient.id,
      period: 'Últimos 6 meses'
    },
    summary: {
      totalTests: 8,
      abnormalResults: 3,
      trends: {
        glucose: 'Estable',
        hba1c: 'Mejorando',
        cholesterol: 'Estable'
      }
    },
    results: labResults,
    interpretation: {
      glucose: 'Niveles ligeramente elevados, control adecuado con dieta y medicación',
      hba1c: 'Mejora en control glucémico a largo plazo',
      cholesterol: 'Niveles dentro de rango normal',
      recommendations: [
        'Continuar con dieta baja en carbohidratos',
        'Mantener ejercicio regular',
        'Repetir HbA1c en 3 meses'
      ]
    }
  };
}

/**
 * Generate vital signs report
 */
async function generateVitalSigns(patient: any, config: any): Promise<Record<string, any>> {
  const vitalSigns = [
    {
      date: '2024-12-15',
      bloodPressure: { systolic: 135, diastolic: 85, unit: 'mmHg' },
      heartRate: { value: 72, unit: 'bpm' },
      temperature: { value: 36.8, unit: '°C' },
      weight: { value: 68, unit: 'kg' },
      height: { value: 165, unit: 'cm' },
      bmi: { value: 25.0, unit: 'kg/m²' },
      oxygenSaturation: { value: 98, unit: '%' }
    },
    {
      date: '2024-11-15',
      bloodPressure: { systolic: 140, diastolic: 88, unit: 'mmHg' },
      heartRate: { value: 75, unit: 'bpm' },
      temperature: { value: 36.9, unit: '°C' },
      weight: { value: 69, unit: 'kg' },
      height: { value: 165, unit: 'cm' },
      bmi: { value: 25.3, unit: 'kg/m²' },
      oxygenSaturation: { value: 97, unit: '%' }
    }
  ];

  return {
    header: {
      title: 'Signos Vitales',
      patientName: patient.name,
      patientId: patient.id,
      period: 'Últimos 3 meses'
    },
    summary: {
      totalReadings: vitalSigns.length,
      trends: {
        bloodPressure: 'Estable',
        heartRate: 'Normal',
        weight: 'Ligera disminución',
        bmi: 'Mejorando'
      }
    },
    readings: vitalSigns,
    analysis: {
      bloodPressure: 'Control adecuado con medicación',
      heartRate: 'Ritmo cardíaco normal',
      weight: 'Pérdida de 1kg en 3 meses, favorable',
      recommendations: [
        'Continuar monitoreo de presión arterial',
        'Mantener pérdida de peso gradual',
        'Ejercicio regular para control cardiovascular'
      ]
    }
  };
}

/**
 * Generate treatment plan report
 */
async function generateTreatmentPlan(patient: any, config: any): Promise<Record<string, any>> {
  return {
    header: {
      title: 'Plan de Tratamiento',
      patientName: patient.name,
      patientId: patient.id,
      createdDate: new Date().toISOString(),
      validUntil: '2025-06-15'
    },
    diagnosis: {
      primary: 'Diabetes tipo 2',
      secondary: 'Hipertensión arterial',
      comorbidities: ['Obesidad', 'Dislipidemia']
    },
    goals: [
      'Mantener HbA1c < 6.5%',
      'Controlar presión arterial < 140/90 mmHg',
      'Reducir peso en 5kg en 6 meses',
      'Mejorar perfil lipídico'
    ],
    medications: [
      {
        name: 'Metformina',
        dosage: '500mg',
        frequency: '2x día',
        timing: 'Con las comidas',
        duration: 'Indefinido',
        monitoring: 'Función renal cada 6 meses'
      },
      {
        name: 'Losartán',
        dosage: '50mg',
        frequency: '1x día',
        timing: 'Mañana',
        duration: 'Indefinido',
        monitoring: 'Presión arterial mensual'
      }
    ],
    lifestyle: {
      diet: 'Dieta mediterránea baja en carbohidratos',
      exercise: '30 minutos de ejercicio aeróbico 5 días por semana',
      smoking: 'No fumador',
      alcohol: 'Ocasional, máximo 1 bebida por día'
    },
    monitoring: {
      frequency: 'Mensual',
      tests: ['Glucosa en ayunas', 'Presión arterial', 'Peso'],
      specialist: 'Endocrinólogo cada 6 meses'
    },
    followUp: {
      nextAppointment: '2025-03-15',
      type: 'Control de diabetes e hipertensión',
      adjustments: 'Revisar medicación según resultados'
    }
  };
}

/**
 * Generate progress report
 */
async function generateProgressReport(patient: any, config: any): Promise<Record<string, any>> {
  return {
    header: {
      title: 'Reporte de Progreso',
      patientName: patient.name,
      patientId: patient.id,
      period: 'Enero 2024 - Diciembre 2024'
    },
    progress: {
      weight: {
        initial: 72,
        current: 68,
        change: -4,
        goal: -5,
        status: 'on_track'
      },
      hba1c: {
        initial: 7.2,
        current: 6.2,
        change: -1.0,
        goal: '<6.5',
        status: 'achieved'
      },
      bloodPressure: {
        initial: '145/95',
        current: '135/85',
        change: 'Mejorado',
        goal: '<140/90',
        status: 'achieved'
      }
    },
    adherence: {
      medication: '95%',
      diet: '80%',
      exercise: '70%',
      appointments: '100%'
    },
    challenges: [
      'Dificultad para mantener ejercicio regular',
      'Ocasional incumplimiento de dieta'
    ],
    achievements: [
      'Control glucémico mejorado',
      'Pérdida de peso sostenida',
      'Mejor control de presión arterial'
    ],
    recommendations: [
      'Aumentar frecuencia de ejercicio',
      'Mantener dieta estricta',
      'Continuar con medicación actual'
    ]
  };
}

/**
 * Generate discharge summary
 */
async function generateDischargeSummary(patient: any, config: any): Promise<Record<string, any>> {
  return {
    header: {
      title: 'Resumen de Alta',
      patientName: patient.name,
      patientId: patient.id,
      admissionDate: '2024-12-10',
      dischargeDate: '2024-12-12',
      lengthOfStay: '2 días'
    },
    admission: {
      reason: 'Control de diabetes descompensada',
      diagnosis: 'Hiperglucemia leve',
      severity: 'Leve'
    },
    treatment: {
      medications: ['Insulina regular', 'Metformina'],
      procedures: 'Ninguna',
      consultations: 'Endocrinólogo'
    },
    discharge: {
      condition: 'Estable',
      medications: [
        { name: 'Metformina', dosage: '500mg', frequency: '2x día' },
        { name: 'Losartán', dosage: '50mg', frequency: '1x día' }
      ],
      diet: 'Dieta diabética controlada',
      activity: 'Actividad normal'
    },
    followUp: {
      primaryCare: '7 días',
      endocrinology: '1 mes',
      labWork: '2 semanas'
    },
    instructions: [
      'Monitorear glucosa diariamente',
      'Continuar medicación según prescripción',
      'Dieta baja en carbohidratos',
      'Ejercicio regular'
    ]
  };
}

/**
 * Generate referral letter
 */
async function generateReferralLetter(patient: any, config: any): Promise<Record<string, any>> {
  return {
    header: {
      title: 'Carta de Referencia',
      date: new Date().toISOString(),
      from: 'Dr. Juan Pérez',
      to: 'Dr. Ana Martínez',
      specialty: 'Cardiología'
    },
    patient: {
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      id: patient.id
    },
    reason: 'Evaluación cardiológica para paciente diabética con hipertensión',
    clinicalHistory: {
      diagnosis: 'Diabetes tipo 2, Hipertensión arterial',
      duration: '5 años',
      currentMedication: ['Metformina', 'Losartán'],
      relevantHistory: 'Familiar con enfermedad cardiovascular'
    },
    currentStatus: {
      symptoms: 'Asintomática',
      vitalSigns: 'PA: 135/85, FC: 72, Peso: 68kg',
      recentLabs: 'Glucosa: 110 mg/dL, HbA1c: 6.2%'
    },
    request: 'Evaluación cardiológica completa incluyendo ECG y ecocardiograma',
    urgency: 'Rutinaria',
    additionalInfo: 'Paciente cooperativa, buen cumplimiento terapéutico'
  };
}

/**
 * Generate medical certificate
 */
async function generateMedicalCertificate(patient: any, config: any): Promise<Record<string, any>> {
  return {
    header: {
      title: 'Certificado Médico',
      certificateNumber: `CM-${Date.now()}`,
      date: new Date().toISOString(),
      doctor: 'Dr. Juan Pérez',
      license: 'MED123456'
    },
    patient: {
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      id: patient.id
    },
    examination: {
      date: new Date().toISOString(),
      findings: 'Paciente en buen estado general',
      diagnosis: 'Diabetes tipo 2 controlada, Hipertensión estable'
    },
    certificate: {
      type: 'Certificado de salud',
      purpose: 'Trabajo',
      validity: '6 meses',
      restrictions: 'Ninguna',
      recommendations: 'Continuar con tratamiento actual'
    },
    signature: {
      doctor: 'Dr. Juan Pérez',
      license: 'MED123456',
      date: new Date().toISOString()
    }
  };
}

/**
 * Export report in requested format
 */
async function exportReport(reportData: ReportData, config: any): Promise<{ downloadUrl: string; fileSize: number }> {
  // In production, this would use libraries like PDFKit, docx, etc.
  const mockFileSize = Math.floor(Math.random() * 1000000) + 50000; // 50KB - 1MB
  
  return {
    downloadUrl: `/api/v1/reports/download/${reportData.id}`,
    fileSize: mockFileSize
  };
}

/**
 * Calculate word count
 */
function calculateWordCount(content: Record<string, any>): number {
  const text = JSON.stringify(content);
  return text.split(/\s+/).length;
}

/**
 * Estimate page count
 */
function estimatePageCount(content: Record<string, any>, format: ExportFormat): number {
  const wordCount = calculateWordCount(content);
  
  switch (format) {
    case ExportFormat.PDF:
      return Math.ceil(wordCount / 250); // ~250 words per page
    case ExportFormat.DOCX:
      return Math.ceil(wordCount / 300); // ~300 words per page
    case ExportFormat.HTML:
      return Math.ceil(wordCount / 400); // ~400 words per page
    default:
      return 1;
  }
} 