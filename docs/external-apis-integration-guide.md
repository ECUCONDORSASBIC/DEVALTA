# External Medical APIs Integration Guide - Altamedica

## 📋 Overview

This guide provides detailed instructions for integrating external medical APIs into the Altamedica platform. The integration includes FHIR servers, HL7 brokers, drug databases, and IoMT device gateways with proper authentication, rate limiting, and compliance measures.

## 🏗️ Architecture Overview

```
Altamedica Platform
├── API Gateway (Kong/AWS API Gateway)
│   ├── Rate Limiting
│   ├── Authentication
│   └── Request/Response Transformation
├── External API Integrations
│   ├── FHIR Servers (Epic, Cerner, HAPI)
│   ├── HL7 Brokers (Mirth Connect, Rhapsody)
│   ├── Drug Databases (RxNorm, FDA, FDB)
│   ├── IoMT Gateways (Philips, GE, Medtronic)
│   ├── Laboratory Systems (LabCorp, Quest)
│   └── Imaging Systems (DICOM servers)
└── Security Layer
    ├── OAuth2/SMART on FHIR
    ├── mTLS for high-security connections
    └── API Key management
```

## 🔐 Authentication Setup

### 1. OAuth2 with SMART on FHIR

For FHIR servers that support SMART on FHIR:

```javascript
// OAuth2 configuration for Epic FHIR
const epicConfig = {
  clientId: process.env.EPIC_CLIENT_ID,
  clientSecret: process.env.EPIC_CLIENT_SECRET,
  redirectUri: 'https://api.altamedica.com/auth/epic/callback',
  scope: 'patient/*.read user/*.read',
  authorizationUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
  tokenUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
  baseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4'
};

// OAuth2 client setup
const { AuthorizationCode } = require('simple-oauth2');

const client = new AuthorizationCode({
  client: {
    id: epicConfig.clientId,
    secret: epicConfig.clientSecret,
  },
  auth: {
    tokenHost: 'https://fhir.epic.com',
    tokenPath: '/interconnect-fhir-oauth/oauth2/token',
    authorizePath: '/interconnect-fhir-oauth/oauth2/authorize',
  },
});

// Generate authorization URL
const authorizationUri = client.authorizeURL({
  redirect_uri: epicConfig.redirectUri,
  scope: epicConfig.scope,
  state: 'random-state-string',
  aud: epicConfig.baseUrl
});
```

### 2. mTLS Configuration

For high-security connections (HL7 brokers, laboratory systems):

```javascript
const https = require('https');
const fs = require('fs');

// mTLS configuration
const mTLSOptions = {
  key: fs.readFileSync(process.env.CLIENT_KEY_PATH),
  cert: fs.readFileSync(process.env.CLIENT_CERT_PATH),
  ca: fs.readFileSync(process.env.CA_CERT_PATH),
  rejectUnauthorized: true,
  requestCert: true,
  agent: false
};

// Example HL7 Mirth Connect connection
async function sendHL7Message(message) {
  return new Promise((resolve, reject) => {
    const options = {
      ...mTLSOptions,
      hostname: 'mirth.hospital.com',
      port: 6661,
      method: 'POST',
      headers: {
        'Content-Type': 'application/hl7-v2',
        'Content-Length': Buffer.byteLength(message)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.write(message);
    req.end();
  });
}
```

### 3. API Key Management

```javascript
// Centralized API key management
class APIKeyManager {
  constructor() {
    this.keys = {
      fda: process.env.FDA_API_KEY,
      datadog: process.env.DATADOG_API_KEY,
      ge_healthcare: process.env.GE_HEALTHCARE_API_KEY,
      philips: process.env.PHILIPS_API_KEY
    };
  }

  getKey(provider) {
    return this.keys[provider];
  }

  addAuthHeaders(provider, headers = {}) {
    const key = this.getKey(provider);
    if (key) {
      return {
        ...headers,
        'X-API-Key': key,
        'Authorization': `Bearer ${key}`
      };
    }
    return headers;
  }
}

const apiKeyManager = new APIKeyManager();
```

## 🌐 FHIR Server Integration

### 1. HAPI FHIR Server (Open Source)

