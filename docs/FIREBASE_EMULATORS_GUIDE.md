# 🔥 Firebase Emulators - Guía de Configuración

## 🚀 Para Desarrollo SIN Emuladores (Recomendado)

**El sistema ya está configurado para funcionar directamente con Firebase en producción.**

✅ **Configuración actual**: 
- Usa Firebase real (altamedic-20f69.firebaseapp.com)
- No requiere emuladores locales
- Funciona inmediatamente

---

## 🛠️ Para Desarrollo CON Emuladores (Opcional)

Si quieres usar emuladores locales para desarrollo:

### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 2. Inicializar emuladores
```bash
cd C:\Users\Eduardo\Documents\altamedicadev
firebase init emulators
```

Seleccionar:
- ✅ Authentication Emulator (puerto 9099)
- ✅ Firestore Emulator (puerto 8080)  
- ✅ Storage Emulator (puerto 9199)

### 3. Ejecutar emuladores
```bash
firebase emulators:start
```

### 4. Activar modo emulador
En `.env.local`, cambiar:
```
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
```

---

## 🔧 Comandos Útiles

### Iniciar emuladores
```bash
firebase emulators:start
```

### Iniciar emuladores con UI
```bash
firebase emulators:start --import=./firebase-data --export-on-exit=./firebase-data
```

### Ver logs de emuladores
```bash
firebase emulators:start --debug
```

---

## 📊 Puertos por Defecto

- **Authentication**: http://localhost:9099
- **Firestore**: http://localhost:8080
- **Storage**: http://localhost:9199
- **Emulator UI**: http://localhost:4000

---

## ⚠️ Importante

**Para desarrollo normal, NO necesitas emuladores.** El sistema funciona perfectamente con Firebase en producción y es más simple de configurar.

**Solo usa emuladores si**:
- Quieres desarrollo completamente offline
- Necesitas testing de reglas avanzadas
- Quieres datos de prueba separados

**Configuración actual recomendada**: Sin emuladores ✅