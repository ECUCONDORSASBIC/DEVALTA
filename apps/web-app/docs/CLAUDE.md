
# CLAUDE.md - App: Web App 🌐
**Última actualización:** 28 de enero de 2025

## 🎯 Resumen de la Aplicación
- **Propósito:** Landing page pública de AltaMedica, portal de información y punto de entrada para el registro de nuevos usuarios.
- **Tecnologías Clave:** Next.js 15, React 18, TypeScript, Tailwind CSS, Framer Motion.
- **Puerto:** 3000
- **Estado:** ✅ **BUENA BASE - Necesita páginas de marketing**
- **Puntuación:** 7.2/10

## 📄 **Páginas Implementadas**
✅ `/` - Landing page principal  
✅ `/privacy` - Política de privacidad HIPAA completa  
✅ `/not-found` - 404 personalizada con enlaces a servicios  
✅ `/anamnesis-demo` - Demo interactivo médico  
✅ `/hospital3d` - Experiencia 3D hospitalaria  
✅ `/dashboard` - Dashboard básico  
✅ `/(auth)/login` - Sistema de login  
✅ `/(auth)/register` - Registro de usuarios  
✅ `/(dashboard)/analytics` - Analytics básicos  
✅ `/(dashboard)/appointments` - Gestión de citas  

## 🚨 **Páginas Faltantes Críticas**
❌ `/about` - Historia y misión de AltaMedica  
❌ `/services` - Descripción detallada de servicios médicos  
❌ `/contact` - Formulario de contacto e información  
❌ `/blog` - Contenido médico y noticias del sector  
❌ `/careers` - Oportunidades laborales y reclutamiento  
❌ `/testimonials` - Testimonios de pacientes y doctores  
❌ `/download-app` - Links a aplicaciones móviles  
❌ `/find-doctors` - Buscador público de médicos  
❌ `/pricing` - Planes y precios de servicios  
❌ `/help` - Centro de ayuda y FAQ  
❌ `/terms` - Términos y condiciones de uso  

## 🎨 **Componentes Implementados**
✅ **Navbar** - Navegación principal responsive  
✅ **Footer** - Footer básico con copyright  
✅ **AuthSystem-firebase** - Sistema de autenticación  
✅ **ForgotPasswordForm** - Recuperación de contraseñas  
✅ **AltamedicaInteractiveMap** - Mapa interactivo de médicos  
✅ **Hospital3DScene** - Experiencia 3D inmersiva  
✅ **UI Components** - Button, Card, common utilities

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
├── 💾 Firebase Storage: Almacenamiento de archivos públicos
└── 📱 Cloud Messaging: Notificaciones push
```

### 🔌 **APIs Principales para Web App**
| Endpoint | Propósito | Estado |
|---|---|---|
| `/api/v1/auth/register` | Registro inicial de usuarios | ✅ **PRODUCCIÓN** |
| `/api/v1/ai/chatbot` | Chat médico inicial/consulta | ✅ **PRODUCCIÓN** |
| **APIs públicas de información** | Datos públicos de la plataforma | ✅ **PRODUCCIÓN** |

### 🚀 **Funcionalidades Tiempo Real**
- ✅ **AI Chat:** Chat inicial con IA médica para consultas
- ✅ **Contact Forms:** Formularios de contacto en tiempo real
- ✅ **Newsletter:** Suscripciones automáticas

### 🔐 **Express + Middleware Stack**
- ✅ **Public APIs:** Endpoints públicos sin autenticación requerida
- ✅ **Rate Limiting:** Protección contra spam en formularios
- ✅ **Service Pattern:** Servicios especializados para registro y contacto

---

## 🔗 Integraciones Técnicas
### APIs Backend
- **API Principal:** Se comunica con el `api-server` (Puerto 3001) para registro y formularios de contacto
- **CMS:** Puede integrarse con un CMS headless (ej. Strapi, Contentful) para contenido de marketing

### Estándares de UI/UX
- **Diseño:** Atractivo visualmente, con animaciones sutiles (Framer Motion) para mejorar la experiencia de usuario.
- **SEO:** Optimizado para motores de búsqueda (Server-Side Rendering, metadatos adecuados).

## 3. Reglas de Codificación (App-Specific)
- **Rendimiento:** Prioriza la velocidad de carga (imágenes optimizadas, code splitting).
- **Accesibilidad:** Cumple con los estándares de accesibilidad web (WCAG).
