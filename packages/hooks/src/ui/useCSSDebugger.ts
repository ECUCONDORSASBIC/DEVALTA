/**
 * @fileoverview Hook para debugging avanzado de CSS
 * @module @altamedica/hooks/ui
 * @description Hook especializado para análisis de CSS y performance en desarrollo
 */

import { useCallback, useEffect, useState } from 'react';

interface CSSVariableInfo {
  name: string;
  value: string;
  computedValue: string;
  source: string;
  definitionChain: string[];
}

interface CSSDebugInfo {
  variables: CSSVariableInfo[];
  complexProperties: Record<string, any>;
  performanceImpact: {
    heavySelectors: string[];
    repaints: number;
    reflows: number;
  };
}

/**
 * Hook para debugging avanzado de CSS
 * Aprovecha las características de Chrome DevTools para análisis profundo
 */
export const useCSSDebugger = (element?: HTMLElement) => {
  const [debugInfo, setDebugInfo] = useState<CSSDebugInfo | null>(null);
  const [isDebugging, setIsDebugging] = useState(false);

  const analyzeCSSVariables = useCallback((targetElement: HTMLElement): CSSVariableInfo[] => {
    const styles = getComputedStyle(targetElement);
    const variables: CSSVariableInfo[] = [];

    // Obtener todas las custom properties (CSS variables)
    for (let i = 0; i < styles.length; i++) {
      const propertyName = styles[i];
      if (propertyName.startsWith('--')) {
        const value = styles.getPropertyValue(propertyName);
        
        variables.push({
          name: propertyName,
          value: value,
          computedValue: value,
          source: 'computed',
          definitionChain: [propertyName]
        });
      }
    }

    return variables;
  }, []);

  const analyzePropertyValue = useCallback((property: string, value: string) => {
    // Análisis básico de valores complejos
    switch (property) {
      case 'box-shadow':
        return value.split(',').map(shadow => ({
          type: 'shadow',
          values: shadow.trim().split(' ')
        }));
      
      case 'background-image':
        if (value.includes('gradient')) {
          return {
            type: 'gradient',
            gradient: value
          };
        }
        return { type: 'image', url: value };
      
      case 'transform':
        return {
          type: 'transform',
          functions: value.match(/(\w+)\([^)]*\)/g) || []
        };
      
      default:
        return { raw: value };
    }
  }, []);

  const analyzeComplexProperties = useCallback((targetElement: HTMLElement) => {
    const styles = getComputedStyle(targetElement);
    const complexProps: Record<string, any> = {};

    // Propiedades que suelen ser complejas en AltaMedica
    const complexPropertyNames = [
      'background',
      'background-image',
      'box-shadow',
      'transform',
      'filter',
      'clip-path',
      'grid-template',
      'flex'
    ];

    complexPropertyNames.forEach(prop => {
      const value = styles.getPropertyValue(prop);
      if (value && value !== 'none' && value !== 'initial') {
        complexProps[prop] = {
          value,
          breakdown: analyzePropertyValue(prop, value)
        };
      }
    });

    return complexProps;
  }, [analyzePropertyValue]);

  const measurePerformanceImpact = useCallback((targetElement: HTMLElement) => {
    const heavySelectors: string[] = [];
    
    // Detectar selectores que pueden ser pesados
    if (targetElement.classList.length > 5) {
      heavySelectors.push('Demasiadas clases CSS');
    }
    
    const styles = getComputedStyle(targetElement);
    if (styles.position === 'fixed' || styles.position === 'sticky') {
      heavySelectors.push('Posicionamiento complejo');
    }
    
    if (styles.filter && styles.filter !== 'none') {
      heavySelectors.push('Filtros CSS activos');
    }

    if (styles.transform && styles.transform !== 'none') {
      heavySelectors.push('Transformaciones activas');
    }

    return {
      heavySelectors,
      repaints: 0, // En un entorno real, esto requeriría Performance API
      reflows: 0
    };
  }, []);

  const debugElement = useCallback((targetElement?: HTMLElement) => {
    if (!targetElement) return;

    setIsDebugging(true);

    try {
      const variables = analyzeCSSVariables(targetElement);
      const complexProperties = analyzeComplexProperties(targetElement);
      const performanceImpact = measurePerformanceImpact(targetElement);

      setDebugInfo({
        variables,
        complexProperties,
        performanceImpact
      });

      // Log para DevTools con formato mejorado
      if (process.env.NODE_ENV === 'development') {
        console.group('🎨 CSS Debug Info para elemento:', targetElement.tagName);
        console.log('📊 Variables CSS:', variables);
        console.log('🔧 Propiedades complejas:', complexProperties);
        console.log('⚡ Impacto en rendimiento:', performanceImpact);
        console.groupEnd();
      }

    } catch (error) {
      console.error('Error analizando CSS:', error);
    } finally {
      setIsDebugging(false);
    }
  }, [analyzeCSSVariables, analyzeComplexProperties, measurePerformanceImpact]);

  // Auto-debug del elemento cuando cambia
  useEffect(() => {
    if (element) {
      debugElement(element);
    }
  }, [element, debugElement]);

  // Función para debug manual de cualquier elemento
  const debugSelector = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      debugElement(element);
    }
  }, [debugElement]);

  // Función para debug de elementos con problemas de rendimiento
  const findPerformanceIssues = useCallback(() => {
    const issues: Array<{element: HTMLElement, issues: string[]}> = [];
    
    // Buscar elementos problemáticos
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      const element = el as HTMLElement;
      const styles = getComputedStyle(element);
      const elementIssues: string[] = [];

      // Detectar problemas comunes
      if (styles.transform && styles.transform !== 'none') {
        elementIssues.push('Transform activo');
      }
      
      if (styles.filter && styles.filter !== 'none') {
        elementIssues.push('Filtros CSS');
      }
      
      if (styles.position === 'fixed') {
        elementIssues.push('Posición fija');
      }

      if (elementIssues.length > 0) {
        issues.push({ element, issues: elementIssues });
      }
    });

    return issues;
  }, []);

  // Análisis específico para AltaMedica theme
  const analyzeAltamedicaTheme = useCallback(() => {
    const root = document.documentElement;
    debugElement(root);
    
    // Variables específicas de AltaMedica
    const altamedicaVars = debugInfo?.variables.filter(v => 
      v.name.includes('altamedica') || 
      v.name.includes('primary') || 
      v.name.includes('medical')
    );
    
    return altamedicaVars;
  }, [debugElement, debugInfo?.variables]);

  return {
    debugInfo,
    isDebugging,
    debugElement,
    debugSelector,
    findPerformanceIssues,
    analyzeAltamedicaTheme,
    
    // Helpers para DevTools
    logVariables: useCallback(() => {
      if (debugInfo?.variables) {
        console.table(debugInfo.variables);
      }
    }, [debugInfo?.variables]),
    
    logComplexProperties: useCallback(() => {
      if (debugInfo?.complexProperties) {
        console.table(debugInfo.complexProperties);
      }
    }, [debugInfo?.complexProperties])
  };
};