'use client';

import { PatientForm } from '@/components/patients/PatientForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreatePatient, Patient, PatientStatus } from '@altamedica/types';
import { ColumnDef } from '@tanstack/react-table';
import { differenceInYears, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Edit, Eye, FileDown, Filter, Plus, Search, Trash2, UserCheck, Users, UserX } from 'lucide-react';
import { useMemo, useState } from 'react';

// Mock data for patients
const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'María',
    lastName: 'González',
    email: 'maria.gonzalez@email.com',
    phone: '+54 11 1234-5678',
    dni: '12345678',
    dateOfBirth: new Date('1990-05-15'),
    gender: 'Femenino',
    address: 'Av. Corrientes 1234',
    city: 'Buenos Aires',
    state: 'CABA',
    zipCode: 'C1043',
    country: 'Argentina',
    status: PatientStatus.ACTIVE,
    bloodType: 'O+',
    emergencyContact: {
      name: 'Carlos González',
      relationship: 'Esposo',
      phone: '+54 11 8765-4321'
    },
    allergies: [
      {
        id: '1',
        allergen: 'Penicilina',
        severity: 'Severa',
        reaction: 'Erupción cutánea'
      }
    ],
    chronicConditions: [],
    currentMedications: [],
    medicalHistory: [],
    notes: 'Paciente colaboradora, sin complicaciones',
    tags: ['VIP', 'Frecuente'],
    preferredLanguage: 'Español',
    preferredCommunication: 'Email',
    consentForMarketing: true,
    consentForDataSharing: false,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    createdBy: 'user-1',
    companyId: 'company-1',
    lastVisit: new Date('2024-01-10').toISOString(),
    totalVisits: 5,
    totalSpent: 2500
  },
  // Agregar más pacientes mock...
];

export default function PatientsPage() {
  const [patients] = useState<Patient[]>(mockPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesSearch = searchTerm === '' || 
        patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.dni.includes(searchTerm);
      
      const matchesStatus = selectedStatus === 'all' || patient.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [patients, searchTerm, selectedStatus]);

  const patientStats = useMemo(() => {
    const total = patients.length;
    const active = patients.filter(p => p.status === PatientStatus.ACTIVE).length;
    const inactive = patients.filter(p => p.status === PatientStatus.INACTIVE).length;
    const withAllergies = patients.filter(p => p.allergies.length > 0).length;
    
    return { total, active, inactive, withAllergies };
  }, [patients]);

  const calculateAge = (dateOfBirth: Date) => {
    return differenceInYears(new Date(), dateOfBirth);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      [PatientStatus.ACTIVE]: { variant: 'default' as const, label: 'Activo' },
      [PatientStatus.INACTIVE]: { variant: 'secondary' as const, label: 'Inactivo' },
      [PatientStatus.DECEASED]: { variant: 'destructive' as const, label: 'Fallecido' },
      [PatientStatus.TRANSFERRED]: { variant: 'outline' as const, label: 'Transferido' },
    };

    const config = statusConfig[status] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns: ColumnDef<Patient>[] = [
    {
      accessorKey: 'lastName',
      header: 'Paciente',
      cell: ({ row }) => {
        const patient = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {patient.lastName}, {patient.firstName}
            </span>
            <span className="text-sm text-gray-500">{patient.email}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'dni',
      header: 'DNI',
    },
    {
      accessorKey: 'dateOfBirth',
      header: 'Edad',
      cell: ({ row }) => {
        const age = calculateAge(row.original.dateOfBirth);
        return `${age} años`;
      },
    },
    {
      accessorKey: 'phone',
      header: 'Teléfono',
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'lastVisit',
      header: 'Última Visita',
      cell: ({ row }) => {
        if (!row.original.lastVisit) return 'Nunca';
        return format(new Date(row.original.lastVisit), 'dd/MM/yyyy', { locale: es });
      },
    },
    {
      accessorKey: 'totalVisits',
      header: 'Visitas',
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const patient = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <div className="h-4 w-4">⋮</div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewPatient(patient)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditPatient(patient)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleScheduleAppointment(patient)}>
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Cita
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeletePatient(patient)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleCreatePatient = (patientData: CreatePatient) => {
    console.log('Creating patient:', patientData);
    // Aquí iría la lógica para crear el paciente
    setIsFormOpen(false);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsFormOpen(true);
  };

  const handleViewPatient = (patient: Patient) => {
    console.log('Viewing patient:', patient);
    // Aquí iría la lógica para ver los detalles del paciente
  };

  const handleDeletePatient = (patient: Patient) => {
    console.log('Deleting patient:', patient);
    // Aquí iría la lógica para eliminar el paciente
  };

  const handleScheduleAppointment = (patient: Patient) => {
    console.log('Scheduling appointment for:', patient);
    // Aquí iría la lógica para agendar una cita
  };

  const handleExportData = () => {
    console.log('Exporting patient data');
    // Aquí iría la lógica para exportar datos
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
          <p className="text-gray-600 mt-2">
            Administra la información de tus pacientes de manera integral
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExportData}>
            <FileDown className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedPatient(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Paciente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
                </DialogTitle>
              </DialogHeader>
              <PatientForm
                patient={selectedPatient ? {
                  ...selectedPatient,
                  dateOfBirth: selectedPatient.dateOfBirth,
                } : undefined}
                onSubmit={handleCreatePatient}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Pacientes registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{patientStats.active}</div>
            <p className="text-xs text-muted-foreground">
              {patientStats.total > 0 ? ((patientStats.active / patientStats.total) * 100).toFixed(1) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Inactivos</CardTitle>
            <UserX className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{patientStats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              {patientStats.total > 0 ? ((patientStats.inactive / patientStats.total) * 100).toFixed(1) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Alergias</CardTitle>
            <div className="h-4 w-4 bg-red-100 rounded-full flex items-center justify-center">
              <div className="h-2 w-2 bg-red-600 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{patientStats.withAllergies}</div>
            <p className="text-xs text-muted-foreground">
              Requieren atención especial
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
          <CardDescription>
            Encuentra pacientes específicos usando los filtros disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre, email o DNI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value={PatientStatus.ACTIVE}>Activos</option>
                <option value={PatientStatus.INACTIVE}>Inactivos</option>
                <option value={PatientStatus.TRANSFERRED}>Transferidos</option>
              </select>
              
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Pacientes</CardTitle>
              <CardDescription>
                {filteredPatients.length} paciente(s) encontrado(s)
              </CardDescription>
            </div>
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'table' | 'cards')}>
              <TabsList>
                <TabsTrigger value="table">Tabla</TabsTrigger>
                <TabsTrigger value="cards">Tarjetas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'table' ? (
            <DataTable
              columns={columns}
              data={filteredPatients}
              searchKey="lastName"
              placeholder="Buscar pacientes..."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {patient.firstName} {patient.lastName}
                      </CardTitle>
                      {getStatusBadge(patient.status)}
                    </div>
                    <CardDescription>{patient.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Edad:</span>
                      <span>{calculateAge(patient.dateOfBirth)} años</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">DNI:</span>
                      <span>{patient.dni}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Teléfono:</span>
                      <span>{patient.phone}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Visitas:</span>
                      <span>{patient.totalVisits}</span>
                    </div>
                    {patient.allergies.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="destructive" className="text-xs">
                          ⚠️ Alergias
                        </Badge>
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewPatient(patient)}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditPatient(patient)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredPatients.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron pacientes</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedStatus !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza agregando tu primer paciente'
                }
              </p>
              {!searchTerm && selectedStatus === 'all' && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primer Paciente
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}