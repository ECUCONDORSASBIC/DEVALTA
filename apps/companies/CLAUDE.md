# CLAUDE.md - App: Companies 🏢
**Última actualización:** 9 de agosto de 2025

## 🎯 Resumen de la Aplicación
- **Propósito:** Portal B2B para que las clínicas y hospitales gestionen su personal, publiquen ofertas de trabajo y gestionen pacientes huérfanos. Incluye un **Sistema de Control Hospitalario** tipo torre de control aéreo para redistribución inteligente de pacientes.
- **Tecnologías Clave:** Next.js 15, React 18, TypeScript, Tailwind CSS, Firebase v9+, Leaflet, react-leaflet
- **Puerto:** 3004
- **Estado:** ✅ Funcional con Sistema de Redistribución Activo

### Rutas Principales
- `/`: Dashboard principal con métricas y vista general
- `/dashboard`: **Centro de Control Hospitalario** con redistribución en tiempo real
- `/staff`: Gestión de personal médico 
- `/patients`: Gestión de pacientes
- `/appointments`: Gestión de citas
- `/analytics`: Reportes y visualizaciones
- `/marketplace`: Marketplace médico

---

## 🚨 NUEVA FUNCIONALIDAD: Sistema de Control Hospitalario

### 🎮 Centro de Control (Torre de Control Aéreo)
El dashboard ahora incluye un sistema de redistribución de pacientes inspirado en torres de control de tráfico aéreo:

#### **Características Principales:**
1. **Monitoreo en Tiempo Real**
   - Vista de mapa interactivo con hospitales de la red
   - Indicadores de saturación con códigos de color
   - Actualización automática cada 30 segundos

2. **Redistribución Inteligente de Pacientes**
   - Detección automática de hospitales saturados (>85% capacidad)
   - Sugerencias de redistribución basadas en proximidad y capacidad
   - Rutas visualizadas en el mapa con animaciones

3. **Detección de Déficit de Personal**
   - Monitoreo automático de ratios paciente/personal
   - Publicación automática de vacantes en el marketplace
   - Alertas críticas cuando faltan especialistas

4. **Integración Multi-Canal**
   - WhatsApp Business API para reportes rápidos
   - API REST para sistemas hospitalarios
   - Sensores IoT para datos en tiempo real

### 🗺️ Componentes del Sistema

#### **HospitalNetworkDashboard** (`src/components/dashboard/HospitalNetworkDashboard.tsx`)
- Dashboard principal con métricas de red
- Gestión de redistribuciones y alertas
- Controles automáticos/manuales

#### **HospitalRedistributionMap** (`src/components/dashboard/HospitalRedistributionMap.tsx`)
- Mapa interactivo basado en Leaflet
- Visualización de hospitales con saturación
- Rutas de redistribución animadas
- Popups con información detallada

#### **HospitalDataIntegrationService** (`src/services/HospitalDataIntegrationService.ts`)
- Servicio de integración multi-canal
- Recolección de datos de WhatsApp, API, IoT
- Cálculo de saturación y recomendaciones

### 🎨 Nuevo Diseño UI - Torre de Control

El layout ha sido completamente rediseñado con estética de torre de control:

- **Tema Oscuro**: Fondo slate-950/900 para reducir fatiga visual
- **Header Principal**: "CENTRO DE CONTROL HOSPITALARIO" con indicadores de estado
- **Paneles de Estado**: Efectos de vidrio esmerilado con animaciones pulse
- **Notificaciones**: Sistema de alertas en tiempo real estilo militar
- **Métricas**: Cards oscuras con gradientes y efectos de transparencia

---

## 🏗️ Arquitectura Backend - AltaMedica

### 📍 **Ubicación de Servicios Backend**
```
🌐 API Server (Puerto 3001)
├── 📂 /mnt/c/Users/Eduardo/Documents/devaltamedica/apps/api-server/
├── 🔗 URL: http://localhost:3001
└── 📚 Documentación: /apps/api-server/CLAUDE.md

🔥 Firebase Services (v9+ Modular API)
├── 🗄️ Firestore: Base de datos principal
├── 🔐 Firebase Auth: Autenticación de usuarios
├── 💾 Firebase Storage: Almacenamiento de archivos empresariales
└── 📱 Cloud Messaging: Notificaciones push
```

