#!/usr/bin/env node

/**
 * Script de Configuración de APIs Reales para Altamedica
 * Implementa APIs profesionales para desarrollo médico
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { execSync } from 'child_process';

console.log('🏥 Configurando APIs Reales para Altamedica...\n');

// Configuración de APIs médicas reales
const API_CONFIGS = {
  // APIs de Salud Pública
  fhir: {
    name: 'HL7 FHIR',
    baseUrl: 'https://hapi.fhir.org/baseR4',
    endpoints: {
      patients: '/Patient',
      observations: '/Observation',
      medications: '/Medication',
      conditions: '/Condition'
    },
    documentation: 'https://www.hl7.org/fhir/'
  },
  
  // APIs de Terminología Médica
  snomed: {
    name: 'SNOMED CT',
    baseUrl: 'https://browser.ihtsdotools.org/snowstorm/snomed-ct',
    endpoints: {
      concepts: '/concepts',
      descriptions: '/descriptions',
      relationships: '/relationships'
    },
    documentation: 'https://www.snomed.org/'
  },
  
  // APIs de Monitoreo
  datadog: {
    name: 'Datadog',
    baseUrl: 'https://api.datadoghq.com/api/v1',
    endpoints: {
      metrics: '/series',
      events: '/events',
      dashboards: '/dashboard'
    },
    documentation: 'https://docs.datadoghq.com/api/'
  },
  
  // APIs de Autenticación
  auth0: {
    name: 'Auth0',
    baseUrl: 'https://your-domain.auth0.com',
    endpoints: {
      users: '/api/v2/users',
      roles: '/api/v2/roles',
      permissions: '/api/v2/permissions'
    },
    documentation: 'https://auth0.com/docs/api/management/v2'
  }
};

// Crear archivo de configuración de APIs
function createApiConfig() {
  const configPath = path.join(__dirname, '..', 'src', 'config', 'apis.js');
  const configDir = path.dirname(configPath);
  
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  const configContent = `/**
 * Configuración de APIs Reales para Altamedica
 * Este archivo contiene las configuraciones de APIs profesionales
 */

const API_CONFIGS = ${JSON.stringify(API_CONFIGS, null, 2)};

// Configuración de variables de entorno
const ENV_CONFIG = {
  // APIs Médicas
  FHIR_BASE_URL: process.env.FHIR_BASE_URL || '${API_CONFIGS.fhir.baseUrl}',
  SNOMED_API_KEY: process.env.SNOMED_API_KEY,
  ICD_API_KEY: process.env.ICD_API_KEY,
  
  // Monitoreo
  DATADOG_API_KEY: process.env.DATADOG_API_KEY,
  DATADOG_APP_KEY: process.env.DATADOG_APP_KEY,
  
  // Base de Datos
  MONGODB_URI: process.env.MONGODB_URI,
  POSTGRES_URL: process.env.POSTGRES_URL,
  
  // Autenticación
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
  
  // Seguridad
  JWT_SECRET: process.env.JWT_SECRET,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY
};

// Validación de configuración
function validateConfig() {
  const required = [
    'DATADOG_API_KEY',
    'DATADOG_APP_KEY',
    'AUTH0_DOMAIN',
    'AUTH0_CLIENT_ID',
    'JWT_SECRET'
  ];
  
  const missing = required.filter(key => !ENV_CONFIG[key]);
  
  if (missing.length > 0) {
    console.warn('⚠️ Variables de entorno faltantes:', missing.join(', '));
    console.warn('Configura estas variables en tu archivo .env');
  }
  
  return missing.length === 0;
}

module.exports = {
  API_CONFIGS,
  ENV_CONFIG,
  validateConfig
};
`;

  fs.writeFileSync(configPath, configContent);
  console.log('✅ Configuración de APIs creada en:', configPath);
}

// Crear servicios de APIs
function createApiServices() {
  const servicesDir = path.join(__dirname, '..', 'src', 'services', 'apis');
  
  if (!fs.existsSync(servicesDir)) {
    fs.mkdirSync(servicesDir, { recursive: true });
  }
  
  // Servicio FHIR
  const fhirService = `/**
 * Servicio FHIR para Altamedica
 * Maneja operaciones con datos médicos estandarizados
 */

const { ENV_CONFIG } = require('../config/apis');

class FHIRService {
  constructor() {
    this.baseUrl = ENV_CONFIG.FHIR_BASE_URL;
  }
  
