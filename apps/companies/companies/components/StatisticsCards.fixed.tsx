'use client';

import React from 'react';

// --- UTILITIES ---
const cn = (...inputs: any[]) => {
  const classes: string[] = [];
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
const IconBuilding = ({ className, ...rest }: { className?: string, [key: string]: any }) => (
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

const IconBriefcase = ({ className, ...rest }: { className?: string, [key: string]: any }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M3 7m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" />
    <path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2" />
    <path d="M12 12l0 .01" />
    <path d="M3 13a20 20 0 0 0 18 0" />
  </svg>
);

const IconUsers = ({ className, ...rest }: { className?: string, [key: string]: any }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
    <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
  </svg>
);

const IconFileCheck = ({ className, ...rest }: { className?: string, [key: string]: any }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
    <path d="M9 15l2 2l4 -4" />
  </svg>
);

const IconTrendingUp = ({ className, ...rest }: { className?: string, [key: string]: any }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M3 17l6 -6l4 4l8 -8" />
    <path d="M14 7l7 0l0 7" />
  </svg>
);

const IconTrendingDown = ({ className, ...rest }: { className?: string, [key: string]: any }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M3 7l6 6l4 -4l8 8" />
    <path d="M21 10l0 7l-7 0" />
  </svg>
);

const IconMinus = ({ className, ...rest }: { className?: string, [key: string]: any }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn(className)} {...rest}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M5 12l14 0" />
  </svg>
);

// --- COMPONENTES ACETERNITY UI ---
const BentoGridItem = ({ 
  className, 
  children, 
  gradient, 
  tabIndex, 
  ...rest 
}: { 
  className?: string; 
  children: React.ReactNode; 
  gradient?: string;
  tabIndex?: number;
  [key: string]: any;
}) => (
  <div 
    className={cn(
      "relative group/bento hover:shadow-2xl transition-all duration-500 p-px rounded-2xl overflow-hidden",
      gradient || "bg-gradient-to-br from-slate-200 via-white to-slate-200",
      className
    )}
    tabIndex={tabIndex}
    {...rest}
  >
    <div className="relative bg-white/90 backdrop-blur-sm p-6 rounded-[15px] h-full w-full border border-white/20 shadow-lg">
      {children}
    </div>
    <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20 group-hover/bento:opacity-100 rounded-2xl" />
  </div>
);

const AnimatedNumber = ({ value, duration = 2000 }: { value: string | number; duration?: number }) => {
  const [displayValue, setDisplayValue] = React.useState<string | number>(0);
  
  React.useEffect(() => {
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
    let startTime: number | undefined;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easeOutCubic * numericValue);
      
      if (typeof value === 'string' && value.includes(',')) {
        setDisplayValue(currentValue.toLocaleString());
      } else {
        setDisplayValue(currentValue);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);
  
  return <span>{displayValue}</span>;
};

interface StatisticCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon: React.ComponentType<any>;
  gradient?: string;
  delay?: number;
  tabIndex?: number;
}

const StatisticCard: React.FC<StatisticCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  gradient,
  delay = 0,
  tabIndex = -1
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getChangeIcon = () => {
    if (!change) return null;
    switch (change.type) {
      case 'increase':
        return <IconTrendingUp className="w-4 h-4 text-emerald-500" aria-label="Tendencia positiva" />;
      case 'decrease':
        return <IconTrendingDown className="w-4 h-4 text-red-500" aria-label="Tendencia negativa" />;
      default:
        return <IconMinus className="w-4 h-4 text-slate-500" aria-label="Sin cambio" />;
    }
  };

  const getChangeColor = () => {
    if (!change) return '';
    switch (change.type) {
      case 'increase':
        return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      case 'decrease':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  return (
    <BentoGridItem 
      gradient={gradient}
      className={cn(
        "transform transition-all duration-700 outline-none focus:ring-2 focus:ring-blue-400",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
      tabIndex={tabIndex}
      aria-label={title}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-4">
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 transition-shadow duration-300 shadow-lg rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 group-hover/bento:shadow-xl">
                <Icon className="w-6 h-6 transition-colors duration-300 text-slate-700 group-hover/bento:text-slate-900" />
              </div>
              <div className="absolute transition-opacity duration-300 opacity-0 -inset-1 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-xl group-hover/bento:opacity-100 blur-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium tracking-wide uppercase text-slate-600">
              {title}
            </h3>
            <div className="flex items-baseline space-x-2">
              <span className={cn(
                "text-3xl font-bold tracking-tight text-slate-900",
                isVisible && "animate-pulse"
              )}>
                {isVisible ? <AnimatedNumber value={value} /> : '0'}
              </span>
              {change && (
                <div 
                  className={cn(
                    "flex items-center space-x-1 text-sm font-semibold px-2 py-1 rounded-full border",
                    "bg-white/80 backdrop-blur-sm",
                    getChangeColor()
                  )} 
                  aria-label={`Cambio: ${change.value}%`}
                >
                  {getChangeIcon()}
                  <span>{Math.abs(change.value)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-20 h-20 transition-opacity duration-500 rounded-full bg-gradient-to-br from-blue-400/10 to-purple-600/10 blur-2xl opacity-60 group-hover/bento:opacity-80" />
      <div className="absolute bottom-0 left-0 w-16 h-16 transition-opacity duration-500 rounded-full bg-gradient-to-tr from-emerald-400/10 to-blue-500/10 blur-xl opacity-40 group-hover/bento:opacity-60" />
    </BentoGridItem>
  );
};

export default function StatisticsCards() {
  const stats = [
    {
      title: 'Empresas Activas',
      value: 156,
      change: { value: 3, type: 'increase' as const },
      icon: IconBuilding,
      gradient: 'bg-gradient-to-br from-blue-200 via-blue-50 to-indigo-200',
      delay: 0
    },
    {
      title: 'Ofertas Publicadas',
      value: 47,
      change: { value: 12, type: 'increase' as const },
      icon: IconBriefcase,
      gradient: 'bg-gradient-to-br from-indigo-200 via-purple-50 to-purple-200',
      delay: 150
    },
    {
      title: 'Médicos Registrados',
      value: '2,843',
      change: { value: 8, type: 'increase' as const },
      icon: IconUsers,
      gradient: 'bg-gradient-to-br from-emerald-200 via-teal-50 to-cyan-200',
      delay: 300
    },
    {
      title: 'Aplicaciones Recibidas',
      value: '1,234',
      change: { value: 15, type: 'increase' as const },
      icon: IconFileCheck,
      gradient: 'bg-gradient-to-br from-purple-200 via-violet-50 to-pink-200',
      delay: 450
    }
  ];

  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      role="region"
      aria-label="Estadísticas principales de la plataforma"
    >
      {stats.map((stat, index) => (
        <StatisticCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          gradient={stat.gradient}
          delay={stat.delay}
          tabIndex={0}
        />
      ))}
    </div>
  );
}
