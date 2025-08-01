import { adminDb } from "@/lib/firebase-admin";
import {
  createErrorResponse,
  createSuccessResponse,
  validatePagination,
} from "@/lib/response-helpers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema para crear una oferta de trabajo
const CreateJobOfferSchema = z.object({
  companyId: z.string().min(1, "ID de empresa requerido"),
  title: z.string().min(1, "Título requerido"),
  description: z.string().min(1, "Descripción requerida"),
  requirements: z.array(z.string()),
  responsibilities: z.array(z.string()),
  specialty: z.string().min(1, "Especialidad requerida"),
  jobType: z.enum(["full_time", "part_time", "contract", "freelance"]),
  workArrangement: z.enum(["remote", "hybrid", "on_site", "flexible"]),
  location: z.object({
    city: z.string(),
    state: z.string().optional(),
    country: z.string(),
    isRemote: z.boolean().default(false),
  }),
  salary: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().default("USD"),
    period: z.enum(["hour", "month", "year"]).default("year"),
  }),
  benefits: z.array(z.string()).default([]),
  experienceRequired: z.number().min(0).default(0),
  licenseRequired: z.boolean().default(true),
  languages: z.array(z.string()).default(["es"]),
  urgency: z.enum(["low", "medium", "high", "immediate"]).default("medium"),
  validUntil: z.string().optional(),
  contactInfo: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
    contactPerson: z.string().optional(),
  }),
});

// Schema para actualizar una oferta de trabajo
const UpdateJobOfferSchema = CreateJobOfferSchema.partial().extend({
  jobId: z.string().min(1, "ID de oferta requerido"),
  status: z.enum(["draft", "active", "paused", "closed", "expired"]).optional(),
});

// Schema para filtros de búsqueda
const JobSearchFiltersSchema = z.object({
  specialty: z.string().optional(),
  jobType: z.string().optional(),
  workArrangement: z.string().optional(),
  location: z.string().optional(),
  salaryMin: z.string().optional(),
  salaryMax: z.string().optional(),
  experienceMin: z.string().optional(),
  urgency: z.string().optional(),
  companyId: z.string().optional(),
  isRemote: z.boolean().optional(),
  benefits: z.array(z.string()).optional(),
});

