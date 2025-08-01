/**
 * 🏥 ALTAMEDICA SHARED PACKAGE
 * Versión simplificada para resolver problemas de dependencias
 */

// ============================================================================
// TIPOS BÁSICOS
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: Record<string, unknown>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ValidationError {
  errors: Array<{
    path: (string | number)[];
    message: string;
  }>;
}

export interface SchemaValidator<T> {
  parse(data: unknown): T;
}

export interface Logger {
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, error?: Error | unknown): void;
  debug(message: string, data?: Record<string, unknown>): void;
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

export function createSuccessResponse<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
  return {
    success: true,
    data,
    meta
  };
}

export function createErrorResponse(code: string, message: string, details?: Record<string, unknown>): ApiResponse {
  return {
    success: false,
    error: message,
    meta: { code, details }
  };
}

export function validateSchema<T>(
  schema: SchemaValidator<T>, 
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Validation failed' 
    };
  }
}

export function validatePagination(params: PaginationParams): { page: number; limit: number } {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  return { page, limit };
}

export function createPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  };
}

// ============================================================================
// FUNCIONES DE FECHA
// ============================================================================

export function formatDate(date: Date): string {
  return date.toISOString();
}

export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

export function isValidDate(date: Date): boolean {
  return !isNaN(date.getTime());
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return date1.toDateString() === date2.toDateString();
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

export function isFuture(date: Date): boolean {
  return date > new Date();
}

export function isPast(date: Date): boolean {
  return date < new Date();
}

// ============================================================================
// FUNCIONES DE STRING
// ============================================================================

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function capitalizeWords(text: string): string {
  return text.replace(/\b\w/g, l => l.toUpperCase());
}

export function truncate(text: string, length: number): string {
  return text.length > length ? text.substring(0, length) + '...' : text;
}

// ============================================================================
// FUNCIONES DE ARRAY
// ============================================================================

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

// ============================================================================
// FUNCIONES DE OBJETO
// ============================================================================

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

// ============================================================================
// FUNCIONES DE NÚMERO
// ============================================================================

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

export function round(num: number, decimals = 2): number {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

// ============================================================================
// FUNCIONES ASÍNCRONAS
// ============================================================================

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await delay(delayMs);
      return retry(fn, retries - 1, delayMs);
    }
    throw error;
  }
}

// ============================================================================
// CLASES DE ERROR
// ============================================================================

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super('FORBIDDEN', message, 403);
    this.name = 'ForbiddenError';
  }
}

// ============================================================================
// LOGGER
// ============================================================================

export class ConsoleLogger implements Logger {
  info(message: string, data?: Record<string, unknown>): void {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  warn(message: string, data?: Record<string, unknown>): void {
    console.warn(`[WARN] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  error(message: string, error?: Error | unknown): void {
    console.error(`[ERROR] ${message}`, error);
  }

  debug(message: string, data?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }
}

export const consoleLogger = new ConsoleLogger();

// ============================================================================
// FUNCIONES DE AUTENTICACIÓN BÁSICAS
// ============================================================================

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function verifyAuthToken(token: string): { uid: string; email: string; userType: string } {
  // Implementación básica - en producción usar Firebase Admin
  consoleLogger.warn('Using basic authentication - implement Firebase Admin in production');
  
  // Simular verificación de token
  if (!token || token.length < 10) {
    throw new Error('Invalid token');
  }
  
  return {
    uid: 'temp-uid',
    email: 'temp@example.com',
    userType: 'user'
  };
}

export async function authenticateRequest(authHeader: string | null): Promise<{ uid: string; email: string; userType: string } | null> {
  const token = extractBearerToken(authHeader);
  if (!token) {
    return null;
  }
  
  try {
    return verifyAuthToken(token);
  } catch (error) {
    consoleLogger.error('Error verifying auth token', error);
    return null;
  }
}

// ============================================================================
// FUNCIONES DE FIRESTORE BÁSICAS
// ============================================================================

export interface FirestoreTimestamp {
  toDate(): Date;
}

export interface FirestoreDocumentData {
  [key: string]: unknown;
  createdAt?: FirestoreTimestamp | Date;
  updatedAt?: FirestoreTimestamp | Date;
}

export function convertFirestoreTimestamps<T extends FirestoreDocumentData>(data: T): T {
  const converted = { ...data };
  if (converted.createdAt && typeof converted.createdAt === 'object' && 'toDate' in converted.createdAt) {
    converted.createdAt = (converted.createdAt as FirestoreTimestamp).toDate();
  }
  if (converted.updatedAt && typeof converted.updatedAt === 'object' && 'toDate' in converted.updatedAt) {
    converted.updatedAt = (converted.updatedAt as FirestoreTimestamp).toDate();
  }
  return converted;
}

export interface FirestoreDocumentSnapshot {
  id: string;
  data(): FirestoreDocumentData;
}

export function processFirestoreDoc<T extends FirestoreDocumentData>(doc: FirestoreDocumentSnapshot): T & { id: string } {
  const data = doc.data() as T;
  return {
    id: doc.id,
    ...convertFirestoreTimestamps(data)
  };
}

// ============================================================================
// EXPORTACIONES DE AUTH
// ============================================================================

// Exportar toda la funcionalidad de auth
export * from './auth';

// ============================================================================
// EXPORTACIONES POR DEFECTO
// ============================================================================

export default {
  createSuccessResponse,
  createErrorResponse,
  validateSchema,
  validatePagination,
  createPaginationMeta,
  formatDate,
  parseDate,
  isValidDate,
  addDays,
  addHours,
  addMinutes,
  isSameDay,
  isToday,
  isFuture,
  isPast,
  generateId,
  slugify,
  capitalize,
  capitalizeWords,
  truncate,
  unique,
  chunk,
  groupBy,
  omit,
  pick,
  formatCurrency,
  formatNumber,
  clamp,
  round,
  delay,
  retry,
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConsoleLogger,
  consoleLogger,
  extractBearerToken,
  authenticateRequest,
  convertFirestoreTimestamps,
  processFirestoreDoc
};
