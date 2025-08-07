# 🔍 AUDITORÍA SSO - SESIÓN PERSISTENTE ENTRE APLICACIONES
## Problema: Loop de redirección entre puerto 3000 ↔ 3003

### 📊 ESTADO ACTUAL DETECTADO:
- **Puerto 3000 (web-app)**: ✅ Autenticación exitosa → Redirige a 3003
- **Puerto 3003 (patients)**: ❌ No reconoce sesión → Vuelve a 3000
- **Loop infinito**: 3000 → 3003 → 3000 → 3003...

---

## 🎯 ARCHIVOS CRÍTICOS IDENTIFICADOS (ORDEN DE PRIORIDAD)

### 🚨 CRÍTICO - RESOLVER INMEDIATAMENTE

#### 1. **AuthContext vs AuthProviderSimple Conflict**
```
📂 apps/web-app/src/contexts/AuthContext.tsx 
   ↳ Crea cookies SSO pero puede estar interfiriendo
📂 apps/patients/src/providers/AuthProviderSimple.tsx
   ↳ ACTUAL: onAuthStateChanged pero no lee cookies SSO
📂 apps/patients/src/providers/AuthProvider.tsx
   ↳ CONFLICTO: Dos providers diferentes en patients
```

#### 2. **AuthGuard Agresivo**
```
📂 apps/patients/src/components/auth/AuthGuard.tsx
   ↳ Redirige inmediatamente sin esperar auth state
   ↳ No maneja estados de loading correctamente
```

#### 3. **Firebase Configuration Inconsistency**
```
📂 apps/web-app/src/lib/firebase.ts
📂 apps/patients/src/lib/firebase.ts
   ↳ Verificar misma configuración
   ↳ Verificar persistence settings
```

### ⚠️ ALTO - RESOLVER PRONTO

#### 4. **Cookie/Token Sharing**
```
📂 apps/web-app/src/contexts/AuthContext.tsx (línea ~73)
   ↳ VERIFICAR: ¿Se crean cookies sso_token?
   ↳ VERIFICAR: Domain configuration para sharing
```

#### 5. **Auth State Synchronization**
```
📂 apps/patients/src/hooks/useAuth.tsx
📂 apps/patients/src/hooks/useAuthSimple.tsx
   ↳ CONFLICTO: Dos hooks de auth diferentes
   ↳ Re-export puede estar causando inconsistencias
```

---

## 🔍 ANÁLISIS ESPECÍFICO DEL PROBLEMA

### **ENCONTRADO EN AuthProviderSimple.tsx (líneas 41-92):**
```typescript
// ❌ PROBLEMA: Solo escucha Firebase, no cookies SSO
const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    // Solo busca en Firestore, NO lee cookies SSO de 3000
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    // Si no existe en Firestore → ❌ Error
  }
}
```

### **ENCONTRADO EN AuthGuard.tsx:**
```typescript
// ❌ PROBLEMA: Redirige muy rápido
if (!user && !loading) {
  window.location.href = 'http://localhost:3000/login';
  // No hay delay, no verifica cookies, no espera Firebase
}
```

### **ENCONTRADO EN AuthContext.tsx (web-app línea 73):**
```typescript
// ✅ CORRECTO: Crea SSO cookies pero...
// ❌ PROBLEMA: ¿Patients app las lee?
setFirebaseSSO({
  uid: user.uid,
  email: profile.email,
  role: profile.role
});
```

---

## 🚀 SOLUCIONES ESPECÍFICAS

### **SOLUCIÓN 1: Unificar AuthProvider en Patients**
```typescript
// EN: apps/patients/src/providers/AuthProviderSimple.tsx
// AGREGAR: Lectura de cookies SSO antes de Firebase check

useEffect(() => {
  // 1. PRIMERO: Verificar cookies SSO
  const ssoToken = getCookie('sso_token');
  const altamedicaToken = getCookie('altamedica_sso_token');
  
  if (ssoToken || altamedicaToken) {
    // Validar token y cargar usuario
    validateSSOToken(ssoToken || altamedicaToken);
  }
  
  // 2. DESPUÉS: Listener Firebase
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    // Lógica existente...
  });
}, []);
```

