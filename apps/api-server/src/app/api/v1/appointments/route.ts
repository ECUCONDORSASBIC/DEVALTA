/**
 * 📅 APPOINTMENTS API - ALTAMEDICA (REFACTORED)
 * Endpoint refactorizado usando Service Pattern + Unified Auth
 * MIGRADO: De verifyToken legacy a Unified Auth middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedRoute } from '@/lib/middleware/UnifiedAuth';
import { createSuccessResponse, createErrorResponse } from '@/lib/response-helpers';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';

export const dynamic = "force-dynamic";

// Schema for appointment queries
const AppointmentSearchSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'all']).default('all'),
  type: z.enum(['consultation', 'follow_up', 'emergency', 'telemedicine', 'all']).default('all'),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.string().default('scheduledAt'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

// Schema for creating appointments
const CreateAppointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  scheduledAt: z.string().min(1, 'Scheduled time is required'),
  type: z.enum(['consultation', 'follow_up', 'emergency', 'telemedicine']),
  duration: z.number().min(15).max(180).default(30),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
  isTelemedicine: z.boolean().default(false),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  metadata: z.object({
    symptoms: z.array(z.string()).optional(),
    preferredLanguage: z.string().default('es'),
    specialRequirements: z.string().optional()
  }).optional()
});

/**
 * GET /api/v1/appointments
 * List appointments with advanced filtering and role-based access
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest, authContext) => {
    try {
      const { searchParams } = new URL(request.url);
      const searchData = AppointmentSearchSchema.parse(Object.fromEntries(searchParams));
      
      const { page, limit, status, type, doctorId, patientId, startDate, endDate, sortBy, sortOrder } = searchData;
      const offset = (page - 1) * limit;

      // Build query
      let query: any = adminDb.collection('appointments');

      // Apply role-based filtering
      if (authContext.user.role === 'doctor') {
        query = query.where('doctorId', '==', authContext.user.uid);
      } else if (authContext.user.role === 'patient') {
        query = query.where('patientId', '==', authContext.user.uid);
      }

      // Apply additional filters
      if (status !== 'all') {
        query = query.where('status', '==', status);
      }
      if (type !== 'all') {
        query = query.where('type', '==', type);
      }
      if (doctorId && authContext.user.role !== 'doctor') {
        query = query.where('doctorId', '==', doctorId);
      }
      if (patientId && authContext.user.role !== 'patient') {
        query = query.where('patientId', '==', patientId);
      }

      // Date filtering
      if (startDate) {
        query = query.where('scheduledAt', '>=', new Date(startDate));
      }
      if (endDate) {
        query = query.where('scheduledAt', '<=', new Date(endDate));
      }

      // Order and paginate
      query = query.orderBy('scheduledAt', sortOrder).offset(offset).limit(limit);

      const snapshot = await query.get();

      // Process appointments with related data
      const appointments = [];
      const doctorIds = new Set();
      const patientIds = new Set();

      for (const doc of snapshot.docs) {
        const data = doc.data();
        appointments.push({
          id: doc.id,
          ...data,
          scheduledAt: data.scheduledAt?.toDate() || data.scheduledAt,
          createdAt: data.createdAt?.toDate() || data.createdAt,
          updatedAt: data.updatedAt?.toDate() || data.updatedAt
        });
        
        doctorIds.add(data.doctorId);
        patientIds.add(data.patientId);
      }

      // OPTIMIZATION: Batch fetch related user data
      const [doctorsData, patientsData] = await Promise.all([
        batchFetchUsers([...doctorIds], 'doctor'),
        batchFetchUsers([...patientIds], 'patient')
      ]);

      // Enrich appointments with user data
      const enrichedAppointments = appointments.map(appointment => ({
        ...appointment,
        doctor: doctorsData.get(appointment.doctorId),
        patient: patientsData.get(appointment.patientId)
      }));

      // Get total count for pagination
      const totalQuery = adminDb.collection('appointments');
      const totalSnapshot = await totalQuery.get();

      return NextResponse.json(
        createSuccessResponse(enrichedAppointments, {
          total: totalSnapshot.size,
          page,
          limit,
          hasNext: offset + limit < totalSnapshot.size,
          hasPrev: page > 1
        })
      );

    } catch (error) {
      console.error('Error in GET /appointments:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', 'Invalid query parameters', {
            validationErrors: error.errors
          }),
          { status: 400 }
        );
      }

      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error fetching appointments'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor', 'patient', 'nurse'],
    auditAction: 'appointments_list_accessed',
    rateLimitKey: 'appointments'
  }
);

/**
 * POST /api/v1/appointments
 * Create new appointment
 */
