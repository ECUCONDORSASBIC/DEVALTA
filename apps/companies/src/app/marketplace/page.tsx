// Módulo ESM (Next.js)
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Star,
  MapPin,
  DollarSign,
  Clock,
  Filter,
  Search,
  Briefcase,
  Users,
  Calendar,
  ArrowLeft,
  Eye,
  Send,
  Bookmark,
  Share2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X,
  Sliders,
  Grid,
  List,
  Heart,
  MessageSquare
} from "lucide-react";
import dynamic from "next/dynamic";

// Importar el mapa
const AltamedicaInteractiveMapSafe = dynamic(() => import("../../components/maps/AltamedicaInteractiveMapSafe"), { ssr: false });

// === TIPOS TYPESCRIPT ===
interface MarketplaceOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  specialty: string;
  type: 'job' | 'contract' | 'consultation' | 'partnership';
  salary: string;
  postedDate: string;
  applications: number;
  rating: number;
  urgent?: boolean;
  description: string;
  requirements: string[];
  benefits: string[];
  experience: string;
  schedule: string;
  remote?: boolean;
  companyLogo?: string;
  companySize: string;
  companyIndustry: string;
}

interface FilterState {
  search: string;
  location: string[];
  specialty: string[];
  type: string[];
  salaryRange: [number, number];
  experience: string[];
  remote: boolean | null;
  urgent: boolean;
}

// === DATOS CONSTANTES ===
const ALL_OFFERS: MarketplaceOffer[] = [
  {
    id: "1",
    title: "Cardiólogo Intervencionista",
    company: "Hospital Italiano de Buenos Aires",
    location: "Buenos Aires, Argentina",
    specialty: "Cardiología",
    type: "job",
    salary: "USD 8,000 - 12,000",
    postedDate: "2025-01-15",
    applications: 12,
    rating: 4.9,
    urgent: true,
    description: "Buscamos cardiólogo especializado en procedimientos intervencionistas para nuestro departamento de cardiología.",
    requirements: [
      "Especialidad en Cardiología",
      "Experiencia mínima 5 años",
      "Certificación en procedimientos intervencionistas"
    ],
    benefits: [
      "Seguro médico familiar",
      "Capacitación continua",
      "Horario flexible"
    ],
    experience: "5-10 años",
    schedule: "Tiempo completo",
    companySize: "2500+ empleados",
    companyIndustry: "Medicina General"
  },
  {
    id: "2",
    title: "Oncólogo Médico",
    company: "Hospital Metropolitano",
    location: "Quito, Ecuador",
    specialty: "Oncología",
    type: "job",
    salary: "USD 5,000 - 8,000",
    postedDate: "2025-01-08",
    applications: 11,
    rating: 4.8,
    description: "Oncólogo para nuestro departamento de oncología con experiencia en tratamientos innovadores.",
    requirements: [
      "Especialidad en Oncología",
      "Experiencia en tratamientos innovadores",
      "Certificación internacional"
    ],
    benefits: [
      "Equipamiento de última generación",
      "Capacitación internacional",
      "Investigación clínica"
    ],
    experience: "3-7 años",
    schedule: "Tiempo completo",
    companySize: "1800+ empleados",
    companyIndustry: "Medicina Integral"
  }
];

const SPECIALTIES = [
  "Cardiología", "Oncología", "Neurología", "Pediatría", "Cirugía", 
  "Ginecología", "Traumatología", "Dermatología", "Psiquiatría"
];

const LOCATIONS = [
  "Buenos Aires, Argentina", "Quito, Ecuador", "Porto Alegre, Brasil",
  "Santiago, Chile", "Lima, Perú", "Bogotá, Colombia"
];