  async getPatients(limit = 10) {
    try {
      const response = await fetch(\`\${this.baseUrl}/Patient?_count=\${limit}\`);
      const data = await response.json();
      return data.entry || [];
    } catch (error) {
      console.error('Error obteniendo pacientes FHIR:', error);
      throw error;
    }
  }
  
  async getPatientById(id) {
    try {
      const response = await fetch(\`\${this.baseUrl}/Patient/\${id}\`);
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo paciente:', error);
      throw error;
    }
  }
  
  async createPatient(patientData) {
    try {
      const response = await fetch(\`\${this.baseUrl}/Patient\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json'
        },
        body: JSON.stringify(patientData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creando paciente:', error);
      throw error;
    }
  }
}

module.exports = new FHIRService();
`;

  // Servicio de Monitoreo
  const monitoringService = `/**
 * Servicio de Monitoreo con Datadog
 * Gestiona métricas y alertas del sistema médico
 */

const { ENV_CONFIG } = require('../config/apis');

class MonitoringService {
  constructor() {
    this.apiKey = ENV_CONFIG.DATADOG_API_KEY;
    this.appKey = ENV_CONFIG.DATADOG_APP_KEY;
    this.baseUrl = 'https://api.datadoghq.com/api/v1';
  }
  
  async sendMetric(metricName, value, tags = []) {
    if (!this.apiKey || !this.appKey) {
      console.warn('⚠️ Datadog no configurado, saltando métrica:', metricName);
      return;
    }
    
    try {
      const payload = {
        series: [{
          metric: metricName,
          points: [[Math.floor(Date.now() / 1000), value]],
          tags: tags
        }]
      };
      
      const response = await fetch(\`\${this.baseUrl}/series\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': this.apiKey,
          'DD-APP-KEY': this.appKey
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      console.log('📊 Métrica enviada:', metricName, value);
    } catch (error) {
      console.error('Error enviando métrica:', error);
    }
  }
  
  async sendEvent(title, text, tags = []) {
    if (!this.apiKey || !this.appKey) {
      console.warn('⚠️ Datadog no configurado, saltando evento:', title);
      return;
    }
    
    try {
      const payload = {
        title,
        text,
        tags,
        alert_type: 'info'
      };
      
      const response = await fetch(\`\${this.baseUrl}/events\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': this.apiKey,
          'DD-APP-KEY': this.appKey
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
      }
      
      console.log('📢 Evento enviado:', title);
    } catch (error) {
      console.error('Error enviando evento:', error);
    }
  }
}

module.exports = new MonitoringService();
`;

  // Servicio de Autenticación
  const authService = `/**
 * Servicio de Autenticación con Auth0
 * Gestiona autenticación y autorización de usuarios médicos
 */

const { ENV_CONFIG } = require('../config/apis');

class AuthService {
  constructor() {
    this.domain = ENV_CONFIG.AUTH0_DOMAIN;
    this.clientId = ENV_CONFIG.AUTH0_CLIENT_ID;
    this.clientSecret = ENV_CONFIG.AUTH0_CLIENT_SECRET;
  }
  
  async validateToken(token) {
    try {
      const response = await fetch(\`https://\${this.domain}/userinfo\`, {
        headers: {
          'Authorization': \`Bearer \${token}\`
        }
      });
      
      if (!response.ok) {
        throw new Error('Token inválido');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error validando token:', error);
      throw error;
    }
  }
  
  async getUserProfile(userId) {
    try {
      const response = await fetch(\`https://\${this.domain}/api/v2/users/\${userId}\`, {
        headers: {
          'Authorization': \`Bearer \${await this.getManagementToken()}\`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error obteniendo perfil de usuario');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      throw error;
    }
  }
  
  async getManagementToken() {
    // Implementar obtención de token de gestión
    // Este es un placeholder - necesitas implementar la lógica real
    throw new Error('getManagementToken no implementado');
  }
}

module.exports = new AuthService();
`;

  fs.writeFileSync(path.join(servicesDir, 'fhir.service.js'), fhirService);
  fs.writeFileSync(path.join(servicesDir, 'monitoring.service.js'), monitoringService);
  fs.writeFileSync(path.join(servicesDir, 'auth.service.js'), authService);
  
  console.log('✅ Servicios de APIs creados en:', servicesDir);
}

// Crear archivo .env.example
function createEnvExample() {
  const envExample = `# Configuración de APIs Reales para Altamedica
# Copia este archivo a .env y configura tus valores reales

# APIs Médicas
FHIR_BASE_URL=https://hapi.fhir.org/baseR4
SNOMED_API_KEY=tu_api_key_snomed
ICD_API_KEY=tu_api_key_icd

# Monitoreo
DATADOG_API_KEY=tu_datadog_api_key
DATADOG_APP_KEY=tu_datadog_app_key

# Base de Datos
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/altamedica
POSTGRES_URL=postgresql://usuario:password@localhost:5432/altamedica

# Autenticación
AUTH0_DOMAIN=tu-dominio.auth0.com
AUTH0_CLIENT_ID=tu_client_id
AUTH0_CLIENT_SECRET=tu_client_secret

# Seguridad
JWT_SECRET=tu_jwt_secret_super_seguro
ENCRYPTION_KEY=tu_clave_encriptacion_32_caracteres

# Entorno
NODE_ENV=development
PORT=3000
`;

  const envPath = path.join(__dirname, '..', '.env.example');
  fs.writeFileSync(envPath, envExample);
  console.log('✅ Archivo .env.example creado');
}

// Función principal
function main() {
  try {
    console.log('🔧 Iniciando configuración de APIs reales...\n');
    
    createApiConfig();
    createApiServices();
    createEnvExample();
    
    console.log('\n🎉 Configuración completada exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Copia .env.example a .env');
    console.log('2. Configura tus API keys reales');
    console.log('3. Registra las APIs necesarias:');
    console.log('   - Datadog: https://www.datadoghq.com/');
    console.log('   - Auth0: https://auth0.com/');
    console.log('   - SNOMED: https://www.snomed.org/');
    console.log('4. Ejecuta: npm install');
    console.log('5. Prueba las integraciones');
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main }; 