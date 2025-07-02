'use client';

import Link from 'next/link';
import React from 'react';
import InteractiveMap from '../components/InteractiveMap';
import { MOCK_COMPANIES, MOCK_DOCTORS, MOCK_LISTINGS } from '../lib/mock-data';
import { AppRoutes, AppRoutesHelpers } from '../lib/routes';

// --- UTILITIES ---
const cn = (...inputs) => {
  const classes = [];
  for (const input of inputs) {
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object' && input !== null) {
      for (const key in input) {
        if (input[key]) {
          classes.push(key);
        }
      }
    }
  }
  return Array.from(new Set(classes)).join(' ');
};

// --- ICONOS SVG INLINE ---
const IconBuilding = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M3 21h18" />
    <path d="M5 21v-16l8 -4v20" />
    <path d="M19 21v-10l-6 -4" />
    <path d="M9 9h1v1h-1z" />
    <path d="M9 12h1v1h-1z" />
    <path d="M9 15h1v1h-1z" />
    <path d="M13 15h1v1h-1z" />
  </svg>
);
const IconStethoscope = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M6 4h-1a2 2 0 0 0 -2 2v3.5h0a5.5 5.5 0 0 0 11 0v-3.5a2 2 0 0 0 -2 -2h-1" />
    <path d="M8 15a6 6 0 1 0 12 0v-3" />
    <path d="M11 3v2" />
    <path d="M6 3v2" />
    <circle cx="20" cy="10" r="2" />
  </svg>
);
const IconBriefcase = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M3 7m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" />
    <path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2" />
    <path d="M12 12l0 .01" />
    <path d="M3 13a20 20 0 0 0 18 0" />
  </svg>
);
const IconMapPin = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
    <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
  </svg>
);
const IconTrendingUp = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M3 17l6 -6l4 4l8 -8" />
    <path d="M14 7l7 0l0 7" />
  </svg>
);
const IconArrowRight = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M5 12l14 0" />
    <path d="M13 18l6 -6" />
    <path d="M13 6l6 6" />
  </svg>
);
const IconPlay = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M7 4v16l13 -8z" />
  </svg>
);
const IconCalendar = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 9h18" />
  </svg>
);
const IconClock = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);
const IconShield = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconBarChart = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path d="M3 12h4v8H3zM9 8h4v12H9zM15 4h4v16h-4z" />
  </svg>
);
const IconHeart = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 3 9.5 3C11.04 3 12.5 4 13 5.09C13.5 4 14.96 3 16.5 3C19.5 3 22 5.5 22 8.5C22 13.5 12 21 12 21Z" />
  </svg>
);
const IconUserPlus = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);
const IconSearch = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconPlusCircle = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);
const IconActivity = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