```javascript
class HAPIFHIRClient {
  constructor() {
    this.baseUrl = 'https://hapi.fhir.org/baseR4';
    this.rateLimiter = new RateLimiter(1000, 'hour'); // 1000 requests/hour
  }

  async getPatients(params = {}) {
    await this.rateLimiter.waitForToken();
    
    const queryParams = new URLSearchParams({
      _format: 'json',
      _count: params.count || 20,
      ...params
    });

    const response = await fetch(`${this.baseUrl}/Patient?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`HAPI FHIR error: ${response.status}`);
    }

    return await response.json();
  }

  async getObservations(patientId, category) {
    await this.rateLimiter.waitForToken();
    
    const queryParams = new URLSearchParams({
      patient: patientId,
      category: category,
      _format: 'json',
      _sort: '-date'
    });

    const response = await fetch(`${this.baseUrl}/Observation?${queryParams}`);
    return await response.json();
  }
}
```

### 2. Epic FHIR Integration

```javascript
class EpicFHIRClient {
  constructor(accessToken) {
    this.baseUrl = 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4';
    this.accessToken = accessToken;
    this.rateLimiter = new RateLimiter(120, 'minute'); // 120 requests/minute
  }

  async makeRequest(endpoint, params = {}) {
    await this.rateLimiter.waitForToken();
    
    const queryParams = new URLSearchParams(params);
    const url = `${this.baseUrl}${endpoint}?${queryParams}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/fhir+json',
        'Epic-Client-ID': process.env.EPIC_CLIENT_ID
      }
    });

    if (!response.ok) {
      throw new Error(`Epic FHIR error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async getPatient(patientId) {
    return await this.makeRequest(`/Patient/${patientId}`);
  }

  async getPatientEverything(patientId) {
    return await this.makeRequest(`/Patient/${patientId}/$everything`);
  }
}
```

## 🔄 HL7 Message Processing

### 1. HL7 v2.5 Message Builder

```javascript
class HL7MessageBuilder {
  constructor() {
    this.segments = [];
    this.fieldSeparator = '|';
    this.componentSeparator = '^';
    this.repetitionSeparator = '~';
    this.escapeCharacter = '\\';
    this.subComponentSeparator = '&';
  }

  addMSH(sendingApplication, receivingApplication) {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
    const messageControlId = `MSG${Date.now()}`;
    
    const msh = [
      'MSH',
      this.fieldSeparator,
      `${this.componentSeparator}${this.repetitionSeparator}${this.escapeCharacter}${this.subComponentSeparator}`,
      sendingApplication,
      '',
      receivingApplication,
      '',
      timestamp,
      '',
      'ADT^A08^ADT_A01',
      messageControlId,
      'P',
      '2.5'
    ].join(this.fieldSeparator);
    
    this.segments.push(msh);
    return this;
  }

  addPID(patientId, lastName, firstName, dateOfBirth, gender) {
    const pid = [
      'PID',
      '1',
      '',
      patientId,
      '',
      `${lastName}^${firstName}`,
      '',
      dateOfBirth,
      gender
    ].join(this.fieldSeparator);
    
    this.segments.push(pid);
    return this;
  }

  addPV1(patientClass, assignedPatientLocation, admittingDoctor) {
    const pv1 = [
      'PV1',
      '1',
      patientClass,
      assignedPatientLocation,
      '',
      '',
      '',
      admittingDoctor
    ].join(this.fieldSeparator);
    
    this.segments.push(pv1);
    return this;
  }

  build() {
    return this.segments.join('\r');
  }
}

// Usage example
const message = new HL7MessageBuilder()
  .addMSH('ALTAMEDICA', 'HIS')
  .addPID('12345', 'Doe', 'John', '19850315', 'M')
  .addPV1('I', 'ICU^101^A', 'DR123^Smith^Jane')
  .build();
```

### 2. HL7 Message Parser

```javascript
class HL7MessageParser {
  constructor(message) {
    this.message = message;
    this.segments = message.split('\r').filter(seg => seg.length > 0);
  }

  parseSegment(segmentType) {
    const segment = this.segments.find(seg => seg.startsWith(segmentType));
    if (!segment) return null;

    const fields = segment.split('|');
    return fields;
  }

  getMSH() {
    const msh = this.parseSegment('MSH');
    if (!msh) return null;

    return {
      fieldSeparator: msh[1],
      encodingCharacters: msh[2],
      sendingApplication: msh[3],
      sendingFacility: msh[4],
      receivingApplication: msh[5],
      receivingFacility: msh[6],
      timestamp: msh[7],
      messageType: msh[9],
      messageControlId: msh[10],
      processingId: msh[11],
      versionId: msh[12]
    };
  }

