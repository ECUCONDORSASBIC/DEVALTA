#!/bin/bash

# 🏢 SCRIPT DE INICIALIZACIÓN - APLICACIÓN EMPRESAS ALTAMEDICA
# Fase 3: Crear aplicación completa desde casi cero

echo "🏢 INICIANDO INICIALIZACIÓN DE APLICACIÓN EMPRESAS"
echo "=================================================="

# Configuración
APP_DIR="apps/companies"
cd $APP_DIR

echo "📁 Directorio actual: $(pwd)"

# 1. Verificar estado actual
echo "🔍 Verificando estado actual..."
if [ -f "src/app/page.tsx" ]; then
    echo "✅ Aplicación base existe"
    echo "📋 Archivos actuales:"
    ls -la src/app/
else
    echo "❌ No se encontró aplicación base"
    exit 1
fi

# 2. Instalar dependencias de autenticación
echo "📦 Instalando dependencias de autenticación..."
if ! pnpm add @altamedica/firebase firebase; then
    echo "❌ Error al instalar dependencias de Firebase"
    exit 1
fi
echo "✅ Dependencias de Firebase instaladas"

# 3. Crear estructura de carpetas completa
echo "📁 Creando estructura de carpetas..."
mkdir -p src/hooks
mkdir -p src/contexts
mkdir -p src/components/auth
mkdir -p src/components/dashboard
mkdir -p src/components/doctors
mkdir -p src/components/patients
mkdir -p src/components/reports
mkdir -p src/components/billing
mkdir -p src/app/(auth)
mkdir -p src/app/dashboard
mkdir -p src/app/doctors
mkdir -p src/app/doctors/add
mkdir -p src/app/doctors/[id]
mkdir -p src/app/patients
mkdir -p src/app/patients/[id]
mkdir -p src/app/reports
mkdir -p src/app/billing
mkdir -p src/app/billing/invoices
mkdir -p src/types

echo "✅ Estructura de carpetas creada"

# 4. Crear archivos base
echo "📝 Creando archivos base..."

# Hook de autenticación empresarial
cat > src/hooks/useCompanyAuth.tsx << 'EOF'
import { useState, useEffect, useCallback } from 'react';

export interface Company {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'laboratory';
  address: Address;
  contact: ContactInfo;
  subscription: SubscriptionPlan;
  doctors: string[];
  patients: string[];
  createdAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  website?: string;
}

export interface SubscriptionPlan {
  type: 'basic' | 'professional' | 'enterprise';
  startDate: Date;
  endDate: Date;
  features: string[];
}

export function useCompanyAuth() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implementar autenticación Firebase para empresas
      console.log('Company Login:', email, password);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (companyData: Partial<Company>) => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Implementar registro de empresa
      console.log('Company Registration:', companyData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error de registro');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // TODO: Implementar logout Firebase
      setCompany(null);
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }, []);

  useEffect(() => {
    // TODO: Verificar sesión existente
    setLoading(false);
  }, []);

  return {
    company,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!company
  };
}
EOF

# Tipos empresariales
cat > src/types/company.types.ts << 'EOF'
export interface Company {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'laboratory';
  address: Address;
  contact: ContactInfo;
  subscription: SubscriptionPlan;
  doctors: string[];
  patients: string[];
  createdAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  website?: string;
}

export interface SubscriptionPlan {
  type: 'basic' | 'professional' | 'enterprise';
  startDate: Date;
  endDate: Date;
  features: string[];
}

export interface CompanyDoctor {
  id: string;
  name: string;
  specialty: string;
  licenseNumber: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: Date;
  patientsCount: number;
  rating: number;
}

export interface CompanyPatient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  status: 'active' | 'inactive';
  registrationDate: Date;
  lastVisit: Date;
  assignedDoctor: string;
}

export interface CompanyReport {
  id: string;
  type: 'revenue' | 'appointments' | 'doctors' | 'patients';
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  data: any;
  generatedAt: Date;
}

export interface CompanyInvoice {
  id: string;
  number: string;
  companyId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: Date;
  items: InvoiceItem[];
  createdAt: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
EOF

# Página de login
cat > src/app/(auth)/login/page.tsx << 'EOF'
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function CompanyLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // TODO: Implementar login real
      console.log("Login attempt:", { email, password });
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirigir al dashboard
      router.push("/dashboard");
    } catch (error) {
      setError("Error de autenticación. Verifica tus credenciales.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Building2 className="w-12 h-12 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Altamedica</h1>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Portal Empresarial
            </h2>
            <p className="text-gray-600">
              Accede a tu panel de gestión empresarial
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Empresarial
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@empresa.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{" "}
              <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Registra tu empresa
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF

# Dashboard empresarial
cat > src/app/dashboard/page.tsx << 'EOF'
"use client";

import React from "react";
import { Building2, Users, UserCheck, Calendar, DollarSign, TrendingUp } from "lucide-react";

export default function CompanyDashboardPage() {
  // Mock data - en producción vendría de APIs reales
  const stats = {
    totalDoctors: 24,
    totalPatients: 1250,
    appointmentsToday: 45,
    revenueThisMonth: 125000,
    growthRate: 12.5
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Building2 className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Empresarial</h1>
          </div>
          <p className="text-gray-600">
            Bienvenido al panel de gestión de Hospital San José
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Médicos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <UserCheck className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pacientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.appointmentsToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ingresos Mes</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.revenueThisMonth.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="font-medium">Gestionar Médicos</span>
                </div>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <UserCheck className="w-5 h-5 text-green-600 mr-3" />
                  <span className="font-medium">Ver Pacientes</span>
                </div>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="font-medium">Generar Reportes</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Nuevo médico registrado</p>
                  <p className="text-sm text-gray-600">Dr. María González - Cardiología</p>
                </div>
                <span className="text-xs text-gray-500">Hace 2 horas</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Cita completada</p>
                  <p className="text-sm text-gray-600">Consulta con Dr. Carlos López</p>
                </div>
                <span className="text-xs text-gray-500">Hace 1 hora</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Pago recibido</p>
                  <p className="text-sm text-gray-600">Factura #2025-001 pagada</p>
                </div>
                <span className="text-xs text-gray-500">Hace 3 horas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Chart Placeholder */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Crecimiento Mensual</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Gráfico de crecimiento (implementar con Chart.js)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF

echo "✅ Archivos base creados"

# 5. Verificar TypeScript
echo "🔍 Verificando TypeScript..."
if ! pnpm run type-check; then
    echo "⚠️  Errores de TypeScript encontrados"
else
    echo "✅ TypeScript verificado correctamente"
fi

# 6. Instalar dependencias
echo "📦 Instalando dependencias..."
if ! pnpm install; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi
echo "✅ Dependencias instaladas"

# 7. Build de prueba
echo "🔨 Probando build..."
if ! pnpm run build; then
    echo "❌ Error en el build"
    exit 1
fi
echo "✅ Build exitoso"

# 8. Resumen final
echo ""
echo "🎉 INICIALIZACIÓN COMPLETADA"
echo "============================"
echo "✅ Dependencias instaladas"
echo "✅ Estructura de carpetas creada"
echo "✅ Archivos base creados"
echo "✅ Build verificado"
echo ""
echo "🚀 Próximos pasos:"
echo "1. Implementar autenticación Firebase"
echo "2. Crear gestión de médicos"
echo "3. Crear gestión de pacientes"
echo "4. Implementar sistema de reportes"
echo "5. Crear sistema de facturación"
echo ""
echo "📍 Para iniciar desarrollo:"
echo "cd $APP_DIR && pnpm run dev"
echo "🌐 URL: http://localhost:3002" 