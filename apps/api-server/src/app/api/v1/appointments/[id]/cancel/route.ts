/**
 * ❌ CANCEL APPOINTMENT API - ALTAMEDICA (REFACTORED)
 * Endpoint para cancelar citas usando Service Pattern + Unified Auth
 * MIGRADO: De Firebase directo sin auth a patrón estándar con validaciones completas
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedRoute } from '@/lib/middleware/UnifiedAuth';
import { createSuccessResponse, createErrorResponse } from '@/lib/response-helpers';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';

export const dynamic = "force-dynamic";

// Schema for cancelling appointments
const CancelAppointmentSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required').max(500, 'Reason too long'),
  notifyParties: z.boolean().default(true),
  refundRequested: z.boolean().default(false),
  rescheduleRequested: z.boolean().default(false),
  preferredRescheduleDate: z.string().optional(),
  additionalNotes: z.string().max(1000).optional()
});

/**
 * PUT /api/v1/appointments/[id]/cancel 
 * Cancel appointment with comprehensive validation and notifications
 */
export const PUT = createAuthenticatedRoute(
  async (request: NextRequest, authContext, { params }: { params: { id: string } }) => {
    try {
      const { id: appointmentId } = params;
      const body = await request.json();
      const cancelData = CancelAppointmentSchema.parse(body);

      // Verify appointment exists
      const appointmentDoc = await adminDb.collection('appointments').doc(appointmentId).get();
      if (!appointmentDoc.exists) {
        return NextResponse.json(
          createErrorResponse('APPOINTMENT_NOT_FOUND', 'Appointment not found'),
          { status: 404 }
        );
      }

      const appointmentData = appointmentDoc.data()!;
      const currentStatus = appointmentData.status;

      // Check permissions - user must be patient, doctor, or admin involved in the appointment
      const canCancel = await checkCancellationPermissions(
        authContext.user, 
        appointmentData
      );
      
      if (!canCancel) {
        return NextResponse.json(
          createErrorResponse('PERMISSION_DENIED', 'You do not have permission to cancel this appointment'),
          { status: 403 }
        );
      }

      // Verify appointment can be cancelled
      if (['cancelled', 'completed', 'no_show'].includes(currentStatus)) {
        return NextResponse.json(
          createErrorResponse('APPOINTMENT_CANNOT_BE_CANCELLED', 
            `Appointment cannot be cancelled when status is '${currentStatus}'`),
          { status: 400 }
        );
      }

      // Check cancellation policy (24-hour rule, etc.)
      const cancellationPolicy = await checkCancellationPolicyCompliance(
        appointmentData.scheduledAt?.toDate() || new Date(appointmentData.scheduledAt),
        authContext.user.role
      );

      // Calculate cancellation fees if applicable
      const cancellationFees = calculateCancellationFees(
        appointmentData,
        cancellationPolicy,
        authContext.user.role
      );

      // Start transaction for atomic update
      const batch = adminDb.batch();

      // Update appointment
      const appointmentUpdate = {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: authContext.user.uid,
        cancelReason: cancelData.reason,
        cancellationDetails: {
          reason: cancelData.reason,
          notifyParties: cancelData.notifyParties,
          refundRequested: cancelData.refundRequested,
          rescheduleRequested: cancelData.rescheduleRequested,
          preferredRescheduleDate: cancelData.preferredRescheduleDate || null,
          additionalNotes: cancelData.additionalNotes || null,
          cancellationFees: cancellationFees,
          policyCompliance: cancellationPolicy,
          cancelledByRole: authContext.user.role
        },
        updatedAt: new Date()
      };

      batch.update(adminDb.collection('appointments').doc(appointmentId), appointmentUpdate);

      // Create cancellation event
      const eventRef = adminDb.collection('appointment_events').doc();
      batch.set(eventRef, {
        appointmentId: appointmentId,
        type: 'appointment_cancelled',
        timestamp: new Date(),
        userId: authContext.user.uid,
        userRole: authContext.user.role,
        details: {
          reason: cancelData.reason,
          previousStatus: currentStatus,
          cancelledAt: new Date(),
          notificationsSent: cancelData.notifyParties,
          policyViolation: !cancellationPolicy.compliant,
          fees: cancellationFees
        }
      });

      // Handle telemedicine session if exists
      if (appointmentData.hasTelemedicine && appointmentData.telemedicineSessionId) {
        const sessionRef = adminDb.collection('telemedicine_sessions').doc(appointmentData.telemedicineSessionId);
        batch.update(sessionRef, {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelReason: 'appointment_cancelled',
          updatedAt: new Date()
        });
      }

      // Update doctor's availability if needed
      if (appointmentData.doctorId) {
        await updateDoctorAvailability(appointmentData.doctorId, appointmentData.scheduledAt, 'release');
      }

      await batch.commit();

      // Send notifications if requested
      if (cancelData.notifyParties) {
        await sendCancellationNotifications(
          appointmentData,
          cancelData.reason,
          authContext.user,
          cancellationFees,
          cancelData.rescheduleRequested
        );
      }

      // Handle refund process if requested
      if (cancelData.refundRequested && appointmentData.paymentId) {
        await initiateRefundProcess(appointmentData.paymentId, cancellationFees, appointmentId);
      }

      // Process reschedule request if applicable
      let rescheduleInfo = null;
      if (cancelData.rescheduleRequested) {
        rescheduleInfo = await createRescheduleRequest(
          appointmentData,
          cancelData.preferredRescheduleDate,
          authContext.user.uid
        );
      }

      // Audit log for HIPAA compliance
      await adminDb.collection('audit_logs').add({
        action: 'appointment_cancelled',
        userId: authContext.user.uid,
        resourceType: 'appointment',
        resourceId: appointmentId,
        details: {
          patientId: appointmentData.patientId,
          doctorId: appointmentData.doctorId,
          originalStatus: currentStatus,
          reason: cancelData.reason,
          hadFees: cancellationFees.amount > 0,
          policyCompliant: cancellationPolicy.compliant,
          refundRequested: cancelData.refundRequested,
          rescheduleRequested: cancelData.rescheduleRequested
        },
        timestamp: new Date(),
        ipAddress: getClientIP(request),
        userAgent: request.headers.get('user-agent')
      });

      // Get updated appointment data
      const updatedDoc = await adminDb.collection('appointments').doc(appointmentId).get();
      const updatedAppointment = updatedDoc.data()!;

      return NextResponse.json(
        createSuccessResponse({
          id: appointmentId,
          ...updatedAppointment,
          scheduledAt: updatedAppointment.scheduledAt?.toDate() || updatedAppointment.scheduledAt,
          createdAt: updatedAppointment.createdAt?.toDate() || updatedAppointment.createdAt,
          updatedAt: updatedAppointment.updatedAt?.toDate() || updatedAppointment.updatedAt,
          cancelledAt: updatedAppointment.cancelledAt?.toDate() || updatedAppointment.cancelledAt,
          
          // Additional response data
          cancellationSummary: {
            fees: cancellationFees,
            policyCompliance: cancellationPolicy,
            rescheduleInfo: rescheduleInfo,
            notificationsSent: cancelData.notifyParties,
            refundInitiated: cancelData.refundRequested && appointmentData.paymentId
          }
        }, {
          message: 'Appointment cancelled successfully'
        })
      );

    } catch (error) {
      console.error('Error in PUT /appointments/[id]/cancel:', error);

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          createErrorResponse('VALIDATION_ERROR', 'Invalid cancellation data', {
            validationErrors: error.errors
          }),
          { status: 400 }
        );
      }

      return NextResponse.json(
        createErrorResponse('INTERNAL_ERROR', 'Error cancelling appointment'),
        { status: 500 }
      );
    }
  },
  {
    allowedRoles: ['admin', 'doctor', 'patient'],
    auditAction: 'appointment_cancelled',
    rateLimitKey: 'appointment_cancel'
  }
);

