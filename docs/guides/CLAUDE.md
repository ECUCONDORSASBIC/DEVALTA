# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🏥 AltaMedica - Medical Enterprise Platform

**AltaMedica** is a comprehensive medical enterprise platform that combines advanced telemedicine, AI-powered diagnostics, and strict HIPAA compliance. Built as a modular monorepo with 7 specialized applications serving the complete healthcare workflow from patient care to enterprise management.

## 🏗️ Project Architecture

### Monorepo Structure
This is a **pnpm workspace monorepo** with the following structure:

```
devaltamedica/
├── apps/                    # 7 Main Applications
│   ├── web-app/            # Public gateway & authentication (Port 3000)
│   ├── api-server/         # Core API & WebSocket server (Port 3001)
│   ├── doctors/            # Medical professionals portal (Port 3002)
│   ├── patients/           # Patient portal with telemedicine (Port 3003)
│   ├── companies/          # B2B marketplace (Port 3004)
│   ├── admin/              # Administrative dashboard (Port 3005)
│   └── signaling-server/   # WebRTC signaling (Port 8888)
├── packages/               # Shared Libraries
│   ├── core/              # Central utilities, hooks, components
│   ├── types/             # TypeScript definitions & Zod schemas
│   ├── firebase/          # Firebase configuration & services
│   ├── ui/                # Design system & React components
│   ├── auth/              # Authentication services
│   ├── database/          # Prisma ORM & database utilities
│   ├── medical/           # Medical domain components
│   ├── telemedicine-core/ # WebRTC & video call functionality
│   └── medical-cache/     # HIPAA-compliant medical data caching
└── agents/                # AI Development Agents (PM2 managed)
```

### Application Ports & Status
| Application | Port | Status | Description |
|-------------|------|--------|-------------|
| **web-app** | 3000 | 🟡 7.2/10 | Public gateway & user authentication |
| **api-server** | 3001 | ✅ 9.5/10 | Core REST API + WebSocket (production-ready) |
| **doctors** | 3002 | ✅ 8.5/10 | Medical professionals with telemedicine |
| **patients** | 3003 | ✅ 9.5/10 | Patient portal (enterprise-grade) |
| **companies** | 3004 | ✅ 8.0/10 | B2B medical marketplace |
| **admin** | 3005 | 🔴 4.0/10 | Administrative dashboard (needs development) |
| **signaling-server** | 8888 | ✅ 9.0/10 | WebRTC signaling server |

## 🚀 Development Commands

### Installation & Setup
```bash
# Install dependencies (use npm in Windows PowerShell, pnpm in WSL/Linux)
npm install

# Build all packages (required before running apps)
npm run build:packages

# Start all core services
npm run dev:all
```

### Application Development
```bash
# Start individual applications
npm run dev:web-app         # Port 3000 - Public gateway
npm run dev:api-server      # Port 3001 - Core API
npm run dev:doctors         # Port 3002 - Doctors portal
npm run dev:patients        # Port 3003 - Patients portal  
npm run dev:companies       # Port 3004 - Companies portal
npm run dev:admin           # Port 3005 - Admin dashboard
npm run dev:signaling       # Port 8888 - WebRTC signaling

# Service combinations
npm run dev:core           # web-app + api-server
npm run dev:medical        # doctors + patients
npm run quick-dev          # Alias for dev:core
```

### Testing & Quality
```bash
# Testing
npm run test               # Jest unit tests
npm run test:all          # All tests across workspace
npm run test:e2e          # Cypress E2E tests
npm run test:accessibility # WCAG compliance testing
npm run test:webrtc       # WebRTC connectivity tests
npm run test:ai           # Medical AI accuracy tests

# Code Quality
npm run lint              # ESLint across all workspaces
npm run lint:fix          # Auto-fix linting issues
npm run type-check        # TypeScript validation
npm run ci:test           # Full CI pipeline (lint + type-check + test:all)

# Health Checks
npm run check-api         # API server connectivity
curl http://localhost:3001/api/health    # Manual health check
curl http://localhost:8888/health        # Signaling server health
```

