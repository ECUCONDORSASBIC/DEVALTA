# Anamnesis Inmersiva 3D - Protocolo Álvarez

## Descripción

Sistema de anamnesis médica inmersiva basado en la Semiología Médica de Álvarez, que proporciona una experiencia 3D interactiva para la recolección exhaustiva de datos del paciente.

## Características Principales

### 🎯 Protocolo Álvarez Completo
- **10 pasos estructurados** siguiendo la metodología de Álvarez
- **Flujos exhaustivos y funcionales** para cada etapa de la anamnesis
- **Validación médica** basada en estándares clínicos

### 🎮 Experiencia 3D Inmersiva
- **Modelo 3D interactivo** del paciente
- **Selección visual** de partes del cuerpo
- **Resaltado dinámico** de áreas sintomáticas
- **Ambiente médico realista** con equipos 3D

### 📊 Gestión de Estado Avanzada
- **Zustand** para manejo de estado global
- **Sincronización 3D-UI** en tiempo real
- **Persistencia de datos** con validación
- **Historial de cambios** y versionado

## Arquitectura del Sistema

### Estructura de Archivos
```
patient3d/
├── types/
│   └── anamnesisTypes.ts          # Tipos TypeScript completos
├── store/
│   └── patient3DStore.ts          # Store Zustand principal
├── steps/
│   ├── IdentificationStep.tsx     # Identificación del paciente
│   ├── MotivoConsultaStep.tsx     # Motivo de consulta
│   ├── EnfermedadActualStep.tsx   # Enfermedad actual
│   ├── AntecedentesStep.tsx       # Antecedentes patológicos
│   ├── RevisionSistemasStep.tsx   # Revisión por sistemas
│   ├── HabitosStep.tsx            # Hábitos y estilo de vida
│   ├── FamiliaresStep.tsx         # Antecedentes familiares
│   ├── SocialesStep.tsx           # Antecedentes sociales
│   ├── ExamenFisicoStep.tsx       # Examen físico
│   └── ConclusionesStep.tsx       # Conclusiones
├── ui/
│   ├── AnamnesisSidebar.tsx       # Navegación lateral
│   └── MedicalTools.tsx           # Herramientas médicas
├── Patient3DAvatar.tsx            # Modelo 3D del paciente
├── MedicalEnvironment.tsx         # Ambiente médico 3D
├── AnamnesisInterface.tsx         # Interfaz principal
└── README.md                      # Documentación
```

## Pasos de Anamnesis (Protocolo Álvarez)

### 1. Identificación del Paciente
- **Datos personales completos**
- **Información demográfica**
- **Datos de contacto**
- **Autocompletado desde BD**

### 2. Motivo de Consulta
- **Descripción del problema principal**
- **Tiempo de evolución**
- **Características del síntoma**
- **Localización 3D interactiva**
- **Factores agravantes/mejorantes**

### 3. Enfermedad Actual
- **Cronología detallada**
- **Síntomas principales**
- **Tratamientos previos**
- **Estudios realizados**

### 4. Antecedentes Patológicos
- **Enfermedades previas**
- **Cirugías**
- **Traumatismos**
- **Alergias**
- **Hospitalizaciones**

### 5. Revisión por Sistemas
- **Sistema nervioso**
- **Sistema cardiovascular**
- **Sistema respiratorio**
- **Sistema digestivo**
- **Sistema genitourinario**
- **Sistema endocrino**
- **Sistema hematológico**
- **Sistema musculoesquelético**
- **Sistema inmunológico**
- **Piel**

### 6. Hábitos y Estilo de Vida
- **Tabaco**
- **Alcohol**
- **Drogas**
- **Ejercicio**
- **Alimentación**
- **Sueño**

### 7. Antecedentes Familiares
- **Padres**
- **Hermanos**
- **Hijos**
- **Otros familiares**

### 8. Antecedentes Sociales
- **Nivel educativo**
- **Ocupación**
- **Ingresos**
- **Vivienda**
- **Apoyo social**
- **Exposiciones laborales/ambientales**

### 9. Examen Físico
- **Signos vitales**
- **Aspecto general**
- **Exploración por regiones**
- **Sistema nervioso**

### 10. Conclusiones
- **Impresión diagnóstica**
- **Plan terapéutico**
- **Recomendaciones**

## Estructura de la Anamnesis de Álvarez (Resumen)

| Paso | ID                        | Título                        | Categoría             |
|------|---------------------------|-------------------------------|-----------------------|
| 1    | identificacion            | Identificación del Paciente    | identificacion        |
| 2    | motivo_consulta           | Motivo de Consulta            | motivo                |
| 3    | enfermedad_actual         | Enfermedad Actual             | enfermedad_actual     |
| 4    | antecedentes_patologicos  | Antecedentes Patológicos      | antecedentes          |
| 5    | revision_sistemas         | Revisión por Sistemas         | revision_sistemas     |
| 6    | habitos                   | Hábitos y Estilo de Vida      | habitos               |
| 7    | antecedentes_familiares   | Antecedentes Familiares       | familiares            |
| 8    | antecedentes_sociales     | Antecedentes Sociales         | sociales              |
| 9    | examen_fisico             | Examen Físico                 | examen_fisico         |
| 10   | conclusiones              | Conclusiones                  | conclusiones          |

