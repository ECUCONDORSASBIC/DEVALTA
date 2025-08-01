# Checklist de Accesibilidad WCAG 2.1 AA
## DevAltaMedica Web Application

### Información General
- **Versión WCAG:** 2.1
- **Nivel de Conformidad:** AA
- **Fecha de Evaluación:** _________
- **Evaluador:** _________

---

## 1. PRINCIPIO: PERCEPTIBLE
### 1.1 Alternativas de Texto

#### 1.1.1 Contenido No Textual (A)
- [ ] Todas las imágenes tienen texto alternativo apropiado
- [ ] Las imágenes decorativas están marcadas como tal (alt="")
- [ ] Los iconos funcionales tienen descripciones claras
- [ ] Los gráficos complejos tienen descripciones detalladas

#### 1.1.2 Medios Basados en Tiempo (AA)
- [ ] Videos tienen subtítulos sincronizados
- [ ] Audio tiene transcripciones
- [ ] Medios interactivos son accesibles

### 1.2 Medios Basados en Tiempo
- [ ] Todos los videos tienen controles de reproducción
- [ ] Los controles son accesibles por teclado
- [ ] No hay contenido que parpadee más de 3 veces por segundo

### 1.3 Adaptable

#### 1.3.1 Información y Relaciones (A)
- [ ] Estructura semántica correcta (headings, lists, tables)
- [ ] Formularios tienen labels asociados
- [ ] Campos obligatorios están claramente marcados
- [ ] Agrupaciones lógicas están implementadas

#### 1.3.2 Secuencia Significativa (A)
- [ ] El orden de lectura es lógico
- [ ] Navegación por teclado sigue orden visual
- [ ] Contenido mantiene sentido sin CSS

#### 1.3.3 Características Sensoriales (A)
- [ ] Instrucciones no dependen solo de forma, tamaño, o posición
- [ ] Información importante no depende solo del color
- [ ] Sonidos no son la única forma de comunicar información

#### 1.3.4 Orientación (AA)
- [ ] Contenido funciona en orientación portrait y landscape
- [ ] No se restringe la orientación sin justificación

#### 1.3.5 Identificar el Propósito de Entrada (AA)
- [ ] Campos de entrada tienen propósito identificado
- [ ] Autocompletado está implementado apropiadamente

### 1.4 Distinguible

#### 1.4.1 Uso del Color (A)
- [ ] Color no es el único medio para transmitir información
- [ ] Enlaces se distinguen por más que color
- [ ] Estados de formulario no dependen solo del color

#### 1.4.2 Control de Audio (A)
- [ ] Audio automático puede ser pausado/detenido
- [ ] Volumen puede ser controlado

#### 1.4.3 Contraste (Mínimo) (AA)
- [ ] Texto normal: ratio mínimo 4.5:1
- [ ] Texto grande: ratio mínimo 3:1
- [ ] Logotipos y texto incidental exentos

#### 1.4.4 Cambio de Tamaño del Texto (AA)
- [ ] Texto puede aumentarse hasta 200% sin pérdida de funcionalidad
- [ ] No requiere desplazamiento horizontal

#### 1.4.5 Imágenes de Texto (AA)
- [ ] Se usa texto real en lugar de imágenes de texto
- [ ] Excepciones: logotipos, texto esencial

#### 1.4.10 Reflow (AA)
- [ ] Contenido se puede presentar sin scroll horizontal a:
  - 320px de ancho (zoom 400%)
  - 256px de alto (zoom 400%)

#### 1.4.11 Contraste de Elementos No Textuales (AA)
- [ ] Elementos UI: ratio mínimo 3:1
- [ ] Elementos gráficos: ratio mínimo 3:1
- [ ] Estados de componentes claramente diferenciados

#### 1.4.12 Espaciado de Texto (AA)
- [ ] Texto permanece legible con espaciado personalizado:
  - Line height: 1.5x font size
  - Paragraph spacing: 2x font size
  - Letter spacing: 0.12x font size
  - Word spacing: 0.16x font size

#### 1.4.13 Contenido en Hover o Focus (AA)
- [ ] Contenido adicional es descartable
- [ ] Contenido adicional es hoverable
- [ ] Contenido adicional es persistente

---

## 2. PRINCIPIO: OPERABLE
### 2.1 Accesible por Teclado

