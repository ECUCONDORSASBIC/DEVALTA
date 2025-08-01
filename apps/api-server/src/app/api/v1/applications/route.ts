import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/auth';
import { auditLog } from '@/lib/audit';
import { rateLimit } from '@/lib/rate-limit';
import { sendNotification } from '@/lib/notifications';

// Esquemas de validación
const applicationSchema = z.object({
  type: z.enum(['appointment', 'prescription', 'lab_test', 'referral', 'medical_leave', 'insurance_claim']),
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(1000),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).optional(),
  metadata: z.object({
    specialty: z.string().optional(),
    department: z.string().optional(),
    insuranceId: z.string().optional(),
    referenceNumber: z.string().optional(),
    attachments: z.array(z.string()).optional(),
    notes: z.string().optional()
  }).optional(),
  requiredApprovals: z.array(z.string()).optional(),
  estimatedDuration: z.number().min(5).max(480).optional() // minutos
});

const applicationUpdateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled']).optional(),
  assignedTo: z.string().optional(),
  notes: z.string().max(500).optional(),
  completedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).optional(),
  metadata: z.object({
    rejectionReason: z.string().optional(),
    completionNotes: z.string().optional(),
    followUpRequired: z.boolean().optional(),
    nextAppointment: z.string().optional()
  }).optional()
});

const applicationFilterSchema = z.object({
  type: z.enum(['appointment', 'prescription', 'lab_test', 'referral', 'medical_leave', 'insurance_claim']).optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  assignedTo: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20)
});

