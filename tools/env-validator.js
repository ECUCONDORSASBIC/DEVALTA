// tools/env-validator.js
const requiredVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'NODE_ENV'
];

function validateEnvironment() {
  console.log('🔍 VALIDANDO VARIABLES DE ENTORNO ALTAMEDICADEV');
  let allValid = true;
  for (const key of requiredVars) {
    const value = process.env[key];
    if (!value) {
      console.log(`❌ ${key}: FALTANTE`);
      allValid = false;
    } else {
      console.log(`✅ ${key}: OK`);
    }
  }
  if (!allValid) {
    process.exit(1);
  }
}

if (require.main === module) {
  validateEnvironment();
}
