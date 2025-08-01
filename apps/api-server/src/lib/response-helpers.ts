import { NextResponse } from 'next/server';
import { z } from 'zod';

// Error classes
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

// Logger
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data) : '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data ? JSON.stringify(data) : '');
  },
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data ? JSON.stringify(data) : '');
    }
  }
};

// Validation helpers
export const validateSchema = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new ValidationError(`Validation failed: ${errorMessage}`);
    }
    throw new ValidationError('Invalid data format');
  }
};

// Pagination helpers
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const validatePagination = (params: any): Required<PaginationParams> => {
  const page = Math.max(1, parseInt(params.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 10));
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder === 'desc' ? 'desc' : 'asc';

  return { page, limit, sortBy, sortOrder };
};

export const createPaginationMeta = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
};

// Response helpers
export const successResponse = (data: any, message?: string, meta?: any) => {
  return NextResponse.json({
    success: true,
    message: message || 'Success',
    data,
    meta
  });
};

export const createSuccessResponse = (data: any, message?: string, meta?: any) => {
  return NextResponse.json({
    success: true,
    message: message || 'Success',
    data,
    meta
  });
};

export const createErrorResponse = (
  error: string | AppError,
  statusCode: number = 500
) => {
  if (error instanceof AppError) {
    return {
      success: false,
      message: error.message,
      code: error.code
    };
  }

  return {
    success: false,
    message: typeof error === 'string' ? error : 'Internal server error'
  };
};

export const errorResponse = (
  error: string | AppError,
  statusCode: number = 500
) => {
  if (error instanceof AppError) {
    return NextResponse.json({
      success: false,
      message: error.message,
      code: error.code
    }, { status: error.statusCode });
  }

  return NextResponse.json({
    success: false,
    message: typeof error === 'string' ? error : 'Internal server error'
  }, { status: statusCode });
};

// Async handler wrapper
export const asyncHandler = (fn: Function) => {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error('Async handler error:', error);
      if (error instanceof AppError) {
        return errorResponse(error);
      }
      return errorResponse('Internal server error', 500);
    }
  };
};