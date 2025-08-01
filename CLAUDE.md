# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🏥 Proyecto AltaMedica - Plataforma Médica Empresarial

**AltaMedica** es una plataforma médica empresarial integral que combina telemedicina avanzada, inteligencia artificial diagnóstica y cumplimiento estricto con regulaciones HIPAA. Desarrollada como un monorepo modular con 7 aplicaciones especializadas.

### 📁 Arquitectura del Proyecto

Este es un **monorepo** usando pnpm workspaces con la siguiente estructura:

```
devaltamedica/
├── apps/                           # Aplicaciones principales
│   ├── api-server/                # Core API + WebSocket (Puerto 3001)
│   ├── web-app/                   # Landing page pública (Puerto 3000)
│   ├── doctors/                   # Portal médicos con telemedicina (Puerto 3002)
│   ├── patients/                  # Portal pacientes premium (Puerto 3003)
│   ├── companies/                 # B2B marketplace (Puerto 3004)
│   ├── admin/                     # Panel administrativo (Puerto 3005)
│   ├── signaling-server/          # WebRTC signaling (Puerto 8888)
│   ├── medical/                   # Módulos médicos adicionales
│   ├── development/               # Herramientas de desarrollo
│   └── anthropic-simulator/       # Simulador para testing
├── packages/                       # Bibliotecas compartidas
│   ├── core/                      # Utilidades centrales
│   ├── ui/                        # Design system
│   ├── auth/                      # Autenticación compartida
│   ├── firebase/                  # Configuración Firebase
│   ├── types/                     # TypeScript types compartidos
│   ├── shared/                    # Componentes compartidos
│   ├── medical/                   # Componentes médicos
│   ├── database/                  # Schemas y migraciones
│   ├── medical-cache/             # Cache médico optimizado
│   ├── telemedicine-core/         # Core telemedicina
│   └── eslint-config/             # Configuración ESLint
└── altamedica-core/               # Sistema principal
```

---

## 🏗️ Backend Architecture Summary

### 📍 **Core Backend Services**
```
🌐 API Server (Puerto 3001)
├── 📂 Location: /apps/api-server/
├── 🔗 URL: http://localhost:3001
├── 📚 Documentation: /apps/api-server/CLAUDE.md
├── 🎯 95% Production Ready - Nivel Empresarial
└── 🔧 Express + Next.js 15 + UnifiedAuth + Service Pattern

🎥 Signaling Server (Puerto 8888)  
├── 📂 Location: /apps/signaling-server/
├── 🔗 URL: ws://localhost:8888
├── 🎯 WebRTC signaling para videollamadas
└── 🔧 Socket.io + MediaSoup integration

🔥 Firebase Services
├── 🗄️ Firestore: Base de datos principal
├── 🔐 Firebase Auth: Autenticación SSO
├── 💾 Firebase Storage: Archivos médicos
└── 📱 Cloud Messaging: Notificaciones push
```

### 🔌 **API Endpoints por Frontend**
| Frontend App | Puerto | APIs Principales | Estado |
|---|---|---|---|
| **doctors** 🏥 | 3002 | `/auth/*`, `/appointments/*`, `/patients`, `/telemedicine/sessions/*` | ✅ **PRODUCCIÓN** |
| **patients** 👤 | 3003 | `/auth/*`, `/appointments/*`, `/medical-records/*`, `/ai/analyze-symptoms` | ✅ **PRODUCCIÓN** |
| **companies** 🏢 | 3004 | `/jobs`, `/marketplace`, `/payments/mercadopago/*`, `/finops/*` | ✅ **NIVEL EMPRESARIAL** |
| **admin** ⚡ | 3005 | `/users`, `/finops/cost-estimation`, `/rate-limit-stats`, todos con privilegios | ✅ **PRODUCCIÓN** |
| **web-app** 🌐 | 3000 | `/auth/register`, `/ai/chatbot`, APIs públicas | ✅ **PRODUCCIÓN** |

### 🚀 **Funcionalidades Tiempo Real**
- ✅ **WebRTC + MediaSoup:** Videollamadas HD <100ms latencia
- ✅ **Socket.io:** Notificaciones en tiempo real
- ✅ **Firestore Listeners:** Cambios de estado automáticos
- ✅ **Express Middleware:** UnifiedAuth + Rate Limiting + HIPAA Audit

---

### 🏗️ **Aplicaciones Activas & Puertos (Arquitectura Corregida)**
**Jerarquía de Dependencias**:

#### 🔴 **Nivel 1 - Servicios Críticos (Requeridos para funcionamiento básico)**
- `web-app` (3000): **🌐 GATEWAY CENTRAL** - Autenticación, registro, determinación de roles - **OBLIGATORIO PARA TODOS LOS USUARIOS**
- `api-server` (3001): **🔧 Core API + WebSocket server** - **95% Production Ready**

#### 🟡 **Nivel 2 - Portales Específicos (Dependen de web-app para autenticación)**
- `patients` (3003): **👤 Portal pacientes** con telemedicina (requiere autenticación via web-app)
- `doctors` (3002): **🏥 Portal médicos** profesionales (requiere autenticación via web-app)  
- `companies` (3004): **🏢 Marketplace B2B** para clínicas (requiere autenticación via web-app)
- `admin` (3005): **⚡ Dashboard administrativo** (requiere autenticación via web-app)

#### 🟢 **Nivel 3 - Servicios Complementarios**
- `signaling-server` (8888): **📞 Señalización WebRTC** para videollamadas

**CRÍTICO**: Sin `web-app` funcionando, los usuarios no pueden acceder a ningún portal específico.

## 🚨 Herramientas Windows PowerShell - CRÍTICO

### ❌ NO USAR - Comandos Problemáticos
```bash
# NUNCA usar estos comandos - fallan en Windows PowerShell
bash                    # Error: no funciona en PowerShell
/usr/bin/bash          # Error: ruta Unix no válida
wsl                    # NO usar para desarrollo diario
sh                     # No funciona correctamente
```