export const POST = createAuthenticatedRoute(
  async (request: NextRequest, authContext) => {
    try {
      const body = await request.json();
      const appointmentData = CreateAppointmentSchema.parse(body);

      // Validate permissions - patients can only create appointments for themselves
      if (authContext.user.role === 'patient' && appointmentData.patientId !== authContext.user.uid) {
        return NextResponse.json(
          createErrorResponse('PERMISSION_DENIED', 'Cannot create appointment for another patient'),
          { status: 403 }
        );
      }

      // Check if doctor exists and is available
      const doctorDoc = await adminDb.collection('doctors').doc(appointmentData.doctorId).get();
      if (!doctorDoc.exists) {
        return NextResponse.json(
          createErrorResponse('DOCTOR_NOT_FOUND', 'Doctor not found'),
          { status: 404 }
        );
      }

      const doctorData = doctorDoc.data()!;
      if (!doctorData.isAcceptingPatients) {
        return NextResponse.json(
          createErrorResponse('DOCTOR_UNAVAILABLE', 'Doctor is not accepting new patients'),
          { status: 409 }
        );
      }

      // Check for scheduling conflicts
      const conflictQuery = await adminDb.collection('appointments')
        .where('doctorId', '==', appointmentData.doctorId)
        .where('scheduledAt', '>=', new Date(appointmentData.scheduledAt))
        .where('scheduledAt', '<=', new Date(new Date(appointmentData.scheduledAt).getTime() + appointmentData.duration * 60000))
        .where('status', 'in', ['scheduled', 'confirmed', 'in_progress'])
        .get();

      if (!conflictQuery.empty) {
        return NextResponse.json(
          createErrorResponse('SCHEDULING_CONFLICT', 'Doctor is not available at the requested time'),
          { status: 409 }
        );
      }

      // Create appointment
      const newAppointment = {
        ...appointmentData,
        scheduledAt: new Date(appointmentData.scheduledAt),
        status: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: authContext.user.uid,
        appointmentNumber: `APT-${Date.now()}`,
        estimatedEndTime: new Date(new Date(appointmentData.scheduledAt).getTime() + appointmentData.duration * 60000),
        isActive: true
      };

      const appointmentRef = await adminDb.collection('appointments').add(newAppointment);

      // Create notification for doctor
      await adminDb.collection('notifications').add({
        userId: appointmentData.doctorId,
        type: 'new_appointment',
        title: 'Nueva Cita Programada',
        message: `Nueva cita programada para ${new Date(appointmentData.scheduledAt).toLocaleString()}`,
        data: {
          appointmentId: appointmentRef.id,
          patientId: appointmentData.patientId,
          scheduledAt: appointmentData.scheduledAt
        },
        isRead: false,
        createdAt: new Date()
      });

      // Audit log
      await adminDb.collection('audit_logs').add({
        action: 'appointment_created',
        userId: authContext.user.uid,
        resourceType: 'appointment',
        resourceId: appointmentRef.id,
        details: {
          doctorId: appointmentData.doctorId,
          patientId: appointmentData.patientId,
          scheduledAt: appointmentData.scheduledAt,
          type: appointmentData.type
        },
        timestamp: new Date(),
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent')
      });

      return NextResponse.json(
        createSuccessResponse({
          id: appointmentRef.id,
          ...newAppointment
        }),
        { status: 201 }
      );

    } catch (error) {
      console.error('Error in POST /appointments:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', 'Invalid appointment data', {
            validationErrors: error.errors
          }),
          { status: 400 }
        );
      }

      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error creating appointment'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor', 'patient', 'nurse'],
    auditAction: 'appointment_created',
    rateLimitKey: 'appointment_create'
  }
);

// Helper functions
async function batchFetchUsers(userIds: string[], userType: 'doctor' | 'patient'): Promise<Map<string, any>> {
  if (userIds.length === 0) return new Map();

  const usersMap = new Map();
  const chunks = chunkArray([...userIds], 10);

  for (const chunk of chunks) {
    const usersSnapshot = await adminDb.collection('users')
      .where('__name__', 'in', chunk.map(id => adminDb.collection('users').doc(id)))
      .get();

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      usersMap.set(doc.id, {
        id: doc.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone
      });
    }
  }

  return usersMap;
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || 'unknown';
}