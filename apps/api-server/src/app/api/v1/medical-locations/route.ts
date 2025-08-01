import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAuth } from '@/lib/auth';
import { auditLog } from '@/lib/audit';
import { rateLimit } from '@/lib/rate-limit';

// Esquema de validación para ubicaciones médicas
const locationSchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().min(10).max(200),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  email: z.string().email(),
  type: z.enum(['hospital', 'clinic', 'laboratory', 'pharmacy']),
  services: z.array(z.string()).min(1),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }),
  operatingHours: z.object({
    monday: z.string(),
    tuesday: z.string(),
    wednesday: z.string(),
    thursday: z.string(),
    friday: z.string(),
    saturday: z.string(),
    sunday: z.string()
  }),
  emergencyServices: z.boolean(),
  specialties: z.array(z.string()),
  insurance: z.array(z.string())
});

const searchSchema = z.object({
  query: z.string().optional(),
  type: z.enum(['hospital', 'clinic', 'laboratory', 'pharmacy']).optional(),
  city: z.string().optional(),
  specialty: z.string().optional(),
  emergency: z.boolean().optional(),
  radius: z.number().min(1).max(50).optional().default(10),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional()
});

// GET - Obtener ubicaciones médicas
export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, 'medical-locations');
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

    // Validar parámetros de búsqueda
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams);
    
    const validation = searchSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { query, type, city, specialty, emergency, radius, lat, lng } = validation.data;

    // Simular búsqueda en base de datos (reemplazar con consulta real)
    const mockLocations = [
      {
        id: '1',
        name: 'Hospital General San José',
        address: 'Av. Libertador 1234, CABA',
        phone: '+54 11 4567-8900',
        email: 'info@hospitalsanjose.com',
        type: 'hospital',
        services: ['emergencias', 'cirugía', 'pediatría', 'cardiología'],
        coordinates: { lat: -34.6037, lng: -58.3816 },
        operatingHours: {
          monday: '00:00-23:59',
          tuesday: '00:00-23:59',
          wednesday: '00:00-23:59',
          thursday: '00:00-23:59',
          friday: '00:00-23:59',
          saturday: '00:00-23:59',
          sunday: '00:00-23:59'
        },
        emergencyServices: true,
        specialties: ['cardiología', 'neurología', 'oncología'],
        insurance: ['OSDE', 'Swiss Medical', 'Galeno'],
        rating: 4.5,
        reviews: 1250
      },
      {
        id: '2',
        name: 'Clínica Santa María',
        address: 'Av. Corrientes 5678, CABA',
        phone: '+54 11 4567-8901',
        email: 'contacto@clinicasantamaria.com',
        type: 'clinic',
        services: ['consultas', 'diagnóstico', 'laboratorio'],
        coordinates: { lat: -34.6118, lng: -58.3960 },
        operatingHours: {
          monday: '08:00-20:00',
          tuesday: '08:00-20:00',
          wednesday: '08:00-20:00',
          thursday: '08:00-20:00',
          friday: '08:00-20:00',
          saturday: '08:00-14:00',
          sunday: 'Cerrado'
        },
        emergencyServices: false,
        specialties: ['medicina general', 'dermatología', 'ginecología'],
        insurance: ['OSDE', 'Medicus', 'Particular'],
        rating: 4.2,
        reviews: 845
      }
    ];

    // Aplicar filtros
    let filteredLocations = mockLocations;

    if (type) {
      filteredLocations = filteredLocations.filter(loc => loc.type === type);
    }

    if (emergency) {
      filteredLocations = filteredLocations.filter(loc => loc.emergencyServices === emergency);
    }

    if (specialty) {
      filteredLocations = filteredLocations.filter(loc => 
        loc.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
      );
    }

    if (query) {
      filteredLocations = filteredLocations.filter(loc =>
        loc.name.toLowerCase().includes(query.toLowerCase()) ||
        loc.address.toLowerCase().includes(query.toLowerCase()) ||
        loc.services.some(s => s.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Calcular distancia si se proporcionan coordenadas
    if (lat && lng) {
      filteredLocations = filteredLocations.map(loc => ({
        ...loc,
        distance: calculateDistance(lat, lng, loc.coordinates.lat, loc.coordinates.lng)
      })).filter(loc => loc.distance <= radius).sort((a, b) => a.distance - b.distance);
    }

    // Audit log
    await auditLog({
      action: 'medical_locations_search',
      userId: auth.user.id,
      resource: 'medical-locations',
      details: { searchParams: params, resultCount: filteredLocations.length }
    });

    return NextResponse.json({
      success: true,
      data: filteredLocations,
      pagination: {
        page: 1,
        limit: 50,
        total: filteredLocations.length
      }
    });

  } catch (error) {
    console.error('Error fetching medical locations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Crear nueva ubicación médica
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, 'create-location');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    // Autenticación y autorización
    const auth = await verifyAuth(req);
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar permisos de admin
    if (!auth.user.roles.includes('admin') && !auth.user.roles.includes('medical_admin')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Validar datos
    const body = await req.json();
    const validation = locationSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid location data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const locationData = validation.data;

    // Simular creación en base de datos (reemplazar con inserción real)
    const newLocation = {
      id: generateId(),
      ...locationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: auth.user.id,
      verified: false,
      status: 'active'
    };

    // Audit log
    await auditLog({
      action: 'medical_location_created',
      userId: auth.user.id,
      resource: 'medical-locations',
      resourceId: newLocation.id,
      details: { locationName: locationData.name }
    });

    return NextResponse.json({
      success: true,
      data: newLocation,
      message: 'Medical location created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating medical location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar ubicación médica
export async function PUT(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, 'update-location');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    // Autenticación y autorización
    const auth = await verifyAuth(req);
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!auth.user.roles.includes('admin') && !auth.user.roles.includes('medical_admin')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get('id');

    if (!locationId) {
      return NextResponse.json({ error: 'Location ID is required' }, { status: 400 });
    }

    // Validar datos
    const body = await req.json();
    const validation = locationSchema.partial().safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid location data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // Simular actualización en base de datos
    const updatedLocation = {
      id: locationId,
      ...updateData,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.user.id
    };

    // Audit log
    await auditLog({
      action: 'medical_location_updated',
      userId: auth.user.id,
      resource: 'medical-locations',
      resourceId: locationId,
      details: { updatedFields: Object.keys(updateData) }
    });

    return NextResponse.json({
      success: true,
      data: updatedLocation,
      message: 'Medical location updated successfully'
    });

  } catch (error) {
    console.error('Error updating medical location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar ubicación médica
export async function DELETE(req: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(req, 'delete-location');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', retryAfter: rateLimitResult.retryAfter },
        { status: 429 }
      );
    }

    // Autenticación y autorización
    const auth = await verifyAuth(req);
    if (!auth.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!auth.user.roles.includes('admin')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get('id');

    if (!locationId) {
      return NextResponse.json({ error: 'Location ID is required' }, { status: 400 });
    }

    // Simular eliminación en base de datos (soft delete)
    // En producción, implementar soft delete marcando como inactivo

    // Audit log
    await auditLog({
      action: 'medical_location_deleted',
      userId: auth.user.id,
      resource: 'medical-locations',
      resourceId: locationId,
      details: { deletedAt: new Date().toISOString() }
    });

    return NextResponse.json({
      success: true,
      message: 'Medical location deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting medical location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Función auxiliar para calcular distancia
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Función auxiliar para generar ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
