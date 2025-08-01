"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { cn } from "../../utils/cn";

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  isRequired?: boolean;
}

export interface OnboardingWizardProps {
  steps: OnboardingStep[];
  onComplete: (data: any) => void;
  onSkip?: () => void;
  role: "patient" | "doctor" | "company";
  className?: string;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  steps,
  onComplete,
  onSkip,
  role,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await onComplete(formData);
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (stepId: string, data: any) => {
    setFormData((prev) => ({
      ...prev,
      [stepId]: data,
    }));
  };

  const currentStepData = formData[steps[currentStep]?.id];
  const isStepValid = steps[currentStep]?.isRequired ? currentStepData : true;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const getRoleColors = () => {
    switch (role) {
      case "patient":
        return "bg-blue-500";
      case "doctor":
        return "bg-green-500";
      case "company":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4",
        className
      )}
    >
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Bienvenido a Altamedica</h1>
              <p className="text-slate-300 mt-1">
                Configuración inicial para{" "}
                {role === "patient"
                  ? "pacientes"
                  : role === "doctor"
                    ? "médicos"
                    : "empresas"}
              </p>
            </div>
            {onSkip && (
              <button
                onClick={onSkip}
                className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                <X size={16} />
                Omitir
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
              <span>
                Paso {currentStep + 1} de {steps.length}
              </span>
              <span>{Math.round(progress)}% completado</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  getRoleColors()
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {steps[currentStep] && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                  {steps[currentStep].title}
                </h2>
                <p className="text-slate-600 text-lg">
                  {steps[currentStep].description}
                </p>
              </div>

              <div className="min-h-[400px] flex items-center justify-center">
                {React.cloneElement(
                  steps[currentStep].component as React.ReactElement,
                  {
                    data: currentStepData,
                    onUpdate: (data: any) =>
                      updateFormData(steps[currentStep].id, data),
                    role,
                  }
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-6 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-lg transition-colors",
              currentStep === 0
                ? "text-slate-400 cursor-not-allowed"
                : "text-slate-600 hover:text-slate-800 hover:bg-slate-200"
            )}
          >
            <ChevronLeft size={16} />
            Anterior
          </button>

          <div className="flex items-center gap-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "w-3 h-3 rounded-full transition-colors",
                  index === currentStep
                    ? getRoleColors()
                    : index < currentStep
                      ? "bg-green-400"
                      : "bg-slate-300"
                )}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!isStepValid || isLoading}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors",
              !isStepValid || isLoading
                ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                : cn(
                    "text-white hover:shadow-lg",
                    getRoleColors().replace("bg-", "bg-").replace("500", "600")
                  )
            )}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Completando...
              </>
            ) : currentStep === steps.length - 1 ? (
              <>
                <Check size={16} />
                Completar
              </>
            ) : (
              <>
                Siguiente
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
