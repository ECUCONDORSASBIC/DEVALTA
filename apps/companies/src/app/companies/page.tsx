"use client";

import {
  ArrowLeft,
  Building,
  MapPin,
  Users,
  Search,
  Filter,
  Briefcase,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CompanyCard } from "../../components/CompanyCard";
import { CompanyFilters } from "../../components/CompanyFilters";
import { LoadingSkeleton } from "../../components/LoadingSkeleton";
import { ErrorMessage } from "../../components/ErrorMessage";

interface Company {
  id: string;
  name: string;
  industry: string;
  description: string;
  location: string;
  size: string;
  rating?: number;
  jobCount?: number;
  logo?: string;
  website?: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/companies");

      if (!response.ok) {
        throw new Error("Error al cargar el directorio de empresas");
      }

      const data = await response.json();
      setCompanies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry =
      selectedIndustry === "all" || company.industry === selectedIndustry;
    const matchesLocation =
      selectedLocation === "all" || company.location.includes(selectedLocation);

    return matchesSearch && matchesIndustry && matchesLocation;
  });

  const industries = [...new Set(companies.map((c) => c.industry))];
  const locations = [...new Set(companies.map((c) => c.location))];

  return (
    <div className="min-h-screen gradient-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in-up">
          <Link
            href="/"
            className="inline-flex items-center mb-6 text-sky-600 hover:text-sky-800 transition-colors"
            aria-label="Volver al dashboard principal"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Volver al Dashboard</span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Directorio de{" "}
              <span className="text-gradient-primary">Empresas Médicas</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Descubre las mejores organizaciones del sector salud que están
              contratando profesionales médicos talentosos
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card-default p-6 text-center">
              <div className="text-3xl font-bold text-sky-600 mb-2">
                {companies.length}
              </div>
              <div className="text-slate-600">Empresas Activas</div>
            </div>
            <div className="card-default p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {companies.reduce((acc, c) => acc + (c.jobCount || 0), 0)}
              </div>
              <div className="text-slate-600">Ofertas Laborales</div>
            </div>
            <div className="card-default p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {locations.length}
              </div>
              <div className="text-slate-600">Ubicaciones</div>
            </div>
            <div className="card-default p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {industries.length}
              </div>
              <div className="text-slate-600">Sectores</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div
          className="mb-8 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <CompanyFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedIndustry={selectedIndustry}
            onIndustryChange={setSelectedIndustry}
            selectedLocation={selectedLocation}
            onLocationChange={setSelectedLocation}
            industries={industries}
            locations={locations}
          />
        </div>

        {/* Content */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          {loading && <LoadingSkeleton />}

          {error && <ErrorMessage message={error} onRetry={fetchCompanies} />}

          {!loading && !error && (
            <>
              {filteredCompanies.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                    <Search className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                    No se encontraron empresas
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Intenta ajustar los filtros o términos de búsqueda
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedIndustry("all");
                      setSelectedLocation("all");
                    }}
                    className="btn-secondary"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCompanies.map((company, index) => (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      animationDelay={index * 0.1}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* CTA Section */}
        {!loading && !error && filteredCompanies.length > 0 && (
          <div
            className="mt-16 text-center animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="card-elevated p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                ¿Eres una empresa médica?
              </h3>
              <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                Únete a nuestra plataforma y conecta con los mejores
                profesionales de la salud. Amplía tu equipo con talento médico
                de calidad.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-primary">Registrar Empresa</button>
                <Link href="/map" className="btn-secondary">
                  Ver Mapa Interactivo
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
