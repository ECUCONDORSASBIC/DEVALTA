#!/usr/bin/env node
/**
 * 🔍 ANÁLISIS COMPLETO DE APIs - ALTAMEDICA
 * ========================================
 * Análisis automatizado de todas las APIs del sistema
 */

import { promises as fs } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class APIAnalyzer {
  constructor() {
    this.apis = new Map();
    this.baseApiPath = join(__dirname, 'apps/api-server/src/app/api/v1');
  }

  async analyzeAllAPIs() {
    console.log('🔍 ANÁLISIS COMPLETO DE APIs - ALTAMEDICA');
    console.log('='.repeat(50));

    const apiRoutes = await this.findAllAPIRoutes();
    
    for (const routePath of apiRoutes) {
      await this.analyzeRoute(routePath);
    }

    this.generateAPIReport();
    this.generateFrontendStrategy();
  }

  async findAllAPIRoutes() {
    const routes = [];
    
    // Lista de rutas API encontradas
    const apiPaths = [
      // USUARIOS
      'users/route.ts',
      'users/[id]/route.ts',
      
      // PACIENTES  
      'patients/route.ts',
      'patients/[id]/route.ts',
      'patients/[id]/appointments/route.ts',
      'patients/simple/route.ts',
      
      // MÉDICOS
      'doctors/route.ts',
      'doctors/[id]/route.ts',
      'doctors/[id]/patients/route.ts',
      'doctors/[id]/appointments/route.ts',
      'doctors/[id]/schedule/route.ts',
      'doctors/availability/route.ts',
      
      // CITAS
      'appointments/route.ts',
      'appointments/[id]/route.ts',
      'appointments/[id]/cancel/route.ts',
      'appointments/[id]/reschedule/route.ts',
      'appointments/[id]/complete/route.ts',
      'appointments/search/route.ts',
      'appointments/calendar/route.ts',
      
      // REGISTROS MÉDICOS
      'medical-records/route.ts',
      'medical-records/[id]/route.ts',
      
      // RECETAS
      'prescriptions/route.ts',
      'prescriptions/[id]/route.ts',
      'prescriptions/verify/route.ts',
      
      // TELEMEDICINA
      'telemedicine/sessions/route.ts',
      'telemedicine/sessions/[id]/route.ts',
      'telemedicine/sessions/[id]/join/route.ts',
      'telemedicine/sessions/[id]/end/route.ts',
      'telemedicine/billing/route.ts',
      'telemedicine/billing/[id]/route.ts',
      
      // NOTIFICACIONES
      'notifications/route.ts',
      'notifications/[id]/route.ts',
      'notifications/mark-all-read/route.ts',
      
      // MENSAJES
      'messages/route.ts',
      'messages/[id]/route.ts',
      
      // UBICACIONES MÉDICAS
      'medical-locations/route.ts',
      'medical-locations/[id]/route.ts',
      'medical-locations/nearby/route.ts',
      
      // MÉTRICAS Y DEBUG
      'metrics/route.ts',
      'debug/appointments/route.ts',
      'test/create-patient/route.ts',
      'test/appointments/route.ts'
    ];

    return apiPaths;
  }

  async analyzeRoute(routePath) {
    try {
      const fullPath = join(this.baseApiPath, routePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      
      const analysis = {
        path: routePath,
        endpoint: this.pathToEndpoint(routePath),
        methods: this.extractMethods(content),
        authentication: this.checkAuthentication(content),
        validation: this.checkValidation(content),
        errorHandling: this.checkErrorHandling(content),
        pagination: this.checkPagination(content),
        filtering: this.checkFiltering(content),
        realtime: this.checkRealtime(content),
        complexity: this.assessComplexity(content)
      };

      this.apis.set(routePath, analysis);
    } catch (error) {
      console.log(`⚠️ No se pudo analizar: ${routePath}`);
    }
  }

  pathToEndpoint(routePath) {
    return '/api/v1/' + routePath
      .replace('/route.ts', '')
      .replace(/\[([^\]]+)\]/g, ':$1');
  }

  extractMethods(content) {
    const methods = [];
    if (content.includes('export async function GET')) methods.push('GET');
    if (content.includes('export async function POST')) methods.push('POST');
    if (content.includes('export async function PUT')) methods.push('PUT');
    if (content.includes('export async function DELETE')) methods.push('DELETE');
    if (content.includes('export async function PATCH')) methods.push('PATCH');
    return methods;
  }

  checkAuthentication(content) {
    return content.includes('auth') || content.includes('token') || content.includes('user');
  }

  checkValidation(content) {
    return content.includes('zod') || content.includes('validate') || content.includes('schema');
  }

  checkErrorHandling(content) {
    return content.includes('try') && content.includes('catch');
  }

  checkPagination(content) {
    return content.includes('page') || content.includes('limit') || content.includes('offset');
  }

  checkFiltering(content) {
    return content.includes('filter') || content.includes('search') || content.includes('query');
  }

  checkRealtime(content) {
    return content.includes('websocket') || content.includes('sse') || content.includes('realtime');
  }

  assessComplexity(content) {
    const lines = content.split('\n').length;
    if (lines < 50) return 'Simple';
    if (lines < 150) return 'Medium';
    return 'Complex';
  }

  generateAPIReport() {
    console.log('\n📊 REPORTE DE APIs ENCONTRADAS:');
    console.log('='.repeat(40));

    const categories = {
      'USUARIOS': [],
      'PACIENTES': [],
      'MÉDICOS': [],
      'CITAS': [],
      'REGISTROS MÉDICOS': [],
      'RECETAS': [],
      'TELEMEDICINA': [],
      'NOTIFICACIONES': [],
      'MENSAJES': [],
      'UBICACIONES': [],
      'SISTEMA': []
    };

    // Categorizar APIs
    for (const [path, analysis] of this.apis) {
      if (path.includes('users')) categories['USUARIOS'].push(analysis);
      else if (path.includes('patients')) categories['PACIENTES'].push(analysis);
      else if (path.includes('doctors')) categories['MÉDICOS'].push(analysis);
      else if (path.includes('appointments')) categories['CITAS'].push(analysis);
      else if (path.includes('medical-records')) categories['REGISTROS MÉDICOS'].push(analysis);
      else if (path.includes('prescriptions')) categories['RECETAS'].push(analysis);
      else if (path.includes('telemedicine')) categories['TELEMEDICINA'].push(analysis);
      else if (path.includes('notifications')) categories['NOTIFICACIONES'].push(analysis);
      else if (path.includes('messages')) categories['MENSAJES'].push(analysis);
      else if (path.includes('medical-locations')) categories['UBICACIONES'].push(analysis);
      else categories['SISTEMA'].push(analysis);
    }

    // Mostrar reporte por categorías
    for (const [category, apis] of Object.entries(categories)) {
      if (apis.length > 0) {
        console.log(`\n🏥 ${category} (${apis.length} endpoints):`);
        console.log('-'.repeat(30));
        
        for (const api of apis) {
          console.log(`  📍 ${api.endpoint}`);
          console.log(`     Métodos: ${api.methods.join(', ')}`);
          console.log(`     Auth: ${api.authentication ? '✅' : '❌'}`);
          console.log(`     Validación: ${api.validation ? '✅' : '❌'}`);
          console.log(`     Complejidad: ${api.complexity}`);
        }
      }
    }

    // Estadísticas generales
    console.log('\n📈 ESTADÍSTICAS GENERALES:');
    console.log('-'.repeat(30));
    console.log(`Total de endpoints: ${this.apis.size}`);
    console.log(`Con autenticación: ${Array.from(this.apis.values()).filter(a => a.authentication).length}`);
    console.log(`Con validación: ${Array.from(this.apis.values()).filter(a => a.validation).length}`);
    console.log(`Con paginación: ${Array.from(this.apis.values()).filter(a => a.pagination).length}`);
    console.log(`Endpoints complejos: ${Array.from(this.apis.values()).filter(a => a.complexity === 'Complex').length}`);
  }

  generateFrontendStrategy() {
    console.log('\n\n🚀 ESTRATEGIA DE DESARROLLO FRONTEND');
    console.log('='.repeat(45));

    console.log('\n1️⃣ ARQUITECTURA RECOMENDADA:');
    console.log('-'.repeat(25));
    console.log('✅ Framework: Next.js 14+ (App Router)');
    console.log('✅ Estado: Zustand + React Query');
    console.log('✅ UI: Tailwind + Shadcn/ui');
    console.log('✅ Forms: React Hook Form + Zod');
    console.log('✅ Auth: NextAuth.js');

    console.log('\n2️⃣ ESTRUCTURA DE CARPETAS:');
    console.log('-'.repeat(25));
    const folderStructure = `
src/
├── app/                    # App Router pages
│   ├── (auth)/            # Auth pages
│   ├── dashboard/         # Main dashboard
│   ├── patients/          # Patient management
│   ├── doctors/           # Doctor management  
│   ├── appointments/      # Appointment system
│   └── telemedicine/      # Video consultations
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── charts/           # Medical charts
│   └── maps/             # Location components
├── lib/                  # Utilities
│   ├── api.ts           # API client
│   ├── auth.ts          # Auth configuration
│   ├── validations.ts   # Zod schemas
│   └── utils.ts         # Helper functions
├── hooks/               # Custom hooks
├── store/              # Zustand stores
└── types/              # TypeScript types`;

    console.log(folderStructure);

    console.log('\n3️⃣ PRIORIDADES DE DESARROLLO:');
    console.log('-'.repeat(30));
    
    const priorities = [
      {
        phase: 'FASE 1: Core System (Semana 1-2)',
        items: [
          '🔐 Sistema de autenticación',
          '👥 Gestión de usuarios',
          '🏥 Dashboard principal',
          '📊 Métricas básicas'
        ]
      },
      {
        phase: 'FASE 2: Patient Management (Semana 3-4)',
        items: [
          '👤 Registro de pacientes',
          '📋 Formularios médicos',
          '🗂️ Expedientes médicos',
          '🔍 Búsqueda de pacientes'
        ]
      },
      {
        phase: 'FASE 3: Appointment System (Semana 5-6)',
        items: [
          '📅 Calendario de citas',
          '⏰ Programación de citas',
          '🔔 Sistema de notificaciones',
          '📱 Recordatorios'
        ]
      },
      {
        phase: 'FASE 4: Advanced Features (Semana 7-8)',
        items: [
          '💊 Manejo de recetas',
          '📹 Telemedicina',
          '🗺️ Ubicaciones médicas',
          '💬 Sistema de mensajes'
        ]
      }
    ];

    priorities.forEach(phase => {
      console.log(`\n${phase.phase}:`);
      phase.items.forEach(item => console.log(`  ${item}`));
    });

    console.log('\n4️⃣ COMPONENTES CLAVE A DESARROLLAR:');
    console.log('-'.repeat(35));

    const keyComponents = [
      '🔐 AuthProvider + LoginForm',
      '🏥 DashboardLayout + Sidebar',
      '👤 PatientForm + PatientList',
      '📅 AppointmentCalendar',
      '📋 MedicalRecordForm',
      '💊 PrescriptionManager',
      '📹 TelemedicineSession',
      '🗺️ MedicalLocationMap',
      '🔔 NotificationCenter',
      '📊 MetricsDashboard'
    ];

    keyComponents.forEach(component => console.log(`  ${component}`));

    console.log('\n5️⃣ CONFIGURACIÓN INICIAL:');
    console.log('-'.repeat(25));

    const initialSetup = `
# 1. Crear el proyecto frontend
npx create-next-app@latest frontend --typescript --tailwind --app

# 2. Instalar dependencias clave
npm install @tanstack/react-query zustand
npm install react-hook-form @hookform/resolvers zod
npm install next-auth
npm install @radix-ui/react-slot @radix-ui/react-dialog
npm install lucide-react date-fns
npm install leaflet react-leaflet

# 3. Configurar variables de entorno
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000" > .env.local`;

    console.log(initialSetup);

    console.log('\n6️⃣ HOOKS PERSONALIZADOS RECOMENDADOS:');
    console.log('-'.repeat(35));

    const customHooks = [
      'useAuth() - Manejo de autenticación',
      'usePatients() - Gestión de pacientes',  
      'useAppointments() - Manejo de citas',
      'useMedicalRecords() - Expedientes médicos',
      'usePrescriptions() - Manejo de recetas',
      'useNotifications() - Sistema de notificaciones',
      'useWebSocket() - Conexiones en tiempo real',
      'useGeolocation() - Ubicación médica'
    ];

    customHooks.forEach(hook => console.log(`  📎 ${hook}`));

    console.log('\n🎯 PRÓXIMOS PASOS INMEDIATOS:');
    console.log('-'.repeat(30));
    console.log('1. Crear estructura de carpetas');
    console.log('2. Configurar API client con React Query');
    console.log('3. Implementar sistema de autenticación');
    console.log('4. Desarrollar components base UI');
    console.log('5. Crear stores Zustand para estado global');
  }
}

// Ejecutar análisis
const analyzer = new APIAnalyzer();
analyzer.analyzeAllAPIs().catch(console.error);
