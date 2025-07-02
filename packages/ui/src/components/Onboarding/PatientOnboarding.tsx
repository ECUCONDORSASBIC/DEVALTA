"use client";

import React, { useState } from "react";
import { User, Heart, Calendar, Bell, Shield, CheckCircle } from "lucide-react";
import { OnboardingWizard, OnboardingStep } from "./OnboardingWizard";
import { Button } from "../Button";

interface PatientOnboardingProps {
  onComplete: (data: any) => void;
  onSkip?: () => void;
}

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
    <div className="w-full max-w-2xl space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800">
          Información Personal
        </h3>
        <p className="text-slate-600">Comencemos con tus datos básicos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nombre *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Apellido *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tu apellido"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Teléfono *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Género
          </label>
          <select
            value={formData.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <h4 className="text-lg font-medium text-slate-800 mb-4">
          Contacto de Emergencia
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={formData.emergencyContact.name}
              onChange={(e) =>
                handleEmergencyContactChange("name", e.target.value)
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.emergencyContact.phone}
              onChange={(e) =>
                handleEmergencyContactChange("phone", e.target.value)
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Relación
            </label>
            <input
              type="text"
              value={formData.emergencyContact.relationship}
              onChange={(e) =>
                handleEmergencyContactChange("relationship", e.target.value)
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Esposo/a, Padre, etc."
            />
          </div>
        </div>
      </div>

      {!isValid && (
        <div className="text-red-600 text-sm text-center">
          Por favor completa todos los campos obligatorios
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

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800">
          Historial Médico
        </h3>
        <p className="text-slate-600">Ayúdanos a conocer tu salud</p>
      </div>

      <div className="space-y-6">
        {/* Alergias */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Alergias
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Ej: Penicilina, Polen"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addItem("allergies", e.currentTarget.value);
                  e.currentTarget.value = "";
                }
              }}
            />
            <Button
              onClick={() => {
                const input = document.querySelector(
                  'input[placeholder*="Penicilina"]'
                ) as HTMLInputElement;
                if (input) {
                  addItem("allergies", input.value);
                  input.value = "";
                }
              }}
              variant="outline"
              size="sm"
            >
              Agregar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.allergies.map((allergy: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
              >
                {allergy}
                <button
                  onClick={() => removeItem("allergies", index)}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Medicamentos */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Medicamentos Actuales
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Ej: Metformina 500mg"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addItem("medications", e.currentTarget.value);
                  e.currentTarget.value = "";
                }
              }}
            />
            <Button
              onClick={() => {
                const input = document.querySelector(
                  'input[placeholder*="Metformina"]'
                ) as HTMLInputElement;
                if (input) {
                  addItem("medications", input.value);
                  input.value = "";
                }
              }}
              variant="outline"
              size="sm"
            >
              Agregar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.medications.map((medication: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {medication}
                <button
                  onClick={() => removeItem("medications", index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Condiciones */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Condiciones Médicas
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Ej: Diabetes Tipo 2"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addItem("conditions", e.currentTarget.value);
                  e.currentTarget.value = "";
                }
              }}
            />
            <Button
              onClick={() => {
                const input = document.querySelector(
                  'input[placeholder*="Diabetes"]'
                ) as HTMLInputElement;
                if (input) {
                  addItem("conditions", input.value);
                  input.value = "";
                }
              }}
              variant="outline"
              size="sm"
            >
              Agregar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.conditions.map((condition: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
              >
                {condition}
                <button
                  onClick={() => removeItem("conditions", index)}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Estilo de Vida */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium text-slate-800 mb-4">
            Estilo de Vida
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ¿Fumas?
              </label>
              <select
                value={formData.lifestyle.smoking}
                onChange={(e) =>
                  handleChange("lifestyle", {
                    ...formData.lifestyle,
                    smoking: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="no">No</option>
                <option value="yes">Sí</option>
                <option value="former">Ex fumador</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                ¿Consumes alcohol?
              </label>
              <select
                value={formData.lifestyle.alcohol}
                onChange={(e) =>
                  handleChange("lifestyle", {
                    ...formData.lifestyle,
                    alcohol: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="no">No</option>
                <option value="occasionally">Ocasionalmente</option>
                <option value="moderately">Moderadamente</option>
                <option value="regularly">Regularmente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ejercicio
              </label>
              <select
                value={formData.lifestyle.exercise}
                onChange={(e) =>
                  handleChange("lifestyle", {
                    ...formData.lifestyle,
                    exercise: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="none">Ninguno</option>
                <option value="light">Ligero</option>
                <option value="moderate">Moderado</option>
                <option value="intense">Intenso</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Dieta
              </label>
              <select
                value={formData.lifestyle.diet}
                onChange={(e) =>
                  handleChange("lifestyle", {
                    ...formData.lifestyle,
                    diet: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="balanced">Balanceada</option>
                <option value="vegetarian">Vegetariana</option>
                <option value="vegan">Vegana</option>
                <option value="keto">Keto</option>
                <option value="other">Otra</option>
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
    <div className="w-full max-w-2xl space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800">Preferencias</h3>
        <p className="text-slate-600">Personaliza tu experiencia</p>
      </div>

      <div className="space-y-8">
        {/* Notificaciones */}
        <div>
          <h4 className="text-lg font-medium text-slate-800 mb-4">
            Notificaciones
          </h4>
          <div className="space-y-3">
            {Object.entries(formData.notifications).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) =>
                    handleChange("notifications", key, e.target.checked)
                  }
                  className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                />
                <span className="text-slate-700">
                  {key === "appointments" && "Recordatorios de citas"}
                  {key === "reminders" && "Recordatorios de medicamentos"}
                  {key === "results" && "Resultados de laboratorio"}
                  {key === "updates" && "Actualizaciones del sistema"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Comunicación */}
        <div>
          <h4 className="text-lg font-medium text-slate-800 mb-4">
            Métodos de Comunicación
          </h4>
          <div className="space-y-3">
            {Object.entries(formData.communication).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) =>
                    handleChange("communication", key, e.target.checked)
                  }
                  className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                />
                <span className="text-slate-700">
                  {key === "email" && "Email"}
                  {key === "sms" && "SMS"}
                  {key === "push" && "Notificaciones push"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Privacidad */}
        <div>
          <h4 className="text-lg font-medium text-slate-800 mb-4">
            Privacidad
          </h4>
          <div className="space-y-3">
            {Object.entries(formData.privacy).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) =>
                    handleChange("privacy", key, e.target.checked)
                  }
                  className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                />
                <span className="text-slate-700">
                  {key === "shareData" && "Compartir datos para mejor atención"}
                  {key === "research" &&
                    "Participar en investigaciones médicas"}
                  {key === "marketing" && "Recibir información de productos"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Accesibilidad */}
        <div>
          <h4 className="text-lg font-medium text-slate-800 mb-4">
            Accesibilidad
          </h4>
          <div className="space-y-3">
            {Object.entries(formData.accessibility).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) =>
                    handleChange("accessibility", key, e.target.checked)
                  }
                  className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                />
                <span className="text-slate-700">
                  {key === "largeText" && "Texto grande"}
                  {key === "highContrast" && "Alto contraste"}
                  {key === "screenReader" &&
                    "Compatibilidad con lectores de pantalla"}
                </span>
              </label>
            ))}
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
        <h3 className="text-2xl font-bold text-slate-800 mb-4">
          ¡Bienvenido a Altamedica!
        </h3>
        <p className="text-lg text-slate-600 mb-6">
          Tu plataforma integral de salud está lista. Ahora tienes acceso a:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <div className="flex items-start space-x-3">
          <Calendar className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-slate-800">Gestión de Citas</h4>
            <p className="text-sm text-slate-600">
              Agenda y gestiona tus citas médicas
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Heart className="w-6 h-6 text-green-600 mt-1" />
          <div>
            <h4 className="font-semibold text-slate-800">Historial Médico</h4>
            <p className="text-sm text-slate-600">
              Accede a tu información médica completa
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Bell className="w-6 h-6 text-purple-600 mt-1" />
          <div>
            <h4 className="font-semibold text-slate-800">Notificaciones</h4>
            <p className="text-sm text-slate-600">
              Recibe recordatorios y actualizaciones
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-red-600 mt-1" />
          <div>
            <h4 className="font-semibold text-slate-800">Seguridad</h4>
            <p className="text-sm text-slate-600">
              Tus datos están protegidos y seguros
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <p className="text-blue-800">
          <strong>Próximo paso:</strong> Explora tu dashboard personalizado y
          comienza a gestionar tu salud de manera más eficiente.
        </p>
      </div>
    </div>
  );
};

export const PatientOnboarding: React.FC<PatientOnboardingProps> = ({
  onComplete,
  onSkip,
}) => {
  const steps: OnboardingStep[] = [
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