// GET - Obtener aplicaciones/solicitudes
export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, 'applications');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    // Autenticación
    const auth = await verifyAuth(req);
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validar parámetros de filtro
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams);
    
    const validation = applicationFilterSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid filter parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const filters = validation.data;

    // Obtener aplicaciones según los filtros y permisos del usuario
    const applications = await getApplications(auth.user, filters);

    // Audit log
    await auditLog({
      action: 'applications_accessed',
      userId: auth.user.id,
      resource: 'applications',
      details: { filters, resultCount: applications.data.length }
    });

    return NextResponse.json({
      success: true,
      data: applications.data,
      pagination: applications.pagination,
      summary: applications.summary
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva aplicación/solicitud
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, 'create-application');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    // Autenticación
    const auth = await verifyAuth(req);
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validar datos
    const body = await req.json();
    const validation = applicationSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid application data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const applicationData = validation.data;

    // Verificar permisos para crear el tipo de aplicación
    const canCreate = await verifyCreatePermission(auth.user, applicationData.type);
    if (!canCreate) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Crear aplicación
    const newApplication = await createApplication(auth.user, applicationData);

    // Enviar notificaciones
    await sendApplicationNotifications(newApplication, 'created');

    // Audit log
    await auditLog({
      action: 'application_created',
      userId: auth.user.id,
      resource: 'applications',
      resourceId: newApplication.id,
      details: { 
        type: applicationData.type,
        patientId: applicationData.patientId,
        priority: applicationData.priority
      }
    });

    return NextResponse.json({
      success: true,
      data: newApplication,
      message: 'Application created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar aplicación/solicitud
export async function PUT(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, 'update-application');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    // Autenticación
    const auth = await verifyAuth(req);
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get('id');

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    // Validar datos de actualización
    const body = await req.json();
    const validation = applicationUpdateSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid update data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // Verificar permisos para actualizar
    const canUpdate = await verifyUpdatePermission(auth.user, applicationId, updateData);
    if (!canUpdate) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Actualizar aplicación
    const updatedApplication = await updateApplication(auth.user, applicationId, updateData);

    // Enviar notificaciones según el cambio
    await sendApplicationNotifications(updatedApplication, 'updated');

    // Audit log
    await auditLog({
      action: 'application_updated',
      userId: auth.user.id,
      resource: 'applications',
      resourceId: applicationId,
      details: { 
        updatedFields: Object.keys(updateData),
        previousStatus: updatedApplication.previousStatus,
        newStatus: updatedApplication.status
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: 'Application updated successfully'
    });

  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Cancelar aplicación/solicitud
export async function DELETE(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, 'delete-application');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    // Autenticación
    const auth = await verifyAuth(req);
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get('id');
    const reason = searchParams.get('reason') || 'User requested cancellation';

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    // Verificar permisos para cancelar
    const canCancel = await verifyCancelPermission(auth.user, applicationId);
    if (!canCancel) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Cancelar aplicación (soft delete)
    const cancelledApplication = await cancelApplication(auth.user, applicationId, reason);

    // Enviar notificaciones
    await sendApplicationNotifications(cancelledApplication, 'cancelled');

    // Audit log
    await auditLog({
      action: 'application_cancelled',
      userId: auth.user.id,
      resource: 'applications',
      resourceId: applicationId,
      details: { reason, cancelledAt: new Date().toISOString() }
    });

    return NextResponse.json({
      success: true,
      data: cancelledApplication,
      message: 'Application cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Función para obtener aplicaciones
async function getApplications(user: any, filters: any) {
  // Simular consulta a base de datos (reemplazar con consulta real)
  const mockApplications = [
    {
      id: '1',
      type: 'appointment',
      patientId: 'p1',
      patientName: 'Juan Pérez',
      doctorId: 'd1',
      doctorName: 'Dr. María García',
      title: 'Consulta cardiológica de control',
      description: 'Paciente requiere control rutinario de hipertensión',
      status: 'pending',
      priority: 'medium',
      createdAt: '2024-01-15T10:00:00Z',
      scheduledDate: '2024-01-20T14:30:00Z',
      metadata: {
        specialty: 'Cardiología',
        department: 'Consultorios Externos',
        estimatedDuration: 30
      }
    },
    {
      id: '2',
      type: 'prescription',
      patientId: 'p2',
      patientName: 'Ana López',
      doctorId: 'd2',
      doctorName: 'Dr. Carlos Rodríguez',
      title: 'Receta para medicación crónica',
      description: 'Renovación de prescripción para diabetes tipo 2',
      status: 'approved',
      priority: 'high',
      createdAt: '2024-01-14T09:15:00Z',
      metadata: {
        specialty: 'Endocrinología',
        medications: ['Metformina 500mg', 'Insulina NPH']
      }
    },
    {
      id: '3',
      type: 'lab_test',
      patientId: 'p3',
      patientName: 'Pedro Martínez',
      doctorId: 'd1',
      doctorName: 'Dr. María García',
      title: 'Análisis de sangre completo',
      description: 'Hemograma, glucemia y perfil lipídico',
      status: 'in_progress',
      priority: 'medium',
      createdAt: '2024-01-13T11:20:00Z',
      scheduledDate: '2024-01-18T08:00:00Z',
      metadata: {
        tests: ['Hemograma', 'Glucemia', 'Colesterol total', 'HDL', 'LDL']
      }
    }
  ];

  // Aplicar filtros
  let filteredApplications = mockApplications;

  if (filters.type) {
    filteredApplications = filteredApplications.filter(app => app.type === filters.type);
  }

  if (filters.status) {
    filteredApplications = filteredApplications.filter(app => app.status === filters.status);
  }

  if (filters.priority) {
    filteredApplications = filteredApplications.filter(app => app.priority === filters.priority);
  }

  if (filters.patientId) {
    filteredApplications = filteredApplications.filter(app => app.patientId === filters.patientId);
  }

  if (filters.doctorId) {
    filteredApplications = filteredApplications.filter(app => app.doctorId === filters.doctorId);
  }

  // Filtrar por permisos del usuario
  if (user.roles.includes('patient')) {
    filteredApplications = filteredApplications.filter(app => app.patientId === user.patientId);
  } else if (user.roles.includes('doctor') && !user.roles.includes('admin')) {
    filteredApplications = filteredApplications.filter(app => app.doctorId === user.id);
  }

  // Paginación
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

  return {
    data: paginatedApplications,
    pagination: {
      page,
      limit,
      total: filteredApplications.length,
      pages: Math.ceil(filteredApplications.length / limit)
    },
    summary: {
      totalApplications: filteredApplications.length,
      byStatus: {
        pending: filteredApplications.filter(app => app.status === 'pending').length,
        approved: filteredApplications.filter(app => app.status === 'approved').length,
        rejected: filteredApplications.filter(app => app.status === 'rejected').length,
        in_progress: filteredApplications.filter(app => app.status === 'in_progress').length,
        completed: filteredApplications.filter(app => app.status === 'completed').length,
        cancelled: filteredApplications.filter(app => app.status === 'cancelled').length
      },
      byPriority: {
        low: filteredApplications.filter(app => app.priority === 'low').length,
        medium: filteredApplications.filter(app => app.priority === 'medium').length,
        high: filteredApplications.filter(app => app.priority === 'high').length,
        urgent: filteredApplications.filter(app => app.priority === 'urgent').length
      }
    }
  };
}

// Función para crear aplicación
async function createApplication(user: any, applicationData: any) {
  const newApplication = {
    id: generateId(),
    ...applicationData,
    status: 'pending',
    createdAt: new Date().toISOString(),
    createdBy: user.id,
    updatedAt: new Date().toISOString(),
    assignedTo: null,
    workflow: {
      currentStep: 1,
      totalSteps: getWorkflowSteps(applicationData.type),
      history: [{
        step: 1,
        action: 'created',
        user: user.id,
        timestamp: new Date().toISOString(),
        notes: 'Application created'
      }]
    }
  };

  // Simular inserción en base de datos
  return newApplication;
}

// Función para actualizar aplicación
async function updateApplication(user: any, applicationId: string, updateData: any) {
  // Simular actualización en base de datos
  const updatedApplication = {
    id: applicationId,
    ...updateData,
    updatedAt: new Date().toISOString(),
    updatedBy: user.id,
    previousStatus: 'pending', // Obtener del estado anterior
    workflow: {
      currentStep: 2,
      totalSteps: 3,
      history: [
        {
          step: 2,
          action: 'updated',
          user: user.id,
          timestamp: new Date().toISOString(),
          notes: updateData.notes || 'Application updated'
        }
      ]
    }
  };

  return updatedApplication;
}

// Función para cancelar aplicación
async function cancelApplication(user: any, applicationId: string, reason: string) {
  // Simular cancelación en base de datos
  const cancelledApplication = {
    id: applicationId,
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
    cancelledBy: user.id,
    cancellationReason: reason,
    updatedAt: new Date().toISOString()
  };

  return cancelledApplication;
}

// Funciones de verificación de permisos
async function verifyCreatePermission(user: any, type: string): Promise<boolean> {
  const permissions = {
    'appointment': ['doctor', 'patient', 'nurse'],
    'prescription': ['doctor'],
    'lab_test': ['doctor', 'nurse'],
    'referral': ['doctor'],
    'medical_leave': ['doctor'],
    'insurance_claim': ['doctor', 'admin']
  };

  return permissions[type]?.some(role => user.roles.includes(role)) || false;
}

async function verifyUpdatePermission(user: any, applicationId: string, updateData: any): Promise<boolean> {
  // Verificar permisos específicos según el tipo de actualización
  if (updateData.status === 'approved' || updateData.status === 'rejected') {
    return user.roles.includes('doctor') || user.roles.includes('admin');
  }
  
  return user.roles.includes('doctor') || user.roles.includes('nurse') || user.roles.includes('admin');
}

async function verifyCancelPermission(user: any, applicationId: string): Promise<boolean> {
  // Los pacientes pueden cancelar sus propias aplicaciones, médicos y admin pueden cancelar cualquiera
  return user.roles.includes('patient') || user.roles.includes('doctor') || user.roles.includes('admin');
}

// Función para enviar notificaciones
async function sendApplicationNotifications(application: any, action: string) {
  const notificationData = {
    type: `application_${action}`,
    title: `Application ${action}`,
    message: `Application "${application.title}" has been ${action}`,
    recipients: [application.patientId, application.doctorId],
    data: { applicationId: application.id }
  };

  await sendNotification(notificationData);
}

// Función para obtener pasos del workflow
function getWorkflowSteps(type: string): number {
  const steps = {
    'appointment': 3, // Crear -> Aprobar -> Confirmar
    'prescription': 2, // Crear -> Aprobar
    'lab_test': 4, // Crear -> Aprobar -> Realizar -> Completar
    'referral': 3, // Crear -> Aprobar -> Derivar
    'medical_leave': 3, // Crear -> Revisar -> Aprobar
    'insurance_claim': 4 // Crear -> Revisar -> Aprobar -> Procesar
  };

  return steps[type] || 2;
}

// Función auxiliar para generar ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
