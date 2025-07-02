"use client";

import React, { useState } from "react";
import {
  Bell,
  Check,
  X,
  AlertTriangle,
  Calendar,
  Pill,
  FileText,
} from "lucide-react";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread" | "urgent">("all");

  const notifications = [
    {
      id: "1",
      type: "appointment",
      title: "Recordatorio de Cita",
      message:
        "Tienes una cita programada mañana a las 10:00 AM con Dr. García",
      timestamp: "2025-01-27T10:00:00Z",
      isRead: false,
      priority: "high",
      actionUrl: "/appointments",
    },
    {
      id: "2",
      type: "prescription",
      title: "Prescripción por Vencer",
      message: "Tu prescripción de Losartán vence en 3 días.",
      timestamp: "2025-01-26T15:30:00Z",
      isRead: false,
      priority: "urgent",
      actionUrl: "/prescriptions",
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case "prescription":
        return <Pill className="w-5 h-5 text-green-600" />;
      case "lab_result":
        return <FileText className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-gray-600">Gestiona tus alertas y recordatorios</p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border-l-4 ${
              notification.priority === "urgent"
                ? "border-l-red-500 bg-red-50"
                : "border-l-blue-500 bg-blue-50"
            }`}
          >
            <div className="flex items-start gap-3">
              {getNotificationIcon(notification.type)}
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {notification.title}
                </h3>
                <p className="text-gray-600 mt-1">{notification.message}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-gray-500">
                    {new Date(notification.timestamp).toLocaleDateString(
                      "es-ES"
                    )}
                  </span>
                  {notification.actionUrl && (
                    <a
                      href={notification.actionUrl}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Ver detalles →
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
