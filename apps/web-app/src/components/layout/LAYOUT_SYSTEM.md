# Layout System Documentation

## Overview

The ALTAMEDICA layout system provides a comprehensive set of components for building responsive, accessible, and consistent user interfaces. The system includes:

- **Container**: Responsive max-width container with padding controls
- **Section**: Semantic wrapper with background and padding options
- **Layout**: Complete page layout with header, main, and footer
- **Header**: Application header with navigation and branding
- **Footer**: Application footer with status information

## Components

### Container

A responsive container with configurable max-width and padding.

```tsx
import { Container } from '@/components/layout'

<Container 
  size="xl"           // sm, md, lg, xl, 2xl, full
  padding="md"        // none, sm, md, lg
  centerContent       // boolean - centers content flexbox
  className="custom"  // additional classes
>
  <div>Content here</div>
</Container>
```

**Size Options:**
- `sm`: 640px max-width
- `md`: 768px max-width
- `lg`: 1024px max-width
- `xl`: 1280px max-width (default)
- `2xl`: 1536px max-width
- `full`: No max-width constraint

### Section

A semantic wrapper for page sections with background and padding control.

```tsx
import { Section } from '@/components/layout'

<Section
  background="gradient"  // none, white, gray, primary, gradient
  padding="lg"          // none, sm, md, lg, xl
  as="section"          // section, div, article, aside, main
  id="hero-section"     // for anchor links
  className="custom"    // additional classes
>
  <div>Section content</div>
</Section>
```

**Background Options:**
- `none`: No background (default)
- `white`: White background
- `gray`: Light gray background
- `primary`: Primary color light background
- `gradient`: Gradient from primary to blue

**Padding Options:**
- `none`: No padding
- `sm`: Small padding (py-8 sm:py-12)
- `md`: Medium padding (py-12 sm:py-16) - default
- `lg`: Large padding (py-16 sm:py-20)
- `xl`: Extra large padding (py-20 sm:py-24)

### Layout

Complete page layout with header, main content area, and footer.

```tsx
import { Layout } from '@/components/layout'

<Layout
  headerProps={{
    title: "ALTAMEDICA",
    subtitle: "Portal Médico Inteligente",
    showMenuToggle: true,
    onMenuToggle: () => console.log('Menu toggled')
  }}
  showHeader={true}      // boolean - show/hide header
  showFooter={true}      // boolean - show/hide footer
  containerSize="xl"     // container size for main content
  mainClassName="custom" // additional classes for main element
>
  <div>Page content</div>
</Layout>
```

### Header

Application header with branding and navigation.

```tsx
import { Header } from '@/components/layout'

<Header
  title="ALTAMEDICA"
  subtitle="Portal Médico Inteligente"
  showMenuToggle={true}
  onMenuToggle={() => {}}
  className="custom"
/>
```

### Footer

Application footer with branding and status information.

```tsx
import { Footer } from '@/components/layout'

<Footer className="custom" />
```

## Z-Index System

The layout system uses a consistent z-index hierarchy:

- **Base**: 0 (default content)
- **Content**: 10 (main content areas)
- **Sticky**: 50 (sticky elements)
- **Header**: 100 (site header)
- **Sidebar**: 110 (navigation sidebar)
- **Dropdown**: 150 (dropdown menus)
- **Overlay**: 200 (modal overlays)
- **Modal**: 300 (modal dialogs)
- **Popover**: 400 (popover elements)
- **Tooltip**: 500 (tooltip elements)
- **Notification**: 600 (notification toasts)

Use the utility classes:
```css
.z-header { z-index: var(--z-index-header); }
.z-modal { z-index: var(--z-index-modal); }
/* etc. */
```

## Layout Utilities

### CSS Grid Layout
```css
.layout-grid {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
```

### Flexbox Layout
```css
.layout-flex {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
```

### Component Classes
- `.layout-header`: Header styling with z-index and sticky positioning
- `.layout-main`: Main content area with flex-grow
- `.layout-footer`: Footer styling with z-index

## Accessibility Features

### Skip Link
The root layout includes a skip-to-content link for screen readers:
```tsx
<a href="#main-content" className="skip-link">
  Saltar al contenido principal
</a>
```

### Semantic HTML
- Use proper semantic elements (`<header>`, `<main>`, `<footer>`, `<section>`)
- Include proper ARIA labels and roles
- Ensure proper heading hierarchy

### Smooth Scrolling
Smooth scrolling is enabled by default with support for reduced motion:
```css
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

## Example Usage

```tsx
import { Layout, Section, Container } from '@/components/layout'

export default function HomePage() {
  return (
    <Layout
      headerProps={{
        title: "ALTAMEDICA",
        subtitle: "Portal Médico Inteligente"
      }}
    >
      {/* Hero Section */}
      <Section background="gradient" padding="xl" id="hero">
        <Container size="lg" centerContent>
          <h1>Welcome to ALTAMEDICA</h1>
          <p>Advanced medical platform with AI technology</p>
        </Container>
      </Section>

      {/* Features Section */}
      <Section background="white" padding="lg" id="features">
        <Container size="xl">
          <h2>Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature cards */}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section background="primary" padding="md" id="cta">
        <Container size="md" centerContent>
          <h2>Ready to get started?</h2>
          <button className="btn-primary">Get Started</button>
        </Container>
      </Section>
    </Layout>
  )
}
```

## Best Practices

1. **Use semantic HTML**: Always use appropriate HTML5 semantic elements
2. **Consistent spacing**: Use the predefined spacing scale in CSS variables
3. **Responsive design**: Test layouts across different screen sizes
4. **Accessibility**: Include proper ARIA labels and keyboard navigation
5. **Z-index management**: Use the predefined z-index scale for layering
6. **Performance**: Use CSS Grid/Flexbox for layout instead of positioning
7. **Content hierarchy**: Maintain proper heading hierarchy (h1 → h2 → h3)

## CSS Variables

The system uses CSS custom properties for consistent theming:

```css
:root {
  /* Z-index scale */
  --z-index-header: 100;
  --z-index-modal: 300;
  
  /* Spacing scale */
  --space-1: 0.5rem;
  --space-2: 1rem;
  
  /* Colors */
  --color-primary-600: #0284c7;
  --color-gray-50: #f9fafb;
}
```
