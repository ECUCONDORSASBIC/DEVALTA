/**
 * Configuración de Agentes Especializados en Programación
 */

export const AGENT_CONFIGS = {
  "backend_developer": {
    "name": "Backend Developer Agent",
    "specialization": "Node.js, TypeScript, APIs, Databases",
    "apis": {
      "stackoverflow": "https://api.stackexchange.com/2.3/",
      "github": "https://api.github.com/",
      "npm": "https://registry.npmjs.org/",
      "snyk": "https://api.snyk.io/",
      "sonarcloud": "https://sonarcloud.io/api/",
      "codeclimate": "https://api.codeclimate.com/v1/"
    },
    "knowledge_areas": [
      "REST APIs",
      "GraphQL",
      "Microservices",
      "Database Design",
      "Authentication",
      "Security",
      "Performance",
      "Testing",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "Monitoring"
    ]
  },
  "frontend_developer": {
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
  },
  "devops_engineer": {
    "name": "DevOps Engineer Agent",
    "specialization": "Infrastructure, CI/CD, Monitoring, Security",
    "apis": {
      "github": "https://api.github.com/",
      "gitlab": "https://gitlab.com/api/",
      "datadog": "https://api.datadoghq.com/",
      "newrelic": "https://api.newrelic.com/",
      "snyk": "https://api.snyk.io/",
      "docker": "https://registry.hub.docker.com/v2/"
    },
    "knowledge_areas": [
      "Docker",
      "Kubernetes",
      "AWS",
      "Azure",
      "GCP",
      "CI/CD",
      "Monitoring",
      "Logging",
      "Security",
      "Infrastructure as Code",
      "Microservices"
    ]
  },
  "qa_specialist": {
    "name": "QA Specialist Agent",
    "specialization": "Testing, Quality Assurance, Automation",
    "apis": {
      "jest": "internal",
      "cypress": "internal",
      "playwright": "internal",
      "lighthouse": "internal",
      "webpagetest": "https://www.webpagetest.org/api/",
      "sonarcloud": "https://sonarcloud.io/api/"
    },
    "knowledge_areas": [
      "Unit Testing",
      "Integration Testing",
      "E2E Testing",
      "Performance Testing",
      "Security Testing",
      "Accessibility Testing",
      "Test Automation",
      "Test Planning",
      "Quality Metrics"
    ]
  },
  "security_compliance": {
    "name": "Security & Compliance Agent",
    "specialization": "Security, HIPAA, GDPR, Compliance",
    "apis": {
      "snyk": "https://api.snyk.io/",
      "github": "https://api.github.com/",
      "owasp": "internal",
      "nvd": "https://services.nvd.nist.gov/rest/json/cves/2.0/",
      "cve": "https://cve.circl.lu/api/"
    },
    "knowledge_areas": [
      "HIPAA Compliance",
      "GDPR",
      "Security Best Practices",
      "Vulnerability Assessment",
      "Penetration Testing",
      "Data Protection",
      "Audit Trails",
      "Encryption"
    ]
  },
  "data_engineer": {
    "name": "Data Engineer Agent",
    "specialization": "Data Processing, Analytics, ML Pipelines",
    "apis": {
      "github": "https://api.github.com/",
      "pypi": "https://pypi.org/pypi/",
      "huggingface": "https://huggingface.co/api/",
      "openai": "https://api.openai.com/v1/",
      "datadog": "https://api.datadoghq.com/"
    },
    "knowledge_areas": [
      "Data Processing",
      "ETL Pipelines",
      "Data Warehousing",
      "Machine Learning",
      "Big Data",
      "Analytics",
      "Data Quality",
      "Data Governance",
      "MLOps"
    ]
  },
  "web_designer_3d": {
    "name": "WebDesigner3D Agent",
    "specialization": "Three.js, React-Three-Fiber, WebGL, Medical UX",
    "apis": {
      "three_js_docs": "https://threejs.org/docs/",
      "react_three_fiber": "https://docs.pmnd.rs/react-three-fiber/",
      "webgl_reference": "https://www.khronos.org/webgl/",
      "w3c_accessibility": "https://www.w3.org/WAI/",
      "iso_9241": "ISO 9241-171 accessibility guidelines"
    },
    "knowledge_areas": [
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
      "Color Theory for Medical"
    ]
  }
};

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
  DATA_ENGINEER: 'data_engineer',
  WEB_DESIGNER_3D: 'web_designer_3d'
};

export const KNOWLEDGE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  EXPERT: 'expert'
};
