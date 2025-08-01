import { adminDb } from '@/lib/firebase-admin';
import { createErrorResponse, createPaginationMeta, createSuccessResponse, validatePagination } from '@/lib/response-helpers';
import { DocumentData, Query } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema para crear billing de telemedicina
const CreateTelemedicineBillingSchema = z.object({
  sessionId: z.string().min(1, 'ID de sesión requerido'),
  appointmentId: z.string().min(1, 'ID de cita requerido'),
  doctorId: z.string().min(1, 'ID de doctor requerido'),
  patientId: z.string().min(1, 'ID de paciente requerido'),
  serviceType: z.enum(['consultation', 'follow_up', 'emergency', 'specialist']).default('consultation'),
  duration: z.number().min(1).max(180), // minutos
  baseFee: z.number().min(0),
  additionalFees: z.array(z.object({
    type: z.string(),
    description: z.string(),
    amount: z.number(),
  })).optional().default([]),
  currency: z.enum(['USD', 'EUR', 'COP', 'MXN', 'ARS']).default('USD'),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'insurance']).optional(),
  insuranceInfo: z.object({
    provider: z.string(),
    policyNumber: z.string(),
    groupNumber: z.string().optional(),
    copayAmount: z.number().optional(),
  }).optional(),
});

// Schema para búsqueda de billing
const BillingQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  limit: z.string().optional().transform(val => val ? parseInt(val) : undefined),
  status: z.enum(['pending', 'paid', 'cancelled', 'refunded', 'disputed', 'all']).optional().default('all'),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
  serviceType: z.enum(['consultation', 'follow_up', 'emergency', 'specialist', 'all']).optional().default('all'),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'insurance', 'all']).optional().default('all'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  maxAmount: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
});

