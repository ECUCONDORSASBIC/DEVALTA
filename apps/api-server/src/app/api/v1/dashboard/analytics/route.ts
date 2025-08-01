import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/auth';
import { auditLog } from '@/lib/audit';
import { rateLimit } from '@/lib/rate-limit';

// Esquemas de validación
const analyticsQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  metric: z.enum(['appointments', 'patients', 'revenue', 'treatments', 'telemedicine']).optional(),
  granularity: z.enum(['day', 'week', 'month']).optional().default('day'),
  filter: z.object({
    doctorId: z.string().optional(),
    departmentId: z.string().optional(),
    locationId: z.string().optional(),
    patientAge: z.object({
      min: z.number().min(0).max(120).optional(),
      max: z.number().min(0).max(120).optional()
    }).optional(),
    insurance: z.string().optional(),
    specialty: z.string().optional()
  }).optional()
});

const customReportSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  metrics: z.array(z.string()).min(1),
  filters: z.object({
    dateRange: z.object({
      start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
    }),
    departments: z.array(z.string()).optional(),
    doctors: z.array(z.string()).optional(),
    patients: z.array(z.string()).optional()
  }),
  format: z.enum(['json', 'csv', 'pdf']).optional().default('json'),
  schedule: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    recipients: z.array(z.string().email()).optional()
  }).optional()
});

