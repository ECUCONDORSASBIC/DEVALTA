// Core de inteligencia artificial médica para Altamedica
export * from './chatbot';
export * from './diagnostic';
export * from './nlp';

// Configuración principal del core de IA
export interface AIMedicalCoreConfig {
  openaiApiKey?: string;
  pineconeApiKey?: string;
  redisUrl?: string;
  modelName?: string;
  temperature?: number;
}

// Clase principal del core de IA médica
export class AIMedicalCore {
  private config: AIMedicalCoreConfig;

  constructor(config: AIMedicalCoreConfig = {}) {
    this.config = {
      modelName: 'gpt-4',
      temperature: 0.7,
      ...config
    };
  }

  // Método para inicializar el core
  async initialize(): Promise<void> {
    console.log('AIMedicalCore inicializado con configuración:', this.config);
  }

  // Método para obtener la configuración
  getConfig(): AIMedicalCoreConfig {
    return { ...this.config };
  }
}

// Exportar la instancia por defecto
export default AIMedicalCore; 