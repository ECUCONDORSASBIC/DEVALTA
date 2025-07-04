// Módulo ESM (Next.js)
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  UserPlus,
  Users,
  Mail,
  Phone,
  Calendar,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Shield,
  Activity,
  TrendingUp,
  AlertCircle,
  UserCheck,
  UserX,
  Send,
  Download,
  Upload
} from "lucide-react";

// === TIPOS TYPESCRIPT ===
interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  joinedDate: string;
  lastActivity: string;
  rating: number;
  totalConsultations: number;
  completedConsultations: number;
  averageRating: number;
  location: string;
  experience: string;
  certifications: string[];
  availability: 'full_time' | 'part_time' | 'flexible';
  notes?: string;
}

interface DoctorInvitation {
  id: string;
  name: string;
  email: string;
  specialty: string;
  invitedDate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresDate: string;
  invitedBy: string;
  notes?: string;
}

interface DoctorRating {
  id: string;
  doctorId: string;
  doctorName: string;
  rating: number;
  comment: string;
  reviewer: string;
  date: string;
  category: 'professionalism' | 'communication' | 'expertise' | 'availability';
}

// === DATOS CONSTANTES ===
const DOCTORS: Doctor[] = [
  {
    id: "1",
    name: "Dr. María González",
    email: "maria.gonzalez@email.com",
    specialty: "Cardiología",
    phone: "+54 11 1234-5678",
    status: "active",
    joinedDate: "2024-06-15",
    lastActivity: "2025-01-23 14:30",
    rating: 4.9,
    totalConsultations: 156,
    completedConsultations: 142,
    averageRating: 4.8,
    location: "Buenos Aires, Argentina",
    experience: "8 años",
    certifications: ["Cardiología", "Ecocardiografía", "Rehabilitación Cardíaca"],
    availability: "full_time",
    notes: "Excelente profesional, muy puntual y dedicada"
  },
  {
    id: "2",
    name: "Dr. Carlos Silva",
    email: "carlos.silva@email.com",
    specialty: "Neurología",
    phone: "+54 11 2345-6789",
    status: "active",
    joinedDate: "2024-08-20",
    lastActivity: "2025-01-23 10:15",
    rating: 4.7,
    totalConsultations: 89,
    completedConsultations: 85,
    averageRating: 4.6,
    location: "Buenos Aires, Argentina",
    experience: "12 años",
    certifications: ["Neurología", "Neurofisiología", "Trastornos del Movimiento"],
    availability: "part_time",
    notes: "Especialista en trastornos del movimiento"
  },
  {
    id: "3",
    name: "Dra. Ana Rodríguez",
    email: "ana.rodriguez@email.com",
    specialty: "Pediatría",
    phone: "+54 11 3456-7890",
    status: "inactive",
    joinedDate: "2024-05-10",
    lastActivity: "2025-01-15 16:45",
    rating: 4.8,
    totalConsultations: 234,
    completedConsultations: 220,
    averageRating: 4.7,
    location: "Buenos Aires, Argentina",
    experience: "15 años",
    certifications: ["Pediatría", "Neonatología", "Medicina Familiar"],
    availability: "flexible",
    notes: "En licencia médica hasta febrero 2025"
  },
  {
    id: "4",
    name: "Dr. Roberto Fernández",
    email: "roberto.fernandez@email.com",
    specialty: "Oncología",
    phone: "+54 11 4567-8901",
    status: "pending",
    joinedDate: "2025-01-20",
    lastActivity: "2025-01-20 09:00",
    rating: 0,
    totalConsultations: 0,
    completedConsultations: 0,
    averageRating: 0,
    location: "Buenos Aires, Argentina",
    experience: "6 años",
    certifications: ["Oncología", "Radioterapia"],
    availability: "full_time",
    notes: "Pendiente de verificación de documentos"
  }
];

const INVITATIONS: DoctorInvitation[] = [
  {
    id: "1",
    name: "Dr. Laura Mendoza",
    email: "laura.mendoza@email.com",
    specialty: "Dermatología",
    invitedDate: "2025-01-22",
    status: "pending",
    expiresDate: "2025-02-22",
    invitedBy: "Admin Principal",
    notes: "Especialista en dermatología cosmética"
  },
  {
    id: "2",
    name: "Dr. Pedro Martínez",
    email: "pedro.martinez@email.com",
    specialty: "Traumatología",
    invitedDate: "2025-01-20",
    status: "accepted",
    expiresDate: "2025-02-20",
    invitedBy: "Admin Principal",
    notes: "Especialista en cirugía de columna"
  },
  {
    id: "3",
    name: "Dra. Carmen López",
    email: "carmen.lopez@email.com",
    specialty: "Ginecología",
    invitedDate: "2025-01-18",
    status: "rejected",
    expiresDate: "2025-02-18",
    invitedBy: "Admin Principal",
    notes: "No disponible en el horario requerido"
  }
];

