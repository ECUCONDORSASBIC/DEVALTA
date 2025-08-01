/**
 * 📅 INDIVIDUAL APPOINTMENT API - ALTAMEDICA (REFACTORED)
 * CRUD individual para citas específicas usando Service Pattern + Unified Auth
 * MIGRADO: De Firebase directo + auth manual a patrón estándar
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedRoute } from '@/lib/middleware/UnifiedAuth';
import { createSuccessResponse, createErrorResponse } from '@/lib/response-helpers';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';

export const dynamic = "force-dynamic";

// Schema for updating appointments
const UpdateAppointmentSchema = z.object({
  status: z.enum(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show']).optional(),
  scheduledAt: z.coerce.date().optional(),
  duration: z.number().min(15).max(240).optional(), // 15 min to 4 hours
  type: z.enum(['consultation', 'follow-up', 'emergency', 'telemedicine', 'procedure']).optional(),
  reason: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  consultationFee: z.number().min(0).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'refunded']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  hasTelemedicine: z.boolean().optional(),
  reminders: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    hours: z.number().min(1).max(72).default(24)
  }).optional()
});

/**
 * GET /api/v1/appointments/[id]
 * Get individual appointment details with comprehensive information
 */
export const GET = createAuthenticatedRoute(
  async (request: NextRequest, authContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: appointmentId } = await params;

      // Obtener la cita
      const appointmentDoc = await adminDb.collection('appointments').doc(appointmentId).get();
      
      if (!appointmentDoc.exists) {
        return NextResponse.json(
          createErrorResponse('APPOINTMENT_NOT_FOUND', 'Cita no encontrada'),
          { status: 404 }
        );
      }

      const appointmentData = appointmentDoc.data()!;
      
      // Check permissions - users can only see appointments they're involved in
      const canView = await checkAppointmentViewPermissions(
        authContext.user,
        appointmentData
      );
      
      if (!canView) {
        return NextResponse.json(
          createErrorResponse('PERMISSION_DENIED', 'No tienes permisos para ver esta cita'),
          { status: 403 }
        );
      }

      // Obtener información del doctor, paciente y datos adicionales en paralelo
      const [doctorDoc, patientDoc, doctorProfileDoc, telemedicineSessionDoc] = await Promise.all([
        adminDb.collection('users').doc(appointmentData.doctorId).get(),
        adminDb.collection('users').doc(appointmentData.patientId).get(),
        adminDb.collection('doctors').doc(appointmentData.doctorId).get(),
        appointmentData.telemedicineSessionId ? 
          adminDb.collection('telemedicine_sessions').doc(appointmentData.telemedicineSessionId).get() :
          Promise.resolve(null)
      ]);
      
      const doctorProfile = doctorProfileDoc.exists ? doctorProfileDoc.data() : null;
      const telemedicineSession = telemedicineSessionDoc?.exists ? telemedicineSessionDoc.data() : null;

      // Get appointment history and related records
      const [paymentRecords, prescriptionsQuery, medicalRecordsQuery] = await Promise.all([
        getAppointmentPayments(appointmentId),
        adminDb.collection('prescriptions')
          .where('appointmentId', '==', appointmentId)
          .get(),
        adminDb.collection('medical_records')
          .where('appointmentId', '==', appointmentId)
          .get()
      ]);
      
      const prescriptions = prescriptionsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
      }));
      
      const medicalRecords = medicalRecordsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
      }));
      
      // Calculate appointment status information
      const now = new Date();
      const scheduledAt = appointmentData.scheduledAt?.toDate?.() || new Date(appointmentData.scheduledAt);
      const endTime = new Date(scheduledAt.getTime() + (appointmentData.duration || 30) * 60000);
      
      const statusInfo = {
        isUpcoming: scheduledAt > now && ['scheduled', 'confirmed'].includes(appointmentData.status),
        isInProgress: appointmentData.status === 'in-progress',
        isCompleted: appointmentData.status === 'completed',
        isCancelled: appointmentData.status === 'cancelled',
        isOverdue: scheduledAt < now && ['scheduled', 'confirmed'].includes(appointmentData.status),
        canStart: scheduledAt <= new Date(now.getTime() + 15 * 60000) && appointmentData.status === 'confirmed',
        canCancel: ['scheduled', 'confirmed'].includes(appointmentData.status) && scheduledAt > new Date(now.getTime() + 60 * 60000),
        timeUntilStart: Math.max(0, Math.floor((scheduledAt.getTime() - now.getTime()) / (1000 * 60))),
        duration: appointmentData.duration || 30
      };
      
      const responseData = {
        appointment: {
          id: appointmentDoc.id,
          ...appointmentData,
          scheduledAt: scheduledAt,
          endTime: endTime,
          createdAt: appointmentData.createdAt?.toDate?.() || appointmentData.createdAt,
          updatedAt: appointmentData.updatedAt?.toDate?.() || appointmentData.updatedAt,
          cancelledAt: appointmentData.cancelledAt?.toDate?.() || appointmentData.cancelledAt,
          
          // Enhanced doctor information
          doctor: doctorDoc.exists ? {
            id: appointmentData.doctorId,
            firstName: doctorDoc.data()?.firstName,
            lastName: doctorDoc.data()?.lastName,
            email: doctorDoc.data()?.email,
            phone: doctorDoc.data()?.phone,
            specialties: doctorProfile?.specialties || [],
            licenseNumber: doctorProfile?.licenseNumber,
            consultationFee: doctorProfile?.consultationFee || 0,
            rating: doctorDoc.data()?.rating || 0,
            profileImage: doctorProfile?.profileImage
          } : null,
          
          // Enhanced patient information (filtered by permissions)
          patient: patientDoc.exists && canAccessPatientDetails(authContext.user, appointmentData.patientId) ? {
            id: appointmentData.patientId,
            firstName: patientDoc.data()?.firstName,
            lastName: patientDoc.data()?.lastName,
            email: patientDoc.data()?.email,
            phone: patientDoc.data()?.phone,
            dateOfBirth: patientDoc.data()?.dateOfBirth,
            gender: patientDoc.data()?.gender
          } : null,
          
          // Status and timing information
          statusInfo,
          
          // Telemedicine information
          telemedicine: telemedicineSession ? {
            sessionId: appointmentData.telemedicineSessionId,
            status: telemedicineSession.status,
            roomUrl: telemedicineSession.roomUrl,
            recordingEnabled: telemedicineSession.recordingEnabled || false,
            participantsCount: telemedicineSession.participants?.length || 0
          } : null,
          
          // Related records
          relatedRecords: {
            prescriptions: prescriptions.length,
            medicalRecords: medicalRecords.length,
            payments: paymentRecords.length,
            hasPrescriptions: prescriptions.length > 0,
            hasMedicalRecords: medicalRecords.length > 0,
            hasPayments: paymentRecords.length > 0
          },
          
          // Payment information
          payment: {
            status: appointmentData.paymentStatus || 'pending',
            amount: appointmentData.consultationFee || 0,
            currency: appointmentData.currency || 'ARS',
            method: paymentRecords[0]?.method || null,
            paidAt: paymentRecords[0]?.paidAt || null
          }
        },
        
        // Include detailed records if user has permissions
        details: authContext.user.role === 'doctor' || authContext.user.uid === appointmentData.patientId ? {
          prescriptions: prescriptions.slice(0, 5),
          medicalRecords: medicalRecords.slice(0, 3),
          paymentHistory: paymentRecords
        } : null
      };

      // Audit log for appointment access
      await adminDb.collection('audit_logs').add({
        action: 'appointment_viewed',
        userId: authContext.user.uid,
        resourceType: 'appointment',
        resourceId: appointmentId,
        details: {
          appointmentStatus: appointmentData.status,
          doctorId: appointmentData.doctorId,
          patientId: appointmentData.patientId,
          scheduledAt: scheduledAt.toISOString(),
          accessedByRole: authContext.user.role
        },
        timestamp: new Date(),
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent')
      });
      
      return NextResponse.json(
        createSuccessResponse(responseData, {
          message: 'Cita obtenida exitosamente'
        })
      );
      
    } catch (error) {
      console.error('Error in GET /appointments/[id]:', error);
      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error al obtener cita'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor', 'patient', 'nurse'],
    auditAction: 'appointment_viewed',
    rateLimitKey: 'appointment_view'
  }
);

