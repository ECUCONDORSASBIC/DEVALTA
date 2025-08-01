// packages/ai-medical-core/src/chatbot/safety-validator.ts
import { SafetyCheckResult } from './types';

export class SafetyValidator {
  private emergencyKeywords: Map<string, string>;
  private selfHarmKeywords: Set<string>;
  private violenceKeywords: Set<string>;
  private medicationAbuseKeywords: Set<string>;
  private highRiskConditions: Set<string>;

  constructor() {
    // Inicializar palabras clave de emergencia con contexto
    this.emergencyKeywords = new Map([
      // Español
      ['dolor de pecho', 'posible infarto'],
      ['dolor torácico', 'posible problema cardíaco'],
      ['no puedo respirar', 'emergencia respiratoria'],
      ['dificultad para respirar', 'problema respiratorio grave'],
      ['sangrado abundante', 'hemorragia'],
      ['hemorragia', 'sangrado severo'],
      ['desmayo', 'pérdida de consciencia'],
      ['convulsiones', 'crisis convulsiva'],
      ['dolor de cabeza severo', 'posible emergencia neurológica'],
      ['peor dolor de cabeza de mi vida', 'posible hemorragia cerebral'],
      ['visión borrosa repentina', 'emergencia oftalmológica'],
      ['no puedo mover', 'posible derrame cerebral'],
      ['parálisis', 'emergencia neurológica'],
      ['dolor abdominal severo', 'posible emergencia abdominal'],
      ['vómito con sangre', 'hemorragia digestiva'],
      ['orina con sangre', 'hematuria severa'],
      ['embarazada sangrando', 'emergencia obstétrica'],
      ['bebe no responde', 'emergencia pediátrica'],
      ['sobredosis', 'intoxicación aguda'],
      ['envenenamiento', 'intoxicación'],
      ['quemadura grave', 'lesión térmica severa'],
      ['fractura expuesta', 'trauma severo'],
      ['accidente grave', 'politrauma'],
      
      // Inglés
      ['chest pain', 'possible heart attack'],
      ['can\'t breathe', 'respiratory emergency'],
      ['severe bleeding', 'hemorrhage'],
      ['passed out', 'loss of consciousness'],
      ['seizure', 'convulsive crisis'],
      ['worst headache', 'possible brain hemorrhage'],
      ['sudden blindness', 'ophthalmologic emergency'],
      ['can\'t move', 'possible stroke'],
      ['severe abdominal pain', 'abdominal emergency'],
      ['vomiting blood', 'digestive hemorrhage'],
      ['pregnant bleeding', 'obstetric emergency'],
      ['baby not responding', 'pediatric emergency'],
      ['overdose', 'acute intoxication'],
      ['poisoning', 'intoxication'],
      ['severe burn', 'severe thermal injury'],
      ['compound fracture', 'severe trauma']
    ]);

    // Palabras clave de autolesión
    this.selfHarmKeywords = new Set([
      // Español
      'suicidarme', 'quitarme la vida', 'no quiero vivir', 'morir', 'cortarme',
      'lastimarme', 'hacerme daño', 'autolesión', 'no vale la pena vivir',
      'acabar con todo', 'despedirme', 'ya no puedo más', 'no hay salida',
      
      // Inglés
      'kill myself', 'end my life', 'don\'t want to live', 'hurt myself',
      'self harm', 'cut myself', 'not worth living', 'end it all',
      'say goodbye', 'can\'t go on', 'no way out'
    ]);

    // Palabras clave de violencia
    this.violenceKeywords = new Set([
      'lastimar a alguien', 'hacer daño a', 'matar a', 'golpear a',
      'hurt someone', 'kill someone', 'harm others', 'beat'
    ]);

    // Palabras clave de abuso de medicamentos
    this.medicationAbuseKeywords = new Set([
      'conseguir drogas', 'comprar medicamentos sin receta', 'falsificar receta',
      'mezclar medicamentos', 'dosis para drogarme', 'get high',
      'obtain drugs', 'buy meds without prescription', 'fake prescription',
      'mix medications', 'recreational dose'
    ]);

    // Condiciones médicas de alto riesgo
    this.highRiskConditions = new Set([
      'infarto', 'derrame', 'embolia', 'aneurisma', 'sepsis',
      'meningitis', 'apendicitis', 'pancreatitis aguda',
      'heart attack', 'stroke', 'embolism', 'aneurysm', 'sepsis'
    ]);
  }

