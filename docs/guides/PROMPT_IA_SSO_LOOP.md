## 🤖 PROMPT PARA IA - AUDITORÍA SSO LOOP

### CONTEXTO:
Sistema multi-app Next.js con loop de redirección infinito:
- Puerto 3000 (web-app): Login exitoso → redirige a 3003
- Puerto 3003 (patients): No reconoce sesión → redirige a 3000
- Resultado: Loop infinito 3000 ↔ 3003

### ARCHIVOS IDENTIFICADOS CON PROBLEMAS:

1. **apps/patients/src/providers/AuthProviderSimple.tsx (líneas 41-92)**
   - PROBLEMA: Solo escucha Firebase onAuthStateChanged
   - FALTA: Lectura de cookies SSO del puerto 3000
   - IMPACTO: No puede validar sesiones cross-app

2. **apps/patients/src/components/auth/AuthGuard.tsx**
   - PROBLEMA: Redirige inmediatamente sin delay
   - FALTA: Verificación de cookies SSO antes de redirect
   - IMPACTO: Causa el loop infinito

3. **apps/web-app/src/contexts/AuthContext.tsx (línea ~73)**
   - ESTADO: Crea cookies SSO correctamente
   - VERIFICAR: Domain/path para sharing entre puertos
   - IMPACTO: Si mal configurado, cookies no se comparten

4. **apps/patients/src/hooks/useAuth.tsx**
   - PROBLEMA: Re-export que puede causar conflictos
   - CONFLICTO: Existe también useAuthSimple.tsx
   - IMPACTO: Estado inconsistente entre hooks

### TAREAS ESPECÍFICAS:

**TAREA 1 - AuthProviderSimple.tsx:**
```typescript
// AGREGAR en useEffect (línea ~41):
// 1. Verificar cookies SSO antes de Firebase check
// 2. Implementar validateSSOToken function
// 3. Manejar casos donde Firebase user no existe pero SSO sí
```

**TAREA 2 - AuthGuard.tsx:**
```typescript
// MODIFICAR lógica de redirect:
// 1. Agregar delay de 3 segundos
// 2. Verificar cookies SSO antes de redirigir
// 3. Solo redirigir si no hay usuario Y no hay cookies SSO
```

**TAREA 3 - Cookie Utilities:**
```typescript
// CREAR apps/patients/src/utils/sso-cookies.ts:
// 1. getCookie(name: string)
// 2. validateSSOToken(token: string)
// 3. parseSSOUser(token: string)
```

**TAREA 4 - Testing:**
```javascript
// Verificar en DevTools:
// Puerto 3000: document.cookie (debe contener sso_token)
// Puerto 3003: document.cookie (debe leer mismo sso_token)
// Timing: AuthGuard debe esperar antes de redirect
```

### RESULTADO ESPERADO:
1. Usuario hace login en 3000 → cookies SSO creadas
2. Redirect a 3003 → AuthProviderSimple lee cookies SSO
3. AuthGuard NO redirige porque encuentra sesión válida
4. Usuario permanece en 3003 sin loop

### PROMPT OPTIMIZADO:

"Analiza el sistema SSO multi-app que está causando loops de redirección infinitos entre puerto 3000 y 3003. El problema específico es:

1. **AuthProviderSimple.tsx** solo escucha Firebase pero no lee cookies SSO del puerto 3000
2. **AuthGuard.tsx** redirige inmediatamente sin verificar cookies SSO
3. **useAuth hooks** pueden tener conflictos entre useAuth.tsx y useAuthSimple.tsx

Necesito que implementes:
- Lectura de cookies SSO en AuthProviderSimple antes del Firebase check
- Delay y verificación de cookies en AuthGuard antes de redirigir  
- Funciones helper para manejo de cookies SSO
- Eliminación de conflictos entre hooks de auth

El objetivo es que el login en 3000 persista la sesión en 3003 sin loops de redirección."