### **SOLUCIÓN 2: Mejorar AuthGuard**
```typescript
// EN: apps/patients/src/components/auth/AuthGuard.tsx
// AGREGAR: Delay y verificación de cookies

useEffect(() => {
  // Delay de 3 segundos para auth state
  const timer = setTimeout(() => {
    if (!user && !loading) {
      // Verificar cookies SSO antes de redirigir
      const ssoToken = getCookie('sso_token');
      if (!ssoToken) {
        window.location.href = 'http://localhost:3000/login';
      }
    }
  }, 3000);
  
  return () => clearTimeout(timer);
}, [user, loading]);
```

### **SOLUCIÓN 3: Cookie Helper Functions**
```typescript
// CREAR: apps/patients/src/utils/sso-cookies.ts
export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function validateSSOToken(token: string): Promise<User | null> {
  // Implementar validación de token SSO
}
```

---

## 📋 PLAN DE IMPLEMENTACIÓN PASO A PASO

### **FASE 1: Diagnóstico (15 min)**
1. Verificar cookies en DevTools en ambas apps
2. Confirmar Firebase user state en console
3. Verificar timing de AuthGuard redirects

### **FASE 2: Fix Inmediato (30 min)**
1. Agregar delay en AuthGuard (3 segundos)
2. Crear funciones helper para cookies
3. Modificar AuthProviderSimple para leer SSO

### **FASE 3: Testing (15 min)**
1. Test: Login en 3000 → Redirect a 3003
2. Verificar: No hay loop back
3. Confirmar: Persistencia en reload

### **FASE 4: Cleanup (15 min)**
1. Eliminar AuthProvider duplicate si existe
2. Unificar imports de useAuth
3. Documentar flujo final

---

## 🧪 COMANDOS DE TESTING

### **Test en DevTools Console (puerto 3000):**
```javascript
// Verificar que se crean cookies
console.log('Cookies 3000:', document.cookie);
console.log('Firebase user:', firebase.auth().currentUser);
```

### **Test en DevTools Console (puerto 3003):**
```javascript
// Verificar que se leen cookies
console.log('Cookies 3003:', document.cookie);
console.log('SSO Token:', document.cookie.split('sso_token=')[1]?.split(';')[0]);
console.log('Firebase user:', firebase.auth().currentUser);
```

### **Verificar Auth State en React DevTools:**
```
1. Buscar AuthProviderSimple component
2. Ver state: { user, isAuthenticated, isLoading }
3. Verificar timing de cambios
```

---

## 📌 ARCHIVOS A MODIFICAR (EN ORDEN):

1. **apps/patients/src/components/auth/AuthGuard.tsx** - Agregar delay
2. **apps/patients/src/utils/sso-cookies.ts** - Crear helpers
3. **apps/patients/src/providers/AuthProviderSimple.tsx** - Leer SSO cookies  
4. **apps/patients/src/app/layout.tsx** - Verificar provider único
5. **apps/web-app/src/contexts/AuthContext.tsx** - Verificar cookie creation

**🎯 OBJETIVO**: Eliminar loop 3000 ↔ 3003 en menos de 1 hora.

---

## 🚨 PUNTOS CRÍTICOS A AUDITAR

### A. FLUJO DE AUTENTICACIÓN
1. **Login en 3000** → Crear cookie SSO
2. **Redirección a 3003** → Leer cookie SSO
3. **Validación en 3003** → Mantener sesión
4. **No redirigir de vuelta** → Estado persistente

### B. SINCRONIZACIÓN DE ESTADO
```typescript
// ¿AuthContext en 3000 persiste datos correctamente?
// ¿AuthProviderSimple en 3003 lee datos correctamente?
// ¿Hay timing issues entre apps?
```

### C. COOKIES SSO
```typescript
// ¿Cookies se crean con domain correcto?
// ¿Path permite acceso desde ambas apps?
// ¿Expiration es adecuada?
// ¿SameSite policy correcta?
```

### D. FIREBASE PERSISTENCE
```typescript
// ¿Firebase Auth persiste entre reloads?
// ¿onAuthStateChanged funciona en ambas apps?
// ¿User tokens se mantienen válidos?
```

---

## 🔧 COMANDOS DE DIAGNÓSTICO

### Verificar estado de cookies:
```javascript
// En DevTools Console (tanto en 3000 como 3003):
console.log('Cookies:', document.cookie);
console.log('localStorage:', localStorage.getItem('firebase:authUser:...'));
console.log('sessionStorage:', sessionStorage.getItem('firebase:authUser:...'));
```

