# 📦 Análisis Completo de Dependencias del Monorepo AltaMedica

**Proyecto:** AltaMedica Healthcare Platform  
**Fecha:** 30 de julio de 2025  
**Estado:** 🔍 **ANÁLISIS COMPLETADO**

---

## 🎯 Resumen Ejecutivo

### Hallazgos Críticos Identificados ⚠️

1. **Duplicación Masiva de Dependencias**: El package.json root contiene dependencias que deberían estar solo en packages o apps específicas
2. **Conflictos de Peer Dependencies**: React 19 causa múltiples warnings con bibliotecas que esperan React 18
3. **Configuración ESLint Obsoleta**: Root usa ESLint v8 con configuración .eslintrc que requiere migración a v9
4. **Versiones Desactualizadas en Root**: Next.js 14 en root vs 15.3.4 en aplicaciones

---

## 📊 Estructura Actual del Monorepo

### **Distribución de package.json Files**
- **Total de package.json encontrados**: 170 archivos
- **Aplicaciones principales**: 6 apps + 1 signaling-server
- **Packages compartidos**: 24 packages en `/packages/`
- **Archivos adicionales**: Functions, servers, subdirectorios

### **Aplicaciones Identificadas**
| Aplicación | Puerto | Estado | Dependencias Principales |
|---|---|---|---|
| `web-app` | 3000 | ✅ Estándar | React 19, Next.js 15.3.4, Firebase |
| `api-server` | 3001 | ✅ Estándar | React 19, Express, Firebase Admin |
| `doctors` | 3002 | ✅ Estándar | React 19, WebRTC, MCP SDK |
| `patients` | 3003 | ✅ Estándar | React 19, Socket.io, AI |
| `companies` | 3004 | ✅ Estándar | React 19, Leaflet, MercadoPago |
| `admin` | 3005 | ✅ Estándar | React 19, Analytics |

---

## 🔍 Análisis Detallado por Nivel

### **1. Root Package.json - Problemático** ❌

#### Dependencias que NO deberían estar en root:
```json
{
  "dependencies": {
    "@tensorflow/tfjs": "^4.20.0",           // Solo para AI packages
    "@tensorflow/tfjs-node": "^4.20.0",      // Solo para API server
    "firebase": "^10.13.1",                  // Ya está en @altamedica/firebase
    "crypto": "^1.0.1",                      // DEPRECATED - built-in module
    "express": "^4.18.0",                    // Solo para API server
    "lucide-react": "^0.294.0",              // Solo para apps con UI
    "next": "^14.0.0",                       // DESACTUALIZADO vs apps
    "react": "^18.2.0",                      // DESACTUALIZADO vs apps
    "react-dom": "^18.2.0",                  // DESACTUALIZADO vs apps
    "socket.io": "^4.7.0",                   // Solo para signaling server
    "socket.io-client": "^4.7.0",            // Solo para apps que lo usan
    "tailwindcss": "^3.3.0"                  // Ya está en packages/tailwind-config
  }
}
```

#### Dependencias que SÍ pueden estar en root:
```json
{
  "devDependencies": {
    "concurrently": "^8.2.2",               // Para scripts de desarrollo
    "cypress": "^13.17.0",                  // Para E2E testing
    "eslint": "^8.0.0",                     // Para linting root
    "jest": "^29.0.0",                      // Para testing root
    "typescript": "^5.8.3"                  // Para type-checking global
  }
}
```

### **2. Packages Compartidos - Bien Estructurado** ✅

