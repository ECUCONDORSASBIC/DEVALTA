# CLAUDE.md - Shared Packages
**Directory:** `/packages` | **Updated:** July 27, 2025

## 🎯 Purpose
Shared packages providing core functionality, components, and utilities across all AltaMedica applications.

## 📦 Key Packages

### Core Infrastructure
| Package | Purpose | Used By |
|---------|---------|---------|
| `core` | Common hooks, utils, middleware | All apps |
| `database` | Prisma client, DB services | API server |
| `firebase` | Firebase/Firestore integration | All apps |
| `shared` | Auth, types, services | All apps |
| `types` | TypeScript definitions | All apps |

### Medical Domain
| Package | Purpose | Key Features |
|---------|---------|--------------|
| `medical-components` | Medical UI components | Dashboard, telemedicine UI |
| `medical-fhir` | FHIR R4 compliance | HL7 standards, validators |
| `medical-security` | HIPAA compliance | Encryption, audit, monitoring |
| `medical-types` | Medical TypeScript types | Patient, appointment types |
| `medical-utils` | Medical calculations | BMI, dosage, vitals |
| `telemedicine-core` | WebRTC implementation | Video call components |

### AI & ML
| Package | Purpose | Tech |
|---------|---------|------|
| `ai-medical-core` | Medical AI services | TensorFlow.js, NLP |
| `ai-providers` | AI integrations | OpenAI, Claude APIs |
| `ml-core` | ML infrastructure | Model registry, training |

### Design System
| Package | Purpose | Components |
|---------|---------|------------|
| `design-system` | Base components | Button, Card, Input |
| `ui` | Advanced components | Onboarding, animations |
| `tailwind-config` | Shared styles | Medical color palette |

### Infrastructure
| Package | Purpose |
|---------|---------|
| `logger` | Structured logging with Sentry |
| `medical-cache` | Redis-based PHI caching |
| `agent-event-bus` | Inter-service communication |

## 🚀 Usage Examples

### Import Core Utilities
```typescript
import { useDebounce, useLocalStorage } from '@altamedica/core';
import { formatDate, calculateBMI } from '@altamedica/medical-utils';
```

### Medical Components
```typescript
import { DashboardMedico, Telemedicina } from '@altamedica/medical-components';
import { VideoCall } from '@altamedica/telemedicine-core';
```

### Security & Compliance
```typescript
import { encryptPHI, auditLog } from '@altamedica/medical-security';
import { validateFHIR } from '@altamedica/medical-fhir';
```

## 🏗️ Package Development
```bash
# Build all packages
pnpm -r build

# Test specific package
cd packages/[package-name]
pnpm test

# Add dependency to package
pnpm add [dependency] --filter @altamedica/[package-name]
```

## 📦 Publishing (Internal)
```bash
# Version bump
pnpm changeset

# Build & publish
pnpm release
```

## 🔒 Security Notes
- All medical packages handle PHI with encryption
- Audit logging enabled by default
- HIPAA compliance built into medical-* packages

---
*Parent context: /CLAUDE.md*