### ✅ USAR - Alternativas que Funcionan
```powershell
# PowerShell exclusivamente
powershell.exe -Command "Get-Location"
powershell -Command "npm install"
cmd.exe /c "dir"

# Herramientas Windows nativas
explorer.exe          # Explorador de archivos
notepad.exe           # Editor básico
code.exe              # VS Code

# Node.js/npm (instalación Windows)
node.exe              # Node.js Windows
npm.exe               # npm Windows
pnpm.exe              # pnpm Windows (si está instalado)
```

### 🎯 GUÍA AUTOMATIZACIÓN CLAUDE CODE - SESIÓN NUEVA

### 🏁 PASO 1: VERIFICAR ENLACE SIMBÓLICO
**CRÍTICO: Siempre verificar que el enlace simbólico funciona antes de empezar**

```bash
# Verificar enlace simbólico funcional
ls -la /home/altamedica/devaltamedica

# Si no existe, recrear:
ln -sf /home/altamedica/devaltamedica /home/edu/devaltamedica

# Navegar usando enlace simbólico
cd /home/edu/devaltamedica
pwd  # Debe mostrar: /home/edu/devaltamedica
```

### 🎯 PASO 2: ABRIR TERMINALES DESDE CLAUDE - FUNCIONA PERFECTAMENTE

**✅ Claude SÍ puede abrir terminales usando PowerShell:**

```powershell
# Terminal PowerShell nueva
powershell.exe -Command "Start-Process powershell"

# Terminal CMD nueva
powershell.exe -Command "Start-Process cmd"

# Windows Terminal nueva pestaña
powershell.exe -Command "Start-Process wt -ArgumentList 'new-tab'"

# WSL Ubuntu en Windows Terminal - MÉTODO PRINCIPAL
powershell.exe -Command "Start-Process wt -ArgumentList '--profile', 'Ubuntu-24.04'"

# PowerShell con directorio específico del proyecto
powershell.exe -Command "Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd C:\\Users\\Eduardo\\Documents\\devaltamedica'"

# Terminal con comandos ejecutándose automáticamente
powershell.exe -Command "Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd C:\\Users\\Eduardo\\Documents\\devaltamedica; pnpm dev'"

# Múltiples terminales para diferentes servicios
powershell.exe -Command "Start-Process wt -ArgumentList 'split-pane', '-p', 'PowerShell', '-d', 'C:\\Users\\Eduardo\\Documents\\devaltamedica\\apps\\api-server'"
```

**🚀 APLICACIONES PRÁCTICAS PARA DESARROLLO:**
- ✅ Abrir terminal directamente en directorio del proyecto
- ✅ Ejecutar comandos específicos al abrir
- ✅ Crear múltiples terminales simultáneamente
- ✅ Abrir Windows Terminal con perfiles específicos
- ✅ Combinar con instalaciones y desarrollo

### 🎯 PASO 3: CHROME BETA - CONTROL TOTAL VERIFICADO

**🏆 MÉTODO PRINCIPAL: Chrome Beta ubicado en Desktop**

```powershell
# 🚀 ABRIR CHROME BETA - MÉTODO VERIFICADO
powershell.exe -Command "Start-Process 'C:\Users\Public\Desktop\Google Chrome Beta.lnk'"

# 🎯 CHROME BETA CON URL ESPECÍFICA
powershell.exe -Command "Start-Process 'C:\Users\Public\Desktop\Google Chrome Beta.lnk' -ArgumentList 'http://localhost:3000'"
powershell.exe -Command "Start-Process 'C:\Users\Public\Desktop\Google Chrome Beta.lnk' -ArgumentList 'http://localhost:3001'"

# 🔥 CHROME BETA CON CONFIGURACIONES ESPECÍFICAS
powershell.exe -Command "Start-Process 'C:\Users\Public\Desktop\Google Chrome Beta.lnk' -ArgumentList '--new-window', 'http://localhost:3000'"
powershell.exe -Command "Start-Process 'C:\Users\Public\Desktop\Google Chrome Beta.lnk' -ArgumentList '--incognito', 'http://localhost:3000'"

# 📊 VERIFICAR PROCESOS CHROME BETA ACTIVOS
powershell.exe -Command "Get-Process chrome -ErrorAction SilentlyContinue | Select-Object ProcessName, Id, StartTime"
```

### 🌐 PASO 4: OBTENER DATOS RENDERIZADOS - CRÍTICO PARA DESARROLLO

**⚡ IMPORTANCIA MÁXIMA: Claude tiene CONTROL TOTAL sobre navegadores y datos web**

**🏆 MÉTODO GANADOR: PowerShell + Invoke-WebRequest**

```powershell
# 🎯 OBTENER HTML COMPLETAMENTE RENDERIZADO (Next.js SSR)
powershell.exe -Command "Invoke-WebRequest -Uri 'http://localhost:3000' | Select-Object -ExpandProperty Content"

# 📊 ANÁLISIS COMPLETO DE RESPUESTA (Status + Headers + Tamaño)
powershell.exe -Command "$response = Invoke-WebRequest -Uri 'http://localhost:3000'; Write-Output \"Status: $($response.StatusCode)\"; Write-Output \"Content Length: $($response.Content.Length)\""

# 💾 GUARDAR HTML RENDERIZADO PARA ANÁLISIS DETALLADO
powershell.exe -Command "Invoke-WebRequest -Uri 'http://localhost:3000' | Select-Object -ExpandProperty Content | Out-File 'devaltamedica-web-app.html'"

# 🔍 VERIFICAR PÁGINAS ESPECÍFICAS DE DEVALTAMEDICA
powershell.exe -Command "Invoke-WebRequest -Uri 'http://localhost:3000/auth/login'"
powershell.exe -Command "Invoke-WebRequest -Uri 'http://localhost:3000/auth/register'"
powershell.exe -Command "Invoke-WebRequest -Uri 'http://localhost:3000/api/health'"

# 🎪 CONTROL TOTAL DE NAVEGADOR EXTERNO
powershell.exe -Command "Start-Process 'http://localhost:3000'"
powershell.exe -Command "Start-Process chrome 'http://localhost:3000'"
powershell.exe -Command "Start-Process msedge 'http://localhost:3000'"
```

