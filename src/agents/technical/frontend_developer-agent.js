/**
 * Frontend Developer Agent
 * Especializado en: React, TypeScript, CSS, Web Performance
 */

import { BaseTechnicalAgent } from './base-agent';

export class FrontendDeveloperAgent extends BaseTechnicalAgent {
  /**
   * Realiza un análisis exhaustivo en TSX para frontend moderno
   */
  async analyzeModernFrontendCode(code: string, language: string = 'typescript') {
    const analysis = await this.analyzeCode(code, language);

    // Integración y recomendaciones específicas de Next.js
    if (code.includes('getStaticProps') || code.includes('getServerSideProps')) {
      analysis.seniorInsights.push('Uso correcto de funciones de datos Next.js');
    } else {
      analysis.seniorInsights.push('Recomendación: Usar getStaticProps o getServerSideProps para gestión de datos.');
    }

    // Verificar uso de hook useRouter de Next.js
    if (!code.includes('useRouter')) {
      analysis.seniorInsights.push('Recomendación: Usar hook useRouter de Next.js para navegación y rutas.');
    }

    // Verificación específica de TSX
    if (language.includes('typescript') && !code.includes('<React.Fragment>')) {
      analysis.seniorInsights.push('Para mejor semántica, considerar usar React.Fragment en componentes contenedores.');
    }

    return analysis;
  }
  constructor() {
    super('frontend_developer', {
  "name": "Frontend Developer Agent",
  "specialization": "React, TypeScript, CSS, Web Performance",
  "apis": {
    "mdn": "https://developer.mozilla.org/en-US/search.json",
    "caniuse": "https://caniuse.com/api/",
    "npm": "https://registry.npmjs.org/",
    "bundlephobia": "https://bundlephobia.com/api/",
    "lighthouse": "internal",
    "webpagetest": "https://www.webpagetest.org/api/"
  },
  "knowledge_areas": [
    "React",
    "Vue",
    "Angular",
    "TypeScript",
    "CSS",
    "HTML",
    "Web Performance",
    "Accessibility",
    "SEO",
    "PWA",
    "Testing",
    "Build Tools",
    "State Management"
  ]
});
  }
  
  async analyzeCode(code, language) {
    // Análisis específico para React, TypeScript, CSS, Web Performance
    const baseAnalysis = await super.analyzeCode(code, language);
    
    // Análisis adicional específico del rol
    const specializedAnalysis = await this.performSpecializedAnalysis(code, language);

    // Profesionales de alto nivel
    const seniorInsights = await this.performSeniorAnalysis(code, language);
    
    return {
      ...baseAnalysis,
      specialized: specializedAnalysis,
      seniorInsights
    };
  }

  async performSeniorAnalysis(code, language) {
    const insights = [];

    // Detectar herramientas necesarias
    if (!code.includes('webpack') && !code.includes('vite')) {
      insights.push('Recomendación: Evaluar uso de Webpack o Vite para optimizar el bundle.');
    }

    // Recomendaciones de compatibilidad
    if (code.includes('fetch') && !code.includes('polyfill')) {
      insights.push('Considerar agregar polyfills para soportar navegadores más antiguos');
    }
    
    // Identificación de excesos
    if (code.match(/console\.log/g)?.length > 3) {
      insights.push('Exceso de console.log puede afectar performance. Recomendación: Limitar uso en producción.');
    }

    // Herramientas adicionales
    if (!code.includes('dotenv')) {
      insights.push('Recomendación: Usar dotenv para manejar variables de entorno de manera segura.');
    }

    // Check TypeScript usage
    if (!language.includes('typescript')) {
      insights.push('Migrar a TypeScript para beneficios de tipado y mejores prácticas.');
    }

    return insights;
  }
  
  async performSpecializedAnalysis(code, language) {
    const analysis = {
      role: 'frontend_developer',
      specialization: 'React, TypeScript, CSS, Web Performance',
      insights: []
    };
    
    // Análisis específico según el rol
    switch ('frontend_developer') {
      case 'backend_developer':
        analysis.insights = await this.analyzeBackendCode(code, language);
        break;
      case 'frontend_developer':
        analysis.insights = await this.analyzeFrontendCode(code, language);
        break;
      case 'devops_engineer':
        analysis.insights = await this.analyzeDevOpsCode(code, language);
        break;
      case 'qa_specialist':
        analysis.insights = await this.analyzeQACode(code, language);
        break;
      case 'security_compliance':
        analysis.insights = await this.analyzeSecurityCode(code, language);
        break;
      case 'data_engineer':
        analysis.insights = await this.analyzeDataCode(code, language);
        break;
    }
    
    return analysis;
  }
  
