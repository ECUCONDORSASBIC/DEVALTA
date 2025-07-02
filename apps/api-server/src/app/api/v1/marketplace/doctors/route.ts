import { adminDb } from "@altamedica/firebase";
import {
  createErrorResponse,
  createSuccessResponse,
  validatePagination,
} from "@altamedica/shared";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema para médicos disponibles en marketplace
const DoctorMarketplaceSchema = z.object({
  doctorId: z.string().min(1, "ID de doctor requerido"),
  specialties: z
    .array(z.string())
    .min(1, "Al menos una especialidad requerida"),
  availability: z.object({
    monday: z.array(
      z.object({
        start: z.string(),
        end: z.string(),
      })
    ),
    tuesday: z.array(
      z.object({
        start: z.string(),
        end: z.string(),
      })
    ),
    wednesday: z.array(
      z.object({
        start: z.string(),
        end: z.string(),
      })
    ),
    thursday: z.array(
      z.object({
        start: z.string(),
        end: z.string(),
      })
    ),
    friday: z.array(
      z.object({
        start: z.string(),
        end: z.string(),
      })
    ),
    saturday: z.array(
      z.object({
        start: z.string(),
        end: z.string(),
      })
    ),
    sunday: z.array(
      z.object({
        start: z.string(),
        end: z.string(),
      })
    ),
  }),
  consultationFee: z.number().min(0, "Tarifa de consulta requerida"),
  telemedicineFee: z.number().min(0, "Tarifa de telemedicina requerida"),
  maxPatientsPerDay: z.number().min(1, "Máximo de pacientes por día requerido"),
  isAvailableForOrphanPatients: z.boolean().default(true),
  commissionRate: z.number().min(0).max(1).default(0.2), // 20% comisión por defecto
  languages: z.array(z.string()).default(["es"]),
  rating: z.number().min(0).max(5).optional(),
  totalConsultations: z.number().min(0).default(0),
  responseTime: z.number().min(0).optional(), // en minutos
});

// Schema para matching de pacientes huérfanos
const OrphanPatientMatchSchema = z.object({
  patientId: z.string().min(1, "ID de paciente requerido"),
  doctorId: z.string().min(1, "ID de doctor requerido"),
  consultationType: z.enum(["in_person", "telemedicine", "follow_up"]),
  urgency: z.enum(["low", "medium", "high", "emergency"]).default("medium"),
  preferredSpecialty: z.string().optional(),
  budget: z.number().min(0).optional(),
  preferredLanguage: z.string().default("es"),
});