  getPID() {
    const pid = this.parseSegment('PID');
    if (!pid) return null;

    return {
      setId: pid[1],
      patientId: pid[3],
      patientName: pid[5],
      dateOfBirth: pid[7],
      gender: pid[8]
    };
  }

  generateACK(ackCode = 'AA', textMessage = '') {
    const msh = this.getMSH();
    if (!msh) throw new Error('Invalid HL7 message - missing MSH segment');

    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
    
    const ackMessage = [
      `MSH|^~\\&|${msh.receivingApplication}|${msh.receivingFacility}|${msh.sendingApplication}|${msh.sendingFacility}|${timestamp}||ACK^A08^ACK|ACK${Date.now()}|P|2.5`,
      `MSA|${ackCode}|${msh.messageControlId}|${textMessage}`
    ].join('\r');

    return ackMessage;
  }
}
```

## 💊 Drug Database Integration

### 1. RxNorm Integration

```javascript
class RxNormClient {
  constructor() {
    this.baseUrl = 'https://rxnav.nlm.nih.gov/REST';
    this.rateLimiter = new RateLimiter(20, 'second'); // 20 requests/second
  }

  async searchDrugs(drugName, allSources = false) {
    await this.rateLimiter.waitForToken();
    
    const params = new URLSearchParams({
      name: drugName,
      allsrc: allSources ? '1' : '0'
    });

    const response = await fetch(`${this.baseUrl}/drugs.json?${params}`);
    
    if (!response.ok) {
      throw new Error(`RxNorm API error: ${response.status}`);
    }

    return await response.json();
  }

  async getDrugInteractions(rxcui) {
    await this.rateLimiter.waitForToken();
    
    const response = await fetch(`${this.baseUrl}/interaction/interaction.json?rxcui=${rxcui}`);
    
    if (!response.ok) {
      throw new Error(`RxNorm API error: ${response.status}`);
    }

    const data = await response.json();
    return data.interactionTypeGroup || [];
  }

  async getNDCs(rxcui) {
    await this.rateLimiter.waitForToken();
    
    const response = await fetch(`${this.baseUrl}/rxcui/${rxcui}/ndcs.json`);
    return await response.json();
  }
}
```

### 2. FDA Orange Book Integration

```javascript
class FDAClient {
  constructor() {
    this.baseUrl = 'https://api.fda.gov/drug';
    this.apiKey = process.env.FDA_API_KEY;
    this.rateLimiter = new RateLimiter(240, 'minute'); // 240 requests/minute with API key
  }

  async searchDrugs(searchQuery, limit = 100) {
    await this.rateLimiter.waitForToken();
    
    const params = new URLSearchParams({
      search: searchQuery,
      limit: limit
    });

    if (this.apiKey) {
      params.append('api_key', this.apiKey);
    }

    const response = await fetch(`${this.baseUrl}/drugsfda.json?${params}`);
    
    if (!response.ok) {
      throw new Error(`FDA API error: ${response.status}`);
    }

    return await response.json();
  }

  async getAdverseEvents(drugName, limit = 100) {
    await this.rateLimiter.waitForToken();
    
    const params = new URLSearchParams({
      search: `patient.drug.medicinalproduct:"${drugName}"`,
      limit: limit
    });

    if (this.apiKey) {
      params.append('api_key', this.apiKey);
    }

    const response = await fetch(`${this.baseUrl}/event.json?${params}`);
    return await response.json();
  }
}
```

## 🏥 IoMT Device Integration

### 1. Philips HealthSuite Integration

```javascript
class PhilipsHealthSuiteClient {
  constructor(accessToken, clientCert, clientKey) {
    this.baseUrl = 'https://api.healthsuite.philips.com/v1';
    this.accessToken = accessToken;
    this.rateLimiter = new RateLimiter(100, 'minute'); // 100 requests/minute
    
    // mTLS configuration
    this.httpsAgent = new https.Agent({
      cert: clientCert,
      key: clientKey,
      rejectUnauthorized: true
    });
  }

