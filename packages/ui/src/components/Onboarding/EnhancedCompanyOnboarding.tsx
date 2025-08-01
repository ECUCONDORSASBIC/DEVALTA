"use client";

import React, { useState } from "react";
import {
  Building,
  Users,
  Shield,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Star,
  Zap,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Settings,
  BarChart3,
  FileText,
  CreditCard,
  UserCheck,
  Globe,
  Lock,
  Activity,
  Stethoscope,
} from "lucide-react";
import { cn } from "@altamedica/core";
import { EnhancedValueProposition } from "./EnhancedValueProposition";

interface CompanyData {
  // Información básica de la empresa
  companyName: string;
  industry: string;
  size: "small" | "medium" | "large" | "enterprise";
  location: string;
  website: string;
  
  // Información de contacto
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactRole: string;
  
  // Configuración médica
  medicalStaff: number;
  specialties: string[];
  currentSystems: string[];
  painPoints: string[];
  
  // Objetivos y expectativas
  primaryGoals: string[];
  expectedROI: string;
  timeline: string;
  
  // Configuración técnica
  integrationNeeds: string[];
  complianceRequirements: string[];
  budget: string;
  
  // Preferencias de implementación
  implementationType: "gradual" | "complete" | "pilot";
  trainingNeeds: string[];
  supportLevel: "basic" | "premium" | "enterprise";
}

interface EnhancedCompanyOnboardingProps {
  data?: Partial<CompanyData>;
  onUpdate: (data: CompanyData) => void;
  onComplete: () => void;
}

const INDUSTRIES = [
  "Hospital",
  "Clínica Privada",
  "Centro Médico",
  "Laboratorio",
  "Farmacia",
  "Seguro Médico",
  "Universidad Médica",
  "Gobierno",
  "ONG Médica",
  "Otro",
];

const SPECIALTIES = [
  "Cardiología",
  "Neurología",
  "Oncología",
  "Pediatría",
  "Ginecología",
  "Traumatología",
  "Dermatología",
  "Oftalmología",
  "Psiquiatría",
  "Medicina Interna",
  "Cirugía General",
  "Radiología",
  "Anestesiología",
  "Urología",
  "Otorrinolaringología",
  "Endocrinología",
  "Gastroenterología",
  "Neumología",
  "Reumatología",
  "Medicina Familiar",
];

const CURRENT_SYSTEMS = [
  "Sistema de historiales en papel",
  "Excel para gestión",
  "Sistema básico de citas",
  "Software de facturación",
  "Sistema de laboratorio",
  "PACS para imágenes",
  "Sistema de farmacia",
  "Ninguno",
  "Otro",
];

const PAIN_POINTS = [
  "Sistemas desconectados",
  "Pérdida de tiempo en tareas administrativas",
  "Errores en la facturación",
  "Dificultad para acceder a información",
  "Problemas de comunicación entre departamentos",
  "Cumplimiento normativo complejo",
  "Gestión ineficiente de recursos",
  "Falta de reportes en tiempo real",
  "Problemas de seguridad de datos",
  "Dificultad para escalar",
];

const PRIMARY_GOALS = [
  "Mejorar la eficiencia operativa",
  "Reducir costos administrativos",
  "Mejorar la experiencia del paciente",
  "Cumplir con regulaciones",
  "Expandir servicios",
  "Mejorar la calidad de atención",
  "Optimizar recursos",
  "Implementar telemedicina",
  "Mejorar la facturación",
  "Centralizar información",
];

const INTEGRATION_NEEDS = [
  "Sistema de laboratorio",
  "Sistema de farmacia",
  "PACS para imágenes",
  "Sistema de facturación",
  "Sistema de citas",
  "Sistema de historiales",
  "Sistema de prescripciones",
  "Sistema de reportes",
  "API personalizada",
  "Ninguna integración necesaria",
];

const COMPLIANCE_REQUIREMENTS = [
  "HIPAA",
  "GDPR",
  "ISO 27001",
  "HITECH",
  "Regulaciones locales",
  "Certificaciones médicas",
  "Auditorías regulares",
  "Ninguna específica",
];

export const EnhancedCompanyOnboarding: React.FC<
  EnhancedCompanyOnboardingProps
