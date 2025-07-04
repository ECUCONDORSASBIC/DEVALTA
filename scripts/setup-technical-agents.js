#!/usr/bin/env node

/**
 * Script de Configuración de Agentes Especializados en Programación
 * Implementa agentes con conocimiento técnico real para Altamedica
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧠 Configurando Agentes Especializados en Programación...\n');

// Configuración de agentes por rol
const AGENT_CONFIGS = {
  backend_developer: {
    name: 'Backend Developer Agent',
    specialization: 'Node.js, TypeScript, APIs, Databases',
    apis: {
      stackoverflow: 'https://api.stackexchange.com/2.3/',
      github: 'https://api.github.com/',
      npm: 'https://registry.npmjs.org/',
      snyk: 'https://api.snyk.io/',
      sonarcloud: 'https://sonarcloud.io/api/',
      codeclimate: 'https://api.codeclimate.com/v1/'
    },
    knowledge_areas: [
      'REST APIs', 'GraphQL', 'Microservices', 'Database Design',
      'Authentication', 'Security', 'Performance', 'Testing',
      'Docker', 'Kubernetes', 'CI/CD', 'Monitoring'
    ]
  },
  
  frontend_developer: {
    name: 'Frontend Developer Agent',
    specialization: 'React, TypeScript, CSS, Web Performance',
    apis: {
      mdn: 'https://developer.mozilla.org/en-US/search.json',
      caniuse: 'https://caniuse.com/api/',
      npm: 'https://registry.npmjs.org/',
      bundlephobia: 'https://bundlephobia.com/api/',
      lighthouse: 'internal',
      webpagetest: 'https://www.webpagetest.org/api/'
    },
    knowledge_areas: [
      'React', 'Vue', 'Angular', 'TypeScript', 'CSS', 'HTML',
      'Web Performance', 'Accessibility', 'SEO', 'PWA',
      'Testing', 'Build Tools', 'State Management'
    ]
  },
  
  devops_engineer: {
    name: 'DevOps Engineer Agent',
    specialization: 'Infrastructure, CI/CD, Monitoring, Security',
    apis: {
      github: 'https://api.github.com/',
      gitlab: 'https://gitlab.com/api/',
      datadog: 'https://api.datadoghq.com/',
      newrelic: 'https://api.newrelic.com/',
      snyk: 'https://api.snyk.io/',
      docker: 'https://registry.hub.docker.com/v2/'
    },
    knowledge_areas: [
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
      'CI/CD', 'Monitoring', 'Logging', 'Security',
      'Infrastructure as Code', 'Microservices'
    ]
  },
  
  qa_specialist: {
    name: 'QA Specialist Agent',
    specialization: 'Testing, Quality Assurance, Automation',
    apis: {
      jest: 'internal',
      cypress: 'internal',
      playwright: 'internal',
      lighthouse: 'internal',
      webpagetest: 'https://www.webpagetest.org/api/',
      sonarcloud: 'https://sonarcloud.io/api/'
    },
    knowledge_areas: [
      'Unit Testing', 'Integration Testing', 'E2E Testing',
      'Performance Testing', 'Security Testing', 'Accessibility Testing',
      'Test Automation', 'Test Planning', 'Quality Metrics'
    ]
  },
  
  security_compliance: {
    name: 'Security & Compliance Agent',
    specialization: 'Security, HIPAA, GDPR, Compliance',
    apis: {
      snyk: 'https://api.snyk.io/',
      github: 'https://api.github.com/',
      owasp: 'internal',
      nvd: 'https://services.nvd.nist.gov/rest/json/cves/2.0/',
      cve: 'https://cve.circl.lu/api/'
    },
    knowledge_areas: [
      'HIPAA Compliance', 'GDPR', 'Security Best Practices',
      'Vulnerability Assessment', 'Penetration Testing',
      'Data Protection', 'Audit Trails', 'Encryption'
    ]
  },
  
  data_engineer: {
    name: 'Data Engineer Agent',
    specialization: 'Data Processing, Analytics, ML Pipelines',
    apis: {
      github: 'https://api.github.com/',
      pypi: 'https://pypi.org/pypi/',
      huggingface: 'https://huggingface.co/api/',
      openai: 'https://api.openai.com/v1/',
      datadog: 'https://api.datadoghq.com/'
    },
    knowledge_areas: [
      'Data Processing', 'ETL Pipelines', 'Data Warehousing',
      'Machine Learning', 'Big Data', 'Analytics',
      'Data Quality', 'Data Governance', 'MLOps'
    ]
  }
};

// Crear estructura de agentes
function createAgentStructure() {
  const agentsDir = path.join(__dirname, '..', 'src', 'agents', 'technical');
  
  if (!fs.existsSync(agentsDir)) {
    fs.mkdirSync(agentsDir, { recursive: true });
  }
  
  console.log('✅ Directorio de agentes técnicos creado:', agentsDir);
  return agentsDir;
}

// Crear agente base
function createBaseAgent(agentsDir) {
  const baseAgentContent = `/**
 * Agente Base para Conocimiento Técnico
 * Proporciona funcionalidades comunes para todos los agentes especializados
 */

