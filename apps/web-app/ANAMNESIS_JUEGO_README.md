# 🎮 Juego de Anamnesis Interactiva

## Descripción

El **Juego de Anamnesis Interactiva** es una experiencia inmersiva que combina tecnología 3D con metodología médica basada en Álvarez de Semiología Médica. Los usuarios interactúan con un doctor 3D que realiza preguntas sistemáticas para construir un avatar médico personalizado.

## 🎯 Características Principales

### 🏥 Doctor 3D Interactivo
- **Modelo 3D Realista**: Doctor vestido con bata médica en un entorno hospitalario
- **Animaciones**: Movimientos y gestos naturales durante la consulta
- **Burbuja de Diálogo**: Muestra las preguntas actuales del doctor
- **Enfoque Visual**: Gran énfasis en la figura del doctor como elemento central

### 📋 Formulario de Anamnesis
- **Metodología Álvarez**: Preguntas basadas en Semiología Médica
- **Secciones Organizadas**:
  1. **Datos Personales**: Identificación básica del paciente
  2. **Antecedentes Familiares**: Historia médica familiar
  3. **Antecedentes Personales**: Historia médica personal
  4. **Hábitos**: Estilo de vida y costumbres
  5. **Enfermedad Actual**: Motivo de consulta y síntomas

### 🎨 Tipos de Preguntas
- **Texto**: Respuestas libres
- **Número**: Valores numéricos (edad, peso, etc.)
- **Selección**: Opciones predefinidas
- **Booleano**: Sí/No con botones interactivos
- **Área de Texto**: Descripciones detalladas

### 👤 Avatar del Paciente
- **Generación Automática**: Basada en las respuestas del usuario
- **Características Dinámicas**:
  - Edad y género
  - Complexión (Normal, Atlética, Sobrepeso)
  - Riesgos médicos identificados
  - Síntomas reportados
  - Medicamentos actuales

### 🎮 Experiencia de Juego
- **Progreso Visual**: Barra de progreso en tiempo real
- **Navegación Intuitiva**: Flujo secuencial de preguntas
- **Validación**: Campos requeridos marcados
- **Resultados Finales**: Resumen completo con avatar 3D

## 🚀 Cómo Jugar

### 1. Acceso al Juego
```
URL: http://localhost:3001/anamnesis-juego
```

### 2. Inicio de la Consulta
- El doctor 3D aparece en el lado izquierdo de la pantalla
- Las preguntas se muestran en el formulario derecho
- El progreso se indica en la parte superior

### 3. Proceso de Anamnesis
1. **Datos Personales**: Nombre, edad, género, estado civil, ocupación
2. **Antecedentes Familiares**: Diabetes, hipertensión, cáncer, enfermedades cardiovasculares
3. **Antecedentes Personales**: Alergias, cirugías previas, medicamentos actuales
4. **Hábitos**: Tabaquismo, alcohol, ejercicio, dieta, sueño
5. **Enfermedad Actual**: Motivo de consulta, inicio de síntomas, intensidad

### 4. Resultados Finales
- **Resumen Completo**: Todas las respuestas organizadas
- **Avatar 2D**: Información visual del paciente
- **Avatar 3D**: Modelo tridimensional interactivo
- **Análisis de Riesgos**: Identificación de factores de riesgo

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15**: Framework de React con App Router
- **TypeScript**: Tipado estático para mayor seguridad
- **Tailwind CSS**: Estilos modernos y responsivos

### 3D y Gráficos
- **Three.js**: Motor 3D para renderizado
- **React Three Fiber**: Integración de Three.js con React
- **React Three Drei**: Utilidades y componentes 3D

### Modelos 3D
- **Doctor**: `/models/nurse.glb` (modelo de enfermera adaptado)
- **Paciente**: `/models/patient-avatar.glb` (avatar del paciente)
- **Entorno**: Ambiente de estudio para iluminación

## 📁 Estructura de Archivos