/**
 * GET /api/v1/jobs
 * Obtener ofertas de trabajo disponibles
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit } = validatePagination(searchParams);

    // Extraer filtros
    const specialty = searchParams.get("specialty");
    const jobType = searchParams.get("jobType");
    const workArrangement = searchParams.get("workArrangement");
    const location = searchParams.get("location");
    const salaryMin = searchParams.get("salaryMin");
    const salaryMax = searchParams.get("salaryMax");
    const experienceMin = searchParams.get("experienceMin");
    const urgency = searchParams.get("urgency");
    const companyId = searchParams.get("companyId");
    const isRemote = searchParams.get("isRemote");

    // Construir query base
    let query = adminDb
      .collection("job_offers")
      .where("status", "==", "active")
      .where("isPublic", "==", true);

    // Aplicar filtros dinámicos
    if (specialty) {
      query = query.where("specialty", "==", specialty);
    }

    if (jobType) {
      query = query.where("jobType", "==", jobType);
    }

    if (workArrangement) {
      query = query.where("workArrangement", "==", workArrangement);
    }

    if (companyId) {
      query = query.where("companyId", "==", companyId);
    }

    if (isRemote === "true") {
      query = query.where("location.isRemote", "==", true);
    }

    if (urgency) {
      query = query.where("urgency", "==", urgency);
    }

    // Ejecutar query principal
    const snapshot = await query
      .orderBy("urgency", "desc")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset((page - 1) * limit)
      .get();

    const jobs = [];
    for (const doc of snapshot.docs) {
      const jobData = doc.data();

      // Filtros adicionales que requieren lógica personalizada
      if (location && !jobData.location.city.toLowerCase().includes(location.toLowerCase())) {
        continue;
      }

      if (salaryMin && jobData.salary.min < parseInt(salaryMin)) {
        continue;
      }

      if (salaryMax && jobData.salary.max > parseInt(salaryMax)) {
        continue;
      }

      if (experienceMin && jobData.experienceRequired < parseInt(experienceMin)) {
        continue;
      }

      // Obtener información de la empresa
      const companyDoc = await adminDb
        .collection("companies")
        .doc(jobData.companyId)
        .get();

      const companyData = companyDoc.exists ? companyDoc.data() : null;

      // Obtener aplicaciones para esta oferta
      const applicationsSnapshot = await adminDb
        .collection("job_applications")
        .where("jobId", "==", doc.id)
        .get();

      const totalApplications = applicationsSnapshot.size;
      const pendingApplications = applicationsSnapshot.docs.filter(
        app => app.data().status === "pending"
      ).length;

      // Calcular métricas
      const jobProfile = {
        id: doc.id,
        ...jobData,
        // Información de la empresa
        company: companyData ? {
          id: jobData.companyId,
          name: companyData.name,
          industry: companyData.industry,
          size: companyData.size,
          rating: companyData.rating || 0,
          logo: companyData.logo,
          website: companyData.website,
        } : null,
        // Métricas de la oferta
        totalApplications,
        pendingApplications,
        viewCount: jobData.viewCount || 0,
        averageResponseTime: companyData?.averageResponseTime || 48,
        // Información calculada
        daysActive: calculateDaysActive(jobData.createdAt),
        isUrgent: jobData.urgency === "high" || jobData.urgency === "immediate",
        isExpiringSoon: isExpiringSoon(jobData.validUntil),
        salaryRange: formatSalaryRange(jobData.salary),
        // Tags para búsqueda
        searchTags: generateSearchTags(jobData),
        // Score de relevancia
        relevanceScore: calculateRelevanceScore(jobData, {
          specialty,
          jobType,
          workArrangement,
          location,
          urgency,
        }),
      };

      jobs.push(jobProfile);
    }

    // Ordenar por relevancia si hay filtros de búsqueda
    const hasSearchFilters = specialty || jobType || workArrangement || location || urgency;
    if (hasSearchFilters) {
      jobs.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    // Obtener conteo total
    const totalSnapshot = await query.count().get();
    const total = totalSnapshot.data().count;

    // Estadísticas agregadas
    const stats = await generateJobStats(jobs);

    return NextResponse.json(
      createSuccessResponse({
        jobs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats,
        filters: {
          specialty,
          jobType,
          workArrangement,
          location,
          salaryMin,
          salaryMax,
          experienceMin,
          urgency,
          companyId,
          isRemote,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching job offers:", error);
    return NextResponse.json(
      createErrorResponse(
        "JOBS_FETCH_ERROR",
        "Error al obtener ofertas de trabajo"
      ),
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/jobs
 * Crear nueva oferta de trabajo
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const jobData = CreateJobOfferSchema.parse(body);

    // Verificar que la empresa existe
    const companyDoc = await adminDb
      .collection("companies")
      .doc(jobData.companyId)
      .get();

    if (!companyDoc.exists) {
      return NextResponse.json(
        createErrorResponse("COMPANY_NOT_FOUND", "Empresa no encontrada"),
        { status: 404 }
      );
    }

    const companyInfo = companyDoc.data();
    if (!companyInfo?.isVerified) {
      return NextResponse.json(
        createErrorResponse("COMPANY_NOT_VERIFIED", "Empresa no verificada"),
        { status: 400 }
      );
    }

    // Crear la oferta de trabajo
    const jobOfferData = {
      ...jobData,
      status: "active",
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Información adicional de la empresa
      companyInfo: {
        name: companyInfo.name,
        industry: companyInfo.industry,
        size: companyInfo.size,
        rating: companyInfo.rating || 0,
      },
      // Métricas iniciales
      viewCount: 0,
      applicationCount: 0,
      // Configuración
      autoExpire: true,
      validUntil: jobData.validUntil || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días por defecto
      // Tags de búsqueda
      searchTags: generateSearchTags(jobData),
    };

    const docRef = await adminDb
      .collection("job_offers")
      .add(jobOfferData);

    // Actualizar contador de ofertas de la empresa
    await adminDb
      .collection("companies")
      .doc(jobData.companyId)
      .update({
        totalJobPostings: adminDb.FieldValue.increment(1),
        activeJobPostings: adminDb.FieldValue.increment(1),
        lastJobPosted: new Date(),
        updatedAt: new Date(),
      });

    // Registrar evento
    await adminDb.collection("marketplace_events").add({
      type: "job_offer_created",
      jobId: docRef.id,
      companyId: jobData.companyId,
      timestamp: new Date(),
      details: {
        title: jobData.title,
        specialty: jobData.specialty,
        jobType: jobData.jobType,
        urgency: jobData.urgency,
        salaryRange: jobData.salary,
      },
    });

    // Notificar a médicos relevantes (opcional)
    await notifyRelevantDoctors(docRef.id, jobOfferData);

    return NextResponse.json(
      createSuccessResponse({
        id: docRef.id,
        ...jobOfferData,
        message: "Oferta de trabajo creada exitosamente",
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating job offer:", error);
    return NextResponse.json(
      createErrorResponse(
        "JOB_CREATION_ERROR",
        "Error al crear oferta de trabajo"
      ),
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/jobs
 * Actualizar oferta de trabajo existente
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const updateData = UpdateJobOfferSchema.parse(body);
    const { jobId, ...updateFields } = updateData;

    // Verificar que la oferta existe
    const jobDoc = await adminDb
      .collection("job_offers")
      .doc(jobId)
      .get();

    if (!jobDoc.exists) {
      return NextResponse.json(
        createErrorResponse("JOB_NOT_FOUND", "Oferta de trabajo no encontrada"),
        { status: 404 }
      );
    }

    // Actualizar la oferta
    const updatedData = {
      ...updateFields,
      updatedAt: new Date(),
      searchTags: updateFields.title || updateFields.specialty 
        ? generateSearchTags({ ...jobDoc.data(), ...updateFields })
        : undefined,
    };

    // Limpiar campos undefined
    Object.keys(updatedData).forEach(key => {
      if (updatedData[key] === undefined) {
        delete updatedData[key];
      }
    });

    await adminDb
      .collection("job_offers")
      .doc(jobId)
      .update(updatedData);

    // Registrar evento
    await adminDb.collection("marketplace_events").add({
      type: "job_offer_updated",
      jobId: jobId,
      companyId: jobDoc.data()?.companyId,
      timestamp: new Date(),
      details: {
        updatedFields: Object.keys(updateFields),
        previousStatus: jobDoc.data()?.status,
        newStatus: updateData.status,
      },
    });

    return NextResponse.json(
      createSuccessResponse({
        jobId,
        message: "Oferta de trabajo actualizada exitosamente",
        updatedFields: Object.keys(updateFields),
      })
    );
  } catch (error) {
    console.error("Error updating job offer:", error);
    return NextResponse.json(
      createErrorResponse(
        "JOB_UPDATE_ERROR",
        "Error al actualizar oferta de trabajo"
      ),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/jobs/[id]
 * Eliminar oferta de trabajo
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const jobId = url.pathname.split('/').pop();

    if (!jobId) {
      return NextResponse.json(
        createErrorResponse("INVALID_JOB_ID", "ID de oferta inválido"),
        { status: 400 }
      );
    }

    // Verificar que la oferta existe
    const jobDoc = await adminDb
      .collection("job_offers")
      .doc(jobId)
      .get();

    if (!jobDoc.exists) {
      return NextResponse.json(
        createErrorResponse("JOB_NOT_FOUND", "Oferta de trabajo no encontrada"),
        { status: 404 }
      );
    }

    const jobData = jobDoc.data();

    // Marcar como eliminada en lugar de eliminar físicamente
    await adminDb
      .collection("job_offers")
      .doc(jobId)
      .update({
        status: "deleted",
        deletedAt: new Date(),
        updatedAt: new Date(),
      });

    // Actualizar contador de la empresa
    await adminDb
      .collection("companies")
      .doc(jobData.companyId)
      .update({
        activeJobPostings: adminDb.FieldValue.increment(-1),
        updatedAt: new Date(),
      });

    // Registrar evento
    await adminDb.collection("marketplace_events").add({
      type: "job_offer_deleted",
      jobId: jobId,
      companyId: jobData.companyId,
      timestamp: new Date(),
      details: {
        title: jobData.title,
        reason: "manual_deletion",
      },
    });

    return NextResponse.json(
      createSuccessResponse({
        jobId,
        message: "Oferta de trabajo eliminada exitosamente",
      })
    );
  } catch (error) {
    console.error("Error deleting job offer:", error);
    return NextResponse.json(
      createErrorResponse(
        "JOB_DELETE_ERROR",
        "Error al eliminar oferta de trabajo"
      ),
      { status: 500 }
    );
  }
}

// Funciones auxiliares
function calculateDaysActive(createdAt: any): number {
  const created = createdAt.toDate();
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function isExpiringSoon(validUntil: any): boolean {
  if (!validUntil) return false;
  
  const expiryDate = typeof validUntil === 'string' ? new Date(validUntil) : validUntil.toDate();
  const now = new Date();
  const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  
  return daysUntilExpiry <= 7; // Expira en 7 días o menos
}

function formatSalaryRange(salary: any): string {
  const { min, max, currency, period } = salary;
  const formatCurrency = (amount: number) => `${currency} ${amount.toLocaleString()}`;
  
  return `${formatCurrency(min)} - ${formatCurrency(max)} / ${period}`;
}

function generateSearchTags(jobData: any): string[] {
  const tags = [];
  
  // Tags básicos
  if (jobData.title) tags.push(...jobData.title.toLowerCase().split(' '));
  if (jobData.specialty) tags.push(jobData.specialty.toLowerCase());
  if (jobData.jobType) tags.push(jobData.jobType.toLowerCase());
  if (jobData.workArrangement) tags.push(jobData.workArrangement.toLowerCase());
  
  // Tags de ubicación
  if (jobData.location) {
    if (jobData.location.city) tags.push(jobData.location.city.toLowerCase());
    if (jobData.location.country) tags.push(jobData.location.country.toLowerCase());
  }
  
  // Tags de beneficios
  if (jobData.benefits) {
    tags.push(...jobData.benefits.map((b: string) => b.toLowerCase()));
  }
  
  // Tags de idiomas
  if (jobData.languages) {
    tags.push(...jobData.languages.map((l: string) => l.toLowerCase()));
  }
  
  // Remover duplicados y vacíos
  return [...new Set(tags.filter(tag => tag && tag.length > 2))];
}

function calculateRelevanceScore(jobData: any, filters: any): number {
  let score = 0;
  
  // Puntuación por coincidencia de filtros
  if (filters.specialty && jobData.specialty === filters.specialty) score += 50;
  if (filters.jobType && jobData.jobType === filters.jobType) score += 30;
  if (filters.workArrangement && jobData.workArrangement === filters.workArrangement) score += 20;
  if (filters.urgency && jobData.urgency === filters.urgency) score += 15;
  
  // Puntuación por urgencia
  const urgencyScores = { immediate: 40, high: 30, medium: 20, low: 10 };
  score += urgencyScores[jobData.urgency] || 10;
  
  // Puntuación por recencia
  const daysActive = calculateDaysActive(jobData.createdAt);
  if (daysActive <= 7) score += 20;
  else if (daysActive <= 30) score += 10;
  
  // Puntuación por aplicaciones (menos aplicaciones = más relevante)
  const applicationCount = jobData.applicationCount || 0;
  if (applicationCount < 5) score += 15;
  else if (applicationCount < 20) score += 10;
  
  return Math.min(200, score); // Máximo 200 puntos
}

async function generateJobStats(jobs: any[]): Promise<any> {
  return {
    totalActive: jobs.length,
    bySpecialty: countByField(jobs, 'specialty'),
    byJobType: countByField(jobs, 'jobType'),
    byWorkArrangement: countByField(jobs, 'workArrangement'),
    byUrgency: countByField(jobs, 'urgency'),
    salaryRanges: calculateSalaryRanges(jobs),
    urgentJobs: jobs.filter(job => job.isUrgent).length,
    remoteJobs: jobs.filter(job => job.location?.isRemote).length,
    avgSalary: calculateAverageJobSalary(jobs),
    expiringSoon: jobs.filter(job => job.isExpiringSoon).length,
  };
}

function countByField(jobs: any[], field: string): Record<string, number> {
  const counts: Record<string, number> = {};
  jobs.forEach(job => {
    const value = job[field] || 'No especificado';
    counts[value] = (counts[value] || 0) + 1;
  });
  return counts;
}

function calculateSalaryRanges(jobs: any[]): Record<string, number> {
  const ranges = {
    '0-50k': 0,
    '50k-100k': 0,
    '100k-150k': 0,
    '150k+': 0,
  };
  
  jobs.forEach(job => {
    const maxSalary = job.salary?.max || 0;
    if (maxSalary < 50000) ranges['0-50k']++;
    else if (maxSalary < 100000) ranges['50k-100k']++;
    else if (maxSalary < 150000) ranges['100k-150k']++;
    else ranges['150k+']++;
  });
  
  return ranges;
}

function calculateAverageJobSalary(jobs: any[]): number {
  if (jobs.length === 0) return 0;
  
  const totalSalary = jobs.reduce((sum, job) => {
    const avgSalary = job.salary ? (job.salary.min + job.salary.max) / 2 : 0;
    return sum + avgSalary;
  }, 0);
  
  return totalSalary / jobs.length;
}

async function notifyRelevantDoctors(jobId: string, jobData: any): Promise<void> {
  try {
    // Buscar médicos que coincidan con la especialidad y estén disponibles para ofertas
    const doctorsSnapshot = await adminDb
      .collection("doctors")
      .where("specialties", "array-contains", jobData.specialty)
      .where("isActive", "==", true)
      .where("receiveJobNotifications", "==", true)
      .limit(50) // Limitar para evitar spam
      .get();

    const notifications = [];
    doctorsSnapshot.docs.forEach(doc => {
      notifications.push({
        userId: doc.id,
        type: "new_job_opportunity",
        title: "Nueva oportunidad de trabajo",
        message: `Nueva oferta: ${jobData.title} en ${jobData.companyInfo.name}`,
        data: {
          jobId,
          jobTitle: jobData.title,
          companyName: jobData.companyInfo.name,
          specialty: jobData.specialty,
          workArrangement: jobData.workArrangement,
          urgency: jobData.urgency,
        },
        createdAt: new Date(),
        isRead: false,
        priority: jobData.urgency === 'immediate' || jobData.urgency === 'high' ? 'high' : 'normal',
      });
    });

    // Crear notificaciones en lotes
    if (notifications.length > 0) {
      const batch = adminDb.batch();
      notifications.forEach(notification => {
        const notificationRef = adminDb.collection("notifications").doc();
        batch.set(notificationRef, notification);
      });
      await batch.commit();
    }
  } catch (error) {
    console.error("Error notifying relevant doctors:", error);
    // No fallar si las notificaciones fallan
  }
}