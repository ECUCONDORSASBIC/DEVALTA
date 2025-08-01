import { Router } from 'express';

const decisionSupportEngine = Router();

// Mock data for drug interactions
const drugInteractions: Record<string, string[]> = {
  'Aspirin': ['Warfarin'],
  'Ibuprofen': ['Aspirin'],
};

// Basic AI-powered clinical decision support engine
const getDrugInteractions = (drugName: string): string[] => {
  return drugInteractions[drugName] || [];
};

decisionSupportEngine.get('/interactions/:drugName', (req, res) => {
  const { drugName } = req.params;
  const interactions = getDrugInteractions(drugName);
  res.json({ interactions });
});

export default decisionSupportEngine;