// === COMPONENTES ===
const OfferCard = React.memo<{
  offer: MarketplaceOffer;
  viewMode: 'grid' | 'list';
  onApply: (id: string) => void;
  onSave: (id: string) => void;
  onShare: (id: string) => void;
}>(({ offer, viewMode, onApply, onSave, onShare }) => {
  const isGrid = viewMode === 'grid';
  
  return (
    <div className={`bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 ${
      isGrid ? 'p-6' : 'p-4'
    }`}>
      <div className={`${isGrid ? 'space-y-4' : 'flex items-start gap-4'}`}>
        {/* Header */}
        <div className={`${isGrid ? 'space-y-2' : 'flex-1'}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold text-gray-900 ${isGrid ? 'text-lg' : 'text-base'}`}>
                  {offer.title}
                </h3>
                {offer.urgent && (
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-semibold">
                    Urgente
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{offer.company}</p>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">{offer.rating}</span>
            </div>
          </div>
          
          {/* Info básica */}
          <div className={`space-y-1 text-sm text-gray-600 ${isGrid ? '' : 'flex items-center gap-4'}`}>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span>{offer.location}</span>
            </div>
            <div className="flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
              <span>{offer.specialty}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-green-600" />
              <span className="font-medium">{offer.salary}</span>
            </div>
          </div>
        </div>
        
        {/* Acciones */}
        <div className={`flex gap-2 ${isGrid ? 'mt-4' : 'flex-col'}`}>
          <button
            onClick={() => onApply(offer.id)}
            className="px-4 py-2 text-sm text-white bg-gray-700 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4 mr-1" />
            Aplicar
          </button>
          <button
            onClick={() => onSave(offer.id)}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <Bookmark className="w-4 h-4 mr-1" />
            Guardar
          </button>
          <button
            onClick={() => onShare(offer.id)}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Compartir
          </button>
        </div>
      </div>
      
      {/* Detalles adicionales */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Publicado: {new Date(offer.postedDate).toLocaleDateString()}</span>
          <span>{offer.applications} aplicaciones</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
          <span>Experiencia: {offer.experience}</span>
          <span>Horario: {offer.schedule}</span>
          {offer.remote && <span className="text-green-600">Remoto disponible</span>}
        </div>
      </div>
    </div>
  );
});
OfferCard.displayName = "OfferCard";

// === COMPONENTE PRINCIPAL ===
const MarketplacePage: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    location: [],
    specialty: [],
    type: [],
    salaryRange: [0, 100000],
    experience: [],
    remote: null,
    urgent: false
  });
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar ofertas
  const filteredOffers = useMemo(() => {
    return ALL_OFFERS.filter(offer => {
      // Búsqueda de texto
      if (filters.search && !offer.title.toLowerCase().includes(filters.search.toLowerCase()) &&
          !offer.company.toLowerCase().includes(filters.search.toLowerCase()) &&
          !offer.specialty.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Ubicación
      if (filters.location.length > 0 && !filters.location.includes(offer.location)) {
        return false;
      }
      
      // Especialidad
      if (filters.specialty.length > 0 && !filters.specialty.includes(offer.specialty)) {
        return false;
      }
      
      // Tipo
      if (filters.type.length > 0 && !filters.type.includes(offer.type)) {
        return false;
      }
      
      // Urgente
      if (filters.urgent && !offer.urgent) {
        return false;
      }
      
      return true;
    });
  }, [filters]);

  const handleApply = (id: string) => {
    console.log('Aplicar a oferta:', id);
  };

  const handleSave = (id: string) => {
    console.log('Guardar oferta:', id);
  };

  const handleShare = (id: string) => {
    console.log('Compartir oferta:', id);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver al Dashboard
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Marketplace</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Sliders className="w-4 h-4 mr-2" />
              Filtros
            </button>
            <div className="flex items-center bg-white border border-gray-200 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'text-gray-900 bg-gray-100' : 'text-gray-500'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'text-gray-900 bg-gray-100' : 'text-gray-500'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Estadísticas */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <Briefcase className="w-8 h-8 text-gray-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Ofertas Activas</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredOffers.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-gray-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Empresas</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-gray-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Aplicaciones</p>
                  <p className="text-2xl font-bold text-gray-900">156</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-gray-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Contrataciones</p>
                  <p className="text-2xl font-bold text-gray-900">89</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Panel de filtros */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filtros
                </h3>
                <button
                  onClick={() => setFilters({
                    search: '',
                    location: [],
                    specialty: [],
                    type: [],
                    salaryRange: [0, 100000],
                    experience: [],
                    remote: null,
                    urgent: false
                  })}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpiar
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Búsqueda */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Búsqueda</label>
                  <div className="relative">
                    <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar ofertas..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                    />
                  </div>
                </div>
                
                {/* Especialidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Especialidad</label>
                  <select
                    multiple
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    value={filters.specialty}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters({...filters, specialty: selected});
                    }}
                  >
                    {SPECIALTIES.map((specialty) => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>
                
                {/* Tipo de contrato */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Contrato</label>
                  <div className="space-y-2">
                    {['job', 'contract', 'consultation', 'partnership'].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.type.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({...filters, type: [...filters.type, type]});
                            } else {
                              setFilters({...filters, type: filters.type.filter(t => t !== type)});
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">
                          {type === 'job' ? 'Empleo' :
                           type === 'contract' ? 'Contrato' :
                           type === 'consultation' ? 'Consulta' : 'Alianza'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Opciones adicionales */}
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.urgent}
                      onChange={(e) => setFilters({...filters, urgent: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Solo ofertas urgentes</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de ofertas */}
          <div className="lg:col-span-3">
            {/* Mapa interactivo */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicaciones de Ofertas</h3>
              <div className="h-96">
                <AltamedicaInteractiveMapSafe />
              </div>
            </div>

            {/* Resultados */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  {filteredOffers.length} ofertas encontradas
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Ordenar por:</span>
                  <select className="border border-gray-300 rounded-md px-2 py-1">
                    <option>Más recientes</option>
                    <option>Mejor pagadas</option>
                    <option>Más aplicaciones</option>
                    <option>Mejor rating</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid/Lista de ofertas */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2' 
                : 'grid-cols-1'
            }`}>
              {filteredOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  viewMode={viewMode}
                  onApply={handleApply}
                  onSave={handleSave}
                  onShare={handleShare}
                />
              ))}
            </div>

            {filteredOffers.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron ofertas</h3>
                <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default MarketplacePage;
// Tipo de módulo: ESM (Next.js) 