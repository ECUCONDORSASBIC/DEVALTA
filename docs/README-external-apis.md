# External Medical APIs Collection - Altamedica Integration

## 📋 Overview

This repository contains a comprehensive catalog of external medical APIs for integration with the Altamedica healthcare platform. The collection includes detailed OpenAPI specifications, authentication schemes, rate limits, and integration guides for various healthcare systems and services.

## 📁 Collection Structure

```
docs/
├── external-medical-apis-collection.yaml  # Complete OpenAPI 3.0 specification
├── external-apis-integration-guide.md     # Detailed integration implementation guide
├── openapi-appointments.yaml              # Internal appointments API (existing)
└── README-external-apis.md                # This documentation
```

## 🏥 Covered API Categories

### 1. FHIR Servers
- **HAPI FHIR Server** (Open Source)
  - Base URL: `https://hapi.fhir.org/baseR4`
  - Authentication: None (public server)
  - Rate Limit: 1000 requests/hour
  - Standards: FHIR R4

- **Epic FHIR Sandbox**
  - Base URL: `https://fhir.epic.com/interconnect-fhir-oauth`
  - Authentication: OAuth2 with SMART on FHIR
  - Rate Limit: 120 requests/minute
  - Standards: FHIR R4

- **Cerner FHIR Sandbox** (Oracle Health)
  - Base URL: `https://fhir-ehr-code.cerner.com/r4/`
  - Authentication: OAuth2 with SMART on FHIR
  - Rate Limit: 60 requests/minute
  - Standards: FHIR R4

### 2. HL7 Brokers
- **Mirth Connect** (NextGen Healthcare)
  - Protocol: MLLP over TCP/IP
  - Authentication: mTLS with client certificates
  - Rate Limit: 500 messages/minute
  - Standards: HL7 v2.5

- **Rhapsody Integration Engine**
  - Supported Messages: ADT, ORM, ORU, SIU
  - Authentication: OAuth2 + API Key
  - Rate Limit: 1000 messages/hour
  - Standards: HL7 v2.5

### 3. Drug Databases
- **RxNorm** (National Library of Medicine)
  - Base URL: `https://rxnav.nlm.nih.gov/REST`
  - Authentication: None (public API)
  - Rate Limit: 20 requests/second
  - Coverage: Drug names, interactions, NDCs

- **FDA Orange Book**
  - Base URL: `https://api.fda.gov/drug/drugsfda.json`
  - Authentication: API Key (optional)
  - Rate Limit: 240 requests/minute
  - Coverage: Approved drug products

- **First Databank (FDB)**
  - Authentication: OAuth2 + Client Credentials
  - Rate Limit: 1000 requests/hour
  - Coverage: Comprehensive drug interactions
  - Cost: Commercial license required

### 4. IoMT Device Gateways
- **Philips HealthSuite Digital Platform**
  - Authentication: OAuth2 + mTLS
  - Rate Limit: 100 requests/minute
  - Devices: Patient monitors, ventilators, infusion pumps
  - Data Types: Vital signs, device status, alerts

- **GE Healthcare Edison Platform**
  - Authentication: OAuth2 + API Key
  - Rate Limit: 200 requests/minute
  - Devices: Imaging equipment, monitoring devices
  - Data Types: Vital signs, imaging, alerts

- **Medtronic CareLink**
  - Authentication: OAuth2 with PKCE
  - Rate Limit: 60 requests/hour
  - Devices: Insulin pumps, CGMs, pacemakers, ICDs
  - Data Types: Glucose readings, insulin delivery, cardiac data

### 5. Laboratory Systems
- **LabCorp API**
  - Authentication: OAuth2 + mTLS
  - Rate Limit: 500 requests/hour
  - Data Format: HL7 FHIR R4, HL7 v2.5
  - Services: Blood work, urinalysis, pathology, genetics

- **Quest Diagnostics**
  - Authentication: OAuth2 + Client Certificates
  - Rate Limit: 300 requests/hour
  - Standards: HL7 FHIR R4, HL7 v2.5
  - Services: Laboratory test results and reporting

