# 🏗️ Plan de Refactorización: Convenciones de Imports

## 🎯 Objetivo
Implementar convenciones consistentes de nomenclatura e imports para prevenir errores como los que hemos resuelto.

## 📊 Análisis de Problemas Actuales

### Errores Resueltos que las Convenciones Habrían Prevenido:
1. **"Header is not defined"** - falta de imports consistentes
2. **Firebase collection() error** - rutas de import inconsistentes
3. **Páginas 404** - estructura de archivos no descriptiva

## 🛠️ Convenciones Propuestas

### 1. Aliases Configurados (✅ Ya tenemos)
```json
{
  "@/*": ["./src/*"],
  "@/components/*": ["./src/components/*"],
  "@/hooks/*": ["./src/hooks/*"],
  "@/lib/*": ["./src/lib/*"],
  "@/config/*": ["./config/*"]
}
```

### 2. Agregar Alias para Firebase
```json
{
  "@/firebase": ["./config/firebase"],
  "@/services/*": ["./src/services/*"]
}
```

## 🔄 Refactorización Necesaria

### Archivos con Imports Inconsistentes:
1. `src/services/firebase-storage.ts` - usar `@/config/firebase`
2. `src/services/firebase-notifications.ts` - usar `@/config/firebase`
3. `src/components/layout/Header.tsx` - usar `@/components/ui/*`

### Orden de Imports Estándar:
```typescript
// 1. Node.js modules
import React from 'react'

// 2. Third-party libraries  
import { Button } from 'lucide-react'

// 3. Internal packages (@altamedica/*)
import { useAuth } from '@altamedica/auth'

// 4. Project modules (aliases)
import { Header } from '@/components/layout/Header'
import { firebase } from '@/config/firebase'

// 5. Local modules (relative)
import './styles.css'
```

## 🎯 Beneficios Específicos

### Prevención de Errores:
- ❌ `import Header from '../../../components/layout/Header'`
- ✅ `import Header from '@/components/layout/Header'`

### Mantenibilidad:
- Si movemos archivos, los alias siguen funcionando
- Fácil identificación del propósito de cada import
- Menos errores de "Module not found"

## 🛠️ Herramientas Recomendadas

### ESLint Rules para Imports:
```json
{
  "rules": {
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling"],
      "newlines-between": "always"
    }]
  }
}
```

### Prettier para Formato:
```json
{
  "importOrder": ["^@/(.*)$", "^[./]"],
  "importOrderSeparation": true
}
```
