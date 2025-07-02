'use client';

import React from 'react';

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
const IconPlus = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M12 5l0 14" />
    <path d="M5 12l14 0" />
  </svg>
);

const IconSearch = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
    <path d="M21 21l-6 -6" />
  </svg>
);

const IconUsers = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
    <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
  </svg>
);

const IconFileText = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
    <path d="M9 9l1 0" />
    <path d="M9 13l6 0" />
    <path d="M9 17l6 0" />
  </svg>
);

const IconSettings = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
    <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
  </svg>
);

const IconBarChart = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
    <path d="M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
    <path d="M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" />
    <path d="M4 20l14 0" />
  </svg>
);

const IconMessage = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M8 9h8" />
    <path d="M8 13h6" />
    <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z" />
  </svg>
);

const IconCalendar = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z" />
    <path d="M16 3v4" />
    <path d="M8 3v4" />
    <path d="M4 11h16" />
    <path d="M11 15h1" />
    <path d="M12 15v3" />
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

// --- COMPONENTES ACETERNITY UI ---
const FloatingCard = ({ children, className, delay = 0 }) => (
  <div 
    className={cn(
      "group relative overflow-hidden rounded-2xl p-px transition-all duration-500",
      "bg-gradient-to-br from-slate-200 via-white to-slate-200",
      "hover:from-blue-300 hover:via-purple-200 hover:to-pink-300",
      "hover:shadow-2xl hover:shadow-blue-500/25",
      "transform hover:-translate-y-2",
      className
    )}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="relative h-full w-full rounded-[15px] bg-white/90 backdrop-blur-sm p-6 border border-white/20">
      {children}
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100">
        <div className="absolute w-2 h-2 bg-blue-400 rounded-full top-2 right-2 animate-ping" />
        <div className="absolute w-1 h-1 bg-purple-400 rounded-full top-4 right-8 animate-pulse" />
        <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" />
      </div>
    </div>
  </div>
);

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
  onClick: () => void;
  delay?: number;
}

const QuickActionCard: React.FC<QuickActionProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  gradient, 
  onClick,
  delay = 0 
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <FloatingCard delay={delay}>
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full space-y-4 text-left group/action"
      >
        <div className="flex items-start justify-between">
          <div className="relative">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
              "shadow-lg group-hover/action:shadow-xl",
              gradient
            )}>
              <Icon className={cn(
                "w-6 h-6 text-white transition-transform duration-300",
                isHovered && "scale-110 rotate-3"
              )} />
            </div>
            
            {/* Glow effect */}
            <div className={cn(
              "absolute -inset-2 rounded-xl blur-lg opacity-0 group-hover/action:opacity-50 transition-opacity duration-300",
              gradient
            )} />
          </div>
          
          <IconArrowRight className={cn(
            "w-5 h-5 text-slate-400 transition-all duration-300",
            "group-hover/action:text-slate-600 group-hover/action:translate-x-1"
          )} />
        </div>
        
        <div className="space-y-2">
          <h3 className={cn(
            "text-base font-semibold transition-colors duration-300",
            "text-slate-900 group-hover/action:text-blue-600"
          )}>
            {title}
          </h3>
          <p className="text-sm leading-relaxed text-slate-600">
            {description}
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="h-1 overflow-hidden rounded-full bg-slate-100">
          <div className={cn(
            "h-full transition-all duration-500 rounded-full",
            gradient,
            isHovered ? "w-full" : "w-0"
          )} />
        </div>
      </button>
    </FloatingCard>
  );
};

export default function QuickActions() {
  const actions = [
    {
      title: 'Publicar Nueva Oferta',
      description: 'Crear una nueva oferta de trabajo y comenzar el reclutamiento',
      icon: IconPlus,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      onClick: () => console.log('Navigate to job posting'),
      delay: 0
    },
    {
      title: 'Buscar Médicos',
      description: 'Encontrar profesionales médicos calificados',
      icon: IconSearch,
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      onClick: () => console.log('Navigate to doctor search'),
      delay: 100
    },
    {
      title: 'Gestionar Aplicaciones',
      description: 'Revisar y procesar aplicaciones de candidatos',
      icon: IconFileText,
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      onClick: () => console.log('Navigate to applications'),
      delay: 200
    },
    {
      title: 'Programar Entrevistas',
      description: 'Agendar entrevistas con candidatos',
      icon: IconCalendar,
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
      onClick: () => console.log('Navigate to scheduling'),
      delay: 300
    },
    {
      title: 'Gestión de Equipo',
      description: 'Administrar equipo de contratación y permisos',
      icon: IconUsers,
      gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      onClick: () => console.log('Navigate to team management'),
      delay: 400
    },
    {
      title: 'Analíticas y Reportes',
      description: 'Ver análisis detallados e insights de contratación',
      icon: IconBarChart,
      gradient: 'bg-gradient-to-br from-pink-500 to-pink-600',
      onClick: () => console.log('Navigate to analytics'),
      delay: 500
    },
    {
      title: 'Centro de Comunicación',
      description: 'Mensajería con candidatos y miembros del equipo',
      icon: IconMessage,
      gradient: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      onClick: () => console.log('Navigate to messages'),
      delay: 600
    },
    {
      title: 'Configuración',
      description: 'Gestionar perfil de empresa y preferencias',
      icon: IconSettings,
      gradient: 'bg-gradient-to-br from-slate-500 to-slate-600',
      onClick: () => console.log('Navigate to settings'),
      delay: 700
    }
  ];

  return (
    <div className="relative">
      {/* Background decorative elements */}
      <div className="absolute w-40 h-40 rounded-full -top-10 -right-10 bg-gradient-to-br from-blue-400/10 to-purple-600/10 blur-3xl" />
      <div className="absolute w-32 h-32 rounded-full -bottom-10 -left-10 bg-gradient-to-tr from-emerald-400/10 to-cyan-500/10 blur-2xl" />
      
      <div className="relative p-8 border shadow-xl bg-white/60 backdrop-blur-sm rounded-3xl border-white/40">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Acciones Rápidas</h2>
            <p className="text-slate-600">Gestiona tu proceso de contratación médica</p>
          </div>
          
          <button className={cn(
            "group flex items-center space-x-2 px-4 py-2 rounded-xl",
            "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
            "hover:from-blue-600 hover:to-purple-700",
            "transition-all duration-300 shadow-lg hover:shadow-xl",
            "transform hover:-translate-y-0.5"
          )}>
            <span className="text-sm font-medium">Ver Todas</span>
            <IconArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action, index) => (
            <QuickActionCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              gradient={action.gradient}
              onClick={action.onClick}
              delay={action.delay}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
