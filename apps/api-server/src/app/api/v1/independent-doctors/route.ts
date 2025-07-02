import { adminDb } from "@altamedica/firebase";
import {
  createErrorResponse,
  createSuccessResponse,
  validatePagination,
} from "@altamedica/shared";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema para médicos independientes
const IndependentDoctorSchema = z.object({
  doctorId: z.string().min(1, "ID de doctor requerido"),
  isIndependent: z.boolean().default(true),
  currentEmployer: z.string().optional(),
  independenceDate: z.date().optional(),
  revenueTarget: z.number().min(0, "Meta de ingresos requerida"),
  specialties: z.array(z.string()).min(1, "Al menos una especialidad"),
  consultationFees: z.object({
    basic: z.number().min(0),
    specialized: z.number().min(0),
    telemedicine: z.number().min(0),
    emergency: z.number().min(0),
  }),
  availability: z.object({
    monday: z.array(z.object({ start: z.string(), end: z.string() })),
    tuesday: z.array(z.object({ start: z.string(), end: z.string() })),
    wednesday: z.array(z.object({ start: z.string(), end: z.string() })),
    thursday: z.array(z.object({ start: z.string(), end: z.string() })),
    friday: z.array(z.object({ start: z.string(), end: z.string() })),
    saturday: z.array(z.object({ start: z.string(), end: z.string() })),
    sunday: z.array(z.object({ start: z.string(), end: z.string() })),
  }),
  marketingPreferences: z.object({
    acceptNewPatients: z.boolean().default(true),
    acceptOrphanPatients: z.boolean().default(true),
    acceptInsurance: z.boolean().default(false),
    acceptDirectPay: z.boolean().default(true),
    preferredPaymentMethods: z
      .array(z.string())
      .default(["credit_card", "bank_transfer"]),
  }),
  independencePlan: z.object({
    targetPatientsPerMonth: z.number().min(1),
    targetRevenuePerMonth: z.number().min(0),
    timeline: z.enum(["immediate", "30_days", "90_days", "6_months"]),
    supportNeeded: z.array(z.string()).default([]),
  }),
});

// Schema para transición de empresa a independiente
const TransitionToIndependentSchema = z.object({
  doctorId: z.string().min(1, "ID de doctor requerido"),
  currentEmployer: z.string().min(1, "Empleador actual requerido"),
  transitionDate: z.date(),
  patientsToMigrate: z.number().min(0).default(0),
  revenueToMigrate: z.number().min(0).default(0),
  supportRequested: z.array(z.string()).default([]),
  independenceReason: z.enum([
    "higher_income",
    "flexibility",
    "technology",
    "patient_control",
    "career_growth",
    "other",
  ]),
});

