/**
 * 🧪 LAB RESULTS TYPES
 * PROACTIVO compliant types for laboratory results management
 * Max lines: 250 (PROACTIVO standard)
 */

export enum TestStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected'
}

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  STAT = 'stat'
}

export enum TestCategory {
  HEMATOLOGY = 'hematology',
  BIOCHEMISTRY = 'biochemistry',
  MICROBIOLOGY = 'microbiology',
  IMMUNOLOGY = 'immunology',
  PATHOLOGY = 'pathology',
  MOLECULAR = 'molecular',
  GENETICS = 'genetics'
}

export enum AccessLevel {
  PUBLIC = 'public',
  RESTRICTED = 'restricted',
  CONFIDENTIAL = 'confidential'
}

export interface LabTestValue {
  parameter: string;
  value: string | number;
  unit?: string;
  referenceRange?: {
    min?: number;
    max?: number;
    text?: string;
  };
  flag?: 'normal' | 'high' | 'low' | 'critical';
  method?: string;
  notes?: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  doctorId: string;
  companyId: string;
  orderNumber: string;
  testName: string;
  category: TestCategory;
  status: TestStatus;
  priority: Priority;
  accessLevel: AccessLevel;
  orderedAt: string;
  sampleCollectedAt?: string;
  receivedAt?: string;
  reportedAt?: string;
  results?: LabTestValue[];
  interpretation?: string;
  clinicalNotes?: string;
  technician?: {
    id: string;
    name: string;
    license: string;
  };
  laboratory?: {
    id: string;
    name: string;
    address: string;
    accreditation: string;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy?: string;
    version: number;
  };
}

export interface CreateLabResultRequest {
  patientId: string;
  orderNumber: string;
  testName: string;
  category: TestCategory;
  priority?: Priority;
  accessLevel?: AccessLevel;
  sampleCollectedAt?: string;
  clinicalNotes?: string;
  laboratoryId?: string;
}

export interface UpdateLabResultRequest {
  id: string;
  status?: TestStatus;
  results?: LabTestValue[];
  interpretation?: string;
  clinicalNotes?: string;
  technicianId?: string;
  reportedAt?: string;
}

export interface LabResultQueryFilters {
  patientId?: string;
  doctorId?: string;
  companyId?: string;
  category?: TestCategory;
  status?: TestStatus;
  priority?: Priority;
  dateFrom?: string;
  dateTo?: string;
  testName?: string;
  orderNumber?: string;
  limit?: number;
  offset?: number;
}

export interface LabResultResponse {
  success: boolean;
  data?: LabResult | LabResult[];
  total?: number;
  error?: string;
  code?: string;
  details?: any[];
}

export interface LabResultExecutionContext {
  userId: string;
  role: string;
  companyId?: string;
  permissions: string[];
  startTime: Date;
  endTime?: Date;
  requestId?: string;
}

// Custom Error Classes
export class LabResultError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'LabResultError';
  }
}

export class LabResultNotFoundError extends LabResultError {
  constructor(id: string) {
    super(`Lab result not found: ${id}`, 'LAB_RESULT_NOT_FOUND', 404);
  }
}

export class LabResultValidationError extends LabResultError {
  constructor(message: string, details?: any[]) {
    super(message, 'VALIDATION_ERROR', 400);
    this.details = details;
  }
  
  public details?: any[];
}

export class LabResultPermissionError extends LabResultError {
  constructor(action: string) {
    super(`Insufficient permissions for: ${action}`, 'PERMISSION_DENIED', 403);
  }
}

export interface LabResultMetrics {
  totalTests: number;
  pendingTests: number;
  completedTests: number;
  averageProcessingTime: number;
  testsByCategory: Record<TestCategory, number>;
  testsByPriority: Record<Priority, number>;
}

export interface LabResultAuditLog {
  id: string;
  labResultId: string;
  action: 'created' | 'updated' | 'deleted' | 'viewed';
  userId: string;
  timestamp: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: Record<string, any>;
}

// Type Guards
export function isValidTestStatus(status: string): status is TestStatus {
  return Object.values(TestStatus).includes(status as TestStatus);
}

export function isValidPriority(priority: string): priority is Priority {
  return Object.values(Priority).includes(priority as Priority);
}

export function isValidTestCategory(category: string): category is TestCategory {
  return Object.values(TestCategory).includes(category as TestCategory);
}

export function isValidAccessLevel(level: string): level is AccessLevel {
  return Object.values(AccessLevel).includes(level as AccessLevel);
}

// Helper Types
export type LabResultCreateFields = Omit<LabResult, 'id' | 'doctorId' | 'companyId' | 'metadata'>;
export type LabResultUpdateFields = Partial<Pick<LabResult, 'status' | 'results' | 'interpretation' | 'clinicalNotes'>>;
export type LabResultPublicFields = Omit<LabResult, 'metadata' | 'accessLevel'>;