```
apps/web-app/
├── src/
│   ├── app/
│   │   └── anamnesis-juego/
│   │       └── page.tsx              # Página principal del juego
│   ├── components/
│   │   └── anamnesis/
│   │       └── AvatarPaciente3D.tsx  # Componente 3D del avatar
│   └── data/
│       └── anamnesis-alvarez.ts      # Datos y lógica de anamnesis
├── public/
│   └── models/
│       ├── nurse.glb                 # Modelo del doctor
│       └── patient-avatar.glb        # Modelo del paciente
└── ANAMNESIS_JUEGO_README.md         # Esta documentación
```

## 🎨 Diseño y UX

### Layout
- **Diseño Dividido**: Doctor 3D (izquierda) + Formulario (derecha)
- **Responsivo**: Adaptable a diferentes tamaños de pantalla
- **Enfoque Visual**: Doctor como elemento central de atención

### Interacciones
- **Botones Animados**: Efectos hover y transiciones suaves
- **Validación Visual**: Campos requeridos claramente marcados
- **Progreso Dinámico**: Barra de progreso que se actualiza en tiempo real

### Colores y Estilos
- **Paleta Médica**: Azules y verdes para transmitir confianza
- **Gradientes**: Efectos visuales modernos
- **Sombras**: Profundidad y elegancia en la interfaz

## 🔧 Configuración y Desarrollo

### Instalación
```bash
# Desde la raíz del proyecto
cd apps/web-app
pnpm install
```

### Ejecución
```bash
# Desarrollo
pnpm dev --port 3001

# Producción
pnpm build
pnpm start
```

### Variables de Entorno
```env
# Puerto de desarrollo (opcional)
PORT=3001
```

## 🎯 Objetivos Educativos

### Para Estudiantes de Medicina
- **Metodología Álvarez**: Aprender el proceso sistemático de anamnesis
- **Preguntas Clave**: Identificar las preguntas más importantes
- **Flujo Lógico**: Seguir el orden correcto de la consulta

### Para Pacientes
- **Preparación**: Entender qué preguntas esperar en una consulta
- **Autoconocimiento**: Reflexionar sobre su historia médica
- **Comunicación**: Mejorar la comunicación con profesionales de la salud

## 🔮 Futuras Mejoras

### Funcionalidades Planificadas
- **Múltiples Doctores**: Diferentes especialistas según el caso
- **Casos Clínicos**: Escenarios específicos para práctica
- **Análisis IA**: Sugerencias de diagnóstico basadas en respuestas
- **Exportación**: Generar reportes médicos en PDF
- **Multilingüe**: Soporte para múltiples idiomas

### Mejoras Técnicas
- **Optimización 3D**: Mejor rendimiento en dispositivos móviles
- **Accesibilidad**: Mejoras para usuarios con discapacidades
- **PWA**: Aplicación web progresiva para uso offline

## 📊 Métricas y Analytics

### Datos Recopilados
- **Tiempo de Completado**: Duración promedio de la anamnesis
- **Tasa de Abandono**: Puntos donde los usuarios abandonan
- **Preguntas Problemáticas**: Campos que generan más dudas
- **Satisfacción**: Calificaciones de la experiencia

### KPIs
- **Engagement**: Tiempo promedio en la aplicación
- **Completitud**: Porcentaje de anamnesis completadas
- **Retención**: Usuarios que regresan para nuevas consultas

## 🤝 Contribución

### Cómo Contribuir
1. **Fork** del repositorio
2. **Branch** para nueva funcionalidad
3. **Commit** con mensajes descriptivos
4. **Pull Request** con descripción detallada

### Estándares de Código
- **TypeScript**: Tipado estricto obligatorio
- **ESLint**: Reglas de linting configuradas
- **Prettier**: Formateo automático de código
- **Tests**: Cobertura mínima del 80%

## 📞 Soporte

### Contacto
- **Issues**: Reportar bugs en GitHub
- **Discussions**: Preguntas y sugerencias
- **Documentación**: Wiki del proyecto

### Recursos Adicionales
- **Metodología Álvarez**: Referencias bibliográficas
- **Three.js**: Documentación oficial
- **Next.js**: Guías de desarrollo

---

**Desarrollado con ❤️ para la comunidad médica** 