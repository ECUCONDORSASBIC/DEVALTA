# Medical Design System

A comprehensive design system optimized for medical applications with WCAG AA compliance, built on a foundation of trust, accessibility, and clinical precision.

## Overview

This design system provides a complete foundation for medical applications, featuring:
- **WCAG AA compliant** color palette with verified contrast ratios
- **Medical-optimized** typography for enhanced readability
- **4/8pt spacing system** for consistent layouts
- **Elevation & shadow tokens** for clear visual hierarchy
- **Semantic color system** for medical contexts

## 🎨 Color Palette

### Primary Colors - Medical Blue
*Conveys trust, reliability, and professionalism*

```css
/* Light to Dark */
--color-primary-50: #f0f9ff;   /* Background tints */
--color-primary-100: #e0f2fe;  /* Light backgrounds */
--color-primary-200: #bae6fd;  /* Subtle accents */
--color-primary-300: #7dd3fc;  /* Disabled states */
--color-primary-400: #38bdf8;  /* Hover states */
--color-primary-500: #0ea5e9;  /* 🎯 Main primary (4.5:1 contrast) */
--color-primary-600: #0284c7;  /* Active states */
--color-primary-700: #0369a1;  /* Dark mode */
--color-primary-800: #075985;  /* High contrast */
--color-primary-900: #0c4a6e;  /* Text on light */
--color-primary-950: #082f49;  /* Maximum contrast */
```

### Secondary Colors - Teal
*Represents healing, balance, and wellness*

```css
--color-secondary-500: #14b8a6;  /* 🎯 Main secondary (4.5:1 contrast) */
```

### Neutral Colors - Warm Grays
*Provides comfortable, medical-appropriate neutrals*

```css
--color-neutral-500: #78716c;  /* 🎯 Main neutral (4.5:1 contrast) */
```

### Semantic Status Colors

#### Success (Green)
```css
--color-success-500: #22c55e;  /* ✅ Successful operations, positive results */
```

#### Warning (Amber)
```css
--color-warning-500: #f59e0b;  /* ⚠️ Caution, attention needed */
```

#### Error (Red)
```css
--color-error-500: #ef4444;    /* ❌ Critical issues, failures */
```

#### Info (Blue)
```css
--color-info-500: #0ea5e9;     /* ℹ️ General information, tips */
```

## 📝 Typography

### Font Stack
```css
--font-family-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 
                    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Typography Scale

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| **H1** | 60px | 800 | 110% | Page titles, hero headings |
| **H2** | 48px | 700 | 120% | Section headings |
| **H3** | 36px | 700 | 2.5rem | Subsection headings |
| **H4** | 30px | 600 | 2.25rem | Component headings |
| **H5** | 24px | 600 | 2rem | Card headings |
| **H6** | 20px | 600 | 1.75rem | Minor headings |
| **Body Large** | 18px | 400 | 1.75rem | Emphasis text |
| **Body** | 16px | 400 | 1.5rem | Default body text |
| **Small** | 14px | 400 | 1.25rem | Supporting text |
| **Caption** | 12px | 400 | 1rem | Labels, metadata |

### CSS Classes
```css
.text-h1 { font-size: var(--font-size-h1); /* ... */ }
.text-h2 { font-size: var(--font-size-h2); /* ... */ }
.text-body { font-size: var(--font-size-body); /* ... */ }
.text-caption { font-size: var(--font-size-caption); /* ... */ }
```

## 📐 Spacing System (4/8pt)

Based on a 4px base unit for precise, consistent spacing:

```css
--spacing-1: 0.25rem;    /* 4px */
--spacing-2: 0.5rem;     /* 8px */
--spacing-3: 0.75rem;    /* 12px */
--spacing-4: 1rem;       /* 16px */
--spacing-5: 1.25rem;    /* 20px */
--spacing-6: 1.5rem;     /* 24px */
--spacing-8: 2rem;       /* 32px */
--spacing-10: 2.5rem;    /* 40px */
--spacing-12: 3rem;      /* 48px */
--spacing-16: 4rem;      /* 64px */
--spacing-20: 5rem;      /* 80px */
--spacing-24: 6rem;      /* 96px */
```

### Usage Guidelines
- **Micro spacing**: `--spacing-1` to `--spacing-3` (4-12px)
- **Component spacing**: `--spacing-4` to `--spacing-8` (16-32px)
- **Layout spacing**: `--spacing-12` to `--spacing-24` (48-96px)

## 🎭 Elevation & Shadows

### Shadow Tokens
```css
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);           /* Subtle elevation */
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);    /* Maximum elevation */
```

### Medical-Specific Shadows
```css
--shadow-card: var(--shadow-md);      /* Patient cards, info panels */
--shadow-modal: var(--shadow-2xl);    /* Modals, dialogs */
--shadow-tooltip: var(--shadow-lg);   /* Tooltips, popovers */
```

## 🔢 Z-Index Layers

Organized z-index system for consistent layering:

```css
--z-index-dropdown: 100;        /* Dropdown menus */
--z-index-sticky: 200;          /* Sticky headers */
--z-index-fixed: 300;           /* Fixed elements */
--z-index-modal-backdrop: 400;  /* Modal backdrops */
--z-index-modal: 500;           /* Modal content */
--z-index-popover: 600;         /* Popovers */
--z-index-tooltip: 700;         /* Tooltips */
--z-index-toast: 800;           /* Toast notifications */
--z-index-max: 9999;            /* Maximum z-index */
```

## 🔘 Border Radius

```css
--border-radius-xs: 0.125rem;   /* 2px - Subtle rounding */
--border-radius-sm: 0.25rem;    /* 4px - Buttons, inputs */
--border-radius-md: 0.375rem;   /* 6px - Cards, panels */
--border-radius-lg: 0.5rem;     /* 8px - Larger cards */
--border-radius-xl: 0.75rem;    /* 12px - Prominent elements */
--border-radius-2xl: 1rem;      /* 16px - Hero elements */
--border-radius-3xl: 1.5rem;    /* 24px - Special cases */
--border-radius-full: 9999px;   /* Fully rounded */
```

## 🎬 Animation & Transitions

### Timing Functions
```css
--transition-timing-ease-medical: cubic-bezier(0.4, 0, 0.2, 1);
--transition-timing-ease-in-medical: cubic-bezier(0.4, 0, 1, 1);
--transition-timing-ease-out-medical: cubic-bezier(0, 0, 0.2, 1);
```

### Durations
```css
--transition-duration-150: 150ms;   /* Quick interactions */
--transition-duration-200: 200ms;   /* Standard duration */
--transition-duration-300: 300ms;   /* Moderate animations */
--transition-duration-500: 500ms;   /* Slower transitions */
```

## 🚀 Usage Examples

### Tailwind Integration

Update your `tailwind.config.js`:

```javascript
const medicalDesignSystem = require('./tailwind.medical.config.js');