> **Nota:** Esta estructura es visible y navegable en la UI, en el sidebar y en el flujo de pasos del formulario central, asegurando máxima claridad y acceso para el usuario médico.

## Tecnologías Utilizadas

### Frontend
- **React 18** - Framework principal
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Zustand** - Gestión de estado
- **React Three Fiber** - Renderizado 3D
- **Drei** - Utilidades 3D

### 3D y Gráficos
- **Three.js** - Motor 3D
- **GLTF/GLB** - Formatos de modelo
- **Raycasting** - Interacción 3D
- **Animaciones** - Transiciones suaves

### Estado y Datos
- **Zustand** - Store global
- **TypeScript** - Tipos estrictos
- **Validación** - Esquemas de datos
- **Persistencia** - LocalStorage/API

## Características Técnicas

### Interacción 3D
```typescript
// Ejemplo de selección de parte del cuerpo
const handleBodyPartClick = (bodyPart: string) => {
  const currentLocation = formData.caracteristicas.localizacion
  const isSelected = currentLocation.includes(bodyPart)
  
  if (isSelected) {
    handleCaracteristicaChange('localizacion', 
      currentLocation.filter(part => part !== bodyPart))
  } else {
    handleCaracteristicaChange('localizacion', 
      [...currentLocation, bodyPart])
  }
}
```

### Gestión de Estado
```typescript
// Store Zustand con tipos completos
export const usePatient3DStore = create<AnamnesisStore>()(
  devtools(
    (set, get) => ({
      currentStep: 0,
      totalSteps: ALVAREZ_ANAMNESIS_STEPS.length,
      anamnesisData: INITIAL_ANAMNESIS_DATA,
      // ... más estado
    })
  )
)
```

### Validación de Datos
```typescript
// Tipos estrictos para validación
interface PatientIdentification {
  nombre: string
  apellidos: string
  edad: number
  sexo: 'masculino' | 'femenino' | 'otro'
  // ... más campos
}
```

## Flujos de Usuario

### 1. Inicio de Sesión
- Carga del modelo 3D
- Inicialización del store
- Carga de datos previos (si existen)

### 2. Navegación por Pasos
- Sidebar con progreso visual
- Validación de campos requeridos
- Guardado automático

### 3. Interacción 3D
- Selección de partes del cuerpo
- Resaltado visual
- Sincronización con formularios

### 4. Finalización
- Revisión completa
- Generación de reporte
- Exportación de datos

## Herramientas Médicas Integradas

### Instrumentos Virtuales
- **Estetoscopio** - Auscultación
- **Termómetro** - Temperatura
- **Tensiómetro** - Presión arterial
- **Pulsioxímetro** - Saturación O2
- **Martillo de reflejos** - Exploración neurológica
- **Otoscopio** - Exploración de oídos

### Funcionalidades
- **Selección de herramienta**
- **Simulación de uso**
- **Registro de hallazgos**
- **Integración con anamnesis**

## Ventajas del Sistema

### Para el Médico
- **Protocolo estandarizado** basado en Álvarez
- **Interfaz intuitiva** y moderna
- **Datos estructurados** y validados
- **Historial completo** del paciente

### Para el Paciente
- **Experiencia inmersiva** y atractiva
- **Comunicación visual** clara
- **Participación activa** en su historia clínica

### Para la Institución
- **Datos estandarizados** y completos
- **Trazabilidad** completa
- **Integración** con sistemas existentes
- **Escalabilidad** del sistema

## Próximas Mejoras

### Funcionalidades Planificadas
- [ ] **Reconocimiento de voz** para dictado
- [ ] **IA para sugerencias** diagnósticas
- [ ] **Integración con PACS** para imágenes
- [ ] **Sincronización en tiempo real** entre médicos
- [ ] **Modo VR/AR** para mayor inmersión

### Optimizaciones Técnicas
- [ ] **Lazy loading** de modelos 3D
- [ ] **Caché inteligente** de datos
- [ ] **Compresión** de modelos 3D
- [ ] **PWA** para uso offline

## Instalación y Uso

### Requisitos
- Node.js 18+
- pnpm (recomendado)
- Navegador moderno con WebGL

### Instalación
```bash
cd apps/web-app
pnpm install
pnpm dev
```

### Acceso
- URL: `http://localhost:3000/patient3d`
- Navegador: Chrome/Firefox/Safari con WebGL

## Contribución

### Estándares de Código
- **TypeScript estricto**
- **ESLint + Prettier**
- **Conventional Commits**
- **Tests unitarios**

### Estructura de Commits
```
feat: agregar paso de examen físico
fix: corregir validación de edad
docs: actualizar documentación
refactor: optimizar renderizado 3D
```

## Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

## Contacto

Para preguntas o soporte técnico:
- **Email**: soporte@altamedica.com
- **Documentación**: `/docs/patient3d`
- **Issues**: GitHub Issues

---

**Desarrollado con ❤️ para la excelencia médica**