#### Packages Core Identificados:
```
📦 Infrastructure (5 packages)
├── @altamedica/core              # Utils, hooks generales
├── @altamedica/firebase          # Firebase config central
├── @altamedica/shared            # Auth, servicios compartidos
├── @altamedica/types             # TypeScript definitions
└── @altamedica/database          # Prisma, DB services

📦 Medical Domain (8 packages)
├── @altamedica/medical-components # UI médico
├── @altamedica/medical-fhir      # FHIR compliance
├── @altamedica/medical-security  # HIPAA, encryption
├── @altamedica/medical-types     # Types médicos
├── @altamedica/medical-utils     # Cálculos médicos
├── @altamedica/medical-cache     # PHI caching
├── @altamedica/telemedicine-core # WebRTC core
└── @altamedica/ai-medical-core   # IA médica

📦 UI & Design (4 packages)
├── @altamedica/ui                # Componentes avanzados
├── @altamedica/design-system     # Design system base
├── @altamedica/tailwind-config   # Configuración Tailwind
└── @altamedica/mobile-app        # Componentes móviles

📦 DevOps & Tools (7 packages)
├── @altamedica/eslint-config     # ESLint compartido
├── @altamedica/typescript-config # TS config compartido
├── @altamedica/logger            # Logging centralizado
├── @altamedica/ai-providers      # AI integrations
├── @altamedica/ml-core           # ML infrastructure
├── @altamedica/agent-event-bus   # Inter-service comm
└── @altamedica/claude-config-manager # Claude config
```

### **3. Aplicaciones Individuales - Inconsistencias Menores** ⚠️

#### Problemas Identificados:
1. **Peer Dependencies Warnings**: React 19 no es compatible con algunas librerías
2. **Versiones Diferentes**: Algunas apps usan React 19.1.0 vs 19.0.0
3. **Dependencias Duplicadas**: Algunas apps redeclaran paquetes ya en workspace

---

## 🚨 Conflictos de React 19 Identificados

### **Bibliotecas Problemáticas**:
```
⚠️ lucide-react 0.294.0
   └── ✕ Expected: react ^16.5.1 || ^17.0.0 || ^18.0.0
   └── ✕ Found: react 19.0.0

⚠️ react-redux 8.1.3  
   └── ✕ Expected: react ^16.8 || ^17.0 || ^18.0
   └── ✕ Found: react 19.0.0

⚠️ @testing-library/react 14.3.1
   └── ✕ Expected: react ^18.0.0
   └── ✕ Found: react 19.0.0

⚠️ recharts 3.1.0
   └── ✕ Expected: react ^16.9.0 || ^17.0.0 || ^18
   └── ✕ Found: react 19.0.0

⚠️ react-leaflet 4.2.1
   └── ✕ Expected: react ^18.0.0
   └── ✕ Found: react 19.0.0
```

---

## 💡 Recomendaciones Estructurales

### **FASE 1: Limpieza del Root Package.json** 🧹

#### Mantener en Root:
```json
{
  "dependencies": {
    // ❌ ELIMINAR TODAS - Mover a packages específicos
  },
  "devDependencies": {
    "concurrently": "^8.2.2",               // ✅ Scripts desarrollo
    "cypress": "^13.17.0",                  // ✅ E2E testing
    "typescript": "^5.8.3",                 // ✅ Type checking global
    "eslint": "^9.0.0",                     // ✅ Linting (ACTUALIZAR)
    "jest": "^29.0.0"                       // ✅ Testing global
  }
}
```

#### Mover a Packages:
```bash
# AI/ML Dependencies → packages/ai-medical-core/
@tensorflow/tfjs, @tensorflow/tfjs-node

# Firebase → packages/firebase/ (YA EXISTE)
firebase (eliminar del root)

# Express → apps/api-server/ (YA EXISTE)
express (eliminar del root)

# UI Dependencies → packages/ui/ o apps específicas
lucide-react, tailwindcss

# WebRTC → packages/telemedicine-core/
socket.io, socket.io-client
```

### **FASE 2: Resolver Conflictos React 19** 🔧

#### Opciones Estratégicas:

**Opción A: Downgrade a React 18 (Conservadora)**
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "@types/react": "^18.3.12",
  "@types/react-dom": "^18.3.1"
}
```
- ✅ **Pros**: Compatibilidad inmediata con todas las librerías
- ❌ **Contras**: No aprovecha mejoras de React 19

**Opción B: Mantener React 19 + Actualizar Libraries (Progresiva)**
```bash
# Actualizar librerías que ya soportan React 19
lucide-react: ^0.469.0 (soporte React 19)
@testing-library/react: ^15.0.0 (soporte React 19)

