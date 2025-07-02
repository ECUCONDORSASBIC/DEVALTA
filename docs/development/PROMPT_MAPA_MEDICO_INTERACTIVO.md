# 🗺️ PROMPT PARA DESARROLLAR MAPA MÉDICO INTERACTIVO ALTAMÉDICA EMPRESAS

## 🎯 OBJETIVO PRINCIPAL

Desarrollar el **mapa médico interactivo más avanzado de Argentina** para la plataforma Altamédica EMPRESAS, centrado en Buenos Aires, que sea el **factor principal y elemento visual dominante** de toda la aplicación.

## 🏥 CONTEXTO MÉDICO ESPECÍFICO

- **Ubicación**: Buenos Aires y AMBA (Área Metropolitana)
- **Datos reales**: Hospitales, clínicas y centros médicos existentes
- **Especialidades**: Cardiología, Neurología, Pediatría, Ginecología, Dermatología, etc.
- **Integración**: Sistema médico empresarial completo

## 🚀 CARACTERÍSTICAS TÉCNICAS REQUERIDAS

### Stack Tecnológico

```typescript
// STACK PRINCIPAL
- React 18+ con TypeScript
- Next.js 14+ (App Router)
- Tailwind CSS para diseño
- Leaflet + React-Leaflet para mapas
- Aceternity UI para componentes premium
- Lucide React para iconografía médica
```

### Características del Mapa

```typescript
// FUNCIONALIDADES CORE
1. 🗺️ Mapa centrado en Buenos Aires (-34.6118, -58.3960)
2. 🏥 Marcadores médicos personalizados por especialidad
3. 🔍 Filtros avanzados (estado, especialidad, experiencia)
4. 📱 Responsive y optimizado para móviles
5. ⚡ Rendimiento extremo con lazy loading
6. 🎨 UI empresarial moderna con Aceternity
7. 📊 Panel de estadísticas en tiempo real
8. 🔄 Integración con API + fallback a datos mock
```

## 🎨 DISEÑO VISUAL REQUERIDO

### Paleta de Colores Médica

```css
/* COLORES PRINCIPALES */
--medical-primary: #2563eb /* Azul médico confiable */
  --medical-success: #10b981 /* Verde disponible */ --medical-warning: #f59e0b
  /* Ámbar ocupado */ --medical-danger: #ef4444 /* Rojo no disponible */
  --medical-neutral: #6b7280 /* Gris profesional */ --medical-bg: #f8fafc
  /* Fondo limpio */;
```

### Componentes UI Específicos

```typescript
// ELEMENTOS VISUALES REQUERIDOS
1. 🎯 Marcadores médicos con iconos de especialidad
2. 💫 Efectos Aceternity (GlowingCard, SparklesCore)
3. 📊 Dashboards de estadísticas médicas
4. 🔍 Buscador inteligente con autocompletado
5. 🎛️ Controles de mapa profesionales
6. 📱 Popups informativos detallados
7. 🌟 Indicadores de rating y disponibilidad
```

## 📋 ESTRUCTURA DE DATOS MÉDICOS

### Interface Doctor Completa