  async getDeviceData(deviceId, dataTypes, startTime, endTime) {
    await this.rateLimiter.waitForToken();
    
    const requestBody = {
      device_id: deviceId,
      data_types: dataTypes,
      start_time: startTime,
      end_time: endTime
    };

    const response = await fetch(`${this.baseUrl}/devices/data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Philips-Client-ID': process.env.PHILIPS_CLIENT_ID
      },
      body: JSON.stringify(requestBody),
      agent: this.httpsAgent
    });

    if (!response.ok) {
      throw new Error(`Philips HealthSuite error: ${response.status}`);
    }

    return await response.json();
  }

  async getVitalSigns(patientId, deviceId) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    return await this.getDeviceData(
      deviceId,
      ['vital_signs'],
      oneHourAgo.toISOString(),
      now.toISOString()
    );
  }

  async subscribeToAlerts(deviceId, webhookUrl) {
    await this.rateLimiter.waitForToken();
    
    const subscriptionData = {
      device_id: deviceId,
      event_types: ['critical_alert', 'warning_alert'],
      webhook_url: webhookUrl,
      secret: process.env.WEBHOOK_SECRET
    };

    const response = await fetch(`${this.baseUrl}/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscriptionData),
      agent: this.httpsAgent
    });

    return await response.json();
  }
}
```

### 2. GE Healthcare Edison Platform

```javascript
class GEHealthcareClient {
  constructor(accessToken, apiKey) {
    this.baseUrl = 'https://api.gehealthcare.com/edison/v1';
    this.accessToken = accessToken;
    this.apiKey = apiKey;
    this.rateLimiter = new RateLimiter(200, 'minute'); // 200 requests/minute
  }

  async getDeviceData(deviceId, dataType = 'vital_signs') {
    await this.rateLimiter.waitForToken();
    
    const params = new URLSearchParams({
      device_id: deviceId,
      data_type: dataType
    });

    const response = await fetch(`${this.baseUrl}/devices?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-API-Key': this.apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`GE Healthcare error: ${response.status}`);
    }

    return await response.json();
  }

  async getImagingStudies(patientId, modality) {
    await this.rateLimiter.waitForToken();
    
    const params = new URLSearchParams({
      patient_id: patientId,
      modality: modality
    });

    const response = await fetch(`${this.baseUrl}/imaging/studies?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-API-Key': this.apiKey
      }
    });

    return await response.json();
  }
}
```

## 🧪 Laboratory System Integration

### 1. LabCorp Integration

```javascript
class LabCorpClient {
  constructor(accessToken, clientCert, clientKey) {
    this.baseUrl = 'https://api.labcorp.com/fhir/R4';
    this.accessToken = accessToken;
    this.rateLimiter = new RateLimiter(500, 'hour'); // 500 requests/hour
    
    // mTLS configuration
    this.httpsAgent = new https.Agent({
      cert: clientCert,
      key: clientKey,
      rejectUnauthorized: true
    });
  }

  async getLabResults(patientId, testType, dateRange) {
    await this.rateLimiter.waitForToken();
    
    const params = new URLSearchParams({
      patient: patientId,
      category: this.mapTestTypeToCategory(testType),
      date: dateRange
    });

    const response = await fetch(`${this.baseUrl}/DiagnosticReport?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/fhir+json',
        'X-LabCorp-Client-ID': process.env.LABCORP_CLIENT_ID
      },
      agent: this.httpsAgent
    });

    if (!response.ok) {
      throw new Error(`LabCorp API error: ${response.status}`);
    }

    return await response.json();
  }

  mapTestTypeToCategory(testType) {
    const mapping = {
      'blood_work': 'LAB',
      'urinalysis': 'LAB',
      'pathology': 'PAT',
      'genetics': 'GE'
    };
    return mapping[testType] || 'LAB';
  }

  async orderTest(patientId, testCode, priority = 'routine') {
    await this.rateLimiter.waitForToken();
    
    const serviceRequest = {
      resourceType: 'ServiceRequest',
      status: 'active',
      intent: 'order',
      priority: priority,
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: testCode
        }]
      },
      subject: {
        reference: `Patient/${patientId}`
      },
      authoredOn: new Date().toISOString()
    };

    const response = await fetch(`${this.baseUrl}/ServiceRequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/fhir+json'
      },
      body: JSON.stringify(serviceRequest),
      agent: this.httpsAgent
    });

    return await response.json();
  }
}
```

## 📊 Rate Limiting and Monitoring

### 1. Rate Limiter Implementation

```javascript
class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests;
    this.timeWindow = this.parseTimeWindow(timeWindow);
    this.requests = [];
  }

  parseTimeWindow(window) {
    const units = {
      'second': 1000,
      'minute': 60 * 1000,
      'hour': 60 * 60 * 1000,
      'day': 24 * 60 * 60 * 1000
    };
    return units[window] || units.hour;
  }

  async waitForToken() {
    const now = Date.now();
    
    // Remove old requests outside the time window
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.timeWindow
    );
    
    // Check if we can make a request
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return;
    }
    
    // Calculate wait time
    const oldestRequest = Math.min(...this.requests);
    const waitTime = this.timeWindow - (now - oldestRequest);
    
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.waitForToken();
    }
    
    this.requests.push(now);
  }

  getStats() {
    const now = Date.now();
    const recentRequests = this.requests.filter(
      timestamp => now - timestamp < this.timeWindow
    );
    
    return {
      currentRequests: recentRequests.length,
      maxRequests: this.maxRequests,
      remaining: this.maxRequests - recentRequests.length,
      resetTime: recentRequests.length > 0 ? 
        Math.min(...recentRequests) + this.timeWindow : now
    };
  }
}
```

### 2. API Monitoring and Alerting

```javascript
class APIMonitor {
  constructor() {
    this.metrics = new Map();
    this.alerts = [];
  }

