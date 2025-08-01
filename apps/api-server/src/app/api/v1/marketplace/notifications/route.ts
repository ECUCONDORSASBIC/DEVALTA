import { adminDb } from "@/lib/firebase-admin";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/response-helpers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendNotificationToUser, broadcastNotification } from "../../notifications/websocket/route";

// Schema para notificaciones del marketplace
const MarketplaceNotificationSchema = z.object({
  type: z.enum([
    "new_job_posted",
    "job_application_received",
    "application_status_changed",
    "interview_scheduled",
    "job_offer_extended",
    "doctor_available",
    "company_recruiting",
    "marketplace_match",
    "urgent_position",
    "profile_viewed"
  ]),
  recipientId: z.string().min(1, "ID del destinatario requerido"),
  senderId: z.string().min(1, "ID del remitente requerido"),
  title: z.string().min(1, "Título requerido"),
  message: z.string().min(1, "Mensaje requerido"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  data: z.object({
    jobId: z.string().optional(),
    applicationId: z.string().optional(),
    companyId: z.string().optional(),
    doctorId: z.string().optional(),
    interviewDate: z.string().optional(),
    jobTitle: z.string().optional(),
    companyName: z.string().optional(),
    doctorName: z.string().optional(),
    specialty: z.string().optional(),
    compatibilityScore: z.number().optional(),
    salary: z.object({
      min: z.number(),
      max: z.number(),
      currency: z.string(),
    }).optional(),
    location: z.object({
      city: z.string(),
      country: z.string(),
    }).optional(),
    actionUrl: z.string().optional(),
  }).optional(),
  expiresAt: z.string().optional(),
  channels: z.array(z.enum(["websocket", "email", "push", "sms"])).default(["websocket"]),
});

// Schema para suscripciones del marketplace
const MarketplaceSubscriptionSchema = z.object({
  userId: z.string().min(1, "ID de usuario requerido"),
  userType: z.enum(["doctor", "company"]),
  preferences: z.object({
    newJobs: z.boolean().default(true),
    applications: z.boolean().default(true),
    interviews: z.boolean().default(true),
    offers: z.boolean().default(true),
    matches: z.boolean().default(true),
    profileViews: z.boolean().default(false),
    urgentOnly: z.boolean().default(false),
    specialties: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
    salaryRange: z.object({
      min: z.number(),
      max: z.number(),
    }).optional(),
  }),
  channels: z.object({
    websocket: z.boolean().default(true),
    email: z.boolean().default(true),
    push: z.boolean().default(false),
    sms: z.boolean().default(false),
  }),
});

/**
 * POST /api/v1/marketplace/notifications
 * Enviar notificación del marketplace
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const notificationData = MarketplaceNotificationSchema.parse(body);

    // Verificar preferencias del usuario
    const userPreferences = await getUserNotificationPreferences(
      notificationData.recipientId
    );

    if (!shouldSendNotification(notificationData, userPreferences)) {
      return NextResponse.json(
        createSuccessResponse({
          message: "Notificación bloqueada por preferencias del usuario",
          sent: false,
        })
      );
    }

    // Crear notificación en la base de datos
    const notificationDoc = {
      ...notificationData,
      id: undefined, // Se generará automáticamente
      createdAt: new Date(),
      isRead: false,
      readAt: null,
      deliveredChannels: [],
      failedChannels: [],
      retryCount: 0,
      status: "pending",
    };

    const docRef = await adminDb
      .collection("marketplace_notifications")
      .add(notificationDoc);

    // Enviar por los canales especificados
    const deliveryResults = await deliverNotification(
      docRef.id,
      notificationData,
      userPreferences
    );

    // Actualizar estado de la notificación
    await adminDb
      .collection("marketplace_notifications")
      .doc(docRef.id)
      .update({
        deliveredChannels: deliveryResults.successful,
        failedChannels: deliveryResults.failed,
        status: deliveryResults.successful.length > 0 ? "delivered" : "failed",
        updatedAt: new Date(),
      });

    // Registrar evento en analytics
    await adminDb.collection("marketplace_events").add({
      type: "notification_sent",
      notificationId: docRef.id,
      notificationType: notificationData.type,
      recipientId: notificationData.recipientId,
      senderId: notificationData.senderId,
      channels: deliveryResults.successful,
      timestamp: new Date(),
      details: {
        priority: notificationData.priority,
        jobId: notificationData.data?.jobId,
        applicationId: notificationData.data?.applicationId,
      },
    });

    return NextResponse.json(
      createSuccessResponse({
        id: docRef.id,
        message: "Notificación enviada exitosamente",
        deliveredChannels: deliveryResults.successful,
        failedChannels: deliveryResults.failed,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending marketplace notification:", error);
    return NextResponse.json(
      createErrorResponse(
        "NOTIFICATION_SEND_ERROR",
        "Error al enviar notificación del marketplace"
      ),
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/marketplace/notifications
 * Obtener notificaciones del marketplace para un usuario
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const type = searchParams.get("type");

    if (!userId) {
      return NextResponse.json(
        createErrorResponse("USER_ID_REQUIRED", "ID de usuario requerido"),
        { status: 400 }
      );
    }

    // Construir query
    let query = adminDb
      .collection("marketplace_notifications")
      .where("recipientId", "==", userId);

    if (unreadOnly) {
      query = query.where("isRead", "==", false);
    }

    if (type) {
      query = query.where("type", "==", type);
    }

    // Ejecutar query
    const snapshot = await query
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset(offset)
      .get();

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Obtener conteo de no leídas
    const unreadSnapshot = await adminDb
      .collection("marketplace_notifications")
      .where("recipientId", "==", userId)
      .where("isRead", "==", false)
      .count()
      .get();

    const unreadCount = unreadSnapshot.data().count;

    return NextResponse.json(
      createSuccessResponse({
        notifications,
        unreadCount,
        hasMore: notifications.length === limit,
      })
    );
  } catch (error) {
    console.error("Error fetching marketplace notifications:", error);
    return NextResponse.json(
      createErrorResponse(
        "NOTIFICATIONS_FETCH_ERROR",
        "Error al obtener notificaciones del marketplace"
      ),
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/marketplace/notifications
 * Marcar notificaciones como leídas
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { notificationIds, userId, markAllAsRead } = body;

    if (markAllAsRead && userId) {
      // Marcar todas las notificaciones del usuario como leídas
      const batch = adminDb.batch();
      const snapshot = await adminDb
        .collection("marketplace_notifications")
        .where("recipientId", "==", userId)
        .where("isRead", "==", false)
        .get();

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date(),
        });
      });

      await batch.commit();

      return NextResponse.json(
        createSuccessResponse({
          message: "Todas las notificaciones marcadas como leídas",
          updatedCount: snapshot.docs.length,
        })
      );
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Marcar notificaciones específicas como leídas
      const batch = adminDb.batch();

      for (const notificationId of notificationIds) {
        const notificationRef = adminDb
          .collection("marketplace_notifications")
          .doc(notificationId);

        batch.update(notificationRef, {
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date(),
        });
      }

      await batch.commit();

      return NextResponse.json(
        createSuccessResponse({
          message: "Notificaciones marcadas como leídas",
          updatedCount: notificationIds.length,
        })
      );
    } else {
      return NextResponse.json(
        createErrorResponse(
          "INVALID_REQUEST",
          "Parámetros inválidos para marcar notificaciones"
        ),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating marketplace notifications:", error);
    return NextResponse.json(
      createErrorResponse(
        "NOTIFICATIONS_UPDATE_ERROR",
        "Error al actualizar notificaciones del marketplace"
      ),
      { status: 500 }
    );
  }
}

// Funciones auxiliares

async function getUserNotificationPreferences(userId: string): Promise<any> {
  try {
    const preferencesDoc = await adminDb
      .collection("marketplace_notification_preferences")
      .doc(userId)
      .get();

    if (preferencesDoc.exists) {
      return preferencesDoc.data();
    }

    // Retornar preferencias por defecto
    return {
      preferences: {
        newJobs: true,
        applications: true,
        interviews: true,
        offers: true,
        matches: true,
        profileViews: false,
        urgentOnly: false,
      },
      channels: {
        websocket: true,
        email: true,
        push: false,
        sms: false,
      },
    };
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return null;
  }
}

function shouldSendNotification(
  notification: any,
  userPreferences: any
): boolean {
  if (!userPreferences) return true;

  const { preferences } = userPreferences;

  // Verificar si el tipo de notificación está habilitado
  switch (notification.type) {
    case "new_job_posted":
      return preferences.newJobs;
    case "job_application_received":
    case "application_status_changed":
      return preferences.applications;
    case "interview_scheduled":
      return preferences.interviews;
    case "job_offer_extended":
      return preferences.offers;
    case "marketplace_match":
      return preferences.matches;
    case "profile_viewed":
      return preferences.profileViews;
    case "urgent_position":
      return true; // Las posiciones urgentes siempre se envían
    default:
      return true;
  }
}

async function deliverNotification(
  notificationId: string,
  notification: any,
  userPreferences: any
): Promise<{ successful: string[]; failed: string[] }> {
  const successful: string[] = [];
  const failed: string[] = [];

  // WebSocket delivery
  if (
    notification.channels.includes("websocket") &&
    userPreferences?.channels?.websocket
  ) {
    try {
      await sendNotificationToUser(notification.recipientId, {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        data: {
          ...notification.data,
          notificationId,
          marketplace: true,
        },
      });
      successful.push("websocket");
    } catch (error) {
      console.error("WebSocket delivery failed:", error);
      failed.push("websocket");
    }
  }

  // Email delivery (placeholder)
  if (
    notification.channels.includes("email") &&
    userPreferences?.channels?.email
  ) {
    try {
      // Aquí iría la lógica de envío de email
      await sendEmailNotification(notification);
      successful.push("email");
    } catch (error) {
      console.error("Email delivery failed:", error);
      failed.push("email");
    }
  }

  // Push notification delivery (placeholder)
  if (
    notification.channels.includes("push") &&
    userPreferences?.channels?.push
  ) {
    try {
      // Aquí iría la lógica de push notifications
      await sendPushNotification(notification);
      successful.push("push");
    } catch (error) {
      console.error("Push notification delivery failed:", error);
      failed.push("push");
    }
  }

  return { successful, failed };
}

async function sendEmailNotification(notification: any): Promise<void> {
  // Placeholder para envío de email
  // En una implementación real, aquí se integraría con un servicio como SendGrid, SES, etc.
  console.log("Email notification would be sent:", notification.title);
}

async function sendPushNotification(notification: any): Promise<void> {
  // Placeholder para push notifications
  // En una implementación real, aquí se integraría con FCM, APNs, etc.
  console.log("Push notification would be sent:", notification.title);
}

// Funciones de utilidad para crear notificaciones específicas del marketplace

export async function notifyNewJobPosted(
  jobData: any,
  interestedDoctors: string[]
): Promise<void> {
  const promises = interestedDoctors.map(doctorId =>
    sendMarketplaceNotification({
      type: "new_job_posted",
      recipientId: doctorId,
      senderId: jobData.companyId,
      title: "Nueva oportunidad de trabajo",
      message: `Nueva posición disponible: ${jobData.title}`,
      priority: jobData.urgency === "high" ? "high" : "normal",
      data: {
        jobId: jobData.id,
        jobTitle: jobData.title,
        companyName: jobData.companyInfo?.name,
        specialty: jobData.specialty,
        location: jobData.location,
        salary: jobData.salary,
        actionUrl: `/jobs/${jobData.id}`,
      },
    })
  );

  await Promise.allSettled(promises);
}

export async function notifyJobApplicationReceived(
  applicationData: any
): Promise<void> {
  await sendMarketplaceNotification({
    type: "job_application_received",
    recipientId: applicationData.companyId,
    senderId: applicationData.doctorId,
    title: "Nueva aplicación recibida",
    message: `${applicationData.doctorSnapshot.name} ha aplicado a ${applicationData.jobSnapshot.title}`,
    priority: applicationData.compatibilityScore > 80 ? "high" : "normal",
    data: {
      applicationId: applicationData.id,
      jobId: applicationData.jobId,
      doctorId: applicationData.doctorId,
      doctorName: applicationData.doctorSnapshot.name,
      jobTitle: applicationData.jobSnapshot.title,
      compatibilityScore: applicationData.compatibilityScore,
      actionUrl: `/applications/${applicationData.id}`,
    },
  });
}

export async function notifyApplicationStatusChanged(
  applicationData: any,
  newStatus: string,
  feedback?: string
): Promise<void> {
  await sendMarketplaceNotification({
    type: "application_status_changed",
    recipientId: applicationData.doctorId,
    senderId: applicationData.companyId,
    title: `Estado de aplicación actualizado: ${getStatusDisplayName(newStatus)}`,
    message: feedback || getDefaultStatusMessage(newStatus, applicationData.jobSnapshot?.title),
    priority: ["approved", "hired", "rejected"].includes(newStatus) ? "high" : "normal",
    data: {
      applicationId: applicationData.id,
      jobId: applicationData.jobId,
      status: newStatus,
      jobTitle: applicationData.jobSnapshot?.title,
      feedback,
      actionUrl: `/applications/${applicationData.id}`,
    },
  });
}

async function sendMarketplaceNotification(notificationData: any): Promise<void> {
  try {
    const response = await fetch("/api/v1/marketplace/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notificationData),
    });

    if (!response.ok) {
      throw new Error(`Failed to send notification: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error sending marketplace notification:", error);
  }
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

function getDefaultStatusMessage(status: string, jobTitle?: string): string {
  const title = jobTitle || "la oferta de trabajo";
  
  switch (status) {
    case "reviewing":
      return `La empresa está revisando tu aplicación para ${title}`;
    case "interview_scheduled":
      return `Se ha programado una entrevista para ${title}`;
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