### 🎯 PASO 5: CONTEXTO ESPECÍFICO PARA NUEVA SESIÓN

**🚨 MENSAJE DIRECTO PARA ENVIAR A LA NUEVA SESIÓN CLAUDE:**

```
Esta es una sesión Claude Code PARALELA automatizada. NO responder genéricamente.

ACCIÓN INMEDIATA REQUERIDA:
1. Ejecuta: ls -la /home/edu/devaltamedica (verificar enlace simbólico)
2. Ejecuta: cd /home/edu/devaltamedica && pwd
3. Ejecuta: powershell.exe -Command "Start-Process 'C:\Users\Public\Desktop\Google Chrome Beta.lnk' -ArgumentList 'http://localhost:3001'"

CONTEXTO TÉCNICO CRÍTICO:
- Sesión principal tiene API server puerto 3001 ACTIVO
- Chrome Beta path verificado: C:\Users\Public\Desktop\Google Chrome Beta.lnk  
- PowerShell + Invoke-WebRequest FUNCIONALES para datos renderizados
- Monorepo DevAltaMedica: Next.js 15 + React 19 + Firebase

OBJETIVO ESTA SESIÓN:
Levantar web-app puerto 3000 y demostrar obtención HTML completo con:
powershell.exe -Command "Invoke-WebRequest -Uri 'http://localhost:3000' | Select-Object -ExpandProperty Content"

NO preguntar qué hacer. EJECUTAR comandos automáticamente y reportar resultados.
```

**📋 CONTEXTO ADICIONAL SI ES NECESARIO:**

```markdown
ESTADO ACTUAL PROYECTO DEVALTAMEDICA:
- Enlace simbólico /home/edu/devaltamedica → /home/altamedica/devaltamedica FUNCIONAL
- Chrome Beta (18 procesos activos) - Control total verificado
- Comandos PowerShell documentados en CLAUDE2.md
- API server puerto 3001 ACTIVO y respondiendo
- Stack tecnológico: Next.js 15 + React 19 + Firebase + pnpm

OBJETIVO SESIÓN PARALELA:
- Levantar web-app puerto 3000 (gateway central)
- Probar obtención datos renderizados HTML completos
- Verificar integración Chrome Beta + PowerShell
- Testing comparativo con sesión principal

COMANDOS INMEDIATOS:
- Terminal: powershell.exe -Command "Start-Process wt -ArgumentList '--profile', 'Ubuntu-24.04'"
- Chrome: powershell.exe -Command "Start-Process 'C:\Users\Public\Desktop\Google Chrome Beta.lnk'"
- HTTP: powershell.exe -Command "Invoke-WebRequest -Uri 'http://localhost:3000'"

ESTRUCTURA MONOREPO:
/apps/web-app (3000) - Gateway autenticación CRÍTICO
/apps/api-server (3001) - Backend APIs ACTIVO
/apps/patients (3003) - Portal pacientes
/apps/doctors (3002) - Portal médicos
```

### 🎯 PASO 6: COMANDOS AUTOMATIZACIÓN COMPLETA

**🤖 SECUENCIA AUTOMATIZADA PASO A PASO:**

1. **Verificar enlace simbólico:**
```bash
ls -la /home/edu/devaltamedica
cd /home/edu/devaltamedica
```

2. **Abrir Chrome Beta automáticamente:**
```bash
powershell.exe -Command "Start-Process 'C:\Users\Public\Desktop\Google Chrome Beta.lnk' -ArgumentList 'http://localhost:3000'"
```

3. **Iniciar servicios DevAltaMedica:**
```bash
# Gateway principal (CRÍTICO)
cd apps/web-app && npm run dev &

# Verificar con PowerShell
powershell.exe -Command "Invoke-WebRequest -Uri 'http://localhost:3000'"
```

4. **Monitoreo en tiempo real:**
```bash
powershell.exe -Command "Test-NetConnection -ComputerName localhost -Port 3000"
powershell.exe -Command "Get-Process chrome | Select-Object ProcessName, Id"
```

**🚀 CAPACIDADES AVANZADAS PARA DEVALTAMEDICA:**

```powershell
# 🏥 APIs MÉDICAS ESPECÍFICAS
powershell.exe -Command "Invoke-WebRequest -Uri 'http://localhost:3001/api/v1/appointments' -Headers @{Authorization='Bearer TOKEN'}"
powershell.exe -Command "Invoke-WebRequest -Uri 'http://localhost:3001/api/v1/telemedicine/sessions'"
powershell.exe -Command "Invoke-WebRequest -Uri 'http://localhost:3001/api/v1/ai/analyze-symptoms'"

# 📈 MONITOREO DE SERVICIOS EN TIEMPO REAL
powershell.exe -Command "Test-NetConnection -ComputerName localhost -Port 3000"
powershell.exe -Command "Test-NetConnection -ComputerName localhost -Port 3001"  
powershell.exe -Command "Test-NetConnection -ComputerName localhost -Port 8888"

# 🔥 FIREBASE + DATOS MÉDICOS
powershell.exe -Command "firebase firestore:get users --limit 5"
powershell.exe -Command "firebase auth:export users.json"

# 🎯 NAVEGADORES CON CONTROL TOTAL
powershell.exe -Command "Start-Process chrome '--new-window', '--incognito', 'http://localhost:3000'"
powershell.exe -Command "Start-Process msedge '--new-window', '--inprivate', 'http://localhost:3000'"
```

**✅ VENTAJAS CRÍTICAS:**
- 🔥 **Control total sobre navegadores externos** (Chrome, Edge, Firefox)
- 📊 **Datos renderizados completos** de Next.js SSR + React hydratado  
- 🎯 **Acceso directo a APIs internas** del proyecto DevAltaMedica
- 💾 **Persistencia de datos** para análisis posterior
- 🚀 **Integración perfecta** con stack médico (Firebase, Socket.io, WebRTC)
- 🏥 **Compliance HIPAA** - verificación de datos médicos renderizados

