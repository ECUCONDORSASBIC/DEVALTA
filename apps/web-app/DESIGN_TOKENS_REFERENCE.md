# Medical Design System - Quick Reference

## 🎨 Color Tokens

### Primary Actions
```css
bg-primary-500    /* Main primary button */
text-primary-900  /* Primary text on light backgrounds */
border-primary-200 /* Subtle borders */
```

### Status Colors
```css
bg-success-500    /* Success states */
bg-warning-500    /* Warning states */
bg-error-500      /* Error states */
bg-info-500       /* Info states */
```

### Backgrounds
```css
bg-canvas         /* Main page background */
bg-surface        /* Card/panel backgrounds */
bg-surface-secondary /* Secondary backgrounds */
```

## 📝 Typography Classes

```css
.text-h1          /* 60px, 800 weight - Hero headings */
.text-h2          /* 48px, 700 weight - Section headings */
.text-h3          /* 36px, 700 weight - Subsection headings */
.text-h4          /* 30px, 600 weight - Component headings */
.text-h5          /* 24px, 600 weight - Card headings */
.text-h6          /* 20px, 600 weight - Minor headings */
.text-body        /* 16px, 400 weight - Default body text */
.text-body-lg     /* 18px, 400 weight - Emphasis text */
.text-small       /* 14px, 400 weight - Supporting text */
.text-caption     /* 12px, 400 weight - Labels, metadata */
```

## 📐 Spacing (4/8pt System)

```css
p-1   /* 4px padding */
p-2   /* 8px padding */
p-4   /* 16px padding */
p-6   /* 24px padding */
p-8   /* 32px padding */
p-12  /* 48px padding */

m-1   /* 4px margin */
m-2   /* 8px margin */
m-4   /* 16px margin */
m-6   /* 24px margin */
m-8   /* 32px margin */
m-12  /* 48px margin */

gap-2 /* 8px gap */
gap-4 /* 16px gap */
gap-6 /* 24px gap */
```

## 🎭 Elevation

```css
shadow-xs         /* Subtle elevation */
shadow-sm         /* Small elevation */
shadow-md         /* Medium elevation (cards) */
shadow-lg         /* Large elevation (modals) */
shadow-xl         /* Extra large elevation */
shadow-2xl        /* Maximum elevation */
```

## 🔘 Border Radius

```css
rounded-xs        /* 2px - Subtle rounding */
rounded-sm        /* 4px - Buttons, inputs */
rounded-md        /* 6px - Cards, panels */
rounded-lg        /* 8px - Larger cards */
rounded-xl        /* 12px - Prominent elements */
rounded-2xl       /* 16px - Hero elements */
rounded-full      /* Fully rounded */
```

## 🔢 Z-Index

```css
z-dropdown        /* 100 - Dropdown menus */
z-sticky          /* 200 - Sticky headers */
z-fixed           /* 300 - Fixed elements */
z-modal-backdrop  /* 400 - Modal backdrops */
z-modal           /* 500 - Modal content */
z-popover         /* 600 - Popovers */
z-tooltip         /* 700 - Tooltips */
z-toast           /* 800 - Toast notifications */
z-max             /* 9999 - Maximum z-index */
```

## 🚀 Pre-built Components

### Medical Card
```html
<div class="medical-card">
  <h3 class="text-h5 text-primary-900 mb-4">Card Title</h3>
  <p class="text-body text-neutral-700">Card content...</p>
</div>
```

### Status Alert
```html
<div class="medical-alert success">
  <p class="text-small">Success message</p>
</div>
```

### Primary Button
```html
<button class="medical-button primary">
  Primary Action
</button>
```

### Status Indicator
```html
<span class="status-indicator healthy">
  Normal
</span>
```

## 🎯 Medical Context Colors

| Color | Usage | Example |
|-------|-------|---------|
| `primary-500` | Trust, main actions | "Schedule Appointment" |
| `secondary-500` | Healing, balance | "View Treatment Plan" |
| `success-500` | Positive results | "Lab results normal" |
| `warning-500` | Attention needed | "Appointment reminder" |
| `error-500` | Critical issues | "Critical alert" |
| `neutral-500` | General content | Body text, borders |

## 🔄 Common Patterns

### Patient Card
```css
.patient-card {
  @apply bg-surface border border-primary rounded-lg shadow-card p-6;
  @apply transition-shadow duration-200 ease-medical;
}

.patient-card:hover {
  @apply shadow-lg;
}
```

### Status Badge
```css
.status-badge {
  @apply inline-flex items-center gap-2 px-3 py-2 rounded-full;
  @apply text-small font-medium;
}

.status-badge.healthy {
  @apply bg-success-50 text-success-700;
}

.status-badge.critical {
  @apply bg-error-50 text-error-700;
}
```

### Form Input
```css
.medical-input {
  @apply w-full px-4 py-2 border border-primary rounded-md;
  @apply text-body placeholder-neutral-500;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500;
}
```

## 📱 Responsive Breakpoints

```css
sm:   /* 640px and up */
md:   /* 768px and up */
lg:   /* 1024px and up */
xl:   /* 1280px and up */
2xl:  /* 1536px and up */
```

## 🌙 Dark Mode Classes

```css
dark:bg-surface      /* Dark mode background */
dark:text-primary    /* Dark mode text */
dark:border-primary  /* Dark mode border */
```

---

*Keep this reference handy for quick lookup of design tokens and common patterns.*
