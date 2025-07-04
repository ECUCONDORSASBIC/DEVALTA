'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle, 
  X, 
  Volume2, 
  VolumeX,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { medicalColors, getAlertColorScheme } from './colors';
import { 
  useVoiceOver, 
  announceToScreenReader, 
  announceUrgent,
  useHighContrastMode,
  useReducedMotion,
  useFocusManagement
} from './accessibility';

export type AlertSeverity = 'success' | 'info' | 'warning' | 'error' | 'critical';

export interface MedicalAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp?: Date;
  autoDismiss?: boolean;
  dismissAfter?: number; // milliseconds
  persistent?: boolean;
  actionable?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    primary?: boolean;
  }>;
  metadata?: {
    patientId?: string;
    vitalType?: string;
    sourceSystem?: string;
  };
}

interface AlertBannerProps {
  alert: MedicalAlert;
  onDismiss?: (id: string) => void;
  enableVoiceOver?: boolean;
  enableAutoAnnouncement?: boolean;
  showTimestamp?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const iconMap = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  critical: AlertTriangle,
};

const sizeClasses = {
  sm: {
    container: 'p-3',
    icon: 'w-4 h-4',
    title: 'text-sm font-semibold',
    message: 'text-xs',
    button: 'p-1',
  },
  md: {
    container: 'p-4',
    icon: 'w-5 h-5',
    title: 'text-base font-semibold',
    message: 'text-sm',
    button: 'p-2',
  },
  lg: {
    container: 'p-6',
    icon: 'w-6 h-6',
    title: 'text-lg font-semibold',
    message: 'text-base',
    button: 'p-2',
  },
};