### 6. Imaging Systems
- **DICOM Servers**
  - Protocol: DICOM C-FIND, C-MOVE, C-STORE
  - Authentication: DICOM security profiles
  - Rate Limit: 50 studies/hour
  - Standards: DICOM 3.0, IHE profiles
  - Modalities: CT, MR, US, XR, DX, CR, MG, PT, NM

## 🔐 Authentication Schemes

### OAuth2 with SMART on FHIR
- Used for: Epic, Cerner FHIR servers
- Flow: Authorization Code Grant
- Scopes: `patient/*.read`, `user/*.read`
- Security: PKCE recommended

### Mutual TLS (mTLS)
- Used for: HL7 brokers, Laboratory systems, High-security IoMT
- Requirements: Client certificates, CA certificates
- Security: End-to-end encryption with client authentication

### API Key Authentication
- Used for: FDA APIs, GE Healthcare, monitoring services
- Header: `X-API-Key` or `Authorization: Bearer <token>`
- Security: HTTPS required, key rotation recommended

### Client Credentials OAuth2
- Used for: Commercial drug databases, enterprise systems
- Flow: Client Credentials Grant
- Security: Client ID and secret authentication

## 📊 Rate Limiting Summary

| Provider | Rate Limit | Time Window | Burst Limit |
|----------|------------|-------------|-------------|
| HAPI FHIR | 1000 | hour | 100 |
| Epic FHIR | 120 | minute | 10 |
| Cerner FHIR | 60 | minute | 5 |
| RxNorm | 20 | second | 5 |
| FDA APIs | 240 | minute | 4 |
| First Databank | 1000 | hour | 50 |
| Philips HealthSuite | 100 | minute | 10 |
| GE Healthcare | 200 | minute | 20 |
| Medtronic CareLink | 60 | hour | 5 |
| LabCorp | 500 | hour | 25 |
| Quest Diagnostics | 300 | hour | 15 |

## 🛡️ Compliance and Security

### Standards Compliance
- **HIPAA**: Health Insurance Portability and Accountability Act
- **GDPR**: General Data Protection Regulation
- **FHIR R4**: Fast Healthcare Interoperability Resources Release 4
- **HL7 v2.5**: Health Level Seven Version 2.5
- **DICOM 3.0**: Digital Imaging and Communications in Medicine
- **IHE**: Integrating the Healthcare Enterprise profiles

### Security Profiles
- **SMART on FHIR**: Secure authentication for healthcare applications
- **OAuth2 with PKCE**: Proof Key for Code Exchange
- **mTLS**: Mutual Transport Layer Security
- **SAML 2.0**: Security Assertion Markup Language

### Audit Requirements
- Access logging for all API calls
- Data lineage tracking
- Consent management for patient data
- Data retention policy compliance

## 🔄 Integration Patterns

### RESTful APIs
- Standard HTTP methods (GET, POST, PUT, DELETE)
- JSON and XML response formats
- Query parameter filtering and pagination

### FHIR Bulk Data Export
- Asynchronous bulk data access
- NDJSON format for large datasets
- Status polling for completion

### HL7 MLLP
- Minimal Lower Layer Protocol over TCP/IP
- Real-time message exchange
- ACK/NACK acknowledgments

### Event-Driven Architecture
- WebSocket subscriptions for real-time data
- Webhook notifications for alerts
- Message queuing for reliability

### API Gateway Pattern
- Centralized request routing
- Rate limiting and throttling
- Request/response transformation
- Authentication and authorization

## 📁 File Descriptions

### external-medical-apis-collection.yaml
Complete OpenAPI 3.0.3 specification including:
- 15+ external medical API endpoints
- Detailed request/response schemas
- Authentication configuration
- Rate limiting specifications
- Error response definitions
- Compliance metadata

### external-apis-integration-guide.md
Comprehensive implementation guide with:
- Authentication setup examples
- Rate limiting implementation
- Error handling strategies
- Monitoring and alerting setup
- Complete code examples
- Integration orchestrator patterns