#### 2.1.1 Teclado (A)
- [ ] Toda funcionalidad disponible por teclado
- [ ] No hay "trampa de teclado"
- [ ] Combinaciones de teclas son estándar

#### 2.1.2 Sin Trampa de Teclado (A)
- [ ] El foco puede moverse fuera de cualquier componente
- [ ] Método de salida es obvio para el usuario

#### 2.1.4 Atajos de Teclado de Caracteres (A)
- [ ] Atajos de una sola tecla pueden ser desactivados
- [ ] Atajos pueden ser remapeados
- [ ] Atajos solo funcionan cuando el componente tiene foco

### 2.2 Suficiente Tiempo

#### 2.2.1 Límites de Tiempo Ajustables (A)
- [ ] Límites de tiempo pueden ser extendidos
- [ ] Usuario puede desactivar límites
- [ ] Usuario es advertido antes de que expire

#### 2.2.2 Pausar, Detener, Ocultar (A)
- [ ] Contenido en movimiento puede ser pausado
- [ ] Contenido que se actualiza puede ser pausado
- [ ] Contenido que parpadea puede ser detenido

### 2.3 Convulsiones y Reacciones Físicas

#### 2.3.1 Umbral de Tres Flashes o Debajo (A)
- [ ] No hay contenido que parpadee más de 3 veces por segundo
- [ ] Flashes están debajo del umbral general

### 2.4 Navegable

#### 2.4.1 Saltar Bloques (A)
- [ ] Mecanismo para saltar bloques repetitivos
- [ ] Enlaces "Saltar al contenido principal"
- [ ] Navegación por landmarks

#### 2.4.2 Página Titulada (A)
- [ ] Todas las páginas tienen títulos únicos y descriptivos
- [ ] Títulos describen el propósito de la página

#### 2.4.3 Orden del Foco (A)
- [ ] Orden de navegación por teclado es lógico
- [ ] Foco no salta de manera confusa
- [ ] Elementos relacionados están agrupados

#### 2.4.4 Propósito del Enlace (En Contexto) (A)
- [ ] Enlaces tienen texto descriptivo
- [ ] Propósito es claro por el texto del enlace
- [ ] "Leer más" incluye contexto

#### 2.4.5 Múltiples Vías (AA)
- [ ] Más de una forma de encontrar páginas
- [ ] Navegación principal disponible
- [ ] Buscador o mapa del sitio disponible

#### 2.4.6 Encabezados y Etiquetas (AA)
- [ ] Encabezados son descriptivos
- [ ] Etiquetas describen el propósito
- [ ] Jerarquía de encabezados es lógica

#### 2.4.7 Foco Visible (AA)
- [ ] Indicador de foco siempre visible
- [ ] Indicador de foco es claramente distinguible
- [ ] Foco no se pierde durante la navegación

### 2.5 Modalidades de Entrada

#### 2.5.1 Gestos de Puntero (A)
- [ ] Funcionalidad multitoque tiene alternativa de un punto
- [ ] Gestos basados en trayectoria tienen alternativa

#### 2.5.2 Cancelación de Puntero (A)
- [ ] Eventos down no ejecutan funciones
- [ ] Función se ejecuta en evento up
- [ ] Mecanismo de cancelación disponible

#### 2.5.3 Etiqueta en Nombre (A)
- [ ] Etiqueta visible está incluida en nombre accesible
- [ ] Orden de palabras es consistente

#### 2.5.4 Activación por Movimiento (A)
- [ ] Funcionalidad por movimiento tiene alternativa UI
- [ ] Funcionalidad por movimiento puede ser desactivada

---

## 3. PRINCIPIO: COMPRENSIBLE
### 3.1 Legible

#### 3.1.1 Idioma de la Página (A)
- [ ] Idioma principal está especificado
- [ ] Cambios de idioma están marcados
- [ ] Atributo lang es correcto

#### 3.1.2 Idioma de las Partes (AA)
- [ ] Cambios de idioma en el contenido están marcados
- [ ] Nombres propios y términos técnicos apropiadamente marcados

### 3.2 Predecible

#### 3.2.1 En el Foco (A)
- [ ] Recibir foco no inicia cambios de contexto
- [ ] Formularios no se envían automáticamente
- [ ] Páginas no cambian automáticamente

