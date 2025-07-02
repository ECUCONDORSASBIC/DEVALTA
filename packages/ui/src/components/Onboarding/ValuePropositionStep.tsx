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
} from "lucide-react";

interface ValuePropositionStepProps {
  role: "patient" | "doctor" | "company";
  data?: any;
  onUpdate: (data: any) => void;
}

export const ValuePropositionStep: React.FC<ValuePropositionStepProps> = ({
  role,
  data,
  onUpdate,
}) => {
  const getRoleContent = () => {
    switch (role) {
      case "patient":
        return {
          title: "Tu salud, simplificada",
          subtitle: "Entendemos que tu tiempo y tranquilidad son valiosos",
          icon: Heart,
          color: "blue",
          comparisons: [
            {
              title: "Con Altamedica",
              benefits: [
                "Historial médico completo en un solo lugar",
                "Recordatorios automáticos de citas y medicamentos",
                "Acceso directo a tus resultados de laboratorio",
                "Comunicación segura con tu médico",
                "Seguimiento de enfermedades crónicas",
                "Prescripciones digitales sin papel",
              ],
              savings: "Ahorras tiempo y evitas errores médicos",
            },
            {
              title: "Sin Altamedica",
              problems: [
                "Información médica dispersa en múltiples lugares",
                "Riesgo de olvidar citas importantes",
                "Resultados de laboratorio perdidos o tardíos",
                "Comunicación limitada con médicos",
                "Seguimiento manual de tratamientos",
                "Prescripciones en papel que se pierden",
              ],
              cost: "Pérdida de tiempo y posibles errores médicos",
            },
          ],
          personalTouch:
            "Como estudiante de medicina, he visto cómo la falta de organización médica afecta a las familias. Quiero cambiar eso.",
        };

      case "doctor":
        return {
          title: "Tu práctica médica, potenciada",
          subtitle: "Nos enfocamos en lo que realmente importa: tus pacientes",
          icon: Stethoscope,
          color: "green",
          comparisons: [
            {
              title: "Con Altamedica",
              benefits: [
                "Gestión automática de historiales clínicos",
                "Agenda inteligente que optimiza tu tiempo",
                "Acceso a datos de pacientes en tiempo real",
                "Herramientas de telemedicina integradas",
                "Seguimiento automático de tratamientos",
                "Reportes clínicos automatizados",
              ],
              savings:
                "Más tiempo para tus pacientes, menos para la burocracia",
            },
            {
              title: "Sin Altamedica",
              problems: [
                "Historiales en papel que se pierden",
                "Agenda manual que consume tiempo",
                "Información de pacientes desactualizada",
                "Limitaciones para consultas remotas",
                "Seguimiento manual de tratamientos",
                "Reportes que requieren tiempo extra",
              ],
              cost: "Tiempo valioso perdido en tareas administrativas",
            },
          ],
          personalTouch:
            "Como futuro médico, entiendo la frustración de perder tiempo en burocracia en lugar de estar con los pacientes.",
        };

      case "company":
        return {
          title: "Tu institución médica, conectada",
          subtitle: "Ayudamos a que tu equipo se enfoque en lo esencial",
          icon: Building,
          color: "purple",
          comparisons: [
            {
              title: "Con Altamedica",
              benefits: [
                "Gestión centralizada de todo el personal médico",
                "Analytics en tiempo real del rendimiento",
                "Comunicación fluida entre departamentos",
                "Optimización automática de recursos",
                "Cumplimiento normativo automatizado",
                "Facturación integrada y transparente",
              ],
              savings:
                "Mayor eficiencia operativa y mejor atención al paciente",
            },
            {
              title: "Sin Altamedica",
              problems: [
                "Sistemas desconectados entre departamentos",
                "Reportes manuales que consumen recursos",
                "Comunicación fragmentada entre equipos",
                "Gestión ineficiente de recursos",
                "Riesgo de incumplimiento normativo",
                "Facturación compleja y propensa a errores",
              ],
              cost: "Pérdida de eficiencia y recursos valiosos",
            },
          ],
          personalTouch:
            "Como estudiante de medicina, he observado cómo las instituciones que no se adaptan quedan atrás. Quiero ayudarte a liderar el cambio.",
        };
    }
  };

  const content = getRoleContent();
  const IconComponent = content.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header con toque personal */}
      <div className="text-center space-y-4">
        <div
          className={`w-20 h-20 bg-${content.color}-100 rounded-full flex items-center justify-center mx-auto`}
        >
          <IconComponent className={`w-10 h-10 text-${content.color}-600`} />
        </div>
        <h3 className="text-2xl font-bold text-gray-800">{content.title}</h3>
        <p className="text-gray-600 text-lg">{content.subtitle}</p>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <p className="text-blue-800 italic text-sm">
            "{content.personalTouch}"
          </p>
        </div>
      </div>

      {/* Comparación visual */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Con Altamedica */}
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h4 className="text-xl font-semibold text-green-800">
              {content.comparisons[0].title}
            </h4>
          </div>
          <ul className="space-y-3 mb-6">
            {content.comparisons[0].benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-green-700">{benefit}</span>
              </li>
            ))}
          </ul>
          <div className="bg-green-100 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-700" />
              <span className="font-medium text-green-800">
                {content.comparisons[0].savings}
              </span>
            </div>
          </div>
        </div>

        {/* Sin Altamedica */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h4 className="text-xl font-semibold text-red-800">
              {content.comparisons[1].title}
            </h4>
          </div>
          <ul className="space-y-3 mb-6">
            {content.comparisons[1].problems.map((problem, index) => (
              <li key={index} className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-red-700">{problem}</span>
              </li>
            ))}
          </ul>
          <div className="bg-red-100 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-700" />
              <span className="font-medium text-red-800">
                {content.comparisons[1].cost}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Precios transparentes */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Inversión transparente
        </h4>
        <div className="grid md:grid-cols-3 gap-6">
          {role === "patient" && (
            <>
              <div className="text-center p-4 bg-white rounded-lg">
                <h5 className="font-semibold text-gray-800">Plan Básico</h5>
                <p className="text-2xl font-bold text-blue-600">Gratis</p>
                <p className="text-sm text-gray-600">
                  Acceso básico a funciones
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-blue-200">
                <h5 className="font-semibold text-gray-800">Plan Premium</h5>
                <p className="text-2xl font-bold text-blue-600">$9.99/mes</p>
                <p className="text-sm text-gray-600">
                  Funciones avanzadas incluidas
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <h5 className="font-semibold text-gray-800">Consultas</h5>
                <p className="text-2xl font-bold text-blue-600">$15-50</p>
                <p className="text-sm text-gray-600">
                  Según especialidad médica
                </p>
              </div>
            </>
          )}
          {role === "doctor" && (
            <>
              <div className="text-center p-4 bg-white rounded-lg">
                <h5 className="font-semibold text-gray-800">Plan Individual</h5>
                <p className="text-2xl font-bold text-green-600">$49/mes</p>
                <p className="text-sm text-gray-600">
                  Para médicos independientes
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-green-200">
                <h5 className="font-semibold text-gray-800">
                  Plan Profesional
                </h5>
                <p className="text-2xl font-bold text-green-600">$99/mes</p>
                <p className="text-sm text-gray-600">
                  Con telemedicina avanzada
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <h5 className="font-semibold text-gray-800">Comisión</h5>
                <p className="text-2xl font-bold text-green-600">5%</p>
                <p className="text-sm text-gray-600">Por consulta realizada</p>
              </div>
            </>
          )}
          {role === "company" && (
            <>
              <div className="text-center p-4 bg-white rounded-lg">
                <h5 className="font-semibold text-gray-800">
                  Plan Institucional
                </h5>
                <p className="text-2xl font-bold text-purple-600">$299/mes</p>
                <p className="text-sm text-gray-600">Hasta 10 médicos</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-purple-200">
                <h5 className="font-semibold text-gray-800">
                  Plan Empresarial
                </h5>
                <p className="text-2xl font-bold text-purple-600">$599/mes</p>
                <p className="text-sm text-gray-600">Médicos ilimitados</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <h5 className="font-semibold text-gray-800">Comisión</h5>
                <p className="text-2xl font-bold text-purple-600">3%</p>
                <p className="text-sm text-gray-600">
                  Por consulta institucional
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Call to action sutil */}
      <div className="text-center space-y-4">
        <p className="text-gray-600">
          ¿Te gustaría conocer más sobre cómo podemos ayudarte específicamente?
        </p>
        <div className="flex items-center justify-center gap-2 text-blue-600">
          <span className="text-sm">Continuar con la configuración</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
