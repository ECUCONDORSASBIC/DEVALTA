/**
 * 📊 TELEMEDICINE STATS API
 * Endpoints para obtener estadísticas y registrar métricas de telemedicina.
 * GET, POST /api/telemedicine/stats
 * @version 2.0.0
 * @author Altamedica
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthenticatedRoute, AuthContext } from '@/lib/middleware/UnifiedAuth';
import { telemedicineStatsService, RecordMetricsSchema } from '@/services/telemedicine-stats.service';
import { createErrorResponse, createSuccessResponse } from '@/lib/response-helpers';

/**
 * @summary Obtiene el dashboard de estadísticas de telemedicina.
 * @description Devuelve un conjunto de métricas clave sobre el estado del sistema de telemedicina.
 * @handler GET
 * @protected
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const stats = await telemedicineStatsService.getDashboardStats(authContext.user!);

      return NextResponse.json(createSuccessResponse(stats));
    } catch (error: unknown) {
      console.error('Error en GET /telemedicine/stats:', error);
      if (error instanceof Error && error.message === 'FORBIDDEN') {
        return NextResponse.json(
          createErrorResponse('No tiene permisos para ver las estadísticas.', 'FORBIDDEN'),
          { status: 403 }
        );
      }
      return NextResponse.json(
        createErrorResponse('Error al obtener las estadísticas.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor'],
    auditAction: 'telemedicine_stats_read',
  }
);

/**
 * @summary Registra las métricas de una sesión de telemedicina.
 * @description Permite a un cliente (paciente o doctor) enviar métricas de calidad de la llamada.
 * @handler POST
 * @protected
 */
export const POST = createAuthenticatedRoute(
  async (request: NextRequest) => {
    try {
      const authContext = (request as any).authContext as AuthContext;
      const body = await request.json();
      
      const validatedData = RecordMetricsSchema.parse(body);

      const metricId = await telemedicineStatsService.recordSessionMetrics(validatedData, authContext.user!);

      return NextResponse.json(createSuccessResponse({ success: true, metricId }), { status: 201 });

    } catch (error: unknown) {
      console.error('Error en POST /telemedicine/stats:', error);
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('Datos de entrada inválidos.', 'VALIDATION_ERROR', { validationErrors: error.errors }),
          { status: 400 }
        );
      }
      if (error instanceof Error) {
        if (error.message === 'NOT_FOUND') {
          return NextResponse.json(createErrorResponse('La sesión especificada no existe.', 'NOT_FOUND'), { status: 404 });
        }
        if (error.message === 'FORBIDDEN') {
          return NextResponse.json(createErrorResponse('No tiene permisos para registrar métricas para esta sesión.', 'FORBIDDEN'), { status: 403 });
        }
      }
      return NextResponse.json(
        createErrorResponse('Error al registrar las métricas.', 'INTERNAL_SERVER_ERROR'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['doctor', 'patient'],
    auditAction: 'telemedicine_metrics_record',
  }
); 