# 🏥 Gemini Context - AltaMedica Medical Platform

Este archivo proporciona contexto específico para Gemini sobre la plataforma médica AltaMedica.

## 🎯 Contexto Principal

**AltaMedica** es una plataforma médica empresarial que combina:
- **Telemedicina avanzada** con WebRTC <100ms latencia
- **IA médica** para diagnóstico asistido 
- **Compliance HIPAA** estricto
- **7 aplicaciones especializadas** en un monorepo

## 🏗️ Arquitectura de Alto Nivel

### Aplicaciones Core (Puertos)
```
web-app:3000      → Gateway público y autenticación
api-server:3001   → Core API + WebSocket (95% producción)
doctors:3002      → Portal médicos con telemedicina
patients:3003     → Portal pacientes (nivel enterprise)
companies:3004    → B2B marketplace médico
admin:3005        → Dashboard administrativo
signaling:8888    → Servidor WebRTC para videollamadas
```

### Packages Compartidos
```
@altamedica/core           → Utilidades, hooks, componentes
@altamedica/types          → TypeScript + Zod schemas médicos
@altamedica/firebase       → Configuración Firebase
@altamedica/ui             → Design system médico
@altamedica/auth           → Autenticación centralizada
@altamedica/medical        → Componentes médicos específicos
@altamedica/telemedicine-core → WebRTC + videollamadas
```

## 🏥 Contexto Médico Crítico

### Compliance HIPAA
- **PHI (Protected Health Information)** debe estar cifrada AES-256-GCM
- **Audit logging** obligatorio para toda interacción médica
- **Role-based access** con granularidad médica
- **Data retention** según regulaciones sanitarias

### Flujo de Autenticación Médica
1. **web-app** como gateway central obligatorio
2. Determinación de rol: PATIENT, DOCTOR, COMPANY, ADMIN
3. Redirección a portal específico
4. Validación continua de tokens Firebase
5. Logging de acciones médicas para auditoría

### Funcionalidades Médicas Críticas
- **Telemedicina HD**: WebRTC con latencia <100ms
- **Gestión de pacientes**: Historiales médicos completos
- **Prescripciones digitales**: Validación y seguimiento
- **Citas médicas**: Scheduling inteligente
- **IA diagnóstica**: TensorFlow.js para análisis de síntomas

## 🔧 Stack Tecnológico

### Frontend
- **Next.js 15** + **React 19** + **TypeScript 5+**
- **Tailwind CSS** con design system médico
- **Firebase Auth** para autenticación
- **Socket.io** para real-time

### Backend
- **Node.js 22** + **Express** + **Next.js API Routes**
- **Firebase Firestore** (real-time) + **PostgreSQL** (relacional)
- **Redis** para caching y rate limiting
- **WebRTC + MediaSoup** para telemedicina

### Medical Technologies
- **TensorFlow.js** para IA médica
- **FHIR R4** para estándares médicos
- **AES-256 encryption** para PHI
- **Audit trails** automáticos

## 🚀 Comandos de Desarrollo

### Comandos Esenciales
```bash
npm install                    # Instalar dependencias
npm run build:packages         # Build packages compartidos
npm run dev:all               # Iniciar apps principales

# Apps individuales
npm run dev:api-server        # Core API (3001)
npm run dev:doctors           # Portal médicos (3002)
npm run dev:patients          # Portal pacientes (3003)

# Testing médico
npm run test:accessibility    # WCAG compliance
npm run test:webrtc          # Testing WebRTC
npm run test:ai              # Testing IA médica
```

### Docker Stack Médico
```bash
docker-compose --env-file .env.docker up -d
# Incluye: PostgreSQL, Redis, Nginx, Prometheus, Grafana
```

## 🔒 Consideraciones de Seguridad

### Restricciones Médicas
- **NUNCA exponer PHI** en logs, debugging o mensajes de error
- **Validar todos los cálculos médicos** con tests comprehensivos
- **TypeScript estricto** - no usar `any` en código médico
- **Error boundaries** en componentes críticos para pacientes

### Patrones de Código Médico
- **Service Layer Pattern** obligatorio para lógica de negocio
- **UnifiedAuth middleware** en todas las rutas API
- **Zod schemas** para validación de datos médicos
- **Audit logging** automático para acciones PHI

## 🧪 Testing Médico

### Requisitos de Testing
- **Unit tests**: Obligatorio para cálculos médicos
- **Integration tests**: Workflows completos paciente-doctor
- **E2E tests**: Scenarios críticos <3 segundos respuesta
- **Accessibility**: WCAG 2.2 AA compliance obligatorio
- **WebRTC tests**: Calidad y latencia validada

### Datos de Testing
- Usar datos anonimizados en `/apps/*/src/data/`
- NUNCA usar información real de pacientes
- Seguir estándares FHIR R4 para scenarios médicos

## 📊 Estado Actual de Aplicaciones

### ✅ Producción Ready
- **api-server** (9.5/10): APIs completamente funcionales
- **patients** (9.5/10): Portal más completo del mercado
- **doctors** (8.5/10): Telemedicina funcional
- **signaling-server** (9.0/10): WebRTC production-ready

### ⚠️ En Desarrollo
- **companies** (8.0/10): B2B marketplace funcional
- **web-app** (7.2/10): Gateway básico, necesita marketing
- **admin** (4.0/10): CRÍTICO - Necesita desarrollo completo

## 🤖 Agentes de Desarrollo (PM2)

### Agentes Especializados
```bash
pm2 start ecosystem.config.cjs  # Iniciar todos los agentes

# Agentes disponibles:
- orchestrator-agent     # Coordinación principal
- medical-ai-agent       # IA médica y diagnósticos
- security-agent         # HIPAA compliance
- code-quality-agent     # Estándares de código
- testing-agent          # Workflows de testing
- devops-agent          # Deployment e infraestructura
```

## 🎯 Prioridades para Gemini

### Análisis Prioritarios
1. **Medical Compliance**: Auditar HIPAA implementation
2. **WebRTC Performance**: Optimizar latencia telemedicina
3. **Code Quality**: Revisar Service Layer patterns
4. **Testing Coverage**: Identificar gaps médicos críticos
5. **Admin Dashboard**: Roadmap para desarrollo completo

### Casos de Uso Comunes
- Análisis de compliance HIPAA
- Optimización de performance WebRTC
- Review de workflows médicos
- Identificación de vulnerabilidades de seguridad
- Mejoras de UX para pacientes y doctores

## 📞 Contexto del Creador

**Eduardo Marques, MD** - Universidad de Medicina de Buenos Aires
- Combinación única de expertise médico + desarrollo full-stack
- Enfoque en patient safety y medical accuracy
- Experiencia en compliance HIPAA y regulaciones sanitarias
- Especialización en telemedicina y IA médica

---

**Instrucciones para Gemini**: Usa este contexto para proporcionar análisis específicos del dominio médico, manteniendo siempre en mente la seguridad del paciente, compliance HIPAA y la excelencia técnica en healthcare.