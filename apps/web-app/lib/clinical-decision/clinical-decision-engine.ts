import { ClinicalContext, ClinicalRule, Question, DiagnosisSuggestion, AgeRange } from './types';
import pediatricRules from './rules/pediatric.json';
import adultRules from './rules/adult.json';

export class ClinicalDecisionEngine {
  private rules: ClinicalRule[];

  constructor() {
    // Merge all rules into a single array and convert to proper types
    this.rules = [...pediatricRules, ...adultRules] as ClinicalRule[];
  }

  public getAdaptiveQuestions(context: ClinicalContext): Question[] {
    const relevantQuestions: Question[] = [];
    for (const rule of this.rules) {
      if (this.matchConditions(rule.conditions, context)) {
        relevantQuestions.push(...(rule.questions || []));
      }
    }
    return relevantQuestions;
  }

  public getSuggestedDx(context: ClinicalContext): DiagnosisSuggestion[] {
    const suggestions: DiagnosisSuggestion[] = [];
    for (const rule of this.rules) {
      if (this.matchConditions(rule.conditions, context)) {
        suggestions.push(...(rule.diagnoses || []));
      }
    }
    // Sort suggestions by probability
    return suggestions.sort((a, b) => b.probability - a.probability);
  }

  private matchConditions(conditions: Partial<ClinicalRule['conditions']>, context: ClinicalContext): boolean {
    const { ageRange, gender, symptoms, riskFactors, severity } = conditions;
    
    // Age range matching
    if (ageRange && !ageRange.includes(context.ageRange)) return false;
    
    // Gender matching
    if (gender && !gender.includes(context.gender)) return false;
    
    // Symptom matching - check if any symptom matches the current symptom
    if (symptoms && context.currentSymptom) {
      const bodyPartLower = context.currentSymptom.bodyPart.toLowerCase();
      const hasMatchingSymptom = symptoms.some(symptom => {
        const symptomLower = symptom.toLowerCase();
        // Match if symptom is found in bodyPart or if they're related
        return bodyPartLower.includes(symptomLower) || 
               symptomLower.includes(bodyPartLower) ||
               this.areRelatedSymptoms(symptomLower, bodyPartLower);
      });
      if (!hasMatchingSymptom) return false;
    } else if (symptoms && !context.currentSymptom) {
      return false;
    }
    
    // Risk factors matching - all required risk factors must be present
    if (riskFactors && riskFactors.length > 0) {
      const hasAllRiskFactors = riskFactors.every(risk => 
        context.riskFactors.includes(risk)
      );
      if (!hasAllRiskFactors) return false;
    }
    
    // Severity matching
    if (severity && context.severity && !severity.includes(context.severity)) return false;

    return true;
  }

  private areRelatedSymptoms(symptom1: string, symptom2: string): boolean {
    const synonymMap: Record<string, string[]> = {
      'chest': ['pecho', 'torax', 'chest_pain'],
      'abdomen': ['barriga', 'estomago', 'abdominal_pain', 'belly'],
      'head': ['cabeza', 'cefalea', 'headache'],
      'ear': ['oido', 'oído', 'ear_pain'],
      'arm': ['brazo', 'leftarm', 'rightarm'],
      'cough': ['tos'],
      'fever': ['fiebre', 'temperatura'],
      'difficulty_breathing': ['disnea', 'shortness_of_breath']
    };

    // Check if symptoms are in the same synonym group
    for (const [key, synonyms] of Object.entries(synonymMap)) {
      const group = [key, ...synonyms];
      if (group.includes(symptom1) && group.includes(symptom2)) {
        return true;
      }
    }

    return false;
  }
}

// Example usage:
// const engine = new ClinicalDecisionEngine();
// const questions = engine.getAdaptiveQuestions({...});
// const suggestions = engine.getSuggestedDx({...});