  /**
   * Validar si un mensaje es seguro para procesar
   */
  async validateMessage(message: string): Promise<SafetyCheckResult> {
    const lowerMessage = message.toLowerCase();

    // Verificar emergencias médicas
    for (const [keyword, reason] of this.emergencyKeywords) {
      if (lowerMessage.includes(keyword)) {
        return {
          isSafe: false,
          reason: reason,
          category: 'emergency',
          suggestedAction: 'Busque atención médica de emergencia inmediatamente. Llame al 911 o diríjase al hospital más cercano.'
        };
      }
    }

    // Verificar autolesión
    for (const keyword of this.selfHarmKeywords) {
      if (lowerMessage.includes(keyword)) {
        return {
          isSafe: false,
          reason: 'Contenido relacionado con autolesión detectado',
          category: 'self_harm',
          suggestedAction: 'Si está en crisis, por favor contacte: Línea de Prevención del Suicidio: 988 (USA) o su línea local de crisis.'
        };
      }
    }

    // Verificar violencia
    for (const keyword of this.violenceKeywords) {
      if (lowerMessage.includes(keyword)) {
        return {
          isSafe: false,
          reason: 'Contenido violento detectado',
          category: 'violence',
          suggestedAction: 'Si siente impulsos violentos, busque ayuda profesional inmediata.'
        };
      }
    }

    // Verificar abuso de medicamentos
    for (const keyword of this.medicationAbuseKeywords) {
      if (lowerMessage.includes(keyword)) {
        return {
          isSafe: false,
          reason: 'Posible abuso de medicamentos',
          category: 'medication_abuse',
          suggestedAction: 'Para información sobre medicamentos, consulte a un médico o farmacéutico autorizado.'
        };
      }
    }

    // Análisis contextual más profundo usando patrones
    const contextualRisks = this.analyzeContextualRisks(lowerMessage);
    if (contextualRisks.hasRisk) {
      return contextualRisks;
    }

    // Mensaje seguro para procesar
    return {
      isSafe: true
    };
  }

  /**
   * Análisis contextual de riesgos usando patrones más complejos
   */
  private analyzeContextualRisks(message: string): SafetyCheckResult {
    // Patrones de emergencia con contexto
    const emergencyPatterns = [
      {
        pattern: /dolor.{0,20}(pecho|torax|coraz)/i,
        reason: 'Posible problema cardíaco',
        category: 'emergency' as const
      },
      {
        pattern: /no.{0,10}(respir|aire)/i,
        reason: 'Emergencia respiratoria',
        category: 'emergency' as const
      },
      {
        pattern: /(cabeza|cefalea).{0,20}(peor|severo|intenso)/i,
        reason: 'Posible emergencia neurológica',
        category: 'emergency' as const
      },
      {
        pattern: /embarazad.{0,20}(sangr|dolor)/i,
        reason: 'Emergencia obstétrica',
        category: 'emergency' as const
      },
      {
        pattern: /(bebe|niño|hijo).{0,20}(no responde|inconsciente|morado)/i,
        reason: 'Emergencia pediátrica',
        category: 'emergency' as const
      }
    ];

    // Verificar patrones de emergencia
    for (const { pattern, reason, category } of emergencyPatterns) {
      if (pattern.test(message)) {
        return {
          isSafe: false,
          reason,
          category,
          suggestedAction: 'Busque atención médica de emergencia inmediatamente.'
        };
      }
    }

    // Patrones de autolesión con contexto
    const selfHarmPatterns = [
      /no.{0,10}(quiero|puedo).{0,10}(vivir|seguir|más)/i,
      /(terminar|acabar).{0,10}(todo|vida)/i,
      /mejor.{0,10}(muerto|morir)/i
    ];

    for (const pattern of selfHarmPatterns) {
      if (pattern.test(message)) {
        return {
          isSafe: false,
          reason: 'Posibles pensamientos de autolesión detectados',
          category: 'self_harm',
          suggestedAction: 'Por favor, hable con alguien. Línea de crisis: 988 (USA) o contacte servicios locales de salud mental.'
        };
      }
    }

    // Si no se detectan riesgos
    return {
      isSafe: true
    };
  }

