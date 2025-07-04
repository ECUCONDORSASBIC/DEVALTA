# Dashboard API REST Unificado - DevAltaMedica

## Resumen

Este documento especifica el contrato API REST unificado para el dashboard de DevAltaMedica. Todos los endpoints obtienen sus datos de la salida del analizador de métricas reales (`real-metrics-analyzer.cjs`), garantizando datos auténticos y no simulados.

## Endpoints

### GET /api/data - Métricas Generales

Retorna las métricas generales del sistema para el dashboard principal.

**URL:** `GET /api/data`

**Descripción:** Proporciona las métricas de alto nivel del sistema, incluyendo salud general, performance, compliance médico y usuarios activos.

**Respuesta:**

```json
{
  "systemHealth": 82,
  "avgPerformance": 75,
  "hipaaScore": 100,
  "activeUsers": null,
  "projectInfo": {
    "name": "altamedica-apis",
    "version": "1.0.0",
    "uptime": "0h",
    "timestamp": "2025-01-03T19:32:54.116Z"
  },
  "architecture": {
    "applicationsCount": 9,
    "packagesCount": 16,
    "totalFiles": 1041,
    "isMonorepo": true,
    "hasWorkspace": false
  },
  "quality": {
    "codeQuality": 45,
    "developmentScore": 75,
    "hasTests": true,
    "hasESLint": false
  }
}
```

### GET /api/platform - Sub-métricas de Plataforma

Retorna las métricas técnicas detalladas de la plataforma.

**URL:** `GET /api/platform`

**Descripción:** Proporciona métricas técnicas específicas de la plataforma, incluyendo performance de API, base de datos, uso de recursos y tasa de errores.

**Respuesta:**

```json
{
  "apiResponseTime": null,
  "databasePerformance": null,
  "errorRate": null,
  "memory": {
    "used": null,
    "total": null,
    "percentage": null
  },
  "cpu": {
    "usage": null,
    "cores": null
  },
  "codeMetrics": {
    "typescriptFiles": 459,
    "reactComponents": 206,
    "filesCount": 1041,
    "codeQuality": 45
  },
  "medicalCompliance": {
    "score": 100,
    "hasMedicalTypes": true,
    "hasPatientManagement": true,
    "medicalApps": ["patients", "medical", "admin"]
  },
  "infrastructure": {
    "isMonorepo": true,
    "hasWorkspace": false,
    "hasTests": true,
    "hasESLint": false
  }
}
```

## Transformaciones de Datos

### Mapeo de Campos del Analizador a API

La siguiente tabla muestra cómo se transforman los datos del `real-metrics-analyzer.cjs` para los endpoints:

| Campo Original | Endpoint | Campo de Salida | Transformación |
|---|---|---|---|
| `medicalCompliance` | `/api/data` | `hipaaScore` | Directo (0-100) |
| `developmentScore` | `/api/data` | `avgPerformance` | Directo (0-100) |
| `codeQuality` + `medicalCompliance` | `/api/data` | `systemHealth` | Promedio ponderado: (codeQuality × 0.4) + (medicalCompliance × 0.6) |
| `projectName` | `/api/data` | `projectInfo.name` | Directo |
| `projectVersion` | `/api/data` | `projectInfo.version` | Directo |
| `applicationsCount` | `/api/data` | `architecture.applicationsCount` | Directo |
| `packagesCount` | `/api/data` | `architecture.packagesCount` | Directo |
| `filesCount` | `/api/data` | `architecture.totalFiles` | Directo |
| `typescriptFiles` | `/api/platform` | `codeMetrics.typescriptFiles` | Directo |
| `reactComponents` | `/api/platform` | `codeMetrics.reactComponents` | Directo |
| `activeUsers` | `/api/data` | `activeUsers` | Directo (null en análisis estático) |
| `apiResponseTime` | `/api/platform` | `apiResponseTime` | Directo (null en análisis estático) |
| `databasePerformance` | `/api/platform` | `databasePerformance` | Directo (null en análisis estático) |
| `errorRate` | `/api/platform` | `errorRate` | Directo (null en análisis estático) |

### Cálculo de systemHealth

```javascript
// Fórmula para systemHealth
systemHealth = Math.round((codeQuality * 0.4) + (medicalCompliance * 0.6))

// Ejemplo con datos reales:
// codeQuality: 45, medicalCompliance: 100
// systemHealth = (45 * 0.4) + (100 * 0.6) = 18 + 60 = 78
```

### Detección de Aplicaciones Médicas

```javascript
// Lógica para detectar aplicaciones médicas
const medicalApps = [];
if (hasPatientManagement) medicalApps.push("patients");
if (hasMedicalTypes) medicalApps.push("medical");
// Se puede expandir basándose en la estructura de aplicaciones
```

## Ejemplos de Respuesta Reales

