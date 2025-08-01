# Layout Responsivo con CSS Grid

Este layout implementa un sistema responsivo con CSS Grid que incluye los contenedores principales: `header`, `sidebar`, `main-canvas`, y `footer`.

## Características

### ✅ CSS Grid con grid-template-areas
- **Desktop**: Layout de 2 columnas (`sidebar` | `main-canvas`)
- **Mobile**: Layout de 1 columna (sidebar como overlay)
- **Sin solapamiento**: Cada área tiene su espacio definido

### ✅ Overflow-y: auto en listas largas
- **Sidebar**: Scroll automático cuando el contenido excede la altura
- **Listas de consentimientos**: Máximo 240px de altura con scroll
- **Herramientas 3D**: Máximo 192px de altura con scroll

### ✅ Z-index apropiado
- **Header**: z-index: 1000 (máxima prioridad)
- **Sidebar**: z-index: 999 (segunda prioridad)
- **Canvas 3D**: z-index: 1 (fondo, detrás de otros elementos)
- **Overlays**: z-index: 2-20 (flotan sobre el canvas)

## Componentes

### ResponsiveLayout
Contenedor principal que implementa el CSS Grid:

```tsx
import { ResponsiveLayout } from '@/components/layout'

<ResponsiveLayout showSidebar={true} showFooter={true}>
  {/* Tu contenido 3D aquí */}
</ResponsiveLayout>
```

### Header
Barra superior con título y controles:

```tsx
<Header 
  title="Mi Aplicación 3D"
  subtitle="Descripción opcional"
  onMenuToggle={toggleSidebar}
  showMenuToggle={isMobile}
/>
```

### Sidebar
Panel lateral con scroll automático:

```tsx
<Sidebar
  isOpen={isSidebarOpen}
  isCollapsed={isSidebarCollapsed}
  onClose={closeSidebar}
  onToggle={toggleSidebar}
  isMobile={isMobile}
/>
```

### Footer
Pie de página con información de estado:

```tsx
<Footer />
```

## Breakpoints Responsivos

| Pantalla | Ancho | Comportamiento |
|----------|-------|---------------|
| Desktop | > 1024px | Sidebar fijo de 300px |
| Tablet | 768px - 1024px | Sidebar fijo de 250px |
| Mobile | < 768px | Sidebar como overlay |
| Mobile pequeño | < 480px | Ajustes adicionales |

## Grid Template Areas

### Desktop/Tablet
```css
grid-template-areas: 
  "header header"
  "sidebar main-canvas"
  "footer footer";
```

### Mobile
```css
grid-template-areas: 
  "header"
  "main-canvas"
  "footer";
```

## Uso con Canvas 3D

El layout está optimizado para trabajar con canvas 3D:

```tsx
<ResponsiveLayout>
  <div className="w-full h-full relative">
    {/* Canvas 3D con z-index bajo */}
    <div className="z-10">
      <Canvas>
        {/* Tu escena 3D */}
      </Canvas>
    </div>
    
    {/* Controles que flotan sobre el canvas */}
    <div className="absolute top-4 right-4 z-20">
      {/* Controles */}
    </div>
  </div>
</ResponsiveLayout>
```

## Personalización

### CSS Variables
Puedes personalizar el layout mediante CSS custom properties:

```css
:root {
  --sidebar-width: 300px;
  --header-height: 80px;
  --footer-height: 60px;
}
```

### Clases CSS
- `.scrollableList`: Para listas con scroll automático
- `.canvas3D`: Para elementos de canvas 3D
- `.canvasOverlay`: Para elementos que flotan sobre el canvas
- `.noOverlap`: Para garantizar que no haya solapamiento

## Accesibilidad

- **Navegación por teclado**: Soporte completo
- **ARIA labels**: En botones y controles
- **Reducción de movimiento**: Respeta `prefers-reduced-motion`
- **Alto contraste**: Soporte para `prefers-contrast`

## Ejemplo Completo

```tsx
import { ResponsiveLayout } from '@/components/layout'
import { Canvas } from '@react-three/fiber'

export default function MyApp() {
  return (
    <ResponsiveLayout>
      <div className="w-full h-full relative">
        <Canvas className="z-10">
          {/* Tu escena 3D */}
        </Canvas>
        
        {/* Controles floating */}
        <div className="absolute top-4 right-4 z-20 bg-white/90 rounded-lg p-4">
          <button>Control 1</button>
          <button>Control 2</button>
        </div>
      </div>
    </ResponsiveLayout>
  )
}
```