/**
 * PUT /api/v1/appointments/[id]
 * Update appointment with comprehensive validation and business logic
 */
export const PUT = createAuthenticatedRoute(
  async (request: NextRequest, authContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: appointmentId } = await params;
      const body = await request.json();
      const updateData = UpdateAppointmentSchema.parse(body);

      // Verificar que la cita existe
      const appointmentDoc = await adminDb.collection('appointments').doc(appointmentId).get();
      
      if (!appointmentDoc.exists) {
        return NextResponse.json(
          createErrorResponse('APPOINTMENT_NOT_FOUND', 'Cita no encontrada'),
          { status: 404 }
        );
      }
      
      const currentAppointmentData = appointmentDoc.data()!;
      
      // Check permissions for updating
      const canUpdate = await checkAppointmentUpdatePermissions(
        authContext.user,
        currentAppointmentData,
        updateData
      );
      
      if (!canUpdate) {
        return NextResponse.json(
          createErrorResponse('PERMISSION_DENIED', 'No tienes permisos para actualizar esta cita'),
          { status: 403 }
        );
      }

      // Prepare update data with audit trail
      const finalUpdateData: any = {
        ...updateData,
        updatedAt: new Date(),
        updatedBy: authContext.user.uid,
        lastModifiedByRole: authContext.user.role
      };
      
      // Track what fields changed for audit
      const changedFields: string[] = [];
      Object.keys(updateData).forEach(key => {
        if (currentAppointmentData[key] !== updateData[key]) {
          changedFields.push(key);
        }
      });

      // Advanced validation for schedule changes
      if (updateData.scheduledAt) {
        const validation = await validateAppointmentScheduleChange(
          appointmentId,
          currentAppointmentData,
          updateData.scheduledAt,
          updateData.duration || currentAppointmentData.duration || 30
        );
        
        if (!validation.isValid) {
          return NextResponse.json(
            createErrorResponse('SCHEDULE_VALIDATION_FAILED', validation.reason),
            { status: 400 }
          );
        }
      }
      
      // Validate status transitions
      if (updateData.status) {
        const statusTransition = await validateStatusTransition(
          currentAppointmentData.status,
          updateData.status,
          authContext.user.role
        );
        
        if (!statusTransition.isValid) {
          return NextResponse.json(
            createErrorResponse('INVALID_STATUS_TRANSITION', statusTransition.reason),
            { status: 400 }
          );
        }
      }

      // Handle special status updates
      if (updateData.status === 'completed') {
        finalUpdateData.completedAt = new Date();
        finalUpdateData.completedBy = authContext.user.uid;
      } else if (updateData.status === 'cancelled') {
        finalUpdateData.cancelledAt = new Date();
        finalUpdateData.cancelledBy = authContext.user.uid;
        finalUpdateData.cancellationReason = updateData.notes || 'No reason provided';
      }
      
      // Use batch for atomic updates
      const batch = adminDb.batch();
      
      // Update the appointment
      batch.update(adminDb.collection('appointments').doc(appointmentId), finalUpdateData);
      
      // Create appointment update event
      const eventRef = adminDb.collection('appointment_events').doc();
      batch.set(eventRef, {
        appointmentId,
        type: 'appointment_updated',
        timestamp: new Date(),
        userId: authContext.user.uid,
        userRole: authContext.user.role,
        changes: changedFields,
        previousValues: Object.fromEntries(
          changedFields.map(field => [field, currentAppointmentData[field]])
        ),
        newValues: Object.fromEntries(
          changedFields.map(field => [field, finalUpdateData[field]])
        )
      });
      
      // Update telemedicine session if needed
      if (currentAppointmentData.telemedicineSessionId && updateData.status) {
        const sessionRef = adminDb.collection('telemedicine_sessions').doc(currentAppointmentData.telemedicineSessionId);
        batch.update(sessionRef, {
          status: mapAppointmentStatusToSessionStatus(updateData.status),
          updatedAt: new Date()
        });
      }
      
      await batch.commit();
      
      // Get updated appointment
      const updatedDoc = await adminDb.collection('appointments').doc(appointmentId).get();
      const updatedAppointmentData = updatedDoc.data()!;
      
      // Send notifications if status changed significantly
      if (updateData.status && ['confirmed', 'cancelled', 'completed'].includes(updateData.status)) {
        await sendAppointmentUpdateNotifications(
          updatedAppointmentData,
          currentAppointmentData.status,
          updateData.status,
          authContext.user
        );
      }
      
      // Audit log
      await adminDb.collection('audit_logs').add({
        action: 'appointment_updated',
        userId: authContext.user.uid,
        resourceType: 'appointment',
        resourceId: appointmentId,
        details: {
          changedFields,
          previousStatus: currentAppointmentData.status,
          newStatus: updatedAppointmentData.status,
          doctorId: currentAppointmentData.doctorId,
          patientId: currentAppointmentData.patientId,
          scheduledAt: updatedAppointmentData.scheduledAt?.toDate?.()?.toISOString() || updatedAppointmentData.scheduledAt
        },
        timestamp: new Date(),
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent')
      });
      
      const responseData = {
        appointment: {
          id: updatedDoc.id,
          ...updatedAppointmentData,
          scheduledAt: updatedAppointmentData.scheduledAt?.toDate?.() || updatedAppointmentData.scheduledAt,
          createdAt: updatedAppointmentData.createdAt?.toDate?.() || updatedAppointmentData.createdAt,
          updatedAt: updatedAppointmentData.updatedAt?.toDate?.() || updatedAppointmentData.updatedAt,
          cancelledAt: updatedAppointmentData.cancelledAt?.toDate?.() || updatedAppointmentData.cancelledAt,
          completedAt: updatedAppointmentData.completedAt?.toDate?.() || updatedAppointmentData.completedAt
        },
        changes: {
          fieldsUpdated: changedFields,
          updatedBy: authContext.user.uid,
          updatedAt: new Date()
        },
        message: 'Cita actualizada exitosamente'
      };

      return NextResponse.json(
        createSuccessResponse(responseData)
      );
      
    } catch (error) {
      console.error('Error in PUT /appointments/[id]:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', 'Datos de actualización inválidos', {
            validationErrors: error.errors
          }),
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error al actualizar cita'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor', 'patient', 'nurse'],
    auditAction: 'appointment_updated',
    rateLimitKey: 'appointment_update'
  }
);

