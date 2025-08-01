# Guía de Testing Manual - Flujo de Autenticación

## 🧪 Lista de Verificación del Flujo de Autenticación

### 1. Registro de Usuario (/register)
- [ ] Navegar a http://localhost:3000/register
- [ ] Verificar que el formulario se muestra correctamente
- [ ] Llenar todos los campos:
  - Nombre: Test
  - Apellido: User
  - Email: test@example.com
  - Teléfono: +34612345678
  - Contraseña: TestPassword123!
  - Confirmar contraseña: TestPassword123!
- [ ] Seleccionar tipo de usuario (paciente)
- [ ] Marcar checkbox de términos y condiciones
- [ ] Click en "Crear cuenta"
- [ ] Verificar mensaje de éxito
- [ ] Verificar que se muestra opción de ir al login

### 2. Login con Email/Password (/login)
- [ ] Navegar a http://localhost:3000/login
- [ ] Ingresar credenciales correctas
- [ ] Click en "Iniciar sesión"
- [ ] Verificar redirección al dashboard
- [ ] Verificar que se muestra el nombre del usuario
- [ ] Verificar que aparece el botón de logout

### 3. Dashboard Autenticado (/dashboard)
- [ ] Verificar que muestra información del usuario
- [ ] Verificar estado de cuenta (Activa)
- [ ] Verificar tipo de usuario (patient/doctor/company/admin)
- [ ] Verificar acciones rápidas según el rol
- [ ] Probar navegación a otras secciones

### 4. Perfil de Usuario (/profile)
- [ ] Navegar a http://localhost:3000/profile
- [ ] Verificar que muestra datos del usuario
- [ ] Click en "Editar perfil"
- [ ] Modificar algún campo (ej: teléfono)
- [ ] Click en "Guardar cambios"
- [ ] Verificar que los cambios se guardan

### 5. Logout
- [ ] Desde cualquier página autenticada, click en el botón de logout
- [ ] Verificar redirección a /login
- [ ] Intentar acceder a /dashboard
- [ ] Verificar que redirige a /login

### 6. Protección de Rutas
- [ ] Sin estar autenticado, intentar acceder a:
  - /dashboard → debe redirigir a /login
  - /profile → debe redirigir a /login
  - /unauthorized → debe mostrar página de acceso denegado
- [ ] Verificar que sessionStorage guarda la ruta original

### 7. Redirección Post-Login
- [ ] Sin autenticación, ir a /profile
- [ ] Verificar redirección a /login
- [ ] Hacer login con credenciales válidas
- [ ] Verificar que redirige automáticamente a /profile

### 8. Manejo de Errores
- [ ] Intentar login con email incorrecto
- [ ] Intentar login con contraseña incorrecta
- [ ] Verificar mensajes de error apropiados
- [ ] Verificar que no se pierde el email ingresado

### 9. OAuth (Google/Facebook)
- [ ] Click en "Continuar con Google"
- [ ] Verificar que abre popup de autenticación
- [ ] Completar flujo OAuth
- [ ] Verificar redirección al dashboard

### 10. Verificación de Roles
- [ ] Login como paciente → verificar acceso solo a secciones de paciente
- [ ] Login como doctor → verificar acceso a secciones médicas
- [ ] Intentar acceder a rutas no autorizadas → verificar página /unauthorized

## 📝 Notas de Testing

### Usuarios de Prueba Disponibles:
```json
{
  "paciente": {
    "email": "paciente.test@email.com",
    "password": "Patient123!"
  },
  "doctor": {
    "email": "dr.martinez@altamedica.com",
    "password": "Doctor123!"
  },
  "admin": {
    "email": "admin@altamedica.com",
    "password": "Admin123!"
  }
}
```

### Comandos Útiles:
```bash
# Ver logs del servidor
tail -f logs/api-server.log

# Limpiar sesión en el navegador
# Abrir DevTools > Application > Storage > Clear site data

# Verificar Firebase Auth
# Firebase Console > Authentication > Users
```

### Puntos Críticos a Verificar:
1. **Persistencia de sesión**: Refrescar la página no debe cerrar sesión
2. **Tokens expirados**: Después de largo tiempo inactivo, debe pedir re-login
3. **Múltiples pestañas**: Login en una pestaña debe reflejarse en otras
4. **Botón atrás**: No debe permitir volver a páginas de auth después de login

### Reporte de Bugs:
Si encuentras algún problema, documenta:
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si es visual
- Logs de consola del navegador