  recordRequest(apiName, responseTime, statusCode, error = null) {
    if (!this.metrics.has(apiName)) {
      this.metrics.set(apiName, {
        totalRequests: 0,
        successRequests: 0,
        errorRequests: 0,
        totalResponseTime: 0,
        averageResponseTime: 0,
        lastError: null,
        lastErrorTime: null
      });
    }

    const metric = this.metrics.get(apiName);
    metric.totalRequests++;
    metric.totalResponseTime += responseTime;
    metric.averageResponseTime = metric.totalResponseTime / metric.totalRequests;

    if (statusCode >= 200 && statusCode < 300) {
      metric.successRequests++;
    } else {
      metric.errorRequests++;
      metric.lastError = error;
      metric.lastErrorTime = new Date();
    }

    this.checkAlerts(apiName, metric);
  }

  checkAlerts(apiName, metric) {
    const errorRate = metric.errorRequests / metric.totalRequests;
    
    // High error rate alert
    if (errorRate > 0.1 && metric.totalRequests > 10) {
      this.triggerAlert({
        type: 'HIGH_ERROR_RATE',
        api: apiName,
        errorRate: errorRate,
        message: `High error rate detected for ${apiName}: ${(errorRate * 100).toFixed(2)}%`
      });
    }

    // Slow response time alert
    if (metric.averageResponseTime > 5000) {
      this.triggerAlert({
        type: 'SLOW_RESPONSE',
        api: apiName,
        averageResponseTime: metric.averageResponseTime,
        message: `Slow response time for ${apiName}: ${metric.averageResponseTime}ms`
      });
    }
  }

  triggerAlert(alert) {
    console.error('API Alert:', alert);
    this.alerts.push({
      ...alert,
      timestamp: new Date()
    });

    // Send to monitoring service (Datadog, New Relic, etc.)
    this.sendToMonitoringService(alert);
  }

  async sendToMonitoringService(alert) {
    // Example: Send to Datadog
    try {
      await fetch('https://api.datadoghq.com/api/v1/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': process.env.DATADOG_API_KEY
        },
        body: JSON.stringify({
          title: `API Alert: ${alert.type}`,
          text: alert.message,
          alert_type: 'error',
          source_type_name: 'altamedica-api',
          tags: [`api:${alert.api}`, `type:${alert.type}`]
        })
      });
    } catch (error) {
      console.error('Failed to send alert to monitoring service:', error);
    }
  }

  getMetrics() {
    const result = {};
    for (const [apiName, metric] of this.metrics) {
      result[apiName] = {
        ...metric,
        errorRate: metric.totalRequests > 0 ? 
          (metric.errorRequests / metric.totalRequests) : 0,
        successRate: metric.totalRequests > 0 ? 
          (metric.successRequests / metric.totalRequests) : 0
      };
    }
    return result;
  }
}

// Global monitor instance
const apiMonitor = new APIMonitor();
```

## 🔄 Integration Orchestrator

```javascript
class MedicalAPIOrchestrator {
  constructor() {
    this.clients = {
      fhir: {
        hapi: new HAPIFHIRClient(),
        epic: null, // Initialized with OAuth token
        cerner: null // Initialized with OAuth token
      },
      drugs: {
        rxnorm: new RxNormClient(),
        fda: new FDAClient()
      },
      iomt: {
        philips: null, // Initialized with certificates
        ge: null // Initialized with OAuth + API key
      },
      lab: {
        labcorp: null, // Initialized with OAuth + mTLS
        quest: null // Initialized with OAuth + mTLS
      }
    };
    
    this.monitor = new APIMonitor();
  }