/**
 * DELETE /api/v1/appointments/[id]
 * Soft delete appointment (admin only) or cancel appointment
 */
export const DELETE = createAuthenticatedRoute(
  async (request: NextRequest, authContext, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: appointmentId } = await params;
      const { searchParams } = new URL(request.url);
      const reason = searchParams.get('reason') || 'Administrative deletion';
      const hardDelete = searchParams.get('hard') === 'true';

      // Verificar que la cita existe
      const appointmentDoc = await adminDb.collection('appointments').doc(appointmentId).get();
      
      if (!appointmentDoc.exists) {
        return NextResponse.json(
          createErrorResponse('APPOINTMENT_NOT_FOUND', 'Cita no encontrada'),
          { status: 404 }
        );
      }
      
      const appointmentData = appointmentDoc.data()!;
      
      // Check permissions for deletion
      const canDelete = await checkAppointmentDeletePermissions(
        authContext.user,
        appointmentData,
        hardDelete
      );
      
      if (!canDelete) {
        return NextResponse.json(
          createErrorResponse('PERMISSION_DENIED', 'No tienes permisos para eliminar esta cita'),
          { status: 403 }
        );
      }

      const batch = adminDb.batch();
      
      if (hardDelete && authContext.user.role === 'admin') {
        // Hard delete (admin only)
        batch.update(adminDb.collection('appointments').doc(appointmentId), {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: authContext.user.uid,
          deletionReason: reason,
          status: 'deleted',
          updatedAt: new Date()
        });
      } else {
        // Soft delete / cancellation
        batch.update(adminDb.collection('appointments').doc(appointmentId), {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledBy: authContext.user.uid,
          cancellationReason: reason,
          updatedAt: new Date()
        });
      }
      
      // Update telemedicine session if exists
      if (appointmentData.telemedicineSessionId) {
        batch.update(
          adminDb.collection('telemedicine_sessions').doc(appointmentData.telemedicineSessionId),
          {
            status: 'cancelled',
            cancelledAt: new Date(),
            updatedAt: new Date()
          }
        );
      }
      
      // Create deletion event
      const eventRef = adminDb.collection('appointment_events').doc();
      batch.set(eventRef, {
        appointmentId,
        type: hardDelete ? 'appointment_deleted' : 'appointment_cancelled',
        timestamp: new Date(),
        userId: authContext.user.uid,
        userRole: authContext.user.role,
        details: {
          reason,
          previousStatus: appointmentData.status,
          hardDelete
        }
      });
      
      await batch.commit();
      
      // Send notifications
      await sendAppointmentDeletionNotifications(
        appointmentData,
        authContext.user,
        reason,
        hardDelete
      );
      
      // Audit log
      await adminDb.collection('audit_logs').add({
        action: hardDelete ? 'appointment_deleted' : 'appointment_cancelled',
        userId: authContext.user.uid,
        resourceType: 'appointment',
        resourceId: appointmentId,
        details: {
          reason,
          hardDelete,
          doctorId: appointmentData.doctorId,
          patientId: appointmentData.patientId,
          scheduledAt: appointmentData.scheduledAt?.toDate?.()?.toISOString() || appointmentData.scheduledAt,
          originalStatus: appointmentData.status
        },
        timestamp: new Date(),
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent')
      });
      
      const responseData = {
        appointmentId,
        action: hardDelete ? 'deleted' : 'cancelled',
        reason,
        timestamp: new Date(),
        message: hardDelete ? 'Cita eliminada exitosamente' : 'Cita cancelada exitosamente'
      };

      return NextResponse.json(
        createSuccessResponse(responseData)
      );
      
    } catch (error) {
      console.error('Error in DELETE /appointments/[id]:', error);
      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error al eliminar/cancelar cita'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor', 'patient'],
    auditAction: 'appointment_deleted',
    rateLimitKey: 'appointment_delete'
  }
);