### Package Development
```bash
# Build shared packages
npm run build:packages    # Build all packages
npm run build:apps        # Build all applications

# Work with specific packages
pnpm --filter @altamedica/core build
pnpm --filter @altamedica/ui test
pnpm --filter "./packages/**" build     # All packages
```

## 🏥 Technology Stack

### Core Technologies
- **Runtime**: Node.js 22, Next.js 15.3.4, React 19, TypeScript 5+
- **Package Manager**: pnpm (required for workspace dependencies)
- **Database**: Firebase Firestore (real-time) + PostgreSQL (relational)
- **Authentication**: Firebase Auth with JWT tokens
- **Real-time**: Socket.io for messaging, WebRTC for video calls

### Medical Technologies
- **WebRTC**: Custom signaling server with <100ms latency optimization
- **AI/ML**: TensorFlow.js for medical diagnostics and symptom analysis
- **Compliance**: HIPAA, SOC2, WCAG 2.2 AA certified architecture
- **Security**: AES-256-GCM encryption, comprehensive audit logging

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Process Management**: PM2 for agent orchestration
- **Monitoring**: Prometheus + Grafana + Node Exporter
- **Load Balancing**: Nginx with health checks
- **Caching**: Redis for sessions and rate limiting

## 🔧 Architecture Patterns

### Service Layer Pattern (Required)
All business logic must follow the Service Layer pattern:

```typescript
// ❌ INCORRECT - Logic in routes
export async function POST(request: NextRequest) {
  const user = await db.collection('users').add(userData);
}

// ✅ CORRECT - Service Layer Pattern  
export async function POST(request: NextRequest) {
  return await UserService.createUser(userData);
}
```

### UnifiedAuth Middleware
All API routes must use the UnifiedAuth middleware:

```typescript
import { UnifiedAuth } from '../../../middleware/auth';

export async function GET(request: NextRequest) {
  const authResult = await UnifiedAuth(request, ['DOCTOR', 'ADMIN']);
  if (!authResult.success) return authResult.response;
  
  // Route logic using authResult.user
}
```

### Workspace Dependencies
Apps reference shared packages using workspace protocol:

```json
{
  "dependencies": {
    "@altamedica/core": "workspace:*",
    "@altamedica/ui": "workspace:*",
    "@altamedica/types": "workspace:*"
  }
}
```

## 🏥 Medical Domain Architecture

### Authentication Flow
1. **web-app** (port 3000) serves as the central authentication gateway
2. All users must authenticate through web-app first
3. Role-based redirection to appropriate portals:
   - `PATIENT` → patients-app:3003
   - `DOCTOR` → doctors-app:3002  
   - `COMPANY` → companies-app:3004
   - `ADMIN` → admin-app:3005
4. Firebase Auth tokens validated on each request
5. Medical actions logged with user attribution for HIPAA compliance

### API Architecture
- **RESTful Design**: `/api/v1/[resource]` structure
- **Service Pattern**: Business logic in dedicated service classes
- **Rate Limiting**: Applied to all medical endpoints
- **HIPAA Audit**: All PHI access logged automatically
- **Validation**: Zod schemas for all medical data

### Real-time Communication
- **Appointments**: Firestore real-time listeners
- **Messages**: Socket.io with secure rooms
- **Video Calls**: WebRTC with custom signaling server
- **Notifications**: Firebase Cloud Messaging

## 🔒 Security & Compliance

### HIPAA Requirements
- **PHI Encryption**: AES-256-GCM at rest, TLS 1.3 in transit
- **Audit Logging**: All medical data access tracked
- **Access Control**: Role-based permissions with granular controls
- **Data Retention**: Automated compliance with healthcare regulations

### Development Security
- **Never expose PHI** in logs, error messages, or debugging output
- **Validate all medical calculations** with comprehensive unit tests
- **Use TypeScript strictly** - no `any` types in medical code
- **Implement error boundaries** for patient-facing components

## 🐳 Docker Development

### Full Stack Deployment
```bash
# Start complete AltaMedica stack
docker-compose --env-file .env.docker up -d

# Health monitoring
docker-compose ps
docker-compose logs -f

# Access services
# Grafana: http://localhost:3006
# Prometheus: http://localhost:9090
# All apps: http://localhost:3000-3005
```

