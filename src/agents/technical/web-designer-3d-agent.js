/**
 * WebDesigner3DAgent
 * Especializado en: Three.js, React-Three-Fiber, WebGL, Medical UX
 * Enfocado en usabilidad y accesibilidad en contextos médicos
 */

import { BaseTechnicalAgent } from './base-agent.js';
import fs from 'fs';
import path from 'path';

export class WebDesigner3DAgent extends BaseTechnicalAgent {
  constructor() {
    super('web_designer_3d', {
      name: "WebDesigner3D Agent",
      specialization: "Three.js, React-Three-Fiber, WebGL, Medical UX",
      apis: {
        three_js_docs: "https://threejs.org/docs/",
        react_three_fiber: "https://docs.pmnd.rs/react-three-fiber/",
        webgl_reference: "https://www.khronos.org/webgl/",
        w3c_accessibility: "https://www.w3.org/WAI/",
        iso_9241: "ISO 9241-171 accessibility guidelines",
        medical_ux: "internal"
      },
      knowledge_areas: [
        "Three.js",
        "React-Three-Fiber",
        "WebGL",
        "Medical UX",
        "3D Graphics",
        "Accessibility",
        "Performance Optimization",
        "Shader Programming",
        "Medical Visualization",
        "Patient Experience",
        "Color Theory for Medical",
        "Bilingual UX"
      ]
    });
  }

  /**
   * Analiza usabilidad y accesibilidad específica para contextos médicos
   * @param {string} code - Código a analizar
   * @returns {Object} Análisis de UX médico en 3D
   */
  async analyzeMedical3DUX(code) {
    const analysis = {
      accessibility: await this.analyzeMedicalAccessibility(code),
      usability: await this.analyzeMedicalUsability(code),
      patientExperience: await this.analyzePatientExperience(code),
      compliance: await this.checkMedicalCompliance(code),
      stressReduction: await this.analyzeStressReductionFeatures(code),
      colorSchemes: await this.analyzeColorCompliance(code),
      interactionAreas: await this.analyzeClickableAreas(code),
      bilingualSupport: await this.analyzeBilingualSupport(code)
    };

    return analysis;
  }

  /**
   * Sugiere assets 3D apropiados para el contexto médico
   * @param {Object} context - Contexto de la aplicación médica
   * @returns {Object} Recomendaciones de modelos y texturas
   */
  async suggest3DAssets(context) {
    const suggestions = {
      models: await this.suggestMedicalModels(context),
      textures: await this.suggestMedicalTextures(context),
      animations: await this.suggestMedicalAnimations(context),
      lighting: await this.suggestMedicalLighting(context),
      environments: await this.suggestMedicalEnvironments(context)
    };

    return suggestions;
  }

  /**
   * Override del método performSpecializedAnalysis para incluir análisis 3D
   * @param {string} code - Código a analizar
   * @param {string} language - Lenguaje de programación
   * @returns {Object} Análisis especializado en 3D
   */
  async performSpecializedAnalysis(code, language) {
    const analysis = {
      role: 'web_designer_3d',
      specialization: 'Three.js, React-Three-Fiber, WebGL, Medical UX',
      insights: [],
      performance3D: await this.analyze3DPerformance(code),
      shaderComplexity: await this.analyzeShaderComplexity(code),
      drawCalls: await this.analyzeDrawCalls(code),
      geometryOptimization: await this.analyzeGeometryOptimization(code),
      medicalUXCompliance: await this.analyzeMedical3DUX(code)
    };

    // Análisis específico de Three.js
    analysis.insights.push(...await this.analyzeThreeJSCode(code));
    
    // Análisis específico de React-Three-Fiber
    analysis.insights.push(...await this.analyzeR3FCode(code));
    
    // Análisis específico de WebGL
    analysis.insights.push(...await this.analyzeWebGLCode(code));
    
    // Análisis específico de UX médico
    analysis.insights.push(...await this.analyzeMedicalUXPatterns(code));

    return analysis;
  }