# Usar --legacy-peer-deps temporalmente para otras
pnpm install --legacy-peer-deps
```
- ✅ **Pros**: Stack moderno, mejores features
- ⚠️ **Contras**: Algunos warnings hasta que librerías se actualicen

### **FASE 3: Configuración ESLint Moderna** 📋

#### Migrar a ESLint 9:
```javascript
// eslint.config.js (nuevo formato)
export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module'
    },
    rules: {
      // Reglas específicas para médico
    }
  }
];
```

---

## 🎯 Plan de Implementación Recomendado

### **INMEDIATO (Alta Prioridad)**
1. ✅ **Limpiar Root Dependencies**: Mover dependencias específicas a packages/apps correspondientes
2. ✅ **Actualizar ESLint**: Migrar a v9 con configuración moderna
3. ✅ **Resolver Peer Dependencies**: Decidir estrategia React 18 vs 19

### **CORTO PLAZO (2-3 días)**
4. ✅ **Testing Build Process**: Verificar que todos los builds funcionan después de cambios
5. ✅ **Update Scripts**: Actualizar scripts de desarrollo y CI/CD
6. ✅ **Documentation**: Actualizar guías de desarrollo

### **MEDIANO PLAZO (1-2 semanas)**
7. ✅ **Library Updates**: Actualizar librerías para mejor compatibilidad React 19
8. ✅ **Performance Audit**: Verificar que cambios no afecten performance
9. ✅ **Team Training**: Entrenar equipo en nueva estructura

---

## 📝 Arquitectura Ideal Propuesta

### **Root Package.json** (Minimalista)
```json
{
  "name": "@altamedica/root",
  "private": true,
  "scripts": {
    "dev:all": "concurrently \"pnpm --filter api-server dev\" ...",
    "build:all": "pnpm -r build",
    "test:all": "pnpm -r test",
    "lint": "eslint .",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "cypress": "^13.17.0",
    "eslint": "^9.0.0",
    "typescript": "^5.8.3",
    "jest": "^29.0.0"
  }
}
```

### **Packages Especializados**
- **@altamedica/firebase**: Centraliza toda configuración Firebase
- **@altamedica/ai-medical-core**: TensorFlow y ML dependencies
- **@altamedica/telemedicine-core**: WebRTC y Socket.io
- **@altamedica/ui**: Componentes UI con peer dependencies claras

### **Apps Específicas**
- Solo dependencias específicas de la aplicación
- workspace:* para packages internos
- Versiones alineadas de React/Next.js

---

## 🔍 Comandos de Diagnóstico Ejecutados

```bash
# Análisis estructural
find . -name "package.json" -type f | wc -l        # 170 archivos
pnpm list --depth=0                                # Dependencies root
ls node_modules/@altamedica/                       # Packages build

# Testing y validación  
pnpm install                                       # ⚠️ Warnings detectados
pnpm run lint                                      # ❌ ESLint config missing
pnpm --filter @altamedica/patients run lint       # ⚠️ Peer deps warnings
tsc --version                                      # ✅ TypeScript 5.8.3
```

---

## 🎯 Conclusiones y Próximos Pasos

### **Estado Actual**: 6/10 - Funcional pero Subóptimo

**Fortalezas**:
- ✅ Arquitectura de packages bien definida
- ✅ Aplicaciones con dependencias estandarizadas
- ✅ Workspace configuration correcta

**Debilidades**:
- ❌ Root package.json sobrecargado
- ❌ Conflictos React 19 vs peer dependencies
- ❌ ESLint configuration obsoleta

### **Meta**: 9/10 - Arquitectura Empresarial Optimizada

**Próximos Pasos Críticos**:
1. **Decisión Estratégica**: ¿React 18 (estable) o React 19 (moderno)?
2. **Limpieza Root**: Mover dependencias a packages específicos
3. **Modernización Tools**: ESLint 9, configuraciones actualizadas

---

*Análisis completado por: Claude AI Assistant*  
*Supervisión: Eduardo Marques, MD - Founder AltaMedica*  
*Próxima acción: Decidir estrategia de React y comenzar implementación*