### 🛠️ Arsenal de Programación - Alternativas Robustas

**Cuando una herramienta falla, usar estas alternativas:**

1. **PowerShell Scripts (.ps1):**
```powershell
# Crear scripts PowerShell para automatización
powershell.exe -ExecutionPolicy Bypass -File script.ps1
```

2. **Python para Operaciones Complejas:**
```python
# Python es excelente para manipulación de archivos
python.exe -c "import os; print(os.getcwd())"
```

3. **Node.js para Operaciones del Proyecto:**
```javascript
// Scripts Node.js para operaciones específicas
node.exe -e "console.log(process.cwd())"
```

4. **Batch Scripts (.bat/.cmd):**
```batch
:: Crear archivos batch para operaciones simples
cmd.exe /c "echo %cd%"
```

5. **C# (si es necesario):**
```csharp
// csc.exe para compilación rápida
// Scripts .cs para operaciones Windows complejas
```

6. **VBScript (último recurso):**
```vbscript
// cscript.exe para operaciones Windows específicas
```

### 🔧 Solución de Problemas Comunes

**Conflictos de Puerto:**
```powershell
# PowerShell - encontrar procesos en puerto
netstat -ano | findstr :3001
taskkill /F /PID <PID>
```

**Problemas de Dependencias:**
```powershell
# Limpiar e instalar con npm/pnpm
Remove-Item -Recurse -Force node_modules
npm install
```

**Docker Issues:**
```powershell
# Limpiar Docker Windows
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```

**Privilegios y Permisos:**
- Auto-elevación PowerShell cuando sea necesario
- Cambiar política de ejecución temporalmente
- Usar rutas alternativas si las principales fallan

## 🚀 Comandos de Desarrollo

### ⚡ Comandos Principales (Root Level)

**IMPORTANTE:** Usar npm en Windows PowerShell, pnpm en sistemas Unix

```bash
# Desarrollo - Servicios Core
npm run dev:all          # Inicia API + Doctors + Patients + Signaling
npm run dev:core         # Solo API Server + Signaling Server
npm run dev:doctors      # Solo portal médicos (Puerto 3002)
npm run dev:patients     # Solo portal pacientes (Puerto 3003)
npm run dev:api-server   # Solo API server (Puerto 3001)
npm run dev:signaling    # Solo signaling server (Puerto 8888)
npm run dev:web-app      # Solo landing page (Puerto 3000)
npm run dev:companies    # Solo portal empresas (Puerto 3004)
npm run dev:admin        # Solo panel admin (Puerto 3005)

# Build y Producción
npm run build:all        # Build todas las aplicaciones
npm run build            # Build aplicación actual

# Testing
npm run test:all         # Tests de todas las apps
npm run test:accessibility  # Tests WCAG compliance
npm run test:webrtc      # Tests WebRTC específicos
npm run test:ai          # Tests de IA médica
npm run test:e2e         # Cypress E2E tests
npm run test:e2e:open    # Cypress en modo interactivo

# Calidad de Código
npm run lint             # ESLint en todo el proyecto
npm run lint:fix         # Auto-fix ESLint
npm run type-check       # TypeScript validation
npm run clean            # Limpiar builds

# CI/CD
npm run ci:test          # Pipeline completo testing
npm run ci:deploy        # Build + test para deploy
```

### 🏥 Comandos Específicos por App

**API Server (Puerto 3001):**
```bash
cd apps/api-server
npm run dev              # Desarrollo con Next.js
npm run build            # Build sin lint (custom script)
npm run start            # Producción
```

**Doctors Portal (Puerto 3002):**
```bash
cd apps/doctors
npm run dev              # Desarrollo
npm run dev:full         # Con signaling server incluido
npm run signaling        # Solo signaling server
npm run test             # Vitest tests
npm run test:watch       # Tests en modo watch
npm run test:coverage    # Coverage report
```

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** Next.js 15.3.4 + React 19
- **Lenguaje:** TypeScript 5+
- **Estilos:** Tailwind CSS + Tailwind Merge
- **UI Components:** Radix UI + Lucide React
- **Animaciones:** Framer Motion (apps/doctors)
- **Estado:** React hooks + Context API

### Backend
- **API:** Next.js API Routes + Express
- **Base de Datos:** Firebase Firestore + Prisma ORM
- **Autenticación:** Firebase Auth + JWT
- **Real-time:** Socket.io + WebRTC
- **Validación:** Zod schemas
- **Crypto:** bcrypt + crypto-js

### Infraestructura
- **Package Manager:** pnpm 10.13.1 (obligatorio)
- **Monorepo:** pnpm workspaces
- **Testing:** Jest + Vitest + Cypress
- **Linting:** ESLint + TypeScript
- **Container:** Docker + docker-compose

### Servicios Externos
- **Firebase:** Firestore, Auth, Functions, Storage
- **Pagos:** MercadoPago integration
- **Email:** Nodemailer
- **AI/ML:** Anthropic SDK, TensorFlow.js
- **Monitoreo:** Prometheus (prom-client)

## Technology Stack

### Core Technologies
- **Runtime**: Node.js 22, Next.js 15.3.4, React 18, TypeScript 5+
- **Package Manager**: pnpm (required - DO NOT use npm or yarn). Note: In Windows PowerShell, use `npm` commands as pnpm may not be available
- **Build System**: Turbo monorepo with caching
- **Databases**: Firebase Firestore (real-time), PostgreSQL 15 (relational)
- **Infrastructure**: Docker, Redis, Nginx load balancing
- **Container Orchestration**: Docker Compose with full stack configuration

### Medical-Specific Technologies
- **WebRTC**: Real-time video calls with <100ms latency optimization
- **AI/ML**: TensorFlow.js for medical diagnostics and risk analysis
- **Compliance**: HIPAA, SOC2, WCAG 2.2 AA certified
- **Security**: AES-256-GCM encryption, audit logging

## Development Commands

