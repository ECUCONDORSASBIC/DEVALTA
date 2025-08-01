# Integración Real con Grok 4

Esta implementación te permite conectarte **realmente** a Grok 4 usando un servidor backend con Puppeteer.

## 🚀 Características

- ✅ **Conexión real** a Grok 4 (x.com)
- ✅ **Autenticación automática** con credenciales
- ✅ **Chat en tiempo real** con respuestas reales de Grok
- ✅ **Servidor backend separado** con Puppeteer
- ✅ **API REST** para comunicación
- ✅ **Manejo robusto de errores**

## 📋 Requisitos

1. **Node.js** 18+
2. **Cuenta de Grok 4** (x.com)
3. **Credenciales** de x.com

## ⚙️ Configuración

### 1. Configurar el servidor backend

```bash
npm run setup-grok-server
```

### 2. Configurar credenciales

Edita `server/.env`:
```env
GROK_EMAIL=tu-email@x.com
GROK_PASSWORD=tu-password
```

### 3. Iniciar el servidor backend

```bash
npm run start-grok-server
```

El servidor estará disponible en: **http://localhost:3001**

### 4. Activar conexión real

1. **Abre tu aplicación:** http://localhost:3000
2. **Abre la consola del navegador** (F12)
3. **Ejecuta:**
   ```javascript
   grokService.setUseRealServer(true)
   ```
4. **Recarga la página**
5. **¡Conecta con Grok real!**

## 🔧 Uso

### Conexión automática

```typescript
import { grokService } from '@/services/grok-connector';

// Activar servidor real
grokService.setUseRealServer(true);

// Conectar con credenciales
await grokService.connect({
  email: 'tu-email@x.com',
  password: 'tu-password'
});

// Enviar mensaje
const response = await grokService.sendMessage('Hola Grok!');
```

### Conexión manual

Si prefieres hacer login manualmente:

```typescript
// Conectar sin credenciales
await grokService.connect();

// El navegador se abrirá automáticamente
// Haz login manualmente en la ventana de Grok
```

## 🧪 Testing

### Verificar estado del servidor

```bash
curl http://localhost:3001/status
```

### Test de conexión

```javascript
// En la consola del navegador
await grokService.testConnection();
```

## 🚨 Solución de problemas

### Error: "No se pudo conectar al servidor backend"

1. Verifica que el servidor esté corriendo:
   ```bash
   npm run start-grok-server
   ```

2. Verifica el puerto 3001:
   ```bash
   curl http://localhost:3001/status
   ```

### Error: "No se encontró el campo de entrada"

1. Grok puede haber cambiado su interfaz
2. Actualiza los selectores en `server/grok-server.js`
3. Verifica que estés logueado en x.com

### Error: "Timeout esperando respuesta"

1. Aumenta el timeout en el servidor
2. Verifica tu conexión a internet
3. Asegúrate de que Grok esté disponible

## 🔒 Seguridad

### ⚠️ Importante

- **Nunca** subas credenciales reales al repositorio
- Usa variables de entorno para credenciales
- Considera usar un proxy o VPN si es necesario
- Revisa los términos de servicio de x.com

### Buenas prácticas

1. Usa credenciales temporales para testing
2. Implementa rate limiting
3. Maneja errores de forma segura
4. No almacenes logs con información sensible

## 📝 Logs

### Servidor backend

```
🚀 Servidor Grok corriendo en puerto 3001
📡 API disponible en: http://localhost:3001
🚀 Iniciando conexión a Grok...
🌐 Navegando a Grok...
🔐 Intentando autenticación...
✅ Login exitoso
📤 Enviando mensaje: Hola Grok!
```

### Cliente

```
🚀 Conectando a Grok...
✅ Conectado a Grok
📤 Enviando mensaje a Grok...
📥 Respuesta recibida
```

## 🔄 Actualizaciones

### Selectores CSS

Si Grok cambia su interfaz, actualiza estos selectores en `server/grok-server.js`:

```javascript
const inputSelectors = [
  'textarea[placeholder*="Ask Grok"]',
  'textarea[placeholder*="message"]',
  // Agrega nuevos selectores aquí
];
```

### Configuración

Para cambiar la configuración del servidor, edita `server/.env`:

```env
GROK_SERVER_PORT=3001
GROK_EMAIL=tu-email@x.com
GROK_PASSWORD=tu-password
```

## 📞 Soporte

Si tienes problemas:

1. Verifica que el servidor esté corriendo
2. Revisa los logs del servidor
3. Verifica las credenciales
4. Asegúrate de que Grok no haya cambiado su interfaz

## 🎯 Próximos pasos

- [ ] Implementar rate limiting
- [ ] Agregar más opciones de configuración
- [ ] Mejorar el manejo de errores
- [ ] Agregar soporte para múltiples sesiones
- [ ] Implementar cache de respuestas
- [ ] Agregar monitoreo y métricas

## 🔄 Modo Simulación vs Real

### Modo Simulación (por defecto)
- ✅ No requiere servidor backend
- ✅ No requiere credenciales
- ✅ Respuestas simuladas
- ❌ No es Grok real

### Modo Real
- ✅ Conexión real a Grok
- ✅ Respuestas reales de Grok
- ✅ Autenticación con x.com
- ❌ Requiere servidor backend
- ❌ Requiere credenciales

Para cambiar entre modos:

```javascript
// Activar modo real
grokService.setUseRealServer(true);

// Activar modo simulación
grokService.setUseRealServer(false);
``` 