import { TechnicalKnowledgeService } from '../services/technical-knowledge.service.js';

export class BaseTechnicalAgent {
  constructor(role, config) {
    this.role = role;
    this.config = config;
    this.knowledgeService = new TechnicalKnowledgeService();
    this.specialization = config.specialization;
    this.knowledgeAreas = config.knowledge_areas;
  }
  
  async analyzeCode(code, language) {
    const analysis = {
      quality: await this.analyzeQuality(code),
      security: await this.analyzeSecurity(code),
      performance: await this.analyzePerformance(code),
      bestPractices: await this.checkBestPractices(code, language)
    };
    
    return analysis;
  }
  
  async analyzeQuality(code) {
    // Análisis básico de calidad
    const metrics = {
      lines: code.split('\\n').length,
      complexity: this.calculateComplexity(code),
      maintainability: this.calculateMaintainability(code)
    };
    
    return metrics;
  }
  
  async analyzeSecurity(code) {
    // Análisis básico de seguridad
    const securityIssues = [];
    
    // Detectar patrones inseguros comunes
    const insecurePatterns = [
      /eval\\(/,
      /innerHTML\\s*=/,
      /document\\.write/,
      /sql\\s*\\+/,
      /password\\s*=\\s*['"][^'"]*['"]/
    ];
    
    insecurePatterns.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        securityIssues.push({
          type: 'security_pattern',
          pattern: pattern.source,
          line: this.findLineNumber(code, pattern)
        });
      }
    });
    
    return securityIssues;
  }
  
  async analyzePerformance(code) {
    // Análisis básico de performance
    const performanceIssues = [];
    
    // Detectar patrones de performance problemáticos
    const performancePatterns = [
      /for\\s*\\([^)]*\\)\\s*{[^}]*for\\s*\\([^)]*\\)/, // Nested loops
      /\\$\\$/, // jQuery selector
      /innerHTML\\s*\\+=/, // String concatenation in loops
      /setTimeout\\([^,]*,\\s*0\\)/ // Zero timeout
    ];
    
    performancePatterns.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        performanceIssues.push({
          type: 'performance_pattern',
          pattern: pattern.source,
          line: this.findLineNumber(code, pattern)
        });
      }
    });
    
    return performanceIssues;
  }
  
  async checkBestPractices(code, language) {
    // Verificar mejores prácticas según el lenguaje
    const bestPractices = {
      passed: [],
      failed: [],
      suggestions: []
    };
    
    // Implementar verificaciones específicas por lenguaje
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'typescript':
        bestPractices.suggestions.push(
          'Usar const y let en lugar de var',
          'Implementar manejo de errores con try-catch',
          'Usar async/await en lugar de callbacks',
          'Implementar validación de tipos'
        );
        break;
      case 'python':
        bestPractices.suggestions.push(
          'Usar type hints',
          'Implementar docstrings',
          'Usar context managers',
          'Seguir PEP 8'
        );
        break;
      default:
        bestPractices.suggestions.push(
          'Revisar documentación oficial del lenguaje',
          'Implementar tests unitarios',
          'Usar un linter apropiado'
        );
    }
    
    return bestPractices;
  }
  
  calculateComplexity(code) {
    // Cálculo básico de complejidad ciclomática
    const complexityKeywords = ['if', 'else', 'for', 'while', 'case', 'catch', '&&', '||'];
    let complexity = 1;
    
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'g');
      const matches = code.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  }
  
  calculateMaintainability(code) {
    // Cálculo básico de mantenibilidad
    const lines = code.split('\\n').length;
    const complexity = this.calculateComplexity(code);
    
    // Fórmula simplificada de mantenibilidad
    const maintainability = Math.max(0, 100 - (lines * 0.5) - (complexity * 2));
    
    return Math.round(maintainability);
  }
  
  findLineNumber(code, pattern) {
    const lines = code.split('\\n');
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        return i + 1;
      }
    }
    return -1;
  }
  
  async getRecommendations(context) {
    const recommendations = [];
    
    // Buscar soluciones técnicas
    const solutions = await this.knowledgeService.searchTechnicalSolution(
      context.problem,
      context.tags
    );
    
    if (solutions.length > 0) {
      recommendations.push({
        type: 'technical_solution',
        source: 'Stack Overflow',
        solutions: solutions.slice(0, 3)
      });
    }
    
    // Obtener ejemplos de código
    const examples = await this.knowledgeService.getCodeExamples(
      context.language,
      context.topic
    );
    
    if (examples.length > 0) {
      recommendations.push({
        type: 'code_example',
        source: 'GitHub',
        examples: examples.slice(0, 2)
      });
    }
    
    return recommendations;
  }
  
  async generateReport(projectPath) {
    const report = {
      agent: this.role,
      timestamp: new Date().toISOString(),
      specialization: this.specialization,
      knowledgeAreas: this.knowledgeAreas,
      analysis: await this.analyzeProject(projectPath),
      recommendations: await this.getProjectRecommendations(projectPath)
    };
    
    return report;
  }
  
  async analyzeProject(projectPath) {
    // Análisis básico del proyecto
    return {
      files: await this.countFiles(projectPath),
      languages: await this.detectLanguages(projectPath),
      dependencies: await this.analyzeDependencies(projectPath)
    };
  }
  
  async getProjectRecommendations(projectPath) {
    // Recomendaciones específicas del proyecto
    return [
      'Implementar tests automatizados',
      'Configurar CI/CD pipeline',
      'Revisar dependencias por vulnerabilidades',
      'Optimizar performance del código'
    ];
  }
  
  async countFiles(projectPath) {
    // Contar archivos en el proyecto
    try {
      const files = await this.walkDirectory(projectPath);
      return files.length;
    } catch (error) {
      console.error('Error contando archivos:', error);
      return 0;
    }
  }
  
  async detectLanguages(projectPath) {
    // Detectar lenguajes de programación usados
    const extensions = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.py': 'Python',
      '.java': 'Java',
      '.cs': 'C#',
      '.php': 'PHP',
      '.rb': 'Ruby',
      '.go': 'Go',
      '.rs': 'Rust'
    };
    
    try {
      const files = await this.walkDirectory(projectPath);
      const languages = new Set();
      
      files.forEach(file => {
        const ext = path.extname(file);
        if (extensions[ext]) {
          languages.add(extensions[ext]);
        }
      });
      
      return Array.from(languages);
    } catch (error) {
      console.error('Error detectando lenguajes:', error);
      return [];
    }
  }
  
  async analyzeDependencies(projectPath) {
    // Analizar dependencias del proyecto
    const dependencies = [];
    
    try {
      // Buscar package.json
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        dependencies.push({
          type: 'npm',
          dependencies: packageJson.dependencies || {},
          devDependencies: packageJson.devDependencies || {}
        });
      }
      
      // Buscar requirements.txt
      const requirementsPath = path.join(projectPath, 'requirements.txt');
      if (fs.existsSync(requirementsPath)) {
        const requirements = fs.readFileSync(requirementsPath, 'utf8')
          .split('\\n')
          .filter(line => line.trim() && !line.startsWith('#'));
        dependencies.push({
          type: 'python',
          dependencies: requirements
        });
      }
    } catch (error) {
      console.error('Error analizando dependencias:', error);
    }
    
    return dependencies;
  }
  
  async walkDirectory(dir) {
    const files = [];
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...await this.walkDirectory(fullPath));
      } else if (stat.isFile()) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
}
`;

  fs.writeFileSync(path.join(agentsDir, 'base-agent.js'), baseAgentContent);
  console.log('✅ Agente base creado');
}

// Crear agentes especializados
function createSpecializedAgents(agentsDir) {
  Object.entries(AGENT_CONFIGS).forEach(([role, config]) => {
    const agentContent = `/**
 * ${config.name}
 * Especializado en: ${config.specialization}
 */

