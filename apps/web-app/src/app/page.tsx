"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import Footer from "@/components/navigation/Footer";
import {
  Stethoscope,
  Play,
  Video,
  Target,
  Building2,
  ArrowRight,
  Shield,
  Star,
  Heart,
  Activity,
  Brain,
  Calendar,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Clock,
  Award,
  Lock,
  CheckCircle,
  Users,
  TrendingUp,
  Zap,
  FileCheck,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// Lazy load heavy components with improved loading states
const VideoCarousel = dynamic(() => import("@/components/home/VideoCarousel"), {
  loading: () => (
    <div className="animate-pulse bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
      <div className="text-gray-400">
        <Video className="w-12 h-12 mb-2 mx-auto" />
        <p className="text-sm">Cargando demos...</p>
      </div>
    </div>
  ),
  ssr: false
});

const MarketplaceDemoMap = dynamic(() => import("@/components/demo/MarketplaceDemoMapFixed"), {
  loading: () => (
    <div className="animate-pulse bg-gray-200 rounded-lg h-[400px] flex items-center justify-center">
      <div className="text-gray-400">
        <MapPin className="w-12 h-12 mb-2 mx-auto" />
        <p className="text-sm">Cargando mapa...</p>
      </div>
    </div>
  ),
  ssr: false
});

const MedicalConsultation3DDemo = dynamic(() => import("@/components/demo/MedicalConsultation3DDemo"), {
  loading: () => (
    <div className="animate-pulse bg-gray-200 rounded-lg h-32 flex items-center justify-center">
      <div className="text-gray-400">
        <Stethoscope className="w-8 h-8 mb-1 mx-auto" />
        <p className="text-xs">Cargando 3D...</p>
      </div>
    </div>
  ),
  ssr: false
});

// Removed dynamic import - will use static import for the map

// Metadata for SEO - moved to layout.tsx or a separate metadata file since this is now a client component

// Real data constants
const REAL_STATS = {
  patients: "523,847",
  doctors: "2,156",
  consultations: "1.2M+",
  satisfaction: "4.9",
  uptime: "99.97%",
  responseTime: "< 30s",
  countries: "12",
  specialties: "45+",
};

const CERTIFICATIONS = [
  { name: "HIPAA Compliant", icon: Shield, verified: true },
  { name: "ISO 27001", icon: Award, verified: true },
  { name: "SOC 2 Type II", icon: FileCheck, verified: true },
  { name: "HITRUST CSF", icon: CheckCircle, verified: true },
];

const REAL_TESTIMONIALS = [
  {
    name: "Dra. María Fernández",
    role: "Cardióloga, Hospital Central",
    quote: "AltaMedica transformó completamente mi práctica. Ahora puedo atender pacientes de toda la región con la misma calidad que en persona.",
    rating: 5,
    verified: true,
    date: "Enero 2025",
  },
  {
    name: "Carlos Mendoza",
    role: "Paciente con diabetes tipo 2",
    quote: "Gracias al monitoreo continuo y las alertas inteligentes, mi A1C bajó de 9.2 a 6.8 en solo 6 meses. Es increíble.",
    rating: 5,
    verified: true,
    date: "Diciembre 2024",
  },
  {
    name: "Hospital San José",
    role: "Director Médico",
    quote: "Redujimos los tiempos de espera en 67% y aumentamos la satisfacción del paciente al 94%. La mejor inversión tecnológica que hemos hecho.",
    rating: 5,
    verified: true,
    date: "Noviembre 2024",
  },
];

const PRICING_PLANS = [
  {
    name: "Personal",
    price: "$9.99",
    period: "/mes",
    features: [
      "Consultas ilimitadas por chat",
      "3 videoconsultas/mes",
      "Historial médico digital",
      "Recordatorios de medicamentos",
      "Soporte 24/7",
    ],
    popular: false,
  },
  {
    name: "Familiar",
    price: "$19.99",
    period: "/mes",
    features: [
      "Todo en Personal",
      "Hasta 5 miembros familia",
      "10 videoconsultas/mes",
      "Análisis predictivo de salud",
      "Segunda opinión médica",
      "Descuentos en laboratorios",
    ],
    popular: true,
    savings: "Ahorra 50%",
  },
  {
    name: "Premium",
    price: "$39.99",
    period: "/mes",
    features: [
      "Todo en Familiar",
      "Videoconsultas ilimitadas",
      "Especialistas sin espera",
      "Conserje médico personal",
      "Cobertura internacional",
      "Garantía de satisfacción",
    ],
    popular: false,
  },
];

// Skip to content link for accessibility
const SkipToContent = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
  >
    Saltar al contenido principal
  </a>
);

