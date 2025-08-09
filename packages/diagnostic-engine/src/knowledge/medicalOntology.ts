export interface OntologyCondition { id: string; name: string; basePrior: number; group?: string; redFlags?: string[]; }
export const ONTOLOGY_CONDITIONS: OntologyCondition[] = [
  // Cardiovascular
  { id: 'cond:mi', name: 'Infarto agudo de miocardio', basePrior: 0.0008, group: 'cardio', redFlags: ['dolor torácico intenso','diaforesis','disnea'] },
  { id: 'cond:angina', name: 'Angina estable', basePrior: 0.02, group: 'cardio' },
  { id: 'cond:hypertension', name: 'Hipertensión arterial', basePrior: 0.25, group: 'cardio' },
  { id: 'cond:arrhythmia', name: 'Arritmia cardíaca', basePrior: 0.03, group: 'cardio', redFlags: ['palpitaciones severas','síncope'] },
  
  // Gastrointestinal
  { id: 'cond:gerd', name: 'ERGE', basePrior: 0.05, group: 'gastro' },
  { id: 'cond:gastritis', name: 'Gastritis', basePrior: 0.08, group: 'gastro' },
  { id: 'cond:ibs', name: 'Síndrome del intestino irritable', basePrior: 0.10, group: 'gastro' },
  { id: 'cond:gastroenteritis', name: 'Gastroenteritis aguda', basePrior: 0.15, group: 'gastro' },
  
  // Respiratory
  { id: 'cond:asthma', name: 'Asma', basePrior: 0.06, group: 'respiratory', redFlags: ['sibilancias severas','disnea reposo'] },
  { id: 'cond:bronchitis', name: 'Bronquitis aguda', basePrior: 0.12, group: 'respiratory' },
  { id: 'cond:pneumonia', name: 'Neumonía', basePrior: 0.02, group: 'respiratory', redFlags: ['fiebre alta','disnea severa','dolor pleurítico'] },
  { id: 'cond:allergic_rhinitis', name: 'Rinitis alérgica', basePrior: 0.20, group: 'respiratory' },
  { id: 'cond:covid19', name: 'COVID-19', basePrior: 0.05, group: 'respiratory', redFlags: ['disnea','pérdida del olfato','fiebre persistente'] },
  
  // Musculoskeletal
  { id: 'cond:costocondritis', name: 'Costocondritis', basePrior: 0.01, group: 'musculoskeletal' },
  { id: 'cond:lower_back_pain', name: 'Lumbalgia', basePrior: 0.15, group: 'musculoskeletal' },
  { id: 'cond:arthritis', name: 'Artritis', basePrior: 0.08, group: 'musculoskeletal' },
  { id: 'cond:muscle_strain', name: 'Distensión muscular', basePrior: 0.10, group: 'musculoskeletal' },
  
  // Neurological
  { id: 'cond:migraine', name: 'Migraña', basePrior: 0.12, group: 'neurological' },
  { id: 'cond:tension_headache', name: 'Cefalea tensional', basePrior: 0.20, group: 'neurological' },
  { id: 'cond:vertigo', name: 'Vértigo', basePrior: 0.04, group: 'neurological' },
  { id: 'cond:anxiety', name: 'Trastorno de ansiedad', basePrior: 0.18, group: 'neurological' },
  
  // Infectious
  { id: 'cond:flu', name: 'Influenza', basePrior: 0.08, group: 'infectious', redFlags: ['fiebre alta','mialgias severas'] },
  { id: 'cond:strep_throat', name: 'Faringitis estreptocócica', basePrior: 0.05, group: 'infectious' },
  { id: 'cond:uti', name: 'Infección del tracto urinario', basePrior: 0.08, group: 'infectious' },
  { id: 'cond:common_cold', name: 'Resfriado común', basePrior: 0.25, group: 'infectious' },
  
  // Endocrine
  { id: 'cond:diabetes', name: 'Diabetes mellitus', basePrior: 0.08, group: 'endocrine' },
  { id: 'cond:thyroid', name: 'Trastorno tiroideo', basePrior: 0.05, group: 'endocrine' }
];
export interface SymptomEvidenceTemplate { id: string; label: string; lrPos: number; lrNeg: number; linkedConditions: string[]; }
export const EVIDENCE_TEMPLATES: SymptomEvidenceTemplate[] = [
  // Cardiovascular symptoms
  { id: 'sym:chest_pain_exertional', label: 'Dolor torácico con el esfuerzo', lrPos: 3.0, lrNeg: 0.5, linkedConditions: ['cond:angina','cond:mi'] },
  { id: 'sym:chest_pain_burning', label: 'Dolor torácico tipo ardor', lrPos: 2.5, lrNeg: 0.7, linkedConditions: ['cond:gerd'] },
  { id: 'sym:palpitations', label: 'Palpitaciones', lrPos: 4.0, lrNeg: 0.6, linkedConditions: ['cond:arrhythmia','cond:anxiety'] },
  { id: 'sym:diaphoresis', label: 'Diaforesis', lrPos: 2.0, lrNeg: 0.9, linkedConditions: ['cond:mi','cond:anxiety'] },
  { id: 'sym:high_bp', label: 'Presión arterial elevada', lrPos: 8.0, lrNeg: 0.3, linkedConditions: ['cond:hypertension'] },
  
  // Gastrointestinal symptoms
  { id: 'sym:abdominal_pain', label: 'Dolor abdominal', lrPos: 3.5, lrNeg: 0.5, linkedConditions: ['cond:gastritis','cond:ibs','cond:gastroenteritis'] },
  { id: 'sym:nausea', label: 'Náuseas', lrPos: 2.5, lrNeg: 0.7, linkedConditions: ['cond:gastritis','cond:gastroenteritis','cond:migraine'] },
  { id: 'sym:vomiting', label: 'Vómitos', lrPos: 3.0, lrNeg: 0.6, linkedConditions: ['cond:gastroenteritis','cond:migraine'] },
  { id: 'sym:diarrhea', label: 'Diarrea', lrPos: 6.0, lrNeg: 0.3, linkedConditions: ['cond:gastroenteritis','cond:ibs'] },
  { id: 'sym:heartburn', label: 'Acidez estomacal', lrPos: 7.0, lrNeg: 0.2, linkedConditions: ['cond:gerd','cond:gastritis'] },
  
  // Respiratory symptoms
  { id: 'sym:cough', label: 'Tos', lrPos: 2.0, lrNeg: 0.7, linkedConditions: ['cond:bronchitis','cond:pneumonia','cond:common_cold','cond:covid19','cond:flu'] },
  { id: 'sym:productive_cough', label: 'Tos productiva', lrPos: 4.0, lrNeg: 0.5, linkedConditions: ['cond:bronchitis','cond:pneumonia'] },
  { id: 'sym:wheezing', label: 'Sibilancias audibles', lrPos: 5.0, lrNeg: 0.4, linkedConditions: ['cond:asthma','cond:bronchitis'] },
  { id: 'sym:dyspnea_exertion', label: 'Disnea con el ejercicio', lrPos: 3.5, lrNeg: 0.6, linkedConditions: ['cond:asthma','cond:angina','cond:pneumonia'] },
  { id: 'sym:nasal_congestion', label: 'Congestión nasal', lrPos: 3.0, lrNeg: 0.5, linkedConditions: ['cond:allergic_rhinitis','cond:common_cold','cond:flu'] },
  { id: 'sym:anosmia', label: 'Pérdida del olfato', lrPos: 7.0, lrNeg: 0.2, linkedConditions: ['cond:covid19'] },
  
  // Musculoskeletal symptoms
  { id: 'sym:reproducible_pain_palpation', label: 'Dolor reproducible a la palpación', lrPos: 4.0, lrNeg: 0.8, linkedConditions: ['cond:costocondritis','cond:muscle_strain'] },
  { id: 'sym:back_pain', label: 'Dolor de espalda', lrPos: 5.0, lrNeg: 0.4, linkedConditions: ['cond:lower_back_pain','cond:muscle_strain'] },
  { id: 'sym:joint_pain', label: 'Dolor articular', lrPos: 6.0, lrNeg: 0.3, linkedConditions: ['cond:arthritis','cond:flu'] },
  { id: 'sym:morning_stiffness', label: 'Rigidez matutina', lrPos: 7.0, lrNeg: 0.3, linkedConditions: ['cond:arthritis'] },
  
  // Neurological symptoms
  { id: 'sym:headache', label: 'Dolor de cabeza', lrPos: 2.0, lrNeg: 0.6, linkedConditions: ['cond:migraine','cond:tension_headache','cond:flu'] },
  { id: 'sym:unilateral_headache', label: 'Dolor de cabeza unilateral', lrPos: 6.0, lrNeg: 0.3, linkedConditions: ['cond:migraine'] },
  { id: 'sym:photophobia', label: 'Fotofobia', lrPos: 5.0, lrNeg: 0.4, linkedConditions: ['cond:migraine'] },
  { id: 'sym:dizziness', label: 'Mareos', lrPos: 4.0, lrNeg: 0.5, linkedConditions: ['cond:vertigo','cond:anxiety'] },
  { id: 'sym:anxiety_symptoms', label: 'Síntomas de ansiedad', lrPos: 8.0, lrNeg: 0.2, linkedConditions: ['cond:anxiety'] },
  
  // Infectious symptoms
  { id: 'sym:fever', label: 'Fiebre', lrPos: 3.0, lrNeg: 0.5, linkedConditions: ['cond:flu','cond:pneumonia','cond:strep_throat','cond:uti','cond:covid19'] },
  { id: 'sym:sore_throat', label: 'Dolor de garganta', lrPos: 4.0, lrNeg: 0.4, linkedConditions: ['cond:strep_throat','cond:common_cold','cond:flu'] },
  { id: 'sym:myalgia', label: 'Mialgias', lrPos: 3.5, lrNeg: 0.5, linkedConditions: ['cond:flu','cond:covid19'] },
  { id: 'sym:dysuria', label: 'Disuria', lrPos: 8.0, lrNeg: 0.2, linkedConditions: ['cond:uti'] },
  { id: 'sym:urinary_frequency', label: 'Frecuencia urinaria', lrPos: 6.0, lrNeg: 0.3, linkedConditions: ['cond:uti','cond:diabetes'] },
  
  // Endocrine symptoms
  { id: 'sym:polyuria', label: 'Poliuria', lrPos: 6.0, lrNeg: 0.3, linkedConditions: ['cond:diabetes'] },
  { id: 'sym:polydipsia', label: 'Polidipsia', lrPos: 6.0, lrNeg: 0.3, linkedConditions: ['cond:diabetes'] },
  { id: 'sym:weight_changes', label: 'Cambios de peso', lrPos: 4.0, lrNeg: 0.5, linkedConditions: ['cond:thyroid','cond:diabetes'] },
  
  // Treatment responses
  { id: 'sym:beta_response', label: 'Mejoría tras broncodilatador beta-agonista', lrPos: 8.0, lrNeg: 0.5, linkedConditions: ['cond:asthma'] },
  { id: 'sym:antacid_response', label: 'Mejoría con antiácidos', lrPos: 7.0, lrNeg: 0.3, linkedConditions: ['cond:gerd','cond:gastritis'] },
  { id: 'sym:nsaid_response', label: 'Mejoría con AINEs', lrPos: 5.0, lrNeg: 0.4, linkedConditions: ['cond:muscle_strain','cond:arthritis','cond:tension_headache'] }
];
export function getBasePrior(conditionId: string): number | undefined { return ONTOLOGY_CONDITIONS.find(c=>c.id===conditionId)?.basePrior; }