/**
 * GET /api/v1/independent-doctors
 * Obtener médicos independientes
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get("specialty");
    const minRevenue = searchParams.get("minRevenue");
    const acceptOrphanPatients = searchParams.get("acceptOrphanPatients");

    const { page, limit } = validatePagination(searchParams);

    // Construir query base
    let query = adminDb
      .collection("independent_doctors")
      .where("isIndependent", "==", true)
      .where("isActive", "==", true);

    // Aplicar filtros
    if (specialty) {
      query = query.where("specialties", "array-contains", specialty);
    }

    if (minRevenue) {
      query = query.where("revenueTarget", ">=", parseFloat(minRevenue));
    }

    if (acceptOrphanPatients === "true") {
      query = query.where(
        "marketingPreferences.acceptOrphanPatients",
        "==",
        true
      );
    }

    // Ejecutar query
    const snapshot = await query
      .orderBy("revenueTarget", "desc")
      .orderBy("independenceDate", "desc")
      .limit(limit)
      .offset((page - 1) * limit)
      .get();

    const doctors = [];
    for (const doc of snapshot.docs) {
      const doctorData = doc.data();

      // Calcular métricas adicionales
      const metrics = await calculateIndependentDoctorMetrics(doc.id);

      doctors.push({
        id: doc.id,
        ...doctorData,
        metrics,
        // Información adicional
        independenceDuration: calculateIndependenceDuration(
          doctorData.independenceDate
        ),
        successRate: calculateSuccessRate(metrics),
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
        summary: {
          totalIndependentDoctors: total.data().count,
          averageRevenue: await calculateAverageIndependentRevenue(),
          topSpecialties: await getTopIndependentSpecialties(),
          transitionTrends: await getTransitionTrends(),
        },
      })
    );
  } catch (error) {
    console.error("Error fetching independent doctors:", error);
    return NextResponse.json(
      createErrorResponse(
        "INDEPENDENT_DOCTORS_ERROR",
        "Error al obtener médicos independientes"
      ),
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/independent-doctors
 * Registrar médico como independiente
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const doctorData = IndependentDoctorSchema.parse(body);

    // Verificar que el médico existe
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

    // Verificar que no esté ya registrado como independiente
    const existingIndependentDoc = await adminDb
      .collection("independent_doctors")
      .where("doctorId", "==", doctorData.doctorId)
      .get();

    if (!existingIndependentDoc.empty) {
      return NextResponse.json(
        createErrorResponse(
          "DOCTOR_ALREADY_INDEPENDENT",
          "Médico ya registrado como independiente"
        ),
        { status: 409 }
      );
    }

    // Crear registro de médico independiente
    const independentData = {
      ...doctorData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Información del médico
      doctorInfo: {
        name: doctorInfo.name,
        email: doctorInfo.email,
        phone: doctorInfo.phone,
        license: doctorInfo.license,
        experience: doctorInfo.experience,
        education: doctorInfo.education,
      },
      // Métricas iniciales
      currentPatients: 0,
      currentRevenue: 0,
      totalConsultations: 0,
      averageRating: 0,
      // Estado de transición
      transitionStatus: "active",
      lastEmployer: doctorData.currentEmployer,
    };

    const docRef = await adminDb
      .collection("independent_doctors")
      .add(independentData);

    // Actualizar el perfil del médico
    await adminDb.collection("doctors").doc(doctorData.doctorId).update({
      isIndependent: true,
      independentDoctorId: docRef.id,
      currentEmployer: null,
      updatedAt: new Date(),
    });

    // Registrar evento de transición
    await adminDb.collection("independence_events").add({
      type: "doctor_became_independent",
      doctorId: doctorData.doctorId,
      independentDoctorId: docRef.id,
      timestamp: new Date(),
      details: {
        previousEmployer: doctorData.currentEmployer,
        revenueTarget: doctorData.revenueTarget,
        specialties: doctorData.specialties,
        independenceReason: "voluntary",
      },
    });

    // Notificar a la empresa anterior (si existe)
    if (doctorData.currentEmployer) {
      await adminDb.collection("employer_notifications").add({
        employerId: doctorData.currentEmployer,
        type: "doctor_became_independent",
        title: "Médico se volvió independiente",
        message: `El Dr. ${doctorInfo.name} ahora trabaja independientemente con AltaMedica`,
        data: {
          doctorId: doctorData.doctorId,
          doctorName: doctorInfo.name,
          independenceDate: new Date(),
        },
        createdAt: new Date(),
        isRead: false,
      });
    }

    // Asignar pacientes huérfanos si está disponible
    if (doctorData.marketingPreferences.acceptOrphanPatients) {
      await assignOrphanPatientsToIndependentDoctor(docRef.id, doctorData);
    }

    return NextResponse.json(
      createSuccessResponse({
        id: docRef.id,
        ...independentData,
        message: "Médico registrado exitosamente como independiente",
        nextSteps: [
          "Completar perfil profesional",
          "Configurar horarios de disponibilidad",
          "Establecer tarifas de consulta",
          "Recibir primeros pacientes",
        ],
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering independent doctor:", error);
    return NextResponse.json(
      createErrorResponse(
        "REGISTRATION_ERROR",
        "Error al registrar médico independiente"
      ),
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/independent-doctors/transition
 * Transición de empresa a independiente
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const transitionData = TransitionToIndependentSchema.parse(body);

    // Verificar que el médico existe y trabaja para la empresa
    const doctorDoc = await adminDb
      .collection("doctors")
      .doc(transitionData.doctorId)
      .get();

    if (!doctorDoc.exists) {
      return NextResponse.json(
        createErrorResponse("DOCTOR_NOT_FOUND", "Médico no encontrado"),
        { status: 404 }
      );
    }

    const doctorInfo = doctorDoc.data();
    if (doctorInfo?.currentEmployer !== transitionData.currentEmployer) {
      return NextResponse.json(
        createErrorResponse(
          "EMPLOYER_MISMATCH",
          "El médico no trabaja para la empresa especificada"
        ),
        { status: 400 }
      );
    }

    // Crear plan de transición
    const transitionPlan = {
      doctorId: transitionData.doctorId,
      currentEmployer: transitionData.currentEmployer,
      transitionDate: transitionData.transitionDate,
      status: "planned",
      patientsToMigrate: transitionData.patientsToMigrate,
      revenueToMigrate: transitionData.revenueToMigrate,
      supportRequested: transitionData.supportRequested,
      independenceReason: transitionData.independenceReason,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Timeline de transición
      timeline: {
        planning: new Date(),
        announcement: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        transition: transitionData.transitionDate,
        completion: new Date(
          transitionData.transitionDate.getTime() + 30 * 24 * 60 * 60 * 1000
        ), // 30 días después
      },
      // Soporte proporcionado
      support: {
        legalAssistance: transitionData.supportRequested.includes("legal"),
        financialPlanning:
          transitionData.supportRequested.includes("financial"),
        marketingSupport: transitionData.supportRequested.includes("marketing"),
        technicalSetup: transitionData.supportRequested.includes("technical"),
        patientMigration: transitionData.supportRequested.includes("patients"),
      },
    };

    const transitionRef = await adminDb
      .collection("independence_transitions")
      .add(transitionPlan);

    // Notificar a la empresa
    await adminDb.collection("employer_notifications").add({
      employerId: transitionData.currentEmployer,
      type: "doctor_transition_planned",
      title: "Médico planea volverse independiente",
      message: `El Dr. ${doctorInfo.name} planea volverse independiente el ${transitionData.transitionDate.toLocaleDateString()}`,
      data: {
        doctorId: transitionData.doctorId,
        doctorName: doctorInfo.name,
        transitionDate: transitionData.transitionDate,
        transitionId: transitionRef.id,
        patientsToMigrate: transitionData.patientsToMigrate,
        revenueToMigrate: transitionData.revenueToMigrate,
      },
      createdAt: new Date(),
      isRead: false,
      priority: "high",
    });

    // Crear oferta de retención para la empresa
    await adminDb.collection("retention_offers").add({
      employerId: transitionData.currentEmployer,
      doctorId: transitionData.doctorId,
      transitionId: transitionRef.id,
      type: "partnership_proposal",
      title: "Partnership AltaMedica - Retener Médico",
      message:
        "Mantenga a su médico con tecnología moderna y revenue compartido",
      offer: {
        partnershipType: "hybrid",
        revenueShare: "50/50",
        technologyUpgrade: true,
        patientRetention: true,
        costReduction: "30%",
        timeline: "30 días",
      },
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 días
      createdAt: new Date(),
      status: "pending",
    });

    return NextResponse.json(
      createSuccessResponse({
        transitionId: transitionRef.id,
        ...transitionPlan,
        message: "Plan de transición creado exitosamente",
        nextSteps: [
          "Notificación enviada a la empresa",
          "Oferta de retención creada",
          "Soporte de transición disponible",
          "Timeline de 30 días iniciado",
        ],
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating transition plan:", error);
    return NextResponse.json(
      createErrorResponse(
        "TRANSITION_ERROR",
        "Error al crear plan de transición"
      ),
      { status: 500 }
    );
  }
}

// Funciones auxiliares
async function calculateIndependentDoctorMetrics(
  doctorId: string
): Promise<any> {
  // Calcular métricas del médico independiente
  const consultationsSnapshot = await adminDb
    .collection("consultations")
    .where("doctorId", "==", doctorId)
    .where("status", "==", "completed")
    .get();

  const totalConsultations = consultationsSnapshot.size;
  let totalRevenue = 0;
  let totalRating = 0;

  consultationsSnapshot.docs.forEach((doc) => {
    const consultation = doc.data();
    totalRevenue += consultation.fee || 0;
    totalRating += consultation.rating || 0;
  });

  return {
    totalConsultations,
    totalRevenue,
    averageRating:
      totalConsultations > 0 ? totalRating / totalConsultations : 0,
    averageRevenuePerConsultation:
      totalConsultations > 0 ? totalRevenue / totalConsultations : 0,
  };
}

function calculateIndependenceDuration(independenceDate: any): number {
  if (!independenceDate) return 0;
  const independence = independenceDate.toDate();
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - independence.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Días
}

function calculateSuccessRate(metrics: any): number {
  if (metrics.totalConsultations === 0) return 0;
  const revenueSuccess = Math.min(100, (metrics.totalRevenue / 5000) * 100); // Meta $5,000
  const ratingSuccess = (metrics.averageRating / 5) * 100;
  return Math.round((revenueSuccess + ratingSuccess) / 2);
}

async function calculateAverageIndependentRevenue(): Promise<number> {
  const snapshot = await adminDb
    .collection("independent_doctors")
    .where("isActive", "==", true)
    .get();

  if (snapshot.empty) return 0;

  let totalRevenue = 0;
  let count = 0;

  for (const doc of snapshot.docs) {
    const metrics = await calculateIndependentDoctorMetrics(doc.id);
    totalRevenue += metrics.totalRevenue;
    count++;
  }

  return count > 0 ? totalRevenue / count : 0;
}

async function getTopIndependentSpecialties(): Promise<string[]> {
  const snapshot = await adminDb
    .collection("independent_doctors")
    .where("isActive", "==", true)
    .get();

  const specialtyCount: Record<string, number> = {};

  snapshot.docs.forEach((doc) => {
    const specialties = doc.data().specialties || [];
    specialties.forEach((specialty: string) => {
      specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1;
    });
  });

  return Object.entries(specialtyCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([specialty]) => specialty);
}

async function getTransitionTrends(): Promise<any> {
  const snapshot = await adminDb
    .collection("independence_events")
    .where("type", "==", "doctor_became_independent")
    .orderBy("timestamp", "desc")
    .limit(30)
    .get();

  const monthlyTrends: Record<string, number> = {};

  snapshot.docs.forEach((doc) => {
    const event = doc.data();
    const month = event.timestamp.toDate().toISOString().slice(0, 7); // YYYY-MM
    monthlyTrends[month] = (monthlyTrends[month] || 0) + 1;
  });

  return {
    totalTransitions: snapshot.size,
    monthlyTrends,
    averageTransitionsPerMonth: snapshot.size / 3, // Últimos 3 meses
  };
}

async function assignOrphanPatientsToIndependentDoctor(
  independentDoctorId: string,
  doctorData: any
): Promise<void> {
  try {
    // Buscar pacientes huérfanos que coincidan con las especialidades del médico
    const orphanPatientsQuery = adminDb
      .collection("orphan_patients")
      .where("isAssigned", "==", false)
      .where("isActive", "==", true)
      .limit(10); // Asignar máximo 10 pacientes inicialmente

    const orphanPatientsSnapshot = await orphanPatientsQuery.get();

    for (const doc of orphanPatientsSnapshot.docs) {
      const patientData = doc.data();

      // Verificar compatibilidad
      if (
        doctorData.specialties.includes(
          patientData.preferredSpecialty || "general"
        )
      ) {
        // Crear asignación
        await adminDb.collection("orphan_patient_assignments").add({
          orphanPatientId: doc.id,
          patientId: patientData.patientId,
          doctorId: doctorData.doctorId,
          independentDoctorId,
          assignmentType: "automatic_independent",
          status: "pending_confirmation",
          assignedAt: new Date(),
          estimatedConsultationFee: doctorData.consultationFees.basic,
          commissionRate: 0.1, // 10% para médicos independientes
        });

        // Actualizar paciente huérfano
        await adminDb.collection("orphan_patients").doc(doc.id).update({
          isAssigned: true,
          assignedDoctorId: doctorData.doctorId,
          status: "assigned_to_independent",
          assignedAt: new Date(),
        });
      }
    }
  } catch (error) {
    console.error(
      "Error assigning orphan patients to independent doctor:",
      error
    );
  }
}
