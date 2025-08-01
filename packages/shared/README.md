# @altamedica/shared

Paquete compartido de utilidades y helpers para las APIs de ALTAMEDICA.

## 📦 Instalación

```bash
pnpm add @altamedica/shared
```

## 🔧 Configuración

### Uso con Zod

El paquete shared ahora usa una interfaz genérica para validación que es compatible con Zod. Para usar con Zod:

```typescript
import { validateSchema } from '@altamedica/shared';
import { z } from 'zod';

// Definir tu schema de Zod
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().min(18)
});

// Usar con la función de validación
const result = validateSchema(userSchema, userData);

if (result.success) {
  console.log('Datos válidos:', result.data);
} else {
  console.log('Error de validación:', result.error);
}
```

### Uso con otros validadores

El paquete es compatible con cualquier validador que tenga un método `parse()`:

```typescript
import { validateSchema } from '@altamedica/shared';

// Ejemplo con un validador personalizado
class CustomValidator<T> {
  constructor(private schema: any) {}
  
  parse(data: unknown): T {
    // Tu lógica de validación
    return data as T;
  }
}

const validator = new CustomValidator(mySchema);
const result = validateSchema(validator, data);
```

## 🚀 Funcionalidades

### API Response Helpers

```typescript
import { createSuccessResponse, createErrorResponse } from '@altamedica/shared';

// Respuesta exitosa
const successResponse = createSuccessResponse(data, { page: 1, limit: 10 });

// Respuesta de error
const errorResponse = createErrorResponse('VALIDATION_ERROR', 'Datos inválidos');
```

### Pagination Helpers

```typescript
import { validatePagination, createPaginationMeta } from '@altamedica/shared';

const { page, limit } = validatePagination({ page: 1, limit: 20 });
const meta = createPaginationMeta(page, limit, totalItems);
```

### Date Helpers

```typescript
import { 
  formatDate, 
  parseDate, 
  isValidDate, 
  addDays, 
  addHours,
  isToday,
  isFuture,
  isPast 
} from '@altamedica/shared';

const formatted = formatDate(new Date());
const parsed = parseDate('2024-01-01');
const valid = isValidDate(new Date());
const tomorrow = addDays(new Date(), 1);
```

### String Helpers

```typescript
import { 
  generateId, 
  slugify, 
  capitalize, 
  capitalizeWords, 
  truncate 
} from '@altamedica/shared';

const id = generateId();
const slug = slugify('Hello World!'); // 'hello-world'
const cap = capitalize('hello'); // 'Hello'
const words = capitalizeWords('hello world'); // 'Hello World'
const truncated = truncate('Long text here', 10); // 'Long text...'
```

### Array Helpers

```typescript
import { unique, chunk, groupBy } from '@altamedica/shared';

const uniqueItems = unique([1, 2, 2, 3]); // [1, 2, 3]
const chunks = chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
const grouped = groupBy(users, user => user.role);
```

### Object Helpers

```typescript
import { omit, pick } from '@altamedica/shared';

const user = { id: 1, name: 'John', email: 'john@example.com', password: 'secret' };
const publicUser = omit(user, ['password']);
const nameOnly = pick(user, ['name']);
```

### Error Classes

```typescript
import { 
  AppError, 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError, 
  ForbiddenError 
} from '@altamedica/shared';

throw new ValidationError('Datos inválidos');
throw new NotFoundError('Usuario');
throw new UnauthorizedError('Token expirado');
throw new ForbiddenError('Acceso denegado');
```

### Logger

```typescript
import { ConsoleLogger } from '@altamedica/shared';

const logger = new ConsoleLogger();
logger.info('Operación exitosa', { userId: 123 });
logger.warn('Advertencia', { data: 'info' });
logger.error('Error crítico', new Error('Something went wrong'));
logger.debug('Información de debug', { details: 'debug info' });
```

### Firebase Helpers

```typescript
import { 
  convertFirestoreTimestamps, 
  processFirestoreDoc 
} from '@altamedica/shared';

// Convertir timestamps de Firestore
const convertedData = convertFirestoreTimestamps(firestoreData);

// Procesar documento de Firestore
const processedDoc = processFirestoreDoc(firestoreDoc);
```

## 🔒 Seguridad

### Autenticación

```typescript
import { 
  extractBearerToken, 
  authenticateRequest 
} from '@altamedica/shared';

const token = extractBearerToken(authHeader);
const user = await authenticateRequest(authHeader);
```

## 📊 Anamnesis

### Clase AltamedicaAnamnesis

```typescript
import { AltamedicaAnamnesis } from '@altamedica/shared';

const anamnesis = new AltamedicaAnamnesis({
  version: '1.0.0',
  enableValidation: true,
  enableAnalytics: true,
  enableExport: true,
  defaultFormat: 'json',
  encryptionEnabled: true
});

// Validar anamnesis
const validation = anamnesis.validate(anamnesisData);

// Analizar anamnesis
const analysis = anamnesis.analyze(anamnesisData);

// Exportar anamnesis
const exported = anamnesis.export(anamnesisData, 'fhir', 'web-app', 'user123');

// Generar estadísticas
const stats = anamnesis.generateStats(anamnesisList);
```

## 🧪 Testing

```bash
# Ejecutar tests
pnpm test

# Tests en modo watch
pnpm test:watch

# Cobertura de tests
pnpm test:coverage
```

## 📝 Notas de Migración

### De versión anterior con Zod directo

**Antes:**
```typescript
import { validateSchema } from '@altamedica/shared';
import { z } from 'zod';

const schema = z.object({ name: z.string() });
const result = validateSchema(schema, data);
```

**Ahora:**
```typescript
import { validateSchema } from '@altamedica/shared';
import { z } from 'zod';

const schema = z.object({ name: z.string() });
const result = validateSchema(schema, data); // ¡Funciona igual!
```

La interfaz es compatible hacia atrás, por lo que no necesitas cambiar tu código existente.

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles. 