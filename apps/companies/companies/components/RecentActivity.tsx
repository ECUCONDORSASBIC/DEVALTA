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
const IconUser = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
    <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
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

const IconCheckCircle = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
    <path d="M9 12l2 2l4 -4" />
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

const IconDots = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
  </svg>
);

const IconEye = ({ className, ...rest }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
    <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
  </svg>
);

// --- COMPONENTES ACETERNITY UI ---
const TimelineItem = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={cn(
      "relative transform transition-all duration-700",
      isVisible ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"
    )}>
      {children}
    </div>
  );
};

const ActivityBadge = ({ type, status }) => {
  const getBadgeStyles = () => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'hired':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'scheduled': return 'Programado';
      case 'hired': return 'Contratado';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  if (!status) return null;

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
      getBadgeStyles()
    )}>
      {getStatusText()}
    </span>
  );
};

interface Activity {
  id: string;
  type: 'application' | 'job_posted' | 'interview' | 'message' | 'hire' | 'profile_view';
  title: string;
  description: string;
  timestamp: string;
  actor: {
    name: string;
    avatar?: string;
    role: string;
  };
  metadata?: {
    jobTitle?: string;
    applicantName?: string;
    status?: string;
  };
}

const ActivityIcon: React.FC<{ type: Activity['type'] }> = ({ type }) => {
  const iconClass = "h-5 w-5";
  
  const iconConfig = {
    application: { icon: IconFileText, className: "text-blue-500", bg: "bg-blue-100" },
    job_posted: { icon: IconBriefcase, className: "text-emerald-500", bg: "bg-emerald-100" },
    interview: { icon: IconCalendar, className: "text-purple-500", bg: "bg-purple-100" },
    message: { icon: IconMessage, className: "text-orange-500", bg: "bg-orange-100" },
    hire: { icon: IconCheckCircle, className: "text-green-500", bg: "bg-green-100" },
    profile_view: { icon: IconEye, className: "text-slate-500", bg: "bg-slate-100" },
  };

  const config = iconConfig[type] || iconConfig.profile_view;
  const IconComponent = config.icon;

  return (
    <div className={cn(
      "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform hover:scale-110",
      config.bg
    )}>
      <IconComponent className={cn(iconClass, config.className)} />
    </div>
  );
};

export default function RecentActivity() {
  // Mock activity data
  const activities: Activity[] = [
    {
      id: '1',
      type: 'application',
      title: 'Nueva Aplicación Recibida',
      description: 'para puesto de Cardiólogo',
      timestamp: 'hace 5 minutos',
      actor: {
        name: 'Dr. Sarah Johnson',
        role: 'Cardióloga',
      },
      metadata: {
        jobTitle: 'Cardiólogo Senior',
        status: 'pending'
      }
    },
    {
      id: '2',
      type: 'interview',
      title: 'Entrevista Programada',
      description: 'con Dr. Michael Chen',
      timestamp: 'hace 15 minutos',
      actor: {
        name: 'Equipo de RRHH',
        role: 'Recursos Humanos',
      },
      metadata: {
        applicantName: 'Dr. Michael Chen',
        status: 'scheduled'
      }
    },
    {
      id: '3',
      type: 'job_posted',
      title: 'Nueva Oferta Publicada',
      description: 'Médico de Medicina de Emergencia',
      timestamp: 'hace 2 horas',
      actor: {
        name: 'John Smith',
        role: 'Gerente de Contratación',
      },
      metadata: {
        jobTitle: 'Médico de Medicina de Emergencia'
      }
    },
    {
      id: '4',
      type: 'hire',
      title: 'Candidato Contratado',
      description: 'Dr. Emily Rodríguez aceptó la oferta',
      timestamp: 'hace 4 horas',
      actor: {
        name: 'Equipo de RRHH',
        role: 'Recursos Humanos',
      },
      metadata: {
        applicantName: 'Dr. Emily Rodríguez',
        jobTitle: 'Médico de Medicina Familiar',
        status: 'hired'
      }
    },
    {
      id: '5',
      type: 'message',
      title: 'Nuevo Mensaje',
      description: 'de candidato potencial',
      timestamp: 'hace 6 horas',
      actor: {
        name: 'Dr. James Wilson',
        role: 'Cirujano Ortopédico',
      }
    },
    {
      id: '6',
      type: 'profile_view',
      title: 'Perfil Visto',
      description: 'Su perfil de empresa fue visto',
      timestamp: 'hace 8 horas',
      actor: {
        name: 'Anónimo',
        role: 'Buscador de Empleo',
      }
    }
  ];

  return (
    <div className="relative">
      {/* Background decorative elements */}
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-violet-400/20 to-purple-600/20 rounded-full blur-2xl" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-cyan-500/20 rounded-full blur-xl" />
      
      <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/40 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Actividad Reciente</h2>
            <p className="text-slate-600">Últimas actualizaciones de tu plataforma</p>
          </div>
          
          <button className={cn(
            "group p-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40",
            "hover:bg-white/80 transition-all duration-300 shadow-lg hover:shadow-xl"
          )}>
            <IconDots className="h-5 w-5 text-slate-600 group-hover:text-slate-800" />
          </button>
        </div>

        <div className="space-y-4">
          {activities.map((activity, index) => (
            <TimelineItem key={activity.id} delay={index * 100}>
              <div className={cn(
                "group relative flex items-start space-x-4 p-4 rounded-2xl transition-all duration-300",
                "bg-white/60 backdrop-blur-sm border border-white/30",
                "hover:bg-white/80 hover:shadow-lg hover:border-white/50"
              )}>
                {/* Timeline connector */}
                {index < activities.length - 1 && (
                  <div className="absolute left-8 top-16 w-px h-8 bg-gradient-to-b from-slate-200 to-transparent" />
                )}
                
                <div className="flex-shrink-0 relative">
                  <ActivityIcon type={activity.type} />
                  
                  {/* Pulse effect for recent items */}
                  {index < 2 && (
                    <div className="absolute -inset-2 bg-blue-400/20 rounded-xl animate-pulse" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {activity.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {activity.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <ActivityBadge type={activity.type} status={activity.metadata?.status} />
                      <span className="whitespace-nowrap font-medium">
                        {activity.timestamp}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actor info */}
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <IconUser className="h-3 w-3 text-white" />
                    </div>
                    <span className="font-medium">{activity.actor.name}</span>
                    <span>•</span>
                    <span>{activity.actor.role}</span>
                  </div>
                  
                  {/* Job title tag */}
                  {activity.metadata?.jobTitle && (
                    <div className="flex items-center">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                        "bg-slate-100 text-slate-700 border border-slate-200"
                      )}>
                        <IconBriefcase className="h-3 w-3 mr-1.5" />
                        {activity.metadata.jobTitle}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Hover effect gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </TimelineItem>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200/60">
          <button className={cn(
            "group w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl",
            "bg-gradient-to-r from-blue-500 to-purple-600 text-white",
            "hover:from-blue-600 hover:to-purple-700",
            "transition-all duration-300 shadow-lg hover:shadow-xl",
            "transform hover:-translate-y-0.5"
          )}>
            <span className="text-sm font-medium">Ver Toda la Actividad</span>
            <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
