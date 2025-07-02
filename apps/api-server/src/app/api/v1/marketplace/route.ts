import { adminDb } from "@altamedica/firebase";
import {
  createErrorResponse,
  createSuccessResponse,
  validatePagination,
} from "@altamedica/shared";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema para pacientes huérfanos
const OrphanPatientSchema = z.object({
  patientId: z.string().min(1, "ID de paciente requerido"),
  name: z.string().min(1, "Nombre requerido"),
  age: z.number().min(0).max(120),
  gender: z.enum(["male", "female", "other"]),
  mainCondition: z.string().optional(),
  preferredSpecialty: z.string().optional(),
  urgency: z.enum(["low", "medium", "high", "emergency"]).default("medium"),
  budget: z.number().min(0).optional(),
  preferredLanguage: z.string().default("es"),
  contactInfo: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }),
  location: z
    .object({
      city: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
});

/**
 * GET /api/v1/marketplace/orphan-patients
 * Obtener lista de pacientes huérfanos
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get("specialty");
    const urgency = searchParams.get("urgency");
    const maxBudget = searchParams.get("maxBudget");
    const language = searchParams.get("language");

    const { page, limit } = validatePagination(searchParams);

    // Construir query base
    let query = adminDb
      .collection("orphan_patients")
      .where("isAssigned", "==", false)
      .where("isActive", "==", true);

    // Aplicar filtros
    if (urgency) {
      query = query.where("urgency", "==", urgency);
    }

    if (maxBudget) {
      query = query.where("budget", "<=", parseFloat(maxBudget));
    }

    // Ejecutar query
    const snapshot = await query
      .orderBy("urgency", "desc")
      .orderBy("createdAt", "asc")
      .limit(limit)
      .offset((page - 1) * limit)
      .get();

    const patients = [];
    for (const doc of snapshot.docs) {
      const patientData = doc.data();

      // Filtrar por especialidad si se especifica
      if (specialty && patientData.preferredSpecialty !== specialty) {
        continue;
      }

      // Filtrar por idioma si se especifica
      if (language && patientData.preferredLanguage !== language) {
        continue;
      }

      patients.push({
        id: doc.id,
        ...patientData,
        // Calcular métricas adicionales
        daysWaiting: calculateDaysWaiting(patientData.createdAt),
        priorityScore: calculatePriorityScore(patientData),
      });
    }

    const total = await query.count().get();

    return NextResponse.json(
      createSuccessResponse({
        patients,
        pagination: {
          page,
          limit,
          total: total.data().count,
          totalPages: Math.ceil(total.data().count / limit),
        },
        summary: {
          totalOrphanPatients: total.data().count,
          byUrgency: {
            emergency: await countByUrgency("emergency"),
            high: await countByUrgency("high"),
            medium: await countByUrgency("medium"),
            low: await countByUrgency("low"),
          },
          bySpecialty: await getSpecialtyDistribution(),
        },
      })
    );
  } catch (error) {
    console.error("Error fetching orphan patients:", error);
    return NextResponse.json(
      createErrorResponse(
        "MARKETPLACE_ERROR",
        "Error al obtener pacientes huérfanos"
      ),
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/marketplace/orphan-patients
 * Registrar paciente huérfano en el marketplace
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const patientData = OrphanPatientSchema.parse(body);

    // Verificar que el paciente no esté ya registrado
    const existingPatient = await adminDb
      .collection("orphan_patients")
      .where("patientId", "==", patientData.patientId)
      .get();

    if (!existingPatient.empty) {
      return NextResponse.json(
        createErrorResponse(
          "PATIENT_ALREADY_REGISTERED",
          "Paciente ya registrado como huérfano"
        ),
        { status: 409 }
      );
    }

    // Crear registro de paciente huérfano
    const orphanPatientData = {
      ...patientData,
      isAssigned: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Métricas de seguimiento
      assignmentAttempts: 0,
      lastAssignmentAttempt: null,
      estimatedWaitTime: calculateEstimatedWaitTime(patientData.urgency),
      // Información adicional
      source: "manual_registration",
      status: "waiting_for_assignment",
    };

    const docRef = await adminDb
      .collection("orphan_patients")
      .add(orphanPatientData);

    // Actualizar el paciente principal
    await adminDb.collection("patients").doc(patientData.patientId).update({
      isOrphanPatient: true,
      orphanPatientId: docRef.id,
      updatedAt: new Date(),
    });

    // Registrar evento
    await adminDb.collection("marketplace_events").add({
      type: "orphan_patient_registered",
      patientId: patientData.patientId,
      orphanPatientId: docRef.id,
      timestamp: new Date(),
      details: {
        urgency: patientData.urgency,
        preferredSpecialty: patientData.preferredSpecialty,
        budget: patientData.budget,
      },
    });

    // Intentar asignación automática
    await attemptAutomaticAssignment(docRef.id, patientData);

    return NextResponse.json(
      createSuccessResponse({
        id: docRef.id,
        ...orphanPatientData,
        message: "Paciente huérfano registrado exitosamente",
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering orphan patient:", error);
    return NextResponse.json(
      createErrorResponse(
        "REGISTRATION_ERROR",
        "Error al registrar paciente huérfano"
      ),
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/marketplace/stats
 * Obtener estadísticas del marketplace
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");

    if (endpoint === "stats") {
      // Obtener estadísticas generales
      const stats = await getMarketplaceStats();
      return NextResponse.json(createSuccessResponse(stats));
    }

    return NextResponse.json(
      createErrorResponse("INVALID_ENDPOINT", "Endpoint no válido"),
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching marketplace stats:", error);
    return NextResponse.json(
      createErrorResponse("STATS_ERROR", "Error al obtener estadísticas"),
      { status: 500 }
    );
  }
}

// Funciones auxiliares
async function countByUrgency(urgency: string): Promise<number> {
  const snapshot = await adminDb
    .collection("orphan_patients")
    .where("urgency", "==", urgency)
    .where("isAssigned", "==", false)
    .count()
    .get();

  return snapshot.data().count;
}

async function getSpecialtyDistribution(): Promise<Record<string, number>> {
  const snapshot = await adminDb
    .collection("orphan_patients")
    .where("isAssigned", "==", false)
    .get();

  const distribution: Record<string, number> = {};

  snapshot.docs.forEach((doc) => {
    const specialty = doc.data().preferredSpecialty || "general";
    distribution[specialty] = (distribution[specialty] || 0) + 1;
  });

  return distribution;
}

function calculateDaysWaiting(createdAt: any): number {
  const created = createdAt.toDate();
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function calculatePriorityScore(patientData: any): number {
  let score = 0;

  // Urgency weight
  const urgencyWeights = {
    emergency: 100,
    high: 75,
    medium: 50,
    low: 25,
  };
  score += urgencyWeights[patientData.urgency] || 50;

  // Days waiting weight
  const daysWaiting = calculateDaysWaiting(patientData.createdAt);
  score += Math.min(daysWaiting * 5, 50); // Máximo 50 puntos por días de espera

  // Budget weight (pacientes con presupuesto tienen prioridad)
  if (patientData.budget && patientData.budget > 0) {
    score += 25;
  }

  return Math.min(score, 200); // Máximo 200 puntos
}

function calculateEstimatedWaitTime(urgency: string): number {
  const urgencyWaitTimes = {
    emergency: 1, // 1 día
    high: 3, // 3 días
    medium: 7, // 1 semana
    low: 14, // 2 semanas
  };

  return urgencyWaitTimes[urgency] || 7;
}

async function attemptAutomaticAssignment(
  orphanPatientId: string,
  patientData: any
): Promise<void> {
  try {
    // Buscar médicos disponibles que coincidan con los criterios
    let query = adminDb
      .collection("marketplace_doctors")
      .where("isActive", "==", true)
      .where("isAvailableForOrphanPatients", "==", true);

    if (patientData.preferredSpecialty) {
      query = query.where(
        "specialties",
        "array-contains",
        patientData.preferredSpecialty
      );
    }

    const doctorsSnapshot = await query
      .orderBy("rating", "desc")
      .orderBy("totalOrphanPatientsAssigned", "asc")
      .limit(5)
      .get();

    if (doctorsSnapshot.empty) {
      // No hay médicos disponibles, actualizar estado
      await adminDb
        .collection("orphan_patients")
        .doc(orphanPatientId)
        .update({
          status: "waiting_for_doctors",
          lastAssignmentAttempt: new Date(),
          assignmentAttempts: adminDb.FieldValue.increment(1),
        });
      return;
    }

    // Intentar asignar al primer médico disponible
    const firstDoctor = doctorsSnapshot.docs[0];
    const doctorData = firstDoctor.data();

    // Verificar disponibilidad
    if (isDoctorAvailableForPatient(doctorData, patientData)) {
      // Crear asignación automática
      const assignmentData = {
        orphanPatientId,
        patientId: patientData.patientId,
        doctorId: doctorData.doctorId,
        assignmentType: "automatic",
        status: "pending_confirmation",
        assignedAt: new Date(),
        estimatedConsultationFee:
          patientData.budget || doctorData.consultationFee,
        commissionRate: doctorData.commissionRate,
      };

      await adminDb
        .collection("orphan_patient_assignments")
        .add(assignmentData);

      // Actualizar paciente huérfano
      await adminDb.collection("orphan_patients").doc(orphanPatientId).update({
        isAssigned: true,
        assignedDoctorId: doctorData.doctorId,
        status: "assigned",
        assignedAt: new Date(),
      });

      // Notificar al médico
      await adminDb.collection("notifications").add({
        userId: doctorData.doctorId,
        type: "automatic_orphan_assignment",
        title: "Paciente asignado automáticamente",
        message: `Se le ha asignado automáticamente un paciente: ${patientData.name}`,
        data: {
          orphanPatientId,
          patientId: patientData.patientId,
          urgency: patientData.urgency,
        },
        createdAt: new Date(),
        isRead: false,
      });
    }
  } catch (error) {
    console.error("Error in automatic assignment:", error);
  }
}

function isDoctorAvailableForPatient(
  doctorData: any,
  patientData: any
): boolean {
  // Verificar especialidad
  if (
    patientData.preferredSpecialty &&
    !doctorData.specialties.includes(patientData.preferredSpecialty)
  ) {
    return false;
  }

  // Verificar idioma
  if (
    patientData.preferredLanguage &&
    !doctorData.languages.includes(patientData.preferredLanguage)
  ) {
    return false;
  }

  // Verificar presupuesto
  if (patientData.budget && doctorData.consultationFee > patientData.budget) {
    return false;
  }

  // Verificar capacidad
  const currentPatients = doctorData.totalOrphanPatientsAssigned || 0;
  const maxPatients = doctorData.maxPatientsPerDay * 30; // Estimación mensual

  return currentPatients < maxPatients;
}

async function getMarketplaceStats(): Promise<any> {
  // Estadísticas generales del marketplace
  const orphanPatientsCount = await adminDb
    .collection("orphan_patients")
    .where("isAssigned", "==", false)
    .count()
    .get();

  const assignedPatientsCount = await adminDb
    .collection("orphan_patients")
    .where("isAssigned", "==", true)
    .count()
    .get();

  const availableDoctorsCount = await adminDb
    .collection("marketplace_doctors")
    .where("isActive", "==", true)
    .count()
    .get();

  const totalAssignments = await adminDb
    .collection("orphan_patient_assignments")
    .count()
    .get();

  const recentAssignments = await adminDb
    .collection("orphan_patient_assignments")
    .where("assignedAt", ">=", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Últimos 7 días
    .count()
    .get();

  return {
    overview: {
      totalOrphanPatients: orphanPatientsCount.data().count,
      assignedPatients: assignedPatientsCount.data().count,
      availableDoctors: availableDoctorsCount.data().count,
      totalAssignments: totalAssignments.data().count,
      recentAssignments: recentAssignments.data().count,
    },
    conversionRate: {
      assignmentRate:
        (assignedPatientsCount.data().count /
          (orphanPatientsCount.data().count +
            assignedPatientsCount.data().count)) *
        100,
      averageWaitTime: await calculateAverageWaitTime(),
    },
    revenue: {
      totalRevenue: await calculateTotalRevenue(),
      averageCommission: await calculateAverageCommission(),
    },
  };
}

async function calculateAverageWaitTime(): Promise<number> {
  const snapshot = await adminDb
    .collection("orphan_patients")
    .where("isAssigned", "==", true)
    .get();

  if (snapshot.empty) return 0;

  let totalWaitTime = 0;
  let count = 0;

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (data.assignedAt && data.createdAt) {
      const waitTime = data.assignedAt.toDate() - data.createdAt.toDate();
      totalWaitTime += waitTime / (1000 * 60 * 60 * 24); // Convertir a días
      count++;
    }
  });

  return count > 0 ? totalWaitTime / count : 0;
}

async function calculateTotalRevenue(): Promise<number> {
  const snapshot = await adminDb
    .collection("orphan_patient_assignments")
    .where("status", "==", "completed")
    .get();

  let totalRevenue = 0;

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (data.estimatedConsultationFee && data.commissionRate) {
      totalRevenue += data.estimatedConsultationFee * data.commissionRate;
    }
  });

  return totalRevenue;
}

async function calculateAverageCommission(): Promise<number> {
  const snapshot = await adminDb.collection("marketplace_doctors").get();

  if (snapshot.empty) return 0;

  let totalCommission = 0;
  let count = 0;

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (data.commissionRate) {
      totalCommission += data.commissionRate;
      count++;
    }
  });

  return count > 0 ? (totalCommission / count) * 100 : 0; // Convertir a porcentaje
}
