import { adminDb } from "@/lib/firebase-admin";
import {
  createErrorResponse,
  createSuccessResponse,
  validatePagination,
} from "@/lib/response-helpers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema para filtros de empresas visibles
const CompanyVisibilityFiltersSchema = z.object({
  industry: z.string().optional(),
  location: z.string().optional(),
  size: z.enum(["startup", "small", "medium", "large", "enterprise"]).optional(),
  jobType: z.enum(["full_time", "part_time", "contract", "freelance"]).optional(),
  salaryRange: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  remoteWork: z.boolean().optional(),
  urgency: z.enum(["immediate", "week", "month", "flexible"]).optional(),
});

// Schema para actualizar visibilidad de empresa
const UpdateCompanyVisibilitySchema = z.object({
  companyId: z.string().min(1, "ID de empresa requerido"),
  isVisibleToDoctors: z.boolean(),
  isActivelyHiring: z.boolean().optional(),
  preferredSpecialties: z.array(z.string()).optional(),
  maxBudgetPerHour: z.number().min(0).optional(),
  workArrangement: z.enum(["remote", "hybrid", "on_site", "flexible"]).optional(),
  urgentPositions: z.number().min(0).optional(),
});

/**
 * GET /api/v1/companies/visible
 * Obtener empresas visibles para médicos
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit } = validatePagination(searchParams);

    // Extraer filtros
    const industry = searchParams.get("industry");
    const location = searchParams.get("location");
    const size = searchParams.get("size");
    const jobType = searchParams.get("jobType");
    const salaryRange = searchParams.get("salaryRange");
    const remoteWork = searchParams.get("remoteWork");
    const urgency = searchParams.get("urgency");

    // Construir query base para empresas visibles
    let query = adminDb
      .collection("companies")
      .where("isActive", "==", true)
      .where("isVerified", "==", true)
      .where("isVisibleToDoctors", "==", true);

    // Aplicar filtros dinámicamente
    if (industry) {
      query = query.where("industry", "==", industry);
    }

    if (location) {
      query = query.where("location.city", "==", location);
    }

    if (size) {
      query = query.where("size", "==", size);
    }

    if (remoteWork === "true") {
      query = query.where("offersRemoteWork", "==", true);
    }

    // Ejecutar query principal
    const snapshot = await query
      .orderBy("rating", "desc")
      .orderBy("totalJobPostings", "desc")
      .limit(limit)
      .offset((page - 1) * limit)
      .get();

    const companies = [];
    for (const doc of snapshot.docs) {
      const companyData = doc.data();

      // Filtros adicionales que requieren lógica personalizada
      if (salaryRange && !isWithinSalaryRange(companyData, salaryRange)) {
        continue;
      }

      if (urgency && !hasUrgentPositions(companyData, urgency)) {
        continue;
      }

      // Obtener ofertas de trabajo activas
      const jobOffersSnapshot = await adminDb
        .collection("job_offers")
        .where("companyId", "==", doc.id)
        .where("isActive", "==", true)
        .where("status", "==", "open")
        .get();

      const activeJobOffers = jobOffersSnapshot.docs.map(jobDoc => ({
        id: jobDoc.id,
        ...jobDoc.data(),
      }));

      // Filtrar por tipo de trabajo si se especifica
      const filteredJobs = jobType 
        ? activeJobOffers.filter(job => job.jobType === jobType)
        : activeJobOffers;

      // Calcular métricas adicionales
      const companyProfile = {
        id: doc.id,
        ...companyData,
        // Información básica
        name: companyData.name,
        industry: companyData.industry,
        description: companyData.description,
        location: companyData.location || {},
        size: companyData.size,
        website: companyData.website,
        // Información de empleo
        isActivelyHiring: companyData.isActivelyHiring || false,
        totalJobPostings: companyData.totalJobPostings || 0,
        offersRemoteWork: companyData.offersRemoteWork || false,
        workArrangement: companyData.workArrangement || "on_site",
        // Ofertas activas
        activeJobOffers: filteredJobs,
        totalActiveJobs: filteredJobs.length,
        urgentPositions: filteredJobs.filter(job => job.urgency === "high").length,
        // Información financiera
        salaryRanges: extractSalaryRanges(filteredJobs),
        averageSalary: calculateAverageSalary(filteredJobs),
        maxBudgetPerHour: companyData.maxBudgetPerHour || 0,
        // Beneficios y cultura
        benefits: companyData.benefits || [],
        culture: companyData.culture || {},
        rating: companyData.rating || 0,
        // Métricas calculadas
        hiringVelocity: calculateHiringVelocity(companyData),
        responseTime: calculateCompanyResponseTime(companyData),
        successfulHires: companyData.successfulHires || 0,
        doctorSatisfactionScore: calculateDoctorSatisfactionScore(companyData),
        // Preferencias específicas para médicos
        preferredSpecialties: companyData.preferredSpecialties || [],
        requiresLicense: companyData.requiresLicense !== false,
        acceptsNewGraduates: companyData.acceptsNewGraduates || false,
        providesTraining: companyData.providesTraining || false,
      };

      companies.push(companyProfile);
    }

    // Obtener conteo total
    const totalQuery = adminDb
      .collection("companies")
      .where("isActive", "==", true)
      .where("isVerified", "==", true)
      .where("isVisibleToDoctors", "==", true);

    const totalSnapshot = await totalQuery.count().get();
    const total = totalSnapshot.data().count;

    // Estadísticas agregadas
    const stats = {
      totalVisible: total,
      byIndustry: await getIndustryDistribution(),
      byLocation: await getCompanyLocationDistribution(),
      bySize: await getSizeDistribution(),
      averageRating: calculateAverageCompanyRating(companies),
      totalActiveJobs: companies.reduce((sum, company) => sum + company.totalActiveJobs, 0),
      companiesActivelyHiring: companies.filter(c => c.isActivelyHiring).length,
      remoteWorkOpportunities: companies.filter(c => c.offersRemoteWork).length,
      urgentPositionsCount: companies.reduce((sum, company) => sum + company.urgentPositions, 0),
    };

    return NextResponse.json(
      createSuccessResponse({
        companies,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats,
        filters: {
          industry,
          location,
          size,
          jobType,
          salaryRange,
          remoteWork,
          urgency,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching visible companies:", error);
    return NextResponse.json(
      createErrorResponse(
        "COMPANIES_FETCH_ERROR",
        "Error al obtener empresas visibles"
      ),
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/companies/visible
 * Actualizar visibilidad de empresa para médicos
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const updateData = UpdateCompanyVisibilitySchema.parse(body);

    // Verificar que la empresa existe
    const companyDoc = await adminDb
      .collection("companies")
      .doc(updateData.companyId)
      .get();

    if (!companyDoc.exists) {
      return NextResponse.json(
        createErrorResponse("COMPANY_NOT_FOUND", "Empresa no encontrada"),
        { status: 404 }
      );
    }

    // Actualizar visibilidad
    const updateFields = {
      isVisibleToDoctors: updateData.isVisibleToDoctors,
      updatedAt: new Date(),
    };

    // Agregar campos opcionales si se proporcionan
    if (updateData.isActivelyHiring !== undefined) {
      updateFields.isActivelyHiring = updateData.isActivelyHiring;
    }
    if (updateData.preferredSpecialties !== undefined) {
      updateFields.preferredSpecialties = updateData.preferredSpecialties;
    }
    if (updateData.maxBudgetPerHour !== undefined) {
      updateFields.maxBudgetPerHour = updateData.maxBudgetPerHour;
    }
    if (updateData.workArrangement !== undefined) {
      updateFields.workArrangement = updateData.workArrangement;
    }
    if (updateData.urgentPositions !== undefined) {
      updateFields.urgentPositions = updateData.urgentPositions;
    }

    await adminDb
      .collection("companies")
      .doc(updateData.companyId)
      .update(updateFields);

    // Registrar evento
    await adminDb.collection("marketplace_events").add({
      type: "company_visibility_updated",
      companyId: updateData.companyId,
      timestamp: new Date(),
      details: {
        isVisibleToDoctors: updateData.isVisibleToDoctors,
        isActivelyHiring: updateData.isActivelyHiring,
        updatedFields: Object.keys(updateFields),
      },
    });

    return NextResponse.json(
      createSuccessResponse({
        companyId: updateData.companyId,
        message: "Visibilidad de la empresa actualizada exitosamente",
        updatedFields: updateFields,
      })
    );
  } catch (error) {
    console.error("Error updating company visibility:", error);
    return NextResponse.json(
      createErrorResponse(
        "VISIBILITY_UPDATE_ERROR",
        "Error al actualizar visibilidad de la empresa"
      ),
      { status: 500 }
    );
  }
}

// Funciones auxiliares
function isWithinSalaryRange(companyData: any, salaryRange: string): boolean {
  // Verificar si la empresa ofrece salarios dentro del rango especificado
  const ranges = salaryRange.split("-");
  if (ranges.length !== 2) return true;

  const minSalary = parseInt(ranges[0]);
  const maxSalary = parseInt(ranges[1]);

  const companySalaryRange = companyData.salaryRange || {};
  const companyMin = companySalaryRange.min || 0;
  const companyMax = companySalaryRange.max || 999999;

  // Verificar solapamiento de rangos
  return !(companyMax < minSalary || companyMin > maxSalary);
}

function hasUrgentPositions(companyData: any, urgency: string): boolean {
  switch (urgency) {
    case "immediate":
      return (companyData.urgentPositions || 0) > 0;
    case "week":
      return (companyData.positionsToFillThisWeek || 0) > 0;
    case "month":
      return (companyData.positionsToFillThisMonth || 0) > 0;
    case "flexible":
      return true;
    default:
      return true;
  }
}

function extractSalaryRanges(jobOffers: any[]): Record<string, number> {
  const ranges = {
    "0-50k": 0,
    "50k-100k": 0,
    "100k-150k": 0,
    "150k+": 0,
  };

  jobOffers.forEach((job) => {
    const salary = job.salary || job.salaryMax || 0;
    if (salary < 50000) {
      ranges["0-50k"]++;
    } else if (salary < 100000) {
      ranges["50k-100k"]++;
    } else if (salary < 150000) {
      ranges["100k-150k"]++;
    } else {
      ranges["150k+"]++;
    }
  });

  return ranges;
}

function calculateAverageSalary(jobOffers: any[]): number {
  if (jobOffers.length === 0) return 0;

  const totalSalary = jobOffers.reduce((sum, job) => {
    const salary = job.salary || job.salaryMax || 0;
    return sum + salary;
  }, 0);

  return totalSalary / jobOffers.length;
}

function calculateHiringVelocity(companyData: any): number {
  // Calcular velocidad de contratación (contrataciones por mes)
  const hiresLastMonth = companyData.hiresLastMonth || 0;
  const avgTimeToHire = companyData.avgTimeToHire || 30; // días

  if (avgTimeToHire === 0) return 0;
  return Math.round((hiresLastMonth / avgTimeToHire) * 30);
}

function calculateCompanyResponseTime(companyData: any): number {
  // Tiempo de respuesta promedio en horas
  return companyData.averageResponseTime || 48;
}

function calculateDoctorSatisfactionScore(companyData: any): number {
  // Score de satisfacción de médicos empleados (0-100)
  const reviews = companyData.doctorReviews || [];
  if (reviews.length === 0) return 0;

  const totalScore = reviews.reduce((sum: number, review: any) => sum + (review.rating || 0), 0);
  return Math.round((totalScore / reviews.length) * 20); // Convertir de 5 estrellas a 100
}

async function getIndustryDistribution(): Promise<Record<string, number>> {
  const snapshot = await adminDb
    .collection("companies")
    .where("isActive", "==", true)
    .where("isVisibleToDoctors", "==", true)
    .get();

  const distribution: Record<string, number> = {};

  snapshot.docs.forEach((doc) => {
    const industry = doc.data().industry || "No especificado";
    distribution[industry] = (distribution[industry] || 0) + 1;
  });

  return distribution;
}

async function getCompanyLocationDistribution(): Promise<Record<string, number>> {
  const snapshot = await adminDb
    .collection("companies")
    .where("isActive", "==", true)
    .where("isVisibleToDoctors", "==", true)
    .get();

  const distribution: Record<string, number> = {};

  snapshot.docs.forEach((doc) => {
    const location = doc.data().location?.city || "No especificado";
    distribution[location] = (distribution[location] || 0) + 1;
  });

  return distribution;
}

async function getSizeDistribution(): Promise<Record<string, number>> {
  const snapshot = await adminDb
    .collection("companies")
    .where("isActive", "==", true)
    .where("isVisibleToDoctors", "==", true)
    .get();

  const distribution: Record<string, number> = {};

  snapshot.docs.forEach((doc) => {
    const size = doc.data().size || "No especificado";
    distribution[size] = (distribution[size] || 0) + 1;
  });

  return distribution;
}

function calculateAverageCompanyRating(companies: any[]): number {
  if (companies.length === 0) return 0;

  const totalRating = companies.reduce((sum, company) => sum + (company.rating || 0), 0);
  return totalRating / companies.length;
}