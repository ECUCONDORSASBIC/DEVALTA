import { adminDb } from "@/lib/firebase-admin";
import {
  createErrorResponse,
  createSuccessResponse,
  validatePagination,
} from "@/lib/response-helpers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema para filtros de médicos visibles
const DoctorVisibilityFiltersSchema = z.object({
  specialty: z.string().optional(),
  location: z.string().optional(),
  maxFee: z.string().optional(),
  rating: z.string().optional(),
  availability: z.enum(["immediate", "today", "week", "any"]).optional(),
  experienceYears: z.string().optional(),
  acceptsInsurance: z.boolean().optional(),
  languages: z.array(z.string()).optional(),
  consultationType: z.enum(["in_person", "telemedicine", "both"]).optional(),
});

// Schema para actualizar visibilidad de médico
const UpdateDoctorVisibilitySchema = z.object({
  doctorId: z.string().min(1, "ID de doctor requerido"),
  isVisibleToCompanies: z.boolean(),
  availableForHiring: z.boolean().optional(),
  hourlyRate: z.number().min(0).optional(),
  preferredWorkType: z.enum(["full_time", "part_time", "contract", "freelance"]).optional(),
  maxDistanceKm: z.number().min(0).optional(),
  availableStartDate: z.string().optional(),
});