/**
 * GET /api/v1/marketplace/doctors
 * Obtener médicos disponibles para pacientes huérfanos
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get("specialty");
    const maxFee = searchParams.get("maxFee");
    const language = searchParams.get("language");
    const availability = searchParams.get("availability");

    const { page, limit } = validatePagination(searchParams);

    // Construir query base
    let query = adminDb
      .collection("marketplace_doctors")
      .where("isAvailableForOrphanPatients", "==", true)
      .where("isActive", "==", true);

    // Aplicar filtros
    if (specialty) {
      query = query.where("specialties", "array-contains", specialty);
    }

    if (maxFee) {
      query = query.where("consultationFee", "<=", parseFloat(maxFee));
    }

    // Ejecutar query
    const snapshot = await query
      .orderBy("rating", "desc")
      .orderBy("totalConsultations", "desc")
      .limit(limit)
      .offset((page - 1) * limit)
      .get();

    const doctors = [];
    for (const doc of snapshot.docs) {
      const doctorData = doc.data();

      // Filtrar por idioma si se especifica
      if (language && !doctorData.languages.includes(language)) {
        continue;
      }

      // Filtrar por disponibilidad si se especifica
      if (
        availability &&
        !isDoctorAvailable(doctorData.availability, availability)
      ) {
        continue;
      }

      doctors.push({
        id: doc.id,
        ...doctorData,
        // Calcular métricas adicionales
        successRate: calculateSuccessRate(
          doctorData.totalConsultations,
          doctorData.rating
        ),
        estimatedWaitTime: calculateEstimatedWaitTime(
          doctorData.totalConsultations,
          doctorData.maxPatientsPerDay
        ),
      });
    }

    const total = await query.count().get();

    return NextResponse.json(
      createSuccessResponse({
        doctors,
        pagination: {
          page,
          limit,
          total: total.data().count,
          totalPages: Math.ceil(total.data().count / limit),
        },
      })
    );
  } catch (error) {
    console.error("Error fetching marketplace doctors:", error);
    return NextResponse.json(
      createErrorResponse(
        "MARKETPLACE_ERROR",
        "Error al obtener médicos del marketplace"
      ),
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/marketplace/doctors
 * Registrar médico en el marketplace para pacientes huérfanos
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const doctorData = DoctorMarketplaceSchema.parse(body);

    // Verificar que el médico existe y está verificado
    const doctorDoc = await adminDb
      .collection("doctors")
      .doc(doctorData.doctorId)
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

    // Verificar que no esté ya registrado en el marketplace
    const existingMarketplaceDoc = await adminDb
      .collection("marketplace_doctors")
      .where("doctorId", "==", doctorData.doctorId)
      .get();

    if (!existingMarketplaceDoc.empty) {
      return NextResponse.json(
        createErrorResponse(
          "DOCTOR_ALREADY_REGISTERED",
          "Médico ya registrado en el marketplace"
        ),
        { status: 409 }
      );
    }

    // Crear registro en el marketplace
    const marketplaceData = {
      ...doctorData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Información adicional del médico
      doctorInfo: {
        name: doctorInfo.name,
        email: doctorInfo.email,
        phone: doctorInfo.phone,
        license: doctorInfo.license,
        experience: doctorInfo.experience,
        education: doctorInfo.education,
      },
      // Métricas iniciales
      totalOrphanPatientsAssigned: 0,
      totalRevenue: 0,
      averageRating: 0,
      responseTime: 0,
    };

    const docRef = await adminDb
      .collection("marketplace_doctors")
      .add(marketplaceData);

    // Actualizar el perfil del médico
    await adminDb.collection("doctors").doc(doctorData.doctorId).update({
      isInMarketplace: true,
      marketplaceId: docRef.id,
      updatedAt: new Date(),
    });

    // Registrar evento
    await adminDb.collection("marketplace_events").add({
      type: "doctor_registered",
      doctorId: doctorData.doctorId,
      marketplaceId: docRef.id,
      timestamp: new Date(),
      details: {
        specialties: doctorData.specialties,
        consultationFee: doctorData.consultationFee,
        commissionRate: doctorData.commissionRate,
      },
    });

    return NextResponse.json(
      createSuccessResponse({
        id: docRef.id,
        ...marketplaceData,
        message: "Médico registrado exitosamente en el marketplace",
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering doctor in marketplace:", error);
    return NextResponse.json(
      createErrorResponse(
        "REGISTRATION_ERROR",
        "Error al registrar médico en el marketplace"
      ),
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/marketplace/match
 * Asignar paciente huérfano a médico disponible
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const matchData = OrphanPatientMatchSchema.parse(body);

    // Verificar que el paciente existe y está sin médico
    const patientDoc = await adminDb
      .collection("patients")
      .doc(matchData.patientId)
      .get();
    if (!patientDoc.exists) {
      return NextResponse.json(
        createErrorResponse("PATIENT_NOT_FOUND", "Paciente no encontrado"),
        { status: 404 }
      );
    }

    const patientInfo = patientDoc.data();
    if (patientInfo?.assignedDoctorId) {
      return NextResponse.json(
        createErrorResponse(
          "PATIENT_ALREADY_ASSIGNED",
          "Paciente ya tiene médico asignado"
        ),
        { status: 400 }
      );
    }

    // Verificar que el médico está disponible
    const doctorMarketplaceDoc = await adminDb
      .collection("marketplace_doctors")
      .where("doctorId", "==", matchData.doctorId)
      .where("isActive", "==", true)
      .get();

    if (doctorMarketplaceDoc.empty) {
      return NextResponse.json(
        createErrorResponse(
          "DOCTOR_NOT_AVAILABLE",
          "Médico no disponible en el marketplace"
        ),
        { status: 400 }
      );
    }

    const doctorMarketplace = doctorMarketplaceDoc.docs[0].data();

    // Verificar disponibilidad del médico
    if (!isDoctorAvailableForPatient(doctorMarketplace, matchData)) {
      return NextResponse.json(
        createErrorResponse(
          "DOCTOR_NOT_AVAILABLE",
          "Médico no disponible para este paciente"
        ),
        { status: 400 }
      );
    }

    // Crear la asignación
    const assignmentData = {
      patientId: matchData.patientId,
      doctorId: matchData.doctorId,
      consultationType: matchData.consultationType,
      urgency: matchData.urgency,
      status: "pending",
      assignedAt: new Date(),
      estimatedConsultationFee:
        matchData.consultationType === "telemedicine"
          ? doctorMarketplace.telemedicineFee
          : doctorMarketplace.consultationFee,
      commissionRate: doctorMarketplace.commissionRate,
      // Información del paciente
      patientInfo: {
        name: patientInfo.name,
        age: patientInfo.age,
        gender: patientInfo.gender,
        mainCondition: patientInfo.mainCondition,
      },
      // Información del médico
      doctorInfo: {
        name: doctorMarketplace.doctorInfo.name,
        specialty: doctorMarketplace.specialties[0],
        rating: doctorMarketplace.rating,
      },
    };

    const assignmentRef = await adminDb
      .collection("orphan_patient_assignments")
      .add(assignmentData);

    // Actualizar el paciente
    await adminDb.collection("patients").doc(matchData.patientId).update({
      assignedDoctorId: matchData.doctorId,
      assignmentId: assignmentRef.id,
      isOrphanPatient: false,
      updatedAt: new Date(),
    });

    // Actualizar métricas del médico en el marketplace
    await adminDb
      .collection("marketplace_doctors")
      .doc(doctorMarketplaceDoc.docs[0].id)
      .update({
        totalOrphanPatientsAssigned: adminDb.FieldValue.increment(1),
        updatedAt: new Date(),
      });

    // Notificar al médico
    await adminDb.collection("notifications").add({
      userId: matchData.doctorId,
      type: "orphan_patient_assigned",
      title: "Nuevo paciente asignado",
      message: `Se le ha asignado un nuevo paciente: ${patientInfo.name}`,
      data: {
        assignmentId: assignmentRef.id,
        patientId: matchData.patientId,
        urgency: matchData.urgency,
      },
      createdAt: new Date(),
      isRead: false,
    });

    // Notificar al paciente
    await adminDb.collection("notifications").add({
      userId: matchData.patientId,
      type: "doctor_assigned",
      title: "Médico asignado",
      message: `Se le ha asignado el Dr. ${doctorMarketplace.doctorInfo.name}`,
      data: {
        assignmentId: assignmentRef.id,
        doctorId: matchData.doctorId,
        consultationType: matchData.consultationType,
      },
      createdAt: new Date(),
      isRead: false,
    });

    return NextResponse.json(
      createSuccessResponse({
        assignmentId: assignmentRef.id,
        ...assignmentData,
        message: "Paciente asignado exitosamente al médico",
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error matching orphan patient:", error);
    return NextResponse.json(
      createErrorResponse(
        "MATCHING_ERROR",
        "Error al asignar paciente al médico"
      ),
      { status: 500 }
    );
  }
}

// Funciones auxiliares
function isDoctorAvailable(availability: any, requestedTime: string): boolean {
  // Lógica para verificar disponibilidad del médico
  return true; // Simplificado para el ejemplo
}

function isDoctorAvailableForPatient(
  doctorMarketplace: any,
  matchData: any
): boolean {
  // Verificar si el médico puede atender al paciente
  const hasSpecialty =
    !matchData.preferredSpecialty ||
    doctorMarketplace.specialties.includes(matchData.preferredSpecialty);

  const hasLanguage = doctorMarketplace.languages.includes(
    matchData.preferredLanguage
  );

  const withinBudget =
    !matchData.budget ||
    (matchData.consultationType === "telemedicine"
      ? doctorMarketplace.telemedicineFee <= matchData.budget
      : doctorMarketplace.consultationFee <= matchData.budget);

  return hasSpecialty && hasLanguage && withinBudget;
}

function calculateSuccessRate(
  totalConsultations: number,
  rating: number
): number {
  if (totalConsultations === 0) return 0;
  return Math.min(100, (rating / 5) * 100);
}

function calculateEstimatedWaitTime(
  totalConsultations: number,
  maxPatientsPerDay: number
): number {
  // Lógica para calcular tiempo de espera estimado
  const averageConsultationsPerDay = totalConsultations / 30; // Últimos 30 días
  const availableSlots = maxPatientsPerDay - averageConsultationsPerDay;

  if (availableSlots <= 0) return 7; // 1 semana
  if (availableSlots >= 5) return 1; // 1 día
  return Math.ceil(5 / availableSlots); // Días estimados
}
