/**
 * 👥 USER SCHEMAS - ALTAMEDICA
 * Schemas para usuarios, doctores, y roles del sistema
 */

import { z } from 'zod';
import { 
  BaseEntitySchema, 
  AddressSchema, 
  ContactInfoSchema, 
  NotificationPreferencesSchema,
  PrivacySettingsSchema,
  AttachmentSchema 
} from './common-schemas';

// User Base Schema
export const UserBaseSchema = BaseEntitySchema.extend({
  firebaseUid: z.string().min(1, "El UID de Firebase es requerido"),
  email: z.string().email("Email inválido"),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  displayName: z.string().optional(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Número de teléfono inválido").optional(),
  profilePicture: z.string().url().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  language: z.string().default('es'),
  timezone: z.string().default('America/Mexico_City'),
  isEmailVerified: z.boolean().default(false),
  isPhoneVerified: z.boolean().default(false),
  lastLoginAt: z.date().optional(),
  lastActiveAt: z.date().optional(),
  loginCount: z.number().min(0).default(0),
  address: AddressSchema.optional(),
  notificationPreferences: NotificationPreferencesSchema.optional(),
  privacySettings: PrivacySettingsSchema.optional(),
  metadata: z.record(z.any()).optional()
});

// Doctor Schema
export const DoctorSchema = UserBaseSchema.extend({
  role: z.literal('doctor'),
  licenseNumber: z.string().min(1, "El número de licencia es requerido"),
  specialty: z.array(z.string()).min(1, "Debe tener al menos una especialidad"),
  subSpecialty: z.array(z.string()).optional(),
  medicalSchool: z.string().min(1, "La escuela de medicina es requerida"),
  graduationYear: z.number().min(1950).max(new Date().getFullYear()),
  yearsOfExperience: z.number().min(0),
  certifications: z.array(z.object({
    name: z.string(),
    issuingOrganization: z.string(),
    issueDate: z.date(),
    expiryDate: z.date().optional(),
    certificateNumber: z.string().optional()
  })).default([]),
  workplaces: z.array(z.object({
    hospitalId: z.string().optional(),
    name: z.string(),
    position: z.string(),
    department: z.string().optional(),
    startDate: z.date(),
    endDate: z.date().optional(),
    isCurrentWorkplace: z.boolean().default(false)
  })).default([]),
  consultationFee: z.number().min(0).optional(),
  availableSchedule: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6), // 0=domingo, 6=sábado
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    isAvailable: z.boolean().default(true)
  })).default([]),
  telemedicineEnabled: z.boolean().default(true),
  emergencyConsultations: z.boolean().default(false),
  acceptsNewPatients: z.boolean().default(true),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).default(0),
  totalConsultations: z.number().min(0).default(0),
  professionalSummary: z.string().max(1000).optional(),
  awards: z.array(z.object({
    title: z.string(),
    organization: z.string(),
    year: z.number(),
    description: z.string().optional()
  })).default([]),
  publications: z.array(z.object({
    title: z.string(),
    journal: z.string(),
    year: z.number(),
    doi: z.string().optional(),
    url: z.string().url().optional()
  })).default([]),
  isVerified: z.boolean().default(false),
  verificationDate: z.date().optional(),
  verificationDocuments: z.array(AttachmentSchema).default([]),
  status: z.enum(['pending', 'active', 'suspended', 'inactive']).default('pending')
});