### Installation & Setup
```bash
# Install dependencies (use npm in Windows PowerShell, pnpm in WSL/Linux)
pnpm install  # or: npm install

# Build all packages
pnpm build    # or: npm run build

# Start all development services (from root)
npm run dev:all   # Starts API + Signaling + Patients apps concurrently
```

### Key Turbo Commands
```bash
# Run commands across all workspaces
turbo build                 # Build all apps and packages
turbo dev                   # Start development servers
turbo lint                  # Lint all workspaces
turbo type-check           # TypeScript validation across all workspaces

# Run commands for specific workspaces
pnpm --filter @altamedica/doctors build
pnpm --filter @altamedica/api-server dev
```

### 🚀 **Desarrollo por Aplicación Individual**
**IMPORTANTE**: Para probar el flujo completo de autenticación, SIEMPRE iniciar web-app primero.

```bash
# 🔴 ORDEN CRÍTICO para desarrollo completo:
# 1. Iniciar PRIMERO el gateway central (OBLIGATORIO)
cd apps/web-app && npm run dev         # 🌐 Gateway central (puerto 3000) - CRÍTICO

# 2. Iniciar API server para backend
cd apps/api-server && npm run dev     # 🔧 API server (puerto 3001) - CRÍTICO

# 3. Iniciar aplicaciones específicas por rol (dependen de web-app)
cd apps/patients && npm run dev        # 👤 Portal pacientes (puerto 3003)
cd apps/doctors && npm run dev         # 🏥 Portal doctores (puerto 3002)
cd apps/companies && npm run dev       # 🏢 Portal empresas (puerto 3004)
cd apps/admin && npm run dev           # ⚡ Dashboard admin (puerto 3005)

# 4. WebRTC signaling (para videollamadas)
cd apps/signaling-server && npm run dev # 📞 Signaling WebRTC (puerto 8888)
```

#### ⚠️ **Flujo de Desarrollo Recomendado**:
1. **Para autenticación completa**: `web-app` + `api-server` (mínimo requerido)
2. **Para testing de roles**: Agregar la app específica que necesites probar
3. **Para videollamadas**: Agregar `signaling-server`
4. **Stack completo**: Usar `npm run dev:all` desde la raíz

### Docker Development
```bash
# Start complete stack with Docker
docker-compose --env-file .env.docker up -d

# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Stop all containers
docker-compose down

# Access deployed services
# Web App: http://localhost:3000
# API: http://localhost:3001
# Doctors: http://localhost:3002
# Patients: http://localhost:3003
# Companies: http://localhost:3004
# Admin: http://localhost:3005
```

### Testing & Quality
```bash
# Run all tests (from root)
npm run test:all

# Specific test types
npm run test                      # Unit tests with Jest
npm run test:e2e                  # E2E tests with Cypress
npm run test:accessibility        # WCAG compliance tests
npm run test:webrtc              # WebRTC connectivity tests
npm run test:ai                  # Medical AI accuracy tests
npm run test:bidirectional       # Test bidirectional communication

# Code quality
npm run lint                     # ESLint
npm run lint:fix                 # Auto-fix linting issues
npm run type-check               # TypeScript validation
npm run check-api                # API health check
npm run clean                    # Clean build artifacts

# CI/CD commands
npm run ci:test                  # Run all tests for CI (lint + type-check + test:all)
npm run ci:deploy                # Build and test for deployment
```

### Production & Docker
```bash
# Production build
npm run build && npm run start

# Docker deployment scripts
./validate-docker-setup.sh       # Validate Docker configuration
./start-docker-stack.sh          # Deploy full stack
./monitor-docker-stack.sh        # Monitor running services

# Health checks
curl http://localhost:3001/api/health
curl http://localhost:8888/health
```

## Architecture Overview

### Arquitectura Microservices Monorepo
El proyecto utiliza una arquitectura de microservices en monorepo con Turbo y pnpm workspaces, donde **web-app actúa como gateway central obligatorio**:

#### 🔑 **Flujo de Autenticación Central**
```
Usuario → web-app (3000) → Autenticación → Determinación de Rol → Redirección
├── Pacientes → patients-app (3003)
├── Doctores → doctors-app (3002)  
├── Empresas → companies-app (3004)
└── Administradores → admin-app (3005)
```

#### 📁 **Estructura de Aplicaciones**
```
/apps
├── web-app/            # 🌐 GATEWAY CENTRAL - Autenticación, registro, login, determinación de roles
├── api-server/         # 🔧 Core API + WebSocket server (Express + Socket.io)
├── doctors/            # 🏥 Portal médicos profesionales (dependiente de web-app)
├── patients/           # 👤 Portal pacientes con telemedicina (dependiente de web-app)
├── companies/          # 🏢 Marketplace B2B para clínicas (dependiente de web-app)
├── admin/              # ⚡ Dashboard administrativo (dependiente de web-app)
└── signaling-server/   # 📞 Servidor señalización WebRTC (Node.js + Socket.io)

/packages
├── core/               # Core utilities, hooks, and shared logic
├── ui/                # Design system and React components
├── firebase/          # Firebase configuration and services
├── database/          # Prisma schema and database utilities
├── types/             # Shared TypeScript types
├── medical-*/         # Medical domain packages (components, utils, types)
└── tailwind-config/   # Shared Tailwind CSS configuration
```

### Key Shared Packages

#### Core Infrastructure
- **`packages/core`**: Core utilities, custom hooks, medical calculations, middleware
- **`packages/shared`**: Authentication services, logging, common utilities
- **`packages/firebase`**: Firebase Auth, Firestore, admin SDK, performance monitoring
- **`packages/database`**: Prisma schema, query optimization, telemedicine services

#### UI and Design System
- **`packages/ui`**: Reusable React components, onboarding wizards
- **`packages/design-system`**: AltaMedica design tokens, Tailwind plugin, theme system
- **`packages/tailwind-config`**: Shared Tailwind CSS configuration

