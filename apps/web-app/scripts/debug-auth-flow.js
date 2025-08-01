#!/usr/bin/env node

/**
 * Script de depuración para el flujo de autenticación
 * 
 * Para usar este script:
 * 1. Abre la consola del navegador (F12)
 * 2. Navega a http://localhost:3000/login
 * 3. Intenta iniciar sesión y observa los logs
 */

console.log(`
🔍 GUÍA DE DEPURACIÓN - SISTEMA DE AUTENTICACIÓN ALTAMEDICA
==========================================================

📋 ORDEN DE LOGS ESPERADO EN LOGIN:
-----------------------------------
1. [LoginPage] Formulario enviado
2. [LoginPage] Llamando a signIn...
3. [AuthContext] Iniciando proceso de login...
4. [FirebaseAuth] signIn llamado con email
5. [FirebaseAuth] Usuario autenticado exitosamente
6. [FirebaseAuth] getUserProfile llamado
7. [FirebaseAuth] Perfil encontrado
8. [AuthContext] Rol del usuario: [patient/doctor/company/admin]
9. [AuthContext] Preparando redirección...
10. [AuthContext] Ejecutando redirección a: [URL]

🔴 POSIBLES PROBLEMAS:
----------------------
1. Si no ves "[FirebaseAuth] Perfil encontrado":
   - El usuario no tiene perfil en Firestore
   - Verifica en Firebase Console > Firestore > users

2. Si ves "Rol desconocido" o rol = undefined:
   - El campo 'role' no está definido en Firestore
   - Actualiza el documento del usuario con el rol correcto

3. Si la redirección no ocurre:
   - Verifica que el puerto del microservicio esté corriendo
   - Revisa si hay errores de CORS en la consola

4. Si redirige pero vuelve a login:
   - El microservicio destino no reconoce la sesión
   - Verifica que Firebase Auth esté configurado en todos los apps

🛠️ COMANDOS ÚTILES:
-------------------
// En la consola del navegador, puedes ejecutar:

// Ver el usuario actual
firebase.auth().currentUser

// Ver el perfil en Firestore (requiere acceso)
firebase.firestore().collection('users').doc(USER_ID).get().then(doc => console.log(doc.data()))

// Forzar cierre de sesión
firebase.auth().signOut()

📊 VERIFICACIÓN DE MICROSERVICIOS:
----------------------------------
Asegúrate de que estos servicios estén corriendo:

- http://localhost:3000 (web-app) ✓
- http://localhost:3001 (api-server) ✓
- http://localhost:3002 (doctors) ✓
- http://localhost:3003 (patients) ✓
- http://localhost:3004 (companies) ✓
- http://localhost:3005 (admin) ✓

🔐 ROLES Y REDIRECCIONES:
-------------------------
patient  → localhost:3003/dashboard
doctor   → localhost:3002/dashboard
company  → localhost:3004/dashboard
admin    → localhost:3005/dashboard

💡 TIPS DE DEPURACIÓN:
----------------------
1. Abre múltiples pestañas del navegador para cada microservicio
2. Usa el modo incógnito para probar con sesiones limpias
3. Revisa Network tab para ver las redirecciones 301/302
4. Verifica que las cookies de Firebase se estén compartiendo

📝 PARA REPORTAR UN PROBLEMA:
-----------------------------
Incluye:
1. Los logs de la consola (completos)
2. El rol del usuario que estás probando
3. La URL a la que esperabas ser redirigido
4. La URL donde terminaste
5. Capturas de pantalla de errores

`);

// Función helper para verificar servicios
async function checkServices() {
  const services = [
    { name: 'Web App', url: 'http://localhost:3000' },
    { name: 'API Server', url: 'http://localhost:3001/api/health' },
    { name: 'Doctors', url: 'http://localhost:3002' },
    { name: 'Patients', url: 'http://localhost:3003' },
    { name: 'Companies', url: 'http://localhost:3004' },
    { name: 'Admin', url: 'http://localhost:3005' }
  ];

  console.log('\n🔍 Verificando servicios...\n');

  for (const service of services) {
    try {
      const response = await fetch(service.url, { method: 'HEAD' });
      console.log(`✅ ${service.name}: ACTIVO (${service.url})`);
    } catch (error) {
      console.log(`❌ ${service.name}: NO RESPONDE (${service.url})`);
    }
  }
}

// Si se ejecuta con Node.js
if (typeof window === 'undefined') {
  console.log('\n⚠️  Este script incluye funciones para ejecutar en el navegador.');
  console.log('Copia las funciones relevantes a la consola del navegador.\n');
}