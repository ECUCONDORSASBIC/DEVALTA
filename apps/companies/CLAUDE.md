
# CLAUDE.md - App: Companies 🏢
**Última actualización:** 28 de enero de 2025

## 🎯 Resumen de la Aplicación
- **Propósito:** Portal B2B para que las clínicas y hospitales gestionen su personal, publiquen ofertas de trabajo y gestionen pacientes huérfanos.
- **Tecnologías Clave:** Next.js 15, React 18, TypeScript, Tailwind CSS
- **Puerto:** 3004
- **Estado:** Funcional (sin Turbopack)

### Rutas Principales
- `/`: Dashboard principal con métricas y vista general
- `/staff`: Gestión de personal médico 
- `/patients`: Gestión de pacientes
- `/appointments`: Gestión de citas
- `/analytics`: Reportes y visualizaciones
- `/marketplace`: Marketplace médico

---

## 🏗️ Arquitectura Backend - AltaMedica

### 📍 **Ubicación de Servicios Backend**
```
🌐 API Server (Puerto 3001)
├── 📂 /mnt/c/Users/Eduardo/Documents/devaltamedica/apps/api-server/
├── 🔗 URL: http://localhost:3001
└── 📚 Documentación: /apps/api-server/CLAUDE.md

🔥 Firebase Services
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
| `/api/v1/payments/mercadopago/*` | Facturación empresarial | ✅ **PRODUCCIÓN** |
| `/api/v1/finops/cost-estimation` | Sistema FinOps empresarial | ✅ **NIVEL EMPRESARIAL** |

### 🚀 **Funcionalidades Tiempo Real**
- ✅ **Job Notifications:** Notificaciones de aplicaciones de trabajo
- ✅ **Auto Assignment:** Asignación automática de pacientes huérfanos
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

---

## 🔗 Integraciones Técnicas
### APIs Backend
- **API Principal:** Consume datos del `api-server` (Puerto 3001) especializado en funciones B2B
- **Autenticación:** Firebase Auth con roles de `company-admin`
- **Base de datos:** Firebase Firestore para datos empresariales en tiempo real

### Estado Actual del Dashboard
- **Vista General:** ✅ Implementada con métricas principales
- **Personal Médico:** 🚧 En desarrollo
- **Pacientes:** 🚧 En desarrollo
- **Citas:** 🚧 En desarrollo
- **Analíticas:** 🚧 En desarrollo
- **Marketplace:** 🚧 En desarrollo

## 3. Estructura de Archivos

```
src/app/
├── page.tsx              # Dashboard principal
├── layout.tsx           # Layout con fuente Inter
├── globals.css          # Estilos globales con Tailwind
├── error.tsx            # Página de error
└── _temp_pages/         # Páginas temporalmente movidas
    ├── dashboard/
    ├── listings/
    ├── marketplace/
    └── ...
```

## 4. Componentes y Librerías

### Componentes UI Actuales
- Usando estilos inline y clases de Tailwind directamente
- Emojis en lugar de iconos de lucide-react (temporal)
- Cards y badges implementados con Tailwind puro

### Datos Mock
```typescript
const mockMetrics = {
  totalPatients: 1500,
  activePatients: 1234,
  totalDoctors: 48,
  activeDoctors: 42,
  monthlyRevenue: 125000,
  totalAppointments: 890,
  completedAppointments: 780,
  patientSatisfaction: 4.2,
  averageWaitTime: 25,
  bedOccupancyRate: 78,
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
```

## 6. Próximos Pasos

1. **Integrar Chart.js o D3.js** para visualizaciones (recharts causa problemas)
2. **Implementar componentes compartidos** desde @altamedica/ui
3. **Conectar con API real** para obtener datos dinámicos
4. **Completar vistas pendientes** (Staff, Patients, etc.)
5. **Implementar autenticación** con Firebase Auth
6. **Restaurar páginas** desde _temp_pages una vez resueltos los problemas

## 7. Solución de Problemas

### Si la compilación se cuelga:
1. Asegúrate de NO estar usando Turbopack
2. Limpia el caché: `rm -rf .next`
3. Verifica que no haya imports circulares
4. Revisa el script check-circular-deps.js

### Si hay errores de módulos no encontrados:
1. Verifica que las dependencias estén instaladas: `npm install`
2. Revisa que los imports sean correctos
3. Considera usar imports directos en lugar de barrel exports

## 8. Notas de Desarrollo

- La app está optimizada para hospitales y clínicas medianas/grandes
- El diseño sigue patrones de dashboards médicos profesionales
- Se priorizan las métricas críticas en la vista principal
- La navegación por tabs permite acceso rápido a diferentes secciones
