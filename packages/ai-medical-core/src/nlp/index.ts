// Módulo de procesamiento de lenguaje natural médico
export interface NLPConfig {
  language: string;
  medicalTerms: string[];
}

export class MedicalNLP {
  private config: NLPConfig;

  constructor(config: NLPConfig) {
    this.config = config;
  }

  async extractMedicalTerms(text: string): Promise<string[]> {
    // Implementación básica de extracción de términos médicos
    return ['término1', 'término2'];
  }
}

export default MedicalNLP; 