/**
 * Hardened Knowledge Ingestion Engine - Step 3
 * Real connectors with verifiable sources only
 * Medical compliance and security validation
 */

const { EventEmitter } = require('events');
const crypto = require('crypto');

/**
 * Schema validation for different data sources
 */
class SourceSchemaValidator {
  constructor() {
    this.schemas = new Map();
    this.initializeSchemas();
  }

  initializeSchemas() {
    // OSV.dev vulnerability schema
    this.schemas.set('osv_vulnerability', {
      required: ['id', 'modified', 'published', 'affected'],
      properties: {
        id: { type: 'string', pattern: /^(GHSA|CVE|RUSTSEC|DSA|DLA|PYSEC|GO)-/ },
        modified: { type: 'string', format: 'date-time' },
        published: { type: 'string', format: 'date-time' },
        affected: { type: 'array', minItems: 1 },
        summary: { type: 'string', maxLength: 1000 },
        severity: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['CVSS_V3'] },
              score: { type: 'string', pattern: /^[0-9]+\.[0-9]$/ }
            }
          }
        }
      }
    });

    // AWS Pricing API schema
    this.schemas.set('aws_pricing', {
      required: ['product', 'serviceCode', 'terms'],
      properties: {
        product: {
          type: 'object',
          required: ['sku', 'productFamily', 'attributes'],
          properties: {
            sku: { type: 'string', pattern: /^[A-Z0-9]{10,14}$/ },
            productFamily: { type: 'string' },
            attributes: { type: 'object' }
          }
        },
        serviceCode: { type: 'string', enum: ['AmazonEC2', 'AmazonRDS', 'AWSLambda', 'AmazonCloudFront'] },
        terms: { type: 'object' }
      }
    });

    // NIH DailyMed schema
    this.schemas.set('nih_dailymed', {
      required: ['setid', 'title', 'generic_medicine', 'active_ingredient'],
      properties: {
        setid: { type: 'string', pattern: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i },
        title: { type: 'string', minLength: 1, maxLength: 500 },
        generic_medicine: { type: 'array', items: { type: 'string' } },
        active_ingredient: { type: 'array', items: { type: 'string' } },
        manufacturer_name: { type: 'string' },
        product_type: { type: 'string' },
        route: { type: 'array', items: { type: 'string' } },
        application_number: { type: 'string' }
      }
    });

    // SNOMED CT schema
    this.schemas.set('snomed_ct', {
      required: ['id', 'effectiveTime', 'active', 'moduleId', 'definitionStatusId'],
      properties: {
        id: { type: 'string', pattern: /^[0-9]{6,18}$/ },
        effectiveTime: { type: 'string', pattern: /^[0-9]{8}$/ },
        active: { type: 'string', enum: ['0', '1'] },
        moduleId: { type: 'string', pattern: /^[0-9]{6,18}$/ },
        definitionStatusId: { type: 'string', pattern: /^[0-9]{6,18}$/ },
        term: { type: 'string', minLength: 1, maxLength: 255 }
      }
    });

    // LOINC schema
    this.schemas.set('loinc', {
      required: ['LOINC_NUM', 'COMPONENT', 'PROPERTY', 'TIME_ASPCT', 'SYSTEM', 'SCALE_TYP', 'METHOD_TYP'],
      properties: {
        LOINC_NUM: { type: 'string', pattern: /^[0-9]+-[0-9]+$/ },
        COMPONENT: { type: 'string', minLength: 1 },
        PROPERTY: { type: 'string', minLength: 1 },
        TIME_ASPCT: { type: 'string', minLength: 1 },
        SYSTEM: { type: 'string', minLength: 1 },
        SCALE_TYP: { type: 'string', minLength: 1 },
        METHOD_TYP: { type: 'string' },
        CLASS: { type: 'string' },
        STATUS: { type: 'string', enum: ['ACTIVE', 'DEPRECATED', 'DISCOURAGED'] }
      }
    });

    // FDA MAUDE schema
    this.schemas.set('fda_maude', {
      required: ['mdr_report_key', 'event_type', 'product_problem_flag', 'date_received'],
      properties: {
        mdr_report_key: { type: 'string', pattern: /^[0-9]{7,10}$/ },
        event_type: { type: 'string', enum: ['M', 'D', 'I', 'O'] },
        product_problem_flag: { type: 'string', enum: ['Y', 'N'] },
        date_received: { type: 'string', pattern: /^[0-9]{8}$/ },
        manufacturer_d_name: { type: 'string' },
        device_name: { type: 'string' },
        generic_name: { type: 'string' },
        patient_sequence_number: { type: 'string', pattern: /^[0-9]{1,3}$/ }
      }
    });
  }

  validate(sourceType, data) {
    const schema = this.schemas.get(sourceType);
    if (!schema) {
      throw new Error(`Unknown source type: ${sourceType}`);
    }

    const errors = [];
    
    // Check required fields
    for (const required of schema.required) {
      if (!(required in data)) {
        errors.push(`Missing required field: ${required}`);
      }
    }

    // Validate properties
    for (const [key, value] of Object.entries(data)) {
      const propertySchema = schema.properties[key];
      if (propertySchema) {
        const validationResult = this.validateProperty(key, value, propertySchema);
        if (!validationResult.valid) {
          errors.push(...validationResult.errors);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateProperty(key, value, schema) {
    const errors = [];

    // Type validation
    if (schema.type === 'string' && typeof value !== 'string') {
      errors.push(`Field ${key} must be a string`);
      return { valid: false, errors };
    }

    if (schema.type === 'array' && !Array.isArray(value)) {
      errors.push(`Field ${key} must be an array`);
      return { valid: false, errors };
    }

    if (schema.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
      errors.push(`Field ${key} must be an object`);
      return { valid: false, errors };
    }

    // String validations
    if (schema.type === 'string' && typeof value === 'string') {
      if (schema.pattern && !schema.pattern.test(value)) {
        errors.push(`Field ${key} does not match required pattern`);
      }
      if (schema.minLength && value.length < schema.minLength) {
        errors.push(`Field ${key} is too short (minimum ${schema.minLength})`);
      }
      if (schema.maxLength && value.length > schema.maxLength) {
        errors.push(`Field ${key} is too long (maximum ${schema.maxLength})`);
      }
      if (schema.enum && !schema.enum.includes(value)) {
        errors.push(`Field ${key} must be one of: ${schema.enum.join(', ')}`);
      }
    }

    // Array validations
    if (schema.type === 'array' && Array.isArray(value)) {
      if (schema.minItems && value.length < schema.minItems) {
        errors.push(`Field ${key} must have at least ${schema.minItems} items`);
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

/**
 * Signature validator for data integrity
 */
class SignatureValidator {
  constructor(config) {
    this.trustedKeys = new Map();
    this.hmacSecret = config?.hmacSecret || process.env.KNOWLEDGE_HMAC_SECRET;
    
    if (!this.hmacSecret) {
      throw new Error('HMAC secret required for signature validation');
    }
  }

  addTrustedKey(sourceId, publicKey) {
    this.trustedKeys.set(sourceId, publicKey);
  }

  validateSignature(data, signature, sourceId) {
    try {
      const dataString = JSON.stringify(data);
      const expectedSignature = crypto
        .createHmac('sha256', this.hmacSecret)
        .update(dataString + sourceId)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      console.error('Signature validation error:', error);
      return false;
    }
  }

  generateSignature(data, sourceId) {
    const dataString = JSON.stringify(data);
    return crypto
      .createHmac('sha256', this.hmacSecret)
      .update(dataString + sourceId)
      .digest('hex');
  }
}

/**
 * Real connector implementations
 */
class OSVConnector {
  constructor(config) {
    this.baseUrl = 'https://api.osv.dev/v1';
    this.timeout = config?.timeout || 30000;
    this.retryAttempts = config?.retryAttempts || 3;
  }

  async queryVulnerabilities(ecosystem, packageName, version = null) {
    const query = {
      package: {
        ecosystem: ecosystem,
        name: packageName
      }
    };

    if (version) {
      query.version = version;
    }

    try {
      const response = await this.makeRequest('/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AltaMedicaKnowledgeEngine/1.0'
        },
        body: JSON.stringify(query)
      });

      return response.vulns || [];
    } catch (error) {
      console.error(`OSV query failed for ${ecosystem}:${packageName}:`, error);
      throw error;
    }
  }

  async getBatch(vulnerabilityIds) {
    try {
      const response = await this.makeRequest('/vulns:batchGet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AltaMedicaKnowledgeEngine/1.0'
        },
        body: JSON.stringify({ vulns: vulnerabilityIds })
      });

      return response.vulns || [];
    } catch (error) {
      console.error('OSV batch query failed:', error);
      throw error;
    }
  }

  async makeRequest(endpoint, options) {
    const url = `${this.baseUrl}${endpoint}`;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`OSV API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        if (attempt === this.retryAttempts) {
          throw error;
        }
        
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

class CloudPricingConnector {
  constructor(config) {
    this.providers = {
      aws: {
        baseUrl: 'https://pricing.us-east-1.amazonaws.com',
        apiKey: config?.aws?.apiKey
      },
      gcp: {
        baseUrl: 'https://cloudbilling.googleapis.com/v1',
        apiKey: config?.gcp?.apiKey
      },
      azure: {
        baseUrl: 'https://prices.azure.com/api/retail/prices',
        apiKey: config?.azure?.apiKey
      }
    };
    this.timeout = config?.timeout || 30000;
  }

  async getAWSPricing(serviceCode, region = 'us-east-1') {
    const url = `${this.providers.aws.baseUrl}/offers/v1.0/aws/${serviceCode}/current/${region}/index.json`;
    
    try {
      const response = await fetch(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'AltaMedicaKnowledgeEngine/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`AWS Pricing API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`AWS pricing query failed for ${serviceCode}:`, error);
      throw error;
    }
  }

  async getGCPPricing(serviceId) {
    if (!this.providers.gcp.apiKey) {
      throw new Error('GCP API key required for pricing queries');
    }

    const url = `${this.providers.gcp.baseUrl}/services/${serviceId}/skus?key=${this.providers.gcp.apiKey}`;
    
    try {
      const response = await fetch(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'AltaMedicaKnowledgeEngine/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`GCP Pricing API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`GCP pricing query failed for ${serviceId}:`, error);
      throw error;
    }
  }

  async getAzurePricing(filter = '') {
    const url = `${this.providers.azure.baseUrl}${filter ? `?$filter=${encodeURIComponent(filter)}` : ''}`;
    
    try {
      const response = await fetch(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'AltaMedicaKnowledgeEngine/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Azure Pricing API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Azure pricing query failed:', error);
      throw error;
    }
  }
}

class MedicalDataConnector {
  constructor(config) {
    this.dailyMedBaseUrl = 'https://dailymed.nlm.nih.gov/dailymed/services/v2';
    this.snomedBaseUrl = config?.snomed?.baseUrl || 'https://browser.ihtsdotools.org/snowstorm/snomed-ct';
    this.loincBaseUrl = config?.loinc?.baseUrl || 'https://fhir.loinc.org';
    this.maudeBaseUrl = 'https://api.fda.gov/device/event.json';
    this.timeout = config?.timeout || 30000;
    this.apiKeys = {
      fda: config?.fda?.apiKey || process.env.FDA_API_KEY
    };
  }

  async getDailyMedDrugInfo(drugName) {
    const url = `${this.dailyMedBaseUrl}/spls.json?drug_name=${encodeURIComponent(drugName)}`;
    
    try {
      const response = await fetch(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'AltaMedicaKnowledgeEngine/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`DailyMed API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`DailyMed query failed for ${drugName}:`, error);
      throw error;
    }
  }

  async searchSNOMED(term, limit = 50) {
    const url = `${this.snomedBaseUrl}/browser/MAIN/concepts?term=${encodeURIComponent(term)}&limit=${limit}`;
    
    try {
      const response = await fetch(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'AltaMedicaKnowledgeEngine/1.0',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`SNOMED CT API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`SNOMED search failed for ${term}:`, error);
      throw error;
    }
  }

  async searchLOINC(component, limit = 50) {
    const url = `${this.loincBaseUrl}/CodeSystem/$lookup?system=http://loinc.org&component=${encodeURIComponent(component)}&_format=json`;
    
    try {
      const response = await fetch(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'AltaMedicaKnowledgeEngine/1.0',
          'Accept': 'application/fhir+json'
        }
      });

      if (!response.ok) {
        throw new Error(`LOINC API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`LOINC search failed for ${component}:`, error);
      throw error;
    }
  }

  async getFDAMAUDEEvents(deviceName, dateRange) {
    let url = `${this.maudeBaseUrl}?search=device_name:"${encodeURIComponent(deviceName)}"`;
    
    if (dateRange) {
      url += `+AND+date_received:[${dateRange.start}+TO+${dateRange.end}]`;
    }

    if (this.apiKeys.fda) {
      url += `&api_key=${this.apiKeys.fda}`;
    }

    try {
      const response = await fetch(url, {
        timeout: this.timeout,
        headers: {
          'User-Agent': 'AltaMedicaKnowledgeEngine/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`FDA MAUDE API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`FDA MAUDE query failed for ${deviceName}:`, error);
      throw error;
    }
  }
}

/**
 * Hardened Knowledge Ingestion Engine
 */
class HardenedKnowledgeIngestionEngine extends EventEmitter {
  constructor(config) {
    super();
    
    this.config = config;
    this.schemaValidator = new SourceSchemaValidator();
    this.signatureValidator = new SignatureValidator(config?.signature);
    
    // Initialize real connectors
    this.osvConnector = new OSVConnector(config?.osv);
    this.cloudPricingConnector = new CloudPricingConnector(config?.cloudPricing);
    this.medicalDataConnector = new MedicalDataConnector(config?.medicalData);
    
    // Cache and rate limiting
    this.cache = new Map();
    this.cacheTTL = config?.cacheTTL || 3600000; // 1 hour
    this.rateLimits = new Map();
    this.maxRequestsPerMinute = config?.maxRequestsPerMinute || 60;
    
    // Data integrity
    this.dataIntegrityChecks = config?.dataIntegrityChecks !== false;
    this.encryptSensitiveData = config?.encryptSensitiveData !== false;
    
    this.initializeSourceMonitoring();
  }

  initializeSourceMonitoring() {
    // Monitor source health and availability
    setInterval(() => {
      this.performHealthChecks();
    }, 300000); // Every 5 minutes
  }

  async performHealthChecks() {
    const sources = [
      { name: 'OSV.dev', check: () => this.osvConnector.makeRequest('/vulns/OSV-2021-1052', { method: 'GET' }) },
      { name: 'AWS Pricing', check: () => this.cloudPricingConnector.getAWSPricing('AmazonEC2') },
      { name: 'DailyMed', check: () => this.medicalDataConnector.getDailyMedDrugInfo('aspirin') }
    ];

    const healthResults = new Map();

    for (const source of sources) {
      try {
        await source.check();
        healthResults.set(source.name, { status: 'healthy', lastCheck: Date.now() });
      } catch (error) {
        healthResults.set(source.name, { 
          status: 'unhealthy', 
          lastCheck: Date.now(), 
          error: error.message 
        });
      }
    }

    this.emit('health_check_completed', healthResults);
  }

  async queryVulnerabilities(ecosystem, packageName, options = {}) {
    const cacheKey = `vuln_${ecosystem}_${packageName}`;
    
    // Check rate limits
    if (!this.checkRateLimit('osv', options.bypassRateLimit)) {
      throw new Error('Rate limit exceeded for vulnerability queries');
    }

    // Check cache
    const cached = this.getFromCache(cacheKey);
    if (cached && !options.forceRefresh) {
      return cached;
    }

    try {
      const vulnerabilities = await this.osvConnector.queryVulnerabilities(ecosystem, packageName, options.version);
      
      // Validate each vulnerability against schema
      const validatedVulns = [];
      for (const vuln of vulnerabilities) {
        const validation = this.schemaValidator.validate('osv_vulnerability', vuln);
        if (validation.valid) {
          validatedVulns.push(vuln);
        } else {
          console.warn(`Invalid vulnerability data for ${vuln.id}:`, validation.errors);
        }
      }

      // Cache validated results
      this.setCache(cacheKey, validatedVulns);
      
      this.emit('vulnerabilities_fetched', {
        ecosystem,
        packageName,
        count: validatedVulns.length,
        source: 'osv.dev'
      });

      return validatedVulns;
    } catch (error) {
      this.emit('source_error', {
        source: 'osv.dev',
        operation: 'queryVulnerabilities',
        error: error.message
      });
      throw error;
    }
  }

  async getCloudPricing(provider, service, region = 'us-east-1', options = {}) {
    const cacheKey = `pricing_${provider}_${service}_${region}`;
    
    if (!this.checkRateLimit('cloud_pricing', options.bypassRateLimit)) {
      throw new Error('Rate limit exceeded for pricing queries');
    }

    const cached = this.getFromCache(cacheKey);
    if (cached && !options.forceRefresh) {
      return cached;
    }

    let pricing;
    try {
      switch (provider.toLowerCase()) {
        case 'aws':
          pricing = await this.cloudPricingConnector.getAWSPricing(service, region);
          break;
        case 'gcp':
          pricing = await this.cloudPricingConnector.getGCPPricing(service);
          break;
        case 'azure':
          pricing = await this.cloudPricingConnector.getAzurePricing(`serviceName eq '${service}'`);
          break;
        default:
          throw new Error(`Unsupported cloud provider: ${provider}`);
      }

      // Validate pricing data
      if (provider.toLowerCase() === 'aws') {
        const validation = this.schemaValidator.validate('aws_pricing', pricing);
        if (!validation.valid) {
          console.warn(`Invalid pricing data from ${provider}:`, validation.errors);
        }
      }

      this.setCache(cacheKey, pricing);
      
      this.emit('pricing_fetched', {
        provider,
        service,
        region,
        source: `${provider}_pricing_api`
      });

      return pricing;
    } catch (error) {
      this.emit('source_error', {
        source: `${provider}_pricing_api`,
        operation: 'getPricing',
        error: error.message
      });
      throw error;
    }
  }

  async getMedicalTerminology(term, terminologySystem, options = {}) {
    const cacheKey = `medical_${terminologySystem}_${term}`;
    
    if (!this.checkRateLimit('medical_data', options.bypassRateLimit)) {
      throw new Error('Rate limit exceeded for medical data queries');
    }

    const cached = this.getFromCache(cacheKey);
    if (cached && !options.forceRefresh) {
      return cached;
    }

    let results;
    try {
      switch (terminologySystem.toLowerCase()) {
        case 'snomed':
        case 'snomed_ct':
          results = await this.medicalDataConnector.searchSNOMED(term, options.limit);
          break;
        case 'loinc':
          results = await this.medicalDataConnector.searchLOINC(term, options.limit);
          break;
        default:
          throw new Error(`Unsupported terminology system: ${terminologySystem}`);
      }

      // Validate medical terminology data
      if (terminologySystem.toLowerCase().includes('snomed') && results.items) {
        for (const item of results.items) {
          const validation = this.schemaValidator.validate('snomed_ct', item);
          if (!validation.valid) {
            console.warn(`Invalid SNOMED data for ${item.conceptId}:`, validation.errors);
          }
        }
      }

      this.setCache(cacheKey, results);
      
      this.emit('medical_terminology_fetched', {
        term,
        terminologySystem,
        resultCount: results.items?.length || 0,
        source: `${terminologySystem}_api`
      });

      return results;
    } catch (error) {
      this.emit('source_error', {
        source: `${terminologySystem}_api`,
        operation: 'getMedicalTerminology',
        error: error.message
      });
      throw error;
    }
  }

  async getDrugInformation(drugName, options = {}) {
    const cacheKey = `drug_${drugName}`;
    
    if (!this.checkRateLimit('medical_data', options.bypassRateLimit)) {
      throw new Error('Rate limit exceeded for drug information queries');
    }

    const cached = this.getFromCache(cacheKey);
    if (cached && !options.forceRefresh) {
      return cached;
    }

    try {
      const drugData = await this.medicalDataConnector.getDailyMedDrugInfo(drugName);
      
      // Validate drug data
      if (drugData.data) {
        for (const drug of drugData.data) {
          const validation = this.schemaValidator.validate('nih_dailymed', drug);
          if (!validation.valid) {
            console.warn(`Invalid drug data for ${drug.setid}:`, validation.errors);
          }
        }
      }

      this.setCache(cacheKey, drugData);
      
      this.emit('drug_information_fetched', {
        drugName,
        resultCount: drugData.data?.length || 0,
        source: 'nih_dailymed'
      });

      return drugData;
    } catch (error) {
      this.emit('source_error', {
        source: 'nih_dailymed',
        operation: 'getDrugInformation',
        error: error.message
      });
      throw error;
    }
  }

  async getAdverseEvents(deviceName, dateRange, options = {}) {
    const cacheKey = `maude_${deviceName}_${dateRange?.start || 'all'}_${dateRange?.end || 'all'}`;
    
    if (!this.checkRateLimit('medical_data', options.bypassRateLimit)) {
      throw new Error('Rate limit exceeded for adverse event queries');
    }

    const cached = this.getFromCache(cacheKey);
    if (cached && !options.forceRefresh) {
      return cached;
    }

    try {
      const adverseEvents = await this.medicalDataConnector.getFDAMAUDEEvents(deviceName, dateRange);
      
      // Validate adverse event data
      if (adverseEvents.results) {
        for (const event of adverseEvents.results) {
          const validation = this.schemaValidator.validate('fda_maude', event);
          if (!validation.valid) {
            console.warn(`Invalid MAUDE data for ${event.mdr_report_key}:`, validation.errors);
          }
        }
      }

      this.setCache(cacheKey, adverseEvents);
      
      this.emit('adverse_events_fetched', {
        deviceName,
        dateRange,
        resultCount: adverseEvents.results?.length || 0,
        source: 'fda_maude'
      });

      return adverseEvents;
    } catch (error) {
      this.emit('source_error', {
        source: 'fda_maude',
        operation: 'getAdverseEvents',
        error: error.message
      });
      throw error;
    }
  }

  checkRateLimit(sourceType, bypass = false) {
    if (bypass) return true;

    const now = Date.now();
    const window = 60000; // 1 minute
    const key = `${sourceType}_${Math.floor(now / window)}`;
    
    const currentCount = this.rateLimits.get(key) || 0;
    if (currentCount >= this.maxRequestsPerMinute) {
      return false;
    }

    this.rateLimits.set(key, currentCount + 1);
    
    // Clean old rate limit entries
    for (const [limitKey] of this.rateLimits) {
      const keyTime = parseInt(limitKey.split('_').pop());
      if (now - (keyTime * window) > window * 2) {
        this.rateLimits.delete(limitKey);
      }
    }

    return true;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Limit cache size
    if (this.cache.size > 1000) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  clearCache() {
    this.cache.clear();
    this.emit('cache_cleared');
  }

  getSourceStats() {
    const stats = {
      cacheSize: this.cache.size,
      rateLimits: Object.fromEntries(this.rateLimits),
      totalRequests: 0,
      errors: 0
    };

    return stats;
  }
}

module.exports = {
  HardenedKnowledgeIngestionEngine,
  SourceSchemaValidator,
  SignatureValidator,
  OSVConnector,
  CloudPricingConnector,
  MedicalDataConnector
};