### Verificar Firebase Auth:
```javascript
// En DevTools Console:
import { auth } from './lib/firebase';
console.log('Firebase user:', auth.currentUser);
console.log('Auth state:', auth.currentUser?.uid);
```

---

## 📋 CHECKLIST DE AUDITORÍA

### NIVEL 1: COOKIES Y TOKENS
- [ ] Cookie `sso_token` se crea en 3000
- [ ] Cookie `altamedica_sso_token` se crea en 3000
- [ ] Cookies son accesibles desde 3003
- [ ] Domain configuration permite sharing
- [ ] Path configuration es correcta

### NIVEL 2: FIREBASE PERSISTENCE
- [ ] Firebase config idéntica en ambas apps
- [ ] Auth persistence habilitada
- [ ] onAuthStateChanged listeners activos
- [ ] User state persiste entre reloads

### NIVEL 3: COMPONENTES DE AUTH
- [ ] AuthGuard no redirige si user existe
- [ ] AuthProvider carga estado correctamente
- [ ] Loading states manejados apropiadamente
- [ ] Role validation funciona

### NIVEL 4: CROSS-APP COMMUNICATION
- [ ] No hay conflictos de storage
- [ ] Session sharing configurado
- [ ] Middleware no interfiere
- [ ] URLs de redirección correctas

---

## 🎯 PROMPT PARA AUDITORÍA AUTOMÁTICA

### Para GitHub Copilot:
```
Analiza el sistema SSO entre apps/web-app (puerto 3000) y apps/patients (puerto 3003) que está causando loops de redirección. 

Revisa estos archivos críticos:
1. apps/web-app/src/contexts/AuthContext.tsx - ¿Cookies SSO se crean correctamente?
2. apps/patients/src/providers/AuthProviderSimple.tsx - ¿Lee cookies SSO?
3. apps/patients/src/components/auth/AuthGuard.tsx - ¿Redirige innecesariamente?
4. apps/patients/src/hooks/useAuth.tsx - ¿Estado de auth persiste?
5. Configuración Firebase en ambas apps - ¿Consistency?

Problema: Usuario se autentica en 3000, redirige a 3003, pero 3003 no reconoce la sesión y vuelve a 3000.

Identifica:
- Inconsistencias en manejo de cookies
- Problemas de timing en auth state
- Configuración Firebase diferente
- AuthGuard demasiado agresivo
- Falta de persistencia entre apps

Propón soluciones específicas para cada archivo problemático.
```

### Para Claude/ChatGPT:
```
Audita un sistema SSO multi-app con loop de redirección infinito:

CONTEXTO:
- App web (3000): Login exitoso → redirige a app pacientes (3003)
- App pacientes (3003): No reconoce sesión → redirige de vuelta a (3000)
- Loop: 3000 ↔ 3003 ↔ 3000...

ARCHIVOS CRÍTICOS:
[Lista todos los archivos arriba]

ANÁLISIS REQUERIDO:
1. Cookie sharing entre dominios/puertos
2. Firebase Auth persistence
3. AuthGuard logic validation
4. Cross-app state synchronization
5. Timing issues en auth state

RESULTADO ESPERADO:
- Identificar root cause del loop
- Soluciones específicas por archivo
- Plan de implementación paso a paso
```

---

## 🚀 PLAN DE CORRECCIÓN SUGERIDO

### FASE 1: VERIFICACIÓN DE COOKIES
1. Validar creación de cookies en AuthContext (3000)
2. Validar lectura de cookies en AuthProviderSimple (3003)
3. Corregir domain/path si es necesario

### FASE 2: FIREBASE CONSISTENCY
1. Unificar configuración Firebase
2. Habilitar persistence explícitamente
3. Sincronizar onAuthStateChanged

### FASE 3: AUTHGUARD OPTIMIZATION
1. Agregar delays apropiados
2. Mejorar logic de validación
3. Manejar estados loading correctamente

### FASE 4: TESTING
1. Test de flujo completo 3000 → 3003
2. Verificar persistencia en reload
3. Validar no hay loops

---

**📌 NOTA**: Este es un problema común en arquitecturas multi-app. La clave está en la sincronización de estado de autenticación y el correcto sharing de cookies/tokens entre aplicaciones.
