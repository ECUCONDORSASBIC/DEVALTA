import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  UserCheck,
  Clock,
  DollarSign,
  AlertTriangle,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";

interface OrphanPatient {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  urgency: "low" | "medium" | "high" | "emergency";
  preferredSpecialty?: string;
  budget?: number;
  daysWaiting: number;
  priorityScore: number;
  mainCondition?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
  };
}

interface MarketplaceStats {
  overview: {
    totalOrphanPatients: number;
    assignedPatients: number;
    availableDoctors: number;
    totalAssignments: number;
    recentAssignments: number;
  };
  conversionRate: {
    assignmentRate: number;
    averageWaitTime: number;
  };
  revenue: {
    totalRevenue: number;
    averageCommission: number;
  };
}

export default function OrphanPatientsDashboard() {
  const [patients, setPatients] = useState<OrphanPatient[]>([]);
  const [stats, setStats] = useState<MarketplaceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    urgency: "",
    specialty: "",
    maxBudget: "",
    language: "es",
  });

  useEffect(() => {
    fetchOrphanPatients();
    fetchMarketplaceStats();
  }, [filters]);

  const fetchOrphanPatients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.urgency) params.append("urgency", filters.urgency);
      if (filters.specialty) params.append("specialty", filters.specialty);
      if (filters.maxBudget) params.append("maxBudget", filters.maxBudget);
      if (filters.language) params.append("language", filters.language);

      const response = await fetch(
        `/api/v1/marketplace/orphan-patients?${params}`
      );
      const data = await response.json();

      if (data.success) {
        setPatients(data.data.patients);
      }
    } catch (error) {
      console.error("Error fetching orphan patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketplaceStats = async () => {
    try {
      const response = await fetch("/api/v1/marketplace/stats?endpoint=stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching marketplace stats:", error);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-black";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return "🚨";
      case "high":
        return "⚠️";
      case "medium":
        return "⏰";
      case "low":
        return "✅";
      default:
        return "📋";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleAssignPatient = async (patientId: string) => {
    try {
      // Aquí implementarías la lógica para asignar el paciente
      console.log("Assigning patient:", patientId);
      // await assignPatientToDoctor(patientId);
    } catch (error) {
      console.error("Error assigning patient:", error);
    }
  };

  const handleBulkAssignment = async () => {
    try {
      // Implementar asignación masiva
      console.log("Bulk assignment for", patients.length, "patients");
    } catch (error) {
      console.error("Error in bulk assignment:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando pacientes huérfanos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🏥 Gestión de Pacientes Huérfanos
          </h1>
          <p className="text-gray-600 mt-2">
            Conectando {patients.length} pacientes con médicos disponibles
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleBulkAssignment}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Asignación Masiva
          </Button>
          <Button onClick={fetchOrphanPatients} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pacientes Huérfanos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.overview.totalOrphanPatients}
              </div>
              <p className="text-xs text-muted-foreground">
                Esperando asignación
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pacientes Asignados
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.overview.assignedPatients}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.conversionRate.assignmentRate.toFixed(1)}% tasa de
                conversión
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Médicos Disponibles
              </CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.overview.availableDoctors}
              </div>
              <p className="text-xs text-muted-foreground">En el marketplace</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenue Potencial
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.revenue.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.revenue.averageCommission.toFixed(1)}% comisión promedio
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urgencia
              </label>
              <select
                value={filters.urgency}
                onChange={(e) =>
                  setFilters({ ...filters, urgency: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Todas</option>
                <option value="emergency">Emergencia</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialidad
              </label>
              <select
                value={filters.specialty}
                onChange={(e) =>
                  setFilters({ ...filters, specialty: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Todas</option>
                <option value="cardiology">Cardiología</option>
                <option value="dermatology">Dermatología</option>
                <option value="endocrinology">Endocrinología</option>
                <option value="gastroenterology">Gastroenterología</option>
                <option value="general">Medicina General</option>
                <option value="neurology">Neurología</option>
                <option value="orthopedics">Ortopedia</option>
                <option value="pediatrics">Pediatría</option>
                <option value="psychiatry">Psiquiatría</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presupuesto Máximo
              </label>
              <input
                type="number"
                value={filters.maxBudget}
                onChange={(e) =>
                  setFilters({ ...filters, maxBudget: e.target.value })
                }
                placeholder="USD"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Idioma
              </label>
              <select
                value={filters.language}
                onChange={(e) =>
                  setFilters({ ...filters, language: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="es">Español</option>
                <option value="en">Inglés</option>
                <option value="pt">Portugués</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pacientes Huérfanos ({patients.length})</span>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar pacientes..."
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-blue-600">
                          {patient.name.charAt(0)}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {patient.name}
                        </h3>
                        <Badge variant="outline">{patient.age} años</Badge>
                        <Badge variant="outline">
                          {patient.gender === "male"
                            ? "Hombre"
                            : patient.gender === "female"
                              ? "Mujer"
                              : "Otro"}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-600">
                          {getUrgencyIcon(patient.urgency)}{" "}
                          {patient.urgency.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-600">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {patient.daysWaiting} días esperando
                        </span>
                        {patient.budget && (
                          <span className="text-sm text-gray-600">
                            <DollarSign className="h-3 w-3 inline mr-1" />
                            Presupuesto: {formatCurrency(patient.budget)}
                          </span>
                        )}
                      </div>

                      {patient.mainCondition && (
                        <p className="text-sm text-gray-500 mt-1">
                          Condición: {patient.mainCondition}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        Prioridad: {patient.priorityScore}
                      </div>
                      <Progress
                        value={patient.priorityScore / 2}
                        className="w-20 h-2"
                      />
                    </div>

                    <Button
                      onClick={() => handleAssignPatient(patient.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Asignar
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {patients.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay pacientes huérfanos
                </h3>
                <p className="text-gray-500">
                  Todos los pacientes han sido asignados a médicos.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Potential */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Potencial de Ingresos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  patients.reduce((sum, p) => sum + (p.budget || 100), 0)
                )}
              </div>
              <p className="text-sm text-gray-600">Revenue Potencial Total</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(
                  patients.reduce((sum, p) => sum + (p.budget || 100), 0) * 0.2
                )}
              </div>
              <p className="text-sm text-gray-600">Comisión AltaMedica (20%)</p>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {patients.filter((p) => p.urgency === "emergency").length}
              </div>
              <p className="text-sm text-gray-600">Pacientes de Emergencia</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
