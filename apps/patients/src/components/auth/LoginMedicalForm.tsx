/**
 * LoginMedicalForm.tsx - Formulario de Login Médico Corporativo
 * Proyecto: Altamedica Pacientes
 * Diseño: Versión simplificada para funcionar con autenticación mock
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";

interface LoginMedicalFormProps {
  /** Callback ejecutado después de login exitoso */
  onLoginSuccess?: () => void;
  /** Callback ejecutado si hay error de login */
  onLoginError?: (error: string) => void;
  /** Clase CSS adicional para el contenedor */
  className?: string;
  /** Mostrar link de registro */
  showRegisterLink?: boolean;
  /** Mostrar link de recuperación de contraseña */
  showForgotPassword?: boolean;
  /** Modo compacto para modales */
  compact?: boolean;
  /** Redirección automática después del login */
  autoRedirect?: boolean;
  /** URL de redirección personalizada */
  redirectUrl?: string;
}

/**
 * LoginMedicalForm - Formulario simplificado de autenticación médica
 */
export const LoginMedicalForm: React.FC<LoginMedicalFormProps> = ({
  onLoginSuccess,
  onLoginError,
  className = "",
  showRegisterLink = true,
  showForgotPassword = true,
  compact = false,
  autoRedirect = true,
  redirectUrl = "/dashboard",
}) => {
  const router = useRouter();
  const { login } = useAuth();

  // Estado local simplificado
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validación simple
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Formato de email inválido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    return newErrors;
  };

  // Manejo del submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      onLoginSuccess?.();

      if (autoRedirect) {
        router.push(redirectUrl);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error de autenticación";
      setErrors({ general: errorMessage });
      onLoginError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actualizar campo
  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo al escribir
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Clases CSS dinámicas
  const containerClasses = `
    login-medical-form 
    ${compact ? "space-y-4" : "space-y-6"} 
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  return (
    <div className={containerClasses}>
      {/* Header del formulario médico */}
      {!compact && (
        <div className="text-center space-y-2 mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">A</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Acceso Profesional
          </h1>
          <p className="text-gray-600">Sistema de gestión médica Altamedica</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Campo Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Profesional*
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="doctor@hospital.com"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">❌ {errors.email}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Utiliza tu email institucional o profesional
          </p>
        </div>

        {/* Campo Contraseña */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Contraseña*
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="••••••••"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
            disabled={isSubmitting}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">❌ {errors.password}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
        </div>

        {/* Checkbox Recordar Sesión */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) => updateField("rememberMe", e.target.checked)}
              disabled={isSubmitting}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Recordar mi sesión</span>
          </label>

          {/* Indicador de seguridad */}
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">🔒</span>
            <span className="text-xs text-gray-500">Conexión segura</span>
          </div>
        </div>

        {/* Error general */}
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">❌ {errors.general}</p>
          </div>
        )}

        {/* Botón de Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Verificando credenciales..." : "Iniciar Sesión"}
        </button>

        {/* Información adicional para desarrollo */}
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 p-2 bg-gray-50 rounded text-xs">
            <summary className="cursor-pointer text-gray-600">
              Estado del Formulario (Dev)
            </summary>
            <pre className="mt-2 text-gray-500">
              {JSON.stringify(
                {
                  email: formData.email,
                  passwordLength: formData.password.length,
                  rememberMe: formData.rememberMe,
                  isSubmitting,
                  hasErrors: Object.keys(errors).length > 0,
                },
                null,
                2
              )}
            </pre>
          </details>
        )}
      </form>

      {/* Enlaces adicionales */}
      {!compact && (
        <div className="space-y-3">
          {showForgotPassword && (
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                onClick={() => router.push("/auth/forgot-password")}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {showRegisterLink && (
            <div className="text-center">
              <span className="text-sm text-gray-600">¿No tienes cuenta? </span>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                onClick={() => router.push("/auth/register")}
              >
                Regístrate aquí
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * LoginMedicalFormCompact - Versión compacta para modales
 */
export const LoginMedicalFormCompact: React.FC<
  Omit<LoginMedicalFormProps, "compact">
> = (props) => {
  return <LoginMedicalForm {...props} compact={true} />;
};

/**
 * LoginMedicalFormModal - Versión para uso en modales sin redirección
 */
export const LoginMedicalFormModal: React.FC<
  Omit<LoginMedicalFormProps, "autoRedirect" | "compact">
> = (props) => {
  return <LoginMedicalForm {...props} autoRedirect={false} compact={true} />;
};

export default LoginMedicalForm;
