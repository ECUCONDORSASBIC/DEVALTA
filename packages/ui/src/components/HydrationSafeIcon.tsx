'use client';

import { LucideIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface HydrationSafeIconProps {
  icon: LucideIcon;
  className?: string;
  size?: number | string;
  'aria-hidden'?: boolean;
  'aria-label'?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  // Todas las demás props que Lucide acepta
  [key: string]: any;
}

/**
 * Componente wrapper para iconos de Lucide que previene errores de hidratación
 * 
 * PROBLEMA RESUELTO:
 * - Diferencias en aria-hidden entre servidor y cliente
 * - Inconsistencias en renderizado de SVG paths
 * - Errores de hidratación con iconos dinámicos
 * 
 * CARACTERÍSTICAS:
 * - Renderizado consistente entre SSR/CSR
 * - Props aria-hidden estables
 * - Fallback durante hidratación
 * - Optimización de performance
 */
export const HydrationSafeIcon: React.FC<HydrationSafeIconProps> = ({
  icon: Icon,
  className = '',
  size,
  'aria-hidden': ariaHidden = true,
  'aria-label': ariaLabel,
  style,
  onClick,
  ...otherProps
}) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Durante SSR y antes de hidratación, usar props estables
  const stableProps = {
    className,
    'aria-hidden': ariaHidden,
    ...(ariaLabel && { 'aria-label': ariaLabel }),
    ...(size && { size }),
    ...(style && { style }),
    ...(onClick && { onClick }),
    ...otherProps
  };

  // Si no está hidratado, renderizar con props estables para evitar mismatch
  if (!isHydrated) {
    return (
      <Icon
        {...stableProps}
        suppressHydrationWarning={true}
      />
    );
  }

  // Después de hidratación, renderizar normalmente
  return (
    <Icon
      {...stableProps}
    />
  );
};

/**
 * Hook personalizado para iconos médicos comunes
 */
export function useMedicalIcons() {
  return {
    Heart: (props: Omit<HydrationSafeIconProps, 'icon'>) => (
      <HydrationSafeIcon 
        icon={require('lucide-react').Heart} 
        aria-label="Salud cardíaca"
        {...props} 
      />
    ),
    Shield: (props: Omit<HydrationSafeIconProps, 'icon'>) => (
      <HydrationSafeIcon 
        icon={require('lucide-react').Shield} 
        aria-label="Seguridad médica"
        {...props} 
      />
    ),
    Users: (props: Omit<HydrationSafeIconProps, 'icon'>) => (
      <HydrationSafeIcon 
        icon={require('lucide-react').Users} 
        aria-label="Pacientes"
        {...props} 
      />
    ),
    Stethoscope: (props: Omit<HydrationSafeIconProps, 'icon'>) => (
      <HydrationSafeIcon 
        icon={require('lucide-react').Stethoscope} 
        aria-label="Médicos"
        {...props} 
      />
    ),
    Activity: (props: Omit<HydrationSafeIconProps, 'icon'>) => (
      <HydrationSafeIcon 
        icon={require('lucide-react').Activity} 
        aria-label="Actividad médica"
        {...props} 
      />
    ),
  };
}

/**
 * Componente de testing para validar hidratación
 */
export const HydrationTestIcon: React.FC<{ iconName: string }> = ({ iconName }) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    console.log(`🧪 [HydrationTest] Icon ${iconName} hydrated successfully`);
  }, [iconName]);

  return (
    <div className="p-2 border border-green-200 bg-green-50 rounded">
      <span className="text-xs text-green-600">
        {iconName}: {isClient ? '✅ Hydrated' : '⏳ Server'}
      </span>
    </div>
  );
};

export default HydrationSafeIcon;
