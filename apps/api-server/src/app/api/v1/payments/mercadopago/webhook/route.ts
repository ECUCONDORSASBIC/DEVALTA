/**
 * 🔔 MERCADOPAGO WEBHOOK - ALTAMEDICA
 * Endpoint para procesar notificaciones de MercadoPago
 */

import { NextRequest, NextResponse } from 'next/server';
import MercadoPagoService from '@/services/payments/mercadopago.service';

/**
 * POST /api/v1/payments/mercadopago/webhook
 * Procesar notificaciones de MercadoPago
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    console.log('🔔 MercadoPago webhook received:', JSON.stringify(body, null, 2));

    // Validar que sea una notificación válida
    if (!body.type || !body.data || !body.data.id) {
      console.error('Invalid webhook notification format');
      return NextResponse.json({
        success: false,
        error: 'Invalid notification format',
      }, { status: 400 });
    }

    // Procesar la notificación
    await MercadoPagoService.processWebhook({
      type: body.type,
      data: {
        id: body.data.id,
      },
    });

    // Responder con éxito
    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    });

  } catch (error) {
    console.error('Error processing MercadoPago webhook:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error processing webhook',
      message: error.message,
    }, { status: 500 });
  }
}

/**
 * GET /api/v1/payments/mercadopago/webhook
 * Endpoint para verificar que el webhook está funcionando
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const id = searchParams.get('id');

    console.log('🔔 MercadoPago webhook verification:', { topic, id });

    if (topic && id) {
      // Procesar notificación de verificación
      await MercadoPagoService.processWebhook({
        type: topic,
        data: { id },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook endpoint is working',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in webhook verification:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error in webhook verification',
      message: error.message,
    }, { status: 500 });
  }
} 