### 🔌 **APIs Principales para Companies App**
| Endpoint | Propósito | Estado |
|---|---|---|
| `/api/v1/auth/*` | Login empresarial | ✅ **PRODUCCIÓN** |
| `/api/v1/jobs` | **Sistema B2B completo** (696 líneas) | ✅ **NIVEL EMPRESARIAL** |
| `/api/v1/marketplace` | Gestión pacientes huérfanos | ✅ **PRODUCCIÓN** |
| `/api/v1/users` | Gestión de empleados médicos | ✅ **PRODUCCIÓN** |
| `/api/v1/hospitals/*/status` | Estado de hospitales en tiempo real | ✅ **NUEVO** |
| `/api/v1/hospitals/*/metrics` | Métricas históricas | ✅ **NUEVO** |
| `/api/v1/payments/mercadopago/*` | Facturación empresarial | ✅ **PRODUCCIÓN** |
| `/api/v1/finops/cost-estimation` | Sistema FinOps empresarial | ✅ **NIVEL EMPRESARIAL** |

### 🚀 **Funcionalidades Tiempo Real**
- ✅ **Hospital Monitoring:** Monitoreo de saturación en tiempo real
- ✅ **Auto Redistribution:** Redistribución automática de pacientes
- ✅ **Staff Shortage Detection:** Detección de déficit de personal
- ✅ **Job Auto-Publishing:** Publicación automática de vacantes
- ✅ **WhatsApp Integration:** Reportes rápidos vía WhatsApp
- ✅ **IoT Sensors:** Integración con sensores hospitalarios
- ✅ **Firestore Listeners:** Dashboard en tiempo real
- ✅ **Marketplace Events:** Eventos del marketplace médico

### 🔐 **Express + Middleware Stack**
- ✅ **UnifiedAuth:** Middleware de autenticación centralizado
- ✅ **Rate Limiting:** Protección contra spam
- ✅ **HIPAA Compliance:** Auditoría automática de acciones médicas
- ✅ **Service Pattern:** Lógica de negocio en servicios especializados

---

## ⚠️ **Configuración Especial**

### **Turbopack Deshabilitado**
Esta aplicación NO debe usar Turbopack debido a problemas de compilación:
- **Problema:** Turbopack cuelga indefinidamente con ciertas librerías
- **Solución:** package.json modificado sin `--turbopack`
- **Librerías problemáticas:** recharts, lucide-react

### **Firebase v9+ Modular API**
- Usar imports modulares: `import { collection, doc, query } from '@altamedica/firebase/client'`
- NO usar API antigua: `db.collection()` está deprecado
- Siempre obtener Firestore con: `const db = getFirebaseFirestore()`

---

## 🔗 Integraciones Técnicas

### APIs Backend
- **API Principal:** Consume datos del `api-server` (Puerto 3001) especializado en funciones B2B
- **Autenticación:** Firebase Auth con roles de `company-admin`
- **Base de datos:** Firebase Firestore para datos empresariales en tiempo real
- **WhatsApp Business:** Integración para reportes hospitalarios rápidos
- **Sensores IoT:** Protocolo MQTT para datos de sensores

### Estado Actual del Dashboard
- **Vista General:** ✅ Implementada con métricas principales
- **Centro de Control:** ✅ Sistema de redistribución completo
- **Mapa Interactivo:** ✅ Visualización geográfica de hospitales
- **Personal Médico:** 🚧 En desarrollo
- **Pacientes:** 🚧 En desarrollo
- **Citas:** 🚧 En desarrollo
- **Analíticas:** 🚧 En desarrollo
- **Marketplace:** ✅ Integrado con detección de déficit

## 3. Estructura de Archivos

```
src/
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx    # Layout estilo torre de control
│   │   └── page.tsx      # Dashboard con HospitalNetworkDashboard
│   ├── page.tsx          # Página principal
│   └── layout.tsx        # Layout raíz
├── components/
│   ├── dashboard/
│   │   ├── HospitalNetworkDashboard.tsx  # Dashboard principal
│   │   └── HospitalRedistributionMap.tsx # Mapa interactivo
│   ├── navigation/
│   │   ├── CompanyNavigation.tsx
│   │   └── Breadcrumbs.tsx
│   └── layout/
│       └── CompanyLayoutProvider.tsx
├── services/
│   ├── HospitalDataIntegrationService.ts # Integración multi-canal
│   └── integrations/
│       ├── WhatsAppService.ts    # Cliente WhatsApp Business
│       ├── HospitalAPIService.ts # Cliente API REST
│       └── IoTSensorService.ts   # Cliente sensores IoT
└── types/
    └── hospital.types.ts
```

## 4. Componentes y Librerías

### Componentes UI Principales
- **Torre de Control UI**: Tema oscuro con efectos de transparencia
- **Mapa Interactivo**: Leaflet + react-leaflet para visualización
- **Cards de Métricas**: Con gradientes y animaciones
- **Sistema de Alertas**: Notificaciones en tiempo real