  /**
   * Analiza performance específica de 3D
   * @param {string} code - Código a analizar
   * @returns {Object} Métricas de performance 3D
   */
  async analyze3DPerformance(code) {
    const performance = {
      drawCallsEstimate: 0,
      textureMemoryUsage: 0,
      geometryComplexity: 0,
      shaderComplexity: 0,
      recommendations: []
    };

    // Analizar draw calls potenciales
    const meshMatches = code.match(/new\s+THREE\.Mesh/g) || [];
    performance.drawCallsEstimate = meshMatches.length;

    if (performance.drawCallsEstimate > 100) {
      performance.recommendations.push('Alto número de draw calls detectado. Considerar instancing o LOD (Level of Detail)');
    }

    // Analizar uso de texturas
    const textureMatches = code.match(/new\s+THREE\.TextureLoader/g) || [];
    performance.textureMemoryUsage = textureMatches.length;

    if (performance.textureMemoryUsage > 20) {
      performance.recommendations.push('Alto uso de texturas. Considerar atlas de texturas o compresión');
    }

    // Analizar complejidad de geometría
    const geometryMatches = code.match(/new\s+THREE\.(Sphere|Box|Cylinder|Plane)Geometry\([^)]*\)/g) || [];
    geometryMatches.forEach(match => {
      const params = match.match(/\(([^)]*)\)/);
      if (params && params[1]) {
        const paramCount = params[1].split(',').length;
        performance.geometryComplexity += paramCount;
      }
    });

    if (performance.geometryComplexity > 50) {
      performance.recommendations.push('Geometrías complejas detectadas. Optimizar subdivisiones para el contexto médico');
    }

    return performance;
  }

  /**
   * Analiza complejidad de shaders
   * @param {string} code - Código a analizar
   * @returns {Object} Análisis de complejidad de shaders
   */
  async analyzeShaderComplexity(code) {
    const shaderAnalysis = {
      vertexShaders: 0,
      fragmentShaders: 0,
      complexity: 'low',
      recommendations: []
    };

    // Detectar shaders
    const vertexMatches = code.match(/vertexShader\s*:/g) || [];
    const fragmentMatches = code.match(/fragmentShader\s*:/g) || [];
    
    shaderAnalysis.vertexShaders = vertexMatches.length;
    shaderAnalysis.fragmentShaders = fragmentMatches.length;

    // Analizar complejidad basada en operaciones
    const complexOperations = [
      /sin\s*\(/g, /cos\s*\(/g, /tan\s*\(/g,
      /pow\s*\(/g, /sqrt\s*\(/g, /exp\s*\(/g,
      /for\s*\(/g, /while\s*\(/g
    ];

    let totalComplexity = 0;
    complexOperations.forEach(operation => {
      const matches = code.match(operation) || [];
      totalComplexity += matches.length;
    });

    if (totalComplexity > 20) {
      shaderAnalysis.complexity = 'high';
      shaderAnalysis.recommendations.push('Shaders complejos detectados. Optimizar para dispositivos médicos de menor potencia');
    } else if (totalComplexity > 10) {
      shaderAnalysis.complexity = 'medium';
      shaderAnalysis.recommendations.push('Complejidad media en shaders. Monitorear performance en dispositivos objetivo');
    }

    return shaderAnalysis;
  }

  /**
   * Analiza draw calls para optimización
   * @param {string} code - Código a analizar
   * @returns {Object} Análisis de draw calls
   */
  async analyzeDrawCalls(code) {
    const drawCallAnalysis = {
      estimatedCalls: 0,
      batchingOpportunities: [],
      instancingOpportunities: [],
      recommendations: []
    };

    // Contar objetos que generan draw calls
    const meshes = code.match(/new\s+THREE\.Mesh/g) || [];
    const sprites = code.match(/new\s+THREE\.Sprite/g) || [];
    const lines = code.match(/new\s+THREE\.Line/g) || [];
    
    drawCallAnalysis.estimatedCalls = meshes.length + sprites.length + lines.length;

    // Detectar oportunidades de batching
    if (code.includes('identical geometry') || code.includes('same material')) {
      drawCallAnalysis.batchingOpportunities.push('Geometrías idénticas detectadas - candidatas para batching');
    }

    // Detectar oportunidades de instancing
    const instanceMatches = code.match(/for.*new\s+THREE\.Mesh/g) || [];
    if (instanceMatches.length > 0) {
      drawCallAnalysis.instancingOpportunities.push('Objetos repetidos en loops - candidatos para InstancedMesh');
    }

    // Recomendaciones específicas para contexto médico
    if (drawCallAnalysis.estimatedCalls > 50) {
      drawCallAnalysis.recommendations.push('Para aplicaciones médicas, mantener draw calls bajo 100 para fluidez en tablets médicas');
    }

    return drawCallAnalysis;
  }

  /**
   * Analiza optimización de geometría
   * @param {string} code - Código a analizar
   * @returns {Object} Análisis de optimización de geometría
   */
  async analyzeGeometryOptimization(code) {
    const geoAnalysis = {
      geometryTypes: [],
      optimizationOpportunities: [],
      recommendations: []
    };

    // Detectar tipos de geometría usados
    const geometryTypes = [
      'SphereGeometry', 'BoxGeometry', 'CylinderGeometry', 
      'PlaneGeometry', 'RingGeometry', 'TorusGeometry',
      'BufferGeometry', 'CustomGeometry'
    ];

    geometryTypes.forEach(type => {
      const regex = new RegExp(`THREE\\.${type}`, 'g');
      const matches = code.match(regex) || [];
      if (matches.length > 0) {
        geoAnalysis.geometryTypes.push({ type, count: matches.length });
      }
    });

    // Detectar geometrías no optimizadas
    if (code.includes('Geometry') && !code.includes('BufferGeometry')) {
      geoAnalysis.optimizationOpportunities.push('Migrar de Geometry a BufferGeometry para mejor performance');
    }

    // Recomendaciones para contexto médico
    geoAnalysis.recommendations.push('Usar geometrías de baja resolución para visualización en tiempo real de datos médicos');
    geoAnalysis.recommendations.push('Implementar LOD (Level of Detail) para modelos anatómicos complejos');

    return geoAnalysis;
  }

  /**
   * Analiza código específico de Three.js
   * @param {string} code - Código a analizar
   * @returns {Array} Insights sobre Three.js
   */
  async analyzeThreeJSCode(code) {
    const insights = [];

    // Verificar patrones de Three.js
    if (code.includes('THREE.Scene')) {
      insights.push('Detectado uso de Three.js Scene');
    }

    if (code.includes('THREE.WebGLRenderer')) {
      insights.push('Detectado WebGL renderer - Óptimo para aplicaciones médicas 3D');
    }

    if (code.includes('THREE.PerspectiveCamera')) {
      insights.push('Detectado cámara perspectiva - Verificar FOV apropiado para visualización médica');
    }

    if (!code.includes('dispose')) {
      insights.push('CRÍTICO: Implementar dispose() para gestión de memoria en aplicaciones médicas de larga duración');
    }

    return insights;
  }

  /**
   * Analiza código específico de React-Three-Fiber
   * @param {string} code - Código a analizar
   * @returns {Array} Insights sobre R3F
   */
  async analyzeR3FCode(code) {
    const insights = [];

    if (code.includes('<Canvas')) {
      insights.push('Detectado React-Three-Fiber Canvas');
    }

    if (code.includes('useFrame')) {
      insights.push('Detectado useFrame hook - Verificar performance en loops de animación médica');
    }

    if (code.includes('useLoader')) {
      insights.push('Detectado useLoader - Implementar loading states para UX médica');
    }

    if (code.includes('Suspense')) {
      insights.push('Excelente: Uso de Suspense para carga asíncrona de modelos médicos');
    }

    return insights;
  }

  /**
   * Analiza código WebGL específico
   * @param {string} code - Código a analizar
   * @returns {Array} Insights sobre WebGL
   */
  async analyzeWebGLCode(code) {
    const insights = [];

    if (code.includes('gl.')) {
      insights.push('Detectado uso directo de WebGL API');
    }

    if (code.includes('uniform') || code.includes('attribute')) {
      insights.push('Detectado uso de shaders customizados');
    }

    if (code.includes('gl.DEPTH_TEST')) {
      insights.push('Excelente: Depth testing habilitado para renderizado 3D médico preciso');
    }

    return insights;
  }

  /**
   * Analiza patrones de UX médico
   * @param {string} code - Código a analizar
   * @returns {Array} Insights sobre UX médico
   */
  async analyzeMedicalUXPatterns(code) {
    const insights = [];

    // Verificar tamaños de áreas clickeables
    if (code.includes('44px') || code.includes('48px')) {
      insights.push('Excelente: Áreas de click de tamaño apropiado para contexto médico (mínimo 44px)');
    }

    // Verificar contraste de colores
    if (code.includes('#') && code.includes('color')) {
      insights.push('Verificar que los colores cumplan con ISO 9241-171 para accesibilidad médica');
    }

    // Verificar soporte bilingüe
    if (code.includes('i18n') || code.includes('translate')) {
      insights.push('Excelente: Soporte para múltiples idiomas detectado');
    }

    return insights;
  }

  /**
   * Analiza accesibilidad específica para contexto médico
   * @param {string} code - Código a analizar
   * @returns {Object} Análisis de accesibilidad médica
   */
  async analyzeMedicalAccessibility(code) {
    const accessibility = {
      keyboardNavigation: false,
      screenReaderSupport: false,
      colorContrastCompliance: false,
      focusManagement: false,
      recommendations: []
    };

    // Verificar navegación por teclado
    if (code.includes('onKeyDown') || code.includes('tabIndex')) {
      accessibility.keyboardNavigation = true;
    } else {
      accessibility.recommendations.push('Implementar navegación por teclado para profesionales médicos con discapacidades');
    }

    // Verificar soporte para lectores de pantalla
    if (code.includes('aria-') || code.includes('role=')) {
      accessibility.screenReaderSupport = true;
    } else {
      accessibility.recommendations.push('Agregar atributos ARIA para compatibilidad con lectores de pantalla');
    }

    // Verificar gestión de foco
    if (code.includes('focus()') || code.includes('blur()')) {
      accessibility.focusManagement = true;
    } else {
      accessibility.recommendations.push('Implementar gestión de foco para navegación 3D médica');
    }

    return accessibility;
  }

  /**
   * Analiza usabilidad específica para contexto médico
   * @param {string} code - Código a analizar
   * @returns {Object} Análisis de usabilidad médica
   */
  async analyzeMedicalUsability(code) {
    const usability = {
      responseTime: 'unknown',
      errorHandling: false,
      loadingStates: false,
      undoFunctionality: false,
      recommendations: []
    };

    // Verificar manejo de errores
    if (code.includes('try') && code.includes('catch')) {
      usability.errorHandling = true;
    } else {
      usability.recommendations.push('Implementar manejo robusto de errores para aplicaciones médicas críticas');
    }

    // Verificar estados de carga
    if (code.includes('loading') || code.includes('spinner')) {
      usability.loadingStates = true;
    } else {
      usability.recommendations.push('Implementar indicadores de carga para modelos 3D médicos');
    }

    // Verificar funcionalidad de deshacer
    if (code.includes('undo') || code.includes('history')) {
      usability.undoFunctionality = true;
    } else {
      usability.recommendations.push('Implementar funcionalidad de deshacer para acciones médicas críticas');
    }

    return usability;
  }

  /**
   * Analiza experiencia del paciente
   * @param {string} code - Código a analizar
   * @returns {Object} Análisis de experiencia del paciente
   */
  async analyzePatientExperience(code) {
    const patientExperience = {
      calmingElements: false,
      clearInstructions: false,
      progressIndicators: false,
      supportContact: false,
      recommendations: []
    };

    // Verificar elementos calmantes
    if (code.includes('calm') || code.includes('soothing') || code.includes('gentle')) {
      patientExperience.calmingElements = true;
    } else {
      patientExperience.recommendations.push('Incorporar elementos visuales calmantes para reducir ansiedad del paciente');
    }

    // Verificar indicadores de progreso
    if (code.includes('progress') || code.includes('step')) {
      patientExperience.progressIndicators = true;
    } else {
      patientExperience.recommendations.push('Agregar indicadores de progreso claros para procedimientos médicos');
    }

    return patientExperience;
  }

  /**
   * Verifica cumplimiento con estándares médicos
   * @param {string} code - Código a analizar
   * @returns {Object} Análisis de cumplimiento médico
   */
  async checkMedicalCompliance(code) {
    const compliance = {
      iso9241: false,
      hipaaConsiderations: false,
      medicalDeviceCompatibility: false,
      recommendations: []
    };

    // Verificar consideraciones de privacidad
    if (code.includes('encrypt') || code.includes('secure')) {
      compliance.hipaaConsiderations = true;
    } else {
      compliance.recommendations.push('Implementar consideraciones de seguridad para datos médicos (HIPAA)');
    }

    // Verificar compatibilidad con dispositivos médicos
    if (code.includes('touch') && code.includes('pointer')) {
      compliance.medicalDeviceCompatibility = true;
    } else {
      compliance.recommendations.push('Optimizar para dispositivos táctiles usados en entornos médicos');
    }

    return compliance;
  }

  /**
   * Analiza características de reducción de estrés
   * @param {string} code - Código a analizar
   * @returns {Object} Análisis de reducción de estrés
   */
  async analyzeStressReductionFeatures(code) {
    const stressReduction = {
      softAnimations: false,
      calming_colors: false,
      gentleTransitions: false,
      recommendations: []
    };

    // Verificar animaciones suaves
    if (code.includes('ease') || code.includes('smooth')) {
      stressReduction.softAnimations = true;
    } else {
      stressReduction.recommendations.push('Implementar animaciones suaves para reducir estrés del paciente');
    }

    // Verificar transiciones gentiles
    if (code.includes('transition') && code.includes('duration')) {
      stressReduction.gentleTransitions = true;
    } else {
      stressReduction.recommendations.push('Agregar transiciones gentiles entre estados de la aplicación');
    }

    return stressReduction;
  }

  /**
   * Analiza cumplimiento de esquemas de color
   * @param {string} code - Código a analizar
   * @returns {Object} Análisis de cumplimiento de colores
   */
  async analyzeColorCompliance(code) {
    const colorCompliance = {
      iso9241Compliant: false,
      highContrast: false,
      colorBlindFriendly: false,
      medicalAppropriate: false,
      recommendations: []
    };

    // Verificar colores apropiados para medicina
    const medicalColors = ['#0066cc', '#4CAF50', '#2196F3', '#ffffff', '#f5f5f5'];
    const hasAppropriateColors = medicalColors.some(color => code.includes(color));
    
    if (hasAppropriateColors) {
      colorCompliance.medicalAppropriate = true;
    } else {
      colorCompliance.recommendations.push('Usar esquemas de color apropiados para entornos médicos (azules, verdes suaves)');
    }

    // Verificar alto contraste
    if (code.includes('contrast') || code.includes('#ffffff') && code.includes('#000000')) {
      colorCompliance.highContrast = true;
    } else {
      colorCompliance.recommendations.push('Implementar opción de alto contraste según ISO 9241-171');
    }

    return colorCompliance;
  }

  /**
   * Analiza áreas clickeables
   * @param {string} code - Código a analizar
   * @returns {Object} Análisis de áreas clickeables
   */
  async analyzeClickableAreas(code) {
    const clickableAreas = {
      minimumSize: false,
      touchFriendly: false,
      spacing: false,
      recommendations: []
    };

    // Verificar tamaño mínimo (44px según WCAG)
    if (code.includes('44px') || code.includes('48px') || code.includes('56px')) {
      clickableAreas.minimumSize = true;
    } else {
      clickableAreas.recommendations.push('Asegurar áreas clickeables de mínimo 44px para uso médico');
    }

    // Verificar espaciado adecuado
    if (code.includes('margin') || code.includes('padding')) {
      clickableAreas.spacing = true;
    } else {
      clickableAreas.recommendations.push('Implementar espaciado adecuado entre elementos clickeables');
    }

    return clickableAreas;
  }

  /**
   * Analiza soporte bilingüe
   * @param {string} code - Código a analizar
   * @returns {Object} Análisis de soporte bilingüe
   */
  async analyzeBilingualSupport(code) {
    const bilingualSupport = {
      internationalization: false,
      textDirection: false,
      fontSupport: false,
      recommendations: []
    };

    // Verificar internacionalización
    if (code.includes('i18n') || code.includes('locale') || code.includes('translate')) {
      bilingualSupport.internationalization = true;
    } else {
      bilingualSupport.recommendations.push('Implementar soporte i18n para pacientes multilingües');
    }

    // Verificar dirección de texto
    if (code.includes('rtl') || code.includes('ltr')) {
      bilingualSupport.textDirection = true;
    } else {
      bilingualSupport.recommendations.push('Considerar soporte para idiomas RTL en interfaz médica');
    }

    return bilingualSupport;
  }

  /**
   * Sugiere modelos 3D médicos apropiados
   * @param {Object} context - Contexto de la aplicación
   * @returns {Array} Sugerencias de modelos 3D
   */
  async suggestMedicalModels(context) {
    const modelSuggestions = [];

    if (context.type === 'anatomy') {
      modelSuggestions.push({
        name: 'Human Heart Model',
        format: 'GLTF',
        complexity: 'medium',
        fileSize: '2.5MB',
        medicalAccuracy: 'high',
        source: 'NIH 3D Print Exchange'
      });
    }

    if (context.type === 'surgical') {
      modelSuggestions.push({
        name: 'Surgical Instruments Set',
        format: 'FBX',
        complexity: 'low',
        fileSize: '1.2MB',
        medicalAccuracy: 'high',
        source: 'Medical 3D Models Library'
      });
    }

    return modelSuggestions;
  }

  /**
   * Sugiere texturas médicas apropiadas
   * @param {Object} context - Contexto de la aplicación
   * @returns {Array} Sugerencias de texturas
   */
  async suggestMedicalTextures(context) {
    const textureSuggestions = [];

    if (context.environment === 'hospital') {
      textureSuggestions.push({
        name: 'Medical Grade Steel',
        type: 'PBR Material',
        resolution: '1024x1024',
        format: 'PNG',
        medicalAppropriate: true
      });
    }

    return textureSuggestions;
  }

  /**
   * Sugiere animaciones médicas apropiadas
   * @param {Object} context - Contexto de la aplicación
   * @returns {Array} Sugerencias de animaciones
   */
  async suggestMedicalAnimations(context) {
    const animationSuggestions = [];

    if (context.purpose === 'education') {
      animationSuggestions.push({
        name: 'Heart Beat Cycle',
        duration: '2 seconds',
        type: 'Loop',
        smoothness: 'high',
        medicalAccuracy: 'verified'
      });
    }

    return animationSuggestions;
  }

  /**
   * Sugiere iluminación médica apropiada
   * @param {Object} context - Contexto de la aplicación
   * @returns {Array} Sugerencias de iluminación
   */
  async suggestMedicalLighting(context) {
    const lightingSuggestions = [];

    if (context.environment === 'clinical') {
      lightingSuggestions.push({
        type: 'DirectionalLight',
        intensity: 0.8,
        color: '#ffffff',
        purpose: 'Clinical accuracy'
      });
    }

    return lightingSuggestions;
  }

  /**
   * Sugiere entornos médicos apropiados
   * @param {Object} context - Contexto de la aplicación
   * @returns {Array} Sugerencias de entornos
   */
  async suggestMedicalEnvironments(context) {
    const environmentSuggestions = [];

    if (context.setting === 'patient_room') {
      environmentSuggestions.push({
        name: 'Calm Patient Room',
        lighting: 'soft_ambient',
        colors: ['#f0f8ff', '#e6f3ff'],
        mood: 'calming',
        medicallyAppropriate: true
      });
    }

    return environmentSuggestions;
  }

  /**
   * Obtiene recomendaciones específicas del rol
   * @param {Object} context - Contexto del proyecto
   * @returns {Array} Recomendaciones específicas
   */
  async getRoleSpecificRecommendations(context) {
    const recommendations = [];

    // Recomendaciones de esquemas de color ISO 9241-171
    recommendations.push({
      category: 'Color Schemes',
      recommendation: 'Implementar esquemas de color compatibles con ISO 9241-171',
      priority: 'high',
      implementation: 'Usar colores con ratio de contraste mínimo 4.5:1 para texto normal y 3:1 para texto grande'
    });

    // Recomendaciones de áreas clickeables grandes
    recommendations.push({
      category: 'Interaction Areas',
      recommendation: 'Asegurar áreas clickeables de mínimo 44px x 44px',
      priority: 'high',
      implementation: 'Aplicar CSS: min-width: 44px; min-height: 44px; para todos los elementos interactivos'
    });

    // Recomendaciones de texto bilingüe
    recommendations.push({
      category: 'Bilingual Support',
      recommendation: 'Implementar soporte completo para texto bilingüe',
      priority: 'medium',
      implementation: 'Usar react-i18next o similar para internacionalización completa'
    });

    // Recomendaciones de reducción de estrés del paciente
    recommendations.push({
      category: 'Patient Stress Reduction',
      recommendation: 'Incorporar elementos de diseño que reduzcan el estrés del paciente',
      priority: 'high',
      implementation: 'Usar animaciones suaves, colores calmantes (azules suaves, verdes), y transiciones gentiles'
    });

    // Recomendaciones específicas de 3D médico
    recommendations.push({
      category: '3D Medical Visualization',
      recommendation: 'Optimizar renderizado 3D para precisión médica',
      priority: 'critical',
      implementation: 'Usar geometrías de alta precisión, iluminación realista, y colores anatómicamente correctos'
    });

    return recommendations;
  }
}