interface StatCardProps {
  title: string; 
  value: string | number; 
  icon: LucideIcon; 
  linkTo?: string;
  linkText?: string;
  gradient?: string;
  iconBg?: string;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  linkTo,
  linkText,
  gradient = "from-blue-50 to-indigo-50",
  iconBg = "bg-blue-100 text-blue-600"
}) => (
  <div className={`bg-gradient-to-br ${gradient} border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1 group`}> 
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center mb-4">
          <div className={`${iconBg} p-3 rounded-xl shadow-sm mr-3 group-hover:scale-110 transition-transform`}>
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-semibold tracking-wider text-gray-600 uppercase">{title}</h3>
        </div>
        <p className="mb-3 text-3xl font-bold text-gray-800 animate-fade-in" aria-label={`${title}: ${value}`}>{value}</p>
        {linkTo && linkText && (
          <Link 
            href={linkTo} 
            className="inline-flex items-center text-sm font-medium text-blue-600 rounded-md hover:text-blue-800 group/link focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`${linkText} - ${title}`}
          >
            {linkText} 
            <span className="ml-1 transition-transform transform group-hover/link:translate-x-1" aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </div>
  </div>
);

interface AccessCardProps {
  title: string; 
  description: string; 
  icon: LucideIcon; 
  linkTo: string;
  iconColor?: string;
  hoverColor?: string;
}

const AccessCard: React.FC<AccessCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  linkTo, 
  iconColor = "text-blue-600",
  hoverColor = "hover:bg-blue-50"
}) => (
  <Link 
    href={linkTo} 
    className={`block bg-white border border-gray-100 p-6 rounded-xl shadow-sm hover:shadow-lg ${hoverColor} transform transition-all duration-300 ease-in-out hover:-translate-y-1 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
    aria-label={`${title} - ${description}`}
  >
    <div className="flex items-start">
      <div className="p-3 mr-4 transition-all bg-gray-50 rounded-xl group-hover:bg-white group-hover:shadow-md">
        <Icon className={`w-6 h-6 ${iconColor}`} aria-hidden="true" />
      </div>
      <div className="flex-1">
        <h3 className="mb-2 text-lg font-semibold text-gray-800 group-hover:text-gray-900">{title}</h3>
        <p className="text-sm leading-relaxed text-gray-600">{description}</p>
      </div>
    </div>
  </Link>
);

interface ActivityCardProps {
  title: string;
  items: Array<{
    id: string;
    name: string;
    subtitle?: string;
    link: string;
  }>;
  emptyMessage: string;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ title, items, emptyMessage }) => (
  <div className="p-6 transition-all duration-300 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md">
    <div className="flex items-center mb-4">
      <div className="p-2 mr-3 bg-green-100 rounded-lg">
        <IconActivity className="w-4 h-4 text-green-600" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    {items.length > 0 ? (
      <ul className="space-y-3">
        {items.map(item => (
          <li key={item.id} className="pb-3 border-b border-gray-50 last:border-b-0">
            <Link 
              href={item.link} 
              className="block text-sm font-medium text-blue-600 rounded-md hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`Ver detalles de ${item.name}${item.subtitle ? ` - ${item.subtitle}` : ''}`}
            >
              {item.name}
            </Link>
            {item.subtitle && (
              <p className="mt-1 text-xs text-gray-500">{item.subtitle}</p>
            )}
          </li>
        ))}
      </ul>
    ) : (
      <output className="text-sm italic text-gray-500" aria-live="polite">{emptyMessage}</output>
    )}
  </div>
);

// --- HERO SECTION CON VIDEO PLACEHOLDER ---
const HeroSection = () => (
  <section className="relative py-16 mb-12 overflow-hidden text-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="absolute inset-0 pointer-events-none select-none opacity-10">
      {/* Placeholder para video explicativo (máx 8s, sin sonido) */}
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-[420px] h-[236px] bg-gray-200 rounded-2xl shadow-lg flex items-center justify-center animate-pulse border-4 border-blue-100">
          <svg width="64" height="64" fill="none" viewBox="0 0 24 24" className="text-blue-400 animate-bounce">
            <path d="M7 4v16l13-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
    <div className="relative z-10">
      <h1 className="mb-4 text-4xl font-extrabold text-gray-900 md:text-5xl animate-fade-in">Bienvenido a Altamédica</h1>
      <p className="mb-8 text-lg text-gray-600 delay-100 animate-fade-in">Conecta con las mejores oportunidades del sector salud.</p>
      <a href="/companies" className="px-8 py-4 font-semibold text-white transition bg-blue-600 rounded-lg shadow hover:bg-blue-700 animate-bounce-in">Explorar Empresas</a>
    </div>
  </section>
);

const SkeletonCard = () => (
  <div className="p-6 border border-gray-100 shadow-sm bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl animate-pulse">
    <div className="w-1/3 h-6 mb-4 bg-gray-300 rounded" />
    <div className="w-2/3 h-10 mb-3 bg-gray-200 rounded" />
    <div className="w-1/2 h-4 bg-gray-300 rounded" />
  </div>
);

const HomePage: React.FC = () => {
  const recentListings = MOCK_LISTINGS.slice(0, 3); 
  const recentCompanies = MOCK_COMPANIES.slice(0, 2);
  const newApplicationsToday = Math.floor(Math.random() * 10) + 1;

  const listingItems = recentListings.map(listing => ({
    id: listing.id,
    name: listing.jobTitle || listing.name || 'Sin título',
    subtitle: `en ${MOCK_COMPANIES.find(c => c.id === listing.companyId)?.name || 'N/A'}`,
    link: `${AppRoutes.Listings}?search=${encodeURIComponent(listing.jobTitle || listing.name || '')}`
  }));

  const companyItems = recentCompanies.map(company => ({
    id: company.id,
    name: company.name,
    subtitle: company.description,
    link: AppRoutesHelpers.CompanyProfile(company.id)
  }));

  const [loading, setLoading] = React.useState(false); // Simulación de carga
  React.useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <HeroSection />
      <div className="container px-4 py-8 mx-auto">
        {/* Header Section */}
        <header className="mb-12" role="banner">
          <div className="flex items-center mb-4">
            <div className="p-3 mr-4 bg-blue-600 shadow-lg rounded-xl animate-fade-in">
              <IconStethoscope className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 animate-fade-in">Centro de Control Médico</h1>
              <p className="mt-1 text-lg text-gray-600 delay-100 animate-fade-in">Plataforma integral para profesionales de la salud</p>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500 delay-200 animate-fade-in">
            <IconCalendar className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>Última actualización: {new Date().toLocaleDateString('es-ES')}</span>
            <IconClock className="w-4 h-4 ml-4 mr-2" aria-hidden="true" />
            <span>{new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </header>

        {/* Quick Stats Section */}
        <section className="mb-12" aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="flex items-center mb-6 text-2xl font-semibold text-gray-700">
            <IconTrendingUp className="w-6 h-6 mr-2 text-green-600" aria-hidden="true" />
            Métricas Principales
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                <StatCard 
                  title="Ofertas Activas" 
                  value={MOCK_LISTINGS.length} 
                  icon={IconBriefcase}
                  linkTo={AppRoutes.Listings}
                  linkText="Ver Ofertas"
                  gradient="from-blue-50 to-cyan-50"
                  iconBg="bg-blue-100 text-blue-600"
                />
                <StatCard 
                  title="Centros Médicos" 
                  value={MOCK_COMPANIES.length} 
                  icon={IconBuilding}
                  linkTo={AppRoutes.Companies}
                  linkText="Ver Centros"
                  gradient="from-green-50 to-emerald-50"
                  iconBg="bg-green-100 text-green-600"
                />
                <StatCard 
                  title="Profesionales" 
                  value={MOCK_DOCTORS.length} 
                  icon={IconHeart}
                  linkTo={AppRoutes.SearchDoctors}
                  linkText="Buscar Médicos"
                  gradient="from-red-50 to-pink-50"
                  iconBg="bg-red-100 text-red-600"
                />
                <StatCard 
                  title="Nuevas Aplicaciones" 
                  value={newApplicationsToday} 
                  icon={IconUserPlus}
                  gradient="from-purple-50 to-violet-50"
                  iconBg="bg-purple-100 text-purple-600"
                />
              </>
            )}
          </div>
        </section>        {/* Main Dashboard Area */}
        <div className="lg:flex lg:space-x-8">
          {/* Left Column: Map */}
          <section className="mb-8 lg:w-2/3 lg:mb-0" aria-labelledby="map-heading">
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl animate-fade-in">
              <h2 id="map-heading" className="flex items-center mb-6 text-2xl font-semibold text-gray-700">
                <IconMapPin className="w-6 h-6 mr-3 text-blue-600" aria-hidden="true" />
                Mapa de Oportunidades Médicas
              </h2>
              <div className="rounded-lg overflow-hidden min-h-[400px]" aria-label="Mapa interactivo mostrando ubicaciones de centros médicos y oportunidades laborales">
                {loading ? (
                  <div className="w-full h-[400px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 animate-pulse">
                    <span className="text-lg text-gray-400">Cargando mapa...</span>
                  </div>
                ) : (
                  <InteractiveMap />
                )}
              </div>
            </div>
          </section>

          {/* Right Column: Quick Access & Recent Activity */}
          <aside className="space-y-8 lg:w-1/3" aria-label="Navegación rápida y actividad reciente">
            {/* Quick Access Section */}
            <section aria-labelledby="quick-access-heading">
              <h2 id="quick-access-heading" className="flex items-center mb-6 text-2xl font-semibold text-gray-700">
                <IconShield className="w-6 h-6 mr-2 text-indigo-600" aria-hidden="true" />
                Accesos Rápidos
              </h2>
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div data-tooltip-id="ofertas-tooltip">
                    <AccessCard 
                      title="Explorar Ofertas" 
                      description="Encuentra oportunidades médicas ideales para tu carrera profesional."
                      icon={IconSearch}
                      linkTo={AppRoutes.Listings}
                      iconColor="text-blue-600"
                      hoverColor="hover:bg-blue-50"
                    />
                  </div>
                  <div data-tooltip-id="medicos-tooltip">
                    <AccessCard 
                      title="Buscar Médicos" 
                      description="Descubre profesionales especializados y talento calificado."
                      icon={IconStethoscope}
                      linkTo={AppRoutes.SearchDoctors}
                      iconColor="text-green-600"
                      hoverColor="hover:bg-green-50"
                    />
                  </div>
                  <div data-tooltip-id="centros-tooltip">
                    <AccessCard 
                      title="Centros Médicos" 
                      description="Explora instituciones de salud líderes en el sector."
                      icon={IconBuilding}
                      linkTo={AppRoutes.Companies}
                      iconColor="text-purple-600"
                      hoverColor="hover:bg-purple-50"
                    />
                  </div>
                  <div data-tooltip-id="publicar-tooltip">
                    <AccessCard 
                      title="Publicar Oferta" 
                      description="Atrae a los mejores profesionales de la salud."
                      icon={IconPlusCircle}
                      linkTo={AppRoutes.PostJob}
                      iconColor="text-orange-600"
                      hoverColor="hover:bg-orange-50"
                    />
                  </div>
                </div>
              </div>
            </section>
            {/* Recent Activity Section */}
            <section aria-labelledby="recent-activity-heading">
              <h2 id="recent-activity-heading" className="mb-6 text-2xl font-semibold text-gray-700">Actividad Reciente</h2>
              <div className="space-y-6">
                {loading ? (
                  <SkeletonCard />
                ) : (
                  <ActivityCard
                    title="Últimas Ofertas"
                    items={listingItems}
                    emptyMessage="No hay ofertas recientes disponibles."
                  />
                )}
                {loading ? (
                  <SkeletonCard />
                ) : (
                  <ActivityCard
                    title="Centros Nuevos"
                    items={companyItems}
                    emptyMessage="No hay centros médicos nuevos registrados."
                  />
                )}
              </div>
            </section>
          </aside>
        </div>
        {/* Analytics Link */}
        <div className="mt-12 text-center animate-fade-in">
          <Link
            href={AppRoutes.Metrics}
            className="inline-flex items-center px-6 py-3 font-semibold text-white transition-all duration-300 transform shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Acceder a análisis y métricas avanzadas del sistema"
          >
            <IconBarChart className="w-5 h-5 mr-2" aria-hidden="true" />
            Análisis y Métricas Avanzadas
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
