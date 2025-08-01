# 🏥 Dashboard del API Server - AltaMedica

## 📊 Descripción General

El dashboard del API Server de AltaMedica es una interfaz web completa y moderna que proporciona monitoreo en tiempo real, logs detallados, métricas del sistema y documentación de endpoints para la plataforma médica.

## 🚀 Acceso al Dashboard

### URLs Disponibles

- **Dashboard Principal**: http://localhost:3001/dashboard
- **Página de Inicio**: http://localhost:3001
- **API Test**: http://localhost:3001/api/test
- **Health Check**: http://localhost:3001/api/health
- **Admin API**: http://localhost:3001/api/admin/dashboard

### Inicio Rápido

```bash
# Desde la raíz del proyecto
cd apps/api-server
pnpm dev

# O usar el script automatizado
./scripts/start-api-dashboard.ps1
```

## 🎯 Funcionalidades del Dashboard

### 1. 📊 Vista General (Overview)

**Métricas Principales:**
- Total de requests procesados
- Conexiones activas
- Tiempo de respuesta promedio
- Tasa de error
- Uptime del sistema
- Uso de memoria y CPU
- Endpoints activos

**Estados del Sistema:**
- Estado general del servidor
- Endpoints principales y su estado
- Alertas recientes del sistema

**Actividad Reciente:**
- Logs de requests en tiempo real
- Errores y advertencias
- Métricas de rendimiento

### 2. 📝 Logs en Tiempo Real

**Características:**
- Filtros por nivel (info, warn, error, debug)
- Filtros por método HTTP (GET, POST, PUT, DELETE)
- Filtros por código de estado
- Búsqueda en tiempo real
- Auto-scroll configurable
- Exportación a CSV

**Información Mostrada:**
- Timestamp de cada evento
- Nivel de log
- Mensaje detallado
- Endpoint afectado
- Método HTTP
- Código de estado
- Tiempo de respuesta
- IP del cliente
- ID de usuario
- ID de request

**Controles:**
- Pausar/Reanudar logs
- Auto-scroll ON/OFF
- Exportar logs
- Limpiar historial

### 3. 🔗 Endpoints API

**Documentación Completa:**
- Lista de todos los endpoints disponibles
- Métodos HTTP soportados
- Descripción detallada
- Parámetros requeridos y opcionales
- Códigos de respuesta
- Ejemplos de uso
- Estado de cada endpoint

**Categorías:**
- **Pacientes**: Gestión de pacientes médicos
- **Citas**: Sistema de citas médicas
- **Doctores**: Gestión de profesionales médicos
- **Autenticación**: Login, logout, autorización
- **Analytics**: Métricas y estadísticas
- **Notificaciones**: Sistema de notificaciones
- **Sistema**: Health checks y monitoreo
- **Administración**: Funciones administrativas

**Métricas por Endpoint:**
- Tiempo de respuesta
- Tasa de éxito
- Número total de requests
- Último uso
- Rate limiting
- Dependencias

### 4. 📈 Métricas del Sistema

**Métricas en Tiempo Real:**
- **CPU Usage**: Uso del procesador
- **Memory Usage**: Uso de memoria RAM
- **Disk Usage**: Uso del disco duro
- **Network I/O**: Actividad de red
- **Active Connections**: Conexiones activas
- **Request Rate**: Requests por segundo
- **Error Rate**: Tasa de errores
- **Response Time**: Tiempo de respuesta

**Gráficos de Rendimiento:**
- Historial de CPU y memoria
- Actividad de red y disco
- Requests y errores en el tiempo
- Tendencias de rendimiento

**Estado del Sistema:**
- Procesos activos
- Archivos abiertos
- Conexiones TCP
- Uptime del servidor

### 5. 🏥 Estado de Salud

**Servicios Monitoreados:**
- **API Server**: Servidor principal
- **Database**: Base de datos PostgreSQL
- **Redis Cache**: Sistema de caché
- **Firebase**: Servicios de Firebase
- **Storage**: Almacenamiento de archivos
- **Network**: Conectividad de red
- **SSL Certificate**: Certificado SSL/TLS
- **Monitoring**: Sistema de monitoreo

**Información por Servicio:**
- Estado actual (Saludable/Advertencia/Crítico)
- Tiempo de respuesta
- Tasa de éxito
- Uptime
- Dependencias
- Última verificación

**Acciones Disponibles:**
- Verificar servicio manualmente
- Ver logs específicos
- Acceder a documentación
- Verificar dependencias

## 🔧 Configuración

### Variables de Entorno

```env
# Puerto del servidor
PORT=3001

# Modo de desarrollo
NODE_ENV=development

# Configuración de Firebase (opcional)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Configuración de base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/altamedica

# Configuración de Redis
REDIS_URL=redis://localhost:6379
```

### Scripts Disponibles

