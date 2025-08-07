"use client";

import { Header } from "@/components/layout/Header";
import Footer from "@/components/navigation/Footer";
import { Button } from "@/components/ui/Button";
import {
  Activity,
  ArrowRight,
  Award,
  Brain,
  CheckCircle,
  Heart,
  Shield,
  Star,
  Stethoscope,
  Users,
  Video,
  Zap
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

// Componentes lazy-loaded para optimización
const VideoCarousel = dynamic(() => import("@/components/home/VideoCarousel"), {
  loading: () => <LoadingPlaceholder icon={Video} text="Cargando demos..." />,
  ssr: false
});

const MarketplaceDemoMap = dynamic(() => import("@/components/demo/MarketplaceDemoMapFixed"), {
  loading: () => <LoadingPlaceholder icon={Users} text="Cargando mapa..." />,
  ssr: false
});

// Componente de loading reutilizable
function LoadingPlaceholder({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="animate-pulse bg-neutral-100 rounded-xl p-8 flex items-center justify-center min-h-[400px]">
      <div className="text-neutral-500 text-center">
        <Icon className="w-12 h-12 mb-3 mx-auto text-primary-400" />
        <p className="text-sm font-medium">{text}</p>
      </div>
    </div>
  );
}

// Feature cards con el nuevo diseño sin gradientes
const features = [
  {
    icon: Stethoscope,
    title: "Telemedicina Avanzada",
    description: "Consultas médicas desde cualquier lugar con video HD y diagnóstico asistido por IA",
    color: "text-primary-500"
  },
  {
    icon: Brain,
    title: "IA Médica",
    description: "Diagnósticos precisos y recomendaciones personalizadas con inteligencia artificial",
    color: "text-success-500"
  },
  {
    icon: Shield,
    title: "Seguridad HIPAA",
    description: "Máxima protección de datos médicos con encriptación de grado hospitalario",
    color: "text-alert-500"
  },
  {
    icon: Users,
    title: "Red de Especialistas",
    description: "Acceso a los mejores médicos de Argentina y Latinoamérica",
    color: "text-primary-500"
  }
];

// Stats section
const stats = [
  { value: "50,000+", label: "Pacientes Activos" },
  { value: "1,200+", label: "Médicos Verificados" },
  { value: "98%", label: "Satisfacción" },
  { value: "24/7", label: "Disponibilidad" }
];

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'company' | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Sistema de onboarding basado en rol
  const handleRoleSelect = (role: 'patient' | 'doctor' | 'company') => {
    setSelectedRole(role);
    // Redirigir según el rol seleccionado
    const redirectUrls = {
      patient: process.env.NEXT_PUBLIC_PATIENTS_URL || 'http://localhost:3003',
      doctor: process.env.NEXT_PUBLIC_DOCTORS_URL || 'http://localhost:3002',
      company: process.env.NEXT_PUBLIC_COMPANIES_URL || 'http://localhost:3004'
    };
    
    // Guardar rol en sessionStorage para el onboarding
    sessionStorage.setItem('selectedRole', role);
    sessionStorage.setItem('onboardingStarted', 'true');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section - Cyan brillante sin gradientes */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-neutral-50">
        <div className="absolute inset-0 bg-primary-500 opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-display font-bold text-neutral-900 mb-6">
              Medicina del Futuro,
              <span className="text-primary-500 block mt-2">Hoy en Argentina</span>
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
              Plataforma integral de salud digital que conecta pacientes, médicos y empresas 
              con tecnología de vanguardia e inteligencia artificial.
            </p>
            
            {/* Onboarding Cards - Nuevo sistema de selección de rol */}
            <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
              <button
                onClick={() => handleRoleSelect('patient')}
                className="group bg-white p-6 rounded-xl shadow-altamedica hover:shadow-altamedica-xl transition-all transform hover:scale-105 border-2 border-transparent hover:border-primary-500"
              >
                <Heart className="w-12 h-12 text-primary-500 mb-4 mx-auto" />
                <h3 className="font-display font-semibold text-lg mb-2">Soy Paciente</h3>
                <p className="text-neutral-600 text-sm">
                  Accede a consultas médicas, gestiona tu historial y recibe atención 24/7
                </p>
                <ArrowRight className="w-5 h-5 mt-4 mx-auto text-primary-500 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleRoleSelect('doctor')}
                className="group bg-white p-6 rounded-xl shadow-altamedica hover:shadow-altamedica-xl transition-all transform hover:scale-105 border-2 border-transparent hover:border-primary-500"
              >
                <Stethoscope className="w-12 h-12 text-primary-500 mb-4 mx-auto" />
                <h3 className="font-display font-semibold text-lg mb-2">Soy Médico</h3>
                <p className="text-neutral-600 text-sm">
                  Gestiona pacientes, realiza teleconsultas y accede a herramientas de IA
                </p>
                <ArrowRight className="w-5 h-5 mt-4 mx-auto text-primary-500 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleRoleSelect('company')}
                className="group bg-white p-6 rounded-xl shadow-altamedica hover:shadow-altamedica-xl transition-all transform hover:scale-105 border-2 border-transparent hover:border-primary-500"
              >
                <Award className="w-12 h-12 text-primary-500 mb-4 mx-auto" />
                <h3 className="font-display font-semibold text-lg mb-2">Soy Empresa</h3>
                <p className="text-neutral-600 text-sm">
                  Contrata servicios médicos para empleados y gestiona salud corporativa
                </p>
                <ArrowRight className="w-5 h-5 mt-4 mx-auto text-primary-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link href="/register">
                <Button size="lg" className="min-w-[200px]">
                  Comenzar Gratis
                  <Zap className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" className="min-w-[200px]">
                  Ver Demo
                  <Video className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 bg-primary-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-display font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-primary-100 text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-neutral-900 mb-4">
              Tecnología que Salva Vidas
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Combinamos lo mejor de la medicina tradicional con innovación tecnológica
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-altamedica hover:shadow-altamedica-lg transition-all group"
              >
                <div className={`${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-10 h-10" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2 text-neutral-900">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Telemedicina Section - NUEVA */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-display font-bold text-neutral-900 mb-6">
                Telemedicina de <span className="text-primary-500">Nueva Generación</span>
              </h2>
              <p className="text-lg text-neutral-600 mb-6">
                Revolucionamos la atención médica a distancia con tecnología de punta
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-success-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-neutral-900">Video HD con Análisis en Tiempo Real</h4>
                    <p className="text-neutral-600 text-sm">
                      Videollamadas de alta calidad con herramientas de diagnóstico integradas
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-success-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-neutral-900">IA Asistente Médico</h4>
                    <p className="text-neutral-600 text-sm">
                      Inteligencia artificial que ayuda en diagnósticos y sugiere tratamientos
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-success-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-neutral-900">Prescripciones Digitales</h4>
                    <p className="text-neutral-600 text-sm">
                      Recetas electrónicas válidas en farmacias de toda Argentina
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-success-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-neutral-900">Historial Médico Unificado</h4>
                    <p className="text-neutral-600 text-sm">
                      Acceso seguro a todo tu historial desde cualquier dispositivo
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Link href="/telemedicine">
                  <Button size="lg">
                    Conocer más sobre Telemedicina
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              {isLoaded && <VideoCarousel />}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Videos */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold text-neutral-900 mb-4">
              Plataforma en Acción
            </h2>
            <p className="text-xl text-neutral-600">
              Descubre cómo AltaMedica está transformando la salud digital
            </p>
          </div>
          
          {/* Marketplace Map Demo */}
          <div className="rounded-xl overflow-hidden shadow-altamedica-lg">
            {isLoaded && <MarketplaceDemoMap />}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display font-bold text-neutral-900 mb-12">
            Confianza y Seguridad
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-altamedica">
              <Shield className="w-12 h-12 text-primary-500 mb-4 mx-auto" />
              <h3 className="font-display font-semibold text-xl mb-2">Certificado HIPAA</h3>
              <p className="text-neutral-600">
                Cumplimos con los más altos estándares de seguridad médica internacional
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-altamedica">
              <Activity className="w-12 h-12 text-success-500 mb-4 mx-auto" />
              <h3 className="font-display font-semibold text-xl mb-2">Monitoreo 24/7</h3>
              <p className="text-neutral-600">
                Sistema de vigilancia continua para garantizar disponibilidad total
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-altamedica">
              <Star className="w-12 h-12 text-alert-500 mb-4 mx-auto" />
              <h3 className="font-display font-semibold text-xl mb-2">Médicos Verificados</h3>
              <p className="text-neutral-600">
                Todos nuestros profesionales están certificados y verificados
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-display font-bold text-white mb-6">
            Comienza tu Transformación Digital en Salud
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Únete a miles de argentinos que ya confían en AltaMedica
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="min-w-[200px]">
                Registrarse Gratis
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="min-w-[200px] bg-white/10 text-white border-white hover:bg-white hover:text-primary-500">
                Contactar Ventas
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}