```typescript
interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  license: string;
  experience: number;
  rating: number;
  company: string;
  type: "staff" | "freelance" | "consultant";
  status: "active" | "busy" | "on_leave" | "inactive";
  address?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
  };
  stats: {
    patients: number;
    totalPatients: number;
    monthlyPatients: number;
    appointments: number;
    totalAppointments: number;
    cancelledAppointments: number;
    rating: number;
    averageRating: number;
    totalReviews: number;
    experience: number;
  };
  availability: {
    schedule: Record<string, { start: string; end: string; slots: number }>;
    nextAvailable: string;
    slotsAvailable: number;
    totalSlots: number;
  };
  contact: {
    phone: string;
    email: string;
    whatsapp?: string;
  };
  education: Array<{
    degree: string;
    university: string;
    year: number;
  }>;
  certifications: string[];
  languages: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Datos Mock Buenos Aires

```typescript
// HOSPITALES Y CENTROS MÉDICOS REALES
const realMedicalCenters = [
  {
    name: "Hospital Italiano de Buenos Aires",
    address: "Tte. Gral. Juan Domingo Perón 4190",
    location: { lat: -34.628, lng: -58.3965 },
  },
  {
    name: "FLENI",
    address: "Montañeses 2325",
    location: { lat: -34.5565, lng: -58.4653 },
  },
  {
    name: "Hospital Garrahan",
    address: "Combate de los Pozos 1881",
    location: { lat: -34.6322, lng: -58.3689 },
  },
  // ... más centros médicos reales
];
```

## 🔧 FUNCIONALIDADES AVANZADAS

### Sistema de Filtros Inteligente

```typescript
// FILTROS DISPONIBLES
interface MapFilters {
  specialty: string[]; // Especialidades médicas
  status: string[]; // Estado de disponibilidad
  type: string[]; // Tipo de práctica médica
  experience: [number, number]; // Rango de experiencia
  rating: number; // Rating mínimo
  distance: number; // Radio de búsqueda
  availability: boolean; // Solo disponibles
}
```

### Controles de Mapa Profesionales

```typescript
// CONTROLES PERSONALIZADOS
1. 🔍 Zoom inteligente con límites
2. 🎯 Reset a vista inicial
3. 🎛️ Toggle de filtros
4. 🗂️ Selector de capas (roadmap/satellite/terrain)
5. 📊 Panel de estadísticas flotante
6. 🔄 Actualización en tiempo real
```

## 🎭 EXPERIENCIA DE USUARIO

### Interacciones Requeridas

```typescript
// UX ESPERADA
1. 📍 Click en marcador → Popup detallado + selección
2. 🔍 Búsqueda → Filtrado automático + zoom a resultados
3. 🎛️ Filtros → Actualización instantánea de marcadores
4. 📱 Mobile → Gestos táctiles nativos
5. ⚡ Performance → Carga < 2 segundos
6. 🎨 Animations → Transiciones suaves Aceternity
```

### Panel Lateral Informativo

```typescript
// INFORMACIÓN LATERAL
1. 📊 Estadísticas generales
2. 👥 Lista de médicos filtrados
3. 📈 Gráficos de especialidades
4. 🎯 Estado de disponibilidad
5. 🔍 Búsqueda avanzada
6. 📱 Call-to-Actions
```

## 🚀 INTEGRACIÓN TÉCNICA

### API Integration

```typescript
// ENDPOINTS ESPERADOS
GET /api/v1/doctors/locations
  ?specialty=cardiologia
  &status=active
  &city=Buenos Aires
  &radius=50km

// RESPUESTA ESPERADA
{
  success: true,
  data: Doctor[],
  total: number,
  page: number,
  limit: number
}
```

### Fallback Strategy

```typescript
// ESTRATEGIA DE FALLBACK
1. 🎯 Intentar API real primero
2. 📊 Si falla → usar datos mock
3. ⚠️ Mostrar aviso discreto
4. 🔄 Retry automático cada 30s
5. 📱 Funcionamiento offline
```

## 📦 ESTRUCTURA DE ARCHIVOS

```
components/maps/
├── DoctorsInteractiveMap.tsx      # Componente principal
├── MapControls.tsx                # Controles personalizados
├── CustomDoctorMarker.tsx         # Marcadores médicos
├── FilterPanel.tsx                # Panel de filtros
├── StatsPanel.tsx                 # Panel de estadísticas
├── DoctorsList.tsx                # Lista lateral
└── types/
    ├── doctor.ts                  # Interfaces médicas
    ├── map.ts                     # Tipos de mapa
    └── filters.ts                 # Tipos de filtros