### Development Services
```bash
# Start core medical services only
docker-compose up -d api-server doctors patients signaling-server

# Database services only  
docker-compose up -d postgres redis

# Monitoring stack
docker-compose up -d prometheus grafana node-exporter
```

## 🤖 AI Development Agents

The project includes specialized AI agents managed via PM2:

```bash
# Start all agents
pm2 start ecosystem.config.cjs

# Monitor agents
pm2 status
pm2 logs medical-ai-agent
pm2 monit

# Individual agents
pm2 restart orchestrator-agent
pm2 stop security-agent
```

### Available Agents
- **orchestrator-agent**: Main coordination agent
- **medical-ai-agent**: Medical AI processing and diagnostics  
- **security-agent**: HIPAA compliance and security monitoring
- **code-quality-agent**: Code standards and review automation
- **testing-agent**: Automated testing workflows
- **devops-agent**: Deployment and infrastructure management
- **database-agent**: Database operations and optimization
- **docs-agent**: Documentation generation and maintenance

## 🧪 Testing Strategy

### Medical Testing Requirements
- **Unit tests**: Required for all medical calculations and validations
- **Integration tests**: Required for complete patient/doctor workflows
- **Accessibility tests**: WCAG 2.2 AA compliance mandatory for all UIs
- **WebRTC tests**: Connection quality and latency validation required
- **E2E tests**: Critical medical scenarios with <3 second response time requirements

### Test Data
- Use anonymized test data in `/apps/*/src/data/` directories
- Never use real patient information in development
- Medical test scenarios follow FHIR R4 standards

## 🚨 Common Issues & Solutions

### Port Conflicts
```bash
# Windows PowerShell
netstat -ano | findstr :3001
taskkill /F /PID <PID>

# Linux/WSL
sudo lsof -i :3001
sudo kill -9 <PID>
```

### Package Manager Issues
- **pnpm not available in PowerShell**: Use `npm` commands instead
- **Module not found**: Delete `node_modules` and run `npm install`
- **Workspace dependencies**: Run `npm run build:packages` before starting apps

### Firebase Issues
- **Auth failing**: Verify env variables match Firebase Console settings
- **Emulator issues**: Check if `USE_FIREBASE_EMULATOR=true` in development
- **CORS errors**: Verify allowed domains in Firebase Console

### WebRTC Connection Issues
- **No video/audio**: Check browser permissions and STUN/TURN configuration
- **Connection timeout**: Verify signaling server running on port 8888
- **Poor quality**: Review bandwidth settings and MediaSoup configuration

## 📁 Key File Locations

### Configuration
- **Root**: `package.json`, `pnpm-workspace.yaml`, `tsconfig.json`
- **Docker**: `docker-compose.yml`, `.env.docker`
- **PM2**: `ecosystem.config.cjs`
- **Database**: `apps/api-server/database/init/`

### Documentation
- **Individual apps**: Each app has its own `CLAUDE.md` with specific details
- **Packages**: `packages/CLAUDE.md` for shared library documentation
- **API docs**: `apps/api-server/CLAUDE.md` for endpoint specifications

### Environment Setup
- `.env.local` for local development
- `.env.docker` for Docker deployment
- `.env.example` as template with required variables

## 🏥 Medical Development Guidelines

### Medical Safety Standards
- **Patient safety first**: All code decisions must prioritize patient wellbeing
- **Medical calculations**: Comprehensive testing with edge cases required
- **FHIR compliance**: Medical data structures must follow FHIR R4 standards
- **Accessibility**: WCAG 2.2 AA compliance mandatory for all patient interfaces

### Medical Data Handling
- All PHI must be encrypted using `@altamedica/medical-cache` utilities
- Medical calculations must be implemented in `@altamedica/core` utilities
- Use `@altamedica/types` for all medical data structures
- Follow HIPAA audit patterns from `apps/api-server/src/lib/audit.ts`

This platform represents a production-grade medical enterprise system combining the expertise of Eduardo Marques, MD with modern full-stack development practices, specifically designed for healthcare compliance and patient safety.