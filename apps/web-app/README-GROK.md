# Integración con Grok 4

Esta aplicación incluye una integración completa con Grok 4 usando web scraping y automatización del navegador.

## 🚀 Características

- ✅ Conexión automática a Grok 4
- ✅ Autenticación automática (opcional)
- ✅ Chat en tiempo real
- ✅ Manejo robusto de errores
- ✅ Testing automatizado
- ✅ Interfaz de usuario moderna

## 📋 Requisitos

1. **Node.js** 18+ 
2. **Puppeteer** (se instala automáticamente)
3. **Cuenta de Grok 4** (opcional para funcionalidad completa)

## ⚙️ Configuración

### 1. Instalar dependencias

```bash
npm install puppeteer @types/puppeteer
```

### 2. Configurar credenciales

#### Opción A: Variables de entorno (Recomendado para producción)

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_GROK_EMAIL=tu-email@ejemplo.com
NEXT_PUBLIC_GROK_PASSWORD=tu-password
```

#### Opción B: Configuración local (Solo para desarrollo)

Edita `src/config/grok-config.ts`:

```typescript
export const devGrokConfig: GrokConfig = {
  ...defaultGrokConfig,
  email: "tu-email@ejemplo.com",
  password: "tu-password",
  debug: true
};
```

### 3. Configurar el componente

En tu página principal (`src/app/page.tsx`):

```typescript
import { GrokChat } from "@/components/GrokChat";
import { getSecureGrokConfig } from "@/config/grok-config";

// En tu componente
<GrokChat config={getSecureGrokConfig()} />
```

## 🧪 Testing

### Test rápido

```typescript
import { quickGrokTest } from '@/utils/grok-test';

// En la consola del navegador
await quickGrokTest();
```

### Test completo

```typescript
import { runGrokTests } from '@/utils/grok-test';

// En la consola del navegador
await runGrokTests();
```

## 🔧 Uso

### Conexión básica

```typescript
import { grokService } from '@/services/grok-connector';

// Conectar
await grokService.connect();

// Enviar mensaje
const response = await grokService.sendMessage('Hola Grok');

// Desconectar
await grokService.disconnect();
```

### Verificar estado

```typescript
const status = grokService.getConnectionStatus();
console.log('Conectado:', status.isConnected);
console.log('Autenticado:', status.isAuthenticated);
```

## 🚨 Solución de problemas

### Error: "No se pudo conectar a Grok"

1. Verifica tu conexión a internet
2. Asegúrate de que Grok esté disponible
3. Revisa que las credenciales sean correctas

### Error: "No se encontró el campo de entrada"

1. Grok puede haber cambiado su interfaz
2. Actualiza los selectores CSS en `grok-web-connector.ts`
3. Usa el modo debug para ver qué está pasando

### Error: "Timeout esperando respuesta"

1. Aumenta el timeout en la configuración
2. Verifica que no haya problemas de red
3. Intenta reconectar

### Modo debug

```typescript
const config = {
  ...getSecureGrokConfig(),
  debug: true,
  headless: false // Para ver el navegador
};
```

## 🔒 Seguridad

### ⚠️ Importante

- **Nunca** subas credenciales reales al repositorio
- Usa variables de entorno en producción
- Considera usar un proxy o VPN si es necesario
- Revisa los términos de servicio de Grok

### Buenas prácticas

1. Usa credenciales temporales para testing
2. Implementa rate limiting
3. Maneja errores de forma segura
4. No almacenes logs con información sensible

## 📝 Logs

Los logs se muestran en la consola del navegador:

```
🚀 Iniciando conexión a Grok...
🌐 Navegando a Grok...
✅ Conectado exitosamente a Grok
📤 Enviando mensaje a Grok...
📥 Respuesta recibida
```

## 🔄 Actualizaciones

### Selectores CSS

Si Grok cambia su interfaz, actualiza estos selectores en `grok-web-connector.ts`:

```typescript
const inputSelectors = [
  'textarea[placeholder*="Ask Grok"]',
  'textarea[placeholder*="message"]',
  // Agrega nuevos selectores aquí
];
```

### Configuración

Para cambiar la configuración por defecto, edita `grok-config.ts`:

```typescript
export const defaultGrokConfig: GrokConfig = {
  headless: false,
  timeout: 30000,
  debug: true
};
```

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs en la consola
2. Ejecuta los tests de diagnóstico
3. Verifica la configuración
4. Revisa que Grok no haya cambiado su interfaz

## 🎯 Próximos pasos

- [ ] Implementar rate limiting
- [ ] Agregar más opciones de configuración
- [ ] Mejorar el manejo de errores
- [ ] Agregar soporte para múltiples sesiones
- [ ] Implementar cache de respuestas 