#### 3.2.2 En la Entrada (A)
- [ ] Cambiar configuración no causa cambios de contexto
- [ ] Botones de envío están claramente marcados
- [ ] Usuario controla cuándo se envía información

#### 3.2.3 Navegación Coherente (AA)
- [ ] Navegación es consistente en todo el sitio
- [ ] Elementos repetitivos están en el mismo orden
- [ ] Funcionalidad similar es consistente

#### 3.2.4 Identificación Coherente (AA)
- [ ] Componentes con misma funcionalidad tienen mismo nombre
- [ ] Iconos son consistentes en todo el sitio
- [ ] Terminología es consistente

### 3.3 Asistencia para la Entrada

#### 3.3.1 Identificación de Errores (A)
- [ ] Errores son identificados y descritos
- [ ] Ubicación del error es clara
- [ ] Sugerencias para corrección son proporcionadas

#### 3.3.2 Etiquetas o Instrucciones (A)
- [ ] Etiquetas están presentes para campos de entrada
- [ ] Instrucciones son claras y accesibles
- [ ] Formato requerido es explicado

#### 3.3.3 Sugerencia de Errores (AA)
- [ ] Sugerencias son proporcionadas para errores
- [ ] Sugerencias son específicas y útiles
- [ ] Información sensible no se sugiere automáticamente

#### 3.3.4 Prevención de Errores (Legales, Financieros, Datos) (AA)
- [ ] Envíos pueden ser revertidos
- [ ] Datos son verificados antes del envío
- [ ] Confirmación es requerida para envíos importantes

---

## 4. PRINCIPIO: ROBUSTO
### 4.1 Compatible

#### 4.1.1 Procesamiento (A)
- [ ] Markup es válido según especificaciones
- [ ] Elementos tienen tags de apertura y cierre
- [ ] Elementos están anidados correctamente
- [ ] Atributos no están duplicados

#### 4.1.2 Nombre, Función, Valor (A)
- [ ] Componentes UI tienen nombres accesibles
- [ ] Función de componentes es clara
- [ ] Estado de componentes es comunicado

#### 4.1.3 Mensajes de Estado (AA)
- [ ] Mensajes de estado son comunicados a tecnologías asistivas
- [ ] Cambios importantes son anunciados
- [ ] Progreso y completación son comunicados

---

## SECCIONES ESPECÍFICAS DE DEVALTAMEDICA

### Módulo de Consentimiento Informado
- [ ] Formularios de consentimiento son completamente accesibles
- [ ] Documentos PDF tienen alternativas accesibles
- [ ] Firmas digitales son accesibles
- [ ] Proceso de consentimiento es comprensible

### Visualización 3D
- [ ] Controles de navegación 3D son accesibles por teclado
- [ ] Alternativas textuales para contenido 3D
- [ ] Información espacial es comunicada
- [ ] Animaciones pueden ser pausadas

### Formularios Médicos
- [ ] Terminología médica tiene definiciones
- [ ] Campos obligatorios están claramente marcados
- [ ] Validación es clara y específica
- [ ] Ayuda contextual está disponible

### Dashboard de Pacientes
- [ ] Datos tabulares son accesibles
- [ ] Gráficos tienen alternativas textuales
- [ ] Filtros y búsquedas son accesibles
- [ ] Paginación es accesible

---

## PUNTUACIÓN Y RESULTADOS

### Resumen de Cumplimiento
- **Nivel A:** ___/48 criterios cumplidos
- **Nivel AA:** ___/36 criterios cumplidos
- **Total:** ___/84 criterios cumplidos

### Porcentaje de Cumplimiento
- **Nivel A:** ___% 
- **Nivel AA:** ___%
- **General:** ___%

### Problemas Críticos Encontrados
1. _________________________________
2. _________________________________
3. _________________________________

### Recomendaciones Prioritarias
1. _________________________________
2. _________________________________
3. _________________________________

---

## HERRAMIENTAS UTILIZADAS EN LA EVALUACIÓN
- [ ] WAVE (Web Accessibility Evaluation Tool)
- [ ] axe DevTools
- [ ] Lighthouse Accessibility Audit
- [ ] NVDA/JAWS Screen Reader
- [ ] Keyboard Navigation Testing
- [ ] Color Contrast Analyzers
- [ ] Validator W3C

---

**Fecha de Evaluación:** ________________
**Evaluador:** ________________
**Próxima Revisión:** ________________