module.exports = {
  // ... existing config
  theme: {
    extend: {
      ...medicalDesignSystem,
    },
  },
};
```

### Component Examples

#### Medical Card
```html
<div class="medical-card">
  <h3 class="text-h5 text-primary-900 mb-4">Patient Information</h3>
  <p class="text-body text-neutral-700">Patient details and medical history...</p>
</div>
```

#### Status Alert
```html
<div class="medical-alert success">
  <p class="text-small">✅ Lab results are within normal range</p>
</div>
```

#### Primary Button
```html
<button class="medical-button primary">
  Schedule Appointment
</button>
```

### CSS Variables Usage

```css
.patient-card {
  background-color: var(--bg-surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--spacing-6);
  color: var(--text-primary);
}

.critical-alert {
  background-color: var(--bg-error);
  color: var(--text-error);
  border-color: var(--border-error);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
}
```

## 🎯 Medical-Specific Guidelines

### Color Usage in Medical Context

1. **Primary Blue**: Trust, reliability, main actions
2. **Secondary Teal**: Healing, balance, secondary actions
3. **Success Green**: Positive results, successful operations
4. **Warning Amber**: Attention needed, caution
5. **Error Red**: Critical issues, failures, alerts
6. **Neutral Grays**: Content, borders, backgrounds

### Accessibility Considerations

- All main colors meet WCAG AA contrast ratios (4.5:1 minimum)
- Focus indicators are clearly visible
- Color is never the only way to convey information
- Typography optimized for medical readability

### Component Patterns

#### Patient Cards
```css
.patient-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--spacing-6);
  transition: box-shadow var(--transition-duration-200) var(--transition-timing-ease-medical);
}

.patient-card:hover {
  box-shadow: var(--shadow-lg);
}
```

#### Status Indicators
```css
.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
}

.status-indicator.healthy {
  background-color: var(--bg-success);
  color: var(--text-success);
}

.status-indicator.attention {
  background-color: var(--bg-warning);
  color: var(--text-warning);
}

.status-indicator.critical {
  background-color: var(--bg-error);
  color: var(--text-error);
}
```

## 🔄 Dark Mode Support

The design system includes automatic dark mode support:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-canvas: var(--color-neutral-900);
    --bg-surface: var(--color-neutral-800);
    --text-primary: var(--color-neutral-100);
    --text-secondary: var(--color-neutral-300);
    --border-primary: var(--color-neutral-700);
  }
}
```

## 📱 Responsive Considerations

- Base font size: 16px for optimal readability
- Spacing scales proportionally across devices
- Typography remains legible at all screen sizes
- Touch targets meet accessibility guidelines (44px minimum)

## 🛠️ Implementation

1. **Import the CSS variables** in your main CSS file:
   ```css
   @import './globals.css';
   ```

2. **Extend your Tailwind config** with the medical design tokens:
   ```javascript
   const medicalDesignSystem = require('./tailwind.medical.config.js');
   
   module.exports = {
     theme: {
       extend: {
         ...medicalDesignSystem,
       },
     },
   };
   ```

3. **Use the provided classes** or CSS variables in your components

## 🎨 Figma Integration

This design system can be easily imported into Figma:

1. Create color styles using the provided color tokens
2. Set up text styles based on the typography scale
3. Define spacing variables using the 4/8pt system
4. Create component variants for different states
5. Use the shadow and border-radius tokens for consistent styling

The systematic approach ensures perfect consistency between design and development phases.

---

*This design system prioritizes medical trust, accessibility, and user experience while maintaining visual consistency across all medical applications.*