// Helper functions
async function checkAppointmentViewPermissions(user: any, appointmentData: any): Promise<boolean> {
  // Admin can view any appointment
  if (user.role === 'admin') return true;
  
  // Doctor can view appointments they're assigned to
  if (user.role === 'doctor' && appointmentData.doctorId === user.uid) return true;
  
  // Patient can view their own appointments
  if (user.role === 'patient' && appointmentData.patientId === user.uid) return true;
  
  // Nurse can view appointments in their facility
  if (user.role === 'nurse') {
    // Additional logic for nurse permissions based on facility
    return true; // Simplified for now
  }
  
  return false;
}

function canAccessPatientDetails(user: any, patientId: string): boolean {
  // Admin, doctor, and the patient themselves can access patient details
  return ['admin', 'doctor'].includes(user.role) || user.uid === patientId;
}

async function checkAppointmentUpdatePermissions(
  user: any, 
  appointmentData: any, 
  updateData: any
): Promise<boolean> {
  // Admin can update any appointment
  if (user.role === 'admin') return true;
  
  // Doctor can update their own appointments
  if (user.role === 'doctor' && appointmentData.doctorId === user.uid) {
    // Doctors can update most fields
    return true;
  }
  
  // Patient can only update limited fields in their appointments
  if (user.role === 'patient' && appointmentData.patientId === user.uid) {
    const allowedPatientUpdates = ['notes'];
    const updatingFields = Object.keys(updateData);
    return updatingFields.every(field => allowedPatientUpdates.includes(field));
  }
  
  return false;
}

