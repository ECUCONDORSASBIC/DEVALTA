"use client";

import React, { useState } from "react";
import {
  User,
  Heart,
  Calendar,
  Bell,
  Shield,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { OnboardingWizard, OnboardingStep } from "./OnboardingWizard";
import { EnhancedValueProposition } from "./EnhancedValueProposition";
import { Button } from "../Button";

interface EnhancedPatientOnboardingProps {
  onComplete: (data: any) => void;
  onSkip?: () => void;
}

const ValuePropositionStep: React.FC<{
  data?: any;
  onUpdate: (data: any) => void;
}> = ({ data, onUpdate }) => {
  return (
    <EnhancedValueProposition role="patient" data={data} onUpdate={onUpdate} />
  );
};

const PersonalInfoStep: React.FC<{
  data?: any;
  onUpdate: (data: any) => void;
}> = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState(
    data || {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
      },
    }
  );

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    const newData = {
      ...formData,
      emergencyContact: {
        ...formData.emergencyContact,
        [field]: value,
      },
    };
    setFormData(newData);
    onUpdate(newData);
  };

  const isValid =
    formData.firstName && formData.lastName && formData.email && formData.phone;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <User className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">
          Información Personal
        </h3>
        <p className="text-gray-600">
          Comencemos con tus datos básicos para crear tu perfil médico
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *{" "}
              {!formData.firstName && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido *{" "}
              {!formData.lastName && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tu apellido"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *{" "}
              {!formData.email && <span className="text-red-500">*</span>}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono *{" "}
              {!formData.phone && <span className="text-red-500">*</span>}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Género
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
              <option value="prefer-not-to-say">Prefiero no decir</option>
            </select>
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Contacto de Emergencia
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={formData.emergencyContact.name}
                onChange={(e) =>
                  handleEmergencyContactChange("name", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.emergencyContact.phone}
                onChange={(e) =>
                  handleEmergencyContactChange("phone", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relación
              </label>
              <input
                type="text"
                value={formData.emergencyContact.relationship}
                onChange={(e) =>
                  handleEmergencyContactChange("relationship", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Esposo, Padre, etc."
              />
            </div>
          </div>
        </div>
      </div>

      {!isValid && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            Por favor completa los campos obligatorios marcados con * para
            continuar.
          </p>
        </div>
      )}
    </div>
  );
};

const MedicalHistoryStep: React.FC<{
  data?: any;
  onUpdate: (data: any) => void;
}> = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState(
    data || {
      allergies: [],
      medications: [],
      conditions: [],
      surgeries: [],
      familyHistory: "",
      lifestyle: {
        smoking: "no",
        alcohol: "no",
        exercise: "moderate",
        diet: "balanced",
      },
    }
  );

  const [newItem, setNewItem] = useState({
    allergies: "",
    medications: "",
    conditions: "",
    surgeries: "",
  });

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const addItem = (field: string, value: string) => {
    if (value.trim()) {
      const newData = {
        ...formData,
        [field]: [...formData[field], value.trim()],
      };
      setFormData(newData);
      onUpdate(newData);
      setNewItem({ ...newItem, [field]: "" });
    }
  };

  const removeItem = (field: string, index: number) => {
    const newData = {
      ...formData,
      [field]: formData[field].filter((_: any, i: number) => i !== index),
    };
    setFormData(newData);
    onUpdate(newData);
  };

  const handleLifestyleChange = (field: string, value: string) => {
    const newData = {
      ...formData,
      lifestyle: {
        ...formData.lifestyle,
        [field]: value,
      },
    };
    setFormData(newData);
    onUpdate(newData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Heart className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Historial Médico</h3>
        <p className="text-gray-600">
          Ayúdanos a conocer tu salud para brindarte mejor atención
        </p>
      </div>

      <div className="space-y-8">
        {/* Alergias */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Alergias
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newItem.allergies}
                onChange={(e) =>
                  setNewItem({ ...newItem, allergies: e.target.value })
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: Penicilina, Polen, etc."
                onKeyPress={(e) =>
                  e.key === "Enter" && addItem("allergies", newItem.allergies)
                }
              />
              <Button
                onClick={() => addItem("allergies", newItem.allergies)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Agregar
              </Button>
            </div>
            {formData.allergies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.allergies.map((allergy: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {allergy}
                    <button
                      onClick={() => removeItem("allergies", index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Medicamentos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Medicamentos Actuales
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newItem.medications}
                onChange={(e) =>
                  setNewItem({ ...newItem, medications: e.target.value })
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: Aspirina 100mg diario"
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  addItem("medications", newItem.medications)
                }
              />
              <Button
                onClick={() => addItem("medications", newItem.medications)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Agregar
              </Button>
            </div>
            {formData.medications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.medications.map(
                  (medication: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {medication}
                      <button
                        onClick={() => removeItem("medications", index)}
                        className="text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Condiciones Médicas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Condiciones Médicas
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newItem.conditions}
                onChange={(e) =>
                  setNewItem({ ...newItem, conditions: e.target.value })
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: Diabetes tipo 2, Hipertensión"
                onKeyPress={(e) =>
                  e.key === "Enter" && addItem("conditions", newItem.conditions)
                }
              />
              <Button
                onClick={() => addItem("conditions", newItem.conditions)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Agregar
              </Button>
            </div>
            {formData.conditions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.conditions.map((condition: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {condition}
                    <button
                      onClick={() => removeItem("conditions", index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cirugías */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Cirugías Previas
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newItem.surgeries}
                onChange={(e) =>
                  setNewItem({ ...newItem, surgeries: e.target.value })
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: Apendicectomía 2018"
                onKeyPress={(e) =>
                  e.key === "Enter" && addItem("surgeries", newItem.surgeries)
                }
              />
              <Button
                onClick={() => addItem("surgeries", newItem.surgeries)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Agregar
              </Button>
            </div>
            {formData.surgeries.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.surgeries.map((surgery: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {surgery}
                    <button
                      onClick={() => removeItem("surgeries", index)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Historial Familiar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Historial Familiar
          </label>
          <textarea
            value={formData.familyHistory}
            onChange={(e) => handleChange("familyHistory", e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Describe cualquier condición médica que sea común en tu familia..."
          />
        </div>

        {/* Estilo de Vida */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Estilo de Vida
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Fumas?
              </label>
              <select
                value={formData.lifestyle.smoking}
                onChange={(e) =>
                  handleLifestyleChange("smoking", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="no">No</option>
                <option value="occasionally">Ocasionalmente</option>
                <option value="regularly">Regularmente</option>
                <option value="former">Ex fumador</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Consumes alcohol?
              </label>
              <select
                value={formData.lifestyle.alcohol}
                onChange={(e) =>
                  handleLifestyleChange("alcohol", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="no">No</option>
                <option value="occasionally">Ocasionalmente</option>
                <option value="moderately">Moderadamente</option>
                <option value="regularly">Regularmente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Ejercicio
              </label>
              <select
                value={formData.lifestyle.exercise}
                onChange={(e) =>
                  handleLifestyleChange("exercise", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="sedentary">Sedentario</option>
                <option value="light">Ligero</option>
                <option value="moderate">Moderado</option>
                <option value="active">Activo</option>
                <option value="very-active">Muy activo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Dieta
              </label>
              <select
                value={formData.lifestyle.diet}
                onChange={(e) => handleLifestyleChange("diet", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="balanced">Balanceada</option>
                <option value="vegetarian">Vegetariana</option>
                <option value="vegan">Vegana</option>
                <option value="low-carb">Baja en carbohidratos</option>
                <option value="low-fat">Baja en grasas</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PreferencesStep: React.FC<{
  data?: any;
  onUpdate: (data: any) => void;
}> = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState(
    data || {
      notifications: {
        appointments: true,
        reminders: true,
        results: true,
        updates: true,
      },
      communication: {
        email: true,
        sms: true,
        push: true,
      },
      privacy: {
        shareData: false,
        research: false,
        marketing: false,
      },
      accessibility: {
        largeText: false,
        highContrast: false,
        screenReader: false,
      },
    }
  );

  const handleChange = (section: string, field: string, value: boolean) => {
    const newData = {
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value,
      },
    };
    setFormData(newData);
    onUpdate(newData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
          <Bell className="w-10 h-10 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">Preferencias</h3>
        <p className="text-gray-600">
          Personaliza tu experiencia según tus necesidades
        </p>
      </div>

      <div className="space-y-8">
        {/* Notificaciones */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Notificaciones
          </h4>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.notifications.appointments}
                onChange={(e) =>
                  handleChange(
                    "notifications",
                    "appointments",
                    e.target.checked
                  )
                }
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700">Recordatorios de citas</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.notifications.reminders}
                onChange={(e) =>
                  handleChange("notifications", "reminders", e.target.checked)
                }
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700">
                Recordatorios de medicamentos
              </span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.notifications.results}
                onChange={(e) =>
                  handleChange("notifications", "results", e.target.checked)
                }
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700">
                Nuevos resultados de laboratorio
              </span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.notifications.updates}
                onChange={(e) =>
                  handleChange("notifications", "updates", e.target.checked)
                }
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700">
                Actualizaciones de la plataforma
              </span>
            </label>
          </div>
        </div>

        {/* Métodos de Comunicación */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Métodos de Comunicación
          </h4>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.communication.email}
                onChange={(e) =>
                  handleChange("communication", "email", e.target.checked)
                }
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700">Email</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.communication.sms}
                onChange={(e) =>
                  handleChange("communication", "sms", e.target.checked)
                }
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700">SMS</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.communication.push}
                onChange={(e) =>
                  handleChange("communication", "push", e.target.checked)
                }
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700">Notificaciones push</span>
            </label>
          </div>
        </div>

        {/* Privacidad */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Privacidad
          </h4>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.privacy.shareData}
                onChange={(e) =>
                  handleChange("privacy", "shareData", e.target.checked)
                }
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700">
                Compartir datos con mi médico (recomendado)
              </span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.privacy.research}
                onChange={(e) =>
                  handleChange("privacy", "research", e.target.checked)
                }
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700">
                Permitir uso anónimo para investigación médica
              </span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.privacy.marketing}
                onChange={(e) =>
                  handleChange("privacy", "marketing", e.target.checked)
                }
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700">
                Recibir información sobre nuevos servicios
              </span>
            </label>
          </div>
        </div>

        {/* Accesibilidad */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Accesibilidad
          </h4>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.accessibility.largeText}
                onChange={(e) =>
                  handleChange("accessibility", "largeText", e.target.checked)
                }
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700">Texto más grande</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.accessibility.highContrast}
                onChange={(e) =>
                  handleChange(
                    "accessibility",
                    "highContrast",
                    e.target.checked
                  )
                }
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700">Alto contraste</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.accessibility.screenReader}
                onChange={(e) =>
                  handleChange(
                    "accessibility",
                    "screenReader",
                    e.target.checked
                  )
                }
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-gray-700">
                Compatibilidad con lectores de pantalla
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const WelcomeStep: React.FC<{
  data?: any;
  onUpdate: (data: any) => void;
}> = ({ data, onUpdate }) => {
  return (
    <div className="w-full max-w-2xl text-center space-y-8">
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-12 h-12 text-blue-600" />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          ¡Bienvenido a Altamedica!
        </h3>
        <p className="text-lg text-gray-600 mb-6">
          Tu plataforma integral de salud está lista. Ahora tienes acceso a:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <div className="flex items-start space-x-3">
          <Calendar className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-800">Gestión de Citas</h4>
            <p className="text-sm text-gray-600">
              Agenda y gestiona tus citas médicas
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Heart className="w-6 h-6 text-green-600 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-800">Historial Médico</h4>
            <p className="text-sm text-gray-600">
              Accede a tu información médica completa
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Bell className="w-6 h-6 text-purple-600 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-800">Notificaciones</h4>
            <p className="text-sm text-gray-600">
              Recibe recordatorios y actualizaciones
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-indigo-600 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-800">Seguridad</h4>
            <p className="text-sm text-gray-600">
              Tus datos están protegidos y seguros
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-xl">
        <h4 className="font-semibold text-blue-800 mb-2">¿Qué sigue?</h4>
        <p className="text-blue-700 text-sm">
          Explora tu dashboard, agenda tu primera cita o completa tu perfil
          médico. Estamos aquí para ayudarte en cada paso de tu viaje de salud.
        </p>
      </div>
    </div>
  );
};

export const EnhancedPatientOnboarding: React.FC<
  EnhancedPatientOnboardingProps
> = ({ onComplete, onSkip }) => {
  const steps: OnboardingStep[] = [
    {
      id: "value-proposition",
      title: "Conoce Altamedica",
      description: "Descubre cómo podemos ayudarte a gestionar tu salud",
      component: <ValuePropositionStep />,
      isRequired: false,
    },
    {
      id: "personal-info",
      title: "Información Personal",
      description:
        "Comencemos con tus datos básicos para crear tu perfil médico",
      component: <PersonalInfoStep />,
      isRequired: true,
    },
    {
      id: "medical-history",
      title: "Historial Médico",
      description: "Ayúdanos a conocer tu salud para brindarte mejor atención",
      component: <MedicalHistoryStep />,
      isRequired: false,
    },
    {
      id: "preferences",
      title: "Preferencias",
      description: "Personaliza tu experiencia según tus necesidades",
      component: <PreferencesStep />,
      isRequired: false,
    },
    {
      id: "welcome",
      title: "¡Todo Listo!",
      description: "Tu cuenta está configurada y lista para usar",
      component: <WelcomeStep />,
      isRequired: false,
    },
  ];

  return (
    <OnboardingWizard
      steps={steps}
      onComplete={onComplete}
      onSkip={onSkip}
      role="patient"
    />
  );
};
