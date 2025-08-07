
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import *a * as path from 'path';

// Función para inicializar Firebase Admin SDK
async function initializeFirebaseAdmin() {
  if (admin.apps.length) {
    return;
  }
  
  try {
    // La ruta al service account key debe ser relativa a la raíz del proyecto
    const serviceAccountPath = path.resolve(process.cwd(), '..', 'api-server', 'altamedic-20f69-firebase-adminsdk-fbsvc-06a561d259.json');
    
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin SDK inicializado correctamente.');
  } catch (error) {
    console.error('Error al cargar el service account key. Asegúrate de que la ruta es correcta:', error.message);
    console.error('Ruta intentada:', path.resolve(process.cwd(), '..', 'api-server', 'altamedic-20f69-firebase-adminsdk-fbsvc-06a561d259.json'));
    process.exit(1);
  }
}

// Función principal para crear el usuario
async function createCompanyUser(email, password) {
  await initializeFirebaseAdmin();

  const auth = getAuth();
  const firestore = getFirestore();

  try {
    // 1. Crear el usuario en Firebase Authentication
    console.log(`Creando usuario en Firebase Auth con email: ${email}...`);
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      emailVerified: true,
      disabled: false,
    });
    console.log('Usuario creado en Firebase Auth con UID:', userRecord.uid);

    // 2. Crear el documento de perfil en Firestore
    const userProfile = {
      uid: userRecord.uid,
      email: email,
      role: 'company', // Asignar el rol de empresa
      createdAt: new Date(),
      displayName: 'Test Company User',
    };

    console.log('Creando perfil de usuario en Firestore...');
    await firestore.collection('users').doc(userRecord.uid).set(userProfile);
    console.log('Perfil de usuario creado en Firestore.');

    // 3. (Opcional) Crear un documento de empresa asociado
    const companyProfile = {
      ownerUid: userRecord.uid,
      companyName: 'Test Company Inc.',
      createdAt: new Date(),
      plan: 'basic',
    };
    await firestore.collection('companies').doc(userRecord.uid).set(companyProfile);
    console.log('Perfil de empresa creado en Firestore.');


    console.log('\n¡Éxito! Usuario de empresa creado correctamente.');
    console.log(`Email: ${email}`);
    console.log(`UID: ${userRecord.uid}`);

  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.warn(`El usuario con email ${email} ya existe.`);
      // Opcional: buscar el usuario y asegurarse de que tenga el rol correcto
      const user = await auth.getUserByEmail(email);
      await firestore.collection('users').doc(user.uid).set({ role: 'company' }, { merge: true });
      console.log(`Rol 'company' asegurado para el usuario existente.`);
    } else {
      console.error('Error al crear el usuario:', error);
      process.exit(1);
    }
  }
}

// Ejecutar el script
const email = 'test-empresa@altamedica.dev';
const password = 'Password123!'; // Contraseña más segura

createCompanyUser(email, password);
