'use client';

import React, { useEffect, useRef } from 'react';
import { Heart, Thermometer, Activity, Droplets, Gauge } from 'lucide-react';
import { medicalColors, getVitalColor } from './colors';
import { 
  useVoiceOver, 
  getAriaLabel, 
  getAriaDescription, 
  announceToScreenReader,
  useHighContrastMode,
  useReducedMotion 
} from './accessibility';
import { motion } from 'framer-motion';

export interface VitalSignData {
  type: 'heartRate' | 'bloodPressure' | 'temperature' | 'oxygenSat' | 'bloodSugar';
  value: number | string;
  unit: string;
  normalRange: { min: number; max: number };
  trend?: 'up' | 'down' | 'stable';
  lastUpdated?: Date;
  priority?: 'normal' | 'attention' | 'critical';
}

interface VitalSignPillProps {
  vital: VitalSignData;
  size?: 'sm' | 'md' | 'lg';
  showTrend?: boolean;
  showTime?: boolean;
  onClick?: () => void;
  enableVoiceOver?: boolean;
  className?: string;
}

const iconMap = {
  heartRate: Heart,
  bloodPressure: Gauge,
  temperature: Thermometer,
  oxygenSat: Activity,
  bloodSugar: Droplets,
};

const sizeClasses = {
  sm: {
    container: 'px-3 py-2 text-sm',
    icon: 'w-4 h-4',
    value: 'text-lg font-bold',
    unit: 'text-xs',
  },
  md: {
    container: 'px-4 py-3 text-base',
    icon: 'w-5 h-5',
    value: 'text-xl font-bold',
    unit: 'text-sm',
  },
  lg: {
    container: 'px-6 py-4 text-lg',
    icon: 'w-6 h-6',
    value: 'text-2xl font-bold',
    unit: 'text-base',
  },
};

