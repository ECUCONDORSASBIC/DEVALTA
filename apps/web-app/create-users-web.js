#!/usr/bin/env node

/**
 * 🔧 FIREBASE TEST USERS CREATOR (WEB SDK VERSION)
 * 
 * Crea usuarios usando Firebase Web SDK (sin necesidad de billing)
 * Este método crea usuarios que pueden ser usados inmediatamente para testing
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Configuración de Firebase (desde .env.local)
const firebaseConfig = {
  apiKey: "AIzaSyAkzR3fZjtwsGu4wJ6jNnbjcSLGu3rWoGs",
  authDomain: "altamedic-20f69.firebaseapp.com", 
  projectId: "altamedic-20f69",
  storageBucket: "altamedic-20f69.firebasestorage.app",
  messagingSenderId: "131880235210",
  appId: "1:131880235210:web:35d867452b6488c245c433"
};

// Usuarios de testing (mismo data que el script anterior)
const testUsers = [
  {
    email: 'paciente2@test.com', // Usar email diferente para evitar conflictos
    password: '12345678',
    role: 'patient',
    displayName: 'Ana María García',
    profile: {
      firstName: 'Ana María',
      lastName: 'García',
      phone: '+54 11 1234-5678',
      dateOfBirth: '1985-03-15',
      gender: 'female',
      address: {
        street: 'Av. Corrientes 1234',
        city: 'CABA',
        state: 'Buenos Aires',
        zipCode: '1043',
        country: 'Argentina'
      },
      emergencyContact: {
        name: 'Carlos García',
        relationship: 'spouse',
        phone: '+54 11 9876-5432'
      },
      medicalInfo: {
        bloodType: 'O+',
        allergies: ['Penicilina', 'Frutos secos'],
        chronicConditions: [],
        currentMedications: []
      }
    }
  },
  {
    email: 'doctor2@test.com',
    password: '12345678',
    role: 'doctor',
    displayName: 'Dr. Juan Carlos Rodríguez',
    profile: {
      firstName: 'Juan Carlos',
      lastName: 'Rodríguez',
      phone: '+54 11 2345-6789',
      specialty: 'Cardiología',
      licenseNumber: 'MN-45678',
      experience: 15,
      education: {
        university: 'Universidad de Buenos Aires',
        graduationYear: 2008,
        specialization: 'Cardiología Intervencionista'
      },
      clinic: {
        name: 'Centro Cardiológico Buenos Aires',
        address: 'Av. Santa Fe 2890',
        phone: '+54 11 4567-8901'
      },
      schedule: {
        monday: { start: '09:00', end: '17:00', available: true },
        tuesday: { start: '09:00', end: '17:00', available: true },
        wednesday: { start: '09:00', end: '17:00', available: true },
        thursday: { start: '09:00', end: '17:00', available: true },
        friday: { start: '09:00', end: '15:00', available: true },
        saturday: { start: '09:00', end: '12:00', available: true },
        sunday: { available: false }
      },
      rating: 4.8,
      reviewsCount: 156,
      verified: true
    }
  },
  {
    email: 'empresa2@test.com',
    password: '12345678',
    role: 'company',
    displayName: 'Hospital San Carlos',
    profile: {
      companyName: 'Hospital San Carlos S.A.',
      businessType: 'hospital',
      taxId: '30-12345678-9',
      phone: '+54 11 3456-7890',
      website: 'https://hospitalsancarlos.com.ar',
      address: {
        street: 'Av. Rivadavia 5000',
        city: 'CABA',
        state: 'Buenos Aires',
        zipCode: '1424',
        country: 'Argentina'
      },
      contact: {
        firstName: 'María Elena',
        lastName: 'Fernández',
        position: 'Directora de Recursos Humanos',
        email: 'maria.fernandez@hospitalsancarlos.com.ar',
        phone: '+54 11 3456-7891'
      },
      employees: 250,
      services: [
        'Medicina Interna',
        'Cardiología',
        'Neurología',
        'Pediatría',
        'Emergencias 24/7'
      ],
      certifications: [
        'ISO 9001:2015',
        'Habilitación Ministerio de Salud',
        'HIPAA Compliance'
      ]
    }
  },
  {
    email: 'admin2@test.com',
    password: '12345678',
    role: 'admin',
    displayName: 'Eduardo Marques (Admin)',
    profile: {
      firstName: 'Eduardo',
      lastName: 'Marques',
      phone: '+54 11 4567-8901',
      position: 'System Administrator',
      department: 'IT & Development',
      permissions: [
        'user_management',
        'system_config',
        'data_access',
        'analytics',
        'security',
        'billing',
        'support'
      ],
      lastLogin: null,
      loginCount: 0,
      isSuper: true
    }
  }
];

console.log('🔧 CREADOR DE USUARIOS DE TESTING (WEB SDK)');
console.log('============================================\n');

// Función para crear usuarios usando Web SDK
async function createUsersWithWebSDK() {
  try {
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('🔥 Conectando a Firebase con Web SDK...\n');

    for (const userData of testUsers) {
      try {
        console.log(`👤 Creando usuario: ${userData.email}`);
        
        // Crear usuario en Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );
        
        const user = userCredential.user;
        console.log(`   ✅ Usuario creado con UID: ${user.uid}`);

        // Actualizar perfil de usuario
        await updateProfile(user, {
          displayName: userData.displayName
        });

        console.log(`   ✅ DisplayName actualizado`);

        // Crear documento en Firestore con perfil completo
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: userData.email,
          role: userData.role,
          displayName: userData.displayName,
          profile: userData.profile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isTestUser: true,
          status: 'active'
        });

        console.log(`   ✅ Perfil guardado en Firestore`);
        console.log(`   ℹ️  Nota: Custom claims deben ser configurados por Admin SDK`);
        console.log('');

      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.error(`   ⚠️  Usuario ${userData.email} ya existe`);
        } else {
          console.error(`   ❌ Error creando ${userData.email}:`, error.message);
        }
        console.log('');
      }
    }

    console.log('🎉 PROCESO COMPLETADO CON WEB SDK\n');
    
    // Generar documentación
    console.log('📋 NUEVAS CREDENCIALES CREADAS:\n');
    testUsers.forEach((user) => {
      console.log(`# ${user.role.toUpperCase()} (${user.displayName})`);
      console.log(`EMAIL_${user.role.toUpperCase()}="${user.email}"`);
      console.log(`PASS_${user.role.toUpperCase()}="${user.password}"`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Función para preview
function previewUsers() {
  console.log('📋 USUARIOS QUE SE CREARÍAN CON WEB SDK:\n');
  
  testUsers.forEach((user, index) => {
    console.log(`👤 Usuario ${index + 1}: ${user.role.toUpperCase()}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🔐 Password: ${user.password}`);
    console.log(`   👨‍💼 Nombre: ${user.displayName}`);
    console.log(`   📱 Teléfono: ${user.profile.phone || user.profile.contact?.phone || 'N/A'}`);
    
    if (user.role === 'doctor') {
      console.log(`   🏥 Especialidad: ${user.profile.specialty}`);
      console.log(`   🎓 Universidad: ${user.profile.education.university}`);
    } else if (user.role === 'company') {
      console.log(`   🏢 Empresa: ${user.profile.companyName}`);
      console.log(`   👥 Empleados: ${user.profile.employees}`);
    } else if (user.role === 'patient') {
      console.log(`   🩸 Tipo de Sangre: ${user.profile.medicalInfo.bloodType}`);
      console.log(`   ⚠️ Alergias: ${user.profile.medicalInfo.allergies.join(', ')}`);
    }
    console.log('');
  });
}

// Menú principal
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'preview':
      previewUsers();
      break;
      
    case 'create':
      console.log('🔥 CREANDO USUARIOS CON WEB SDK...');
      console.log('✅ Este método NO requiere billing habilitado.\n');
      await createUsersWithWebSDK();
      break;
      
    default:
      console.log('📖 USO DEL SCRIPT WEB SDK:\n');
      console.log('node create-users-web.js preview  # Ver usuarios que se crearían');
      console.log('node create-users-web.js create   # Crear usuarios con Web SDK');
      console.log('');
      console.log('💡 VENTAJAS WEB SDK:');
      console.log('   ✅ No requiere billing habilitado');
      console.log('   ✅ Funciona inmediatamente');
      console.log('   ⚠️ No puede configurar custom claims automáticamente');
      console.log('');
      console.log('💡 USUARIOS DE TESTING (NUEVOS):');
      console.log('   📧 paciente2@test.com / 🔐 12345678');
      console.log('   📧 doctor2@test.com   / 🔐 12345678');
      console.log('   📧 empresa2@test.com  / 🔐 12345678');
      console.log('   📧 admin2@test.com    / 🔐 12345678');
      break;
  }
}

main().catch(console.error);