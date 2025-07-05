import { NextRequest, NextResponse } from 'next/server';

// Tipos para ubicaciones médicas
interface MedicalLocation {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'lab' | 'pharmacy';
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  stats: {
    patients: number;
    appointments: number;
    labResults: number;
    prescriptions: number;
  };
  status: 'active' | 'inactive';
  contact: {
    phone: string;
    email: string;
  };
}

// Datos de ejemplo para Colombia
const mockMedicalLocations: MedicalLocation[] = [
  {
    id: '1',
    name: 'Hospital San Rafael',
    type: 'hospital',
    address: 'Calle 123 #45-67, Bogotá',
    location: { lat: 4.6097, lng: -74.0817 },
    stats: { patients: 150, appointments: 45, labResults: 23, prescriptions: 67 },
    status: 'active',
    contact: { phone: '+57-1-234-5678', email: 'contacto@sanrafael.com' }
  },
  {
    id: '2',
    name: 'Clínica del Country',
    type: 'clinic',
    address: 'Carrera 16 #82-57, Bogotá',
    location: { lat: 4.6527, lng: -74.0634 },
    stats: { patients: 89, appointments: 32, labResults: 15, prescriptions: 41 },
    status: 'active',
    contact: { phone: '+57-1-345-6789', email: 'info@clinicacountry.com' }
  },
  {
    id: '3',
    name: 'Laboratorio Clínico ABC',
    type: 'lab',
    address: 'Avenida 68 #23-45, Bogotá',
    location: { lat: 4.5980, lng: -74.0894 },
    stats: { patients: 67, appointments: 28, labResults: 89, prescriptions: 12 },
    status: 'active',
    contact: { phone: '+57-1-456-7890', email: 'laboratorio@abc.com' }
  },
  {
    id: '4',
    name: 'Farmacia Central',
    type: 'pharmacy',
    address: 'Calle 72 #10-34, Bogotá',
    location: { lat: 4.6533, lng: -74.0722 },
    stats: { patients: 234, appointments: 0, labResults: 0, prescriptions: 156 },
    status: 'active',
    contact: { phone: '+57-1-567-8901', email: 'farmacia@central.com' }
  },
  {
    id: '5',
    name: 'Hospital Nacional',
    type: 'hospital',
    address: 'Carrera 30 #45-12, Bogotá',
    location: { lat: 4.6254, lng: -74.0631 },
    stats: { patients: 320, appointments: 89, labResults: 45, prescriptions: 123 },
    status: 'active',
    contact: { phone: '+57-1-678-9012', email: 'contacto@hospitalnacional.com' }
  },
  {
    id: '6',
    name: 'Clínica Medilaser',
    type: 'clinic',
    address: 'Calle 134 #7-83, Bogotá',
    location: { lat: 4.7110, lng: -74.0721 },
    stats: { patients: 76, appointments: 23, labResults: 12, prescriptions: 34 },
    status: 'active',
    contact: { phone: '+57-1-789-0123', email: 'info@medilaser.com' }
  },
  {
    id: '7',
    name: 'Laboratorio Patología',
    type: 'lab',
    address: 'Avenida 15 #93-07, Bogotá',
    location: { lat: 4.6789, lng: -74.0456 },
    stats: { patients: 145, appointments: 67, labResults: 234, prescriptions: 8 },
    status: 'active',
    contact: { phone: '+57-1-890-1234', email: 'lab@patologia.com' }
  },
  {
    id: '8',
    name: 'Farmacia Pasteur',
    type: 'pharmacy',
    address: 'Calle 85 #15-23, Bogotá',
    location: { lat: 4.6687, lng: -74.0512 },
    stats: { patients: 189, appointments: 0, labResults: 0, prescriptions: 267 },
    status: 'active',
    contact: { phone: '+57-1-901-2345', email: 'sucursal@pasteur.com' }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    
    let filteredLocations = mockMedicalLocations;
    
    // Filtrar por tipo si se especifica
    if (type && type !== 'all') {
      filteredLocations = filteredLocations.filter(loc => loc.type === type);
    }
    
    // Filtrar por estado si se especifica
    if (status && status !== 'all') {
      filteredLocations = filteredLocations.filter(loc => loc.status === status);
    }
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({
      success: true,
      data: filteredLocations,
      total: filteredLocations.length,
      timestamp: new Date().toISOString(),
      filters: { type, status }
    });
    
  } catch (error) {
    console.error('Error en API medical-locations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos requeridos
    const { name, type, address, location, contact } = body;
    
    if (!name || !type || !address || !location || !contact) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Faltan campos requeridos',
          required: ['name', 'type', 'address', 'location', 'contact']
        },
        { status: 400 }
      );
    }
    
    // Crear nueva ubicación
    const newLocation: MedicalLocation = {
      id: (mockMedicalLocations.length + 1).toString(),
      name,
      type,
      address,
      location,
      contact,
      stats: { patients: 0, appointments: 0, labResults: 0, prescriptions: 0 },
      status: 'active'
    };
    
    // En una implementación real, esto se guardaría en base de datos
    mockMedicalLocations.push(newLocation);
    
    return NextResponse.json({
      success: true,
      data: newLocation,
      message: 'Ubicación médica creada exitosamente',
      timestamp: new Date().toISOString()
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creando ubicación médica:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