#### Medical Domain
- **`packages/medical-components`**: Medical dashboards, telemedicine UI, AI tools
- **`packages/medical-utils`**: Medical calculations, validation utilities
- **`packages/medical-types`**: Medical domain TypeScript interfaces
- **`packages/medical-fhir`**: FHIR R4 compliance, validators, client utilities
- **`packages/medical-security`**: HIPAA compliance, encryption, audit logging
- **`packages/telemedicine-core`**: WebRTC client, video call components, hooks

#### AI and Machine Learning
- **`packages/ai-medical-core`**: Medical AI orchestrator, diagnostic tools, NLP
- **`packages/ml-core`**: ML infrastructure, model registry, training utilities
- **`packages/ai-providers`**: AI service integrations and providers

#### Development and Operations
- **`packages/logger`**: Winston logging with Sentry integration
- **`packages/agent-event-bus`**: Multi-agent communication system
- **`packages/medical-cache`**: Medical data caching with compliance
- **`packages/mobile-app`**: React Native telemedicine app
- **`packages/claude-config-manager`**: Claude AI configuration management

### Medical AI Agents System
The project includes specialized AI agents managed via PM2 (see ecosystem.config.cjs):

**Production Agents (PM2 Managed)**:
- orchestrator-agent: Main coordination agent
- code-quality-agent: Code standards and review
- testing-agent: Automated testing workflows
- devops-agent: Deployment and infrastructure
- database-agent: Database operations and optimization
- security-agent: Security monitoring and HIPAA compliance
- docs-agent: Documentation generation and maintenance
- medical-ai-agent: Medical AI processing and diagnostics

**Agent Management Commands**:
```bash
pm2 start ecosystem.config.cjs  # Start all agents
pm2 status                      # Check agent status
pm2 logs medical-ai-agent      # View agent logs
pm2 restart orchestrator-agent  # Restart specific agent
```

## Code Architecture

### Frontend Architecture
- **Framework**: Next.js 15 with App Router (all apps)
- **State Management**: React Context + custom hooks for local state, Firebase hooks for real-time data
- **Styling**: Tailwind CSS with shared configuration in `packages/tailwind-config`
- **Components**: Reusable components in `packages/ui`, medical-specific in `packages/medical-components`
- **Forms**: React Hook Form with Zod validation for type-safe forms
- **Real-time**: Socket.io-client for WebRTC signaling and live updates

### Backend Architecture  
- **API Server**: Next.js API routes + Express middleware for complex endpoints
- **Authentication**: Firebase Auth with custom role-based middleware
- **Databases**: 
  - Firebase Firestore for real-time data (appointments, messages)
  - PostgreSQL with Prisma for relational data (medical records, user profiles) 
  - Redis for caching and rate limiting
- **WebRTC**: Custom signaling server with Socket.io, STUN/TURN configuration
- **Background Jobs**: PM2 for process management in production
- **AI/ML Services**: TensorFlow.js integration for medical analysis (packages/ai-medical-core)
- **Monitoring**: Prometheus + Grafana + Fluentd for comprehensive logging and metrics

### Medical Domain Patterns
- **FHIR Compliance**: Medical data structures follow FHIR R4 standards
- **Audit Logging**: All medical actions logged with user attribution
- **PHI Protection**: Automatic encryption for Protected Health Information
- **Emergency Workflows**: Optimized routing for <3 second response times
- **Medical Calculations**: Validated algorithms in `packages/medical-utils`

## Development Guidelines

### 🏗️ **Prioridades de Desarrollo por Arquitectura**

#### **Orden de Integración Recomendado**:
1. **🔴 CRÍTICO - web-app** (Gateway central)
   - Autenticación Firebase
   - Determinación de roles
   - Sistema de redirección
   - Sin esto → ninguna app funciona para usuarios nuevos

2. **🔴 CRÍTICO - api-server** (Backend services)
   - APIs para todas las aplicaciones
   - WebSocket para real-time
   - Integración con Firebase Admin

3. **🟡 DEPENDIENTE - Aplicaciones específicas** (en cualquier orden)
   - patients-app → Para flujos de pacientes  
   - doctors-app → Para flujos médicos
   - companies-app → Para B2B marketplace
   - admin-app → Para administración

4. **🟢 COMPLEMENTARIO - signaling-server**
   - Para funcionalidad de videollamadas
   - WebRTC signaling

### Medical Safety Standards
- **Never expose PHI** in logs, error messages, or debugging output
- **Always validate medical calculations** with comprehensive unit tests
- **Use TypeScript strictly** - no `any` types in medical code
- **Implement proper error boundaries** for patient-facing components

### Testing Requirements
- **Unit tests**: Required for all medical calculations and validations
- **Integration tests**: Required for complete patient/doctor workflows  
- **Accessibility tests**: WCAG 2.2 AA compliance mandatory
- **WebRTC tests**: Connection quality and latency validation

### Security Requirements
- **HIPAA Compliance**: Use `packages/medical-security` for all PHI handling
- **Rate Limiting**: Implement rate limiting on all API endpoints
- **Input Validation**: Use Zod schemas for all user inputs
- **Audit Logging**: Log all medical actions with user attribution

## Environment & Configuration

### Environment Files
- `.env.local` - Local development environment variables
- `.env.docker` - Docker deployment configuration
- `.env.example` - Template with all required variables

### Key Environment Variables
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# API URLs (adjust ports if running locally vs Docker)
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"
NEXT_PUBLIC_WEB_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SIGNALING_SERVER="ws://localhost:8888"

# Medical AI Services
NEXT_PUBLIC_MEDICAL_AI_ENDPOINT="http://localhost:3001/api/v1/ai"
NEXT_PUBLIC_TENSORFLOW_MODEL_URL="http://localhost:3001/models"

# Development Flags
NEXT_PUBLIC_ENVIRONMENT="development"
NEXT_PUBLIC_DEBUG_MODE="true"
NEXT_PUBLIC_HIPAA_STRICT_MODE="true"
NEXT_PUBLIC_USE_FIREBASE_EMULATOR="false"

