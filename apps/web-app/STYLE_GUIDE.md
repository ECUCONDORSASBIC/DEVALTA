# 🎨 Guía de Estilos - DevAltaMedica

## 📋 Tabla de Contenidos

- [🎯 Principios de Diseño](#-principios-de-diseño)
- [🔧 Configuración del Desarrollo](#-configuración-del-desarrollo)
- [📐 Sistema Tipográfico](#-sistema-tipográfico)
- [🎨 Paleta de Colores](#-paleta-de-colores)
- [📏 Espaciado y Grid](#-espaciado-y-grid)
- [🧩 Componentes UI](#-componentes-ui)
- [📱 Responsive Design](#-responsive-design)
- [♿ Accesibilidad](#-accesibilidad)
- [⚡ Convenciones de Código](#-convenciones-de-código)
- [📦 Organización de Archivos](#-organización-de-archivos)
- [🧪 Testing Patterns](#-testing-patterns)
- [🚀 Performance](#-performance)

## 🎯 Principios de Diseño

### 1. **Consistencia Visual**
- Utilizar sistema de design tokens (variables CSS)
- Mantener jerarquía tipográfica clara
- Aplicar espaciado consistente basado en escala 8pt

### 2. **Accesibilidad Primero**
- Cumplir WCAG 2.1 AA mínimo
- Contraste de color mínimo 4.5:1
- Navegación por teclado completa
- Etiquetas semánticas correctas

### 3. **Mobile First**
- Diseño responsive desde móvil hacia desktop
- Breakpoints estandarizados
- Componentes adaptables

### 4. **Performance**
- Optimización de assets
- Lazy loading de componentes
- Minimización de bundle size

## 🔧 Configuración del Desarrollo

### Editor Setup

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### ESLint Rules

```javascript
// eslint.config.mjs
export default [
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off"
    }
  }
];
```

## 📐 Sistema Tipográfico

### Escala de Fuentes

```css
/* Variables CSS - src/app/globals.css */
:root {
  --font-size-xs: 0.75rem;     /* 12px */
  --font-size-sm: 0.875rem;    /* 14px */
  --font-size-base: 1rem;      /* 16px */
  --font-size-lg: 1.125rem;    /* 18px */
  --font-size-xl: 1.25rem;     /* 20px */
  --font-size-2xl: 1.5rem;     /* 24px */
  --font-size-3xl: 1.875rem;   /* 30px */
  --font-size-4xl: 2.25rem;    /* 36px */
  --font-size-5xl: 3rem;       /* 48px */
  --font-size-6xl: 3.75rem;    /* 60px */
}
```

### Jerarquía de Encabezados

```css
/* Aplicación */
h1 { font-size: var(--font-size-4xl); font-weight: 800; }
h2 { font-size: var(--font-size-3xl); font-weight: 700; }
h3 { font-size: var(--font-size-2xl); font-weight: 600; }
h4 { font-size: var(--font-size-xl); font-weight: 600; }
h5 { font-size: var(--font-size-lg); font-weight: 600; }
h6 { font-size: var(--font-size-base); font-weight: 600; }
```

### Uso en Componentes

```typescript
// ❌ Incorrecto - tamaños hardcodeados
const Title = styled.h1`
  font-size: 36px;
  font-weight: bold;
`;

// ✅ Correcto - usando variables CSS
const Title = styled.h1`
  font-size: var(--font-size-4xl);
  font-weight: 800;
`;

// ✅ Correcto - usando clases Tailwind
<h1 className="text-4xl font-extrabold">Título Principal</h1>
```

## 🎨 Paleta de Colores

### Colores Primarios

```css
:root {
  /* Azul - Color primario */
  --color-primary-50: #f0f9ff;
  --color-primary-100: #e0f2fe;
  --color-primary-200: #bae6fd;
  --color-primary-300: #7dd3fc;
  --color-primary-400: #38bdf8;
  --color-primary-500: #0ea5e9;
  --color-primary-600: #0284c7;  /* Principal */
  --color-primary-700: #0369a1;
  --color-primary-800: #075985;
  --color-primary-900: #0c4a6e;
}
```

### Colores de Estado

```css
:root {
  --color-success: #10b981;  /* Verde */
  --color-warning: #f59e0b;  /* Amarillo */
  --color-error: #ef4444;    /* Rojo */
  --color-info: #3b82f6;     /* Azul info */
}
```

### Escala de Grises

```css
:root {
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
}
```

### Ratios de Contraste

```css
/* Validación de contraste */
:root {
  --contrast-ratio-min: 4.5;      /* WCAG AA */
  --contrast-ratio-enhanced: 7;    /* WCAG AAA */
}
```

## 📏 Espaciado y Grid

### Sistema de Espaciado (8pt)

```css
:root {
  --space-1: 0.5rem;   /* 8px */
  --space-2: 1rem;     /* 16px */
  --space-3: 1.5rem;   /* 24px */
  --space-4: 2rem;     /* 32px */
  --space-5: 2.5rem;   /* 40px */
  --space-6: 3rem;     /* 48px */
  --space-8: 4rem;     /* 64px */
  --space-10: 5rem;    /* 80px */
  --space-12: 6rem;    /* 96px */
}
```

### Aplicación de Espaciado

```css
/* ❌ Incorrecto */
.component {
  margin: 15px;
  padding: 25px;
}

/* ✅ Correcto */
.component {
  margin: var(--space-2);
  padding: var(--space-3);
}
```

### Grid System

```css
/* Container principal */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-3);
}

/* Grid responsive */
.grid {
  display: grid;
  gap: var(--space-3);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}
```

## 🧩 Componentes UI

### Botones

```css
/* Botón primario */
.btn-primary {
  background-color: var(--color-primary-600);
  color: white;
  padding: var(--space-1) var(--space-2);
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--color-primary-700);
}

.btn-primary:focus {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

### Formularios

```css
/* Campo de entrada */
.input-field {
  width: 100%;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-gray-300);
  border-radius: 0.375rem;
  font-size: var(--font-size-base);
  transition: border-color 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary-500);
  ring: 2px solid var(--color-primary-500);
}

/* Etiqueta */
.label {
  display: block;
  font-weight: 500;
  margin-bottom: var(--space-1);
  color: var(--color-gray-700);
}
```

### Tarjetas

```css
.card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--color-gray-200);
  padding: var(--space-3);
}

.card-header {
  margin-bottom: var(--space-2);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-gray-200);
}
```

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile first approach */
:root {
  --breakpoint-sm: 480px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}

/* Media queries */
@media (min-width: 480px) { /* Móvil grande */ }
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1280px) { /* Desktop grande */ }
```

### Componentes Responsivos

```typescript
// Hook para detectar tamaño de pantalla
const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('sm');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) setBreakpoint('lg');
      else if (width >= 768) setBreakpoint('md');
      else setBreakpoint('sm');
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return breakpoint;
};

// Uso en componente
const MyComponent = () => {
  const breakpoint = useBreakpoint();
  
  return (
    <div className={`grid ${
      breakpoint === 'lg' ? 'grid-cols-3' : 
      breakpoint === 'md' ? 'grid-cols-2' : 
      'grid-cols-1'
    }`}>
      {/* Contenido */}
    </div>
  );
};
```

## ♿ Accesibilidad

### Semántica HTML

```typescript
// ❌ Incorrecto - div sin semántica
<div onClick={handleClick}>Botón</div>

// ✅ Correcto - botón semántico
<button onClick={handleClick} type="button">
  Botón
</button>

// ✅ Correcto - navegación
<nav aria-label="Navegación principal">
  <ul>
    <li><a href="/home">Inicio</a></li>
    <li><a href="/about">Acerca de</a></li>
  </ul>
</nav>
```

### ARIA Labels

```typescript
// Formularios
<label htmlFor="email">Email</label>
<input 
  id="email" 
  type="email" 
  required 
  aria-describedby="email-error"
/>
<div id="email-error" role="alert">
  {emailError}
</div>

// Botones con íconos
<button aria-label="Cerrar diálogo">
  <CloseIcon />
</button>

// Estados dinámicos
<div 
  role="alert" 
  aria-live="polite"
  aria-atomic="true"
>
  {statusMessage}
</div>
```

### Foco y Navegación

```css
/* Indicador de foco visible */
.focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--color-primary-600);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
}

.skip-link:focus {
  top: 6px;
}
```

## ⚡ Convenciones de Código

### TypeScript

```typescript
// Interfaces con prefijo I
interface IUser {
  id: string;
  name: string;
  email: string;
}

// Types con sufijo Type
type ButtonVariant = 'primary' | 'secondary' | 'danger';

// Enums en PascalCase
enum UserRole {
  Admin = 'admin',
  Doctor = 'doctor',
  Patient = 'patient'
}

// Props con sufijo Props
interface ButtonProps {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}
```

### Componentes React

```typescript
// Estructura de componente
interface ComponentProps {
  // Props aquí
}

const Component: React.FC<ComponentProps> = ({ 
  prop1, 
  prop2, 
  ...props 
}) => {
  // Hooks primero
  const [state, setState] = useState(initialValue);
  const customHook = useCustomHook();
  
  // Funciones después
  const handleClick = useCallback(() => {
    // Lógica aquí
  }, [dependencies]);
  
  // Early returns
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage />;
  
  // Render principal
  return (
    <div className="component-class">
      {/* JSX aquí */}
    </div>
  );
};

export default Component;
```

### Hooks Personalizados

```typescript
// Prefix use + PascalCase
const useApiData = <T>(url: string): {
  data: T | null;
  loading: boolean;
  error: string | null;
} => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Lógica de fetch
  }, [url]);
  
  return { data, loading, error };
};
```

### Stores (Zustand)

```typescript
interface StoreState {
  user: IUser | null;
  isAuthenticated: boolean;
  actions: {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    updateUser: (user: Partial<IUser>) => void;
  };
}

const useAuthStore = create<StoreState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  actions: {
    login: async (credentials) => {
      try {
        const user = await authService.login(credentials);
        set({ user, isAuthenticated: true });
      } catch (error) {
        // Manejar error
      }
    },
    logout: () => {
      set({ user: null, isAuthenticated: false });
    },
    updateUser: (userData) => {
      const currentUser = get().user;
      if (currentUser) {
        set({ user: { ...currentUser, ...userData } });
      }
    },
  },
}));
```

## 📦 Organización de Archivos

### Estructura de Carpetas

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Grupos de rutas
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout raíz
│   └── page.tsx          # Página principal
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes UI básicos
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   └── index.ts      # Barrel exports
│   ├── forms/            # Componentes de formularios
│   ├── layout/           # Componentes de layout
│   └── index.ts          # Barrel exports
├── lib/                  # Lógica de negocio
│   ├── api/              # Cliente API
│   ├── auth/             # Autenticación
│   ├── utils/            # Utilidades
│   ├── stores/           # Stores de estado
│   ├── types/            # Tipos TypeScript
│   └── constants/        # Constantes
├── hooks/                # Hooks personalizados
└── styles/               # Estilos adicionales
```

### Convenciones de Nombres

```typescript
// Archivos y carpetas
// PascalCase para componentes
Button.tsx
UserProfile.tsx

// camelCase para hooks, utils, stores
useAuth.ts
apiClient.ts
authStore.ts

// kebab-case para páginas y rutas
user-profile/
forgot-password/

// SCREAMING_SNAKE_CASE para constantes
API_ENDPOINTS.ts
VALIDATION_RULES.ts
```

### Imports y Exports

```typescript
// Imports ordenados
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';

import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { ApiClient } from '@/lib/api';

import styles from './Component.module.css';

// Barrel exports
// components/ui/index.ts
export { Button } from './Button';
export { Input } from './Input';
export { Card } from './Card';

// Named exports preferidos
export const Component = () => {
  // ...
};

// Default export solo para páginas
const Page: NextPage = () => {
  // ...
};

export default Page;
```

## 🧪 Testing Patterns

### Componentes

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant styles', () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText('Primary')).toHaveClass('btn-primary');
  });
});
```

### Hooks

```typescript
// useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('initializes with not authenticated state', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('updates state after login', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password'
      });
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });
});
```

### E2E con Cypress

```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication Flow', () => {
  it('should login successfully', () => {
    cy.visit('/login');
    
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password');
    cy.get('[data-testid="login-button"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });
});
```

## 🚀 Performance

### Optimización de Componentes

```typescript
// Memoización de componentes
const ExpensiveComponent = React.memo<Props>(({ data }) => {
  return (
    <div>
      {/* Renderizado costoso */}
    </div>
  );
});

// useMemo para cálculos costosos
const Component = ({ items }) => {
  const expensiveValue = useMemo(() => {
    return items.reduce((acc, item) => acc + item.value, 0);
  }, [items]);
  
  return <div>{expensiveValue}</div>;
};

// useCallback para funciones
const Parent = () => {
  const handleClick = useCallback((id: string) => {
    // Lógica aquí
  }, []);
  
  return (
    <Child onClick={handleClick} />
  );
};
```

### Lazy Loading

```typescript
// Lazy loading de componentes
const LazyComponent = lazy(() => import('./LazyComponent'));

const App = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
};

// Lazy loading de rutas
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
```

### Optimización de Assets

```typescript
// Imágenes optimizadas
import Image from 'next/image';

const MyComponent = () => (
  <Image
    src="/hero-image.jpg"
    alt="Descripción de la imagen"
    width={800}
    height={600}
    priority // Para above-the-fold
    placeholder="blur" // Para UX mejorada
  />
);

// Iconos como componentes
import { HeartIcon } from '@heroicons/react/24/outline';

const IconButton = () => (
  <button>
    <HeartIcon className="w-5 h-5" />
  </button>
);
```

---

## 📝 Conclusión

Esta guía de estilos debe ser seguida por todos los desarrolladores del equipo para mantener consistencia y calidad en el código. Se recomienda revisarla periódicamente y actualizarla según las necesidades del proyecto.

### Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Guía de Tailwind CSS](https://tailwindcss.com/docs)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

**Última actualización:** Julio 2025
**Versión:** 1.0
