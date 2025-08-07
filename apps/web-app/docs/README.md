# 🏥 DevAltaMedica - Aplicación Web Médica

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
[![Vitest](https://img.shields.io/badge/Vitest-1.0-6E9F18?style=for-the-badge&logo=vitest)](https://vitest.dev)

## 📋 Tabla de Contenidos

- [📖 Descripción del Proyecto](#-descripción-del-proyecto)
- [🚀 Inicio Rápido](#-inicio-rápido)
- [🏗️ Arquitectura](#️-arquitectura)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🎨 Sistema de Diseño](#-sistema-de-diseño)
- [🧪 Testing](#-testing)
- [📱 Responsividad](#-responsividad)
- [♿ Accesibilidad](#-accesibilidad)
- [🔧 Herramientas de Desarrollo](#-herramientas-de-desarrollo)
- [📚 Documentación](#-documentación)
- [🚀 Deployment](#-deployment)
- [👥 Equipo y Contribución](#-equipo-y-contribución)

## 📖 Descripción del Proyecto

DevAltaMedica es una aplicación web médica moderna construida con Next.js que proporciona un sistema completo de anamnesis médica con motor de decisión clínica, visualización 3D, y gestión de pacientes.

### 🌟 Características Principales

- **Motor de Decisión Clínica**: Sistema basado en reglas JSON con preguntas adaptativas
- **Visualización 3D**: Componentes interactivos con Three.js y React Three Fiber
- **Sistema de Autenticación**: Múltiples proveedores (Firebase, sistema simple)
- **Gestión de Consentimientos**: Módulo completo de consentimiento informado
- **Dashboard Médico**: Interfaz para gestión de pacientes y datos médicos
- **Responsivo**: Diseño adaptable para desktop, tablet y móvil
- **Accesibilidad**: Cumplimiento WCAG 2.1 AA
- **Testing**: Cobertura completa con Vitest y Cypress

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18.0.0 o superior
- npm, yarn, pnpm o bun
- Git

### Instalación

```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd web-app

# Instalar dependencias
npm install
# o
yarn install
# o
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus configuraciones

# Ejecutar en modo desarrollo
npm run dev
# o
yarn dev
# o
pnpm dev
```

### Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo con Turbopack

# Construcción
npm run build        # Construcción para producción
npm run start        # Servidor de producción

# Testing
npm run test         # Tests unitarios con Vitest
npm run test:watch   # Tests en modo watch
npm run test:coverage # Cobertura de tests
npm run test:ui      # Interfaz de testing

# E2E Testing
npm run cypress:open # Abrir Cypress
npm run cypress:run  # Ejecutar tests E2E
npm run test:e2e     # E2E con servidor

# Linting
npm run lint         # ESLint
```

## 🏗️ Arquitectura

### Stack Tecnológico

**Frontend:**
- Next.js 15.3.4 (App Router)
- React 19.0 con TypeScript
- Tailwind CSS para estilos
- Framer Motion para animaciones
- React Three Fiber para 3D

**Estado y Datos:**
- Zustand para gestión de estado
- TanStack Query para cache y sincronización
- React Hook Form para formularios
- Zod para validación

**Testing:**
- Vitest para tests unitarios
- Cypress para E2E
- Testing Library para React

**Herramientas:**
- TypeScript para tipado estático
- ESLint para linting
- Prettier para formateo (configurado)
- Husky para git hooks

### Principios Arquitectónicos

1. **Separación de Responsabilidades**: Lógica de negocio, UI y datos claramente separados
2. **Composición sobre Herencia**: Componentes modulares y reutilizables
3. **Tipado Estricto**: TypeScript en todo el proyecto
4. **Testing First**: Cobertura de tests desde el desarrollo
5. **Accesibilidad**: WCAG 2.1 AA desde el diseño

Abrir [http://localhost:3000](http://localhost:3000) con tu navegador para ver la aplicación.

## 📁 Estructura del Proyecto

```
web-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Rutas de autenticación
│   │   ├── dashboard/         # Dashboard médico
│   │   ├── globals.css        # Estilos globales y variables CSS
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx          # Página principal
│   ├── components/            # Componentes reutilizables
│   │   ├── auth/             # Componentes de autenticación
│   │   ├── ui/               # Componentes UI básicos
│   │   └── ...               # Otros componentes
│   ├── lib/                  # Lógica de negocio
│   │   ├── clinical-decision/ # Motor de decisión clínica
│   │   │   ├── rules/        # Reglas JSON
│   │   │   ├── clinical-decision-engine.ts
│   │   │   └── *.test.ts     # Tests unitarios
│   │   ├── stores/           # Gestión de estado (Zustand)
│   │   ├── utils/            # Utilidades
│   │   └── types/            # Tipos TypeScript
│   └── middleware.ts         # Middleware de Next.js
├── public/                   # Archivos estáticos
├── docs/                     # Documentación
│   ├── resumen-tarea-step8.md
│   └── revision-medica-arboles-decision.md
├── cypress/                  # Tests E2E
├── usability-testing/        # Pruebas de usabilidad
├── audit-results/           # Resultados de auditorías
├── README.md               # Este archivo
├── TYPOGRAPHY_SYSTEM.md    # Guía del sistema tipográfico
├── wireframe-specs.md      # Especificaciones de wireframes
└── package.json           # Dependencias y scripts
```

## 🎨 Sistema de Diseño

### Sistema Tipográfico

El proyecto utiliza un sistema tipográfico consistente basado en una escala de 8pt:

- **Escala de fuentes**: 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px, 48px, 60px
- **Espaciado**: 8px, 16px, 24px, 32px, 40px, 48px, 64px, 80px, 96px
- **Variables CSS**: Definidas en `src/app/globals.css`

### Paleta de Colores

```css
/* Colores principales */
--color-primary-600: #0284c7;
--color-primary-700: #0369a1;

/* Colores de sistema */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;

/* Escala de grises */
--color-gray-50: #f9fafb;
--color-gray-900: #111827;
```

### Componentes UI

- **Botones**: `.btn-primary`, `.btn-secondary`
- **Formularios**: `.input-field`, `.form-group`
- **Tarjetas**: `.card` con padding y sombras consistentes
- **Navegación**: `.nav-link`, `.nav-link-active`

**Documentación completa**: Ver `TYPOGRAPHY_SYSTEM.md`

## 🧪 Testing

### Tests Unitarios (Vitest)

```bash
# Ejecutar todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Cobertura de tests
npm run test:coverage

# Interfaz de testing
npm run test:ui
```

**Cobertura actual**: 48/53 tests pasando (90.6%)

### Tests E2E (Cypress)

```bash
# Abrir interfaz de Cypress
npm run cypress:open

# Ejecutar tests E2E
npm run cypress:run

# E2E con servidor automático
npm run test:e2e
```

### Casos de Prueba Específicos

- **Motor de decisión clínica**: Validación de reglas médicas
- **Componentes UI**: Interacciones y estados
- **Autenticación**: Flujos de login/logout
- **Formularios**: Validación y envío

## 📱 Responsividad

### Breakpoints

- **Móvil**: ≤ 480px
- **Tablet Vertical**: ≤ 768px
- **Tablet Horizontal**: 768px - 1024px
- **Desktop**: > 1024px

### Características Responsive

- **CSS Grid Layout**: Para estructuras complejas
- **Flexbox**: Para alineación y distribución
- **Sidebar plegable**: Colapsa en móviles
- **Área 3D adaptativa**: Redimensiona según dispositivo
- **Tipografía fluida**: Escalado automático

**Documentación completa**: Ver `wireframe-specs.md`

## ♿ Accesibilidad

### Estándares WCAG 2.1 AA

- **Contraste**: Ratios mínimos 4.5:1 para texto normal
- **Navegación por teclado**: Todos los elementos interactivos
- **Lectores de pantalla**: Markup semántico correcto
- **Foco visible**: Indicadores claros de foco
- **Etiquetas**: Formularios completamente etiquetados

### Herramientas de Validación

- **WAVE**: Web Accessibility Evaluation Tool
- **axe DevTools**: Auditoría automática
- **Lighthouse**: Puntuación de accesibilidad
- **Testing manual**: Navegación por teclado

**Checklist completo**: Ver `usability-testing/wcag-checklist.md`

## 🔧 Herramientas de Desarrollo

### Linting y Formateo

```bash
# ESLint
npm run lint

# Formateo automático (configurado en editor)
# Prettier + ESLint integrados
```

### Auditorías de Seguridad

```bash
# Auditoría de dependencias
npm audit

# Auditoría personalizada
node audit.js
```

### Monitoreo de Performance

- **Sentry**: Error tracking y performance monitoring
- **Lighthouse**: Auditorías de performance
- **Bundle Analyzer**: Análisis de bundle size

## 📚 Documentación

### Documentos Principales

1. **README.md** - Documentación general (este archivo)
2. **TYPOGRAPHY_SYSTEM.md** - Sistema tipográfico completo
3. **wireframe-specs.md** - Especificaciones de wireframes
4. **docs/revision-medica-arboles-decision.md** - Revisión médica
5. **usability-testing/wcag-checklist.md** - Checklist de accesibilidad

### Comentarios en Código

- **Funciones complejas**: Documentadas con JSDoc
- **Componentes**: Props y comportamiento explicado
- **Reglas médicas**: Criterios clínicos documentados
- **Tipos**: Interfaces y tipos explicados

### API Documentation

- **Motor de decisión**: `lib/clinical-decision/README.md`
- **Componentes**: Storybook (configuración pendiente)
- **Hooks**: Documentación inline

## 🚀 Deployment

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### Docker

```bash
# Construir imagen
docker build -t devaltamedica-web .

# Ejecutar contenedor
docker run -p 3000:3000 devaltamedica-web
```

### Variables de Entorno

```bash
# Desarrollo
cp .env.example .env.local

# Producción
# Configurar en plataforma de deployment
NEXT_PUBLIC_API_URL=https://api.devaltamedica.com
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## 👥 Equipo y Contribución

### Convenciones de Código

- **TypeScript**: Tipado estricto obligatorio
- **ESLint**: Configuración Next.js + reglas personalizadas
- **Commits**: Conventional commits
- **Branches**: Feature branches desde main

### Proceso de Desarrollo

1. **Feature Branch**: `feature/nombre-funcionalidad`
2. **Development**: Tests + implementación
3. **Testing**: Unitarios + E2E
4. **Review**: Pull request con revisión
5. **Merge**: Squash merge a main
6. **Deploy**: Automático en merge

### Roles y Responsabilidades

- **Desarrollador Frontend**: Componentes UI y lógica cliente
- **Desarrollador Backend**: APIs y lógica de negocio
- **Equipo Médico**: Validación de reglas clínicas
- **UX/UI**: Diseño y experiencia de usuario
- **QA**: Testing y validación

---

## 🎯 Anamnesis System

This application has a comprehensive anamnesis system designed to assist with patient data collection and decision-making.

### Clinical Decision Engine
The clinical decision engine leverages JSON-based rules to provide adaptive questions and diagnostic suggestions based on patient context.

Located at `lib/clinical-decision`, the engine exposes the following:
- `getAdaptiveQuestions(context)`: Returns relevant questions based on clinical context.
- `getSuggestedDx(context)`: Suggests possible diagnoses sorted by probability.

### Adding New Rules

#### 1. Create a Rule File
Create a new JSON file in `lib/clinical-decision/rules/` (e.g., `cardiology-rules.json`):

```json
{
  "name": "cardiology-rules",
  "description": "Cardiovascular assessment rules",
  "rules": [
    {
      "id": "chest-pain-adult",
      "conditions": {
        "age": { "min": 18 },
        "symptoms": ["chest pain", "chest discomfort"],
        "bodyPart": "chest"
      },
      "questions": [
        {
          "id": "chest_pain_quality",
          "type": "radio",
          "question": "How would you describe the chest pain?",
          "options": [
            { "value": "sharp", "label": "Sharp/Stabbing" },
            { "value": "crushing", "label": "Crushing/Squeezing" },
            { "value": "burning", "label": "Burning" }
          ],
          "required": true
        }
      ],
      "diagnoses": [
        {
          "name": "Acute Myocardial Infarction",
          "probability": 0.3,
          "urgency": "critical",
          "criteria": {
            "chest_pain_quality": "crushing",
            "age": { "min": 40 }
          }
        }
      ]
    }
  ]
}
```

#### 2. Register the Rules
Update `lib/clinical-decision/clinical-decision-engine.ts` to load your new rules:

```typescript
import cardiologyRules from './rules/cardiology-rules.json';

const allRules = [
  ...pediatricRules.rules,
  ...adultRules.rules,
  ...cardiologyRules.rules // Add your new rules
];
```

### Connecting a Machine Learning Model

#### 1. Prepare Your ML Model
```typescript
// lib/ml/clinical-ml-engine.ts
import * as tf from '@tensorflow/tfjs';

export class ClinicalMLEngine {
  private model: tf.LayersModel | null = null;

  async loadModel(modelPath: string) {
    this.model = await tf.loadLayersModel(modelPath);
  }

  async predict(clinicalContext: ClinicalContext): Promise<MLPrediction[]> {
    if (!this.model) throw new Error('Model not loaded');
    
    const features = this.extractFeatures(clinicalContext);
    const prediction = this.model.predict(features) as tf.Tensor;
    
    return this.interpretPrediction(prediction);
  }

  private extractFeatures(context: ClinicalContext): tf.Tensor {
    // Convert clinical context to model input format
    const features = [
      context.age || 0,
      context.gender === 'male' ? 1 : 0,
      // ... other features
    ];
    return tf.tensor2d([features]);
  }
}
```

#### 2. Integrate ML with Decision Engine
```typescript
// lib/clinical-decision/hybrid-engine.ts
import { ClinicalDecisionEngine } from './clinical-decision-engine';
import { ClinicalMLEngine } from '../ml/clinical-ml-engine';

export class HybridClinicalEngine {
  constructor(
    private ruleEngine: ClinicalDecisionEngine,
    private mlEngine: ClinicalMLEngine
  ) {}

  async getEnhancedSuggestions(context: ClinicalContext) {
    const ruleBasedDx = this.ruleEngine.getSuggestedDx(context);
    const mlPredictions = await this.mlEngine.predict(context);
    
    // Combine rule-based and ML predictions
    return this.combineResults(ruleBasedDx, mlPredictions);
  }
}
```

### Example Usage in Components

#### Basic Decision Engine Usage
```typescript
// In a React component
const { actions, adaptiveQuestions, suggestedDx } = useAnamnesisStore();

// Update clinical context when patient data changes
const handlePatientInfoChange = (patientInfo: PatientInfo) => {
  actions.setClinicalContext({
    age: patientInfo.age,
    gender: patientInfo.gender,
    currentSymptom: patientInfo.currentSymptom
  });
  
  // Run decision engine to get adaptive questions
  actions.runDecisionEngine();
};

// Access results
const questions = adaptiveQuestions; // Rendered by AdaptiveQuestionsPanel
const diagnoses = suggestedDx; // Displayed in AssessmentStep
```

#### Advanced Usage with ML Integration
```typescript
// In your store actions
const runHybridDecisionEngine = async () => {
  const context = get().clinicalContext;
  
  // Get rule-based suggestions
  const ruleResults = engine.getSuggestedDx(context);
  
  // Get ML predictions
  const mlResults = await mlEngine.predict(context);
  
  // Combine and set results
  const combinedResults = combineResults(ruleResults, mlResults);
  
  set({ suggestedDx: combinedResults });
};
```

### Test Automation
- Located in `lib/clinical-decision/clinical-decision-engine.test.ts`.
- Uses Vitest to ensure rules and decision outputs are accurate.

### Integration Points
- **PersonalDataStep**: Collects and sets the clinical context.
- **SymptomLocationStep**: Updates context with user interactions.
- **SymptomDetailsStep**: Renders adaptive questions.
- **ReviewStep**: Displays suggested diagnoses.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