```

## 🎯 OBJETIVOS DE RENDIMIENTO

### Métricas Requeridas

```typescript
// PERFORMANCE TARGETS
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Time to Interactive: < 3s
- Map Load Time: < 2s
- Marker Rendering: < 500ms
```

### Optimizaciones

```typescript
// TÉCNICAS DE OPTIMIZACIÓN
1. 🚀 Dynamic imports para Leaflet (SSR)
2. 🎯 Lazy loading de marcadores
3. 📊 Virtualización de listas largas
4. 🔄 Debounce en búsquedas
5. 💾 Caché inteligente de datos
6. 📱 Responsive images
```

## 🎨 ACETERNITY UI INTEGRATION

### Componentes Premium

```typescript
// COMPONENTES ACETERNITY REQUERIDOS
import {
  GlowingCard, // Para paneles destacados
  SparklesCore, // Efectos de fondo
  FloatingNav, // Navegación flotante
  TextGenerateEffect, // Textos animados
  BackgroundGradient, // Gradientes animados
  HoverEffect, // Efectos hover
  CardContainer, // Contenedores premium
  CardBody, // Cuerpos de tarjetas
  CardItem, // Items de tarjetas
} from "./aceternity-ui";
```

### Efectos Visuales

```typescript
// EFECTOS REQUERIDOS
1. ✨ Sparkles en background del mapa
2. 🌟 Glow effects en marcadores seleccionados
3. 🎭 Hover animations en controles
4. 📊 Animated counters en estadísticas
5. 🔄 Loading animations premium
6. 💫 Transition effects entre vistas
```

## 📱 RESPONSIVE DESIGN

### Breakpoints Médicos

```css
/* RESPONSIVE BREAKPOINTS */
@media (max-width: 640px) {   /* Mobile */
  - Mapa pantalla completa
  - Controles flotantes
  - Panel lateral como modal
}

@media (max-width: 1024px) {  /* Tablet */
  - Layout 2 columnas
  - Filtros colapsibles
  - Popups adaptados
}

@media (min-width: 1024px) {  /* Desktop */
  - Layout 3 columnas
  - Paneles fijos
  - Máxima funcionalidad
}
```

## 🔒 CONSIDERACIONES MÉDICAS

### Privacidad y Seguridad

```typescript
// ASPECTOS MÉDICOS CRÍTICOS
1. 🔐 Datos médicos anonimizados
2. 🏥 Compliance HIPAA básico
3. 📊 Estadísticas agregadas únicamente
4. 🔄 No datos pacientes específicos
5. ⚡ Encriptación en tránsito
6. 🎯 Logs auditables
```

### Información Mostrada

```typescript
// DATOS PÚBLICOS PERMITIDOS
✅ Nombre del médico
✅ Especialidad
✅ Hospital/Clínica
✅ Años de experiencia
✅ Rating promedio
✅ Disponibilidad general
✅ Ubicación del centro médico

