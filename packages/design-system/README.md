# Design System Altamedica

Sistema de diseño compartido para microservicios de Altamedica con azul celeste consistente y diseño responsive.

## 🎨 Características

- **Azul celeste consistente** (#0EA5E9) como color principal
- **Diseño responsive** para todos los dispositivos
- **Componentes reutilizables** para todos los microservicios
- **Tema unificado** con Tailwind CSS
- **Tipografía médica** optimizada
- **Accesibilidad** integrada

## 🚀 Instalación

```bash
# Instalar en el proyecto raíz
pnpm add @altamedica/design-system

# O instalar en un microservicio específico
cd apps/web-app && pnpm add @altamedica/design-system
```

## 📦 Uso

### Importar estilos globales

```css
/* En tu archivo CSS principal */
@import '@altamedica/design-system/styles';
```

### Usar componentes

```tsx
import { 
  AltamedicaButton, 
  AltamedicaCard, 
  AltamedicaLayout,
  MedicalHeader,
  MedicalSidebar,
  MedicalFooter 
} from '@altamedica/design-system';

function App() {
  return (
    <AltamedicaLayout variant="dashboard">
      <MedicalHeader 
        title="Dashboard Médico"
        subtitle="Gestión de pacientes y citas"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AltamedicaCard variant="elevated">
          <h3>Pacientes Activos</h3>
          <p className="text-2xl font-bold text-sky-600">1,234</p>
        </AltamedicaCard>
      </div>
    </AltamedicaLayout>
  );
}
```

### Usar tema y utilidades

```tsx
import { ALTAMEDICA_COLORS, designUtils } from '@altamedica/design-system';

// Obtener color primario
const primaryColor = designUtils.getPrimaryColor(); // '#0ea5e9'

// Obtener gradiente
const gradient = designUtils.getPrimaryGradient();

// Generar clases responsive
const responsiveClasses = designUtils.getResponsiveClasses(
  'text-lg',
  { 'md': 'text-xl', 'lg': 'text-2xl' }
);
```

## 🎯 Componentes Disponibles

### AltamedicaButton

Botón con variantes y estados.

```tsx
<AltamedicaButton 
  variant="primary" 
  size="lg"
  onClick={() => console.log('Click!')}
>
  Guardar Cambios
</AltamedicaButton>
```

**Variantes:** `primary`, `secondary`, `outline`, `ghost`, `danger`
**Tamaños:** `xs`, `sm`, `md`, `lg`, `xl`

### AltamedicaCard

Tarjeta con múltiples variantes.

```tsx
<AltamedicaCard 
  variant="elevated" 
  hover 
  header={<h3>Información del Paciente</h3>}
>
  <p>Contenido de la tarjeta</p>
</AltamedicaCard>
```

**Variantes:** `default`, `elevated`, `outlined`, `gradient`

### AltamedicaLayout

Layout principal con sidebar y header.

```tsx
<AltamedicaLayout 
  variant="dashboard"
  sidebar={<MedicalSidebar menuItems={menuItems} />}
  header={<MedicalHeader title="Dashboard" />}
>
  <div>Contenido principal</div>
</AltamedicaLayout>
```

**Variantes:** `default`, `dashboard`, `auth`, `medical`

### MedicalStatsCard

Tarjeta especializada para estadísticas médicas.

```tsx
<MedicalStatsCard
  title="Pacientes Nuevos"
  value="45"
  change="+12%"
  trend="up"
  color="heart"
/>
```

### PatientCard

Tarjeta especializada para información de pacientes.

```tsx
<PatientCard
  patient={{
    id: "1",
    name: "Juan Pérez",
    age: 35,
    gender: "Masculino",
    status: "active"
  }}
  onClick={() => navigate('/patient/1')}
/>
```

## 🎨 Clases CSS Personalizadas

### Clases de utilidad

```css
.altamedica-bg      /* Fondo con gradiente suave */
.altamedica-text    /* Texto en azul celeste */
.altamedica-border  /* Borde en azul celeste */
.altamedica-shadow  /* Sombra personalizada */
.altamedica-gradient /* Gradiente principal */
```

### Clases de componentes

```css
.altamedica-card        /* Estilo base de tarjeta */
.altamedica-card-hover  /* Efecto hover de tarjeta */
.altamedica-button      /* Estilo base de botón */
.altamedica-input       /* Estilo base de input */
```

## 📱 Diseño Responsive

El design system incluye breakpoints optimizados:

- **xs:** 320px (móviles pequeños)
- **sm:** 640px (móviles)
- **md:** 768px (tablets)
- **lg:** 1024px (laptops)
- **xl:** 1280px (desktops)
- **2xl:** 1536px (pantallas grandes)

## 🎨 Paleta de Colores

### Colores Principales

```css
/* Azul celeste principal */
--altamedica-primary: #0ea5e9
--altamedica-primary-light: #38bdf8
--altamedica-primary-dark: #0284c7

/* Azul complementario */
--altamedica-secondary: #3b82f6
--altamedica-accent: #06b6d4
```

### Colores Médicos

```css
.medical-blood  /* #dc2626 - Sangre */
.medical-heart  /* #ef4444 - Corazón */
.medical-brain  /* #8b5cf6 - Cerebro */
.medical-lung   /* #06b6d4 - Pulmón */
.medical-bone   /* #f59e0b - Hueso */
.medical-skin   /* #fbbf24 - Piel */
```

## 🔧 Configuración de Tailwind

Para usar el tema en tu proyecto:

```js
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/design-system/src/**/*.{js,ts,jsx,tsx}"
  ],
  presets: [
    require('@altamedica/design-system/tailwind')
  ]
}
```

## 📋 Microservicios Compatibles

- ✅ **web-app** - Aplicación web principal
- ✅ **doctores** - Portal de doctores
- ✅ **pacientes** - Portal de pacientes
- ✅ **companies** - Portal de empresas
- ✅ **admin** - Panel de administración
- ✅ **medical** - Servicios médicos

## 🚀 Desarrollo

```bash
# Instalar dependencias
pnpm install

# Desarrollo con watch
pnpm dev

# Construir
pnpm build

# Verificar tipos
pnpm type-check

# Linting
pnpm lint
```

## 📚 Ejemplos de Uso

### Dashboard Médico

```tsx
import { 
  AltamedicaLayout, 
  MedicalHeader, 
  MedicalStatsCard,
  AltamedicaCard 
} from '@altamedica/design-system';

function MedicalDashboard() {
  return (
    <AltamedicaLayout variant="dashboard">
      <MedicalHeader 
        title="Dashboard Médico"
        subtitle="Resumen de actividades"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MedicalStatsCard
          title="Pacientes Activos"
          value="1,234"
          change="+5%"
          trend="up"
          color="heart"
        />
        <MedicalStatsCard
          title="Citas Hoy"
          value="45"
          change="-2%"
          trend="down"
          color="brain"
        />
        <MedicalStatsCard
          title="Ingresos"
          value="12"
          change="+8%"
          trend="up"
          color="blood"
        />
        <MedicalStatsCard
          title="Altas"
          value="8"
          change="+15%"
          trend="up"
          color="success"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AltamedicaCard variant="elevated">
          <h3 className="text-xl font-semibold mb-4">Últimas Citas</h3>
          {/* Lista de citas */}
        </AltamedicaCard>
        
        <AltamedicaCard variant="elevated">
          <h3 className="text-xl font-semibold mb-4">Pacientes Críticos</h3>
          {/* Lista de pacientes */}
        </AltamedicaCard>
      </div>
    </AltamedicaLayout>
  );
}
```

### Formulario de Paciente

```tsx
import { AltamedicaButton, AltamedicaCard } from '@altamedica/design-system';

function PatientForm() {
  return (
    <AltamedicaCard variant="outlined" className="max-w-2xl mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Información del Paciente
        </h2>
        
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Nombre</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="Nombre completo"
              />
            </div>
            <div>
              <label className="form-label">Edad</label>
              <input 
                type="number" 
                className="form-input"
                placeholder="Edad"
              />
            </div>
          </div>
          
          <div>
            <label className="form-label">Diagnóstico</label>
            <textarea 
              className="form-input"
              rows={4}
              placeholder="Descripción del diagnóstico"
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <AltamedicaButton variant="outline">
              Cancelar
            </AltamedicaButton>
            <AltamedicaButton variant="primary">
              Guardar Paciente
            </AltamedicaButton>
          </div>
        </form>
      </div>
    </AltamedicaCard>
  );
}
```

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas sobre el design system:

- 📧 Email: design-system@altamedica.com
- 💬 Slack: #design-system
- 📖 Documentación: [docs.altamedica.com/design-system](https://docs.altamedica.com/design-system)

---

**Desarrollado con ❤️ por el equipo de Altamedica**