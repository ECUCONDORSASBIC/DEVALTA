import { z } from 'zod';

export interface PatientContext { age?: number; sex?: 'male'|'female'|'other'; symptoms?: string[]; vitals?: Record<string, number|string>; riskFactors?: string[]; metadata?: Record<string, any>; }
export interface Hypothesis { id: string; name: string; prior: number; probability: number; category?: string; rationale?: string; tags?: string[]; }
export interface Evidence { id: string; label: string; present: boolean | null; likelihoodRatioPositive?: number; likelihoodRatioNegative?: number; weight?: number; source?: string; }
export interface QuestionOption { value: string; label: string; mappedEvidence?: Partial<Evidence>; }
export interface Question { id: string; text: string; type: 'boolean'|'single'|'multi'|'numeric'|'text'; options?: QuestionOption[]; targetEvidenceId?: string; expectedValueOfInformation?: number; rationale?: string; }
export interface Answer { questionId: string; value: any; timestamp: string; interpretedEvidence?: Evidence[]; }
export interface SessionState { id: string; context: PatientContext; hypotheses: Hypothesis[]; evidences: Record<string, Evidence>; askedQuestions: Question[]; answers: Answer[]; createdAt: string; updatedAt: string; terminated?: boolean; terminationReason?: string; history: Array<{ step: number; action: string; delta?: any; timestamp: string; }>; }
export const PatientContextSchema = z.object({
	age: z.number().optional(),
	sex: z.enum(['male','female','other']).optional(),
	symptoms: z.array(z.string()).optional(),
	vitals: z.record(z.string(), z.union([z.number(), z.string()])).optional(),
	riskFactors: z.array(z.string()).optional(),
	metadata: z.record(z.string(), z.any()).optional()
});
export interface Report { sessionId: string; generatedAt: string; topHypotheses: Array<Pick<Hypothesis,'id'|'name'|'probability'|'rationale'>>; allHypotheses: Hypothesis[]; answeredQuestions: Answer[]; remainingUncertainty: number; warnings: string[]; notes: string[]; disclaimer: string; }