async function checkAppointmentDeletePermissions(
  user: any, 
  appointmentData: any, 
  hardDelete: boolean
): Promise<boolean> {
  // Only admin can hard delete
  if (hardDelete && user.role !== 'admin') return false;
  
  // Admin can delete any appointment
  if (user.role === 'admin') return true;
  
  // Doctor can cancel their appointments
  if (user.role === 'doctor' && appointmentData.doctorId === user.uid) return true;
  
  // Patient can cancel their own appointments (with time restrictions)
  if (user.role === 'patient' && appointmentData.patientId === user.uid) {
    const scheduledAt = appointmentData.scheduledAt?.toDate?.() || new Date(appointmentData.scheduledAt);
    const now = new Date();
    const hoursUntilAppointment = (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Patients can only cancel if more than 24 hours in advance
    return hoursUntilAppointment > 24;
  }
  
  return false;
}

async function validateAppointmentScheduleChange(
  appointmentId: string,
  currentData: any,
  newScheduledAt: Date,
  duration: number
): Promise<{ isValid: boolean; reason?: string }> {
  // Check if new time is in the past
  if (newScheduledAt < new Date()) {
    return { isValid: false, reason: 'No se puede programar una cita en el pasado' };
  }
  
  // Check for conflicts with other appointments
  const endTime = new Date(newScheduledAt.getTime() + duration * 60000);
  
  const conflictQuery = await adminDb
    .collection('appointments')
    .where('doctorId', '==', currentData.doctorId)
    .where('status', 'in', ['scheduled', 'confirmed', 'in-progress'])
    .get();
  
  const conflicts = conflictQuery.docs.filter(doc => {
    if (doc.id === appointmentId) return false; // Skip current appointment
    
    const data = doc.data();
    const existingStart = data.scheduledAt?.toDate?.() || new Date(data.scheduledAt);
    const existingEnd = new Date(existingStart.getTime() + (data.duration || 30) * 60000);
    
    // Check for overlap
    return (newScheduledAt < existingEnd && endTime > existingStart);
  });
  
  if (conflicts.length > 0) {
    return { isValid: false, reason: 'El doctor no está disponible en ese horario' };
  }
  
  return { isValid: true };
}

async function validateStatusTransition(
  currentStatus: string,
  newStatus: string,
  userRole: string
): Promise<{ isValid: boolean; reason?: string }> {
  const validTransitions: { [key: string]: string[] } = {
    'scheduled': ['confirmed', 'cancelled', 'no-show'],
    'confirmed': ['in-progress', 'cancelled', 'no-show'],
    'in-progress': ['completed', 'cancelled'],
    'completed': [], // Completed appointments cannot be changed
    'cancelled': [], // Cancelled appointments cannot be changed
    'no-show': [] // No-show appointments cannot be changed
  };
  
  // Admin can override most restrictions
  if (userRole === 'admin') {
    return { isValid: true };
  }
  
  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    return {
      isValid: false,
      reason: `No se puede cambiar el estado de '${currentStatus}' a '${newStatus}'`
    };
  }
  
  return { isValid: true };
}

