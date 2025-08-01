import { describe, it, expect, beforeEach } from 'vitest';
import { ClinicalDecisionEngine } from './clinical-decision-engine';
import { ClinicalContext, getAgeRange } from './types';

describe('ClinicalDecisionEngine', () => {
  let engine: ClinicalDecisionEngine;

  beforeEach(() => {
    engine = new ClinicalDecisionEngine();
  });

  describe('getAdaptiveQuestions', () => {
    it('should return questions for pediatric respiratory symptoms', () => {
      const context: ClinicalContext = {
        age: 5,
        ageRange: '1-5',
        gender: 'male',
        currentSymptom: {
          bodyPart: 'chest',
          specific: 'Pecho'
        },
        riskFactors: [],
        medicalHistory: []
      };

      const questions = engine.getAdaptiveQuestions(context);
      
      expect(questions).toBeDefined();
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.some(q => q.id === 'fever-duration')).toBe(true);
    });

    it('should return questions for adult cardiovascular symptoms', () => {
      const context: ClinicalContext = {
        age: 45,
        ageRange: '41-65',
        gender: 'male',
        currentSymptom: {
          bodyPart: 'chest',
          specific: 'Pecho'
        },
        riskFactors: ['hypertension', 'smoking'],
        medicalHistory: []
      };

      const questions = engine.getAdaptiveQuestions(context);
      
      expect(questions).toBeDefined();
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.some(q => q.id === 'pain-duration')).toBe(true);
    });

    it('should not return questions when no rules match', () => {
      const context: ClinicalContext = {
        age: 30,
        ageRange: '18-40',
        gender: 'female',
        currentSymptom: {
          bodyPart: 'unknown',
          specific: 'Desconocido'
        },
        riskFactors: [],
        medicalHistory: []
      };

      const questions = engine.getAdaptiveQuestions(context);
      
      expect(questions).toBeDefined();
      expect(questions.length).toBe(0);
    });
  });

  describe('getSuggestedDx', () => {
    it('should return diagnoses sorted by probability', () => {
      const context: ClinicalContext = {
        age: 8,
        ageRange: '6-12',
        gender: 'female',
        currentSymptom: {
          bodyPart: 'abdomen',
          specific: 'Abdomen'
        },
        riskFactors: [],
        medicalHistory: []
      };

      const diagnoses = engine.getSuggestedDx(context);
      
      expect(diagnoses).toBeDefined();
      expect(diagnoses.length).toBeGreaterThan(0);
      
      // Check if sorted by probability (descending)
      for (let i = 1; i < diagnoses.length; i++) {
        expect(diagnoses[i-1].probability).toBeGreaterThanOrEqual(diagnoses[i].probability);
      }
    });

    it('should not include MI diagnosis for 15-year-old with arm pain', () => {
      const context: ClinicalContext = {
        age: 15,
        ageRange: '13-17',
        gender: 'male',
        currentSymptom: {
          bodyPart: 'leftArm',
          side: 'left',
          specific: 'Brazo Izquierdo'
        },
        riskFactors: [],
        medicalHistory: []
      };

      const diagnoses = engine.getSuggestedDx(context);
      
      // Should not include myocardial infarction (I21.9) for a 15-year-old
      expect(diagnoses.some(dx => dx.code === 'I21.9')).toBe(false);
      // Should not include angina (I20.0) for a pediatric patient
      expect(diagnoses.some(dx => dx.code === 'I20.0')).toBe(false);
    });

    it('should exclude adult cardiovascular conditions for all pediatric patients', () => {
      // Test multiple pediatric age ranges
      const pediatricAges = [
        { age: 8, ageRange: '6-12' as const },
        { age: 14, ageRange: '13-17' as const },
        { age: 3, ageRange: '1-5' as const }
      ];

      pediatricAges.forEach(({ age, ageRange }) => {
        const context: ClinicalContext = {
          age,
          ageRange,
          gender: 'male',
          currentSymptom: {
            bodyPart: 'chest',
            specific: 'Pecho'
          },
          riskFactors: [],
          medicalHistory: []
        };

        const diagnoses = engine.getSuggestedDx(context);
        
        // Pediatric patients should not get adult cardiovascular diagnoses
        expect(diagnoses.some(dx => dx.code === 'I21.9')).toBe(false);
        expect(diagnoses.some(dx => dx.code === 'I20.0')).toBe(false);
      });
    });

    it('should suggest age-appropriate diagnoses for ear pain', () => {
      const pediatricContext: ClinicalContext = {
        age: 4,
        ageRange: '1-5',
        gender: 'female',
        currentSymptom: {
          bodyPart: 'ear',
          side: 'right',
          specific: 'Oído derecho'
        },
        riskFactors: [],
        medicalHistory: []
      };

      const diagnoses = engine.getSuggestedDx(pediatricContext);
      
      // Should suggest otitis media for young children
      const otitisMedia = diagnoses.find(dx => dx.code === 'H66.9');
      expect(otitisMedia).toBeDefined();
      expect(otitisMedia?.urgency).toBe('medium');
    });

    it('should handle severity levels appropriately', () => {
      const severeContext: ClinicalContext = {
        age: 10,
        ageRange: '6-12',
        gender: 'male',
        currentSymptom: {
          bodyPart: 'abdomen',
          specific: 'Abdomen'
        },
        severity: 'severe',
        riskFactors: [],
        medicalHistory: []
      };

      const diagnoses = engine.getSuggestedDx(severeContext);
      
      // Severe abdominal pain should include critical diagnoses like appendicitis
      const appendicitis = diagnoses.find(dx => dx.code === 'K35.8');
      expect(appendicitis).toBeDefined();
      expect(appendicitis?.urgency).toBe('critical');
    });

    it('should include critical urgency for appendicitis', () => {
      const context: ClinicalContext = {
        age: 10,
        ageRange: '6-12',
        gender: 'male',
        currentSymptom: {
          bodyPart: 'abdomen',
          specific: 'Abdomen'
        },
        riskFactors: [],
        medicalHistory: []
      };

      const diagnoses = engine.getSuggestedDx(context);
      const appendicitis = diagnoses.find(dx => dx.code === 'K35.8');
      
      expect(appendicitis).toBeDefined();
      expect(appendicitis?.urgency).toBe('critical');
    });
  });
});

