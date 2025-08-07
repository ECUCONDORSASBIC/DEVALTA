# Guía de Migración - Firebase Centralizado

## 🎯 Objetivo
Migrar de configuraciones Firebase locales a la configuración centralizada en `@altamedica/firebase-config`.

## 📦 Instalación

```bash
npm install @altamedica/firebase-config
```

## 🔄 Migración Paso a Paso

### 1. Migración Básica

**Antes (archivo local):**
```typescript
// apps/patients/src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // ... más config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

**Después (centralizado):**
```typescript
// apps/patients/src/lib/firebase.ts
import { initializeFirebase } from '@altamedica/firebase-config';

const { app, auth, db, storage } = initializeFirebase();

export { app, auth, db, storage };
```

### 2. Uso en Componentes

**Antes:**
```typescript
import { auth, db } from '@/lib/firebase';

function MyComponent() {
  // usar auth y db directamente
}
```

**Después:**
```typescript
import { getFirebaseAuth, getFirebaseDb } from '@altamedica/firebase-config';

function MyComponent() {
  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  // usar auth y db
}
```

### 3. Hook de React (Recomendado)

```typescript
import { useFirebase } from '@altamedica/firebase-config';

function MyComponent() {
  const { auth, db, storage } = useFirebase();
  
  // Usar servicios de Firebase
}
```

## 🔧 Configuración de Emuladores

Agregar estas variables de entorno para usar emuladores locales:

```env
# .env.local
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL=http://localhost:9099
NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST=localhost
NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT=8080
NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST=localhost
NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT=9199
```

## 📝 Archivos a Eliminar

Después de migrar, puedes eliminar estos archivos:

```
apps/patients/src/lib/firebase.ts
apps/doctors/src/lib/firebase.ts
apps/companies/src/lib/firebase.ts
apps/web-app/src/lib/firebase.ts
apps/web-app/src/config/firebase.ts
apps/admin/src/services/firebase-service.ts
```

## ⚠️ Consideraciones Importantes

1. **Variables de Entorno**: Asegúrate de que todas las apps tengan las mismas variables de entorno Firebase
2. **Persistencia**: La configuración centralizada ya incluye persistencia local para Auth
3. **Analytics**: Se activa automáticamente en producción
4. **Emuladores**: Se conectan automáticamente si las variables están configuradas

## 🎯 Beneficios

- ✅ Una sola fuente de verdad para la configuración
- ✅ Manejo consistente de errores
- ✅ Soporte automático de emuladores
- ✅ Analytics integrado
- ✅ Persistencia de auth configurada
- ✅ Type-safe con TypeScript
- ✅ Menos código duplicado

## 📊 Ejemplo Completo

```typescript
// apps/patients/src/hooks/usePatientData.ts
import { useFirebase } from '@altamedica/firebase-config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export function usePatientData(patientId: string) {
  const { db } = useFirebase();
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const q = query(
      collection(db, 'patients'),
      where('id', '==', patientId)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // procesar datos
    });
    
    return unsubscribe;
  }, [db, patientId]);
  
  return data;
}
```