### Servicios de Integración
```typescript
// Configuración de integración
const hospitalConfig = {
  whatsapp: { 
    enabled: true, 
    phoneNumber: '+57 310 123-4567', 
    apiKey: 'demo-whatsapp-key' 
  },
  api: { 
    enabled: true, 
    endpoint: 'https://api.hospital-demo.com', 
    apiKey: 'demo-api-key' 
  },
  iot: { 
    enabled: true, 
    devices: ['sensor-001', 'camera-002', 'beacon-003'] 
  }
};
```

## 5. Comandos de Desarrollo

```bash
# Desarrollo (SIN Turbopack)
npm run dev

# Build de producción
npm run build

# Limpiar caché si hay problemas
rm -rf .next

# Testing
npm run test
npm run test:watch

# Linting y Type Check
npm run lint
npm run type-check
```

## 6. Solución de Problemas

### Errores de Hidratación SSR
- **Problema**: `Hydration failed because the server rendered text didn't match`
- **Causa**: Uso de `Date.now()` o `Math.random()` en render inicial
- **Solución**: Usar `useEffect` para valores dinámicos o crear componentes client-only

### Errores de Firebase
- **Problema**: `db.collection is not a function`
- **Causa**: Usando API antigua de Firebase
- **Solución**: Usar imports modulares v9+:
  ```typescript
  import { collection, doc, query } from '@altamedica/firebase/client';
  const db = getFirebaseFirestore();
  const colRef = collection(db, 'hospitals');
  ```

### Si la compilación se cuelga:
1. Asegúrate de NO estar usando Turbopack
2. Limpia el caché: `rm -rf .next`
3. Verifica que no haya imports circulares
4. Revisa el script check-circular-deps.js

### Si hay errores de módulos no encontrados:
1. Verifica que las dependencias estén instaladas: `npm install`
2. Revisa que los imports sean correctos
3. Considera usar imports directos en lugar de barrel exports

## 7. Arquitectura de Redistribución de Pacientes

### Flujo de Decisión
```
1. MONITOREO CONTINUO
   └─> Recolección de datos cada 30s
       ├─> WhatsApp: Reportes manuales
       ├─> API: Sistemas hospitalarios
       └─> IoT: Sensores en tiempo real

2. DETECCIÓN DE SATURACIÓN
   └─> Cálculo de score (0-100)
       ├─> Ocupación de camas (30%)
       ├─> Tiempo de espera (25%)
       ├─> Ratio paciente/personal (25%)
       └─> Pacientes críticos (20%)

3. GENERACIÓN DE SUGERENCIAS
   └─> Si saturación > 85%
       ├─> Buscar hospitales cercanos
       ├─> Verificar capacidad disponible
       └─> Calcular rutas óptimas

4. EJECUCIÓN DE REDISTRIBUCIÓN
   └─> Manual o automática
       ├─> Notificar hospitales
       ├─> Coordinar transporte
       └─> Actualizar sistemas
```

### Criterios de Redistribución
- **Proximidad**: Máximo 50km de distancia
- **Capacidad**: Hospital receptor <70% ocupación
- **Especialidad**: Matching de especialidades requeridas
- **Criticidad**: Prioridad a pacientes estables

## 8. Notas de Desarrollo

- La app está optimizada para hospitales y clínicas medianas/grandes
- El diseño de torre de control reduce fatiga visual en monitoreo 24/7
- Sistema preparado para escalar a redes de 100+ hospitales
- Integración WhatsApp permite reportes desde zonas con conectividad limitada
- Arquitectura preparada para ML/AI predictivo de saturación

## 9. Próximos Pasos

1. **Implementar ML para predicción** de saturación hospitalaria
2. **Integrar con sistemas de ambulancias** para transporte automatizado
3. **Dashboard móvil** para directores médicos
4. **API GraphQL** para consultas más eficientes
5. **Blockchain** para trazabilidad de redistribuciones
6. **Integración con wearables** para monitoreo de pacientes

---

### 📝 Changelog

- **9 de agosto 2025**: Implementación completa del Sistema de Control Hospitalario
  - Nuevo diseño UI estilo torre de control
  - Mapa interactivo con redistribución de pacientes
  - Integración multi-canal (WhatsApp, API, IoT)
  - Detección automática de déficit de personal
  - Corrección de errores Firebase v9+
  - Solución de problemas de hidratación SSR

- **28 de enero 2025**: Versión inicial del portal B2B