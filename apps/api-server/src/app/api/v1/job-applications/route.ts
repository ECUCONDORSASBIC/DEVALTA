import { adminDb } from "@/lib/firebase-admin";
import {
  createErrorResponse,
  createSuccessResponse,
  validatePagination,
} from "@/lib/response-helpers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema para crear una aplicación de trabajo
const CreateApplicationSchema = z.object({
  doctorId: z.string().min(1, "ID de doctor requerido"),
  jobId: z.string().min(1, "ID de oferta requerido"),
  coverLetter: z.string().min(10, "Carta de presentación requerida"),
  expectedSalary: z.number().min(0).optional(),
  availableStartDate: z.string().optional(),
  additionalNotes: z.string().optional(),
  portfolio: z.array(z.string()).optional(),
  references: z.array(z.object({
    name: z.string(),
    position: z.string(),
    contact: z.string(),
    relationship: z.string(),
  })).optional(),
});

// Schema para actualizar estado de aplicación
const UpdateApplicationStatusSchema = z.object({
  applicationId: z.string().min(1, "ID de aplicación requerido"),
  status: z.enum([
    "pending",
    "reviewing",
    "interview_scheduled", 
    "interview_completed",
    "approved",
    "rejected",
    "withdrawn",
    "hired"
  ]),
  feedback: z.string().optional(),
  interviewDate: z.string().optional(),
  rejectionReason: z.string().optional(),
  companyNotes: z.string().optional(),
});