/**
 * GET /api/v1/doctors/visible
 * Obtener médicos visibles para empresas
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit } = validatePagination(searchParams);

    // Extraer filtros
    const specialty = searchParams.get("specialty");
    const location = searchParams.get("location");
    const maxFee = searchParams.get("maxFee");
    const rating = searchParams.get("rating");
    const availability = searchParams.get("availability");
    const experienceYears = searchParams.get("experienceYears");
    const acceptsInsurance = searchParams.get("acceptsInsurance");
    const consultationType = searchParams.get("consultationType");

    // Construir query base para médicos visibles
    let query = adminDb
      .collection("doctors")
      .where("isActive", "==", true)
      .where("isVerified", "==", true)
      .where("isVisibleToCompanies", "==", true);

    // Aplicar filtros dinámicamente
    if (specialty) {
      query = query.where("specialties", "array-contains", specialty);
    }

    if (location) {
      query = query.where("location.city", "==", location);
    }

    if (acceptsInsurance === "true") {
      query = query.where("acceptsInsurance", "==", true);
    }

    // Ejecutar query principal
    const snapshot = await query
      .orderBy("rating", "desc")
      .orderBy("totalExperience", "desc")
      .limit(limit)
      .offset((page - 1) * limit)
      .get();

    const doctors = [];
    for (const doc of snapshot.docs) {
      const doctorData = doc.data();

      // Filtros adicionales que requieren lógica personalizada
      if (maxFee && doctorData.consultationFee > parseFloat(maxFee)) {
        continue;
      }

      if (rating && doctorData.rating < parseFloat(rating)) {
        continue;
      }

      if (experienceYears && doctorData.totalExperience < parseInt(experienceYears)) {
        continue;
      }

      // Verificar disponibilidad
      if (availability && !isDoctorAvailableForPeriod(doctorData, availability)) {
        continue;
      }

      // Verificar tipo de consulta
      if (consultationType && !supportedConsultationType(doctorData, consultationType)) {
        continue;
      }

      // Obtener información adicional del marketplace si existe
      const marketplaceDoc = await adminDb
        .collection("marketplace_doctors")
        .where("doctorId", "==", doc.id)
        .get();

      const marketplaceData = marketplaceDoc.empty ? null : marketplaceDoc.docs[0].data();

      // Calcular métricas adicionales
      const doctorProfile = {
        id: doc.id,
        ...doctorData,
        // Información básica
        name: doctorData.name,
        specialties: doctorData.specialties || [],
        location: doctorData.location || {},
        rating: doctorData.rating || 0,
        totalExperience: doctorData.totalExperience || 0,
        // Información profesional
        license: doctorData.license,
        education: doctorData.education || [],
        certifications: doctorData.certifications || [],
        languages: doctorData.languages || ["es"],
        // Información de servicios
        consultationFee: doctorData.consultationFee || 0,
        telemedicineFee: doctorData.telemedicineFee || 0,
        acceptsInsurance: doctorData.acceptsInsurance || false,
        // Disponibilidad para empresas
        availableForHiring: doctorData.availableForHiring || false,
        hourlyRate: doctorData.hourlyRate || 0,
        preferredWorkType: doctorData.preferredWorkType || "part_time",
        maxDistanceKm: doctorData.maxDistanceKm || 50,
        // Métricas calculadas
        responseTime: calculateResponseTime(doctorData),
        successRate: calculateSuccessRate(doctorData),
        availabilityScore: calculateAvailabilityScore(doctorData),
        distanceFromQuery: location ? calculateDistance(doctorData.location, location) : null,
        // Información del marketplace
        isInMarketplace: !!marketplaceData,
        marketplaceRating: marketplaceData?.rating || null,
        totalOrphanPatientsAssigned: marketplaceData?.totalOrphanPatientsAssigned || 0,
      };

      doctors.push(doctorProfile);
    }

    // Obtener conteo total
    const totalQuery = adminDb
      .collection("doctors")
      .where("isActive", "==", true)
      .where("isVerified", "==", true)
      .where("isVisibleToCompanies", "==", true);

    const totalSnapshot = await totalQuery.count().get();
    const total = totalSnapshot.data().count;

    // Estadísticas agregadas
    const stats = {
      totalVisible: total,
      bySpecialty: await getSpecialtyDistribution(),
      byLocation: await getLocationDistribution(),
      averageRating: calculateAverageRating(doctors),
      averageFee: calculateAverageFee(doctors),
      availabilityDistribution: getAvailabilityDistribution(doctors),
    };

    return NextResponse.json(
      createSuccessResponse({
        doctors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats,
        filters: {
          specialty,
          location,
          maxFee,
          rating,
          availability,
          experienceYears,
          acceptsInsurance,
          consultationType,
        },
      })
    );
  } catch (error) {
    console.error("Error fetching visible doctors:", error);
    return NextResponse.json(
      createErrorResponse(
        "DOCTORS_FETCH_ERROR",
        "Error al obtener médicos visibles"
      ),
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/doctors/visible
 * Actualizar visibilidad de médico para empresas
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const updateData = UpdateDoctorVisibilitySchema.parse(body);

    // Verificar que el médico existe
    const doctorDoc = await adminDb
      .collection("doctors")
      .doc(updateData.doctorId)
      .get();

    if (!doctorDoc.exists) {
      return NextResponse.json(
        createErrorResponse("DOCTOR_NOT_FOUND", "Médico no encontrado"),
        { status: 404 }
      );
    }

    // Actualizar visibilidad
    const updateFields = {
      isVisibleToCompanies: updateData.isVisibleToCompanies,
      updatedAt: new Date(),
    };

    // Agregar campos opcionales si se proporcionan
    if (updateData.availableForHiring !== undefined) {
      updateFields.availableForHiring = updateData.availableForHiring;
    }
    if (updateData.hourlyRate !== undefined) {
      updateFields.hourlyRate = updateData.hourlyRate;
    }
    if (updateData.preferredWorkType !== undefined) {
      updateFields.preferredWorkType = updateData.preferredWorkType;
    }
    if (updateData.maxDistanceKm !== undefined) {
      updateFields.maxDistanceKm = updateData.maxDistanceKm;
    }
    if (updateData.availableStartDate !== undefined) {
      updateFields.availableStartDate = updateData.availableStartDate;
    }

    await adminDb
      .collection("doctors")
      .doc(updateData.doctorId)
      .update(updateFields);

    // Registrar evento
    await adminDb.collection("marketplace_events").add({
      type: "doctor_visibility_updated",
      doctorId: updateData.doctorId,
      timestamp: new Date(),
      details: {
        isVisibleToCompanies: updateData.isVisibleToCompanies,
        availableForHiring: updateData.availableForHiring,
        updatedFields: Object.keys(updateFields),
      },
    });

    return NextResponse.json(
      createSuccessResponse({
        doctorId: updateData.doctorId,
        message: "Visibilidad del médico actualizada exitosamente",
        updatedFields: updateFields,
      })
    );
  } catch (error) {
    console.error("Error updating doctor visibility:", error);
    return NextResponse.json(
      createErrorResponse(
        "VISIBILITY_UPDATE_ERROR",
        "Error al actualizar visibilidad del médico"
      ),
      { status: 500 }
    );
  }
}

// Funciones auxiliares
function isDoctorAvailableForPeriod(doctorData: any, period: string): boolean {
  // Lógica para verificar disponibilidad según el período
  switch (period) {
    case "immediate":
      return doctorData.isAvailableNow || false;
    case "today":
      return doctorData.availableToday || false;
    case "week":
      return doctorData.availableThisWeek || false;
    case "any":
      return true;
    default:
      return true;
  }
}

function supportedConsultationType(doctorData: any, type: string): boolean {
  switch (type) {
    case "in_person":
      return doctorData.offersInPersonConsultations !== false;
    case "telemedicine":
      return doctorData.offersTelemedicine !== false;
    case "both":
      return (
        doctorData.offersInPersonConsultations !== false &&
        doctorData.offersTelemedicine !== false
      );
    default:
      return true;
  }
}

function calculateResponseTime(doctorData: any): number {
  // Calcular tiempo de respuesta promedio en minutos
  return doctorData.averageResponseTime || 60;
}

function calculateSuccessRate(doctorData: any): number {
  // Calcular tasa de éxito basada en rating y consultas completadas
  const rating = doctorData.rating || 0;
  const completedConsultations = doctorData.completedConsultations || 0;
  
  if (completedConsultations === 0) return 0;
  
  return Math.min(100, (rating / 5) * 100);
}

function calculateAvailabilityScore(doctorData: any): number {
  // Calcular score de disponibilidad basado en múltiples factores
  let score = 0;
  
  if (doctorData.isAvailableNow) score += 40;
  if (doctorData.availableToday) score += 30;
  if (doctorData.availableThisWeek) score += 20;
  if (doctorData.flexibleSchedule) score += 10;
  
  return Math.min(100, score);
}

function calculateDistance(doctorLocation: any, queryLocation: string): number | null {
  // Simplificado - en una implementación real usarías una API de geolocalización
  if (!doctorLocation || !doctorLocation.coordinates) return null;
  
  // Retornar distancia simulada
  return Math.floor(Math.random() * 50) + 1;
}

async function getSpecialtyDistribution(): Promise<Record<string, number>> {
  const snapshot = await adminDb
    .collection("doctors")
    .where("isActive", "==", true)
    .where("isVisibleToCompanies", "==", true)
    .get();

  const distribution: Record<string, number> = {};

  snapshot.docs.forEach((doc) => {
    const specialties = doc.data().specialties || [];
    specialties.forEach((specialty: string) => {
      distribution[specialty] = (distribution[specialty] || 0) + 1;
    });
  });

  return distribution;
}

async function getLocationDistribution(): Promise<Record<string, number>> {
  const snapshot = await adminDb
    .collection("doctors")
    .where("isActive", "==", true)
    .where("isVisibleToCompanies", "==", true)
    .get();

  const distribution: Record<string, number> = {};

  snapshot.docs.forEach((doc) => {
    const location = doc.data().location?.city || "No especificado";
    distribution[location] = (distribution[location] || 0) + 1;
  });

  return distribution;
}

function calculateAverageRating(doctors: any[]): number {
  if (doctors.length === 0) return 0;
  
  const totalRating = doctors.reduce((sum, doctor) => sum + (doctor.rating || 0), 0);
  return totalRating / doctors.length;
}

function calculateAverageFee(doctors: any[]): number {
  if (doctors.length === 0) return 0;
  
  const totalFee = doctors.reduce((sum, doctor) => sum + (doctor.consultationFee || 0), 0);
  return totalFee / doctors.length;
}

function getAvailabilityDistribution(doctors: any[]): Record<string, number> {
  const distribution = {
    immediate: 0,
    today: 0,
    week: 0,
    later: 0,
  };

  doctors.forEach((doctor) => {
    if (doctor.availabilityScore >= 70) {
      distribution.immediate++;
    } else if (doctor.availabilityScore >= 50) {
      distribution.today++;
    } else if (doctor.availabilityScore >= 20) {
      distribution.week++;
    } else {
      distribution.later++;
    }
  });

  return distribution;
}