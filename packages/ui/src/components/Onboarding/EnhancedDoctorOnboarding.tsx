"use client";

import React, { useState } from "react";
import {
  User,
  Stethoscope,
  Calendar,
  Shield,
  CheckCircle,
  GraduationCap,
  MapPin,
  Clock,
} from "lucide-react";
import { OnboardingWizard, OnboardingStep } from "./OnboardingWizard";
import { EnhancedValueProposition } from "./EnhancedValueProposition";
import { Button } from "../Button";

interface EnhancedDoctorOnboardingProps {
  onComplete: (data: any) => void;
  onSkip?: () => void;
}

const ValuePropositionStep: React.FC<{
  data?: any;
  onUpdate: (data: any) => void;
}> = ({ data, onUpdate }) => {
  return (
    <EnhancedValueProposition role="doctor" data={data} onUpdate={onUpdate} />
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
      licenseNumber: "",
      specialization: "",
      yearsOfExperience: "",
      languages: [],
    }
  );

  const [newLanguage, setNewLanguage] = useState("");

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const addLanguage = () => {
    if (
      newLanguage.trim() &&
      !formData.languages.includes(newLanguage.trim())
    ) {
      const newData = {
        ...formData,
        languages: [...formData.languages, newLanguage.trim()],
      };
      setFormData(newData);
      onUpdate(newData);
      setNewLanguage("");
    }
  };

  const removeLanguage = (index: number) => {
    const newData = {
      ...formData,
      languages: formData.languages.filter((_: any, i: number) => i !== index),
    };
    setFormData(newData);
    onUpdate(newData);
  };

  const isValid =
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.phone &&
    formData.licenseNumber;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <User className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">
          Información Personal
        </h3>
        <p className="text-gray-600">
          Comencemos con tus datos básicos para crear tu perfil profesional
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Tu apellido"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Profesional *{" "}
              {!formData.email && <span className="text-red-500">*</span>}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="dr.perez@altamedica.com"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Licencia *{" "}
              {!formData.licenseNumber && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={(e) => handleChange("licenseNumber", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="12345"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Años de Experiencia
            </label>
            <select
              value={formData.yearsOfExperience}
              onChange={(e) =>
                handleChange("yearsOfExperience", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Seleccionar</option>
              <option value="0-2">0-2 años</option>
              <option value="3-5">3-5 años</option>
              <option value="6-10">6-10 años</option>
              <option value="11-15">11-15 años</option>
              <option value="16-20">16-20 años</option>
              <option value="20+">Más de 20 años</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Especialización Principal
          </label>
          <select
            value={formData.specialization}
            onChange={(e) => handleChange("specialization", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Seleccionar especialización</option>
            <option value="cardiology">Cardiología</option>
            <option value="dermatology">Dermatología</option>
            <option value="endocrinology">Endocrinología</option>
            <option value="gastroenterology">Gastroenterología</option>
            <option value="gynecology">Ginecología</option>
            <option value="neurology">Neurología</option>
            <option value="ophthalmology">Oftalmología</option>
            <option value="orthopedics">Ortopedia</option>
            <option value="pediatrics">Pediatría</option>
            <option value="psychiatry">Psiquiatría</option>
            <option value="radiology">Radiología</option>
            <option value="urology">Urología</option>
            <option value="general">Medicina General</option>
            <option value="other">Otra</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Idiomas que Hablas
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: Inglés, Francés, etc."
                onKeyPress={(e) => e.key === "Enter" && addLanguage()}
              />
              <Button
                onClick={addLanguage}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Agregar
              </Button>
            </div>
            {formData.languages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((language: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {language}
                    <button
                      onClick={() => removeLanguage(index)}
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

const CredentialsStep: React.FC<{
  data?: any;
  onUpdate: (data: any) => void;
}> = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState(
    data || {
      medicalSchool: "",
      graduationYear: "",
      certifications: [],
      memberships: [],
      publications: [],
    }
  );

  const [newItem, setNewItem] = useState({
    certifications: "",
    memberships: "",
    publications: "",
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

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <GraduationCap className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">
          Credenciales Médicas
        </h3>
        <p className="text-gray-600">
          Información sobre tu formación y certificaciones profesionales
        </p>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facultad de Medicina
            </label>
            <input
              type="text"
              value={formData.medicalSchool}
              onChange={(e) => handleChange("medicalSchool", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Universidad de Buenos Aires"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Año de Graduación
            </label>
            <input
              type="number"
              value={formData.graduationYear}
              onChange={(e) => handleChange("graduationYear", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="2020"
              min="1950"
              max="2030"
            />
          </div>
        </div>

        {/* Certificaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Certificaciones Profesionales
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newItem.certifications}
                onChange={(e) =>
                  setNewItem({ ...newItem, certifications: e.target.value })
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Cardiología, Medicina Interna"
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  addItem("certifications", newItem.certifications)
                }
              />
              <Button
                onClick={() =>
                  addItem("certifications", newItem.certifications)
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Agregar
              </Button>
            </div>
            {formData.certifications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.certifications.map(
                  (certification: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {certification}
                      <button
                        onClick={() => removeItem("certifications", index)}
                        className="text-blue-600 hover:text-blue-800"
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

        {/* Membresías */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Membresías Profesionales
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newItem.memberships}
                onChange={(e) =>
                  setNewItem({ ...newItem, memberships: e.target.value })
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Sociedad Argentina de Cardiología"
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  addItem("memberships", newItem.memberships)
                }
              />
              <Button
                onClick={() => addItem("memberships", newItem.memberships)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Agregar
              </Button>
            </div>
            {formData.memberships.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.memberships.map(
                  (membership: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {membership}
                      <button
                        onClick={() => removeItem("memberships", index)}
                        className="text-blue-600 hover:text-blue-800"
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

        {/* Publicaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Publicaciones Relevantes
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newItem.publications}
                onChange={(e) =>
                  setNewItem({ ...newItem, publications: e.target.value })
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Título de la publicación"
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  addItem("publications", newItem.publications)
                }
              />
              <Button
                onClick={() => addItem("publications", newItem.publications)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Agregar
              </Button>
            </div>
            {formData.publications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.publications.map(
                  (publication: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {publication}
                      <button
                        onClick={() => removeItem("publications", index)}
                        className="text-blue-600 hover:text-blue-800"
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
      </div>
    </div>
  );
};

const ScheduleStep: React.FC<{
  data?: any;
  onUpdate: (data: any) => void;
}> = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState(
    data || {
      availability: {
        monday: { morning: false, afternoon: false, evening: false },
        tuesday: { morning: false, afternoon: false, evening: false },
        wednesday: { morning: false, afternoon: false, evening: false },
        thursday: { morning: false, afternoon: false, evening: false },
        friday: { morning: false, afternoon: false, evening: false },
        saturday: { morning: false, afternoon: false, evening: false },
        sunday: { morning: false, afternoon: false, evening: false },
      },
      consultationDuration: "30",
      maxPatientsPerDay: "20",
      emergencyAvailability: false,
    }
  );

  const handleAvailabilityChange = (
    day: string,
    timeSlot: string,
    value: boolean
  ) => {
    const newData = {
      ...formData,
      availability: {
        ...formData.availability,
        [day]: {
          ...formData.availability[day],
          [timeSlot]: value,
        },
      },
    };
    setFormData(newData);
    onUpdate(newData);
  };

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdate(newData);
  };

  const days = [
    { key: "monday", label: "Lunes" },
    { key: "tuesday", label: "Martes" },
    { key: "wednesday", label: "Miércoles" },
    { key: "thursday", label: "Jueves" },
    { key: "friday", label: "Viernes" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
  ];

  const timeSlots = [
    { key: "morning", label: "Mañana (8:00-12:00)" },
    { key: "afternoon", label: "Tarde (13:00-17:00)" },
    { key: "evening", label: "Noche (18:00-22:00)" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
          <Calendar className="w-10 h-10 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">
          Horarios de Consulta
        </h3>
        <p className="text-gray-600">
          Configura tu disponibilidad para que los pacientes puedan agendar
          citas
        </p>
      </div>

      <div className="space-y-8">
        {/* Disponibilidad Semanal */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Disponibilidad Semanal
          </h4>
          <div className="space-y-4">
            {days.map((day) => (
              <div
                key={day.key}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h5 className="font-medium text-gray-700 mb-3">{day.label}</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {timeSlots.map((slot) => (
                    <label
                      key={slot.key}
                      className="flex items-center space-x-3"
                    >
                      <input
                        type="checkbox"
                        checked={formData.availability[day.key][slot.key]}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            day.key,
                            slot.key,
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">
                        {slot.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuración de Consultas */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Configuración de Consultas
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración de Consulta (minutos)
              </label>
              <select
                value={formData.consultationDuration}
                onChange={(e) =>
                  handleChange("consultationDuration", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="15">15 minutos</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">60 minutos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máximo de Pacientes por Día
              </label>
              <input
                type="number"
                value={formData.maxPatientsPerDay}
                onChange={(e) =>
                  handleChange("maxPatientsPerDay", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="20"
                min="1"
                max="50"
              />
            </div>
          </div>
        </div>

        {/* Disponibilidad de Emergencias */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.emergencyAvailability}
              onChange={(e) =>
                handleChange("emergencyAvailability", e.target.checked)
              }
              className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-gray-700">
              Estoy disponible para consultas de emergencia fuera de mi horario
              regular
            </span>
          </label>
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
        newAppointments: true,
        cancellations: true,
        patientMessages: true,
        systemUpdates: true,
      },
      communication: {
        email: true,
        sms: true,
        push: true,
        inApp: true,
      },
      privacy: {
        shareProfile: true,
        allowReviews: true,
        researchParticipation: false,
      },
      practice: {
        autoConfirmAppointments: false,
        requirePreConsultation: false,
        allowTelemedicine: true,
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
        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
          <Shield className="w-10 h-10 text-indigo-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">
          Preferencias de Práctica
        </h3>
        <p className="text-gray-600">
          Personaliza tu experiencia y configuración de práctica médica
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
                checked={formData.notifications.newAppointments}
                onChange={(e) =>
                  handleChange(
                    "notifications",
                    "newAppointments",
                    e.target.checked
                  )
                }
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700">Nuevas citas agendadas</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.notifications.cancellations}
                onChange={(e) =>
                  handleChange(
                    "notifications",
                    "cancellations",
                    e.target.checked
                  )
                }
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700">Cancelaciones de citas</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.notifications.patientMessages}
                onChange={(e) =>
                  handleChange(
                    "notifications",
                    "patientMessages",
                    e.target.checked
                  )
                }
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700">Mensajes de pacientes</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.notifications.systemUpdates}
                onChange={(e) =>
                  handleChange(
                    "notifications",
                    "systemUpdates",
                    e.target.checked
                  )
                }
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700">Actualizaciones del sistema</span>
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
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700">Notificaciones push</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.communication.inApp}
                onChange={(e) =>
                  handleChange("communication", "inApp", e.target.checked)
                }
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700">
                Notificaciones en la aplicación
              </span>
            </label>
          </div>
        </div>

        {/* Privacidad */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Privacidad y Perfil
          </h4>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.privacy.shareProfile}
                onChange={(e) =>
                  handleChange("privacy", "shareProfile", e.target.checked)
                }
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700">
                Compartir mi perfil con pacientes potenciales
              </span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.privacy.allowReviews}
                onChange={(e) =>
                  handleChange("privacy", "allowReviews", e.target.checked)
                }
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700">
                Permitir que los pacientes dejen reseñas
              </span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.privacy.researchParticipation}
                onChange={(e) =>
                  handleChange(
                    "privacy",
                    "researchParticipation",
                    e.target.checked
                  )
                }
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700">
                Participar en investigaciones médicas anónimas
              </span>
            </label>
          </div>
        </div>

        {/* Configuración de Práctica */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Configuración de Práctica
          </h4>
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.practice.autoConfirmAppointments}
                onChange={(e) =>
                  handleChange(
                    "practice",
                    "autoConfirmAppointments",
                    e.target.checked
                  )
                }
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700">
                Confirmar automáticamente las citas agendadas
              </span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.practice.requirePreConsultation}
                onChange={(e) =>
                  handleChange(
                    "practice",
                    "requirePreConsultation",
                    e.target.checked
                  )
                }
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700">
                Requerir información previa antes de la consulta
              </span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.practice.allowTelemedicine}
                onChange={(e) =>
                  handleChange(
                    "practice",
                    "allowTelemedicine",
                    e.target.checked
                  )
                }
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700">
                Ofrecer consultas de telemedicina
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
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          ¡Bienvenido a Altamedica!
        </h3>
        <p className="text-lg text-gray-600 mb-6">
          Tu perfil profesional está configurado y listo para recibir pacientes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <div className="flex items-start space-x-3">
          <Calendar className="w-6 h-6 text-green-600 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-800">
              Gestión de Pacientes
            </h4>
            <p className="text-sm text-gray-600">
              Administra tu agenda y pacientes de manera eficiente
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Stethoscope className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-800">
              Historiales Clínicos
            </h4>
            <p className="text-sm text-gray-600">
              Accede a información completa de tus pacientes
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Clock className="w-6 h-6 text-purple-600 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-800">Telemedicina</h4>
            <p className="text-sm text-gray-600">
              Realiza consultas remotas cuando sea necesario
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Shield className="w-6 h-6 text-indigo-600 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-800">Seguridad</h4>
            <p className="text-sm text-gray-600">
              Tus datos y los de tus pacientes están protegidos
            </p>
          </div>
        </div>
      </div>

      <div className="bg-green-50 p-6 rounded-xl">
        <h4 className="font-semibold text-green-800 mb-2">¿Qué sigue?</h4>
        <p className="text-green-700 text-sm">
          Explora tu dashboard médico, revisa tu agenda o comienza a recibir
          pacientes. Estamos aquí para ayudarte a optimizar tu práctica médica.
        </p>
      </div>
    </div>
  );
};

export const EnhancedDoctorOnboarding: React.FC<
  EnhancedDoctorOnboardingProps
> = ({ onComplete, onSkip }) => {
  const steps: OnboardingStep[] = [
    {
      id: "value-proposition",
      title: "Conoce Altamedica",
      description: "Descubre cómo podemos optimizar tu práctica médica",
      component: <ValuePropositionStep />,
      isRequired: false,
    },
    {
      id: "personal-info",
      title: "Información Personal",
      description:
        "Comencemos con tus datos básicos para crear tu perfil profesional",
      component: <PersonalInfoStep />,
      isRequired: true,
    },
    {
      id: "credentials",
      title: "Credenciales Médicas",
      description:
        "Información sobre tu formación y certificaciones profesionales",
      component: <CredentialsStep />,
      isRequired: false,
    },
    {
      id: "schedule",
      title: "Horarios de Consulta",
      description:
        "Configura tu disponibilidad para que los pacientes puedan agendar citas",
      component: <ScheduleStep />,
      isRequired: false,
    },
    {
      id: "preferences",
      title: "Preferencias de Práctica",
      description:
        "Personaliza tu experiencia y configuración de práctica médica",
      component: <PreferencesStep />,
      isRequired: false,
    },
    {
      id: "welcome",
      title: "¡Todo Listo!",
      description:
        "Tu perfil profesional está configurado y listo para recibir pacientes",
      component: <WelcomeStep />,
      isRequired: false,
    },
  ];

  return (
    <OnboardingWizard
      steps={steps}
      onComplete={onComplete}
      onSkip={onSkip}
      role="doctor"
    />
  );
};
