# 🏥 AltaMedica - Sistema de Telemedicina Profesional

> **Sistema integral de telemedicina con WebRTC, IA médica y compliance HIPAA**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2020.0.0-brightgreen.svg)](https://nodejs.org/)
[![pnpm Version](https://img.shields.io/badge/pnpm-%3E%3D%2010.13.1-orange.svg)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8%2B-blue.svg)](https://www.typescriptlang.org/)

## 📋 Tabla de Contenidos

- [🎯 Descripción del Proyecto](#-descripción-del-proyecto)
- [🏗️ Arquitectura del Monorepo](#️-arquitectura-del-monorepo)
- [🚀 Inicio Rápido](#-inicio-rápido)
- [📱 Aplicaciones](#-aplicaciones)
- [📦 Packages Compartidos](#-packages-compartidos)
- [🛠️ Scripts Principales](#️-scripts-principales)
- [🔧 Tecnologías](#-tecnologías)
- [🌐 Variables de Entorno](#-variables-de-entorno)
- [🧪 Testing](#-testing)
- [📚 Estándares de Desarrollo](#-estándares-de-desarrollo)
- [🐳 Docker](#-docker)
- [🤖 Sistema de Agentes IA](#-sistema-de-agentes-ia)
- [📖 Documentación Adicional](#-documentación-adicional)
- [🆘 Troubleshooting](#-troubleshooting)

## 🎯 Descripción del Proyecto

AltaMedica es una plataforma integral de telemedicina que conecta pacientes, médicos, empresas y administradores en un ecosistema médico digital completo. El sistema incluye:

- **Videollamadas médicas** con WebRTC de alta calidad
- **IA médica integrada** para asistencia diagnóstica
- **Compliance HIPAA** completo
- **Sistema de gestión** para diferentes tipos de usuarios
- **Marketplace B2B** para servicios médicos
- **Monitoreo en tiempo real** con agentes IA

## 🏗️ Arquitectura del Monorepo

```
devaltamedica/
├── 📱 apps/                    # Aplicaciones frontend
│   ├── web-app/               # App web principal
│   ├── api-server/            # Servidor API backend
│   ├── doctors/               # Portal médicos
│   ├── patients/              # Portal pacientes
│   ├── companies/             # Portal empresas
│   ├── admin/                 # Panel administrativo
│   └── signaling-server/      # Servidor WebRTC
├── 📦 packages/               # Packages compartidos
│   ├── auth/                  # Autenticación centralizada
│   ├── ui/                    # Componentes UI
│   ├── shared/                # Utilidades compartidas
│   └── medical-components/    # Componentes médicos
├── 🤖 agents/                 # Sistema de agentes IA
├── 🛠️ scripts/               # Scripts de automatización
├── 📋 configs/                # Configuraciones compartidas
└── 📚 docs/                   # Documentación
```

### 🎯 Modelo de Arquitectura

- **Frontend**: Next.js 15+ con TypeScript
- **Backend**: Node.js con Express/FastAPI
- **Base de Datos**: Firebase Firestore + PostgreSQL
- **Tiempo Real**: WebRTC + WebSockets
- **IA**: Integración con modelos médicos
- **Autenticación**: Sistema unificado con SSO
- **Infraestructura**: Docker + Cloud deployment

## 🚀 Inicio Rápido

### 📋 Prerrequisitos

```bash
# Versiones requeridas
Node.js >= 20.0.0
pnpm >= 10.13.1
Python >= 3.9 (para scripts auxiliares)
Docker >= 24.0 (opcional)
```

### ⚡ Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/ECUCONDORSASBIC/DEVALTA.git
cd devaltamedica

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus configuraciones

# 4. Ejecutar en modo desarrollo
pnpm dev:all
```

### 🎮 Comandos de Desarrollo

```bash
# Desarrollo completo (todas las apps)
pnpm dev:all

# Desarrollo del core (web-app + api-server)
pnpm dev:core

# Desarrollo médico (doctors + patients)
pnpm dev:medical

# Aplicaciones individuales
pnpm dev:web-app       # Puerto 3000
pnpm dev:api-server    # Puerto 3001
pnpm dev:doctors       # Puerto 3002
pnpm dev:patients      # Puerto 3003
pnpm dev:companies     # Puerto 3004
pnpm dev:admin         # Puerto 3005
pnpm dev:signaling     # Puerto 3006
```

## 📱 Aplicaciones

| App | Puerto | Descripción | URL Local |
|-----|--------|-------------|-----------|
| **web-app** | 3000 | Aplicación web principal | http://localhost:3000 |
| **api-server** | 3001 | Servidor API backend | http://localhost:3001 |
| **doctors** | 3002 | Portal para médicos | http://localhost:3002 |
| **patients** | 3003 | Portal para pacientes | http://localhost:3003 |
| **companies** | 3004 | Portal para empresas | http://localhost:3004 |
| **admin** | 3005 | Panel administrativo | http://localhost:3005 |
| **signaling-server** | 3006 | Servidor WebRTC | http://localhost:3006 |

### 🏥 Funcionalidades por App

#### 👨‍⚕️ **Doctors App**
- Dashboard médico completo
- Gestión de pacientes y citas
- Videollamadas médicas
- Historial clínico
- Asistente IA médico

#### 👥 **Patients App**
- Portal del paciente
- Agendar citas médicas
- Acceso a historial médico
- Videoconsultas
- Notificaciones de salud

#### 🏢 **Companies App**
- Gestión empresarial de salud
- Dashboard de empleados
- Reportes de salud corporativa
- Marketplace B2B médico

#### 🔧 **Admin App**
- Panel de administración global
- Gestión de usuarios y roles
- Monitoreo del sistema
- Analytics y reportes
- Configuración global

#### 🌐 **API Server**
- API REST completa
- Autenticación y autorización
- Integración con Firebase
- Endpoints médicos especializados
- Compliance HIPAA

## 📦 Packages Compartidos

### 🔐 `@altamedica/auth`
Sistema de autenticación centralizado con SSO y manejo de roles.

```bash
# Uso en aplicaciones
import { AuthProvider, useAuth } from '@altamedica/auth';
```

### 🎨 `@altamedica/ui`
Biblioteca de componentes UI reutilizables con diseño médico.

### 🔧 `@altamedica/shared`
Utilidades, tipos y funciones compartidas entre aplicaciones.

### 🏥 `@altamedica/medical-components`
Componentes especializados para el dominio médico.

## 🛠️ Scripts Principales

### 🚀 **Desarrollo**
```bash
pnpm dev:all           # Todas las apps en paralelo
pnpm dev:core          # Core apps (web-app + api-server)
pnpm dev:medical       # Apps médicas (doctors + patients)
pnpm dev:admin         # Solo admin app
```

### 🔨 **Build**
```bash
pnpm build             # Build todas las apps
pnpm build:apps        # Solo aplicaciones
pnpm build:packages    # Solo packages compartidos
```

### 🧪 **Testing**
```bash
pnpm test              # Tests básicos
pnpm test:all          # Todos los tests
pnpm test:apps         # Tests de aplicaciones
pnpm test:e2e          # Tests end-to-end
pnpm test:accessibility # Tests de accesibilidad
pnpm test:webrtc       # Tests de WebRTC
```

### 🧹 **Calidad de Código**
```bash
pnpm lint              # Linting completo
pnpm lint:fix          # Fix automático
pnpm type-check        # Verificación TypeScript
pnpm type-check:all    # TypeScript en todas las apps
```

### 🔧 **Mantenimiento**
```bash
pnpm clean             # Limpiar builds
pnpm clean:all         # Limpieza completa + reinstall
pnpm fresh-install     # Instalación desde cero
```

### 🩺 **Diagnóstico**
```bash
pnpm diagnose:sso      # Diagnóstico SSO
pnpm diagnose:servers  # Estado de servidores
pnpm diagnose:api      # Conexión API
pnpm workspace:status  # Estado del workspace
```

### 🛠️ **Utilidades**
```bash
pnpm fix:sso-deps      # Arreglar dependencias SSO
pnpm fix:npm           # Arreglar issues de npm
pnpm util:gen-login-urls # Generar URLs de login
pnpm util:install-video  # Instalar sistema de video
```

## 🔧 Tecnologías

### **Frontend**
- **Framework**: Next.js 15.3.4+ con App Router
- **Lenguaje**: TypeScript 5.8+
- **UI Framework**: React 19+
- **Styling**: Tailwind CSS + shadcn/ui
- **Estado**: Zustand + React Query
- **Formularios**: React Hook Form + Zod

### **Backend**
- **Runtime**: Node.js 20+
- **Framework**: Express.js + FastAPI (Python)
- **Base de Datos**: Firebase Firestore + PostgreSQL
- **Autenticación**: Firebase Auth + JWT
- **Tiempo Real**: WebRTC + Socket.io

### **DevOps & Tooling**
- **Package Manager**: pnpm 10.13.1+
- **Bundler**: Turbopack (Next.js)
- **Linting**: ESLint + Prettier
- **Testing**: Jest + Cypress + Playwright
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions

### **Monorepo**
- **Tool**: pnpm workspaces
- **Build System**: Turborepo (configurado)
- **Shared Packages**: TypeScript packages
- **Dependencies**: Hoisting optimizado

## 🌐 Variables de Entorno

### 📁 Archivo `.env.local` (Raíz)

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SIGNALING_SERVER_URL=ws://localhost:3006

# Environment
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# External Services
OPENAI_API_KEY=your_openai_key
GOOGLE_CLOUD_KEY=your_google_cloud_key
```

### 📋 Variables por App

Cada aplicación puede tener variables específicas en su directorio `apps/{app}/.env.local`.

## 🧪 Testing

### 🎯 Estrategia de Testing

- **Unit Tests**: Jest para lógica de negocio
- **Integration Tests**: Pruebas de componentes
- **E2E Tests**: Cypress para flujos completos
- **Accessibility Tests**: Pruebas de accesibilidad
- **Performance Tests**: Lighthouse CI

### 🏃‍♂️ Comandos de Testing

```bash
# Tests unitarios
pnpm test:apps

# Tests específicos
pnpm test:accessibility    # Accesibilidad
pnpm test:webrtc          # WebRTC
pnpm test:ai              # IA médica

# E2E testing
pnpm test:e2e             # Headless
pnpm test:e2e:open        # UI mode
```

### 📊 Coverage

Los reportes de coverage se generan en `coverage/` de cada app.

## 📚 Estándares de Desarrollo

Nota: Política de imports y cómo evitar imports profundos erróneos: ver `docs/IMPORTS_POLICY.md`.

### 🎨 **Convenciones de Código**

#### **Estructura de Archivos**
```
src/
├── app/                 # App Router (Next.js 13+)
├── components/          # Componentes React
│   ├── ui/             # Componentes básicos UI
│   ├── forms/          # Componentes de formularios
│   └── medical/        # Componentes médicos específicos
├── hooks/              # Custom hooks
├── lib/                # Utilidades y configuraciones
├── services/           # Servicios y APIs
├── types/              # Definiciones TypeScript
└── utils/              # Funciones helper
```

#### **Naming Conventions**
- **Components**: PascalCase (`PatientCard.tsx`)
- **Hooks**: camelCase con prefijo "use" (`usePatientData.ts`)
- **Utils**: camelCase (`formatMedicalId.ts`)
- **Types**: PascalCase (`Patient`, `MedicalRecord`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_UPLOAD_SIZE`)

#### **Imports**
```typescript
// 1. External libraries
import React from 'react';
import { NextPage } from 'next';

// 2. Internal packages
import { useAuth } from '@altamedica/auth';
import { Button } from '@altamedica/ui';

// 3. Relative imports
import { PatientCard } from '../components/PatientCard';
import { usePatientData } from '../hooks/usePatientData';
```

### 🔒 **Seguridad**

- **HIPAA Compliance**: Todos los datos médicos deben cumplir HIPAA
- **Data Encryption**: Datos sensibles encriptados en tránsito y reposo
- **Authentication**: Sistema de autenticación centralizado
- **Authorization**: Control de acceso basado en roles (RBAC)
- **Audit Logging**: Logs de auditoría para acciones críticas

### 📝 **Commits**

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat(patients): add telemedicine video component
fix(auth): resolve SSO login redirect issue
docs(readme): update installation instructions
style(ui): format button component
refactor(api): restructure patient endpoints
test(doctors): add unit tests for appointment booking
```

### 🔄 **Git Workflow**

1. **Branches**: `feature/`, `fix/`, `docs/`, `refactor/`
2. **Pull Requests**: Requeridos para main
3. **Code Review**: Mínimo 1 revisor
4. **CI/CD**: Tests automáticos antes del merge

## 🐳 Docker

### 🚀 **Quick Start**

```bash
# Desarrollo completo
docker-compose -f docker-compose.dev.yml up

# Producción
docker-compose up
```

### 📋 **Servicios Docker**

```yaml
# docker-compose.yml incluye:
- web-app          # Puerto 3000
- api-server       # Puerto 3001  
- doctors          # Puerto 3002
- patients         # Puerto 3003
- companies        # Puerto 3004
- admin            # Puerto 3005
- signaling-server # Puerto 3006
- postgres         # Puerto 5432
- redis            # Puerto 6379
```

### 🔧 **Builds Individuales**

```bash
# Build app específica
docker build -f apps/doctors/Dockerfile -t altamedica-doctors .

# Build con optimizaciones
docker build --target production -t altamedica-prod .
```

## 🤖 Sistema de Agentes IA

AltaMedica incluye un sistema avanzado de agentes IA para automatización y monitoreo:

### 🧠 **Agentes Disponibles**

- **Auth Agent**: Gestión de autenticación
- **Routing Agent**: Enrutamiento inteligente
- **Security Agent**: Monitoreo de seguridad
- **Monitoring Agent**: Supervisión del sistema
- **Patient Monitoring**: Seguimiento de pacientes
- **Emergency Coordination**: Coordinación de emergencias
- **Knowledge Graph**: Gestión del conocimiento médico

### 🚀 **Comandos de Agentes**

```bash
# Desarrollo de agentes
cd agents/
pnpm dev              # Todos los agentes
pnpm dev:auth         # Solo auth agent
pnpm dev:monitoring   # Solo monitoring agent

# Producción
pnpm start:all        # Todos los agentes
pnpm start:core       # Agentes core
pnpm start:medical    # Agentes médicos

# Testing
pnpm test:collaborative    # Tests colaborativos
pnpm test:patient-monitoring # Tests de monitoreo
```

## 📖 Documentación Adicional

### 📚 **Documentos Técnicos**

- `docs/ARCHITECTURE.md` - Arquitectura detallada del sistema
- `docs/API.md` - Documentación completa de la API
- `docs/DEPLOYMENT.md` - Guía de despliegue
- `docs/SECURITY.md` - Políticas de seguridad
- `docs/CONTRIBUTING.md` - Guía para contribuidores

### 🏥 **Documentos Médicos**

- `docs/HIPAA.md` - Compliance HIPAA
- `docs/MEDICAL_WORKFLOWS.md` - Flujos médicos
- `docs/TELEMEDICINE.md` - Guía de telemedicina
- `docs/AI_MEDICAL.md` - IA médica integrada

### 🚀 **Guías de Usuario**

- `docs/USER_DOCTORS.md` - Guía para médicos
- `docs/USER_PATIENTS.md` - Guía para pacientes
- `docs/USER_COMPANIES.md` - Guía para empresas
- `docs/USER_ADMIN.md` - Guía de administración

## 🆘 Troubleshooting

### 🔧 **Problemas Comunes**

#### **Instalación**
```bash
# Error: pnpm not found
npm install -g pnpm@10.13.1

# Error: Node version
nvm use 20
# or
nvm install 20

# Dependencias corruptas
pnpm clean:all
```

#### **Desarrollo**
```bash
# Puerto ocupado
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows

# Firebase connection
pnpm diagnose:api

# SSO issues
pnpm diagnose:sso
pnpm fix:sso-deps
```

#### **Build Errors**
```bash
# TypeScript errors
pnpm type-check:all

# Next.js cache issues
rm -rf .next/
pnpm dev

# Workspace issues
pnpm workspace:check
pnpm workspace:fix
```

### 📞 **Soporte**

- **Issues**: [GitHub Issues](https://github.com/ECUCONDORSASBIC/DEVALTA/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ECUCONDORSASBIC/DEVALTA/discussions)
- **Wiki**: [Project Wiki](https://github.com/ECUCONDORSASBIC/DEVALTA/wiki)

### 🔍 **Logs y Debugging**

```bash
# Logs de desarrollo
pnpm dev:doctors 2>&1 | tee logs/doctors.log

# Logs de producción
docker-compose logs -f web-app

# Debugging específico
DEBUG=altamedica:* pnpm dev:api-server
```

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 👥 Contribuidores

Ver [CONTRIBUTORS.md](CONTRIBUTORS.md) para la lista completa de contribuidores.

---

<div align="center">

**[⬆ Volver al inicio](#-altamedica---sistema-de-telemedicina-profesional)**

*Desarrollado con ❤️ para mejorar la salud digital*

</div>

### 🏆 **Características Destacadas**
- 🩺 **Telemedicina HD:** WebRTC con latencia <100ms
- 🤖 **IA Médica:** TensorFlow.js para diagnóstico asistido
- 🔒 **HIPAA Compliant:** Cifrado AES-256 y auditoría completa
- 🏢 **B2B Ready:** Marketplace médico para empresas
- 📱 **Responsive:** Optimizado para móviles y tablets
- ⚡ **Performance:** Next.js 15 con renderizado optimizado

---

## 🏗️ **Arquitectura del Sistema**

### 📊 **7 Aplicaciones Activas**

| Aplicación | Puerto | Estado | Descripción |
|------------|--------|--------|-------------|
| 🌐 **Web App** | 3000 | ✅ 7.2/10 | Landing page y registro público |
| 🏥 **API Server** | 3001 | ✅ 9.5/10 | Core APIs + WebSocket (95% producción) |
| 🩺 **Doctors** | 3002 | ✅ 8.5/10 | Portal médicos con telemedicina |
| 👤 **Patients** | 3003 | ✅ 9.5/10 | Portal pacientes (nivel enterprise) |
| 🏢 **Companies** | 3004 | ✅ 8.0/10 | Marketplace B2B para clínicas |
| 👨‍💼 **Admin** | 3005 | ⚠️ 4.0/10 | Dashboard administrativo (necesita desarrollo) |
| 📡 **Signaling** | 8888 | ✅ 9.0/10 | WebRTC signaling server |

### 🔧 **Stack Tecnológico**

**Frontend:** Next.js 15, React 19, TypeScript 5+, Tailwind CSS  
**Backend:** Express + Next.js API Routes, Firebase Firestore, PostgreSQL  
**Real-time:** Socket.io, WebRTC + MediaSoup  
**AI/ML:** TensorFlow.js, Medical NLP  
**Infrastructure:** Docker, Redis, Nginx  
**Security:** HIPAA Compliant, AES-256 encryption  

---

## 🚀 **Quick Start**

### 📦 **Instalación Rápida**

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd devaltamedica

# 2. Instalar dependencias (usar npm en Windows PowerShell)
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Iniciar servicios principales
npm run dev:all
```

### 🌐 **URLs de Desarrollo**
- **Landing Page:** http://localhost:3000
- **API Health:** http://localhost:3001/api/health
- **Doctors Portal:** http://localhost:3002
- **Patients Portal:** http://localhost:3003
- **Companies Portal:** http://localhost:3004
- **Admin Panel:** http://localhost:3005

---

## 🐳 **Docker Deployment**

### 🚀 **Stack Completo (Recomendado)**

```bash
# Iniciar todos los servicios
docker-compose --env-file .env.docker up -d

# Verificar estado
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Parar servicios
docker-compose down
```

### 🏥 **Solo Servicios Médicos**

```bash
# Iniciar aplicaciones médicas core
docker-compose up -d api-server doctors-app patients-app signaling-server

# Health checks
curl http://localhost:3001/api/health
curl http://localhost:8888/health
```

### 📊 **Monitoreo Docker**

```bash
# Estadísticas de recursos
docker stats

# Logs específicos por servicio
docker-compose logs -f api-server
docker-compose logs -f doctors-app

# Reiniciar servicios individuales
docker-compose restart patients-app
```

---

## 🔧 **Desarrollo**

### 🛠️ **Comandos de Desarrollo**

```bash
# Desarrollo individual por app
cd apps/api-server && npm run dev      # API Server
cd apps/doctors && npm run dev          # Doctors Portal
cd apps/patients && npm run dev         # Patients Portal
cd apps/companies && npm run dev        # Companies Portal

# Testing completo
npm run test                            # Jest unit tests
npm run test:e2e                        # Cypress E2E
npm run test:accessibility              # WCAG compliance
npm run lint                            # ESLint + TypeScript

# Build para producción
npm run build
npm run start
```

### 📁 **Estructura del Proyecto**

```
devaltamedica/
├── apps/
│   ├── api-server/          # Core API + WebSocket (95% producción)
│   ├── web-app/            # Landing page (7.2/10)
│   ├── doctors/            # Portal médicos (8.5/10)
│   ├── patients/           # Portal pacientes (9.5/10)
│   ├── companies/          # B2B marketplace (8.0/10)
│   ├── admin/              # Admin dashboard (4.0/10)
│   └── signaling-server/   # WebRTC signaling (9.0/10)
├── packages/
│   ├── core/               # Utilidades compartidas
│   ├── ui/                 # Design system
│   ├── firebase/           # Configuración Firebase
│   ├── database/           # Schemas Prisma
│   └── medical-*/          # Componentes médicos
├── docker-compose.yml      # Stack completo
└── CLAUDE.md              # Documentación técnica
```

---

## 📊 **Estado del Frontend - Análisis Detallado**

### ✅ **Aplicaciones Listas para Producción**

#### 🩺 **Doctors App (8.5/10)**
- ✅ Dashboard médico completo
- ✅ Telemedicina WebRTC integrada
- ✅ Gestión de pacientes y citas
- ❌ **Falta:** Sistema de prescripciones digitales
- ❌ **Falta:** Biblioteca de recursos médicos

#### 👤 **Patients App (9.5/10) - EXCEPCIONAL**
- ✅ Portal más completo del mercado
- ✅ Dashboard de salud integral
- ✅ Telemedicina de última generación
- ✅ 95% de funcionalidades implementadas
- ❌ **Falta mínima:** Portal familiar para dependientes

#### 🏢 **Companies App (8.0/10)**
- ✅ Marketplace B2B funcional
- ✅ Sistema de contratación médica
- ✅ Onboarding empresarial completo
- ❌ **Falta:** Analytics empresariales avanzados

### ⚠️ **Aplicaciones que Necesitan Desarrollo**

#### 👨‍💼 **Admin App (4.0/10) - CRÍTICO**
- ❌ **Dashboard administrativo completo**
- ❌ **Gestión avanzada de usuarios y roles**
- ❌ **Sistema de auditoría HIPAA**
- ❌ **Métricas y analytics de plataforma**
- ❌ **Centro de alertas y monitoreo**

#### 🌐 **Web App (7.2/10) - Necesita Marketing**
- ✅ Landing page funcional
- ❌ **About Us** - Historia de AltaMedica
- ❌ **Services** - Descripción de servicios
- ❌ **Contact** - Formulario de contacto
- ❌ **Blog** - Contenido médico
- ❌ **Testimonials** - Casos de éxito

---

## 🔧 **APIs Backend - Estado de Integración**

### 📊 **Resumen de APIs (108 endpoints auditados)**

| Categoría | Endpoints | Estado | Integración Frontend |
|-----------|-----------|--------|---------------------|
| **Auth** | 12 | ✅ 95% Producción | Todas las apps |
| **Medical** | 25 | ✅ 90% Producción | Doctors + Patients |
| **Telemedicine** | 8 | ✅ 100% Producción | Doctors + Patients |
| **B2B/Jobs** | 15 | ✅ 95% Producción | Companies |
| **Admin** | 10 | ✅ 85% Producción | Admin (parcial) |
| **AI/ML** | 12 | ✅ 90% Producción | Doctors + Patients |
| **Payments** | 8 | ✅ 100% Producción | Companies |

### 🔌 **Integraciones Críticas**

#### ✅ **Excelente Integración**
- **Doctors ↔ API:** 15+ endpoints integrados perfectamente
- **Patients ↔ API:** Telemedicina y dashboard 100% funcional
- **Companies ↔ API:** B2B marketplace completamente operativo

#### ⚠️ **Necesita Mejoras**
- **Admin ↔ API:** Solo 30% de endpoints administrativos integrados
- **Web App ↔ API:** Limitado a registro y formularios básicos

---

## 🔒 **Seguridad y Compliance**

### 🛡️ **HIPAA Compliance**
- ✅ **Cifrado:** AES-256-GCM en reposo, TLS 1.3 en tránsito
- ✅ **Auditoría:** Logs completos de acceso a PHI
- ✅ **Acceso:** Control de roles granular
- ✅ **Backup:** Copias encriptadas en múltiples ubicaciones

### 🔐 **Medidas de Seguridad**
- ✅ **Autenticación:** Firebase Auth con 2FA
- ✅ **Autorización:** Middleware UnifiedAuth
- ✅ **Rate Limiting:** Protección contra ataques
- ✅ **Validación:** Schemas Zod en todos los endpoints

---

## 🚨 **Errores Conocidos y Soluciones**

### ⚡ **Problemas Comunes**

#### 🔌 **Conflictos de Puerto**
```bash
# Windows PowerShell
netstat -ano | findstr :3001
taskkill /F /PID <PID>

# Linux/WSL
sudo lsof -i :3001
sudo kill -9 <PID>
```

#### 📦 **Problemas de Dependencias**
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### 🐳 **Problemas Docker**
```bash
# Limpiar containers y volúmenes
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```

#### 🔥 **Problemas Firebase**
```bash
# Verificar configuración
echo $NEXT_PUBLIC_FIREBASE_PROJECT_ID
# Reiniciar emuladores
firebase emulators:stop && firebase emulators:start
```

---

## 📈 **Métricas de Performance**

### ⚡ **Rendimiento Actual**
- **Telemedicina:** <100ms latencia WebRTC
- **API Response:** <200ms promedio
- **Bundle Size:** <150KB gzipped por app
- **Lighthouse Score:** 95+ en todas las apps principales

### 📊 **Cobertura de Testing**
- **Unit Tests:** 85% cobertura
- **E2E Tests:** Flujos críticos cubiertos
- **Accessibility:** WCAG 2.2 AA compliant
- **Security:** Auditorías HIPAA regulares

---

## 🤝 **Contribuir al Proyecto**

### 🔧 **Setup de Desarrollo**
1. Fork el repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Instalar dependencias: `npm install`
4. Iniciar desarrollo: `npm run dev:all`
5. Ejecutar tests: `npm run test`

### 📝 **Estándares de Código**
- **TypeScript:** Strict mode habilitado
- **ESLint:** Configuración médica personalizada
- **Prettier:** Formato automático
- **Testing:** Jest + Cypress obligatorio
- **HIPAA:** Validación automática de PHI

---

## 📞 **Soporte**

### 🆘 **Obtener Ayuda**
- **GitHub Issues:** [Crear issue](https://github.com/your-repo/issues)
- **Documentación:** Revisar `/apps/*/CLAUDE.md`
- **Discord:** Canal de desarrollo médico
- **Email:** dev@altamedica.com

### 🏥 **Soporte Médico/HIPAA**
- **Privacy Officer:** Dr. Roberto Sánchez
- **Email:** privacy@altamedica.com
- **Compliance:** hipaa@altamedica.com

---

## 📄 **Licencia**

Este proyecto está licenciado bajo **MIT License** para componentes open source y **Licencia Propietaria** para módulos médicos específicos.

```
© 2025 AltaMedica. Todos los derechos reservados.
Desarrollado por Eduardo Marques, MD - Universidad de Medicina de Buenos Aires
```

---

<div align="center">

**🏥 AltaMedica - Transformando la atención médica con tecnología**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://linkedin.com/company/altamedica)
[![Twitter](https://img.shields.io/badge/Twitter-Follow-blue)](https://twitter.com/altamedica)
[![Website](https://img.shields.io/badge/Website-Visit-green)](https://altamedica.com)

</div>