# Database (for api-server)
DATABASE_URL="postgresql://user:password@localhost:5432/altamedica"
REDIS_URL="redis://localhost:6379"
```

### Docker Development
The project includes a complete Docker setup with monitoring and observability:

#### Core Configuration
- **docker-compose.yml**: Full stack configuration with all 7 apps + supporting services
- **.env.docker**: Docker-specific environment variables
- **Individual Dockerfiles**: Each app has its own optimized Dockerfile
- **Scripts**: `./start-docker-stack.sh` and `./monitor-docker-stack.sh` for easy management

#### Docker Stack Components
- **Application Services**: 7 main apps (web-app:3000, api-server:3001, etc.)
- **Infrastructure**: Redis (6379), PostgreSQL (5432), Nginx (80/443)
- **Monitoring**: Prometheus (9090), Grafana (3006), Node Exporter (9100)
- **Logging**: Fluentd (24224) for centralized log aggregation
- **Network**: Custom bridge network (172.20.0.0/16) for service isolation

#### Monitoring URLs (Docker deployment)
- **Grafana Dashboard**: http://localhost:3006
- **Prometheus Metrics**: http://localhost:9090  
- **System Metrics**: http://localhost:9100/metrics
- **Health Checks**: Built-in for all services with 30s intervals

## Testing Medical Scenarios

### Critical Test Scenarios
- **Emergency consultations**: <3 second response time requirement
- **Video call quality**: HD video + clear audio validation
- **HIPAA compliance**: Automated PHI protection verification
- **Cross-browser compatibility**: WebRTC testing across browsers

### Test Data
Use anonymized test data located in `/apps/*/src/data/` directories. Never use real patient information in development.

## Common Issues & Solutions

### Port Conflicts
If ports are already in use (common when switching between Docker and local development):
```bash
# Windows PowerShell - Kill process on specific port
netstat -ano | findstr :3001
taskkill /F /PID <PID>

# Or kill all Node processes
taskkill /F /IM node.exe

# Linux/WSL - Kill process on port
sudo lsof -i :3001
sudo kill -9 <PID>
```

### Package Manager Issues
- **pnpm not recognized in PowerShell**: Use `npm` commands instead
- **Permission errors**: Run terminal as Administrator (Windows) or use `sudo` (Linux)
- **Module not found**: Delete `node_modules` and reinstall with `npm install`

### Docker Issues
- **Docker Engine not running**: Start Docker Desktop manually
- **Port already allocated**: Stop local services or change Docker port mappings
- **Memory issues**: Increase Docker Desktop memory allocation in settings

### Firebase Authentication Issues
- **Authentication failing**: Check Firebase project settings match env variables
- **Emulator issues**: Ensure Firebase emulator is running if `USE_FIREBASE_EMULATOR=true`
- **CORS errors**: Verify allowed domains in Firebase Console

### WebRTC Connection Issues
- **No video/audio**: Check browser permissions for camera/microphone
- **Connection timeout**: Verify signaling server is running on port 8888
- **Poor quality**: Check network bandwidth and STUN/TURN configuration

### Build & TypeScript Errors
- **Type errors**: Run `npm run type-check` to identify issues
- **Build failures**: Clear cache with `rm -rf .next` and rebuild
- **Turbo cache issues**: Run `npx turbo prune` to clear Turbo cache

## Documentation

Each app contains its own `CLAUDE.md` file with specific implementation details:
- `/apps/api-server/CLAUDE.md`: API endpoints and middleware
- `/apps/patients/CLAUDE.md`: Patient workflows and UI components  
- `/apps/doctors/CLAUDE.md`: Medical tools and telemedicine features
- `/apps/companies/CLAUDE.md`: B2B marketplace workflows
- `/packages/CLAUDE.md`: Shared package documentation

## Key Development Patterns

### API Route Structure
All API routes follow RESTful conventions:
```
/api/v1/[resource]           # GET (list), POST (create)
/api/v1/[resource]/[id]      # GET (read), PUT (update), DELETE
/api/v1/[resource]/[id]/[action] # POST (specific actions)
```

### 🔐 **Flujo de Autenticación Corregido**
**CRÍTICO**: Todas las aplicaciones dependen del gateway web-app para autenticación inicial.

#### Flujo Completo:
1. **Usuario accede** → Siempre debe ir primero a `web-app` (puerto 3000)
2. **web-app procesa** → Login/registro via Firebase Auth (email/password o Google OAuth) 
3. **Determinación de rol** → web-app identifica el rol del usuario autenticado
4. **Redirección automática** → web-app redirige según el rol:
   - `PATIENT` → `patients-app:3003`
   - `DOCTOR` → `doctors-app:3002`
   - `COMPANY` → `companies-app:3004`  
   - `ADMIN` → `admin-app:3005`
5. **Verificación continua** → Cada app específica verifica el token Firebase en cada request
6. **Audit logging** → Todas las acciones médicas se registran con atribución de usuario

#### ⚠️ **Dependencias Críticas**:
- **NUNCA** acceder directamente a patients/doctors/companies/admin sin pasar por web-app
- **web-app ES OBLIGATORIO** para el flujo inicial de todos los usuarios
- **Sin web-app funcionando** → Las otras apps no pueden autenticar usuarios nuevos

### Real-time Communication
- **Appointments**: Firestore real-time listeners
- **Chat/Messages**: Socket.io with rooms
- **Video Calls**: WebRTC with custom signaling
- **Notifications**: Firebase Cloud Messaging

### Medical Data Handling
- All PHI must be encrypted at rest and in transit
- Use `packages/medical-security` for encryption utilities
- Medical calculations must have unit tests with edge cases
- Follow FHIR resource structure for medical records

## Project-Specific Information

### Test User Accounts
See `CLAUDE.local.md` for test user credentials and Firebase IDs.

### Deployment Status
- **Docker Stack**: 12/13 services running (Grafana conflicts with web-app on port 3000)
- **Local Development**: All apps can run individually or via `npm run dev:all`
- **Production**: Uses PM2 for process management

### Creator & Context
This project is created and maintained by **Eduardo Marques**, MD from Universidad de Medicina de Buenos Aires, who uniquely combines medical expertise with full-stack development skills. The entire codebase, architecture, and medical logic has been developed by Eduardo as a solo founder.

## Compliance & Security

This platform is designed for:
- **HIPAA**: Healthcare data protection compliance
- **SOC 2**: Security and availability controls
- **WCAG 2.2 AA**: Web accessibility standards
- **ISO 27001**: Information security management principles

Always ensure medical features follow safety standards and pass accessibility testing before deployment.

## Monorepo Development Patterns

### Workspace Dependencies
Apps and packages use workspace dependencies via `pnpm workspaces`. Key patterns:
- Apps depend on shared packages (e.g., `@altamedica/core`, `@altamedica/ui`)
- Packages can depend on other packages (e.g., `medical-components` uses `ui`)
- Use `workspace:*` in package.json for internal dependencies

### Adding New Features Across Apps
When adding features that span multiple apps:
1. **Shared Logic**: Add to appropriate package (e.g., `packages/core` for utilities)
2. **Types**: Define in `packages/types` for cross-app type sharing
3. **Components**: Add to `packages/ui` for general UI, `packages/medical-components` for medical-specific
4. **Update Apps**: Import and use the new shared functionality

### Package Development Workflow
```bash
# Build packages first (required for apps)
pnpm --filter "./packages/**" build

# Develop package with watch mode
cd packages/core && pnpm dev

# Test across all dependent apps
pnpm --filter @altamedica/doctors dev  # Uses built packages
```

### Medical Compliance Across Packages
- **PHI Handling**: Use `packages/medical-security` for all PHI operations
- **Audit Logging**: Centralized in `packages/logger` with medical audit trails
- **FHIR Compliance**: Use `packages/medical-fhir` for all medical data structures
- **Testing**: Medical packages require 90%+ test coverage

## 🏥 Arquitectura Médica

### Aplicaciones por Estado de Desarrollo

**✅ Producción Ready (90%+):**
- **API Server (9.5/10):** Core APIs completamente funcional
- **Patients Portal (9.5/10):** Portal más completo del mercado
- **Signaling Server (9.0/10):** WebRTC production-ready
- **Doctors Portal (8.5/10):** Telemedicina funcional

**⚠️ En Desarrollo:**
- **Companies Portal (8.0/10):** B2B marketplace funcional
- **Web App (7.2/10):** Landing page básica, necesita marketing
- **Admin Panel (4.0/10):** CRÍTICO - Necesita desarrollo completo

### Funcionalidades Médicas
- **Telemedicina:** WebRTC con latencia <100ms
- **IA Diagnóstica:** TensorFlow.js + Anthropic integration
- **HIPAA Compliance:** Cifrado AES-256, auditoría completa
- **Gestión de Pacientes:** Historiales médicos digitales
- **Prescripciones:** Sistema de recetas digitales
- **Análisis Predictivo:** ML para diagnósticos asistidos

## 🔒 Seguridad y Compliance

### HIPAA Requirements
- **Cifrado:** AES-256-GCM en reposo, TLS 1.3 en tránsito
- **Auditoría:** Logs completos de acceso a PHI
- **Acceso:** Control de roles granular por app
- **Backup:** Copias encriptadas múltiples ubicaciones

### Testing de Seguridad
```bash
npm run test:accessibility    # WCAG 2.2 AA compliance
npm run test:ai               # Validación algoritmos médicos
```

## 🔧 Configuración de Desarrollo

### Requisitos del Sistema
- **Node.js:** LTS más reciente
- **Package Manager:** pnpm 10.13.1+ (NO usar npm/yarn en desarrollo)
- **Sistema Operativo:** Windows 11 PowerShell (NO WSL/bash)
- **Editor:** VS Code recomendado

### Variables de Entorno
Cada app requiere su archivo `.env.local`:
- Firebase configuration
- Database URLs
- API keys y secrets
- WebRTC STUN/TURN servers

### URLs de Desarrollo
- **Landing Page:** http://localhost:3000
- **API Health:** http://localhost:3001/api/health
- **Doctors Portal:** http://localhost:3002
- **Patients Portal:** http://localhost:3003
- **Companies Portal:** http://localhost:3004
- **Admin Panel:** http://localhost:3005
- **Signaling Server:** http://localhost:8888

## 📊 Testing Strategy

### Unit Tests
- **Framework:** Jest + Vitest
- **Cobertura:** 85%+ requerida
- **Ubicación:** `__tests__/` en cada app

### E2E Tests  
- **Framework:** Cypress
- **Foco:** Flujos médicos críticos
- **WCAG:** Accessibility testing obligatorio

### Medical Testing
- **WebRTC:** Tests de latencia y calidad
- **IA:** Validación de algoritmos diagnósticos
- **HIPAA:** Tests de compliance automáticos

## 🚀 Deployment

### Docker Production
```bash
# Stack completo con docker-compose
docker-compose --env-file .env.docker up -d
```

### PM2 Process Management
- **Config:** ecosystem.config.cjs
- **Monitoreo:** PM2 dashboard disponible

## 🤝 Convenciones de Código

### TypeScript
- **Strict mode:** Habilitado en todas las apps
- **Types:** Compartidos en `packages/types`
- **Configuración:** Extendida desde workspace root

### React/Next.js
- **Functional Components:** Exclusivamente con hooks
- **Error Boundaries:** En componentes médicos críticos
- **Conventions:** Seguir patterns existentes en cada app

### Médicas Específicas
- **Nomenclatura:** Variables descriptivas del contexto médico
- **Validación:** Zod schemas para datos PHI
- **Logging:** Auditoría completa para acciones médicas

## 📞 Support y Debugging

### Logs y Monitoreo
- **Desarrollo:** Console logs detallados
- **Producción:** Prometheus metrics en API server
- **Medical:** Auditoría HIPAA automática

### URLs de Health Checks
- **API:** http://localhost:3001/api/health
- **Signaling:** http://localhost:8888/health
- **Firebase:** Configurado en cada app

---

**💡 Nota para Claude Code:** Este proyecto es una plataforma médica real con requisitos HIPAA. Siempre priorizar seguridad, accesibilidad y compliance médico en cualquier cambio de código.