function mapAppointmentStatusToSessionStatus(appointmentStatus: string): string {
  const statusMap: { [key: string]: string } = {
    'scheduled': 'scheduled',
    'confirmed': 'ready',
    'in-progress': 'active',
    'completed': 'completed',
    'cancelled': 'cancelled',
    'no-show': 'cancelled'
  };
  
  return statusMap[appointmentStatus] || 'scheduled';
}

async function getAppointmentPayments(appointmentId: string): Promise<any[]> {
  try {
    const paymentsQuery = await adminDb
      .collection('payments')
      .where('appointmentId', '==', appointmentId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return paymentsQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      paidAt: doc.data().paidAt?.toDate?.() || doc.data().paidAt
    }));
  } catch (error) {
    console.error('Error getting appointment payments:', error);
    return [];
  }
}

async function sendAppointmentUpdateNotifications(
  appointmentData: any,
  previousStatus: string,
  newStatus: string,
  updatedBy: any
): Promise<void> {
  try {
    const notifications = [];
    
    // Notify patient if status changed significantly
    if (['confirmed', 'cancelled', 'completed'].includes(newStatus) && updatedBy.uid !== appointmentData.patientId) {
      notifications.push({
        userId: appointmentData.patientId,
        type: `appointment_${newStatus}`,
        title: `Cita ${newStatus === 'confirmed' ? 'Confirmada' : newStatus === 'cancelled' ? 'Cancelada' : 'Completada'}`,
        message: `Tu cita ha sido ${newStatus === 'confirmed' ? 'confirmada' : newStatus === 'cancelled' ? 'cancelada' : 'completada'}`,
        data: {
          appointmentId: appointmentData.id,
          previousStatus,
          newStatus,
          updatedBy: updatedBy.uid
        },
        priority: newStatus === 'cancelled' ? 'high' : 'medium',
        isRead: false,
        createdAt: new Date()
      });
    }
    
    // Notify doctor if updated by patient or admin
    if (updatedBy.uid !== appointmentData.doctorId) {
      notifications.push({
        userId: appointmentData.doctorId,
        type: `appointment_${newStatus}`,
        title: 'Cita Actualizada',
        message: `La cita con paciente ha sido actualizada a estado: ${newStatus}`,
        data: {
          appointmentId: appointmentData.id,
          previousStatus,
          newStatus,
          patientId: appointmentData.patientId
        },
        priority: 'medium',
        isRead: false,
        createdAt: new Date()
      });
    }
    
    // Send all notifications
    for (const notification of notifications) {
      await adminDb.collection('notifications').add(notification);
    }
  } catch (error) {
    console.error('Error sending appointment update notifications:', error);
  }
}

