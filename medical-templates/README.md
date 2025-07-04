# Medical Templates & Reference Services

Ready-to-run templates for medical applications with automated compliance testing.

## 🏥 Templates Included

### 1. FHIR R4 Node.js Server with SMART-on-FHIR Auth
- **Location**: `./fhir-r4-server/`
- **Features**: 
  - Full FHIR R4 compliance
  - SMART-on-FHIR authentication
  - Patient and Observation resources
  - JWT token validation
  - Rate limiting and security headers
  - Automated compliance tests

### 2. React + TypeScript UI with Material-UI Accessibility
- **Location**: `./react-ui/`
- **Features**:
  - Material-UI accessibility presets
  - TypeScript support
  - Responsive design
  - WCAG compliance tests
  - Medical-specific components

### 3. FHIR to Parquet ETL Pipeline
- **Location**: `./etl-pipeline/`
- **Features**:
  - FHIR to Parquet transformation
  - BigQuery integration
  - Snowflake support
  - Batch processing
  - Data validation

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Docker (optional)

### FHIR Server Setup
```bash
cd fhir-r4-server
npm install
npm run setup
npm start
```

Server will be available at `http://localhost:3000`

### React UI Setup
```bash
cd react-ui
npm install
npm start
```

UI will be available at `http://localhost:3001`

### ETL Pipeline Setup
```bash
cd etl-pipeline
npm install
# Configure environment variables
npm run extract
```

## 🧪 Running Compliance Tests

### FHIR Server Compliance
```bash
cd fhir-r4-server
npm test:compliance
```

### UI Accessibility Tests
```bash
cd react-ui
npm test:compliance
npm run accessibility:audit
```

### ETL Data Validation
```bash
cd etl-pipeline
npm test:compliance
```

## 📋 Compliance Standards

### FHIR R4 Server
- ✅ FHIR R4 specification compliance
- ✅ SMART-on-FHIR authentication
- ✅ HL7 FHIR security requirements
- ✅ OAuth 2.0 / OpenID Connect
- ✅ Rate limiting and DDoS protection
- ✅ HIPAA-compatible logging

### React UI
- ✅ WCAG 2.1 AA accessibility
- ✅ Material-UI accessibility features
- ✅ Keyboard navigation
- ✅ Screen reader compatibility
- ✅ High contrast support
- ✅ Responsive design

### ETL Pipeline
- ✅ FHIR resource validation
- ✅ Data integrity checks
- ✅ Error handling and logging
- ✅ Scalable architecture
- ✅ Cloud data warehouse integration

## 🔧 Configuration

### Environment Variables

Create `.env` files in each template directory:

#### FHIR Server (.env)
```env
PORT=3000
JWT_SECRET=your-jwt-secret-key
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000
NODE_ENV=development
SERVER_URL=http://localhost:3000
```

#### ETL Pipeline (.env)
```env
FHIR_SERVER_URL=http://localhost:3000/fhir
ACCESS_TOKEN=your-access-token
BIGQUERY_PROJECT_ID=your-project-id
BIGQUERY_DATASET_ID=fhir_data
BIGQUERY_KEY_FILE=path/to/service-account.json
OUTPUT_PATH=./output
BATCH_SIZE=100
```

## 📚 API Documentation

### FHIR Server Endpoints

#### Health Check
```
GET /health
```

#### FHIR Metadata
```
GET /fhir/metadata
```

#### SMART-on-FHIR Configuration
```
GET /smart/.well-known/smart_configuration
```

#### Patient Resources
```
GET /fhir/Patient
GET /fhir/Patient/{id}
POST /fhir/Patient
PUT /fhir/Patient/{id}
```

#### Observation Resources
```
GET /fhir/Observation
GET /fhir/Observation/{id}
POST /fhir/Observation
```

### Authentication

All FHIR endpoints require Bearer token authentication:

```bash
curl -H "Authorization: Bearer {access_token}" \
     http://localhost:3000/fhir/Patient
```

## 🔐 Security Features

### FHIR Server Security
- Helmet.js security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- JWT token validation
- Scope-based authorization
- Request logging and monitoring

### Data Protection
- HIPAA-compliant logging (no PHI in logs)
- Encrypted data transmission (HTTPS)
- Token expiration handling
- Audit trail support

## 🏗️ Architecture

### FHIR Server Architecture
```
┌─────────────────┐    ┌──────────────────┐
│   React UI      │────│   FHIR Server    │
│   (Port 3001)   │    │   (Port 3000)    │
└─────────────────┘    └──────────────────┘
                              │
                    ┌──────────────────┐
                    │   ETL Pipeline   │
                    │   (Batch Jobs)   │
                    └──────────────────┘
                              │
                    ┌──────────────────┐
                    │  Data Warehouse  │
                    │ (BigQuery/SF)    │
                    └──────────────────┘
```

## 📊 Monitoring and Logging

### Health Monitoring
- Health check endpoints
- Performance metrics
- Error rate monitoring
- Uptime tracking

### Audit Logging
- All FHIR operations logged
- Authentication events
- Failed access attempts
- Data access patterns

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Ensure compliance tests pass
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create GitHub issue
- Check documentation
- Review compliance test results

## 🔄 Updates

Templates are regularly updated to maintain:
- Latest FHIR specifications
- Security best practices
- Accessibility standards
- Performance optimizations
