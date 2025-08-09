# 🚀 Plan de Optimización del Monorepo AltaMedica

## 📊 Análisis de Problemas Identificados

### 1. ✅ **Dependencias Duplicadas**
- **Estado**: React 19 como peerDependency en UI
- **Solución**: Usar peerDependencies consistentemente

### 2. ⚡ **Optimización de TurboRepo**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"],
      "cache": true
    },
    "build:watch": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"],
      "cache": true
    },
    "lint": {
      "outputs": [],
      "cache": true
    },
    "type-check": {
      "dependsOn": ["^build"],
      "cache": true
    },
    "clean": {
      "cache": false
    }
  },
  "globalEnv": ["NODE_ENV"],
  "globalDependencies": ["tsconfig.json"]
}
```

### 3. 🔧 **Path Aliases (tsconfig)**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@altamedica/*": ["packages/*/src"],
      "@app/*": ["apps/*/src"],
      "@shared/*": ["packages/shared/src/*"],
      "@ui/*": ["packages/ui/src/*"],
      "@hooks/*": ["packages/hooks/src/*"],
      "@types/*": ["packages/types/src/*"]
    }
  }
}
```

### 4. 📦 **Scripts Optimizados para package.json root**
```json
{
  "scripts": {
    "dev": "turbo run dev --parallel",
    "dev:min": "turbo run dev --filter=web-app --filter=api-server --filter=patients --filter=doctors",
    "build": "turbo run build",
    "build:packages": "turbo run build --filter=\"./packages/*\"",
    "test": "turbo run test",
    "test:e2e": "turbo run test:e2e",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean && rimraf node_modules",
    "dedupe": "pnpm dedupe",
    "analyze": "turbo run build --profile && open .turbo/runs/*.json"
  }
}
```

### 5. 🧪 **Expansión de Tests E2E**
```typescript
// packages/e2e-tests/tests/critical-flows.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test('Patient appointment booking flow', async ({ page }) => {
    // Test completo del flujo
  });
  
  test('Doctor telemedicine session', async ({ page }) => {
    // Test de videollamada
  });
  
  test('Company marketplace interaction', async ({ page }) => {
    // Test del marketplace B2B
  });
});
```

### 6. 📏 **ESLint Unificado**
```javascript
// packages/eslint-config/index.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
};
```

### 7. 📚 **Storybook Mejorado**
```typescript
// packages/ui/.storybook/main.ts
export default {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-performance',
    '@storybook/addon-docs'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  }
};
```

### 8. ⚡ **Hooks con Memoization**
```typescript
// packages/hooks/src/medical/usePatients.ts
import { useMemo, useCallback } from 'react';

export const usePatients = (filters?: PatientFilters) => {
  const memoizedFilters = useMemo(() => filters, [JSON.stringify(filters)]);
  
  const fetchPatients = useCallback(async () => {
    // Lógica de fetch
  }, [memoizedFilters]);
  
  return useQuery({
    queryKey: ['patients', memoizedFilters],
    queryFn: fetchPatients,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
```

## 🎯 Acciones Inmediatas

1. **Actualizar turbo.json** con configuración optimizada
2. **Configurar path aliases** en tsconfig base
3. **Implementar GitHub Actions** para CI/CD
4. **Auditar hooks** para memoization
5. **Expandir tests E2E** con casos críticos

## 📈 Métricas de Éxito

- Build time reducido en 40%
- Cache hit rate > 80%
- Test coverage > 85%
- Zero conflictos de dependencias
- Imports absolutos en 100% del código