// Helper functions
async function checkCancellationPermissions(user: any, appointmentData: any): Promise<boolean> {
  // Admin can cancel any appointment
  if (user.role === 'admin') return true;
  
  // Patient can cancel their own appointments
  if (user.role === 'patient' && appointmentData.patientId === user.uid) return true;
  
  // Doctor can cancel appointments they're assigned to
  if (user.role === 'doctor' && appointmentData.doctorId === user.uid) return true;
  
  return false;
}

async function checkCancellationPolicyCompliance(scheduledAt: Date, userRole: string): Promise<any> {
  const now = new Date();
  const hoursUntilAppointment = (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // Different policies for different user types
  const policies = {
    patient: { minHours: 24, feePercentage: 0.25 },
    doctor: { minHours: 4, feePercentage: 0 },
    admin: { minHours: 0, feePercentage: 0 }
  };
  
  const policy = policies[userRole as keyof typeof policies] || policies.patient;
  const compliant = hoursUntilAppointment >= policy.minHours;
  
  return {
    compliant,
    hoursUntilAppointment: Math.round(hoursUntilAppointment * 10) / 10,
    minimumRequired: policy.minHours,
    feePercentage: compliant ? 0 : policy.feePercentage,
    policyType: userRole === 'patient' ? '24_hour_patient_policy' : 'provider_policy'
  };
}

function calculateCancellationFees(appointmentData: any, policyCompliance: any, userRole: string): any {
  if (policyCompliance.compliant || userRole === 'admin') {
    return { amount: 0, reason: 'policy_compliant' };
  }
  
  const baseAmount = appointmentData.consultationFee || 0;
  const feeAmount = baseAmount * policyCompliance.feePercentage;
  
  return {
    amount: Math.round(feeAmount * 100) / 100,
    baseAmount: baseAmount,
    percentage: policyCompliance.feePercentage * 100,
    reason: 'late_cancellation',
    currency: appointmentData.currency || 'ARS'
  };
}

async function updateDoctorAvailability(doctorId: string, scheduledAt: any, action: 'release' | 'block'): Promise<void> {
  try {
    // This would update the doctor's availability slots
    // Implementation depends on how availability is stored
    console.log(`${action === 'release' ? 'Released' : 'Blocked'} availability slot for doctor ${doctorId} at ${scheduledAt}`);
  } catch (error) {
    console.error('Error updating doctor availability:', error);
  }
}

async function sendCancellationNotifications(
  appointmentData: any, 
  reason: string, 
  cancelledBy: any,
  fees: any,
  rescheduleRequested: boolean
): Promise<void> {
  try {
    const notifications = [];
    
    // Notify patient if cancelled by doctor/admin
    if (cancelledBy.role !== 'patient') {
      notifications.push({
        userId: appointmentData.patientId,
        type: 'appointment_cancelled',
        title: 'Cita Cancelada',
        message: `Tu cita del ${appointmentData.scheduledAt?.toDate().toLocaleDateString()} ha been cancelada`,
        data: {
          appointmentId: appointmentData.id,
          reason: reason,
          cancelledBy: cancelledBy.role,
          fees: fees,
          rescheduleAvailable: rescheduleRequested
        },
        priority: 'high',
        isRead: false,
        createdAt: new Date()
      });
    }
    
    // Notify doctor if cancelled by patient/admin  
    if (cancelledBy.role !== 'doctor') {
      notifications.push({
        userId: appointmentData.doctorId,
        type: 'appointment_cancelled',
        title: 'Cita Cancelada',
        message: `La cita con paciente del ${appointmentData.scheduledAt?.toDate().toLocaleDateString()} ha sido cancelada`,
        data: {
          appointmentId: appointmentData.id,
          reason: reason,
          cancelledBy: cancelledBy.role,
          patientId: appointmentData.patientId
        },
        priority: 'medium',
        isRead: false,
        createdAt: new Date()
      });
    }
    
    // Send notifications
    for (const notification of notifications) {
      await adminDb.collection('notifications').add(notification);
    }
  } catch (error) {
    console.error('Error sending cancellation notifications:', error);
  }
}

async function initiateRefundProcess(paymentId: string, fees: any, appointmentId: string): Promise<void> {
  try {
    // Create refund request
    await adminDb.collection('refund_requests').add({
      paymentId: paymentId,
      appointmentId: appointmentId,
      requestedAmount: fees.baseAmount - fees.amount,
      cancellationFee: fees.amount,
      status: 'pending',
      reason: 'appointment_cancelled',
      createdAt: new Date(),
      processedAt: null
    });
    
    console.log(`Refund request created for payment ${paymentId}, amount: ${fees.baseAmount - fees.amount}`);
  } catch (error) {
    console.error('Error initiating refund process:', error);
  }
}

async function createRescheduleRequest(
  appointmentData: any, 
  preferredDate: string | undefined, 
  requestedBy: string
): Promise<any> {
  try {
    const rescheduleRequest = {
      originalAppointmentId: appointmentData.id,
      patientId: appointmentData.patientId,
      doctorId: appointmentData.doctorId,
      preferredDate: preferredDate ? new Date(preferredDate) : null,
      requestedBy: requestedBy,
      status: 'pending',
      reason: appointmentData.reason,
      duration: appointmentData.duration,
      type: appointmentData.type,
      createdAt: new Date()
    };
    
    const rescheduleRef = await adminDb.collection('reschedule_requests').add(rescheduleRequest);
    
    return {
      id: rescheduleRef.id,
      status: 'pending',
      preferredDate: preferredDate,
      message: 'Reschedule request created successfully'
    };
  } catch (error) {
    console.error('Error creating reschedule request:', error);
    return null;
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