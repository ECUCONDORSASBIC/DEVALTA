# Header Component

A modern, accessible header component with semantic navigation, mobile menu support, and comprehensive keyboard navigation.

## Features

- ✅ **Semantic HTML**: Uses proper landmark roles (`role="banner"`, `role="navigation"`)
- ✅ **WCAG AA Compliant**: Full keyboard navigation and screen reader support
- ✅ **Responsive Design**: Mobile-first approach with responsive breakpoints
- ✅ **Mobile Menu**: Slide-in drawer with backdrop overlay
- ✅ **Authentication States**: Support for authenticated/unauthenticated users
- ✅ **Radix UI Integration**: Uses Radix UI dropdown menu for user actions
- ✅ **Design System**: Integrated with medical design tokens and colors
- ✅ **TypeScript**: Full type safety and IntelliSense support

## Usage

### Basic Usage

```tsx
import { Header } from '@/components/layout/Header';

function App() {
  return (
    <Header
      onLogin={() => router.push('/login')}
      onRegister={() => router.push('/register')}
    />
  );
}
```

### With Authentication

```tsx
import { Header } from '@/components/layout/Header';

function App() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Header
      isAuthenticated={isAuthenticated}
      user={user}
      onLogin={() => router.push('/login')}
      onRegister={() => router.push('/register')}
      onLogout={() => auth.logout()}
      onProfileClick={() => router.push('/profile')}
    />
  );
}
```

### With Transparent Background

```tsx
import { Header } from '@/components/layout/Header';

function LandingPage() {
  return (
    <Header
      transparent={true}
      onLogin={() => router.push('/login')}
      onRegister={() => router.push('/register')}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `transparent` | `boolean` | `false` | Whether to use transparent background |
| `isAuthenticated` | `boolean` | `false` | Whether user is authenticated |
| `user` | `UserObject` | `undefined` | User information object |
| `onLogin` | `() => void` | `undefined` | Login button click handler |
| `onRegister` | `() => void` | `undefined` | Register button click handler |
| `onLogout` | `() => void` | `undefined` | Logout action handler |
| `onProfileClick` | `() => void` | `undefined` | Profile click handler |
| `className` | `string` | `undefined` | Additional CSS classes |

### User Object Type

```typescript
interface User {
  name?: string;
  email?: string;
  avatar?: string;
}
```

## Accessibility Features

### Keyboard Navigation
- **Tab**: Navigate through interactive elements
- **Enter/Space**: Activate buttons and links
- **Escape**: Close mobile menu or dropdown
- **Arrow Keys**: Navigate dropdown menu items

### ARIA Attributes
- `role="banner"` - Header landmark
- `role="navigation"` - Navigation landmark
- `aria-label` - Descriptive labels for navigation areas
- `aria-expanded` - Menu state indication
- `aria-current="page"` - Current page indication
- `aria-modal` - Modal dialog indication for mobile menu

### Focus Management
- Visible focus indicators on all interactive elements
- Focus trapping within modal dialogs
- Proper focus restoration after menu closure

## Mobile Experience

The Header component provides a responsive mobile experience:

1. **Hamburger Menu**: Toggle button appears on mobile devices
2. **Slide-in Drawer**: Mobile menu slides in from the right
3. **Backdrop Overlay**: Semi-transparent overlay with click-to-close
4. **Full Navigation**: All desktop features available in mobile menu
5. **Touch Optimized**: Proper touch targets and gestures

## Styling

The component uses the medical design system tokens:

- **Colors**: Primary, secondary, and neutral color schemes
- **Typography**: Medical-optimized font sizes and weights
- **Spacing**: Consistent spacing scale
- **Shadows**: Elevation system for depth
- **Transitions**: Smooth, accessible animations

### Customization

You can customize the Header by:

1. **CSS Variables**: Override design tokens in your CSS
2. **Tailwind Classes**: Use the `className` prop
3. **Design Tokens**: Update the design system configuration

## Integration with Existing Code

### Replacing Navbar Component

The old `Navbar` component is deprecated and now uses the new `Header` internally:

```tsx
// Old (deprecated)
import Navbar from '@/components/navigation/Navbar';

// New (recommended)
import { Header } from '@/components/layout/Header';
```

### Migration Guide

1. Replace `Navbar` imports with `Header`
2. Update prop names (see props table above)
3. Add authentication state handling
4. Update mobile menu implementation
5. Test keyboard navigation and accessibility

## Testing

The Header component includes comprehensive testing considerations:

### Unit Tests
- Prop handling and state management
- Event handler execution
- Accessibility attributes
- Responsive behavior

### Integration Tests
- Navigation flow
- Authentication state changes
- Mobile menu interaction
- Keyboard navigation

### Accessibility Tests
- Screen reader compatibility
- Keyboard-only navigation
- Focus management
- ARIA attribute correctness

## Browser Support

The Header component supports:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

The component is optimized for performance:
- **Lazy Loading**: Mobile menu renders only when needed
- **Efficient Re-renders**: Uses React best practices
- **Bundle Size**: Minimal impact on bundle size
- **Runtime Performance**: Optimized event handlers

## Contributing

When contributing to the Header component:

1. Follow the existing code style
2. Add comprehensive tests
3. Update documentation
4. Ensure accessibility compliance
5. Test across different devices and browsers

## Related Components

- **Footer**: Matching footer component
- **Sidebar**: Complementary sidebar navigation
- **Layout**: Overall page layout component
- **Container**: Content container component