  async analyzeBackendCode(code, language) {
    const insights = [];
    
    // Verificar patrones de backend
    if (code.includes('app.get') || code.includes('app.post')) {
      insights.push('Detectado framework web (Express.js)');
    }
    
    if (code.includes('mongoose') || code.includes('sequelize')) {
      insights.push('Detectado ORM/ODM para base de datos');
    }
    
    if (code.includes('bcrypt') || code.includes('jsonwebtoken')) {
      insights.push('Detectado manejo de autenticación');
    }
    
    return insights;
  }
  
  async analyzeFrontendCode(code, language) {
    const insights = [];
    
    // Verificar patrones de frontend
    if (code.includes('useState') || code.includes('useEffect')) {
      insights.push('Detectado React Hooks');
    }
    
    if (code.includes('document.querySelector') || code.includes('addEventListener')) {
      insights.push('Detectado manipulación del DOM');
    }
    
    if (code.includes('fetch') || code.includes('axios')) {
      insights.push('Detectado llamadas a APIs');
    }
    
    return insights;
  }
  
  async analyzeDevOpsCode(code, language) {
    const insights = [];
    
    // Verificar patrones de DevOps
    if (code.includes('docker') || code.includes('Dockerfile')) {
      insights.push('Detectado configuración de Docker');
    }
    
    if (code.includes('kubernetes') || code.includes('kubectl')) {
      insights.push('Detectado configuración de Kubernetes');
    }
    
    if (code.includes('github') || code.includes('gitlab')) {
      insights.push('Detectado integración con Git');
    }
    
    return insights;
  }
  
  async analyzeQACode(code, language) {
    const insights = [];
    
    // Verificar patrones de QA
    if (code.includes('describe') || code.includes('it(')) {
      insights.push('Detectado framework de testing');
    }
    
    if (code.includes('cy.') || code.includes('cypress')) {
      insights.push('Detectado Cypress para E2E testing');
    }
    
    if (code.includes('expect') || code.includes('assert')) {
      insights.push('Detectado assertions de testing');
    }
    
    return insights;
  }
  
  async analyzeSecurityCode(code, language) {
    const insights = [];
    
    // Verificar patrones de seguridad
    if (code.includes('bcrypt') || code.includes('argon2')) {
      insights.push('Detectado hashing seguro de contraseñas');
    }
    
    if (code.includes('helmet') || code.includes('cors')) {
      insights.push('Detectado middleware de seguridad');
    }
    
    if (code.includes('jwt') || code.includes('oauth')) {
      insights.push('Detectado autenticación JWT/OAuth');
    }
    
    return insights;
  }
  
  async analyzeDataCode(code, language) {
    const insights = [];
    
    // Verificar patrones de data engineering
    if (code.includes('pandas') || code.includes('numpy')) {
      insights.push('Detectado procesamiento de datos con Python');
    }
    
    if (code.includes('tensorflow') || code.includes('pytorch')) {
      insights.push('Detectado machine learning');
    }
    
    if (code.includes('sql') || code.includes('query')) {
      insights.push('Detectado consultas a base de datos');
    }
    
    return insights;
  }
  
  async getSpecializedRecommendations(context) {
    const recommendations = await super.getRecommendations(context);
    
    // Añadir recomendaciones específicas del rol
    const specializedRecommendations = await this.getRoleSpecificRecommendations(context);
    
    return [...recommendations, ...specializedRecommendations];
  }
  
  async getRoleSpecificRecommendations(context) {
    const recommendations = [];
    
    switch ('frontend_developer') {
      case 'backend_developer':
        recommendations.push(
          'Implementar validación de entrada con Joi o Yup',
          'Configurar logging estructurado',
          'Implementar rate limiting',
          'Configurar monitoreo de performance'
        );
        break;
      case 'frontend_developer':
        recommendations.push(
          'Implementar lazy loading de componentes',
          'Optimizar bundle size con code splitting',
          'Implementar error boundaries',
          'Configurar PWA features'
        );
        break;
      case 'devops_engineer':
        recommendations.push(
          'Configurar CI/CD pipeline',
          'Implementar infrastructure as code',
          'Configurar monitoreo y alertas',
          'Implementar backup automático'
        );
        break;
      case 'qa_specialist':
        recommendations.push(
          'Implementar tests unitarios',
          'Configurar tests de integración',
          'Implementar tests de performance',
          'Configurar tests de accesibilidad'
        );
        break;
      case 'security_compliance':
        recommendations.push(
          'Implementar auditoría de seguridad',
          'Configurar escaneo de vulnerabilidades',
          'Implementar encriptación de datos',
          'Configurar logs de auditoría'
        );
        break;
      case 'data_engineer':
        recommendations.push(
          'Implementar ETL pipelines',
          'Configurar data quality checks',
          'Implementar data lineage',
          'Configurar data governance'
        );
        break;
    }
    
    return recommendations.map(rec => ({
      type: 'role_specific',
      recommendation: rec,
      priority: 'medium'
    }));
  }
}