❌ Datos personales sensibles
❌ Información de pacientes
❌ Detalles médicos específicos
❌ Información financiera
```

## 🚀 PLAN DE IMPLEMENTACIÓN

### Fase 1: Base (Días 1-2)

```typescript
// COMPONENTES BÁSICOS
1. ✅ Setup inicial con Next.js + TypeScript
2. ✅ Integración Leaflet con SSR
3. ✅ Estructura de datos Doctor
4. ✅ Mapa básico centrado en Buenos Aires
5. ✅ Marcadores simples
```

### Fase 2: Funcionalidad (Días 3-4)

```typescript
// FEATURES PRINCIPALES
1. 🔍 Sistema de filtros completo
2. 📊 Panel de estadísticas
3. 🎯 Búsqueda inteligente
4. 📱 Responsive design
5. 🎨 Integración Aceternity UI
```

### Fase 3: Optimización (Días 5-6)

```typescript
// MEJORAS Y POLISH
1. ⚡ Optimizaciones de rendimiento
2. 🎭 Animations y transiciones
3. 📱 PWA capabilities
4. 🔄 Integración API real
5. 🧪 Testing completo
```

## 🎯 CRITERIOS DE ÉXITO

### Métricas de Producto

```typescript
// KPIs REQUERIDOS
1. 📊 > 95% uptime del mapa
2. ⚡ < 2s tiempo de carga inicial
3. 📱 100% responsive en todos los dispositivos
4. 🎯 > 4.5/5 rating de usabilidad
5. 🔍 < 1s tiempo de búsqueda
6. 📈 > 80% engagement rate
```

### Validación Médica

```typescript
// VALIDACIONES REQUERIDAS
1. ✅ Datos médicos verificados
2. 🏥 Ubicaciones hospitalarias correctas
3. 👨‍⚕️ Especialidades médicas estándar
4. 📋 Compliance regulatorio básico
5. 🔐 Seguridad de datos implementada
```

## 🎨 PROTOTIPO VISUAL

```
┌─────────────────────────────────────────────────────────┐
│  🏥 ALTAMÉDICA EMPRESAS - MAPA MÉDICO INTERACTIVO      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🔍 [Buscar médicos, especialidades...]     [Filtros▼] │
│                                                         │
│  ┌─────────────────────────┐  ┌─────────────────────┐   │
│  │                         │  │  📊 ESTADÍSTICAS    │   │
│  │        🗺️ MAPA         │  │  ┌─────┬─────┬─────┐ │   │
│  │      BUENOS AIRES       │  │  │👥125│📅 45│⭐4.8│ │   │
│  │                         │  │  └─────┴─────┴─────┘ │   │
│  │    📍 📍 📍 📍 📍     │  │                     │   │
│  │  📍     📍     📍     │  │  🏥 MÉDICOS ACTIVOS │   │
│  │    📍 📍   📍 📍     │  │  ┌─────────────────┐   │   │
│  │  📍   📍 📍   📍     │  │  │ Dr. Carlos...   │   │   │
│  │    📍     📍         │  │  │ 🫀 Cardiología  │   │   │
│  │  ┌─────────────────┐  │  │  │ 🏥 Hosp. Ital. │   │   │
│  │  │ ➕ ➖ 🎯 🎛️ 🗂️ │  │  │  │ ⭐ 4.8 • 15 años│   │   │
│  │  └─────────────────┘  │  │  └─────────────────┘   │   │
│  └─────────────────────────┘  │  ┌─────────────────┐   │   │
│                                │  │ Dra. Ana...     │   │   │
│  📊 125 médicos • 45 disponibles │  │ 🧠 Neurología  │   │   │
│  📍 Buenos Aires y AMBA         │  │ 🏥 FLENI       │   │   │
│                                │  │ ⭐ 4.9 • 12 años│   │   │
│                                │  └─────────────────┘   │   │
│                                └─────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 🚀 COMANDO DE EJECUCIÓN

Para implementar este mapa médico interactivo premium:

```bash
# 1. Usar como componente principal
import DoctorsInteractiveMap from '@/components/maps/DoctorsInteractiveMap';

# 2. Integrar en página principal
<DoctorsInteractiveMap
  apiEndpoint="/api/v1/doctors/locations"
  initialCenter={[-34.6118, -58.3960]}
  initialZoom={11}
  showStats={true}
  onDoctorSelect={(doctor) => console.log(doctor)}
/>

# 3. Configurar como página principal del dashboard empresarial
```

---

## 🎯 RESUMEN EJECUTIVO

Este prompt define la creación del **mapa médico interactivo más avanzado de Argentina** para Altamédica EMPRESAS, con:

- ✅ **Tecnologías premium**: React + Next.js + Leaflet + Aceternity UI
- ✅ **Datos reales**: Buenos Aires y AMBA con hospitales verificados
- ✅ **UX excepcional**: Filtros avanzados, búsqueda inteligente, responsive
- ✅ **Rendimiento optimizado**: < 2s carga, lazy loading, SSR compatible
- ✅ **Diseño médico profesional**: Colores, iconografía y UI empresarial
- ✅ **Factor principal**: Elemento visual dominante de toda la plataforma

**El resultado será un mapa médico que posicione a Altamédica como líder tecnológico en el sector salud empresarial argentino.**