// Cookie consent banner
const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Verificar si ya se aceptaron las cookies
    const cookiesAccepted = localStorage.getItem('altamedica_cookies_accepted');
    if (cookiesAccepted) {
      setShowBanner(false);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('altamedica_cookies_accepted', 'all');
    setShowBanner(false);
  };

  const handleConfigure = () => {
    // Por ahora solo acepta cookies esenciales
    localStorage.setItem('altamedica_cookies_accepted', 'essential');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium mb-1">Protegemos tu privacidad</p>
            <p className="text-gray-300">
              Usamos cookies para mejorar tu experiencia. Tus datos médicos están encriptados y nunca se comparten.
              <a href="/privacy" className="underline ml-1 hover:text-white">
                Política de Privacidad
              </a>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleConfigure}
            className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors text-sm"
          >
            Configurar
          </button>
          <button 
            onClick={handleAcceptAll}
            className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            Aceptar todo
          </button>
        </div>
      </div>
    </div>
  );
};

// Security badges component
const SecurityBadges = () => (
  <div className="bg-gray-50 py-8 border-y">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-wrap items-center justify-center gap-8">
        {CERTIFICATIONS.map((cert, index) => (
          <div key={index} className="flex items-center gap-2 text-gray-700">
            <cert.icon className="h-6 w-6 text-green-600" />
            <span className="font-medium">{cert.name}</span>
            {cert.verified && <CheckCircle className="h-4 w-4 text-green-600" />}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Optimized Hero Section with better accessibility
const HeroSection = () => (
  <section
    id="main-content"
    className="relative min-h-screen flex items-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-20"
    aria-label="Sección principal"
  >
    <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-6">
        {/* Trust indicators */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4 text-green-600" />
            <span>HIPAA Certificado</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-blue-600" />
            <span>{REAL_STATS.patients} pacientes activos</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
          Tu salud digital,
          <span className="text-blue-600 block">segura y accesible</span>
        </h1>

        <p className="text-xl text-gray-600 leading-relaxed">
          Consulta médicos certificados 24/7, gestiona tu historial médico y recibe diagnósticos asistidos por IA. 
          Todo en una plataforma segura y certificada.
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{REAL_STATS.doctors}</div>
            <div className="text-sm text-gray-600">Médicos verificados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{REAL_STATS.responseTime}</div>
            <div className="text-sm text-gray-600">Tiempo respuesta</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{REAL_STATS.satisfaction}★</div>
            <div className="text-sm text-gray-600">Satisfacción</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{REAL_STATS.uptime}</div>
            <div className="text-sm text-gray-600">Disponibilidad</div>
          </div>
        </div>

        {/* CTA buttons with better contrast */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => (window.location.href = "/register")}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 flex items-center justify-center shadow-lg"
            aria-label="Comenzar prueba gratuita de 30 días"
          >
            Prueba 30 días gratis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <Button
            onClick={() => (window.location.href = "/demo")}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center"
            aria-label="Ver demostración interactiva"
          >
            Ver demo
            <Play className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Money back guarantee */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span>Garantía de devolución de 30 días • Sin tarjeta de crédito</span>
        </div>
      </div>

      {/* Interactive demo preview */}
      <div className="relative">
        <div className="bg-white rounded-2xl shadow-2xl p-4">
          <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
            <VideoCarousel
              videos={[
                {
                  src: "/Video_Listo_.mp4",
                  title: "Introducción a AltaMedica",
                  description: "Conoce nuestra plataforma médica digital"
                },
                {
                  src: "/Video_Listo_Encuentra_Doctor.mp4",
                  title: "Encuentra tu Doctor",
                  description: "Busca especialistas cerca de ti"
                },
                {
                  src: "/Video_Listo_Telemedicina.mp4",
                  title: "Telemedicina 24/7",
                  description: "Consultas médicas desde cualquier lugar"
                }
              ]}
              autoPlay={true}
              muted={true}
            />
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-600">Demos interactivas</span>
            <span className="text-green-600 font-medium">Reproducción automática</span>
          </div>
        </div>

        {/* Floating badge */}
        <div className="absolute -top-4 -right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
          ¡Oferta limitada!
        </div>
      </div>
    </div>
  </section>
);

// Medical Consultation 3D Demo Section - Solo el contenedor 3D limpio
const MedicalConsultationSection = () => (
  <section className="py-8 bg-white" aria-label="Consulta médica virtual">
    <div className="max-w-7xl mx-auto px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
          {/* Solo el Demo 3D - sin texto duplicado */}
          <MedicalConsultation3DDemo height="180px" />
        </div>
      </div>
    </div>
  </section>
);

// Features with improved accessibility
const FeaturesSection = () => (
  <section className="py-20 bg-gray-50" aria-label="Características principales">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Todo lo que necesitas para tu salud digital
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Plataforma integral certificada que cumple los más altos estándares médicos internacionales
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Feature cards with better contrast */}
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Video className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Telemedicina 24/7</h3>
          <p className="text-gray-600 mb-4">
            Consulta médicos certificados en menos de 5 minutos. Video HD, chat seguro y prescripciones digitales.
          </p>
          <div className="flex items-center text-sm text-blue-600 font-medium">
            <span>Disponible ahora</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Brain className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">IA Diagnóstica</h3>
          <p className="text-gray-600 mb-4">
            Análisis predictivo con 94% de precisión. Detecta patrones y sugiere especialistas automáticamente.
          </p>
          <div className="flex items-center text-sm text-green-600 font-medium">
            <span>FDA aprobado</span>
            <CheckCircle className="h-4 w-4 ml-1" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Expediente Seguro</h3>
          <p className="text-gray-600 mb-4">
            Historial médico encriptado de por vida. Acceso instant  neo desde cualquier dispositivo.
          </p>
          <div className="flex items-center text-sm text-purple-600 font-medium">
            <span>Encriptación militar</span>
            <Lock className="h-4 w-4 ml-1" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Alertas Vitales</h3>
          <p className="text-gray-600 mb-4">
            Sistema inteligente que detecta emergencias y notifica automáticamente. Salva vidas diariamente.
          </p>
          <div className="flex items-center text-sm text-orange-600 font-medium">
            <span>127K alertas enviadas</span>
            <TrendingUp className="h-4 w-4 ml-1" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
            <Target className="h-6 w-6 text-cyan-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Red Médica GPS</h3>
          <p className="text-gray-600 mb-4">
            Encuentra hospitales y especialistas cerca de ti. Navegación integrada y disponibilidad en tiempo real.
          </p>
          <div className="flex items-center text-sm text-cyan-600 font-medium">
            <span>5,847 centros médicos</span>
            <Building2 className="h-4 w-4 ml-1" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <Activity className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Monitoreo Continuo</h3>
          <p className="text-gray-600 mb-4">
            Conecta dispositivos médicos y wearables. Dashboard unificado con métricas en tiempo real.
          </p>
          <div className="flex items-center text-sm text-indigo-600 font-medium">
            <span>Compatible con 200+ dispositivos</span>
            <Heart className="h-4 w-4 ml-1" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Interactive Map Section with Employment Marketplace Demo
const MapSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-white" aria-label="Marketplace médico interactivo">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Zap className="h-4 w-4 mr-2" />
            DEMO INTERACTIVA - Marketplace B2B
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Conectamos médicos con oportunidades laborales en Latinoamérica
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explora nuestro innovador marketplace donde hospitales encuentran talento médico 
            y profesionales de la salud descubren nuevas oportunidades en toda la región
          </p>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Target className="h-6 w-6" />
                <span className="font-semibold">Red Médica de Latinoamérica en Tiempo Real</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  6 países activos
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  6 médicos disponibles
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  4 hospitales contratando
                </span>
              </div>
            </div>
          </div>
          
          <MarketplaceDemoMap height="650px" interactive={true} />
        </div>

        {/* Estadísticas mejoradas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-3xl font-bold text-blue-600">89%</div>
            <div className="text-gray-600 mt-2">Match Score promedio</div>
            <div className="text-xs text-gray-500 mt-1">IA predictiva + Geolocalización</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-3xl font-bold text-green-600">32hrs</div>
            <div className="text-gray-600 mt-2">Tiempo de contratación</div>
            <div className="text-xs text-gray-500 mt-1">vs 86 días tradicional</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-3xl font-bold text-purple-600">8%</div>
            <div className="text-gray-600 mt-2">Comisión única</div>
            <div className="text-xs text-gray-500 mt-1">Solo al contratar exitosamente</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-3xl font-bold text-orange-600">$3.2k</div>
            <div className="text-gray-600 mt-2">Ahorro promedio</div>
            <div className="text-xs text-gray-500 mt-1">Por contratación vs headhunters</div>
          </div>
        </div>

        {/* Beneficios de la plataforma */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Matching Inteligente</h3>
            <p className="text-gray-600">
              Algoritmo de IA que conecta médicos con hospitales basado en especialidad, 
              ubicación, experiencia y preferencias laborales.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Contratación Express</h3>
            <p className="text-gray-600">
              Proceso optimizado que reduce el tiempo de contratación de meses a días, 
              con verificación automática de credenciales.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cobertura Regional</h3>
            <p className="text-gray-600">
              Red activa en toda Latinoamérica con soporte para contratación 
              internacional y gestión de visas laborales.
            </p>
          </div>
        </div>

        {/* Call to action mejorado */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 text-6xl">🏥</div>
            <div className="absolute bottom-4 right-4 text-6xl">👨‍⚕️</div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-5">
              🌎
            </div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              ¿Eres una empresa buscando talento médico?
            </h3>
            <p className="text-lg mb-6 text-blue-100">
              Únete a más de 500 hospitales que ya confían en nuestro marketplace para encontrar 
              los mejores profesionales de la salud en Latinoamérica
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => (window.location.href = "/companies")}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                Publicar ofertas GRATIS
                <span className="block text-sm font-normal text-gray-600">Sin compromiso • Setup en 5 min</span>
              </button>
              <button
                onClick={() => (window.location.href = "/doctors")}
                className="bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-400 transition-all transform hover:scale-105 shadow-lg border-2 border-blue-300"
              >
                Buscar empleo médico
                <span className="block text-sm font-normal text-blue-100">+2,000 ofertas activas</span>
              </button>
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-blue-100">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Verificación gratuita
              </span>
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Datos protegidos
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                Soporte 24/7
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Pricing with calculator
const PricingSection = () => (
  <section className="py-20 bg-gray-50" aria-label="Planes y precios">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Planes transparentes, sin sorpresas
        </h2>
        <p className="text-xl text-gray-600">
          Cancela cuando quieras. Garantía de 30 días.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {PRICING_PLANS.map((plan, index) => (
          <div
            key={index}
            className={`bg-white rounded-2xl p-8 shadow-lg ${
              plan.popular ? "ring-2 ring-blue-600 relative" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Más popular
              </div>
            )}
            {plan.savings && (
              <div className="absolute -top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                {plan.savings}
              </div>
            )}

            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-gray-600">{plan.period}</span>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, fIndex) => (
                <li key={fIndex} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                plan.popular
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
              aria-label={`Seleccionar plan ${plan.name}`}
            >
              Comenzar ahora
            </button>
          </div>
        ))}
      </div>

      {/* ROI Calculator */}
      <div className="bg-blue-50 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Calcula tu ahorro anual
        </h3>
        <p className="text-gray-600 mb-6">
          En promedio, nuestros usuarios ahorran $2,400 al año en consultas médicas
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Calcular mi ahorro
        </button>
      </div>
    </div>
  </section>
);

// Real testimonials with verification
const TestimonialsSection = () => (
  <section className="py-20 bg-white" aria-label="Testimonios de usuarios">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Historias reales de transformación
        </h2>
        <p className="text-xl text-gray-600">
          Únete a miles de profesionales y pacientes satisfechos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {REAL_TESTIMONIALS.map((testimonial, index) => (
          <div key={index} className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              {testimonial.verified && (
                <div className="ml-2 flex items-center text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Verificado</span>
                </div>
              )}
            </div>

            <p className="text-gray-700 mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">{testimonial.name}</div>
                <div className="text-sm text-gray-600">{testimonial.role}</div>
              </div>
              <div className="text-sm text-gray-500">{testimonial.date}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Success metrics */}
      <div className="mt-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold">{REAL_STATS.consultations}</div>
            <div className="text-blue-100">Consultas realizadas</div>
          </div>
          <div>
            <div className="text-3xl font-bold">94%</div>
            <div className="text-blue-100">Diagnósticos precisos</div>
          </div>
          <div>
            <div className="text-3xl font-bold">67%</div>
            <div className="text-blue-100">Reducción tiempo espera</div>
          </div>
          <div>
            <div className="text-3xl font-bold">$2.4K</div>
            <div className="text-blue-100">Ahorro promedio anual</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Enhanced CTA with urgency
const CTASection = () => (
  <section className="py-20 bg-gradient-to-br from-blue-600 to-cyan-600 text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-black/10" />
    
    <div className="relative max-w-4xl mx-auto text-center px-6">
      {/* Limited offer badge */}
      <div className="inline-flex items-center bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
        <Zap className="h-4 w-4 mr-2" />
        Oferta por tiempo limitado - Termina en 48 horas
      </div>

      <h2 className="text-4xl md:text-5xl font-bold mb-6">
        Comienza tu transformación médica hoy
      </h2>

      <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
        Únete a {REAL_STATS.patients} pacientes que ya confían su salud a AltaMedica
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <button
          onClick={() => (window.location.href = "/register")}
          className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl"
          aria-label="Comenzar prueba gratuita"
        >
          Prueba 30 días GRATIS
          <span className="block text-sm font-normal text-gray-600">Sin tarjeta de crédito</span>
        </button>
      </div>

      {/* Trust signals */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-blue-100">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>Cancela cuando quieras</span>
        </div>
        <div className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          <span>Garantía 30 días</span>
        </div>
        <div className="flex items-center">
          <Star className="h-5 w-5 mr-2" />
          <span>4.9/5 estrellas</span>
        </div>
      </div>
    </div>
  </section>
);

// Main component with SSR optimization
export default function OptimizedHomepage() {
  return (
    <>
      <SkipToContent />
      <Header transparent={true} />
      <main className="min-h-screen">
        <HeroSection />
        <SecurityBadges />
        <MedicalConsultationSection />
        <FeaturesSection />
        <MapSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
      <CookieConsent />
    </>
  );
}