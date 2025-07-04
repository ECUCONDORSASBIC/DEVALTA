/**
 * 🤖 TIPOS PARA PROVEEDORES DE IA - ALTAMEDICA
 * Definiciones de tipos para la gestión de proveedores LLM
 */

export interface ProviderProfile {
  /** Nombre del proveedor (ej: "OpenAI GPT-4") */
  name: string;
  /** URL del endpoint de la API */
  endpoint: string;
  /** Lista de modelos disponibles */
  models: string[];
  /** Estructura de precios */
  pricing: 'Pay-as-you-go' | 'Subscription' | 'Enterprise' | 'Free';
  /** Cumplimiento HIPAA */
  hipaa: boolean;
  /** Límites de uso por defecto */
  limits?: UsageLimits;
  /** Información de contacto para soporte */
  support?: ContactInfo;
  /** Acuerdos legales y contratos */
  agreements?: LegalAgreements;
}

export interface UsageLimits {
  /** Requests por minuto */
  requestsPerMinute: number;
  /** Requests por día */
  requestsPerDay: number;
  /** Tokens por request */
  tokensPerRequest: number;
  /** Costo máximo por mes (USD) */
  maxMonthlyCost: number;
}

export interface ContactInfo {
  /** Email de soporte técnico */
  supportEmail: string;
  /** Teléfono de emergencia (24/7) */
  emergencyPhone?: string;
  /** URL de documentación */
  documentationUrl: string;
  /** Portal de status del servicio */
  statusPageUrl?: string;
}

export interface LegalAgreements {
  /** Acuerdo HIPAA firmado */
  hipaaAgreement: {
    signed: boolean;
    signedDate?: string;
    documentUrl?: string;
  };
  /** Términos de servicio */
  termsOfService: {
    accepted: boolean;
    version: string;
    acceptedDate?: string;
  };
  /** Acuerdo de procesamiento de datos */
  dataProcessingAgreement?: {
    signed: boolean;
    signedDate?: string;
    documentUrl?: string;
  };
}

export interface ProviderConfig {
  /** Clave API (encriptada) */
  apiKey: string;
  /** Endpoint base de la API */
  endpoint: string;
  /** Modelos disponibles para este proveedor */
  models: string[];
  /** Configuración de timeout (ms) */
  timeout?: number;
  /** Headers personalizados */
  headers?: Record<string, string>;
  /** Configuración de retry */
  retryConfig?: RetryConfig;
}

export interface RetryConfig {
  /** Número máximo de reintentos */
  maxRetries: number;
  /** Tiempo base de espera (ms) */
  baseDelay: number;
  /** Factor de multiplicación para backoff exponencial */
  backoffFactor: number;
}

export interface LLMProvider {
  /** Configuración del proveedor */
  config: ProviderConfig;
  /** Perfil del proveedor */
  profile: ProviderProfile;
}

export interface AIRequest {
  /** ID único de la solicitud */
  requestId: string;
  /** Proveedor a utilizar */
  provider: string;
  /** Modelo específico */
  model: string;
  /** Mensaje o prompt */
  prompt: string;
  /** Parámetros adicionales */
  parameters?: AIRequestParameters;
  /** Contexto médico (para compliance) */
  medicalContext?: MedicalContext;
}

export interface AIRequestParameters {
  /** Temperatura (creatividad) */
  temperature?: number;
  /** Máximo número de tokens en la respuesta */
  maxTokens?: number;
  /** Top-p sampling */
  topP?: number;
  /** Penalización por frecuencia */
  frequencyPenalty?: number;
  /** Penalización por presencia */
  presencePenalty?: number;
  /** Tokens de parada */
  stopTokens?: string[];
}

export interface MedicalContext {
  /** ID del paciente (anonimizado) */
  patientId?: string;
  /** ID del médico */
  doctorId: string;
  /** Tipo de consulta médica */
  consultationType: 'diagnosis' | 'treatment' | 'drug-interaction' | 'risk-assessment' | 'general';
  /** Especialidad médica */
  specialty?: string;
  /** Nivel de urgencia */
  urgencyLevel: 'routine' | 'urgent' | 'emergency';
  /** Indicadores de privacidad */
  privacyFlags: string[];
}

export interface AIResponse {
  /** ID de la solicitud original */
  requestId: string;
  /** Proveedor utilizado */
  provider: string;
  /** Modelo utilizado */
  model: string;
  /** Respuesta generada */
  response: string;
  /** Metadatos de la respuesta */
  metadata: ResponseMetadata;
  /** Estado de la respuesta */
  status: 'success' | 'error' | 'timeout' | 'rate_limited';
  /** Mensaje de error (si aplica) */
  error?: string;
}

export interface ResponseMetadata {
  /** Tiempo de procesamiento (ms) */
  processingTime: number;
  /** Tokens utilizados en el prompt */
  promptTokens: number;
  /** Tokens generados en la respuesta */
  responseTokens: number;
  /** Tokens totales */
  totalTokens: number;
  /** Costo de la solicitud (USD) */
  cost: number;
  /** Timestamp de la respuesta */
  timestamp: string;
  /** Nivel de confianza de la respuesta */
  confidence?: number;
}

export interface ProviderStats {
  /** Proveedor */
  provider: string;
  /** Número de requests hoy */
  requestsToday: number;
  /** Número de requests este mes */
  requestsThisMonth: number;
  /** Costo acumulado este mes */
  costThisMonth: number;
  /** Tiempo promedio de respuesta */
  averageResponseTime: number;
  /** Tasa de éxito */
  successRate: number;
  /** Última actualización */
  lastUpdated: string;
}

export interface MockServiceConfig {
  /** Habilitar servicios mock */
  enabled: boolean;
  /** Tiempo de simulación de respuesta (ms) */
  simulatedDelay: number;
  /** Tipo de respuestas mock */
  responseType: 'static' | 'dynamic' | 'realistic';
  /** Datos mock predefinidos */
  mockData?: Record<string, any>;
}

// Tipos para configuración de desarrollo offline
export interface OfflineConfig {
  /** Servicios mock habilitados */
  mockServices: MockServiceConfig;
  /** Base de datos local para desarrollo */
  localDatabase?: {
    enabled: boolean;
    path: string;
  };
  /** Logs de desarrollo */
  developmentLogs?: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
  };
}

// Enums para facilitar el uso
export enum ProviderType {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GOOGLE = 'google',
  COHERE = 'cohere',
  AZURE = 'azure',
  AWS = 'aws',
  MOCK = 'mock'
}

export enum ModelCapability {
  TEXT_GENERATION = 'text-generation',
  CODE_GENERATION = 'code-generation',
  MEDICAL_ANALYSIS = 'medical-analysis',
  TRANSLATION = 'translation',
  SUMMARIZATION = 'summarization',
  CLASSIFICATION = 'classification'
}