> = ({ data = {}, onUpdate, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CompanyData>({
    companyName: "",
    industry: "",
    size: "medium",
    location: "",
    website: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    contactRole: "",
    medicalStaff: 10,
    specialties: [],
    currentSystems: [],
    painPoints: [],
    primaryGoals: [],
    expectedROI: "",
    timeline: "",
    integrationNeeds: [],
    complianceRequirements: [],
    budget: "",
    implementationType: "gradual",
    trainingNeeds: [],
    supportLevel: "premium",
    ...data,
  });

  const steps = [
    {
      title: "Proposición de Valor",
      description: "Entendemos tus desafíos",
    },
    {
      title: "Información Básica",
      description: "Conoce tu institución",
    },
    {
      title: "Contacto Principal",
      description: "Quién será nuestro contacto",
    },
    {
      title: "Configuración Médica",
      description: "Tu equipo y especialidades",
    },
    {
      title: "Sistemas Actuales",
      description: "Qué tienes y qué necesitas",
    },
    {
      title: "Objetivos y ROI",
      description: "Qué quieres lograr",
    },
    {
      title: "Configuración Técnica",
      description: "Integraciones y cumplimiento",
    },
    {
      title: "Implementación",
      description: "Cómo te ayudaremos",
    },
    {
      title: "Resumen y Próximos Pasos",
      description: "Todo listo para comenzar",
    },
  ];

  const updateFormData = (updates: Partial<CompanyData>) => {
    const newData = { ...formData, ...updates };
    setFormData(newData);
    onUpdate(newData);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="max-w-4xl mx-auto">
            <EnhancedValueProposition
              role="company"
              data={formData}
              onUpdate={updateFormData}
            />
          </div>
        );

      case 1:
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Cuéntanos sobre tu institución
              </h3>
              <p className="text-gray-600">
                Esta información nos ayuda a personalizar la solución para tus
                necesidades específicas
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la institución *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    updateFormData({ companyName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Hospital San Martín"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de institución *
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) =>
                    updateFormData({ industry: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecciona una opción</option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamaño de la institución *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: "small", label: "Pequeña (1-50 empleados)" },
                    { value: "medium", label: "Mediana (51-200 empleados)" },
                    { value: "large", label: "Grande (201-1000 empleados)" },
                    { value: "enterprise", label: "Empresarial (1000+ empleados)" },
                  ].map((size) => (
                    <label
                      key={size.value}
                      className={cn(
                        "flex items-center p-4 border rounded-lg cursor-pointer transition-colors",
                        formData.size === size.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                    >
                      <input
                        type="radio"
                        name="size"
                        value={size.value}
                        checked={formData.size === size.value}
                        onChange={(e) =>
                          updateFormData({ size: e.target.value as any })
                        }
                        className="sr-only"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {size.label}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      updateFormData({ location: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ciudad, País"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sitio web
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      updateFormData({ website: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://www.tuempresa.com"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Información de contacto principal
              </h3>
              <p className="text-gray-600">
                Esta persona será nuestro contacto principal durante la
                implementación
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) =>
                      updateFormData({ contactName: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo *
                  </label>
                  <input
                    type="text"
                    value={formData.contactRole}
                    onChange={(e) =>
                      updateFormData({ contactRole: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Director Médico"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email corporativo *
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    updateFormData({ contactEmail: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="juan.perez@tuempresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    updateFormData({ contactPhone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+54 11 1234-5678"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Configuración médica
              </h3>
              <p className="text-gray-600">
                Ayúdanos a entender tu equipo médico y especialidades
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de médicos en la institución *
                </label>
                <input
                  type="number"
                  value={formData.medicalStaff}
                  onChange={(e) =>
                    updateFormData({ medicalStaff: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especialidades médicas (selecciona todas las que apliquen)
                </label>
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {SPECIALTIES.map((specialty) => (
                    <label
                      key={specialty}
                      className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(specialty)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFormData({
                              specialties: [...formData.specialties, specialty],
                            });
                          } else {
                            updateFormData({
                              specialties: formData.specialties.filter(
                                (s) => s !== specialty
                              ),
                            });
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Sistemas actuales y desafíos
              </h3>
              <p className="text-gray-600">
                Entendemos qué tienes y qué problemas enfrentas
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sistemas que utilizas actualmente
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {CURRENT_SYSTEMS.map((system) => (
                    <label
                      key={system}
                      className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={formData.currentSystems.includes(system)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFormData({
                              currentSystems: [...formData.currentSystems, system],
                            });
                          } else {
                            updateFormData({
                              currentSystems: formData.currentSystems.filter(
                                (s) => s !== system
                              ),
                            });
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{system}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Principales desafíos que enfrentas (selecciona los más relevantes)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PAIN_POINTS.map((point) => (
                    <label
                      key={point}
                      className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={formData.painPoints.includes(point)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFormData({
                              painPoints: [...formData.painPoints, point],
                            });
                          } else {
                            updateFormData({
                              painPoints: formData.painPoints.filter(
                                (p) => p !== point
                              ),
                            });
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{point}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Objetivos y expectativas
              </h3>
              <p className="text-gray-600">
                ¿Qué quieres lograr con Altamedica?
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objetivos principales (selecciona los más importantes)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PRIMARY_GOALS.map((goal) => (
                    <label
                      key={goal}
                      className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={formData.primaryGoals.includes(goal)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFormData({
                              primaryGoals: [...formData.primaryGoals, goal],
                            });
                          } else {
                            updateFormData({
                              primaryGoals: formData.primaryGoals.filter(
                                (g) => g !== goal
                              ),
                            });
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{goal}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ROI esperado
                  </label>
                  <select
                    value={formData.expectedROI}
                    onChange={(e) =>
                      updateFormData({ expectedROI: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="cost-reduction">Reducción de costos</option>
                    <option value="efficiency">Mejora de eficiencia</option>
                    <option value="revenue">Aumento de ingresos</option>
                    <option value="quality">Mejora de calidad</option>
                    <option value="compliance">Cumplimiento normativo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeline de implementación
                  </label>
                  <select
                    value={formData.timeline}
                    onChange={(e) =>
                      updateFormData({ timeline: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="immediate">Inmediato (1-2 meses)</option>
                    <option value="short">Corto plazo (3-6 meses)</option>
                    <option value="medium">Mediano plazo (6-12 meses)</option>
                    <option value="long">Largo plazo (12+ meses)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Configuración técnica
              </h3>
              <p className="text-gray-600">
                Requisitos técnicos y de cumplimiento
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Integraciones necesarias
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {INTEGRATION_NEEDS.map((integration) => (
                    <label
                      key={integration}
                      className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={formData.integrationNeeds.includes(integration)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFormData({
                              integrationNeeds: [...formData.integrationNeeds, integration],
                            });
                          } else {
                            updateFormData({
                              integrationNeeds: formData.integrationNeeds.filter(
                                (i) => i !== integration
                              ),
                            });
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{integration}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requisitos de cumplimiento
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {COMPLIANCE_REQUIREMENTS.map((compliance) => (
                    <label
                      key={compliance}
                      className="flex items-center space-x-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={formData.complianceRequirements.includes(compliance)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFormData({
                              complianceRequirements: [...formData.complianceRequirements, compliance],
                            });
                          } else {
                            updateFormData({
                              complianceRequirements: formData.complianceRequirements.filter(
                                (c) => c !== compliance
                              ),
                            });
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{compliance}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presupuesto aproximado
                </label>
                <select
                  value={formData.budget}
                  onChange={(e) =>
                    updateFormData({ budget: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="under-10k">Menos de $10,000</option>
                  <option value="10k-50k">$10,000 - $50,000</option>
                  <option value="50k-100k">$50,000 - $100,000</option>
                  <option value="100k-500k">$100,000 - $500,000</option>
                  <option value="over-500k">Más de $500,000</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                Plan de implementación
              </h3>
              <p className="text-gray-600">
                ¿Cómo te gustaría implementar Altamedica?
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de implementación
                </label>
                <div className="space-y-4">
                  {[
                    {
                      value: "gradual",
                      title: "Implementación Gradual",
                      description: "Comenzar con un departamento y expandir gradualmente",
                    },
                    {
                      value: "complete",
                      title: "Implementación Completa",
                      description: "Implementar en toda la institución de una vez",
                    },
                    {
                      value: "pilot",
                      title: "Proyecto Piloto",
                      description: "Comenzar con un grupo pequeño para validar",
                    },
                  ].map((type) => (
                    <label
                      key={type.value}
                      className={cn(
                        "flex items-start p-4 border rounded-lg cursor-pointer transition-colors",
                        formData.implementationType === type.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                    >
                      <input
                        type="radio"
                        name="implementationType"
                        value={type.value}
                        checked={formData.implementationType === type.value}
                        onChange={(e) =>
                          updateFormData({ implementationType: e.target.value as any })
                        }
                        className="sr-only"
                      />
                      <div className="w-6 h-6 bg-blue-600 rounded-full mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {type.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {type.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel de soporte requerido
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      value: "basic",
                      title: "Básico",
                      price: "Incluido",
                      features: ["Soporte por email", "Documentación", "Actualizaciones"],
                    },
                    {
                      value: "premium",
                      title: "Premium",
                      price: "+$99/mes",
                      features: ["Soporte telefónico", "Capacitación", "Configuración personalizada"],
                    },
                    {
                      value: "enterprise",
                      title: "Empresarial",
                      price: "+$299/mes",
                      features: ["Soporte 24/7", "Gerente dedicado", "Desarrollo personalizado"],
                    },
                  ].map((level) => (
                    <label
                      key={level.value}
                      className={cn(
                        "flex flex-col p-4 border rounded-lg cursor-pointer transition-colors",
                        formData.supportLevel === level.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                    >
                      <input
                        type="radio"
                        name="supportLevel"
                        value={level.value}
                        checked={formData.supportLevel === level.value}
                        onChange={(e) =>
                          updateFormData({ supportLevel: e.target.value as any })
                        }
                        className="sr-only"
                      />
                      <div className="font-medium text-gray-900 mb-1">
                        {level.title}
                      </div>
                      <div className="text-sm text-blue-600 font-medium mb-2">
                        {level.price}
                      </div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {level.features.map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">
                ¡Perfecto! Tu información está completa
              </h3>
              <p className="text-gray-600">
                Hemos recopilado toda la información necesaria para personalizar
                tu experiencia con Altamedica
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
              <h4 className="text-xl font-bold text-blue-800 mb-6">
                Resumen de tu configuración
              </h4>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">
                      Información de la institución
                    </h5>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Nombre:</strong> {formData.companyName}</p>
                      <p><strong>Tipo:</strong> {formData.industry}</p>
                      <p><strong>Tamaño:</strong> {formData.size}</p>
                      <p><strong>Ubicación:</strong> {formData.location}</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">
                      Contacto principal
                    </h5>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Nombre:</strong> {formData.contactName}</p>
                      <p><strong>Cargo:</strong> {formData.contactRole}</p>
                      <p><strong>Email:</strong> {formData.contactEmail}</p>
                      <p><strong>Teléfono:</strong> {formData.contactPhone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">
                      Configuración médica
                    </h5>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Médicos:</strong> {formData.medicalStaff}</p>
                      <p><strong>Especialidades:</strong> {formData.specialties.length}</p>
                      <p><strong>Sistemas actuales:</strong> {formData.currentSystems.length}</p>
                      <p><strong>Desafíos identificados:</strong> {formData.painPoints.length}</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">
                      Implementación
                    </h5>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Tipo:</strong> {formData.implementationType}</p>
                      <p><strong>Soporte:</strong> {formData.supportLevel}</p>
                      <p><strong>Timeline:</strong> {formData.timeline}</p>
                      <p><strong>Presupuesto:</strong> {formData.budget}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-green-800 mb-2">
                    Próximos pasos
                  </h5>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li>• Nuestro equipo revisará tu información en las próximas 24 horas</li>
                    <li>• Recibirás una propuesta personalizada con recomendaciones específicas</li>
                    <li>• Programaremos una demostración personalizada de la plataforma</li>
                    <li>• Definiremos el plan de implementación detallado</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <button
                onClick={onComplete}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <CheckCircle className="w-5 h-5" />
                Completar configuración
              </button>
              <p className="text-sm text-gray-500">
                Puedes modificar cualquier información en tu perfil más tarde
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header con progreso */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Configuración para Empresas
                </h2>
                <p className="text-gray-600">
                  Paso {currentStep + 1} de {steps.length}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Progreso</div>
              <div className="text-lg font-semibold text-blue-600">
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
              }}
            />
          </div>

          {/* Pasos */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={cn(
                  "flex flex-col items-center space-y-2",
                  index <= currentStep ? "text-blue-600" : "text-gray-400"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    index <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  )}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="text-xs text-center max-w-20">
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contenido del paso actual */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {renderStep()}
        </div>

        {/* Navegación */}
        {currentStep < 8 && (
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors",
                currentStep === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              )}
            >
              <ArrowLeft className="w-5 h-5" />
              Anterior
            </button>

            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {currentStep === steps.length - 2 ? "Finalizar" : "Siguiente"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 