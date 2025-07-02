/**
 * 🧪 LAB RESULTS SCHEMAS
 * PROACTIVO compliant validation schemas for laboratory results
 * Max lines: 250 (PROACTIVO standard)
 */

import {
    AccessLevel,
    Priority,
    TestCategory,
    TestStatus,
    isValidAccessLevel,
    isValidPriority,
    isValidTestCategory,
    isValidTestStatus
} from './types';

export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Validate lab test value structure
 */
export function validateLabTestValue(value: any): ValidationResult {
  const errors: string[] = [];

  if (!value || typeof value !== 'object') {
    errors.push('Lab test value must be an object');
    return { success: false, errors };
  }

  if (!value.parameter || typeof value.parameter !== 'string') {
    errors.push('Parameter name is required and must be a string');
  }

  if (value.value === undefined || value.value === null) {
    errors.push('Test value is required');
  }

  if (value.unit && typeof value.unit !== 'string') {
    errors.push('Unit must be a string');
  }

  if (value.flag && !['normal', 'high', 'low', 'critical'].includes(value.flag)) {
    errors.push('Flag must be one of: normal, high, low, critical');
  }

  if (value.referenceRange && typeof value.referenceRange !== 'object') {
    errors.push('Reference range must be an object');
  }

  return errors.length > 0 ? { success: false, errors } : { success: true, data: value };
}

/**
 * Validate create lab result request
 */
export function validateCreateLabResult(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Request body must be an object');
    return { success: false, errors };
  }

  // Required fields
  if (!(data as any).patientId || typeof (data as any).patientId !== 'string') {
    errors.push('Patient ID is required and must be a string');
  }

  if (!data.orderNumber || typeof data.orderNumber !== 'string') {
    errors.push('Order number is required and must be a string');
  }

  if (!data.testName || typeof data.testName !== 'string') {
    errors.push('Test name is required and must be a string');
  }

  if (!data.category || !isValidTestCategory(data.category)) {
    errors.push(`Category must be one of: ${Object.values(TestCategory).join(', ')}`);
  }

  // Optional fields validation
  if (data.priority && !isValidPriority(data.priority)) {
    errors.push(`Priority must be one of: ${Object.values(Priority).join(', ')}`);
  }

  if (data.accessLevel && !isValidAccessLevel(data.accessLevel)) {
    errors.push(`Access level must be one of: ${Object.values(AccessLevel).join(', ')}`);
  }

  if (data.sampleCollectedAt && !isValidDateString(data.sampleCollectedAt)) {
    errors.push('Sample collected date must be a valid ISO date string');
  }

  if (data.clinicalNotes && typeof data.clinicalNotes !== 'string') {
    errors.push('Clinical notes must be a string');
  }

  if (data.laboratoryId && typeof data.laboratoryId !== 'string') {
    errors.push('Laboratory ID must be a string');
  }

  return errors.length > 0 ? { success: false, errors } : { success: true, data };
}

/**
 * Validate update lab result request
 */
export function validateUpdateLabResult(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Request body must be an object');
    return { success: false, errors };
  }

  if (!data.id || typeof data.id !== 'string') {
    errors.push('Lab result ID is required and must be a string');
  }

  // Optional field validations
  if ((data as any).status && !isValidTestStatus((data as any).status)) {
    errors.push(`Status must be one of: ${Object.values(TestStatus).join(', ')}`);
  }

  if (data.results) {
    if (!Array.isArray(data.results)) {
      errors.push('Results must be an array');
    } else {
      data.results.forEach((result: any, index: number) => {
        const validation = validateLabTestValue(result);
        if (!validation.success) {
          errors.push(`Result ${index}: ${validation.errors?.join(', ')}`);
        }
      });
    }
  }

  if (data.interpretation && typeof data.interpretation !== 'string') {
    errors.push('Interpretation must be a string');
  }

  if (data.clinicalNotes && typeof data.clinicalNotes !== 'string') {
    errors.push('Clinical notes must be a string');
  }

  if (data.technicianId && typeof data.technicianId !== 'string') {
    errors.push('Technician ID must be a string');
  }

  if (data.reportedAt && !isValidDateString(data.reportedAt)) {
    errors.push('Reported date must be a valid ISO date string');
  }

  return errors.length > 0 ? { success: false, errors } : { success: true, data };
}

/**
 * Validate lab result query filters
 */
export function validateLabResultQuery(query: any): ValidationResult {
  const errors: string[] = [];

  if (!query || typeof query !== 'object') {
    return { success: true, data: {} };
  }

  // Optional string fields
  const stringFields = ['patientId', 'doctorId', 'companyId', 'testName', 'orderNumber'];
  stringFields.forEach((field: any) => {
    if (query[field] && typeof query[field] !== 'string') {
      errors.push(`${field} must be a string`);
    }
  });

  // Enum validations
  if (query.category && !isValidTestCategory(query.category)) {
    errors.push(`Category must be one of: ${Object.values(TestCategory).join(', ')}`);
  }

  if ((query as any).status && !isValidTestStatus((query as any).status)) {
    errors.push(`Status must be one of: ${Object.values(TestStatus).join(', ')}`);
  }

  if (query.priority && !isValidPriority(query.priority)) {
    errors.push(`Priority must be one of: ${Object.values(Priority).join(', ')}`);
  }

  // Date validations
  if (query.dateFrom && !isValidDateString(query.dateFrom)) {
    errors.push('Date from must be a valid ISO date string');
  }

  if (query.dateTo && !isValidDateString(query.dateTo)) {
    errors.push('Date to must be a valid ISO date string');
  }

  // Numeric validations
  if (query.limit) {
    const limit = Number(query.limit);
    if (isNaN(limit) || limit < 1 || limit > 1000) {
      errors.push('Limit must be a number between 1 and 1000');
    }
  }

  if (query.offset) {
    const offset = Number(query.offset);
    if (isNaN(offset) || offset < 0) {
      errors.push('Offset must be a non-negative number');
    }
  }

  return errors.length > 0 ? { success: false, errors } : { success: true, data: query };
}

/**
 * Validate lab result permissions
 */
export function validateLabResultPermissions(userRole: string, action: string, accessLevel: AccessLevel, userPermissions: string[]): { allowed: boolean; reason?: string } {
  const requiredPermission = `lab_results:${action}`;
  
  if (!userPermissions.includes(requiredPermission)) {
    return { allowed: false, reason: `Missing permission: ${requiredPermission}` };
  }

  // Role-based access control
  if (userRole === 'admin') {
    return { allowed: true };
  }

  if (userRole === 'doctor' || userRole === 'lab_technician') {
    if (accessLevel === AccessLevel.CONFIDENTIAL && action === 'read') {
      return userPermissions.includes('lab_results:read_confidential')
        ? { allowed: true }
        : { allowed: false, reason: 'Insufficient permissions for confidential data' };
    }
    return { allowed: true };
  }

  if (userRole === 'nurse' || userRole === 'assistant') {
    if (accessLevel === AccessLevel.CONFIDENTIAL) {
      return { allowed: false, reason: 'Insufficient role permissions for confidential data' };
    }
    if (action === 'delete') {
      return { allowed: false, reason: 'Role cannot delete lab results' };
    }
    return { allowed: true };
  }

  return { allowed: false, reason: 'Unknown role or insufficient permissions' };
}

/**
 * Helper function to validate ISO date strings
 */
function isValidDateString(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && dateString.includes('T');
}