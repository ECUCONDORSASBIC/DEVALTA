# Sistema de Anamnesis Compartida - Altamedica

## 📋 Descripción

El sistema de anamnesis compartida permite que los datos de anamnesis generados en el juego interactivo (`anamnesis-juego`) sean reutilizados en las aplicaciones de doctores y pacientes, garantizando interoperabilidad y consistencia de datos.

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Anamnesis     │    │   Aplicación    │    │   Aplicación    │
│     Juego       │    │    Doctores     │    │    Pacientes    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Shared        │
                    │   Package       │
                    │   (Anamnesis)   │
                    └─────────────────┘
```

## 🚀 Instalación

```bash
# En el monorepo
pnpm install

# Construir el paquete shared
cd packages/shared
pnpm build
```

## 📦 Uso

### 1. Importar en la aplicación de anamnesis-juego

```typescript
import { 
  altamedicaAnamnesis, 
  AnamnesisAdapter 
} from '@altamedica/shared'

// Exportar anamnesis completada
const exportarAnamnesis = async (respuestas: Record<string, any>) => {
  const anamnesis = AnamnesisAdapter.convertirJuegoAAnamnesis(
    respuestas,
    'paciente-123',
    'doctor-456'
  )
  
  const exportData = altamedicaAnamnesis.export(
    anamnesis,
    'json',
    'anamnesis_juego',
    'sistema_automatico'
  )
  
  return exportData
}
```

### 2. Importar en la aplicación de doctores

```typescript
import { 
  altamedicaAnamnesis,
  AnamnesisCompleta 
} from '@altamedica/shared'

// Recibir anamnesis del juego
const recibirAnamnesis = async (exportData: any) => {
  const anamnesis = altamedicaAnamnesis.import(exportData)
  
  // Validar la anamnesis
  const validacion = altamedicaAnamnesis.validate(anamnesis)
  
  // Analizar clínicamente
  const analisis = altamedicaAnamnesis.analyze(anamnesis)
  
  return { anamnesis, validacion, analisis }
}
```

### 3. Importar en la aplicación de pacientes

```typescript
import { 
  altamedicaAnamnesis,
  anamnesisUtils 
} from '@altamedica/shared'

// Mostrar resumen al paciente
const mostrarResumen = (anamnesis: AnamnesisCompleta) => {
  const resumen = anamnesisUtils.formatForDisplay(anamnesis)
  const esCompleta = anamnesisUtils.isComplete(anamnesis)
  
  return { resumen, esCompleta }
}
```

## 🔧 Configuración

```typescript
import { AltamedicaAnamnesis } from '@altamedica/shared'

// Configuración personalizada
const anamnesisConfig = new AltamedicaAnamnesis({
  enableValidation: true,
  enableAnalytics: true,
  enableExport: true,
  defaultFormat: 'json',
  encryptionEnabled: false
})

// Actualizar configuración
anamnesisConfig.updateConfig({
  enableValidation: false
})
```

## 📊 Tipos de Datos

### AnamnesisCompleta

```typescript
interface AnamnesisCompleta {
  id: string
  pacienteId: string
  doctorId?: string
  fechaCreacion: Date
  fechaActualizacion: Date
  estado: 'en_progreso' | 'completada' | 'revisada' | 'archivada'
  
  datosPersonales: {
    nombre: string
    edad: number
    genero: string
    estadoCivil?: string
    ocupacion?: string
  }
  
  antecedentesFamiliares: {
    diabetes?: boolean
    hipertension?: boolean
    cancer?: boolean
    enfermedadesCardiovasculares?: boolean
    otrasEnfermedades?: string
  }
  
  antecedentesPersonales: {
    alergias?: boolean
    alergiasDescripcion?: string
    cirugiasPrevias?: boolean
    cirugiasDescripcion?: string
    medicamentosActuales?: boolean
    medicamentosLista?: string
  }
  
  habitos: {
    fuma?: boolean
    alcohol?: boolean
    ejercicio?: boolean
    dieta?: string
    sueno?: number
  }
  
  motivoConsulta: {
    sintomaPrincipal: string
    duracion: string
    intensidad?: number
    factoresAgravantes?: string
    factoresMejorantes?: string
    sintomasAsociados?: string[]
  }
  
  // ... más campos
}
```

## 🔍 Validación

```typescript
const validacion = altamedicaAnamnesis.validate(anamnesis)

// Resultado:
{
  esValida: boolean
  errores: string[]
  advertencias: string[]
  completitud: number // 0-100
  calidad: number // 0-100
  recomendaciones: string[]
}
```

## 🧠 Análisis Clínico

```typescript
const analisis = altamedicaAnamnesis.analyze(anamnesis)