const RATINGS: DoctorRating[] = [
  {
    id: "1",
    doctorId: "1",
    doctorName: "Dr. María González",
    rating: 5,
    comment: "Excelente profesional, muy atenta y dedicada con los pacientes.",
    reviewer: "Hospital Italiano",
    date: "2025-01-20",
    category: "professionalism"
  },
  {
    id: "2",
    doctorId: "1",
    doctorName: "Dr. María González",
    rating: 4,
    comment: "Muy buena comunicación, explica todo claramente.",
    reviewer: "Clínica Alemana",
    date: "2025-01-18",
    category: "communication"
  },
  {
    id: "3",
    doctorId: "2",
    doctorName: "Dr. Carlos Silva",
    rating: 5,
    comment: "Gran experiencia en su especialidad, muy recomendado.",
    reviewer: "Hospital Metropolitano",
    date: "2025-01-15",
    category: "expertise"
  }
];

// === COMPONENTES ===
const DoctorCard = React.memo<{
  doctor: Doctor;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onSuspend: (id: string) => void;
}>(({ doctor, onEdit, onView, onSuspend }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'suspended': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <UserX className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'suspended': return <XCircle className="w-4 h-4" />;
      default: return <UserCheck className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
            <span className={`px-2 py-1 text-xs rounded-full font-semibold flex items-center gap-1 ${getStatusColor(doctor.status)}`}>
              {getStatusIcon(doctor.status)}
              {doctor.status === 'active' ? 'Activo' :
               doctor.status === 'inactive' ? 'Inactivo' :
               doctor.status === 'pending' ? 'Pendiente' : 'Suspendido'}
            </span>
          </div>
          <p className="text-sm text-gray-600">{doctor.specialty}</p>
          <p className="text-xs text-gray-500">{doctor.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm font-medium">{doctor.averageRating}</span>
          </div>
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-gray-500">Consultas Totales</p>
          <p className="font-semibold">{doctor.totalConsultations}</p>
        </div>
        <div>
          <p className="text-gray-500">Completadas</p>
          <p className="font-semibold">{doctor.completedConsultations}</p>
        </div>
        <div>
          <p className="text-gray-500">Experiencia</p>
          <p className="font-semibold">{doctor.experience}</p>
        </div>
        <div>
          <p className="text-gray-500">Ubicación</p>
          <p className="font-semibold">{doctor.location}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <span>Última actividad: {new Date(doctor.lastActivity).toLocaleString()}</span>
        <span>Unido: {new Date(doctor.joinedDate).toLocaleDateString()}</span>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onView(doctor.id)}
          className="flex-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          <Eye className="w-4 h-4 mr-1" />
          Ver Perfil
        </button>
        <button
          onClick={() => onEdit(doctor.id)}
          className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Edit className="w-4 h-4" />
        </button>
        {doctor.status === 'active' && (
          <button
            onClick={() => onSuspend(doctor.id)}
            className="px-3 py-2 text-sm text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
});
DoctorCard.displayName = "DoctorCard";

const InvitationCard = React.memo<{
  invitation: DoctorInvitation;
  onResend: (id: string) => void;
  onCancel: (id: string) => void;
  onView: (id: string) => void;
}>(({ invitation, onResend, onCancel, onView }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'expired': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{invitation.name}</h3>
            <span className={`px-2 py-1 text-xs rounded-full font-semibold flex items-center gap-1 ${getStatusColor(invitation.status)}`}>
              {getStatusIcon(invitation.status)}
              {invitation.status === 'pending' ? 'Pendiente' :
               invitation.status === 'accepted' ? 'Aceptada' :
               invitation.status === 'rejected' ? 'Rechazada' : 'Expirada'}
            </span>
          </div>
          <p className="text-sm text-gray-600">{invitation.specialty}</p>
          <p className="text-xs text-gray-500">{invitation.email}</p>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mb-3">
        <div>Invitado: {new Date(invitation.invitedDate).toLocaleDateString()}</div>
        <div>Expira: {new Date(invitation.expiresDate).toLocaleDateString()}</div>
        <div>Por: {invitation.invitedBy}</div>
      </div>
      
      {invitation.notes && (
        <div className="text-xs text-gray-600 mb-3 p-2 bg-gray-50 rounded">
          {invitation.notes}
        </div>
      )}
      
      <div className="flex gap-2">
        {invitation.status === 'pending' && (
          <>
            <button
              onClick={() => onResend(invitation.id)}
              className="flex-1 px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4 mr-1" />
              Reenviar
            </button>
            <button
              onClick={() => onCancel(invitation.id)}
              className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </>
        )}
        <button
          onClick={() => onView(invitation.id)}
          className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
});
InvitationCard.displayName = "InvitationCard";

const RatingCard = React.memo<{
  rating: DoctorRating;
}>(({ rating }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'professionalism': return 'bg-blue-100 text-blue-700';
      case 'communication': return 'bg-green-100 text-green-700';
      case 'expertise': return 'bg-purple-100 text-purple-700';
      case 'availability': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{rating.doctorName}</h3>
          <p className="text-sm text-gray-600">{rating.reviewer}</p>
        </div>
        <div className="flex items-center">
          <Star className="h-4 w-4 text-yellow-500 mr-1" />
          <span className="text-sm font-medium">{rating.rating}</span>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mb-3">
        <div>Fecha: {new Date(rating.date).toLocaleDateString()}</div>
        <div className="mt-1">
          <span className={`px-2 py-1 rounded-full ${
            rating.category === 'professionalism' ? 'bg-blue-100 text-blue-700' :
            rating.category === 'communication' ? 'bg-green-100 text-green-700' :
            rating.category === 'expertise' ? 'bg-purple-100 text-purple-700' :
            'bg-orange-100 text-orange-700'
          }`}>
            {rating.category === 'professionalism' ? 'Profesionalismo' :
             rating.category === 'communication' ? 'Comunicación' :
             rating.category === 'expertise' ? 'Experiencia' : 'Disponibilidad'}
          </span>
        </div>
      </div>
      
      <p className="text-sm text-gray-600">{rating.comment}</p>
    </div>
  );
});
RatingCard.displayName = "RatingCard";

// === COMPONENTE PRINCIPAL ===
const DoctorsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'doctors' | 'invitations' | 'ratings'>('doctors');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filtrar doctores
  const filteredDoctors = useMemo(() => {
    return DOCTORS.filter(doctor => {
      if (searchQuery && !doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !doctor.email.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (statusFilter !== 'all' && doctor.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [searchQuery, statusFilter]);

  const handleEdit = (id: string) => {
    console.log('Editar doctor:', id);
  };

  const handleView = (id: string) => {
    console.log('Ver doctor:', id);
  };

  const handleSuspend = (id: string) => {
    console.log('Suspender doctor:', id);
  };

  const handleResendInvitation = (id: string) => {
    console.log('Reenviar invitación:', id);
  };

  const handleCancelInvitation = (id: string) => {
    console.log('Cancelar invitación:', id);
  };

  const stats = useMemo(() => ({
    total: DOCTORS.length,
    active: DOCTORS.filter(d => d.status === 'active').length,
    pending: DOCTORS.filter(d => d.status === 'pending').length,
    inactive: DOCTORS.filter(d => d.status === 'inactive').length
  }), []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver al Dashboard
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Gestión de Médicos</h1>
          <div className="flex items-center gap-4">
            <button className="flex items-center px-4 py-2 text-white bg-gray-700 rounded-md hover:bg-gray-800 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Invitar Médico
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Estadísticas */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-gray-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Médicos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <UserCheck className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <UserX className="w-8 h-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Inactivos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'doctors', label: 'Médicos', count: stats.total },
                { id: 'invitations', label: 'Invitaciones', count: INVITATIONS.length },
                { id: 'ratings', label: 'Ratings', count: RATINGS.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-gray-700 text-gray-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs font-medium">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenido de tabs */}
        {activeTab === 'doctors' && (
          <div>
            {/* Filtros */}
            <div className="mb-6 flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                <input
                  type="text"
                  placeholder="Buscar médicos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="pending">Pendientes</option>
                <option value="suspended">Suspendidos</option>
              </select>
            </div>

            {/* Lista de médicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={doctor}
                  onEdit={handleEdit}
                  onView={handleView}
                  onSuspend={handleSuspend}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'invitations' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {INVITATIONS.map((invitation) => (
                <InvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  onResend={handleResendInvitation}
                  onCancel={handleCancelInvitation}
                  onView={handleView}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ratings' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {RATINGS.map((rating) => (
                <RatingCard key={rating.id} rating={rating} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default DoctorsPage;
// Tipo de módulo: ESM (Next.js) 