  async getPatientData(patientId, sources = ['fhir']) {
    const results = {};
    const promises = [];

    for (const source of sources) {
      if (source === 'fhir') {
        promises.push(
          this.fetchFHIRData(patientId)
            .then(data => { results.fhir = data; })
            .catch(error => { results.fhir = { error: error.message }; })
        );
      }
      
      if (source === 'lab') {
        promises.push(
          this.fetchLabData(patientId)
            .then(data => { results.lab = data; })
            .catch(error => { results.lab = { error: error.message }; })
        );
      }
      
      if (source === 'iomt') {
        promises.push(
          this.fetchIoMTData(patientId)
            .then(data => { results.iomt = data; })
            .catch(error => { results.iomt = { error: error.message }; })
        );
      }
    }

    await Promise.all(promises);
    return results;
  }

  async fetchFHIRData(patientId) {
    const data = {};
    
    // Try HAPI FHIR first (always available)
    try {
      const patient = await this.clients.fhir.hapi.getPatients({ 
        _id: patientId 
      });
      data.patient = patient;
      
      const observations = await this.clients.fhir.hapi.getObservations(
        patientId, 
        'vital-signs'
      );
      data.vitals = observations;
    } catch (error) {
      console.error('HAPI FHIR error:', error);
    }

    // Try Epic if available
    if (this.clients.fhir.epic) {
      try {
        const epicData = await this.clients.fhir.epic.getPatientEverything(patientId);
        data.epic = epicData;
      } catch (error) {
        console.error('Epic FHIR error:', error);
      }
    }

    return data;
  }

  async fetchLabData(patientId) {
    const data = {};
    
    if (this.clients.lab.labcorp) {
      try {
        const labResults = await this.clients.lab.labcorp.getLabResults(
          patientId, 
          'blood_work',
          'ge2023-01-01'
        );
        data.labcorp = labResults;
      } catch (error) {
        console.error('LabCorp error:', error);
      }
    }

    return data;
  }

  async fetchIoMTData(patientId) {
    const data = {};
    
    if (this.clients.iomt.philips) {
      try {
        // Assume we have device mapping for patient
        const deviceId = await this.getPatientDeviceId(patientId, 'philips');
        if (deviceId) {
          const deviceData = await this.clients.iomt.philips.getVitalSigns(
            patientId, 
            deviceId
          );
          data.philips = deviceData;
        }
      } catch (error) {
        console.error('Philips IoMT error:', error);
      }
    }

    return data;
  }

  async validateDrugInteractions(medications) {
    const interactions = [];
    
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        try {
          const drug1 = await this.clients.drugs.rxnorm.searchDrugs(medications[i]);
          const drug2 = await this.clients.drugs.rxnorm.searchDrugs(medications[j]);
          
          if (drug1.drugGroup && drug2.drugGroup) {
            const rxcui1 = drug1.drugGroup.conceptGroup[0]?.conceptProperties[0]?.rxcui;
            const rxcui2 = drug2.drugGroup.conceptGroup[0]?.conceptProperties[0]?.rxcui;
            
            if (rxcui1 && rxcui2) {
              const drug1Interactions = await this.clients.drugs.rxnorm.getDrugInteractions(rxcui1);
              
              // Check if drug2 is in drug1's interactions
              const interaction = this.findInteraction(drug1Interactions, rxcui2);
              if (interaction) {
                interactions.push({
                  drug1: medications[i],
                  drug2: medications[j],
                  interaction: interaction
                });
              }
            }
          }
        } catch (error) {
          console.error('Drug interaction check error:', error);
        }
      }
    }
    
    return interactions;
  }

  findInteraction(interactions, targetRxcui) {
    for (const typeGroup of interactions) {
      for (const type of typeGroup.interactionType || []) {
        for (const pair of type.interactionPair || []) {
          if (pair.interactionConcept?.some(concept => 
            concept.minConceptItem?.rxcui === targetRxcui
          )) {
            return {
              severity: pair.severity,
              description: pair.description
            };
          }
        }
      }
    }
    return null;
  }

  async getPatientDeviceId(patientId, provider) {
    // This would typically query your database for patient-device mappings
    // For demo purposes, returning mock data
    const deviceMappings = {
      'philips': `PH_${patientId}_MONITOR`,
      'ge': `GE_${patientId}_IMAGING`,
      'medtronic': `MT_${patientId}_PUMP`
    };
    
    return deviceMappings[provider];
  }

  getSystemStatus() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.monitor.getMetrics(),
      alerts: this.monitor.alerts.slice(-10), // Last 10 alerts
      clients: {
        fhir: {
          hapi: true,
          epic: !!this.clients.fhir.epic,
          cerner: !!this.clients.fhir.cerner
        },
        drugs: {
          rxnorm: true,
          fda: true
        },
        iomt: {
          philips: !!this.clients.iomt.philips,
          ge: !!this.clients.iomt.ge
        },
        lab: {
          labcorp: !!this.clients.lab.labcorp,
          quest: !!this.clients.lab.quest
        }
      }
    };
  }
}
```

## 🛠️ Environment Configuration

Create a `.env.external-apis` file with the following variables:

```bash
# FHIR Servers
EPIC_CLIENT_ID=your_epic_client_id
EPIC_CLIENT_SECRET=your_epic_client_secret
CERNER_CLIENT_ID=your_cerner_client_id
CERNER_CLIENT_SECRET=your_cerner_client_secret

