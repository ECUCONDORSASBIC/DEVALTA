# Esquema de Métricas Reales - real-metrics-analyzer.cjs

## Resumen

Este documento documenta la estructura JSON producida por el analizador de métricas reales de DevAltaMedica (`real-metrics-analyzer.cjs`) a través de los métodos `getRealPlatformMetrics()` y `generateReport()`.

## Estructura JSON

### Objeto Principal

El objeto JSON retornado contiene las siguientes propiedades:

```json
{
  "projectName": "string",
  "projectVersion": "string", 
  "applicationsCount": "number",
  "packagesCount": "number",
  "codeQuality": "number",
  "medicalCompliance": "number",
  "developmentScore": "number",
  "filesCount": "number",
  "typescriptFiles": "number",
  "reactComponents": "number",
  "hasWorkspace": "boolean",
  "isMonorepo": "boolean",
  "hasTests": "boolean",
  "hasESLint": "boolean",
  "hasMedicalTypes": "boolean",
  "hasPatientManagement": "boolean",
  "timestamp": "string",
  "uptime": "string",
  "activeUsers": null,
  "apiResponseTime": null,
  "databasePerformance": null,
  "errorRate": null
}
```

## Detalle de Campos

### Información del Proyecto

| Campo | Tipo | Descripción | Rango/Valores |
|-------|------|-------------|---------------|
| `projectName` | string | Nombre del proyecto extraído de package.json | Cualquier string, por defecto "DEVALTAMEDICA" |
| `projectVersion` | string | Versión del proyecto de package.json | Formato semver, por defecto "1.0.0" |

### Contadores de Estructura

| Campo | Tipo | Descripción | Rango/Valores |
|-------|------|-------------|---------------|
| `applicationsCount` | number | Número de aplicaciones en el directorio `/apps` | ≥ 0 |
| `packagesCount` | number | Número de paquetes en el directorio `/packages` | ≥ 0 |
| `filesCount` | number | Total de archivos analizados en el proyecto | ≥ 0 |
| `typescriptFiles` | number | Archivos con extensión `.ts` o `.tsx` | ≥ 0 |
| `reactComponents` | number | Archivos con extensión `.tsx` o `.jsx` | ≥ 0 |

### Scores de Calidad

| Campo | Tipo | Descripción | Rango/Valores |
|-------|------|-------------|---------------|
| `codeQuality` | number | Score de calidad basado en configuración de seguridad | 0-100 |
| `medicalCompliance` | number | Score de compliance médico basado en apps y packages | 0-100 |
| `developmentScore` | number | Score de entorno de desarrollo | 0-100 |

#### Cálculo de Scores

**codeQuality (0-100):**
- ESLint configurado: +20 puntos
- Prettier configurado: +15 puntos  
- TypeScript strict mode: +25 puntos
- .env.example existe: +20 puntos
- .gitignore existe: +20 puntos

**medicalCompliance (0-100):**
- App 'patients' existe: +20 puntos
- App 'medical' existe: +25 puntos
- App 'admin' existe: +15 puntos
- Package 'medical-types' existe: +20 puntos
- Archivos con "HIPAA" o "compliance": +20 puntos

**developmentScore (0-100):**
- Workspace configurado: +25 puntos
- Scripts en package.json: +25 puntos máximo (3 puntos por script)
- Estructura monorepo: +25 puntos
- Testing configurado: +25 puntos

### Indicadores Booleanos

| Campo | Tipo | Descripción | Valores |
|-------|------|-------------|---------|
| `hasWorkspace` | boolean | Indica si package.json tiene configuración de workspaces | true/false |
| `isMonorepo` | boolean | Indica si existen directorios `/apps` y `/packages` | true/false |
| `hasTests` | boolean | Indica si se encontró configuración de testing | true/false |
| `hasESLint` | boolean | Indica si ESLint está configurado | true/false |
| `hasMedicalTypes` | boolean | Indica si existe el package medical-types | true/false |
| `hasPatientManagement` | boolean | Indica si existe la app patients | true/false |

### Información Temporal

| Campo | Tipo | Descripción | Formato |
|-------|------|-------------|---------|
| `timestamp` | string | Momento de generación del reporte | ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ) |
| `uptime` | string | Tiempo desde última modificación de package.json | "{days}d {hours}h" o "{hours}h" |

### Campos Nulos (Runtime Metrics)

| Campo | Tipo | Descripción | Valor |
|-------|------|-------------|--------|
| `activeUsers` | null | Usuarios activos (no disponible en análisis estático) | null |
| `apiResponseTime` | null | Tiempo de respuesta API (no disponible sin servidor) | null |
| `databasePerformance` | null | Performance de base de datos (no disponible sin BD) | null |
| `errorRate` | null | Tasa de errores (no disponible sin aplicación ejecutándose) | null |

## Uso del CLI

### Salida JSON únicamente
```bash
node real-metrics-analyzer.cjs --json
```

### Reporte completo con logs
```bash
node real-metrics-analyzer.cjs
```

## Uso como Módulo

```javascript
const DevaltamedicaRealMetrics = require('./real-metrics-analyzer.cjs');

// Con logs
const analyzer = new DevaltamedicaRealMetrics();
const metrics = analyzer.getRealPlatformMetrics();

// Sin logs
const silentAnalyzer = new DevaltamedicaRealMetrics({ silent: true });
const silentMetrics = silentAnalyzer.getRealPlatformMetrics();

// Reporte completo
const report = analyzer.generateReport();
```

## Ejemplo de Salida Real

```json
{
  "projectName": "altamedica-apis",
  "projectVersion": "1.0.0",
  "applicationsCount": 9,
  "packagesCount": 16,
  "codeQuality": 45,
  "medicalCompliance": 100,
  "developmentScore": 75,
  "filesCount": 1041,
  "typescriptFiles": 459,
  "reactComponents": 206,
  "hasWorkspace": false,
  "isMonorepo": true,
  "hasTests": true,
  "hasESLint": false,
  "hasMedicalTypes": true,
  "hasPatientManagement": true,
  "timestamp": "2025-01-03T19:32:54.116Z",
  "uptime": "0h",
  "activeUsers": null,
  "apiResponseTime": null,
  "databasePerformance": null,
  "errorRate": null
}
```

## Notas

1. **Análisis Estático**: Este analizador realiza análisis estático del código, no requiere que la aplicación esté ejecutándose.

2. **Métricas Realistas**: Los valores reflejan el estado real del proyecto, no datos simulados.

3. **Archivos Excluidos**: El análisis excluye directorios como `node_modules`, `.git`, `.next`, `dist`, `coverage`, y `logs`.

4. **Consistencia**: Los métodos `getRealPlatformMetrics()` y `generateReport()` devuelven la misma estructura JSON, pero `generateReport()` también imprime logs en consola.

5. **Exports**: El módulo exporta correctamente la clase `DevaltamedicaRealMetrics` mediante `module.exports`.