/**
 * GET /api/v1/telemedicine/billing
 * Lista facturas de telemedicina con filtros
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const queryData = BillingQuerySchema.parse(queryParams);
    const { page, limit } = validatePagination({
      page: queryData.page,
      limit: queryData.limit,
    });    // Construir query base
    let query: Query<DocumentData> = adminDb.collection('telemedicine_billing');

    // Aplicar filtros
    if ((queryData as any).doctorId) {
      query = (query as any).where('doctorId', '==', (queryData as any).doctorId);
    }

    if ((queryData as any).patientId) {
      query = (query as any).where('patientId', '==', (queryData as any).patientId);
    }

    if ((queryData as any).status !== 'all') {
      query = (query as any).where('status', '==', (queryData as any).status);
    }

    if (queryData.serviceType !== 'all') {
      query = (query as any).where('serviceType', '==', queryData.serviceType);
    }

    if (queryData.paymentMethod !== 'all') {
      query = (query as any).where('paymentMethod', '==', queryData.paymentMethod);
    }

    // Filtros de fecha
    if (queryData.startDate) {
      query = (query as any).where('createdAt', '>=', new Date(queryData.startDate));
    }

    if (queryData.endDate) {
      query = (query as any).where('createdAt', '<=', new Date(queryData.endDate));
    }

    // Ordenar por fecha de creación
    query = (query as any).orderBy('createdAt', 'desc');

    // Obtener total para paginación
    const totalSnapshot = await query.get();
    const total = totalSnapshot.size;

    // Aplicar paginación
    const offset = (page - 1) * limit;
    query = (query as any).offset(offset).limit(limit);

    const snapshot = await query.get();
    const billings = [];

    for (const doc of snapshot.docs) {
      const billingData = doc.data();

      // Aplicar filtros post-query
      if (queryData.minAmount !== undefined && billingData.totalAmount < queryData.minAmount) {
        continue;
      }

      if (queryData.maxAmount !== undefined && billingData.totalAmount > queryData.maxAmount) {
        continue;
      }

      // Obtener información adicional
      const [doctorDoc, patientDoc, sessionDoc] = await Promise.all([
        adminDb.collection('users').doc((billingData as any).doctorId).get(),
        adminDb.collection('users').doc((billingData as any).patientId).get(),
        adminDb.collection('telemedicine_sessions').doc(billingData.sessionId).get(),
      ]);

      const doctorData = doctorDoc.exists ? doctorDoc.data() : null;
      const patientData = patientDoc.exists ? patientDoc.data() : null;
      const sessionData = sessionDoc.exists ? sessionDoc.data() : null;

      billings.push({
        id: doc.id,
        ...billingData,
        createdAt: (billingData as any).createdAt?.toDate?.() ?? (billingData as any).createdAt,
        updatedAt: billingData.updatedAt?.toDate?.() ?? billingData.updatedAt,
        dueDate: billingData.dueDate?.toDate?.() ?? billingData.dueDate,
        paidAt: billingData.paidAt?.toDate?.() ?? billingData.paidAt,
        
        // Información del doctor
        doctor: doctorData ? {
          id: (billingData as any).doctorId,
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          email: doctorData.email,
        } : null,

        // Información del paciente
        patient: patientData ? {
          id: (billingData as any).patientId,
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          email: patientData.email,
        } : null,

        // Información de la sesión
        session: sessionData ? {
          id: billingData.sessionId,
          status: (sessionData as any).status,
          actualDuration: sessionData.actualDuration,
          provider: sessionData.provider,
        } : null,
      });
    }

    const meta = createPaginationMeta(page, limit, total);

    return NextResponse.json(
      createSuccessResponse(billings, meta as unknown as Record<string, unknown>),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error fetching telemedicine billing:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Parámetros de búsqueda inválidos', { errors: error.errors }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('FETCH_BILLING_FAILED', 'Error al obtener facturas de telemedicina'),
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/telemedicine/billing
 * Crear nueva factura de telemedicina
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const billingData = CreateTelemedicineBillingSchema.parse(body);

    // Verificar que la sesión existe y está completada
    const sessionDoc = await adminDb.collection('telemedicine_sessions').doc(billingData.sessionId).get();
    if (!sessionDoc.exists) {
      return NextResponse.json(
        createErrorResponse('SESSION_NOT_FOUND', 'Sesión de telemedicina no encontrada'),
        { status: 404 }
      );
    }

    const sessionInfo = sessionDoc.data();
    if (!sessionInfo) {
      return NextResponse.json(
        createErrorResponse('SESSION_DATA_ERROR', 'No se pudo obtener datos de la sesión'),
        { status: 500 }
      );
    }

    if ((sessionInfo as any).status !== 'completed') {
      return NextResponse.json(
        createErrorResponse('SESSION_NOT_COMPLETED', 'Solo se puede facturar sesiones completadas'),
        { status: 400 }
      );
    }

    // Verificar que no existe factura previa para esta sesión
    const existingBillingQuery = await adminDb
      .collection('telemedicine_billing')
      .where('sessionId', '==', billingData.sessionId)
      .get();

    if (!existingBillingQuery.empty) {
      return NextResponse.json(
        createErrorResponse('BILLING_EXISTS', 'Ya existe una factura para esta sesión'),
        { status: 409 }
      );
    }

    // Calcular tarifas y totales
    const pricing = calculateTelemedicinePricing(
      billingData.serviceType,
      billingData.duration,
      billingData.baseFee,
      billingData.additionalFees
    );

    // Generar número de factura único
    const invoiceNumber = generateInvoiceNumber();

    // Determinar fecha de vencimiento
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 días para pagar

    // Crear registro de facturación
    const newBilling = {
      ...billingData,
      invoiceNumber,
      status: 'pending',
      baseFee: pricing.baseFee,
      additionalFees: pricing.additionalFees,
      subtotal: pricing.subtotal,
      taxes: pricing.taxes,
      totalAmount: pricing.totalAmount,
      actualDuration: sessionInfo.actualDuration || billingData.duration * 60, // en segundos
      dueDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentAttempts: 0,
      refundAmount: 0,
      
      // Información de auditoría
      billingDetails: {
        sessionDuration: sessionInfo.actualDuration,
        scheduledDuration: sessionInfo.scheduledDuration,
        connectionQuality: sessionInfo.metrics?.connectionQuality,
        endReason: sessionInfo.endReason,
        provider: sessionInfo.provider,
      },
    };

    const docRef = await adminDb.collection('telemedicine_billing').add(newBilling);

    // Actualizar la sesión con el ID de facturación
    await adminDb.collection('telemedicine_sessions').doc(billingData.sessionId).update({
      billingId: docRef.id,
      isBilled: true,
      updatedAt: new Date(),
    });

    // Registrar evento de facturación
    await adminDb.collection('billing_events').add({
      billingId: docRef.id,
      sessionId: billingData.sessionId,
      type: 'billing_created',
      amount: pricing.totalAmount,
      timestamp: new Date(),
      details: {
        invoiceNumber,
        serviceType: billingData.serviceType,
        duration: billingData.duration,
      },
    });

    return NextResponse.json(
      createSuccessResponse({
        id: docRef.id,
        ...newBilling,
        paymentLink: generatePaymentLink(docRef.id, pricing.totalAmount),
      }),
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating telemedicine billing:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Datos de facturación inválidos', { errors: error.errors }),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('CREATE_BILLING_FAILED', 'Error al crear factura de telemedicina'),
      { status: 500 }
    );
  }
}

// Función para calcular precios de telemedicina
function calculateTelemedicinePricing(serviceType: string, duration: number, baseFee: number, additionalFees: Array<{ type: string; description: string; amount: number }> = []) {
  // Tarifas base por tipo de servicio (en USD)
  const baseRates: Record<string, number> = {
    consultation: 75,
    follow_up: 45,
    emergency: 150,
    specialist: 120,
  };

  // Usar tarifa base proporcionada o la tarifa estándar
  const effectiveBaseFee = baseFee || baseRates[serviceType] || 75;

  // Calcular tarifa por tiempo (si excede 30 minutos, cobrar por minuto adicional)
  let timeFee = effectiveBaseFee;
  if (duration > 30) {
    const additionalMinutes = duration - 30;
    const perMinuteRate = effectiveBaseFee * 0.05; // 5% de la tarifa base por minuto
    timeFee += additionalMinutes * perMinuteRate;
  }

  // Sumar tarifas adicionales
  const additionalFeesTotal = additionalFees.reduce((sum, fee) => sum + fee.amount, 0);

  const subtotal = timeFee + additionalFeesTotal;
  const taxRate = 0.19; // 19% IVA (ajustar según región)
  const taxes = subtotal * taxRate;
  const totalAmount = subtotal + taxes;

  return {
    baseFee: effectiveBaseFee,
    timeFee,
    additionalFees,
    additionalFeesTotal,
    subtotal,
    taxRate,
    taxes,
    totalAmount: Math.round(totalAmount * 100) / 100, // Redondear a 2 decimales
    breakdown: {
      baseFee: effectiveBaseFee,
      timeCharge: timeFee - effectiveBaseFee,
      additionalFees: additionalFeesTotal,
      taxes,
    },
  };
}

// Función para generar número de factura único
function generateInvoiceNumber(): string {
  const prefix = 'TM'; // Telemedicine
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  
  return `${prefix}${year}${month}${random}`;
}

// Función para generar link de pago
function generatePaymentLink(billingId: string, amount: number): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/payment/telemedicine/${billingId}?amount=${amount}`;
}