export const VitalSignPill: React.FC<VitalSignPillProps> = ({
  vital,
  size = 'md',
  showTrend = true,
  showTime = false,
  onClick,
  enableVoiceOver = true,
  className = '',
}) => {
  const { speak, isEnabled: voiceOverEnabled } = useVoiceOver();
  const isHighContrast = useHighContrastMode();
  const prefersReducedMotion = useReducedMotion();
  const pillRef = useRef<HTMLDivElement>(null);

  const Icon = iconMap[vital.type];
  const numericValue = typeof vital.value === 'number' ? vital.value : parseFloat(vital.value.toString());
  const vitalColor = getVitalColor(vital.type, numericValue, vital.normalRange);
  const sizeStyle = sizeClasses[size];

  // Determine priority color
  const getPriorityColors = () => {
    if (isHighContrast) {
      return {
        background: vital.priority === 'critical' ? '#000000' : '#ffffff',
        text: vital.priority === 'critical' ? '#ffffff' : '#000000',
        border: '#000000',
      };
    }

    switch (vital.priority) {
      case 'critical':
        return {
          background: medicalColors.alerts.critical.bg,
          text: medicalColors.alerts.critical.text,
          border: medicalColors.alerts.critical.icon,
        };
      case 'attention':
        return {
          background: medicalColors.alerts.warning.bg,
          text: medicalColors.alerts.warning.text,
          border: medicalColors.alerts.warning.icon,
        };
      default:
        return {
          background: medicalColors.alerts.info.bg,
          text: medicalColors.elderlyFriendly.text.primary,
          border: vitalColor,
        };
    }
  };

  const colors = getPriorityColors();

  // Voice-over announcement
  const announceVital = () => {
    if (enableVoiceOver && voiceOverEnabled) {
      const ariaLabel = getAriaLabel(vital.type, vital.value, vital.unit);
      const ariaDescription = getAriaDescription(vital.type, numericValue, vital.normalRange);
      const message = `${ariaLabel}. ${ariaDescription}`;
      speak(message);
    }
  };

  // Keyboard event handler
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (onClick) onClick();
      announceVital();
    }
  };

  // Focus handler
  const handleFocus = () => {
    if (enableVoiceOver) {
      announceVital();
    }
  };

  // Animation variants
  const motionVariants = {
    initial: { scale: 1, opacity: 1 },
    hover: prefersReducedMotion ? {} : { scale: 1.02 },
    tap: prefersReducedMotion ? {} : { scale: 0.98 },
    critical: prefersReducedMotion ? {} : { 
      scale: [1, 1.05, 1],
      transition: { 
        repeat: Infinity, 
        duration: 1.5,
        ease: "easeInOut" 
      }
    },
  };

  // Format time
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  // Get trend icon
  const getTrendIcon = () => {
    if (!showTrend || !vital.trend) return null;
    
    const trendColors = {
      up: vital.priority === 'critical' ? '#dc2626' : '#059669',
      down: vital.priority === 'critical' ? '#dc2626' : '#3b82f6',
      stable: '#6b7280',
    };

    return (
      <span 
        className="ml-1 text-xs"
        style={{ color: trendColors[vital.trend] }}
        aria-label={`Trend: ${vital.trend}`}
      >
        {vital.trend === 'up' && '↗'}
        {vital.trend === 'down' && '↘'}
        {vital.trend === 'stable' && '→'}
      </span>
    );
  };

  return (
    <motion.div
      ref={pillRef}
      className={`
        inline-flex items-center rounded-full border-2 cursor-pointer
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-4 focus:ring-opacity-50
        ${sizeStyle.container}
        ${onClick ? 'hover:shadow-lg' : ''}
        ${className}
      `}
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        color: colors.text,
        focusRingColor: medicalColors.accessibility.focusRing,
      }}
      variants={motionVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      animate={vital.priority === 'critical' ? 'critical' : 'initial'}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? 'button' : 'status'}
      aria-label={getAriaLabel(vital.type, vital.value, vital.unit)}
      aria-describedby={`${vital.type}-description`}
      aria-live={vital.priority === 'critical' ? 'assertive' : 'polite'}
    >
      {/* Icon */}
      <Icon 
        className={`${sizeStyle.icon} mr-2 flex-shrink-0`}
        style={{ color: colors.border }}
        aria-hidden="true"
      />
      
      {/* Value and Unit */}
      <div className="flex flex-col min-w-0">
        <div className="flex items-baseline">
          <span className={sizeStyle.value} style={{ color: colors.text }}>
            {vital.value}
          </span>
          <span 
            className={`${sizeStyle.unit} ml-1 opacity-75`}
            style={{ color: colors.text }}
          >
            {vital.unit}
          </span>
          {getTrendIcon()}
        </div>
        
        {/* Time */}
        {showTime && vital.lastUpdated && (
          <span 
            className="text-xs opacity-60"
            style={{ color: colors.text }}
          >
            {formatTime(vital.lastUpdated)}
          </span>
        )}
      </div>

      {/* Hidden description for screen readers */}
      <span 
        id={`${vital.type}-description`}
        className="sr-only"
      >
        {getAriaDescription(vital.type, numericValue, vital.normalRange)}
      </span>
    </motion.div>
  );
};

// Container component for multiple vital signs
interface VitalSignsGridProps {
  vitals: VitalSignData[];
  enableVoiceOver?: boolean;
  onVitalClick?: (vital: VitalSignData) => void;
  className?: string;
}

export const VitalSignsGrid: React.FC<VitalSignsGridProps> = ({
  vitals,
  enableVoiceOver = true,
  onVitalClick,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation for the grid
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!containerRef.current) return;

    const pills = Array.from(
      containerRef.current.querySelectorAll('[role="button"], [role="status"]')
    ) as HTMLElement[];

    const currentIndex = pills.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % pills.length;
        pills[nextIndex]?.focus();
        break;
      
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex <= 0 ? pills.length - 1 : currentIndex - 1;
        pills[prevIndex]?.focus();
        break;
      
      case 'Home':
        event.preventDefault();
        pills[0]?.focus();
        break;
      
      case 'End':
        event.preventDefault();
        pills[pills.length - 1]?.focus();
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}
      onKeyDown={handleKeyDown}
      role="group"
      aria-label="Vital signs"
    >
      {vitals.map((vital, index) => (
        <VitalSignPill
          key={`${vital.type}-${index}`}
          vital={vital}
          enableVoiceOver={enableVoiceOver}
          onClick={onVitalClick ? () => onVitalClick(vital) : undefined}
        />
      ))}
    </div>
  );
};

export default VitalSignPill;
