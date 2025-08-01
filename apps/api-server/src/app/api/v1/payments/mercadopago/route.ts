/**
 * 💳 MERCADOPAGO API ROUTES - ALTAMEDICA
 * Endpoints para integración con MercadoPago
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import MercadoPagoService from '@/services/payments/mercadopago.service';

// Esquemas de validación
const CreatePreferenceSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(['ARS', 'BRL', 'CLP', 'COP', 'MXN', 'PEN', 'UYU']),
  description: z.string().min(1),
  payer: z.object({
    email: z.string().email(),
    name: z.string().min(1),
    identification: z.object({
      type: z.enum(['CPF', 'CNPJ', 'DNI', 'CC', 'CE', 'RUT']),
      number: z.string().min(1),
    }),
  }),
  external_reference: z.string().optional(),
  session_id: z.string().optional(),
});

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
});

/**
 * POST /api/v1/payments/mercadopago/preference
 * Crear preferencia de pago
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validar datos de entrada
    const validatedData = CreatePreferenceSchema.parse(body);

    // Configurar URLs de retorno
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const backUrls = {
      success: `${baseUrl}/payments/success?session_id=${validatedData.session_id}`,
      failure: `${baseUrl}/payments/failure?session_id=${validatedData.session_id}`,
      pending: `${baseUrl}/payments/pending?session_id=${validatedData.session_id}`,
    };

    // Crear preferencia de pago
    const preference = await MercadoPagoService.createPaymentPreference({
      ...validatedData,
      back_urls: backUrls,
      external_reference: validatedData.external_reference || validatedData.session_id,
    });

    return NextResponse.json({
      success: true,
      data: preference,
      message: 'Preferencia de pago creada exitosamente',
    });

  } catch (error) {
    console.error('Error creating MercadoPago preference:', error);
    
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
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * GET /api/v1/payments/mercadopago/payment/:id
 * Obtener información de un pago
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('payment_id');
    const preferenceId = searchParams.get('preference_id');

    if (!paymentId && !preferenceId) {
      return NextResponse.json({
        success: false,
        error: 'Se requiere payment_id o preference_id',
      }, { status: 400 });
    }

    let paymentInfo;

    if (paymentId) {
      paymentInfo = await MercadoPagoService.getPaymentInfo(paymentId);
    } else if (preferenceId) {
      // Obtener información de la preferencia
      paymentInfo = { preference_id: preferenceId };
    }

    return NextResponse.json({
      success: true,
      data: paymentInfo,
    });

  } catch (error) {
    console.error('Error getting payment info:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message,
    }, { status: 500 });
  }
}

// REMOVED: Card payment moved to separate route /card-payment 