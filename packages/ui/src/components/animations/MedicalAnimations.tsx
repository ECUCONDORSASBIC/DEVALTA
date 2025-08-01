/**
 * 🎬 MEDICAL ANIMATIONS SYSTEM - ALTAMEDICA
 * Optimized animations for medical interfaces with accessibility and performance focus
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Type compatibility for React 19
type ReactNode = React.ReactNode;

// Animation variants for different medical contexts
const MEDICAL_ANIMATIONS = {
  // Fade in animations
  fadeIn: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.1
      }
    }
  },

  // Slide animations
  slideInLeft: {
    hidden: { x: -50, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  },

  slideInRight: {
    hidden: { x: 50, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  },

  // Scale animations
  scaleIn: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  },

  // Medical-specific animations
  heartbeat: {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.05, 1],
      transition: { 
        duration: 1.2, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }
    }
  },

  pulse: {
    initial: { opacity: 0.6 },
    animate: { 
      opacity: [0.6, 1, 0.6],
      transition: { 
        duration: 2, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }
    }
  },

  breathing: {
    initial: { scale: 1, opacity: 0.8 },
    animate: { 
      scale: [1, 1.02, 1],
      opacity: [0.8, 1, 0.8],
      transition: { 
        duration: 3, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }
    }
  },

  // Loading animations
  loading: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  },

  // Success/Error animations
  success: {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 15 
      }
    }
  },

  error: {
    initial: { x: -20, opacity: 0 },
    animate: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }
    }
  }
};

// Performance-aware animation configuration
interface AnimationConfig {
  enabled: boolean;
  reducedMotion: boolean;
  duration: number;
  delay: number;
  stagger: number;
}

// Hook for performance-aware animations
export const useMedicalAnimation = (config: Partial<AnimationConfig> = {}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Check for low performance devices
    const checkPerformance = () => {
      const memory = (performance as any).memory;
      const isLow = memory && memory.usedJSHeapSize > 50 * 1024 * 1024; // 50MB
      setIsLowPerformance(isLow);
    };

    checkPerformance();

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const defaultConfig: AnimationConfig = {
    enabled: !prefersReducedMotion && !isLowPerformance,
    reducedMotion: prefersReducedMotion,
    duration: isLowPerformance ? 0.3 : 0.5,
    delay: 0,
    stagger: isLowPerformance ? 0.05 : 0.1
  };

  return { ...defaultConfig, ...config };
};

// Medical Fade In Component
export const MedicalFadeIn: React.FC<{
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}> = ({ children, delay = 0, duration = 0.6, direction = 'up', className = '' }) => {
  const config = useMedicalAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const variants = useMemo(() => {
    const baseVariants: any = {
      hidden: { opacity: 0 },
      visible: { 
        opacity: 1,
        transition: { 
          duration: config.enabled ? duration : 0,
          delay: config.enabled ? delay : 0,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }
    };

    if (direction === 'up') {
      baseVariants.hidden.y = 20;
      baseVariants.visible.y = 0;
    } else if (direction === 'down') {
      baseVariants.hidden.y = -20;
      baseVariants.visible.y = 0;
    } else if (direction === 'left') {
      baseVariants.hidden.x = 20;
      baseVariants.visible.x = 0;
    } else if (direction === 'right') {
      baseVariants.hidden.x = -20;
      baseVariants.visible.x = 0;
    }

    return baseVariants;
  }, [direction, delay, duration, config.enabled]);

  if (!config.enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Medical Stagger Container
export const MedicalStaggerContainer: React.FC<{
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}> = ({ children, staggerDelay = 0.1, className = '' }) => {
  const config = useMedicalAnimation();

  if (!config.enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={MEDICAL_ANIMATIONS.fadeIn}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { 
              opacity: 1, 
              y: 0,
              transition: { 
                delay: index * staggerDelay,
                duration: 0.5
              }
            }
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Medical Loading Animation
export const MedicalLoading: React.FC<{
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}> = ({ size = 'medium', color = '#3B82F6', className = '' }) => {
  const config = useMedicalAnimation();
  const sizeMap = { small: 20, medium: 32, large: 48 };

  if (!config.enabled) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div 
          className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"
          style={{ width: sizeMap[size], height: sizeMap[size] }}
        />
      </div>
    );
  }

  return (
    <motion.div
      className={`flex items-center justify-center ${className}`}
      variants={MEDICAL_ANIMATIONS.loading}
      initial="initial"
      animate="animate"
    >
      <motion.div
        className="rounded-full border-2 border-gray-300 border-t-blue-500"
        style={{ width: sizeMap[size], height: sizeMap[size] }}
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      />
    </motion.div>
  );
};

// Medical Success Animation
export const MedicalSuccess: React.FC<{
  children: ReactNode;
  show: boolean;
  onComplete?: () => void;
  className?: string;
}> = ({ children, show, onComplete, className = '' }) => {
  const config = useMedicalAnimation();

  if (!config.enabled) {
    return show ? <div className={className}>{children}</div> : null;
  }

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <motion.div
          className={className}
          variants={MEDICAL_ANIMATIONS.success}
          initial="initial"
          animate="animate"
          exit="initial"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Medical Error Animation
export const MedicalError: React.FC<{
  children: ReactNode;
  show: boolean;
  onComplete?: () => void;
  className?: string;
}> = ({ children, show, onComplete, className = '' }) => {
  const config = useMedicalAnimation();

  if (!config.enabled) {
    return show ? <div className={className}>{children}</div> : null;
  }

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <motion.div
          className={className}
          variants={MEDICAL_ANIMATIONS.error}
          initial="initial"
          animate="animate"
          exit="initial"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Medical Heartbeat Animation
export const MedicalHeartbeat: React.FC<{
  children: ReactNode;
  active?: boolean;
  className?: string;
}> = ({ children, active = true, className = '' }) => {
  const config = useMedicalAnimation();

  if (!config.enabled || !active) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={MEDICAL_ANIMATIONS.heartbeat}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
};

// Medical Pulse Animation
export const MedicalPulse: React.FC<{
  children: ReactNode;
  active?: boolean;
  className?: string;
}> = ({ children, active = true, className = '' }) => {
  const config = useMedicalAnimation();

  if (!config.enabled || !active) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={MEDICAL_ANIMATIONS.pulse}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
};

// Medical Breathing Animation
export const MedicalBreathing: React.FC<{
  children: ReactNode;
  active?: boolean;
  className?: string;
}> = ({ children, active = true, className = '' }) => {
  const config = useMedicalAnimation();

  if (!config.enabled || !active) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={MEDICAL_ANIMATIONS.breathing}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
};

// Medical Progress Bar
export const MedicalProgressBar: React.FC<{
  progress: number;
  max?: number;
  color?: string;
  className?: string;
  animated?: boolean;
}> = ({ progress, max = 100, color = '#3B82F6', className = '', animated = true }) => {
  const config = useMedicalAnimation();
  const percentage = Math.min(Math.max((progress / max) * 100, 0), 100);

  if (!config.enabled || !animated) {
    return (
      <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
        <div 
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    );
  }

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <motion.div
        className="h-2 rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut",
          delay: 0.2
        }}
      />
    </div>
  );
};

// Medical Counter
export const MedicalCounter: React.FC<{
  value: number;
  duration?: number;
  className?: string;
  format?: (value: number) => string;
}> = ({ value, duration = 1, className = '', format = (v) => v.toString() }) => {
  const config = useMedicalAnimation();
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const displayText = useTransform(rounded, (latest) => format(latest));

  useEffect(() => {
    if (config.enabled) {
      const animation = count.animate(value, {
        duration: duration,
        ease: "easeOut"
      });
      return animation.stop;
    } else {
      count.set(value);
    }
  }, [value, duration, config.enabled, count]);

  return (
    <motion.span className={className}>
      {displayText}
    </motion.span>
  );
};

// Medical Page Transition
export const MedicalPageTransition: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const config = useMedicalAnimation();

  if (!config.enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.3, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.div>
  );
};

// Export all animations
export const MedicalAnimations = {
  FadeIn: MedicalFadeIn,
  StaggerContainer: MedicalStaggerContainer,
  Loading: MedicalLoading,
  Success: MedicalSuccess,
  Error: MedicalError,
  Heartbeat: MedicalHeartbeat,
  Pulse: MedicalPulse,
  Breathing: MedicalBreathing,
  ProgressBar: MedicalProgressBar,
  Counter: MedicalCounter,
  PageTransition: MedicalPageTransition,
  useMedicalAnimation
};

export default MedicalAnimations; 