// Patient Schema (extended from base)
export const PatientUserSchema = UserBaseSchema.extend({
  role: z.literal('patient'),
  patientNumber: z.string().optional(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  allergies: z.array(z.string()).default([]),
  chronicConditions: z.array(z.string()).default([]),
  emergencyContacts: z.array(z.object({
    name: z.string(),
    relationship: z.string(),
    phoneNumber: z.string(),
    email: z.string().email().optional(),
    isPrimary: z.boolean().default(false)
  })).default([]),
  insuranceInfo: z.object({
    provider: z.string(),
    policyNumber: z.string(),
    groupNumber: z.string().optional(),
    memberNumber: z.string().optional(),
    validFrom: z.date(),
    validTo: z.date()
  }).optional(),
  assignedDoctorId: z.string().optional(),
  lastVisit: z.date().optional(),
  nextAppointment: z.date().optional(),
  totalAppointments: z.number().min(0).default(0),
  missedAppointments: z.number().min(0).default(0)
});

// Admin Schema
export const AdminSchema = UserBaseSchema.extend({
  role: z.literal('admin'),
  adminLevel: z.enum(['super_admin', 'admin', 'moderator']).default('admin'),
  permissions: z.array(z.string()).default([]),
  department: z.string().optional(),
  position: z.string().optional(),
  canAccessAllPatients: z.boolean().default(false),
  canManageUsers: z.boolean().default(false),
  canManageSystem: z.boolean().default(false),
  canViewReports: z.boolean().default(true),
  lastPasswordChange: z.date().optional(),
  twoFactorEnabled: z.boolean().default(false)
});

// Company User Schema
export const CompanyUserSchema = UserBaseSchema.extend({
  role: z.literal('company'),
  companyId: z.string().min(1, "El ID de la empresa es requerido"),
  position: z.string().min(1, "La posición es requerida"),
  department: z.string().optional(),
  employeeId: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  canManageJobs: z.boolean().default(false),
  canViewReports: z.boolean().default(false),
  canManageEmployees: z.boolean().default(false)
});

// Company Schema
export const CompanySchema = BaseEntitySchema.extend({
  name: z.string().min(2, "El nombre de la empresa es requerido"),
  legalName: z.string().min(2, "La razón social es requerida"),
  taxId: z.string().min(1, "El RFC/Tax ID es requerido"),
  industry: z.string().min(1, "La industria es requerida"),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']),
  website: z.string().url().optional(),
  description: z.string().max(2000).optional(),
  logo: z.string().url().optional(),
  address: AddressSchema,
  contactInfo: ContactInfoSchema,
  billingAddress: AddressSchema.optional(),
  subscription: z.object({
    plan: z.enum(['basic', 'professional', 'enterprise']),
    status: z.enum(['active', 'cancelled', 'suspended', 'trial']),
    startDate: z.date(),
    endDate: z.date().optional(),
    employeesLimit: z.number().min(1),
    currentEmployees: z.number().min(0).default(0)
  }),
  settings: z.object({
    allowTelemedicine: z.boolean().default(true),
    requireApproval: z.boolean().default(true),
    autoAssignDoctors: z.boolean().default(false),
    emergencyProtocol: z.boolean().default(true)
  }).optional(),
  isVerified: z.boolean().default(false),
  verificationDate: z.date().optional(),
  verificationDocuments: z.array(AttachmentSchema).default([])
});

// Authentication Schema
export const AuthSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string().optional(),
  role: z.enum(['patient', 'doctor', 'admin', 'company']),
  termsAccepted: z.boolean().refine(val => val === true, "Debe aceptar los términos y condiciones"),
  privacyPolicyAccepted: z.boolean().refine(val => val === true, "Debe aceptar la política de privacidad"),
  marketingOptIn: z.boolean().default(false)
}).refine((data) => {
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

// Session Schema
export const SessionSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().min(1),
  userRole: z.enum(['patient', 'doctor', 'admin', 'company']),
  deviceId: z.string().optional(),
  ipAddress: z.string().ip(),
  userAgent: z.string(),
  createdAt: z.date(),
  lastActivityAt: z.date(),
  expiresAt: z.date(),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).optional()
});

// Password Reset Schema
export const PasswordResetSchema = z.object({
  email: z.string().email("Email inválido"),
  token: z.string().min(1, "El token es requerido"),
  newPassword: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

// Export types
export type UserBase = z.infer<typeof UserBaseSchema>;
export type Doctor = z.infer<typeof DoctorSchema>;
export type PatientUser = z.infer<typeof PatientUserSchema>;
export type Admin = z.infer<typeof AdminSchema>;
export type CompanyUser = z.infer<typeof CompanyUserSchema>;
export type Company = z.infer<typeof CompanySchema>;
export type Auth = z.infer<typeof AuthSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type PasswordReset = z.infer<typeof PasswordResetSchema>;