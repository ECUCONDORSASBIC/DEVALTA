import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@altamedica/firebase/src/config-production';

interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: 'patient' | 'doctor' | 'company' | 'admin';
}

const testUsers: TestUser[] = [
  {
    email: 'admin@altamedica.com',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'ALTAMEDICA',
    phone: '+54 9 11 1111-1111',
    userType: 'admin'
  },
  {
    email: 'doctor@altamedica.com',
    password: 'Doctor123!',
    firstName: 'Dr. Juan',
    lastName: 'Médico',
    phone: '+54 9 11 2222-2222',
    userType: 'doctor'
  },
  {
    email: 'patient@altamedica.com',
    password: 'Patient123!',
    firstName: 'María',
    lastName: 'Paciente',
    phone: '+54 9 11 3333-3333',
    userType: 'patient'
  },
  {
    email: 'company@altamedica.com',
    password: 'Company123!',
    firstName: 'Clínica',
    lastName: 'Ejemplo',
    phone: '+54 9 11 4444-4444',
    userType: 'company'
  }
];

export class FirebaseAuthTester {
  
  async createTestUsers(): Promise<void> {
    console.log('🚀 Iniciando creación de usuarios de prueba...');
    
    for (const testUser of testUsers) {
      try {
        console.log(`📝 Creando usuario: ${testUser.email}`);
        
        // Crear usuario en Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          testUser.email, 
          testUser.password
        );
        
        const user = userCredential.user;
        
        // Crear perfil en Firestore
        const userProfile = {
          uid: user.uid,
          email: user.email!,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          phone: testUser.phone,
          userType: testUser.userType,
          emailVerified: true, // Para testing
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
          isActive: true
        };
        
        await setDoc(doc(db, 'users', user.uid), userProfile);
        
        console.log(`✅ Usuario creado: ${testUser.email} (${testUser.userType})`);
        
        // Cerrar sesión para el siguiente usuario
        await signOut(auth);
        
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`⚠️  Usuario ya existe: ${testUser.email}`);
        } else {
          console.error(`❌ Error creando ${testUser.email}:`, error.message);
        }
      }
    }
    
    console.log('🎉 Proceso de creación de usuarios completado');
  }
  
  async testLogin(email: string, password: string): Promise<boolean> {
    try {
      console.log(`🔐 Probando login: ${email}`);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Verificar perfil en Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const profile = userDoc.data();
        console.log(`✅ Login exitoso: ${email} (${profile.userType})`);
        console.log(`📋 Perfil:`, {
          name: `${profile.firstName} ${profile.lastName}`,
          type: profile.userType,
          emailVerified: profile.emailVerified
        });
        
        await signOut(auth);
        return true;
      } else {
        console.log(`⚠️  Usuario sin perfil: ${email}`);
        await signOut(auth);
        return false;
      }
      
    } catch (error: any) {
      console.error(`❌ Error en login ${email}:`, error.message);
      return false;
    }
  }
  
  async testAllLogins(): Promise<void> {
    console.log('🧪 Iniciando pruebas de login...');
    
    for (const testUser of testUsers) {
      await this.testLogin(testUser.email, testUser.password);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa entre tests
    }
    
    console.log('🎯 Pruebas de login completadas');
  }
  
  async testAuthFlow(): Promise<void> {
    console.log('🔄 Iniciando prueba completa del flujo de autenticación...');
    
    // Test 1: Crear usuarios
    await this.createTestUsers();
    
    // Test 2: Probar logins
    await this.testAllLogins();
    
    // Test 3: Probar login con credenciales incorrectas
    console.log('🚫 Probando credenciales incorrectas...');
    const wrongPasswordResult = await this.testLogin('admin@altamedica.com', 'WrongPassword123!');
    const nonExistentUserResult = await this.testLogin('noexiste@altamedica.com', 'Password123!');
    
    if (!wrongPasswordResult && !nonExistentUserResult) {
      console.log('✅ Validación de credenciales incorrectas exitosa');
    }
    
    console.log('🏁 Prueba completa del flujo de autenticación finalizada');
  }
  
  async cleanupTestUsers(): Promise<void> {
    console.log('🧹 Limpiando usuarios de prueba...');
    
    for (const testUser of testUsers) {
      try {
        await signInWithEmailAndPassword(auth, testUser.email, testUser.password);
        const user = auth.currentUser;
        
        if (user) {
          // Eliminar documento de Firestore
          // await deleteDoc(doc(db, 'users', user.uid)); // Descomenta si quieres eliminar datos
          
          // Eliminar usuario de Auth
          // await user.delete(); // Descomenta si quieres eliminar usuarios
          
          console.log(`🗑️  Usuario procesado para limpieza: ${testUser.email}`);
        }
        
        await signOut(auth);
        
      } catch (error) {
        console.log(`⚠️  No se pudo procesar: ${testUser.email}`);
      }
    }
    
    console.log('✨ Limpieza completada');
  }
}

// Función para ejecutar en consola del navegador
export const runFirebaseTests = async () => {
  const tester = new FirebaseAuthTester();
  await tester.testAuthFlow();
};

// Para usar en desarrollo
if (typeof window !== 'undefined') {
  (window as any).runFirebaseTests = runFirebaseTests;
  (window as any).FirebaseAuthTester = FirebaseAuthTester;
}

export default FirebaseAuthTester;