describe('Clinical Validation Cases', () => {
  let engine: ClinicalDecisionEngine;

  beforeEach(() => {
    engine = new ClinicalDecisionEngine();
  });

  describe('Pediatric-specific validations', () => {
    it('should not suggest adult diseases for pediatric chest pain', () => {
      const context: ClinicalContext = {
        age: 15,
        ageRange: '13-17',
        gender: 'male',
        currentSymptom: {
          bodyPart: 'chest',
          specific: 'Pecho'
        },
        riskFactors: [],
        medicalHistory: []
      };

      const diagnoses = engine.getSuggestedDx(context);
      
      // No cardiovascular diseases typical of adults
      expect(diagnoses.some(dx => dx.code === 'I21.9')).toBe(false); // No MI
      expect(diagnoses.some(dx => dx.code === 'I20.0')).toBe(false); // No angina
      expect(diagnoses.some(dx => dx.code === 'I25.1')).toBe(false); // No coronary disease
    });

    it('should consider musculoskeletal causes for adolescent arm pain', () => {
      const context: ClinicalContext = {
        age: 15,
        ageRange: '13-17',
        gender: 'male',
        currentSymptom: {
          bodyPart: 'arm',
          side: 'left',
          specific: 'Brazo izquierdo'
        },
        riskFactors: [],
        medicalHistory: []
      };

      const diagnoses = engine.getSuggestedDx(context);
      
      // Should not include cardiac causes
      expect(diagnoses.every(dx => !dx.code.startsWith('I2'))).toBe(true);
    });

    it('should prioritize common pediatric conditions', () => {
      const context: ClinicalContext = {
        age: 3,
        ageRange: '1-5',
        gender: 'female',
        currentSymptom: {
          bodyPart: 'ear',
          specific: 'Oído'
        },
        riskFactors: [],
        medicalHistory: ['recent_cold']
      };

      const diagnoses = engine.getSuggestedDx(context);
      const otitisMedia = diagnoses.find(dx => dx.code === 'H66.9');
      
      expect(otitisMedia).toBeDefined();
      expect(otitisMedia?.probability).toBeGreaterThan(0.7);
    });
  });

  describe('Risk factor considerations', () => {
    it('should not suggest cardiac conditions without risk factors in young adults', () => {
      const context: ClinicalContext = {
        age: 25,
        ageRange: '18-40',
        gender: 'male',
        currentSymptom: {
          bodyPart: 'chest',
          specific: 'Pecho'
        },
        riskFactors: [], // No risk factors
        medicalHistory: []
      };

      const diagnoses = engine.getSuggestedDx(context);
      
      // Without risk factors, cardiac conditions should have lower probability
      const cardiacDx = diagnoses.filter(dx => dx.code.startsWith('I2'));
      cardiacDx.forEach(dx => {
        expect(dx.probability).toBeLessThan(0.3);
      });
    });

    it('should consider risk factors for adult cardiovascular assessment', () => {
      const context: ClinicalContext = {
        age: 55,
        ageRange: '41-65',
        gender: 'male',
        currentSymptom: {
          bodyPart: 'chest',
          specific: 'Pecho'
        },
        riskFactors: ['hypertension', 'smoking', 'diabetes', 'high_cholesterol'],
        medicalHistory: ['previous_mi']
      };

      const diagnoses = engine.getSuggestedDx(context);
      const cardiacDx = diagnoses.filter(dx => dx.code.startsWith('I'));
      
      // With multiple risk factors, cardiac conditions should be prioritized
      expect(cardiacDx.length).toBeGreaterThan(0);
      expect(cardiacDx[0].urgency).toBe('critical');
    });
  });

  describe('Emergency conditions identification', () => {
    it('should flag appendicitis as critical in appropriate age groups', () => {
      const context: ClinicalContext = {
        age: 12,
        ageRange: '6-12',
        gender: 'male',
        currentSymptom: {
          bodyPart: 'abdomen',
          specific: 'Fosa ilíaca derecha'
        },
        severity: 'severe',
        riskFactors: [],
        medicalHistory: []
      };

      const diagnoses = engine.getSuggestedDx(context);
      const appendicitis = diagnoses.find(dx => dx.code === 'K35.8');
      
      expect(appendicitis).toBeDefined();
      expect(appendicitis?.urgency).toBe('critical');
      expect(appendicitis?.reasoning).toContain('Requiere evaluación urgente');
    });

    it('should identify potential meningitis in pediatric patients', () => {
      const context: ClinicalContext = {
        age: 2,
        ageRange: '1-5',
        gender: 'female',
        currentSymptom: {
          bodyPart: 'head',
          specific: 'Cabeza'
        },
        severity: 'severe',
        riskFactors: ['fever', 'neck_stiffness'],
        medicalHistory: []
      };

      const diagnoses = engine.getSuggestedDx(context);
      
      // Should prioritize critical conditions
      const criticalDx = diagnoses.filter(dx => dx.urgency === 'critical');
      expect(criticalDx.length).toBeGreaterThan(0);
    });
  });
});

describe('Age Range Utilities', () => {
  it('should correctly categorize age ranges', () => {
    expect(getAgeRange(0.5)).toBe('<1');
    expect(getAgeRange(3)).toBe('1-5');
    expect(getAgeRange(10)).toBe('6-12');
    expect(getAgeRange(15)).toBe('13-17');
    expect(getAgeRange(25)).toBe('18-40');
    expect(getAgeRange(50)).toBe('41-65');
    expect(getAgeRange(70)).toBe('>65');
  });
});
