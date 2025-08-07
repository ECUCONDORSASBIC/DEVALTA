# 📋 Plan de Simplificación del API Server

## 🎯 Objetivo
Eliminar el sistema SSO redundante ahora que usamos Firebase Auth distribuido.

## 🔧 Cambios Propuestos

### 1. **Simplificar `/auth/login`**

**ANTES** (Complejo con SSO):
```typescript
// Genera 3 tokens diferentes
const customToken = await adminAuth.createCustomToken(uid, {...});
const { accessToken, refreshToken } = await createSSOToken({...});
setSSOCookies(response, accessToken, refreshToken);
```

**DESPUÉS** (Simple y limpio):
```typescript
// Solo actualiza metadata y devuelve info del usuario
await updateUserMetadata(uid, { lastLogin: new Date() });
return NextResponse.json({
  success: true,
  user: userData,
  roleProfile,
  redirectUrl
});
```

### 2. **Eliminar archivos SSO**
```bash
# Eliminar estos archivos:
- packages/shared/src/auth/sso-service.ts
- packages/shared/src/auth/sso-service-client.ts  
- packages/shared/src/auth/sso-middleware.ts
- apps/patients/src/lib/sso.ts
- apps/*/middleware.ts (que usen SSO)
```

### 3. **Actualizar middleware de autenticación**

**ANTES**:
```typescript
// Verificaba tokens SSO custom
const token = req.cookies.get('altamedica_sso_token');
const payload = verifySSOToken(token);
```

**DESPUÉS**:
```typescript
// Verifica directamente Firebase ID Token
const idToken = req.headers.authorization?.split('Bearer ')[1];
const decodedToken = await adminAuth.verifyIdToken(idToken);
```

## 📊 Beneficios de la Simplificación

1. **-50% menos código** de autenticación
2. **Menos dependencias** (eliminar librerías JWT custom)
3. **Menor superficie de ataque** (menos tokens = menos vulnerabilidades)
4. **Más fácil de mantener** (solo Firebase, no sistema híbrido)
5. **Mejor rendimiento** (menos verificaciones de tokens)

## ⚠️ Consideraciones

### Mantener por ahora:
1. **Custom Token de Firebase** - Útil para casos especiales
2. **Endpoints de metadata** - Para actualizar último login, etc.
3. **Verificación de roles** - Sigue siendo crítica

### Posibles impactos:
- Las apps frontend necesitarán enviar Firebase ID Token en headers
- Actualizar tests que dependían del sistema SSO
- Revisar documentación de API

## 🚀 Pasos de Implementación

1. **Fase 1**: Actualizar apps frontend para usar Firebase ID Token
2. **Fase 2**: Modificar API Server para verificar solo Firebase
3. **Fase 3**: Eliminar código SSO muerto
4. **Fase 4**: Actualizar tests y documentación

## 📈 Resultado Final

De un sistema híbrido complejo:
```
Firebase Auth → SSO Tokens → Cookies → Verificación
```

A un sistema simple y directo:
```
Firebase Auth → Verificación directa
```

**Reducción de complejidad: 70%** 🎉