# @altamedica/design-system

Design System de AltaMedica

Este paquete provee componentes UI reutilizables, tokens de diseño y configuración Tailwind compartida entre todas las aplicaciones del monorepo.

## Uso rápido

```bash
pnpm add @altamedica/design-system
```

```tsx
import { Button } from '@altamedica/design-system';

export default function Example() {
  return <Button variant="primary">Guardar</Button>;
}
```

## Desarrollo local

```bash
cd packages/design-system
pnpm install
pnpm run dev # compila en watch mode
```

## Publicación

Se publica como paquete ESM. Ejecutar:

```bash
pnpm run build && npm publish --access=public
```