// GET - Obtener analytics del dashboard
export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, 'analytics');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    // Autenticación
    const auth = await verifyAuth(req);
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar permisos para analytics
    if (!auth.user.roles.includes('doctor') && !auth.user.roles.includes('admin') && !auth.user.roles.includes('analyst')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Validar parámetros
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams);
    
    const validation = analyticsQuerySchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { startDate, endDate, metric, granularity, filter } = validation.data;

    // Generar datos de analytics (reemplazar con consultas reales a la base de datos)
    const analyticsData = await generateAnalyticsData(
      auth.user.id,
      auth.user.roles,
      startDate,
      endDate,
      metric,
      granularity,
      filter
    );

    // Audit log
    await auditLog({
      action: 'analytics_accessed',
      userId: auth.user.id,
      resource: 'dashboard-analytics',
      details: { 
        dateRange: { startDate, endDate },
        metric,
        granularity,
        filter 
      }
    });

    return NextResponse.json({
      success: true,
      data: analyticsData,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Crear reporte personalizado
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, 'create-report');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    // Autenticación
    const auth = await verifyAuth(req);
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar permisos para crear reportes
    if (!auth.user.roles.includes('admin') && !auth.user.roles.includes('analyst')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Validar datos del reporte
    const body = await req.json();
    const validation = customReportSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid report data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const reportData = validation.data;

    // Crear reporte personalizado
    const newReport = {
      id: generateId(),
      ...reportData,
      createdAt: new Date().toISOString(),
      createdBy: auth.user.id,
      status: 'active',
      lastRun: null,
      nextRun: reportData.schedule ? calculateNextRun(reportData.schedule) : null
    };

    // Generar el reporte inicial
    const reportResult = await generateCustomReport(newReport);

    // Audit log
    await auditLog({
      action: 'custom_report_created',
      userId: auth.user.id,
      resource: 'dashboard-analytics',
      resourceId: newReport.id,
      details: { 
        reportName: reportData.name,
        metrics: reportData.metrics,
        schedule: reportData.schedule
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        report: newReport,
        result: reportResult
      },
      message: 'Custom report created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating custom report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Función para generar datos de analytics
async function generateAnalyticsData(
  userId: string,
  userRoles: string[],
  startDate: string,
  endDate: string,
  metric?: string,
  granularity: string = 'day',
  filter?: any
) {
  // Simular datos de analytics médicos (reemplazar con consultas reales)
  const mockData = {
    overview: {
      totalPatients: 1247,
      totalAppointments: 3456,
      totalRevenue: 156780.50,
      avgWaitTime: 15.2, // minutos
      patientSatisfaction: 4.6,
      noShowRate: 0.08
    },
    appointments: {
      total: 3456,
      completed: 3102,
      cancelled: 234,
      noShow: 120,
      trends: generateTrendData(startDate, endDate, granularity, 'appointments')
    },
    patients: {
      total: 1247,
      new: 89,
      returning: 1158,
      demographics: {
        ageGroups: [
          { range: '0-17', count: 156, percentage: 12.5 },
          { range: '18-35', count: 298, percentage: 23.9 },
          { range: '36-50', count: 367, percentage: 29.4 },
          { range: '51-65', count: 289, percentage: 23.2 },
          { range: '65+', count: 137, percentage: 11.0 }
        ],
        gender: {
          male: 578,
          female: 623,
          other: 46
        }
      },
      trends: generateTrendData(startDate, endDate, granularity, 'patients')
    },
    revenue: {
      total: 156780.50,
      byDepartment: [
        { name: 'Cardiología', amount: 45230.00, percentage: 28.8 },
        { name: 'Pediatría', amount: 32145.50, percentage: 20.5 },
        { name: 'Neurología', amount: 28670.00, percentage: 18.3 },
        { name: 'Ginecología', amount: 24350.00, percentage: 15.5 },
        { name: 'Dermatología', amount: 26385.00, percentage: 16.8 }
      ],
      byInsurance: [
        { name: 'OSDE', amount: 67845.50, percentage: 43.3 },
        { name: 'Swiss Medical', amount: 42356.00, percentage: 27.0 },
        { name: 'Particular', amount: 28934.00, percentage: 18.5 },
        { name: 'Galeno', amount: 17645.00, percentage: 11.3 }
      ],
      trends: generateTrendData(startDate, endDate, granularity, 'revenue')
    },
    treatments: {
      total: 2845,
      completed: 2634,
      ongoing: 211,
      bySpecialty: [
        { name: 'Cardiología', count: 456, avgDuration: 45 },
        { name: 'Pediatría', count: 623, avgDuration: 30 },
        { name: 'Neurología', count: 345, avgDuration: 60 },
        { name: 'Ginecología', count: 298, avgDuration: 35 },
        { name: 'Dermatología', count: 234, avgDuration: 25 }
      ],
      trends: generateTrendData(startDate, endDate, granularity, 'treatments')
    },
    telemedicine: {
      total: 567,
      completed: 523,
      technical_issues: 34,
      cancelled: 10,
      avgSessionDuration: 28.5, // minutos
      patientSatisfaction: 4.4,
      trends: generateTrendData(startDate, endDate, granularity, 'telemedicine')
    },
    performance: {
      doctors: [
        { id: '1', name: 'Dr. Juan Pérez', appointments: 234, rating: 4.8, revenue: 23450.00 },
        { id: '2', name: 'Dra. María García', appointments: 189, rating: 4.6, revenue: 18900.00 },
        { id: '3', name: 'Dr. Carlos López', appointments: 156, rating: 4.7, revenue: 19800.00 }
      ],
      departments: [
        { name: 'Cardiología', efficiency: 0.92, patientSatisfaction: 4.6, revenue: 45230.00 },
        { name: 'Pediatría', efficiency: 0.89, patientSatisfaction: 4.8, revenue: 32145.50 },
        { name: 'Neurología', efficiency: 0.85, patientSatisfaction: 4.5, revenue: 28670.00 }
      ]
    }
  };

  // Aplicar filtros según los permisos del usuario
  if (userRoles.includes('doctor') && !userRoles.includes('admin')) {
    // Filtrar datos solo para el doctor específico
    return filterDataForDoctor(mockData, userId);
  }

  // Aplicar filtros personalizados
  if (filter) {
    return applyFilters(mockData, filter);
  }

  return metric ? mockData[metric] : mockData;
}

// Función para generar datos de tendencias
function generateTrendData(startDate: string, endDate: string, granularity: string, metric: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const data = [];

  let current = new Date(start);
  while (current <= end) {
    const value = generateRandomValue(metric);
    data.push({
      date: current.toISOString().split('T')[0],
      value: value,
      change: Math.random() * 20 - 10 // Cambio porcentual
    });

    // Incrementar según granularidad
    switch (granularity) {
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }

  return data;
}

// Función para generar valores aleatorios según el tipo de métrica
function generateRandomValue(metric: string): number {
  switch (metric) {
    case 'appointments':
      return Math.floor(Math.random() * 50) + 20;
    case 'patients':
      return Math.floor(Math.random() * 30) + 10;
    case 'revenue':
      return Math.floor(Math.random() * 5000) + 1000;
    case 'treatments':
      return Math.floor(Math.random() * 40) + 15;
    case 'telemedicine':
      return Math.floor(Math.random() * 20) + 5;
    default:
      return Math.floor(Math.random() * 100);
  }
}

// Función para generar reporte personalizado
async function generateCustomReport(reportConfig: any) {
  // Simular generación de reporte personalizado
  const result = {
    id: reportConfig.id,
    name: reportConfig.name,
    generatedAt: new Date().toISOString(),
    data: {
      summary: {
        totalRecords: 1247,
        dateRange: reportConfig.filters.dateRange,
        appliedFilters: reportConfig.filters
      },
      metrics: {}
    },
    format: reportConfig.format,
    downloadUrl: `/api/reports/${reportConfig.id}/download`
  };

  // Generar datos para cada métrica solicitada
  for (const metric of reportConfig.metrics) {
    result.data.metrics[metric] = generateRandomValue(metric);
  }

  return result;
}

// Función para filtrar datos por doctor
function filterDataForDoctor(data: any, doctorId: string) {
  // Filtrar datos específicos del doctor
  return {
    ...data,
    appointments: {
      ...data.appointments,
      total: Math.floor(data.appointments.total * 0.15) // Aproximadamente 15% del total
    },
    patients: {
      ...data.patients,
      total: Math.floor(data.patients.total * 0.12) // Aproximadamente 12% del total
    }
  };
}

// Función para aplicar filtros personalizados
function applyFilters(data: any, filters: any) {
  let filteredData = { ...data };

  // Aplicar filtros según los parámetros
  if (filters.doctorId) {
    filteredData = filterDataForDoctor(filteredData, filters.doctorId);
  }

  // Más filtros según necesidades
  // ... implementar filtros adicionales

  return filteredData;
}

// Función para calcular próxima ejecución de reporte
function calculateNextRun(schedule: any): string {
  const now = new Date();
  const nextRun = new Date(now);

  switch (schedule.frequency) {
    case 'daily':
      nextRun.setDate(now.getDate() + 1);
      break;
    case 'weekly':
      nextRun.setDate(now.getDate() + 7);
      break;
    case 'monthly':
      nextRun.setMonth(now.getMonth() + 1);
      break;
  }

  if (schedule.time) {
    const [hours, minutes] = schedule.time.split(':').map(Number);
    nextRun.setHours(hours, minutes, 0, 0);
  }

  return nextRun.toISOString();
}

// Función auxiliar para generar ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