export const AlertBanner: React.FC<AlertBannerProps> = ({
  alert,
  onDismiss,
  enableVoiceOver = true,
  enableAutoAnnouncement = true,
  showTimestamp = true,
  size = 'md',
  className = '',
}) => {
  const { speak, isEnabled: voiceOverEnabled } = useVoiceOver();
  const isHighContrast = useHighContrastMode();
  const prefersReducedMotion = useReducedMotion();
  const { saveFocus, restoreFocus } = useFocusManagement();
  
  const [isVisible, setIsVisible] = useState(true);
  const [voiceOverMode, setVoiceOverMode] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);
  const dismissTimeoutRef = useRef<NodeJS.Timeout>();

  const Icon = iconMap[alert.severity];
  const colorScheme = getAlertColorScheme(alert.severity);
  const sizeStyle = sizeClasses[size];

  // Enhanced colors for high contrast mode
  const getColors = () => {
    if (isHighContrast) {
      return {
        background: alert.severity === 'critical' ? '#000000' : '#ffffff',
        text: alert.severity === 'critical' ? '#ffffff' : '#000000',
        border: '#000000',
        icon: alert.severity === 'critical' ? '#ffffff' : '#000000',
      };
    }
    return colorScheme;
  };

  const colors = getColors();

  // Auto-dismiss functionality
  useEffect(() => {
    if (alert.autoDismiss && alert.dismissAfter && onDismiss) {
      dismissTimeoutRef.current = setTimeout(() => {
        handleDismiss();
      }, alert.dismissAfter);
    }

    return () => {
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
      }
    };
  }, [alert, onDismiss]);

  // Voice announcement on mount
  useEffect(() => {
    if (enableAutoAnnouncement && enableVoiceOver) {
      const message = `${alert.severity} alert: ${alert.title}. ${alert.message}`;
      
      if (alert.severity === 'critical' || alert.severity === 'error') {
        announceUrgent(message);
        if (voiceOverEnabled) {
          speak(message, { rate: 0.7 }); // Slower for critical alerts
        }
      } else {
        announceToScreenReader(message);
        if (voiceOverEnabled) {
          setTimeout(() => speak(message), 500); // Delay for non-critical alerts
        }
      }
    }
  }, [alert, enableAutoAnnouncement, enableVoiceOver, voiceOverEnabled, speak]);

  // Focus management for critical alerts
  useEffect(() => {
    if (alert.severity === 'critical' && alertRef.current) {
      saveFocus();
      alertRef.current.focus();
    }
  }, [alert.severity, saveFocus]);

  const handleDismiss = () => {
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }
    
    setIsVisible(false);
    restoreFocus();
    
    // Announce dismissal
    if (enableVoiceOver && voiceOverEnabled) {
      speak('Alert dismissed');
    }
    
    // Call parent dismiss handler after animation
    setTimeout(() => {
      onDismiss?.(alert.id);
    }, 200);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        if (!alert.persistent) {
          handleDismiss();
        }
        break;
      
      case 'Enter':
      case ' ':
        if (event.target === alertRef.current) {
          event.preventDefault();
          if (voiceOverEnabled) {
            const message = `${alert.title}. ${alert.message}`;
            speak(message);
          }
        }
        break;
    }
  };

  const toggleVoiceOver = () => {
    setVoiceOverMode(!voiceOverMode);
    if (!voiceOverMode && voiceOverEnabled) {
      speak(`${alert.title}. ${alert.message}`);
    }
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  };

  // Animation variants
  const motionVariants = {
    initial: { 
      opacity: 0, 
      scale: prefersReducedMotion ? 1 : 0.95,
      y: prefersReducedMotion ? 0 : -20 
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: 'easeOut'
      }
    },
    exit: { 
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.95,
      y: prefersReducedMotion ? 0 : -10,
      transition: { 
        duration: prefersReducedMotion ? 0 : 0.2 
      }
    },
    critical: prefersReducedMotion ? {} : {
      scale: [1, 1.02, 1],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={alertRef}
          className={`
            rounded-lg border-l-4 shadow-lg
            focus:outline-none focus:ring-4 focus:ring-opacity-50
            ${sizeStyle.container}
            ${className}
          `}
          style={{
            backgroundColor: colors.bg,
            borderLeftColor: colors.icon,
            borderColor: colors.border,
            color: colors.text,
          }}
          variants={motionVariants}
          initial="initial"
          animate={alert.severity === 'critical' ? 'critical' : 'animate'}
          exit="exit"
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="alert"
          aria-live={alert.severity === 'critical' ? 'assertive' : 'polite'}
          aria-atomic="true"
          aria-labelledby={`alert-title-${alert.id}`}
          aria-describedby={`alert-message-${alert.id}`}
        >
          <div className="flex items-start">
            {/* Icon */}
            <div className="flex-shrink-0">
              <Icon 
                className={sizeStyle.icon}
                style={{ color: colors.icon }}
                aria-hidden="true"
              />
            </div>

            {/* Content */}
            <div className="ml-3 flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 
                  id={`alert-title-${alert.id}`}
                  className={sizeStyle.title}
                  style={{ color: colors.text }}
                >
                  {alert.title}
                </h3>
                
                <div className="flex items-center space-x-2">
                  {/* Voice Over Toggle */}
                  {enableVoiceOver && (
                    <button
                      onClick={toggleVoiceOver}
                      className={`${sizeStyle.button} rounded-md transition-colors focus:outline-none focus:ring-2`}
                      style={{ 
                        color: colors.icon,
                        focusRingColor: medicalColors.accessibility.focusRing 
                      }}
                      aria-label={voiceOverMode ? 'Stop voice over' : 'Start voice over'}
                      title={voiceOverMode ? 'Stop voice over' : 'Start voice over'}
                    >
                      {voiceOverMode ? (
                        <VolumeX className="w-4 h-4" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  {/* Timestamp */}
                  {showTimestamp && alert.timestamp && (
                    <div className="flex items-center text-xs opacity-75">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatTimestamp(alert.timestamp)}</span>
                    </div>
                  )}

                  {/* Dismiss Button */}
                  {!alert.persistent && onDismiss && (
                    <button
                      onClick={handleDismiss}
                      className={`${sizeStyle.button} rounded-md transition-colors focus:outline-none focus:ring-2`}
                      style={{ 
                        color: colors.icon,
                        focusRingColor: medicalColors.accessibility.focusRing 
                      }}
                      aria-label="Dismiss alert"
                      title="Dismiss alert"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Message */}
              <div 
                id={`alert-message-${alert.id}`}
                className={`${sizeStyle.message} mt-1`}
                style={{ color: colors.text }}
              >
                {alert.message}
              </div>

              {/* Actions */}
              {alert.actions && alert.actions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {alert.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`
                        px-3 py-1 text-xs font-medium rounded-md
                        focus:outline-none focus:ring-2 focus:ring-offset-2
                        transition-colors duration-200
                        ${action.primary 
                          ? 'bg-opacity-100 text-white' 
                          : 'bg-opacity-10 hover:bg-opacity-20'
                        }
                      `}
                      style={{
                        backgroundColor: action.primary ? colors.icon : 'transparent',
                        color: action.primary ? '#ffffff' : colors.text,
                        borderColor: colors.icon,
                        border: action.primary ? 'none' : '1px solid',
                      }}
                      aria-label={action.label}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Metadata for screen readers */}
              {alert.metadata && (
                <div className="sr-only">
                  {alert.metadata.patientId && `Patient ID: ${alert.metadata.patientId}.`}
                  {alert.metadata.vitalType && `Related to: ${alert.metadata.vitalType}.`}
                  {alert.metadata.sourceSystem && `Source: ${alert.metadata.sourceSystem}.`}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Container component for multiple alerts
interface AlertContainerProps {
  alerts: MedicalAlert[];
  onDismiss?: (id: string) => void;
  maxAlerts?: number;
  position?: 'top' | 'bottom';
  enableVoiceOver?: boolean;
  className?: string;
}

export const AlertContainer: React.FC<AlertContainerProps> = ({
  alerts,
  onDismiss,
  maxAlerts = 5,
  position = 'top',
  enableVoiceOver = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Sort alerts by severity and timestamp
  const sortedAlerts = [...alerts]
    .sort((a, b) => {
      const severityOrder = { critical: 5, error: 4, warning: 3, info: 2, success: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      
      if (severityDiff !== 0) return severityDiff;
      
      // If same severity, sort by timestamp (newest first)
      if (a.timestamp && b.timestamp) {
        return b.timestamp.getTime() - a.timestamp.getTime();
      }
      
      return 0;
    })
    .slice(0, maxAlerts);

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!containerRef.current) return;

    const alerts = Array.from(
      containerRef.current.querySelectorAll('[role="alert"]')
    ) as HTMLElement[];

    const currentIndex = alerts.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % alerts.length;
        alerts[nextIndex]?.focus();
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex <= 0 ? alerts.length - 1 : currentIndex - 1;
        alerts[prevIndex]?.focus();
        break;
      
      case 'Home':
        event.preventDefault();
        alerts[0]?.focus();
        break;
      
      case 'End':
        event.preventDefault();
        alerts[alerts.length - 1]?.focus();
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`
        fixed z-50 left-4 right-4 max-w-md mx-auto space-y-2
        ${position === 'top' ? 'top-4' : 'bottom-4'}
        ${className}
      `}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Medical alerts"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {sortedAlerts.map((alert) => (
          <AlertBanner
            key={alert.id}
            alert={alert}
            onDismiss={onDismiss}
            enableVoiceOver={enableVoiceOver}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AlertBanner;