## 🚀 Quick Start

### 1. Review the OpenAPI Specification
```bash
# View the OpenAPI collection
cat docs/external-medical-apis-collection.yaml

# Or use an OpenAPI viewer
swagger-ui-serve docs/external-medical-apis-collection.yaml
```

### 2. Set Up Environment Variables
```bash
# Copy the example environment file
cp .env.external-apis.example .env.external-apis

# Edit with your API credentials
nano .env.external-apis
```

### 3. Install Dependencies
```bash
npm install axios simple-oauth2 hl7-standard rate-limiter-flexible
```

### 4. Initialize Integration
```javascript
const { MedicalAPIOrchestrator } = require('./lib/medical-api-orchestrator');

const orchestrator = new MedicalAPIOrchestrator();
await orchestrator.initializeClients({
  epic_token: process.env.EPIC_ACCESS_TOKEN,
  // ... other credentials
});
```

## 📋 Implementation Checklist

### Authentication Setup
- [ ] Register with FHIR server sandboxes (Epic, Cerner)
- [ ] Obtain OAuth2 client credentials
- [ ] Generate mTLS certificates for high-security connections
- [ ] Set up API key accounts (FDA, GE Healthcare, etc.)

### Integration Development
- [ ] Implement OAuth2 flows for FHIR servers
- [ ] Configure mTLS for HL7 brokers and lab systems
- [ ] Set up rate limiting for all external APIs
- [ ] Implement error handling and retry logic
- [ ] Create data transformation and mapping layers

### Security and Compliance
- [ ] Set up audit logging for all API calls
- [ ] Implement consent management for patient data
- [ ] Configure data encryption at rest and in transit
- [ ] Set up compliance monitoring and reporting

### Monitoring and Operations
- [ ] Configure API monitoring and alerting
- [ ] Set up health checks for all external services
- [ ] Implement fallback mechanisms for high availability
- [ ] Create documentation for operational procedures

### Testing and Validation
- [ ] Test integration with sandbox environments
- [ ] Validate data quality and transformation
- [ ] Perform security testing and vulnerability assessment
- [ ] Test disaster recovery and failover procedures

## 🔍 Monitoring and Alerting

### Key Metrics
- API response times
- Rate limit utilization
- Error rates and types
- Authentication failures
- Data volume and throughput
- Compliance violations

### Alert Conditions
- High error rates (>10%)
- Slow response times (>5 seconds)
- Rate limit warnings (>80% utilization)
- Authentication failures
- Service unavailability
- Data quality issues

## 🛠️ Development Tools

### Recommended Libraries
- **axios**: HTTP client for API requests
- **simple-oauth2**: OAuth2 client implementation
- **hl7-standard**: HL7 message parsing and generation
- **rate-limiter-flexible**: Rate limiting implementation
- **jsonwebtoken**: JWT token handling
- **node-forge**: Certificate management

### Testing Tools
- **Postman**: API testing and documentation
- **Newman**: Automated API testing
- **Jest**: Unit and integration testing
- **Swagger UI**: OpenAPI specification viewer
- **Insomnia**: REST API client

## 📞 Support and Resources

### Documentation Links
- [FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [HL7 v2.5 Standard](https://www.hl7.org/implement/standards/product_brief.cfm?product_id=144)
- [SMART on FHIR](https://docs.smarthealthit.org/)
- [DICOM Standard](https://www.dicomstandard.org/)
- [OAuth2 RFC](https://tools.ietf.org/html/rfc6749)

### Community Resources
- FHIR Community Forum
- HL7 Implementation Guides
- Healthcare IT Standards Communities
- Open Source Healthcare Projects

### Vendor Support
- Epic MyChart and Developer Resources
- Cerner FHIR APIs and Documentation
- Philips HealthSuite Developer Portal
- GE Healthcare Edison Platform

---

This external medical APIs collection provides a comprehensive foundation for healthcare system integration while maintaining the highest standards of security, compliance, and reliability required for medical applications.
