/**
 * 👥 USERS API - ALTAMEDICA (REFACTORED)
 * Endpoint refactorizado usando Service Pattern + Unified Auth
 * MEJORADO: Migrando de implementación directa a patrón estándar
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedRoute } from '@/lib/middleware/UnifiedAuth';
import { UserService } from '@/services/UserService';
import { createSuccessResponse, createErrorResponse } from '@/lib/response-helpers';
import { z } from 'zod';

export const dynamic = "force-dynamic";

// Initialize service
const userService = new UserService();

// Additional query schema for user-specific filters
const UserSearchSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  role: z.enum(['doctor', 'patient', 'admin', 'company', 'nurse', 'all']).default('all'),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  specialty: z.string().optional(),
  companyId: z.string().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

/**
 * GET /api/v1/users
 * List users with advanced filtering and role-based access
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest, authContext) => {
    try {
      const { searchParams } = new URL(request.url);
      const searchData = UserSearchSchema.parse(Object.fromEntries(searchParams));
      
      // Convert search data to query options
      const queryOptions = {
        page: searchData.page,
        limit: searchData.limit,
        sortBy: searchData.sortBy,
        sortOrder: searchData.sortOrder as 'asc' | 'desc',
        filters: {
          ...(searchData.role !== 'all' && { role: searchData.role }),
          ...(searchData.isActive !== undefined && { isActive: searchData.isActive }),
          ...(searchData.search && { search: searchData.search }),
          ...(searchData.specialty && { specialty: searchData.specialty }),
          ...(searchData.companyId && { companyId: searchData.companyId })
        }
      };

      // Get service context from auth middleware
      const serviceContext = (request as any).serviceContext;
      
      // Use optimized service method
      const result = await userService.findMany(queryOptions, serviceContext);
      
      return NextResponse.json(
        createSuccessResponse(result.data, {
          total: result.total,
          page: result.page,
          limit: result.limit,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev
        })
      );

    } catch (error) {
      console.error('Error in GET /users:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', 'Invalid query parameters', {
            validationErrors: error.errors
          }),
          { status: 400 }
        );
      }

      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Internal server error'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor', 'company'],
    auditAction: 'users_list_accessed',
    rateLimitKey: 'users'
  }
);

/**
 * POST /api/v1/users
 * Create new user (admin only)
 */
export const POST = createAuthenticatedRoute(
  async (request: NextRequest, authContext) => {
    try {
      const body = await request.json();
      const serviceContext = (request as any).serviceContext;
      
      // Create user using service
      const newUser = await userService.create(body, serviceContext);
      
      return NextResponse.json(
        createSuccessResponse(newUser),
        { status: 201 }
      );

    } catch (error) {
      console.error('Error in POST /users:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', 'Invalid user data', {
            validationErrors: error.errors
          }),
          { status: 400 }
        );
      }

      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          return NextResponse.json(
            createErrorResponse('EMAIL_EXISTS', 'User already exists with this email'),
            { status: 409 }
          );
        }
        
        if (error.message.includes('Insufficient permissions')) {
          return NextResponse.json(
            createErrorResponse('PERMISSION_DENIED', error.message),
            { status: 403 }
          );
        }
      }

      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Internal server error'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin'],
    requiredPermissions: ['users:create'],
    auditAction: 'user_created',
    rateLimitKey: 'user_create'
  }
);

/**
 * PUT /api/v1/users
 * Update user (requires ID in query params or can update self)
 */
export const PUT = createAuthenticatedRoute(
  async (request: NextRequest, authContext) => {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('id');
      
      if (!userId) {
        return NextResponse.json(
          createErrorResponse('INVALID_REQUEST', 'User ID is required'),
          { status: 400 }
        );
      }

      const body = await request.json();
      const serviceContext = (request as any).serviceContext;
      
      // Update user using service
      const updatedUser = await userService.update(userId, body, serviceContext);
      
      return NextResponse.json(createSuccessResponse(updatedUser));

    } catch (error) {
      console.error('Error in PUT /users:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', 'Invalid user data', {
            validationErrors: error.errors
          }),
          { status: 400 }
        );
      }

      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return NextResponse.json(
            createErrorResponse('USER_NOT_FOUND', 'User not found'),
            { status: 404 }
          );
        }
        
        if (error.message.includes('Insufficient permissions')) {
          return NextResponse.json(
            createErrorResponse('PERMISSION_DENIED', error.message),
            { status: 403 }
          );
        }
      }

      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Internal server error'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor', 'patient', 'company', 'nurse'],
    auditAction: 'user_updated',
    rateLimitKey: 'user_update'
  }
);

/**
 * DELETE /api/v1/users
 * Soft delete user (admin only)
 */
export const DELETE = createAuthenticatedRoute(
  async (request: NextRequest, authContext) => {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get('id');
      
      if (!userId) {
        return NextResponse.json(
          createErrorResponse('INVALID_REQUEST', 'User ID is required'),
          { status: 400 }
        );
      }

      const serviceContext = (request as any).serviceContext;
      
      // Delete user using service (soft delete)
      const success = await userService.delete(userId, serviceContext);
      
      if (!success) {
        return NextResponse.json(
          createErrorResponse('USER_NOT_FOUND', 'User not found'),
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        createSuccessResponse({ deleted: true, id: userId })
      );

    } catch (error) {
      console.error('Error in DELETE /users:', error);
      
      if (error instanceof Error && error.message.includes('Only admins')) {
        return NextResponse.json(
          createErrorResponse('PERMISSION_DENIED', error.message),
          { status: 403 }
        );
      }

      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Internal server error'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin'],
    requiredPermissions: ['users:delete'],
    auditAction: 'user_deleted',
    rateLimitKey: 'user_delete'
  }
);