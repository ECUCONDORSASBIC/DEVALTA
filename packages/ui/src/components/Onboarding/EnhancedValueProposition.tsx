"use client";

import React from "react";
import {
  Heart,
  Stethoscope,
  Building,
  Shield,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Star,
  Zap,
} from "lucide-react";

interface EnhancedValuePropositionProps {
  role: "patient" | "doctor" | "company";
  data?: any;
  onUpdate: (data: any) => void;
}

export const EnhancedValueProposition: React.FC<
  EnhancedValuePropositionProps
> = ({ role, data, onUpdate }) => {
  const getRoleContent = () => {
    switch (role) {
      case "patient":
        return {
          title: "Entendemos tu situación",
          subtitle:
            "Como estudiante de medicina, he visto cómo las familias luchan con la gestión de su salud",
          icon: Heart,
          color: "blue",
          personalStory: {
            title: "¿Por qué creé Altamedica?",
            story:
              "Durante mis prácticas en el Hospital de Clínicas, vi a una señora de 75 años llorando porque perdió sus resultados de laboratorio. Tenía que repetir todo el proceso. Ese día decidí que tenía que hacer algo diferente.",
            author:
              "Desarrollado por un estudiante de la Facultad de Medicina de Buenos Aires",
          },
          comparisons: [
            {
              title: "Tu experiencia con Altamedica",
              benefits: [
                "Tu historial médico siempre disponible, sin importar dónde estés",
                "Recordatorios inteligentes que se adaptan a tu rutina",
                "Comunicación directa con tu médico sin llamadas perdidas",
                "Seguimiento automático de tus tratamientos y medicamentos",
                "Acceso a tus resultados de laboratorio en tiempo real",
                "Prescripciones digitales que nunca se pierden",
              ],
              savings: "Ahorras 3-5 horas mensuales en gestión médica",
              emotionalBenefit: "Tranquilidad para ti y tu familia",
            },
            {
              title: "La realidad sin una plataforma integrada",
              problems: [
                "Información médica dispersa en múltiples papeles y aplicaciones",
                "Citas olvidadas que requieren reprogramación costosa",
                "Resultados de laboratorio que llegan tarde o se pierden",
                "Comunicación fragmentada con diferentes médicos",
                "Seguimiento manual de tratamientos que puede generar errores",
                "Prescripciones en papel que se deterioran o extravían",
              ],
              cost: "Pérdida de tiempo valioso y posibles errores médicos",
              emotionalCost: "Estrés y preocupación constante",
            },
          ],
          pricing: {
            title: "Inversión transparente para tu salud",
            plans: [
              {
                name: "Plan Básico",
                price: "Gratis",
                features: [
                  "Historial médico básico",
                  "Recordatorios de citas",
                  "Acceso a resultados",
                ],
                highlight: false,
              },
              {
                name: "Plan Premium",
                price: "$9.99/mes",
                features: [
                  "Todo del plan básico",
                  "Seguimiento de enfermedades crónicas",
                  "Telemedicina",
                  "Prescripciones digitales",
                ],
                highlight: true,
                savings: "Equivale a menos de $0.33 por día",
              },
            ],
            note: "Las consultas médicas tienen costos adicionales según la especialidad ($15-50)",
          },
        };

      case "doctor":
        return {
          title: "Comprendo tu desafío diario",
          subtitle:
            "Como futuro médico, entiendo la frustración de perder tiempo en burocracia en lugar de estar con los pacientes",
          icon: Stethoscope,
          color: "green",
          personalStory: {
            title: "¿Por qué diseñé esta plataforma?",
            story:
              "En mis rotaciones, vi a excelentes médicos perder hasta 2 horas diarias en tareas administrativas. Un cardiólogo me dijo: 'Quiero estar con mis pacientes, no llenando formularios'. Esa conversación cambió todo.",
            author:
              "Desarrollado por un estudiante de la Facultad de Medicina de Buenos Aires",
          },
          comparisons: [
            {
              title: "Tu práctica con Altamedica",
              benefits: [
                "Historiales clínicos automáticos que se actualizan en tiempo real",
                "Agenda inteligente que optimiza tu tiempo y reduce cancelaciones",
                "Acceso completo a datos de pacientes desde cualquier dispositivo",
                "Herramientas de telemedicina integradas para consultas remotas",
                "Seguimiento automático de tratamientos y adherencia",
                "Reportes clínicos generados automáticamente",
              ],
              savings: "Recuperas 10-15 horas semanales para tus pacientes",
              emotionalBenefit: "Satisfacción profesional y mejor atención",
            },
            {
              title: "La realidad con sistemas tradicionales",
              problems: [
                "Historiales en papel que se pierden o deterioran",
                "Agenda manual que consume tiempo valioso de consulta",
                "Información de pacientes desactualizada o incompleta",
                "Limitaciones para ofrecer consultas remotas",
                "Seguimiento manual que puede generar errores médicos",
                "Reportes que requieren tiempo extra fuera de horario",
              ],
              cost: "Pérdida de tiempo profesional y posibles errores clínicos",
              emotionalCost: "Frustración y burnout administrativo",
            },
          ],
          pricing: {
            title: "Inversión en tu eficiencia profesional",
            plans: [
              {
                name: "Plan Individual",
                price: "$49/mes",
                features: [
                  "Gestión completa de pacientes",
                  "Agenda inteligente",
                  "Historiales digitales",
                ],
                highlight: false,
              },
              {
                name: "Plan Profesional",
                price: "$99/mes",
                features: [
                  "Todo del plan individual",
                  "Telemedicina avanzada",
                  "Analytics de práctica",
                  "Integración con laboratorios",
                ],
                highlight: true,
                savings: "Se paga solo con 2-3 consultas adicionales por mes",
              },
            ],
            note: "Comisión del 5% por consulta realizada a través de la plataforma",
          },
        };

      case "company":
        return {
          title: "Entiendo los desafíos de tu institución",
          subtitle:
            "Como estudiante de medicina, he observado cómo las instituciones que no se adaptan quedan atrás",
          icon: Building,
          color: "purple",
          personalStory: {
            title: "¿Por qué desarrollé esta solución?",
            story:
              "Durante mis prácticas en diferentes instituciones, vi cómo los sistemas desconectados causaban retrasos en la atención. Un director me dijo: 'Necesitamos algo que conecte todo, no más sistemas aislados'. Ese fue mi punto de partida.",
            author:
              "Desarrollado por un estudiante de la Facultad de Medicina de Buenos Aires",
          },
          comparisons: [
            {
              title: "Tu institución con Altamedica",
              benefits: [
                "Gestión centralizada de todo el personal médico y administrativo",
                "Analytics en tiempo real del rendimiento y eficiencia",
                "Comunicación fluida entre todos los departamentos",
                "Optimización automática de recursos y camas disponibles",
                "Cumplimiento normativo automatizado y transparente",
                "Facturación integrada que reduce errores y retrasos",
              ],
              savings: "Aumento del 25-40% en eficiencia operativa",
              emotionalBenefit: "Liderazgo en innovación médica",
            },
            {
              title: "La realidad con sistemas fragmentados",
              problems: [
                "Sistemas desconectados que no comparten información",
                "Reportes manuales que consumen recursos valiosos",
                "Comunicación fragmentada entre equipos y departamentos",
                "Gestión ineficiente de recursos y camas disponibles",
                "Riesgo de incumplimiento normativo por errores humanos",
                "Facturación compleja que genera retrasos en cobros",
              ],
              cost: "Pérdida de eficiencia y recursos financieros valiosos",
              emotionalCost: "Frustración del personal y pacientes",
            },
          ],
          pricing: {
            title: "Inversión en el futuro de tu institución",
            plans: [
              {
                name: "Plan Institucional",
                price: "$299/mes",
                features: [
                  "Hasta 10 médicos",
                  "Gestión centralizada",
                  "Reportes básicos",
                ],
                highlight: false,
              },
              {
                name: "Plan Empresarial",
                price: "$599/mes",
                features: [
                  "Médicos ilimitados",
                  "Analytics avanzados",
                  "Integración completa",
                  "Soporte prioritario",
                ],
                highlight: true,
                savings: "ROI positivo en los primeros 3 meses",
              },
            ],
            note: "Comisión del 3% por consulta institucional realizada",
          },
        };
    }
  };

  const content = getRoleContent();
  const IconComponent = content.icon;

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header con historia personal */}
      <div className="text-center space-y-6">
        <div
          className={`w-24 h-24 bg-${content.color}-100 rounded-full flex items-center justify-center mx-auto`}
        >
          <IconComponent className={`w-12 h-12 text-${content.color}-600`} />
        </div>
        <div>
          <h3 className="text-3xl font-bold text-gray-800 mb-3">
            {content.title}
          </h3>
          <p className="text-xl text-gray-600 mb-6">{content.subtitle}</p>
        </div>

        {/* Historia personal */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-6 rounded-r-lg max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <GraduationCap className="w-8 h-8 text-blue-600 mt-1 flex-shrink-0" />
            <div className="text-left">
              <h4 className="font-semibold text-blue-800 mb-2">
                {content.personalStory.title}
              </h4>
              <p className="text-blue-700 mb-3 italic">
                "{content.personalStory.story}"
              </p>
              <p className="text-sm text-blue-600 font-medium">
                {content.personalStory.author}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparación detallada */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Con Altamedica */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-green-800">
                {content.comparisons[0].title}
              </h4>
              <p className="text-green-600">
                Experiencia optimizada y centrada en resultados
              </p>
            </div>
          </div>

          <ul className="space-y-4 mb-8">
            {content.comparisons[0].benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-green-700 text-lg">{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="bg-green-100 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-green-700" />
              <span className="font-bold text-green-800 text-lg">
                {content.comparisons[0].savings}
              </span>
            </div>
            <p className="text-green-700 font-medium">
              {content.comparisons[0].emotionalBenefit}
            </p>
          </div>
        </div>

        {/* Sin Altamedica */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-red-800">
                {content.comparisons[1].title}
              </h4>
              <p className="text-red-600">
                Desafíos comunes que afectan la eficiencia
              </p>
            </div>
          </div>

          <ul className="space-y-4 mb-8">
            {content.comparisons[1].problems.map((problem, index) => (
              <li key={index} className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                <span className="text-red-700 text-lg">{problem}</span>
              </li>
            ))}
          </ul>

          <div className="bg-red-100 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-6 h-6 text-red-700" />
              <span className="font-bold text-red-800 text-lg">
                {content.comparisons[1].cost}
              </span>
            </div>
            <p className="text-red-700 font-medium">
              {content.comparisons[1].emotionalCost}
            </p>
          </div>
        </div>
      </div>

      {/* Precios transparentes */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h4 className="text-2xl font-bold text-gray-800 mb-2">
            {content.pricing.title}
          </h4>
          <p className="text-gray-600">Precios claros, sin sorpresas ocultas</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {content.pricing.plans.map((plan, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl ${
                plan.highlight
                  ? `bg-white border-2 border-${content.color}-200 shadow-lg`
                  : "bg-white border border-gray-200"
              }`}
            >
              <div className="text-center mb-6">
                <h5 className="text-xl font-bold text-gray-800 mb-2">
                  {plan.name}
                </h5>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-gray-800">
                    {plan.price}
                  </span>
                  {plan.price !== "Gratis" && (
                    <span className="text-gray-600">/mes</span>
                  )}
                </div>
                {plan.savings && (
                  <p className="text-sm text-green-600 font-medium">
                    {plan.savings}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.highlight && (
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <Star className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm text-blue-700 font-medium">
                    Plan más popular
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">{content.pricing.note}</p>
        </div>
      </div>

      {/* Call to action sutil */}
      <div className="text-center space-y-6">
        <div className="bg-blue-50 p-6 rounded-xl max-w-2xl mx-auto">
          <h5 className="text-lg font-semibold text-blue-800 mb-3">
            ¿Te gustaría ver cómo funciona en tu caso específico?
          </h5>
          <p className="text-blue-700 mb-4">
            Podemos personalizar la experiencia según tus necesidades
            particulares
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
            <span>Continuar con la configuración personalizada</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