# Drug Databases
FDA_API_KEY=your_fda_api_key
FIRST_DATABANK_CLIENT_ID=your_fdb_client_id
FIRST_DATABANK_CLIENT_SECRET=your_fdb_client_secret

# IoMT Gateways
PHILIPS_CLIENT_ID=your_philips_client_id
PHILIPS_CLIENT_SECRET=your_philips_client_secret
GE_HEALTHCARE_API_KEY=your_ge_api_key
MEDTRONIC_CLIENT_ID=your_medtronic_client_id

# Laboratory Systems
LABCORP_CLIENT_ID=your_labcorp_client_id
LABCORP_CLIENT_SECRET=your_labcorp_client_secret
QUEST_CLIENT_ID=your_quest_client_id
QUEST_CLIENT_SECRET=your_quest_client_secret

# Certificates (paths)
CLIENT_CERT_PATH=/path/to/client.crt
CLIENT_KEY_PATH=/path/to/client.key
CA_CERT_PATH=/path/to/ca.crt

# Monitoring
DATADOG_API_KEY=your_datadog_api_key
DATADOG_APP_KEY=your_datadog_app_key

# Webhooks
WEBHOOK_SECRET=your_webhook_secret
```

## 📝 Implementation Checklist

- [ ] Set up OAuth2 clients for FHIR servers (Epic, Cerner)
- [ ] Configure mTLS certificates for HL7 brokers and lab systems
- [ ] Implement rate limiting for all external APIs
- [ ] Set up monitoring and alerting
- [ ] Create patient-device mapping database
- [ ] Implement error handling and retry logic
- [ ] Set up webhook endpoints for real-time notifications
- [ ] Configure API gateway for request routing
- [ ] Implement data transformation and mapping
- [ ] Set up compliance logging and audit trails
- [ ] Test integration with sandbox environments
- [ ] Document API usage and limitations
- [ ] Create fallback mechanisms for high-availability
- [ ] Implement caching for frequently accessed data
- [ ] Set up automated testing for integration endpoints

## 🚀 Getting Started

1. **Install Dependencies**:
```bash
npm install axios simple-oauth2 hl7-standard rate-limiter-flexible
```

2. **Configure Environment**:
   - Copy `.env.external-apis` and fill in your API credentials
   - Set up SSL certificates for mTLS connections

3. **Initialize Orchestrator**:
```javascript
const orchestrator = new MedicalAPIOrchestrator();

// Initialize with OAuth tokens (after authentication flow)
await orchestrator.initializeClients({
  epic_token: 'your_epic_oauth_token',
  cerner_token: 'your_cerner_oauth_token',
  // ... other tokens and certificates
});
```

4. **Test Integration**:
```javascript
// Get comprehensive patient data
const patientData = await orchestrator.getPatientData('12345', [
  'fhir', 'lab', 'iomt'
]);

// Check drug interactions
const interactions = await orchestrator.validateDrugInteractions([
  'aspirin', 'warfarin', 'metformin'
]);

// Monitor system health
const status = orchestrator.getSystemStatus();
```

This integration guide provides a comprehensive foundation for connecting to external medical APIs while maintaining security, compliance, and reliability standards required for healthcare applications.