  /**
   * Verificar si una respuesta generada es segura
   */
  async validateResponse(response: string): Promise<boolean> {
    // Verificar que no se incluyan diagnósticos definitivos
    const diagnosticPhrases = [
      'usted tiene', 'you have', 'su diagnóstico es', 'your diagnosis is',
      'definitivamente es', 'definitely is', 'claramente tiene', 'clearly have'
    ];

    const lowerResponse = response.toLowerCase();
    for (const phrase of diagnosticPhrases) {
      if (lowerResponse.includes(phrase)) {
        // Verificar si va seguido de una condición médica
        const afterPhrase = lowerResponse.split(phrase)[1]?.substring(0, 50);
        if (afterPhrase && this.containsMedicalCondition(afterPhrase)) {
          return false;
        }
      }
    }

    // Verificar que no se prescriban medicamentos
    const prescriptionPhrases = [
      'tome', 'take', 'dosis de', 'dose of', 'mg de', 'mg of',
      'receto', 'prescribe', 'medicamento recomendado', 'recommended medication'
    ];

    for (const phrase of prescriptionPhrases) {
      if (lowerResponse.includes(phrase)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Verificar si un texto contiene una condición médica
   */
  private containsMedicalCondition(text: string): boolean {
    const medicalConditions = [
      'diabetes', 'hipertensión', 'hypertension', 'cáncer', 'cancer',
      'infarto', 'heart attack', 'derrame', 'stroke', 'neumonía', 'pneumonia',
      'tuberculosis', 'hepatitis', 'vih', 'hiv', 'sida', 'aids',
      'artritis', 'arthritis', 'asma', 'asthma', 'epilepsia', 'epilepsy'
    ];

    const lowerText = text.toLowerCase();
    return medicalConditions.some(condition => lowerText.includes(condition));
  }

  /**
   * Obtener nivel de urgencia basado en síntomas
   */
  getUrgencyLevel(symptoms: string[]): 'low' | 'medium' | 'high' | 'emergency' {
    const emergencySymptoms = [
      'dolor de pecho', 'chest pain', 'dificultad respiratoria', 'breathing difficulty',
      'pérdida de consciencia', 'loss of consciousness', 'convulsiones', 'seizures',
      'sangrado severo', 'severe bleeding', 'dolor de cabeza severo', 'severe headache'
    ];

    const highUrgencySymptoms = [
      'fiebre alta', 'high fever', 'dolor severo', 'severe pain',
      'vómitos persistentes', 'persistent vomiting', 'mareos severos', 'severe dizziness'
    ];

    const mediumUrgencySymptoms = [
      'fiebre', 'fever', 'dolor moderado', 'moderate pain',
      'náuseas', 'nausea', 'mareos', 'dizziness'
    ];

    // Convertir síntomas a minúsculas para comparación
    const lowerSymptoms = symptoms.map(s => s.toLowerCase());

    // Verificar emergencias
    if (lowerSymptoms.some(symptom => 
      emergencySymptoms.some(emergency => symptom.includes(emergency))
    )) {
      return 'emergency';
    }

    // Verificar alta urgencia
    if (lowerSymptoms.some(symptom => 
      highUrgencySymptoms.some(high => symptom.includes(high))
    )) {
      return 'high';
    }

    // Verificar urgencia media
    if (lowerSymptoms.some(symptom => 
      mediumUrgencySymptoms.some(medium => symptom.includes(medium))
    )) {
      return 'medium';
    }

    return 'low';
  }
}