async function sendAppointmentDeletionNotifications(
  appointmentData: any,
  deletedBy: any,
  reason: string,
  hardDelete: boolean
): Promise<void> {
  try {
    const notifications = [];
    const action = hardDelete ? 'eliminada' : 'cancelada';
    
    // Notify patient
    if (deletedBy.uid !== appointmentData.patientId) {
      notifications.push({
        userId: appointmentData.patientId,
        type: hardDelete ? 'appointment_deleted' : 'appointment_cancelled',
        title: `Cita ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        message: `Tu cita ha sido ${action}. Motivo: ${reason}`,
        data: {
          appointmentId: appointmentData.id,
          reason,
          deletedBy: deletedBy.uid,
          hardDelete
        },
        priority: 'high',
        isRead: false,
        createdAt: new Date()
      });
    }
    
    // Notify doctor
    if (deletedBy.uid !== appointmentData.doctorId) {
      notifications.push({
        userId: appointmentData.doctorId,
        type: hardDelete ? 'appointment_deleted' : 'appointment_cancelled',
        title: `Cita ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        message: `La cita con paciente ha sido ${action}. Motivo: ${reason}`,
        data: {
          appointmentId: appointmentData.id,
          reason,
          patientId: appointmentData.patientId
        },
        priority: 'high',
        isRead: false,
        createdAt: new Date()
      });
    }
    
    // Send all notifications
    for (const notification of notifications) {
      await adminDb.collection('notifications').add(notification);
    }
  } catch (error) {
    console.error('Error sending appointment deletion notifications:', error);
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || 'unknown';
}