import { BaseTechnicalAgent } from './base-agent.js';

export class ${role.charAt(0).toUpperCase() + role.slice(1).replace(/_([a-z])/g, (g) => g[1].toUpperCase())}Agent extends BaseTechnicalAgent {
  constructor() {
    super('${role}', ${JSON.stringify(config, null, 2)});
  }
  
  async analyzeCode(code, language) {
    // Análisis específico para ${config.specialization}
    const baseAnalysis = await super.analyzeCode(code, language);
    
    // Análisis adicional específico del rol
    const specializedAnalysis = await this.performSpecializedAnalysis(code, language);
    
    return {
      ...baseAnalysis,
      specialized: specializedAnalysis
    };
  }
  
  async performSpecializedAnalysis(code, language) {
    const analysis = {
      role: '${role}',
      specialization: '${config.specialization}',
      insights: []
    };
    
    // Análisis específico según el rol
    switch ('${role}') {
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
    
    switch ('${role}') {
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
`;

    const fileName = `${role}-agent.js`;
    fs.writeFileSync(path.join(agentsDir, fileName), agentContent);
    console.log(`✅ Agente ${config.name} creado`);
  });
}

// Crear servicio de conocimiento técnico
function createTechnicalKnowledgeService(agentsDir) {
  const servicesDir = path.join(__dirname, '..', 'src', 'services');
  
  if (!fs.existsSync(servicesDir)) {
    fs.mkdirSync(servicesDir, { recursive: true });
  }
  
  const serviceContent = `/**
 * Servicio de Conocimiento Técnico
 * Proporciona acceso a APIs de conocimiento técnico para agentes especializados
 */

export class TechnicalKnowledgeService {
  constructor() {
    this.apis = {
      stackoverflow: 'https://api.stackexchange.com/2.3/',
      github: 'https://api.github.com/',
      mdn: 'https://developer.mozilla.org/en-US/search.json',
      npm: 'https://registry.npmjs.org/',
      snyk: 'https://api.snyk.io/'
    };
  }
  
  async searchTechnicalSolution(query, tags = []) {
    try {
      const response = await fetch(
        \`\${this.apis.stackoverflow}/search/advanced?order=desc&sort=votes&q=\${encodeURIComponent(query)}&tagged=\${tags.join(';')}&site=stackoverflow\`
      );
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error buscando solución técnica:', error);
      return [];
    }
  }
  
  async getCodeExamples(language, topic) {
    try {
      const response = await fetch(
        \`\${this.apis.github}/search/repositories?q=\${encodeURIComponent(topic)}+language:\${language}&sort=stars&order=desc\`
      );
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error obteniendo ejemplos de código:', error);
      return [];
    }
  }
  
  async analyzePackage(packageName) {
    try {
      const response = await fetch(\`\${this.apis.npm}/\${packageName}\`);
      const data = await response.json();
      return {
        name: data.name,
        version: data['dist-tags'].latest,
        description: data.description,
        dependencies: data.dependencies || {},
        vulnerabilities: await this.checkVulnerabilities(packageName)
      };
    } catch (error) {
      console.error('Error analizando paquete:', error);
      return null;
    }
  }
  
  async checkVulnerabilities(packageName) {
    // Implementar con Snyk API cuando tengas la API key
    return [];
  }
  
  async searchMDNDocs(query) {
    try {
      const response = await fetch(
        \`\${this.apis.mdn}?q=\${encodeURIComponent(query)}\`
      );
      const data = await response.json();
      return data.documents || [];
    } catch (error) {
      console.error('Error buscando en MDN:', error);
      return [];
    }
  }
  
  async getGitHubTrending(language, timeframe = 'daily') {
    try {
      const response = await fetch(
        \`\${this.apis.github}/search/repositories?q=language:\${language}&sort=stars&order=desc&created:>\${this.getDateRange(timeframe)}\`
      );
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error obteniendo trending repos:', error);
      return [];
    }
  }
  
  getDateRange(timeframe) {
    const now = new Date();
    switch (timeframe) {
      case 'daily':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      case 'monthly':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }
  }
}
`;

  fs.writeFileSync(path.join(servicesDir, 'technical-knowledge.service.js'), serviceContent);
  console.log('✅ Servicio de conocimiento técnico creado');
}

// Crear archivo de configuración
function createAgentConfig() {
  const configDir = path.join(__dirname, '..', 'src', 'config');
  
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  const configContent = `/**
 * Configuración de Agentes Especializados en Programación
 */

export const AGENT_CONFIGS = ${JSON.stringify(AGENT_CONFIGS, null, 2)};

export const TECHNICAL_APIS = {
  // APIs de Documentación
  stackoverflow: {
    baseUrl: 'https://api.stackexchange.com/2.3/',
    apiKey: process.env.STACKOVERFLOW_API_KEY,
    limits: '10,000 requests/day'
  },
  
  github: {
    baseUrl: 'https://api.github.com/',
    token: process.env.GITHUB_TOKEN,
    limits: '5,000 requests/hour'
  },
  
  mdn: {
    baseUrl: 'https://developer.mozilla.org/en-US/search.json',
    limits: 'Sin límites conocidos'
  },
  
  // APIs de Análisis
  snyk: {
    baseUrl: 'https://api.snyk.io/',
    apiKey: process.env.SNYK_API_KEY,
    limits: 'Plan gratuito limitado'
  },
  
  sonarcloud: {
    baseUrl: 'https://sonarcloud.io/api/',
    token: process.env.SONARCLOUD_TOKEN,
    limits: 'Requiere cuenta gratuita'
  },
  
  // APIs de Performance
  webpagetest: {
    baseUrl: 'https://www.webpagetest.org/api/',
    apiKey: process.env.WEBPAGETEST_API_KEY,
    limits: 'Requiere API key'
  },
  
  // APIs de IA
  openai: {
    baseUrl: 'https://api.openai.com/v1/',
    apiKey: process.env.OPENAI_API_KEY,
    limits: 'Requiere API key, costo por uso'
  }
};

export const AGENT_ROLES = {
  BACKEND_DEVELOPER: 'backend_developer',
  FRONTEND_DEVELOPER: 'frontend_developer',
  DEVOPS_ENGINEER: 'devops_engineer',
  QA_SPECIALIST: 'qa_specialist',
  SECURITY_COMPLIANCE: 'security_compliance',
  DATA_ENGINEER: 'data_engineer'
};

export const KNOWLEDGE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  EXPERT: 'expert'
};
`;

  fs.writeFileSync(path.join(configDir, 'technical-agents.config.js'), configContent);
  console.log('✅ Configuración de agentes técnicos creada');
}

// Crear archivo .env.example para APIs técnicas
function createTechnicalEnvExample() {
  const envContent = `# APIs de Conocimiento Técnico para Agentes Especializados

# APIs de Documentación
STACKOVERFLOW_API_KEY=tu_stackoverflow_key
GITHUB_TOKEN=tu_github_token

# APIs de Análisis
SNYK_API_KEY=tu_snyk_key
SONARCLOUD_TOKEN=tu_sonarcloud_token

# APIs de Performance
WEBPAGETEST_API_KEY=tu_webpagetest_key
GTMETRIX_API_KEY=tu_gtmetrix_key

# APIs de IA
OPENAI_API_KEY=tu_openai_key

# Configuración de Agentes
AGENT_ROLE=backend_developer
AGENT_SPECIALIZATION=nodejs_typescript
AGENT_KNOWLEDGE_LEVEL=expert

# Configuración de Monitoreo
DATADOG_API_KEY=tu_datadog_key
DATADOG_APP_KEY=tu_datadog_app_key
NEWRELIC_API_KEY=tu_newrelic_key

# Configuración de Seguridad
AUTH0_DOMAIN=tu-dominio.auth0.com
AUTH0_CLIENT_ID=tu_client_id
AUTH0_CLIENT_SECRET=tu_client_secret
`;

  const envPath = path.join(__dirname, '..', '.env.technical.example');
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env.technical.example creado');
}

// Función principal
function main() {
  try {
    console.log('🚀 Iniciando configuración de agentes especializados...\n');
    
    const agentsDir = createAgentStructure();
    createBaseAgent(agentsDir);
    createSpecializedAgents(agentsDir);
    createTechnicalKnowledgeService(agentsDir);
    createAgentConfig();
    createTechnicalEnvExample();
    
    console.log('\n🎉 Configuración de agentes especializados completada!');
    console.log('\n📋 Agentes creados:');
    Object.entries(AGENT_CONFIGS).forEach(([role, config]) => {
      console.log(`   • ${config.name} (${role})`);
    });
    
    console.log('\n📋 Próximos pasos:');
    console.log('1. Copia .env.technical.example a .env');
    console.log('2. Configura tus API keys técnicas:');
    console.log('   - Stack Overflow: https://stackapps.com/apps/oauth/register');
    console.log('   - GitHub: https://github.com/settings/tokens');
    console.log('   - Snyk: https://app.snyk.io/account/api-key');
    console.log('   - OpenAI: https://platform.openai.com/api-keys');
    console.log('3. Ejecuta: npm install');
    console.log('4. Prueba los agentes con ejemplos específicos');
    
    console.log('\n🔧 Ejemplo de uso:');
    console.log('```javascript');
    console.log('import { BackendDeveloperAgent } from "./src/agents/technical/backend-developer-agent.js";');
    console.log('');
    console.log('const agent = new BackendDeveloperAgent();');
    console.log('const analysis = await agent.analyzeCode(code, "javascript");');
    console.log('const recommendations = await agent.getSpecializedRecommendations(context);');
    console.log('```');
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export { main }; 