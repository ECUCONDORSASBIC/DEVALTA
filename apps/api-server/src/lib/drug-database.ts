/**
 * 💊 Drug Interactions Database
 * Base de datos de interacciones medicamentosas
 */

export const drugInteractions = {
  'warfarina': {
    interactions: [
      { drug: 'aspirina', severity: 'high', mechanism: 'increased bleeding risk' },
      { drug: 'amoxicilina', severity: 'moderate', mechanism: 'enhanced anticoagulation' },
      { drug: 'paracetamol', severity: 'low', mechanism: 'minimal interaction' },
    ],
    contraindications: ['bleeding disorders', 'peptic ulcer'],
    monitoring: ['INR levels', 'bleeding signs'],
  },
  'aspirina': {
    interactions: [
      { drug: 'warfarina', severity: 'high', mechanism: 'increased bleeding risk' },
      { drug: 'ibuprofeno', severity: 'moderate', mechanism: 'increased GI toxicity' },
      { drug: 'metformina', severity: 'low', mechanism: 'minimal interaction' },
    ],
    contraindications: ['peptic ulcer', 'bleeding disorders'],
    monitoring: ['GI symptoms', 'bleeding signs'],
  },
  'metformina': {
    interactions: [
      { drug: 'alcohol', severity: 'moderate', mechanism: 'lactic acidosis risk' },
      { drug: 'contrast', severity: 'high', mechanism: 'kidney function compromise' },
      { drug: 'aspirina', severity: 'low', mechanism: 'minimal interaction' },
    ],
    contraindications: ['kidney disease', 'liver disease'],
    monitoring: ['kidney function', 'lactate levels'],
  },
  'ibuprofeno': {
    interactions: [
      { drug: 'aspirina', severity: 'moderate', mechanism: 'increased GI toxicity' },
      { drug: 'warfarina', severity: 'moderate', mechanism: 'increased bleeding risk' },
      { drug: 'lisinopril', severity: 'moderate', mechanism: 'reduced antihypertensive effect' },
    ],
    contraindications: ['peptic ulcer', 'heart failure'],
    monitoring: ['GI symptoms', 'kidney function'],
  }
};

export const severityLevels = {
  'low': {
    color: 'green',
    description: 'Interacción menor - monitoreo rutinario',
    action: 'Continuar con precaución'
  },
  'moderate': {
    color: 'yellow', 
    description: 'Interacción moderada - requiere monitoreo',
    action: 'Ajustar dosis o monitorear estrechamente'
  },
  'high': {
    color: 'red',
    description: 'Interacción severa - evitar combinación',
    action: 'Buscar alternativas terapéuticas'
  }
};
