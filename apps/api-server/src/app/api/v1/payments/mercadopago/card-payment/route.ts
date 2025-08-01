/**
 * 💳 MERCADOPAGO CARD PAYMENT - ALTAMEDICA
 * Endpoint separado para pagos con tarjeta (CORREGIDO: separado de la ruta principal)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuthenticatedRoute } from '@/lib/middleware/UnifiedAuth';
import MercadoPagoService from '@/services/payments/mercadopago.service';

const CardPaymentSchema = z.object({
  transaction_amount: z.number().positive(),
  token: z.string(),
  description: z.string(),
  installments: z.number().min(1).max(12),
  payment_method_id: z.string(),
  payer: z.object({
    email: z.string().email(),
    identification: z.object({
      type: z.string(),
      number: z.string(),
    }),
  }),
  session_id: z.string().optional(),
  external_reference: z.string().optional(),
});

/**
 * POST /api/v1/payments/mercadopago/card-payment
 * Crear pago con tarjeta
 */
export const POST = createAuthenticatedRoute(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      
      // Validar datos de entrada
      const validatedData = CardPaymentSchema.parse(body);

      // Crear pago con tarjeta
      const payment = await MercadoPagoService.createCardPayment(validatedData);

      return NextResponse.json({
        success: true,
        data: payment,
        message: 'Pago con tarjeta procesado exitosamente',
      });

    } catch (error) {
      console.error('Error creating card payment:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: error.errors,
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Unknown error',
      }, { status: 500 });
    }
  },
  {
    allowedRoles: ['patient', 'doctor', 'company'],
    auditAction: 'card_payment_created',
    rateLimitKey: 'payment'
  }
);