```json
{
  "scripts": {
    "dev": "next dev --turbopack --port 3001",
    "build": "next build",
    "start": "next start --port 3001",
    "lint": "next lint",
    "test": "jest",
    "dashboard": "node scripts/start-api-dashboard.js"
  }
}
```

## 📱 Responsive Design

El dashboard está optimizado para:
- **Desktop**: Pantallas grandes con todas las funcionalidades
- **Tablet**: Vista adaptada para tablets médicas
- **Mobile**: Vista simplificada para smartphones

## 🔒 Seguridad

### Autenticación
- Verificación de roles de administrador
- Tokens JWT para APIs
- Rate limiting configurado
- Logs de auditoría

### Datos Sensibles
- Información médica cifrada
- Logs sin datos personales
- Métricas anonimizadas
- Cumplimiento HIPAA/GDPR

## 🚨 Alertas y Notificaciones

### Tipos de Alertas
- **Críticas**: Servicios caídos, errores graves
- **Advertencias**: Alto uso de recursos, latencia
- **Informativas**: Actualizaciones, mantenimiento

### Canales de Notificación
- Dashboard en tiempo real
- Logs detallados
- Métricas históricas
- Exportación de reportes

## 📊 APIs Disponibles

### Endpoints Principales

#### Pacientes
- `GET /api/patients` - Listar pacientes
- `POST /api/patients` - Crear paciente
- `GET /api/patients/:id` - Obtener paciente
- `PUT /api/patients/:id` - Actualizar paciente
- `DELETE /api/patients/:id` - Eliminar paciente

#### Citas
- `GET /api/appointments` - Listar citas
- `POST /api/appointments` - Crear cita
- `GET /api/appointments/:id` - Obtener cita
- `PUT /api/appointments/:id` - Actualizar cita
- `DELETE /api/appointments/:id` - Cancelar cita

#### Doctores
- `GET /api/doctors` - Listar doctores
- `POST /api/doctors` - Crear doctor
- `GET /api/doctors/:id` - Obtener doctor
- `PUT /api/doctors/:id` - Actualizar doctor

#### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/reset-password` - Resetear contraseña

#### Analytics
- `GET /api/analytics` - Métricas generales
- `GET /api/analytics/patients` - Métricas de pacientes
- `GET /api/analytics/appointments` - Métricas de citas
- `GET /api/analytics/doctors` - Métricas de doctores

#### Sistema
- `GET /api/health` - Health check
- `GET /api/admin/dashboard` - Dashboard administrativo
- `GET /api/test` - Endpoint de prueba

## 🛠️ Desarrollo

### Estructura del Proyecto

```
apps/api-server/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── api/               # Endpoints de la API
│   │   └── page.tsx           # Página de inicio
│   ├── components/
│   │   └── dashboard/         # Componentes del dashboard
│   │       ├── APIDashboard.tsx
│   │       ├── RealTimeLogs.tsx
│   │       ├── APIEndpoints.tsx
│   │       ├── SystemMetrics.tsx
│   │       └── HealthStatus.tsx
│   └── lib/                   # Utilidades y configuraciones
├── scripts/                   # Scripts de automatización
└── docs/                      # Documentación
```

### Tecnologías Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Chart.js (opcional)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (simulado)
- **Cache**: Redis (simulado)
- **Monitoring**: Custom implementation

## 📈 Métricas y KPIs

### Métricas de Rendimiento
- **Response Time**: < 500ms promedio
- **Uptime**: > 99.9%
- **Error Rate**: < 1%
- **Throughput**: > 1000 requests/segundo

### Métricas de Negocio
- **Pacientes Activos**: Número de pacientes registrados
- **Citas del Día**: Citas programadas para hoy
- **Doctores Activos**: Profesionales disponibles
- **Satisfacción**: Rating promedio de usuarios

## 🔄 Mantenimiento

### Tareas Diarias
- Revisar logs de errores
- Verificar métricas de rendimiento
- Monitorear uso de recursos
- Backup de datos críticos

### Tareas Semanales
- Análisis de tendencias
- Optimización de consultas
- Actualización de dependencias
- Revisión de seguridad

### Tareas Mensuales
- Reporte de rendimiento
- Auditoría de logs
- Actualización de documentación
- Planificación de mejoras

## 🆘 Soporte

### Problemas Comunes

1. **Dashboard no carga**
   - Verificar que el servidor esté corriendo
   - Revisar logs del navegador
   - Verificar configuración de CORS

2. **Logs no aparecen**
   - Verificar configuración de logging
   - Revisar permisos de archivos
   - Comprobar conectividad de red

3. **Métricas incorrectas**
   - Verificar configuración de monitoreo
   - Revisar conectividad con servicios
   - Comprobar permisos de acceso

### Contacto
- **Soporte Técnico**: support@altamedica.com
- **Documentación**: /docs/api-server
- **Issues**: GitHub Issues
- **Chat**: Slack #api-server

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024  
**Equipo**: AltaMedica Dev Team 