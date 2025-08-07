/**
 * Script para actualizar imports de @altamedica/auth-service a @altamedica/auth
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Obtener lista de archivos que contienen imports de auth-service
function getFilesWithAuthService() {
  try {
    const result = execSync('grep -r "from [\'\"]\@altamedica\/auth-service" apps/', { encoding: 'utf8' });
    return result.split('\n')
      .filter(line => line.trim())
      .map(line => line.split(':')[0])
      .filter((file, index, arr) => arr.indexOf(file) === index); // deduplicar
  } catch (error) {
    // grep no encontró nada o hubo error
    return [];
  }
}

// Actualizar imports en un archivo
function updateImportsInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Reemplazar imports de auth-service por auth
    const updatedContent = content
      .replace(/from ['"]@altamedica\/auth-service/g, 'from "@altamedica/auth')
      .replace(/import\s+(.+?)\s+from\s+['"]@altamedica\/auth-service['"];?/g, 'import $1 from "@altamedica/auth";');
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Actualizado: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error actualizando ${filePath}:`, error.message);
    return false;
  }
}

// Función principal
function main() {
  console.log('🔄 Iniciando actualización de imports auth-service → auth...\n');
  
  // Lista de archivos encontrados manualmente ya que grep puede no funcionar en Windows
  const filesToUpdate = [
    'apps/patients/src/hooks/index.ts',
    'apps/patients/src/app/appointments/[id]/page.tsx',
    'apps/doctors/src/app/client-layout.tsx',
    'apps/companies/src/components/marketplace/MessagingSystem.tsx',
    'apps/doctors/src/components/layout/DoctorLayout.tsx',
    'apps/doctors/src/app/job-applications/page.tsx',
    'apps/companies/src/app/b2c-communication/page.tsx',
    'apps/companies/src/app/layout.tsx',
    'apps/web-app/src/components/auth/RegisterForm.tsx',
    'apps/web-app/src/app/(auth)/verify-email/page.tsx',
    'apps/web-app/src/components/auth/CompleteProfileForm.tsx',
    'apps/web-app/src/components/auth/ForgotPasswordForm.tsx',
    'apps/web-app/src/app/layout.tsx',
    'apps/web-app/src/components/auth/GoogleSignInButton.tsx',
    'apps/web-app/src/app/test-google-oauth/page.tsx',
    'apps/patients/src/providers/AuthProvider.tsx',
    'apps/patients/src/providers/AuthProviderUnifiedMigration.tsx',
    'apps/patients/src/hooks/useAppointmentService.ts',
    'apps/doctors/src/components/telemedicine/IntegratedDoctorVideoCall.tsx',
    'apps/doctors/src/app/telemedicine/page.tsx',
    'apps/companies/src/providers/AuthProvider.tsx',
    'apps/admin/src/providers/AuthProvider.tsx',
    'apps/admin/src/hooks/useRequireAuth.ts',
    'apps/patients/src/app/dashboard-layout.tsx',
    'apps/patients/src/components/layout/PatientLayout.tsx',
    'apps/patients/src/components/layout/PatientLayoutModular.tsx',
    'apps/admin/src/app/layout.tsx',
    'apps/patients/src/app/login/page.tsx',
    'apps/patients/src/app/dashboard/page.tsx',
    'apps/patients/src/app/layout.tsx',
    'apps/patients/src/hooks/useLoginForm.tsx',
    'apps/patients/src/hooks/useAnamnesis.ts',
    'apps/web-app/src/hooks/useRedirection.ts',
    'apps/web-app/src/components/auth/AuthGuard.tsx',
    'apps/web-app/src/hooks/useProtectedRoute.ts',
    'apps/web-app/src/components/auth/RouteGuard.tsx',
    'apps/web-app/src/components/debug/LoginDebugger.tsx',
    'apps/admin/src/components/layout/AdminLayout.tsx',
    'apps/companies/src/hooks/useMarketplaceNotifications.ts',
    'apps/doctors/src/hooks/api/index.ts',
    'apps/doctors/src/hooks/useDashboardData.ts',
    'apps/doctors/src/hooks/useMarketplaceNotifications.ts',
    'apps/doctors/src/hooks/useTelemedicineWebSocket.ts',
    'apps/patients/src/components/auth/index.ts',
    'apps/patients/src/hooks/api/index.ts',
    'apps/patients/src/hooks/useTelemedicineSessionHybrid.ts',
    'apps/patients/src/hooks/useWebRTCHybrid.ts',
    'apps/admin/src/app/dashboard/page.tsx',
    'apps/admin/src/app/login/page.tsx',
    'apps/patients/src/app/telemedicine/page.tsx',
    'apps/patients/src/components/layout/PatientHeaderModular.tsx',
    'apps/patients/src/components/layout/PatientSidebar.tsx',
    'apps/patients/src/components/layout/PatientSidebarModular.tsx',
    'apps/patients/src/components/telemedicine/IntegratedVideoCall.tsx',
    'apps/patients/src/hooks/firebase-auth-adapter.tsx'
  ];
  
  let totalUpdated = 0;
  let totalErrors = 0;
  
  for (const filePath of filesToUpdate) {
    if (fs.existsSync(filePath)) {
      if (updateImportsInFile(filePath)) {
        totalUpdated++;
      }
    } else {
      console.log(`⚠️  Archivo no encontrado: ${filePath}`);
    }
  }
  
  console.log(`\n📊 Resumen:`);
  console.log(`✅ Archivos actualizados: ${totalUpdated}`);
  console.log(`❌ Errores: ${totalErrors}`);
  console.log(`\n🎉 ¡Migración de imports completada!`);
}

// Ejecutar
main();