// Resultado:
{
  urgencia: 'baja' | 'media' | 'alta' | 'emergencia'
  alertas: string[]
  diagnosticosDiferenciales: string[]
  recomendaciones: string[]
  factoresRiesgo: string[]
  necesitaSeguimiento: boolean
  confianza: number // 0-100
  tiempoEstimadoEspera?: number
}
```

## 📈 Estadísticas

```typescript
const estadisticas = altamedicaAnamnesis.generateStats(anamnesisList)

// Resultado:
{
  totalAnamnesis: number
  completadas: number
  enProgreso: number
  promedioTiempoCompletado: number
  diagnosticosMasComunes: Array<{
    diagnostico: string
    frecuencia: number
  }>
  nivelUrgenciaDistribucion: Record<string, number>
  calidadPromedio: number
}
```

## 🔄 Exportación/Importación

### Formatos Soportados

- **JSON**: Formato nativo del sistema
- **FHIR**: Estándar de interoperabilidad médica
- **HL7**: Protocolo de comunicación médica
- **PDF**: Documento imprimible

### Ejemplo de Exportación

```typescript
const exportData = altamedicaAnamnesis.export(
  anamnesis,
  'fhir',
  'anamnesis_juego',
  'doctor_garcia'
)

// Resultado:
{
  version: '1.0.0'
  timestamp: Date
  anamnesis: AnamnesisCompleta
  formato: 'fhir'
  metadata: {
    exportadoPor: 'doctor_garcia'
    aplicacionOrigen: 'anamnesis_juego'
    encriptado: false
    hashIntegridad: 'abc123...'
  }
}
```

## 🛡️ Seguridad

- **Validación de integridad**: Hash SHA-256 para detectar modificaciones
- **Encriptación opcional**: AES-256 para datos sensibles
- **Auditoría**: Log de todas las operaciones
- **GDPR/HIPAA**: Cumplimiento con regulaciones de privacidad

## 🔧 Desarrollo

### Construir el paquete

```bash
cd packages/shared
pnpm build
```

### Ejecutar tests

```bash
pnpm test
```

### Verificar tipos

```bash
pnpm type-check
```

## 📝 Ejemplos de Uso

### 1. Flujo Completo de Anamnesis

```typescript
// 1. Paciente completa anamnesis en el juego
const respuestas = {
  nombre: 'María García',
  edad: '28',
  genero: 'Femenino',
  'motivo-consulta': 'Dolor abdominal',
  // ... más respuestas
}

// 2. Exportar para doctores
const exportDoctores = AnamnesisAdapter.exportarParaDoctores(
  respuestas,
  'paciente-123',
  'doctor-456'
)

// 3. Enviar a aplicación de doctores
await fetch('/api/doctors/anamnesis', {
  method: 'POST',
  body: JSON.stringify(exportDoctores)
})

// 4. Doctor recibe y analiza
const anamnesis = altamedicaAnamnesis.import(exportDoctores)
const analisis = altamedicaAnamnesis.analyze(anamnesis)

// 5. Generar resumen para paciente
const resumen = AnamnesisAdapter.generarResumenPaciente(anamnesis)
```

### 2. Estadísticas y Reportes

```typescript
// Obtener estadísticas de todas las anamnesis
const estadisticas = altamedicaAnamnesis.generateStats(anamnesisList)

// Filtrar por criterios específicos
const filtros = {
  fechaDesde: new Date('2024-01-01'),
  fechaHasta: new Date('2024-12-31'),
  nivelUrgencia: ['alta', 'emergencia'],
  completitud: { min: 80, max: 100 }
}

const anamnesisFiltradas = altamedicaAnamnesis.filter(anamnesisList, filtros)
```

## 🚨 Manejo de Errores

```typescript
try {
  const anamnesis = altamedicaAnamnesis.import(exportData)
} catch (error) {
  if (error.message.includes('modificados')) {
    console.error('Los datos han sido alterados')
  } else {
    console.error('Error al importar:', error.message)
  }
}
```

## 📞 Soporte

Para soporte técnico o preguntas sobre el sistema de anamnesis compartida:

- **Email**: support@altamedica.com
- **Documentación**: [docs.altamedica.com/anamnesis](https://docs.altamedica.com/anamnesis)
- **Issues**: [GitHub Issues](https://github.com/altamedica/devaltamedica/issues)

## 🔄 Versiones

- **v1.0.0**: Versión inicial con funcionalidades básicas
- **v1.1.0**: Agregado soporte para FHIR y HL7
- **v1.2.0**: Mejoras en validación y análisis clínico

## 📄 Licencia

Este sistema es parte del proyecto Altamedica y está sujeto a los términos de la licencia del proyecto. 