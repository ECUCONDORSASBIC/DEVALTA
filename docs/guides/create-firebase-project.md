# Cómo crear un proyecto de Firebase para AltaMedica

## Opción 1: Crear tu propio proyecto (Recomendado)

1. Ve a https://console.firebase.google.com/
2. Click en "Crear un proyecto"
3. Nombre: "altamedica-dev" (o cualquier nombre)
4. Desactiva Google Analytics (para desarrollo)
5. Una vez creado, ve a "Configuración del proyecto" > "General"
6. Baja hasta "Tus apps" y click en el icono web (</>)
7. Registra la app con nombre "AltaMedica Web"
8. Copia la configuración de Firebase
9. Ve a "Authentication" en el menú lateral
10. Click en "Comenzar"
11. Habilita "Correo electrónico/contraseña"
12. Guarda los cambios

## Opción 2: Usar proyecto de prueba temporal

Mientras configuras tu proyecto, puedes usar estas credenciales temporales:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBkkFF0XhNZeWuDmOfEhsgdfX1VBG7WTas
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=friendlychat-e2174.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=friendlychat-e2174
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=friendlychat-e2174.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1051680911557
NEXT_PUBLIC_FIREBASE_APP_ID=1:1051680911557:web:0a3f0a3f0a3f0a3f0a3f0a3f
```

## URLs correctas para acceder:

- Web App: http://web.altamedica.local:3000
- Login: http://web.altamedica.local:3000/(auth)/login
- Patients: http://patients.altamedica.local:3003

NO uses http://altamedica.local:3000 - debe ser web.altamedica.local