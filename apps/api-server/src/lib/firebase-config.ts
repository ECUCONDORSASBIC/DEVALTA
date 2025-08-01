// Configuración de Firebase para ALTAMEDICA
// Sistema de gestión médica con datos reales

export const firebaseConfig = {
  // Configuración del proyecto Firebase
  projectId: process.env.FIREBASE_PROJECT_ID || 'altamedica-medical',
  
  // Configuración de Firestore
  firestore: {
    // Colecciones principales del sistema médico
    collections: {
      users: 'users',
      patients: 'patients',
      doctors: 'doctors',
      appointments: 'appointments',
      medicalRecords: 'medical_records',
      payments: 'payments',
      systemLogs: 'system_logs',
      alerts: 'alerts',
      analytics: 'analytics',
      compliance: 'compliance',
      security: 'security_events'
    },
    
    // Subcolecciones
    subcollections: {
      userSessions: 'sessions',
      userActivity: 'activity',
      appointmentHistory: 'history',
      medicalHistory: 'history',
      paymentHistory: 'history',
      auditLogs: 'audit_logs'
    }
  },
  
  // Configuración de autenticación
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'altamedica-super-secure-jwt-key-2024',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  
  // Configuración de seguridad
  security: {
    // Roles del sistema médico
    roles: {
      admin: 'admin',
      doctor: 'doctor',
      nurse: 'nurse',
      patient: 'patient',
      company: 'company'
    },
    
    // Permisos específicos para el sector médico
    permissions: {
      // Gestión de pacientes
      viewPatients: 'view_patients',
      createPatients: 'create_patients',
      updatePatients: 'update_patients',
      deletePatients: 'delete_patients',
      
      // Gestión de citas
      viewAppointments: 'view_appointments',
      createAppointments: 'create_appointments',
      updateAppointments: 'update_appointments',
      cancelAppointments: 'cancel_appointments',
      
      // Gestión médica
      viewMedicalRecords: 'view_medical_records',
      createMedicalRecords: 'create_medical_records',
      updateMedicalRecords: 'update_medical_records',
      
      // Administración
      viewAnalytics: 'view_analytics',
      manageUsers: 'manage_users',
      manageSystem: 'manage_system',
      viewCompliance: 'view_compliance'
    }
  },
  
  // Configuración de cumplimiento médico
  compliance: {
    // Estándares HIPAA
    hipaa: {
      phiFields: ['ssn', 'medicalRecordNumber', 'diagnosis', 'treatment', 'medications'],
      auditRequired: true,
      encryptionRequired: true,
      accessLogging: true
    },
    
    // Estándares GDPR
    gdpr: {
      dataRetention: '7_years',
      rightToBeForgotten: true,
      dataPortability: true,
      consentManagement: true
    }
  },
  
  // Configuración de monitoreo
  monitoring: {
    // Métricas del sistema
    metrics: {
      responseTime: true,
      errorRate: true,
      userActivity: true,
      systemHealth: true,
      databasePerformance: true
    },
    
    // Alertas
    alerts: {
      criticalThreshold: 95, // Porcentaje
      warningThreshold: 80,  // Porcentaje
      notificationChannels: ['email', 'slack', 'dashboard']
    }
  }
};

// Estructura de datos para usuarios médicos
export interface MedicalUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'doctor' | 'nurse' | 'patient' | 'company';
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[];
  profile: {
    phone?: string;
    avatar?: string;
    specialty?: string;
    licenseNumber?: string;
    department?: string;
    companyId?: string;
  };
  medicalInfo?: {
    bloodType?: string;
    allergies?: string[];
    chronicConditions?: string[];
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

// Estructura de datos para citas médicas
export interface MedicalAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  type: 'consultation' | 'follow-up' | 'telemedicine' | 'emergency';
  scheduledAt: Date;
  duration: number; // minutos
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  prescriptions?: string[];
  labOrders?: string[];
  followUpRequired: boolean;
  followUpDate?: Date;
  cost: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  roomId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Estructura de datos para registros médicos
export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  type: 'consultation' | 'diagnosis' | 'lab-result' | 'prescription' | 'procedure';
  title: string;
  description: string;
  diagnosis?: string;
  symptoms: string[];
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    oxygenSaturation?: number;
  };
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  attachments?: Array<{
    type: 'image' | 'pdf' | 'lab-result' | 'x-ray';
    url: string;
    description?: string;
  }>;
  isConfidential: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Estructura de datos para pagos
export interface MedicalPayment {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'credit_card' | 'debit_card' | 'insurance' | 'cash';
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    coverage: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Estructura de datos para logs del sistema
export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  category: 'auth' | 'appointment' | 'payment' | 'medical' | 'system' | 'security';
  message: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Estructura de datos para alertas del sistema
export interface SystemAlert {
  id: string;
  type: 'security' | 'performance' | 'compliance' | 'health' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Estructura de datos para métricas del sistema
export interface SystemMetrics {
  id: string;
  timestamp: Date;
  category: 'performance' | 'security' | 'compliance' | 'health';
  metrics: {
    responseTime: number;
    errorRate: number;
    activeUsers: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    databaseConnections: number;
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
  };
  metadata?: Record<string, any>;
} 