# Especificaciones Técnicas - Wireframe UI-3D

## Resumen del Diseño

Este wireframe presenta una aplicación web responsive con visualización 3D centrada, diseñada para ofrecer una experiencia de usuario óptima en todos los dispositivos.

## Zonificación Principal

### 1. Barra Superior (Header)
- **Posición**: Fija en la parte superior
- **Altura**: 80px
- **Contenido**: 
  - Título de la aplicación (izquierda)
  - Mensaje de bienvenida (derecha)
  - Botón de menú hamburguesa (móvil)
- **Prioridad Visual**: Z-index 1000 (máxima prioridad)

### 2. Panel Lateral Plegable (Sidebar)
- **Ancho Desktop**: 300px
- **Ancho Tablet**: 250px
- **Ancho Móvil**: 280px
- **Comportamiento**: 
  - Desktop: Colapsa hacia la izquierda
  - Mobile: Overlay desde la izquierda
- **Contenido**:
  - Sección de consentimientos (cookies, privacidad)
  - Opciones de visualización 3D
- **Prioridad Visual**: Z-index 999

### 3. Área Principal 3D
- **Posición**: Centrada y flexible
- **Dimensiones**:
  - Desktop: 800px × 600px (máximo)
  - Tablet: 600px × 450px (máximo)
  - Móvil: 90% × 300px
- **Características**:
  - Área de tamaño flexible/responsive
  - Espacio dedicado para renderizado 3D
  - Efectos visuales y animaciones
- **Prioridad Visual**: Z-index 1

## Breakpoints Responsive

### 1. Desktop (> 1024px)
```css
.container {
    grid-template-columns: 300px 1fr;
}
.area-3d {
    max-width: 800px;
    height: 600px;
}
```

**Características**:
- Layout de dos columnas (sidebar + main)
- Área 3D de tamaño completo
- Sidebar con botón de colapsar
- Mensaje de bienvenida visible

### 2. Tablet (768px - 1024px)
```css
.container {
    grid-template-columns: 250px 1fr;
}
.area-3d {
    max-width: 600px;
    height: 450px;
}
```

**Características**:
- Sidebar más estrecho (250px)
- Área 3D reducida proporcionalmente
- Mantiene layout de dos columnas

### 3. Tablet Vertical (≤ 768px)
```css
.container {
    grid-template-areas: 
        "header"
        "main";
    grid-template-columns: 1fr;
}
```

**Características**:
- Layout de una columna
- Sidebar como overlay
- Botón hamburguesa visible
- Área 3D al 90% del ancho

### 4. Móvil (≤ 480px)
```css
.area-3d {
    height: 300px;
    max-width: 100%;
}
.header .welcome-message {
    display: none;
}
```

**Características**:
- Área 3D más compacta
- Mensaje de bienvenida oculto
- Sidebar overlay más estrecho
- Optimización para pantallas pequeñas

## Orden de Prioridad Visual

### Jerarquía Z-Index:
1. **Header (z-index: 1000)** - Máxima prioridad
2. **Sidebar (z-index: 999)** - Segunda prioridad
3. **Overlay (z-index: 998)** - Para cerrar sidebar en móvil
4. **Main Content (z-index: 1)** - Contenido principal

### Prioridad de Contenido por Dispositivo:

#### Desktop:
1. Área 3D (principal)
2. Controles del sidebar
3. Mensaje de bienvenida

#### Tablet:
1. Área 3D (adaptada)
2. Controles del sidebar
3. Navegación

#### Móvil:
1. Área 3D (compacta)
2. Navegación hamburguesa
3. Controles en overlay

## Funcionalidades Interactivas

### Sidebar Plegable:
- **Desktop**: Botón de colapsar en el borde derecho
- **Móvil**: Menú hamburguesa + overlay

### Área 3D:
- Espacio flexible que se adapta al contenido
- Preparado para integración con librerías 3D
- Efectos visuales y animaciones CSS

### Responsive Behavior:
- Transiciones suaves entre breakpoints
- Manejo automático de eventos de redimensionamiento
- Optimización para touch devices

## Consideraciones Técnicas

### CSS Grid Layout:
```css
.container {
    display: grid;
    grid-template-areas: 
        "header header"
        "sidebar main";
    grid-template-columns: 300px 1fr;
    grid-template-rows: 80px 1fr;
}
```

### Flexbox para Centrado:
```css
.main-content {
    display: flex;
    align-items: center;
    justify-content: center;
}
```

### Transiciones:
```css
.sidebar {
    transition: transform 0.3s ease;
}
.container {
    transition: grid-template-columns 0.3s ease;
}
```

## Implementación Futura

### Integración 3D:
- Three.js o Babylon.js para renderizado
- WebGL para performance
- Controles de cámara y navegación

### Gestión de Estado:
- Persistencia de configuraciones del sidebar
- Manejo de consentimientos
- Responsive state management

### Performance:
- Lazy loading del contenido 3D
- Optimización para dispositivos móviles
- Fallbacks para navegadores antiguos

## Archivos Generados

1. **wireframe-ui-3d.html** - Wireframe funcional completo
2. **wireframe-specs.md** - Especificaciones técnicas (este archivo)

El wireframe está listo para ser visualizado abriendo el archivo HTML en cualquier navegador y probando la responsividad redimensionando la ventana.
