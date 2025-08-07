# Prueba Manual del Flujo SSO

## Pasos para Probar

1. **Limpiar el navegador**
   - Abre una ventana de incógnito/privada
   - O limpia las cookies de localhost

2. **Iniciar servicios**
   ```bash
   # Terminal 1 - API Server
   cd apps/api-server
   npm run dev
   
   # Terminal 2 - Web App  
   cd apps/web-app
   npm run dev
   
   # Terminal 3 - Patients App
   cd apps/patients
   npm run dev
   ```

3. **Abrir DevTools (F12)**
   - Ve a la pestaña Console
   - Limpia la consola

4. **Intentar Login**
   - Ve a http://localhost:3000/login
   - Usa las credenciales:
     - Email: `paciente.test@email.com`
     - Password: `Patient123!`
   - Click en "Iniciar Sesión"

5. **Verificar en la Consola**
   Deberías ver estos logs en orden:
   ```
   📝 [LoginPage] === FORMULARIO ENVIADO ===
   🔐 [AuthContext] === INICIO PROCESO LOGIN ===
   🔥 [AuthContext] Llamando a firebaseAuth.signIn...
   ✅ [AuthContext] Usuario autenticado
   🔑 [AuthContext] Obteniendo token SSO del API server...
   🎫 [AuthContext] ID Token de Firebase obtenido
   ✅ [AuthContext] Token SSO obtenido
   🚀 [AuthContext] Ejecutando redirección FORZADA...
   🔗 [AuthContext] URL de destino final: http://localhost:3003
   🚨 [AuthContext] Redirección a app externa detectada
   ```

6. **Verificar Cookies**
   - Ve a Application > Cookies > http://localhost:3001
   - Deberías ver: `altamedica_sso_token`

7. **Verificar Redirección**
   - Deberías ser redirigido a http://localhost:3003
   - Si no, revisa si hay errores en la consola

## Si NO Funciona

### A. Se queda en "Cargando dashboard 100%"
- Verifica que veas el log: "Redirección a app externa detectada"
- Si no lo ves, el problema está antes del SSO

### B. Error "Failed to fetch"
- El API server no está corriendo
- Ejecuta: `npm run dev:api-server`

### C. Error 401 en verify-sso
- Es normal si no hay cookie SSO
- El login debería crear la cookie

### D. No se redirige
- Revisa si hay algún error de JavaScript
- Verifica que patients app esté corriendo en 3003