/**
 * GET /api/v1/job-applications
 * Obtener aplicaciones de trabajo con filtros
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit } = validatePagination(searchParams);

    // Extraer filtros
    const doctorId = searchParams.get("doctorId");
    const companyId = searchParams.get("companyId");
    const jobId = searchParams.get("jobId");
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const specialty = searchParams.get("specialty");

    // Construir query base
    let query = adminDb.collection("job_applications");

    // Aplicar filtros dinámicos
    if (doctorId) {
      query = query.where("doctorId", "==", doctorId);
    }

    if (companyId) {
      query = query.where("companyId", "==", companyId);
    }

    if (jobId) {
      query = query.where("jobId", "==", jobId);
    }

    if (status) {
      query = query.where("status", "==", status);
    }

    // Ejecutar query principal
    const snapshot = await query
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset((page - 1) * limit)
      .get();

    const applications = [];
    for (const doc of snapshot.docs) {
      const applicationData = doc.data();

      // Filtros adicionales que requieren lógica personalizada
      if (dateFrom && applicationData.createdAt.toDate() < new Date(dateFrom)) {
        continue;
      }

      if (dateTo && applicationData.createdAt.toDate() > new Date(dateTo)) {
        continue;
      }

      // Obtener información del médico
      const doctorDoc = await adminDb
        .collection("doctors")
        .doc(applicationData.doctorId)
        .get();

      const doctorData = doctorDoc.exists ? doctorDoc.data() : null;

      // Filtrar por especialidad si se especifica
      if (specialty && doctorData && !doctorData.specialties?.includes(specialty)) {
        continue;
      }

      // Obtener información de la oferta de trabajo
      const jobDoc = await adminDb
        .collection("job_offers")
        .doc(applicationData.jobId)
        .get();

      const jobData = jobDoc.exists ? jobDoc.data() : null;

      // Obtener información de la empresa
      const companyDoc = jobData 
        ? await adminDb.collection("companies").doc(jobData.companyId).get()
        : null;

      const companyData = companyDoc?.exists ? companyDoc.data() : null;

      // Calcular métricas de compatibilidad
      const compatibilityScore = calculateDoctorJobCompatibility(
        doctorData,
        jobData
      );

      const applicationProfile = {
        id: doc.id,
        ...applicationData,
        // Información del médico
        doctor: doctorData ? {
          id: applicationData.doctorId,
          name: doctorData.name,
          specialties: doctorData.specialties || [],
          experience: doctorData.totalExperience || 0,
          rating: doctorData.rating || 0,
          location: doctorData.location,
          photo: doctorData.photo,
          license: doctorData.license,
        } : null,
        // Información de la oferta
        job: jobData ? {
          id: applicationData.jobId,
          title: jobData.title,
          specialty: jobData.specialty,
          jobType: jobData.jobType,
          workArrangement: jobData.workArrangement,
          location: jobData.location,
          salary: jobData.salary,
          urgency: jobData.urgency,
          status: jobData.status,
        } : null,
        // Información de la empresa
        company: companyData ? {
          id: jobData.companyId,
          name: companyData.name,
          industry: companyData.industry,
          size: companyData.size,
          rating: companyData.rating || 0,
          logo: companyData.logo,
        } : null,
        // Métricas calculadas
        compatibilityScore,
        daysSinceApplication: calculateDaysSince(applicationData.createdAt),
        isUrgentPosition: jobData?.urgency === "high" || jobData?.urgency === "immediate",
        expectedResponseTime: companyData?.averageResponseTime || 72,
        // Estado y progreso
        statusHistory: applicationData.statusHistory || [],
        currentStep: getCurrentApplicationStep(applicationData.status),
        nextAction: getNextApplicationAction(applicationData.status),
      };

      applications.push(applicationProfile);
    }

    // Obtener conteo total
    const totalSnapshot = await query.count().get();
    const total = totalSnapshot.data().count;

    // Estadísticas agregadas
    const stats = await generateApplicationStats(applications);

    return NextResponse.json(
      createSuccessResponse({
        applications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats,
        filters: {
          doctorId,
          companyId,
          jobId,
          status,
          dateFrom,
          dateTo,
          specialty,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching job applications:", error);
    return NextResponse.json(
      createErrorResponse(
        "APPLICATIONS_FETCH_ERROR",
        "Error al obtener aplicaciones de trabajo"
      ),
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/job-applications
 * Crear nueva aplicación de trabajo
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const applicationData = CreateApplicationSchema.parse(body);

    // Verificar que el médico existe y está verificado
    const doctorDoc = await adminDb
      .collection("doctors")
      .doc(applicationData.doctorId)
      .get();

    if (!doctorDoc.exists) {
      return NextResponse.json(
        createErrorResponse("DOCTOR_NOT_FOUND", "Médico no encontrado"),
        { status: 404 }
      );
    }

    const doctorInfo = doctorDoc.data();
    if (!doctorInfo?.isVerified) {
      return NextResponse.json(
        createErrorResponse("DOCTOR_NOT_VERIFIED", "Médico no verificado"),
        { status: 400 }
      );
    }

    // Verificar que la oferta existe y está activa
    const jobDoc = await adminDb
      .collection("job_offers")
      .doc(applicationData.jobId)
      .get();

    if (!jobDoc.exists) {
      return NextResponse.json(
        createErrorResponse("JOB_NOT_FOUND", "Oferta de trabajo no encontrada"),
        { status: 404 }
      );
    }

    const jobInfo = jobDoc.data();
    if (jobInfo?.status !== "active") {
      return NextResponse.json(
        createErrorResponse("JOB_NOT_ACTIVE", "Oferta de trabajo no está activa"),
        { status: 400 }
      );
    }

    // Verificar que no haya aplicado previamente
    const existingApplication = await adminDb
      .collection("job_applications")
      .where("doctorId", "==", applicationData.doctorId)
      .where("jobId", "==", applicationData.jobId)
      .get();

    if (!existingApplication.empty) {
      return NextResponse.json(
        createErrorResponse(
          "APPLICATION_EXISTS",
          "Ya has aplicado a esta oferta de trabajo"
        ),
        { status: 409 }
      );
    }

    // Calcular compatibilidad
    const compatibilityScore = calculateDoctorJobCompatibility(
      doctorInfo,
      jobInfo
    );

    // Crear la aplicación
    const newApplicationData = {
      ...applicationData,
      companyId: jobInfo.companyId,
      status: "pending",
      compatibilityScore,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Información del médico en el momento de aplicar
      doctorSnapshot: {
        name: doctorInfo.name,
        specialties: doctorInfo.specialties,
        experience: doctorInfo.totalExperience,
        rating: doctorInfo.rating,
        location: doctorInfo.location,
        education: doctorInfo.education,
        certifications: doctorInfo.certifications,
      },
      // Información de la oferta en el momento de aplicar
      jobSnapshot: {
        title: jobInfo.title,
        specialty: jobInfo.specialty,
        companyId: jobInfo.companyId,
        salary: jobInfo.salary,
        location: jobInfo.location,
        workArrangement: jobInfo.workArrangement,
      },
      // Historial de estados
      statusHistory: [{
        status: "pending",
        timestamp: new Date(),
        note: "Aplicación enviada",
      }],
    };

    const docRef = await adminDb
      .collection("job_applications")
      .add(newApplicationData);

    // Actualizar contador de aplicaciones en la oferta
    await adminDb
      .collection("job_offers")
      .doc(applicationData.jobId)
      .update({
        applicationCount: adminDb.FieldValue.increment(1),
        updatedAt: new Date(),
      });

    // Actualizar contador de aplicaciones del médico
    await adminDb
      .collection("doctors")
      .doc(applicationData.doctorId)
      .update({
        totalJobApplications: adminDb.FieldValue.increment(1),
        lastApplicationDate: new Date(),
        updatedAt: new Date(),
      });

    // Registrar evento
    await adminDb.collection("marketplace_events").add({
      type: "job_application_created",
      applicationId: docRef.id,
      doctorId: applicationData.doctorId,
      jobId: applicationData.jobId,
      companyId: jobInfo.companyId,
      timestamp: new Date(),
      details: {
        jobTitle: jobInfo.title,
        doctorName: doctorInfo.name,
        specialty: jobInfo.specialty,
        compatibilityScore,
      },
    });

    // Notificar a la empresa
    await adminDb.collection("notifications").add({
      userId: jobInfo.companyId,
      type: "new_job_application",
      title: "Nueva aplicación recibida",
      message: `${doctorInfo.name} ha aplicado a la oferta: ${jobInfo.title}`,
      data: {
        applicationId: docRef.id,
        jobId: applicationData.jobId,
        doctorId: applicationData.doctorId,
        compatibilityScore,
      },
      createdAt: new Date(),
      isRead: false,
      priority: compatibilityScore > 80 ? "high" : "normal",
    });

    // Notificar al médico de confirmación
    await adminDb.collection("notifications").add({
      userId: applicationData.doctorId,
      type: "application_confirmed",
      title: "Aplicación enviada exitosamente",
      message: `Tu aplicación a ${jobInfo.title} ha sido enviada`,
      data: {
        applicationId: docRef.id,
        jobId: applicationData.jobId,
        jobTitle: jobInfo.title,
      },
      createdAt: new Date(),
      isRead: false,
    });

    return NextResponse.json(
      createSuccessResponse({
        id: docRef.id,
        ...newApplicationData,
        message: "Aplicación enviada exitosamente",
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating job application:", error);
    return NextResponse.json(
      createErrorResponse(
        "APPLICATION_CREATION_ERROR",
        "Error al crear aplicación de trabajo"
      ),
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/job-applications
 * Actualizar estado de aplicación
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const updateData = UpdateApplicationStatusSchema.parse(body);

    // Verificar que la aplicación existe
    const applicationDoc = await adminDb
      .collection("job_applications")
      .doc(updateData.applicationId)
      .get();

    if (!applicationDoc.exists) {
      return NextResponse.json(
        createErrorResponse("APPLICATION_NOT_FOUND", "Aplicación no encontrada"),
        { status: 404 }
      );
    }

    const currentData = applicationDoc.data();
    const previousStatus = currentData?.status;

    // Preparar datos de actualización
    const updateFields = {
      status: updateData.status,
      updatedAt: new Date(),
    };

    // Agregar campos opcionales
    if (updateData.feedback) updateFields.feedback = updateData.feedback;
    if (updateData.interviewDate) updateFields.interviewDate = updateData.interviewDate;
    if (updateData.rejectionReason) updateFields.rejectionReason = updateData.rejectionReason;
    if (updateData.companyNotes) updateFields.companyNotes = updateData.companyNotes;

    // Actualizar historial de estados
    const statusHistoryEntry = {
      status: updateData.status,
      timestamp: new Date(),
      note: updateData.feedback || getStatusChangeNote(previousStatus, updateData.status),
      previousStatus,
    };

    updateFields.statusHistory = adminDb.FieldValue.arrayUnion(statusHistoryEntry);

    // Actualizar la aplicación
    await adminDb
      .collection("job_applications")
      .doc(updateData.applicationId)
      .update(updateFields);

    // Notificar al médico sobre el cambio de estado
    await adminDb.collection("notifications").add({
      userId: currentData.doctorId,
      type: "application_status_updated",
      title: `Estado de aplicación actualizado: ${getStatusDisplayName(updateData.status)}`,
      message: getStatusNotificationMessage(updateData.status, currentData.jobSnapshot?.title),
      data: {
        applicationId: updateData.applicationId,
        newStatus: updateData.status,
        previousStatus,
        feedback: updateData.feedback,
        interviewDate: updateData.interviewDate,
      },
      createdAt: new Date(),
      isRead: false,
      priority: ["approved", "hired", "rejected"].includes(updateData.status) ? "high" : "normal",
    });

    // Registrar evento
    await adminDb.collection("marketplace_events").add({
      type: "application_status_updated",
      applicationId: updateData.applicationId,
      doctorId: currentData.doctorId,
      jobId: currentData.jobId,
      companyId: currentData.jobSnapshot?.companyId,
      timestamp: new Date(),
      details: {
        previousStatus,
        newStatus: updateData.status,
        feedback: updateData.feedback,
        automated: false,
      },
    });

    return NextResponse.json(
      createSuccessResponse({
        applicationId: updateData.applicationId,
        previousStatus,
        newStatus: updateData.status,
        message: "Estado de aplicación actualizado exitosamente",
      })
    );
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      createErrorResponse(
        "APPLICATION_UPDATE_ERROR",
        "Error al actualizar estado de aplicación"
      ),
      { status: 500 }
    );
  }
}

// Funciones auxiliares
function calculateDoctorJobCompatibility(doctorData: any, jobData: any): number {
  let score = 0;
  const maxScore = 100;

  // Compatibilidad de especialidad (40 puntos)
  if (doctorData?.specialties?.includes(jobData?.specialty)) {
    score += 40;
  } else if (doctorData?.specialties?.some((spec: string) => 
    jobData?.specialty?.toLowerCase().includes(spec.toLowerCase()))) {
    score += 20;
  }

  // Experiencia vs requisitos (25 puntos)
  const doctorExperience = doctorData?.totalExperience || 0;
  const requiredExperience = jobData?.experienceRequired || 0;
  
  if (doctorExperience >= requiredExperience) {
    score += 25;
    // Bonus por experiencia adicional
    const extraYears = doctorExperience - requiredExperience;
    score += Math.min(10, extraYears * 2);
  } else {
    // Penalización por falta de experiencia
    const missingYears = requiredExperience - doctorExperience;
    score += Math.max(0, 25 - (missingYears * 5));
  }

  // Ubicación geográfica (15 puntos)
  if (jobData?.workArrangement === "remote") {
    score += 15;
  } else if (doctorData?.location?.city === jobData?.location?.city) {
    score += 15;
  } else if (doctorData?.location?.state === jobData?.location?.state) {
    score += 10;
  } else if (doctorData?.location?.country === jobData?.location?.country) {
    score += 5;
  }

  // Rating del médico (10 puntos)
  const rating = doctorData?.rating || 0;
  score += (rating / 5) * 10;

  // Idiomas (5 puntos)
  const doctorLanguages = doctorData?.languages || ["es"];
  const jobLanguages = jobData?.languages || ["es"];
  const commonLanguages = doctorLanguages.filter((lang: string) => 
    jobLanguages.includes(lang));
  
  if (commonLanguages.length > 0) {
    score += 5;
  }

  // Licencia médica (5 puntos)
  if (jobData?.licenseRequired === false || doctorData?.license) {
    score += 5;
  }

  return Math.min(maxScore, Math.round(score));
}

function calculateDaysSince(timestamp: any): number {
  const date = timestamp.toDate();
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getCurrentApplicationStep(status: string): string {
  const stepMap = {
    pending: "Aplicación enviada",
    reviewing: "Bajo revisión",
    interview_scheduled: "Entrevista programada",
    interview_completed: "Entrevista completada",
    approved: "Aprobado",
    rejected: "Rechazado",
    withdrawn: "Retirado",
    hired: "Contratado",
  };
  return stepMap[status] || "Estado desconocido";
}

function getNextApplicationAction(status: string): string {
  const actionMap = {
    pending: "Esperar revisión de la empresa",
    reviewing: "Esperar decisión de entrevista",
    interview_scheduled: "Prepararse para la entrevista",
    interview_completed: "Esperar decisión final",
    approved: "Negociar términos de contratación",
    rejected: "Aplicar a otras ofertas",
    withdrawn: "Aplicar a otras ofertas",
    hired: "Proceso completado",
  };
  return actionMap[status] || "Contactar con la empresa";
}

function getStatusDisplayName(status: string): string {
  const displayNames = {
    pending: "Pendiente",
    reviewing: "En revisión",
    interview_scheduled: "Entrevista programada",
    interview_completed: "Entrevista completada",
    approved: "Aprobado",
    rejected: "Rechazado",
    withdrawn: "Retirado",
    hired: "Contratado",
  };
  return displayNames[status] || status;
}

function getStatusChangeNote(previousStatus: string, newStatus: string): string {
  if (newStatus === "reviewing") return "La empresa está revisando tu aplicación";
  if (newStatus === "interview_scheduled") return "Se ha programado una entrevista";
  if (newStatus === "interview_completed") return "Entrevista completada";
  if (newStatus === "approved") return "Tu aplicación ha sido aprobada";
  if (newStatus === "rejected") return "Tu aplicación ha sido rechazada";
  if (newStatus === "hired") return "¡Felicitaciones! Has sido contratado";
  return `Estado actualizado de ${previousStatus} a ${newStatus}`;
}

function getStatusNotificationMessage(status: string, jobTitle?: string): string {
  const title = jobTitle || "la oferta de trabajo";
  
  switch (status) {
    case "reviewing":
      return `La empresa está revisando tu aplicación para ${title}`;
    case "interview_scheduled":
      return `Se ha programado una entrevista para ${title}`;
    case "interview_completed":
      return `Tu entrevista para ${title} ha sido registrada como completada`;
    case "approved":
      return `¡Excelentes noticias! Tu aplicación para ${title} ha sido aprobada`;
    case "rejected":
      return `Tu aplicación para ${title} no fue seleccionada en esta ocasión`;
    case "hired":
      return `¡Felicitaciones! Has sido contratado para ${title}`;
    default:
      return `El estado de tu aplicación para ${title} ha sido actualizado`;
  }
}

async function generateApplicationStats(applications: any[]): Promise<any> {
  return {
    total: applications.length,
    byStatus: countByField(applications, 'status'),
    bySpecialty: countByField(applications, 'job.specialty'),
    byWorkArrangement: countByField(applications, 'job.workArrangement'),
    averageCompatibilityScore: calculateAverageCompatibility(applications),
    urgentApplications: applications.filter(app => app.isUrgentPosition).length,
    recentApplications: applications.filter(app => app.daysSinceApplication <= 7).length,
    highCompatibilityCount: applications.filter(app => app.compatibilityScore >= 80).length,
    averageDaysToProcess: calculateAverageProcessingTime(applications),
  };
}

function countByField(items: any[], field: string): Record<string, number> {
  const counts: Record<string, number> = {};
  items.forEach(item => {
    const value = getNestedValue(item, field) || 'No especificado';
    counts[value] = (counts[value] || 0) + 1;
  });
  return counts;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function calculateAverageCompatibility(applications: any[]): number {
  if (applications.length === 0) return 0;
  
  const totalScore = applications.reduce((sum, app) => sum + (app.compatibilityScore || 0), 0);
  return Math.round(totalScore / applications.length);
}

function calculateAverageProcessingTime(applications: any[]): number {
  const processedApps = applications.filter(app => 
    ["approved", "rejected", "hired"].includes(app.status));
  
  if (processedApps.length === 0) return 0;
  
  const totalDays = processedApps.reduce((sum, app) => sum + app.daysSinceApplication, 0);
  return Math.round(totalDays / processedApps.length);
}