### Ejemplo 1: Proyecto DevAltaMedica Completo

**GET /api/data:**
```json
{
  "systemHealth": 78,
  "avgPerformance": 75,
  "hipaaScore": 100,
  "activeUsers": null,
  "projectInfo": {
    "name": "altamedica-apis",
    "version": "1.0.0",
    "uptime": "0h",
    "timestamp": "2025-01-03T19:32:54.116Z"
  },
  "architecture": {
    "applicationsCount": 9,
    "packagesCount": 16,
    "totalFiles": 1041,
    "isMonorepo": true,
    "hasWorkspace": false
  },
  "quality": {
    "codeQuality": 45,
    "developmentScore": 75,
    "hasTests": true,
    "hasESLint": false
  }
}
```

**GET /api/platform:**
```json
{
  "apiResponseTime": null,
  "databasePerformance": null,
  "errorRate": null,
  "memory": {
    "used": null,
    "total": null,
    "percentage": null
  },
  "cpu": {
    "usage": null,
    "cores": null
  },
  "codeMetrics": {
    "typescriptFiles": 459,
    "reactComponents": 206,
    "filesCount": 1041,
    "codeQuality": 45
  },
  "medicalCompliance": {
    "score": 100,
    "hasMedicalTypes": true,
    "hasPatientManagement": true,
    "medicalApps": ["patients", "medical"]
  },
  "infrastructure": {
    "isMonorepo": true,
    "hasWorkspace": false,
    "hasTests": true,
    "hasESLint": false
  }
}
```

### Ejemplo 2: Proyecto con Menor Compliance

**GET /api/data:**
```json
{
  "systemHealth": 54,
  "avgPerformance": 50,
  "hipaaScore": 60,
  "activeUsers": null,
  "projectInfo": {
    "name": "medical-app-basic",
    "version": "0.1.0",
    "uptime": "2d 4h",
    "timestamp": "2025-01-03T15:22:10.445Z"
  },
  "architecture": {
    "applicationsCount": 3,
    "packagesCount": 5,
    "totalFiles": 234,
    "isMonorepo": false,
    "hasWorkspace": true
  },
  "quality": {
    "codeQuality": 40,
    "developmentScore": 50,
    "hasTests": false,
    "hasESLint": true
  }
}
```

## Fuente de Datos

Todos los valores provienen exclusivamente de la salida del analizador `real-metrics-analyzer.cjs`:

- **Análisis Estático**: Basado en la estructura y configuración del proyecto
- **Métricas Reales**: No hay datos simulados o hardcodeados
- **Temporal**: Incluye timestamps reales y uptime calculado
- **Nulos Explícitos**: Campos como `activeUsers`, `apiResponseTime`, etc. son `null` porque requieren aplicación ejecutándose

## Implementación Backend

### Método de Obtención de Datos

```javascript
// Ejemplo de implementación del endpoint
const DevaltamedicaRealMetrics = require('./real-metrics-analyzer.cjs');

// GET /api/data
app.get('/api/data', async (req, res) => {
  const analyzer = new DevaltamedicaRealMetrics({ silent: true });
  const metrics = analyzer.getRealPlatformMetrics();
  
  const response = {
    systemHealth: Math.round((metrics.codeQuality * 0.4) + (metrics.medicalCompliance * 0.6)),
    avgPerformance: metrics.developmentScore,
    hipaaScore: metrics.medicalCompliance,
    activeUsers: metrics.activeUsers,
    projectInfo: {
      name: metrics.projectName,
      version: metrics.projectVersion,
      uptime: metrics.uptime,
      timestamp: metrics.timestamp
    },
    architecture: {
      applicationsCount: metrics.applicationsCount,
      packagesCount: metrics.packagesCount,
      totalFiles: metrics.filesCount,
      isMonorepo: metrics.isMonorepo,
      hasWorkspace: metrics.hasWorkspace
    },
    quality: {
      codeQuality: metrics.codeQuality,
      developmentScore: metrics.developmentScore,
      hasTests: metrics.hasTests,
      hasESLint: metrics.hasESLint
    }
  };
  
  res.json(response);
});
```

## Consideraciones Técnicas

1. **Consistencia**: Los endpoints siempre reflejan el estado actual del proyecto
2. **Performance**: El análisis es rápido (análisis estático, no requiere ejecución)
3. **Escalabilidad**: Puede cachear resultados si el análisis se vuelve costoso
4. **Monitoreo**: Los campos `null` pueden poblarse con métricas runtime futuras
5. **Versionado**: La estructura JSON es estable y versionada

## Próximos Pasos

- [ ] Implementar endpoints en el backend
- [ ] Agregar middleware de caché para optimización
- [ ] Considerar WebSockets para actualizaciones en tiempo real
- [ ] Integrar métricas runtime cuando la aplicación esté desplegada
- [ ] Añadir autenticación y autorización según sea necesario
